# Reference snapshots (read-only)

This directory holds **unmodified, read-only copies** of BAD-D production builds,
pulled in strictly so the mobile lab has something concrete to instrument and
test against. These files are never edited in place.

## Provenance

| File | Source repo | Source path | Commit | Pulled at |
|---|---|---|---|---|
| `BAD-D_SIGNAL_15_72_0-mobile.REFERENCE_READONLY.html` | `danielsteeples1999-cmd/bad_d_meomory` (private) | `BAD-D_SIGNAL_15_72_0-mobile.html` | `8faf0b44c8e839cbe15a581a4903ec4a9ccfd295` | 2026-09-20 |

## Rules

- This lab session only ever cloned `bad_d_meomory` with **read** access. Nothing
  is ever pushed back to it from here.
- Do not hand-edit files in this directory. If a fix is worth trying, copy the
  relevant fragment into an experiment under `../experiments/`, mutate it there,
  and diff against this baseline.
- Re-pull explicitly (new filename with commit hash, or update this table) if the
  production repo moves — never silently overwrite this baseline without a note.
