# Theme Token Recipes

ExoUI ships a default theme, but the contract is token-first. Consumers should
override `--exo-*` custom properties instead of forking component CSS.

## Brand Override

```css
:root {
  --exo-primary: oklch(62% 0.18 155);
  --exo-primary-foreground: oklch(99% 0 0);
  --exo-ring: oklch(62% 0.18 155 / 55%);
  --exo-radius: 0.375rem;
}
```

## State Tokens

Keep semantic state tokens separate from brand tokens so destructive, warning,
success, and focus states remain recognizable across components.

```css
:root {
  --exo-success: oklch(60% 0.16 150);
  --exo-warning: oklch(76% 0.16 75);
  --exo-danger: oklch(58% 0.2 28);
  --exo-destructive: var(--exo-danger);
  --exo-rating-active: var(--exo-warning);
}
```

## Dark Mode

Dark mode can be scoped to the full app or one preview container.

```css
:root[data-theme="dark"],
.exo-dark {
  --exo-background: oklch(16% 0.02 255);
  --exo-foreground: oklch(96% 0.01 255);
  --exo-card: oklch(20% 0.02 255);
  --exo-border: oklch(32% 0.02 255);
}
```

## Practical Rules

- Override tokens in application CSS after importing `exo.css` or
  `exo.tokens.css`.
- Use semantic tokens in custom wrappers: `var(--exo-border)`,
  `var(--exo-muted)`, `var(--exo-danger)`, `var(--exo-ring)`.
- Avoid component-local hardcoded colors. Browser tests already guard several
  overlay/menu/backdrop styles against this regression.
- Keep radius overrides conservative. Most components assume compact controls,
  not large pill-shaped surfaces.
