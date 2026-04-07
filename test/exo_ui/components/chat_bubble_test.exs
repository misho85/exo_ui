defmodule ExoUI.Components.ChatBubbleTest do
  use ExoUI.ComponentCase, async: true

  test "renders chat_bubble with data-exo attribute" do
    assigns = %{}

    ~H"""
    <.chat_bubble>
      Hello there!
    </.chat_bubble>
    """
    |> parse_component()
    |> assert_attribute("data-exo", "chat-bubble")
  end

  test "renders message content" do
    assigns = %{}

    ~H"""
    <.chat_bubble>
      How are you doing?
    </.chat_bubble>
    """
    |> parse_component()
    |> assert_text("How are you doing?")
  end

  test "renders with default start side" do
    assigns = %{}

    ~H"""
    <.chat_bubble>
      Message
    </.chat_bubble>
    """
    |> parse_component()
    |> assert_attribute("data-side", "start")
  end

  test "renders with end side" do
    assigns = %{}

    ~H"""
    <.chat_bubble side="end">
      Message
    </.chat_bubble>
    """
    |> parse_component()
    |> assert_attribute("data-side", "end")
  end

  test "renders avatar slot" do
    assigns = %{}

    ~H"""
    <.chat_bubble>
      <:avatar>
        <img src="/avatar.png" alt="User" />
      </:avatar>
      Hello!
    </.chat_bubble>
    """
    |> parse_component()
    |> assert_component("[data-exo='chat-bubble-avatar']")
  end

  test "renders header slot" do
    assigns = %{}

    ~H"""
    <.chat_bubble>
      <:header>John Doe</:header>
      Hello!
    </.chat_bubble>
    """
    |> parse_component()
    |> assert_component("[data-exo='chat-bubble-header']")
    |> assert_text("John Doe")
  end

  test "renders footer slot" do
    assigns = %{}

    ~H"""
    <.chat_bubble>
      <:footer>12:30 PM</:footer>
      Hello!
    </.chat_bubble>
    """
    |> parse_component()
    |> assert_component("[data-exo='chat-bubble-footer']")
    |> assert_text("12:30 PM")
  end

  test "renders message content area" do
    assigns = %{}

    ~H"""
    <.chat_bubble>
      Message text
    </.chat_bubble>
    """
    |> parse_component()
    |> assert_component("[data-exo='chat-bubble-content']")
  end

  test "renders message wrapper" do
    assigns = %{}

    ~H"""
    <.chat_bubble>
      Message text
    </.chat_bubble>
    """
    |> parse_component()
    |> assert_component("[data-exo='chat-bubble-message']")
  end

  test "omits avatar when slot not provided" do
    assigns = %{}

    ~H"""
    <.chat_bubble>
      Message
    </.chat_bubble>
    """
    |> parse_component()
    |> refute_element("[data-exo='chat-bubble-avatar']")
  end

  test "omits header when slot not provided" do
    assigns = %{}

    ~H"""
    <.chat_bubble>
      Message
    </.chat_bubble>
    """
    |> parse_component()
    |> refute_element("[data-exo='chat-bubble-header']")
  end

  test "omits footer when slot not provided" do
    assigns = %{}

    ~H"""
    <.chat_bubble>
      Message
    </.chat_bubble>
    """
    |> parse_component()
    |> refute_element("[data-exo='chat-bubble-footer']")
  end

  test "renders chat_bubble with class" do
    assigns = %{}

    ~H"""
    <.chat_bubble class="my-bubble">
      Message
    </.chat_bubble>
    """
    |> parse_component()
    |> assert_class("my-bubble")
  end

  test "renders full chat bubble with all slots" do
    assigns = %{}

    ~H"""
    <.chat_bubble side="end">
      <:avatar>AV</:avatar>
      <:header>Jane</:header>
      <:footer>Now</:footer>
      Hi!
    </.chat_bubble>
    """
    |> parse_component()
    |> assert_attribute("data-side", "end")
    |> assert_component("[data-exo='chat-bubble-avatar']")
    |> assert_component("[data-exo='chat-bubble-header']")
    |> assert_component("[data-exo='chat-bubble-footer']")
    |> assert_component("[data-exo='chat-bubble-content']")
  end
end
