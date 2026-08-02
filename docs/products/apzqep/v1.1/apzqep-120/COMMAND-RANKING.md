# Command Ranking — APZQEP-120-S13

| Field   | Value                           |
| ------- | ------------------------------- |
| Package | `@apzhub/qep-command` **0.1.0** |

## Signals

| Signal    | Boost                      |
| --------- | -------------------------- |
| Pinned    | Highest                    |
| Favourite | High                       |
| Recent    | Recency-weighted           |
| Usage     | Frequency                  |
| Context   | Entity-kind match          |
| Discovery | Name / keyword / QKI score |

## Preferences

`UserCommandPreferences`: pin / favourite / recent (in-memory for S13).

## Suggestions

`suggest()` returns pinned → favourite → recent for empty-query palette open.
