#!/usr/bin/env bash
#
# dokploy-mirror-diff.sh — compare infra/dokploy/applications.json with the
# application rows the fleet Dokploy actually holds for this repository (KRF-449).
#
# Struka's script (STR-122, itself raport's from RAP-96): the fleet box (ssh alias
# `dokploy`, deploy.krafter.dev) holds every project, so the rows are filtered to
# this repository, and a live application with no mirror entry shows up as drift.
#
# It also refuses a watch path in the shape Dokploy silently misreads: Dokploy
# decides with `micromatch(files, watchPaths)` and default options, so `dir/**`
# never matches a dot file or dot directory (`.vitepress/`, `.storybook/`,
# `.well-known/`, `.dockerignore`). A directory is written `dir/{**,**/.*,**/.*/**}`.
#
# Reads ONLY build columns (no `env`, no credentials) from the Dokploy Postgres
# over ssh. Local only: CI holds no Dokploy access.
#
#   scripts/dokploy-mirror-diff.sh          # exit 0: identical, 1: drift or bad shape
#   DOKPLOY_SSH_HOST=<alias> scripts/dokploy-mirror-diff.sh
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

host="${DOKPLOY_SSH_HOST:-dokploy}"
mirror=infra/dokploy/applications.json
repo=$(basename -s .git "$(git remote get-url origin)")

# A `**` that is not the dot-aware directory form misses dot paths.
bad=$(jq -r '.applications[] | .name as $n | .watchPaths[]
  | select(test("\\*\\*") and (endswith("/{**,**/.*,**/.*/**}") | not)) | "\($n): \(.)"' "$mirror")
if [[ -n "$bad" ]]; then
  echo "dokploy-mirror-diff: watch paths that skip dot files — write dir/{**,**/.*,**/.*/**}:" >&2
  echo "$bad" >&2
  exit 1
fi

# Column list = the mirror's field list; keep them in the same order.
sql=$(printf '%s\n' \
  "select coalesce(json_agg(row_to_json(t) order by t.name), '[]') from (" \
  '  select name, "appName", "sourceType", owner, repository, branch, "buildType",' \
  '         "buildPath", dockerfile, "dockerContextPath", "dockerBuildStage",' \
  '         "autoDeploy", "triggerType", "watchPaths"' \
  "  from application where owner = 'misho85' and repository = '$repo') t;")

live=$(ssh "$host" 'docker exec -i "$(docker ps -q -f name=dokploy-postgres)" psql -U dokploy -d dokploy -At' <<<"$sql")

if diff -u <(jq -S '.applications | sort_by(.name)' "$mirror") <(jq -S . <<<"$live") \
  --label "$mirror" --label "dokploy@$host"; then
  echo "dokploy-mirror-diff: $mirror matches dokploy@$host"
else
  echo "dokploy-mirror-diff: DRIFT — update Dokploy or the mirror (infra/dokploy/README.md)" >&2
  exit 1
fi
