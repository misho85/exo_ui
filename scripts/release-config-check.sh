#!/bin/sh
# release-config-check.sh — boots the BUILT storybook release through
# `storybook/config/runtime.exs` in the shape Dokploy deploys (KRF-611; fleet
# pattern KRF-221, reference pogon KRF-307).
#
#   scripts/release-config-check.sh [release-root]
#   # default: storybook/_build/prod/rel/exo_ui_storybook
#
# `mix release` never executes `runtime.exs`: the release reads it at boot, so a
# green build says nothing about the one file that decides whether production
# comes up (`PHX_HOST` raise, `fetch_env!("SECRET_KEY_BASE")`,
# `String.to_integer(PORT)`). Until KRF-611 that code first ran in the new
# container on the box, after the merge to `main`.
#
# `bin/exo_ui_storybook eval` runs the release's config providers, `runtime.exs`
# included, without starting any application.
#
# The env has two layers, as in production, and neither is copied here:
#   image    the `ENV` lines of the Dockerfile's runtime stage (everything after
#            the LAST `FROM`), read from the Dockerfile itself;
#   Dokploy  the literal profile below. This repo has no env contract
#            (`infra/secrets/prod.sops.yaml.example`): `runtime.exs` reads three
#            keys and none of them is a secret that needs escrow. The profile is
#            the contract, and the per-key loop measures which of its keys a boot
#            requires instead of listing them. `PHX_HOST` and the port are the
#            Dokploy domain of `exo-ui-storybook` (host exo-ui.krafter.dev,
#            container port 4000); `SECRET_KEY_BASE` is a fake of the real shape.
#
# Boots:
#   production       the profile as it is.
#   other-host-port  another host and port. Two passing boots that print
#                    different values, and the compile-time defaults (host
#                    `localhost`, no port) are neither, so a release that never
#                    read `runtime.exs` cannot pass both.
#   without-<KEY>    production without one key, for every key of the profile. A
#                    refused boot must NAME that key: a failure for an unrelated
#                    reason would otherwise pass as the refusal. Without `PORT`
#                    the boot must come up on the default port 4000.
#   bad-PORT         a non-integer `PORT` must be refused, on its own message.
#
# Exit: 0 every boot as expected · 1 any boot not, or no release.
set -eu

root=$(cd "$(dirname "$0")/.." && pwd)
dockerfile="$root/Dockerfile"
rel="${1:-$root/storybook/_build/prod/rel/exo_ui_storybook}"
bin="$rel/bin/exo_ui_storybook"

[ -x "$bin" ] || { echo "release-config-check: $bin is not an executable release" >&2; exit 1; }

# Image layer: everything after the LAST `FROM` (runtime stage), `ENV K=v [K=v …]`
# lines, quotes dropped as Docker drops them (`ENV MIX_ENV="prod"`).
image_env=$(awk '/^FROM /{env=""} /^ENV /{for(i=2;i<=NF;i++){gsub(/"/, "", $i); env=env $i "\n"}} END{printf "%s", env}' "$dockerfile")
if printf '%s\n' "$image_env" | grep -v '^$' | grep -qv '='; then
  echo "release-config-check: ENV without \`=\` in the runtime stage of $dockerfile, a shape this script does not read" >&2
  exit 1
fi
[ -n "$image_env" ] || { echo "release-config-check: no ENV in the runtime stage of $dockerfile" >&2; exit 1; }

# Dokploy layer. 64 random bytes in base64, the shape `mix phx.gen.secret` gives.
production="PHX_HOST=exo-ui.krafter.dev
PORT=4000
SECRET_KEY_BASE=$(head -c 64 /dev/urandom | base64 | tr -d '\n')"

keys=$(printf '%s\n' "$production" | cut -d= -f1)
# A check that lost the profile would be green without checking anything.
[ "$(printf '%s\n' "$keys" | grep -c .)" -ge 3 ] ||
  { echo "release-config-check: the profile has fewer than 3 keys" >&2; exit 1; }

# What `runtime.exs` DERIVED, so a pass also proves the file was read. The
# compile-time config has host `localhost`, no `http` port and no h2 option.
expr='endpoint = Application.fetch_env!(:exo_ui_storybook, ExoUI.Storybook.Web.Endpoint)
IO.puts(Enum.join([
  endpoint[:url][:host],
  inspect(endpoint[:http][:port]),
  "h2=" <> inspect(get_in(endpoint, [:http, :http_2_options, :enabled]))
], " "))'

# `env -i`: nothing from the caller's environment (the CI job's MIX_ENV, someone's
# .env) may leak in and let a profile pass by accident. Arguments are built line
# by line, so no value is split on spaces.
boot() { # $1: Dokploy layer, KEY=value per line
  profile=$1
  set --
  while IFS= read -r kv; do
    [ -n "$kv" ] && set -- "$@" "$kv"
  done <<EOF
$image_env
$profile
EOF
  env -i PATH="$PATH" HOME="${HOME:-/tmp}" "$@" "$bin" eval "$expr" 2>&1
}

without() { printf '%s\n' "$production" | grep -v "^$1="; }

failures=0
fail() {
  echo "FAIL  $1" >&2
  [ -n "${2:-}" ] && printf '%s\n' "$2" | tail -n 25 >&2
  failures=$((failures + 1))
}

expect_ok() { # name, line runtime.exs must derive, profile
  if out=$(boot "$3") && printf '%s\n' "$out" | grep -qxF "$2"; then
    echo "ok    $1: $2"
  else
    fail "$1: runtime.exs did not derive \"$2\"" "$out"
  fi
}

# $2 is part of the expected message, not just "it failed": a boot that fails
# for an unrelated reason would otherwise pass as a correct refusal.
expect_refused() { # name, part of the message, profile
  if out=$(boot "$3"); then
    fail "$1: the release booted, runtime.exs did not refuse it"
  elif printf '%s\n' "$out" | grep -qF "$2"; then
    echo "ok    $1: refused on \"$2\""
  else
    fail "$1: failed, but not on \"$2\"" "$out"
  fi
}

expect_ok production "exo-ui.krafter.dev 4000 h2=false" "$production"
expect_ok other-host-port "storybook.invalid 4101 h2=false" \
  "$(without PHX_HOST | grep -v '^PORT=')
PHX_HOST=storybook.invalid
PORT=4101"

required=""
for key in $keys; do
  if out=$(boot "$(without "$key")"); then
    continue
  fi
  required="$required $key"
  printf '%s\n' "$out" | grep -qF "$key" ||
    fail "without-$key: the release refused to boot, but not naming $key" "$out"
done
echo "ok    required for boot:$required"

expect_ok without-PORT "exo-ui.krafter.dev 4000 h2=false" "$(without PORT)"
expect_refused bad-PORT "not a textual representation of an integer" \
  "$(without PORT)
PORT=http"

if [ "$failures" -gt 0 ]; then
  echo "release-config-check: $failures failure(s)" >&2
  exit 1
fi
echo "release-config-check: runtime.exs boots in every shape that is deployed"
