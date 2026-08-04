# RULE-MODEL — QO-006

Rules are independent of policies and use **declarative conditions** only.

## Condition types

`always`, `risk_at_least`, `confidence_below`, `confidence_at_least`, `impact_includes_asset_type`, `impact_node_count_at_least`, `magnitude_at_least`, `profile_is`, `and`, `or`.

## Rule fields

Condition, severity (`info`/`advisory`/`mandatory`/`blocking`), activity kind, activity classification, expected confidence contribution, estimated duration, explanation.

No procedural scripts. No provider logic.
