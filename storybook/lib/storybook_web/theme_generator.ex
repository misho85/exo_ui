defmodule ExoUI.Storybook.Web.ThemeGenerator do
  @moduledoc """
  The theme generator at `/theme-generator`, daisyUI's theme generator for
  ExoUI: pick one of daisyUI's 35 themes or your own, change its colours,
  radii, sizes, border and effects, and copy the CSS.

  The page is rendered once on the server: the preview is real ExoUI
  components, the editor is `assets/js/theme_generator.js`, which sets the
  theme's custom properties on the preview as you change them. Nothing goes
  back to the server; your themes stay in the browser (localStorage) and in
  the link (`#theme=…`).
  """

  use Phoenix.Component
  import Plug.Conn
  import ExoUI.Components

  def init(action), do: action

  def call(conn, :show) do
    html = page(%{}) |> Phoenix.HTML.Safe.to_iodata()

    conn
    |> put_resp_content_type("text/html")
    |> send_resp(200, ["<!DOCTYPE html>", html])
  end

  defp page(assigns) do
    ~H"""
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Theme generator · ExoUI</title>
        <link rel="stylesheet" href="/exo/exo.css" />
        <link rel="stylesheet" href="/assets/theme_generator.css" />
        <script defer src="/assets/theme_generator.js">
        </script>
      </head>
      <body data-exo="theme-generator">
        <header data-tg="topbar">
          <a href="/" data-tg="brand">ExoUI</a>
          <span data-tg="title">Theme generator</span>
          <span data-tg="credit">
            After the
            <a href="https://daisyui.com/theme-generator/" rel="noopener">daisyUI theme generator</a>
          </span>
        </header>
        <div data-tg="layout">
          <aside id="tg-themes" data-tg="themes" data-tg-panel="themes" aria-label="Themes"></aside>
          <section id="tg-editor" data-tg="editor" data-tg-panel="editor" aria-label="Editor">
          </section>
          <main data-tg="stage" data-tg-panel="preview">
            <div id="tg-preview" data-tg="preview" data-theme="light">
              <.preview />
            </div>
          </main>
        </div>
        <nav data-tg="dock" aria-label="Panels">
          <button type="button" data-tg-show="themes">Themes</button>
          <button type="button" data-tg-show="editor" aria-current="true">Editor</button>
          <button type="button" data-tg-show="preview">Preview</button>
        </nav>
      </body>
    </html>
    """
  end

  @colors ~w(neutral primary secondary accent info success warning error)

  defp preview(assigns) do
    assigns =
      assign(assigns,
        colors: @colors,
        orders: [
          %{id: "#1042", customer: "Ana Petrović", total: "€84.00", status: "Paid"},
          %{id: "#1041", customer: "Marko Jovanović", total: "€19.50", status: "Pending"},
          %{id: "#1040", customer: "Jelena Ilić", total: "€230.00", status: "Refunded"}
        ]
      )

    ~H"""
    <div data-tg="preview-grid">
      <section data-tg="tile" data-span="full">
        <h3>Buttons</h3>
        <div :for={appearance <- [nil, "soft", "outline", "dash", "ghost", "link"]} data-tg="row">
          <.button variant="base" appearance={appearance}>Default</.button>
          <.button :for={color <- @colors} variant={color} appearance={appearance}>
            {String.capitalize(color)}
          </.button>
        </div>
        <div data-tg="row">
          <.button :for={size <- ~w(xs sm md lg xl)} size={size} variant="primary">{size}</.button>
          <.button shape="square" variant="primary" aria-label="Add"><.icon name="plus" /></.button>
          <.button shape="circle" variant="base" aria-label="Like"><.icon name="heart" /></.button>
          <.button disabled>Disabled</.button>
        </div>
      </section>

      <section data-tg="tile" data-span="2">
        <h3>Badges</h3>
        <div :for={appearance <- [nil, "soft", "outline", "dash"]} data-tg="row">
          <.badge :for={color <- @colors} variant={color} appearance={appearance}>{color}</.badge>
        </div>
        <div data-tg="row">
          <.badge :for={size <- ~w(xs sm md lg xl)} size={size} variant="neutral">{size}</.badge>
        </div>
      </section>

      <section data-tg="tile">
        <h3>Stats</h3>
        <.stat_card
          title="Revenue"
          value="€12,840"
          trend="+8.2%"
          trend_direction="up"
          subtitle="Last 30 days"
        />
        <.stat_card
          title="Orders"
          value="312"
          trend="-2.1%"
          trend_direction="down"
          subtitle="Last 30 days"
        />
      </section>

      <section data-tg="tile">
        <h3>Form</h3>
        <.input name="tg-name" id="tg-name" label="Store name" value="Kafeterija" />
        <.input
          name="tg-email"
          id="tg-email"
          type="email"
          label="Email"
          placeholder="you@shop.test"
          variant="primary"
        />
        <.select id="tg-status" name="tg-status" label="Status" value="active">
          <:option value="active">Active</:option>
          <:option value="draft">Draft</:option>
          <:option value="archived">Archived</:option>
        </.select>
        <.input
          name="tg-note"
          id="tg-note"
          type="textarea"
          label="Note"
          value="Ships within two days."
        />
        <.file_input name="tg-file" id="tg-file" label="Product photo" />
      </section>

      <section data-tg="tile">
        <h3>Selectors</h3>
        <div data-tg="row">
          <.input
            :for={color <- @colors}
            type="checkbox"
            name={"tg-cb-#{color}"}
            id={"tg-cb-#{color}"}
            checked
            variant={color}
            aria-label={color}
          />
        </div>
        <div data-tg="row">
          <.toggle
            :for={color <- @colors}
            name={"tg-tg-#{color}"}
            id={"tg-tg-#{color}"}
            checked
            variant={color}
            aria_label={color}
          />
        </div>
        <.radio_group name="tg-radio" id="tg-radio" value="card" label="Payment" variant="primary">
          <:item value="card">Card</:item>
          <:item value="cash">Cash on delivery</:item>
        </.radio_group>
        <.slider name="tg-range" id="tg-range" label="Discount" value={40} variant="primary" />
        <.slider
          name="tg-range-2"
          id="tg-range-2"
          value={70}
          variant="accent"
          size="sm"
          aria-label="Volume"
        />
        <.rating name="tg-rating" id="tg-rating" value={4} label="Rating" />
      </section>

      <section data-tg="tile" data-span="2">
        <h3>Alerts</h3>
        <.alert kind={:info} title="New version">ExoUI 0.2 is out.</.alert>
        <.alert kind={:success} appearance="soft" title="Saved">Your changes are live.</.alert>
        <.alert kind={:warning} appearance="outline" title="Low stock">3 items left.</.alert>
        <.alert kind={:error} appearance="dash" title="Payment failed">The card was declined.</.alert>
      </section>

      <section data-tg="tile">
        <h3>Card</h3>
        <.content_card title="Shipping">
          <p>Free delivery on orders over €50 in Montenegro and Serbia.</p>
          <:action><.button size="sm">Edit</.button></:action>
        </.content_card>
        <.content_card title="Bordered" appearance="border" size="sm">
          <p>A card with a border instead of a shadow.</p>
        </.content_card>
      </section>

      <section data-tg="tile">
        <h3>Tabs</h3>
        <.tabs
          :for={appearance <- [nil, "lift", "box"]}
          active="general"
          appearance={appearance}
          aria_label="Settings"
        >
          <:tab id="general" label="General" />
          <:tab id="payments" label="Payments" />
          <:tab id="shipping" label="Shipping" />
        </.tabs>
      </section>

      <section data-tg="tile" data-span="2">
        <h3>Table</h3>
        <.table id="tg-orders" rows={@orders} zebra>
          <:col :let={order} label="Order">{order.id}</:col>
          <:col :let={order} label="Customer">{order.customer}</:col>
          <:col :let={order} label="Total" align="right">{order.total}</:col>
          <:col :let={order} label="Status">
            <.badge
              appearance="soft"
              size="sm"
              variant={
                case order.status do
                  "Paid" -> "success"
                  "Pending" -> "warning"
                  _ -> "neutral"
                end
              }
            >
              {order.status}
            </.badge>
          </:col>
        </.table>
        <.pagination page={2} total_pages={5} on_click="noop" />
      </section>

      <section data-tg="tile">
        <h3>Progress</h3>
        <.progress
          :for={color <- ~w(primary secondary accent success warning error)}
          value={20 + String.length(color) * 7}
          variant={color}
          aria_label={color}
        />
        <div data-tg="row">
          <.radial_progress value={70} variant="primary" />
          <.radial_progress value={45} variant="accent" />
          <.spinner
            :for={appearance <- ~w(spinner dots ring ball bars infinity)}
            appearance={appearance}
          />
        </div>
      </section>

      <section data-tg="tile">
        <h3>Steps</h3>
        <.steps variant="primary">
          <:step title="Cart" status="complete" />
          <:step title="Shipping" status="complete" />
          <:step title="Payment" status="current" />
          <:step title="Done" status="upcoming" />
        </.steps>
        <.timeline>
          <:event title="Order placed" time="09:12" />
          <:event title="Paid" time="09:13" variant="success" />
          <:event title="Shipped" time="14:40" current />
        </.timeline>
      </section>

      <section data-tg="tile">
        <h3>Chat</h3>
        <.chat_bubble side="start">
          <:header>Kupac</:header>
          Is the blue one still in stock?
        </.chat_bubble>
        <.chat_bubble side="end" variant="primary">
          <:header>Prodavnica</:header>
          Yes — 4 left, ships tomorrow.
        </.chat_bubble>
        <.chat_bubble side="start" variant="accent">Great, ordering now.</.chat_bubble>
      </section>

      <section data-tg="tile">
        <h3>Misc</h3>
        <div data-tg="row">
          <.avatar name="Ana Petrović" size="lg" />
          <.avatar name="Marko J" />
          <.avatar name="Jelena" size="sm" />
          <.kbd>⌘</.kbd>
          <.kbd>K</.kbd>
          <.kbd size="sm">Esc</.kbd>
        </div>
        <.breadcrumb>
          <:item href="#">Store</:item>
          <:item href="#">Products</:item>
          <:item current>Blue mug</:item>
        </.breadcrumb>
        <.accordion id="tg-faq">
          <:item title="Do you ship abroad?" open>Yes, to the whole region.</:item>
          <:item title="Can I return an item?">Within 14 days.</:item>
        </.accordion>
        <.separator />
        <.skeleton rows={2} />
      </section>
    </div>
    """
  end
end
