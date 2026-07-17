# Configuration Hierarchy Guide

**Milestone:** APZCONFIG-001

## Levels (inheritance order, coarsest → finest)

1. Platform  
2. Tenant  
3. Organisation  
4. Product  
5. Environment  
6. User (metadata only)

## Override precedence (highest wins)

`user` → `environment` → `product` → `organisation` → `tenant` → `platform`

Core exposes `precedenceRankForHierarchyLevel` and `sortOverridesByPrecedence` — **no runtime resolution**.

## Scopes

`global` · `tenant` · `organisation` · `product` · `environment` · `user`
