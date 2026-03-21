defmodule ExoUI.Storybook.Application do
  use Application

  @impl true
  def start(_type, _args) do
    children = [
      {Phoenix.PubSub, name: ExoUI.Storybook.PubSub},
      ExoUI.Storybook.Web.Endpoint
    ]

    opts = [strategy: :one_for_one, name: ExoUI.Storybook.Supervisor]
    Supervisor.start_link(children, opts)
  end

  @impl true
  def config_change(changed, _new, removed) do
    ExoUI.Storybook.Web.Endpoint.config_change(changed, removed)
    :ok
  end
end
