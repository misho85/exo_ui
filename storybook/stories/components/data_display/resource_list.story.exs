defmodule Storybook.Components.ResourceList do
  use PhoenixStorybook.Story, :component

  def function, do: &ExoUI.Components.ResourceList.resource_list/1

  def template do
    """
    <div style="padding: 1rem; width: 100%; box-sizing: border-box;">
      <.psb-variation/>
    </div>
    """
  end

  def variations do
    [
      %Variation{
        id: :toolbar,
        attributes: base(%{id: "orders-list", sort: %{key: "date", dir: "desc"}}),
        slots: cols()
      },
      %Variation{
        id: :filtered,
        attributes:
          base(%{
            id: "orders-filtered",
            active_view: nil,
            filtered?: true,
            save_view: :offer,
            chips: [
              %{
                key: "status",
                label: "Status",
                type: :select,
                value: "paid",
                options: [{"Paid", "paid"}, {"Pending", "pending"}]
              },
              %{key: "from", label: "From", type: :date, value: "2026-10-01"}
            ],
            addable: [%{key: "total", label: "Total"}]
          }),
        slots: cols()
      },
      %Variation{
        id: :selected,
        attributes:
          base(%{
            id: "orders-selected",
            selection: {:eval, "Storybook.Components.ResourceList.selection()"}
          }),
        slots:
          cols() ++
            [
              ~s|<:bulk_action click="fulfil" icon="truck">Mark as fulfilled</:bulk_action>|,
              ~s|<:bulk_action click="print" icon="printer">Print packing slips</:bulk_action>|,
              ~s|<:bulk_more click="export">Export</:bulk_more>|,
              ~s|<:bulk_action click="archive" variant="danger" confirm="Archive the selected orders?">Archive</:bulk_action>|
            ]
      },
      %Variation{
        id: :empty,
        attributes: base(%{id: "orders-empty", rows: [], active_view: "unpaid"}),
        slots: cols() ++ [~s|<:empty>No unpaid orders.</:empty>|]
      }
    ]
  end

  defp base(attrs) do
    Map.merge(
      %{
        list: "orders",
        rows: orders(),
        row_id: {:eval, "&Storybook.Components.ResourceList.dom_id/1"},
        views: [
          %{key: "all", label: "All", patch: "#all"},
          %{key: "unfulfilled", label: "Unfulfilled", patch: "#unfulfilled", count: 2},
          %{key: "unpaid", label: "Unpaid", patch: "#unpaid"}
        ],
        active_view: "all",
        search: %{name: "search", value: ""},
        search_placeholder: "Search or type a sentence",
        addable: [%{key: "status", label: "Status"}, %{key: "from", label: "From"}],
        columns: [%{key: "customer", label: "Customer"}, %{key: "total", label: "Total"}],
        sort_patch: {:eval, "&Storybook.Components.ResourceList.sort_patch/2"}
      },
      attrs
    )
  end

  defp cols do
    [
      ~s|<:col :let={order} label="Order"><a href="#" data-row-link>\#{order.id}</a></:col>|,
      ~s|<:col :let={order} label="Date" sort="date" sort_first="desc">{order.date}</:col>|,
      ~s|<:col :let={order} label="Customer" key="customer" sort="customer">{order.customer}</:col>|,
      ~s|<:col :let={order} label="Total" key="total" align="right">{order.total}</:col>|
    ]
  end

  defp orders do
    [
      %{id: 1001, date: "Oct 24", customer: "Ana Anić", total: "€42.00"},
      %{id: 1002, date: "Oct 23", customer: "Bojan Bojić", total: "€18.50"},
      %{id: 1003, date: "Oct 22", customer: "Cvijeta Cvijić", total: "€120.00"}
    ]
  end

  def selection do
    %{
      selected: MapSet.new([1001]),
      ids: [1001, 1002, 1003],
      toggle: "toggle",
      toggle_all: "toggle_all",
      row_id: & &1.id,
      row_label: &"order #{&1.id}"
    }
  end

  def dom_id(order), do: "order-#{order.id}"
  def sort_patch(key, dir), do: "#sort-#{key}-#{dir}"
end
