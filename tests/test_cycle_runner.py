import contextlib
import io
import json
import os
import tempfile
import unittest
from types import SimpleNamespace
from unittest import mock

from engine import cycle_runner


class CpuPressureProbeTests(unittest.TestCase):
    def test_measures_wall_cpu_and_iterations(self):
        usage = [
            SimpleNamespace(ru_utime=1.0, ru_stime=0.5),
            SimpleNamespace(ru_utime=2.2, ru_stime=0.7),
        ]
        with mock.patch.object(cycle_runner.resource, "getrusage", side_effect=usage) as getrusage:
            with mock.patch.object(cycle_runner.time, "perf_counter",
                                   side_effect=[10.0, 10.5, 11.0, 12.0]):
                result = cycle_runner.cpu_pressure_probe()

        self.assertEqual(result["pressure_wall_seconds"], 2.0)
        self.assertAlmostEqual(result["process_cpu_seconds"], 1.4)
        self.assertEqual(result["iterations"], 2)
        self.assertEqual(getrusage.call_args_list, [
            mock.call(cycle_runner.resource.RUSAGE_SELF),
            mock.call(cycle_runner.resource.RUSAGE_SELF),
        ])

    def test_resource_probe_preserves_fields_and_disk_fallback(self):
        usage = SimpleNamespace(ru_maxrss=123)
        pressure = {"pressure_wall_seconds": 2.0, "process_cpu_seconds": 1.5, "iterations": 42}
        with mock.patch.object(cycle_runner.resource, "getrusage", return_value=usage):
            with mock.patch.object(cycle_runner.os, "statvfs", side_effect=OSError):
                with mock.patch.object(cycle_runner, "cpu_pressure_probe", return_value=pressure):
                    result = cycle_runner.get_resource_probe()
        self.assertEqual(result, {"rss_kb": 123, "disk_free_bytes": -1, **pressure, "ok": True})

    def test_resource_probe_reports_pressure_errors(self):
        with mock.patch.object(cycle_runner, "cpu_pressure_probe", side_effect=RuntimeError("probe failed")):
            self.assertEqual(cycle_runner.get_resource_probe(), {"ok": False, "error": "probe failed"})

    def test_idle_writes_resource_evidence_without_input(self):
        pressure = {"pressure_wall_seconds": 2.0, "process_cpu_seconds": 1.5, "iterations": 42}
        original_dir = os.getcwd()
        with tempfile.TemporaryDirectory() as temp_dir:
            try:
                os.chdir(temp_dir)
                os.mkdir("engine")
                with open("README.md", "w") as fixture:
                    fixture.write("fixture")
                with mock.patch.object(cycle_runner, "cpu_pressure_probe", return_value=pressure):
                    with mock.patch("builtins.input", side_effect=AssertionError("unexpected input")):
                        with contextlib.redirect_stdout(io.StringIO()):
                            cycle_runner.main()
                            cycle_runner.main()
                with open("engine/last_resource.json") as evidence:
                    resource_result = json.load(evidence)
                with open("engine/last_cycle.json") as evidence:
                    cycle = json.load(evidence)
                with open("engine/experiment_ledger.json") as evidence:
                    ledger = json.load(evidence)
            finally:
                os.chdir(original_dir)

        self.assertEqual(cycle["schema"], "1.0.7-resource")
        self.assertEqual(cycle["status"], "success")
        self.assertEqual(cycle["probes"]["resource"], resource_result)
        self.assertTrue(resource_result["ok"])
        for key, value in pressure.items():
            self.assertEqual(resource_result[key], value)
        self.assertIn("rss_kb", resource_result)
        self.assertIn("disk_free_bytes", resource_result)
        self.assertEqual(len(ledger), 1)


if __name__ == "__main__":
    unittest.main()
