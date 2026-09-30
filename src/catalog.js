(function () {
  'use strict';
  const Sirens = window.Sirens = window.Sirens || {};
  const items = {};
  const colors = Object.freeze({ materials: '#bc9c74', food: '#cbb36c', drinks: '#87b5c2', medical: '#d6a39c', tools: '#abb5a6', melee: '#bac59b', firearms: '#a0a7a0', ammo: '#d0b875', clothing: '#a5b4ab', containers: '#a8b889', electronics: '#9abbc2', books: '#c8b29f', utility: '#c3b88d' });
  function add(id, name, category, weight, description, extra) {
    if (items[id]) throw new Error('Duplicate catalogue item: ' + id);
    const metadata = Object.assign({ id, name, category, weight, color: colors[category], description, tags: [category] }, extra || {});
    metadata.tags = Object.freeze(metadata.tags.slice());
    if (metadata.effect) metadata.effect = Object.freeze(Object.assign({}, metadata.effect));
    if (metadata.weapon) metadata.weapon = Object.freeze(Object.assign({}, metadata.weapon));
    items[id] = Object.freeze(metadata);
  }
  function plain(category, rows) {
    rows.forEach((row) => add(row[0], row[1], category, row[2], row[3], row[4]));
  }
  function consumables(category, rows) {
    rows.forEach((row) => add(row[0], row[1], category, row[2], row[3], { effect: row[4], consume: true, tags: [category, 'consumable'] }));
  }
  function melee(id, name, weight, damage, range, cooldown, staminaCost, noise, description, category) {
    add(id, name, category || 'melee', weight, description, { weapon: { kind: 'melee', damage, range, cooldown, staminaCost, noise }, tags: [category || 'melee', 'weapon'] });
  }
  function firearm(id, name, weight, damage, range, cooldown, clipSize, ammoId, noise, description) {
    add(id, name, 'firearms', weight, description, { weapon: { kind: 'firearm', damage, range, cooldown, staminaCost: 2, clipSize, ammoId, noise }, tags: ['firearms', 'weapon'] });
  }

  // Each row is a deliberately selected item, rather than a generated quality or color variant.
  plain('materials', [
    ['wood', 'Timber', 0.8, 'Construction wood for barricades, handles, and improvised equipment.'],
    ['scrap', 'Metal scrap', 0.45, 'Reclaimed metal used in construction and field crafting.'],
    ['parts', 'Radio parts', 0.35, 'Salvaged relay components. Bring five to the radio tower.'],
    ['cloth', 'Cloth strips', 0.12, 'Clean fabric for dressings, bags, and makeshift padding.'],
    ['leather', 'Leather hide', 0.5, 'Tough material for reinforced clothing and carrying gear.'],
    ['thread', 'Thread spool', 0.04, 'Sewing thread for cloth and leather repairs.'],
    ['rope', 'Rope coil', 0.4, 'Strong cord used to lash tools and improvise a pack.'],
    ['wire', 'Wire spool', 0.15, 'Conductive wire for component salvage and bindings.'],
    ['nails', 'Nail box', 0.25, 'Small fasteners for homemade weapons and containers.'],
    ['screws', 'Screw box', 0.2, 'Threaded fasteners for recovered equipment.'],
    ['bolts', 'Bolt set', 0.35, 'Heavy fasteners for more robust field equipment.'],
    ['duct_tape', 'Duct tape', 0.18, 'A repair material for grips, bags, and bindings.'],
    ['resin', 'Pine resin', 0.14, 'Sticky binder used in improvised arrows and cloth patches.'],
    ['charcoal', 'Charcoal', 0.3, 'Carbon for a crude water filter.'],
    ['sand', 'Fine sand', 0.8, 'Filter medium for a basic water treatment recipe.'],
    ['gravel', 'Gravel', 1.2, 'Coarse filter medium collected from river margins.'],
    ['clay', 'Clay lump', 1, 'Stored crafting material. Pottery construction is not implemented.'],
    ['glass', 'Glass fragments', 0.4, 'Ingredient for improvised cutting implements.'],
    ['rubber', 'Rubber strip', 0.2, 'Flexible salvage for grips and protective padding.'],
    ['plastic', 'Plastic pieces', 0.15, 'Light salvage used to assemble utility containers.'],
    ['steel_sheet', 'Steel sheet', 1.8, 'Armor plating for a reinforced protective vest.'],
    ['aluminum_sheet', 'Aluminum sheet', 0.65, 'Light sheet metal for utility and electronics recipes.'],
    ['copper_pipe', 'Copper pipe', 0.8, 'Metal stock used to recover electronic components.'],
    ['gunpowder', 'Gunpowder tin', 0.25, 'Ammunition ingredient. The recipe abstracts safe cartridge assembly.'],
    ['lead', 'Lead ingot', 0.8, 'Heavy metal used by ammunition recipes.'],
    ['primer', 'Primer tray', 0.08, 'Small ammunition components used in cartridge recipes.'],
    ['empty_bottle', 'Empty bottle', 0.2, 'A vessel for water collection and filter assembly.'],
    ['empty_can', 'Empty can', 0.1, 'A tin vessel used to assemble a rough field lantern.'],
    ['spring', 'Coil spring', 0.1, 'Recovered mechanism component for ranged equipment.'],
    ['metal_tube', 'Metal tubing', 0.75, 'Stock for an improvised baton and component salvage.'],
    ['soap', 'Soap bar', 0.09, 'Cleaning ingredient for field dressing preparation.'],
    ['salt', 'Salt packet', 0.08, 'An ingredient for trail food and oral hydration mix.'],
    ['sugar', 'Sugar packet', 0.08, 'An ingredient for drinks and high-energy trail food.'],
    ['fuel', 'Fuel flask', 0.7, 'Twelve game units of fuel for a nearby vehicle.', { fuel: 12 }],
    ['filter_mesh', 'Filter mesh', 0.12, 'Mesh that holds together a crude water filter.']
  ]);

  consumables('food', [
    ['food', 'Trail ration', 0.6, 'A practical meal that restores hunger and a little stamina.', { hunger: 38, stamina: 4 }],
    ['canned_beans', 'Canned beans', 0.45, 'Filling shelf food, with a small hydration benefit.', { hunger: 30, thirst: 5 }],
    ['canned_soup', 'Canned soup', 0.45, 'A modest meal that also eases thirst.', { hunger: 23, thirst: 18 }],
    ['canned_fish', 'Canned fish', 0.22, 'Compact protein; its salt makes you slightly thirstier.', { hunger: 27, thirst: -4 }],
    ['canned_peaches', 'Canned peaches', 0.4, 'Sweet fruit packed in syrup.', { hunger: 20, thirst: 10, stamina: 2 }],
    ['canned_corn', 'Canned corn', 0.35, 'A light meal from a pantry shelf.', { hunger: 22, thirst: 4 }],
    ['canned_stew', 'Canned stew', 0.55, 'Heavy but substantial emergency food.', { hunger: 38, thirst: 6 }],
    ['crackers', 'Cracker sleeve', 0.18, 'Light, dry travel food. Carry water alongside it.', { hunger: 15, thirst: -4 }],
    ['oat_bar', 'Oat bar', 0.09, 'A pocket meal useful during a long walk.', { hunger: 13, stamina: 7 }],
    ['protein_bar', 'Protein bar', 0.1, 'Dense food that restores hunger and stamina.', { hunger: 18, stamina: 8 }],
    ['dried_fruit', 'Dried fruit', 0.15, 'Light travel food with a little quick energy.', { hunger: 17, stamina: 5 }],
    ['nuts', 'Mixed nuts', 0.18, 'Dense calories that increase thirst slightly.', { hunger: 25, thirst: -3 }],
    ['jerky', 'Jerky packet', 0.12, 'Salty dried protein for travel.', { hunger: 23, thirst: -6 }],
    ['bread', 'Bread loaf', 0.4, 'A simple meal that takes up more pack space.', { hunger: 28 }],
    ['peanut_butter', 'Peanut butter jar', 0.35, 'A compact, substantial food supply.', { hunger: 34, thirst: -5 }],
    ['jam', 'Jam jar', 0.3, 'Sweet preserved fruit with modest energy.', { hunger: 17, stamina: 7 }],
    ['honey', 'Honey jar', 0.3, 'A high-energy sweetener, also used in trail mix.', { hunger: 16, stamina: 10 }],
    ['apple', 'Apple', 0.16, 'Fresh fruit with a little water and energy.', { hunger: 10, thirst: 6 }],
    ['pear', 'Pear', 0.18, 'A water-rich piece of orchard fruit.', { hunger: 11, thirst: 8 }],
    ['orange', 'Orange', 0.17, 'Refreshing fruit that eases hunger and thirst.', { hunger: 9, thirst: 11 }],
    ['banana', 'Banana', 0.15, 'A quick snack before a difficult escape.', { hunger: 13, stamina: 6 }],
    ['carrot', 'Carrot bundle', 0.22, 'A light vegetable meal.', { hunger: 13, thirst: 5 }],
    ['tomato', 'Tomato', 0.14, 'Small but useful for thirst as well as hunger.', { hunger: 7, thirst: 10 }],
    ['potato', 'Potato', 0.22, 'A modest food supply that becomes more useful when cooked.', { hunger: 10 }],
    ['rice', 'Rice packet', 0.3, 'A pantry ingredient. Cooking makes this supply much more useful.', { hunger: 8, thirst: -6 }],
    ['oats', 'Rolled oats', 0.25, 'Dry oats are usable, but porridge is more sustaining.', { hunger: 12, thirst: -5 }],
    ['pasta', 'Pasta packet', 0.3, 'A dry ingredient for a campfire meal.', { hunger: 7, thirst: -7 }],
    ['chocolate', 'Chocolate bar', 0.1, 'A little food and a burst of energy.', { hunger: 13, stamina: 12 }],
    ['granola', 'Granola bag', 0.25, 'Dense travel food that is slightly dry.', { hunger: 26, thirst: -4, stamina: 4 }],
    ['porridge', 'Camp porridge', 0.4, 'Cooked oats made with clean water.', { hunger: 34, thirst: 15, stamina: 6 }],
    ['rice_meal', 'Rice and beans', 0.55, 'A filling campfire meal.', { hunger: 48, thirst: 8, stamina: 8 }],
    ['pasta_meal', 'Tomato pasta', 0.5, 'Cooked pasta with a vegetable sauce.', { hunger: 42, thirst: 6, stamina: 6 }],
    ['trail_mix', 'Trail mix', 0.28, 'Combined nuts and dried fruit, easy to carry.', { hunger: 37, stamina: 12, thirst: -3 }],
    ['baked_potato', 'Baked potato', 0.22, 'A simple cooked vegetable meal.', { hunger: 23, stamina: 3 }],
    ['fruit_salad', 'Fruit salad', 0.4, 'Mixed fresh fruit with useful hydration.', { hunger: 25, thirst: 22, stamina: 5 }],
    ['vegetable_soup', 'Vegetable soup', 0.6, 'A hot, water-rich meal from scavenged produce.', { hunger: 36, thirst: 25, stamina: 5 }]
  ]);

  consumables('drinks', [
    ['water', 'Clean water', 0.8, 'Safe water carried in a bottle.', { thirst: 45 }],
    ['soda', 'Lemon soda', 0.35, 'Sweet bottled drink with a small energy benefit.', { thirst: 25, stamina: 5 }],
    ['fruit_juice', 'Fruit juice', 0.4, 'A refreshing drink that also provides a little food.', { thirst: 32, hunger: 6 }],
    ['sports_drink', 'Sports drink', 0.5, 'A useful recovery drink after sprinting.', { thirst: 38, stamina: 12 }],
    ['coconut_water', 'Coconut water', 0.33, 'Light hydration with a small stamina benefit.', { thirst: 30, stamina: 4 }],
    ['milk', 'Shelf milk', 0.5, 'A sealed milk carton that provides food and water.', { thirst: 27, hunger: 14 }],
    ['coffee', 'Camp coffee', 0.25, 'A warm drink with a useful stamina boost.', { thirst: 15, stamina: 20 }],
    ['tea', 'Camp tea', 0.25, 'A gentle warm drink for a short recovery break.', { thirst: 23, stamina: 8 }],
    ['broth', 'Broth flask', 0.4, 'Light food and water in one pack slot.', { thirst: 25, hunger: 12, stamina: 3 }],
    ['energy_drink', 'Energy drink', 0.25, 'More energy than hydration.', { thirst: 16, stamina: 27 }],
    ['rehydration_mix', 'Hydration solution', 0.5, 'An abstracted game drink made from water, sugar, and salt.', { thirst: 55, stamina: 12 }],
    ['dirty_water', 'Untreated water', 0.5, 'Emergency hydration with a significant infection penalty. Filter it first.', { thirst: 25, infection: -12, health: -2 }]
  ]);

  consumables('medical', [
    ['bandage', 'Field bandage', 0.15, 'Stops bleeding and helps recovery in the simplified wound system.', { bleeding: 100, health: 8 }],
    ['gauze', 'Sterile gauze', 0.08, 'A light dressing for minor bleeding.', { bleeding: 45, health: 3 }],
    ['adhesive_dressing', 'Adhesive dressing', 0.05, 'A small dressing for a minor wound.', { bleeding: 30, health: 2 }],
    ['antiseptic', 'Antiseptic bottle', 0.2, 'Reduces the game infection meter. It does not model real medical treatment.', { infection: 15, health: 2 }],
    ['antiseptic_wipes', 'Antiseptic wipes', 0.07, 'Light wound-cleaning supplies for the game infection meter.', { infection: 8, bleeding: 10 }],
    ['antibiotics', 'Antibiotic pack', 0.05, 'A simplified game recovery item that reduces infection.', { infection: 28, health: 4 }],
    ['painkillers', 'Pain relief tablets', 0.03, 'A simplified recovery item with a small health and stamina benefit.', { health: 4, stamina: 10 }],
    ['vitamins', 'Vitamin bottle', 0.04, 'A small supplement with a modest game recovery effect.', { health: 2, stamina: 6 }],
    ['tourniquet', 'Tourniquet', 0.08, 'Rapid bleeding control with a small health cost in this abstract wound model.', { bleeding: 100, health: -2 }],
    ['suture_kit', 'Suture kit', 0.18, 'A stronger prepared dressing for the simplified wound system.', { bleeding: 100, health: 16, infection: 5 }],
    ['splint', 'Field splint', 0.35, 'A generic recovery item. Separate limb injuries are not implemented.', { health: 12, stamina: 5 }],
    ['burn_gel', 'Burn dressing', 0.12, 'A generic wound recovery item in the current health model.', { health: 11, infection: 3 }],
    ['first_aid_kit', 'First aid kit', 0.65, 'A substantial one-use supply for bleeding, health, and infection.', { health: 30, bleeding: 100, infection: 18 }],
    ['emergency_dressing', 'Emergency dressing', 0.18, 'A reinforced field dressing for more serious bleeding.', { bleeding: 100, health: 14 }],
    ['herbal_poultice', 'Herbal compress', 0.15, 'An improvised game dressing with modest recovery effects.', { bleeding: 25, health: 6, infection: 3 }]
  ]);

  plain('tools', [
    ['hammer', 'Claw hammer', 0.9, 'A reusable prerequisite for assembling wooden equipment.'],
    ['screwdriver', 'Screwdriver', 0.15, 'A reusable prerequisite for electronics salvage.'],
    ['wrench', 'Adjustable wrench', 0.7, 'A reusable prerequisite for metal equipment recipes.'],
    ['saw', 'Hand saw', 0.55, 'A reusable prerequisite for cutting handles and frames.'],
    ['wire_cutters', 'Wire cutters', 0.3, 'A reusable prerequisite for wire and component salvage.'],
    ['pliers', 'Pliers', 0.25, 'A reusable prerequisite for cartridge recovery.'],
    ['sewing_kit', 'Sewing kit', 0.12, 'A reusable prerequisite for bags and protective clothing.'],
    ['cooking_pot', 'Cooking pot', 0.8, 'A reusable prerequisite for campfire meals and clean water.'],
    ['lighter', 'Pocket lighter', 0.05, 'A recipe tool for lamp assembly. Fire simulation is not implemented.'],
    ['firestarter', 'Fire steel', 0.08, 'A reusable prerequisite for a field lantern recipe.'],
    ['sharpening_stone', 'Sharpening stone', 0.3, 'A reusable prerequisite for edged field equipment.'],
    ['file', 'Metal file', 0.2, 'A reusable prerequisite for rough metal weapons.'],
    ['drill', 'Hand drill', 0.85, 'A reusable prerequisite for a crossbow assembly.'],
    ['mortar', 'Mortar and pestle', 0.6, 'A reusable prerequisite for an improvised dressing.'],
    ['funnel', 'Funnel', 0.08, 'A reusable prerequisite for the hydration solution recipe.'],
    ['reloading_press', 'Reloading press', 2.8, 'A reusable prerequisite for abstract ammunition crafting.'],
    ['needle', 'Heavy needle', 0.01, 'A reusable prerequisite for a cloth pack and simple wraps.'],
    ['tin_snips', 'Tin snips', 0.45, 'A reusable prerequisite for sheet-metal reinforcement.']
  ]);
  melee('hatchet', 'Hatchet', 1.1, 33, 66, 0.54, 13, 110, 'A short-range edge that also serves as a reusable crafting tool.', 'tools');
  melee('pickaxe', 'Pickaxe', 2.8, 52, 85, 1.02, 24, 155, 'A heavy tool with a strong hit and slow recovery.', 'tools');

  melee('bat', 'Baseball bat', 1.2, 36, 78, 0.47, 8, 150, 'A dependable reach weapon with manageable stamina use.');
  melee('crowbar', 'Crowbar', 1.6, 32, 72, 0.57, 12, 115, 'A durable striking tool and reusable crafting prerequisite.');
  melee('kitchen_knife', 'Kitchen knife', 0.2, 20, 48, 0.3, 5, 42, 'Fast and light, but dangerously short-ranged.');
  melee('shard_knife', 'Wrapped glass edge', 0.13, 14, 44, 0.28, 4, 32, 'An improvised light edge with low damage and very short reach.');
  melee('machete', 'Machete', 0.75, 38, 65, 0.47, 11, 75, 'An effective edge with shorter reach than a bat.');
  melee('fire_axe', 'Fire axe', 2.2, 48, 84, 0.78, 19, 135, 'Strong impact with a noticeable recovery time.');
  melee('sledgehammer', 'Sledgehammer', 4.4, 66, 90, 1.24, 31, 190, 'Very heavy impact, with a severe stamina cost.');
  melee('shovel', 'Shovel', 1.9, 31, 88, 0.66, 15, 120, 'Long reach and moderate impact from a common garden tool.');
  melee('spear', 'Wooden spear', 1.1, 32, 102, 0.64, 13, 65, 'Longer reach than most hand weapons.');
  melee('staff', 'Walking staff', 0.8, 20, 94, 0.48, 7, 58, 'A light reach weapon with limited impact.');
  melee('rolling_pin', 'Rolling pin', 0.55, 17, 55, 0.38, 6, 67, 'A kitchen fallback with short reach.');
  melee('pipe_wrench', 'Pipe wrench', 1.8, 35, 65, 0.62, 14, 112, 'A heavy compact striking weapon.');
  melee('frying_pan', 'Frying pan', 1.0, 24, 60, 0.5, 10, 150, 'A noisy emergency weapon and reusable cooking tool.');
  melee('cleaver', 'Meat cleaver', 0.45, 30, 51, 0.41, 8, 70, 'A strong close-range edge.');
  melee('tire_iron', 'Tire iron', 0.8, 26, 64, 0.43, 9, 105, 'A compact metal weapon from a garage.');
  melee('metal_pipe', 'Pipe baton', 1.2, 29, 77, 0.52, 11, 110, 'A simple metal reach weapon assembled from tubing.');
  melee('sickle', 'Sickle', 0.6, 26, 59, 0.4, 8, 60, 'A short agricultural edge with quick recovery.');
  melee('pitchfork', 'Pitchfork', 1.5, 34, 108, 0.76, 15, 85, 'Long agricultural reach with a slower attack.');
  melee('spiked_bat', 'Nailed bat', 1.45, 38, 78, 0.57, 13, 105, 'A reinforced bat that trades stamina and speed for damage.');

  firearm('pistol', 'Service pistol', 0.85, 85, 670, 0.24, 8, 'ammo', 690, 'A general-purpose sidearm using standard pistol rounds.');
  firearm('revolver', 'Revolver', 1.05, 63, 520, 0.48, 6, 'magnum_round', 580, 'Six powerful shots with slower recovery.');
  firearm('hunting_rifle', 'Hunting rifle', 3.2, 76, 880, 0.87, 5, 'rifle_round', 780, 'A long-range hunting arm with a small magazine.');
  firearm('shotgun', 'Pump shotgun', 3.4, 87, 330, 0.87, 6, 'shotgun_shell', 850, 'High close-range damage. The current ranged model uses one target per shot.');
  firearm('carbine', 'Utility carbine', 2.6, 51, 710, 0.29, 20, 'rifle_round', 700, 'A lighter rifle with a larger magazine.');
  firearm('bolt_rifle', 'Precision rifle', 4.1, 101, 1060, 1.18, 5, 'heavy_round', 900, 'Very long reach and a slow follow-up shot.');
  firearm('smg', 'Compact automatic', 2.35, 31, 430, 0.12, 24, 'ammo', 620, 'Rapid shots burn through common pistol ammunition.');
  firearm('doublebarrel', 'Double-barrel shotgun', 3.1, 99, 305, 0.58, 2, 'shotgun_shell', 850, 'Two hard hits before the next reload.');
  firearm('lever_rifle', 'Lever-action rifle', 3.3, 64, 690, 0.62, 8, 'magnum_round', 740, 'A moderate-range rifle sharing ammunition with the revolver.');
  firearm('hunting_bow', 'Hunting bow', 0.95, 39, 410, 0.95, 1, 'arrow', 60, 'A quiet ranged weapon. Arrows use the current direct-shot abstraction.');
  firearm('crossbow', 'Field crossbow', 2.2, 61, 530, 1.25, 1, 'crossbow_bolt', 75, 'A quiet single-shot weapon with slow recovery.');

  plain('ammo', [
    ['ammo', 'Pistol round', 0.04, 'A single standard pistol cartridge for the service pistol or compact automatic.'],
    ['rifle_round', 'Rifle round', 0.022, 'A single medium rifle cartridge for the hunting rifle or carbine.'],
    ['heavy_round', 'Heavy rifle round', 0.035, 'A larger rifle cartridge for the precision rifle.'],
    ['magnum_round', 'Large handgun round', 0.02, 'A powerful cartridge for the revolver or lever-action rifle.'],
    ['shotgun_shell', 'Shotgun shell', 0.045, 'A single shell for the pump or double-barrel shotgun.'],
    ['arrow', 'Hunting arrow', 0.045, 'A shaft for a hunting bow. Fired arrows are not recoverable yet.'],
    ['crossbow_bolt', 'Crossbow bolt', 0.055, 'A shaft for a crossbow. Fired bolts are not recoverable yet.']
  ]);

  [
    ['work_jacket', 'Work jacket', 0.9, 0.07, 'A modest protective outer layer.'],
    ['leather_jacket', 'Leather jacket', 1.6, 0.15, 'A tougher outer layer with useful damage reduction.'],
    ['motorcycle_jacket', 'Riding jacket', 2.1, 0.22, 'Reinforced leather protection at a weight cost.'],
    ['denim_jacket', 'Denim jacket', 1.0, 0.09, 'Practical everyday protection.'],
    ['raincoat', 'Raincoat', 0.7, 0.04, 'A light protective layer. Weather resistance is not modeled yet.'],
    ['canvas_coat', 'Canvas coat', 1.4, 0.12, 'Heavy cloth with more protection than a work jacket.'],
    ['padded_vest', 'Padded vest', 1.2, 0.18, 'A craftable padded layer with useful damage reduction.'],
    ['ballistic_vest', 'Protective vest', 3.5, 0.38, 'The strongest protective clothing in this build, with a substantial weight cost.'],
    ['hard_hat', 'Hard hat', 0.45, 0.06, 'Protective gear using the single clothing-slot abstraction.'],
    ['welding_apron', 'Welding apron', 1.3, 0.13, 'A heavy protective garment from an industrial workshop.'],
    ['riot_helmet', 'Protective helmet', 1.4, 0.21, 'Strong headgear using the single clothing-slot abstraction.'],
    ['work_gloves', 'Work gloves', 0.18, 0.03, 'Light work protection using the single clothing-slot abstraction.'],
    ['work_boots', 'Work boots', 1.2, 0.06, 'Sturdy footwear using the single clothing-slot abstraction.'],
    ['padded_coat', 'Quilted coat', 1.8, 0.16, 'A handmade padded layer. Temperature insulation is not modeled yet.']
  ].forEach((row) => add(row[0], row[1], 'clothing', row[2], row[4], { armor: row[3], tags: ['clothing', 'protective'] }));

  [
    ['canvas_pack', 'Canvas backpack', 0.55, 8, 'An everyday backpack that adds eight kilograms of carrying capacity.'],
    ['hiking_pack', 'Hiking backpack', 1.0, 14, 'A travel pack that adds fourteen kilograms of carrying capacity.'],
    ['military_pack', 'Field backpack', 1.45, 18, 'A heavy load-bearing pack that adds eighteen kilograms of capacity.'],
    ['messenger_bag', 'Messenger bag', 0.4, 5, 'A compact bag that adds five kilograms of capacity.'],
    ['duffel_bag', 'Duffel bag', 0.7, 11, 'A large carrying bag that adds eleven kilograms of capacity.'],
    ['tool_belt', 'Tool belt', 0.45, 3, 'A small carrying option that occupies the single backpack slot.'],
    ['dry_bag', 'Roll-top bag', 0.5, 7, 'A light travel bag. Water damage is not modeled yet.'],
    ['burlap_sack', 'Burlap sack', 0.25, 4, 'A crude, craftable carrying option.'],
    ['frame_pack', 'Wood-frame pack', 1.3, 16, 'A heavy craftable pack with excellent carrying capacity.']
  ].forEach((row) => add(row[0], row[1], 'containers', row[2], row[4], { capacity: row[3], tags: ['containers', 'backpack'] }));

  plain('electronics', [
    ['circuit_board', 'Circuit board', 0.08, 'Electronics salvage used to assemble relay parts.'],
    ['transistor', 'Transistor bundle', 0.02, 'Small electronics ingredients for relay and board recipes.'],
    ['capacitor', 'Capacitor bundle', 0.04, 'Stored-charge components for electronics salvage.'],
    ['resistor', 'Resistor bundle', 0.02, 'Electronics components used for a salvaged circuit board.'],
    ['battery_cell', 'Battery cell', 0.08, 'A power component for a lantern and relay parts. Battery drain is not modeled yet.'],
    ['hand_radio', 'Handheld radio', 0.3, 'Can be dismantled into useful relay parts. Portable voice communication is not implemented.'],
    ['electric_motor', 'Small electric motor', 0.55, 'Can be dismantled for wire and metal.'],
    ['car_battery', 'Vehicle battery', 5.5, 'A vehicle component and battery-cell salvage source. Electrical networks are not implemented.'],
    ['flashlight', 'Flashlight', 0.2, 'A lantern ingredient. The whole surrounding view stays readable.'],
    ['headlamp', 'Headlamp', 0.12, 'A utility collectible. Separate lamp equipment and battery drain are not implemented.'],
    ['solar_panel', 'Portable solar panel', 2.5, 'A salvage source for cells and metal. Electrical networks are not implemented.'],
    ['power_bank', 'Power bank', 0.2, 'Can be dismantled into battery cells. Device charging is not implemented.']
  ]);

  plain('books', [
    ['first_aid_manual', 'Field care manual', 0.35, 'Study once for field care practice and insight. Keep this reference for treatment projects and recipes.'],
    ['tailoring_manual', 'Stitching handbook', 0.3, 'A reusable prerequisite for stronger protective clothing.'],
    ['electronics_manual', 'Circuit repair handbook', 0.45, 'A reusable prerequisite for board and radio component recipes.'],
    ['cooking_manual', 'Camp kitchen notebook', 0.3, 'A reusable prerequisite for more efficient trail rations.'],
    ['reloading_manual', 'Ammunition workshop notes', 0.4, 'A reusable prerequisite for abstract cartridge recipes.'],
    ['woodcraft_manual', 'Woodcraft handbook', 0.35, 'A reusable prerequisite for a bow and frame pack.'],
    ['field_guide', 'Local plant guide', 0.3, 'A reusable prerequisite for the herbal compress recipe. Foraging skills are not implemented.'],
    ['route_atlas', 'County route atlas', 0.5, 'A travel collectible. It does not reveal unexplored terrain in this build.']
  ]);

  plain('utility', [
    ['coffee_beans', 'Coffee beans', 0.15, 'An ingredient for a campfire coffee recipe.'],
    ['tea_leaves', 'Tea leaves', 0.08, 'An ingredient for a campfire tea recipe.'],
    ['herbs', 'Dried herbs', 0.05, 'An ingredient for a simple game dressing and tea.'],
    ['compass', 'Pocket compass', 0.09, 'A navigation collectible. The minimap already shows your location.'],
    ['binoculars', 'Binoculars', 0.65, 'An exploration collectible. Extended sight is not implemented yet.'],
    ['whistle', 'Metal whistle', 0.02, 'A utility collectible. A deliberate noise action is not implemented yet.'],
    ['flare', 'Signal flare', 0.2, 'A lantern ingredient. Dedicated flare lighting and distress signals are not implemented.'],
    ['candle', 'Candle', 0.1, 'An ingredient for a crude field lantern.'],
    ['tarp', 'Tarpaulin', 0.8, 'Useful cloth salvage and a pack ingredient. Shelter roofs are not implemented yet.'],
    ['sleeping_bag', 'Sleeping bag', 1.5, 'A cloth salvage source. Use Journal sleep indoors or beside a campfire; separate bed structures are not implemented.'],
    ['blanket', 'Wool blanket', 0.7, 'A cloth salvage source and ingredient for padded clothing.'],
    ['water_filter', 'Field water filter', 0.3, 'A reusable prerequisite for turning untreated water into clean water.'],
    ['lantern', 'Field lantern', 0.45, 'An assembled utility collectible. Separate light equipment is not implemented yet.'],
    ['repair_kit', 'General repair kit', 0.6, 'A reusable prerequisite for salvaging radios. Item durability is not implemented yet.']
  ]);

  plain('materials', [
    ['stone', 'Stone chunks', .65, 'Mine surface deposits or scavenge stone to make a first pick.'],
    ['iron_ore', 'Iron ore', .8, 'A mined resource used by the abstract campfire iron recipe.'],
    ['copper_ore', 'Copper ore', .65, 'A mined resource used to recover wire at a campfire.'],
    ['iron_ingot', 'Iron ingot', .6, 'Processed metal for a stronger mining pick.']
  ]);
  plain('utility', [['carrot_seeds', 'Carrot seeds', .02, 'Plant a garden beside your base. Water it and harvest food and seed for the next crop.']]);
  melee('stone_pick', 'Stone mining pick', 1.3, 16, 58, .82, 14, 120, 'A first mining tool. Break stone, iron and copper surface deposits.');
  melee('iron_pick', 'Iron mining pick', 1.6, 28, 62, .7, 15, 130, 'A stronger mining tool that breaks deposits in fewer swings.');

  const recipes = [];
  function recipe(id, name, cost, result, description, tools, station) {
    const entry = { id, name, cost: Object.freeze(cost), result: Object.freeze(result), description };
    if (tools && tools.length) entry.tools = Object.freeze(tools.slice());
    if (station) entry.station = station;
    recipes.push(Object.freeze(entry));
  }
  // These three recipe identifiers remain compatible with the first rescue build.
  recipe('field_wraps', 'Field wraps', { scrap: 2 }, { bandage: 2 }, 'Recover clean fabric and fasteners for two field dressings.');
  recipe('recover_rounds', 'Recover pistol rounds', { scrap: 4 }, { ammo: 8 }, 'Abstract recovery of eight usable pistol rounds from mixed salvage.');
  recipe('collect_water', 'Collect clean water', { wood: 2, scrap: 2 }, { water: 2 }, 'A legacy rescue-mode condenser recipe. Requires a nearby campfire.', [], 'campfire');
  recipe('cloth_wraps', 'Clean cloth wraps', { cloth: 2, soap: 1 }, { bandage: 2 }, 'Prepare two field dressings from fabric and cleaning supplies.', ['needle']);
  recipe('emergency_wraps', 'Emergency dressing', { gauze: 2, cloth: 1, duct_tape: 1 }, { emergency_dressing: 1 }, 'Assemble a stronger one-use wound dressing.');
  recipe('prepare_sutures', 'Prepare a suture kit', { thread: 1, gauze: 2, antiseptic: 1 }, { suture_kit: 1 }, 'Combine prepared supplies into a stronger simplified recovery item.', ['needle', 'first_aid_manual']);
  recipe('prepare_splint', 'Lash a field splint', { wood: 1, cloth: 2, duct_tape: 1 }, { splint: 1 }, 'Prepare a generic recovery item from wood and fabric.');
  recipe('assemble_first_aid', 'Assemble first aid kit', { bandage: 2, antiseptic: 1, painkillers: 1, cloth: 1 }, { first_aid_kit: 1 }, 'Organize treatment supplies into one substantial recovery item.', ['first_aid_manual']);
  recipe('herbal_compress', 'Herbal compress', { herbs: 2, cloth: 1, water: 1 }, { herbal_poultice: 2 }, 'Prepare two modest recovery items in the simplified wound model.', ['mortar', 'field_guide']);
  recipe('filter_water', 'Filter untreated water', { dirty_water: 1 }, { water: 1 }, 'Turn one untreated supply into clean drinking water.', ['water_filter']);
  recipe('boil_water', 'Boil untreated water', { dirty_water: 2, wood: 1 }, { water: 2 }, 'Prepare two clean water supplies over a nearby campfire.', ['cooking_pot'], 'campfire');
  recipe('build_filter', 'Assemble field filter', { charcoal: 2, sand: 1, gravel: 1, filter_mesh: 1, empty_bottle: 1 }, { water_filter: 1 }, 'Build a reusable tool for the water-filtering recipe.');
  recipe('hydration_solution', 'Mix hydration solution', { water: 1, salt: 1, sugar: 1 }, { rehydration_mix: 1 }, 'Assemble a game recovery drink. Ingredient units are abstract.', ['funnel']);
  recipe('cook_porridge', 'Cook camp porridge', { oats: 1, water: 1, wood: 1 }, { porridge: 2 }, 'Make two nourishing cooked meals.', ['cooking_pot'], 'campfire');
  recipe('cook_rice', 'Rice and beans', { rice: 1, canned_beans: 1, water: 1, wood: 1 }, { rice_meal: 2 }, 'Cook two substantial camp meals.', ['cooking_pot'], 'campfire');
  recipe('cook_pasta', 'Tomato pasta', { pasta: 1, tomato: 2, water: 1, wood: 1 }, { pasta_meal: 2 }, 'Cook two filling meals from pantry and garden supplies.', ['cooking_pot'], 'campfire');
  recipe('bake_potatoes', 'Bake potatoes', { potato: 3, wood: 1 }, { baked_potato: 3 }, 'Make three cooked vegetable meals.', [], 'campfire');
  recipe('vegetable_stew', 'Vegetable soup', { carrot: 1, tomato: 1, potato: 1, water: 1, wood: 1 }, { vegetable_soup: 2 }, 'Prepare two water-rich vegetable meals.', ['cooking_pot'], 'campfire');
  recipe('mix_trail_food', 'Mix trail food', { nuts: 1, dried_fruit: 1, honey: 1 }, { trail_mix: 2 }, 'Combine scavenged pantry foods into travel meals.');
  recipe('make_rations', 'Pack travel rations', { crackers: 1, jerky: 1, dried_fruit: 1 }, { food: 2 }, 'Organize two compact trail rations.', ['cooking_manual']);
  recipe('fruit_bowl', 'Cut fruit salad', { apple: 1, pear: 1, orange: 1 }, { fruit_salad: 2 }, 'Prepare two refreshing fruit meals.', ['kitchen_knife']);
  recipe('brew_coffee', 'Brew camp coffee', { coffee_beans: 1, water: 1, wood: 1 }, { coffee: 2 }, 'Brew two modest energy drinks.', ['cooking_pot'], 'campfire');
  recipe('brew_tea', 'Brew camp tea', { tea_leaves: 1, water: 1, wood: 1 }, { tea: 2 }, 'Brew two warm recovery drinks.', ['cooking_pot'], 'campfire');
  recipe('sew_sack', 'Sew a carrying sack', { cloth: 4, thread: 1 }, { burlap_sack: 1 }, 'A basic capacity upgrade for a light pack.', ['needle']);
  recipe('sew_canvas_pack', 'Sew canvas backpack', { cloth: 6, rope: 1, thread: 2 }, { canvas_pack: 1 }, 'Assemble an everyday carrying upgrade.', ['sewing_kit']);
  recipe('sew_rolltop', 'Make a roll-top bag', { tarp: 1, duct_tape: 2, rope: 1 }, { dry_bag: 1 }, 'A light carrying upgrade from flexible salvage.');
  recipe('build_frame_pack', 'Build a wood-frame pack', { wood: 4, cloth: 4, rope: 2, bolts: 1 }, { frame_pack: 1 }, 'A large capacity upgrade at a weight cost.', ['saw', 'hammer', 'woodcraft_manual']);
  recipe('sew_tool_belt', 'Sew a tool belt', { leather: 2, thread: 1, screws: 1 }, { tool_belt: 1 }, 'A compact capacity upgrade for shorter trips.', ['sewing_kit']);
  recipe('pad_vest', 'Sew a padded vest', { cloth: 5, blanket: 1, thread: 2 }, { padded_vest: 1 }, 'Assemble a protective clothing upgrade.', ['sewing_kit']);
  recipe('reinforce_vest', 'Reinforce protective vest', { padded_vest: 1, steel_sheet: 2, duct_tape: 2, leather: 2 }, { ballistic_vest: 1 }, 'Make a strong, heavy protective layer.', ['tin_snips', 'sewing_kit', 'tailoring_manual']);
  recipe('quilt_coat', 'Sew a quilted coat', { canvas_coat: 1, blanket: 2, thread: 2 }, { padded_coat: 1 }, 'Improve protection using padded fabric.', ['sewing_kit', 'tailoring_manual']);
  recipe('shape_staff', 'Shape walking staff', { wood: 2 }, { staff: 1 }, 'A light, low-stamina reach weapon.', ['kitchen_knife']);
  recipe('wrap_glass_edge', 'Wrap a glass edge', { glass: 1, duct_tape: 1, cloth: 1 }, { shard_knife: 1 }, 'A short-range emergency weapon assembled from salvage.');
  recipe('carve_spear', 'Carve wooden spear', { wood: 2, rope: 1 }, { spear: 1 }, 'A long reach weapon assembled from common supplies.', ['kitchen_knife']);
  recipe('assemble_baton', 'Assemble pipe baton', { metal_tube: 1, duct_tape: 1 }, { metal_pipe: 1 }, 'A dependable metal reach weapon.', ['file']);
  recipe('spike_bat', 'Reinforce a baseball bat', { bat: 1, nails: 1, duct_tape: 1 }, { spiked_bat: 1 }, 'Trade speed and stamina efficiency for more damage.', ['hammer']);
  recipe('forge_edge', 'Make a rough machete', { steel_sheet: 1, wood: 1, rubber: 1, bolts: 1 }, { machete: 1 }, 'A deliberately abstract field assembly recipe.', ['file', 'wrench', 'sharpening_stone']);
  recipe('build_bow', 'Build a hunting bow', { wood: 3, rope: 2, leather: 1 }, { hunting_bow: 1 }, 'A quiet single-shot ranged weapon.', ['saw', 'woodcraft_manual']);
  recipe('build_crossbow', 'Assemble field crossbow', { wood: 3, steel_sheet: 1, spring: 2, rope: 1, screws: 1 }, { crossbow: 1 }, 'A strong, quiet ranged weapon with a slow follow-up.', ['saw', 'drill', 'woodcraft_manual']);
  recipe('fletch_arrows', 'Make hunting arrows', { wood: 1, scrap: 1, resin: 1 }, { arrow: 8 }, 'Assemble eight abstracted bow shafts.', ['kitchen_knife']);
  recipe('make_bolts', 'Make crossbow bolts', { wood: 1, scrap: 2, duct_tape: 1 }, { crossbow_bolt: 8 }, 'Assemble eight shafts for the crossbow.', ['saw']);
  recipe('press_pistol_rounds', 'Assemble pistol rounds', { lead: 1, gunpowder: 1, primer: 1, scrap: 1 }, { ammo: 18 }, 'Abstract ammunition crafting, not real assembly instructions.', ['reloading_press', 'reloading_manual']);
  recipe('press_rifle_rounds', 'Assemble rifle rounds', { lead: 1, gunpowder: 2, primer: 1, scrap: 2 }, { rifle_round: 14 }, 'Abstract ammunition crafting, not real assembly instructions.', ['reloading_press', 'reloading_manual']);
  recipe('press_heavy_rounds', 'Assemble heavy rifle rounds', { lead: 2, gunpowder: 2, primer: 1, scrap: 2 }, { heavy_round: 10 }, 'Abstract ammunition crafting for the precision rifle.', ['reloading_press', 'reloading_manual']);
  recipe('press_large_rounds', 'Assemble large handgun rounds', { lead: 1, gunpowder: 2, primer: 1, scrap: 1 }, { magnum_round: 12 }, 'Abstract ammunition crafting for revolver and lever rifle.', ['reloading_press', 'reloading_manual']);
  recipe('assemble_shells', 'Assemble shotgun shells', { lead: 2, gunpowder: 2, primer: 1, plastic: 1 }, { shotgun_shell: 10 }, 'Abstract shotgun ammunition crafting.', ['reloading_press', 'reloading_manual']);
  recipe('salvage_radio', 'Dismantle handheld radio', { hand_radio: 1 }, { parts: 2, wire: 1 }, 'Recover relay components from a portable radio.', ['screwdriver', 'repair_kit']);
  recipe('assemble_radio_parts', 'Assemble relay parts', { circuit_board: 1, wire: 2, transistor: 1, battery_cell: 1 }, { parts: 2 }, 'Prepare components that work with the radio rescue objective.', ['screwdriver', 'electronics_manual']);
  recipe('salvage_motor', 'Dismantle electric motor', { electric_motor: 1 }, { wire: 3, scrap: 2 }, 'Recover conductive wire and useful metal.', ['screwdriver', 'wire_cutters']);
  recipe('salvage_battery', 'Recover battery cells', { car_battery: 1 }, { battery_cell: 12, lead: 2 }, 'An abstract salvage recipe, not real battery handling guidance.', ['wrench']);
  recipe('salvage_powerbank', 'Dismantle power bank', { power_bank: 1 }, { battery_cell: 3, circuit_board: 1 }, 'Recover cells and a small board.', ['screwdriver']);
  recipe('salvage_panel', 'Dismantle solar panel', { solar_panel: 1 }, { battery_cell: 3, aluminum_sheet: 2, wire: 2 }, 'An abstract electronics salvage recipe.', ['screwdriver', 'wire_cutters']);
  recipe('assemble_board', 'Assemble salvaged circuit', { resistor: 2, capacitor: 1, transistor: 1, wire: 1, plastic: 1 }, { circuit_board: 1 }, 'Build a board used to prepare relay parts.', ['screwdriver', 'electronics_manual']);
  recipe('strip_pipe', 'Recover copper wire', { copper_pipe: 1 }, { wire: 4 }, 'An abstract conversion from conductive salvage.', ['wire_cutters']);
  recipe('salvage_blanket', 'Cut blanket into cloth', { blanket: 1 }, { cloth: 5 }, 'Turn a bulky textile into lighter useful fabric.', ['kitchen_knife']);
  recipe('salvage_tarp', 'Cut tarp into material', { tarp: 1 }, { cloth: 4, plastic: 2 }, 'Recover material for pack and crafting recipes.', ['kitchen_knife']);
  recipe('salvage_sleeping_bag', 'Recover bedding fabric', { sleeping_bag: 1 }, { cloth: 7, thread: 2 }, 'Recover useful fabric from a bulky collectible.', ['kitchen_knife']);
  recipe('salvage_coat', 'Recover leather', { leather_jacket: 1 }, { leather: 3, thread: 1 }, 'Trade protective clothing for crafting material.', ['kitchen_knife']);
  recipe('make_lantern', 'Assemble field lantern', { empty_can: 1, candle: 1, wire: 1 }, { lantern: 1 }, 'A utility collectible. Separate lamp equipment remains future work.', ['firestarter']);
  recipe('electric_lantern', 'Assemble electric lantern', { flashlight: 1, battery_cell: 2, aluminum_sheet: 1, screws: 1 }, { lantern: 1 }, 'A collectible electronics project, not an equipped light yet.', ['screwdriver']);
  recipe('assemble_repair_kit', 'Pack a repair kit', { duct_tape: 2, wire: 2, screws: 1, cloth: 1 }, { repair_kit: 1 }, 'A reusable prerequisite for handheld-radio salvage.');

  recipe('stone_mining_pick', 'Make a stone mining pick', { stone: 3, wood: 2, rope: 1 }, { stone_pick: 1 }, 'A reusable tool for mining seeded surface deposits.');
  recipe('smelt_iron', 'Process iron ore', { iron_ore: 2, charcoal: 1 }, { iron_ingot: 1 }, 'An abstract game processing recipe beside a campfire.', [], 'campfire');
  recipe('draw_copper_wire', 'Recover copper wire', { copper_ore: 2, charcoal: 1 }, { wire: 2 }, 'Recover wire for electronics projects beside a campfire.', ['hammer'], 'campfire');
  recipe('iron_mining_pick', 'Make an iron mining pick', { iron_ingot: 2, wood: 2, stone_pick: 1 }, { iron_pick: 1 }, 'Upgrade the first pick into a faster mining tool.', ['hammer']);

  function entries(rows) {
    return Object.freeze(rows.map((row) => Object.freeze({ id: row[0], min: row[1], max: row[2], weight: row[3] })));
  }
  const pantry = [ ['carrot_seeds', 1, 3, 4], ['canned_beans', 1, 3, 10], ['canned_soup', 1, 2, 8], ['canned_fish', 1, 2, 6], ['canned_peaches', 1, 2, 5], ['canned_corn', 1, 2, 6], ['canned_stew', 1, 2, 5], ['crackers', 1, 3, 8], ['oats', 1, 2, 6], ['rice', 1, 2, 6], ['pasta', 1, 2, 6], ['food', 1, 3, 9], ['water', 1, 3, 10], ['sugar', 1, 2, 4], ['salt', 1, 2, 4] ];
  const workshop = [ ['stone', 1, 4, 5], ['iron_ore', 1, 3, 4], ['copper_ore', 1, 3, 4], ['charcoal', 1, 3, 5], ['wood', 2, 7, 12], ['scrap', 2, 6, 12], ['nails', 1, 3, 9], ['screws', 1, 3, 8], ['bolts', 1, 2, 6], ['duct_tape', 1, 2, 7], ['rope', 1, 2, 6], ['hammer', 1, 1, 5], ['saw', 1, 1, 4], ['wrench', 1, 1, 4], ['screwdriver', 1, 1, 6], ['wire_cutters', 1, 1, 3], ['pliers', 1, 1, 4], ['metal_tube', 1, 2, 6], ['rubber', 1, 3, 5], ['plastic', 1, 3, 5] ];
  const household = [ ['cloth', 1, 4, 9], ['thread', 1, 3, 6], ['blanket', 1, 1, 5], ['soap', 1, 2, 6], ['empty_bottle', 1, 3, 8], ['empty_can', 1, 2, 5], ['sewing_kit', 1, 1, 3], ['kitchen_knife', 1, 1, 5], ['frying_pan', 1, 1, 4], ['cooking_pot', 1, 1, 4], ['candle', 1, 2, 4], ['lighter', 1, 1, 5], ['flashlight', 1, 1, 4], ['needle', 1, 2, 6] ];
  const clinic = [ ['bandage', 1, 4, 12], ['gauze', 1, 4, 10], ['adhesive_dressing', 1, 3, 8], ['antiseptic', 1, 2, 7], ['antiseptic_wipes', 1, 3, 9], ['antibiotics', 1, 2, 4], ['painkillers', 1, 2, 7], ['vitamins', 1, 2, 6], ['tourniquet', 1, 1, 3], ['suture_kit', 1, 1, 3], ['splint', 1, 1, 4], ['burn_gel', 1, 2, 4], ['first_aid_kit', 1, 1, 2], ['emergency_dressing', 1, 2, 4], ['first_aid_manual', 1, 1, 3] ];
  const electronics = [ ['parts', 1, 2, 9], ['wire', 1, 4, 11], ['circuit_board', 1, 2, 8], ['transistor', 1, 3, 7], ['capacitor', 1, 3, 7], ['resistor', 1, 3, 8], ['battery_cell', 1, 4, 10], ['hand_radio', 1, 1, 4], ['electric_motor', 1, 1, 5], ['car_battery', 1, 1, 2], ['power_bank', 1, 1, 4], ['solar_panel', 1, 1, 1], ['electronics_manual', 1, 1, 4], ['repair_kit', 1, 1, 4] ];
  const outdoors = [ ['wood', 1, 4, 10], ['herbs', 1, 3, 6], ['resin', 1, 2, 7], ['rope', 1, 2, 5], ['dirty_water', 1, 3, 7], ['charcoal', 1, 3, 4], ['tarp', 1, 1, 3], ['hatchet', 1, 1, 3], ['staff', 1, 1, 3], ['field_guide', 1, 1, 2], ['water_filter', 1, 1, 2], ['firestarter', 1, 1, 3], ['compass', 1, 1, 2], ['binoculars', 1, 1, 1] ];
  const apparel = [ ['work_jacket', 1, 1, 8], ['leather_jacket', 1, 1, 4], ['motorcycle_jacket', 1, 1, 2], ['denim_jacket', 1, 1, 7], ['raincoat', 1, 1, 6], ['canvas_coat', 1, 1, 6], ['padded_vest', 1, 1, 3], ['work_gloves', 1, 1, 9], ['work_boots', 1, 1, 6], ['canvas_pack', 1, 1, 7], ['hiking_pack', 1, 1, 4], ['messenger_bag', 1, 1, 7], ['duffel_bag', 1, 1, 4], ['tool_belt', 1, 1, 5], ['dry_bag', 1, 1, 4], ['burlap_sack', 1, 1, 6], ['tailoring_manual', 1, 1, 3], ['leather', 1, 3, 5] ];
  const firearms = [ ['ammo', 6, 24, 16], ['rifle_round', 5, 16, 10], ['heavy_round', 3, 10, 4], ['magnum_round', 4, 14, 7], ['shotgun_shell', 4, 12, 10], ['pistol', 1, 1, 8], ['revolver', 1, 1, 4], ['hunting_rifle', 1, 1, 4], ['shotgun', 1, 1, 5], ['carbine', 1, 1, 3], ['bolt_rifle', 1, 1, 1], ['smg', 1, 1, 2], ['doublebarrel', 1, 1, 3], ['lever_rifle', 1, 1, 3], ['gunpowder', 1, 2, 5], ['lead', 1, 2, 5], ['primer', 1, 2, 5], ['reloading_press', 1, 1, 2], ['reloading_manual', 1, 1, 4] ];
  const books = [ ['first_aid_manual', 1, 1, 6], ['tailoring_manual', 1, 1, 6], ['electronics_manual', 1, 1, 6], ['cooking_manual', 1, 1, 8], ['reloading_manual', 1, 1, 4], ['woodcraft_manual', 1, 1, 7], ['field_guide', 1, 1, 7], ['route_atlas', 1, 1, 5] ];
  const loot = {
    urban: entries(pantry.concat(household, electronics.slice(0, 8), clinic.slice(0, 5), apparel.slice(0, 5))),
    suburban: entries(pantry.concat(household, apparel.slice(0, 7), workshop.slice(0, 7))),
    farm: entries(pantry.slice(0, 8).concat([ ['apple', 1, 4, 7], ['pear', 1, 4, 5], ['carrot', 1, 4, 10], ['tomato', 1, 4, 10], ['potato', 1, 5, 11], ['sickle', 1, 1, 4], ['pitchfork', 1, 1, 5], ['shovel', 1, 1, 6], ['rope', 1, 3, 8], ['honey', 1, 2, 3], ['burlap_sack', 1, 1, 5], ['cooking_manual', 1, 1, 2] ])),
    industrial: entries(workshop.concat(electronics, [ ['steel_sheet', 1, 3, 7], ['aluminum_sheet', 1, 3, 7], ['copper_pipe', 1, 3, 7], ['spring', 1, 3, 6], ['fuel', 1, 2, 5], ['glass', 1, 3, 6], ['welding_apron', 1, 1, 4], ['hard_hat', 1, 1, 6], ['tin_snips', 1, 1, 4], ['file', 1, 1, 5], ['drill', 1, 1, 3], ['sledgehammer', 1, 1, 2] ])),
    forest: entries(outdoors.concat([ ['hiking_pack', 1, 1, 3], ['sleeping_bag', 1, 1, 3], ['hunting_bow', 1, 1, 2], ['arrow', 3, 10, 4], ['woodcraft_manual', 1, 1, 3], ['nuts', 1, 2, 3], ['dried_fruit', 1, 2, 3], ['food', 1, 2, 4] ])),
    river: entries(outdoors.concat([ ['sand', 1, 3, 9], ['gravel', 1, 3, 9], ['clay', 1, 2, 5], ['filter_mesh', 1, 2, 4], ['empty_bottle', 1, 3, 7], ['dry_bag', 1, 1, 3], ['water', 1, 2, 5] ])),
    house: entries(pantry.concat(household, apparel.slice(0, 7), [ ['bat', 1, 1, 4], ['rolling_pin', 1, 1, 4], ['cleaver', 1, 1, 3], ['coffee_beans', 1, 2, 5], ['tea_leaves', 1, 2, 5], ['jam', 1, 2, 4], ['peanut_butter', 1, 2, 4], ['bread', 1, 2, 7], ['milk', 1, 2, 5] ])),
    cabin: entries(outdoors.concat(pantry.slice(0, 8), [ ['bandage', 1, 3, 8], ['water', 1, 3, 10], ['hunting_rifle', 1, 1, 2], ['rifle_round', 4, 12, 3], ['hatchet', 1, 1, 4], ['cooking_pot', 1, 1, 4], ['saw', 1, 1, 4], ['woodcraft_manual', 1, 1, 3] ])),
    grocery: entries(pantry.concat([ ['oat_bar', 1, 4, 8], ['protein_bar', 1, 3, 6], ['dried_fruit', 1, 3, 8], ['nuts', 1, 3, 8], ['jerky', 1, 3, 6], ['granola', 1, 2, 7], ['chocolate', 1, 4, 8], ['apple', 1, 3, 5], ['pear', 1, 3, 5], ['orange', 1, 3, 5], ['banana', 1, 3, 5], ['soda', 1, 3, 8], ['fruit_juice', 1, 3, 7], ['sports_drink', 1, 3, 5], ['coconut_water', 1, 2, 3], ['energy_drink', 1, 2, 4], ['empty_can', 1, 3, 4] ])),
    restaurant: entries(pantry.slice(0, 9).concat(household.slice(7, 10), [ ['carrot', 1, 3, 8], ['tomato', 1, 3, 8], ['potato', 1, 4, 8], ['bread', 1, 3, 6], ['coffee_beans', 1, 3, 8], ['tea_leaves', 1, 2, 6], ['broth', 1, 2, 6], ['funnel', 1, 1, 3], ['cleaver', 1, 1, 4], ['cooking_manual', 1, 1, 4], ['salt', 1, 3, 8], ['sugar', 1, 3, 8], ['honey', 1, 2, 4] ])),
    clinic: entries(clinic),
    pharmacy: entries(clinic.concat([ ['water', 1, 3, 6], ['sports_drink', 1, 2, 4], ['rehydration_mix', 1, 2, 4], ['mortar', 1, 1, 2] ])),
    garage: entries(workshop.concat(electronics.slice(7, 10), [ ['tire_iron', 1, 1, 5], ['pipe_wrench', 1, 1, 4], ['crowbar', 1, 1, 5], ['fuel', 1, 3, 7], ['leather', 1, 2, 4], ['spring', 1, 3, 5], ['repair_kit', 1, 1, 3] ])),
    warehouse: entries(workshop.concat(electronics, apparel, [ ['steel_sheet', 1, 3, 8], ['aluminum_sheet', 1, 3, 8], ['copper_pipe', 1, 3, 7], ['spring', 1, 3, 5], ['filter_mesh', 1, 2, 5], ['tarp', 1, 2, 7] ])),
    hardware: entries(workshop.concat([ ['hatchet', 1, 1, 5], ['pickaxe', 1, 1, 3], ['shovel', 1, 1, 4], ['sledgehammer', 1, 1, 2], ['fire_axe', 1, 1, 3], ['tin_snips', 1, 1, 4], ['file', 1, 1, 4], ['drill', 1, 1, 3], ['sharpening_stone', 1, 1, 4], ['metal_tube', 1, 2, 7] ])),
    gunshop: entries(firearms.concat([ ['hunting_bow', 1, 1, 3], ['crossbow', 1, 1, 3], ['arrow', 4, 14, 6], ['crossbow_bolt', 4, 14, 6], ['military_pack', 1, 1, 2] ])),
    police: entries(firearms.slice(0, 8).concat([ ['ballistic_vest', 1, 1, 3], ['riot_helmet', 1, 1, 3], ['hand_radio', 1, 1, 5], ['parts', 1, 2, 4], ['first_aid_kit', 1, 1, 3], ['military_pack', 1, 1, 2] ])),
    library: entries(books.concat([ ['cloth', 1, 2, 3], ['water', 1, 2, 3], ['messenger_bag', 1, 1, 2] ])),
    clothing: entries(apparel.concat([ ['cloth', 1, 5, 10], ['thread', 1, 3, 7], ['sewing_kit', 1, 1, 4], ['blanket', 1, 2, 4], ['padded_coat', 1, 1, 3] ])),
    camp: entries(outdoors.concat([ ['food', 1, 3, 9], ['water', 1, 4, 9], ['hiking_pack', 1, 1, 4], ['sleeping_bag', 1, 1, 5], ['headlamp', 1, 1, 3], ['hunting_bow', 1, 1, 2], ['arrow', 3, 10, 4], ['whistle', 1, 1, 4], ['flare', 1, 2, 4], ['lantern', 1, 1, 3], ['cooking_pot', 1, 1, 4] ])),
    workshop: entries(workshop.concat(electronics, books.slice(1, 3))),
    radio: entries(electronics.concat([ ['parts', 1, 3, 14], ['screwdriver', 1, 1, 7], ['water', 1, 2, 5], ['food', 1, 2, 5] ])),
    default: entries(pantry.slice(0, 5).concat(workshop.slice(0, 6), household.slice(0, 5), [ ['parts', 1, 2, 5], ['bandage', 1, 2, 6], ['water', 1, 3, 10], ['ammo', 4, 10, 3] ]))
  };
  loot.market = loot.grocery;
  loot.ranger = loot.camp;
  loot.depot = loot.warehouse;
  loot.fuel = entries([ ['fuel', 1, 4, 18], ['car_battery', 1, 1, 4], ['wrench', 1, 1, 5], ['repair_kit', 1, 1, 5], ['water', 1, 3, 9], ['food', 1, 2, 6], ['rubber', 1, 3, 7], ['tire_iron', 1, 1, 4] ]);
  // Freeze all exported data so one UI or recipe handler cannot silently alter balancing globally.
  Sirens.Catalog = Object.freeze({ items: Object.freeze(items), recipes: Object.freeze(recipes), loot: Object.freeze(loot) });
}());
