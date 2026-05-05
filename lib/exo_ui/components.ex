defmodule ExoUI.Components do
  @moduledoc """
  Headless LiveView components.

  All components emit semantic HTML with `data-exo` attributes.
  No CSS classes are applied — styling is handled by the theme CSS file.

  This module re-exports all components from sub-modules for backward compatibility.
  For direct imports, use the sub-modules:
  - `ExoUI.Components.Core`
  - `ExoUI.Components.Form`
  - `ExoUI.Components.Overlay`
  - `ExoUI.Components.Feedback`
  - `ExoUI.Components.DataDisplay`
  """

  # Core
  defdelegate button(assigns), to: ExoUI.Components.Core
  defdelegate badge(assigns), to: ExoUI.Components.Core
  defdelegate separator(assigns), to: ExoUI.Components.Core
  defdelegate icon(assigns), to: ExoUI.Components.Core
  defdelegate theme_toggle(assigns), to: ExoUI.Components.Core
  defdelegate header(assigns), to: ExoUI.Components.Core
  defdelegate avatar(assigns), to: ExoUI.Components.Core
  defdelegate skeleton(assigns), to: ExoUI.Components.Core
  defdelegate empty_state(assigns), to: ExoUI.Components.Core
  defdelegate spinner(assigns), to: ExoUI.Components.Core
  defdelegate kbd(assigns), to: ExoUI.Components.Core
  defdelegate scroll_area(assigns), to: ExoUI.Components.Core
  defdelegate navbar(assigns), to: ExoUI.Components.Core
  defdelegate footer(assigns), to: ExoUI.Components.Core
  defdelegate bottom_nav(assigns), to: ExoUI.Components.Core
  defdelegate indicator(assigns), to: ExoUI.Components.Core
  defdelegate swap(assigns), to: ExoUI.Components.Core

  # Form
  defdelegate form(assigns), to: ExoUI.Components.Form

  @doc deprecated: "Use select/1 instead"
  defdelegate input(assigns), to: ExoUI.Components.Form
  defdelegate toggle(assigns), to: ExoUI.Components.Form
  defdelegate select(assigns), to: ExoUI.Components.Form
  defdelegate combobox(assigns), to: ExoUI.Components.Form
  defdelegate radio_group(assigns), to: ExoUI.Components.Form
  defdelegate slider(assigns), to: ExoUI.Components.Form
  defdelegate date_picker(assigns), to: ExoUI.Components.Form
  defdelegate file_input(assigns), to: ExoUI.Components.Form
  defdelegate fieldset(assigns), to: ExoUI.Components.Form
  defdelegate rating(assigns), to: ExoUI.Components.Form
  defdelegate translate_error(msg_opts), to: ExoUI.Components.Form

  # Overlay
  defdelegate modal(assigns), to: ExoUI.Components.Overlay
  defdelegate confirm_modal(assigns), to: ExoUI.Components.Overlay
  defdelegate popover(assigns), to: ExoUI.Components.Overlay
  defdelegate dropdown_menu(assigns), to: ExoUI.Components.Overlay

  @doc deprecated: "Use dropdown_menu/1 instead"
  defdelegate dropdown(assigns), to: ExoUI.Components.Overlay
  defdelegate tooltip(assigns), to: ExoUI.Components.Overlay
  defdelegate drawer(assigns), to: ExoUI.Components.Overlay
  defdelegate collapsible(assigns), to: ExoUI.Components.Overlay
  defdelegate sheet(assigns), to: ExoUI.Components.Overlay
  defdelegate hover_card(assigns), to: ExoUI.Components.Overlay
  defdelegate context_menu(assigns), to: ExoUI.Components.Overlay
  defdelegate command_palette(assigns), to: ExoUI.Components.Overlay
  defdelegate menubar(assigns), to: ExoUI.Components.Overlay
  defdelegate show_modal(id), to: ExoUI.Components.Overlay

  def hide_modal(js_or_id, id \\ nil) do
    if id,
      do: ExoUI.Components.Overlay.hide_modal(js_or_id, id),
      else: ExoUI.Components.Overlay.hide_modal(js_or_id)
  end

  defdelegate show_drawer(id), to: ExoUI.Components.Overlay

  def hide_drawer(js_or_id, id \\ nil) do
    if id,
      do: ExoUI.Components.Overlay.hide_drawer(js_or_id, id),
      else: ExoUI.Components.Overlay.hide_drawer(js_or_id)
  end

  defdelegate show_sheet(id), to: ExoUI.Components.Overlay

  def hide_sheet(js_or_id, id \\ nil) do
    if id,
      do: ExoUI.Components.Overlay.hide_sheet(js_or_id, id),
      else: ExoUI.Components.Overlay.hide_sheet(js_or_id)
  end

  defdelegate show_command_palette(id), to: ExoUI.Components.Overlay

  def hide_command_palette(js_or_id, id \\ nil) do
    if id,
      do: ExoUI.Components.Overlay.hide_command_palette(js_or_id, id),
      else: ExoUI.Components.Overlay.hide_command_palette(js_or_id)
  end

  # Feedback
  defdelegate flash(assigns), to: ExoUI.Components.Feedback
  defdelegate flash_group(assigns), to: ExoUI.Components.Feedback
  defdelegate toast_container(assigns), to: ExoUI.Components.Feedback
  defdelegate alert(assigns), to: ExoUI.Components.Feedback
  defdelegate progress(assigns), to: ExoUI.Components.Feedback
  defdelegate radial_progress(assigns), to: ExoUI.Components.Feedback

  # DataDisplay
  defdelegate table(assigns), to: ExoUI.Components.DataDisplay
  defdelegate list(assigns), to: ExoUI.Components.DataDisplay
  defdelegate content_card(assigns), to: ExoUI.Components.DataDisplay
  defdelegate stat_card(assigns), to: ExoUI.Components.DataDisplay
  defdelegate metric_card(assigns), to: ExoUI.Components.DataDisplay
  defdelegate wizard_sidebar(assigns), to: ExoUI.Components.DataDisplay
  defdelegate breadcrumb(assigns), to: ExoUI.Components.DataDisplay
  defdelegate tabs(assigns), to: ExoUI.Components.DataDisplay
  defdelegate pagination(assigns), to: ExoUI.Components.DataDisplay
  defdelegate accordion(assigns), to: ExoUI.Components.DataDisplay
  defdelegate steps(assigns), to: ExoUI.Components.DataDisplay
  defdelegate timeline(assigns), to: ExoUI.Components.DataDisplay
  defdelegate carousel(assigns), to: ExoUI.Components.DataDisplay
  defdelegate hero(assigns), to: ExoUI.Components.DataDisplay
  defdelegate chat_bubble(assigns), to: ExoUI.Components.DataDisplay
end
