# infra/dokploy — Dokploy applications of this repository

`applications.json` mirrors the build columns of this repository's applications on the fleet
Dokploy (`deploy.krafter.dev`, ssh alias `dokploy`). Build columns only, never `env`, never
credentials. The pattern is raport's (RAP-96) and struka's (STR-122); KRF-449 brought it here.

## Why it exists

Dokploy deploys a push only when one of its changed files matches the application's
`watchPaths`, and it decides with `micromatch(files, watchPaths)` and **default options**
(micromatch 4.0.8, Dokploy v0.30.x). Two consequences that went unnoticed for months:

- `dir/**` does not match dot files or dot directories. A change to `.vitepress/`,
  `.storybook/`, `public/.well-known/` or `.dockerignore` deployed nothing. A directory is
  therefore always written `dir/{**,**/.*,**/.*/**}`.
- A file the Dockerfile reads but no watch path covers never deploys. The usual one is the
  root `package.json` and lock file: an advisory bump of `bun.lock`/`pnpm-lock.yaml` merged
  green and production kept the old dependencies (vremeulova #156, KRF-554).

The rule: `watchPaths` ⊇ every file the Dockerfile reads (COPY/ADD sources of the stages the
built stage reaches, after `.dockerignore`) + the Dockerfile + `.dockerignore`.

## Changing a watch path or a Dockerfile

1. A Dockerfile that starts reading a new file or directory needs it in `watchPaths`. Edit
   `applications.json` in the same PR.
2. After the merge, write the same `watchPaths` to Dokploy: Dokploy MCP `application-update`
   (`applicationId` + `watchPaths`) or the UI (Application → General → Watch Paths). CI has no
   Dokploy access and must not get it.
3. `scripts/dokploy-mirror-diff.sh` must report that the mirror matches. An empty diff is the
   only proof. The script reads the Dokploy Postgres over ssh (build columns only, filtered to
   this repository), so a new application without a mirror entry shows up as drift, and it
   refuses a `**` watch path that is not in the dot-aware form.

## Proof that a path deploys

A push that changes only that path must produce a deployment of the application
(`deployment.all` for its `applicationId`, or the queue collector on the box:
`sudo /opt/dokploy-queue-watch/watch.py summary 1`).
