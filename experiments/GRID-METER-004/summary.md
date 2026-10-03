Decision set (24 fixtures): control, ce1, ce2, pickup, sync_anticip, halftime_switch

| config | networks | silent error rate | false-alarm rate | trustworthy coverage | CPU s / audio min (1 thread) | verdict vs C1 |
|---|---|---|---|---|---|---|
| C1 | 2 | 0.0286 (23/804) | 0.0474 (31/654) | 0.7906 | 16.38 | baseline |
| C2 | 1 | 0.0485 (40/824) | 0.0000 (0/781) | 0.9911 | 5.49 | not recommended |
| C3 | 1 | 0.0858 (69/804) | 0.0459 (30/654) | 0.7919 | 10.89 | not recommended |
| C4 | 1 | 0.0648 (54/833) | 0.0026 (2/772) | 0.9772 | 5.92 | not recommended |

Reported only (not in decision):

| fixture | config | silent error rate | false-alarm rate | trustworthy coverage |
|---|---|---|---|---|
| heyya_pattern | C1 | 0.1875 (21/112) | 0.2414 | 0.3667 |
| heyya_pattern | C2 | 0.4474 (85/190) | 0.0000 | 0.8750 |
| heyya_pattern | C3 | 0.2321 (26/112) | 0.1207 | 0.4250 |
| heyya_pattern | C4 | 0.4202 (50/119) | 0.0345 | 0.4667 |
| waltz_34 | C1 | 0.0413 (5/121) | 0.6250 | 0.0938 |
| waltz_34 | C2 | 0.4833 (101/209) | 0.0000 | 0.6750 |
| waltz_34 | C3 | 0.1157 (14/121) | 0.3000 | 0.1750 |
| waltz_34 | C4 | 0.4338 (59/136) | 0.1000 | 0.3937 |
