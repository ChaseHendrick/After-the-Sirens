# After the Sirens original catalogue

This early build contains **219 curated original item definitions**, **65 crafting recipes**, and **27 biome or building loot tables**. The catalogue uses common real-world item concepts with original descriptions and game balance. It is a content foundation for an original survival game, not a finished recreation or a comprehensive list of another game's items. No generated color or quality variants inflate these counts.

The authoritative data is `src/catalog.js`, exported as `Sirens.Catalog`. Records and collections are frozen.

## Implemented data contracts

- 63 foods, drinks, and medical supplies have consumable effects. Positive hunger, thirst, infection, and bleeding effects reduce those needs; positive health and stamina restore them. Negative values are adverse effects. Untreated water increases infection. Dry foods increase thirst.
- 34 items define usable melee or ranged weapon statistics, including two tools that double as weapons. Ranges and noise radii use world pixels. Firearms and bows define ammunition type and magazine size. The current ranged model is a direct shot, including arrows and shotgun shells, rather than a full ballistic or pellet simulation.
- 14 protective clothing items define fractional incoming-damage reduction. The current engine has one clothing slot. Layering, body regions, temperature insulation, and material-specific penetration are future systems.
- 9 carrying items define a capacity bonus in kilograms. The current engine has one backpack slot.
- Recipe tools must be present and are not consumed. Recipe ingredients are consumed. Campfire recipes require a nearby campfire. Six manuals can be studied once for practice and insight, and remain reusable recipe and project references.
- Fuel flasks expose `fuel: 12` for the nearby-vehicle refueling handler. That number is a game unit, not a physical storage specification.

## Scope and quantities

Inventory values are stack counts. Ingredient amounts, medical effects, weapon balance, ammunition recovery, and cooked-food yields are gameplay abstractions. They are not real medical, firearm assembly, or food-preservation instructions. The bleeding effect uses a percentage of the engine's maximum bleeding severity. Items do not yet have individual durability, freshness, fluid volume, or condition.

Every definition is available either in a loot table or through a recipe whose inputs and tools are themselves obtainable. This is data-level reachability, not a guarantee that every item appears in a particular generated sector. Weighted tables use relative draw weights with inclusive minimum and maximum stack sizes. World generation decides how many draws each container receives. Starter supplies and quest access remain world-generation responsibilities.

## Honest collectible and ingredient boundaries

Clay, route atlas, compass, binoculars, whistle, headlamp, and assembled lanterns are currently collectibles or future-system ingredients. They do not grant a hidden skill, map reveal, extended sight, deliberate noise action, or equipped light. The whole surrounding view stays readable independently of lamp items. Tarps, sleeping bags, and blankets can be salvaged or used as ingredients, and Journal sleep works indoors or beside a campfire. Separate beds and roof construction are not implemented. Vehicle batteries and solar panels have salvage recipes; an electrical power network is not implemented. Water damage and rain protection are not simulated. The utility and electronics entries say this in their descriptions.

Most materials participate in concrete recipes. The small number of future ingredients is included explicitly for a broader original world catalogue, without pretending those systems exist.

## Category counts

| Category | Definitions |
|---|---:|
| materials | 39 |
| food | 36 |
| drinks | 12 |
| medical | 15 |
| tools | 20 |
| melee | 21 |
| firearms | 11 |
| ammo | 7 |
| clothing | 14 |
| containers | 9 |
| electronics | 12 |
| books | 8 |
| utility | 15 |

## Loot regions

`urban`, `suburban`, `farm`, `industrial`, `forest`, `river`, `house`, `cabin`, `grocery`, `restaurant`, `clinic`, `pharmacy`, `garage`, `warehouse`, `hardware`, `gunshop`, `police`, `library`, `clothing`, `camp`, `workshop`, `radio`, `default`, `market`, `ranger`, `depot`, `fuel`.

`market` aliases grocery, `ranger` aliases camp, and `depot` aliases warehouse. Fuel depots have a dedicated table. Farm loot emphasizes produce and agricultural tools; forest and river loot emphasize travel, materials, and untreated water; industrial loot emphasizes construction and electronics. Clinics, pharmacies, gun shops, libraries, and clothing stores specialize without making all generic sectors identical.

## Item definitions

### Materials

| ID | Item | Weight (kg) | Role |
|---|---|---:|---|
| `wood` | Timber | 0.8 | Construction wood for barricades, handles, and improvised equipment. |
| `scrap` | Metal scrap | 0.45 | Reclaimed metal used in construction and field crafting. |
| `parts` | Radio parts | 0.35 | Salvaged relay components. Bring five to the radio tower. |
| `cloth` | Cloth strips | 0.12 | Clean fabric for dressings, bags, and makeshift padding. |
| `leather` | Leather hide | 0.5 | Tough material for reinforced clothing and carrying gear. |
| `thread` | Thread spool | 0.04 | Sewing thread for cloth and leather repairs. |
| `rope` | Rope coil | 0.4 | Strong cord used to lash tools and improvise a pack. |
| `wire` | Wire spool | 0.15 | Conductive wire for component salvage and bindings. |
| `nails` | Nail box | 0.25 | Small fasteners for homemade weapons and containers. |
| `screws` | Screw box | 0.2 | Threaded fasteners for recovered equipment. |
| `bolts` | Bolt set | 0.35 | Heavy fasteners for more robust field equipment. |
| `duct_tape` | Duct tape | 0.18 | A repair material for grips, bags, and bindings. |
| `resin` | Pine resin | 0.14 | Sticky binder used in improvised arrows and cloth patches. |
| `charcoal` | Charcoal | 0.3 | Carbon for a crude water filter. |
| `sand` | Fine sand | 0.8 | Filter medium for a basic water treatment recipe. |
| `gravel` | Gravel | 1.2 | Coarse filter medium collected from river margins. |
| `clay` | Clay lump | 1 | Stored crafting material. Pottery construction is not implemented. |
| `glass` | Glass fragments | 0.4 | Ingredient for improvised cutting implements. |
| `rubber` | Rubber strip | 0.2 | Flexible salvage for grips and protective padding. |
| `plastic` | Plastic pieces | 0.15 | Light salvage used to assemble utility containers. |
| `steel_sheet` | Steel sheet | 1.8 | Armor plating for a reinforced protective vest. |
| `aluminum_sheet` | Aluminum sheet | 0.65 | Light sheet metal for utility and electronics recipes. |
| `copper_pipe` | Copper pipe | 0.8 | Metal stock used to recover electronic components. |
| `gunpowder` | Gunpowder tin | 0.25 | Ammunition ingredient. The recipe abstracts safe cartridge assembly. |
| `lead` | Lead ingot | 0.8 | Heavy metal used by ammunition recipes. |
| `primer` | Primer tray | 0.08 | Small ammunition components used in cartridge recipes. |
| `empty_bottle` | Empty bottle | 0.2 | A vessel for water collection and filter assembly. |
| `empty_can` | Empty can | 0.1 | A tin vessel used to assemble a rough field lantern. |
| `spring` | Coil spring | 0.1 | Recovered mechanism component for ranged equipment. |
| `metal_tube` | Metal tubing | 0.75 | Stock for an improvised baton and component salvage. |
| `soap` | Soap bar | 0.09 | Cleaning ingredient for field dressing preparation. |
| `salt` | Salt packet | 0.08 | An ingredient for trail food and oral hydration mix. |
| `sugar` | Sugar packet | 0.08 | An ingredient for drinks and high-energy trail food. |
| `fuel` | Fuel flask | 0.7 | Nearby vehicle fuel +12 |
| `filter_mesh` | Filter mesh | 0.12 | Mesh that holds together a crude water filter. |

### Food

| ID | Item | Weight (kg) | Role |
|---|---|---:|---|
| `food` | Trail ration | 0.6 | hunger +38, stamina +4 |
| `canned_beans` | Canned beans | 0.45 | hunger +30, thirst +5 |
| `canned_soup` | Canned soup | 0.45 | hunger +23, thirst +18 |
| `canned_fish` | Canned fish | 0.22 | hunger +27, thirst -4 |
| `canned_peaches` | Canned peaches | 0.4 | hunger +20, thirst +10, stamina +2 |
| `canned_corn` | Canned corn | 0.35 | hunger +22, thirst +4 |
| `canned_stew` | Canned stew | 0.55 | hunger +38, thirst +6 |
| `crackers` | Cracker sleeve | 0.18 | hunger +15, thirst -4 |
| `oat_bar` | Oat bar | 0.09 | hunger +13, stamina +7 |
| `protein_bar` | Protein bar | 0.1 | hunger +18, stamina +8 |
| `dried_fruit` | Dried fruit | 0.15 | hunger +17, stamina +5 |
| `nuts` | Mixed nuts | 0.18 | hunger +25, thirst -3 |
| `jerky` | Jerky packet | 0.12 | hunger +23, thirst -6 |
| `bread` | Bread loaf | 0.4 | hunger +28 |
| `peanut_butter` | Peanut butter jar | 0.35 | hunger +34, thirst -5 |
| `jam` | Jam jar | 0.3 | hunger +17, stamina +7 |
| `honey` | Honey jar | 0.3 | hunger +16, stamina +10 |
| `apple` | Apple | 0.16 | hunger +10, thirst +6 |
| `pear` | Pear | 0.18 | hunger +11, thirst +8 |
| `orange` | Orange | 0.17 | hunger +9, thirst +11 |
| `banana` | Banana | 0.15 | hunger +13, stamina +6 |
| `carrot` | Carrot bundle | 0.22 | hunger +13, thirst +5 |
| `tomato` | Tomato | 0.14 | hunger +7, thirst +10 |
| `potato` | Potato | 0.22 | hunger +10 |
| `rice` | Rice packet | 0.3 | hunger +8, thirst -6 |
| `oats` | Rolled oats | 0.25 | hunger +12, thirst -5 |
| `pasta` | Pasta packet | 0.3 | hunger +7, thirst -7 |
| `chocolate` | Chocolate bar | 0.1 | hunger +13, stamina +12 |
| `granola` | Granola bag | 0.25 | hunger +26, thirst -4, stamina +4 |
| `porridge` | Camp porridge | 0.4 | hunger +34, thirst +15, stamina +6 |
| `rice_meal` | Rice and beans | 0.55 | hunger +48, thirst +8, stamina +8 |
| `pasta_meal` | Tomato pasta | 0.5 | hunger +42, thirst +6, stamina +6 |
| `trail_mix` | Trail mix | 0.28 | hunger +37, stamina +12, thirst -3 |
| `baked_potato` | Baked potato | 0.22 | hunger +23, stamina +3 |
| `fruit_salad` | Fruit salad | 0.4 | hunger +25, thirst +22, stamina +5 |
| `vegetable_soup` | Vegetable soup | 0.6 | hunger +36, thirst +25, stamina +5 |

### Drinks

| ID | Item | Weight (kg) | Role |
|---|---|---:|---|
| `water` | Clean water | 0.8 | thirst +45 |
| `soda` | Lemon soda | 0.35 | thirst +25, stamina +5 |
| `fruit_juice` | Fruit juice | 0.4 | thirst +32, hunger +6 |
| `sports_drink` | Sports drink | 0.5 | thirst +38, stamina +12 |
| `coconut_water` | Coconut water | 0.33 | thirst +30, stamina +4 |
| `milk` | Shelf milk | 0.5 | thirst +27, hunger +14 |
| `coffee` | Camp coffee | 0.25 | thirst +15, stamina +20 |
| `tea` | Camp tea | 0.25 | thirst +23, stamina +8 |
| `broth` | Broth flask | 0.4 | thirst +25, hunger +12, stamina +3 |
| `energy_drink` | Energy drink | 0.25 | thirst +16, stamina +27 |
| `rehydration_mix` | Hydration solution | 0.5 | thirst +55, stamina +12 |
| `dirty_water` | Untreated water | 0.5 | thirst +25, infection -12, health -2 |

### Medical

| ID | Item | Weight (kg) | Role |
|---|---|---:|---|
| `bandage` | Field bandage | 0.15 | bleeding +100, health +8 |
| `gauze` | Sterile gauze | 0.08 | bleeding +45, health +3 |
| `adhesive_dressing` | Adhesive dressing | 0.05 | bleeding +30, health +2 |
| `antiseptic` | Antiseptic bottle | 0.2 | infection +15, health +2 |
| `antiseptic_wipes` | Antiseptic wipes | 0.07 | infection +8, bleeding +10 |
| `antibiotics` | Antibiotic pack | 0.05 | infection +28, health +4 |
| `painkillers` | Pain relief tablets | 0.03 | health +4, stamina +10 |
| `vitamins` | Vitamin bottle | 0.04 | health +2, stamina +6 |
| `tourniquet` | Tourniquet | 0.08 | bleeding +100, health -2 |
| `suture_kit` | Suture kit | 0.18 | bleeding +100, health +16, infection +5 |
| `splint` | Field splint | 0.35 | health +12, stamina +5 |
| `burn_gel` | Burn dressing | 0.12 | health +11, infection +3 |
| `first_aid_kit` | First aid kit | 0.65 | health +30, bleeding +100, infection +18 |
| `emergency_dressing` | Emergency dressing | 0.18 | bleeding +100, health +14 |
| `herbal_poultice` | Herbal compress | 0.15 | bleeding +25, health +6, infection +3 |

### Tools

| ID | Item | Weight (kg) | Role |
|---|---|---:|---|
| `hammer` | Claw hammer | 0.9 | A reusable prerequisite for assembling wooden equipment. |
| `screwdriver` | Screwdriver | 0.15 | A reusable prerequisite for electronics salvage. |
| `wrench` | Adjustable wrench | 0.7 | A reusable prerequisite for metal equipment recipes. |
| `saw` | Hand saw | 0.55 | A reusable prerequisite for cutting handles and frames. |
| `wire_cutters` | Wire cutters | 0.3 | A reusable prerequisite for wire and component salvage. |
| `pliers` | Pliers | 0.25 | A reusable prerequisite for cartridge recovery. |
| `sewing_kit` | Sewing kit | 0.12 | A reusable prerequisite for bags and protective clothing. |
| `cooking_pot` | Cooking pot | 0.8 | A reusable prerequisite for campfire meals and clean water. |
| `lighter` | Pocket lighter | 0.05 | A recipe tool for lamp assembly. Fire simulation is not implemented. |
| `firestarter` | Fire steel | 0.08 | A reusable prerequisite for a field lantern recipe. |
| `sharpening_stone` | Sharpening stone | 0.3 | A reusable prerequisite for edged field equipment. |
| `file` | Metal file | 0.2 | A reusable prerequisite for rough metal weapons. |
| `drill` | Hand drill | 0.85 | A reusable prerequisite for a crossbow assembly. |
| `mortar` | Mortar and pestle | 0.6 | A reusable prerequisite for an improvised dressing. |
| `funnel` | Funnel | 0.08 | A reusable prerequisite for the hydration solution recipe. |
| `reloading_press` | Reloading press | 2.8 | A reusable prerequisite for abstract ammunition crafting. |
| `needle` | Heavy needle | 0.01 | A reusable prerequisite for a cloth pack and simple wraps. |
| `tin_snips` | Tin snips | 0.45 | A reusable prerequisite for sheet-metal reinforcement. |
| `hatchet` | Hatchet | 1.1 | melee, damage 33, range 66 px, cooldown 0.54 s |
| `pickaxe` | Pickaxe | 2.8 | melee, damage 52, range 85 px, cooldown 1.02 s |

### Melee

| ID | Item | Weight (kg) | Role |
|---|---|---:|---|
| `bat` | Baseball bat | 1.2 | melee, damage 36, range 78 px, cooldown 0.47 s |
| `crowbar` | Crowbar | 1.6 | melee, damage 32, range 72 px, cooldown 0.57 s |
| `kitchen_knife` | Kitchen knife | 0.2 | melee, damage 20, range 48 px, cooldown 0.3 s |
| `shard_knife` | Wrapped glass edge | 0.13 | melee, damage 14, range 44 px, cooldown 0.28 s |
| `machete` | Machete | 0.75 | melee, damage 38, range 65 px, cooldown 0.47 s |
| `fire_axe` | Fire axe | 2.2 | melee, damage 48, range 84 px, cooldown 0.78 s |
| `sledgehammer` | Sledgehammer | 4.4 | melee, damage 66, range 90 px, cooldown 1.24 s |
| `shovel` | Shovel | 1.9 | melee, damage 31, range 88 px, cooldown 0.66 s |
| `spear` | Wooden spear | 1.1 | melee, damage 32, range 102 px, cooldown 0.64 s |
| `staff` | Walking staff | 0.8 | melee, damage 20, range 94 px, cooldown 0.48 s |
| `rolling_pin` | Rolling pin | 0.55 | melee, damage 17, range 55 px, cooldown 0.38 s |
| `pipe_wrench` | Pipe wrench | 1.8 | melee, damage 35, range 65 px, cooldown 0.62 s |
| `frying_pan` | Frying pan | 1 | melee, damage 24, range 60 px, cooldown 0.5 s |
| `cleaver` | Meat cleaver | 0.45 | melee, damage 30, range 51 px, cooldown 0.41 s |
| `tire_iron` | Tire iron | 0.8 | melee, damage 26, range 64 px, cooldown 0.43 s |
| `metal_pipe` | Pipe baton | 1.2 | melee, damage 29, range 77 px, cooldown 0.52 s |
| `sickle` | Sickle | 0.6 | melee, damage 26, range 59 px, cooldown 0.4 s |
| `pitchfork` | Pitchfork | 1.5 | melee, damage 34, range 108 px, cooldown 0.76 s |
| `spiked_bat` | Nailed bat | 1.45 | melee, damage 38, range 78 px, cooldown 0.57 s |

### Firearms

| ID | Item | Weight (kg) | Role |
|---|---|---:|---|
| `pistol` | Service pistol | 0.85 | firearm, damage 85, range 670 px, cooldown 0.24 s, ammo ammo |
| `revolver` | Revolver | 1.05 | firearm, damage 63, range 520 px, cooldown 0.48 s, ammo magnum_round |
| `hunting_rifle` | Hunting rifle | 3.2 | firearm, damage 76, range 880 px, cooldown 0.87 s, ammo rifle_round |
| `shotgun` | Pump shotgun | 3.4 | firearm, damage 87, range 330 px, cooldown 0.87 s, ammo shotgun_shell |
| `carbine` | Utility carbine | 2.6 | firearm, damage 51, range 710 px, cooldown 0.29 s, ammo rifle_round |
| `bolt_rifle` | Precision rifle | 4.1 | firearm, damage 101, range 1060 px, cooldown 1.18 s, ammo heavy_round |
| `smg` | Compact automatic | 2.35 | firearm, damage 31, range 430 px, cooldown 0.12 s, ammo ammo |
| `doublebarrel` | Double-barrel shotgun | 3.1 | firearm, damage 99, range 305 px, cooldown 0.58 s, ammo shotgun_shell |
| `lever_rifle` | Lever-action rifle | 3.3 | firearm, damage 64, range 690 px, cooldown 0.62 s, ammo magnum_round |
| `hunting_bow` | Hunting bow | 0.95 | firearm, damage 39, range 410 px, cooldown 0.95 s, ammo arrow |
| `crossbow` | Field crossbow | 2.2 | firearm, damage 61, range 530 px, cooldown 1.25 s, ammo crossbow_bolt |

### Ammo

| ID | Item | Weight (kg) | Role |
|---|---|---:|---|
| `ammo` | Pistol round | 0.04 | A single standard pistol cartridge for the service pistol or compact automatic. |
| `rifle_round` | Rifle round | 0.022 | A single medium rifle cartridge for the hunting rifle or carbine. |
| `heavy_round` | Heavy rifle round | 0.035 | A larger rifle cartridge for the precision rifle. |
| `magnum_round` | Large handgun round | 0.02 | A powerful cartridge for the revolver or lever-action rifle. |
| `shotgun_shell` | Shotgun shell | 0.045 | A single shell for the pump or double-barrel shotgun. |
| `arrow` | Hunting arrow | 0.045 | A shaft for a hunting bow. Fired arrows are not recoverable yet. |
| `crossbow_bolt` | Crossbow bolt | 0.055 | A shaft for a crossbow. Fired bolts are not recoverable yet. |

### Clothing

| ID | Item | Weight (kg) | Role |
|---|---|---:|---|
| `work_jacket` | Work jacket | 0.9 | Damage reduction 7% |
| `leather_jacket` | Leather jacket | 1.6 | Damage reduction 15% |
| `motorcycle_jacket` | Riding jacket | 2.1 | Damage reduction 22% |
| `denim_jacket` | Denim jacket | 1 | Damage reduction 9% |
| `raincoat` | Raincoat | 0.7 | Damage reduction 4% |
| `canvas_coat` | Canvas coat | 1.4 | Damage reduction 12% |
| `padded_vest` | Padded vest | 1.2 | Damage reduction 18% |
| `ballistic_vest` | Protective vest | 3.5 | Damage reduction 38% |
| `hard_hat` | Hard hat | 0.45 | Damage reduction 6% |
| `welding_apron` | Welding apron | 1.3 | Damage reduction 13% |
| `riot_helmet` | Protective helmet | 1.4 | Damage reduction 21% |
| `work_gloves` | Work gloves | 0.18 | Damage reduction 3% |
| `work_boots` | Work boots | 1.2 | Damage reduction 6% |
| `padded_coat` | Quilted coat | 1.8 | Damage reduction 16% |

### Containers

| ID | Item | Weight (kg) | Role |
|---|---|---:|---|
| `canvas_pack` | Canvas backpack | 0.55 | Capacity +8 kg |
| `hiking_pack` | Hiking backpack | 1 | Capacity +14 kg |
| `military_pack` | Field backpack | 1.45 | Capacity +18 kg |
| `messenger_bag` | Messenger bag | 0.4 | Capacity +5 kg |
| `duffel_bag` | Duffel bag | 0.7 | Capacity +11 kg |
| `tool_belt` | Tool belt | 0.45 | Capacity +3 kg |
| `dry_bag` | Roll-top bag | 0.5 | Capacity +7 kg |
| `burlap_sack` | Burlap sack | 0.25 | Capacity +4 kg |
| `frame_pack` | Wood-frame pack | 1.3 | Capacity +16 kg |

### Electronics

| ID | Item | Weight (kg) | Role |
|---|---|---:|---|
| `circuit_board` | Circuit board | 0.08 | Electronics salvage used to assemble relay parts. |
| `transistor` | Transistor bundle | 0.02 | Small electronics ingredients for relay and board recipes. |
| `capacitor` | Capacitor bundle | 0.04 | Stored-charge components for electronics salvage. |
| `resistor` | Resistor bundle | 0.02 | Electronics components used for a salvaged circuit board. |
| `battery_cell` | Battery cell | 0.08 | A power component for a lantern and relay parts. Battery drain is not modeled yet. |
| `hand_radio` | Handheld radio | 0.3 | Can be dismantled into useful relay parts. Portable voice communication is not implemented. |
| `electric_motor` | Small electric motor | 0.55 | Can be dismantled for wire and metal. |
| `car_battery` | Vehicle battery | 5.5 | A vehicle component and battery-cell salvage source. Electrical networks are not implemented. |
| `flashlight` | Flashlight | 0.2 | A lantern ingredient. The current renderer gives every survivor an awareness light. |
| `headlamp` | Headlamp | 0.12 | A utility collectible. Separate lamp equipment and battery drain are not implemented. |
| `solar_panel` | Portable solar panel | 2.5 | A salvage source for cells and metal. Electrical networks are not implemented. |
| `power_bank` | Power bank | 0.2 | Can be dismantled into battery cells. Device charging is not implemented. |

### Books

| ID | Item | Weight (kg) | Role |
|---|---|---:|---|
| `first_aid_manual` | Field care manual | 0.35 | A reusable prerequisite for assembling a first aid kit. Reading does not grant skills yet. |
| `tailoring_manual` | Stitching handbook | 0.3 | A reusable prerequisite for stronger protective clothing. |
| `electronics_manual` | Circuit repair handbook | 0.45 | A reusable prerequisite for board and radio component recipes. |
| `cooking_manual` | Camp kitchen notebook | 0.3 | A reusable prerequisite for more efficient trail rations. |
| `reloading_manual` | Ammunition workshop notes | 0.4 | A reusable prerequisite for abstract cartridge recipes. |
| `woodcraft_manual` | Woodcraft handbook | 0.35 | A reusable prerequisite for a bow and frame pack. |
| `field_guide` | Local plant guide | 0.3 | A reusable prerequisite for the herbal compress recipe. Foraging skills are not implemented. |
| `route_atlas` | County route atlas | 0.5 | A travel collectible. It does not reveal unexplored terrain in this build. |

### Utility

| ID | Item | Weight (kg) | Role |
|---|---|---:|---|
| `coffee_beans` | Coffee beans | 0.15 | An ingredient for a campfire coffee recipe. |
| `tea_leaves` | Tea leaves | 0.08 | An ingredient for a campfire tea recipe. |
| `herbs` | Dried herbs | 0.05 | An ingredient for a simple game dressing and tea. |
| `compass` | Pocket compass | 0.09 | A navigation collectible. The minimap already shows your location. |
| `binoculars` | Binoculars | 0.65 | An exploration collectible. Extended sight is not implemented yet. |
| `whistle` | Metal whistle | 0.02 | A utility collectible. A deliberate noise action is not implemented yet. |
| `flare` | Signal flare | 0.2 | A lantern ingredient. Dedicated flare lighting and distress signals are not implemented. |
| `candle` | Candle | 0.1 | An ingredient for a crude field lantern. |
| `tarp` | Tarpaulin | 0.8 | Useful cloth salvage and a pack ingredient. Shelter roofs are not implemented yet. |
| `sleeping_bag` | Sleeping bag | 1.5 | A cloth salvage source. Bed and sleep systems are not implemented yet. |
| `blanket` | Wool blanket | 0.7 | A cloth salvage source and ingredient for padded clothing. |
| `water_filter` | Field water filter | 0.3 | A reusable prerequisite for turning untreated water into clean water. |
| `lantern` | Field lantern | 0.45 | An assembled utility collectible. Separate light equipment is not implemented yet. |
| `repair_kit` | General repair kit | 0.6 | A reusable prerequisite for salvaging radios. Item durability is not implemented yet. |

## Crafting definitions

| ID | Recipe | Consumed inputs | Results | Reusable tools / station |
|---|---|---|---|---|
| `field_wraps` | Field wraps | 2 metal scrap | 2 field bandage |  |
| `recover_rounds` | Recover pistol rounds | 4 metal scrap | 8 pistol round |  |
| `collect_water` | Collect clean water | 2 timber + 2 metal scrap | 2 clean water | campfire |
| `cloth_wraps` | Clean cloth wraps | 2 cloth strips + 1 soap bar | 2 field bandage | Heavy needle |
| `emergency_wraps` | Emergency dressing | 2 sterile gauze + 1 cloth strips + 1 duct tape | 1 emergency dressing |  |
| `prepare_sutures` | Prepare a suture kit | 1 thread spool + 2 sterile gauze + 1 antiseptic bottle | 1 suture kit | Heavy needle, Field care manual |
| `prepare_splint` | Lash a field splint | 1 timber + 2 cloth strips + 1 duct tape | 1 field splint |  |
| `assemble_first_aid` | Assemble first aid kit | 2 field bandage + 1 antiseptic bottle + 1 pain relief tablets + 1 cloth strips | 1 first aid kit | Field care manual |
| `herbal_compress` | Herbal compress | 2 dried herbs + 1 cloth strips + 1 clean water | 2 herbal compress | Mortar and pestle, Local plant guide |
| `filter_water` | Filter untreated water | 1 untreated water | 1 clean water | Field water filter |
| `boil_water` | Boil untreated water | 2 untreated water + 1 timber | 2 clean water | Cooking pot, campfire |
| `build_filter` | Assemble field filter | 2 charcoal + 1 fine sand + 1 gravel + 1 filter mesh + 1 empty bottle | 1 field water filter |  |
| `hydration_solution` | Mix hydration solution | 1 clean water + 1 salt packet + 1 sugar packet | 1 hydration solution | Funnel |
| `cook_porridge` | Cook camp porridge | 1 rolled oats + 1 clean water + 1 timber | 2 camp porridge | Cooking pot, campfire |
| `cook_rice` | Rice and beans | 1 rice packet + 1 canned beans + 1 clean water + 1 timber | 2 rice and beans | Cooking pot, campfire |
| `cook_pasta` | Tomato pasta | 1 pasta packet + 2 tomato + 1 clean water + 1 timber | 2 tomato pasta | Cooking pot, campfire |
| `bake_potatoes` | Bake potatoes | 3 potato + 1 timber | 3 baked potato | campfire |
| `vegetable_stew` | Vegetable soup | 1 carrot bundle + 1 tomato + 1 potato + 1 clean water + 1 timber | 2 vegetable soup | Cooking pot, campfire |
| `mix_trail_food` | Mix trail food | 1 mixed nuts + 1 dried fruit + 1 honey jar | 2 trail mix |  |
| `make_rations` | Pack travel rations | 1 cracker sleeve + 1 jerky packet + 1 dried fruit | 2 trail ration | Camp kitchen notebook |
| `fruit_bowl` | Cut fruit salad | 1 apple + 1 pear + 1 orange | 2 fruit salad | Kitchen knife |
| `brew_coffee` | Brew camp coffee | 1 coffee beans + 1 clean water + 1 timber | 2 camp coffee | Cooking pot, campfire |
| `brew_tea` | Brew camp tea | 1 tea leaves + 1 clean water + 1 timber | 2 camp tea | Cooking pot, campfire |
| `sew_sack` | Sew a carrying sack | 4 cloth strips + 1 thread spool | 1 burlap sack | Heavy needle |
| `sew_canvas_pack` | Sew canvas backpack | 6 cloth strips + 1 rope coil + 2 thread spool | 1 canvas backpack | Sewing kit |
| `sew_rolltop` | Make a roll-top bag | 1 tarpaulin + 2 duct tape + 1 rope coil | 1 roll-top bag |  |
| `build_frame_pack` | Build a wood-frame pack | 4 timber + 4 cloth strips + 2 rope coil + 1 bolt set | 1 wood-frame pack | Hand saw, Claw hammer, Woodcraft handbook |
| `sew_tool_belt` | Sew a tool belt | 2 leather hide + 1 thread spool + 1 screw box | 1 tool belt | Sewing kit |
| `pad_vest` | Sew a padded vest | 5 cloth strips + 1 wool blanket + 2 thread spool | 1 padded vest | Sewing kit |
| `reinforce_vest` | Reinforce protective vest | 1 padded vest + 2 steel sheet + 2 duct tape + 2 leather hide | 1 protective vest | Tin snips, Sewing kit, Stitching handbook |
| `quilt_coat` | Sew a quilted coat | 1 canvas coat + 2 wool blanket + 2 thread spool | 1 quilted coat | Sewing kit, Stitching handbook |
| `shape_staff` | Shape walking staff | 2 timber | 1 walking staff | Kitchen knife |
| `wrap_glass_edge` | Wrap a glass edge | 1 glass fragments + 1 duct tape + 1 cloth strips | 1 wrapped glass edge |  |
| `carve_spear` | Carve wooden spear | 2 timber + 1 rope coil | 1 wooden spear | Kitchen knife |
| `assemble_baton` | Assemble pipe baton | 1 metal tubing + 1 duct tape | 1 pipe baton | Metal file |
| `spike_bat` | Reinforce a baseball bat | 1 baseball bat + 1 nail box + 1 duct tape | 1 nailed bat | Claw hammer |
| `forge_edge` | Make a rough machete | 1 steel sheet + 1 timber + 1 rubber strip + 1 bolt set | 1 machete | Metal file, Adjustable wrench, Sharpening stone |
| `build_bow` | Build a hunting bow | 3 timber + 2 rope coil + 1 leather hide | 1 hunting bow | Hand saw, Woodcraft handbook |
| `build_crossbow` | Assemble field crossbow | 3 timber + 1 steel sheet + 2 coil spring + 1 rope coil + 1 screw box | 1 field crossbow | Hand saw, Hand drill, Woodcraft handbook |
| `fletch_arrows` | Make hunting arrows | 1 timber + 1 metal scrap + 1 pine resin | 8 hunting arrow | Kitchen knife |
| `make_bolts` | Make crossbow bolts | 1 timber + 2 metal scrap + 1 duct tape | 8 crossbow bolt | Hand saw |
| `press_pistol_rounds` | Assemble pistol rounds | 1 lead ingot + 1 gunpowder tin + 1 primer tray + 1 metal scrap | 18 pistol round | Reloading press, Ammunition workshop notes |
| `press_rifle_rounds` | Assemble rifle rounds | 1 lead ingot + 2 gunpowder tin + 1 primer tray + 2 metal scrap | 14 rifle round | Reloading press, Ammunition workshop notes |
| `press_heavy_rounds` | Assemble heavy rifle rounds | 2 lead ingot + 2 gunpowder tin + 1 primer tray + 2 metal scrap | 10 heavy rifle round | Reloading press, Ammunition workshop notes |
| `press_large_rounds` | Assemble large handgun rounds | 1 lead ingot + 2 gunpowder tin + 1 primer tray + 1 metal scrap | 12 large handgun round | Reloading press, Ammunition workshop notes |
| `assemble_shells` | Assemble shotgun shells | 2 lead ingot + 2 gunpowder tin + 1 primer tray + 1 plastic pieces | 10 shotgun shell | Reloading press, Ammunition workshop notes |
| `salvage_radio` | Dismantle handheld radio | 1 handheld radio | 2 radio parts + 1 wire spool | Screwdriver, General repair kit |
| `assemble_radio_parts` | Assemble relay parts | 1 circuit board + 2 wire spool + 1 transistor bundle + 1 battery cell | 2 radio parts | Screwdriver, Circuit repair handbook |
| `salvage_motor` | Dismantle electric motor | 1 small electric motor | 3 wire spool + 2 metal scrap | Screwdriver, Wire cutters |
| `salvage_battery` | Recover battery cells | 1 vehicle battery | 12 battery cell + 2 lead ingot | Adjustable wrench |
| `salvage_powerbank` | Dismantle power bank | 1 power bank | 3 battery cell + 1 circuit board | Screwdriver |
| `salvage_panel` | Dismantle solar panel | 1 portable solar panel | 3 battery cell + 2 aluminum sheet + 2 wire spool | Screwdriver, Wire cutters |
| `assemble_board` | Assemble salvaged circuit | 2 resistor bundle + 1 capacitor bundle + 1 transistor bundle + 1 wire spool + 1 plastic pieces | 1 circuit board | Screwdriver, Circuit repair handbook |
| `strip_pipe` | Recover copper wire | 1 copper pipe | 4 wire spool | Wire cutters |
| `salvage_blanket` | Cut blanket into cloth | 1 wool blanket | 5 cloth strips | Kitchen knife |
| `salvage_tarp` | Cut tarp into material | 1 tarpaulin | 4 cloth strips + 2 plastic pieces | Kitchen knife |
| `salvage_sleeping_bag` | Recover bedding fabric | 1 sleeping bag | 7 cloth strips + 2 thread spool | Kitchen knife |
| `salvage_coat` | Recover leather | 1 leather jacket | 3 leather hide + 1 thread spool | Kitchen knife |
| `make_lantern` | Assemble field lantern | 1 empty can + 1 candle + 1 wire spool | 1 field lantern | Fire steel |
| `electric_lantern` | Assemble electric lantern | 1 flashlight + 2 battery cell + 1 aluminum sheet + 1 screw box | 1 field lantern | Screwdriver |
| `assemble_repair_kit` | Pack a repair kit | 2 duct tape + 2 wire spool + 1 screw box + 1 cloth strips | 1 general repair kit |  |

## Compatibility and verification

Legacy item identifiers `wood`, `scrap`, `parts`, `food`, `water`, `bandage`, and `ammo` retain their original stack weights. The existing `field_wraps`, `recover_rounds`, and `collect_water` recipe identifiers, ingredient amounts, and output amounts are preserved. The bat and pistol also have explicit equipment metadata.

Catalogue-only validation passed: unique IDs, nonempty metadata, finite nonnegative weights, valid effect fields, valid weapon ammo references, positive finite armor/capacity fields, positive integer recipe quantities, known tool and station prerequisites, positive weighted loot entries, immutable records, required legacy identifiers, and complete item reachability through loot and recipe inputs. Runtime integration and browser verification are reported separately by the game project.


## Mining and garden additions in v0.4

| Item | Role |
|---|---|
| `stone` | Mine seeded stone deposits or scavenge chunks; craft a first mining pick. |
| `iron_ore` | Mine seeded iron deposits; process ore at a campfire. |
| `copper_ore` | Mine seeded copper deposits; recover wire at a campfire. |
| `iron_ingot` | Processed iron for an upgraded pick. |
| `stone_pick` | A reusable melee and mining tool. |
| `iron_pick` | A stronger melee tool that mines deposits in fewer accepted swings. |
| `carrot_seeds` | Plant a base garden, water crops, and recover carrots and seed at harvest. |

Four additional recipes craft a stone pick, process iron, recover copper wire, and upgrade the pick. Surface mineral deposits, base plots, stockpiles, jobs and crop growth are implemented by `src/settlement.js`; they are saved systems rather than catalogue-only promises. Mining results have a carrying limit and can remain on the ground when your pack is full. Crop yields and ore processing are gameplay abstractions.
