# APZQEP-OES-ARCH-012  
# APPENDIX B — State Machines (Presentation View)

> **Authority:** Domain ENG-050A + `@apzhub/qep-contracts` `availableActions`.  
> This appendix is a **presentation aid**. The server remains authoritative.

## B.1 Status set

`draft` · `under_review` · `approved` · `rejected` · `superseded` · `withdrawn` · `retired` · `cancelled`

## B.2 Typical happy path

```text
draft --submitForReview--> under_review --approve--> approved
```

## B.3 Rejection path

```text
under_review --reject--> rejected
rejected --withdraw|cancel--> withdrawn | cancelled
rejected --(return-to-draft IF exposed in availableActions)--> draft
```

## B.4 Approved exits

```text
approved --supersede--> superseded  (+ successor draft or existing)
approved --retire--> retired
approved --withdraw--> withdrawn
```

## B.5 Draft / review exits

```text
draft --cancel|withdraw--> cancelled | withdrawn
under_review --cancel|withdraw--> cancelled | withdrawn
```

## B.6 Workbench rendering rule

```text
FOR each action button:
  SHOW only if action ∈ dto.availableActions
NEVER infer transitions from this diagram alone
```

## END OF APPENDIX B
