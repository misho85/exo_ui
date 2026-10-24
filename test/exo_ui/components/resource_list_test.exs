defmodule ExoUI.Components.ResourceListTest do
  use ExoUI.ComponentCase, async: true

  @rows [%{id: 1, name: "Ana"}, %{id: 2, name: "Bojan"}]

  defp render_list(assigns) do
    assigns =
      Map.merge(
        %{
          rows: @rows,
          views: [],
          active_view: nil,
          chips: [],
          addable: [],
          sort: nil,
          selection: nil,
          labels: %{},
          view_delete: nil,
          save_view: nil
        },
        assigns
      )

    rendered_to_string(~H"""
    <.resource_list
      id="people"
      list="people"
      rows={@rows}
      row_id={&"person-#{&1.id}"}
      labels={@labels}
      views={@views}
      active_view={@active_view}
      view_delete={@view_delete}
      save_view={@save_view}
      search={%{name: "q", value: "an"}}
      chips={@chips}
      addable={@addable}
      columns={[%{key: "email", label: "Email"}]}
      sort={@sort}
      sort_patch={&"/people?sort=#{&1}&dir=#{&2}"}
      selection={@selection}
      confirm_attr="data-confirm-message"
    >
      <:col :let={person} label="Name" sort="name">{person.name}</:col>
      <:col :let={person} label="Email" key="email">{person.name}@mail</:col>
      <:bulk_action click="archive" id="archive-open" expanded={false} controls="archive-panel">
        Archive
      </:bulk_action>
      <:bulk_action click="tag">Tag</:bulk_action>
      <:bulk_action click="export">Export</:bulk_action>
      <:bulk_action click="print">Print</:bulk_action>
      <:bulk_action click="delete" variant="danger" confirm="Delete the selected people?">
        Delete
      </:bulk_action>
      <:bulk_panel>
        <form id="archive-panel">reason</form>
      </:bulk_panel>
    </.resource_list>
    """)
  end

  defp parse(html), do: Floki.parse_fragment!(html)

  describe "views" do
    test "are links to the list with their filters, the open one marked" do
      views = [
        %{key: "all", label: "All", patch: "/people"},
        %{key: "new", label: "New", patch: "/people?state=new", count: 4}
      ]

      doc = %{views: views, active_view: "new"} |> render_list() |> parse()

      assert [tab] = Floki.find(doc, ~s([data-view="new"]))
      assert Floki.attribute(tab, "href") == ["/people?state=new"]
      assert Floki.attribute(tab, "aria-current") == ["page"]
      assert Floki.text(tab) =~ "4"
      assert Floki.attribute(doc, ~s([data-view="all"]), "aria-current") == []
    end
  end

  describe "toolbar" do
    test "the search and every chip are fields of one form that sends the prefixed events" do
      chips = [
        %{key: "state", label: "State", type: :select, value: "new", options: [{"New", "new"}]},
        %{key: "from", label: "From", type: :date, value: "2026-10-01"}
      ]

      doc = %{chips: chips} |> render_list() |> parse()

      assert [form] = Floki.find(doc, "#people-form")
      assert Floki.attribute(form, "phx-change") == ["list:filter"]
      assert Floki.attribute(form, "phx-submit") == ["list:submit"]
      assert Floki.attribute(form, "data-chips") == [""]
      assert Floki.attribute(form, ~s(input[type="search"]), "name") == ["q"]
      assert Floki.attribute(form, ~s(input[type="date"]), "name") == ["from"]

      assert Floki.attribute(doc, ~s([phx-value-key="state"]), "aria-label") == [
               "Remove filter State"
             ]
    end

    test "Filter offers what is not a chip yet, and Clear shows once a chip stands" do
      html = render_list(%{addable: [%{key: "tag", label: "Tag"}]})
      assert html =~ "list:add_filter"
      refute html =~ ~s(id="people-clear")

      chips = [%{key: "tag", label: "Tag", type: :amount, value: ""}]
      assert %{chips: chips} |> render_list() =~ ~s(id="people-clear")
    end

    test "the column picker remembers per list and hides by the column's class" do
      doc = render_list(%{}) |> parse()

      assert [picker] = Floki.find(doc, "#people-columns")
      assert Floki.attribute(picker, "phx-hook") == ["ExoListColumns"]
      assert Floki.attribute(picker, "data-list") == ["people"]
      assert Floki.attribute(picker, ~s(input[data-col]), "data-col") == ["email"]
      assert Floki.find(doc, "th.exo-col-email") != []
      assert length(Floki.find(doc, "td.exo-col-email")) == 2
    end

    test "deleting a saved view asks through the host's attribute" do
      view_delete = %{id: "v1", label: "Delete view Mine", confirm: "Delete the view Mine?"}
      views = [%{key: "saved-v1", label: "Mine", patch: "/people?q=an"}]

      doc =
        %{view_delete: view_delete, views: views, active_view: "saved-v1"}
        |> render_list()
        |> parse()

      assert Floki.attribute(doc, "#people-delete-view", "data-confirm-message") == [
               "Delete the view Mine?"
             ]
    end

    test "labels replace the English text" do
      labels = %{remove_filter: &"Ukloni #{&1}", search: "Pretraga"}
      chips = [%{key: "tag", label: "Oznaka", type: :amount, value: ""}]
      html = render_list(%{labels: labels, chips: chips})

      assert html =~ ~s(aria-label="Ukloni Oznaka")
      assert html =~ ~s(aria-label="Pretraga")
    end
  end

  describe "sorting" do
    test "a sortable header is a link to the other direction, with aria-sort" do
      doc = %{sort: %{key: "name", dir: "asc"}} |> render_list() |> parse()

      assert [th] = Floki.find(doc, ~s(th[aria-sort]))
      assert Floki.attribute(th, "aria-sort") == ["ascending"]
      assert Floki.attribute(th, "a", "href") == ["/people?sort=name&dir=desc"]
    end

    test "an unsorted column starts ascending and says none" do
      doc = render_list(%{}) |> parse()

      assert Floki.attribute(doc, ~s(th[aria-sort]), "aria-sort") == ["none"]

      assert Floki.attribute(doc, ~s([data-exo="resource-list-sort"]), "href") == [
               "/people?sort=name&dir=asc"
             ]
    end
  end

  describe "selection" do
    defp selection(selected) do
      %{
        selected: MapSet.new(selected),
        ids: [1, 2],
        toggle: "toggle",
        toggle_all: "toggle_all",
        row_id: & &1.id,
        row_label: & &1.name
      }
    end

    test "without a selected row the header names the columns" do
      doc = %{selection: selection([])} |> render_list() |> parse()

      assert Floki.find(doc, "#people-bulk") == []
      assert Floki.attribute(doc, "#people-select-1", "aria-label") == ["Select Ana"]
      assert Floki.attribute(doc, "#people-select-all", "phx-click") == ["toggle_all"]
    end

    test "a selected row turns the header into the bulk bar: three buttons, the rest and danger in More" do
      doc = %{selection: selection([1])} |> render_list() |> parse()

      assert [bar] = Floki.find(doc, "#people-bulk")
      assert Floki.attribute(bar, "data-bulk-count") == ["1"]
      assert Floki.text(bar) =~ "1 selected"

      buttons = bar |> Floki.find(~s([data-exo="btn"][phx-click])) |> Floki.attribute("phx-click")
      assert buttons == ["archive", "tag", "export"]

      menu = Floki.find(bar, ~s([role="menu"] [role="menuitem"]))
      assert Floki.attribute(menu, "phx-click") == ["print", "delete"]

      assert Floki.attribute(menu, "data-confirm-message") == [
               "Delete the selected people?"
             ]

      assert Floki.find(doc, ~s(th[aria-sort])) == []

      # The column names stay in the row, hidden under the bar, so the columns
      # keep their widths when a row is picked.
      assert Floki.attribute(doc, ~s([data-exo="resource-list"]), "data-bulk") == [""]
      assert Floki.attribute(doc, "thead th.exo-col-email", "aria-hidden") == ["true"]

      assert Floki.find(
               doc,
               ~s(th[data-select] [data-exo="resource-list-bulk-overlay"] #people-bulk)
             ) != []

      assert Floki.attribute(doc, ~s(thead th [data-exo="resource-list-sort"]), "tabindex") == [
               "-1"
             ]
    end

    test "an action that opens a panel says so, and the panel stands under the bar" do
      doc = %{selection: selection([1])} |> render_list() |> parse()

      assert [button] = Floki.find(doc, "#archive-open")
      assert Floki.attribute(button, "aria-expanded") == ["false"]
      assert Floki.attribute(button, "aria-controls") == ["archive-panel"]

      assert Floki.find(
               doc,
               ~s(thead tr[data-after] [data-exo="resource-list-bulk-panel"] #archive-panel)
             ) != []

      assert %{selection: selection([])}
             |> render_list()
             |> parse()
             |> Floki.find("#archive-panel") ==
               []
    end

    test "every row selected checks select all" do
      doc = %{selection: selection([1, 2])} |> render_list() |> parse()
      assert Floki.attribute(doc, "#people-select-all", "checked") != []
    end
  end
end
