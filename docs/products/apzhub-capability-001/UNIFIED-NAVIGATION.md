# Unified Navigation — Work-Centred Movement

| Field     | Value                 |
| --------- | --------------------- |
| Programme | APZHUB-CAPABILITY-001 |
| Status    | **COMPLETE**          |
| Timestamp | 20260805T083000Z      |
| Kind      | Capability definition |

## Purpose

Describe how users move between products as **workflows**, not as menus.

The shell’s Activity Bar and Sidebar remain the structural navigation model (foundation). This document describes **work-centred journeys** across that shell.

## Navigation modes

| Mode                 | User intent                               | Primary entry                   |
| -------------------- | ----------------------------------------- | ------------------------------- |
| **Work-first**       | “What needs me?”                          | My Work                         |
| **Capability-first** | “I am managing delivery / service / time” | Product workspace               |
| **Discovery-first**  | “Find something”                          | Platform Search                 |
| **Attention-first**  | “What changed?”                           | Notifications / Needs attention |

Unified Work Experience elevates **work-first** without removing capability-first product workspaces.

## Workflow navigation (not menus)

### From obligation to action

```text
My Work
   → Open work item
   → Act in context
   → Return to My Work (or next item)
```

The user should not be forced to choose a product before seeing obligations.

### From action to related work

```text
Work item
   → Related delivery / artefact / service need / quality evidence / effort
   → Act or inspect
   → Back to originating work item
```

Movement is relationship-driven.

### From product deep work back to the queue

```text
Product workspace (deep work)
   → Complete or pause
   → My Work remains the home of outstanding obligations
```

Products remain excellent places for deep work. They are not the only door into the day.

## Rules

1. No second login when crossing products.
2. No engine destinations.
3. Breadcrumbs stay APZHUB / experience / item — not implementation paths.
4. Deep links may land in a product surface when that is the correct place to act — then return is clear.
5. Navigation never requires knowing which product “owns” the queue.

## Explicit non-goals

- Redesigning the Activity Bar taxonomy
- Replacing product sidebars
- Building a new menu system in this programme
