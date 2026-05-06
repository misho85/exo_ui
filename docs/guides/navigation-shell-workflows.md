# Navigation Shell Workflows

Use this pattern when a LiveComponent owns route-like UI state and needs shell
navigation, tabs, breadcrumbs, progress, pagination, and mobile navigation to
stay in sync.

## Component-Owned Navigation

```heex
<.navbar aria-label="Workspace navigation">
  <:brand>Acme Ops</:brand>
  <:center>
    <.breadcrumb separator="›">
      <:item href="#">Workspace</:item>
      <:item current>{@active_section_label}</:item>
    </.breadcrumb>
  </:center>
  <:end_content>
    <.theme_toggle id="shell-theme" />
  </:end_content>
</.navbar>

<.tabs
  id="workspace-tabs"
  active={@active_tab}
  aria_label="Workspace sections"
  target={@myself}
>
  <:tab id="summary" label="Summary" click="change-tab" />
  <:tab id="teams" label="Teams" click="change-tab" />
  <:tab id="risks" label="Risks" click="change-tab" />
</.tabs>

<.wizard_sidebar
  steps={@steps}
  on_click="goto-step"
  target={@myself}
  aria_label="Workspace setup progress"
/>
```

## Rules

- Pass `target={@myself}` when `tabs/1` or `wizard_sidebar/1` are used inside
  a LiveComponent with event-name clicks.
- Keep breadcrumbs as state reflection; they should match the active section.
- Use `pagination/1` for page semantics and ExoUI buttons when a LiveComponent
  owns page state through events.
- Keep mobile `bottom_nav/1` active state derived from the same section assign
  as desktop navigation.
- Browser coverage should verify tab targeting, wizard targeting, active
  breadcrumbs, current pagination labels, bottom-nav `aria-current`, and reset
  behavior.
