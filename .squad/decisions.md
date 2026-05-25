# Squad Decisions

## Active Decisions

### 2026-05-25T11:51:22.372-07:00: Magic 8 Ball state machine + answer randomness
**By:** Hockney
**What:** Implement gameplay with explicit `waiting`, `shaking`, and `revealed` phases, and enforce non-immediate-repeat random answer selection when answer count allows.
**Why:** This keeps answer behavior predictable and testable while preserving randomness and avoiding repetitive user results.

### 2026-05-25T11:51:22.372-07:00: Motion permission flow must preserve clear fallback
**By:** McManus
**What:** The shake-permission button now disables while requesting iOS motion access, switches to a retry label when not granted, and all related messages explicitly confirm the Ask button remains available.
**Why:** This avoids duplicate permission requests, reduces user confusion after denial/failure, and keeps unsupported/no-sensor paths understandable.

## Governance

- All meaningful changes require team consensus
- Document architectural decisions here
- Keep history focused on work, decisions focused on direction
