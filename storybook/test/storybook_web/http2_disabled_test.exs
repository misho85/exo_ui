defmodule ExoUI.Storybook.Web.Http2DisabledTest do
  @moduledoc """
  The production listener does not speak HTTP/2 (KRF-290).

  Bandit's HTTP/2 stack carries EEF-CVE-2026-105659 (send deadlines restart on
  every `WINDOW_UPDATE`, so a peer dripping window pins stream processes), and
  no bandit release fixes it. `storybook/mix.exs` ignores the advisory for that
  reason only, so this test holds the reason: it reads the `http:` options the
  release gets from `config/runtime.exs`, starts Bandit with them and opens an
  h2c connection with prior knowledge. With HTTP/2 on, Bandit answers the
  preface with a SETTINGS frame; with it off, the bytes are a bad HTTP/1 request.
  """
  use ExUnit.Case, async: false

  @runtime Path.expand("../../config/runtime.exs", __DIR__)
  @env %{"PHX_HOST" => "storybook.test", "SECRET_KEY_BASE" => String.duplicate("k", 64)}

  # Client connection preface (RFC 9113 §3.4) followed by an empty SETTINGS frame.
  @preface "PRI * HTTP/2.0\r\n\r\nSM\r\n\r\n" <> <<0::24, 4, 0, 0::32>>

  defmodule Ok do
    def init(opts), do: opts
    def call(conn, _opts), do: Plug.Conn.send_resp(conn, 200, "ok")
  end

  defp prod_http_options do
    saved = Map.new(@env, fn {key, _} -> {key, System.get_env(key)} end)
    Enum.each(@env, fn {key, value} -> System.put_env(key, value) end)

    try do
      Config.Reader.read!(@runtime, env: :prod)
      |> get_in([:exo_ui_storybook, ExoUI.Storybook.Web.Endpoint, :http])
    after
      Enum.each(saved, fn
        {key, nil} -> System.delete_env(key)
        {key, value} -> System.put_env(key, value)
      end)
    end
  end

  test "the prod http options turn HTTP/2 off" do
    assert get_in(prod_http_options(), [:http_2_options, :enabled]) == false
  end

  test "Bandit started with the prod http options refuses an h2c preface" do
    opts = Keyword.merge(prod_http_options(), ip: {127, 0, 0, 1}, port: 0)
    pid = start_supervised!({Bandit, [plug: Ok, startup_log: false] ++ opts})
    {:ok, {_ip, port}} = ThousandIsland.listener_info(pid)

    {:ok, socket} = :gen_tcp.connect(~c"127.0.0.1", port, [:binary, active: false])
    :ok = :gen_tcp.send(socket, @preface)
    reply = :gen_tcp.recv(socket, 0, 5_000)
    :gen_tcp.close(socket)

    refute match?({:ok, <<_len::24, 4, _rest::binary>>}, reply),
           "Bandit answered the h2c preface with a SETTINGS frame: #{inspect(reply)}"
  end
end
