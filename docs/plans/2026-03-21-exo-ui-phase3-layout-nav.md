# ExoUI Phase 3: Layout + Navigation Components

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement layout and navigation components — tabs, pagination, dropdown, tooltip, wizard_sidebar, sidebar_layout, sidebar_item.

**Architecture:** Same pattern as Phase 2. Sidebar components go in `lib/exo_ui/layouts.ex` (separate module). Navigation components go in `lib/exo_ui/components.ex`.

**Working directory:** `/Users/miso/Developer/exo_ui`

---

### Task 1: Tabs + Pagination (navigation, no JS hooks)

Components: `tabs/1`, `pagination/1`

### Task 2: Dropdown + Tooltip (popover components)

Components: `dropdown/1`, `tooltip/1`

### Task 3: Wizard Sidebar

Component: `wizard_sidebar/1`

### Task 4: Sidebar Layout + Sidebar Item (layouts module, JS hooks)

Components: `sidebar_layout/1`, `sidebar_item/1` in `ExoUI.Layouts`
JS Hooks: `DrawerState`, `SidebarCollapsible`
