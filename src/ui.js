(function () {
  'use strict';
  const Sirens = window.Sirens = window.Sirens || {};
  const clamp = (value, min, max) => Math.max(min, Math.min(max, Number(value) || 0));
  const number = (value) => Math.max(0, Number(value) || 0);
  const label = (value) => String(value || '').replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  const searchText = (value) => String(value || '').toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  const matchesSearch = (text, query) => !query || searchText(query).split(' ').every((term) => text.includes(term));
  const ITEM_PAGE_SIZE = 48, RECIPE_PAGE_SIZE = 24;
  let referenceIndex;

  function catalogueIndex() {
    const items = Sirens.Engine && Sirens.Engine.items || Sirens.Catalog && Sirens.Catalog.items || {};
    const recipes = Sirens.Engine && Sirens.Engine.recipes || Sirens.Catalog && Sirens.Catalog.recipes || [];
    if (referenceIndex && referenceIndex.items === items && referenceIndex.recipes === recipes) return referenceIndex;
    const names = (entries) => Object.keys(entries || {}).map((id) => `${id} ${items[id] && items[id].name || id}`).join(' ');
    const makers = Object.create(null), uses = Object.create(null), recipesById = Object.create(null), itemsById = Object.create(null);
    const recipeRows = recipes.map((recipe) => {
      const results = Object.keys(recipe.result || {}).map((id) => items[id]).filter(Boolean);
      const result = results.slice().sort((a, b) => number(b.tier) - number(a.tier))[0] || {};
      const record = Object.freeze({ recipe, family: result.family || result.category || 'materials', tier: number(result.tier), search: searchText(`${recipe.id} ${recipe.name} ${recipe.description || ''} ${result.family || ''} ${names(recipe.cost)} ${names(recipe.result)} ${(recipe.tools || []).map((id) => `${id} ${items[id] && items[id].name || id}`).join(' ')} ${recipe.station || ''}`) });
      recipesById[recipe.id] = record;
      for (const id of Object.keys(recipe.result || {})) (makers[id] || (makers[id] = [])).push(record);
      for (const id of new Set(Object.keys(recipe.cost || {}).concat(recipe.tools || []))) (uses[id] || (uses[id] = [])).push(record);
      return record;
    });
    const itemRows = Object.entries(items).map(([id, item]) => {
      const ingredients = (makers[id] || []).map(({ recipe }) => names(recipe.cost)).join(' ');
      const record = Object.freeze({ id, item, category: item.category || 'materials', family: item.family || item.category || 'materials', tier: number(item.tier), search: searchText(`${id} ${item.name} ${item.description || ''} ${item.category || ''} ${item.family || ''} ${item.rarity || ''} ${(item.tags || []).join(' ')} ${(item.toolTags || []).join(' ')} ${(item.sources || []).join(' ')} ${ingredients}`) });
      itemsById[id] = record;
      return record;
    });
    for (const table of [makers, uses]) { for (const id of Object.keys(table)) Object.freeze(table[id]); Object.freeze(table); }
    const byName = Object.freeze(itemRows.slice().sort((a, b) => a.item.name.localeCompare(b.item.name) || a.id.localeCompare(b.id)));
    const byWeight = Object.freeze(byName.slice().sort((a, b) => number(b.item.weight) - number(a.item.weight)));
    referenceIndex = Object.freeze({ items, recipes, byName, byWeight, recipesById: Object.freeze(recipesById), itemsById: Object.freeze(itemsById), recipeRows: Object.freeze(recipeRows), makers, uses });
    return referenceIndex;
  }
  const icon = '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 26V44M17 44h14M24 26l-7 18M24 26l7 18M15 17a13 13 0 0 1 18 0M9 11a22 22 0 0 1 30 0"/><circle cx="24" cy="22" r="4"/></svg>';
  // These small catalogue symbols are drawn here so menus look the same offline on every platform.
  const itemSymbols = Object.freeze({
    materials: '<path d="m12 3 8 5v8l-8 5-8-5V8l8-5Zm-8 5 8 5 8-5M12 13v8"/>',
    food: '<path d="M7 4h10v3H7zM6 7h12v13H6zM8 11h8M8 15h8"/>',
    drinks: '<path d="M9 3h6v4l3 4v10H6V11l3-4V3Zm-3 9h12M9 3h6"/>',
    medical: '<path d="M8 3h8v5h5v8h-5v5H8v-5H3V8h5V3Z"/>',
    tools: '<path d="m13 8 3-3 4 4-3 3M14 10 4 20l-2-2L12 8M9 3l6 1 6 6M5 17l2 2"/>',
    melee: '<path d="m5 18 2 2m-3-1 3 3M7 17 19 3l2 2-12 14-2-2Z"/>',
    firearms: '<path d="M3 8h16v4H9l-2 8H3l1-8H3V8Zm6 4v3h4v-3M19 9h2"/>',
    ammo: '<path d="M5 8V5l2-3 2 3v15H5V8Zm10 0V5l2-3 2 3v15h-4V8ZM5 15h4m6 0h4"/>',
    clothing: '<path d="m8 3 4 3 4-3 6 6-4 3-2-2v11H8V10l-2 2-4-3 6-6Z"/>',
    containers: '<path d="M7 6V3h10v3M6 6h12l2 4v11H4V10l2-4Zm-2 5h16M9 11v3h6v-3"/>',
    electronics: '<path d="M6 6h12v12H6zM9 9h6v6H9zM9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4"/>',
    books: '<path d="M5 3h14v18H5a2 2 0 0 1 0-4h14M5 3v14M8 7h7M8 11h7"/>',
    utility: '<path d="M6 3h12v18H6zM9 7h6M9 11h6M10 17h4"/>'
  });

  class UI {
    constructor(rootElement, callbacks) {
      if (!rootElement) throw new Error('The game UI needs a root element.');
      this.root = rootElement;
      this.callbacks = callbacks || {};
      this.screen = 'title';
      this.inventoryOpen = false;
      this.inventoryPane = 'owned';
      this.details = false;
      this.state = null;
      this.lastUpdate = 0;
      this.lastInventorySignature = '';
      this.lastLogSignature = '';
      this.lastFocus = null;
      this.sort = 'name';
      this.itemQuery = '';
      this.category = 'all';
      this.family = 'all';
      this.tier = 'all';
      this.itemPage = 0;
      this.itemPages = 1;
      this.itemView = 'owned';
      this.recipeQuery = '';
      this.recipeFamily = 'all';
      this.recipeTier = 'all';
      this.recipePage = 0;
      this.recipePages = 1;
      this.readyOnly = false;
      this.itemMatches = null;
      this.recipeMatches = null;
      this.recipeQuoteSignature = '';
      this.recipeQuotes = new Map();
      this.reference = catalogueIndex();
      this.sound = true;
      this.debug = false;
      this.toastTimer = null;
      this.destroyed = false;
      this.root.classList.add('as-ui');
      this.root.dataset.details = 'compact';
      this.root.innerHTML = `
        <div class="as-hud" data-ui="hud" hidden>
          <section class="as-status" aria-label="Survivor status">
            <div class="as-status-top"><span class="as-kicker">SURVIVOR</span><button class="as-details-button" data-command="details" aria-pressed="false" title="Show all needs and recent messages">Details +</button><button class="as-small-button" data-command="pause" title="Pause (Escape)" aria-label="Pause game">II</button></div>
            <div class="as-meters">
              ${this.meterMarkup('health', 'Health', 'as-health')}
              ${this.meterMarkup('stamina', 'Stamina', 'as-stamina')}
              ${this.meterMarkup('hunger', 'Hunger', 'as-need')}
              ${this.meterMarkup('thirst', 'Thirst', 'as-thirst')}
              ${this.meterMarkup('infection', 'Infection', 'as-infection')}
            </div>
            <div class="as-needs-summary" data-ui="needs-summary">Hunger 10 · Thirst 10</div>
            <div class="as-injury" data-ui="injury" hidden>BLEEDING <span>Use a bandage [3]</span></div>
          </section>
          <section class="as-objective" aria-label="Current objective">
            <div class="as-kicker" data-ui="objective-kicker">GET A SIGNAL OUT</div>
            <p data-ui="objective">Find 5 radio parts, then repair the relay.</p>
            <div class="as-parts"><span data-ui="parts">0 / 5 PARTS</span><span data-ui="direction">FOLLOW THE GOLD MARKER</span></div>
          </section>
          <div class="as-world-event" data-ui="world-event" hidden role="status" aria-live="polite"><span data-ui="world-event-label"></span><span data-ui="world-event-timer" aria-hidden="true"></span></div>
          <div class="as-time" data-ui="time">DAY 01 · 08:00</div>
          <div class="as-world-info" data-ui="world-info" hidden><span data-ui="region">MORROW</span><b data-ui="coordinates">0, 0</b><small data-ui="exploration">1 sector explored</small></div>
          <div class="as-floor-info" data-ui="floor-info" hidden><span data-ui="floor-label">GROUND LEVEL</span><div data-ui="stairs-actions" hidden><button data-action="stairsUp" title="Go upstairs (Page Up)">↑ Upstairs</button><button data-action="stairsDown" title="Go downstairs (Page Down)">↓ Downstairs</button></div></div>
          <div class="as-vehicle-info" data-ui="vehicle-info" hidden><span class="as-kicker">DRIVING</span><strong data-ui="vehicle-name">Vehicle</strong><div data-ui="vehicle-speed">0% speed</div><div data-ui="vehicle-fuel">Fuel</div><div data-ui="vehicle-condition">Condition</div><div class="as-vehicle-actions"><button data-action="vehicle" title="Leave the vehicle (V)">V Exit</button><button data-action="refuel" title="Refuel from your pack (G)">G Refuel</button></div></div>
          <div class="as-live-log" data-ui="logs" aria-live="polite" aria-atomic="false"></div>
          <div class="as-interact" data-ui="interact" hidden><kbd>E</kbd><span data-ui="interact-text">Interact</span></div>
          <div class="as-bottom">
            <div class="as-weapon"><span class="as-kicker">IN HAND</span><strong data-ui="weapon">BASEBALL BAT</strong><span data-ui="ammo">F to switch weapon</span></div>
            <div class="as-hotbar" aria-label="Quick actions">
              <button data-action="eat" title="Eat one food item (1)"><kbd>1</kbd><span>Eat</span><b data-count="food">0</b></button>
              <button data-action="drink" title="Drink one drink item (2)"><kbd>2</kbd><span>Drink</span><b data-count="water">0</b></button>
              <button data-action="bandage" title="Bandage your wounds (3)"><kbd>3</kbd><span>Bandage</span><b data-count="bandage">0</b></button>
              <button data-action="reload" title="Reload your pistol (4 or R)"><kbd>4</kbd><span>Reload</span><b data-count="ammo">0</b></button>
              <button class="as-pack-button" data-command="inventory" title="Inventory and crafting (I)"><kbd>I</kbd><span>Pack</span><b data-ui="pack-weight">0 kg</b></button>
              <button class="as-journal-button" data-command="journal" title="Skills, projects, people and field guide (J)"><kbd>J</kbd><span>Journal</span><b data-ui="insight-count">0</b></button>
            </div>
            <div class="as-controls-hint">WASD move <span>·</span> SPACE attack <span>·</span> SHIFT sprint</div>
          </div>
        </div>

        <div class="as-overlay as-title-overlay" data-screen="title">
          <section class="as-title-card" aria-labelledby="as-title">
            <div class="as-title-mark">${icon}<span>AN ORIGINAL SURVIVAL GAME</span></div>
            <p class="as-eyebrow">MORROW IS NOT YOUR HOME ANYMORE.</p>
            <h1 id="as-title">AFTER<br>THE <span>SIRENS</span></h1>
            <p class="as-title-copy" data-ui="title-copy">Leave your safe cabin. Follow the roads beyond Morrow.<br>Scavenge, craft, and make a place to survive.</p>
            <div class="as-title-rules" data-ui="title-rules"><span><b>6</b> regions</span><span><b data-ui="catalogue-count">160+</b> original items</span><span><b data-ui="recipe-count">30+</b> recipes</span></div>
            <div class="as-start-options">
              <label class="as-mode-field">Game mode<select data-ui="mode"><option value="openworld" selected>Open world: explore and settle</option><option value="rescue">Rescue: get a signal out</option></select></label>
              <label>Survival pressure<select data-ui="difficulty"><option value="calm">Calm: more breathing room</option><option value="standard" selected>Standard: stay alert</option><option value="hard">Hard: every mistake matters</option></select></label>
              <label>World seed<input data-ui="seed" type="number" value="20260929" min="0" max="2147483647" step="1" inputmode="numeric"></label>
            </div>
            <div class="as-menu-actions"><button class="as-primary" data-command="start">ENTER THE TOWN <span>→</span></button><button class="as-secondary" data-command="continue">CONTINUE SAVED RUN</button></div>
            <p class="as-start-note" data-ui="start-note">Your safe cabin has supplies. Roads connect the regions.<br>I opens your pack, item catalogue, and crafting.</p>
            <div class="as-prototype">Original early build · Open world and rescue modes · Procedural artwork</div>
          </section>
          <aside class="as-title-scene" aria-hidden="true"><div class="as-scene-coordinate">SECTOR 07 / RELAY 04</div><div class="as-scene-line"></div><p>KEEP THE LIGHT ON.<br>KEEP THE NOISE DOWN.</p><span class="as-scene-status">SIGNAL LOST</span></aside>
        </div>

        <div class="as-overlay" data-screen="paused" hidden>
          <section class="as-modal as-pause" role="dialog" aria-modal="true" aria-labelledby="as-pause-title">
            <div class="as-kicker">TAKE A BREATH</div><h2 id="as-pause-title">Run paused</h2><p class="as-muted">The town waits while you plan your next move.</p>
            <div class="as-pause-actions"><button class="as-primary" data-command="resume">BACK TO THE TOWN <span>→</span></button><button class="as-secondary" data-command="save">SAVE RUN</button></div>
            <div class="as-save-actions"><button data-command="exportSave">Export save</button><label class="as-file-label">Import save<input type="file" data-ui="import" accept=".json,application/json"></label><button data-command="restart">New run</button></div>
            <fieldset class="as-preferences"><legend>Game feel</legend><div class="as-setting-row"><label><input type="checkbox" data-setting="sound" checked> Game audio</label><label><input type="checkbox" data-setting="motion" checked> Ambient motion</label><button data-command="fullscreen" class="as-fullscreen-button">Toggle fullscreen</button></div><div class="as-slider-settings"><label for="as-volume">Overall volume <output data-ui="volume-value" for="as-volume">70%</output><input id="as-volume" type="range" data-setting="volume" min="0" max="100" step="5" value="70"></label><label for="as-zoom">Camera zoom <output data-ui="zoom-value" for="as-zoom">100%</output><input id="as-zoom" type="range" data-setting="zoom" min="70" max="150" step="10" value="100"></label></div><div class="as-audio-channels"><div class="as-section-heading">SOUND AND MUSIC</div>${this.audioPreferencesMarkup()}</div></fieldset><div class="as-setting-row as-debug-setting"><label><input type="checkbox" data-setting="debug"> Performance overlay</label></div>
            ${this.controlsMarkup()}
            <p class="as-save-note">Saves stay in this browser. Export a file to keep a copy.</p>
          </section>
        </div>

        <div class="as-overlay" data-ui="inventory-overlay" hidden>
          <section class="as-modal as-inventory" role="dialog" aria-modal="true" aria-labelledby="as-inventory-title">
            <header class="as-modal-header"><div><div class="as-kicker">PLAN BEFORE YOU MOVE</div><h2 id="as-inventory-title">Your pack</h2></div><button class="as-close" data-command="inventory" aria-label="Close inventory" title="Close inventory (I)">×</button></header>
            <div class="as-pack-summary"><span data-ui="inventory-weight">0 / 24 kg</span><span class="as-paused-note">SIMULATION PAUSED</span><label>Sort<select data-ui="sort"><option value="name">Name</option><option value="weight">Weight</option><option value="quantity">Quantity</option></select></label></div>
            <div class="as-equipment-summary" data-ui="equipment">Bat equipped</div>
            <div class="as-inventory-tabs" role="group" aria-label="Pack sections"><button data-command="owned" aria-pressed="true">Your pack</button><button data-command="crafting" aria-pressed="false">Crafting & building</button><button data-command="catalogue" aria-pressed="false">Item catalogue</button></div>
            <div class="as-inventory-grid"><section data-ui="items-pane" aria-label="Items in your pack or catalogue">
              <div class="as-filter-row"><input type="search" data-ui="item-search" placeholder="Search name, ID, family or material" aria-label="Search items"><select data-ui="category" aria-label="Filter items by category"><option value="all">All categories</option></select></div>
              <div class="as-reference-filters"><select data-ui="item-family" aria-label="Filter items by family"><option value="all">All families</option></select><select data-ui="item-tier" aria-label="Filter items by tier"><option value="all">All tiers</option>${this.tierOptions()}</select><button data-clear-filters="items">Clear filters</button></div>
              <div class="as-section-heading as-result-count" data-ui="items-count" role="status" aria-live="polite">SUPPLIES</div>
              <p class="as-catalogue-note" data-ui="catalogue-note" hidden>Original item reference. Browse definitions here; find or craft supplies in the world.</p>
              <div class="as-item-list" data-ui="items"></div>${this.paginationMarkup('items', 'item')}<div class="as-inventory-actions"><button data-action="eat">Eat</button><button data-action="drink">Drink</button><button data-action="bandage">Bandage</button><button data-action="rest">Rest</button></div></section>
              <section data-ui="crafting-pane" aria-label="Crafting and building" hidden><div class="as-section-heading">MAKE SOMETHING USEFUL</div>
              <div class="as-recipe-filters"><input type="search" data-ui="recipe-search" placeholder="Search recipes" aria-label="Search recipes"><label><input type="checkbox" data-ui="recipe-ready"> Ready to craft</label></div>
              <div class="as-reference-filters"><select data-ui="recipe-family" aria-label="Filter recipes by result family"><option value="all">All result families</option></select><select data-ui="recipe-tier" aria-label="Filter recipes by result tier"><option value="all">All result tiers</option>${this.tierOptions()}</select><button data-clear-filters="recipes">Clear filters</button></div>
              <div class="as-result-count" data-ui="recipes-count" role="status" aria-live="polite"></div>
              <div data-ui="recipes" class="as-recipe-list"></div>${this.paginationMarkup('recipes', 'recipe')}<div class="as-section-heading as-build-heading">PLACE BESIDE YOU</div><div class="as-recipe-list">
              <article class="as-recipe"><div><h3>Barricade</h3><p>Block a route and buy time. Aim toward a clear tile beside you.</p><span class="as-cost">3 wood + 1 scrap</span><small class="as-recipe-missing" data-ui="barricade-reason"></small></div><button data-build="barricade">Build</button></article>
              <article class="as-recipe"><div><h3>Campfire</h3><p>Rest and craft beside its light. Aim toward a clear tile beside you.</p><span class="as-cost">4 wood + 1 scrap</span><small class="as-recipe-missing" data-ui="campfire-reason"></small></div><button data-build="campfire">Build</button></article>
            </div></section></div>
            <p class="as-inventory-tip">Equip a backpack to carry more. Study recovered manuals once for practice and insight. Recipe tools and project references stay in your pack. J opens skills, projects, people, and the field guide.</p>
          </section>
        </div>

        <div class="as-overlay" data-screen="dead" hidden>
          <section class="as-modal as-end" role="dialog" aria-modal="true" aria-labelledby="as-dead-title"><div class="as-kicker">THE TOWN KEEPS ITS SECRETS</div><h2 id="as-dead-title">Your signal faded.</h2><p class="as-muted">One survivor gone. One more story left in the streets.</p><div class="as-end-stats" data-ui="dead-stats"></div><button class="as-primary" data-command="restart">TRY AGAIN <span>→</span></button><button class="as-secondary" data-command="title">BACK TO TITLE</button></section>
        </div>
        <div class="as-overlay" data-screen="won" hidden>
          <section class="as-modal as-end" role="dialog" aria-modal="true" aria-labelledby="as-won-title"><div class="as-title-mark">${icon}<span>TRANSMISSION RECEIVED</span></div><h2 id="as-won-title">Someone heard you.</h2><p class="as-muted">Through the static, a voice answers. For tonight, that is enough.</p><div class="as-end-stats" data-ui="won-stats"></div><button class="as-primary" data-command="restart">ONE MORE RUN <span>→</span></button><button class="as-secondary" data-command="title">BACK TO TITLE</button></section>
        </div>
        <div class="as-overlay as-conversation-overlay" data-ui="conversation-overlay" hidden><section class="as-modal as-conversation" role="dialog" aria-modal="true" aria-labelledby="as-conversation-name"><header class="as-modal-header"><div><div class="as-kicker" data-ui="conversation-role">SURVIVOR</div><h2 id="as-conversation-name" data-ui="conversation-name">A familiar voice</h2></div><button class="as-close" data-action="closeConversation" aria-label="Close conversation" title="Close conversation (Escape)">×</button></header><p class="as-conversation-text" data-ui="conversation-text"></p><div class="as-conversation-memory" data-ui="conversation-memory"></div><div class="as-conversation-actions"><button data-action="trade" data-ui="conversation-trade">Trade supplies</button><button data-action="recruit" data-ui="conversation-recruit">Travel together</button><button data-action="dismiss" data-ui="conversation-dismiss">Part ways</button><button data-action="helpSurvivor" data-ui="conversation-help" hidden>Deliver supplies</button><button data-action="robSurvivor" data-ui="conversation-rob" class="as-danger">Demand their supplies</button></div><p class="as-conversation-note">The simulation pauses while you talk.</p></section></div>
        <div class="as-toast" data-ui="toast" role="status" aria-live="polite" hidden></div>`;
      this.journal = Sirens.Journal ? new Sirens.Journal(this.root) : null;
      this.nodes = {};
      this.root.querySelectorAll('[data-ui]').forEach((el) => { this.nodes[el.dataset.ui] = el; });
      this.handleClick = this.onClick.bind(this);
      this.handleChange = this.onChange.bind(this);
      this.handleInput = this.onInput.bind(this);
      this.handleKeydown = this.onKeydown.bind(this);
      this.root.addEventListener('click', this.handleClick);
      this.root.addEventListener('change', this.handleChange);
      this.root.addEventListener('input', this.handleInput);
      this.root.addEventListener('keydown', this.handleKeydown);
      this.refreshContinue();
      this.refreshCategories();
      this.refreshMode();
    }

    meterMarkup(id, label, cls) {
      return `<div class="as-meter ${cls}"><div class="as-meter-label"><span>${label}</span><b data-meter-value="${id}">100</b></div><div class="as-meter-track" role="meter" aria-label="${label}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100" data-meter="${id}"><span></span></div></div>`;
    }

    tierOptions() { return Array.from({ length: 6 }, (_, tier) => `<option value="${tier}">Tier ${tier}</option>`).join(''); }

    paginationMarkup(kind, singular) {
      return `<nav class="as-pagination" data-ui="${kind}-pages" aria-label="${label(singular)} pages"><button data-page="${kind}" data-edge="first" aria-label="First ${singular} page">First</button><button data-page="${kind}" data-step="-1" aria-label="Previous ${singular} page">Previous</button><span data-ui="${kind}-page-status" role="status" aria-live="polite"></span><button data-page="${kind}" data-step="1" aria-label="Next ${singular} page">Next</button><button data-page="${kind}" data-edge="last" aria-label="Last ${singular} page">Last</button></nav>`;
    }

    audioPreferencesMarkup() {
      return [['music', 'Music', 'An evolving score while you explore.', 35], ['effects', 'Sound effects', 'Strikes, shots and interactions.', 100], ['ambience', 'Ambience', 'Weather and sounds around the town.', 70]].map(([channel, name, description, volume]) => `<div class="as-audio-channel"><label class="as-audio-switch"><input type="checkbox" data-setting="${channel}" data-ui="setting-${channel}" checked><span>${name}<small>${description}</small></span></label><label class="as-audio-level" for="as-${channel}-volume">Volume <output data-ui="${channel}-volume-value" for="as-${channel}-volume">${volume}%</output><input id="as-${channel}-volume" type="range" aria-label="${name} volume" data-setting="${channel}Volume" data-ui="setting-${channel}Volume" min="0" max="100" step="5" value="${volume}"></label></div>`).join('');
    }

    controlsMarkup() {
      return `<details class="as-controls" open><summary>Controls and survival notes</summary><div class="as-control-grid"><span><kbd>WASD</kbd> / <kbd>↑↓←→</kbd> Move or drive</span><span><kbd>SHIFT</kbd> Sprint, attracts attention</span><span><kbd>C</kbd> Sneak, move quietly</span><span><kbd>E</kbd> Loot, doors, relay, talk</span><span><kbd>E</kbd> Open or climb a window</span><span><kbd>SPACE</kbd> / left click: attack</span><span>Right click: fire equipped gun</span><span><kbd>F</kbd> Switch weapon</span><span><kbd>R</kbd> / <kbd>4</kbd> Reload</span><span><kbd>1</kbd> Eat <kbd>2</kbd> Drink <kbd>3</kbd> Bandage</span><span><kbd>I</kbd> Pack, catalogue, crafting</span><span><kbd>J</kbd> Skills, projects, people, field guide</span><span><kbd>B</kbd> Place barricade</span><span><kbd>V</kbd> Enter / exit vehicle</span><span><kbd>G</kbd> Refuel vehicle</span><span><kbd>PAGE ↑↓</kbd> Climb stairs</span><span><kbd>ESC</kbd> Pause or close the current menu</span></div><p>Point at terrain and strike with your equipped melee weapon. Axes chop trees and bash doors. A heavy pickaxe or sledgehammer can break walls. Press E at a window to open it and climb through; smashed glass can injure you. Watch attack windups and use corners to break sight. In open world mode, roads lead to new sectors and your changes persist. In rescue mode, gather five radio parts and repair the relay. The game uses a keyboard and mouse.</p></details>`;
    }

    refreshCategories() {
      const items = this.reference.items;
      const categories = Array.from(new Set(this.reference.byName.map((record) => record.category))).sort();
      const select = this.nodes.category;
      categories.forEach((category) => {
        const option = document.createElement('option'); option.value = category; option.textContent = label(category); select.append(option);
      });
      for (const [node, families] of [[this.nodes['item-family'], this.reference.byName.map((record) => record.family)], [this.nodes['recipe-family'], this.reference.recipeRows.map((record) => record.family)]]) {
        for (const family of Array.from(new Set(families)).sort()) {
          const option = document.createElement('option'); option.value = family; option.textContent = label(family); node.append(option);
        }
      }
      this.nodes['catalogue-count'].textContent = String(Object.keys(items).length);
      this.nodes['recipe-count'].textContent = String((Sirens.Engine && Sirens.Engine.recipes || []).length);
    }

    refreshMode() {
      const open = this.nodes.mode.value === 'openworld';
      this.nodes['title-copy'].textContent = open ? 'Leave your safe cabin. Follow the roads beyond Morrow. Scavenge, craft, and make a place to survive.' : 'The town went quiet. It did not stay empty. Find five radio parts and get a signal out before the dead find you.';
      this.nodes['start-note'].textContent = open ? 'Your safe cabin has supplies. I opens your pack and crafting. J opens projects and the field guide. Escape opens controls and saves.' : 'Your safe cabin has supplies. Find five radio parts and repair the relay. I opens crafting. J opens the field guide. Escape opens controls and saves.';
    }

    refreshContinue() {
      const button = this.root.querySelector('[data-command="continue"]');
      if (typeof this.callbacks.hasSave === 'function') {
        try { button.disabled = !this.callbacks.hasSave(); } catch (_) { button.disabled = true; }
      }
      button.title = button.disabled ? 'No saved run in this browser. Start a new run first.' : 'Continue the run saved in this browser';
    }

    invoke(name, ...args) {
      const callback = this.callbacks[name];
      if (typeof callback !== 'function') return;
      try {
        const result = callback(...args);
        if (result && typeof result.then === 'function') result.catch((error) => { this.toast(error && error.message || 'That action could not be completed.', 'danger'); });
      } catch (error) {
        this.toast(error && error.message || 'That action could not be completed.', 'danger');
      }
    }

    onClick(event) {
      const button = event.target.closest('button');
      if (!button || !this.root.contains(button) || button.disabled) return;
      if (button.dataset.page) {
        const kind = button.dataset.page, field = kind === 'items' ? 'itemPage' : 'recipePage', pages = kind === 'items' ? this.itemPages : this.recipePages;
        this[field] = clamp(button.dataset.edge === 'first' ? 0 : button.dataset.edge === 'last' ? pages - 1 : this[field] + Number(button.dataset.step), 0, pages - 1);
        this.refreshInventory(true); this.nodes[kind].scrollTop = 0;
        if (button.disabled && event.detail === 0) {
          const available = this.nodes[kind + '-pages'].querySelector('button:not(:disabled)');
          if (available) available.focus({ preventScroll: true });
        }
        return;
      }
      if (button.dataset.clearFilters) { this.clearReferenceFilters(button.dataset.clearFilters); return; }
      if (button.dataset.showRecipe || button.dataset.recipeUses) {
        this.inventoryPane = 'crafting'; this.recipeQuery = button.dataset.showRecipe || button.dataset.recipeUses;
        this.recipeFamily = this.recipeTier = 'all'; this.readyOnly = false; this.recipePage = 0;
        this.nodes['recipe-search'].value = this.recipeQuery; this.nodes['recipe-family'].value = this.nodes['recipe-tier'].value = 'all'; this.nodes['recipe-ready'].checked = false;
        this.refreshInventory(true); this.nodes.recipes.scrollTop = 0; this.nodes['recipe-search'].focus({ preventScroll: true });
        return;
      }
      if (button.dataset.action) { this.invoke('action', button.dataset.action); this.refreshInventory(true); if (event.detail > 0 && !this.inventoryOpen) button.blur(); return; }
      if (button.dataset.use) { this.invoke('useItem', button.dataset.use); this.refreshInventory(true); return; }
      if (button.dataset.equip) { this.invoke('equipItem', button.dataset.equip); this.refreshInventory(true); return; }
      if (button.dataset.drop) { this.invoke('dropItem', button.dataset.drop); this.refreshInventory(true); return; }
      if (button.dataset.craft) { this.invoke('craft', button.dataset.craft); this.refreshInventory(true); return; }
      if (button.dataset.build) { this.invoke('build', button.dataset.build); this.refreshInventory(true); return; }
      const command = button.dataset.command;
      if (command === 'start') {
        const seed = Math.floor(clamp(this.nodes.seed.value, 0, 2147483647));
        this.nodes.seed.value = seed;
        this.invoke('start', seed, this.nodes.difficulty.value, this.nodes.mode.value);
      } else if (command === 'owned' || command === 'catalogue' || command === 'crafting') {
        this.inventoryPane = command; if (command !== 'crafting') { if (this.itemView !== command) this.itemPage = 0; this.itemView = command; } this.refreshInventory(true);
      } else if (command === 'inventory') {
        this.toggleInventory();
        if (event.detail > 0 && this.inventoryOpen) this.lastFocus = null;
      } else if (command === 'journal') {
        this.toggleJournal();
      } else if (command === 'details') {
        this.details = !this.details; this.root.dataset.details = this.details ? 'expanded' : 'compact'; button.setAttribute('aria-pressed', String(this.details)); button.textContent = this.details ? 'Details −' : 'Details +'; if (event.detail > 0) button.blur();
        this.invoke('setDetails', this.details);
      } else if (command === 'title') {
        if (typeof this.callbacks.title === 'function') this.invoke('title');
        else this.showScreen('title');
      } else if (command) {
        this.invoke(command);
      }
    }

    onChange(event) {
      const target = event.target;
      if (target.dataset.setting === 'sound') { this.sound = target.checked; this.invoke('setSound', this.sound); }
      if (target.dataset.setting === 'debug') { this.debug = target.checked; this.invoke('setDebug', this.debug); }
      if (target.dataset.setting === 'motion') this.invoke('setMotion', target.checked);
      if (['music', 'effects', 'ambience'].includes(target.dataset.setting)) this.invoke('setAudioPreference', target.dataset.setting, target.checked);
      if (target === this.nodes.sort) { this.sort = target.value; this.itemPage = 0; this.refreshInventory(true); }
      if (target === this.nodes.mode) this.refreshMode();
      if (target === this.nodes.category) { this.category = target.value; this.itemPage = 0; this.refreshInventory(true); }
      if (target === this.nodes['item-family']) { this.family = target.value; this.itemPage = 0; this.refreshInventory(true); }
      if (target === this.nodes['item-tier']) { this.tier = target.value; this.itemPage = 0; this.refreshInventory(true); }
      if (target === this.nodes['recipe-family']) { this.recipeFamily = target.value; this.recipePage = 0; this.refreshInventory(true); }
      if (target === this.nodes['recipe-tier']) { this.recipeTier = target.value; this.recipePage = 0; this.refreshInventory(true); }
      if (target === this.nodes['recipe-ready']) { this.readyOnly = target.checked; this.recipePage = 0; this.refreshInventory(true); }
      if ([this.nodes.sort, this.nodes.category, this.nodes['item-family'], this.nodes['item-tier']].includes(target)) this.nodes.items.scrollTop = 0;
      if ([this.nodes['recipe-family'], this.nodes['recipe-tier'], this.nodes['recipe-ready']].includes(target)) this.nodes.recipes.scrollTop = 0;
      if (target === this.nodes.import && target.files && target.files[0]) {
        this.invoke('importSave', target.files[0]);
        target.value = '';
      }
    }

    onInput(event) {
      if (event.target === this.nodes['item-search']) { this.itemQuery = event.target.value.trim().toLowerCase(); this.itemPage = 0; this.refreshInventory(true); this.nodes.items.scrollTop = 0; }
      if (event.target === this.nodes['recipe-search']) { this.recipeQuery = event.target.value.trim().toLowerCase(); this.recipePage = 0; this.refreshInventory(true); this.nodes.recipes.scrollTop = 0; }
      if (event.target.dataset.setting === 'volume') { const value = clamp(event.target.value, 0, 100); this.nodes['volume-value'].textContent = value + '%'; this.invoke('setVolume', value / 100); }
      if (event.target.dataset.setting === 'zoom') { const value = clamp(event.target.value, 70, 150); this.nodes['zoom-value'].textContent = value + '%'; this.invoke('setZoom', value / 100); }
      for (const channel of ['music', 'effects', 'ambience']) if (event.target.dataset.setting === channel + 'Volume') { const value = clamp(event.target.value, 0, 100); this.nodes[channel + '-volume-value'].textContent = value + '%'; this.invoke('setAudioPreference', channel + 'Volume', value / 100); }
    }

    clearReferenceFilters(kind) {
      if (kind === 'items') {
        this.itemQuery = ''; this.category = this.family = this.tier = 'all'; this.itemPage = 0;
        this.nodes['item-search'].value = ''; this.nodes.category.value = this.nodes['item-family'].value = this.nodes['item-tier'].value = 'all';
      } else {
        this.recipeQuery = ''; this.recipeFamily = this.recipeTier = 'all'; this.readyOnly = false; this.recipePage = 0;
        this.nodes['recipe-search'].value = ''; this.nodes['recipe-family'].value = this.nodes['recipe-tier'].value = 'all'; this.nodes['recipe-ready'].checked = false;
      }
      this.refreshInventory(true); this.nodes[kind].scrollTop = 0; this.nodes[kind === 'items' ? 'item-search' : 'recipe-search'].focus({ preventScroll: true });
    }

    applyPreferences(preferences) {
      const p = preferences || {};
      this.sound = p.sound !== false;
      this.root.querySelector('[data-setting="sound"]').checked = this.sound;
      this.root.querySelector('[data-setting="motion"]').checked = p.motion !== false;
      for (const [channel, defaultVolume] of [['music', .35], ['effects', 1], ['ambience', .7]]) {
        this.nodes['setting-' + channel].checked = p[channel] !== false;
        const channelVolume = Math.round(clamp(p[channel + 'Volume'] === undefined ? defaultVolume : p[channel + 'Volume'], 0, 1) * 100);
        this.nodes['setting-' + channel + 'Volume'].value = channelVolume; this.nodes[channel + '-volume-value'].textContent = channelVolume + '%';
      }
      const volume = Math.round(clamp(p.volume === undefined ? .7 : p.volume, 0, 1) * 100), zoom = Math.round(clamp(p.zoom === undefined ? 1 : p.zoom, .7, 1.5) * 100);
      this.root.querySelector('[data-setting="volume"]').value = volume; this.nodes['volume-value'].textContent = volume + '%';
      this.root.querySelector('[data-setting="zoom"]').value = zoom; this.nodes['zoom-value'].textContent = zoom + '%';
      this.details = !!p.details; this.root.dataset.details = this.details ? 'expanded' : 'compact';
      const details = this.root.querySelector('[data-command="details"]'); details.setAttribute('aria-pressed', String(this.details)); details.textContent = this.details ? 'Details −' : 'Details +';
    }

    onKeydown(event) {
      // The game owns shortcuts. This listener only keeps keyboard focus within an open dialog.
      if (event.key !== 'Tab' || !this.isBlocking()) return;
      const panel = this.state && this.state.conversation && this.screen === 'playing' ? this.nodes['conversation-overlay'] : this.journal && this.journal.open ? this.journal.overlay : this.inventoryOpen ? this.nodes['inventory-overlay'] : this.root.querySelector(`[data-screen="${this.screen}"]`);
      if (!panel || panel.hidden) return;
      const focusable = Array.from(panel.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), summary, [tabindex]:not([tabindex="-1"])')).filter((el) => !el.disabled && !el.hidden && el.getClientRects().length > 0);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && (document.activeElement === first || !panel.contains(document.activeElement))) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !panel.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
    }

    showScreen(name) {
      if (!['title', 'playing', 'paused', 'dead', 'won'].includes(name)) return;
      this.screen = name;
      this.inventoryOpen = false;
      if (this.journal) this.journal.close();
      this.nodes['inventory-overlay'].hidden = true;
      this.nodes['conversation-overlay'].hidden = true;
      this.root.querySelectorAll('[data-screen]').forEach((panel) => { panel.hidden = panel.dataset.screen !== name; });
      this.nodes.hud.hidden = name === 'title';
      this.root.dataset.screen = name;
      if (name === 'title') this.refreshContinue();
      if (name === 'dead' || name === 'won') this.renderEndStats();
      const panel = this.root.querySelector(`[data-screen="${name}"]`);
      if (panel && !panel.hidden) {
        const focus = panel.querySelector('button:not(:disabled)');
        if (focus) focus.focus({ preventScroll: true });
      } else {
        const active = document.activeElement;
        if (active && this.root.contains(active) && typeof active.blur === 'function') active.blur();
      }
    }

    toggleInventory() {
      if (this.screen !== 'playing' || this.state && this.state.conversation) return;
      if (this.journal) this.journal.close();
      this.inventoryOpen = !this.inventoryOpen;
      this.invoke('menuChanged');
      this.nodes['inventory-overlay'].hidden = !this.inventoryOpen;
      if (this.inventoryOpen) {
        this.lastFocus = document.activeElement;
        this.refreshInventory(true);
        this.nodes['inventory-overlay'].querySelector('.as-close').focus({ preventScroll: true });
      } else if (this.lastFocus && this.lastFocus.isConnected && typeof this.lastFocus.focus === 'function' && this.lastFocus !== document.body) {
        this.lastFocus.focus({ preventScroll: true });
      } else if (document.activeElement && this.root.contains(document.activeElement)) {
        document.activeElement.blur();
      }
    }

    toggleJournal() {
      if (!this.journal || this.screen !== 'playing' || this.state && this.state.conversation) return;
      this.invoke('menuChanged');
      if (this.journal.open) { this.journal.close(); if (document.activeElement && this.root.contains(document.activeElement)) document.activeElement.blur(); }
      else { this.inventoryOpen = false; this.nodes['inventory-overlay'].hidden = true; this.journal.show(this.state); }
    }

    isBlocking() { return this.screen !== 'playing' || this.inventoryOpen || !!(this.journal && this.journal.open) || !!(this.state && this.state.conversation); }

    update(state, frameInfo) {
      if (this.destroyed || !state || !state.player) return;
      this.state = state;
      const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
      if (now - this.lastUpdate < 100) return;
      this.lastUpdate = now;
      const player = state.player;
      for (const field of ['health', 'stamina', 'hunger', 'thirst', 'infection']) {
        const value = clamp(player[field], 0, 100);
        const meter = this.root.querySelector(`[data-meter="${field}"]`);
        const valueNode = this.root.querySelector(`[data-meter-value="${field}"]`);
        meter.setAttribute('aria-valuenow', String(Math.round(value)));
        meter.firstElementChild.style.width = `${value}%`;
        valueNode.textContent = `${Math.round(value)}`;
        meter.parentElement.classList.toggle('as-critical', field === 'health' || field === 'stamina' ? value < 25 : value > 60);
      }
      this.nodes.injury.hidden = !player.bleeding;
      const progress = Sirens.Progression && Sirens.Progression.ensure(state);
      this.nodes['needs-summary'].textContent = 'Hunger ' + Math.round(player.hunger) + ' · Thirst ' + Math.round(player.thirst) + (progress ? ' · Fatigue ' + Math.round(progress.fatigue) + (progress.sleeping ? ' · Sleeping' : '') : '') + (player.infection > 0 ? ' · Infection ' + Math.round(player.infection) : '');
      this.nodes['needs-summary'].classList.toggle('as-critical-needs', player.hunger > 60 || player.thirst > 60 || player.infection > 0);
      const hour = Math.floor(number(state.time)) % 24;
      const minute = Math.floor((number(state.time) % 1) * 60);
      this.nodes.time.textContent = `DAY ${String(Math.max(1, Math.floor(number(state.day)))).padStart(2, '0')} · ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      const inventory = player.inventory || {};
      this.root.querySelectorAll('[data-count]').forEach((el) => { el.textContent = String(Math.floor(number(inventory[el.dataset.count]))); });
      for (const [id, field] of [['food', 'hunger'], ['water', 'thirst'], ['bandage', 'bleeding']]) this.root.querySelector(`[data-count="${id}"]`).textContent = String(this.quickCount(field, inventory));
      this.refreshQuickActions();
      const weight = this.inventoryWeight(inventory);
      this.nodes['pack-weight'].textContent = `${weight.toFixed(1)} kg`;
      const weapon = this.itemMetadata(player.weapon || 'bat');
      const firearm = weapon.weapon && weapon.weapon.kind === 'firearm' || player.weapon === 'pistol';
      const ammoId = weapon.weapon && weapon.weapon.ammoId || 'ammo';
      this.nodes.weapon.textContent = String(weapon.name || player.weapon || 'Bat').toUpperCase();
      this.nodes.ammo.textContent = firearm ? `${Math.floor(number(player.ammo))} loaded · ${Math.floor(number(inventory[ammoId]))} spare` : 'F to switch weapon · I to equip';
      this.root.querySelector('[data-count="ammo"]').textContent = String(Math.floor(number(inventory[ammoId])));
      const goal = state.goal || {};
      const required = Math.max(1, number(goal.required) || 5);
      const installed = number(goal.parts);
      const carried = number(inventory.parts);
      const openWorld = !!state.world || state.mode === 'openworld';
      this.nodes['objective-kicker'].textContent = openWorld ? 'MAKE IT THROUGH TOMORROW' : 'GET A SIGNAL OUT';
      this.nodes.parts.textContent = openWorld ? goal.complete ? 'RELAY RESTORED' : `${Math.min(required, installed + carried)} / ${required} RELAY PARTS` : `${Math.min(required, installed + carried)} / ${required} PARTS`;
      this.nodes.objective.textContent = openWorld ? Sirens.Progression ? Sirens.Progression.nextTask(state) : 'Explore connected roads. Gather supplies, craft equipment, and establish a shelter.' : goal.complete ? 'Signal sent. Stay alive while help answers.' : installed + carried >= required ? 'You have the parts. Use E at the relay.' : `Find ${Math.max(0, required - installed - carried)} more radio parts. Repair the relay with E.`;
      if (progress) {
        this.nodes['insight-count'].textContent = progress.insight + ' insight';
        const event = progress.event, active = event && event.kind !== 'none' && event.until > state.elapsed;
        this.nodes['world-event'].hidden = !active || this.isBlocking();
        if (active) {
          const label = ({ rain: 'Rain front', migration: 'Dead on the move', cache: 'Traveler cache' })[event.kind], timer = ' · ' + Math.ceil(event.until - state.elapsed) + 's';
          if (this.nodes['world-event-label'].textContent !== label) this.nodes['world-event-label'].textContent = label;
          if (this.nodes['world-event-timer'].textContent !== timer) this.nodes['world-event-timer'].textContent = timer;
        }
      }
      const battle = state.warfare && state.warfare.battle;
      if (battle && battle.active) {
        this.nodes['world-event'].hidden = this.isBlocking();
        this.nodes['world-event-label'].textContent = (battle.type === 'undead' ? 'HORDE SIEGE' : 'RAIDER BATTLE') + ' · ' + battle.spawned + ' arrived · ' + battle.defeated + ' defeated';
        this.nodes['world-event-timer'].textContent = battle.pending ? ' · next wave ' + Math.max(0, Math.ceil(battle.nextWave - state.elapsed)) + 's' : ' · hold the area';
      }
      if (goal.active && number(goal.countdown) > 0) this.nodes.objective.textContent = `Relay active. Survive ${Math.ceil(number(goal.countdown))} seconds until the answer.`;
      this.nodes['world-info'].hidden = !openWorld;
      if (openWorld) {
        const world = state.world || {};
        const gx = (Number(world.originX) || 0) + player.x / (state.tileSize || 32);
        const gy = (Number(world.originY) || 0) + player.y / (state.tileSize || 32);
        this.nodes.region.textContent = label(world.biome || 'Morrow');
        this.nodes.coordinates.textContent = `${Math.floor(gx)}, ${Math.floor(gy)}`;
        this.nodes.exploration.textContent = `${Math.max(1, Math.floor(number(world.visitedCount)))} sectors explored`;
      }
      this.nodes['floor-info'].hidden = !state.stories;
      if (state.stories) {
        const floor = Math.max(0, Math.floor(number(state.stories.floor)));
        this.nodes['floor-label'].textContent = floor ? `FLOOR ${floor + 1}` : 'GROUND LEVEL';
        let stairs = '';
        try { if (Sirens.Stories && typeof Sirens.Stories.nearby === 'function') stairs = Sirens.Stories.nearby(state); } catch (_) {}
        this.nodes['stairs-actions'].hidden = !stairs;
        this.root.querySelector('[data-action="stairsDown"]').disabled = floor === 0;
        const building = Sirens.Stories && typeof Sirens.Stories.currentBuilding === 'function' ? Sirens.Stories.currentBuilding(state) : null;
        this.root.querySelector('[data-action="stairsUp"]').disabled = !!building && floor >= (number(building.floors) || 1) - 1;
      }
      const vehicle = (state.vehicles || []).find((car) => car.id === player.vehicleId);
      this.nodes['vehicle-info'].hidden = !vehicle;
      if (vehicle) {
        this.nodes['vehicle-name'].textContent = vehicle.name || label(vehicle.type || 'Vehicle');
        this.nodes['vehicle-speed'].textContent = `${Math.round(Math.min(100, Math.abs(Number(vehicle.speed) || 0) / Math.max(1, number(vehicle.maxSpeed)) * 100))}% speed`;
        this.nodes['vehicle-fuel'].textContent = `Fuel: ${Math.max(0, Math.floor(number(vehicle.fuel)))} / ${number(vehicle.tank) || 100}`;
        this.nodes['vehicle-condition'].textContent = `Condition: ${Math.round(clamp(vehicle.condition, 0, 100))}%`;
        const exit = this.root.querySelector('.as-vehicle-actions [data-action="vehicle"]');
        exit.disabled = Math.abs(Number(vehicle.speed) || 0) > 18;
        exit.title = exit.disabled ? 'Brake before getting out' : 'Leave the vehicle (V)';
        const refuel = this.root.querySelector('.as-vehicle-actions [data-action="refuel"]');
        const fuelReason = this.fuelReason(vehicle);
        refuel.disabled = !!fuelReason; refuel.title = fuelReason || 'Refuel from your pack (G)';
      }
      this.renderConversation(state.conversation);
      if (Number.isFinite(goal.radioX) && Number.isFinite(goal.radioY)) {
        const distance = Math.round(Math.hypot(player.x - goal.radioX, player.y - goal.radioY) / (state.tileSize || 32));
        this.nodes.direction.textContent = `RELAY ${distance} TILES AWAY`;
      }
      let prompt = '';
      try { if (Sirens.Engine && typeof Sirens.Engine.nearby === 'function') prompt = Sirens.Engine.nearby(state); } catch (_) { /* Optional prompt must never interrupt a run. */ }
      this.nodes.interact.hidden = !prompt || this.isBlocking();
      this.nodes['interact-text'].textContent = typeof prompt === 'string' ? prompt : '';
      this.renderLogs(state.logs || []);
      if (this.inventoryOpen) this.refreshInventory();
      if (this.journal) this.journal.render(state);
      if (this.screen === 'dead' || this.screen === 'won') this.renderEndStats();
    }

    renderConversation(conversation) {
      const wasVisible = !this.nodes['conversation-overlay'].hidden;
      this.nodes['conversation-overlay'].hidden = !conversation || this.screen !== 'playing';
      if (!conversation || this.screen !== 'playing') return;
      this.nodes['conversation-role'].textContent = String(conversation.role || 'Survivor').toUpperCase();
      this.nodes['conversation-name'].textContent = String(conversation.name || 'Survivor');
      this.nodes['conversation-text'].textContent = String(conversation.text || 'The survivor watches the road.');
      this.nodes['conversation-memory'].textContent = 'Trust ' + (conversation.trust || 0) + '/20' + (conversation.requestReason ? ' · ' + conversation.requestReason : '');
      this.nodes['conversation-help'].hidden = !conversation.hasRequest;
      this.nodes['conversation-help'].disabled = !conversation.canHelp;
      this.nodes['conversation-help'].textContent = conversation.requestLabel || 'Deliver supplies';
      this.nodes['conversation-help'].title = conversation.requestReason || 'Deliver the requested supplies for trust and insight';
      this.nodes['conversation-trade'].hidden = !conversation.canTrade;
      this.nodes['conversation-trade'].textContent = String(conversation.tradeLabel || 'Trade supplies');
      const inventory = this.state.player.inventory;
      const capacity = Sirens.Engine.carryCapacity(this.state);
      const tradeReason = number(inventory.food) < 1 ? 'Bring one ration to trade' : number(inventory.bandage) >= 1000 ? 'You already carry the maximum number of bandages' : this.inventoryWeight(inventory) - number(this.itemMetadata('food').weight) + number(this.itemMetadata('bandage').weight) > capacity + .00001 ? 'Make room in your pack before trading' : '';
      this.nodes['conversation-trade'].disabled = !!tradeReason;
      this.nodes['conversation-trade'].title = tradeReason || 'Give one ration and receive one bandage';
      this.nodes['conversation-recruit'].hidden = !conversation.canRecruit;
      this.nodes['conversation-recruit'].textContent = 'Recruit for 1 ration';
      this.nodes['conversation-recruit'].disabled = number(this.state.player.inventory.food) < 1 || (this.state.humans || []).filter((human) => human.following && human.health > 0).length >= 12;
      this.nodes['conversation-recruit'].title = number(inventory.food) < 1 ? 'Bring one ration to recruit this survivor' : (this.state.humans || []).filter((human) => human.following && human.health > 0).length >= 12 ? 'Your group already has twelve companions' : 'Give one ration; this survivor follows and fights with you';
      this.nodes['conversation-dismiss'].hidden = !conversation.canDismiss;
      this.nodes['conversation-rob'].disabled = !conversation.canRob; this.nodes['conversation-rob'].title = conversation.robReason || 'Threaten this survivor for their supplies';
      if (!wasVisible) this.nodes['conversation-overlay'].querySelector('.as-close').focus({ preventScroll: true });
    }

    itemMetadata(id) {
      return Sirens.Engine && Sirens.Engine.items && Sirens.Engine.items[id] || { name: id.charAt(0).toUpperCase() + id.slice(1), weight: 0, color: '#aeae9a', description: 'A useful supply.' };
    }

    inventoryWeight(inventory) {
      return Object.keys(inventory).reduce((total, id) => total + number(inventory[id]) * number(this.itemMetadata(id).weight), 0);
    }

    quickCount(field, inventory) {
      const fallback = { hunger: 'food', thirst: 'water', bleeding: 'bandage' }[field];
      return Object.entries(inventory).reduce((total, [id, quantity]) => {
        const item = this.itemMetadata(id);
        return total + (id === fallback || item.effect && number(item.effect[field]) > 0 ? Math.floor(number(quantity)) : 0);
      }, 0);
    }

    quickActionReason(action) {
      if (!this.state || !this.state.player) return 'Start a run first';
      const player = this.state.player, inventory = player.inventory || {};
      const field = { eat: 'hunger', drink: 'thirst', bandage: 'bleeding' }[action];
      if (field) {
        if (!this.quickCount(field, inventory)) return { eat: 'No food in your pack', drink: 'No drink in your pack', bandage: 'No dressing in your pack' }[action];
        if (action === 'eat' && player.hunger < 5) return 'You are already well fed';
        if (action === 'drink' && player.thirst < 5) return 'You are already hydrated';
        if (action === 'bandage' && !player.bleeding && player.health >= 98) return 'No wounds need a dressing';
      }
      if (action === 'reload') {
        const weapon = this.itemMetadata(player.weapon || 'bat').weapon || {};
        if (weapon.kind !== 'firearm') return 'Equip a firearm to reload';
        if (number(player.ammo) >= number(weapon.clipSize)) return 'Magazine is full';
        if (number(inventory[weapon.ammoId || 'ammo']) < 1) return 'No matching ammunition in your pack';
      }
      return '';
    }

    refreshQuickActions() {
      // Keep project, study, and survivor buttons under their own shared simulation quotes.
      this.root.querySelectorAll('.as-hotbar [data-action], .as-inventory-actions [data-action]').forEach((button) => {
        const reason = this.quickActionReason(button.dataset.action);
        button.disabled = !!reason;
        const key = { eat: '1', drink: '2', bandage: '3', reload: '4 or R' }[button.dataset.action];
        button.title = reason || (key ? label(button.dataset.action) + ' (' + key + ')' : 'Rest until you move or attack');
        button.setAttribute('aria-label', label(button.dataset.action) + (reason ? ': ' + reason : key ? ' (' + key + ')' : ''));
        if (button.dataset.action === 'rest') { button.textContent = this.state.player.resting ? 'Stop resting' : 'Rest'; button.title = this.state.player.resting ? 'Stop resting and resume movement' : 'Rest until you move or attack'; button.setAttribute('aria-label', button.textContent); }
      });
    }

    nearbyVehicle() {
      const s = this.state, player = s && s.player;
      if (!player || s.stories && s.stories.floor > 0) return null;
      if (player.vehicleId) return (s.vehicles || []).find(v => v.id === player.vehicleId) || null;
      return (s.vehicles || []).filter(v => Math.hypot(v.x - player.x, v.y - player.y) < 75 && Sirens.Engine.hasLOS(s, player.x, player.y, v.x, v.y)).sort((a, b) => Math.hypot(a.x - player.x, a.y - player.y) - Math.hypot(b.x - player.x, b.y - player.y))[0] || null;
    }

    fuelReason(vehicle, itemId) {
      const inventory = this.state.player.inventory;
      if (!vehicle) return 'Approach a vehicle on the ground floor';
      if (Math.abs(Number(vehicle.speed) || 0) > 1) return 'Stop the vehicle before refueling';
      if (number(vehicle.fuel) >= number(vehicle.tank)) return 'The fuel tank is full';
      if (itemId ? !(number(inventory[itemId]) && this.itemMetadata(itemId).fuel > 0) : !Object.keys(inventory).some(id => inventory[id] > 0 && this.itemMetadata(id).fuel > 0)) return 'No fuel item in your pack';
      return '';
    }

    renderLogs(logs) {
      const recent = logs.filter(log => !this.state || this.state.elapsed - log.time < 8).slice(-2);
      const signature = recent.map((log) => `${log.text}|${log.tone}|${log.time}`).join(';;');
      if (signature === this.lastLogSignature) return;
      this.lastLogSignature = signature;
      this.nodes.logs.replaceChildren();
      recent.forEach((log, index) => {
        const line = document.createElement('div');
        line.className = `as-log as-log-${['danger', 'warning', 'success'].includes(log.tone) ? log.tone : 'normal'}`;
        line.style.opacity = String(0.45 + (index + 1) / recent.length * 0.55);
        line.textContent = String(log.text || '');
        this.nodes.logs.append(line);
      });
    }

    costText(cost) {
      return Object.entries(cost || {}).map(([id, quantity]) => `${number(quantity)} ${this.itemMetadata(id).name.toLowerCase()}`).join(' + ') || 'No materials required';
    }

    canAfford(cost, inventory) {
      return Object.entries(cost || {}).every(([id, quantity]) => number(inventory[id]) >= number(quantity));
    }

    equipped(id) {
      const player = this.state && this.state.player || {};
      const equipment = player.equipment || {};
      return player.weapon === id || Object.values(equipment).some((value) => value === id || Array.isArray(value) && value.includes(id));
    }

    itemFacts(item) {
      const facts = [];
      if (item.effect) Object.entries(item.effect).forEach(([key, value]) => {
        if (!Number(value)) return;
        const reduction = ['hunger', 'thirst', 'infection', 'bleeding'].includes(key);
        const actual = reduction ? -Number(value) : Number(value);
        facts.push(`${label(key)} ${actual > 0 ? '+' : ''}${actual}`);
      });
      if (item.weapon) {
        facts.push(`${item.weapon.damage} damage`, `${(number(item.weapon.range) / 32).toFixed(1)} tile reach`);
        if (item.weapon.cooldown) facts.push(`${item.weapon.cooldown}s recovery`);
        if (item.weapon.staminaCost) facts.push(`${item.weapon.staminaCost} stamina per swing`);
        if (item.weapon.kind === 'firearm') facts.push(`${item.weapon.clipSize} rounds`, this.itemMetadata(item.weapon.ammoId || 'ammo').name);
      }
      if (item.armor) facts.push(`${Math.round(Number(item.armor) * 100)}% protection`);
      if (item.capacity) facts.push(`+${item.capacity} kg capacity`);
      if (item.fuel) facts.push(`+${item.fuel} vehicle fuel`);
      if (item.miningDamage) facts.push(`${item.miningDamage} mining power`);
      if (item.treeDamage) facts.push(`${item.treeDamage} tree damage`);
      if (item.wallDamage) facts.push(`${item.wallDamage} wall damage`);
      if (item.doorDamage) facts.push(`${item.doorDamage} door damage`);
      if (!facts.length) facts.push(item.category === 'tools' ? 'Recipe tool, kept after crafting' : Sirens.Progression && Object.hasOwn(Sirens.Progression.manuals, item.id || '') ? 'Study once for 18 practice and 1 insight' : ['books', 'electronics', 'utility'].includes(item.category) ? 'Reference or crafting ingredient' : 'Crafting ingredient');
      return facts.join(' · ');
    }

    craftReady(recipe, inventory) {
      if (Sirens.Engine && typeof Sirens.Engine.craftQuote === 'function') return this.recipeQuote(recipe).can;
      if (Sirens.Engine && typeof Sirens.Engine.canCraft === 'function') return Sirens.Engine.canCraft(this.state, recipe.id);
      if (!this.canAfford(recipe.cost, inventory) || !(recipe.tools || []).every((id) => number(inventory[id]) > 0)) return false;
      if (recipe.station === 'campfire') return (this.state.structures || []).some((structure) => structure.type === 'campfire' && Math.hypot(structure.x - this.state.player.x, structure.y - this.state.player.y) <= 100);
      return true;
    }

    recipeQuote(recipe) {
      if (!this.recipeQuotes.has(recipe.id)) this.recipeQuotes.set(recipe.id, Sirens.Engine.craftQuote(this.state, recipe));
      return this.recipeQuotes.get(recipe.id);
    }

    matchingItems(inventory, inventorySignature) {
      const key = JSON.stringify([this.itemView, this.sort, this.category, this.family, this.tier, this.itemQuery, this.itemView === 'owned' || this.sort === 'quantity' ? inventorySignature : '']);
      if (this.itemMatches && this.itemMatches.key === key) return this.itemMatches;
      let source = this.itemView === 'catalogue' ? this.sort === 'weight' ? this.reference.byWeight : this.reference.byName : Object.keys(inventory).filter((id) => number(inventory[id]) > 0).map((id) => this.reference.itemsById[id]).filter(Boolean);
      if (this.itemView === 'owned' || this.sort === 'quantity') {
        source = source.slice().sort((a, b) => {
          if (this.sort === 'quantity') return number(inventory[b.id]) - number(inventory[a.id]) || a.item.name.localeCompare(b.item.name);
          if (this.sort === 'weight') return number(b.item.weight) * number(inventory[b.id]) - number(a.item.weight) * number(inventory[a.id]) || a.item.name.localeCompare(b.item.name);
          return a.item.name.localeCompare(b.item.name) || a.id.localeCompare(b.id);
        });
      }
      const exact = this.itemQuery.includes('_') && this.reference.itemsById[this.itemQuery];
      const rows = source.filter((record) => (this.category === 'all' || record.category === this.category) && (this.family === 'all' || record.family === this.family) && (this.tier === 'all' || record.tier === Number(this.tier)) && (exact ? record.id === exact.id : matchesSearch(record.search, this.itemQuery)));
      const canonical = this.reference.itemsById[this.itemQuery], canonicalIndex = canonical && rows.indexOf(canonical);
      if (canonicalIndex > 0) { rows.splice(canonicalIndex, 1); rows.unshift(canonical); }
      this.itemMatches = { key, rows, total: source.length };
      return this.itemMatches;
    }

    matchingRecipes(inventory, requirementSignature) {
      const key = JSON.stringify([this.recipeQuery, this.recipeFamily, this.recipeTier, this.readyOnly, this.readyOnly ? requirementSignature : '']);
      if (this.recipeMatches && this.recipeMatches.key === key) return this.recipeMatches.rows;
      const exact = this.reference.recipesById[this.recipeQuery];
      const rows = (exact ? [exact] : this.reference.recipeRows).filter((record) => (this.recipeFamily === 'all' || record.family === this.recipeFamily) && (this.recipeTier === 'all' || record.tier === Number(this.recipeTier)) && (exact || matchesSearch(record.search, this.recipeQuery)) && (!this.readyOnly || this.craftReady(record.recipe, inventory)));
      this.recipeMatches = { key, rows };
      return rows;
    }

    refreshPagination(kind, count) {
      const size = kind === 'items' ? ITEM_PAGE_SIZE : RECIPE_PAGE_SIZE, field = kind === 'items' ? 'itemPage' : 'recipePage', pagesField = kind === 'items' ? 'itemPages' : 'recipePages';
      this[pagesField] = Math.max(1, Math.ceil(count / size));
      this[field] = Math.floor(clamp(this[field], 0, this[pagesField] - 1));
      const start = this[field] * size, end = Math.min(count, start + size), nav = this.nodes[kind + '-pages'];
      nav.dataset.current = String(this[field] + 1); nav.dataset.pages = String(this[pagesField]);
      this.nodes[kind + '-page-status'].textContent = count ? `Page ${this[field] + 1} of ${this[pagesField]} · Showing ${start + 1} to ${end} of ${count}` : 'No matching results';
      for (const button of nav.querySelectorAll('button')) button.disabled = !count || (button.dataset.edge === 'first' || button.dataset.step === '-1' ? this[field] === 0 : this[field] >= this[pagesField] - 1);
      return { start, end };
    }

    itemOrigins(id) {
      const item = this.itemMetadata(id), makers = this.reference.makers[id] || [], uses = this.reference.uses[id] || [];
      const details = document.createElement('details'); details.className = 'as-item-origin';
      const summary = document.createElement('summary'); summary.textContent = 'Where to find it and how to make it'; details.append(summary);
      if ((item.sources || []).length) { const source = document.createElement('p'); source.textContent = 'Loot locations: ' + item.sources.map(label).join(', ') + '.'; details.append(source); }
      if ((item.toolTags || []).length) { const tools = document.createElement('p'); tools.textContent = 'Reusable recipe tools: ' + item.toolTags.map((tag) => this.itemMetadata(tag).name).join(', ') + '. Compatible versions can fill these tool requirements.'; details.append(tools); }
      for (const { recipe } of makers.slice(0, 3)) {
        const path = document.createElement('div'); path.className = 'as-item-make-path';
        const text = document.createElement('p');
        text.textContent = `Make with ${recipe.name}: ${this.costText(recipe.cost)}.${recipe.station ? ' Stand beside a ' + label(recipe.station).toLowerCase() + '.' : ''}${(recipe.tools || []).length ? ' Keep ' + recipe.tools.map((tool) => this.itemMetadata(tool).name.toLowerCase()).join(', ') + ' in your pack.' : ''}`;
        const button = document.createElement('button'); button.dataset.showRecipe = recipe.id; button.textContent = 'Show recipe'; button.setAttribute('aria-label', 'Show recipe: ' + recipe.name);
        path.append(text, button); details.append(path);
      }
      if (makers.length > 3) { const other = document.createElement('p'); other.textContent = `${makers.length - 3} more ways to make this item are searchable in Crafting.`; details.append(other); }
      if (uses.length) {
        const use = document.createElement('button'); use.dataset.recipeUses = id; use.textContent = `Used in ${uses.length} ${uses.length === 1 ? 'recipe' : 'recipes'}`; use.setAttribute('aria-label', 'Browse recipes using ' + item.name); details.append(use);
      }
      if (!(item.sources || []).length && !makers.length) { const source = document.createElement('p'); source.textContent = 'Gather this resource through its field activity. Search the Journal field guide for mining, gardening and world supplies.'; details.append(source); }
      return details;
    }

    refreshInventory(force) {
      if (!this.state || !this.state.player) return;
      const inventory = this.state.player.inventory || {};
      const recipes = this.reference.recipes;
      const equipment = this.state.player.equipment || {};
      const progression = Sirens.Progression && Sirens.Progression.ensure(this.state);
      const inventorySignature = JSON.stringify(inventory), player = this.state.player;
      const buildQuotes = this.inventoryPane === 'crafting' ? ['barricade', 'campfire'].map((type) => Sirens.Engine.buildQuote(this.state, type)) : [];
      const requirementSignature = JSON.stringify([inventorySignature, equipment.backpack, player.vehicleId, player.x, player.y, player.angle, this.state.ended, this.state.stories && this.state.stories.floor, (this.state.structures || []).map((structure) => [structure.type, structure.x, structure.y]), buildQuotes.map((quote) => [quote.can, quote.missing])]);
      if (requirementSignature !== this.recipeQuoteSignature) { this.recipeQuoteSignature = requirementSignature; this.recipeQuotes.clear(); }
      const vehicle = this.inventoryPane === 'owned' ? this.nearbyVehicle() : null;
      const signature = JSON.stringify([this.inventoryPane, this.itemView, this.sort, this.category, this.family, this.tier, this.itemQuery, this.itemPage, this.recipeQuery, this.recipeFamily, this.recipeTier, this.recipePage, this.readyOnly, inventorySignature, equipment, player.weapon, progression && progression.studied, this.inventoryPane === 'crafting' ? requirementSignature : this.inventoryPane === 'owned' ? [player.vehicleId, vehicle && [vehicle.id, vehicle.speed, vehicle.fuel, vehicle.tank]] : '']);
      if (!force && signature === this.lastInventorySignature) return;
      this.lastInventorySignature = signature;
      this.nodes['items-pane'].hidden = this.inventoryPane === 'crafting';
      this.nodes['crafting-pane'].hidden = this.inventoryPane !== 'crafting';
      this.root.querySelector('#as-inventory-title').textContent = { owned: 'Your pack', catalogue: 'Item catalogue', crafting: 'Crafting & building' }[this.inventoryPane] || 'Your pack';
      this.nodes.sort.closest('label').hidden = this.inventoryPane === 'crafting';
      this.root.querySelector('.as-inventory-actions').hidden = this.itemView === 'catalogue';
      for (const tab of ['owned', 'catalogue', 'crafting']) this.root.querySelector('[data-command="' + tab + '"]').setAttribute('aria-pressed', String(this.inventoryPane === tab));
      const focused = document.activeElement;
      const focusAction = this.inventoryOpen && focused && focused.closest('.as-inventory') && focused.dataset ? ['use', 'equip', 'drop', 'craft', 'action'].map((key) => [key, focused.dataset[key]]).find((entry) => !!entry[1]) : null;
      const weight = this.inventoryWeight(inventory);
      const capacity = Sirens.Engine && typeof Sirens.Engine.carryCapacity === 'function' ? Sirens.Engine.carryCapacity(this.state) : 24;
      this.nodes['inventory-weight'].textContent = `${weight.toFixed(1)} / ${capacity} kg carried`;
      this.nodes['inventory-weight'].classList.toggle('as-weight-full', weight >= capacity - .5);
      const equippedNames = Array.from(new Set([this.state.player.weapon, equipment.clothing, equipment.backpack].filter((id) => typeof id === 'string' && id))).map((id) => this.itemMetadata(id).name);
      this.nodes.equipment.textContent = 'Equipped: ' + (equippedNames.join(' · ') || 'nothing');
      this.nodes['catalogue-note'].hidden = this.itemView !== 'catalogue';
      if (this.inventoryPane !== 'crafting') {
        const openOrigins = new Set(Array.from(this.nodes.items.querySelectorAll('.as-item-origin[open]')).map((details) => details.closest('[data-item]').dataset.item));
        this.nodes.items.replaceChildren();
        const matched = this.matchingItems(inventory, inventorySignature), entries = matched.rows;
        this.nodes['items-count'].textContent = this.itemView === 'catalogue' ? `${entries.length} / ${matched.total} ORIGINAL ITEM DEFINITIONS` : `${entries.length} / ${matched.total} ITEM TYPES IN YOUR PACK`;
        this.nodes['items-count'].dataset.matched = String(entries.length); this.nodes['items-count'].dataset.total = String(matched.total);
        const itemRange = this.refreshPagination('items', entries.length);
        if (!entries.length) {
          const empty = document.createElement('p'); empty.className = 'as-muted'; empty.textContent = matched.total ? 'No items match these filters. Clear filters to browse again.' : 'Your pack is empty. Search marked supplies.'; this.nodes.items.append(empty);
        }
        entries.slice(itemRange.start, itemRange.end).forEach(({ id, item: metadata }) => {
          const quantity = inventory[id] || 0;
          const row = document.createElement('article'); row.className = 'as-item'; row.dataset.item = id;
          row.classList.toggle('as-equipped-item', this.equipped(id));
          const swatch = document.createElement('span'); swatch.className = 'as-item-icon'; swatch.setAttribute('aria-hidden', 'true'); swatch.innerHTML = '<svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">' + (itemSymbols[metadata.category] || itemSymbols.materials) + '</svg>';
          if (/^#[0-9a-f]{3,8}$/i.test(metadata.color || '')) swatch.style.color = metadata.color;
          const detail = document.createElement('div');
          const name = document.createElement('h3'); name.textContent = metadata.name;
          const description = document.createElement('p'); description.textContent = metadata.description;
          const facts = document.createElement('small'); facts.className = 'as-item-facts'; facts.textContent = this.itemFacts(metadata);
          detail.append(name, description, facts);
          if (this.itemView === 'catalogue') {
            const lineage = document.createElement('small'); lineage.className = 'as-item-lineage'; lineage.textContent = `${label(metadata.family || metadata.category)} · Tier ${number(metadata.tier)}${metadata.rarity ? ' · ' + label(metadata.rarity) : ''}`;
            const origin = this.itemOrigins(id); origin.open = openOrigins.has(id); detail.append(lineage, origin);
          }
          const total = document.createElement('div'); total.className = 'as-item-count';
          const count = document.createElement('strong'); count.textContent = this.itemView === 'catalogue' ? label(metadata.category || 'materials') : `×${Math.floor(number(quantity))}`;
          const mass = document.createElement('small'); mass.textContent = `${((this.itemView === 'catalogue' ? 1 : number(quantity)) * number(metadata.weight)).toFixed(2)} kg`;
          total.append(count, mass); row.append(swatch, detail, total); this.nodes.items.append(row);
          if (this.itemView === 'owned') {
            const actions = document.createElement('div'); actions.className = 'as-item-actions';
            const action = document.createElement('button');
            if (metadata.weapon || number(metadata.armor) > 0 || number(metadata.capacity) > 0) {
              action.dataset.equip = id; action.textContent = this.equipped(id) ? 'Equipped' : 'Equip'; action.disabled = this.equipped(id); action.title = 'Equip ' + metadata.name;
            } else if (metadata.effect) {
              action.dataset.use = id; action.textContent = metadata.category === 'food' ? 'Eat' : metadata.category === 'drinks' ? 'Drink' : 'Use'; action.title = 'Use ' + metadata.name;
            } else if (metadata.fuel) {
              action.dataset.use = id; action.textContent = 'Refuel'; action.title = 'Refuel a nearby stopped vehicle with ' + metadata.name;
              const reason = this.fuelReason(this.nearbyVehicle(), id); action.disabled = !!reason; if (reason) action.title = reason;
            } else if (Sirens.Progression && Object.hasOwn(Sirens.Progression.manuals, id)) {
              action.dataset.action = 'study:' + id; action.textContent = Sirens.Progression.ensure(this.state).studied.includes(id) ? 'Studied' : 'Study'; action.disabled = Sirens.Progression.ensure(this.state).studied.includes(id); action.title = 'Study once for 18 practice and 1 insight; keep the reference.';
            }
            if (action.textContent) { action.className = 'as-item-action'; actions.append(action); }
            const drop = document.createElement('button'); drop.className = 'as-item-action as-drop'; drop.dataset.drop = id; drop.textContent = 'Drop'; drop.title = 'Drop 1 ' + metadata.name + ' on the ground';
            const dropReason = this.state.player.vehicleId ? 'Leave the vehicle before dropping supplies' : equipment.backpack === id && quantity === 1 && weight - number(metadata.weight) > 24 + .00001 ? 'Drop heavy supplies before dropping your equipped pack' : '';
            drop.disabled = !!dropReason; if (dropReason) drop.title = dropReason; actions.append(drop);
            row.append(actions);
          }
        });
      }
      if (this.inventoryPane === 'crafting') {
        this.nodes.recipes.replaceChildren();
        const visibleRecipes = this.matchingRecipes(inventory, requirementSignature);
        this.nodes['recipes-count'].textContent = `${visibleRecipes.length} / ${recipes.length} RECIPES`;
        this.nodes['recipes-count'].dataset.matched = String(visibleRecipes.length); this.nodes['recipes-count'].dataset.total = String(recipes.length);
        const recipeRange = this.refreshPagination('recipes', visibleRecipes.length);
        if (!visibleRecipes.length) { const empty = document.createElement('p'); empty.className = 'as-muted'; empty.textContent = 'No recipes match. Clear filters or gather tools and supplies.'; this.nodes.recipes.append(empty); }
        visibleRecipes.slice(recipeRange.start, recipeRange.end).forEach(({ recipe, family, tier }) => {
          const row = document.createElement('article'); row.className = 'as-recipe'; row.dataset.recipe = recipe.id;
          const detail = document.createElement('div');
          const heading = document.createElement('h3'); heading.textContent = recipe.name;
          const description = document.createElement('p'); description.textContent = recipe.description || '';
          const cost = document.createElement('span'); cost.className = 'as-cost'; cost.textContent = this.costText(recipe.cost);
          const result = document.createElement('span'); result.className = 'as-recipe-result'; result.textContent = 'Makes ' + this.costText(recipe.result);
          detail.append(heading, description, cost, result);
          const lineage = document.createElement('small'); lineage.className = 'as-item-lineage'; lineage.textContent = `${label(family)} · Result tier ${tier}`; detail.append(lineage);
          if ((recipe.tools || []).length || recipe.station) {
            const requirements = document.createElement('span'); requirements.className = 'as-recipe-requirements';
            requirements.textContent = [(recipe.tools || []).length ? 'Reusable tools: ' + recipe.tools.map((id) => this.itemMetadata(id).name).join(', ') + ' (compatible versions count)' : '', recipe.station ? 'Station: ' + label(recipe.station) + ' nearby' : ''].filter(Boolean).join(' · ');
            detail.append(requirements);
          }
          const quote = this.recipeQuote(recipe);
          const reason = document.createElement('small'); reason.className = 'as-recipe-missing'; reason.textContent = quote.can ? 'Ready to craft' : quote.missing.join('. '); detail.append(reason);
          reason.classList.toggle('as-ready', quote.can);
          const button = document.createElement('button'); button.dataset.craft = recipe.id; button.textContent = 'Craft'; button.disabled = !quote.can; button.title = reason.textContent;
          row.append(detail, button); this.nodes.recipes.append(row);
        });
        for (const [index, type] of ['barricade', 'campfire'].entries()) {
          const quote = buildQuotes[index], button = this.root.querySelector('[data-build="' + type + '"]'), reason = this.nodes[type + '-reason'];
          button.disabled = !quote.can; reason.textContent = quote.can ? 'Ready on the tile you are aiming toward' : quote.missing.join('. '); reason.classList.toggle('as-ready', quote.can); button.title = reason.textContent;
        }
      }
      this.refreshQuickActions();
      if (focusAction) {
        const replacement = Array.from(this.nodes['inventory-overlay'].querySelectorAll(`[data-${focusAction[0]}]`)).find((button) => button.dataset[focusAction[0]] === focusAction[1] && !button.disabled && button.getClientRects().length);
        if (replacement) replacement.focus({ preventScroll: true });
        else if (this.inventoryOpen) this.nodes['inventory-overlay'].querySelector('.as-close').focus({ preventScroll: true });
      }
    }

    renderEndStats() {
      if (!this.state || !this.state.player) return;
      const elapsed = Math.max(0, Math.floor(number(this.state.elapsed)));
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      ['dead-stats', 'won-stats'].forEach((id) => {
        const node = this.nodes[id]; node.replaceChildren();
        [['Survived', `${minutes}m ${String(seconds).padStart(2, '0')}s`], ['Zombies stopped', String(Math.floor(number(this.state.player.kills)))], ['Day reached', String(Math.max(1, Math.floor(number(this.state.day))))]].forEach(([label, value]) => {
          const cell = document.createElement('div'); const strong = document.createElement('strong'); const span = document.createElement('span'); strong.textContent = value; span.textContent = label; cell.append(strong, span); node.append(cell);
        });
      });
    }

    toast(text, tone) {
      if (this.destroyed) return;
      clearTimeout(this.toastTimer);
      this.nodes.toast.textContent = String(text || '');
      this.nodes.toast.dataset.tone = ['danger', 'warning', 'success'].includes(tone) ? tone : 'normal';
      this.nodes.toast.hidden = false;
      this.toastTimer = setTimeout(() => { if (!this.destroyed) this.nodes.toast.hidden = true; }, 4200);
    }

    destroy() {
      this.destroyed = true;
      clearTimeout(this.toastTimer);
      this.root.removeEventListener('click', this.handleClick);
      this.root.removeEventListener('change', this.handleChange);
      this.root.removeEventListener('input', this.handleInput);
      this.root.removeEventListener('keydown', this.handleKeydown);
      this.root.replaceChildren();
    }
  }
  Sirens.UI = UI;
}());
