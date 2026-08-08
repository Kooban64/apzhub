# Certification — APS-Personalisation

| Field   | Value                                                                                     |
| ------- | ----------------------------------------------------------------------------------------- |
| ID      | APS-S-05                                                                                  |
| Owner   | Platform                                                                                  |
| Package | `@apzhub/platform-personalisation`                                                        |
| HTTP    | `/api/platform/v1/{preferences,favorites,recent,personalisation/*}`                       |
| Status  | **CERTIFIED** · consolidate face ([APS-E-06](../engineering/APS-E-06-PERSONALISATION.md)) |

**Owned?** Yes. **Bounded?** Prefs, favorites, recent, workbench layout — shell behaviour only (never grants permissions). **Consumed?** Shell (+ law mirror). Multi-surface shared SoR. **PR?** Production APIs present.
