# Application Services

Factory: `createTraceLinkApplicationService`

## Commands

create · validate · approve · retire · supersede · updateConfidence · updateAuthority · updateScope · updateRationale · updateMetadata · updateOrigin · updateEndpoint

## Queries

get · list · listBySource · listByTarget · inbound · outbound · history · taxonomy · duplicateCandidates · supersessionChain

## Pipeline

tenant/actor context → permission → endpoint resolution → domain behaviour → optimistic persist → audit → domain-event hook → search upsert hook → observation → DTO + `availableActions`
