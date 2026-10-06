// The keyboard focus indicator of the focused menu item, measured against the
// menu it sits on and against an item without focus (WCAG 1.4.11: 3:1 for the
// visual information that identifies a state). The colours are oklch(), so a
// canvas turns them into sRGB. `menu` is the selector of the surface the items
// are drawn on, and `theme` goes on its parent: the story sandbox carries
// .exo-default, which sets the light tokens again under the story root.
async function focusedMenuItem(page, { menu, theme }) {
  return page.evaluate(
    ({ menu, theme }) => {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const context = canvas.getContext("2d", { colorSpace: "srgb", willReadFrequently: true });

      const rgb = (css, under) => {
        context.clearRect(0, 0, 1, 1);

        if (under) {
          context.fillStyle = `rgb(${under.join(",")})`;
          context.fillRect(0, 0, 1, 1);
        }

        context.fillStyle = css;
        context.fillRect(0, 0, 1, 1);
        return [...context.getImageData(0, 0, 1, 1).data].slice(0, 3);
      };

      const luminance = (channels) =>
        channels
          .map((value) => {
            const v = value / 255;
            return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
          })
          .reduce((sum, v, index) => sum + v * [0.2126, 0.7152, 0.0722][index], 0);

      const ratio = (a, b) => {
        const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
        return Math.round(((high + 0.05) / (low + 0.05)) * 100) / 100;
      };

      const item = document.activeElement;
      const surface = item.closest(menu);
      const wrapper = surface.parentElement;

      if (theme) wrapper.setAttribute("data-theme", theme);
      else wrapper.removeAttribute("data-theme");

      // The item and the menu fade their background; a colour read during the
      // transition is the old one.
      for (const animation of surface.getAnimations({ subtree: true })) {
        try {
          animation.finish();
        } catch (_error) {
          // An infinite animation cannot finish and has no bearing here.
        }
      }

      const items = [...surface.querySelectorAll('[role^="menuitem"]')];
      const idleItem = items.find(
        (el) => el !== item && !el.matches(":hover") && !el.hasAttribute("data-variant")
      );

      const style = getComputedStyle(item);
      const menuColor = rgb(getComputedStyle(surface).backgroundColor);
      const fill = rgb(style.backgroundColor, menuColor);
      const idle = rgb(getComputedStyle(idleItem).backgroundColor, menuColor);
      const ring = rgb(style.outlineColor, fill);

      return {
        name: item.textContent.trim().replace(/\s+/g, " "),
        card: getComputedStyle(surface).getPropertyValue("--exo-card").trim(),
        focusVisible: item.matches(":focus-visible"),
        outlineStyle: style.outlineStyle,
        outlineWidth: Number.parseFloat(style.outlineWidth),
        outlineOffset: Number.parseFloat(style.outlineOffset),
        fillOnMenu: ratio(fill, menuColor),
        ringOnMenu: ratio(ring, menuColor),
        ringOnFill: ratio(ring, fill),
        ringOnIdle: ratio(ring, idle)
      };
    },
    { menu, theme }
  );
}

module.exports = { focusedMenuItem };
