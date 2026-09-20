# Promotion Gate

States, in order:

```
EXPERIMENTAL   -- exists, ran at least once, unverified
MEASURED       -- has real numbers, single run
REPRODUCED     -- measured again, results consistent
CANDIDATE      -- reproduced + failure modes understood + no known regression
ADAPTER-READY  -- has a documented, replaceable adapter boundary if it will
                  ever connect to BAD-D; still not connected
HUMAN ACCEPTED -- a person (Daniel) explicitly signed off
```

## Rules
- Never move `EXPERIMENTAL -> PRODUCTION` directly or silently. There is no
  such transition. Production adoption is a decision made in `bad_d_meomory`
  by whoever has write access there, informed by evidence from here — this
  repo cannot promote itself into anything.
- A tool/result's current state is recorded in its own experiment record
  (`experiments/EXP-NNN/README.md`), not tracked centrally, so the state is
  always next to its evidence.
- Moving backward (e.g. CANDIDATE -> MEASURED) is normal when a regression
  or a new failure mode is found — record why, don't just quietly lower the
  label.
