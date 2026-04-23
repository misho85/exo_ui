# ExoUI Release Checklist

Use this checklist before cutting a public ExoUI tag.

## Version And Docs

- [ ] `mix.exs`, `package.json`, and any release tag name agree on the version
- [ ] `CHANGELOG.md` describes the current release scope
- [ ] `README.md` matches the shipped API and support policy
- [ ] generated assets committed to the repo match the source changes

## Verification

- [ ] `mix test`
- [ ] `mix compile --warnings-as-errors`
- [ ] `bun run build:all`
- [ ] `bun run test:browser`
- [ ] `cd storybook && mix compile --warnings-as-errors`

## Manual Sanity

- [ ] smoke-test Storybook for `popover`, `select`, `combobox`, `tooltip`, and `command_palette`
- [ ] verify any changed CSS sources are reflected in `priv/static/exo.css` and `priv/static/exo.tokens.css`
- [ ] if installer-related files changed, smoke-test `mix exo.install` against a standard Phoenix 1.8 app layout

## Release Commands

Typical command sequence:

```sh
mix test
mix compile --warnings-as-errors
bun run build:all
bun run test:browser
cd storybook && mix compile --warnings-as-errors
git tag -a vX.Y.Z -m "ExoUI vX.Y.Z"
git push origin main --tags
```

## Notes

- `v0.1.0-alpha` exists as a historical scaffold tag; do not treat it as the
  current release checklist baseline.
- ExoUI's documented browser baseline is modern evergreen browsers. If a
  release changes that contract, update the README support matrix in the same
  PR.
