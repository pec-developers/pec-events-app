---
trigger: always_on
description: Always keep the codebase, implementation details, and documentation in sync with openspec/config.yaml.
---

## config-sync

This project uses `openspec/config.yaml` as the primary source of truth for design, rules, tech stack, and configurations.

Rules:
- The backend and frontend code implementation MUST strictly adhere to the configurations, components, and rules defined in [config.yaml](../../openspec/config.yaml) (e.g., session durations, API proxying rules, role check constraints, caching specifications, database trigger locations, styling phase parameters, etc.).
- Whenever architectural, configuration, or operational changes are made in the code (`app/` or `deployments/` directories), immediately update the corresponding context descriptions and parameters in [config.yaml](../../openspec/config.yaml).
- Any modifications made to the specifications, context, or rules in [config.yaml](../../openspec/config.yaml) must propagate bi-directionally to the design documents under [docs/](../../docs/) (`brd.md`, `prd.md`, `hld.md`, `lld.md`) and trigger corresponding updates or new OpenSpec proposals for the codebase.