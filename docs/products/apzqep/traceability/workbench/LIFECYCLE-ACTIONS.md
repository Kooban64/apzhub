# Lifecycle Actions — APZQEP-ENG-030C

Lifecycle transitions remain server-authoritative (ENG-030A Part 1/2). UI only exposes actions present in `availableActions`.

| Action        | Typical UI                                         | Confirm             |
| ------------- | -------------------------------------------------- | ------------------- |
| `validate`    | Validate control on Detail                         | Yes                 |
| `approve`     | Approve control on Detail                          | Yes                 |
| `retire`      | Retire control on Detail                           | Yes                 |
| `supersede`   | Dedicated Supersede view                           | Yes                 |
| Field updates | Rationale / confidence / authority / scope editors | When action present |

## Rules

- No free-form lifecycle dropdown
- No delete/restore UI
- Empty/missing `availableActions` → read-only presentation
- Supersession: `QepTraceLinkSupersedeView` at `/trace-links/supersede`
