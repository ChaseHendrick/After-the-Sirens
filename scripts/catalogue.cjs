'use strict';
const fs = require('node:fs');
const path = require('node:path');
global.window = {};
require('../src/catalog.js');
const C = window.Sirens.Catalog, items = Object.values(C.items);
const cell = value => String(value).replace(/\|/g, '\\|').replace(/[\r\n]/g, ' ');
const compare = (a, b) => a < b ? -1 : a > b ? 1 : 0;
const recipesByItem = new Map();
for (const recipe of C.recipes) for (const id of Object.keys(recipe.result)) {
  if (!recipesByItem.has(id)) recipesByItem.set(id, []);
  recipesByItem.get(id).push(recipe);
}
const lines = [
  '# After the Sirens item catalogue', '',
  `Version 0.5 contains **${items.length.toLocaleString('en-US')} original item definitions**, **${C.recipes.length.toLocaleString('en-US')} crafting and salvage recipes**, and **${Object.keys(C.loot).length} loot tables**.`, '',
  'The catalogue combines 219 original supplies with 3,236 curated material, design and preparation entries. Materials change equipment costs, weight and handling; designs change reach, protection or carrying capacity; food preparations change nutrition, hydration and recovery. These are original game records, not imported items from another game.', '',
  'Press **I → Item catalogue** to search IDs, names and materials, filter family or tier, and browse 48 entries per page. Obtain details link directly to their crafting paths. Crafting lists 24 recipes per page and explains exact ingredients, kept tools, campfires and pack space. [The item guide](docs/ITEMS.md) explains the families and a complete metal-to-axe path.', '',
  'All definitions can be obtained through actual loot or a recipe whose inputs and tools are obtainable. Advanced assemblies are usually craft-only. Extension loot receives at most 12% of a table\'s original total weight, giving added pools at most a 10.7% draw chance while keeping the original rows. Saves retain older item IDs.', '',
  '## Functional data', '',
  `- ${items.filter(item => item.effect).length.toLocaleString('en-US')} consumable records change needs, health, stamina, bleeding or infection.`,
  `- ${items.filter(item => item.weapon).length.toLocaleString('en-US')} records have actual melee or ranged weapon statistics, including reusable field tools.`,
  `- ${items.filter(item => item.armor > 0).length.toLocaleString('en-US')} garments provide protection through the existing clothing slot.`,
  `- ${items.filter(item => item.capacity > 0).length.toLocaleString('en-US')} carrying designs add capacity through the existing backpack slot.`,
  '- Material tools substitute for compatible recipe and project tools, remain after crafting, and include actual mining and terrain damage bonuses.', '',
  'Ingredients are consumed, while required tools remain. Campfire recipes require a nearby fire. Crafting and equipment transactions respect carried weight and stack limits. Medical, food and weapon effects are game abstractions. Items use shared stacks and do not have individual durability, freshness or liquid volume.', '',
  'Clay, the route atlas, compass, binoculars, whistle and lamp collectibles retain their stated limitations. Electrical networks, separate equipped lights, body-region clothing, temperature and waterproofing are not implemented. Named equipment designs use their documented statistics.', '',
  '## Category totals', '', '| Category | Items |', '| --- | ---: |'
];
const categories = [...new Set(items.map(item => item.category))].sort(compare);
for (const category of categories) lines.push(`| ${cell(category)} | ${items.filter(item => item.category === category).length} |`);
for (const category of categories) {
  lines.push('', '## ' + category.charAt(0).toUpperCase() + category.slice(1), '', '| Stable ID | Item | Family | Tier | kg | Obtain |', '| --- | --- | --- | ---: | ---: | --- |');
  for (const item of items.filter(item => item.category === category).sort((a, b) => compare(a.name, b.name) || compare(a.id, b.id))) {
    const recipes = recipesByItem.get(item.id) || [];
    const source = (item.sources || []).length ? 'Loot: ' + item.sources.join(', ') : recipes.length ? 'Craft: ' + recipes[0].name + (recipes.length > 1 ? ` (+${recipes.length - 1} paths)` : '') : 'See description';
    lines.push('| ' + ['`' + item.id + '`', item.name, item.family, item.tier, item.weight.toFixed(2), source].map(cell).join(' | ') + ' |');
  }
}
lines.push('', 'Generated from `src/catalog.js` with `npm run catalogue`. The in-game reference reads the same frozen registry.', '');
const text = lines.join('\n'), output = path.join(__dirname, '../CATALOGUE.md');
if (process.argv.includes('--check')) {
  if (!fs.existsSync(output) || fs.readFileSync(output, 'utf8') !== text) throw new Error('CATALOGUE.md is stale; run npm run catalogue');
  console.log('PASS published catalogue matches all ' + items.length + ' item definitions and ' + C.recipes.length + ' recipes');
} else { fs.writeFileSync(output, text); console.log('Exported all ' + items.length + ' item definitions to CATALOGUE.md'); }
