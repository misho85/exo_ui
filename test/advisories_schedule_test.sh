#!/usr/bin/env bash
# The advisory check also runs on a schedule, in its own workflow (KRF-722; the fleet's
# shape from spojka SPO-166, KRF-521 and krafter_ui KRF-619). `.woodpecker/advisories.yaml`
# runs `mix hex.audit` over the library's and the storybook's `mix.lock` on the Woodpecker
# cron `advisories` and checks in with a Kuma push monitor after every run, so a lapse is
# an alarm, not silence.
#
# Each check holds one way that would quietly stop being true:
#   * the workflow runs on some other event, or on any cron — it would then run on a PR,
#     where its cron-only secret does not exist;
#   * another workflow accepts every cron, and the `advisories` cron starts it too;
#   * `ci.yaml` accepts `event: cron`, and the whole pipeline runs every scheduled night;
#   * an audit is dropped from the schedule, or one lock stops being read;
#   * the heartbeat stops running after a red audit (it would report only clean nights)
#     or stops reading its secret;
#   * the toolchain drifts from the one `ci.yaml` audits with.
#
# Read as text — the library has no YAML parser, and nothing here needs Woodpecker or a
# network. The workflows are written in one shape (two-space indent, `- name:` steps), and
# each extractor fails loudly when it finds nothing, so a reshaped file is a failure, not
# a pass.
set -uo pipefail

repo="$(cd "$(dirname "$0")/.." && pwd)"
schedule="$repo/.woodpecker/advisories.yaml"
ci="$repo/.woodpecker/ci.yaml"

failures=0
pass() { echo "ok - $1"; }
fail() { echo "not ok - $1" >&2; failures=$((failures + 1)); }

# The top-level `when:` block of a workflow, without the `when:` line.
when_block() { awk '/^when:/ { on = 1; next } on && /^#/ { next } on && /^[^ ]/ { exit } on && NF' "$1"; }
# One step, from its `- name:` line to the next step or the end of `steps:`.
step() {
  awk -v n="$2" '
    $0 ~ "^  - name: " n "$" { on = 1; print; next }
    on && (/^  - name: / || /^[^ #]/) { exit }
    on' "$1"
}
images() { sed -n 's/^ *image: *//p' "$1" | sort -u; }

# 1. Only the `advisories` cron.
want=$'  - event: cron\n    cron: advisories'
[[ "$(when_block "$schedule")" == "$want" ]] &&
  pass "advisories.yaml runs on the \`advisories\` cron and on nothing else" ||
  fail "advisories.yaml \`when\` is not exactly [{event: cron, cron: advisories}]:
$(when_block "$schedule")"

# 2. ci.yaml has events, and `cron` is not one of them.
ci_when="$(when_block "$ci")"
if ! grep -q 'event:' <<<"$ci_when"; then
  fail "ci.yaml has no \`event\` filter — is the path right?"
elif grep -Eq 'event:.*\bcron\b' <<<"$ci_when"; then
  fail "ci.yaml runs on a cron"
else
  pass "ci.yaml does not run on a schedule"
fi

# 3. Every other workflow either takes no cron or names its own. A cron filter without a
#    name takes every cron of the repository, `advisories` included.
others=0
for f in "$repo"/.woodpecker/*.yaml "$repo"/.woodpecker/*.yml; do
  [[ -f "$f" && "$f" != "$schedule" ]] || continue
  others=$((others + 1))
  name="${f#"$repo"/}"
  block="$(when_block "$f")"
  if [[ -z "$block" ]]; then
    fail "$name has no \`when\`, so nothing keeps it off a cron"
    continue
  fi
  # One filter per list item; an item taking `cron` must carry `cron: <other name>`.
  bad="$(awk '
    /^  - / { if (item != "") check(); item = $0; next }
    { item = item "\n" $0 }
    END { if (item != "") check() }
    function check() {
      if (item ~ /event:[^\n]*(^|[^a-z_])cron([^a-z_]|$)/ &&
          (item !~ /(^|\n) *(- )?cron: *[a-z0-9_-]/ || item ~ /cron: *advisories/)) print item
    }' <<<"$block")"
  [[ -z "$bad" ]] && pass "$name stays off the \`advisories\` cron" ||
    fail "$name runs on the \`advisories\` cron (a cron filter without a name takes every cron):
$bad"
done
[[ "$others" -gt 0 ]] || fail "no workflow besides advisories.yaml — is the path right?"

# 4. Both audits, each with its verdict: the library's lock from the root, the
#    storybook's from `storybook/` (the deployed app).
[[ "$(grep -Ec '^ *if mix hex\.audit; then$' "$schedule")" -eq 2 ]] &&
  grep -Eq '^ *echo clean > \.advisories/library$' "$schedule" &&
  grep -Eq '^ *cd storybook$' "$schedule" &&
  grep -Eq '^ *echo clean > \.\./\.advisories/storybook$' "$schedule" &&
  pass "advisories.yaml runs \`mix hex.audit\` over both locks" ||
  fail "advisories.yaml does not run \`mix hex.audit\` over the library and the storybook"

# 5. The heartbeat runs after a red audit and reads the cron-only secret.
hb="$(step "$schedule" heartbeat)"
if [[ -z "$hb" ]]; then
  fail "advisories.yaml has no step \`heartbeat\`"
else
  grep -Eq '^ *- status: \[success, failure\]$' <<<"$hb" &&
    pass "\`heartbeat\` runs after a red audit" ||
    fail "\`heartbeat\` would be skipped after a red audit"
  tr '\n' ' ' <<<"$hb" | grep -Eq 'HEARTBEAT_URL: +from_secret: advisories_heartbeat_url ' &&
    grep -Fq -- '--data-urlencode "status=$$STATUS"' <<<"$hb" &&
    pass "\`heartbeat\` reports to the push URL from \`advisories_heartbeat_url\`" ||
    fail "\`heartbeat\` does not report the status to \`advisories_heartbeat_url\`"
fi

# 6. Same toolchain as ci.yaml.
ci_images="$(images "$ci")"
while IFS= read -r image; do
  [[ -n "$image" ]] || continue
  grep -qxF "$image" <<<"$ci_images" &&
    pass "$image is a ci.yaml image" ||
    fail "advisories.yaml runs $image, which no ci.yaml step uses"
done <<<"$(images "$schedule")"

[[ "$failures" -eq 0 ]] || { echo "$failures failure(s)" >&2; exit 1; }
