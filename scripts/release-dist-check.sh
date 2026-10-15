#!/bin/sh
# release-dist-check.sh — boots the BUILT storybook release and fails when epmd or
# Erlang distribution listens outside loopback (KRF-493, KRF-509; CI step KRF-611,
# reference pogon `scripts/release-dist-check.sh`).
#
#   scripts/release-dist-check.sh [release-root]
#   # default: storybook/_build/prod/rel/exo_ui_storybook
#
# Without `storybook/rel/` the release listens on `0.0.0.0:4369` (epmd) and on
# `0.0.0.0:<port>` (distribution), and the container is on `dokploy-network` with
# the containers of every project on the box. The pattern and its reasons are in
# `storybook/rel/env.sh.eex`. `release_distribution_test.exs` holds the TEXT of
# those files; this script checks what the release REALLY does: three files, two
# commands (`start` reads `vm.args`, `rpc`/`remote` read `remote.vm.args`) and an
# epmd that inherits the environment.
#
# The boot is `start_clean` in `interactive` mode: the VM comes up with
# distribution from `env.sh` and `vm.args`, without the `exo_ui_storybook`
# application. `RELEASE_SYS_CONFIG` points at an empty `sys.config`, so the config
# provider does not run `runtime.exs` on this boot either (measured on pogon's
# release, where a missing env var then took the VM down after the first `rpc`).
# `release-config-check.sh` judges `runtime.exs`; distribution does not depend on
# it. The `ENV` layer of the Dockerfile's runtime stage goes into the boot as in
# `release-config-check.sh`, so an `ENV` that puts the listeners back cannot pass.
#
# Checks:
#   1. nothing listens on 4369 BEFORE the boot (someone else's epmd would judge);
#   2. `bin/exo_ui_storybook rpc` answers, and the node name is
#      `exo_ui_storybook-<hostname>@127.0.0.1` (`storybook/rel/env.sh.eex`);
#   3. every listener of epmd, the node and the `rpc` client (sockets from
#      `/proc/<pid>/fd`) is on 127.0.0.0/8 or ::1, and epmd holds 4369.
#
# Linux only (`/proc/net/tcp`): the CI job `release`, or locally in its image:
#   docker run --rm -v "$PWD:/w" -w /w <image of the release job> scripts/release-dist-check.sh
#
# Exit: 0 everything on loopback · 1 anything else.
set -eu

root=$(cd "$(dirname "$0")/.." && pwd)
dockerfile="$root/Dockerfile"
rel="${1:-$root/storybook/_build/prod/rel/exo_ui_storybook}"
bin="$rel/bin/exo_ui_storybook"

die() { echo "release-dist-check: $*" >&2; exit 1; }

[ -x "$bin" ] || die "$bin is not an executable release"
[ -r /proc/net/tcp ] || die "needs Linux (/proc/net/tcp), run it in the image of the release job"

# Listeners of the network namespace: `inode address-hex port-hex`, state 0A = LISTEN.
listeners() {
  awk 'FNR > 1 && $4 == "0A" { split($2, a, ":"); print $10, a[1], a[2] }' /proc/net/tcp /proc/net/tcp6
}

# /proc writes IPv4 as one 32-bit number in little-endian order, IPv6 as four
# of them. Loopback: 127.0.0.0/8, ::1 and ::ffff:127.x.x.x.
loopback() {
  case $1 in
    ??????7F | 00000000000000000000000001000000 | 0000000000000000FFFF0000??????7F) return 0 ;;
    *) return 1 ;;
  esac
}

readable() { # address-hex port-hex -> a.b.c.d:port, [::]:port, [::1]:port or [v6-hex]:port
  port=$((0x$2))
  case $1 in
    ????????) echo "$((0x${1#??????})).$((0x$(echo "$1" | cut -c5-6))).$((0x$(echo "$1" | cut -c3-4))).$((0x$(echo "$1" | cut -c1-2))):$port" ;;
    00000000000000000000000000000000) echo "[::]:$port" ;;
    00000000000000000000000001000000) echo "[::1]:$port" ;;
    *) echo "[$1]:$port" ;;
  esac
}

# Listeners held by the given processes: `address-hex port-hex` per line. A
# socket belongs to a process through its inode in `/proc/<pid>/fd`, so another
# listener in the same namespace judges neither for nor against.
listening_of() { # pid…
  inodes=" $(for pid in "$@"; do
    for fd in /proc/"$pid"/fd/*; do
      link=$(readlink "$fd" 2>/dev/null) || continue
      case $link in socket:\[*\]) inode=${link#socket:[}; echo "${inode%]}" ;; esac
    done
  done | tr '\n' ' ') "
  listeners | while read -r inode addr port; do
    case $inodes in *" $inode "*) echo "$addr $port" ;; esac
  done
}

busy=$(listeners | awk '$3 == "1111" { print $2 }')
[ -z "$busy" ] || die "something already listens on 4369, an epmd outside the release would judge instead of it"

# Image layer: everything after the LAST `FROM` (runtime stage), `ENV K=v [K=v …]` lines.
image_env=$(awk '/^FROM /{env=""} /^ENV /{for(i=2;i<=NF;i++){gsub(/"/, "", $i); env=env $i "\n"}} END{printf "%s", env}' "$dockerfile")

# `env -i`: nothing from the caller's environment, only the image layer.
# Arguments are built line by line, so no value is split on spaces. Plain
# commands, no function: `$!` of the background `rpc` must be the process itself
# (the exec chain ends in the BEAM).
tmp=$(mktemp -d)
echo '[].' >"$tmp/sys.config"

set --
while IFS= read -r kv; do
  [ -n "$kv" ] && set -- "$@" "$kv"
done <<EOF
$image_env
RELEASE_BOOT_SCRIPT=start_clean
RELEASE_MODE=interactive
RELEASE_SYS_CONFIG=$tmp/sys
EOF

cleanup() {
  env -i PATH="$PATH" HOME="${HOME:-/tmp}" "$@" "$bin" stop >/dev/null 2>&1 || true
  sleep 1
  for epmd_bin in "$rel"/erts-*/bin/epmd; do
    "$epmd_bin" -kill >/dev/null 2>&1 || true
  done
  rm -rf "$tmp"
}
trap 'cleanup "$@"' EXIT

env -i PATH="$PATH" HOME="${HOME:-/tmp}" "$@" "$bin" daemon

node=""
tries=0
while [ -z "$node" ] && [ $tries -lt 60 ]; do
  node=$(env -i PATH="$PATH" HOME="${HOME:-/tmp}" "$@" "$bin" rpc 'IO.puts(node())' 2>/dev/null) || node=""
  [ -n "$node" ] || sleep 0.5
  tries=$((tries + 1))
done
[ -n "$node" ] || die "bin/exo_ui_storybook rpc did not answer within 30 s"

case $node in
  exo_ui_storybook-*@127.0.0.1) echo "ok    rpc answers, node $node" ;;
  *) die "the node is $node, and must be exo_ui_storybook-<hostname>@127.0.0.1 (storybook/rel/env.sh.eex)" ;;
esac

beam=$(env -i PATH="$PATH" HOME="${HOME:-/tmp}" "$@" "$bin" rpc 'IO.puts(System.pid())')
epmd=""
for comm in /proc/[0-9]*/comm; do
  if [ "$(cat "$comm" 2>/dev/null)" = epmd ]; then
    pid=${comm#/proc/}
    epmd="$epmd ${pid%/comm}"
  fi
done
[ -n "$epmd" ] || die "epmd is not running after the boot, the release did not start distribution"

# The `rpc` client is a node of its own that listens while the call lasts, with
# its own `remote.vm.args`. It is caught mid-call: the exec chain
# (`bin/exo_ui_storybook` -> `elixir` -> `erl` -> `erlexec`) ends in the BEAM
# under the same pid.
env -i PATH="$PATH" HOME="${HOME:-/tmp}" "$@" "$bin" rpc 'Process.sleep(8_000)' >/dev/null 2>&1 &
client=$!
tries=0
until [ "$(cat /proc/$client/comm 2>/dev/null)" = beam.smp ] && [ -n "$(listening_of $client)" ]; do
  tries=$((tries + 1))
  [ $tries -lt 40 ] || die "the rpc client (pid $client) did not start distribution within 10 s"
  sleep 0.25
done

failures=0
judge() { # name pid… — every listener of the given processes must be on loopback
  who=$1
  shift
  own=$(listening_of "$@")
  if [ -z "$own" ]; then
    echo "FAIL  $who (pid $*) listens nowhere" >&2
    failures=$((failures + 1))
    return
  fi
  while read -r addr port; do
    if loopback "$addr"; then
      echo "ok    $who listens on $(readable "$addr" "$port")"
    else
      echo "FAIL  $who listens on $(readable "$addr" "$port"), outside loopback" >&2
      failures=$((failures + 1))
    fi
  done <<EOF
$own
EOF
}

# shellcheck disable=SC2086 # epmd may be several pids
judge epmd $epmd
# shellcheck disable=SC2086
if ! listening_of $epmd | grep -q ' 1111$'; then
  echo "FAIL  epmd does not hold 4369" >&2
  failures=$((failures + 1))
fi
judge node "$beam"
judge "rpc client" "$client"

[ "$failures" -eq 0 ] || die "$failures listener(s) outside loopback or without a port"
wait "$client" 2>/dev/null || true
echo "release-dist-check: epmd, the node and the rpc client listen on loopback only"
