# STATE-MODEL — QO-001

Kernel states only:

`created` → `initialising` → `ready` ⇄ `paused` → `stopping` → `stopped`  
Any non-terminal may → `failed` (per transition table).

Quality Flow run states are **out of scope** (QO-004).
