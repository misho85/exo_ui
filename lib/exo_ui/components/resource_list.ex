defmodule ExoUI.Components.ResourceList do
  @moduledoc """
  The index of an admin: one list of records with its toolbar, in one call.

  Shopify's Polaris splits it into `IndexFilters` and `IndexTable`; here it is
  one component, so every list of an admin has the same toolbar, the same
  header and the same bulk bar, and a screen cannot drift from the others by
  arranging the pieces itself.

  From the top:

    * `:stat` — an optional row of figures above the views.
    * `views` — saved filter sets as tabs. A view is a link to the list's
      address with its filters, so it opens in a new tab and the browser's
      back button returns to the previous one. `view_delete` and `save_view`
      offer deleting the open saved view and saving the current filters.
    * one search field with the filter chips under it: `search`, `chips`,
      `addable` (what "Filter" offers) and `filtered?` (whether "Clear"
      shows). Every chip is a control of the toolbar's form.
    * `:actions` — controls right of the search that are not a filter.
    * `columns` — the column picker. Hiding a column is a style rule over its
      class, written in the browser (`ExoListColumns`), remembered per `list`.
    * the table: `:col` with `sort` makes its header a link that sorts
      (`sort`, `sort_patch`), `selection` adds a checkbox column, and while a
      row is selected the header row becomes the bulk bar.
    * `:grid` replaces the table with the caller's own layout (cards); the
      bulk bar then stands above it.
    * `:footer` — pagination.

  The component holds no state. The host keeps the filters in the address and
  answers the toolbar's events, all named `event_prefix` + `filter`,
  `submit`, `add_filter` (value `key`), `remove_filter` (value `key`),
  `clear`, `save_start`, `save_cancel`, `save` (field `name`) and
  `delete_view` (value `id`).

  ## Bulk actions

  The bar shows at most `bulk_primary` of the `:bulk_action` entries as
  buttons; the rest, then every `:bulk_more` entry, go into the "More" menu.
  A destructive action (`variant="danger"`) is never a button in the bar: it
  goes into the menu, and it asks first (`confirm`, written into
  `confirm_attr`, so the host's own confirmation dialog can catch it).

  ## Text

  Every word the component draws comes from `labels`, merged over English
  defaults. The ones that name a thing are functions of its name:
  `select_row`, `remove_filter`.
  """

  use Phoenix.Component

  import ExoUI.Components.Core, only: [button: 1, icon: 1, skeleton: 1]
  import ExoUI.Components.DataDisplay, only: [table: 1]
  import ExoUI.Components.Form, only: [input: 1, select: 1]
  import ExoUI.Components.Overlay, only: [popover: 1, dropdown_menu: 1]

  alias Phoenix.LiveView.JS

  @default_labels %{
    views: "Views",
    search: "Search",
    filter: "Filter",
    add_filter: "Add filter",
    clear: "Clear",
    choose: "Choose",
    save_view: "Save view",
    view_name: "View name",
    view_name_placeholder: nil,
    save: "Save",
    cancel: "Cancel",
    delete_view: "Delete view",
    columns: "Columns",
    select_all: "Select all",
    select_row: &__MODULE__.default_select_row/1,
    remove_filter: &__MODULE__.default_remove_filter/1,
    selected: &__MODULE__.default_selected/1,
    bulk_actions: "Actions on selected",
    more: "More",
    loading: "Loading...",
    empty: "No results.",
    actions: "Actions"
  }

  @doc false
  def default_select_row(name), do: "Select #{name}"
  @doc false
  def default_remove_filter(name), do: "Remove filter #{name}"
  @doc false
  def default_selected(count), do: "#{count} selected"

  @doc "Renders a list of records with views, a search and filter toolbar, a sortable table and a bulk bar."
  attr :id, :string, required: true

  attr :list, :string,
    default: nil,
    doc: "key of the list: scopes the column choice and the search event"

  attr :labels, :map, default: %{}, doc: "text overriding the English defaults (see moduledoc)"
  attr :event_prefix, :string, default: "list:"

  attr :confirm_attr, :string,
    default: "data-confirm",
    doc: "attribute a `confirm` text is written into; the host's confirmation dialog reads it"

  attr :rows, :any, required: true, doc: "a list or a `LiveStream`"
  attr :row_id, :any, default: nil
  attr :row_item, :any, default: nil
  attr :row_class, :any, default: nil
  attr :empty?, :boolean, default: nil, doc: "whether there are no rows; a stream cannot tell"
  attr :loading?, :boolean, default: false

  attr :body_rest, :map,
    default: %{},
    doc: "attributes of the rows' `<tbody>`, e.g. the host's hook"

  attr :views, :list, default: [], doc: "`%{key, label, patch, count?}`"
  attr :active_view, :string, default: nil
  attr :view_delete, :map, default: nil, doc: "`%{id, label, confirm}` of the open saved view"
  attr :save_view, :atom, values: [nil, :offer, :saving], default: nil

  attr :search, :map, default: nil, doc: "`%{name, value}`; nil draws no toolbar form"
  attr :search_placeholder, :string, default: nil

  attr :chips, :list,
    default: [],
    doc: "`%{key, label, type, value, options?}`; `type` is `:select`, `:date` or `:amount`"

  attr :addable, :list, default: [], doc: "`%{key, label}` the Filter menu offers"
  attr :filtered?, :boolean, default: false
  attr :columns, :list, default: [], doc: "`%{key, label}` of the columns that can be hidden"

  attr :sort, :map, default: nil, doc: "`%{key, dir}`, `dir` is `\"asc\"` or `\"desc\"`"
  attr :sort_patch, :any, default: nil, doc: "`fn key, dir -> path end`"

  attr :selection, :map,
    default: nil,
    doc: """
    `%{selected: MapSet, ids: [id], toggle: event, toggle_all: event,
    row_id: fn row -> id end, row_label: fn row -> name end}`. `ids` are the
    rows on this page ("select all"); `selected` may be wider.
    """

  attr :bulk_primary, :integer, default: 3

  slot :stat do
    attr :label, :string, required: true
    attr :value, :any, required: true
  end

  slot :actions

  slot :col, required: true do
    attr :label, :string, required: true
    attr :align, :string
    attr :key, :string, doc: "column key for the column picker; a column without one always shows"
    attr :sort, :string, doc: "sort key; makes the header a sorting link"

    attr :sort_first, :string,
      doc: "direction of the first click, `\"asc\"` (default) or `\"desc\"`"
  end

  slot :bulk_action do
    attr :click, :any, required: true
    attr :id, :string
    attr :icon, :string
    attr :variant, :string
    attr :confirm, :string
    attr :disabled, :boolean
    attr :expanded, :boolean, doc: "the action opens a panel: `aria-expanded`"
    attr :controls, :string, doc: "`id` of the panel it opens: `aria-controls`"
  end

  slot :bulk_more do
    attr :click, :any, required: true
    attr :id, :string
    attr :icon, :string
    attr :variant, :string
    attr :confirm, :string
    attr :disabled, :boolean
    attr :expanded, :boolean, doc: "the action opens a panel: `aria-expanded`"
    attr :controls, :string, doc: "`id` of the panel it opens: `aria-controls`"
  end

  slot :bulk_panel,
    doc:
      "a form for the selected rows (bulk edit), drawn right under the bulk bar while rows are selected"

  slot :grid, doc: "replaces the table; the bulk bar stands above it"
  slot :empty
  slot :footer

  def resource_list(assigns) do
    labels = Map.merge(@default_labels, assigns.labels)
    {buttons, menu} = split_bulk(assigns.bulk_action, assigns.bulk_more, assigns.bulk_primary)

    assigns =
      assigns
      |> assign(:l, labels)
      |> assign(:streamed?, is_struct(assigns.rows, Phoenix.LiveView.LiveStream))
      |> assign(:selected_count, selected_count(assigns.selection))
      |> assign(:all_selected?, all_selected?(assigns.selection))
      |> assign(:bulk_buttons, buttons)
      |> assign(:bulk_menu, menu)

    assigns =
      assigns
      |> assign(:row_id, assigns.row_id || if(assigns.streamed?, do: fn {id, _row} -> id end))
      |> assign(
        :row_item,
        assigns.row_item || if(assigns.streamed?, do: fn {_id, row} -> row end, else: & &1)
      )
      |> assign(:bulk?, assigns.selected_count > 0 and (buttons != [] or menu != []))

    ~H"""
    <div id={@id} data-exo="resource-list" data-list={@list} data-selectable={@selection && ""}>
      <dl :if={@stat != []} data-exo="resource-list-stats">
        <div :for={stat <- @stat} data-exo="resource-list-stat">
          <dt>{stat.label}</dt>
          <dd>{stat.value}</dd>
        </div>
      </dl>

      <div :if={@views != []} data-exo="resource-list-views">
        <nav aria-label={@l.views} data-exo="resource-list-views-nav">
          <div data-exo="tabs">
            <.link
              :for={view <- @views}
              id={"#{@id}-view-#{view.key}"}
              patch={view.patch}
              data-exo="tab"
              data-view={view.key}
              data-active={view.key == @active_view && ""}
              aria-current={view.key == @active_view && "page"}
            >
              {view.label}
              <span :if={view[:count]} data-exo="resource-list-count">{view.count}</span>
            </.link>
          </div>
        </nav>
        <.button
          :if={@view_delete}
          id={"#{@id}-delete-view"}
          appearance="ghost"
          size="sm"
          phx-click={@event_prefix <> "delete_view"}
          phx-value-id={@view_delete.id}
          aria-label={@view_delete.label}
          {confirm(@confirm_attr, @view_delete[:confirm])}
        >
          <.icon name="trash-2" size="sm" />
        </.button>
        <.button
          :if={@save_view == :offer}
          id={"#{@id}-save-view"}
          appearance="outline"
          size="sm"
          phx-click={@event_prefix <> "save_start"}
        >
          <.icon name="bookmark-plus" size="sm" />
          {@l.save_view}
        </.button>
      </div>

      <form
        :if={@save_view == :saving}
        id={"#{@id}-save-form"}
        phx-submit={@event_prefix <> "save"}
        data-exo="resource-list-save"
      >
        <.input
          type="text"
          id={"#{@id}-view-name"}
          name="name"
          value=""
          size="sm"
          maxlength="60"
          aria-label={@l.view_name}
          placeholder={@l.view_name_placeholder}
          autofocus
        />
        <.button type="submit" size="sm">{@l.save}</.button>
        <.button appearance="ghost" size="sm" phx-click={@event_prefix <> "save_cancel"}>
          {@l.cancel}
        </.button>
      </form>

      <div :if={@search || @actions != [] || @columns != []} data-exo="resource-list-toolbar">
        <form
          :if={@search}
          id={"#{@id}-form"}
          phx-change={@event_prefix <> "filter"}
          phx-submit={@event_prefix <> "submit"}
          phx-hook="ExoListSearch"
          data-list={@list}
          data-exo="resource-list-filters"
          data-chips={@chips != [] && ""}
        >
          <div data-exo="resource-list-search">
            <.input
              type="search"
              id={"#{@id}-search"}
              name={@search.name}
              value={@search.value}
              size="sm"
              aria-label={@l.search}
              placeholder={@search_placeholder}
              phx-debounce="300"
            />
          </div>

          <div
            :for={chip <- @chips}
            id={"#{@id}-chip-#{chip.key}"}
            data-exo="resource-list-chip"
            data-filter-chip={chip.key}
          >
            <span id={"#{@id}-chip-#{chip.key}-label"} data-exo="resource-list-chip-label">
              {chip.label}
            </span>
            <.chip_control id={@id} chip={chip} choose={@l.choose} />
            <.button
              appearance="ghost"
              size="xs"
              shape="square"
              phx-click={@event_prefix <> "remove_filter"}
              phx-value-key={chip.key}
              aria-label={@l.remove_filter.(chip.label)}
            >
              <.icon name="x" size="sm" />
            </.button>
          </div>

          <.dropdown_menu
            :if={@addable != []}
            id={"#{@id}-add-filter"}
            label={@l.add_filter}
            align="start"
          >
            <:trigger>
              <.button appearance="outline" size="sm">
                <.icon name="list-filter" size="sm" />
                {@l.filter}
              </.button>
            </:trigger>
            <:entry
              :for={filter <- @addable}
              click={JS.push(@event_prefix <> "add_filter", value: %{key: filter.key})}
            >
              {filter.label}
            </:entry>
          </.dropdown_menu>

          <.button
            :if={@filtered? or @chips != []}
            id={"#{@id}-clear"}
            appearance="ghost"
            size="sm"
            phx-click={@event_prefix <> "clear"}
          >
            {@l.clear}
          </.button>
        </form>

        {render_slot(@actions)}

        <.column_picker
          :if={@columns != []}
          id={"#{@id}-columns"}
          list={@list}
          target={@id}
          columns={@columns}
          label={@l.columns}
        />
      </div>

      <div :if={@grid != []} id={"#{@id}-selection"} data-exo="resource-list-selection-bar">
        <.select_all
          :if={@selection}
          id={@id}
          selection={@selection}
          checked={@all_selected?}
          label={@l.select_all}
        />
        <.bulk_bar
          :if={@bulk?}
          id={@id}
          labels={@l}
          count={@selected_count}
          buttons={@bulk_buttons}
          menu={@bulk_menu}
          confirm_attr={@confirm_attr}
        />
        <span :if={@selection && !@bulk?} data-exo="resource-list-select-all-label">
          {@l.select_all}
        </span>
      </div>

      <div :if={@grid != [] and @bulk? and @bulk_panel != []} data-exo="resource-list-bulk-panel">
        {render_slot(@bulk_panel)}
      </div>

      <div :if={@grid != []} data-exo="resource-list-grid" phx-hook="ExoRowLink" id={"#{@id}-grid"}>
        {render_slot(@grid)}
      </div>

      <div :if={@grid == []} id={"#{@id}-table"} phx-hook="ExoRowLink" data-exo="resource-list-table">
        <.table
          id={"#{@id}-body"}
          rows={@rows}
          row_id={@row_id}
          row_item={@row_item}
          row_class={@row_class}
          loading={@loading?}
          rows_empty={@empty?}
          body_rest={body_rest(@body_rest, @selection, @streamed?)}
          actions_label={@l.actions}
          loading_label={@l.loading}
          empty_label={@l.empty}
        >
          <:head_row>
            <th :if={@selection} data-exo="table-head-cell" scope="col" data-select>
              <.select_all
                id={@id}
                selection={@selection}
                checked={@all_selected?}
                label={@l.select_all}
              />
            </th>
            <%!-- While rows are selected the header row is the bulk bar: the
                 actions stand right above the rows they change, and the column
                 names are not needed while choosing. --%>
            <th :if={@bulk?} data-exo="table-head-cell" scope="colgroup" colspan={length(@col)}>
              <.bulk_bar
                id={@id}
                labels={@l}
                count={@selected_count}
                buttons={@bulk_buttons}
                menu={@bulk_menu}
                confirm_attr={@confirm_attr}
              />
              <%!-- The bulk edit form stands under the bar it was opened from,
                   above the rows it changes, not above the whole list. --%>
              <div :if={@bulk_panel != []} data-exo="resource-list-bulk-panel">
                {render_slot(@bulk_panel)}
              </div>
            </th>
            <th
              :for={col <- @col}
              :if={!@bulk?}
              data-exo="table-head-cell"
              data-align={align(col[:align])}
              scope="col"
              class={col_class(col)}
              aria-sort={aria_sort(col, @sort)}
            >
              <.link
                :if={col[:sort] && @sort_patch}
                patch={@sort_patch.(col.sort, next_dir(col, @sort))}
                data-exo="resource-list-sort"
                data-active={sorted?(col, @sort) && ""}
              >
                {col.label}
                <.icon name={sort_icon(col, @sort)} size="xs" />
              </.link>
              <span :if={!(col[:sort] && @sort_patch)}>{col.label}</span>
            </th>
          </:head_row>
          <:col :let={row} :if={@selection} label="">
            <label data-exo="checkbox-item">
              <input
                type="checkbox"
                id={"#{@id}-select-#{@selection.row_id.(row)}"}
                data-exo="checkbox"
                data-size="sm"
                phx-click={@selection.toggle}
                phx-value-id={@selection.row_id.(row)}
                checked={MapSet.member?(@selection.selected, @selection.row_id.(row))}
                aria-label={@l.select_row.(@selection.row_label.(row))}
              />
              <span data-exo="checkbox-indicator" aria-hidden="true"></span>
            </label>
          </:col>
          <:col
            :let={row}
            :for={col <- @col}
            label={col.label}
            align={align(col[:align])}
            class={col_class(col)}
          >
            {render_slot(col, row)}
          </:col>
          <:loading_state>
            <.skeleton type="table" rows={5} label={@l.loading} />
          </:loading_state>
          <:empty :if={@empty != []}>{render_slot(@empty)}</:empty>
        </.table>
      </div>

      <div :if={@footer != []} data-exo="resource-list-footer">{render_slot(@footer)}</div>
    </div>
    """
  end

  attr :id, :string, required: true
  attr :selection, :map, required: true
  attr :checked, :boolean, required: true
  attr :label, :string, required: true

  defp select_all(assigns) do
    ~H"""
    <label data-exo="checkbox-item">
      <input
        type="checkbox"
        id={"#{@id}-select-all"}
        data-exo="checkbox"
        data-size="sm"
        phx-click={@selection.toggle_all}
        checked={@checked}
        aria-label={@label}
      />
      <span data-exo="checkbox-indicator" aria-hidden="true"></span>
    </label>
    """
  end

  attr :id, :string, required: true
  attr :labels, :map, required: true
  attr :count, :integer, required: true
  attr :buttons, :list, required: true
  attr :menu, :list, required: true
  attr :confirm_attr, :string, required: true

  defp bulk_bar(assigns) do
    ~H"""
    <div
      id={"#{@id}-bulk"}
      role="toolbar"
      aria-label={@labels.bulk_actions}
      data-exo="resource-list-bulk"
      data-bulk-count={@count}
    >
      <span data-exo="resource-list-bulk-count">{@labels.selected.(@count)}</span>
      <.button
        :for={action <- @buttons}
        id={action[:id]}
        appearance="outline"
        size="sm"
        phx-click={action.click}
        disabled={action[:disabled]}
        aria-expanded={expanded(action)}
        aria-controls={action[:controls]}
        {confirm(@confirm_attr, action[:confirm])}
      >
        <.icon :if={action[:icon]} name={action.icon} size="sm" />
        {render_slot(action)}
      </.button>
      <.popover :if={@menu != []} id={"#{@id}-bulk-more"} side="bottom" align="start" haspopup="menu">
        <:trigger>
          <.button appearance="outline" size="sm" aria-label={@labels.more}>
            <.icon name="ellipsis" size="sm" />
          </.button>
        </:trigger>
        <div
          data-exo="dropdown-menu"
          role="menu"
          aria-label={@labels.more}
          id={"#{@id}-bulk-more-menu"}
          phx-hook="ExoDropdownMenu"
        >
          <button
            :for={entry <- @menu}
            id={entry[:id]}
            type="button"
            data-exo="dropdown-item"
            data-variant={entry[:variant]}
            data-disabled={entry[:disabled] && ""}
            role="menuitem"
            aria-disabled={to_string(entry[:disabled] || false)}
            popovertarget={"#{@id}-bulk-more"}
            popovertargetaction="hide"
            phx-click={entry.click}
            disabled={entry[:disabled]}
            tabindex={if entry[:disabled], do: "-1"}
            aria-expanded={expanded(entry)}
            aria-controls={entry[:controls]}
            {confirm(@confirm_attr, entry[:confirm])}
          >
            <span :if={entry[:icon]} data-exo="dropdown-item-icon">
              <.icon name={entry.icon} size="sm" />
            </span>
            <span data-exo="dropdown-item-label">{render_slot(entry)}</span>
          </button>
        </div>
      </.popover>
    </div>
    """
  end

  attr :id, :string, required: true
  attr :chip, :map, required: true
  attr :choose, :string, required: true

  defp chip_control(%{chip: %{type: :select}} = assigns) do
    ~H"""
    <.select
      id={"#{@id}-filter-#{@chip.key}"}
      name={@chip.key}
      value={@chip.value}
      size="sm"
      labelledby={"#{@id}-chip-#{@chip.key}-label"}
      prompt={@choose}
      options={@chip.options}
    />
    """
  end

  defp chip_control(%{chip: %{type: :date}} = assigns) do
    ~H"""
    <.input
      type="date"
      id={"#{@id}-filter-#{@chip.key}"}
      name={@chip.key}
      value={@chip.value}
      size="sm"
      aria-labelledby={"#{@id}-chip-#{@chip.key}-label"}
    />
    """
  end

  # An amount is text with a decimal keyboard, not `type="number"`: the decimal
  # separator is the host's, and the number is read on the server.
  defp chip_control(%{chip: %{type: :amount}} = assigns) do
    ~H"""
    <.input
      type="text"
      id={"#{@id}-filter-#{@chip.key}"}
      name={@chip.key}
      value={@chip.value}
      size="sm"
      inputmode="decimal"
      aria-labelledby={"#{@id}-chip-#{@chip.key}-label"}
      phx-debounce="500"
    />
    """
  end

  attr :id, :string, required: true
  attr :list, :string, required: true
  attr :target, :string, required: true
  attr :columns, :list, required: true
  attr :label, :string, required: true

  # The choice lives in the browser (`ExoListColumns`): hiding is a style rule
  # over the column's class, so it needs no reload of the stream, holds for rows
  # that arrive later, and is remembered per list. `phx-update="ignore"`: the
  # hook writes the boxes and the rule, and LiveView does not reset them.
  defp column_picker(assigns) do
    ~H"""
    <div
      id={@id}
      phx-hook="ExoListColumns"
      phx-update="ignore"
      data-list={@list}
      data-target={@target}
    >
      <.popover id={"#{@id}-popover"} side="bottom" align="end">
        <:trigger>
          <.button appearance="outline" size="sm" shape="square" aria-label={@label}>
            <.icon name="columns-3" size="sm" />
          </.button>
        </:trigger>
        <fieldset data-exo="resource-list-columns">
          <legend>{@label}</legend>
          <label :for={column <- @columns} data-exo="checkbox-item">
            <input type="checkbox" data-exo="checkbox" data-size="sm" data-col={column.key} checked />
            <span data-exo="checkbox-indicator" aria-hidden="true"></span>
            <span>{column.label}</span>
          </label>
        </fieldset>
      </.popover>
      <style data-list-columns-style>
      </style>
    </div>
    """
  end

  # Danger never stands in the bar: it goes to the menu, ahead of nothing it
  # could be mistaken for, and only the first `primary` safe actions are
  # buttons.
  defp split_bulk(actions, more, primary) do
    {danger, safe} = Enum.split_with(actions, &(&1[:variant] in ["danger", "error"]))
    {buttons, rest} = Enum.split(safe, primary)
    {buttons, rest ++ more ++ danger}
  end

  # `aria-expanded="false"` says as much as "true": a slot without the
  # attribute draws none at all.
  defp expanded(%{expanded: expanded}) when is_boolean(expanded), do: to_string(expanded)
  defp expanded(_action), do: nil

  defp confirm(_attr, nil), do: %{}
  defp confirm(attr, text), do: %{attr => text}

  defp align("right"), do: "end"
  defp align("end"), do: "end"
  defp align("center"), do: "center"
  defp align(_left), do: nil

  defp col_class(%{key: key}) when is_binary(key), do: "exo-col-#{key}"
  defp col_class(_col), do: nil

  defp sorted?(%{sort: key}, %{key: key}) when is_binary(key), do: true
  defp sorted?(_col, _sort), do: false

  defp aria_sort(col, sort) do
    cond do
      !col[:sort] -> nil
      sorted?(col, sort) and sort.dir == "desc" -> "descending"
      sorted?(col, sort) -> "ascending"
      true -> "none"
    end
  end

  defp next_dir(col, sort) do
    cond do
      sorted?(col, sort) and sort.dir == "asc" -> "desc"
      sorted?(col, sort) -> "asc"
      true -> col[:sort_first] || "asc"
    end
  end

  defp sort_icon(col, sort) do
    cond do
      sorted?(col, sort) and sort.dir == "desc" -> "arrow-down"
      sorted?(col, sort) -> "arrow-up"
      true -> "arrow-up-down"
    end
  end

  defp selected_count(nil), do: 0
  defp selected_count(%{selected: selected}), do: MapSet.size(selected)

  defp all_selected?(%{ids: [_ | _] = ids, selected: selected}),
    do: Enum.all?(ids, &MapSet.member?(selected, &1))

  defp all_selected?(_selection), do: false

  # With a selection the rows' checkboxes follow "select all" through
  # `ExoBulkSelect`, unless the host brings its own hook.
  defp body_rest(rest, nil, _streamed?), do: rest

  defp body_rest(rest, _selection, _streamed?),
    do: Map.put_new(rest, :"phx-hook", "ExoBulkSelect")
end
