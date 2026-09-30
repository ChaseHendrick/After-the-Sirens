# Item catalogue

After the Sirens has **3,455 original item definitions and 4,457 recipes**. The catalogue combines selected food preparations, material profiles and equipment designs. Each added item can be used, equipped, retained as a crafting tool, or consumed in a recipe. Many advanced items are assembled from scavenged stock rather than found ready to use.

The game remains an early playable survival sandbox. Its item names, recipes and balancing are original. It does not reproduce another game's catalogue, assets or crafting rules.

## Browse and use supplies

Press **I** to open your pack. **Your pack** lists carried supplies and offers the actions supported by each item. **Item catalogue** is a searchable reference with category, family and tier filters, sorting and pages. Search by name, stable item ID, material, tool role or loot location. Item details show useful statistics, known loot locations, recipes that make the item, and recipes that use it.

**Crafting & building** has its own search, result-family and result-tier filters, pages, and **Ready to craft** switch. Each recipe lists inputs, reusable tools, its station when needed, and the reason it is unavailable. Following a recipe from an item's details opens that exact recipe. Browsing definitions does not put them in your pack.

Equip melee weapons or guns before attacking. Protective garments use the single clothing slot, and carrying designs use the backpack slot. Consumables apply their listed hunger, thirst, stamina, health, bleeding or infection effects and use one item. Ammunition must match the weapon's listed type; **R** loads rounds from your pack into its own magazine.

Tier **0 to 5** is an equipment and preparation reference. The rarity label follows the item's tier. Neither is a character-level requirement. Recipes become available when their actual materials, tools, campfire and capacity requirements are satisfied.

## Families

| Group | Definitions | What changes in play |
| --- | ---: | --- |
| Established supplies and equipment | 219 | Core food, treatment, tools, ammunition, materials, books and gear |
| Food ingredients | 96 | Orchard fruit, vegetables, grains, pulses and preserved protein with different weight and recovery values |
| Prepared meals | 672 | Seven preparations per ingredient, with travel weight, hunger, hydration, stamina and ingredient tradeoffs |
| Herbs and spices | 24 | Ingredients for drinks and field-care preparations |
| Prepared drinks | 320 | Four drink preparations for each fruit, vegetable and herb base |
| Prepared field care | 144 | Six preparations per herb, using the simplified health, bleeding and infection meters |
| Metal stock and worked components | 140 | Twenty metal profiles, each with stock, billet, plate, bar, edged blank, hinge and mechanism forms |
| Timber stock and components | 70 | Fourteen wood profiles with timber, grips, shafts, frames and slats |
| Textile stock and components | 120 | Twenty-four fabric profiles with textile, panel, cord, padding and reinforcement forms |
| Material melee weapons | 520 | Twenty metal profiles across twenty-six combat designs |
| Material field tools | 320 | Twenty metal profiles across sixteen reusable tool designs |
| Protective garments | 432 | Twenty-four fabric profiles across eighteen garment designs |
| Carrying equipment | 288 | Twenty-four fabric profiles across twelve bag and frame designs |
| Receiver assemblies | 10 | Recovered ingredients for ranged equipment |
| Ranged equipment | 80 | Ten receiver profiles across eight designs with compatible ammunition and separate magazines |

Material profiles change weight, damage, attack recovery, stamina cost, protection or carrying capacity as applicable. Weapon designs add differences in reach, sound, recovery and resource cost. Food preparation changes the recovery balance and the supplies needed to make a meal. The catalogue stores these values as immutable records with stable IDs, which saves and multiplayer inventories use.

Specialized names use the current common systems. Garments share one protective slot; insulation and separate limb armor are future work. Bags hold any supply that fits their weight limit. Ranged designs use the existing single-target attack model, including the quiet bolt launcher. Ingredients and processing are abstract game units, and field-care recipes describe game-meter effects.

## Where supplies come from

Follow roads to houses and specialized businesses, then press **E** near supplies. The item reference's **Loot locations** list gives actual table memberships. Useful starting points include:

| Supply | Places to search |
| --- | --- |
| Fruit, vegetables, grains and protein | Farms, groceries, restaurants and houses; some grain and protein also appear in warehouses or camps |
| Herbs and spices | Forests, rivers, farms, cabins and camps; pantry spices also appear in groceries, restaurants, pharmacies and houses |
| Metal stock | Industrial stores, hardware shops, garages and warehouses |
| Specific timber | Forests, cabins, farms and camps |
| Textile stock | Clothing shops, warehouses, houses and suburban supplies |
| Receiver assemblies | Hunting shops, police outposts, warehouses and garages |
| Ready-made basic material gear | Selected hardware, workshop, garage, clothing, house, warehouse, camp, hunting-shop and police supplies |

The expansion adds a weighted pool to existing loot tables while keeping established entries' weights. Every noncentral procedural supplies container retains its baseline food and water. The safe cabin retains starting supplies and tools. An item may have a recipe without direct loot locations; use its **Make this item** link to follow the preparation chain.

In the deterministic test sample, **13,311 generated containers across 3,136 sectors and 64 seeds** exposed all **484 direct-loot item IDs**, with **485 distinct items** observed including starter gear. The sample covered six biomes and 38 location labels. This measures generation and acquisition coverage; a short ordinary play session will find a smaller selection.

## Example progression

**Spring steel camp axe:** scavenge spring steel stock, charcoal and tools. Form a billet beside a campfire with a hammer, shape a bar with a file, then prepare an edged blank with cloth, a file and a sharpening stone. Assemble the axe from a bar, edged blank, spruce grip and bolts, keeping a wrench and file. The axe has its own weight and combat profile and gains the axe bonuses against trees and doors.

**Ripstop expedition pack:** prepare ripstop panels, cord, padding and reinforcement from textile stock and sewing supplies. Combine these with the listed timber frame and metal hinge using a sewing kit, saw and woodcraft manual. Equipping the completed pack adds **17 kg** of carrying capacity at **1.27 kg** of pack weight.

**Food and care:** an apricot can be eaten or prepared as salad, compote, dried slices, fruit leather, preserve, grain bowl or trail mix. Meadow mint can be prepared as a drink or used with treatment supplies in a reinforced dressing. Campfire recipes need a campfire within 100 pixels. Others can be prepared directly when the listed inputs and tools are carried.

**Mining tools:** equip a material chipping pick, such as the tool steel chipping pick, and strike a nearby seeded surface deposit. Its mining damage applies to the deposit. Exhausted deposits yield stone or ore, and a full pack leaves those resources in a ground supplies pile. A companion assigned to gather can use a suitable pick stored at home.

## Tool and inventory rules

Material tool designs can satisfy established reusable prerequisites through their listed tool roles. A field file serves file and sharpening-stone requirements, a flat driver serves screwdriver requirements, and suitable combat knives serve kitchen-knife requirements. Matching tools remain in your pack after ordinary crafting and can remain equipped during preparation.

Recipe payment must leave at least one matching kept tool. Dismantling your only material wrench cannot also use that same consumed copy as the required wrench. A spare copy or another suitable wrench permits the transaction.

Crafting checks the resulting inventory before paying. A full pack or a stack above 1,000 rejects the complete craft. Dismantling an equipped backpack also checks the smaller resulting capacity. When an equipped item is deliberately used as a recipe ingredient, its slot is updated after successful payment. Recovering equipment returns some stock and loses other assembly supplies.

The tests in [item-depth.cjs](../tests/item-depth.cjs) check immutable metadata, reference validity, full acquisition reachability, real seeded loot, multi-stage processing, consumption, retained tools, combat, mining, terrain destruction, protective clothing, pack capacity, atomic rejection and generated-world save/reload. Controlled action fixtures provide supplies and clear terrain; they are separate from the generation sample and are not an unassisted survival playthrough.

Run the focused checks with:

```sh
node tests/item-depth.cjs
```
