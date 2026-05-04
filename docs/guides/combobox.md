# Combobox Usage

Use `combobox/1` when users need to search a list and submit a single hidden value with a Phoenix form. The component supports local filtering and LiveView-backed server filtering.

## Client Filter

```heex
<.combobox
  id="country"
  name="country"
  value={@country}
  label="Country"
  prompt="Search countries..."
  filter="client"
>
  <:option value="rs">Serbia</:option>
  <:option value="hr">Croatia</:option>
  <:option value="ba">Bosnia and Herzegovina</:option>
</.combobox>
```

## Server Filter In A LiveView

For a normal LiveView, set `filter="server"` and handle the event on the parent view.

```heex
<.combobox
  id="user"
  field={@form[:user_id]}
  label="User"
  prompt="Search users..."
  filter="server"
  on_filter="search-users"
  debounce={200}
  loading={@searching_users}
  status={@user_search_status}
>
  <:option :for={user <- @user_results} value={user.id}>
    {user.name}
  </:option>
  <:empty>No users found</:empty>
</.combobox>
```

```elixir
def handle_event("search-users", %{"query" => query}, socket) do
  users = Accounts.search_users(query)

  status =
    case users do
      [] -> ~s(No users found for "#{query}".)
      [_] -> "1 result available"
      users -> "#{length(users)} results available"
    end

  {:noreply,
   assign(socket,
     searching_users: false,
     user_results: users,
     user_search_status: status
   )}
end
```

## Server Filter Inside A LiveComponent

When the combobox lives inside a LiveComponent, pass `on_filter_target={@myself}` so the hook pushes the debounced search event to that component instead of the parent LiveView.

```heex
<.combobox
  id="assignee"
  name="assignee_id"
  label="Assignee"
  prompt="Search remote users..."
  filter="server"
  on_filter="search-assignees"
  on_filter_target={@myself}
  debounce={150}
  loading={@loading}
  status={combobox_status(@query, @loading, @assignees)}
>
  <:option :for={person <- @assignees} value={person.id}>
    <span>{person.name}</span>
    <span style="margin-left:auto;color:var(--exo-muted-foreground);font-size:var(--exo-text-xs);">
      {person.team}
    </span>
  </:option>
  <:empty :if={!@loading && @assignees == []}>
    {empty_message(@query)}
  </:empty>
</.combobox>
```

```elixir
def handle_event("search-assignees", %{"query" => query}, socket) do
  assignees = Directory.search_people(query)

  {:noreply,
   assign(socket,
     query: query,
     loading: false,
     assignees: assignees
   )}
end

defp combobox_status(_query, true, _assignees), do: "Loading results"
defp combobox_status("", false, []), do: ""
defp combobox_status(query, false, []), do: ~s(No remote users found for "#{query}".)
defp combobox_status(_query, false, [_]), do: "1 result available"
defp combobox_status(_query, false, assignees), do: "#{length(assignees)} results available"

defp empty_message(""), do: "Type at least two characters to search remote users."
defp empty_message(query), do: ~s(No remote users found for "#{query}".)
```

## Accessibility Notes

- The search input keeps `role="combobox"` and controls the listbox with `aria-controls`.
- Results use stable option IDs and `aria-activedescendant` while keyboard focus stays on the search input.
- `loading={true}` sets `aria-busy="true"` on the listbox and announces `"Loading results"`.
- `status={...}` lets server-filtered results announce accurate result or empty text after LiveView patches.
