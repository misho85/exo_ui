const fs = require('node:fs');
const path = require('node:path');

// Mount the production hook on focused DOM fixtures to cover lifecycle and
// nested-widget behavior without duplicating entire Storybook recipes.
async function mountHook(page, name, file, selector) {
  const source = fs.readFileSync(path.join(__dirname, '../../../assets/js/hooks', file), 'utf8');
  await page.evaluate(async ({ name, source, selector }) => {
    const url = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
    try {
      const module = await import(url);
      const hook = { ...module[name], el: document.querySelector(selector) };
      window.testHooks ||= {};
      window.testHooks[selector] = hook;
      hook.mounted();
    } finally {
      URL.revokeObjectURL(url);
    }
  }, { name, source, selector });
}

async function fixture(page, html) {
  await page.setContent(html);
  await page.addStyleTag({ path: path.join(__dirname, '../../../priv/static/exo.css') });
}

module.exports = { mountHook, fixture };
