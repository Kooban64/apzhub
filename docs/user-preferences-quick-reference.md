# APZHUB User Preferences quick reference

Derived lookup for [023](./023-user-preferences-personalisation-workspace-experience-framework.md).

> **Document Version:** 1.0 · **Platform Specification · Core Platform Standard**  
> Sessions/layout: [018](./018-workspace-sessions-window-management-state-persistence-framework.md). Notifications: [021](./021-notification-activity-attention-management-framework.md). Appearance: [022](./022-presentation-engine-theme-framework-branding-architecture.md). Platform data: [011](./011-platform-data-architecture-database-design-principles.md).

## Core rule

**Personalisation is platform-owned.** Modules **consume** preferences — never implement their own settings for platform behaviour (008, 009).

## Vision

APZHUB adapts to how each user works · auto-remember prefs · consistent enterprise experience

## Philosophy — separate layers

Platform behaviour → user preferences → workspace state → business data — prefs **never** change business rules · permissions · or bypass standards (007)

## Preference categories

Appearance · navigation · workspace · notifications · search · accessibility · keyboard · language · regional · privacy · productivity · AI (future)

## Appearance (global, 022/006)

Theme · accent · density · font size · panel style · animation · high contrast — header theme selector (016)

## Navigation (platform-controlled, 017)

Favourite workspaces · pinned · default workspace · sidebar behaviour · activity bar order · recent · density — permission-filtered favourites/pins (005)

## Workspace (018)

Panel sizes/visibility · split layout · context panel · open tabs · session behaviour · templates — UI state only, not business data

## Productivity

Default landing workspace · autosave · draft recovery · confirmation dialogs · recent items · quick actions · startup behaviour

## Notifications (021)

Desktop alerts · email · digests · reminder frequency · DND · attention threshold · channels — Attention Engine integration

## Search (020)

Recent/saved searches · preferred result types · history · suggestions — platform-wide

## Accessibility (override presentation when required)

Reduced motion · high contrast · large text · keyboard focus · screen reader optimisations (006, 022)

## Keyboard (019)

Shortcut overrides (appropriate) · key bindings · command palette behaviour · quick nav · custom shortcuts (future) — cannot bypass permission-gated commands

## Language & regional (010 context)

Language · date/time/number/currency formats · timezone · locale

## Privacy (org policy may override)

Activity/presence/profile/search visibility · session sharing · AI learning (future) — does not grant access (007)

## Session prefs (018)

Auto-restore · session startup · recent/pinned sessions · workspace recovery — permission re-validation on restore

## Dashboard prefs

Favourite/default dashboard · widget order/visibility/size — platform metadata; data via Platform Services (009)

## Saved views

Tables · reports · filters · sorting · columns · grouping — state only, not duplicated records (011)

## User profile (platform-owned)

Identity (007) · preferences · sessions · templates · recent activity · favourites · saved searches (011)

## Preference hierarchy (resolution order)

System default → organisation default → role default → user preference → session override — admin locked settings win (022); session override ≠ permissions

## Sync (future)

Desktop · browser · tablet · mobile — self-hosted platform services, no proprietary cloud (026)

## Import/export

Export/import/reset prefs · share workspace templates — no inaccessible refs or secrets in export (013)

## Administration

Org defaults · mandatory/locked settings · recommended · brand defaults — superadmin tier (007); brand via 022

## AI prefs (future, optional)

Assistant behaviour · models · summaries · recommendations · privacy · automation permissions — no permission bypass (013)

## Performance

Immediate load · minimal backend · cache · **load before shell renders** — no visible post-load reconfigure (004, 016)

## Security (mandatory)

Prefs never grant permissions · reveal restricted data · expose connector details · override admin policies — non-security decisions (002, 013)

## Self-hosted first (026)

All preference data in **platform PostgreSQL** — no proprietary cloud sync required; future device sync via self-hosted services (008, 011)

## Testing (015)

Unit · persistence · migration · Playwright · a11y · performance · regression — hierarchy + locked admin settings

## Build rules

Platform metadata · reusable Preference Service · respect hierarchy · independent of business logic · rapid load · sync-ready architecture (009)

## Acceptance highlights

Persist across sessions · layouts restore · no business rule impact · hierarchy coexistence · portable/syncable · AI-ready · personalised yet consistent · **no permission leakage** · **no module preference stores for platform behaviour**
