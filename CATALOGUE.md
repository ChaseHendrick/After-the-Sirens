# After the Sirens item catalogue

Version 0.5 contains **3,455 original item definitions**, **4,457 crafting and salvage recipes**, and **27 loot tables**.

The catalogue combines 219 original supplies with 3,236 curated material, design and preparation entries. Materials change equipment costs, weight and handling; designs change reach, protection or carrying capacity; food preparations change nutrition, hydration and recovery. These are original game records, not imported items from another game.

Press **I → Item catalogue** to search IDs, names and materials, filter family or tier, and browse 48 entries per page. Obtain details link directly to their crafting paths. Crafting lists 24 recipes per page and explains exact ingredients, kept tools, campfires and pack space. [The item guide](docs/ITEMS.md) explains the families and a complete metal-to-axe path.

All definitions can be obtained through actual loot or a recipe whose inputs and tools are obtainable. Advanced assemblies are usually craft-only. Extension loot receives at most 12% of a table's original total weight, giving added pools at most a 10.7% draw chance while keeping the original rows. Saves retain older item IDs.

## Functional data

- 1,295 consumable records change needs, health, stamina, bleeding or infection.
- 954 records have actual melee or ranged weapon statistics, including reusable field tools.
- 446 garments provide protection through the existing clothing slot.
- 297 carrying designs add capacity through the existing backpack slot.
- Material tools substitute for compatible recipe and project tools, remain after crafting, and include actual mining and terrain damage bonuses.

Ingredients are consumed, while required tools remain. Campfire recipes require a nearby fire. Crafting and equipment transactions respect carried weight and stack limits. Medical, food and weapon effects are game abstractions. Items use shared stacks and do not have individual durability, freshness or liquid volume.

Clay, the route atlas, compass, binoculars, whistle and lamp collectibles retain their stated limitations. Electrical networks, separate equipped lights, body-region clothing, temperature and waterproofing are not implemented. Named equipment designs use their documented statistics.

## Category totals

| Category | Items |
| --- | ---: |
| ammo | 7 |
| books | 8 |
| clothing | 446 |
| containers | 297 |
| drinks | 332 |
| electronics | 12 |
| firearms | 91 |
| food | 804 |
| materials | 379 |
| medical | 159 |
| melee | 541 |
| tools | 340 |
| utility | 39 |

## Ammo

| Stable ID | Item | Family | Tier | kg | Obtain |
| --- | --- | --- | ---: | ---: | --- |
| `crossbow_bolt` | Crossbow bolt | ammo | 0 | 0.06 | Loot: gunshop |
| `heavy_round` | Heavy rifle round | ammo | 0 | 0.04 | Loot: gunshop, police |
| `arrow` | Hunting arrow | ammo | 0 | 0.04 | Loot: camp, forest, gunshop, ranger |
| `magnum_round` | Large handgun round | ammo | 0 | 0.02 | Loot: gunshop, police |
| `ammo` | Pistol round | ammo | 0 | 0.04 | Loot: default, gunshop, police |
| `rifle_round` | Rifle round | ammo | 0 | 0.02 | Loot: cabin, gunshop, police |
| `shotgun_shell` | Shotgun shell | ammo | 0 | 0.04 | Loot: gunshop, police |

## Books

| Stable ID | Item | Family | Tier | kg | Obtain |
| --- | --- | --- | ---: | ---: | --- |
| `reloading_manual` | Ammunition workshop notes | books | 0 | 0.40 | Loot: gunshop, library |
| `cooking_manual` | Camp kitchen notebook | books | 0 | 0.30 | Loot: farm, library, restaurant |
| `electronics_manual` | Circuit repair handbook | books | 0 | 0.45 | Loot: depot, industrial, library, radio, warehouse, workshop |
| `route_atlas` | County route atlas | books | 0 | 0.50 | Loot: library |
| `first_aid_manual` | Field care manual | books | 0 | 0.35 | Loot: clinic, library, pharmacy |
| `field_guide` | Local plant guide | books | 0 | 0.30 | Loot: cabin, camp, forest, library, ranger, river |
| `tailoring_manual` | Stitching handbook | books | 0 | 0.30 | Loot: clothing, depot, library, warehouse, workshop |
| `woodcraft_manual` | Woodcraft handbook | books | 0 | 0.35 | Loot: cabin, forest, library |

## Clothing

| Stable ID | Item | Family | Tier | kg | Obtain |
| --- | --- | --- | ---: | ---: | --- |
| `aramid_arm_wrap` | Aramid Arm Wrap | Protective garment designs | 4 | 0.17 | Craft: Sew Aramid Arm Wrap |
| `aramid_breacher_vest` | Aramid Breacher Vest | Protective garment designs | 5 | 1.81 | Craft: Sew Aramid Breacher Vest |
| `aramid_courier_jerkin` | Aramid Courier Jerkin | Protective garment designs | 5 | 0.66 | Craft: Sew Aramid Courier Jerkin |
| `aramid_forester_coat` | Aramid Forester Coat | Protective garment designs | 4 | 0.77 | Craft: Sew Aramid Forester Coat |
| `aramid_guard_tabard` | Aramid Guard Tabard | Protective garment designs | 5 | 1.12 | Craft: Sew Aramid Guard Tabard |
| `aramid_knee_guard` | Aramid Knee Guard | Protective garment designs | 4 | 0.22 | Craft: Sew Aramid Knee Guard |
| `aramid_mechanic_apron` | Aramid Mechanic Apron | Protective garment designs | 4 | 0.67 | Craft: Sew Aramid Mechanic Apron |
| `aramid_padded_helmet` | Aramid Padded Helmet | Protective garment designs | 5 | 0.53 | Craft: Sew Aramid Padded Helmet |
| `aramid_patchwork_poncho` | Aramid Patchwork Poncho | Protective garment designs | 4 | 0.58 | Craft: Sew Aramid Patchwork Poncho |
| `aramid_patrol_coat` | Aramid Patrol Coat | Protective garment designs | 5 | 1.05 | Craft: Sew Aramid Patrol Coat |
| `aramid_quilted_coat` | Aramid Quilted Coat | Protective garment designs | 5 | 1.16 | Craft: Sew Aramid Quilted Coat |
| `aramid_reinforced_jacket` | Aramid Reinforced Jacket | Protective garment designs | 5 | 1.29 | Craft: Sew Aramid Reinforced Jacket |
| `aramid_salvager_overall` | Aramid Salvager Overall | Protective garment designs | 5 | 1.04 | Craft: Sew Aramid Salvager Overall |
| `aramid_scout_wrap` | Aramid Scout Wrap | Protective garment designs | 4 | 0.25 | Craft: Sew Aramid Scout Wrap |
| `aramid_shoulder_mantle` | Aramid Shoulder Mantle | Protective garment designs | 4 | 0.45 | Craft: Sew Aramid Shoulder Mantle |
| `aramid_trail_tunic` | Aramid Trail Tunic | Protective garment designs | 4 | 0.40 | Craft: Sew Aramid Trail Tunic |
| `aramid_utility_vest` | Aramid Utility Vest | Protective garment designs | 4 | 0.35 | Craft: Sew Aramid Utility Vest |
| `aramid_work_smock` | Aramid Work Smock | Protective garment designs | 4 | 0.49 | Craft: Sew Aramid Work Smock |
| `ballistic_nylon_arm_wrap` | Ballistic Nylon Arm Wrap | Protective garment designs | 3 | 0.22 | Craft: Sew Ballistic Nylon Arm Wrap |
| `ballistic_nylon_breacher_vest` | Ballistic Nylon Breacher Vest | Protective garment designs | 4 | 2.31 | Craft: Sew Ballistic Nylon Breacher Vest |
| `ballistic_nylon_courier_jerkin` | Ballistic Nylon Courier Jerkin | Protective garment designs | 4 | 0.82 | Craft: Sew Ballistic Nylon Courier Jerkin |
| `ballistic_nylon_forester_coat` | Ballistic Nylon Forester Coat | Protective garment designs | 3 | 1.00 | Craft: Sew Ballistic Nylon Forester Coat |
| `ballistic_nylon_guard_tabard` | Ballistic Nylon Guard Tabard | Protective garment designs | 4 | 1.41 | Craft: Sew Ballistic Nylon Guard Tabard |
| `ballistic_nylon_knee_guard` | Ballistic Nylon Knee Guard | Protective garment designs | 3 | 0.29 | Craft: Sew Ballistic Nylon Knee Guard |
| `ballistic_nylon_mechanic_apron` | Ballistic Nylon Mechanic Apron | Protective garment designs | 3 | 0.87 | Craft: Sew Ballistic Nylon Mechanic Apron |
| `ballistic_nylon_padded_helmet` | Ballistic Nylon Padded Helmet | Protective garment designs | 4 | 0.64 | Craft: Sew Ballistic Nylon Padded Helmet |
| `ballistic_nylon_patchwork_poncho` | Ballistic Nylon Patchwork Poncho | Protective garment designs | 3 | 0.76 | Craft: Sew Ballistic Nylon Patchwork Poncho |
| `ballistic_nylon_patrol_coat` | Ballistic Nylon Patrol Coat | Protective garment designs | 4 | 1.32 | Craft: Sew Ballistic Nylon Patrol Coat |
| `ballistic_nylon_quilted_coat` | Ballistic Nylon Quilted Coat | Protective garment designs | 4 | 1.47 | Craft: Sew Ballistic Nylon Quilted Coat |
| `ballistic_nylon_reinforced_jacket` | Ballistic Nylon Reinforced Jacket | Protective garment designs | 4 | 1.63 | Craft: Sew Ballistic Nylon Reinforced Jacket |
| `ballistic_nylon_salvager_overall` | Ballistic Nylon Salvager Overall | Protective garment designs | 4 | 1.30 | Craft: Sew Ballistic Nylon Salvager Overall |
| `ballistic_nylon_scout_wrap` | Ballistic Nylon Scout Wrap | Protective garment designs | 3 | 0.33 | Craft: Sew Ballistic Nylon Scout Wrap |
| `ballistic_nylon_shoulder_mantle` | Ballistic Nylon Shoulder Mantle | Protective garment designs | 3 | 0.59 | Craft: Sew Ballistic Nylon Shoulder Mantle |
| `ballistic_nylon_trail_tunic` | Ballistic Nylon Trail Tunic | Protective garment designs | 3 | 0.52 | Craft: Sew Ballistic Nylon Trail Tunic |
| `ballistic_nylon_utility_vest` | Ballistic Nylon Utility Vest | Protective garment designs | 3 | 0.46 | Craft: Sew Ballistic Nylon Utility Vest |
| `ballistic_nylon_work_smock` | Ballistic Nylon Work Smock | Protective garment designs | 3 | 0.64 | Craft: Sew Ballistic Nylon Work Smock |
| `burlap_arm_wrap` | Burlap Arm Wrap | Protective garment designs | 0 | 0.16 | Craft: Sew Burlap Arm Wrap |
| `burlap_breacher_vest` | Burlap Breacher Vest | Protective garment designs | 1 | 1.73 | Craft: Sew Burlap Breacher Vest |
| `burlap_courier_jerkin` | Burlap Courier Jerkin | Protective garment designs | 1 | 0.64 | Craft: Sew Burlap Courier Jerkin |
| `burlap_forester_coat` | Burlap Forester Coat | Protective garment designs | 0 | 0.74 | Craft: Sew Burlap Forester Coat |
| `burlap_guard_tabard` | Burlap Guard Tabard | Protective garment designs | 1 | 1.08 | Craft: Sew Burlap Guard Tabard |
| `burlap_knee_guard` | Burlap Knee Guard | Protective garment designs | 0 | 0.21 | Craft: Sew Burlap Knee Guard |
| `burlap_mechanic_apron` | Burlap Mechanic Apron | Protective garment designs | 0 | 0.64 | Craft: Sew Burlap Mechanic Apron |
| `burlap_padded_helmet` | Burlap Padded Helmet | Protective garment designs | 1 | 0.51 | Craft: Sew Burlap Padded Helmet |
| `burlap_patchwork_poncho` | Burlap Patchwork Poncho | Protective garment designs | 0 | 0.56 | Craft: Sew Burlap Patchwork Poncho |
| `burlap_patrol_coat` | Burlap Patrol Coat | Protective garment designs | 1 | 1.01 | Craft: Sew Burlap Patrol Coat |
| `burlap_quilted_coat` | Burlap Quilted Coat | Protective garment designs | 1 | 1.12 | Craft: Sew Burlap Quilted Coat |
| `burlap_reinforced_jacket` | Burlap Reinforced Jacket | Protective garment designs | 1 | 1.24 | Craft: Sew Burlap Reinforced Jacket |
| `burlap_salvager_overall` | Burlap Salvager Overall | Protective garment designs | 1 | 1.00 | Craft: Sew Burlap Salvager Overall |
| `burlap_scout_wrap` | Burlap Scout Wrap | Protective garment designs | 0 | 0.24 | Craft: Sew Burlap Scout Wrap |
| `burlap_shoulder_mantle` | Burlap Shoulder Mantle | Protective garment designs | 0 | 0.44 | Craft: Sew Burlap Shoulder Mantle |
| `burlap_trail_tunic` | Burlap Trail Tunic | Protective garment designs | 0 | 0.38 | Craft: Sew Burlap Trail Tunic |
| `burlap_utility_vest` | Burlap Utility Vest | Protective garment designs | 0 | 0.34 | Craft: Sew Burlap Utility Vest |
| `burlap_work_smock` | Burlap Work Smock | Protective garment designs | 0 | 0.47 | Craft: Sew Burlap Work Smock |
| `canvas_coat` | Canvas coat | clothing | 0 | 1.40 | Loot: clothing, depot, house, suburban, warehouse |
| `corduroy_arm_wrap` | Corduroy Arm Wrap | Protective garment designs | 0 | 0.19 | Craft: Sew Corduroy Arm Wrap |
| `corduroy_breacher_vest` | Corduroy Breacher Vest | Protective garment designs | 1 | 2.00 | Craft: Sew Corduroy Breacher Vest |
| `corduroy_courier_jerkin` | Corduroy Courier Jerkin | Protective garment designs | 1 | 0.73 | Craft: Sew Corduroy Courier Jerkin |
| `corduroy_forester_coat` | Corduroy Forester Coat | Protective garment designs | 0 | 0.86 | Craft: Sew Corduroy Forester Coat |
| `corduroy_guard_tabard` | Corduroy Guard Tabard | Protective garment designs | 1 | 1.23 | Craft: Sew Corduroy Guard Tabard |
| `corduroy_knee_guard` | Corduroy Knee Guard | Protective garment designs | 0 | 0.25 | Craft: Sew Corduroy Knee Guard |
| `corduroy_mechanic_apron` | Corduroy Mechanic Apron | Protective garment designs | 0 | 0.75 | Craft: Sew Corduroy Mechanic Apron |
| `corduroy_padded_helmet` | Corduroy Padded Helmet | Protective garment designs | 1 | 0.57 | Craft: Sew Corduroy Padded Helmet |
| `corduroy_patchwork_poncho` | Corduroy Patchwork Poncho | Protective garment designs | 0 | 0.65 | Craft: Sew Corduroy Patchwork Poncho |
| `corduroy_patrol_coat` | Corduroy Patrol Coat | Protective garment designs | 1 | 1.15 | Craft: Sew Corduroy Patrol Coat |
| `corduroy_quilted_coat` | Corduroy Quilted Coat | Protective garment designs | 1 | 1.28 | Craft: Sew Corduroy Quilted Coat |
| `corduroy_reinforced_jacket` | Corduroy Reinforced Jacket | Protective garment designs | 1 | 1.42 | Craft: Sew Corduroy Reinforced Jacket |
| `corduroy_salvager_overall` | Corduroy Salvager Overall | Protective garment designs | 1 | 1.14 | Craft: Sew Corduroy Salvager Overall |
| `corduroy_scout_wrap` | Corduroy Scout Wrap | Protective garment designs | 0 | 0.28 | Craft: Sew Corduroy Scout Wrap |
| `corduroy_shoulder_mantle` | Corduroy Shoulder Mantle | Protective garment designs | 0 | 0.51 | Craft: Sew Corduroy Shoulder Mantle |
| `corduroy_trail_tunic` | Corduroy Trail Tunic | Protective garment designs | 0 | 0.44 | Craft: Sew Corduroy Trail Tunic |
| `corduroy_utility_vest` | Corduroy Utility Vest | Protective garment designs | 0 | 0.39 | Craft: Sew Corduroy Utility Vest |
| `corduroy_work_smock` | Corduroy Work Smock | Protective garment designs | 0 | 0.55 | Craft: Sew Corduroy Work Smock |
| `cotton_twill_arm_wrap` | Cotton Twill Arm Wrap | Protective garment designs | 0 | 0.16 | Craft: Sew Cotton Twill Arm Wrap |
| `cotton_twill_breacher_vest` | Cotton Twill Breacher Vest | Protective garment designs | 1 | 1.71 | Craft: Sew Cotton Twill Breacher Vest |
| `cotton_twill_courier_jerkin` | Cotton Twill Courier Jerkin | Protective garment designs | 1 | 0.64 | Craft: Sew Cotton Twill Courier Jerkin |
| `cotton_twill_forester_coat` | Cotton Twill Forester Coat | Protective garment designs | 0 | 0.73 | Craft: Sew Cotton Twill Forester Coat |
| `cotton_twill_guard_tabard` | Cotton Twill Guard Tabard | Protective garment designs | 1 | 1.06 | Craft: Sew Cotton Twill Guard Tabard |
| `cotton_twill_knee_guard` | Cotton Twill Knee Guard | Protective garment designs | 0 | 0.21 | Craft: Sew Cotton Twill Knee Guard |
| `cotton_twill_mechanic_apron` | Cotton Twill Mechanic Apron | Protective garment designs | 0 | 0.63 | Craft: Sew Cotton Twill Mechanic Apron |
| `cotton_twill_padded_helmet` | Cotton Twill Padded Helmet | Protective garment designs | 1 | 0.50 | Craft: Sew Cotton Twill Padded Helmet |
| `cotton_twill_patchwork_poncho` | Cotton Twill Patchwork Poncho | Protective garment designs | 0 | 0.55 | Loot: clothing, depot, house, warehouse |
| `cotton_twill_patrol_coat` | Cotton Twill Patrol Coat | Protective garment designs | 1 | 1.00 | Craft: Sew Cotton Twill Patrol Coat |
| `cotton_twill_quilted_coat` | Cotton Twill Quilted Coat | Protective garment designs | 1 | 1.10 | Craft: Sew Cotton Twill Quilted Coat |
| `cotton_twill_reinforced_jacket` | Cotton Twill Reinforced Jacket | Protective garment designs | 1 | 1.22 | Craft: Sew Cotton Twill Reinforced Jacket |
| `cotton_twill_salvager_overall` | Cotton Twill Salvager Overall | Protective garment designs | 1 | 0.98 | Craft: Sew Cotton Twill Salvager Overall |
| `cotton_twill_scout_wrap` | Cotton Twill Scout Wrap | Protective garment designs | 0 | 0.24 | Loot: clothing, depot, house, warehouse |
| `cotton_twill_shoulder_mantle` | Cotton Twill Shoulder Mantle | Protective garment designs | 0 | 0.43 | Craft: Sew Cotton Twill Shoulder Mantle |
| `cotton_twill_trail_tunic` | Cotton Twill Trail Tunic | Protective garment designs | 0 | 0.38 | Craft: Sew Cotton Twill Trail Tunic |
| `cotton_twill_utility_vest` | Cotton Twill Utility Vest | Protective garment designs | 0 | 0.33 | Loot: clothing, depot, house, warehouse |
| `cotton_twill_work_smock` | Cotton Twill Work Smock | Protective garment designs | 0 | 0.46 | Loot: clothing, depot, house, warehouse |
| `denim_arm_wrap` | Denim Arm Wrap | Protective garment designs | 1 | 0.21 | Craft: Sew Denim Arm Wrap |
| `denim_breacher_vest` | Denim Breacher Vest | Protective garment designs | 2 | 2.23 | Craft: Sew Denim Breacher Vest |
| `denim_courier_jerkin` | Denim Courier Jerkin | Protective garment designs | 2 | 0.80 | Craft: Sew Denim Courier Jerkin |
| `denim_forester_coat` | Denim Forester Coat | Protective garment designs | 1 | 0.97 | Craft: Sew Denim Forester Coat |
| `denim_guard_tabard` | Denim Guard Tabard | Protective garment designs | 2 | 1.37 | Craft: Sew Denim Guard Tabard |
| `denim_knee_guard` | Denim Knee Guard | Protective garment designs | 1 | 0.28 | Craft: Sew Denim Knee Guard |
| `denim_mechanic_apron` | Denim Mechanic Apron | Protective garment designs | 1 | 0.84 | Craft: Sew Denim Mechanic Apron |
| `denim_padded_helmet` | Denim Padded Helmet | Protective garment designs | 2 | 0.62 | Craft: Sew Denim Padded Helmet |
| `denim_patchwork_poncho` | Denim Patchwork Poncho | Protective garment designs | 1 | 0.73 | Loot: clothing, depot, house, warehouse |
| `denim_patrol_coat` | Denim Patrol Coat | Protective garment designs | 2 | 1.28 | Craft: Sew Denim Patrol Coat |
| `denim_quilted_coat` | Denim Quilted Coat | Protective garment designs | 2 | 1.42 | Craft: Sew Denim Quilted Coat |
| `denim_reinforced_jacket` | Denim Reinforced Jacket | Protective garment designs | 2 | 1.58 | Craft: Sew Denim Reinforced Jacket |
| `denim_salvager_overall` | Denim Salvager Overall | Protective garment designs | 2 | 1.27 | Craft: Sew Denim Salvager Overall |
| `denim_scout_wrap` | Denim Scout Wrap | Protective garment designs | 1 | 0.32 | Loot: clothing, depot, house, warehouse |
| `denim_shoulder_mantle` | Denim Shoulder Mantle | Protective garment designs | 1 | 0.57 | Craft: Sew Denim Shoulder Mantle |
| `denim_trail_tunic` | Denim Trail Tunic | Protective garment designs | 1 | 0.50 | Craft: Sew Denim Trail Tunic |
| `denim_utility_vest` | Denim Utility Vest | Protective garment designs | 1 | 0.44 | Loot: clothing, depot, house, warehouse |
| `denim_work_smock` | Denim Work Smock | Protective garment designs | 1 | 0.62 | Loot: clothing, depot, house, warehouse |
| `denim_jacket` | Denim jacket | clothing | 0 | 1.00 | Loot: clothing, depot, house, suburban, urban, warehouse |
| `duckcloth_arm_wrap` | Duckcloth Arm Wrap | Protective garment designs | 1 | 0.22 | Craft: Sew Duckcloth Arm Wrap |
| `duckcloth_breacher_vest` | Duckcloth Breacher Vest | Protective garment designs | 2 | 2.33 | Craft: Sew Duckcloth Breacher Vest |
| `duckcloth_courier_jerkin` | Duckcloth Courier Jerkin | Protective garment designs | 2 | 0.83 | Craft: Sew Duckcloth Courier Jerkin |
| `duckcloth_forester_coat` | Duckcloth Forester Coat | Protective garment designs | 1 | 1.01 | Craft: Sew Duckcloth Forester Coat |
| `duckcloth_guard_tabard` | Duckcloth Guard Tabard | Protective garment designs | 2 | 1.43 | Craft: Sew Duckcloth Guard Tabard |
| `duckcloth_knee_guard` | Duckcloth Knee Guard | Protective garment designs | 1 | 0.29 | Craft: Sew Duckcloth Knee Guard |
| `duckcloth_mechanic_apron` | Duckcloth Mechanic Apron | Protective garment designs | 1 | 0.88 | Craft: Sew Duckcloth Mechanic Apron |
| `duckcloth_padded_helmet` | Duckcloth Padded Helmet | Protective garment designs | 2 | 0.65 | Craft: Sew Duckcloth Padded Helmet |
| `duckcloth_patchwork_poncho` | Duckcloth Patchwork Poncho | Protective garment designs | 1 | 0.76 | Craft: Sew Duckcloth Patchwork Poncho |
| `duckcloth_patrol_coat` | Duckcloth Patrol Coat | Protective garment designs | 2 | 1.34 | Craft: Sew Duckcloth Patrol Coat |
| `duckcloth_quilted_coat` | Duckcloth Quilted Coat | Protective garment designs | 2 | 1.48 | Craft: Sew Duckcloth Quilted Coat |
| `duckcloth_reinforced_jacket` | Duckcloth Reinforced Jacket | Protective garment designs | 2 | 1.65 | Craft: Sew Duckcloth Reinforced Jacket |
| `duckcloth_salvager_overall` | Duckcloth Salvager Overall | Protective garment designs | 2 | 1.32 | Craft: Sew Duckcloth Salvager Overall |
| `duckcloth_scout_wrap` | Duckcloth Scout Wrap | Protective garment designs | 1 | 0.33 | Craft: Sew Duckcloth Scout Wrap |
| `duckcloth_shoulder_mantle` | Duckcloth Shoulder Mantle | Protective garment designs | 1 | 0.60 | Craft: Sew Duckcloth Shoulder Mantle |
| `duckcloth_trail_tunic` | Duckcloth Trail Tunic | Protective garment designs | 1 | 0.52 | Craft: Sew Duckcloth Trail Tunic |
| `duckcloth_utility_vest` | Duckcloth Utility Vest | Protective garment designs | 1 | 0.46 | Craft: Sew Duckcloth Utility Vest |
| `duckcloth_work_smock` | Duckcloth Work Smock | Protective garment designs | 1 | 0.64 | Craft: Sew Duckcloth Work Smock |
| `felt_blend_arm_wrap` | Felt Blend Arm Wrap | Protective garment designs | 1 | 0.21 | Craft: Sew Felt Blend Arm Wrap |
| `felt_blend_breacher_vest` | Felt Blend Breacher Vest | Protective garment designs | 2 | 2.21 | Craft: Sew Felt Blend Breacher Vest |
| `felt_blend_courier_jerkin` | Felt Blend Courier Jerkin | Protective garment designs | 2 | 0.79 | Craft: Sew Felt Blend Courier Jerkin |
| `felt_blend_forester_coat` | Felt Blend Forester Coat | Protective garment designs | 1 | 0.96 | Craft: Sew Felt Blend Forester Coat |
| `felt_blend_guard_tabard` | Felt Blend Guard Tabard | Protective garment designs | 2 | 1.36 | Craft: Sew Felt Blend Guard Tabard |
| `felt_blend_knee_guard` | Felt Blend Knee Guard | Protective garment designs | 1 | 0.28 | Craft: Sew Felt Blend Knee Guard |
| `felt_blend_mechanic_apron` | Felt Blend Mechanic Apron | Protective garment designs | 1 | 0.84 | Craft: Sew Felt Blend Mechanic Apron |
| `felt_blend_padded_helmet` | Felt Blend Padded Helmet | Protective garment designs | 2 | 0.62 | Craft: Sew Felt Blend Padded Helmet |
| `felt_blend_patchwork_poncho` | Felt Blend Patchwork Poncho | Protective garment designs | 1 | 0.72 | Craft: Sew Felt Blend Patchwork Poncho |
| `felt_blend_patrol_coat` | Felt Blend Patrol Coat | Protective garment designs | 2 | 1.27 | Craft: Sew Felt Blend Patrol Coat |
| `felt_blend_quilted_coat` | Felt Blend Quilted Coat | Protective garment designs | 2 | 1.41 | Craft: Sew Felt Blend Quilted Coat |
| `felt_blend_reinforced_jacket` | Felt Blend Reinforced Jacket | Protective garment designs | 2 | 1.57 | Craft: Sew Felt Blend Reinforced Jacket |
| `felt_blend_salvager_overall` | Felt Blend Salvager Overall | Protective garment designs | 2 | 1.25 | Craft: Sew Felt Blend Salvager Overall |
| `felt_blend_scout_wrap` | Felt Blend Scout Wrap | Protective garment designs | 1 | 0.31 | Craft: Sew Felt Blend Scout Wrap |
| `felt_blend_shoulder_mantle` | Felt Blend Shoulder Mantle | Protective garment designs | 1 | 0.57 | Craft: Sew Felt Blend Shoulder Mantle |
| `felt_blend_trail_tunic` | Felt Blend Trail Tunic | Protective garment designs | 1 | 0.50 | Craft: Sew Felt Blend Trail Tunic |
| `felt_blend_utility_vest` | Felt Blend Utility Vest | Protective garment designs | 1 | 0.44 | Craft: Sew Felt Blend Utility Vest |
| `felt_blend_work_smock` | Felt Blend Work Smock | Protective garment designs | 1 | 0.61 | Craft: Sew Felt Blend Work Smock |
| `firecloth_arm_wrap` | Firecloth Arm Wrap | Protective garment designs | 3 | 0.26 | Craft: Sew Firecloth Arm Wrap |
| `firecloth_breacher_vest` | Firecloth Breacher Vest | Protective garment designs | 4 | 2.71 | Craft: Sew Firecloth Breacher Vest |
| `firecloth_courier_jerkin` | Firecloth Courier Jerkin | Protective garment designs | 4 | 0.95 | Craft: Sew Firecloth Courier Jerkin |
| `firecloth_forester_coat` | Firecloth Forester Coat | Protective garment designs | 3 | 1.19 | Craft: Sew Firecloth Forester Coat |
| `firecloth_guard_tabard` | Firecloth Guard Tabard | Protective garment designs | 4 | 1.65 | Craft: Sew Firecloth Guard Tabard |
| `firecloth_knee_guard` | Firecloth Knee Guard | Protective garment designs | 3 | 0.35 | Craft: Sew Firecloth Knee Guard |
| `firecloth_mechanic_apron` | Firecloth Mechanic Apron | Protective garment designs | 3 | 1.04 | Craft: Sew Firecloth Mechanic Apron |
| `firecloth_padded_helmet` | Firecloth Padded Helmet | Protective garment designs | 4 | 0.73 | Craft: Sew Firecloth Padded Helmet |
| `firecloth_patchwork_poncho` | Firecloth Patchwork Poncho | Protective garment designs | 3 | 0.90 | Craft: Sew Firecloth Patchwork Poncho |
| `firecloth_patrol_coat` | Firecloth Patrol Coat | Protective garment designs | 4 | 1.54 | Craft: Sew Firecloth Patrol Coat |
| `firecloth_quilted_coat` | Firecloth Quilted Coat | Protective garment designs | 4 | 1.72 | Craft: Sew Firecloth Quilted Coat |
| `firecloth_reinforced_jacket` | Firecloth Reinforced Jacket | Protective garment designs | 4 | 1.91 | Craft: Sew Firecloth Reinforced Jacket |
| `firecloth_salvager_overall` | Firecloth Salvager Overall | Protective garment designs | 4 | 1.52 | Craft: Sew Firecloth Salvager Overall |
| `firecloth_scout_wrap` | Firecloth Scout Wrap | Protective garment designs | 3 | 0.39 | Craft: Sew Firecloth Scout Wrap |
| `firecloth_shoulder_mantle` | Firecloth Shoulder Mantle | Protective garment designs | 3 | 0.70 | Craft: Sew Firecloth Shoulder Mantle |
| `firecloth_trail_tunic` | Firecloth Trail Tunic | Protective garment designs | 3 | 0.62 | Craft: Sew Firecloth Trail Tunic |
| `firecloth_utility_vest` | Firecloth Utility Vest | Protective garment designs | 3 | 0.54 | Craft: Sew Firecloth Utility Vest |
| `firecloth_work_smock` | Firecloth Work Smock | Protective garment designs | 3 | 0.76 | Craft: Sew Firecloth Work Smock |
| `fleece_arm_wrap` | Fleece Arm Wrap | Protective garment designs | 0 | 0.18 | Craft: Sew Fleece Arm Wrap |
| `fleece_breacher_vest` | Fleece Breacher Vest | Protective garment designs | 1 | 1.95 | Craft: Sew Fleece Breacher Vest |
| `fleece_courier_jerkin` | Fleece Courier Jerkin | Protective garment designs | 1 | 0.71 | Craft: Sew Fleece Courier Jerkin |
| `fleece_forester_coat` | Fleece Forester Coat | Protective garment designs | 0 | 0.84 | Craft: Sew Fleece Forester Coat |
| `fleece_guard_tabard` | Fleece Guard Tabard | Protective garment designs | 1 | 1.20 | Craft: Sew Fleece Guard Tabard |
| `fleece_knee_guard` | Fleece Knee Guard | Protective garment designs | 0 | 0.24 | Craft: Sew Fleece Knee Guard |
| `fleece_mechanic_apron` | Fleece Mechanic Apron | Protective garment designs | 0 | 0.73 | Craft: Sew Fleece Mechanic Apron |
| `fleece_padded_helmet` | Fleece Padded Helmet | Protective garment designs | 1 | 0.56 | Craft: Sew Fleece Padded Helmet |
| `fleece_patchwork_poncho` | Fleece Patchwork Poncho | Protective garment designs | 0 | 0.63 | Craft: Sew Fleece Patchwork Poncho |
| `fleece_patrol_coat` | Fleece Patrol Coat | Protective garment designs | 1 | 1.13 | Craft: Sew Fleece Patrol Coat |
| `fleece_quilted_coat` | Fleece Quilted Coat | Protective garment designs | 1 | 1.25 | Craft: Sew Fleece Quilted Coat |
| `fleece_reinforced_jacket` | Fleece Reinforced Jacket | Protective garment designs | 1 | 1.39 | Craft: Sew Fleece Reinforced Jacket |
| `fleece_salvager_overall` | Fleece Salvager Overall | Protective garment designs | 1 | 1.11 | Craft: Sew Fleece Salvager Overall |
| `fleece_scout_wrap` | Fleece Scout Wrap | Protective garment designs | 0 | 0.27 | Craft: Sew Fleece Scout Wrap |
| `fleece_shoulder_mantle` | Fleece Shoulder Mantle | Protective garment designs | 0 | 0.49 | Craft: Sew Fleece Shoulder Mantle |
| `fleece_trail_tunic` | Fleece Trail Tunic | Protective garment designs | 0 | 0.43 | Craft: Sew Fleece Trail Tunic |
| `fleece_utility_vest` | Fleece Utility Vest | Protective garment designs | 0 | 0.38 | Craft: Sew Fleece Utility Vest |
| `fleece_work_smock` | Fleece Work Smock | Protective garment designs | 0 | 0.53 | Craft: Sew Fleece Work Smock |
| `hard_hat` | Hard hat | clothing | 0 | 0.45 | Loot: industrial |
| `hemp_canvas_arm_wrap` | Hemp Canvas Arm Wrap | Protective garment designs | 1 | 0.20 | Craft: Sew Hemp Canvas Arm Wrap |
| `hemp_canvas_breacher_vest` | Hemp Canvas Breacher Vest | Protective garment designs | 2 | 2.14 | Craft: Sew Hemp Canvas Breacher Vest |
| `hemp_canvas_courier_jerkin` | Hemp Canvas Courier Jerkin | Protective garment designs | 2 | 0.77 | Craft: Sew Hemp Canvas Courier Jerkin |
| `hemp_canvas_forester_coat` | Hemp Canvas Forester Coat | Protective garment designs | 1 | 0.92 | Craft: Sew Hemp Canvas Forester Coat |
| `hemp_canvas_guard_tabard` | Hemp Canvas Guard Tabard | Protective garment designs | 2 | 1.32 | Craft: Sew Hemp Canvas Guard Tabard |
| `hemp_canvas_knee_guard` | Hemp Canvas Knee Guard | Protective garment designs | 1 | 0.27 | Craft: Sew Hemp Canvas Knee Guard |
| `hemp_canvas_mechanic_apron` | Hemp Canvas Mechanic Apron | Protective garment designs | 1 | 0.81 | Craft: Sew Hemp Canvas Mechanic Apron |
| `hemp_canvas_padded_helmet` | Hemp Canvas Padded Helmet | Protective garment designs | 2 | 0.60 | Craft: Sew Hemp Canvas Padded Helmet |
| `hemp_canvas_patchwork_poncho` | Hemp Canvas Patchwork Poncho | Protective garment designs | 1 | 0.70 | Loot: clothing, depot, house, warehouse |
| `hemp_canvas_patrol_coat` | Hemp Canvas Patrol Coat | Protective garment designs | 2 | 1.23 | Craft: Sew Hemp Canvas Patrol Coat |
| `hemp_canvas_quilted_coat` | Hemp Canvas Quilted Coat | Protective garment designs | 2 | 1.37 | Craft: Sew Hemp Canvas Quilted Coat |
| `hemp_canvas_reinforced_jacket` | Hemp Canvas Reinforced Jacket | Protective garment designs | 2 | 1.52 | Craft: Sew Hemp Canvas Reinforced Jacket |
| `hemp_canvas_salvager_overall` | Hemp Canvas Salvager Overall | Protective garment designs | 2 | 1.22 | Craft: Sew Hemp Canvas Salvager Overall |
| `hemp_canvas_scout_wrap` | Hemp Canvas Scout Wrap | Protective garment designs | 1 | 0.30 | Loot: clothing, depot, house, warehouse |
| `hemp_canvas_shoulder_mantle` | Hemp Canvas Shoulder Mantle | Protective garment designs | 1 | 0.55 | Craft: Sew Hemp Canvas Shoulder Mantle |
| `hemp_canvas_trail_tunic` | Hemp Canvas Trail Tunic | Protective garment designs | 1 | 0.48 | Craft: Sew Hemp Canvas Trail Tunic |
| `hemp_canvas_utility_vest` | Hemp Canvas Utility Vest | Protective garment designs | 1 | 0.42 | Loot: clothing, depot, house, warehouse |
| `hemp_canvas_work_smock` | Hemp Canvas Work Smock | Protective garment designs | 1 | 0.59 | Loot: clothing, depot, house, warehouse |
| `laminated_mesh_arm_wrap` | Laminated Mesh Arm Wrap | Protective garment designs | 4 | 0.18 | Craft: Sew Laminated Mesh Arm Wrap |
| `laminated_mesh_breacher_vest` | Laminated Mesh Breacher Vest | Protective garment designs | 5 | 1.97 | Craft: Sew Laminated Mesh Breacher Vest |
| `laminated_mesh_courier_jerkin` | Laminated Mesh Courier Jerkin | Protective garment designs | 5 | 0.72 | Craft: Sew Laminated Mesh Courier Jerkin |
| `laminated_mesh_forester_coat` | Laminated Mesh Forester Coat | Protective garment designs | 4 | 0.85 | Craft: Sew Laminated Mesh Forester Coat |
| `laminated_mesh_guard_tabard` | Laminated Mesh Guard Tabard | Protective garment designs | 5 | 1.22 | Craft: Sew Laminated Mesh Guard Tabard |
| `laminated_mesh_knee_guard` | Laminated Mesh Knee Guard | Protective garment designs | 4 | 0.25 | Craft: Sew Laminated Mesh Knee Guard |
| `laminated_mesh_mechanic_apron` | Laminated Mesh Mechanic Apron | Protective garment designs | 4 | 0.74 | Craft: Sew Laminated Mesh Mechanic Apron |
| `laminated_mesh_padded_helmet` | Laminated Mesh Padded Helmet | Protective garment designs | 5 | 0.56 | Craft: Sew Laminated Mesh Padded Helmet |
| `laminated_mesh_patchwork_poncho` | Laminated Mesh Patchwork Poncho | Protective garment designs | 4 | 0.64 | Craft: Sew Laminated Mesh Patchwork Poncho |
| `laminated_mesh_patrol_coat` | Laminated Mesh Patrol Coat | Protective garment designs | 5 | 1.14 | Craft: Sew Laminated Mesh Patrol Coat |
| `laminated_mesh_quilted_coat` | Laminated Mesh Quilted Coat | Protective garment designs | 5 | 1.26 | Craft: Sew Laminated Mesh Quilted Coat |
| `laminated_mesh_reinforced_jacket` | Laminated Mesh Reinforced Jacket | Protective garment designs | 5 | 1.40 | Craft: Sew Laminated Mesh Reinforced Jacket |
| `laminated_mesh_salvager_overall` | Laminated Mesh Salvager Overall | Protective garment designs | 5 | 1.13 | Craft: Sew Laminated Mesh Salvager Overall |
| `laminated_mesh_scout_wrap` | Laminated Mesh Scout Wrap | Protective garment designs | 4 | 0.28 | Craft: Sew Laminated Mesh Scout Wrap |
| `laminated_mesh_shoulder_mantle` | Laminated Mesh Shoulder Mantle | Protective garment designs | 4 | 0.50 | Craft: Sew Laminated Mesh Shoulder Mantle |
| `laminated_mesh_trail_tunic` | Laminated Mesh Trail Tunic | Protective garment designs | 4 | 0.44 | Craft: Sew Laminated Mesh Trail Tunic |
| `laminated_mesh_utility_vest` | Laminated Mesh Utility Vest | Protective garment designs | 4 | 0.39 | Craft: Sew Laminated Mesh Utility Vest |
| `laminated_mesh_work_smock` | Laminated Mesh Work Smock | Protective garment designs | 4 | 0.54 | Craft: Sew Laminated Mesh Work Smock |
| `leather_suede_arm_wrap` | Leather Suede Arm Wrap | Protective garment designs | 2 | 0.27 | Craft: Sew Leather Suede Arm Wrap |
| `leather_suede_breacher_vest` | Leather Suede Breacher Vest | Protective garment designs | 3 | 2.83 | Craft: Sew Leather Suede Breacher Vest |
| `leather_suede_courier_jerkin` | Leather Suede Courier Jerkin | Protective garment designs | 3 | 0.99 | Craft: Sew Leather Suede Courier Jerkin |
| `leather_suede_forester_coat` | Leather Suede Forester Coat | Protective garment designs | 2 | 1.24 | Craft: Sew Leather Suede Forester Coat |
| `leather_suede_guard_tabard` | Leather Suede Guard Tabard | Protective garment designs | 3 | 1.72 | Craft: Sew Leather Suede Guard Tabard |
| `leather_suede_knee_guard` | Leather Suede Knee Guard | Protective garment designs | 2 | 0.36 | Craft: Sew Leather Suede Knee Guard |
| `leather_suede_mechanic_apron` | Leather Suede Mechanic Apron | Protective garment designs | 2 | 1.08 | Craft: Sew Leather Suede Mechanic Apron |
| `leather_suede_padded_helmet` | Leather Suede Padded Helmet | Protective garment designs | 3 | 0.76 | Craft: Sew Leather Suede Padded Helmet |
| `leather_suede_patchwork_poncho` | Leather Suede Patchwork Poncho | Protective garment designs | 2 | 0.94 | Craft: Sew Leather Suede Patchwork Poncho |
| `leather_suede_patrol_coat` | Leather Suede Patrol Coat | Protective garment designs | 3 | 1.61 | Craft: Sew Leather Suede Patrol Coat |
| `leather_suede_quilted_coat` | Leather Suede Quilted Coat | Protective garment designs | 3 | 1.79 | Craft: Sew Leather Suede Quilted Coat |
| `leather_suede_reinforced_jacket` | Leather Suede Reinforced Jacket | Protective garment designs | 3 | 1.99 | Craft: Sew Leather Suede Reinforced Jacket |
| `leather_suede_salvager_overall` | Leather Suede Salvager Overall | Protective garment designs | 3 | 1.59 | Craft: Sew Leather Suede Salvager Overall |
| `leather_suede_scout_wrap` | Leather Suede Scout Wrap | Protective garment designs | 2 | 0.41 | Craft: Sew Leather Suede Scout Wrap |
| `leather_suede_shoulder_mantle` | Leather Suede Shoulder Mantle | Protective garment designs | 2 | 0.73 | Craft: Sew Leather Suede Shoulder Mantle |
| `leather_suede_trail_tunic` | Leather Suede Trail Tunic | Protective garment designs | 2 | 0.64 | Craft: Sew Leather Suede Trail Tunic |
| `leather_suede_utility_vest` | Leather Suede Utility Vest | Protective garment designs | 2 | 0.56 | Craft: Sew Leather Suede Utility Vest |
| `leather_suede_work_smock` | Leather Suede Work Smock | Protective garment designs | 2 | 0.79 | Craft: Sew Leather Suede Work Smock |
| `leather_jacket` | Leather jacket | clothing | 0 | 1.60 | Loot: clothing, depot, house, suburban, urban, warehouse |
| `linen_arm_wrap` | Linen Arm Wrap | Protective garment designs | 0 | 0.14 | Craft: Sew Linen Arm Wrap |
| `linen_breacher_vest` | Linen Breacher Vest | Protective garment designs | 1 | 1.52 | Craft: Sew Linen Breacher Vest |
| `linen_courier_jerkin` | Linen Courier Jerkin | Protective garment designs | 1 | 0.57 | Craft: Sew Linen Courier Jerkin |
| `linen_forester_coat` | Linen Forester Coat | Protective garment designs | 0 | 0.64 | Craft: Sew Linen Forester Coat |
| `linen_guard_tabard` | Linen Guard Tabard | Protective garment designs | 1 | 0.95 | Craft: Sew Linen Guard Tabard |
| `linen_knee_guard` | Linen Knee Guard | Protective garment designs | 0 | 0.19 | Craft: Sew Linen Knee Guard |
| `linen_mechanic_apron` | Linen Mechanic Apron | Protective garment designs | 0 | 0.56 | Craft: Sew Linen Mechanic Apron |
| `linen_padded_helmet` | Linen Padded Helmet | Protective garment designs | 1 | 0.46 | Craft: Sew Linen Padded Helmet |
| `linen_patchwork_poncho` | Linen Patchwork Poncho | Protective garment designs | 0 | 0.48 | Loot: clothing, depot, house, warehouse |
| `linen_patrol_coat` | Linen Patrol Coat | Protective garment designs | 1 | 0.89 | Craft: Sew Linen Patrol Coat |
| `linen_quilted_coat` | Linen Quilted Coat | Protective garment designs | 1 | 0.99 | Craft: Sew Linen Quilted Coat |
| `linen_reinforced_jacket` | Linen Reinforced Jacket | Protective garment designs | 1 | 1.09 | Craft: Sew Linen Reinforced Jacket |
| `linen_salvager_overall` | Linen Salvager Overall | Protective garment designs | 1 | 0.88 | Craft: Sew Linen Salvager Overall |
| `linen_scout_wrap` | Linen Scout Wrap | Protective garment designs | 0 | 0.21 | Loot: clothing, depot, house, warehouse |
| `linen_shoulder_mantle` | Linen Shoulder Mantle | Protective garment designs | 0 | 0.38 | Craft: Sew Linen Shoulder Mantle |
| `linen_trail_tunic` | Linen Trail Tunic | Protective garment designs | 0 | 0.33 | Craft: Sew Linen Trail Tunic |
| `linen_utility_vest` | Linen Utility Vest | Protective garment designs | 0 | 0.29 | Loot: clothing, depot, house, warehouse |
| `linen_work_smock` | Linen Work Smock | Protective garment designs | 0 | 0.41 | Loot: clothing, depot, house, warehouse |
| `neoprene_arm_wrap` | Neoprene Arm Wrap | Protective garment designs | 2 | 0.20 | Craft: Sew Neoprene Arm Wrap |
| `neoprene_breacher_vest` | Neoprene Breacher Vest | Protective garment designs | 3 | 2.14 | Craft: Sew Neoprene Breacher Vest |
| `neoprene_courier_jerkin` | Neoprene Courier Jerkin | Protective garment designs | 3 | 0.77 | Craft: Sew Neoprene Courier Jerkin |
| `neoprene_forester_coat` | Neoprene Forester Coat | Protective garment designs | 2 | 0.92 | Craft: Sew Neoprene Forester Coat |
| `neoprene_guard_tabard` | Neoprene Guard Tabard | Protective garment designs | 3 | 1.32 | Craft: Sew Neoprene Guard Tabard |
| `neoprene_knee_guard` | Neoprene Knee Guard | Protective garment designs | 2 | 0.27 | Craft: Sew Neoprene Knee Guard |
| `neoprene_mechanic_apron` | Neoprene Mechanic Apron | Protective garment designs | 2 | 0.81 | Craft: Sew Neoprene Mechanic Apron |
| `neoprene_padded_helmet` | Neoprene Padded Helmet | Protective garment designs | 3 | 0.60 | Craft: Sew Neoprene Padded Helmet |
| `neoprene_patchwork_poncho` | Neoprene Patchwork Poncho | Protective garment designs | 2 | 0.70 | Craft: Sew Neoprene Patchwork Poncho |
| `neoprene_patrol_coat` | Neoprene Patrol Coat | Protective garment designs | 3 | 1.23 | Craft: Sew Neoprene Patrol Coat |
| `neoprene_quilted_coat` | Neoprene Quilted Coat | Protective garment designs | 3 | 1.37 | Craft: Sew Neoprene Quilted Coat |
| `neoprene_reinforced_jacket` | Neoprene Reinforced Jacket | Protective garment designs | 3 | 1.52 | Craft: Sew Neoprene Reinforced Jacket |
| `neoprene_salvager_overall` | Neoprene Salvager Overall | Protective garment designs | 3 | 1.22 | Craft: Sew Neoprene Salvager Overall |
| `neoprene_scout_wrap` | Neoprene Scout Wrap | Protective garment designs | 2 | 0.30 | Craft: Sew Neoprene Scout Wrap |
| `neoprene_shoulder_mantle` | Neoprene Shoulder Mantle | Protective garment designs | 2 | 0.55 | Craft: Sew Neoprene Shoulder Mantle |
| `neoprene_trail_tunic` | Neoprene Trail Tunic | Protective garment designs | 2 | 0.48 | Craft: Sew Neoprene Trail Tunic |
| `neoprene_utility_vest` | Neoprene Utility Vest | Protective garment designs | 2 | 0.42 | Craft: Sew Neoprene Utility Vest |
| `neoprene_work_smock` | Neoprene Work Smock | Protective garment designs | 2 | 0.59 | Craft: Sew Neoprene Work Smock |
| `nylon_webbing_arm_wrap` | Nylon Webbing Arm Wrap | Protective garment designs | 2 | 0.14 | Craft: Sew Nylon Webbing Arm Wrap |
| `nylon_webbing_breacher_vest` | Nylon Webbing Breacher Vest | Protective garment designs | 3 | 1.54 | Craft: Sew Nylon Webbing Breacher Vest |
| `nylon_webbing_courier_jerkin` | Nylon Webbing Courier Jerkin | Protective garment designs | 3 | 0.58 | Craft: Sew Nylon Webbing Courier Jerkin |
| `nylon_webbing_forester_coat` | Nylon Webbing Forester Coat | Protective garment designs | 2 | 0.65 | Craft: Sew Nylon Webbing Forester Coat |
| `nylon_webbing_guard_tabard` | Nylon Webbing Guard Tabard | Protective garment designs | 3 | 0.97 | Craft: Sew Nylon Webbing Guard Tabard |
| `nylon_webbing_knee_guard` | Nylon Webbing Knee Guard | Protective garment designs | 2 | 0.19 | Craft: Sew Nylon Webbing Knee Guard |
| `nylon_webbing_mechanic_apron` | Nylon Webbing Mechanic Apron | Protective garment designs | 2 | 0.57 | Craft: Sew Nylon Webbing Mechanic Apron |
| `nylon_webbing_padded_helmet` | Nylon Webbing Padded Helmet | Protective garment designs | 3 | 0.46 | Craft: Sew Nylon Webbing Padded Helmet |
| `nylon_webbing_patchwork_poncho` | Nylon Webbing Patchwork Poncho | Protective garment designs | 2 | 0.49 | Craft: Sew Nylon Webbing Patchwork Poncho |
| `nylon_webbing_patrol_coat` | Nylon Webbing Patrol Coat | Protective garment designs | 3 | 0.91 | Craft: Sew Nylon Webbing Patrol Coat |
| `nylon_webbing_quilted_coat` | Nylon Webbing Quilted Coat | Protective garment designs | 3 | 1.00 | Craft: Sew Nylon Webbing Quilted Coat |
| `nylon_webbing_reinforced_jacket` | Nylon Webbing Reinforced Jacket | Protective garment designs | 3 | 1.11 | Craft: Sew Nylon Webbing Reinforced Jacket |
| `nylon_webbing_salvager_overall` | Nylon Webbing Salvager Overall | Protective garment designs | 3 | 0.90 | Craft: Sew Nylon Webbing Salvager Overall |
| `nylon_webbing_scout_wrap` | Nylon Webbing Scout Wrap | Protective garment designs | 2 | 0.21 | Craft: Sew Nylon Webbing Scout Wrap |
| `nylon_webbing_shoulder_mantle` | Nylon Webbing Shoulder Mantle | Protective garment designs | 2 | 0.38 | Craft: Sew Nylon Webbing Shoulder Mantle |
| `nylon_webbing_trail_tunic` | Nylon Webbing Trail Tunic | Protective garment designs | 2 | 0.34 | Craft: Sew Nylon Webbing Trail Tunic |
| `nylon_webbing_utility_vest` | Nylon Webbing Utility Vest | Protective garment designs | 2 | 0.30 | Craft: Sew Nylon Webbing Utility Vest |
| `nylon_webbing_work_smock` | Nylon Webbing Work Smock | Protective garment designs | 2 | 0.41 | Craft: Sew Nylon Webbing Work Smock |
| `oilskin_arm_wrap` | Oilskin Arm Wrap | Protective garment designs | 1 | 0.20 | Craft: Sew Oilskin Arm Wrap |
| `oilskin_breacher_vest` | Oilskin Breacher Vest | Protective garment designs | 2 | 2.09 | Craft: Sew Oilskin Breacher Vest |
| `oilskin_courier_jerkin` | Oilskin Courier Jerkin | Protective garment designs | 2 | 0.76 | Craft: Sew Oilskin Courier Jerkin |
| `oilskin_forester_coat` | Oilskin Forester Coat | Protective garment designs | 1 | 0.90 | Craft: Sew Oilskin Forester Coat |
| `oilskin_guard_tabard` | Oilskin Guard Tabard | Protective garment designs | 2 | 1.29 | Craft: Sew Oilskin Guard Tabard |
| `oilskin_knee_guard` | Oilskin Knee Guard | Protective garment designs | 1 | 0.26 | Craft: Sew Oilskin Knee Guard |
| `oilskin_mechanic_apron` | Oilskin Mechanic Apron | Protective garment designs | 1 | 0.79 | Craft: Sew Oilskin Mechanic Apron |
| `oilskin_padded_helmet` | Oilskin Padded Helmet | Protective garment designs | 2 | 0.59 | Craft: Sew Oilskin Padded Helmet |
| `oilskin_patchwork_poncho` | Oilskin Patchwork Poncho | Protective garment designs | 1 | 0.68 | Loot: clothing, depot, house, warehouse |
| `oilskin_patrol_coat` | Oilskin Patrol Coat | Protective garment designs | 2 | 1.21 | Craft: Sew Oilskin Patrol Coat |
| `oilskin_quilted_coat` | Oilskin Quilted Coat | Protective garment designs | 2 | 1.34 | Craft: Sew Oilskin Quilted Coat |
| `oilskin_reinforced_jacket` | Oilskin Reinforced Jacket | Protective garment designs | 2 | 1.48 | Craft: Sew Oilskin Reinforced Jacket |
| `oilskin_salvager_overall` | Oilskin Salvager Overall | Protective garment designs | 2 | 1.19 | Craft: Sew Oilskin Salvager Overall |
| `oilskin_scout_wrap` | Oilskin Scout Wrap | Protective garment designs | 1 | 0.30 | Loot: clothing, depot, house, warehouse |
| `oilskin_shoulder_mantle` | Oilskin Shoulder Mantle | Protective garment designs | 1 | 0.53 | Craft: Sew Oilskin Shoulder Mantle |
| `oilskin_trail_tunic` | Oilskin Trail Tunic | Protective garment designs | 1 | 0.47 | Craft: Sew Oilskin Trail Tunic |
| `oilskin_utility_vest` | Oilskin Utility Vest | Protective garment designs | 1 | 0.41 | Loot: clothing, depot, house, warehouse |
| `oilskin_work_smock` | Oilskin Work Smock | Protective garment designs | 1 | 0.57 | Loot: clothing, depot, house, warehouse |
| `padded_vest` | Padded vest | clothing | 0 | 1.20 | Loot: clothing, depot, house, suburban, warehouse |
| `plain_canvas_arm_wrap` | Plain Canvas Arm Wrap | Protective garment designs | 1 | 0.21 | Craft: Sew Plain Canvas Arm Wrap |
| `plain_canvas_breacher_vest` | Plain Canvas Breacher Vest | Protective garment designs | 2 | 2.19 | Craft: Sew Plain Canvas Breacher Vest |
| `plain_canvas_courier_jerkin` | Plain Canvas Courier Jerkin | Protective garment designs | 2 | 0.79 | Craft: Sew Plain Canvas Courier Jerkin |
| `plain_canvas_forester_coat` | Plain Canvas Forester Coat | Protective garment designs | 1 | 0.95 | Craft: Sew Plain Canvas Forester Coat |
| `plain_canvas_guard_tabard` | Plain Canvas Guard Tabard | Protective garment designs | 2 | 1.34 | Craft: Sew Plain Canvas Guard Tabard |
| `plain_canvas_knee_guard` | Plain Canvas Knee Guard | Protective garment designs | 1 | 0.28 | Craft: Sew Plain Canvas Knee Guard |
| `plain_canvas_mechanic_apron` | Plain Canvas Mechanic Apron | Protective garment designs | 1 | 0.83 | Craft: Sew Plain Canvas Mechanic Apron |
| `plain_canvas_padded_helmet` | Plain Canvas Padded Helmet | Protective garment designs | 2 | 0.61 | Craft: Sew Plain Canvas Padded Helmet |
| `plain_canvas_patchwork_poncho` | Plain Canvas Patchwork Poncho | Protective garment designs | 1 | 0.71 | Loot: clothing, depot, house, warehouse |
| `plain_canvas_patrol_coat` | Plain Canvas Patrol Coat | Protective garment designs | 2 | 1.26 | Craft: Sew Plain Canvas Patrol Coat |
| `plain_canvas_quilted_coat` | Plain Canvas Quilted Coat | Protective garment designs | 2 | 1.40 | Craft: Sew Plain Canvas Quilted Coat |
| `plain_canvas_reinforced_jacket` | Plain Canvas Reinforced Jacket | Protective garment designs | 2 | 1.55 | Craft: Sew Plain Canvas Reinforced Jacket |
| `plain_canvas_salvager_overall` | Plain Canvas Salvager Overall | Protective garment designs | 2 | 1.24 | Craft: Sew Plain Canvas Salvager Overall |
| `plain_canvas_scout_wrap` | Plain Canvas Scout Wrap | Protective garment designs | 1 | 0.31 | Loot: clothing, depot, house, warehouse |
| `plain_canvas_shoulder_mantle` | Plain Canvas Shoulder Mantle | Protective garment designs | 1 | 0.56 | Craft: Sew Plain Canvas Shoulder Mantle |
| `plain_canvas_trail_tunic` | Plain Canvas Trail Tunic | Protective garment designs | 1 | 0.49 | Craft: Sew Plain Canvas Trail Tunic |
| `plain_canvas_utility_vest` | Plain Canvas Utility Vest | Protective garment designs | 1 | 0.43 | Loot: clothing, depot, house, warehouse |
| `plain_canvas_work_smock` | Plain Canvas Work Smock | Protective garment designs | 1 | 0.60 | Loot: clothing, depot, house, warehouse |
| `riot_helmet` | Protective helmet | clothing | 0 | 1.40 | Loot: police |
| `ballistic_vest` | Protective vest | clothing | 0 | 3.50 | Loot: police |
| `quilted_cotton_arm_wrap` | Quilted Cotton Arm Wrap | Protective garment designs | 2 | 0.25 | Craft: Sew Quilted Cotton Arm Wrap |
| `quilted_cotton_breacher_vest` | Quilted Cotton Breacher Vest | Protective garment designs | 3 | 2.64 | Craft: Sew Quilted Cotton Breacher Vest |
| `quilted_cotton_courier_jerkin` | Quilted Cotton Courier Jerkin | Protective garment designs | 3 | 0.93 | Craft: Sew Quilted Cotton Courier Jerkin |
| `quilted_cotton_forester_coat` | Quilted Cotton Forester Coat | Protective garment designs | 2 | 1.16 | Craft: Sew Quilted Cotton Forester Coat |
| `quilted_cotton_guard_tabard` | Quilted Cotton Guard Tabard | Protective garment designs | 3 | 1.61 | Craft: Sew Quilted Cotton Guard Tabard |
| `quilted_cotton_knee_guard` | Quilted Cotton Knee Guard | Protective garment designs | 2 | 0.34 | Craft: Sew Quilted Cotton Knee Guard |
| `quilted_cotton_mechanic_apron` | Quilted Cotton Mechanic Apron | Protective garment designs | 2 | 1.01 | Craft: Sew Quilted Cotton Mechanic Apron |
| `quilted_cotton_padded_helmet` | Quilted Cotton Padded Helmet | Protective garment designs | 3 | 0.72 | Craft: Sew Quilted Cotton Padded Helmet |
| `quilted_cotton_patchwork_poncho` | Quilted Cotton Patchwork Poncho | Protective garment designs | 2 | 0.87 | Craft: Sew Quilted Cotton Patchwork Poncho |
| `quilted_cotton_patrol_coat` | Quilted Cotton Patrol Coat | Protective garment designs | 3 | 1.51 | Craft: Sew Quilted Cotton Patrol Coat |
| `quilted_cotton_quilted_coat` | Quilted Cotton Quilted Coat | Protective garment designs | 3 | 1.67 | Craft: Sew Quilted Cotton Quilted Coat |
| `quilted_cotton_reinforced_jacket` | Quilted Cotton Reinforced Jacket | Protective garment designs | 3 | 1.86 | Craft: Sew Quilted Cotton Reinforced Jacket |
| `quilted_cotton_salvager_overall` | Quilted Cotton Salvager Overall | Protective garment designs | 3 | 1.48 | Craft: Sew Quilted Cotton Salvager Overall |
| `quilted_cotton_scout_wrap` | Quilted Cotton Scout Wrap | Protective garment designs | 2 | 0.38 | Craft: Sew Quilted Cotton Scout Wrap |
| `quilted_cotton_shoulder_mantle` | Quilted Cotton Shoulder Mantle | Protective garment designs | 2 | 0.68 | Craft: Sew Quilted Cotton Shoulder Mantle |
| `quilted_cotton_trail_tunic` | Quilted Cotton Trail Tunic | Protective garment designs | 2 | 0.60 | Craft: Sew Quilted Cotton Trail Tunic |
| `quilted_cotton_utility_vest` | Quilted Cotton Utility Vest | Protective garment designs | 2 | 0.53 | Craft: Sew Quilted Cotton Utility Vest |
| `quilted_cotton_work_smock` | Quilted Cotton Work Smock | Protective garment designs | 2 | 0.74 | Craft: Sew Quilted Cotton Work Smock |
| `padded_coat` | Quilted coat | clothing | 0 | 1.80 | Loot: clothing |
| `raincoat` | Raincoat | clothing | 0 | 0.70 | Loot: clothing, depot, house, suburban, urban, warehouse |
| `motorcycle_jacket` | Riding jacket | clothing | 0 | 2.10 | Loot: clothing, depot, house, suburban, urban, warehouse |
| `ripstop_arm_wrap` | Ripstop Arm Wrap | Protective garment designs | 2 | 0.13 | Craft: Sew Ripstop Arm Wrap |
| `ripstop_breacher_vest` | Ripstop Breacher Vest | Protective garment designs | 3 | 1.40 | Craft: Sew Ripstop Breacher Vest |
| `ripstop_courier_jerkin` | Ripstop Courier Jerkin | Protective garment designs | 3 | 0.54 | Craft: Sew Ripstop Courier Jerkin |
| `ripstop_forester_coat` | Ripstop Forester Coat | Protective garment designs | 2 | 0.58 | Craft: Sew Ripstop Forester Coat |
| `ripstop_guard_tabard` | Ripstop Guard Tabard | Protective garment designs | 3 | 0.88 | Craft: Sew Ripstop Guard Tabard |
| `ripstop_knee_guard` | Ripstop Knee Guard | Protective garment designs | 2 | 0.17 | Craft: Sew Ripstop Knee Guard |
| `ripstop_mechanic_apron` | Ripstop Mechanic Apron | Protective garment designs | 2 | 0.51 | Craft: Sew Ripstop Mechanic Apron |
| `ripstop_padded_helmet` | Ripstop Padded Helmet | Protective garment designs | 3 | 0.43 | Craft: Sew Ripstop Padded Helmet |
| `ripstop_patchwork_poncho` | Ripstop Patchwork Poncho | Protective garment designs | 2 | 0.44 | Craft: Sew Ripstop Patchwork Poncho |
| `ripstop_patrol_coat` | Ripstop Patrol Coat | Protective garment designs | 3 | 0.83 | Craft: Sew Ripstop Patrol Coat |
| `ripstop_quilted_coat` | Ripstop Quilted Coat | Protective garment designs | 3 | 0.91 | Craft: Sew Ripstop Quilted Coat |
| `ripstop_reinforced_jacket` | Ripstop Reinforced Jacket | Protective garment designs | 3 | 1.01 | Craft: Sew Ripstop Reinforced Jacket |
| `ripstop_salvager_overall` | Ripstop Salvager Overall | Protective garment designs | 3 | 0.82 | Craft: Sew Ripstop Salvager Overall |
| `ripstop_scout_wrap` | Ripstop Scout Wrap | Protective garment designs | 2 | 0.19 | Craft: Sew Ripstop Scout Wrap |
| `ripstop_shoulder_mantle` | Ripstop Shoulder Mantle | Protective garment designs | 2 | 0.34 | Craft: Sew Ripstop Shoulder Mantle |
| `ripstop_trail_tunic` | Ripstop Trail Tunic | Protective garment designs | 2 | 0.30 | Craft: Sew Ripstop Trail Tunic |
| `ripstop_utility_vest` | Ripstop Utility Vest | Protective garment designs | 2 | 0.27 | Craft: Sew Ripstop Utility Vest |
| `ripstop_work_smock` | Ripstop Work Smock | Protective garment designs | 2 | 0.37 | Craft: Sew Ripstop Work Smock |
| `sailcloth_arm_wrap` | Sailcloth Arm Wrap | Protective garment designs | 2 | 0.20 | Craft: Sew Sailcloth Arm Wrap |
| `sailcloth_breacher_vest` | Sailcloth Breacher Vest | Protective garment designs | 3 | 2.16 | Craft: Sew Sailcloth Breacher Vest |
| `sailcloth_courier_jerkin` | Sailcloth Courier Jerkin | Protective garment designs | 3 | 0.78 | Craft: Sew Sailcloth Courier Jerkin |
| `sailcloth_forester_coat` | Sailcloth Forester Coat | Protective garment designs | 2 | 0.94 | Craft: Sew Sailcloth Forester Coat |
| `sailcloth_guard_tabard` | Sailcloth Guard Tabard | Protective garment designs | 3 | 1.33 | Craft: Sew Sailcloth Guard Tabard |
| `sailcloth_knee_guard` | Sailcloth Knee Guard | Protective garment designs | 2 | 0.27 | Craft: Sew Sailcloth Knee Guard |
| `sailcloth_mechanic_apron` | Sailcloth Mechanic Apron | Protective garment designs | 2 | 0.82 | Craft: Sew Sailcloth Mechanic Apron |
| `sailcloth_padded_helmet` | Sailcloth Padded Helmet | Protective garment designs | 3 | 0.61 | Craft: Sew Sailcloth Padded Helmet |
| `sailcloth_patchwork_poncho` | Sailcloth Patchwork Poncho | Protective garment designs | 2 | 0.71 | Craft: Sew Sailcloth Patchwork Poncho |
| `sailcloth_patrol_coat` | Sailcloth Patrol Coat | Protective garment designs | 3 | 1.25 | Craft: Sew Sailcloth Patrol Coat |
| `sailcloth_quilted_coat` | Sailcloth Quilted Coat | Protective garment designs | 3 | 1.38 | Craft: Sew Sailcloth Quilted Coat |
| `sailcloth_reinforced_jacket` | Sailcloth Reinforced Jacket | Protective garment designs | 3 | 1.53 | Craft: Sew Sailcloth Reinforced Jacket |
| `sailcloth_salvager_overall` | Sailcloth Salvager Overall | Protective garment designs | 3 | 1.23 | Craft: Sew Sailcloth Salvager Overall |
| `sailcloth_scout_wrap` | Sailcloth Scout Wrap | Protective garment designs | 2 | 0.31 | Craft: Sew Sailcloth Scout Wrap |
| `sailcloth_shoulder_mantle` | Sailcloth Shoulder Mantle | Protective garment designs | 2 | 0.55 | Craft: Sew Sailcloth Shoulder Mantle |
| `sailcloth_trail_tunic` | Sailcloth Trail Tunic | Protective garment designs | 2 | 0.48 | Craft: Sew Sailcloth Trail Tunic |
| `sailcloth_utility_vest` | Sailcloth Utility Vest | Protective garment designs | 2 | 0.43 | Craft: Sew Sailcloth Utility Vest |
| `sailcloth_work_smock` | Sailcloth Work Smock | Protective garment designs | 2 | 0.60 | Craft: Sew Sailcloth Work Smock |
| `seatbelt_weave_arm_wrap` | Seatbelt Weave Arm Wrap | Protective garment designs | 3 | 0.23 | Craft: Sew Seatbelt Weave Arm Wrap |
| `seatbelt_weave_breacher_vest` | Seatbelt Weave Breacher Vest | Protective garment designs | 4 | 2.42 | Craft: Sew Seatbelt Weave Breacher Vest |
| `seatbelt_weave_courier_jerkin` | Seatbelt Weave Courier Jerkin | Protective garment designs | 4 | 0.86 | Craft: Sew Seatbelt Weave Courier Jerkin |
| `seatbelt_weave_forester_coat` | Seatbelt Weave Forester Coat | Protective garment designs | 3 | 1.06 | Craft: Sew Seatbelt Weave Forester Coat |
| `seatbelt_weave_guard_tabard` | Seatbelt Weave Guard Tabard | Protective garment designs | 4 | 1.48 | Craft: Sew Seatbelt Weave Guard Tabard |
| `seatbelt_weave_knee_guard` | Seatbelt Weave Knee Guard | Protective garment designs | 3 | 0.31 | Craft: Sew Seatbelt Weave Knee Guard |
| `seatbelt_weave_mechanic_apron` | Seatbelt Weave Mechanic Apron | Protective garment designs | 3 | 0.92 | Craft: Sew Seatbelt Weave Mechanic Apron |
| `seatbelt_weave_padded_helmet` | Seatbelt Weave Padded Helmet | Protective garment designs | 4 | 0.67 | Craft: Sew Seatbelt Weave Padded Helmet |
| `seatbelt_weave_patchwork_poncho` | Seatbelt Weave Patchwork Poncho | Protective garment designs | 3 | 0.80 | Craft: Sew Seatbelt Weave Patchwork Poncho |
| `seatbelt_weave_patrol_coat` | Seatbelt Weave Patrol Coat | Protective garment designs | 4 | 1.39 | Craft: Sew Seatbelt Weave Patrol Coat |
| `seatbelt_weave_quilted_coat` | Seatbelt Weave Quilted Coat | Protective garment designs | 4 | 1.54 | Craft: Sew Seatbelt Weave Quilted Coat |
| `seatbelt_weave_reinforced_jacket` | Seatbelt Weave Reinforced Jacket | Protective garment designs | 4 | 1.71 | Craft: Sew Seatbelt Weave Reinforced Jacket |
| `seatbelt_weave_salvager_overall` | Seatbelt Weave Salvager Overall | Protective garment designs | 4 | 1.37 | Craft: Sew Seatbelt Weave Salvager Overall |
| `seatbelt_weave_scout_wrap` | Seatbelt Weave Scout Wrap | Protective garment designs | 3 | 0.35 | Craft: Sew Seatbelt Weave Scout Wrap |
| `seatbelt_weave_shoulder_mantle` | Seatbelt Weave Shoulder Mantle | Protective garment designs | 3 | 0.62 | Craft: Sew Seatbelt Weave Shoulder Mantle |
| `seatbelt_weave_trail_tunic` | Seatbelt Weave Trail Tunic | Protective garment designs | 3 | 0.55 | Craft: Sew Seatbelt Weave Trail Tunic |
| `seatbelt_weave_utility_vest` | Seatbelt Weave Utility Vest | Protective garment designs | 3 | 0.48 | Craft: Sew Seatbelt Weave Utility Vest |
| `seatbelt_weave_work_smock` | Seatbelt Weave Work Smock | Protective garment designs | 3 | 0.67 | Craft: Sew Seatbelt Weave Work Smock |
| `waxed_canvas_arm_wrap` | Waxed Canvas Arm Wrap | Protective garment designs | 2 | 0.23 | Craft: Sew Waxed Canvas Arm Wrap |
| `waxed_canvas_breacher_vest` | Waxed Canvas Breacher Vest | Protective garment designs | 3 | 2.38 | Craft: Sew Waxed Canvas Breacher Vest |
| `waxed_canvas_courier_jerkin` | Waxed Canvas Courier Jerkin | Protective garment designs | 3 | 0.85 | Craft: Sew Waxed Canvas Courier Jerkin |
| `waxed_canvas_forester_coat` | Waxed Canvas Forester Coat | Protective garment designs | 2 | 1.03 | Craft: Sew Waxed Canvas Forester Coat |
| `waxed_canvas_guard_tabard` | Waxed Canvas Guard Tabard | Protective garment designs | 3 | 1.46 | Craft: Sew Waxed Canvas Guard Tabard |
| `waxed_canvas_knee_guard` | Waxed Canvas Knee Guard | Protective garment designs | 2 | 0.30 | Craft: Sew Waxed Canvas Knee Guard |
| `waxed_canvas_mechanic_apron` | Waxed Canvas Mechanic Apron | Protective garment designs | 2 | 0.90 | Craft: Sew Waxed Canvas Mechanic Apron |
| `waxed_canvas_padded_helmet` | Waxed Canvas Padded Helmet | Protective garment designs | 3 | 0.66 | Craft: Sew Waxed Canvas Padded Helmet |
| `waxed_canvas_patchwork_poncho` | Waxed Canvas Patchwork Poncho | Protective garment designs | 2 | 0.78 | Craft: Sew Waxed Canvas Patchwork Poncho |
| `waxed_canvas_patrol_coat` | Waxed Canvas Patrol Coat | Protective garment designs | 3 | 1.36 | Craft: Sew Waxed Canvas Patrol Coat |
| `waxed_canvas_quilted_coat` | Waxed Canvas Quilted Coat | Protective garment designs | 3 | 1.51 | Craft: Sew Waxed Canvas Quilted Coat |
| `waxed_canvas_reinforced_jacket` | Waxed Canvas Reinforced Jacket | Protective garment designs | 3 | 1.68 | Craft: Sew Waxed Canvas Reinforced Jacket |
| `waxed_canvas_salvager_overall` | Waxed Canvas Salvager Overall | Protective garment designs | 3 | 1.34 | Craft: Sew Waxed Canvas Salvager Overall |
| `waxed_canvas_scout_wrap` | Waxed Canvas Scout Wrap | Protective garment designs | 2 | 0.34 | Craft: Sew Waxed Canvas Scout Wrap |
| `waxed_canvas_shoulder_mantle` | Waxed Canvas Shoulder Mantle | Protective garment designs | 2 | 0.61 | Craft: Sew Waxed Canvas Shoulder Mantle |
| `waxed_canvas_trail_tunic` | Waxed Canvas Trail Tunic | Protective garment designs | 2 | 0.54 | Craft: Sew Waxed Canvas Trail Tunic |
| `waxed_canvas_utility_vest` | Waxed Canvas Utility Vest | Protective garment designs | 2 | 0.47 | Craft: Sew Waxed Canvas Utility Vest |
| `waxed_canvas_work_smock` | Waxed Canvas Work Smock | Protective garment designs | 2 | 0.66 | Craft: Sew Waxed Canvas Work Smock |
| `welding_apron` | Welding apron | clothing | 0 | 1.30 | Loot: industrial |
| `wool_felt_arm_wrap` | Wool Felt Arm Wrap | Protective garment designs | 1 | 0.23 | Craft: Sew Wool Felt Arm Wrap |
| `wool_felt_breacher_vest` | Wool Felt Breacher Vest | Protective garment designs | 2 | 2.45 | Craft: Sew Wool Felt Breacher Vest |
| `wool_felt_courier_jerkin` | Wool Felt Courier Jerkin | Protective garment designs | 2 | 0.87 | Craft: Sew Wool Felt Courier Jerkin |
| `wool_felt_forester_coat` | Wool Felt Forester Coat | Protective garment designs | 1 | 1.07 | Craft: Sew Wool Felt Forester Coat |
| `wool_felt_guard_tabard` | Wool Felt Guard Tabard | Protective garment designs | 2 | 1.50 | Craft: Sew Wool Felt Guard Tabard |
| `wool_felt_knee_guard` | Wool Felt Knee Guard | Protective garment designs | 1 | 0.31 | Craft: Sew Wool Felt Knee Guard |
| `wool_felt_mechanic_apron` | Wool Felt Mechanic Apron | Protective garment designs | 1 | 0.93 | Craft: Sew Wool Felt Mechanic Apron |
| `wool_felt_padded_helmet` | Wool Felt Padded Helmet | Protective garment designs | 2 | 0.67 | Craft: Sew Wool Felt Padded Helmet |
| `wool_felt_patchwork_poncho` | Wool Felt Patchwork Poncho | Protective garment designs | 1 | 0.81 | Loot: clothing, depot, house, warehouse |
| `wool_felt_patrol_coat` | Wool Felt Patrol Coat | Protective garment designs | 2 | 1.40 | Craft: Sew Wool Felt Patrol Coat |
| `wool_felt_quilted_coat` | Wool Felt Quilted Coat | Protective garment designs | 2 | 1.56 | Craft: Sew Wool Felt Quilted Coat |
| `wool_felt_reinforced_jacket` | Wool Felt Reinforced Jacket | Protective garment designs | 2 | 1.73 | Craft: Sew Wool Felt Reinforced Jacket |
| `wool_felt_salvager_overall` | Wool Felt Salvager Overall | Protective garment designs | 2 | 1.38 | Craft: Sew Wool Felt Salvager Overall |
| `wool_felt_scout_wrap` | Wool Felt Scout Wrap | Protective garment designs | 1 | 0.35 | Loot: clothing, depot, house, warehouse |
| `wool_felt_shoulder_mantle` | Wool Felt Shoulder Mantle | Protective garment designs | 1 | 0.63 | Craft: Sew Wool Felt Shoulder Mantle |
| `wool_felt_trail_tunic` | Wool Felt Trail Tunic | Protective garment designs | 1 | 0.55 | Craft: Sew Wool Felt Trail Tunic |
| `wool_felt_utility_vest` | Wool Felt Utility Vest | Protective garment designs | 1 | 0.49 | Loot: clothing, depot, house, warehouse |
| `wool_felt_work_smock` | Wool Felt Work Smock | Protective garment designs | 1 | 0.68 | Loot: clothing, depot, house, warehouse |
| `work_boots` | Work boots | clothing | 0 | 1.20 | Loot: clothing, depot, warehouse |
| `work_gloves` | Work gloves | clothing | 0 | 0.18 | Loot: clothing, depot, warehouse |
| `work_jacket` | Work jacket | clothing | 0 | 0.90 | Loot: clothing, depot, house, suburban, urban, warehouse |

## Containers

| Stable ID | Item | Family | Tier | kg | Obtain |
| --- | --- | --- | ---: | ---: | --- |
| `aramid_expedition_pack` | Aramid Expedition Pack | Carrying equipment designs | 5 | 1.56 | Craft: Sew Aramid Expedition Pack |
| `aramid_forager_sling` | Aramid Forager Sling | Carrying equipment designs | 4 | 0.24 | Craft: Sew Aramid Forager Sling |
| `aramid_frame_rig` | Aramid Frame Rig | Carrying equipment designs | 5 | 1.41 | Craft: Sew Aramid Frame Rig |
| `aramid_hauler_bag` | Aramid Hauler Bag | Carrying equipment designs | 4 | 0.76 | Craft: Sew Aramid Hauler Bag |
| `aramid_hip_satchel` | Aramid Hip Satchel | Carrying equipment designs | 4 | 0.21 | Craft: Sew Aramid Hip Satchel |
| `aramid_medical_satchel` | Aramid Medical Satchel | Carrying equipment designs | 4 | 0.36 | Craft: Sew Aramid Medical Satchel |
| `aramid_roll_pack` | Aramid Roll Pack | Carrying equipment designs | 4 | 0.34 | Craft: Sew Aramid Roll Pack |
| `aramid_shoulder_pack` | Aramid Shoulder Pack | Carrying equipment designs | 4 | 0.41 | Craft: Sew Aramid Shoulder Pack |
| `aramid_water_carrier` | Aramid Supply Carrier | Carrying equipment designs | 4 | 0.43 | Craft: Sew Aramid Supply Carrier |
| `aramid_tool_roll` | Aramid Tool Roll | Carrying equipment designs | 4 | 0.28 | Craft: Sew Aramid Tool Roll |
| `aramid_rucksack` | Aramid Trail Rucksack | Carrying equipment designs | 4 | 0.60 | Craft: Sew Aramid Trail Rucksack |
| `aramid_wideframe_pack` | Aramid Wide Frame Pack | Carrying equipment designs | 5 | 1.71 | Craft: Sew Aramid Wide Frame Pack |
| `ballistic_nylon_expedition_pack` | Ballistic Nylon Expedition Pack | Carrying equipment designs | 4 | 1.74 | Craft: Sew Ballistic Nylon Expedition Pack |
| `ballistic_nylon_forager_sling` | Ballistic Nylon Forager Sling | Carrying equipment designs | 3 | 0.32 | Craft: Sew Ballistic Nylon Forager Sling |
| `ballistic_nylon_frame_rig` | Ballistic Nylon Frame Rig | Carrying equipment designs | 4 | 1.74 | Craft: Sew Ballistic Nylon Frame Rig |
| `ballistic_nylon_hauler_bag` | Ballistic Nylon Hauler Bag | Carrying equipment designs | 3 | 0.99 | Craft: Sew Ballistic Nylon Hauler Bag |
| `ballistic_nylon_hip_satchel` | Ballistic Nylon Hip Satchel | Carrying equipment designs | 3 | 0.27 | Craft: Sew Ballistic Nylon Hip Satchel |
| `ballistic_nylon_medical_satchel` | Ballistic Nylon Medical Satchel | Carrying equipment designs | 3 | 0.47 | Craft: Sew Ballistic Nylon Medical Satchel |
| `ballistic_nylon_roll_pack` | Ballistic Nylon Roll Pack | Carrying equipment designs | 3 | 0.45 | Craft: Sew Ballistic Nylon Roll Pack |
| `ballistic_nylon_shoulder_pack` | Ballistic Nylon Shoulder Pack | Carrying equipment designs | 3 | 0.54 | Craft: Sew Ballistic Nylon Shoulder Pack |
| `ballistic_nylon_water_carrier` | Ballistic Nylon Supply Carrier | Carrying equipment designs | 3 | 0.56 | Craft: Sew Ballistic Nylon Supply Carrier |
| `ballistic_nylon_tool_roll` | Ballistic Nylon Tool Roll | Carrying equipment designs | 3 | 0.36 | Craft: Sew Ballistic Nylon Tool Roll |
| `ballistic_nylon_rucksack` | Ballistic Nylon Trail Rucksack | Carrying equipment designs | 3 | 0.78 | Craft: Sew Ballistic Nylon Trail Rucksack |
| `ballistic_nylon_wideframe_pack` | Ballistic Nylon Wide Frame Pack | Carrying equipment designs | 4 | 2.05 | Craft: Sew Ballistic Nylon Wide Frame Pack |
| `burlap_expedition_pack` | Burlap Expedition Pack | Carrying equipment designs | 1 | 1.48 | Craft: Sew Burlap Expedition Pack |
| `burlap_forager_sling` | Burlap Forager Sling | Carrying equipment designs | 0 | 0.23 | Craft: Sew Burlap Forager Sling |
| `burlap_frame_rig` | Burlap Frame Rig | Carrying equipment designs | 1 | 1.28 | Craft: Sew Burlap Frame Rig |
| `burlap_hauler_bag` | Burlap Hauler Bag | Carrying equipment designs | 0 | 0.73 | Craft: Sew Burlap Hauler Bag |
| `burlap_hip_satchel` | Burlap Hip Satchel | Carrying equipment designs | 0 | 0.20 | Craft: Sew Burlap Hip Satchel |
| `burlap_medical_satchel` | Burlap Medical Satchel | Carrying equipment designs | 0 | 0.35 | Craft: Sew Burlap Medical Satchel |
| `burlap_roll_pack` | Burlap Roll Pack | Carrying equipment designs | 0 | 0.33 | Craft: Sew Burlap Roll Pack |
| `burlap_shoulder_pack` | Burlap Shoulder Pack | Carrying equipment designs | 0 | 0.40 | Craft: Sew Burlap Shoulder Pack |
| `burlap_water_carrier` | Burlap Supply Carrier | Carrying equipment designs | 0 | 0.41 | Craft: Sew Burlap Supply Carrier |
| `burlap_tool_roll` | Burlap Tool Roll | Carrying equipment designs | 0 | 0.27 | Craft: Sew Burlap Tool Roll |
| `burlap_rucksack` | Burlap Trail Rucksack | Carrying equipment designs | 0 | 0.58 | Craft: Sew Burlap Trail Rucksack |
| `burlap_wideframe_pack` | Burlap Wide Frame Pack | Carrying equipment designs | 1 | 1.71 | Craft: Sew Burlap Wide Frame Pack |
| `burlap_sack` | Burlap sack | containers | 0 | 0.25 | Loot: clothing, depot, farm, warehouse |
| `canvas_pack` | Canvas backpack | containers | 0 | 0.55 | Loot: clothing, depot, warehouse |
| `corduroy_expedition_pack` | Corduroy Expedition Pack | Carrying equipment designs | 1 | 1.54 | Craft: Sew Corduroy Expedition Pack |
| `corduroy_forager_sling` | Corduroy Forager Sling | Carrying equipment designs | 0 | 0.27 | Craft: Sew Corduroy Forager Sling |
| `corduroy_frame_rig` | Corduroy Frame Rig | Carrying equipment designs | 1 | 1.48 | Craft: Sew Corduroy Frame Rig |
| `corduroy_hauler_bag` | Corduroy Hauler Bag | Carrying equipment designs | 0 | 0.85 | Craft: Sew Corduroy Hauler Bag |
| `corduroy_hip_satchel` | Corduroy Hip Satchel | Carrying equipment designs | 0 | 0.23 | Craft: Sew Corduroy Hip Satchel |
| `corduroy_medical_satchel` | Corduroy Medical Satchel | Carrying equipment designs | 0 | 0.41 | Craft: Sew Corduroy Medical Satchel |
| `corduroy_roll_pack` | Corduroy Roll Pack | Carrying equipment designs | 0 | 0.38 | Craft: Sew Corduroy Roll Pack |
| `corduroy_shoulder_pack` | Corduroy Shoulder Pack | Carrying equipment designs | 0 | 0.46 | Craft: Sew Corduroy Shoulder Pack |
| `corduroy_water_carrier` | Corduroy Supply Carrier | Carrying equipment designs | 0 | 0.48 | Craft: Sew Corduroy Supply Carrier |
| `corduroy_tool_roll` | Corduroy Tool Roll | Carrying equipment designs | 0 | 0.31 | Craft: Sew Corduroy Tool Roll |
| `corduroy_rucksack` | Corduroy Trail Rucksack | Carrying equipment designs | 0 | 0.67 | Craft: Sew Corduroy Trail Rucksack |
| `corduroy_wideframe_pack` | Corduroy Wide Frame Pack | Carrying equipment designs | 1 | 1.90 | Craft: Sew Corduroy Wide Frame Pack |
| `cotton_twill_expedition_pack` | Cotton Twill Expedition Pack | Carrying equipment designs | 1 | 1.41 | Craft: Sew Cotton Twill Expedition Pack |
| `cotton_twill_forager_sling` | Cotton Twill Forager Sling | Carrying equipment designs | 0 | 0.23 | Craft: Sew Cotton Twill Forager Sling |
| `cotton_twill_frame_rig` | Cotton Twill Frame Rig | Carrying equipment designs | 1 | 1.27 | Craft: Sew Cotton Twill Frame Rig |
| `cotton_twill_hauler_bag` | Cotton Twill Hauler Bag | Carrying equipment designs | 0 | 0.72 | Craft: Sew Cotton Twill Hauler Bag |
| `cotton_twill_hip_satchel` | Cotton Twill Hip Satchel | Carrying equipment designs | 0 | 0.20 | Loot: camp, clothing, depot, house, ranger, warehouse |
| `cotton_twill_medical_satchel` | Cotton Twill Medical Satchel | Carrying equipment designs | 0 | 0.34 | Craft: Sew Cotton Twill Medical Satchel |
| `cotton_twill_roll_pack` | Cotton Twill Roll Pack | Carrying equipment designs | 0 | 0.32 | Loot: camp, clothing, depot, house, ranger, warehouse |
| `cotton_twill_shoulder_pack` | Cotton Twill Shoulder Pack | Carrying equipment designs | 0 | 0.39 | Loot: camp, clothing, depot, house, ranger, warehouse |
| `cotton_twill_water_carrier` | Cotton Twill Supply Carrier | Carrying equipment designs | 0 | 0.40 | Craft: Sew Cotton Twill Supply Carrier |
| `cotton_twill_tool_roll` | Cotton Twill Tool Roll | Carrying equipment designs | 0 | 0.26 | Craft: Sew Cotton Twill Tool Roll |
| `cotton_twill_rucksack` | Cotton Twill Trail Rucksack | Carrying equipment designs | 0 | 0.57 | Craft: Sew Cotton Twill Trail Rucksack |
| `cotton_twill_wideframe_pack` | Cotton Twill Wide Frame Pack | Carrying equipment designs | 1 | 1.70 | Craft: Sew Cotton Twill Wide Frame Pack |
| `denim_expedition_pack` | Denim Expedition Pack | Carrying equipment designs | 2 | 1.85 | Craft: Sew Denim Expedition Pack |
| `denim_forager_sling` | Denim Forager Sling | Carrying equipment designs | 1 | 0.31 | Craft: Sew Denim Forager Sling |
| `denim_frame_rig` | Denim Frame Rig | Carrying equipment designs | 2 | 1.69 | Craft: Sew Denim Frame Rig |
| `denim_hauler_bag` | Denim Hauler Bag | Carrying equipment designs | 1 | 0.96 | Craft: Sew Denim Hauler Bag |
| `denim_hip_satchel` | Denim Hip Satchel | Carrying equipment designs | 1 | 0.26 | Loot: camp, clothing, depot, house, ranger, warehouse |
| `denim_medical_satchel` | Denim Medical Satchel | Carrying equipment designs | 1 | 0.46 | Craft: Sew Denim Medical Satchel |
| `denim_roll_pack` | Denim Roll Pack | Carrying equipment designs | 1 | 0.43 | Loot: camp, clothing, depot, house, ranger, warehouse |
| `denim_shoulder_pack` | Denim Shoulder Pack | Carrying equipment designs | 1 | 0.52 | Loot: camp, clothing, depot, house, ranger, warehouse |
| `denim_water_carrier` | Denim Supply Carrier | Carrying equipment designs | 1 | 0.54 | Craft: Sew Denim Supply Carrier |
| `denim_tool_roll` | Denim Tool Roll | Carrying equipment designs | 1 | 0.35 | Craft: Sew Denim Tool Roll |
| `denim_rucksack` | Denim Trail Rucksack | Carrying equipment designs | 1 | 0.76 | Craft: Sew Denim Trail Rucksack |
| `denim_wideframe_pack` | Denim Wide Frame Pack | Carrying equipment designs | 2 | 2.09 | Craft: Sew Denim Wide Frame Pack |
| `duckcloth_expedition_pack` | Duckcloth Expedition Pack | Carrying equipment designs | 2 | 1.77 | Craft: Sew Duckcloth Expedition Pack |
| `duckcloth_forager_sling` | Duckcloth Forager Sling | Carrying equipment designs | 1 | 0.32 | Craft: Sew Duckcloth Forager Sling |
| `duckcloth_frame_rig` | Duckcloth Frame Rig | Carrying equipment designs | 2 | 1.62 | Craft: Sew Duckcloth Frame Rig |
| `duckcloth_hauler_bag` | Duckcloth Hauler Bag | Carrying equipment designs | 1 | 1.00 | Craft: Sew Duckcloth Hauler Bag |
| `duckcloth_hip_satchel` | Duckcloth Hip Satchel | Carrying equipment designs | 1 | 0.28 | Craft: Sew Duckcloth Hip Satchel |
| `duckcloth_medical_satchel` | Duckcloth Medical Satchel | Carrying equipment designs | 1 | 0.48 | Craft: Sew Duckcloth Medical Satchel |
| `duckcloth_roll_pack` | Duckcloth Roll Pack | Carrying equipment designs | 1 | 0.45 | Craft: Sew Duckcloth Roll Pack |
| `duckcloth_shoulder_pack` | Duckcloth Shoulder Pack | Carrying equipment designs | 1 | 0.54 | Craft: Sew Duckcloth Shoulder Pack |
| `duckcloth_water_carrier` | Duckcloth Supply Carrier | Carrying equipment designs | 1 | 0.56 | Craft: Sew Duckcloth Supply Carrier |
| `duckcloth_tool_roll` | Duckcloth Tool Roll | Carrying equipment designs | 1 | 0.37 | Craft: Sew Duckcloth Tool Roll |
| `duckcloth_rucksack` | Duckcloth Trail Rucksack | Carrying equipment designs | 1 | 0.79 | Craft: Sew Duckcloth Trail Rucksack |
| `duckcloth_wideframe_pack` | Duckcloth Wide Frame Pack | Carrying equipment designs | 2 | 2.16 | Craft: Sew Duckcloth Wide Frame Pack |
| `duffel_bag` | Duffel bag | containers | 0 | 0.70 | Loot: clothing, depot, warehouse |
| `felt_blend_expedition_pack` | Felt Blend Expedition Pack | Carrying equipment designs | 2 | 1.70 | Craft: Sew Felt Blend Expedition Pack |
| `felt_blend_forager_sling` | Felt Blend Forager Sling | Carrying equipment designs | 1 | 0.30 | Craft: Sew Felt Blend Forager Sling |
| `felt_blend_frame_rig` | Felt Blend Frame Rig | Carrying equipment designs | 2 | 1.62 | Craft: Sew Felt Blend Frame Rig |
| `felt_blend_hauler_bag` | Felt Blend Hauler Bag | Carrying equipment designs | 1 | 0.95 | Craft: Sew Felt Blend Hauler Bag |
| `felt_blend_hip_satchel` | Felt Blend Hip Satchel | Carrying equipment designs | 1 | 0.26 | Craft: Sew Felt Blend Hip Satchel |
| `felt_blend_medical_satchel` | Felt Blend Medical Satchel | Carrying equipment designs | 1 | 0.45 | Craft: Sew Felt Blend Medical Satchel |
| `felt_blend_roll_pack` | Felt Blend Roll Pack | Carrying equipment designs | 1 | 0.43 | Craft: Sew Felt Blend Roll Pack |
| `felt_blend_shoulder_pack` | Felt Blend Shoulder Pack | Carrying equipment designs | 1 | 0.51 | Craft: Sew Felt Blend Shoulder Pack |
| `felt_blend_water_carrier` | Felt Blend Supply Carrier | Carrying equipment designs | 1 | 0.53 | Craft: Sew Felt Blend Supply Carrier |
| `felt_blend_tool_roll` | Felt Blend Tool Roll | Carrying equipment designs | 1 | 0.35 | Craft: Sew Felt Blend Tool Roll |
| `felt_blend_rucksack` | Felt Blend Trail Rucksack | Carrying equipment designs | 1 | 0.75 | Craft: Sew Felt Blend Trail Rucksack |
| `felt_blend_wideframe_pack` | Felt Blend Wide Frame Pack | Carrying equipment designs | 2 | 2.08 | Craft: Sew Felt Blend Wide Frame Pack |
| `military_pack` | Field backpack | containers | 0 | 1.45 | Loot: gunshop, police |
| `firecloth_expedition_pack` | Firecloth Expedition Pack | Carrying equipment designs | 4 | 2.06 | Craft: Sew Firecloth Expedition Pack |
| `firecloth_forager_sling` | Firecloth Forager Sling | Carrying equipment designs | 3 | 0.38 | Craft: Sew Firecloth Forager Sling |
| `firecloth_frame_rig` | Firecloth Frame Rig | Carrying equipment designs | 4 | 1.86 | Craft: Sew Firecloth Frame Rig |
| `firecloth_hauler_bag` | Firecloth Hauler Bag | Carrying equipment designs | 3 | 1.18 | Craft: Sew Firecloth Hauler Bag |
| `firecloth_hip_satchel` | Firecloth Hip Satchel | Carrying equipment designs | 3 | 0.32 | Craft: Sew Firecloth Hip Satchel |
| `firecloth_medical_satchel` | Firecloth Medical Satchel | Carrying equipment designs | 3 | 0.56 | Craft: Sew Firecloth Medical Satchel |
| `firecloth_roll_pack` | Firecloth Roll Pack | Carrying equipment designs | 3 | 0.53 | Craft: Sew Firecloth Roll Pack |
| `firecloth_shoulder_pack` | Firecloth Shoulder Pack | Carrying equipment designs | 3 | 0.64 | Craft: Sew Firecloth Shoulder Pack |
| `firecloth_water_carrier` | Firecloth Supply Carrier | Carrying equipment designs | 3 | 0.66 | Craft: Sew Firecloth Supply Carrier |
| `firecloth_tool_roll` | Firecloth Tool Roll | Carrying equipment designs | 3 | 0.43 | Craft: Sew Firecloth Tool Roll |
| `firecloth_rucksack` | Firecloth Trail Rucksack | Carrying equipment designs | 3 | 0.93 | Craft: Sew Firecloth Trail Rucksack |
| `firecloth_wideframe_pack` | Firecloth Wide Frame Pack | Carrying equipment designs | 4 | 2.49 | Craft: Sew Firecloth Wide Frame Pack |
| `fleece_expedition_pack` | Fleece Expedition Pack | Carrying equipment designs | 1 | 1.63 | Craft: Sew Fleece Expedition Pack |
| `fleece_forager_sling` | Fleece Forager Sling | Carrying equipment designs | 0 | 0.27 | Craft: Sew Fleece Forager Sling |
| `fleece_frame_rig` | Fleece Frame Rig | Carrying equipment designs | 1 | 1.50 | Craft: Sew Fleece Frame Rig |
| `fleece_hauler_bag` | Fleece Hauler Bag | Carrying equipment designs | 0 | 0.83 | Craft: Sew Fleece Hauler Bag |
| `fleece_hip_satchel` | Fleece Hip Satchel | Carrying equipment designs | 0 | 0.23 | Craft: Sew Fleece Hip Satchel |
| `fleece_medical_satchel` | Fleece Medical Satchel | Carrying equipment designs | 0 | 0.40 | Craft: Sew Fleece Medical Satchel |
| `fleece_roll_pack` | Fleece Roll Pack | Carrying equipment designs | 0 | 0.37 | Craft: Sew Fleece Roll Pack |
| `fleece_shoulder_pack` | Fleece Shoulder Pack | Carrying equipment designs | 0 | 0.45 | Craft: Sew Fleece Shoulder Pack |
| `fleece_water_carrier` | Fleece Supply Carrier | Carrying equipment designs | 0 | 0.46 | Craft: Sew Fleece Supply Carrier |
| `fleece_tool_roll` | Fleece Tool Roll | Carrying equipment designs | 0 | 0.30 | Craft: Sew Fleece Tool Roll |
| `fleece_rucksack` | Fleece Trail Rucksack | Carrying equipment designs | 0 | 0.65 | Craft: Sew Fleece Trail Rucksack |
| `fleece_wideframe_pack` | Fleece Wide Frame Pack | Carrying equipment designs | 1 | 1.86 | Craft: Sew Fleece Wide Frame Pack |
| `hemp_canvas_expedition_pack` | Hemp Canvas Expedition Pack | Carrying equipment designs | 2 | 1.66 | Craft: Sew Hemp Canvas Expedition Pack |
| `hemp_canvas_forager_sling` | Hemp Canvas Forager Sling | Carrying equipment designs | 1 | 0.29 | Craft: Sew Hemp Canvas Forager Sling |
| `hemp_canvas_frame_rig` | Hemp Canvas Frame Rig | Carrying equipment designs | 2 | 1.53 | Craft: Sew Hemp Canvas Frame Rig |
| `hemp_canvas_hauler_bag` | Hemp Canvas Hauler Bag | Carrying equipment designs | 1 | 0.92 | Craft: Sew Hemp Canvas Hauler Bag |
| `hemp_canvas_hip_satchel` | Hemp Canvas Hip Satchel | Carrying equipment designs | 1 | 0.25 | Loot: camp, clothing, depot, house, ranger, warehouse |
| `hemp_canvas_medical_satchel` | Hemp Canvas Medical Satchel | Carrying equipment designs | 1 | 0.44 | Craft: Sew Hemp Canvas Medical Satchel |
| `hemp_canvas_roll_pack` | Hemp Canvas Roll Pack | Carrying equipment designs | 1 | 0.41 | Loot: camp, clothing, depot, house, ranger, warehouse |
| `hemp_canvas_shoulder_pack` | Hemp Canvas Shoulder Pack | Carrying equipment designs | 1 | 0.50 | Loot: camp, clothing, depot, house, ranger, warehouse |
| `hemp_canvas_water_carrier` | Hemp Canvas Supply Carrier | Carrying equipment designs | 1 | 0.51 | Craft: Sew Hemp Canvas Supply Carrier |
| `hemp_canvas_tool_roll` | Hemp Canvas Tool Roll | Carrying equipment designs | 1 | 0.34 | Craft: Sew Hemp Canvas Tool Roll |
| `hemp_canvas_rucksack` | Hemp Canvas Trail Rucksack | Carrying equipment designs | 1 | 0.72 | Craft: Sew Hemp Canvas Trail Rucksack |
| `hemp_canvas_wideframe_pack` | Hemp Canvas Wide Frame Pack | Carrying equipment designs | 2 | 2.03 | Craft: Sew Hemp Canvas Wide Frame Pack |
| `hiking_pack` | Hiking backpack | containers | 0 | 1.00 | Loot: camp, clothing, depot, forest, ranger, warehouse |
| `laminated_mesh_expedition_pack` | Laminated Mesh Expedition Pack | Carrying equipment designs | 5 | 1.67 | Craft: Sew Laminated Mesh Expedition Pack |
| `laminated_mesh_forager_sling` | Laminated Mesh Forager Sling | Carrying equipment designs | 4 | 0.27 | Craft: Sew Laminated Mesh Forager Sling |
| `laminated_mesh_frame_rig` | Laminated Mesh Frame Rig | Carrying equipment designs | 5 | 1.52 | Craft: Sew Laminated Mesh Frame Rig |
| `laminated_mesh_hauler_bag` | Laminated Mesh Hauler Bag | Carrying equipment designs | 4 | 0.84 | Craft: Sew Laminated Mesh Hauler Bag |
| `laminated_mesh_hip_satchel` | Laminated Mesh Hip Satchel | Carrying equipment designs | 4 | 0.23 | Craft: Sew Laminated Mesh Hip Satchel |
| `laminated_mesh_medical_satchel` | Laminated Mesh Medical Satchel | Carrying equipment designs | 4 | 0.40 | Craft: Sew Laminated Mesh Medical Satchel |
| `laminated_mesh_roll_pack` | Laminated Mesh Roll Pack | Carrying equipment designs | 4 | 0.38 | Craft: Sew Laminated Mesh Roll Pack |
| `laminated_mesh_shoulder_pack` | Laminated Mesh Shoulder Pack | Carrying equipment designs | 4 | 0.45 | Craft: Sew Laminated Mesh Shoulder Pack |
| `laminated_mesh_water_carrier` | Laminated Mesh Supply Carrier | Carrying equipment designs | 4 | 0.47 | Craft: Sew Laminated Mesh Supply Carrier |
| `laminated_mesh_tool_roll` | Laminated Mesh Tool Roll | Carrying equipment designs | 4 | 0.31 | Craft: Sew Laminated Mesh Tool Roll |
| `laminated_mesh_rucksack` | Laminated Mesh Trail Rucksack | Carrying equipment designs | 4 | 0.66 | Craft: Sew Laminated Mesh Trail Rucksack |
| `laminated_mesh_wideframe_pack` | Laminated Mesh Wide Frame Pack | Carrying equipment designs | 5 | 1.96 | Craft: Sew Laminated Mesh Wide Frame Pack |
| `leather_suede_expedition_pack` | Leather Suede Expedition Pack | Carrying equipment designs | 3 | 2.20 | Craft: Sew Leather Suede Expedition Pack |
| `leather_suede_forager_sling` | Leather Suede Forager Sling | Carrying equipment designs | 2 | 0.40 | Craft: Sew Leather Suede Forager Sling |
| `leather_suede_frame_rig` | Leather Suede Frame Rig | Carrying equipment designs | 3 | 2.03 | Craft: Sew Leather Suede Frame Rig |
| `leather_suede_hauler_bag` | Leather Suede Hauler Bag | Carrying equipment designs | 2 | 1.23 | Craft: Sew Leather Suede Hauler Bag |
| `leather_suede_hip_satchel` | Leather Suede Hip Satchel | Carrying equipment designs | 2 | 0.34 | Craft: Sew Leather Suede Hip Satchel |
| `leather_suede_medical_satchel` | Leather Suede Medical Satchel | Carrying equipment designs | 2 | 0.59 | Craft: Sew Leather Suede Medical Satchel |
| `leather_suede_roll_pack` | Leather Suede Roll Pack | Carrying equipment designs | 2 | 0.55 | Craft: Sew Leather Suede Roll Pack |
| `leather_suede_shoulder_pack` | Leather Suede Shoulder Pack | Carrying equipment designs | 2 | 0.67 | Craft: Sew Leather Suede Shoulder Pack |
| `leather_suede_water_carrier` | Leather Suede Supply Carrier | Carrying equipment designs | 2 | 0.69 | Craft: Sew Leather Suede Supply Carrier |
| `leather_suede_tool_roll` | Leather Suede Tool Roll | Carrying equipment designs | 2 | 0.45 | Craft: Sew Leather Suede Tool Roll |
| `leather_suede_rucksack` | Leather Suede Trail Rucksack | Carrying equipment designs | 2 | 0.97 | Craft: Sew Leather Suede Trail Rucksack |
| `leather_suede_wideframe_pack` | Leather Suede Wide Frame Pack | Carrying equipment designs | 3 | 2.61 | Craft: Sew Leather Suede Wide Frame Pack |
| `linen_expedition_pack` | Linen Expedition Pack | Carrying equipment designs | 1 | 1.17 | Craft: Sew Linen Expedition Pack |
| `linen_forager_sling` | Linen Forager Sling | Carrying equipment designs | 0 | 0.20 | Craft: Sew Linen Forager Sling |
| `linen_frame_rig` | Linen Frame Rig | Carrying equipment designs | 1 | 1.17 | Craft: Sew Linen Frame Rig |
| `linen_hauler_bag` | Linen Hauler Bag | Carrying equipment designs | 0 | 0.63 | Craft: Sew Linen Hauler Bag |
| `linen_hip_satchel` | Linen Hip Satchel | Carrying equipment designs | 0 | 0.17 | Loot: camp, clothing, depot, house, ranger, warehouse |
| `linen_medical_satchel` | Linen Medical Satchel | Carrying equipment designs | 0 | 0.30 | Craft: Sew Linen Medical Satchel |
| `linen_roll_pack` | Linen Roll Pack | Carrying equipment designs | 0 | 0.28 | Loot: camp, clothing, depot, house, ranger, warehouse |
| `linen_shoulder_pack` | Linen Shoulder Pack | Carrying equipment designs | 0 | 0.34 | Loot: camp, clothing, depot, house, ranger, warehouse |
| `linen_water_carrier` | Linen Supply Carrier | Carrying equipment designs | 0 | 0.35 | Craft: Sew Linen Supply Carrier |
| `linen_tool_roll` | Linen Tool Roll | Carrying equipment designs | 0 | 0.23 | Craft: Sew Linen Tool Roll |
| `linen_rucksack` | Linen Trail Rucksack | Carrying equipment designs | 0 | 0.50 | Craft: Sew Linen Trail Rucksack |
| `linen_wideframe_pack` | Linen Wide Frame Pack | Carrying equipment designs | 1 | 1.43 | Craft: Sew Linen Wide Frame Pack |
| `messenger_bag` | Messenger bag | containers | 0 | 0.40 | Loot: clothing, depot, library, warehouse |
| `neoprene_expedition_pack` | Neoprene Expedition Pack | Carrying equipment designs | 3 | 1.74 | Craft: Sew Neoprene Expedition Pack |
| `neoprene_forager_sling` | Neoprene Forager Sling | Carrying equipment designs | 2 | 0.29 | Craft: Sew Neoprene Forager Sling |
| `neoprene_frame_rig` | Neoprene Frame Rig | Carrying equipment designs | 3 | 1.63 | Craft: Sew Neoprene Frame Rig |
| `neoprene_hauler_bag` | Neoprene Hauler Bag | Carrying equipment designs | 2 | 0.92 | Craft: Sew Neoprene Hauler Bag |
| `neoprene_hip_satchel` | Neoprene Hip Satchel | Carrying equipment designs | 2 | 0.25 | Craft: Sew Neoprene Hip Satchel |
| `neoprene_medical_satchel` | Neoprene Medical Satchel | Carrying equipment designs | 2 | 0.44 | Craft: Sew Neoprene Medical Satchel |
| `neoprene_roll_pack` | Neoprene Roll Pack | Carrying equipment designs | 2 | 0.41 | Craft: Sew Neoprene Roll Pack |
| `neoprene_shoulder_pack` | Neoprene Shoulder Pack | Carrying equipment designs | 2 | 0.50 | Craft: Sew Neoprene Shoulder Pack |
| `neoprene_water_carrier` | Neoprene Supply Carrier | Carrying equipment designs | 2 | 0.51 | Craft: Sew Neoprene Supply Carrier |
| `neoprene_tool_roll` | Neoprene Tool Roll | Carrying equipment designs | 2 | 0.34 | Craft: Sew Neoprene Tool Roll |
| `neoprene_rucksack` | Neoprene Trail Rucksack | Carrying equipment designs | 2 | 0.72 | Craft: Sew Neoprene Trail Rucksack |
| `neoprene_wideframe_pack` | Neoprene Wide Frame Pack | Carrying equipment designs | 3 | 2.05 | Craft: Sew Neoprene Wide Frame Pack |
| `nylon_webbing_expedition_pack` | Nylon Webbing Expedition Pack | Carrying equipment designs | 3 | 1.38 | Craft: Sew Nylon Webbing Expedition Pack |
| `nylon_webbing_forager_sling` | Nylon Webbing Forager Sling | Carrying equipment designs | 2 | 0.21 | Craft: Sew Nylon Webbing Forager Sling |
| `nylon_webbing_frame_rig` | Nylon Webbing Frame Rig | Carrying equipment designs | 3 | 1.31 | Craft: Sew Nylon Webbing Frame Rig |
| `nylon_webbing_hauler_bag` | Nylon Webbing Hauler Bag | Carrying equipment designs | 2 | 0.64 | Craft: Sew Nylon Webbing Hauler Bag |
| `nylon_webbing_hip_satchel` | Nylon Webbing Hip Satchel | Carrying equipment designs | 2 | 0.18 | Craft: Sew Nylon Webbing Hip Satchel |
| `nylon_webbing_medical_satchel` | Nylon Webbing Medical Satchel | Carrying equipment designs | 2 | 0.31 | Craft: Sew Nylon Webbing Medical Satchel |
| `nylon_webbing_roll_pack` | Nylon Webbing Roll Pack | Carrying equipment designs | 2 | 0.29 | Craft: Sew Nylon Webbing Roll Pack |
| `nylon_webbing_shoulder_pack` | Nylon Webbing Shoulder Pack | Carrying equipment designs | 2 | 0.35 | Craft: Sew Nylon Webbing Shoulder Pack |
| `nylon_webbing_water_carrier` | Nylon Webbing Supply Carrier | Carrying equipment designs | 2 | 0.36 | Craft: Sew Nylon Webbing Supply Carrier |
| `nylon_webbing_tool_roll` | Nylon Webbing Tool Roll | Carrying equipment designs | 2 | 0.24 | Craft: Sew Nylon Webbing Tool Roll |
| `nylon_webbing_rucksack` | Nylon Webbing Trail Rucksack | Carrying equipment designs | 2 | 0.51 | Craft: Sew Nylon Webbing Trail Rucksack |
| `nylon_webbing_wideframe_pack` | Nylon Webbing Wide Frame Pack | Carrying equipment designs | 3 | 1.48 | Craft: Sew Nylon Webbing Wide Frame Pack |
| `oilskin_expedition_pack` | Oilskin Expedition Pack | Carrying equipment designs | 2 | 1.68 | Craft: Sew Oilskin Expedition Pack |
| `oilskin_forager_sling` | Oilskin Forager Sling | Carrying equipment designs | 1 | 0.29 | Craft: Sew Oilskin Forager Sling |
| `oilskin_frame_rig` | Oilskin Frame Rig | Carrying equipment designs | 2 | 1.61 | Craft: Sew Oilskin Frame Rig |
| `oilskin_hauler_bag` | Oilskin Hauler Bag | Carrying equipment designs | 1 | 0.89 | Craft: Sew Oilskin Hauler Bag |
| `oilskin_hip_satchel` | Oilskin Hip Satchel | Carrying equipment designs | 1 | 0.25 | Loot: camp, clothing, depot, house, ranger, warehouse |
| `oilskin_medical_satchel` | Oilskin Medical Satchel | Carrying equipment designs | 1 | 0.43 | Craft: Sew Oilskin Medical Satchel |
| `oilskin_roll_pack` | Oilskin Roll Pack | Carrying equipment designs | 1 | 0.40 | Loot: camp, clothing, depot, house, ranger, warehouse |
| `oilskin_shoulder_pack` | Oilskin Shoulder Pack | Carrying equipment designs | 1 | 0.48 | Loot: camp, clothing, depot, house, ranger, warehouse |
| `oilskin_water_carrier` | Oilskin Supply Carrier | Carrying equipment designs | 1 | 0.50 | Craft: Sew Oilskin Supply Carrier |
| `oilskin_tool_roll` | Oilskin Tool Roll | Carrying equipment designs | 1 | 0.33 | Craft: Sew Oilskin Tool Roll |
| `oilskin_rucksack` | Oilskin Trail Rucksack | Carrying equipment designs | 1 | 0.71 | Craft: Sew Oilskin Trail Rucksack |
| `oilskin_wideframe_pack` | Oilskin Wide Frame Pack | Carrying equipment designs | 2 | 1.99 | Craft: Sew Oilskin Wide Frame Pack |
| `plain_canvas_expedition_pack` | Plain Canvas Expedition Pack | Carrying equipment designs | 2 | 1.74 | Craft: Sew Plain Canvas Expedition Pack |
| `plain_canvas_forager_sling` | Plain Canvas Forager Sling | Carrying equipment designs | 1 | 0.30 | Craft: Sew Plain Canvas Forager Sling |
| `plain_canvas_frame_rig` | Plain Canvas Frame Rig | Carrying equipment designs | 2 | 1.66 | Craft: Sew Plain Canvas Frame Rig |
| `plain_canvas_hauler_bag` | Plain Canvas Hauler Bag | Carrying equipment designs | 1 | 0.94 | Craft: Sew Plain Canvas Hauler Bag |
| `plain_canvas_hip_satchel` | Plain Canvas Hip Satchel | Carrying equipment designs | 1 | 0.26 | Loot: camp, clothing, depot, house, ranger, warehouse |
| `plain_canvas_medical_satchel` | Plain Canvas Medical Satchel | Carrying equipment designs | 1 | 0.45 | Craft: Sew Plain Canvas Medical Satchel |
| `plain_canvas_roll_pack` | Plain Canvas Roll Pack | Carrying equipment designs | 1 | 0.42 | Loot: camp, clothing, depot, house, ranger, warehouse |
| `plain_canvas_shoulder_pack` | Plain Canvas Shoulder Pack | Carrying equipment designs | 1 | 0.51 | Loot: camp, clothing, depot, house, ranger, warehouse |
| `plain_canvas_water_carrier` | Plain Canvas Supply Carrier | Carrying equipment designs | 1 | 0.52 | Craft: Sew Plain Canvas Supply Carrier |
| `plain_canvas_tool_roll` | Plain Canvas Tool Roll | Carrying equipment designs | 1 | 0.34 | Craft: Sew Plain Canvas Tool Roll |
| `plain_canvas_rucksack` | Plain Canvas Trail Rucksack | Carrying equipment designs | 1 | 0.74 | Craft: Sew Plain Canvas Trail Rucksack |
| `plain_canvas_wideframe_pack` | Plain Canvas Wide Frame Pack | Carrying equipment designs | 2 | 1.95 | Craft: Sew Plain Canvas Wide Frame Pack |
| `quilted_cotton_expedition_pack` | Quilted Cotton Expedition Pack | Carrying equipment designs | 3 | 1.97 | Craft: Sew Quilted Cotton Expedition Pack |
| `quilted_cotton_forager_sling` | Quilted Cotton Forager Sling | Carrying equipment designs | 2 | 0.37 | Craft: Sew Quilted Cotton Forager Sling |
| `quilted_cotton_frame_rig` | Quilted Cotton Frame Rig | Carrying equipment designs | 3 | 1.84 | Craft: Sew Quilted Cotton Frame Rig |
| `quilted_cotton_hauler_bag` | Quilted Cotton Hauler Bag | Carrying equipment designs | 2 | 1.14 | Craft: Sew Quilted Cotton Hauler Bag |
| `quilted_cotton_hip_satchel` | Quilted Cotton Hip Satchel | Carrying equipment designs | 2 | 0.32 | Craft: Sew Quilted Cotton Hip Satchel |
| `quilted_cotton_medical_satchel` | Quilted Cotton Medical Satchel | Carrying equipment designs | 2 | 0.55 | Craft: Sew Quilted Cotton Medical Satchel |
| `quilted_cotton_roll_pack` | Quilted Cotton Roll Pack | Carrying equipment designs | 2 | 0.51 | Craft: Sew Quilted Cotton Roll Pack |
| `quilted_cotton_shoulder_pack` | Quilted Cotton Shoulder Pack | Carrying equipment designs | 2 | 0.62 | Craft: Sew Quilted Cotton Shoulder Pack |
| `quilted_cotton_water_carrier` | Quilted Cotton Supply Carrier | Carrying equipment designs | 2 | 0.64 | Craft: Sew Quilted Cotton Supply Carrier |
| `quilted_cotton_tool_roll` | Quilted Cotton Tool Roll | Carrying equipment designs | 2 | 0.42 | Craft: Sew Quilted Cotton Tool Roll |
| `quilted_cotton_rucksack` | Quilted Cotton Trail Rucksack | Carrying equipment designs | 2 | 0.90 | Craft: Sew Quilted Cotton Trail Rucksack |
| `quilted_cotton_wideframe_pack` | Quilted Cotton Wide Frame Pack | Carrying equipment designs | 3 | 2.29 | Craft: Sew Quilted Cotton Wide Frame Pack |
| `ripstop_expedition_pack` | Ripstop Expedition Pack | Carrying equipment designs | 3 | 1.27 | Craft: Sew Ripstop Expedition Pack |
| `ripstop_forager_sling` | Ripstop Forager Sling | Carrying equipment designs | 2 | 0.19 | Craft: Sew Ripstop Forager Sling |
| `ripstop_frame_rig` | Ripstop Frame Rig | Carrying equipment designs | 3 | 1.18 | Craft: Sew Ripstop Frame Rig |
| `ripstop_hauler_bag` | Ripstop Hauler Bag | Carrying equipment designs | 2 | 0.58 | Craft: Sew Ripstop Hauler Bag |
| `ripstop_hip_satchel` | Ripstop Hip Satchel | Carrying equipment designs | 2 | 0.16 | Craft: Sew Ripstop Hip Satchel |
| `ripstop_medical_satchel` | Ripstop Medical Satchel | Carrying equipment designs | 2 | 0.28 | Craft: Sew Ripstop Medical Satchel |
| `ripstop_roll_pack` | Ripstop Roll Pack | Carrying equipment designs | 2 | 0.26 | Craft: Sew Ripstop Roll Pack |
| `ripstop_shoulder_pack` | Ripstop Shoulder Pack | Carrying equipment designs | 2 | 0.31 | Craft: Sew Ripstop Shoulder Pack |
| `ripstop_water_carrier` | Ripstop Supply Carrier | Carrying equipment designs | 2 | 0.32 | Craft: Sew Ripstop Supply Carrier |
| `ripstop_tool_roll` | Ripstop Tool Roll | Carrying equipment designs | 2 | 0.21 | Craft: Sew Ripstop Tool Roll |
| `ripstop_rucksack` | Ripstop Trail Rucksack | Carrying equipment designs | 2 | 0.46 | Craft: Sew Ripstop Trail Rucksack |
| `ripstop_wideframe_pack` | Ripstop Wide Frame Pack | Carrying equipment designs | 3 | 1.50 | Craft: Sew Ripstop Wide Frame Pack |
| `dry_bag` | Roll-top bag | containers | 0 | 0.50 | Loot: clothing, depot, river, warehouse |
| `sailcloth_expedition_pack` | Sailcloth Expedition Pack | Carrying equipment designs | 3 | 1.71 | Craft: Sew Sailcloth Expedition Pack |
| `sailcloth_forager_sling` | Sailcloth Forager Sling | Carrying equipment designs | 2 | 0.30 | Craft: Sew Sailcloth Forager Sling |
| `sailcloth_frame_rig` | Sailcloth Frame Rig | Carrying equipment designs | 3 | 1.72 | Craft: Sew Sailcloth Frame Rig |
| `sailcloth_hauler_bag` | Sailcloth Hauler Bag | Carrying equipment designs | 2 | 0.93 | Craft: Sew Sailcloth Hauler Bag |
| `sailcloth_hip_satchel` | Sailcloth Hip Satchel | Carrying equipment designs | 2 | 0.26 | Craft: Sew Sailcloth Hip Satchel |
| `sailcloth_medical_satchel` | Sailcloth Medical Satchel | Carrying equipment designs | 2 | 0.44 | Craft: Sew Sailcloth Medical Satchel |
| `sailcloth_roll_pack` | Sailcloth Roll Pack | Carrying equipment designs | 2 | 0.42 | Craft: Sew Sailcloth Roll Pack |
| `sailcloth_shoulder_pack` | Sailcloth Shoulder Pack | Carrying equipment designs | 2 | 0.50 | Craft: Sew Sailcloth Shoulder Pack |
| `sailcloth_water_carrier` | Sailcloth Supply Carrier | Carrying equipment designs | 2 | 0.52 | Craft: Sew Sailcloth Supply Carrier |
| `sailcloth_tool_roll` | Sailcloth Tool Roll | Carrying equipment designs | 2 | 0.34 | Craft: Sew Sailcloth Tool Roll |
| `sailcloth_rucksack` | Sailcloth Trail Rucksack | Carrying equipment designs | 2 | 0.73 | Craft: Sew Sailcloth Trail Rucksack |
| `sailcloth_wideframe_pack` | Sailcloth Wide Frame Pack | Carrying equipment designs | 3 | 1.96 | Craft: Sew Sailcloth Wide Frame Pack |
| `seatbelt_weave_expedition_pack` | Seatbelt Weave Expedition Pack | Carrying equipment designs | 4 | 1.94 | Craft: Sew Seatbelt Weave Expedition Pack |
| `seatbelt_weave_forager_sling` | Seatbelt Weave Forager Sling | Carrying equipment designs | 3 | 0.34 | Craft: Sew Seatbelt Weave Forager Sling |
| `seatbelt_weave_frame_rig` | Seatbelt Weave Frame Rig | Carrying equipment designs | 4 | 1.67 | Craft: Sew Seatbelt Weave Frame Rig |
| `seatbelt_weave_hauler_bag` | Seatbelt Weave Hauler Bag | Carrying equipment designs | 3 | 1.05 | Craft: Sew Seatbelt Weave Hauler Bag |
| `seatbelt_weave_hip_satchel` | Seatbelt Weave Hip Satchel | Carrying equipment designs | 3 | 0.29 | Craft: Sew Seatbelt Weave Hip Satchel |
| `seatbelt_weave_medical_satchel` | Seatbelt Weave Medical Satchel | Carrying equipment designs | 3 | 0.50 | Craft: Sew Seatbelt Weave Medical Satchel |
| `seatbelt_weave_roll_pack` | Seatbelt Weave Roll Pack | Carrying equipment designs | 3 | 0.47 | Craft: Sew Seatbelt Weave Roll Pack |
| `seatbelt_weave_shoulder_pack` | Seatbelt Weave Shoulder Pack | Carrying equipment designs | 3 | 0.57 | Craft: Sew Seatbelt Weave Shoulder Pack |
| `seatbelt_weave_water_carrier` | Seatbelt Weave Supply Carrier | Carrying equipment designs | 3 | 0.59 | Craft: Sew Seatbelt Weave Supply Carrier |
| `seatbelt_weave_tool_roll` | Seatbelt Weave Tool Roll | Carrying equipment designs | 3 | 0.38 | Craft: Sew Seatbelt Weave Tool Roll |
| `seatbelt_weave_rucksack` | Seatbelt Weave Trail Rucksack | Carrying equipment designs | 3 | 0.83 | Craft: Sew Seatbelt Weave Trail Rucksack |
| `seatbelt_weave_wideframe_pack` | Seatbelt Weave Wide Frame Pack | Carrying equipment designs | 4 | 2.25 | Craft: Sew Seatbelt Weave Wide Frame Pack |
| `tool_belt` | Tool belt | containers | 0 | 0.45 | Loot: clothing, depot, warehouse |
| `waxed_canvas_expedition_pack` | Waxed Canvas Expedition Pack | Carrying equipment designs | 3 | 1.96 | Craft: Sew Waxed Canvas Expedition Pack |
| `waxed_canvas_forager_sling` | Waxed Canvas Forager Sling | Carrying equipment designs | 2 | 0.33 | Craft: Sew Waxed Canvas Forager Sling |
| `waxed_canvas_frame_rig` | Waxed Canvas Frame Rig | Carrying equipment designs | 3 | 1.83 | Craft: Sew Waxed Canvas Frame Rig |
| `waxed_canvas_hauler_bag` | Waxed Canvas Hauler Bag | Carrying equipment designs | 2 | 1.02 | Craft: Sew Waxed Canvas Hauler Bag |
| `waxed_canvas_hip_satchel` | Waxed Canvas Hip Satchel | Carrying equipment designs | 2 | 0.28 | Craft: Sew Waxed Canvas Hip Satchel |
| `waxed_canvas_medical_satchel` | Waxed Canvas Medical Satchel | Carrying equipment designs | 2 | 0.49 | Craft: Sew Waxed Canvas Medical Satchel |
| `waxed_canvas_roll_pack` | Waxed Canvas Roll Pack | Carrying equipment designs | 2 | 0.46 | Craft: Sew Waxed Canvas Roll Pack |
| `waxed_canvas_shoulder_pack` | Waxed Canvas Shoulder Pack | Carrying equipment designs | 2 | 0.55 | Craft: Sew Waxed Canvas Shoulder Pack |
| `waxed_canvas_water_carrier` | Waxed Canvas Supply Carrier | Carrying equipment designs | 2 | 0.57 | Craft: Sew Waxed Canvas Supply Carrier |
| `waxed_canvas_tool_roll` | Waxed Canvas Tool Roll | Carrying equipment designs | 2 | 0.38 | Craft: Sew Waxed Canvas Tool Roll |
| `waxed_canvas_rucksack` | Waxed Canvas Trail Rucksack | Carrying equipment designs | 2 | 0.81 | Craft: Sew Waxed Canvas Trail Rucksack |
| `waxed_canvas_wideframe_pack` | Waxed Canvas Wide Frame Pack | Carrying equipment designs | 3 | 2.30 | Craft: Sew Waxed Canvas Wide Frame Pack |
| `frame_pack` | Wood-frame pack | containers | 0 | 1.30 | Craft: Build a wood-frame pack |
| `wool_felt_expedition_pack` | Wool Felt Expedition Pack | Carrying equipment designs | 2 | 1.98 | Craft: Sew Wool Felt Expedition Pack |
| `wool_felt_forager_sling` | Wool Felt Forager Sling | Carrying equipment designs | 1 | 0.34 | Craft: Sew Wool Felt Forager Sling |
| `wool_felt_frame_rig` | Wool Felt Frame Rig | Carrying equipment designs | 2 | 1.76 | Craft: Sew Wool Felt Frame Rig |
| `wool_felt_hauler_bag` | Wool Felt Hauler Bag | Carrying equipment designs | 1 | 1.06 | Craft: Sew Wool Felt Hauler Bag |
| `wool_felt_hip_satchel` | Wool Felt Hip Satchel | Carrying equipment designs | 1 | 0.29 | Loot: camp, clothing, depot, house, ranger, warehouse |
| `wool_felt_medical_satchel` | Wool Felt Medical Satchel | Carrying equipment designs | 1 | 0.50 | Craft: Sew Wool Felt Medical Satchel |
| `wool_felt_roll_pack` | Wool Felt Roll Pack | Carrying equipment designs | 1 | 0.48 | Loot: camp, clothing, depot, house, ranger, warehouse |
| `wool_felt_shoulder_pack` | Wool Felt Shoulder Pack | Carrying equipment designs | 1 | 0.57 | Loot: camp, clothing, depot, house, ranger, warehouse |
| `wool_felt_water_carrier` | Wool Felt Supply Carrier | Carrying equipment designs | 1 | 0.59 | Craft: Sew Wool Felt Supply Carrier |
| `wool_felt_tool_roll` | Wool Felt Tool Roll | Carrying equipment designs | 1 | 0.39 | Craft: Sew Wool Felt Tool Roll |
| `wool_felt_rucksack` | Wool Felt Trail Rucksack | Carrying equipment designs | 1 | 0.83 | Craft: Sew Wool Felt Trail Rucksack |
| `wool_felt_wideframe_pack` | Wool Felt Wide Frame Pack | Carrying equipment designs | 2 | 2.21 | Craft: Sew Wool Felt Wide Frame Pack |

## Drinks

| Stable ID | Item | Family | Tier | kg | Obtain |
| --- | --- | --- | ---: | ---: | --- |
| `anise_seed_cold_brew` | Anise Seed Cold Brew | Herbal drinks | 1 | 0.35 | Craft: Anise Seed Cold Brew |
| `anise_seed_infusion` | Anise Seed Herbal Infusion | Herbal drinks | 1 | 0.29 | Craft: Anise Seed Herbal Infusion |
| `anise_seed_recovery_drink` | Anise Seed Herbal Recovery Drink | Herbal drinks | 2 | 0.46 | Craft: Anise Seed Herbal Recovery Drink |
| `anise_seed_honey_brew` | Anise Seed Honey Brew | Herbal drinks | 2 | 0.40 | Craft: Anise Seed Honey Brew |
| `apricot_cordial` | Apricot Camp Cordial | Fruit drinks | 2 | 0.45 | Craft: Apricot Camp Cordial |
| `apricot_infusion` | Apricot Fruit Infusion | Fruit drinks | 1 | 0.34 | Craft: Apricot Fruit Infusion |
| `apricot_juice` | Apricot Pressed Juice | Fruit drinks | 1 | 0.28 | Craft: Apricot Pressed Juice |
| `apricot_recovery_drink` | Apricot Recovery Drink | Fruit drinks | 2 | 0.39 | Craft: Apricot Recovery Drink |
| `beet_broth` | Beet Garden Broth | Vegetable drinks | 1 | 0.34 | Craft: Beet Garden Broth |
| `beet_pressed_drink` | Beet Garden Drink | Vegetable drinks | 1 | 0.28 | Craft: Beet Garden Drink |
| `beet_oat_drink` | Beet Savory Oat Drink | Vegetable drinks | 2 | 0.45 | Craft: Beet Savory Oat Drink |
| `beet_salted_broth` | Beet Travel Broth | Vegetable drinks | 2 | 0.39 | Craft: Beet Travel Broth |
| `bell_pepper_broth` | Bell Pepper Garden Broth | Vegetable drinks | 1 | 0.36 | Craft: Bell Pepper Garden Broth |
| `bell_pepper_pressed_drink` | Bell Pepper Garden Drink | Vegetable drinks | 1 | 0.30 | Craft: Bell Pepper Garden Drink |
| `bell_pepper_oat_drink` | Bell Pepper Savory Oat Drink | Vegetable drinks | 2 | 0.47 | Craft: Bell Pepper Savory Oat Drink |
| `bell_pepper_salted_broth` | Bell Pepper Travel Broth | Vegetable drinks | 2 | 0.41 | Craft: Bell Pepper Travel Broth |
| `blackberry_cordial` | Blackberry Camp Cordial | Fruit drinks | 2 | 0.45 | Craft: Blackberry Camp Cordial |
| `blackberry_infusion` | Blackberry Fruit Infusion | Fruit drinks | 1 | 0.34 | Craft: Blackberry Fruit Infusion |
| `blackberry_juice` | Blackberry Pressed Juice | Fruit drinks | 1 | 0.28 | Craft: Blackberry Pressed Juice |
| `blackberry_recovery_drink` | Blackberry Recovery Drink | Fruit drinks | 2 | 0.39 | Craft: Blackberry Recovery Drink |
| `blueberry_cordial` | Blueberry Camp Cordial | Fruit drinks | 2 | 0.46 | Craft: Blueberry Camp Cordial |
| `blueberry_infusion` | Blueberry Fruit Infusion | Fruit drinks | 1 | 0.35 | Craft: Blueberry Fruit Infusion |
| `blueberry_juice` | Blueberry Pressed Juice | Fruit drinks | 1 | 0.29 | Craft: Blueberry Pressed Juice |
| `blueberry_recovery_drink` | Blueberry Recovery Drink | Fruit drinks | 2 | 0.40 | Craft: Blueberry Recovery Drink |
| `broccoli_broth` | Broccoli Garden Broth | Vegetable drinks | 1 | 0.34 | Craft: Broccoli Garden Broth |
| `broccoli_pressed_drink` | Broccoli Garden Drink | Vegetable drinks | 1 | 0.28 | Craft: Broccoli Garden Drink |
| `broccoli_oat_drink` | Broccoli Savory Oat Drink | Vegetable drinks | 2 | 0.45 | Craft: Broccoli Savory Oat Drink |
| `broccoli_salted_broth` | Broccoli Travel Broth | Vegetable drinks | 2 | 0.39 | Craft: Broccoli Travel Broth |
| `broth` | Broth flask | drinks | 0 | 0.40 | Loot: restaurant |
| `brussels_sprout_broth` | Brussels Sprout Garden Broth | Vegetable drinks | 1 | 0.36 | Craft: Brussels Sprout Garden Broth |
| `brussels_sprout_pressed_drink` | Brussels Sprout Garden Drink | Vegetable drinks | 1 | 0.30 | Craft: Brussels Sprout Garden Drink |
| `brussels_sprout_oat_drink` | Brussels Sprout Savory Oat Drink | Vegetable drinks | 2 | 0.47 | Craft: Brussels Sprout Savory Oat Drink |
| `brussels_sprout_salted_broth` | Brussels Sprout Travel Broth | Vegetable drinks | 2 | 0.41 | Craft: Brussels Sprout Travel Broth |
| `cabbage_broth` | Cabbage Garden Broth | Vegetable drinks | 1 | 0.35 | Craft: Cabbage Garden Broth |
| `cabbage_pressed_drink` | Cabbage Garden Drink | Vegetable drinks | 1 | 0.29 | Craft: Cabbage Garden Drink |
| `cabbage_oat_drink` | Cabbage Savory Oat Drink | Vegetable drinks | 2 | 0.46 | Craft: Cabbage Savory Oat Drink |
| `cabbage_salted_broth` | Cabbage Travel Broth | Vegetable drinks | 2 | 0.40 | Craft: Cabbage Travel Broth |
| `coffee` | Camp coffee | drinks | 0 | 0.25 | Craft: Brew camp coffee |
| `tea` | Camp tea | drinks | 0 | 0.25 | Craft: Brew camp tea |
| `cauliflower_broth` | Cauliflower Garden Broth | Vegetable drinks | 1 | 0.35 | Craft: Cauliflower Garden Broth |
| `cauliflower_pressed_drink` | Cauliflower Garden Drink | Vegetable drinks | 1 | 0.29 | Craft: Cauliflower Garden Drink |
| `cauliflower_oat_drink` | Cauliflower Savory Oat Drink | Vegetable drinks | 2 | 0.46 | Craft: Cauliflower Savory Oat Drink |
| `cauliflower_salted_broth` | Cauliflower Travel Broth | Vegetable drinks | 2 | 0.40 | Craft: Cauliflower Travel Broth |
| `celeriac_broth` | Celeriac Garden Broth | Vegetable drinks | 1 | 0.36 | Craft: Celeriac Garden Broth |
| `celeriac_pressed_drink` | Celeriac Garden Drink | Vegetable drinks | 1 | 0.30 | Craft: Celeriac Garden Drink |
| `celeriac_oat_drink` | Celeriac Savory Oat Drink | Vegetable drinks | 2 | 0.47 | Craft: Celeriac Savory Oat Drink |
| `celeriac_salted_broth` | Celeriac Travel Broth | Vegetable drinks | 2 | 0.41 | Craft: Celeriac Travel Broth |
| `chamomile_cold_brew` | Chamomile Cold Brew | Herbal drinks | 1 | 0.35 | Craft: Chamomile Cold Brew |
| `chamomile_infusion` | Chamomile Herbal Infusion | Herbal drinks | 1 | 0.29 | Craft: Chamomile Herbal Infusion |
| `chamomile_recovery_drink` | Chamomile Herbal Recovery Drink | Herbal drinks | 2 | 0.46 | Craft: Chamomile Herbal Recovery Drink |
| `chamomile_honey_brew` | Chamomile Honey Brew | Herbal drinks | 2 | 0.40 | Craft: Chamomile Honey Brew |
| `chard_broth` | Chard Garden Broth | Vegetable drinks | 1 | 0.35 | Craft: Chard Garden Broth |
| `chard_pressed_drink` | Chard Garden Drink | Vegetable drinks | 1 | 0.29 | Craft: Chard Garden Drink |
| `chard_oat_drink` | Chard Savory Oat Drink | Vegetable drinks | 2 | 0.46 | Craft: Chard Savory Oat Drink |
| `chard_salted_broth` | Chard Travel Broth | Vegetable drinks | 2 | 0.40 | Craft: Chard Travel Broth |
| `cherry_cordial` | Cherry Camp Cordial | Fruit drinks | 2 | 0.45 | Craft: Cherry Camp Cordial |
| `cherry_infusion` | Cherry Fruit Infusion | Fruit drinks | 1 | 0.34 | Craft: Cherry Fruit Infusion |
| `cherry_juice` | Cherry Pressed Juice | Fruit drinks | 1 | 0.28 | Craft: Cherry Pressed Juice |
| `cherry_recovery_drink` | Cherry Recovery Drink | Fruit drinks | 2 | 0.39 | Craft: Cherry Recovery Drink |
| `cinnamon_bark_cold_brew` | Cinnamon Bark Cold Brew | Herbal drinks | 1 | 0.34 | Craft: Cinnamon Bark Cold Brew |
| `cinnamon_bark_infusion` | Cinnamon Bark Herbal Infusion | Herbal drinks | 1 | 0.28 | Craft: Cinnamon Bark Herbal Infusion |
| `cinnamon_bark_recovery_drink` | Cinnamon Bark Herbal Recovery Drink | Herbal drinks | 2 | 0.45 | Craft: Cinnamon Bark Herbal Recovery Drink |
| `cinnamon_bark_honey_brew` | Cinnamon Bark Honey Brew | Herbal drinks | 2 | 0.39 | Craft: Cinnamon Bark Honey Brew |
| `water` | Clean water | drinks | 0 | 0.80 | Loot: cabin, camp, default, fuel, grocery, house, library, market, pharmacy, radio, ranger, river, suburban, urban |
| `clove_bud_cold_brew` | Clove Bud Cold Brew | Herbal drinks | 1 | 0.35 | Craft: Clove Bud Cold Brew |
| `clove_bud_infusion` | Clove Bud Herbal Infusion | Herbal drinks | 1 | 0.29 | Craft: Clove Bud Herbal Infusion |
| `clove_bud_recovery_drink` | Clove Bud Herbal Recovery Drink | Herbal drinks | 2 | 0.46 | Craft: Clove Bud Herbal Recovery Drink |
| `clove_bud_honey_brew` | Clove Bud Honey Brew | Herbal drinks | 2 | 0.40 | Craft: Clove Bud Honey Brew |
| `coconut_water` | Coconut water | drinks | 0 | 0.33 | Loot: grocery, market |
| `coriander_seed_cold_brew` | Coriander Seed Cold Brew | Herbal drinks | 1 | 0.36 | Craft: Coriander Seed Cold Brew |
| `coriander_seed_infusion` | Coriander Seed Herbal Infusion | Herbal drinks | 1 | 0.30 | Craft: Coriander Seed Herbal Infusion |
| `coriander_seed_recovery_drink` | Coriander Seed Herbal Recovery Drink | Herbal drinks | 2 | 0.47 | Craft: Coriander Seed Herbal Recovery Drink |
| `coriander_seed_honey_brew` | Coriander Seed Honey Brew | Herbal drinks | 2 | 0.41 | Craft: Coriander Seed Honey Brew |
| `cranberry_cordial` | Cranberry Camp Cordial | Fruit drinks | 2 | 0.46 | Craft: Cranberry Camp Cordial |
| `cranberry_infusion` | Cranberry Fruit Infusion | Fruit drinks | 1 | 0.35 | Craft: Cranberry Fruit Infusion |
| `cranberry_juice` | Cranberry Pressed Juice | Fruit drinks | 1 | 0.29 | Craft: Cranberry Pressed Juice |
| `cranberry_recovery_drink` | Cranberry Recovery Drink | Fruit drinks | 2 | 0.40 | Craft: Cranberry Recovery Drink |
| `cucumber_broth` | Cucumber Garden Broth | Vegetable drinks | 1 | 0.34 | Craft: Cucumber Garden Broth |
| `cucumber_pressed_drink` | Cucumber Garden Drink | Vegetable drinks | 1 | 0.28 | Craft: Cucumber Garden Drink |
| `cucumber_oat_drink` | Cucumber Savory Oat Drink | Vegetable drinks | 2 | 0.45 | Craft: Cucumber Savory Oat Drink |
| `cucumber_salted_broth` | Cucumber Travel Broth | Vegetable drinks | 2 | 0.39 | Craft: Cucumber Travel Broth |
| `cumin_seed_cold_brew` | Cumin Seed Cold Brew | Herbal drinks | 1 | 0.34 | Craft: Cumin Seed Cold Brew |
| `cumin_seed_infusion` | Cumin Seed Herbal Infusion | Herbal drinks | 1 | 0.28 | Craft: Cumin Seed Herbal Infusion |
| `cumin_seed_recovery_drink` | Cumin Seed Herbal Recovery Drink | Herbal drinks | 2 | 0.45 | Craft: Cumin Seed Herbal Recovery Drink |
| `cumin_seed_honey_brew` | Cumin Seed Honey Brew | Herbal drinks | 2 | 0.39 | Craft: Cumin Seed Honey Brew |
| `currant_cordial` | Currant Camp Cordial | Fruit drinks | 2 | 0.46 | Craft: Currant Camp Cordial |
| `currant_infusion` | Currant Fruit Infusion | Fruit drinks | 1 | 0.35 | Craft: Currant Fruit Infusion |
| `currant_juice` | Currant Pressed Juice | Fruit drinks | 1 | 0.29 | Craft: Currant Pressed Juice |
| `currant_recovery_drink` | Currant Recovery Drink | Fruit drinks | 2 | 0.40 | Craft: Currant Recovery Drink |
| `date_cordial` | Date Camp Cordial | Fruit drinks | 2 | 0.45 | Craft: Date Camp Cordial |
| `date_infusion` | Date Fruit Infusion | Fruit drinks | 1 | 0.34 | Craft: Date Fruit Infusion |
| `date_juice` | Date Pressed Juice | Fruit drinks | 1 | 0.28 | Craft: Date Pressed Juice |
| `date_recovery_drink` | Date Recovery Drink | Fruit drinks | 2 | 0.39 | Craft: Date Recovery Drink |
| `eggplant_broth` | Eggplant Garden Broth | Vegetable drinks | 1 | 0.35 | Craft: Eggplant Garden Broth |
| `eggplant_pressed_drink` | Eggplant Garden Drink | Vegetable drinks | 1 | 0.29 | Craft: Eggplant Garden Drink |
| `eggplant_oat_drink` | Eggplant Savory Oat Drink | Vegetable drinks | 2 | 0.46 | Craft: Eggplant Savory Oat Drink |
| `eggplant_salted_broth` | Eggplant Travel Broth | Vegetable drinks | 2 | 0.40 | Craft: Eggplant Travel Broth |
| `elderberry_cordial` | Elderberry Camp Cordial | Fruit drinks | 2 | 0.47 | Craft: Elderberry Camp Cordial |
| `elderberry_infusion` | Elderberry Fruit Infusion | Fruit drinks | 1 | 0.36 | Craft: Elderberry Fruit Infusion |
| `elderberry_juice` | Elderberry Pressed Juice | Fruit drinks | 1 | 0.30 | Craft: Elderberry Pressed Juice |
| `elderberry_recovery_drink` | Elderberry Recovery Drink | Fruit drinks | 2 | 0.41 | Craft: Elderberry Recovery Drink |
| `elderflower_cold_brew` | Elderflower Cold Brew | Herbal drinks | 1 | 0.36 | Craft: Elderflower Cold Brew |
| `elderflower_infusion` | Elderflower Herbal Infusion | Herbal drinks | 1 | 0.30 | Craft: Elderflower Herbal Infusion |
| `elderflower_recovery_drink` | Elderflower Herbal Recovery Drink | Herbal drinks | 2 | 0.47 | Craft: Elderflower Herbal Recovery Drink |
| `elderflower_honey_brew` | Elderflower Honey Brew | Herbal drinks | 2 | 0.41 | Craft: Elderflower Honey Brew |
| `energy_drink` | Energy drink | drinks | 0 | 0.25 | Loot: grocery, market |
| `fennel_seed_cold_brew` | Fennel Seed Cold Brew | Herbal drinks | 1 | 0.34 | Craft: Fennel Seed Cold Brew |
| `fennel_seed_infusion` | Fennel Seed Herbal Infusion | Herbal drinks | 1 | 0.28 | Craft: Fennel Seed Herbal Infusion |
| `fennel_seed_recovery_drink` | Fennel Seed Herbal Recovery Drink | Herbal drinks | 2 | 0.45 | Craft: Fennel Seed Herbal Recovery Drink |
| `fennel_seed_honey_brew` | Fennel Seed Honey Brew | Herbal drinks | 2 | 0.39 | Craft: Fennel Seed Honey Brew |
| `fig_cordial` | Fig Camp Cordial | Fruit drinks | 2 | 0.47 | Craft: Fig Camp Cordial |
| `fig_infusion` | Fig Fruit Infusion | Fruit drinks | 1 | 0.36 | Craft: Fig Fruit Infusion |
| `fig_juice` | Fig Pressed Juice | Fruit drinks | 1 | 0.30 | Craft: Fig Pressed Juice |
| `fig_recovery_drink` | Fig Recovery Drink | Fruit drinks | 2 | 0.41 | Craft: Fig Recovery Drink |
| `fruit_juice` | Fruit juice | drinks | 0 | 0.40 | Loot: grocery, market |
| `garlic_broth` | Garlic Garden Broth | Vegetable drinks | 1 | 0.35 | Craft: Garlic Garden Broth |
| `garlic_pressed_drink` | Garlic Garden Drink | Vegetable drinks | 1 | 0.29 | Craft: Garlic Garden Drink |
| `garlic_oat_drink` | Garlic Savory Oat Drink | Vegetable drinks | 2 | 0.46 | Craft: Garlic Savory Oat Drink |
| `garlic_salted_broth` | Garlic Travel Broth | Vegetable drinks | 2 | 0.40 | Craft: Garlic Travel Broth |
| `ginger_piece_cold_brew` | Ginger Piece Cold Brew | Herbal drinks | 1 | 0.35 | Craft: Ginger Piece Cold Brew |
| `ginger_piece_infusion` | Ginger Piece Herbal Infusion | Herbal drinks | 1 | 0.29 | Craft: Ginger Piece Herbal Infusion |
| `ginger_piece_recovery_drink` | Ginger Piece Herbal Recovery Drink | Herbal drinks | 2 | 0.46 | Craft: Ginger Piece Herbal Recovery Drink |
| `ginger_piece_honey_brew` | Ginger Piece Honey Brew | Herbal drinks | 2 | 0.40 | Craft: Ginger Piece Honey Brew |
| `gooseberry_cordial` | Gooseberry Camp Cordial | Fruit drinks | 2 | 0.45 | Craft: Gooseberry Camp Cordial |
| `gooseberry_infusion` | Gooseberry Fruit Infusion | Fruit drinks | 1 | 0.34 | Craft: Gooseberry Fruit Infusion |
| `gooseberry_juice` | Gooseberry Pressed Juice | Fruit drinks | 1 | 0.28 | Craft: Gooseberry Pressed Juice |
| `gooseberry_recovery_drink` | Gooseberry Recovery Drink | Fruit drinks | 2 | 0.39 | Craft: Gooseberry Recovery Drink |
| `grapefruit_cordial` | Grapefruit Camp Cordial | Fruit drinks | 2 | 0.47 | Craft: Grapefruit Camp Cordial |
| `grapefruit_infusion` | Grapefruit Fruit Infusion | Fruit drinks | 1 | 0.36 | Craft: Grapefruit Fruit Infusion |
| `grapefruit_juice` | Grapefruit Pressed Juice | Fruit drinks | 1 | 0.30 | Craft: Grapefruit Pressed Juice |
| `grapefruit_recovery_drink` | Grapefruit Recovery Drink | Fruit drinks | 2 | 0.41 | Craft: Grapefruit Recovery Drink |
| `green_peas_broth` | Green Peas Garden Broth | Vegetable drinks | 1 | 0.35 | Craft: Green Peas Garden Broth |
| `green_peas_pressed_drink` | Green Peas Garden Drink | Vegetable drinks | 1 | 0.29 | Craft: Green Peas Garden Drink |
| `green_peas_oat_drink` | Green Peas Savory Oat Drink | Vegetable drinks | 2 | 0.46 | Craft: Green Peas Savory Oat Drink |
| `green_peas_salted_broth` | Green Peas Travel Broth | Vegetable drinks | 2 | 0.40 | Craft: Green Peas Travel Broth |
| `guava_cordial` | Guava Camp Cordial | Fruit drinks | 2 | 0.46 | Craft: Guava Camp Cordial |
| `guava_infusion` | Guava Fruit Infusion | Fruit drinks | 1 | 0.35 | Craft: Guava Fruit Infusion |
| `guava_juice` | Guava Pressed Juice | Fruit drinks | 1 | 0.29 | Craft: Guava Pressed Juice |
| `guava_recovery_drink` | Guava Recovery Drink | Fruit drinks | 2 | 0.40 | Craft: Guava Recovery Drink |
| `hibiscus_cold_brew` | Hibiscus Cold Brew | Herbal drinks | 1 | 0.36 | Craft: Hibiscus Cold Brew |
| `hibiscus_infusion` | Hibiscus Herbal Infusion | Herbal drinks | 1 | 0.30 | Craft: Hibiscus Herbal Infusion |
| `hibiscus_recovery_drink` | Hibiscus Herbal Recovery Drink | Herbal drinks | 2 | 0.47 | Craft: Hibiscus Herbal Recovery Drink |
| `hibiscus_honey_brew` | Hibiscus Honey Brew | Herbal drinks | 2 | 0.41 | Craft: Hibiscus Honey Brew |
| `rehydration_mix` | Hydration solution | drinks | 0 | 0.50 | Loot: pharmacy |
| `juniper_tip_cold_brew` | Juniper Tip Cold Brew | Herbal drinks | 1 | 0.35 | Craft: Juniper Tip Cold Brew |
| `juniper_tip_infusion` | Juniper Tip Herbal Infusion | Herbal drinks | 1 | 0.29 | Craft: Juniper Tip Herbal Infusion |
| `juniper_tip_recovery_drink` | Juniper Tip Herbal Recovery Drink | Herbal drinks | 2 | 0.46 | Craft: Juniper Tip Herbal Recovery Drink |
| `juniper_tip_honey_brew` | Juniper Tip Honey Brew | Herbal drinks | 2 | 0.40 | Craft: Juniper Tip Honey Brew |
| `kale_broth` | Kale Garden Broth | Vegetable drinks | 1 | 0.36 | Craft: Kale Garden Broth |
| `kale_pressed_drink` | Kale Garden Drink | Vegetable drinks | 1 | 0.30 | Craft: Kale Garden Drink |
| `kale_oat_drink` | Kale Savory Oat Drink | Vegetable drinks | 2 | 0.47 | Craft: Kale Savory Oat Drink |
| `kale_salted_broth` | Kale Travel Broth | Vegetable drinks | 2 | 0.41 | Craft: Kale Travel Broth |
| `kiwi_cordial` | Kiwi Camp Cordial | Fruit drinks | 2 | 0.46 | Craft: Kiwi Camp Cordial |
| `kiwi_infusion` | Kiwi Fruit Infusion | Fruit drinks | 1 | 0.35 | Craft: Kiwi Fruit Infusion |
| `kiwi_juice` | Kiwi Pressed Juice | Fruit drinks | 1 | 0.29 | Craft: Kiwi Pressed Juice |
| `kiwi_recovery_drink` | Kiwi Recovery Drink | Fruit drinks | 2 | 0.40 | Craft: Kiwi Recovery Drink |
| `lavender_cold_brew` | Lavender Cold Brew | Herbal drinks | 1 | 0.36 | Craft: Lavender Cold Brew |
| `lavender_infusion` | Lavender Herbal Infusion | Herbal drinks | 1 | 0.30 | Craft: Lavender Herbal Infusion |
| `lavender_recovery_drink` | Lavender Herbal Recovery Drink | Herbal drinks | 2 | 0.47 | Craft: Lavender Herbal Recovery Drink |
| `lavender_honey_brew` | Lavender Honey Brew | Herbal drinks | 2 | 0.41 | Craft: Lavender Honey Brew |
| `leek_broth` | Leek Garden Broth | Vegetable drinks | 1 | 0.36 | Craft: Leek Garden Broth |
| `leek_pressed_drink` | Leek Garden Drink | Vegetable drinks | 1 | 0.30 | Craft: Leek Garden Drink |
| `leek_oat_drink` | Leek Savory Oat Drink | Vegetable drinks | 2 | 0.47 | Craft: Leek Savory Oat Drink |
| `leek_salted_broth` | Leek Travel Broth | Vegetable drinks | 2 | 0.41 | Craft: Leek Travel Broth |
| `lemon_balm_cold_brew` | Lemon Balm Cold Brew | Herbal drinks | 1 | 0.35 | Craft: Lemon Balm Cold Brew |
| `lemon_balm_infusion` | Lemon Balm Herbal Infusion | Herbal drinks | 1 | 0.29 | Craft: Lemon Balm Herbal Infusion |
| `lemon_balm_recovery_drink` | Lemon Balm Herbal Recovery Drink | Herbal drinks | 2 | 0.46 | Craft: Lemon Balm Herbal Recovery Drink |
| `lemon_balm_honey_brew` | Lemon Balm Honey Brew | Herbal drinks | 2 | 0.40 | Craft: Lemon Balm Honey Brew |
| `lemon_cordial` | Lemon Camp Cordial | Fruit drinks | 2 | 0.45 | Craft: Lemon Camp Cordial |
| `lemon_infusion` | Lemon Fruit Infusion | Fruit drinks | 1 | 0.34 | Craft: Lemon Fruit Infusion |
| `lemon_juice` | Lemon Pressed Juice | Fruit drinks | 1 | 0.28 | Craft: Lemon Pressed Juice |
| `lemon_recovery_drink` | Lemon Recovery Drink | Fruit drinks | 2 | 0.39 | Craft: Lemon Recovery Drink |
| `soda` | Lemon soda | drinks | 0 | 0.35 | Loot: grocery, market |
| `lettuce_broth` | Lettuce Garden Broth | Vegetable drinks | 1 | 0.36 | Craft: Lettuce Garden Broth |
| `lettuce_pressed_drink` | Lettuce Garden Drink | Vegetable drinks | 1 | 0.30 | Craft: Lettuce Garden Drink |
| `lettuce_oat_drink` | Lettuce Savory Oat Drink | Vegetable drinks | 2 | 0.47 | Craft: Lettuce Savory Oat Drink |
| `lettuce_salted_broth` | Lettuce Travel Broth | Vegetable drinks | 2 | 0.41 | Craft: Lettuce Travel Broth |
| `licorice_root_cold_brew` | Licorice Root Cold Brew | Herbal drinks | 1 | 0.36 | Craft: Licorice Root Cold Brew |
| `licorice_root_infusion` | Licorice Root Herbal Infusion | Herbal drinks | 1 | 0.30 | Craft: Licorice Root Herbal Infusion |
| `licorice_root_recovery_drink` | Licorice Root Herbal Recovery Drink | Herbal drinks | 2 | 0.47 | Craft: Licorice Root Herbal Recovery Drink |
| `licorice_root_honey_brew` | Licorice Root Honey Brew | Herbal drinks | 2 | 0.41 | Craft: Licorice Root Honey Brew |
| `lime_cordial` | Lime Camp Cordial | Fruit drinks | 2 | 0.46 | Craft: Lime Camp Cordial |
| `lime_infusion` | Lime Fruit Infusion | Fruit drinks | 1 | 0.35 | Craft: Lime Fruit Infusion |
| `lime_juice` | Lime Pressed Juice | Fruit drinks | 1 | 0.29 | Craft: Lime Pressed Juice |
| `lime_recovery_drink` | Lime Recovery Drink | Fruit drinks | 2 | 0.40 | Craft: Lime Recovery Drink |
| `lychee_cordial` | Lychee Camp Cordial | Fruit drinks | 2 | 0.45 | Craft: Lychee Camp Cordial |
| `lychee_infusion` | Lychee Fruit Infusion | Fruit drinks | 1 | 0.34 | Craft: Lychee Fruit Infusion |
| `lychee_juice` | Lychee Pressed Juice | Fruit drinks | 1 | 0.28 | Craft: Lychee Pressed Juice |
| `lychee_recovery_drink` | Lychee Recovery Drink | Fruit drinks | 2 | 0.39 | Craft: Lychee Recovery Drink |
| `mango_cordial` | Mango Camp Cordial | Fruit drinks | 2 | 0.46 | Craft: Mango Camp Cordial |
| `mango_infusion` | Mango Fruit Infusion | Fruit drinks | 1 | 0.35 | Craft: Mango Fruit Infusion |
| `mango_juice` | Mango Pressed Juice | Fruit drinks | 1 | 0.29 | Craft: Mango Pressed Juice |
| `mango_recovery_drink` | Mango Recovery Drink | Fruit drinks | 2 | 0.40 | Craft: Mango Recovery Drink |
| `marsh_mallow_cold_brew` | Marsh Mallow Cold Brew | Herbal drinks | 1 | 0.36 | Craft: Marsh Mallow Cold Brew |
| `marsh_mallow_infusion` | Marsh Mallow Herbal Infusion | Herbal drinks | 1 | 0.30 | Craft: Marsh Mallow Herbal Infusion |
| `marsh_mallow_recovery_drink` | Marsh Mallow Herbal Recovery Drink | Herbal drinks | 2 | 0.47 | Craft: Marsh Mallow Herbal Recovery Drink |
| `marsh_mallow_honey_brew` | Marsh Mallow Honey Brew | Herbal drinks | 2 | 0.41 | Craft: Marsh Mallow Honey Brew |
| `meadow_mint_cold_brew` | Meadow Mint Cold Brew | Herbal drinks | 1 | 0.34 | Craft: Meadow Mint Cold Brew |
| `meadow_mint_infusion` | Meadow Mint Herbal Infusion | Herbal drinks | 1 | 0.28 | Craft: Meadow Mint Herbal Infusion |
| `meadow_mint_recovery_drink` | Meadow Mint Herbal Recovery Drink | Herbal drinks | 2 | 0.45 | Craft: Meadow Mint Herbal Recovery Drink |
| `meadow_mint_honey_brew` | Meadow Mint Honey Brew | Herbal drinks | 2 | 0.39 | Craft: Meadow Mint Honey Brew |
| `mulberry_cordial` | Mulberry Camp Cordial | Fruit drinks | 2 | 0.47 | Craft: Mulberry Camp Cordial |
| `mulberry_infusion` | Mulberry Fruit Infusion | Fruit drinks | 1 | 0.36 | Craft: Mulberry Fruit Infusion |
| `mulberry_juice` | Mulberry Pressed Juice | Fruit drinks | 1 | 0.30 | Craft: Mulberry Pressed Juice |
| `mulberry_recovery_drink` | Mulberry Recovery Drink | Fruit drinks | 2 | 0.41 | Craft: Mulberry Recovery Drink |
| `nectarine_cordial` | Nectarine Camp Cordial | Fruit drinks | 2 | 0.46 | Craft: Nectarine Camp Cordial |
| `nectarine_infusion` | Nectarine Fruit Infusion | Fruit drinks | 1 | 0.35 | Craft: Nectarine Fruit Infusion |
| `nectarine_juice` | Nectarine Pressed Juice | Fruit drinks | 1 | 0.29 | Craft: Nectarine Pressed Juice |
| `nectarine_recovery_drink` | Nectarine Recovery Drink | Fruit drinks | 2 | 0.40 | Craft: Nectarine Recovery Drink |
| `nettle_leaf_cold_brew` | Nettle Leaf Cold Brew | Herbal drinks | 1 | 0.35 | Craft: Nettle Leaf Cold Brew |
| `nettle_leaf_infusion` | Nettle Leaf Herbal Infusion | Herbal drinks | 1 | 0.29 | Craft: Nettle Leaf Herbal Infusion |
| `nettle_leaf_recovery_drink` | Nettle Leaf Herbal Recovery Drink | Herbal drinks | 2 | 0.46 | Craft: Nettle Leaf Herbal Recovery Drink |
| `nettle_leaf_honey_brew` | Nettle Leaf Honey Brew | Herbal drinks | 2 | 0.40 | Craft: Nettle Leaf Honey Brew |
| `onion_broth` | Onion Garden Broth | Vegetable drinks | 1 | 0.34 | Craft: Onion Garden Broth |
| `onion_pressed_drink` | Onion Garden Drink | Vegetable drinks | 1 | 0.28 | Craft: Onion Garden Drink |
| `onion_oat_drink` | Onion Savory Oat Drink | Vegetable drinks | 2 | 0.45 | Craft: Onion Savory Oat Drink |
| `onion_salted_broth` | Onion Travel Broth | Vegetable drinks | 2 | 0.39 | Craft: Onion Travel Broth |
| `papaya_cordial` | Papaya Camp Cordial | Fruit drinks | 2 | 0.47 | Craft: Papaya Camp Cordial |
| `papaya_infusion` | Papaya Fruit Infusion | Fruit drinks | 1 | 0.36 | Craft: Papaya Fruit Infusion |
| `papaya_juice` | Papaya Pressed Juice | Fruit drinks | 1 | 0.30 | Craft: Papaya Pressed Juice |
| `papaya_recovery_drink` | Papaya Recovery Drink | Fruit drinks | 2 | 0.41 | Craft: Papaya Recovery Drink |
| `parsnip_broth` | Parsnip Garden Broth | Vegetable drinks | 1 | 0.35 | Craft: Parsnip Garden Broth |
| `parsnip_pressed_drink` | Parsnip Garden Drink | Vegetable drinks | 1 | 0.29 | Craft: Parsnip Garden Drink |
| `parsnip_oat_drink` | Parsnip Savory Oat Drink | Vegetable drinks | 2 | 0.46 | Craft: Parsnip Savory Oat Drink |
| `parsnip_salted_broth` | Parsnip Travel Broth | Vegetable drinks | 2 | 0.40 | Craft: Parsnip Travel Broth |
| `passionfruit_cordial` | Passionfruit Camp Cordial | Fruit drinks | 2 | 0.47 | Craft: Passionfruit Camp Cordial |
| `passionfruit_infusion` | Passionfruit Fruit Infusion | Fruit drinks | 1 | 0.36 | Craft: Passionfruit Fruit Infusion |
| `passionfruit_juice` | Passionfruit Pressed Juice | Fruit drinks | 1 | 0.30 | Craft: Passionfruit Pressed Juice |
| `passionfruit_recovery_drink` | Passionfruit Recovery Drink | Fruit drinks | 2 | 0.41 | Craft: Passionfruit Recovery Drink |
| `peach_cordial` | Peach Camp Cordial | Fruit drinks | 2 | 0.46 | Craft: Peach Camp Cordial |
| `peach_infusion` | Peach Fruit Infusion | Fruit drinks | 1 | 0.35 | Craft: Peach Fruit Infusion |
| `peach_juice` | Peach Pressed Juice | Fruit drinks | 1 | 0.29 | Craft: Peach Pressed Juice |
| `peach_recovery_drink` | Peach Recovery Drink | Fruit drinks | 2 | 0.40 | Craft: Peach Recovery Drink |
| `persimmon_cordial` | Persimmon Camp Cordial | Fruit drinks | 2 | 0.45 | Craft: Persimmon Camp Cordial |
| `persimmon_infusion` | Persimmon Fruit Infusion | Fruit drinks | 1 | 0.34 | Craft: Persimmon Fruit Infusion |
| `persimmon_juice` | Persimmon Pressed Juice | Fruit drinks | 1 | 0.28 | Craft: Persimmon Pressed Juice |
| `persimmon_recovery_drink` | Persimmon Recovery Drink | Fruit drinks | 2 | 0.39 | Craft: Persimmon Recovery Drink |
| `pineapple_cordial` | Pineapple Camp Cordial | Fruit drinks | 2 | 0.45 | Craft: Pineapple Camp Cordial |
| `pineapple_infusion` | Pineapple Fruit Infusion | Fruit drinks | 1 | 0.34 | Craft: Pineapple Fruit Infusion |
| `pineapple_juice` | Pineapple Pressed Juice | Fruit drinks | 1 | 0.28 | Craft: Pineapple Pressed Juice |
| `pineapple_recovery_drink` | Pineapple Recovery Drink | Fruit drinks | 2 | 0.39 | Craft: Pineapple Recovery Drink |
| `plantain_leaf_cold_brew` | Plantain Leaf Cold Brew | Herbal drinks | 1 | 0.34 | Craft: Plantain Leaf Cold Brew |
| `plantain_leaf_infusion` | Plantain Leaf Herbal Infusion | Herbal drinks | 1 | 0.28 | Craft: Plantain Leaf Herbal Infusion |
| `plantain_leaf_recovery_drink` | Plantain Leaf Herbal Recovery Drink | Herbal drinks | 2 | 0.45 | Craft: Plantain Leaf Herbal Recovery Drink |
| `plantain_leaf_honey_brew` | Plantain Leaf Honey Brew | Herbal drinks | 2 | 0.39 | Craft: Plantain Leaf Honey Brew |
| `plum_cordial` | Plum Camp Cordial | Fruit drinks | 2 | 0.47 | Craft: Plum Camp Cordial |
| `plum_infusion` | Plum Fruit Infusion | Fruit drinks | 1 | 0.36 | Craft: Plum Fruit Infusion |
| `plum_juice` | Plum Pressed Juice | Fruit drinks | 1 | 0.30 | Craft: Plum Pressed Juice |
| `plum_recovery_drink` | Plum Recovery Drink | Fruit drinks | 2 | 0.41 | Craft: Plum Recovery Drink |
| `pomegranate_cordial` | Pomegranate Camp Cordial | Fruit drinks | 2 | 0.46 | Craft: Pomegranate Camp Cordial |
| `pomegranate_infusion` | Pomegranate Fruit Infusion | Fruit drinks | 1 | 0.35 | Craft: Pomegranate Fruit Infusion |
| `pomegranate_juice` | Pomegranate Pressed Juice | Fruit drinks | 1 | 0.29 | Craft: Pomegranate Pressed Juice |
| `pomegranate_recovery_drink` | Pomegranate Recovery Drink | Fruit drinks | 2 | 0.40 | Craft: Pomegranate Recovery Drink |
| `pumpkin_broth` | Pumpkin Garden Broth | Vegetable drinks | 1 | 0.36 | Craft: Pumpkin Garden Broth |
| `pumpkin_pressed_drink` | Pumpkin Garden Drink | Vegetable drinks | 1 | 0.30 | Craft: Pumpkin Garden Drink |
| `pumpkin_oat_drink` | Pumpkin Savory Oat Drink | Vegetable drinks | 2 | 0.47 | Craft: Pumpkin Savory Oat Drink |
| `pumpkin_salted_broth` | Pumpkin Travel Broth | Vegetable drinks | 2 | 0.41 | Craft: Pumpkin Travel Broth |
| `quince_cordial` | Quince Camp Cordial | Fruit drinks | 2 | 0.47 | Craft: Quince Camp Cordial |
| `quince_infusion` | Quince Fruit Infusion | Fruit drinks | 1 | 0.36 | Craft: Quince Fruit Infusion |
| `quince_juice` | Quince Pressed Juice | Fruit drinks | 1 | 0.30 | Craft: Quince Pressed Juice |
| `quince_recovery_drink` | Quince Recovery Drink | Fruit drinks | 2 | 0.41 | Craft: Quince Recovery Drink |
| `radish_broth` | Radish Garden Broth | Vegetable drinks | 1 | 0.35 | Craft: Radish Garden Broth |
| `radish_pressed_drink` | Radish Garden Drink | Vegetable drinks | 1 | 0.29 | Craft: Radish Garden Drink |
| `radish_oat_drink` | Radish Savory Oat Drink | Vegetable drinks | 2 | 0.46 | Craft: Radish Savory Oat Drink |
| `radish_salted_broth` | Radish Travel Broth | Vegetable drinks | 2 | 0.40 | Craft: Radish Travel Broth |
| `raspberry_cordial` | Raspberry Camp Cordial | Fruit drinks | 2 | 0.47 | Craft: Raspberry Camp Cordial |
| `raspberry_infusion` | Raspberry Fruit Infusion | Fruit drinks | 1 | 0.36 | Craft: Raspberry Fruit Infusion |
| `raspberry_leaf_cold_brew` | Raspberry Leaf Cold Brew | Herbal drinks | 1 | 0.34 | Craft: Raspberry Leaf Cold Brew |
| `raspberry_leaf_infusion` | Raspberry Leaf Herbal Infusion | Herbal drinks | 1 | 0.28 | Craft: Raspberry Leaf Herbal Infusion |
| `raspberry_leaf_recovery_drink` | Raspberry Leaf Herbal Recovery Drink | Herbal drinks | 2 | 0.45 | Craft: Raspberry Leaf Herbal Recovery Drink |
| `raspberry_leaf_honey_brew` | Raspberry Leaf Honey Brew | Herbal drinks | 2 | 0.39 | Craft: Raspberry Leaf Honey Brew |
| `raspberry_juice` | Raspberry Pressed Juice | Fruit drinks | 1 | 0.30 | Craft: Raspberry Pressed Juice |
| `raspberry_recovery_drink` | Raspberry Recovery Drink | Fruit drinks | 2 | 0.41 | Craft: Raspberry Recovery Drink |
| `rosehip_cold_brew` | Rosehip Cold Brew | Herbal drinks | 1 | 0.34 | Craft: Rosehip Cold Brew |
| `rosehip_infusion` | Rosehip Herbal Infusion | Herbal drinks | 1 | 0.28 | Craft: Rosehip Herbal Infusion |
| `rosehip_recovery_drink` | Rosehip Herbal Recovery Drink | Herbal drinks | 2 | 0.45 | Craft: Rosehip Herbal Recovery Drink |
| `rosehip_honey_brew` | Rosehip Honey Brew | Herbal drinks | 2 | 0.39 | Craft: Rosehip Honey Brew |
| `rosemary_cold_brew` | Rosemary Cold Brew | Herbal drinks | 1 | 0.36 | Craft: Rosemary Cold Brew |
| `rosemary_infusion` | Rosemary Herbal Infusion | Herbal drinks | 1 | 0.30 | Craft: Rosemary Herbal Infusion |
| `rosemary_recovery_drink` | Rosemary Herbal Recovery Drink | Herbal drinks | 2 | 0.47 | Craft: Rosemary Herbal Recovery Drink |
| `rosemary_honey_brew` | Rosemary Honey Brew | Herbal drinks | 2 | 0.41 | Craft: Rosemary Honey Brew |
| `rutabaga_broth` | Rutabaga Garden Broth | Vegetable drinks | 1 | 0.36 | Craft: Rutabaga Garden Broth |
| `rutabaga_pressed_drink` | Rutabaga Garden Drink | Vegetable drinks | 1 | 0.30 | Craft: Rutabaga Garden Drink |
| `rutabaga_oat_drink` | Rutabaga Savory Oat Drink | Vegetable drinks | 2 | 0.47 | Craft: Rutabaga Savory Oat Drink |
| `rutabaga_salted_broth` | Rutabaga Travel Broth | Vegetable drinks | 2 | 0.41 | Craft: Rutabaga Travel Broth |
| `sage_cold_brew` | Sage Cold Brew | Herbal drinks | 1 | 0.35 | Craft: Sage Cold Brew |
| `sage_infusion` | Sage Herbal Infusion | Herbal drinks | 1 | 0.29 | Craft: Sage Herbal Infusion |
| `sage_recovery_drink` | Sage Herbal Recovery Drink | Herbal drinks | 2 | 0.46 | Craft: Sage Herbal Recovery Drink |
| `sage_honey_brew` | Sage Honey Brew | Herbal drinks | 2 | 0.40 | Craft: Sage Honey Brew |
| `shallot_broth` | Shallot Garden Broth | Vegetable drinks | 1 | 0.34 | Craft: Shallot Garden Broth |
| `shallot_pressed_drink` | Shallot Garden Drink | Vegetable drinks | 1 | 0.28 | Craft: Shallot Garden Drink |
| `shallot_oat_drink` | Shallot Savory Oat Drink | Vegetable drinks | 2 | 0.45 | Craft: Shallot Savory Oat Drink |
| `shallot_salted_broth` | Shallot Travel Broth | Vegetable drinks | 2 | 0.39 | Craft: Shallot Travel Broth |
| `milk` | Shelf milk | drinks | 0 | 0.50 | Loot: house |
| `spinach_broth` | Spinach Garden Broth | Vegetable drinks | 1 | 0.34 | Craft: Spinach Garden Broth |
| `spinach_pressed_drink` | Spinach Garden Drink | Vegetable drinks | 1 | 0.28 | Craft: Spinach Garden Drink |
| `spinach_oat_drink` | Spinach Savory Oat Drink | Vegetable drinks | 2 | 0.45 | Craft: Spinach Savory Oat Drink |
| `spinach_salted_broth` | Spinach Travel Broth | Vegetable drinks | 2 | 0.39 | Craft: Spinach Travel Broth |
| `sports_drink` | Sports drink | drinks | 0 | 0.50 | Loot: grocery, market, pharmacy |
| `squash_broth` | Squash Garden Broth | Vegetable drinks | 1 | 0.34 | Craft: Squash Garden Broth |
| `squash_pressed_drink` | Squash Garden Drink | Vegetable drinks | 1 | 0.28 | Craft: Squash Garden Drink |
| `squash_oat_drink` | Squash Savory Oat Drink | Vegetable drinks | 2 | 0.45 | Craft: Squash Savory Oat Drink |
| `squash_salted_broth` | Squash Travel Broth | Vegetable drinks | 2 | 0.39 | Craft: Squash Travel Broth |
| `strawberry_cordial` | Strawberry Camp Cordial | Fruit drinks | 2 | 0.45 | Craft: Strawberry Camp Cordial |
| `strawberry_infusion` | Strawberry Fruit Infusion | Fruit drinks | 1 | 0.34 | Craft: Strawberry Fruit Infusion |
| `strawberry_juice` | Strawberry Pressed Juice | Fruit drinks | 1 | 0.28 | Craft: Strawberry Pressed Juice |
| `strawberry_recovery_drink` | Strawberry Recovery Drink | Fruit drinks | 2 | 0.39 | Craft: Strawberry Recovery Drink |
| `sweet_potato_broth` | Sweet Potato Garden Broth | Vegetable drinks | 1 | 0.34 | Craft: Sweet Potato Garden Broth |
| `sweet_potato_pressed_drink` | Sweet Potato Garden Drink | Vegetable drinks | 1 | 0.28 | Craft: Sweet Potato Garden Drink |
| `sweet_potato_oat_drink` | Sweet Potato Savory Oat Drink | Vegetable drinks | 2 | 0.45 | Craft: Sweet Potato Savory Oat Drink |
| `sweet_potato_salted_broth` | Sweet Potato Travel Broth | Vegetable drinks | 2 | 0.39 | Craft: Sweet Potato Travel Broth |
| `tangerine_cordial` | Tangerine Camp Cordial | Fruit drinks | 2 | 0.47 | Craft: Tangerine Camp Cordial |
| `tangerine_infusion` | Tangerine Fruit Infusion | Fruit drinks | 1 | 0.36 | Craft: Tangerine Fruit Infusion |
| `tangerine_juice` | Tangerine Pressed Juice | Fruit drinks | 1 | 0.30 | Craft: Tangerine Pressed Juice |
| `tangerine_recovery_drink` | Tangerine Recovery Drink | Fruit drinks | 2 | 0.41 | Craft: Tangerine Recovery Drink |
| `thyme_cold_brew` | Thyme Cold Brew | Herbal drinks | 1 | 0.34 | Craft: Thyme Cold Brew |
| `thyme_infusion` | Thyme Herbal Infusion | Herbal drinks | 1 | 0.28 | Craft: Thyme Herbal Infusion |
| `thyme_recovery_drink` | Thyme Herbal Recovery Drink | Herbal drinks | 2 | 0.45 | Craft: Thyme Herbal Recovery Drink |
| `thyme_honey_brew` | Thyme Honey Brew | Herbal drinks | 2 | 0.39 | Craft: Thyme Honey Brew |
| `turmeric_piece_cold_brew` | Turmeric Piece Cold Brew | Herbal drinks | 1 | 0.36 | Craft: Turmeric Piece Cold Brew |
| `turmeric_piece_infusion` | Turmeric Piece Herbal Infusion | Herbal drinks | 1 | 0.30 | Craft: Turmeric Piece Herbal Infusion |
| `turmeric_piece_recovery_drink` | Turmeric Piece Herbal Recovery Drink | Herbal drinks | 2 | 0.47 | Craft: Turmeric Piece Herbal Recovery Drink |
| `turmeric_piece_honey_brew` | Turmeric Piece Honey Brew | Herbal drinks | 2 | 0.41 | Craft: Turmeric Piece Honey Brew |
| `turnip_broth` | Turnip Garden Broth | Vegetable drinks | 1 | 0.34 | Craft: Turnip Garden Broth |
| `turnip_pressed_drink` | Turnip Garden Drink | Vegetable drinks | 1 | 0.28 | Craft: Turnip Garden Drink |
| `turnip_oat_drink` | Turnip Savory Oat Drink | Vegetable drinks | 2 | 0.45 | Craft: Turnip Savory Oat Drink |
| `turnip_salted_broth` | Turnip Travel Broth | Vegetable drinks | 2 | 0.39 | Craft: Turnip Travel Broth |
| `dirty_water` | Untreated water | drinks | 0 | 0.50 | Loot: cabin, camp, forest, ranger, river |
| `zucchini_broth` | Zucchini Garden Broth | Vegetable drinks | 1 | 0.35 | Craft: Zucchini Garden Broth |
| `zucchini_pressed_drink` | Zucchini Garden Drink | Vegetable drinks | 1 | 0.29 | Craft: Zucchini Garden Drink |
| `zucchini_oat_drink` | Zucchini Savory Oat Drink | Vegetable drinks | 2 | 0.46 | Craft: Zucchini Savory Oat Drink |
| `zucchini_salted_broth` | Zucchini Travel Broth | Vegetable drinks | 2 | 0.40 | Craft: Zucchini Travel Broth |

## Electronics

| Stable ID | Item | Family | Tier | kg | Obtain |
| --- | --- | --- | ---: | ---: | --- |
| `battery_cell` | Battery cell | electronics | 0 | 0.08 | Loot: depot, industrial, radio, urban, warehouse, workshop |
| `capacitor` | Capacitor bundle | electronics | 0 | 0.04 | Loot: depot, industrial, radio, urban, warehouse, workshop |
| `circuit_board` | Circuit board | electronics | 0 | 0.08 | Loot: depot, industrial, radio, urban, warehouse, workshop |
| `flashlight` | Flashlight | electronics | 0 | 0.20 | Loot: house, suburban, urban |
| `hand_radio` | Handheld radio | electronics | 0 | 0.30 | Loot: depot, garage, industrial, police, radio, urban, warehouse, workshop |
| `headlamp` | Headlamp | electronics | 0 | 0.12 | Loot: camp, ranger |
| `solar_panel` | Portable solar panel | electronics | 0 | 2.50 | Loot: depot, industrial, radio, warehouse, workshop |
| `power_bank` | Power bank | electronics | 0 | 0.20 | Loot: depot, industrial, radio, warehouse, workshop |
| `resistor` | Resistor bundle | electronics | 0 | 0.02 | Loot: depot, industrial, radio, urban, warehouse, workshop |
| `electric_motor` | Small electric motor | electronics | 0 | 0.55 | Loot: depot, garage, industrial, radio, warehouse, workshop |
| `transistor` | Transistor bundle | electronics | 0 | 0.02 | Loot: depot, industrial, radio, urban, warehouse, workshop |
| `car_battery` | Vehicle battery | electronics | 0 | 5.50 | Loot: depot, fuel, garage, industrial, radio, warehouse, workshop |

## Firearms

| Stable ID | Item | Family | Tier | kg | Obtain |
| --- | --- | --- | ---: | ---: | --- |
| `breakwater_breach_shotgun` | Breakwater Breach Shotgun | Receiver ranged designs | 3 | 4.15 | Craft: Assemble Breakwater Breach Shotgun |
| `breakwater_courier_pistol` | Breakwater Courier Pistol | Receiver ranged designs | 2 | 0.97 | Craft: Assemble Breakwater Courier Pistol |
| `breakwater_heavy_marksman` | Breakwater Heavy Marksman | Receiver ranged designs | 5 | 4.94 | Craft: Assemble Breakwater Heavy Marksman |
| `breakwater_patrol_rifle` | Breakwater Patrol Rifle | Receiver ranged designs | 3 | 3.38 | Craft: Assemble Breakwater Patrol Rifle |
| `breakwater_quiet_bolt_launcher` | Breakwater Quiet Bolt Launcher | Receiver ranged designs | 3 | 2.83 | Craft: Assemble Breakwater Quiet Bolt Launcher |
| `breakwater_ranger_rifle` | Breakwater Ranger Rifle | Receiver ranged designs | 4 | 3.85 | Craft: Assemble Breakwater Ranger Rifle |
| `breakwater_street_carbine` | Breakwater Street Carbine | Receiver ranged designs | 3 | 2.62 | Craft: Assemble Breakwater Street Carbine |
| `breakwater_watch_revolver` | Breakwater Watch Revolver | Receiver ranged designs | 2 | 1.22 | Craft: Assemble Breakwater Watch Revolver |
| `cinder_breach_shotgun` | Cinder Breach Shotgun | Receiver ranged designs | 3 | 3.60 | Craft: Assemble Cinder Breach Shotgun |
| `cinder_courier_pistol` | Cinder Courier Pistol | Receiver ranged designs | 2 | 0.84 | Craft: Assemble Cinder Courier Pistol |
| `cinder_heavy_marksman` | Cinder Heavy Marksman | Receiver ranged designs | 5 | 4.28 | Craft: Assemble Cinder Heavy Marksman |
| `cinder_patrol_rifle` | Cinder Patrol Rifle | Receiver ranged designs | 3 | 2.93 | Craft: Assemble Cinder Patrol Rifle |
| `cinder_quiet_bolt_launcher` | Cinder Quiet Bolt Launcher | Receiver ranged designs | 3 | 2.45 | Craft: Assemble Cinder Quiet Bolt Launcher |
| `cinder_ranger_rifle` | Cinder Ranger Rifle | Receiver ranged designs | 4 | 3.34 | Craft: Assemble Cinder Ranger Rifle |
| `cinder_street_carbine` | Cinder Street Carbine | Receiver ranged designs | 3 | 2.27 | Craft: Assemble Cinder Street Carbine |
| `cinder_watch_revolver` | Cinder Watch Revolver | Receiver ranged designs | 2 | 1.06 | Craft: Assemble Cinder Watch Revolver |
| `smg` | Compact automatic | firearms | 0 | 2.35 | Loot: gunshop |
| `doublebarrel` | Double-barrel shotgun | firearms | 0 | 3.10 | Loot: gunshop |
| `crossbow` | Field crossbow | firearms | 0 | 2.20 | Loot: gunshop |
| `harbor_breach_shotgun` | Harbor Breach Shotgun | Receiver ranged designs | 3 | 3.18 | Craft: Assemble Harbor Breach Shotgun |
| `harbor_courier_pistol` | Harbor Courier Pistol | Receiver ranged designs | 2 | 0.75 | Loot: gunshop, police |
| `harbor_heavy_marksman` | Harbor Heavy Marksman | Receiver ranged designs | 5 | 3.79 | Craft: Assemble Harbor Heavy Marksman |
| `harbor_patrol_rifle` | Harbor Patrol Rifle | Receiver ranged designs | 3 | 2.59 | Craft: Assemble Harbor Patrol Rifle |
| `harbor_quiet_bolt_launcher` | Harbor Quiet Bolt Launcher | Receiver ranged designs | 3 | 2.17 | Craft: Assemble Harbor Quiet Bolt Launcher |
| `harbor_ranger_rifle` | Harbor Ranger Rifle | Receiver ranged designs | 4 | 2.95 | Craft: Assemble Harbor Ranger Rifle |
| `harbor_street_carbine` | Harbor Street Carbine | Receiver ranged designs | 3 | 2.01 | Craft: Assemble Harbor Street Carbine |
| `harbor_watch_revolver` | Harbor Watch Revolver | Receiver ranged designs | 2 | 0.94 | Loot: gunshop, police |
| `highland_breach_shotgun` | Highland Breach Shotgun | Receiver ranged designs | 3 | 4.05 | Craft: Assemble Highland Breach Shotgun |
| `highland_courier_pistol` | Highland Courier Pistol | Receiver ranged designs | 2 | 0.95 | Craft: Assemble Highland Courier Pistol |
| `highland_heavy_marksman` | Highland Heavy Marksman | Receiver ranged designs | 5 | 4.82 | Craft: Assemble Highland Heavy Marksman |
| `highland_patrol_rifle` | Highland Patrol Rifle | Receiver ranged designs | 3 | 3.30 | Craft: Assemble Highland Patrol Rifle |
| `highland_quiet_bolt_launcher` | Highland Quiet Bolt Launcher | Receiver ranged designs | 3 | 2.76 | Craft: Assemble Highland Quiet Bolt Launcher |
| `highland_ranger_rifle` | Highland Ranger Rifle | Receiver ranged designs | 4 | 3.76 | Craft: Assemble Highland Ranger Rifle |
| `highland_street_carbine` | Highland Street Carbine | Receiver ranged designs | 3 | 2.55 | Craft: Assemble Highland Street Carbine |
| `highland_watch_revolver` | Highland Watch Revolver | Receiver ranged designs | 2 | 1.19 | Craft: Assemble Highland Watch Revolver |
| `hunting_bow` | Hunting bow | firearms | 0 | 0.95 | Loot: camp, forest, gunshop, ranger |
| `hunting_rifle` | Hunting rifle | firearms | 0 | 3.20 | Loot: cabin, gunshop, police |
| `lanternworks_breach_shotgun` | Lanternworks Breach Shotgun | Receiver ranged designs | 3 | 2.94 | Craft: Assemble Lanternworks Breach Shotgun |
| `lanternworks_courier_pistol` | Lanternworks Courier Pistol | Receiver ranged designs | 2 | 0.69 | Craft: Assemble Lanternworks Courier Pistol |
| `lanternworks_heavy_marksman` | Lanternworks Heavy Marksman | Receiver ranged designs | 5 | 3.50 | Craft: Assemble Lanternworks Heavy Marksman |
| `lanternworks_patrol_rifle` | Lanternworks Patrol Rifle | Receiver ranged designs | 3 | 2.40 | Craft: Assemble Lanternworks Patrol Rifle |
| `lanternworks_quiet_bolt_launcher` | Lanternworks Quiet Bolt Launcher | Receiver ranged designs | 3 | 2.01 | Craft: Assemble Lanternworks Quiet Bolt Launcher |
| `lanternworks_ranger_rifle` | Lanternworks Ranger Rifle | Receiver ranged designs | 4 | 2.73 | Craft: Assemble Lanternworks Ranger Rifle |
| `lanternworks_street_carbine` | Lanternworks Street Carbine | Receiver ranged designs | 3 | 1.85 | Craft: Assemble Lanternworks Street Carbine |
| `lanternworks_watch_revolver` | Lanternworks Watch Revolver | Receiver ranged designs | 2 | 0.87 | Craft: Assemble Lanternworks Watch Revolver |
| `lever_rifle` | Lever-action rifle | firearms | 0 | 3.30 | Loot: gunshop |
| `orchard_breach_shotgun` | Orchard Breach Shotgun | Receiver ranged designs | 3 | 3.11 | Craft: Assemble Orchard Breach Shotgun |
| `orchard_courier_pistol` | Orchard Courier Pistol | Receiver ranged designs | 2 | 0.73 | Craft: Assemble Orchard Courier Pistol |
| `orchard_heavy_marksman` | Orchard Heavy Marksman | Receiver ranged designs | 5 | 3.71 | Craft: Assemble Orchard Heavy Marksman |
| `orchard_patrol_rifle` | Orchard Patrol Rifle | Receiver ranged designs | 3 | 2.54 | Craft: Assemble Orchard Patrol Rifle |
| `orchard_quiet_bolt_launcher` | Orchard Quiet Bolt Launcher | Receiver ranged designs | 3 | 2.12 | Craft: Assemble Orchard Quiet Bolt Launcher |
| `orchard_ranger_rifle` | Orchard Ranger Rifle | Receiver ranged designs | 4 | 2.89 | Craft: Assemble Orchard Ranger Rifle |
| `orchard_street_carbine` | Orchard Street Carbine | Receiver ranged designs | 3 | 1.96 | Craft: Assemble Orchard Street Carbine |
| `orchard_watch_revolver` | Orchard Watch Revolver | Receiver ranged designs | 2 | 0.92 | Craft: Assemble Orchard Watch Revolver |
| `outpost_breach_shotgun` | Outpost Breach Shotgun | Receiver ranged designs | 3 | 3.74 | Craft: Assemble Outpost Breach Shotgun |
| `outpost_courier_pistol` | Outpost Courier Pistol | Receiver ranged designs | 2 | 0.87 | Loot: gunshop, police |
| `outpost_heavy_marksman` | Outpost Heavy Marksman | Receiver ranged designs | 5 | 4.45 | Craft: Assemble Outpost Heavy Marksman |
| `outpost_patrol_rifle` | Outpost Patrol Rifle | Receiver ranged designs | 3 | 3.05 | Craft: Assemble Outpost Patrol Rifle |
| `outpost_quiet_bolt_launcher` | Outpost Quiet Bolt Launcher | Receiver ranged designs | 3 | 2.55 | Craft: Assemble Outpost Quiet Bolt Launcher |
| `outpost_ranger_rifle` | Outpost Ranger Rifle | Receiver ranged designs | 4 | 3.47 | Craft: Assemble Outpost Ranger Rifle |
| `outpost_street_carbine` | Outpost Street Carbine | Receiver ranged designs | 3 | 2.35 | Craft: Assemble Outpost Street Carbine |
| `outpost_watch_revolver` | Outpost Watch Revolver | Receiver ranged designs | 2 | 1.10 | Loot: gunshop, police |
| `bolt_rifle` | Precision rifle | firearms | 0 | 4.10 | Loot: gunshop |
| `shotgun` | Pump shotgun | firearms | 0 | 3.40 | Loot: gunshop |
| `revolver` | Revolver | firearms | 0 | 1.05 | Loot: gunshop, police |
| `ridgeway_breach_shotgun` | Ridgeway Breach Shotgun | Receiver ranged designs | 3 | 4.29 | Craft: Assemble Ridgeway Breach Shotgun |
| `ridgeway_courier_pistol` | Ridgeway Courier Pistol | Receiver ranged designs | 2 | 1.00 | Craft: Assemble Ridgeway Courier Pistol |
| `ridgeway_heavy_marksman` | Ridgeway Heavy Marksman | Receiver ranged designs | 5 | 5.11 | Craft: Assemble Ridgeway Heavy Marksman |
| `ridgeway_patrol_rifle` | Ridgeway Patrol Rifle | Receiver ranged designs | 3 | 3.50 | Craft: Assemble Ridgeway Patrol Rifle |
| `ridgeway_quiet_bolt_launcher` | Ridgeway Quiet Bolt Launcher | Receiver ranged designs | 3 | 2.93 | Craft: Assemble Ridgeway Quiet Bolt Launcher |
| `ridgeway_ranger_rifle` | Ridgeway Ranger Rifle | Receiver ranged designs | 4 | 3.98 | Craft: Assemble Ridgeway Ranger Rifle |
| `ridgeway_street_carbine` | Ridgeway Street Carbine | Receiver ranged designs | 3 | 2.70 | Craft: Assemble Ridgeway Street Carbine |
| `ridgeway_watch_revolver` | Ridgeway Watch Revolver | Receiver ranged designs | 2 | 1.26 | Craft: Assemble Ridgeway Watch Revolver |
| `pistol` | Service pistol | firearms | 0 | 0.85 | Loot: gunshop, police |
| `switchyard_breach_shotgun` | Switchyard Breach Shotgun | Receiver ranged designs | 3 | 3.91 | Craft: Assemble Switchyard Breach Shotgun |
| `switchyard_courier_pistol` | Switchyard Courier Pistol | Receiver ranged designs | 2 | 0.92 | Craft: Assemble Switchyard Courier Pistol |
| `switchyard_heavy_marksman` | Switchyard Heavy Marksman | Receiver ranged designs | 5 | 4.66 | Craft: Assemble Switchyard Heavy Marksman |
| `switchyard_patrol_rifle` | Switchyard Patrol Rifle | Receiver ranged designs | 3 | 3.19 | Craft: Assemble Switchyard Patrol Rifle |
| `switchyard_quiet_bolt_launcher` | Switchyard Quiet Bolt Launcher | Receiver ranged designs | 3 | 2.67 | Craft: Assemble Switchyard Quiet Bolt Launcher |
| `switchyard_ranger_rifle` | Switchyard Ranger Rifle | Receiver ranged designs | 4 | 3.63 | Craft: Assemble Switchyard Ranger Rifle |
| `switchyard_street_carbine` | Switchyard Street Carbine | Receiver ranged designs | 3 | 2.46 | Craft: Assemble Switchyard Street Carbine |
| `switchyard_watch_revolver` | Switchyard Watch Revolver | Receiver ranged designs | 2 | 1.15 | Craft: Assemble Switchyard Watch Revolver |
| `carbine` | Utility carbine | firearms | 0 | 2.60 | Loot: gunshop |
| `wayfarer_breach_shotgun` | Wayfarer Breach Shotgun | Receiver ranged designs | 3 | 2.70 | Craft: Assemble Wayfarer Breach Shotgun |
| `wayfarer_courier_pistol` | Wayfarer Courier Pistol | Receiver ranged designs | 2 | 0.63 | Loot: gunshop, police |
| `wayfarer_heavy_marksman` | Wayfarer Heavy Marksman | Receiver ranged designs | 5 | 3.21 | Craft: Assemble Wayfarer Heavy Marksman |
| `wayfarer_patrol_rifle` | Wayfarer Patrol Rifle | Receiver ranged designs | 3 | 2.20 | Craft: Assemble Wayfarer Patrol Rifle |
| `wayfarer_quiet_bolt_launcher` | Wayfarer Quiet Bolt Launcher | Receiver ranged designs | 3 | 1.84 | Craft: Assemble Wayfarer Quiet Bolt Launcher |
| `wayfarer_ranger_rifle` | Wayfarer Ranger Rifle | Receiver ranged designs | 4 | 2.50 | Craft: Assemble Wayfarer Ranger Rifle |
| `wayfarer_street_carbine` | Wayfarer Street Carbine | Receiver ranged designs | 3 | 1.70 | Craft: Assemble Wayfarer Street Carbine |
| `wayfarer_watch_revolver` | Wayfarer Watch Revolver | Receiver ranged designs | 2 | 0.80 | Loot: gunshop, police |

## Food

| Stable ID | Item | Family | Tier | kg | Obtain |
| --- | --- | --- | ---: | ---: | --- |
| `amaranth` | Amaranth | Grain and pulse food | 0 | 0.28 | Loot: depot, farm, grocery, market, restaurant, warehouse |
| `amaranth_bean_bowl` | Amaranth Bean Bowl | Prepared grain meals | 1 | 0.61 | Craft: Amaranth Bean Bowl |
| `amaranth_broth_dumplings` | Amaranth Broth Dumplings | Prepared grain meals | 2 | 0.59 | Craft: Amaranth Broth Dumplings |
| `amaranth_flatbread` | Amaranth Camp Flatbread | Prepared grain meals | 1 | 0.31 | Craft: Amaranth Camp Flatbread |
| `amaranth_porridge` | Amaranth Camp Porridge | Prepared grain meals | 1 | 0.56 | Craft: Amaranth Camp Porridge |
| `amaranth_crackers` | Amaranth Field Crackers | Prepared grain meals | 1 | 0.15 | Craft: Amaranth Field Crackers |
| `amaranth_honey_cluster` | Amaranth Honey Cluster | Prepared grain meals | 1 | 0.20 | Craft: Amaranth Honey Cluster |
| `amaranth_travel_biscuit` | Amaranth Travel Biscuit | Prepared grain meals | 2 | 0.22 | Craft: Amaranth Travel Biscuit |
| `apple` | Apple | food | 0 | 0.16 | Loot: farm, grocery, market |
| `apricot` | Apricot | Orchard and berry food | 0 | 0.14 | Loot: farm, grocery, house, market, restaurant |
| `apricot_compote` | Apricot Camp Compote | Prepared fruit meals | 1 | 0.44 | Craft: Apricot Camp Compote |
| `apricot_dried_slices` | Apricot Dried Slices | Prepared fruit meals | 1 | 0.12 | Craft: Apricot Dried Slices |
| `apricot_fruit_leather` | Apricot Fruit Leather | Prepared fruit meals | 1 | 0.14 | Craft: Apricot Fruit Leather |
| `apricot_grain_bowl` | Apricot Grain Bowl | Prepared fruit meals | 2 | 0.50 | Craft: Apricot Grain Bowl |
| `apricot_preserve` | Apricot Pantry Preserve | Prepared fruit meals | 1 | 0.28 | Craft: Apricot Pantry Preserve |
| `apricot_salad` | Apricot Salad | Prepared fruit meals | 1 | 0.36 | Craft: Apricot Salad |
| `apricot_trail_mix` | Apricot Trail Mix | Prepared fruit meals | 2 | 0.23 | Craft: Apricot Trail Mix |
| `baked_potato` | Baked potato | food | 0 | 0.22 | Craft: Bake potatoes |
| `banana` | Banana | food | 0 | 0.15 | Loot: grocery, market |
| `barley` | Barley | Grain and pulse food | 0 | 0.23 | Loot: depot, farm, grocery, market, restaurant, warehouse |
| `barley_bean_bowl` | Barley Bean Bowl | Prepared grain meals | 1 | 0.61 | Craft: Barley Bean Bowl |
| `barley_broth_dumplings` | Barley Broth Dumplings | Prepared grain meals | 2 | 0.59 | Craft: Barley Broth Dumplings |
| `barley_flatbread` | Barley Camp Flatbread | Prepared grain meals | 1 | 0.31 | Craft: Barley Camp Flatbread |
| `barley_porridge` | Barley Camp Porridge | Prepared grain meals | 1 | 0.56 | Craft: Barley Camp Porridge |
| `barley_crackers` | Barley Field Crackers | Prepared grain meals | 1 | 0.15 | Craft: Barley Field Crackers |
| `barley_honey_cluster` | Barley Honey Cluster | Prepared grain meals | 1 | 0.20 | Craft: Barley Honey Cluster |
| `barley_travel_biscuit` | Barley Travel Biscuit | Prepared grain meals | 2 | 0.22 | Craft: Barley Travel Biscuit |
| `beet` | Beet | Garden food | 0 | 0.20 | Loot: farm, grocery, market, restaurant, suburban |
| `beet_roast` | Beet Camp Roast | Prepared vegetable meals | 1 | 0.34 | Craft: Beet Camp Roast |
| `beet_camp_soup` | Beet Camp Soup | Prepared vegetable meals | 1 | 0.61 | Craft: Beet Camp Soup |
| `beet_flatbread` | Beet Garden Flatbread | Prepared vegetable meals | 2 | 0.35 | Craft: Beet Garden Flatbread |
| `beet_pickle` | Beet Salted Pickle | Prepared vegetable meals | 1 | 0.27 | Craft: Beet Salted Pickle |
| `beet_porridge` | Beet Savory Porridge | Prepared vegetable meals | 1 | 0.57 | Craft: Beet Savory Porridge |
| `beet_supper_packet` | Beet Supper Packet | Prepared vegetable meals | 2 | 0.45 | Craft: Beet Supper Packet |
| `beet_crisp` | Beet Vegetable Crisp | Prepared vegetable meals | 1 | 0.16 | Craft: Beet Vegetable Crisp |
| `bell_pepper` | Bell Pepper | Garden food | 0 | 0.25 | Loot: farm, grocery, market, restaurant, suburban |
| `bell_pepper_roast` | Bell Pepper Camp Roast | Prepared vegetable meals | 1 | 0.34 | Craft: Bell Pepper Camp Roast |
| `bell_pepper_camp_soup` | Bell Pepper Camp Soup | Prepared vegetable meals | 1 | 0.61 | Craft: Bell Pepper Camp Soup |
| `bell_pepper_flatbread` | Bell Pepper Garden Flatbread | Prepared vegetable meals | 2 | 0.35 | Craft: Bell Pepper Garden Flatbread |
| `bell_pepper_pickle` | Bell Pepper Salted Pickle | Prepared vegetable meals | 1 | 0.27 | Craft: Bell Pepper Salted Pickle |
| `bell_pepper_porridge` | Bell Pepper Savory Porridge | Prepared vegetable meals | 1 | 0.57 | Craft: Bell Pepper Savory Porridge |
| `bell_pepper_supper_packet` | Bell Pepper Supper Packet | Prepared vegetable meals | 2 | 0.45 | Craft: Bell Pepper Supper Packet |
| `bell_pepper_crisp` | Bell Pepper Vegetable Crisp | Prepared vegetable meals | 1 | 0.16 | Craft: Bell Pepper Vegetable Crisp |
| `blackberry` | Blackberry | Orchard and berry food | 0 | 0.16 | Loot: farm, grocery, house, market, restaurant |
| `blackberry_compote` | Blackberry Camp Compote | Prepared fruit meals | 1 | 0.45 | Craft: Blackberry Camp Compote |
| `blackberry_dried_slices` | Blackberry Dried Slices | Prepared fruit meals | 1 | 0.13 | Craft: Blackberry Dried Slices |
| `blackberry_fruit_leather` | Blackberry Fruit Leather | Prepared fruit meals | 1 | 0.15 | Craft: Blackberry Fruit Leather |
| `blackberry_grain_bowl` | Blackberry Grain Bowl | Prepared fruit meals | 2 | 0.51 | Craft: Blackberry Grain Bowl |
| `blackberry_preserve` | Blackberry Pantry Preserve | Prepared fruit meals | 1 | 0.29 | Craft: Blackberry Pantry Preserve |
| `blackberry_salad` | Blackberry Salad | Prepared fruit meals | 1 | 0.37 | Craft: Blackberry Salad |
| `blackberry_trail_mix` | Blackberry Trail Mix | Prepared fruit meals | 2 | 0.24 | Craft: Blackberry Trail Mix |
| `blueberry` | Blueberry | Orchard and berry food | 0 | 0.17 | Loot: farm, grocery, house, market, restaurant |
| `blueberry_compote` | Blueberry Camp Compote | Prepared fruit meals | 1 | 0.46 | Craft: Blueberry Camp Compote |
| `blueberry_dried_slices` | Blueberry Dried Slices | Prepared fruit meals | 1 | 0.14 | Craft: Blueberry Dried Slices |
| `blueberry_fruit_leather` | Blueberry Fruit Leather | Prepared fruit meals | 1 | 0.16 | Craft: Blueberry Fruit Leather |
| `blueberry_grain_bowl` | Blueberry Grain Bowl | Prepared fruit meals | 2 | 0.52 | Craft: Blueberry Grain Bowl |
| `blueberry_preserve` | Blueberry Pantry Preserve | Prepared fruit meals | 1 | 0.30 | Craft: Blueberry Pantry Preserve |
| `blueberry_salad` | Blueberry Salad | Prepared fruit meals | 1 | 0.38 | Craft: Blueberry Salad |
| `blueberry_trail_mix` | Blueberry Trail Mix | Prepared fruit meals | 2 | 0.25 | Craft: Blueberry Trail Mix |
| `bread` | Bread loaf | food | 0 | 0.40 | Loot: house, restaurant |
| `broccoli` | Broccoli | Garden food | 0 | 0.26 | Loot: farm, grocery, market, restaurant, suburban |
| `broccoli_roast` | Broccoli Camp Roast | Prepared vegetable meals | 1 | 0.32 | Craft: Broccoli Camp Roast |
| `broccoli_camp_soup` | Broccoli Camp Soup | Prepared vegetable meals | 1 | 0.59 | Craft: Broccoli Camp Soup |
| `broccoli_flatbread` | Broccoli Garden Flatbread | Prepared vegetable meals | 2 | 0.33 | Craft: Broccoli Garden Flatbread |
| `broccoli_pickle` | Broccoli Salted Pickle | Prepared vegetable meals | 1 | 0.25 | Craft: Broccoli Salted Pickle |
| `broccoli_porridge` | Broccoli Savory Porridge | Prepared vegetable meals | 1 | 0.55 | Craft: Broccoli Savory Porridge |
| `broccoli_supper_packet` | Broccoli Supper Packet | Prepared vegetable meals | 2 | 0.43 | Craft: Broccoli Supper Packet |
| `broccoli_crisp` | Broccoli Vegetable Crisp | Prepared vegetable meals | 1 | 0.14 | Craft: Broccoli Vegetable Crisp |
| `brussels_sprout` | Brussels Sprout | Garden food | 0 | 0.22 | Loot: farm, grocery, market, restaurant, suburban |
| `brussels_sprout_roast` | Brussels Sprout Camp Roast | Prepared vegetable meals | 1 | 0.34 | Craft: Brussels Sprout Camp Roast |
| `brussels_sprout_camp_soup` | Brussels Sprout Camp Soup | Prepared vegetable meals | 1 | 0.61 | Craft: Brussels Sprout Camp Soup |
| `brussels_sprout_flatbread` | Brussels Sprout Garden Flatbread | Prepared vegetable meals | 2 | 0.35 | Craft: Brussels Sprout Garden Flatbread |
| `brussels_sprout_pickle` | Brussels Sprout Salted Pickle | Prepared vegetable meals | 1 | 0.27 | Craft: Brussels Sprout Salted Pickle |
| `brussels_sprout_porridge` | Brussels Sprout Savory Porridge | Prepared vegetable meals | 1 | 0.57 | Craft: Brussels Sprout Savory Porridge |
| `brussels_sprout_supper_packet` | Brussels Sprout Supper Packet | Prepared vegetable meals | 2 | 0.45 | Craft: Brussels Sprout Supper Packet |
| `brussels_sprout_crisp` | Brussels Sprout Vegetable Crisp | Prepared vegetable meals | 1 | 0.16 | Craft: Brussels Sprout Vegetable Crisp |
| `buckwheat` | Buckwheat | Grain and pulse food | 0 | 0.28 | Loot: depot, farm, grocery, market, restaurant, warehouse |
| `buckwheat_bean_bowl` | Buckwheat Bean Bowl | Prepared grain meals | 1 | 0.64 | Craft: Buckwheat Bean Bowl |
| `buckwheat_broth_dumplings` | Buckwheat Broth Dumplings | Prepared grain meals | 2 | 0.62 | Craft: Buckwheat Broth Dumplings |
| `buckwheat_flatbread` | Buckwheat Camp Flatbread | Prepared grain meals | 1 | 0.34 | Craft: Buckwheat Camp Flatbread |
| `buckwheat_porridge` | Buckwheat Camp Porridge | Prepared grain meals | 1 | 0.59 | Craft: Buckwheat Camp Porridge |
| `buckwheat_crackers` | Buckwheat Field Crackers | Prepared grain meals | 1 | 0.18 | Craft: Buckwheat Field Crackers |
| `buckwheat_honey_cluster` | Buckwheat Honey Cluster | Prepared grain meals | 1 | 0.23 | Craft: Buckwheat Honey Cluster |
| `buckwheat_travel_biscuit` | Buckwheat Travel Biscuit | Prepared grain meals | 2 | 0.25 | Craft: Buckwheat Travel Biscuit |
| `bulgur` | Bulgur | Grain and pulse food | 0 | 0.29 | Loot: depot, farm, grocery, market, restaurant, warehouse |
| `bulgur_bean_bowl` | Bulgur Bean Bowl | Prepared grain meals | 1 | 0.62 | Craft: Bulgur Bean Bowl |
| `bulgur_broth_dumplings` | Bulgur Broth Dumplings | Prepared grain meals | 2 | 0.60 | Craft: Bulgur Broth Dumplings |
| `bulgur_flatbread` | Bulgur Camp Flatbread | Prepared grain meals | 1 | 0.32 | Craft: Bulgur Camp Flatbread |
| `bulgur_porridge` | Bulgur Camp Porridge | Prepared grain meals | 1 | 0.57 | Craft: Bulgur Camp Porridge |
| `bulgur_crackers` | Bulgur Field Crackers | Prepared grain meals | 1 | 0.16 | Craft: Bulgur Field Crackers |
| `bulgur_honey_cluster` | Bulgur Honey Cluster | Prepared grain meals | 1 | 0.21 | Craft: Bulgur Honey Cluster |
| `bulgur_travel_biscuit` | Bulgur Travel Biscuit | Prepared grain meals | 2 | 0.23 | Craft: Bulgur Travel Biscuit |
| `cabbage` | Cabbage | Garden food | 0 | 0.26 | Loot: farm, grocery, market, restaurant, suburban |
| `cabbage_roast` | Cabbage Camp Roast | Prepared vegetable meals | 1 | 0.31 | Craft: Cabbage Camp Roast |
| `cabbage_camp_soup` | Cabbage Camp Soup | Prepared vegetable meals | 1 | 0.58 | Craft: Cabbage Camp Soup |
| `cabbage_flatbread` | Cabbage Garden Flatbread | Prepared vegetable meals | 2 | 0.32 | Craft: Cabbage Garden Flatbread |
| `cabbage_pickle` | Cabbage Salted Pickle | Prepared vegetable meals | 1 | 0.24 | Craft: Cabbage Salted Pickle |
| `cabbage_porridge` | Cabbage Savory Porridge | Prepared vegetable meals | 1 | 0.54 | Craft: Cabbage Savory Porridge |
| `cabbage_supper_packet` | Cabbage Supper Packet | Prepared vegetable meals | 2 | 0.42 | Craft: Cabbage Supper Packet |
| `cabbage_crisp` | Cabbage Vegetable Crisp | Prepared vegetable meals | 1 | 0.13 | Craft: Cabbage Vegetable Crisp |
| `porridge` | Camp porridge | food | 0 | 0.40 | Craft: Cook camp porridge |
| `canned_beans` | Canned beans | food | 0 | 0.45 | Loot: cabin, default, farm, grocery, house, market, restaurant, suburban, urban |
| `canned_corn` | Canned corn | food | 0 | 0.35 | Loot: cabin, farm, grocery, house, market, restaurant, suburban, urban |
| `canned_fish` | Canned fish | food | 0 | 0.22 | Loot: cabin, default, farm, grocery, house, market, restaurant, suburban, urban |
| `canned_peaches` | Canned peaches | food | 0 | 0.40 | Loot: cabin, default, farm, grocery, house, market, restaurant, suburban, urban |
| `canned_soup` | Canned soup | food | 0 | 0.45 | Loot: cabin, default, farm, grocery, house, market, restaurant, suburban, urban |
| `canned_stew` | Canned stew | food | 0 | 0.55 | Loot: cabin, farm, grocery, house, market, restaurant, suburban, urban |
| `carrot` | Carrot bundle | food | 0 | 0.22 | Loot: farm, restaurant |
| `cauliflower` | Cauliflower | Garden food | 0 | 0.20 | Loot: farm, grocery, market, restaurant, suburban |
| `cauliflower_roast` | Cauliflower Camp Roast | Prepared vegetable meals | 1 | 0.33 | Craft: Cauliflower Camp Roast |
| `cauliflower_camp_soup` | Cauliflower Camp Soup | Prepared vegetable meals | 1 | 0.60 | Craft: Cauliflower Camp Soup |
| `cauliflower_flatbread` | Cauliflower Garden Flatbread | Prepared vegetable meals | 2 | 0.34 | Craft: Cauliflower Garden Flatbread |
| `cauliflower_pickle` | Cauliflower Salted Pickle | Prepared vegetable meals | 1 | 0.26 | Craft: Cauliflower Salted Pickle |
| `cauliflower_porridge` | Cauliflower Savory Porridge | Prepared vegetable meals | 1 | 0.56 | Craft: Cauliflower Savory Porridge |
| `cauliflower_supper_packet` | Cauliflower Supper Packet | Prepared vegetable meals | 2 | 0.44 | Craft: Cauliflower Supper Packet |
| `cauliflower_crisp` | Cauliflower Vegetable Crisp | Prepared vegetable meals | 1 | 0.15 | Craft: Cauliflower Vegetable Crisp |
| `celeriac` | Celeriac | Garden food | 0 | 0.23 | Loot: farm, grocery, market, restaurant, suburban |
| `celeriac_roast` | Celeriac Camp Roast | Prepared vegetable meals | 1 | 0.32 | Craft: Celeriac Camp Roast |
| `celeriac_camp_soup` | Celeriac Camp Soup | Prepared vegetable meals | 1 | 0.59 | Craft: Celeriac Camp Soup |
| `celeriac_flatbread` | Celeriac Garden Flatbread | Prepared vegetable meals | 2 | 0.33 | Craft: Celeriac Garden Flatbread |
| `celeriac_pickle` | Celeriac Salted Pickle | Prepared vegetable meals | 1 | 0.25 | Craft: Celeriac Salted Pickle |
| `celeriac_porridge` | Celeriac Savory Porridge | Prepared vegetable meals | 1 | 0.55 | Craft: Celeriac Savory Porridge |
| `celeriac_supper_packet` | Celeriac Supper Packet | Prepared vegetable meals | 2 | 0.43 | Craft: Celeriac Supper Packet |
| `celeriac_crisp` | Celeriac Vegetable Crisp | Prepared vegetable meals | 1 | 0.14 | Craft: Celeriac Vegetable Crisp |
| `chard` | Chard | Garden food | 0 | 0.23 | Loot: farm, grocery, market, restaurant, suburban |
| `chard_roast` | Chard Camp Roast | Prepared vegetable meals | 1 | 0.34 | Craft: Chard Camp Roast |
| `chard_camp_soup` | Chard Camp Soup | Prepared vegetable meals | 1 | 0.61 | Craft: Chard Camp Soup |
| `chard_flatbread` | Chard Garden Flatbread | Prepared vegetable meals | 2 | 0.35 | Craft: Chard Garden Flatbread |
| `chard_pickle` | Chard Salted Pickle | Prepared vegetable meals | 1 | 0.27 | Craft: Chard Salted Pickle |
| `chard_porridge` | Chard Savory Porridge | Prepared vegetable meals | 1 | 0.57 | Craft: Chard Savory Porridge |
| `chard_supper_packet` | Chard Supper Packet | Prepared vegetable meals | 2 | 0.45 | Craft: Chard Supper Packet |
| `chard_crisp` | Chard Vegetable Crisp | Prepared vegetable meals | 1 | 0.16 | Craft: Chard Vegetable Crisp |
| `cherry` | Cherry | Orchard and berry food | 0 | 0.19 | Loot: farm, grocery, house, market, restaurant |
| `cherry_compote` | Cherry Camp Compote | Prepared fruit meals | 1 | 0.47 | Craft: Cherry Camp Compote |
| `cherry_dried_slices` | Cherry Dried Slices | Prepared fruit meals | 1 | 0.15 | Craft: Cherry Dried Slices |
| `cherry_fruit_leather` | Cherry Fruit Leather | Prepared fruit meals | 1 | 0.17 | Craft: Cherry Fruit Leather |
| `cherry_grain_bowl` | Cherry Grain Bowl | Prepared fruit meals | 2 | 0.53 | Craft: Cherry Grain Bowl |
| `cherry_preserve` | Cherry Pantry Preserve | Prepared fruit meals | 1 | 0.31 | Craft: Cherry Pantry Preserve |
| `cherry_salad` | Cherry Salad | Prepared fruit meals | 1 | 0.39 | Craft: Cherry Salad |
| `cherry_trail_mix` | Cherry Trail Mix | Prepared fruit meals | 2 | 0.26 | Craft: Cherry Trail Mix |
| `chickpea` | Chickpea | Grain and pulse food | 0 | 0.25 | Loot: depot, farm, grocery, market, restaurant, warehouse |
| `chickpea_bean_bowl` | Chickpea Bean Bowl | Prepared grain meals | 1 | 0.64 | Craft: Chickpea Bean Bowl |
| `chickpea_broth_dumplings` | Chickpea Broth Dumplings | Prepared grain meals | 2 | 0.62 | Craft: Chickpea Broth Dumplings |
| `chickpea_flatbread` | Chickpea Camp Flatbread | Prepared grain meals | 1 | 0.34 | Craft: Chickpea Camp Flatbread |
| `chickpea_porridge` | Chickpea Camp Porridge | Prepared grain meals | 1 | 0.59 | Craft: Chickpea Camp Porridge |
| `chickpea_crackers` | Chickpea Field Crackers | Prepared grain meals | 1 | 0.18 | Craft: Chickpea Field Crackers |
| `chickpea_honey_cluster` | Chickpea Honey Cluster | Prepared grain meals | 1 | 0.23 | Craft: Chickpea Honey Cluster |
| `chickpea_travel_biscuit` | Chickpea Travel Biscuit | Prepared grain meals | 2 | 0.25 | Craft: Chickpea Travel Biscuit |
| `chocolate` | Chocolate bar | food | 0 | 0.10 | Loot: grocery, market |
| `cornmeal` | Cornmeal | Grain and pulse food | 0 | 0.25 | Loot: depot, farm, grocery, market, restaurant, warehouse |
| `cornmeal_bean_bowl` | Cornmeal Bean Bowl | Prepared grain meals | 1 | 0.63 | Craft: Cornmeal Bean Bowl |
| `cornmeal_broth_dumplings` | Cornmeal Broth Dumplings | Prepared grain meals | 2 | 0.61 | Craft: Cornmeal Broth Dumplings |
| `cornmeal_flatbread` | Cornmeal Camp Flatbread | Prepared grain meals | 1 | 0.33 | Craft: Cornmeal Camp Flatbread |
| `cornmeal_porridge` | Cornmeal Camp Porridge | Prepared grain meals | 1 | 0.58 | Craft: Cornmeal Camp Porridge |
| `cornmeal_crackers` | Cornmeal Field Crackers | Prepared grain meals | 1 | 0.17 | Craft: Cornmeal Field Crackers |
| `cornmeal_honey_cluster` | Cornmeal Honey Cluster | Prepared grain meals | 1 | 0.22 | Craft: Cornmeal Honey Cluster |
| `cornmeal_travel_biscuit` | Cornmeal Travel Biscuit | Prepared grain meals | 2 | 0.24 | Craft: Cornmeal Travel Biscuit |
| `crackers` | Cracker sleeve | food | 0 | 0.18 | Loot: cabin, farm, grocery, house, market, restaurant, suburban, urban |
| `cranberry` | Cranberry | Orchard and berry food | 0 | 0.14 | Loot: farm, grocery, house, market, restaurant |
| `cranberry_compote` | Cranberry Camp Compote | Prepared fruit meals | 1 | 0.45 | Craft: Cranberry Camp Compote |
| `cranberry_dried_slices` | Cranberry Dried Slices | Prepared fruit meals | 1 | 0.13 | Craft: Cranberry Dried Slices |
| `cranberry_fruit_leather` | Cranberry Fruit Leather | Prepared fruit meals | 1 | 0.15 | Craft: Cranberry Fruit Leather |
| `cranberry_grain_bowl` | Cranberry Grain Bowl | Prepared fruit meals | 2 | 0.51 | Craft: Cranberry Grain Bowl |
| `cranberry_preserve` | Cranberry Pantry Preserve | Prepared fruit meals | 1 | 0.29 | Craft: Cranberry Pantry Preserve |
| `cranberry_salad` | Cranberry Salad | Prepared fruit meals | 1 | 0.37 | Craft: Cranberry Salad |
| `cranberry_trail_mix` | Cranberry Trail Mix | Prepared fruit meals | 2 | 0.24 | Craft: Cranberry Trail Mix |
| `cucumber` | Cucumber | Garden food | 0 | 0.25 | Loot: farm, grocery, market, restaurant, suburban |
| `cucumber_roast` | Cucumber Camp Roast | Prepared vegetable meals | 1 | 0.33 | Craft: Cucumber Camp Roast |
| `cucumber_camp_soup` | Cucumber Camp Soup | Prepared vegetable meals | 1 | 0.60 | Craft: Cucumber Camp Soup |
| `cucumber_flatbread` | Cucumber Garden Flatbread | Prepared vegetable meals | 2 | 0.34 | Craft: Cucumber Garden Flatbread |
| `cucumber_pickle` | Cucumber Salted Pickle | Prepared vegetable meals | 1 | 0.26 | Craft: Cucumber Salted Pickle |
| `cucumber_porridge` | Cucumber Savory Porridge | Prepared vegetable meals | 1 | 0.56 | Craft: Cucumber Savory Porridge |
| `cucumber_supper_packet` | Cucumber Supper Packet | Prepared vegetable meals | 2 | 0.44 | Craft: Cucumber Supper Packet |
| `cucumber_crisp` | Cucumber Vegetable Crisp | Prepared vegetable meals | 1 | 0.15 | Craft: Cucumber Vegetable Crisp |
| `cured_beef` | Cured Beef | Protein supplies | 0 | 0.20 | Loot: camp, grocery, house, market, ranger, restaurant |
| `cured_beef_broth_bowl` | Cured Beef Broth Bowl | Prepared protein meals | 2 | 0.65 | Craft: Cured Beef Broth Bowl |
| `cured_beef_stew` | Cured Beef Camp Stew | Prepared protein meals | 1 | 0.63 | Craft: Cured Beef Camp Stew |
| `cured_beef_sandwich` | Cured Beef Field Sandwich | Prepared protein meals | 1 | 0.37 | Craft: Cured Beef Field Sandwich |
| `cured_beef_skillet` | Cured Beef Skillet Meal | Prepared protein meals | 1 | 0.42 | Craft: Cured Beef Skillet Meal |
| `cured_beef_smoked_ration` | Cured Beef Smoked Ration | Prepared protein meals | 1 | 0.21 | Craft: Cured Beef Smoked Ration |
| `cured_beef_jerky` | Cured Beef Trail Jerky | Prepared protein meals | 1 | 0.14 | Craft: Cured Beef Trail Jerky |
| `cured_beef_meal_packet` | Cured Beef Travel Meal Packet | Prepared protein meals | 2 | 0.40 | Craft: Cured Beef Travel Meal Packet |
| `cured_lamb` | Cured Lamb | Protein supplies | 0 | 0.22 | Loot: camp, grocery, house, market, ranger, restaurant |
| `cured_lamb_broth_bowl` | Cured Lamb Broth Bowl | Prepared protein meals | 2 | 0.66 | Craft: Cured Lamb Broth Bowl |
| `cured_lamb_stew` | Cured Lamb Camp Stew | Prepared protein meals | 1 | 0.64 | Craft: Cured Lamb Camp Stew |
| `cured_lamb_sandwich` | Cured Lamb Field Sandwich | Prepared protein meals | 1 | 0.38 | Craft: Cured Lamb Field Sandwich |
| `cured_lamb_skillet` | Cured Lamb Skillet Meal | Prepared protein meals | 1 | 0.43 | Craft: Cured Lamb Skillet Meal |
| `cured_lamb_smoked_ration` | Cured Lamb Smoked Ration | Prepared protein meals | 1 | 0.22 | Craft: Cured Lamb Smoked Ration |
| `cured_lamb_jerky` | Cured Lamb Trail Jerky | Prepared protein meals | 1 | 0.15 | Craft: Cured Lamb Trail Jerky |
| `cured_lamb_meal_packet` | Cured Lamb Travel Meal Packet | Prepared protein meals | 2 | 0.41 | Craft: Cured Lamb Travel Meal Packet |
| `cured_sausage` | Cured Sausage | Protein supplies | 0 | 0.19 | Loot: camp, grocery, house, market, ranger, restaurant |
| `cured_sausage_broth_bowl` | Cured Sausage Broth Bowl | Prepared protein meals | 2 | 0.65 | Craft: Cured Sausage Broth Bowl |
| `cured_sausage_stew` | Cured Sausage Camp Stew | Prepared protein meals | 1 | 0.63 | Craft: Cured Sausage Camp Stew |
| `cured_sausage_sandwich` | Cured Sausage Field Sandwich | Prepared protein meals | 1 | 0.37 | Craft: Cured Sausage Field Sandwich |
| `cured_sausage_skillet` | Cured Sausage Skillet Meal | Prepared protein meals | 1 | 0.42 | Craft: Cured Sausage Skillet Meal |
| `cured_sausage_smoked_ration` | Cured Sausage Smoked Ration | Prepared protein meals | 1 | 0.21 | Craft: Cured Sausage Smoked Ration |
| `cured_sausage_jerky` | Cured Sausage Trail Jerky | Prepared protein meals | 1 | 0.14 | Craft: Cured Sausage Trail Jerky |
| `cured_sausage_meal_packet` | Cured Sausage Travel Meal Packet | Prepared protein meals | 2 | 0.40 | Craft: Cured Sausage Travel Meal Packet |
| `currant` | Currant | Orchard and berry food | 0 | 0.19 | Loot: farm, grocery, house, market, restaurant |
| `currant_compote` | Currant Camp Compote | Prepared fruit meals | 1 | 0.44 | Craft: Currant Camp Compote |
| `currant_dried_slices` | Currant Dried Slices | Prepared fruit meals | 1 | 0.12 | Craft: Currant Dried Slices |
| `currant_fruit_leather` | Currant Fruit Leather | Prepared fruit meals | 1 | 0.14 | Craft: Currant Fruit Leather |
| `currant_grain_bowl` | Currant Grain Bowl | Prepared fruit meals | 2 | 0.50 | Craft: Currant Grain Bowl |
| `currant_preserve` | Currant Pantry Preserve | Prepared fruit meals | 1 | 0.28 | Craft: Currant Pantry Preserve |
| `currant_salad` | Currant Salad | Prepared fruit meals | 1 | 0.36 | Craft: Currant Salad |
| `currant_trail_mix` | Currant Trail Mix | Prepared fruit meals | 2 | 0.23 | Craft: Currant Trail Mix |
| `date` | Date | Orchard and berry food | 0 | 0.20 | Loot: farm, grocery, house, market, restaurant |
| `date_compote` | Date Camp Compote | Prepared fruit meals | 1 | 0.45 | Craft: Date Camp Compote |
| `date_dried_slices` | Date Dried Slices | Prepared fruit meals | 1 | 0.13 | Craft: Date Dried Slices |
| `date_fruit_leather` | Date Fruit Leather | Prepared fruit meals | 1 | 0.15 | Craft: Date Fruit Leather |
| `date_grain_bowl` | Date Grain Bowl | Prepared fruit meals | 2 | 0.51 | Craft: Date Grain Bowl |
| `date_preserve` | Date Pantry Preserve | Prepared fruit meals | 1 | 0.29 | Craft: Date Pantry Preserve |
| `date_salad` | Date Salad | Prepared fruit meals | 1 | 0.37 | Craft: Date Salad |
| `date_trail_mix` | Date Trail Mix | Prepared fruit meals | 2 | 0.24 | Craft: Date Trail Mix |
| `dried_anchovy` | Dried Anchovy | Protein supplies | 0 | 0.17 | Loot: camp, grocery, house, market, ranger, restaurant |
| `dried_anchovy_broth_bowl` | Dried Anchovy Broth Bowl | Prepared protein meals | 2 | 0.67 | Craft: Dried Anchovy Broth Bowl |
| `dried_anchovy_stew` | Dried Anchovy Camp Stew | Prepared protein meals | 1 | 0.65 | Craft: Dried Anchovy Camp Stew |
| `dried_anchovy_sandwich` | Dried Anchovy Field Sandwich | Prepared protein meals | 1 | 0.39 | Craft: Dried Anchovy Field Sandwich |
| `dried_anchovy_skillet` | Dried Anchovy Skillet Meal | Prepared protein meals | 1 | 0.44 | Craft: Dried Anchovy Skillet Meal |
| `dried_anchovy_smoked_ration` | Dried Anchovy Smoked Ration | Prepared protein meals | 1 | 0.23 | Craft: Dried Anchovy Smoked Ration |
| `dried_anchovy_jerky` | Dried Anchovy Trail Jerky | Prepared protein meals | 1 | 0.16 | Craft: Dried Anchovy Trail Jerky |
| `dried_anchovy_meal_packet` | Dried Anchovy Travel Meal Packet | Prepared protein meals | 2 | 0.42 | Craft: Dried Anchovy Travel Meal Packet |
| `dried_cod` | Dried Cod | Protein supplies | 0 | 0.23 | Loot: camp, grocery, house, market, ranger, restaurant |
| `dried_cod_broth_bowl` | Dried Cod Broth Bowl | Prepared protein meals | 2 | 0.66 | Craft: Dried Cod Broth Bowl |
| `dried_cod_stew` | Dried Cod Camp Stew | Prepared protein meals | 1 | 0.64 | Craft: Dried Cod Camp Stew |
| `dried_cod_sandwich` | Dried Cod Field Sandwich | Prepared protein meals | 1 | 0.38 | Craft: Dried Cod Field Sandwich |
| `dried_cod_skillet` | Dried Cod Skillet Meal | Prepared protein meals | 1 | 0.43 | Craft: Dried Cod Skillet Meal |
| `dried_cod_smoked_ration` | Dried Cod Smoked Ration | Prepared protein meals | 1 | 0.22 | Craft: Dried Cod Smoked Ration |
| `dried_cod_jerky` | Dried Cod Trail Jerky | Prepared protein meals | 1 | 0.15 | Craft: Dried Cod Trail Jerky |
| `dried_cod_meal_packet` | Dried Cod Travel Meal Packet | Prepared protein meals | 2 | 0.41 | Craft: Dried Cod Travel Meal Packet |
| `dried_egg` | Dried Egg | Protein supplies | 0 | 0.22 | Loot: camp, grocery, house, market, ranger, restaurant |
| `dried_egg_broth_bowl` | Dried Egg Broth Bowl | Prepared protein meals | 2 | 0.67 | Craft: Dried Egg Broth Bowl |
| `dried_egg_stew` | Dried Egg Camp Stew | Prepared protein meals | 1 | 0.65 | Craft: Dried Egg Camp Stew |
| `dried_egg_sandwich` | Dried Egg Field Sandwich | Prepared protein meals | 1 | 0.39 | Craft: Dried Egg Field Sandwich |
| `dried_egg_skillet` | Dried Egg Skillet Meal | Prepared protein meals | 1 | 0.44 | Craft: Dried Egg Skillet Meal |
| `dried_egg_smoked_ration` | Dried Egg Smoked Ration | Prepared protein meals | 1 | 0.23 | Craft: Dried Egg Smoked Ration |
| `dried_egg_jerky` | Dried Egg Trail Jerky | Prepared protein meals | 1 | 0.16 | Craft: Dried Egg Trail Jerky |
| `dried_egg_meal_packet` | Dried Egg Travel Meal Packet | Prepared protein meals | 2 | 0.42 | Craft: Dried Egg Travel Meal Packet |
| `dried_herring` | Dried Herring | Protein supplies | 0 | 0.19 | Loot: camp, grocery, house, market, ranger, restaurant |
| `dried_herring_broth_bowl` | Dried Herring Broth Bowl | Prepared protein meals | 2 | 0.64 | Craft: Dried Herring Broth Bowl |
| `dried_herring_stew` | Dried Herring Camp Stew | Prepared protein meals | 1 | 0.62 | Craft: Dried Herring Camp Stew |
| `dried_herring_sandwich` | Dried Herring Field Sandwich | Prepared protein meals | 1 | 0.36 | Craft: Dried Herring Field Sandwich |
| `dried_herring_skillet` | Dried Herring Skillet Meal | Prepared protein meals | 1 | 0.41 | Craft: Dried Herring Skillet Meal |
| `dried_herring_smoked_ration` | Dried Herring Smoked Ration | Prepared protein meals | 1 | 0.20 | Craft: Dried Herring Smoked Ration |
| `dried_herring_jerky` | Dried Herring Trail Jerky | Prepared protein meals | 1 | 0.13 | Craft: Dried Herring Trail Jerky |
| `dried_herring_meal_packet` | Dried Herring Travel Meal Packet | Prepared protein meals | 2 | 0.39 | Craft: Dried Herring Travel Meal Packet |
| `dried_salami` | Dried Salami | Protein supplies | 0 | 0.20 | Loot: camp, grocery, house, market, ranger, restaurant |
| `dried_salami_broth_bowl` | Dried Salami Broth Bowl | Prepared protein meals | 2 | 0.66 | Craft: Dried Salami Broth Bowl |
| `dried_salami_stew` | Dried Salami Camp Stew | Prepared protein meals | 1 | 0.64 | Craft: Dried Salami Camp Stew |
| `dried_salami_sandwich` | Dried Salami Field Sandwich | Prepared protein meals | 1 | 0.38 | Craft: Dried Salami Field Sandwich |
| `dried_salami_skillet` | Dried Salami Skillet Meal | Prepared protein meals | 1 | 0.43 | Craft: Dried Salami Skillet Meal |
| `dried_salami_smoked_ration` | Dried Salami Smoked Ration | Prepared protein meals | 1 | 0.22 | Craft: Dried Salami Smoked Ration |
| `dried_salami_jerky` | Dried Salami Trail Jerky | Prepared protein meals | 1 | 0.15 | Craft: Dried Salami Trail Jerky |
| `dried_salami_meal_packet` | Dried Salami Travel Meal Packet | Prepared protein meals | 2 | 0.41 | Craft: Dried Salami Travel Meal Packet |
| `dried_fruit` | Dried fruit | food | 0 | 0.15 | Loot: forest, grocery, market |
| `eggplant` | Eggplant | Garden food | 0 | 0.23 | Loot: farm, grocery, market, restaurant, suburban |
| `eggplant_roast` | Eggplant Camp Roast | Prepared vegetable meals | 1 | 0.33 | Craft: Eggplant Camp Roast |
| `eggplant_camp_soup` | Eggplant Camp Soup | Prepared vegetable meals | 1 | 0.60 | Craft: Eggplant Camp Soup |
| `eggplant_flatbread` | Eggplant Garden Flatbread | Prepared vegetable meals | 2 | 0.34 | Craft: Eggplant Garden Flatbread |
| `eggplant_pickle` | Eggplant Salted Pickle | Prepared vegetable meals | 1 | 0.26 | Craft: Eggplant Salted Pickle |
| `eggplant_porridge` | Eggplant Savory Porridge | Prepared vegetable meals | 1 | 0.56 | Craft: Eggplant Savory Porridge |
| `eggplant_supper_packet` | Eggplant Supper Packet | Prepared vegetable meals | 2 | 0.44 | Craft: Eggplant Supper Packet |
| `eggplant_crisp` | Eggplant Vegetable Crisp | Prepared vegetable meals | 1 | 0.15 | Craft: Eggplant Vegetable Crisp |
| `elderberry` | Elderberry | Orchard and berry food | 0 | 0.20 | Loot: farm, grocery, house, market, restaurant |
| `elderberry_compote` | Elderberry Camp Compote | Prepared fruit meals | 1 | 0.45 | Craft: Elderberry Camp Compote |
| `elderberry_dried_slices` | Elderberry Dried Slices | Prepared fruit meals | 1 | 0.13 | Craft: Elderberry Dried Slices |
| `elderberry_fruit_leather` | Elderberry Fruit Leather | Prepared fruit meals | 1 | 0.15 | Craft: Elderberry Fruit Leather |
| `elderberry_grain_bowl` | Elderberry Grain Bowl | Prepared fruit meals | 2 | 0.51 | Craft: Elderberry Grain Bowl |
| `elderberry_preserve` | Elderberry Pantry Preserve | Prepared fruit meals | 1 | 0.29 | Craft: Elderberry Pantry Preserve |
| `elderberry_salad` | Elderberry Salad | Prepared fruit meals | 1 | 0.37 | Craft: Elderberry Salad |
| `elderberry_trail_mix` | Elderberry Trail Mix | Prepared fruit meals | 2 | 0.24 | Craft: Elderberry Trail Mix |
| `fig` | Fig | Orchard and berry food | 0 | 0.19 | Loot: farm, grocery, house, market, restaurant |
| `fig_compote` | Fig Camp Compote | Prepared fruit meals | 1 | 0.44 | Craft: Fig Camp Compote |
| `fig_dried_slices` | Fig Dried Slices | Prepared fruit meals | 1 | 0.12 | Craft: Fig Dried Slices |
| `fig_fruit_leather` | Fig Fruit Leather | Prepared fruit meals | 1 | 0.14 | Craft: Fig Fruit Leather |
| `fig_grain_bowl` | Fig Grain Bowl | Prepared fruit meals | 2 | 0.50 | Craft: Fig Grain Bowl |
| `fig_preserve` | Fig Pantry Preserve | Prepared fruit meals | 1 | 0.28 | Craft: Fig Pantry Preserve |
| `fig_salad` | Fig Salad | Prepared fruit meals | 1 | 0.36 | Craft: Fig Salad |
| `fig_trail_mix` | Fig Trail Mix | Prepared fruit meals | 2 | 0.23 | Craft: Fig Trail Mix |
| `fruit_salad` | Fruit salad | food | 0 | 0.40 | Craft: Cut fruit salad |
| `garlic` | Garlic | Garden food | 0 | 0.22 | Loot: farm, grocery, market, restaurant, suburban |
| `garlic_roast` | Garlic Camp Roast | Prepared vegetable meals | 1 | 0.32 | Craft: Garlic Camp Roast |
| `garlic_camp_soup` | Garlic Camp Soup | Prepared vegetable meals | 1 | 0.59 | Craft: Garlic Camp Soup |
| `garlic_flatbread` | Garlic Garden Flatbread | Prepared vegetable meals | 2 | 0.33 | Craft: Garlic Garden Flatbread |
| `garlic_pickle` | Garlic Salted Pickle | Prepared vegetable meals | 1 | 0.25 | Craft: Garlic Salted Pickle |
| `garlic_porridge` | Garlic Savory Porridge | Prepared vegetable meals | 1 | 0.55 | Craft: Garlic Savory Porridge |
| `garlic_supper_packet` | Garlic Supper Packet | Prepared vegetable meals | 2 | 0.43 | Craft: Garlic Supper Packet |
| `garlic_crisp` | Garlic Vegetable Crisp | Prepared vegetable meals | 1 | 0.14 | Craft: Garlic Vegetable Crisp |
| `gooseberry` | Gooseberry | Orchard and berry food | 0 | 0.17 | Loot: farm, grocery, house, market, restaurant |
| `gooseberry_compote` | Gooseberry Camp Compote | Prepared fruit meals | 1 | 0.47 | Craft: Gooseberry Camp Compote |
| `gooseberry_dried_slices` | Gooseberry Dried Slices | Prepared fruit meals | 1 | 0.15 | Craft: Gooseberry Dried Slices |
| `gooseberry_fruit_leather` | Gooseberry Fruit Leather | Prepared fruit meals | 1 | 0.17 | Craft: Gooseberry Fruit Leather |
| `gooseberry_grain_bowl` | Gooseberry Grain Bowl | Prepared fruit meals | 2 | 0.53 | Craft: Gooseberry Grain Bowl |
| `gooseberry_preserve` | Gooseberry Pantry Preserve | Prepared fruit meals | 1 | 0.31 | Craft: Gooseberry Pantry Preserve |
| `gooseberry_salad` | Gooseberry Salad | Prepared fruit meals | 1 | 0.39 | Craft: Gooseberry Salad |
| `gooseberry_trail_mix` | Gooseberry Trail Mix | Prepared fruit meals | 2 | 0.26 | Craft: Gooseberry Trail Mix |
| `granola` | Granola bag | food | 0 | 0.25 | Loot: grocery, market |
| `grapefruit` | Grapefruit | Orchard and berry food | 0 | 0.17 | Loot: farm, grocery, house, market, restaurant |
| `grapefruit_compote` | Grapefruit Camp Compote | Prepared fruit meals | 1 | 0.45 | Craft: Grapefruit Camp Compote |
| `grapefruit_dried_slices` | Grapefruit Dried Slices | Prepared fruit meals | 1 | 0.13 | Craft: Grapefruit Dried Slices |
| `grapefruit_fruit_leather` | Grapefruit Fruit Leather | Prepared fruit meals | 1 | 0.15 | Craft: Grapefruit Fruit Leather |
| `grapefruit_grain_bowl` | Grapefruit Grain Bowl | Prepared fruit meals | 2 | 0.51 | Craft: Grapefruit Grain Bowl |
| `grapefruit_preserve` | Grapefruit Pantry Preserve | Prepared fruit meals | 1 | 0.29 | Craft: Grapefruit Pantry Preserve |
| `grapefruit_salad` | Grapefruit Salad | Prepared fruit meals | 1 | 0.37 | Craft: Grapefruit Salad |
| `grapefruit_trail_mix` | Grapefruit Trail Mix | Prepared fruit meals | 2 | 0.24 | Craft: Grapefruit Trail Mix |
| `green_peas` | Green Peas | Garden food | 0 | 0.20 | Loot: farm, grocery, market, restaurant, suburban |
| `green_peas_roast` | Green Peas Camp Roast | Prepared vegetable meals | 1 | 0.32 | Craft: Green Peas Camp Roast |
| `green_peas_camp_soup` | Green Peas Camp Soup | Prepared vegetable meals | 1 | 0.59 | Craft: Green Peas Camp Soup |
| `green_peas_flatbread` | Green Peas Garden Flatbread | Prepared vegetable meals | 2 | 0.33 | Craft: Green Peas Garden Flatbread |
| `green_peas_pickle` | Green Peas Salted Pickle | Prepared vegetable meals | 1 | 0.25 | Craft: Green Peas Salted Pickle |
| `green_peas_porridge` | Green Peas Savory Porridge | Prepared vegetable meals | 1 | 0.55 | Craft: Green Peas Savory Porridge |
| `green_peas_supper_packet` | Green Peas Supper Packet | Prepared vegetable meals | 2 | 0.43 | Craft: Green Peas Supper Packet |
| `green_peas_crisp` | Green Peas Vegetable Crisp | Prepared vegetable meals | 1 | 0.14 | Craft: Green Peas Vegetable Crisp |
| `guava` | Guava | Orchard and berry food | 0 | 0.19 | Loot: farm, grocery, house, market, restaurant |
| `guava_compote` | Guava Camp Compote | Prepared fruit meals | 1 | 0.45 | Craft: Guava Camp Compote |
| `guava_dried_slices` | Guava Dried Slices | Prepared fruit meals | 1 | 0.13 | Craft: Guava Dried Slices |
| `guava_fruit_leather` | Guava Fruit Leather | Prepared fruit meals | 1 | 0.15 | Craft: Guava Fruit Leather |
| `guava_grain_bowl` | Guava Grain Bowl | Prepared fruit meals | 2 | 0.51 | Craft: Guava Grain Bowl |
| `guava_preserve` | Guava Pantry Preserve | Prepared fruit meals | 1 | 0.29 | Craft: Guava Pantry Preserve |
| `guava_salad` | Guava Salad | Prepared fruit meals | 1 | 0.37 | Craft: Guava Salad |
| `guava_trail_mix` | Guava Trail Mix | Prepared fruit meals | 2 | 0.24 | Craft: Guava Trail Mix |
| `hard_cheese` | Hard Cheese | Protein supplies | 0 | 0.20 | Loot: camp, grocery, house, market, ranger, restaurant |
| `hard_cheese_broth_bowl` | Hard Cheese Broth Bowl | Prepared protein meals | 2 | 0.66 | Craft: Hard Cheese Broth Bowl |
| `hard_cheese_stew` | Hard Cheese Camp Stew | Prepared protein meals | 1 | 0.64 | Craft: Hard Cheese Camp Stew |
| `hard_cheese_sandwich` | Hard Cheese Field Sandwich | Prepared protein meals | 1 | 0.38 | Craft: Hard Cheese Field Sandwich |
| `hard_cheese_skillet` | Hard Cheese Skillet Meal | Prepared protein meals | 1 | 0.43 | Craft: Hard Cheese Skillet Meal |
| `hard_cheese_smoked_ration` | Hard Cheese Smoked Ration | Prepared protein meals | 1 | 0.22 | Craft: Hard Cheese Smoked Ration |
| `hard_cheese_jerky` | Hard Cheese Trail Jerky | Prepared protein meals | 1 | 0.15 | Craft: Hard Cheese Trail Jerky |
| `hard_cheese_meal_packet` | Hard Cheese Travel Meal Packet | Prepared protein meals | 2 | 0.41 | Craft: Hard Cheese Travel Meal Packet |
| `honey` | Honey jar | food | 0 | 0.30 | Loot: farm, restaurant |
| `jam` | Jam jar | food | 0 | 0.30 | Loot: house |
| `jerky` | Jerky packet | food | 0 | 0.12 | Loot: grocery, market |
| `kale` | Kale | Garden food | 0 | 0.20 | Loot: farm, grocery, market, restaurant, suburban |
| `kale_roast` | Kale Camp Roast | Prepared vegetable meals | 1 | 0.32 | Craft: Kale Camp Roast |
| `kale_camp_soup` | Kale Camp Soup | Prepared vegetable meals | 1 | 0.59 | Craft: Kale Camp Soup |
| `kale_flatbread` | Kale Garden Flatbread | Prepared vegetable meals | 2 | 0.33 | Craft: Kale Garden Flatbread |
| `kale_pickle` | Kale Salted Pickle | Prepared vegetable meals | 1 | 0.25 | Craft: Kale Salted Pickle |
| `kale_porridge` | Kale Savory Porridge | Prepared vegetable meals | 1 | 0.55 | Craft: Kale Savory Porridge |
| `kale_supper_packet` | Kale Supper Packet | Prepared vegetable meals | 2 | 0.43 | Craft: Kale Supper Packet |
| `kale_crisp` | Kale Vegetable Crisp | Prepared vegetable meals | 1 | 0.14 | Craft: Kale Vegetable Crisp |
| `kiwi` | Kiwi | Orchard and berry food | 0 | 0.16 | Loot: farm, grocery, house, market, restaurant |
| `kiwi_compote` | Kiwi Camp Compote | Prepared fruit meals | 1 | 0.44 | Craft: Kiwi Camp Compote |
| `kiwi_dried_slices` | Kiwi Dried Slices | Prepared fruit meals | 1 | 0.12 | Craft: Kiwi Dried Slices |
| `kiwi_fruit_leather` | Kiwi Fruit Leather | Prepared fruit meals | 1 | 0.14 | Craft: Kiwi Fruit Leather |
| `kiwi_grain_bowl` | Kiwi Grain Bowl | Prepared fruit meals | 2 | 0.50 | Craft: Kiwi Grain Bowl |
| `kiwi_preserve` | Kiwi Pantry Preserve | Prepared fruit meals | 1 | 0.28 | Craft: Kiwi Pantry Preserve |
| `kiwi_salad` | Kiwi Salad | Prepared fruit meals | 1 | 0.36 | Craft: Kiwi Salad |
| `kiwi_trail_mix` | Kiwi Trail Mix | Prepared fruit meals | 2 | 0.23 | Craft: Kiwi Trail Mix |
| `leek` | Leek | Garden food | 0 | 0.23 | Loot: farm, grocery, market, restaurant, suburban |
| `leek_roast` | Leek Camp Roast | Prepared vegetable meals | 1 | 0.33 | Craft: Leek Camp Roast |
| `leek_camp_soup` | Leek Camp Soup | Prepared vegetable meals | 1 | 0.60 | Craft: Leek Camp Soup |
| `leek_flatbread` | Leek Garden Flatbread | Prepared vegetable meals | 2 | 0.34 | Craft: Leek Garden Flatbread |
| `leek_pickle` | Leek Salted Pickle | Prepared vegetable meals | 1 | 0.26 | Craft: Leek Salted Pickle |
| `leek_porridge` | Leek Savory Porridge | Prepared vegetable meals | 1 | 0.56 | Craft: Leek Savory Porridge |
| `leek_supper_packet` | Leek Supper Packet | Prepared vegetable meals | 2 | 0.44 | Craft: Leek Supper Packet |
| `leek_crisp` | Leek Vegetable Crisp | Prepared vegetable meals | 1 | 0.15 | Craft: Leek Vegetable Crisp |
| `lemon` | Lemon | Orchard and berry food | 0 | 0.19 | Loot: farm, grocery, house, market, restaurant |
| `lemon_compote` | Lemon Camp Compote | Prepared fruit meals | 1 | 0.46 | Craft: Lemon Camp Compote |
| `lemon_dried_slices` | Lemon Dried Slices | Prepared fruit meals | 1 | 0.14 | Craft: Lemon Dried Slices |
| `lemon_fruit_leather` | Lemon Fruit Leather | Prepared fruit meals | 1 | 0.16 | Craft: Lemon Fruit Leather |
| `lemon_grain_bowl` | Lemon Grain Bowl | Prepared fruit meals | 2 | 0.52 | Craft: Lemon Grain Bowl |
| `lemon_preserve` | Lemon Pantry Preserve | Prepared fruit meals | 1 | 0.30 | Craft: Lemon Pantry Preserve |
| `lemon_salad` | Lemon Salad | Prepared fruit meals | 1 | 0.38 | Craft: Lemon Salad |
| `lemon_trail_mix` | Lemon Trail Mix | Prepared fruit meals | 2 | 0.25 | Craft: Lemon Trail Mix |
| `lentil` | Lentil | Grain and pulse food | 0 | 0.23 | Loot: depot, farm, grocery, market, restaurant, warehouse |
| `lentil_bean_bowl` | Lentil Bean Bowl | Prepared grain meals | 1 | 0.63 | Craft: Lentil Bean Bowl |
| `lentil_broth_dumplings` | Lentil Broth Dumplings | Prepared grain meals | 2 | 0.61 | Craft: Lentil Broth Dumplings |
| `lentil_flatbread` | Lentil Camp Flatbread | Prepared grain meals | 1 | 0.33 | Craft: Lentil Camp Flatbread |
| `lentil_porridge` | Lentil Camp Porridge | Prepared grain meals | 1 | 0.58 | Craft: Lentil Camp Porridge |
| `lentil_crackers` | Lentil Field Crackers | Prepared grain meals | 1 | 0.17 | Craft: Lentil Field Crackers |
| `lentil_honey_cluster` | Lentil Honey Cluster | Prepared grain meals | 1 | 0.22 | Craft: Lentil Honey Cluster |
| `lentil_travel_biscuit` | Lentil Travel Biscuit | Prepared grain meals | 2 | 0.24 | Craft: Lentil Travel Biscuit |
| `lettuce` | Lettuce | Garden food | 0 | 0.25 | Loot: farm, grocery, market, restaurant, suburban |
| `lettuce_roast` | Lettuce Camp Roast | Prepared vegetable meals | 1 | 0.31 | Craft: Lettuce Camp Roast |
| `lettuce_camp_soup` | Lettuce Camp Soup | Prepared vegetable meals | 1 | 0.58 | Craft: Lettuce Camp Soup |
| `lettuce_flatbread` | Lettuce Garden Flatbread | Prepared vegetable meals | 2 | 0.32 | Craft: Lettuce Garden Flatbread |
| `lettuce_pickle` | Lettuce Salted Pickle | Prepared vegetable meals | 1 | 0.24 | Craft: Lettuce Salted Pickle |
| `lettuce_porridge` | Lettuce Savory Porridge | Prepared vegetable meals | 1 | 0.54 | Craft: Lettuce Savory Porridge |
| `lettuce_supper_packet` | Lettuce Supper Packet | Prepared vegetable meals | 2 | 0.42 | Craft: Lettuce Supper Packet |
| `lettuce_crisp` | Lettuce Vegetable Crisp | Prepared vegetable meals | 1 | 0.13 | Craft: Lettuce Vegetable Crisp |
| `lime` | Lime | Orchard and berry food | 0 | 0.20 | Loot: farm, grocery, house, market, restaurant |
| `lime_compote` | Lime Camp Compote | Prepared fruit meals | 1 | 0.47 | Craft: Lime Camp Compote |
| `lime_dried_slices` | Lime Dried Slices | Prepared fruit meals | 1 | 0.15 | Craft: Lime Dried Slices |
| `lime_fruit_leather` | Lime Fruit Leather | Prepared fruit meals | 1 | 0.17 | Craft: Lime Fruit Leather |
| `lime_grain_bowl` | Lime Grain Bowl | Prepared fruit meals | 2 | 0.53 | Craft: Lime Grain Bowl |
| `lime_preserve` | Lime Pantry Preserve | Prepared fruit meals | 1 | 0.31 | Craft: Lime Pantry Preserve |
| `lime_salad` | Lime Salad | Prepared fruit meals | 1 | 0.39 | Craft: Lime Salad |
| `lime_trail_mix` | Lime Trail Mix | Prepared fruit meals | 2 | 0.26 | Craft: Lime Trail Mix |
| `lychee` | Lychee | Orchard and berry food | 0 | 0.14 | Loot: farm, grocery, house, market, restaurant |
| `lychee_compote` | Lychee Camp Compote | Prepared fruit meals | 1 | 0.47 | Craft: Lychee Camp Compote |
| `lychee_dried_slices` | Lychee Dried Slices | Prepared fruit meals | 1 | 0.15 | Craft: Lychee Dried Slices |
| `lychee_fruit_leather` | Lychee Fruit Leather | Prepared fruit meals | 1 | 0.17 | Craft: Lychee Fruit Leather |
| `lychee_grain_bowl` | Lychee Grain Bowl | Prepared fruit meals | 2 | 0.53 | Craft: Lychee Grain Bowl |
| `lychee_preserve` | Lychee Pantry Preserve | Prepared fruit meals | 1 | 0.31 | Craft: Lychee Pantry Preserve |
| `lychee_salad` | Lychee Salad | Prepared fruit meals | 1 | 0.39 | Craft: Lychee Salad |
| `lychee_trail_mix` | Lychee Trail Mix | Prepared fruit meals | 2 | 0.26 | Craft: Lychee Trail Mix |
| `mango` | Mango | Orchard and berry food | 0 | 0.14 | Loot: farm, grocery, house, market, restaurant |
| `mango_compote` | Mango Camp Compote | Prepared fruit meals | 1 | 0.46 | Craft: Mango Camp Compote |
| `mango_dried_slices` | Mango Dried Slices | Prepared fruit meals | 1 | 0.14 | Craft: Mango Dried Slices |
| `mango_fruit_leather` | Mango Fruit Leather | Prepared fruit meals | 1 | 0.16 | Craft: Mango Fruit Leather |
| `mango_grain_bowl` | Mango Grain Bowl | Prepared fruit meals | 2 | 0.52 | Craft: Mango Grain Bowl |
| `mango_preserve` | Mango Pantry Preserve | Prepared fruit meals | 1 | 0.30 | Craft: Mango Pantry Preserve |
| `mango_salad` | Mango Salad | Prepared fruit meals | 1 | 0.38 | Craft: Mango Salad |
| `mango_trail_mix` | Mango Trail Mix | Prepared fruit meals | 2 | 0.25 | Craft: Mango Trail Mix |
| `millet` | Millet | Grain and pulse food | 0 | 0.26 | Loot: depot, farm, grocery, market, restaurant, warehouse |
| `millet_bean_bowl` | Millet Bean Bowl | Prepared grain meals | 1 | 0.63 | Craft: Millet Bean Bowl |
| `millet_broth_dumplings` | Millet Broth Dumplings | Prepared grain meals | 2 | 0.61 | Craft: Millet Broth Dumplings |
| `millet_flatbread` | Millet Camp Flatbread | Prepared grain meals | 1 | 0.33 | Craft: Millet Camp Flatbread |
| `millet_porridge` | Millet Camp Porridge | Prepared grain meals | 1 | 0.58 | Craft: Millet Camp Porridge |
| `millet_crackers` | Millet Field Crackers | Prepared grain meals | 1 | 0.17 | Craft: Millet Field Crackers |
| `millet_honey_cluster` | Millet Honey Cluster | Prepared grain meals | 1 | 0.22 | Craft: Millet Honey Cluster |
| `millet_travel_biscuit` | Millet Travel Biscuit | Prepared grain meals | 2 | 0.24 | Craft: Millet Travel Biscuit |
| `nuts` | Mixed nuts | food | 0 | 0.18 | Loot: forest, grocery, market |
| `mulberry` | Mulberry | Orchard and berry food | 0 | 0.16 | Loot: farm, grocery, house, market, restaurant |
| `mulberry_compote` | Mulberry Camp Compote | Prepared fruit meals | 1 | 0.46 | Craft: Mulberry Camp Compote |
| `mulberry_dried_slices` | Mulberry Dried Slices | Prepared fruit meals | 1 | 0.14 | Craft: Mulberry Dried Slices |
| `mulberry_fruit_leather` | Mulberry Fruit Leather | Prepared fruit meals | 1 | 0.16 | Craft: Mulberry Fruit Leather |
| `mulberry_grain_bowl` | Mulberry Grain Bowl | Prepared fruit meals | 2 | 0.52 | Craft: Mulberry Grain Bowl |
| `mulberry_preserve` | Mulberry Pantry Preserve | Prepared fruit meals | 1 | 0.30 | Craft: Mulberry Pantry Preserve |
| `mulberry_salad` | Mulberry Salad | Prepared fruit meals | 1 | 0.38 | Craft: Mulberry Salad |
| `mulberry_trail_mix` | Mulberry Trail Mix | Prepared fruit meals | 2 | 0.25 | Craft: Mulberry Trail Mix |
| `mung_bean` | Mung Bean | Grain and pulse food | 0 | 0.28 | Loot: depot, farm, grocery, market, restaurant, warehouse |
| `mung_bean_bean_bowl` | Mung Bean Bean Bowl | Prepared grain meals | 1 | 0.62 | Craft: Mung Bean Bean Bowl |
| `mung_bean_broth_dumplings` | Mung Bean Broth Dumplings | Prepared grain meals | 2 | 0.60 | Craft: Mung Bean Broth Dumplings |
| `mung_bean_flatbread` | Mung Bean Camp Flatbread | Prepared grain meals | 1 | 0.32 | Craft: Mung Bean Camp Flatbread |
| `mung_bean_porridge` | Mung Bean Camp Porridge | Prepared grain meals | 1 | 0.57 | Craft: Mung Bean Camp Porridge |
| `mung_bean_crackers` | Mung Bean Field Crackers | Prepared grain meals | 1 | 0.16 | Craft: Mung Bean Field Crackers |
| `mung_bean_honey_cluster` | Mung Bean Honey Cluster | Prepared grain meals | 1 | 0.21 | Craft: Mung Bean Honey Cluster |
| `mung_bean_travel_biscuit` | Mung Bean Travel Biscuit | Prepared grain meals | 2 | 0.23 | Craft: Mung Bean Travel Biscuit |
| `nectarine` | Nectarine | Orchard and berry food | 0 | 0.20 | Loot: farm, grocery, house, market, restaurant |
| `nectarine_compote` | Nectarine Camp Compote | Prepared fruit meals | 1 | 0.44 | Craft: Nectarine Camp Compote |
| `nectarine_dried_slices` | Nectarine Dried Slices | Prepared fruit meals | 1 | 0.12 | Craft: Nectarine Dried Slices |
| `nectarine_fruit_leather` | Nectarine Fruit Leather | Prepared fruit meals | 1 | 0.14 | Craft: Nectarine Fruit Leather |
| `nectarine_grain_bowl` | Nectarine Grain Bowl | Prepared fruit meals | 2 | 0.50 | Craft: Nectarine Grain Bowl |
| `nectarine_preserve` | Nectarine Pantry Preserve | Prepared fruit meals | 1 | 0.28 | Craft: Nectarine Pantry Preserve |
| `nectarine_salad` | Nectarine Salad | Prepared fruit meals | 1 | 0.36 | Craft: Nectarine Salad |
| `nectarine_trail_mix` | Nectarine Trail Mix | Prepared fruit meals | 2 | 0.23 | Craft: Nectarine Trail Mix |
| `oat_bar` | Oat bar | food | 0 | 0.09 | Loot: grocery, market |
| `onion` | Onion | Garden food | 0 | 0.20 | Loot: farm, grocery, market, restaurant, suburban |
| `onion_roast` | Onion Camp Roast | Prepared vegetable meals | 1 | 0.31 | Craft: Onion Camp Roast |
| `onion_camp_soup` | Onion Camp Soup | Prepared vegetable meals | 1 | 0.58 | Craft: Onion Camp Soup |
| `onion_flatbread` | Onion Garden Flatbread | Prepared vegetable meals | 2 | 0.32 | Craft: Onion Garden Flatbread |
| `onion_pickle` | Onion Salted Pickle | Prepared vegetable meals | 1 | 0.24 | Craft: Onion Salted Pickle |
| `onion_porridge` | Onion Savory Porridge | Prepared vegetable meals | 1 | 0.54 | Craft: Onion Savory Porridge |
| `onion_supper_packet` | Onion Supper Packet | Prepared vegetable meals | 2 | 0.42 | Craft: Onion Supper Packet |
| `onion_crisp` | Onion Vegetable Crisp | Prepared vegetable meals | 1 | 0.13 | Craft: Onion Vegetable Crisp |
| `orange` | Orange | food | 0 | 0.17 | Loot: grocery, market |
| `papaya` | Papaya | Orchard and berry food | 0 | 0.16 | Loot: farm, grocery, house, market, restaurant |
| `papaya_compote` | Papaya Camp Compote | Prepared fruit meals | 1 | 0.47 | Craft: Papaya Camp Compote |
| `papaya_dried_slices` | Papaya Dried Slices | Prepared fruit meals | 1 | 0.15 | Craft: Papaya Dried Slices |
| `papaya_fruit_leather` | Papaya Fruit Leather | Prepared fruit meals | 1 | 0.17 | Craft: Papaya Fruit Leather |
| `papaya_grain_bowl` | Papaya Grain Bowl | Prepared fruit meals | 2 | 0.53 | Craft: Papaya Grain Bowl |
| `papaya_preserve` | Papaya Pantry Preserve | Prepared fruit meals | 1 | 0.31 | Craft: Papaya Pantry Preserve |
| `papaya_salad` | Papaya Salad | Prepared fruit meals | 1 | 0.39 | Craft: Papaya Salad |
| `papaya_trail_mix` | Papaya Trail Mix | Prepared fruit meals | 2 | 0.26 | Craft: Papaya Trail Mix |
| `parsnip` | Parsnip | Garden food | 0 | 0.25 | Loot: farm, grocery, market, restaurant, suburban |
| `parsnip_roast` | Parsnip Camp Roast | Prepared vegetable meals | 1 | 0.32 | Craft: Parsnip Camp Roast |
| `parsnip_camp_soup` | Parsnip Camp Soup | Prepared vegetable meals | 1 | 0.59 | Craft: Parsnip Camp Soup |
| `parsnip_flatbread` | Parsnip Garden Flatbread | Prepared vegetable meals | 2 | 0.33 | Craft: Parsnip Garden Flatbread |
| `parsnip_pickle` | Parsnip Salted Pickle | Prepared vegetable meals | 1 | 0.25 | Craft: Parsnip Salted Pickle |
| `parsnip_porridge` | Parsnip Savory Porridge | Prepared vegetable meals | 1 | 0.55 | Craft: Parsnip Savory Porridge |
| `parsnip_supper_packet` | Parsnip Supper Packet | Prepared vegetable meals | 2 | 0.43 | Craft: Parsnip Supper Packet |
| `parsnip_crisp` | Parsnip Vegetable Crisp | Prepared vegetable meals | 1 | 0.14 | Craft: Parsnip Vegetable Crisp |
| `passionfruit` | Passionfruit | Orchard and berry food | 0 | 0.20 | Loot: farm, grocery, house, market, restaurant |
| `passionfruit_compote` | Passionfruit Camp Compote | Prepared fruit meals | 1 | 0.46 | Craft: Passionfruit Camp Compote |
| `passionfruit_dried_slices` | Passionfruit Dried Slices | Prepared fruit meals | 1 | 0.14 | Craft: Passionfruit Dried Slices |
| `passionfruit_fruit_leather` | Passionfruit Fruit Leather | Prepared fruit meals | 1 | 0.16 | Craft: Passionfruit Fruit Leather |
| `passionfruit_grain_bowl` | Passionfruit Grain Bowl | Prepared fruit meals | 2 | 0.52 | Craft: Passionfruit Grain Bowl |
| `passionfruit_preserve` | Passionfruit Pantry Preserve | Prepared fruit meals | 1 | 0.30 | Craft: Passionfruit Pantry Preserve |
| `passionfruit_salad` | Passionfruit Salad | Prepared fruit meals | 1 | 0.38 | Craft: Passionfruit Salad |
| `passionfruit_trail_mix` | Passionfruit Trail Mix | Prepared fruit meals | 2 | 0.25 | Craft: Passionfruit Trail Mix |
| `pasta` | Pasta packet | food | 0 | 0.30 | Loot: grocery, house, market, suburban, urban |
| `peach` | Peach | Orchard and berry food | 0 | 0.16 | Loot: farm, grocery, house, market, restaurant |
| `peach_compote` | Peach Camp Compote | Prepared fruit meals | 1 | 0.45 | Craft: Peach Camp Compote |
| `peach_dried_slices` | Peach Dried Slices | Prepared fruit meals | 1 | 0.13 | Craft: Peach Dried Slices |
| `peach_fruit_leather` | Peach Fruit Leather | Prepared fruit meals | 1 | 0.15 | Craft: Peach Fruit Leather |
| `peach_grain_bowl` | Peach Grain Bowl | Prepared fruit meals | 2 | 0.51 | Craft: Peach Grain Bowl |
| `peach_preserve` | Peach Pantry Preserve | Prepared fruit meals | 1 | 0.29 | Craft: Peach Pantry Preserve |
| `peach_salad` | Peach Salad | Prepared fruit meals | 1 | 0.37 | Craft: Peach Salad |
| `peach_trail_mix` | Peach Trail Mix | Prepared fruit meals | 2 | 0.24 | Craft: Peach Trail Mix |
| `peanut_butter` | Peanut butter jar | food | 0 | 0.35 | Loot: house |
| `pear` | Pear | food | 0 | 0.18 | Loot: farm, grocery, market |
| `persimmon` | Persimmon | Orchard and berry food | 0 | 0.16 | Loot: farm, grocery, house, market, restaurant |
| `persimmon_compote` | Persimmon Camp Compote | Prepared fruit meals | 1 | 0.46 | Craft: Persimmon Camp Compote |
| `persimmon_dried_slices` | Persimmon Dried Slices | Prepared fruit meals | 1 | 0.14 | Craft: Persimmon Dried Slices |
| `persimmon_fruit_leather` | Persimmon Fruit Leather | Prepared fruit meals | 1 | 0.16 | Craft: Persimmon Fruit Leather |
| `persimmon_grain_bowl` | Persimmon Grain Bowl | Prepared fruit meals | 2 | 0.52 | Craft: Persimmon Grain Bowl |
| `persimmon_preserve` | Persimmon Pantry Preserve | Prepared fruit meals | 1 | 0.30 | Craft: Persimmon Pantry Preserve |
| `persimmon_salad` | Persimmon Salad | Prepared fruit meals | 1 | 0.38 | Craft: Persimmon Salad |
| `persimmon_trail_mix` | Persimmon Trail Mix | Prepared fruit meals | 2 | 0.25 | Craft: Persimmon Trail Mix |
| `pineapple` | Pineapple | Orchard and berry food | 0 | 0.17 | Loot: farm, grocery, house, market, restaurant |
| `pineapple_compote` | Pineapple Camp Compote | Prepared fruit meals | 1 | 0.44 | Craft: Pineapple Camp Compote |
| `pineapple_dried_slices` | Pineapple Dried Slices | Prepared fruit meals | 1 | 0.12 | Craft: Pineapple Dried Slices |
| `pineapple_fruit_leather` | Pineapple Fruit Leather | Prepared fruit meals | 1 | 0.14 | Craft: Pineapple Fruit Leather |
| `pineapple_grain_bowl` | Pineapple Grain Bowl | Prepared fruit meals | 2 | 0.50 | Craft: Pineapple Grain Bowl |
| `pineapple_preserve` | Pineapple Pantry Preserve | Prepared fruit meals | 1 | 0.28 | Craft: Pineapple Pantry Preserve |
| `pineapple_salad` | Pineapple Salad | Prepared fruit meals | 1 | 0.36 | Craft: Pineapple Salad |
| `pineapple_trail_mix` | Pineapple Trail Mix | Prepared fruit meals | 2 | 0.23 | Craft: Pineapple Trail Mix |
| `plum` | Plum | Orchard and berry food | 0 | 0.17 | Loot: farm, grocery, house, market, restaurant |
| `plum_compote` | Plum Camp Compote | Prepared fruit meals | 1 | 0.46 | Craft: Plum Camp Compote |
| `plum_dried_slices` | Plum Dried Slices | Prepared fruit meals | 1 | 0.14 | Craft: Plum Dried Slices |
| `plum_fruit_leather` | Plum Fruit Leather | Prepared fruit meals | 1 | 0.16 | Craft: Plum Fruit Leather |
| `plum_grain_bowl` | Plum Grain Bowl | Prepared fruit meals | 2 | 0.52 | Craft: Plum Grain Bowl |
| `plum_preserve` | Plum Pantry Preserve | Prepared fruit meals | 1 | 0.30 | Craft: Plum Pantry Preserve |
| `plum_salad` | Plum Salad | Prepared fruit meals | 1 | 0.38 | Craft: Plum Salad |
| `plum_trail_mix` | Plum Trail Mix | Prepared fruit meals | 2 | 0.25 | Craft: Plum Trail Mix |
| `polenta` | Polenta | Grain and pulse food | 0 | 0.29 | Loot: depot, farm, grocery, market, restaurant, warehouse |
| `polenta_bean_bowl` | Polenta Bean Bowl | Prepared grain meals | 1 | 0.63 | Craft: Polenta Bean Bowl |
| `polenta_broth_dumplings` | Polenta Broth Dumplings | Prepared grain meals | 2 | 0.61 | Craft: Polenta Broth Dumplings |
| `polenta_flatbread` | Polenta Camp Flatbread | Prepared grain meals | 1 | 0.33 | Craft: Polenta Camp Flatbread |
| `polenta_porridge` | Polenta Camp Porridge | Prepared grain meals | 1 | 0.58 | Craft: Polenta Camp Porridge |
| `polenta_crackers` | Polenta Field Crackers | Prepared grain meals | 1 | 0.17 | Craft: Polenta Field Crackers |
| `polenta_honey_cluster` | Polenta Honey Cluster | Prepared grain meals | 1 | 0.22 | Craft: Polenta Honey Cluster |
| `polenta_travel_biscuit` | Polenta Travel Biscuit | Prepared grain meals | 2 | 0.24 | Craft: Polenta Travel Biscuit |
| `pomegranate` | Pomegranate | Orchard and berry food | 0 | 0.17 | Loot: farm, grocery, house, market, restaurant |
| `pomegranate_compote` | Pomegranate Camp Compote | Prepared fruit meals | 1 | 0.47 | Craft: Pomegranate Camp Compote |
| `pomegranate_dried_slices` | Pomegranate Dried Slices | Prepared fruit meals | 1 | 0.15 | Craft: Pomegranate Dried Slices |
| `pomegranate_fruit_leather` | Pomegranate Fruit Leather | Prepared fruit meals | 1 | 0.17 | Craft: Pomegranate Fruit Leather |
| `pomegranate_grain_bowl` | Pomegranate Grain Bowl | Prepared fruit meals | 2 | 0.53 | Craft: Pomegranate Grain Bowl |
| `pomegranate_preserve` | Pomegranate Pantry Preserve | Prepared fruit meals | 1 | 0.31 | Craft: Pomegranate Pantry Preserve |
| `pomegranate_salad` | Pomegranate Salad | Prepared fruit meals | 1 | 0.39 | Craft: Pomegranate Salad |
| `pomegranate_trail_mix` | Pomegranate Trail Mix | Prepared fruit meals | 2 | 0.26 | Craft: Pomegranate Trail Mix |
| `potato` | Potato | food | 0 | 0.22 | Loot: farm, restaurant |
| `protein_bar` | Protein bar | food | 0 | 0.10 | Loot: grocery, market |
| `pumpkin` | Pumpkin | Garden food | 0 | 0.20 | Loot: farm, grocery, market, restaurant, suburban |
| `pumpkin_roast` | Pumpkin Camp Roast | Prepared vegetable meals | 1 | 0.31 | Craft: Pumpkin Camp Roast |
| `pumpkin_camp_soup` | Pumpkin Camp Soup | Prepared vegetable meals | 1 | 0.58 | Craft: Pumpkin Camp Soup |
| `pumpkin_flatbread` | Pumpkin Garden Flatbread | Prepared vegetable meals | 2 | 0.32 | Craft: Pumpkin Garden Flatbread |
| `pumpkin_pickle` | Pumpkin Salted Pickle | Prepared vegetable meals | 1 | 0.24 | Craft: Pumpkin Salted Pickle |
| `pumpkin_porridge` | Pumpkin Savory Porridge | Prepared vegetable meals | 1 | 0.54 | Craft: Pumpkin Savory Porridge |
| `pumpkin_supper_packet` | Pumpkin Supper Packet | Prepared vegetable meals | 2 | 0.42 | Craft: Pumpkin Supper Packet |
| `pumpkin_crisp` | Pumpkin Vegetable Crisp | Prepared vegetable meals | 1 | 0.13 | Craft: Pumpkin Vegetable Crisp |
| `quince` | Quince | Orchard and berry food | 0 | 0.14 | Loot: farm, grocery, house, market, restaurant |
| `quince_compote` | Quince Camp Compote | Prepared fruit meals | 1 | 0.45 | Craft: Quince Camp Compote |
| `quince_dried_slices` | Quince Dried Slices | Prepared fruit meals | 1 | 0.13 | Craft: Quince Dried Slices |
| `quince_fruit_leather` | Quince Fruit Leather | Prepared fruit meals | 1 | 0.15 | Craft: Quince Fruit Leather |
| `quince_grain_bowl` | Quince Grain Bowl | Prepared fruit meals | 2 | 0.51 | Craft: Quince Grain Bowl |
| `quince_preserve` | Quince Pantry Preserve | Prepared fruit meals | 1 | 0.29 | Craft: Quince Pantry Preserve |
| `quince_salad` | Quince Salad | Prepared fruit meals | 1 | 0.37 | Craft: Quince Salad |
| `quince_trail_mix` | Quince Trail Mix | Prepared fruit meals | 2 | 0.24 | Craft: Quince Trail Mix |
| `quinoa` | Quinoa | Grain and pulse food | 0 | 0.26 | Loot: depot, farm, grocery, market, restaurant, warehouse |
| `quinoa_bean_bowl` | Quinoa Bean Bowl | Prepared grain meals | 1 | 0.64 | Craft: Quinoa Bean Bowl |
| `quinoa_broth_dumplings` | Quinoa Broth Dumplings | Prepared grain meals | 2 | 0.62 | Craft: Quinoa Broth Dumplings |
| `quinoa_flatbread` | Quinoa Camp Flatbread | Prepared grain meals | 1 | 0.34 | Craft: Quinoa Camp Flatbread |
| `quinoa_porridge` | Quinoa Camp Porridge | Prepared grain meals | 1 | 0.59 | Craft: Quinoa Camp Porridge |
| `quinoa_crackers` | Quinoa Field Crackers | Prepared grain meals | 1 | 0.18 | Craft: Quinoa Field Crackers |
| `quinoa_honey_cluster` | Quinoa Honey Cluster | Prepared grain meals | 1 | 0.23 | Craft: Quinoa Honey Cluster |
| `quinoa_travel_biscuit` | Quinoa Travel Biscuit | Prepared grain meals | 2 | 0.25 | Craft: Quinoa Travel Biscuit |
| `radish` | Radish | Garden food | 0 | 0.22 | Loot: farm, grocery, market, restaurant, suburban |
| `radish_roast` | Radish Camp Roast | Prepared vegetable meals | 1 | 0.31 | Craft: Radish Camp Roast |
| `radish_camp_soup` | Radish Camp Soup | Prepared vegetable meals | 1 | 0.58 | Craft: Radish Camp Soup |
| `radish_flatbread` | Radish Garden Flatbread | Prepared vegetable meals | 2 | 0.32 | Craft: Radish Garden Flatbread |
| `radish_pickle` | Radish Salted Pickle | Prepared vegetable meals | 1 | 0.24 | Craft: Radish Salted Pickle |
| `radish_porridge` | Radish Savory Porridge | Prepared vegetable meals | 1 | 0.54 | Craft: Radish Savory Porridge |
| `radish_supper_packet` | Radish Supper Packet | Prepared vegetable meals | 2 | 0.42 | Craft: Radish Supper Packet |
| `radish_crisp` | Radish Vegetable Crisp | Prepared vegetable meals | 1 | 0.13 | Craft: Radish Vegetable Crisp |
| `raspberry` | Raspberry | Orchard and berry food | 0 | 0.19 | Loot: farm, grocery, house, market, restaurant |
| `raspberry_compote` | Raspberry Camp Compote | Prepared fruit meals | 1 | 0.47 | Craft: Raspberry Camp Compote |
| `raspberry_dried_slices` | Raspberry Dried Slices | Prepared fruit meals | 1 | 0.15 | Craft: Raspberry Dried Slices |
| `raspberry_fruit_leather` | Raspberry Fruit Leather | Prepared fruit meals | 1 | 0.17 | Craft: Raspberry Fruit Leather |
| `raspberry_grain_bowl` | Raspberry Grain Bowl | Prepared fruit meals | 2 | 0.53 | Craft: Raspberry Grain Bowl |
| `raspberry_preserve` | Raspberry Pantry Preserve | Prepared fruit meals | 1 | 0.31 | Craft: Raspberry Pantry Preserve |
| `raspberry_salad` | Raspberry Salad | Prepared fruit meals | 1 | 0.39 | Craft: Raspberry Salad |
| `raspberry_trail_mix` | Raspberry Trail Mix | Prepared fruit meals | 2 | 0.26 | Craft: Raspberry Trail Mix |
| `rice_meal` | Rice and beans | food | 0 | 0.55 | Craft: Rice and beans |
| `rice` | Rice packet | food | 0 | 0.30 | Loot: grocery, house, market, suburban, urban |
| `oats` | Rolled oats | food | 0 | 0.25 | Loot: grocery, house, market, restaurant, suburban, urban |
| `rutabaga` | Rutabaga | Garden food | 0 | 0.26 | Loot: farm, grocery, market, restaurant, suburban |
| `rutabaga_roast` | Rutabaga Camp Roast | Prepared vegetable meals | 1 | 0.33 | Craft: Rutabaga Camp Roast |
| `rutabaga_camp_soup` | Rutabaga Camp Soup | Prepared vegetable meals | 1 | 0.60 | Craft: Rutabaga Camp Soup |
| `rutabaga_flatbread` | Rutabaga Garden Flatbread | Prepared vegetable meals | 2 | 0.34 | Craft: Rutabaga Garden Flatbread |
| `rutabaga_pickle` | Rutabaga Salted Pickle | Prepared vegetable meals | 1 | 0.26 | Craft: Rutabaga Salted Pickle |
| `rutabaga_porridge` | Rutabaga Savory Porridge | Prepared vegetable meals | 1 | 0.56 | Craft: Rutabaga Savory Porridge |
| `rutabaga_supper_packet` | Rutabaga Supper Packet | Prepared vegetable meals | 2 | 0.44 | Craft: Rutabaga Supper Packet |
| `rutabaga_crisp` | Rutabaga Vegetable Crisp | Prepared vegetable meals | 1 | 0.15 | Craft: Rutabaga Vegetable Crisp |
| `rye` | Rye | Grain and pulse food | 0 | 0.25 | Loot: depot, farm, grocery, market, restaurant, warehouse |
| `rye_bean_bowl` | Rye Bean Bowl | Prepared grain meals | 1 | 0.62 | Craft: Rye Bean Bowl |
| `rye_broth_dumplings` | Rye Broth Dumplings | Prepared grain meals | 2 | 0.60 | Craft: Rye Broth Dumplings |
| `rye_flatbread` | Rye Camp Flatbread | Prepared grain meals | 1 | 0.32 | Craft: Rye Camp Flatbread |
| `rye_porridge` | Rye Camp Porridge | Prepared grain meals | 1 | 0.57 | Craft: Rye Camp Porridge |
| `rye_crackers` | Rye Field Crackers | Prepared grain meals | 1 | 0.16 | Craft: Rye Field Crackers |
| `rye_honey_cluster` | Rye Honey Cluster | Prepared grain meals | 1 | 0.21 | Craft: Rye Honey Cluster |
| `rye_travel_biscuit` | Rye Travel Biscuit | Prepared grain meals | 2 | 0.23 | Craft: Rye Travel Biscuit |
| `semolina` | Semolina | Grain and pulse food | 0 | 0.23 | Loot: depot, farm, grocery, market, restaurant, warehouse |
| `semolina_bean_bowl` | Semolina Bean Bowl | Prepared grain meals | 1 | 0.64 | Craft: Semolina Bean Bowl |
| `semolina_broth_dumplings` | Semolina Broth Dumplings | Prepared grain meals | 2 | 0.62 | Craft: Semolina Broth Dumplings |
| `semolina_flatbread` | Semolina Camp Flatbread | Prepared grain meals | 1 | 0.34 | Craft: Semolina Camp Flatbread |
| `semolina_porridge` | Semolina Camp Porridge | Prepared grain meals | 1 | 0.59 | Craft: Semolina Camp Porridge |
| `semolina_crackers` | Semolina Field Crackers | Prepared grain meals | 1 | 0.18 | Craft: Semolina Field Crackers |
| `semolina_honey_cluster` | Semolina Honey Cluster | Prepared grain meals | 1 | 0.23 | Craft: Semolina Honey Cluster |
| `semolina_travel_biscuit` | Semolina Travel Biscuit | Prepared grain meals | 2 | 0.25 | Craft: Semolina Travel Biscuit |
| `shallot` | Shallot | Garden food | 0 | 0.25 | Loot: farm, grocery, market, restaurant, suburban |
| `shallot_roast` | Shallot Camp Roast | Prepared vegetable meals | 1 | 0.34 | Craft: Shallot Camp Roast |
| `shallot_camp_soup` | Shallot Camp Soup | Prepared vegetable meals | 1 | 0.61 | Craft: Shallot Camp Soup |
| `shallot_flatbread` | Shallot Garden Flatbread | Prepared vegetable meals | 2 | 0.35 | Craft: Shallot Garden Flatbread |
| `shallot_pickle` | Shallot Salted Pickle | Prepared vegetable meals | 1 | 0.27 | Craft: Shallot Salted Pickle |
| `shallot_porridge` | Shallot Savory Porridge | Prepared vegetable meals | 1 | 0.57 | Craft: Shallot Savory Porridge |
| `shallot_supper_packet` | Shallot Supper Packet | Prepared vegetable meals | 2 | 0.45 | Craft: Shallot Supper Packet |
| `shallot_crisp` | Shallot Vegetable Crisp | Prepared vegetable meals | 1 | 0.16 | Craft: Shallot Vegetable Crisp |
| `smoked_ham` | Smoked Ham | Protein supplies | 0 | 0.17 | Loot: camp, grocery, house, market, ranger, restaurant |
| `smoked_ham_broth_bowl` | Smoked Ham Broth Bowl | Prepared protein meals | 2 | 0.64 | Craft: Smoked Ham Broth Bowl |
| `smoked_ham_stew` | Smoked Ham Camp Stew | Prepared protein meals | 1 | 0.62 | Craft: Smoked Ham Camp Stew |
| `smoked_ham_sandwich` | Smoked Ham Field Sandwich | Prepared protein meals | 1 | 0.36 | Craft: Smoked Ham Field Sandwich |
| `smoked_ham_skillet` | Smoked Ham Skillet Meal | Prepared protein meals | 1 | 0.41 | Craft: Smoked Ham Skillet Meal |
| `smoked_ham_smoked_ration` | Smoked Ham Smoked Ration | Prepared protein meals | 1 | 0.20 | Craft: Smoked Ham Smoked Ration |
| `smoked_ham_jerky` | Smoked Ham Trail Jerky | Prepared protein meals | 1 | 0.13 | Craft: Smoked Ham Trail Jerky |
| `smoked_ham_meal_packet` | Smoked Ham Travel Meal Packet | Prepared protein meals | 2 | 0.39 | Craft: Smoked Ham Travel Meal Packet |
| `smoked_pork` | Smoked Pork | Protein supplies | 0 | 0.19 | Loot: camp, grocery, house, market, ranger, restaurant |
| `smoked_pork_broth_bowl` | Smoked Pork Broth Bowl | Prepared protein meals | 2 | 0.65 | Craft: Smoked Pork Broth Bowl |
| `smoked_pork_stew` | Smoked Pork Camp Stew | Prepared protein meals | 1 | 0.63 | Craft: Smoked Pork Camp Stew |
| `smoked_pork_sandwich` | Smoked Pork Field Sandwich | Prepared protein meals | 1 | 0.37 | Craft: Smoked Pork Field Sandwich |
| `smoked_pork_skillet` | Smoked Pork Skillet Meal | Prepared protein meals | 1 | 0.42 | Craft: Smoked Pork Skillet Meal |
| `smoked_pork_smoked_ration` | Smoked Pork Smoked Ration | Prepared protein meals | 1 | 0.21 | Craft: Smoked Pork Smoked Ration |
| `smoked_pork_jerky` | Smoked Pork Trail Jerky | Prepared protein meals | 1 | 0.14 | Craft: Smoked Pork Trail Jerky |
| `smoked_pork_meal_packet` | Smoked Pork Travel Meal Packet | Prepared protein meals | 2 | 0.40 | Craft: Smoked Pork Travel Meal Packet |
| `smoked_rabbit` | Smoked Rabbit | Protein supplies | 0 | 0.17 | Loot: camp, grocery, house, market, ranger, restaurant |
| `smoked_rabbit_broth_bowl` | Smoked Rabbit Broth Bowl | Prepared protein meals | 2 | 0.64 | Craft: Smoked Rabbit Broth Bowl |
| `smoked_rabbit_stew` | Smoked Rabbit Camp Stew | Prepared protein meals | 1 | 0.62 | Craft: Smoked Rabbit Camp Stew |
| `smoked_rabbit_sandwich` | Smoked Rabbit Field Sandwich | Prepared protein meals | 1 | 0.36 | Craft: Smoked Rabbit Field Sandwich |
| `smoked_rabbit_skillet` | Smoked Rabbit Skillet Meal | Prepared protein meals | 1 | 0.41 | Craft: Smoked Rabbit Skillet Meal |
| `smoked_rabbit_smoked_ration` | Smoked Rabbit Smoked Ration | Prepared protein meals | 1 | 0.20 | Craft: Smoked Rabbit Smoked Ration |
| `smoked_rabbit_jerky` | Smoked Rabbit Trail Jerky | Prepared protein meals | 1 | 0.13 | Craft: Smoked Rabbit Trail Jerky |
| `smoked_rabbit_meal_packet` | Smoked Rabbit Travel Meal Packet | Prepared protein meals | 2 | 0.39 | Craft: Smoked Rabbit Travel Meal Packet |
| `smoked_venison` | Smoked Venison | Protein supplies | 0 | 0.23 | Loot: camp, grocery, house, market, ranger, restaurant |
| `smoked_venison_broth_bowl` | Smoked Venison Broth Bowl | Prepared protein meals | 2 | 0.67 | Craft: Smoked Venison Broth Bowl |
| `smoked_venison_stew` | Smoked Venison Camp Stew | Prepared protein meals | 1 | 0.65 | Craft: Smoked Venison Camp Stew |
| `smoked_venison_sandwich` | Smoked Venison Field Sandwich | Prepared protein meals | 1 | 0.39 | Craft: Smoked Venison Field Sandwich |
| `smoked_venison_skillet` | Smoked Venison Skillet Meal | Prepared protein meals | 1 | 0.44 | Craft: Smoked Venison Skillet Meal |
| `smoked_venison_smoked_ration` | Smoked Venison Smoked Ration | Prepared protein meals | 1 | 0.23 | Craft: Smoked Venison Smoked Ration |
| `smoked_venison_jerky` | Smoked Venison Trail Jerky | Prepared protein meals | 1 | 0.16 | Craft: Smoked Venison Trail Jerky |
| `smoked_venison_meal_packet` | Smoked Venison Travel Meal Packet | Prepared protein meals | 2 | 0.42 | Craft: Smoked Venison Travel Meal Packet |
| `sorghum` | Sorghum | Grain and pulse food | 0 | 0.23 | Loot: depot, farm, grocery, market, restaurant, warehouse |
| `sorghum_bean_bowl` | Sorghum Bean Bowl | Prepared grain meals | 1 | 0.62 | Craft: Sorghum Bean Bowl |
| `sorghum_broth_dumplings` | Sorghum Broth Dumplings | Prepared grain meals | 2 | 0.60 | Craft: Sorghum Broth Dumplings |
| `sorghum_flatbread` | Sorghum Camp Flatbread | Prepared grain meals | 1 | 0.32 | Craft: Sorghum Camp Flatbread |
| `sorghum_porridge` | Sorghum Camp Porridge | Prepared grain meals | 1 | 0.57 | Craft: Sorghum Camp Porridge |
| `sorghum_crackers` | Sorghum Field Crackers | Prepared grain meals | 1 | 0.16 | Craft: Sorghum Field Crackers |
| `sorghum_honey_cluster` | Sorghum Honey Cluster | Prepared grain meals | 1 | 0.21 | Craft: Sorghum Honey Cluster |
| `sorghum_travel_biscuit` | Sorghum Travel Biscuit | Prepared grain meals | 2 | 0.23 | Craft: Sorghum Travel Biscuit |
| `spelt` | Spelt | Grain and pulse food | 0 | 0.29 | Loot: depot, farm, grocery, market, restaurant, warehouse |
| `spelt_bean_bowl` | Spelt Bean Bowl | Prepared grain meals | 1 | 0.61 | Craft: Spelt Bean Bowl |
| `spelt_broth_dumplings` | Spelt Broth Dumplings | Prepared grain meals | 2 | 0.59 | Craft: Spelt Broth Dumplings |
| `spelt_flatbread` | Spelt Camp Flatbread | Prepared grain meals | 1 | 0.31 | Craft: Spelt Camp Flatbread |
| `spelt_porridge` | Spelt Camp Porridge | Prepared grain meals | 1 | 0.56 | Craft: Spelt Camp Porridge |
| `spelt_crackers` | Spelt Field Crackers | Prepared grain meals | 1 | 0.15 | Craft: Spelt Field Crackers |
| `spelt_honey_cluster` | Spelt Honey Cluster | Prepared grain meals | 1 | 0.20 | Craft: Spelt Honey Cluster |
| `spelt_travel_biscuit` | Spelt Travel Biscuit | Prepared grain meals | 2 | 0.22 | Craft: Spelt Travel Biscuit |
| `spinach` | Spinach | Garden food | 0 | 0.22 | Loot: farm, grocery, market, restaurant, suburban |
| `spinach_roast` | Spinach Camp Roast | Prepared vegetable meals | 1 | 0.33 | Craft: Spinach Camp Roast |
| `spinach_camp_soup` | Spinach Camp Soup | Prepared vegetable meals | 1 | 0.60 | Craft: Spinach Camp Soup |
| `spinach_flatbread` | Spinach Garden Flatbread | Prepared vegetable meals | 2 | 0.34 | Craft: Spinach Garden Flatbread |
| `spinach_pickle` | Spinach Salted Pickle | Prepared vegetable meals | 1 | 0.26 | Craft: Spinach Salted Pickle |
| `spinach_porridge` | Spinach Savory Porridge | Prepared vegetable meals | 1 | 0.56 | Craft: Spinach Savory Porridge |
| `spinach_supper_packet` | Spinach Supper Packet | Prepared vegetable meals | 2 | 0.44 | Craft: Spinach Supper Packet |
| `spinach_crisp` | Spinach Vegetable Crisp | Prepared vegetable meals | 1 | 0.15 | Craft: Spinach Vegetable Crisp |
| `split_pea` | Split Pea | Grain and pulse food | 0 | 0.26 | Loot: depot, farm, grocery, market, restaurant, warehouse |
| `split_pea_bean_bowl` | Split Pea Bean Bowl | Prepared grain meals | 1 | 0.61 | Craft: Split Pea Bean Bowl |
| `split_pea_broth_dumplings` | Split Pea Broth Dumplings | Prepared grain meals | 2 | 0.59 | Craft: Split Pea Broth Dumplings |
| `split_pea_flatbread` | Split Pea Camp Flatbread | Prepared grain meals | 1 | 0.31 | Craft: Split Pea Camp Flatbread |
| `split_pea_porridge` | Split Pea Camp Porridge | Prepared grain meals | 1 | 0.56 | Craft: Split Pea Camp Porridge |
| `split_pea_crackers` | Split Pea Field Crackers | Prepared grain meals | 1 | 0.15 | Craft: Split Pea Field Crackers |
| `split_pea_honey_cluster` | Split Pea Honey Cluster | Prepared grain meals | 1 | 0.20 | Craft: Split Pea Honey Cluster |
| `split_pea_travel_biscuit` | Split Pea Travel Biscuit | Prepared grain meals | 2 | 0.22 | Craft: Split Pea Travel Biscuit |
| `squash` | Squash | Garden food | 0 | 0.22 | Loot: farm, grocery, market, restaurant, suburban |
| `squash_roast` | Squash Camp Roast | Prepared vegetable meals | 1 | 0.32 | Craft: Squash Camp Roast |
| `squash_camp_soup` | Squash Camp Soup | Prepared vegetable meals | 1 | 0.59 | Craft: Squash Camp Soup |
| `squash_flatbread` | Squash Garden Flatbread | Prepared vegetable meals | 2 | 0.33 | Craft: Squash Garden Flatbread |
| `squash_pickle` | Squash Salted Pickle | Prepared vegetable meals | 1 | 0.25 | Craft: Squash Salted Pickle |
| `squash_porridge` | Squash Savory Porridge | Prepared vegetable meals | 1 | 0.55 | Craft: Squash Savory Porridge |
| `squash_supper_packet` | Squash Supper Packet | Prepared vegetable meals | 2 | 0.43 | Craft: Squash Supper Packet |
| `squash_crisp` | Squash Vegetable Crisp | Prepared vegetable meals | 1 | 0.14 | Craft: Squash Vegetable Crisp |
| `strawberry` | Strawberry | Orchard and berry food | 0 | 0.20 | Loot: farm, grocery, house, market, restaurant |
| `strawberry_compote` | Strawberry Camp Compote | Prepared fruit meals | 1 | 0.44 | Craft: Strawberry Camp Compote |
| `strawberry_dried_slices` | Strawberry Dried Slices | Prepared fruit meals | 1 | 0.12 | Craft: Strawberry Dried Slices |
| `strawberry_fruit_leather` | Strawberry Fruit Leather | Prepared fruit meals | 1 | 0.14 | Craft: Strawberry Fruit Leather |
| `strawberry_grain_bowl` | Strawberry Grain Bowl | Prepared fruit meals | 2 | 0.50 | Craft: Strawberry Grain Bowl |
| `strawberry_preserve` | Strawberry Pantry Preserve | Prepared fruit meals | 1 | 0.28 | Craft: Strawberry Pantry Preserve |
| `strawberry_salad` | Strawberry Salad | Prepared fruit meals | 1 | 0.36 | Craft: Strawberry Salad |
| `strawberry_trail_mix` | Strawberry Trail Mix | Prepared fruit meals | 2 | 0.23 | Craft: Strawberry Trail Mix |
| `sweet_potato` | Sweet Potato | Garden food | 0 | 0.26 | Loot: farm, grocery, market, restaurant, suburban |
| `sweet_potato_roast` | Sweet Potato Camp Roast | Prepared vegetable meals | 1 | 0.31 | Craft: Sweet Potato Camp Roast |
| `sweet_potato_camp_soup` | Sweet Potato Camp Soup | Prepared vegetable meals | 1 | 0.58 | Craft: Sweet Potato Camp Soup |
| `sweet_potato_flatbread` | Sweet Potato Garden Flatbread | Prepared vegetable meals | 2 | 0.32 | Craft: Sweet Potato Garden Flatbread |
| `sweet_potato_pickle` | Sweet Potato Salted Pickle | Prepared vegetable meals | 1 | 0.24 | Craft: Sweet Potato Salted Pickle |
| `sweet_potato_porridge` | Sweet Potato Savory Porridge | Prepared vegetable meals | 1 | 0.54 | Craft: Sweet Potato Savory Porridge |
| `sweet_potato_supper_packet` | Sweet Potato Supper Packet | Prepared vegetable meals | 2 | 0.42 | Craft: Sweet Potato Supper Packet |
| `sweet_potato_crisp` | Sweet Potato Vegetable Crisp | Prepared vegetable meals | 1 | 0.13 | Craft: Sweet Potato Vegetable Crisp |
| `tangerine` | Tangerine | Orchard and berry food | 0 | 0.14 | Loot: farm, grocery, house, market, restaurant |
| `tangerine_compote` | Tangerine Camp Compote | Prepared fruit meals | 1 | 0.44 | Craft: Tangerine Camp Compote |
| `tangerine_dried_slices` | Tangerine Dried Slices | Prepared fruit meals | 1 | 0.12 | Craft: Tangerine Dried Slices |
| `tangerine_fruit_leather` | Tangerine Fruit Leather | Prepared fruit meals | 1 | 0.14 | Craft: Tangerine Fruit Leather |
| `tangerine_grain_bowl` | Tangerine Grain Bowl | Prepared fruit meals | 2 | 0.50 | Craft: Tangerine Grain Bowl |
| `tangerine_preserve` | Tangerine Pantry Preserve | Prepared fruit meals | 1 | 0.28 | Craft: Tangerine Pantry Preserve |
| `tangerine_salad` | Tangerine Salad | Prepared fruit meals | 1 | 0.36 | Craft: Tangerine Salad |
| `tangerine_trail_mix` | Tangerine Trail Mix | Prepared fruit meals | 2 | 0.23 | Craft: Tangerine Trail Mix |
| `tinned_chicken` | Tinned Chicken | Protein supplies | 0 | 0.22 | Loot: camp, grocery, house, market, ranger, restaurant |
| `tinned_chicken_broth_bowl` | Tinned Chicken Broth Bowl | Prepared protein meals | 2 | 0.67 | Craft: Tinned Chicken Broth Bowl |
| `tinned_chicken_stew` | Tinned Chicken Camp Stew | Prepared protein meals | 1 | 0.65 | Craft: Tinned Chicken Camp Stew |
| `tinned_chicken_sandwich` | Tinned Chicken Field Sandwich | Prepared protein meals | 1 | 0.39 | Craft: Tinned Chicken Field Sandwich |
| `tinned_chicken_skillet` | Tinned Chicken Skillet Meal | Prepared protein meals | 1 | 0.44 | Craft: Tinned Chicken Skillet Meal |
| `tinned_chicken_smoked_ration` | Tinned Chicken Smoked Ration | Prepared protein meals | 1 | 0.23 | Craft: Tinned Chicken Smoked Ration |
| `tinned_chicken_jerky` | Tinned Chicken Trail Jerky | Prepared protein meals | 1 | 0.16 | Craft: Tinned Chicken Trail Jerky |
| `tinned_chicken_meal_packet` | Tinned Chicken Travel Meal Packet | Prepared protein meals | 2 | 0.42 | Craft: Tinned Chicken Travel Meal Packet |
| `tinned_clam` | Tinned Clam | Protein supplies | 0 | 0.17 | Loot: camp, grocery, house, market, ranger, restaurant |
| `tinned_clam_broth_bowl` | Tinned Clam Broth Bowl | Prepared protein meals | 2 | 0.66 | Craft: Tinned Clam Broth Bowl |
| `tinned_clam_stew` | Tinned Clam Camp Stew | Prepared protein meals | 1 | 0.64 | Craft: Tinned Clam Camp Stew |
| `tinned_clam_sandwich` | Tinned Clam Field Sandwich | Prepared protein meals | 1 | 0.38 | Craft: Tinned Clam Field Sandwich |
| `tinned_clam_skillet` | Tinned Clam Skillet Meal | Prepared protein meals | 1 | 0.43 | Craft: Tinned Clam Skillet Meal |
| `tinned_clam_smoked_ration` | Tinned Clam Smoked Ration | Prepared protein meals | 1 | 0.22 | Craft: Tinned Clam Smoked Ration |
| `tinned_clam_jerky` | Tinned Clam Trail Jerky | Prepared protein meals | 1 | 0.15 | Craft: Tinned Clam Trail Jerky |
| `tinned_clam_meal_packet` | Tinned Clam Travel Meal Packet | Prepared protein meals | 2 | 0.41 | Craft: Tinned Clam Travel Meal Packet |
| `tinned_crab` | Tinned Crab | Protein supplies | 0 | 0.20 | Loot: camp, grocery, house, market, ranger, restaurant |
| `tinned_crab_broth_bowl` | Tinned Crab Broth Bowl | Prepared protein meals | 2 | 0.64 | Craft: Tinned Crab Broth Bowl |
| `tinned_crab_stew` | Tinned Crab Camp Stew | Prepared protein meals | 1 | 0.62 | Craft: Tinned Crab Camp Stew |
| `tinned_crab_sandwich` | Tinned Crab Field Sandwich | Prepared protein meals | 1 | 0.36 | Craft: Tinned Crab Field Sandwich |
| `tinned_crab_skillet` | Tinned Crab Skillet Meal | Prepared protein meals | 1 | 0.41 | Craft: Tinned Crab Skillet Meal |
| `tinned_crab_smoked_ration` | Tinned Crab Smoked Ration | Prepared protein meals | 1 | 0.20 | Craft: Tinned Crab Smoked Ration |
| `tinned_crab_jerky` | Tinned Crab Trail Jerky | Prepared protein meals | 1 | 0.13 | Craft: Tinned Crab Trail Jerky |
| `tinned_crab_meal_packet` | Tinned Crab Travel Meal Packet | Prepared protein meals | 2 | 0.39 | Craft: Tinned Crab Travel Meal Packet |
| `tinned_duck` | Tinned Duck | Protein supplies | 0 | 0.17 | Loot: camp, grocery, house, market, ranger, restaurant |
| `tinned_duck_broth_bowl` | Tinned Duck Broth Bowl | Prepared protein meals | 2 | 0.65 | Craft: Tinned Duck Broth Bowl |
| `tinned_duck_stew` | Tinned Duck Camp Stew | Prepared protein meals | 1 | 0.63 | Craft: Tinned Duck Camp Stew |
| `tinned_duck_sandwich` | Tinned Duck Field Sandwich | Prepared protein meals | 1 | 0.37 | Craft: Tinned Duck Field Sandwich |
| `tinned_duck_skillet` | Tinned Duck Skillet Meal | Prepared protein meals | 1 | 0.42 | Craft: Tinned Duck Skillet Meal |
| `tinned_duck_smoked_ration` | Tinned Duck Smoked Ration | Prepared protein meals | 1 | 0.21 | Craft: Tinned Duck Smoked Ration |
| `tinned_duck_jerky` | Tinned Duck Trail Jerky | Prepared protein meals | 1 | 0.14 | Craft: Tinned Duck Trail Jerky |
| `tinned_duck_meal_packet` | Tinned Duck Travel Meal Packet | Prepared protein meals | 2 | 0.40 | Craft: Tinned Duck Travel Meal Packet |
| `tinned_mackerel` | Tinned Mackerel | Protein supplies | 0 | 0.23 | Loot: camp, grocery, house, market, ranger, restaurant |
| `tinned_mackerel_broth_bowl` | Tinned Mackerel Broth Bowl | Prepared protein meals | 2 | 0.65 | Craft: Tinned Mackerel Broth Bowl |
| `tinned_mackerel_stew` | Tinned Mackerel Camp Stew | Prepared protein meals | 1 | 0.63 | Craft: Tinned Mackerel Camp Stew |
| `tinned_mackerel_sandwich` | Tinned Mackerel Field Sandwich | Prepared protein meals | 1 | 0.37 | Craft: Tinned Mackerel Field Sandwich |
| `tinned_mackerel_skillet` | Tinned Mackerel Skillet Meal | Prepared protein meals | 1 | 0.42 | Craft: Tinned Mackerel Skillet Meal |
| `tinned_mackerel_smoked_ration` | Tinned Mackerel Smoked Ration | Prepared protein meals | 1 | 0.21 | Craft: Tinned Mackerel Smoked Ration |
| `tinned_mackerel_jerky` | Tinned Mackerel Trail Jerky | Prepared protein meals | 1 | 0.14 | Craft: Tinned Mackerel Trail Jerky |
| `tinned_mackerel_meal_packet` | Tinned Mackerel Travel Meal Packet | Prepared protein meals | 2 | 0.40 | Craft: Tinned Mackerel Travel Meal Packet |
| `tinned_mussel` | Tinned Mussel | Protein supplies | 0 | 0.19 | Loot: camp, grocery, house, market, ranger, restaurant |
| `tinned_mussel_broth_bowl` | Tinned Mussel Broth Bowl | Prepared protein meals | 2 | 0.67 | Craft: Tinned Mussel Broth Bowl |
| `tinned_mussel_stew` | Tinned Mussel Camp Stew | Prepared protein meals | 1 | 0.65 | Craft: Tinned Mussel Camp Stew |
| `tinned_mussel_sandwich` | Tinned Mussel Field Sandwich | Prepared protein meals | 1 | 0.39 | Craft: Tinned Mussel Field Sandwich |
| `tinned_mussel_skillet` | Tinned Mussel Skillet Meal | Prepared protein meals | 1 | 0.44 | Craft: Tinned Mussel Skillet Meal |
| `tinned_mussel_smoked_ration` | Tinned Mussel Smoked Ration | Prepared protein meals | 1 | 0.23 | Craft: Tinned Mussel Smoked Ration |
| `tinned_mussel_jerky` | Tinned Mussel Trail Jerky | Prepared protein meals | 1 | 0.16 | Craft: Tinned Mussel Trail Jerky |
| `tinned_mussel_meal_packet` | Tinned Mussel Travel Meal Packet | Prepared protein meals | 2 | 0.42 | Craft: Tinned Mussel Travel Meal Packet |
| `tinned_salmon` | Tinned Salmon | Protein supplies | 0 | 0.20 | Loot: camp, grocery, house, market, ranger, restaurant |
| `tinned_salmon_broth_bowl` | Tinned Salmon Broth Bowl | Prepared protein meals | 2 | 0.67 | Craft: Tinned Salmon Broth Bowl |
| `tinned_salmon_stew` | Tinned Salmon Camp Stew | Prepared protein meals | 1 | 0.65 | Craft: Tinned Salmon Camp Stew |
| `tinned_salmon_sandwich` | Tinned Salmon Field Sandwich | Prepared protein meals | 1 | 0.39 | Craft: Tinned Salmon Field Sandwich |
| `tinned_salmon_skillet` | Tinned Salmon Skillet Meal | Prepared protein meals | 1 | 0.44 | Craft: Tinned Salmon Skillet Meal |
| `tinned_salmon_smoked_ration` | Tinned Salmon Smoked Ration | Prepared protein meals | 1 | 0.23 | Craft: Tinned Salmon Smoked Ration |
| `tinned_salmon_jerky` | Tinned Salmon Trail Jerky | Prepared protein meals | 1 | 0.16 | Craft: Tinned Salmon Trail Jerky |
| `tinned_salmon_meal_packet` | Tinned Salmon Travel Meal Packet | Prepared protein meals | 2 | 0.42 | Craft: Tinned Salmon Travel Meal Packet |
| `tinned_sardine` | Tinned Sardine | Protein supplies | 0 | 0.22 | Loot: camp, grocery, house, market, ranger, restaurant |
| `tinned_sardine_broth_bowl` | Tinned Sardine Broth Bowl | Prepared protein meals | 2 | 0.64 | Craft: Tinned Sardine Broth Bowl |
| `tinned_sardine_stew` | Tinned Sardine Camp Stew | Prepared protein meals | 1 | 0.62 | Craft: Tinned Sardine Camp Stew |
| `tinned_sardine_sandwich` | Tinned Sardine Field Sandwich | Prepared protein meals | 1 | 0.36 | Craft: Tinned Sardine Field Sandwich |
| `tinned_sardine_skillet` | Tinned Sardine Skillet Meal | Prepared protein meals | 1 | 0.41 | Craft: Tinned Sardine Skillet Meal |
| `tinned_sardine_smoked_ration` | Tinned Sardine Smoked Ration | Prepared protein meals | 1 | 0.20 | Craft: Tinned Sardine Smoked Ration |
| `tinned_sardine_jerky` | Tinned Sardine Trail Jerky | Prepared protein meals | 1 | 0.13 | Craft: Tinned Sardine Trail Jerky |
| `tinned_sardine_meal_packet` | Tinned Sardine Travel Meal Packet | Prepared protein meals | 2 | 0.39 | Craft: Tinned Sardine Travel Meal Packet |
| `tinned_shrimp` | Tinned Shrimp | Protein supplies | 0 | 0.22 | Loot: camp, grocery, house, market, ranger, restaurant |
| `tinned_shrimp_broth_bowl` | Tinned Shrimp Broth Bowl | Prepared protein meals | 2 | 0.65 | Craft: Tinned Shrimp Broth Bowl |
| `tinned_shrimp_stew` | Tinned Shrimp Camp Stew | Prepared protein meals | 1 | 0.63 | Craft: Tinned Shrimp Camp Stew |
| `tinned_shrimp_sandwich` | Tinned Shrimp Field Sandwich | Prepared protein meals | 1 | 0.37 | Craft: Tinned Shrimp Field Sandwich |
| `tinned_shrimp_skillet` | Tinned Shrimp Skillet Meal | Prepared protein meals | 1 | 0.42 | Craft: Tinned Shrimp Skillet Meal |
| `tinned_shrimp_smoked_ration` | Tinned Shrimp Smoked Ration | Prepared protein meals | 1 | 0.21 | Craft: Tinned Shrimp Smoked Ration |
| `tinned_shrimp_jerky` | Tinned Shrimp Trail Jerky | Prepared protein meals | 1 | 0.14 | Craft: Tinned Shrimp Trail Jerky |
| `tinned_shrimp_meal_packet` | Tinned Shrimp Travel Meal Packet | Prepared protein meals | 2 | 0.40 | Craft: Tinned Shrimp Travel Meal Packet |
| `tinned_tuna` | Tinned Tuna | Protein supplies | 0 | 0.19 | Loot: camp, grocery, house, market, ranger, restaurant |
| `tinned_tuna_broth_bowl` | Tinned Tuna Broth Bowl | Prepared protein meals | 2 | 0.66 | Craft: Tinned Tuna Broth Bowl |
| `tinned_tuna_stew` | Tinned Tuna Camp Stew | Prepared protein meals | 1 | 0.64 | Craft: Tinned Tuna Camp Stew |
| `tinned_tuna_sandwich` | Tinned Tuna Field Sandwich | Prepared protein meals | 1 | 0.38 | Craft: Tinned Tuna Field Sandwich |
| `tinned_tuna_skillet` | Tinned Tuna Skillet Meal | Prepared protein meals | 1 | 0.43 | Craft: Tinned Tuna Skillet Meal |
| `tinned_tuna_smoked_ration` | Tinned Tuna Smoked Ration | Prepared protein meals | 1 | 0.22 | Craft: Tinned Tuna Smoked Ration |
| `tinned_tuna_jerky` | Tinned Tuna Trail Jerky | Prepared protein meals | 1 | 0.15 | Craft: Tinned Tuna Trail Jerky |
| `tinned_tuna_meal_packet` | Tinned Tuna Travel Meal Packet | Prepared protein meals | 2 | 0.41 | Craft: Tinned Tuna Travel Meal Packet |
| `tinned_turkey` | Tinned Turkey | Protein supplies | 0 | 0.23 | Loot: camp, grocery, house, market, ranger, restaurant |
| `tinned_turkey_broth_bowl` | Tinned Turkey Broth Bowl | Prepared protein meals | 2 | 0.64 | Craft: Tinned Turkey Broth Bowl |
| `tinned_turkey_stew` | Tinned Turkey Camp Stew | Prepared protein meals | 1 | 0.62 | Craft: Tinned Turkey Camp Stew |
| `tinned_turkey_sandwich` | Tinned Turkey Field Sandwich | Prepared protein meals | 1 | 0.36 | Craft: Tinned Turkey Field Sandwich |
| `tinned_turkey_skillet` | Tinned Turkey Skillet Meal | Prepared protein meals | 1 | 0.41 | Craft: Tinned Turkey Skillet Meal |
| `tinned_turkey_smoked_ration` | Tinned Turkey Smoked Ration | Prepared protein meals | 1 | 0.20 | Craft: Tinned Turkey Smoked Ration |
| `tinned_turkey_jerky` | Tinned Turkey Trail Jerky | Prepared protein meals | 1 | 0.13 | Craft: Tinned Turkey Trail Jerky |
| `tinned_turkey_meal_packet` | Tinned Turkey Travel Meal Packet | Prepared protein meals | 2 | 0.39 | Craft: Tinned Turkey Travel Meal Packet |
| `tomato` | Tomato | food | 0 | 0.14 | Loot: farm, restaurant |
| `pasta_meal` | Tomato pasta | food | 0 | 0.50 | Craft: Tomato pasta |
| `trail_mix` | Trail mix | food | 0 | 0.28 | Craft: Mix trail food |
| `food` | Trail ration | food | 0 | 0.60 | Loot: camp, forest, fuel, grocery, house, market, radio, ranger, suburban, urban |
| `turnip` | Turnip | Garden food | 0 | 0.23 | Loot: farm, grocery, market, restaurant, suburban |
| `turnip_roast` | Turnip Camp Roast | Prepared vegetable meals | 1 | 0.31 | Craft: Turnip Camp Roast |
| `turnip_camp_soup` | Turnip Camp Soup | Prepared vegetable meals | 1 | 0.58 | Craft: Turnip Camp Soup |
| `turnip_flatbread` | Turnip Garden Flatbread | Prepared vegetable meals | 2 | 0.32 | Craft: Turnip Garden Flatbread |
| `turnip_pickle` | Turnip Salted Pickle | Prepared vegetable meals | 1 | 0.24 | Craft: Turnip Salted Pickle |
| `turnip_porridge` | Turnip Savory Porridge | Prepared vegetable meals | 1 | 0.54 | Craft: Turnip Savory Porridge |
| `turnip_supper_packet` | Turnip Supper Packet | Prepared vegetable meals | 2 | 0.42 | Craft: Turnip Supper Packet |
| `turnip_crisp` | Turnip Vegetable Crisp | Prepared vegetable meals | 1 | 0.13 | Craft: Turnip Vegetable Crisp |
| `vegetable_soup` | Vegetable soup | food | 0 | 0.60 | Craft: Vegetable soup |
| `zucchini` | Zucchini | Garden food | 0 | 0.26 | Loot: farm, grocery, market, restaurant, suburban |
| `zucchini_roast` | Zucchini Camp Roast | Prepared vegetable meals | 1 | 0.34 | Craft: Zucchini Camp Roast |
| `zucchini_camp_soup` | Zucchini Camp Soup | Prepared vegetable meals | 1 | 0.61 | Craft: Zucchini Camp Soup |
| `zucchini_flatbread` | Zucchini Garden Flatbread | Prepared vegetable meals | 2 | 0.35 | Craft: Zucchini Garden Flatbread |
| `zucchini_pickle` | Zucchini Salted Pickle | Prepared vegetable meals | 1 | 0.27 | Craft: Zucchini Salted Pickle |
| `zucchini_porridge` | Zucchini Savory Porridge | Prepared vegetable meals | 1 | 0.57 | Craft: Zucchini Savory Porridge |
| `zucchini_supper_packet` | Zucchini Supper Packet | Prepared vegetable meals | 2 | 0.45 | Craft: Zucchini Supper Packet |
| `zucchini_crisp` | Zucchini Vegetable Crisp | Prepared vegetable meals | 1 | 0.16 | Craft: Zucchini Vegetable Crisp |

## Materials

| Stable ID | Item | Family | Tier | kg | Obtain |
| --- | --- | --- | ---: | ---: | --- |
| `aluminum_bar` | Aluminum Bar | Worked metal | 2 | 0.22 | Craft: Shape Aluminum Bar |
| `aluminum_billet` | Aluminum Billet | Worked metal | 2 | 0.37 | Craft: Shape Aluminum Billet |
| `aluminum_edge` | Aluminum Edged Blank | Worked metal | 2 | 0.15 | Craft: Shape Aluminum Edged Blank |
| `aluminum_hinge` | Aluminum Hinge Set | Worked metal | 2 | 0.09 | Craft: Shape Aluminum Hinge Set |
| `aluminum_mechanism` | Aluminum Mechanism | Worked metal | 2 | 0.19 | Craft: Shape Aluminum Mechanism |
| `aluminum_plate` | Aluminum Plate | Worked metal | 2 | 0.26 | Craft: Shape Aluminum Plate |
| `aluminum_stock` | Aluminum Stock | Metal stock | 1 | 0.28 | Loot: depot, garage, hardware, industrial, warehouse |
| `aluminum_sheet` | Aluminum sheet | materials | 0 | 0.65 | Loot: depot, industrial, warehouse |
| `aramid_cord` | Aramid Cord | Worked textiles | 5 | 0.06 | Craft: Prepare Aramid Cord |
| `aramid_padding` | Aramid Padding | Worked textiles | 5 | 0.28 | Craft: Prepare Aramid Padding |
| `aramid_panel` | Aramid Panel | Worked textiles | 5 | 0.22 | Craft: Prepare Aramid Panel |
| `aramid_reinforcement` | Aramid Reinforcement | Worked textiles | 5 | 0.21 | Craft: Prepare Aramid Reinforcement |
| `aramid_textile` | Aramid Textile | Textile stock | 4 | 0.26 | Loot: clothing, depot, house, suburban, warehouse |
| `ash_frame` | Ash Frame | Worked timber | 1 | 0.57 | Craft: Shape Ash Frame |
| `ash_grip` | Ash Grip | Worked timber | 1 | 0.13 | Craft: Shape Ash Grip |
| `ash_shaft` | Ash Shaft | Worked timber | 1 | 0.39 | Craft: Shape Ash Shaft |
| `ash_slat` | Ash Slats | Worked timber | 1 | 0.20 | Craft: Shape Ash Slats |
| `ash_timber` | Ash Timber | Timber stock | 0 | 0.59 | Loot: cabin, camp, farm, forest, ranger |
| `ballistic_nylon_cord` | Ballistic Nylon Cord | Worked textiles | 4 | 0.07 | Craft: Prepare Ballistic Nylon Cord |
| `ballistic_nylon_padding` | Ballistic Nylon Padding | Worked textiles | 4 | 0.36 | Craft: Prepare Ballistic Nylon Padding |
| `ballistic_nylon_panel` | Ballistic Nylon Panel | Worked textiles | 4 | 0.28 | Craft: Prepare Ballistic Nylon Panel |
| `ballistic_nylon_reinforcement` | Ballistic Nylon Reinforcement | Worked textiles | 4 | 0.27 | Craft: Prepare Ballistic Nylon Reinforcement |
| `ballistic_nylon_textile` | Ballistic Nylon Textile | Textile stock | 3 | 0.34 | Loot: clothing, depot, house, suburban, warehouse |
| `beech_frame` | Beech Frame | Worked timber | 1 | 0.66 | Craft: Shape Beech Frame |
| `beech_grip` | Beech Grip | Worked timber | 1 | 0.15 | Craft: Shape Beech Grip |
| `beech_shaft` | Beech Shaft | Worked timber | 1 | 0.46 | Craft: Shape Beech Shaft |
| `beech_slat` | Beech Slats | Worked timber | 1 | 0.23 | Craft: Shape Beech Slats |
| `beech_timber` | Beech Timber | Timber stock | 1 | 0.68 | Loot: cabin, camp, farm, forest, ranger |
| `birch_frame` | Birch Frame | Worked timber | 1 | 0.51 | Craft: Shape Birch Frame |
| `birch_grip` | Birch Grip | Worked timber | 1 | 0.12 | Craft: Shape Birch Grip |
| `birch_shaft` | Birch Shaft | Worked timber | 1 | 0.35 | Craft: Shape Birch Shaft |
| `birch_slat` | Birch Slats | Worked timber | 1 | 0.18 | Craft: Shape Birch Slats |
| `birch_timber` | Birch Timber | Timber stock | 2 | 0.53 | Loot: cabin, camp, farm, forest, ranger |
| `bolts` | Bolt set | materials | 0 | 0.35 | Loot: depot, garage, hardware, industrial, warehouse, workshop |
| `boron_steel_bar` | Boron Steel Bar | Worked metal | 5 | 0.48 | Craft: Shape Boron Steel Bar |
| `boron_steel_billet` | Boron Steel Billet | Worked metal | 5 | 0.81 | Craft: Shape Boron Steel Billet |
| `boron_steel_edge` | Boron Steel Edged Blank | Worked metal | 5 | 0.32 | Craft: Shape Boron Steel Edged Blank |
| `boron_steel_hinge` | Boron Steel Hinge Set | Worked metal | 5 | 0.20 | Craft: Shape Boron Steel Hinge Set |
| `boron_steel_mechanism` | Boron Steel Mechanism | Worked metal | 5 | 0.42 | Craft: Shape Boron Steel Mechanism |
| `boron_steel_plate` | Boron Steel Plate | Worked metal | 5 | 0.57 | Craft: Shape Boron Steel Plate |
| `boron_steel_stock` | Boron Steel Stock | Metal stock | 4 | 0.60 | Loot: depot, garage, hardware, industrial, warehouse |
| `brass_bar` | Brass Bar | Worked metal | 2 | 0.52 | Craft: Shape Brass Bar |
| `brass_billet` | Brass Billet | Worked metal | 2 | 0.87 | Craft: Shape Brass Billet |
| `brass_edge` | Brass Edged Blank | Worked metal | 2 | 0.35 | Craft: Shape Brass Edged Blank |
| `brass_hinge` | Brass Hinge Set | Worked metal | 2 | 0.21 | Craft: Shape Brass Hinge Set |
| `brass_mechanism` | Brass Mechanism | Worked metal | 2 | 0.45 | Craft: Shape Brass Mechanism |
| `brass_plate` | Brass Plate | Worked metal | 2 | 0.62 | Craft: Shape Brass Plate |
| `brass_stock` | Brass Stock | Metal stock | 1 | 0.65 | Loot: depot, garage, hardware, industrial, warehouse |
| `breakwater_receiver` | Breakwater Receiver Assembly | Ranged equipment components | 2 | 0.55 | Loot: depot, garage, gunshop, police, warehouse |
| `bronze_bar` | Bronze Bar | Worked metal | 2 | 0.52 | Craft: Shape Bronze Bar |
| `bronze_billet` | Bronze Billet | Worked metal | 2 | 0.89 | Craft: Shape Bronze Billet |
| `bronze_edge` | Bronze Edged Blank | Worked metal | 2 | 0.35 | Craft: Shape Bronze Edged Blank |
| `bronze_hinge` | Bronze Hinge Set | Worked metal | 2 | 0.22 | Craft: Shape Bronze Hinge Set |
| `bronze_mechanism` | Bronze Mechanism | Worked metal | 2 | 0.46 | Craft: Shape Bronze Mechanism |
| `bronze_plate` | Bronze Plate | Worked metal | 2 | 0.63 | Craft: Shape Bronze Plate |
| `bronze_stock` | Bronze Stock | Metal stock | 1 | 0.66 | Loot: depot, garage, hardware, industrial, warehouse |
| `burlap_cord` | Burlap Cord | Worked textiles | 1 | 0.05 | Craft: Prepare Burlap Cord |
| `burlap_padding` | Burlap Padding | Worked textiles | 1 | 0.27 | Craft: Prepare Burlap Padding |
| `burlap_panel` | Burlap Panel | Worked textiles | 1 | 0.21 | Craft: Prepare Burlap Panel |
| `burlap_reinforcement` | Burlap Reinforcement | Worked textiles | 1 | 0.20 | Craft: Prepare Burlap Reinforcement |
| `burlap_textile` | Burlap Textile | Textile stock | 0 | 0.25 | Loot: clothing, depot, house, suburban, warehouse |
| `carbon_steel_bar` | Carbon Steel Bar | Worked metal | 3 | 0.47 | Craft: Shape Carbon Steel Bar |
| `carbon_steel_billet` | Carbon Steel Billet | Worked metal | 3 | 0.80 | Craft: Shape Carbon Steel Billet |
| `carbon_steel_edge` | Carbon Steel Edged Blank | Worked metal | 3 | 0.32 | Craft: Shape Carbon Steel Edged Blank |
| `carbon_steel_hinge` | Carbon Steel Hinge Set | Worked metal | 3 | 0.19 | Craft: Shape Carbon Steel Hinge Set |
| `carbon_steel_mechanism` | Carbon Steel Mechanism | Worked metal | 3 | 0.41 | Craft: Shape Carbon Steel Mechanism |
| `carbon_steel_plate` | Carbon Steel Plate | Worked metal | 3 | 0.56 | Craft: Shape Carbon Steel Plate |
| `carbon_steel_stock` | Carbon Steel Stock | Metal stock | 2 | 0.59 | Loot: depot, garage, hardware, industrial, warehouse |
| `cast_iron_bar` | Cast Iron Bar | Worked metal | 2 | 0.54 | Craft: Shape Cast Iron Bar |
| `cast_iron_billet` | Cast Iron Billet | Worked metal | 2 | 0.91 | Craft: Shape Cast Iron Billet |
| `cast_iron_edge` | Cast Iron Edged Blank | Worked metal | 2 | 0.36 | Craft: Shape Cast Iron Edged Blank |
| `cast_iron_hinge` | Cast Iron Hinge Set | Worked metal | 2 | 0.22 | Craft: Shape Cast Iron Hinge Set |
| `cast_iron_mechanism` | Cast Iron Mechanism | Worked metal | 2 | 0.47 | Craft: Shape Cast Iron Mechanism |
| `cast_iron_plate` | Cast Iron Plate | Worked metal | 2 | 0.64 | Craft: Shape Cast Iron Plate |
| `cast_iron_stock` | Cast Iron Stock | Metal stock | 1 | 0.68 | Loot: depot, garage, hardware, industrial, warehouse |
| `cedar_frame` | Cedar Frame | Worked timber | 1 | 0.38 | Craft: Shape Cedar Frame |
| `cedar_grip` | Cedar Grip | Worked timber | 1 | 0.09 | Craft: Shape Cedar Grip |
| `cedar_shaft` | Cedar Shaft | Worked timber | 1 | 0.26 | Craft: Shape Cedar Shaft |
| `cedar_slat` | Cedar Slats | Worked timber | 1 | 0.13 | Craft: Shape Cedar Slats |
| `cedar_timber` | Cedar Timber | Timber stock | 3 | 0.39 | Loot: cabin, camp, farm, forest, ranger |
| `charcoal` | Charcoal | materials | 0 | 0.30 | Loot: cabin, camp, default, depot, forest, garage, hardware, industrial, ranger, river, suburban, warehouse, workshop |
| `cherrywood_frame` | Cherrywood Frame | Worked timber | 1 | 0.59 | Craft: Shape Cherrywood Frame |
| `cherrywood_grip` | Cherrywood Grip | Worked timber | 1 | 0.13 | Craft: Shape Cherrywood Grip |
| `cherrywood_shaft` | Cherrywood Shaft | Worked timber | 1 | 0.40 | Craft: Shape Cherrywood Shaft |
| `cherrywood_slat` | Cherrywood Slats | Worked timber | 1 | 0.20 | Craft: Shape Cherrywood Slats |
| `cherrywood_timber` | Cherrywood Timber | Timber stock | 0 | 0.60 | Loot: cabin, camp, farm, forest, ranger |
| `chrome_steel_bar` | Chrome Steel Bar | Worked metal | 5 | 0.51 | Craft: Shape Chrome Steel Bar |
| `chrome_steel_billet` | Chrome Steel Billet | Worked metal | 5 | 0.86 | Craft: Shape Chrome Steel Billet |
| `chrome_steel_edge` | Chrome Steel Edged Blank | Worked metal | 5 | 0.34 | Craft: Shape Chrome Steel Edged Blank |
| `chrome_steel_hinge` | Chrome Steel Hinge Set | Worked metal | 5 | 0.21 | Craft: Shape Chrome Steel Hinge Set |
| `chrome_steel_mechanism` | Chrome Steel Mechanism | Worked metal | 5 | 0.44 | Craft: Shape Chrome Steel Mechanism |
| `chrome_steel_plate` | Chrome Steel Plate | Worked metal | 5 | 0.61 | Craft: Shape Chrome Steel Plate |
| `chrome_steel_stock` | Chrome Steel Stock | Metal stock | 4 | 0.64 | Loot: depot, garage, hardware, industrial, warehouse |
| `cinder_receiver` | Cinder Receiver Assembly | Ranged equipment components | 2 | 0.48 | Loot: depot, garage, gunshop, police, warehouse |
| `clay` | Clay lump | materials | 0 | 1.00 | Loot: river |
| `cloth` | Cloth strips | materials | 0 | 0.12 | Loot: clothing, default, house, library, suburban, urban |
| `cobalt_alloy_bar` | Cobalt Alloy Bar | Worked metal | 5 | 0.56 | Craft: Shape Cobalt Alloy Bar |
| `cobalt_alloy_billet` | Cobalt Alloy Billet | Worked metal | 5 | 0.95 | Craft: Shape Cobalt Alloy Billet |
| `cobalt_alloy_edge` | Cobalt Alloy Edged Blank | Worked metal | 5 | 0.38 | Craft: Shape Cobalt Alloy Edged Blank |
| `cobalt_alloy_hinge` | Cobalt Alloy Hinge Set | Worked metal | 5 | 0.23 | Craft: Shape Cobalt Alloy Hinge Set |
| `cobalt_alloy_mechanism` | Cobalt Alloy Mechanism | Worked metal | 5 | 0.49 | Craft: Shape Cobalt Alloy Mechanism |
| `cobalt_alloy_plate` | Cobalt Alloy Plate | Worked metal | 5 | 0.67 | Craft: Shape Cobalt Alloy Plate |
| `cobalt_alloy_stock` | Cobalt Alloy Stock | Metal stock | 5 | 0.71 | Loot: depot, garage, hardware, industrial, warehouse |
| `spring` | Coil spring | materials | 0 | 0.10 | Loot: depot, garage, industrial, warehouse |
| `copper_bar` | Copper Bar | Worked metal | 2 | 0.53 | Craft: Shape Copper Bar |
| `copper_billet` | Copper Billet | Worked metal | 2 | 0.90 | Craft: Shape Copper Billet |
| `copper_edge` | Copper Edged Blank | Worked metal | 2 | 0.36 | Craft: Shape Copper Edged Blank |
| `copper_hinge` | Copper Hinge Set | Worked metal | 2 | 0.22 | Craft: Shape Copper Hinge Set |
| `copper_mechanism` | Copper Mechanism | Worked metal | 2 | 0.46 | Craft: Shape Copper Mechanism |
| `copper_plate` | Copper Plate | Worked metal | 2 | 0.64 | Craft: Shape Copper Plate |
| `copper_stock` | Copper Stock | Metal stock | 1 | 0.67 | Loot: depot, garage, hardware, industrial, warehouse |
| `copper_ore` | Copper ore | materials | 0 | 0.65 | Loot: default, depot, garage, hardware, industrial, suburban, warehouse, workshop |
| `copper_pipe` | Copper pipe | materials | 0 | 0.80 | Loot: depot, industrial, warehouse |
| `corduroy_cord` | Corduroy Cord | Worked textiles | 1 | 0.06 | Craft: Prepare Corduroy Cord |
| `corduroy_padding` | Corduroy Padding | Worked textiles | 1 | 0.31 | Craft: Prepare Corduroy Padding |
| `corduroy_panel` | Corduroy Panel | Worked textiles | 1 | 0.24 | Craft: Prepare Corduroy Panel |
| `corduroy_reinforcement` | Corduroy Reinforcement | Worked textiles | 1 | 0.23 | Craft: Prepare Corduroy Reinforcement |
| `corduroy_textile` | Corduroy Textile | Textile stock | 0 | 0.29 | Loot: clothing, depot, house, suburban, warehouse |
| `cotton_twill_cord` | Cotton Twill Cord | Worked textiles | 1 | 0.05 | Craft: Prepare Cotton Twill Cord |
| `cotton_twill_padding` | Cotton Twill Padding | Worked textiles | 1 | 0.26 | Craft: Prepare Cotton Twill Padding |
| `cotton_twill_panel` | Cotton Twill Panel | Worked textiles | 1 | 0.20 | Craft: Prepare Cotton Twill Panel |
| `cotton_twill_reinforcement` | Cotton Twill Reinforcement | Worked textiles | 1 | 0.20 | Craft: Prepare Cotton Twill Reinforcement |
| `cotton_twill_textile` | Cotton Twill Textile | Textile stock | 0 | 0.24 | Loot: clothing, depot, house, suburban, warehouse |
| `denim_cord` | Denim Cord | Worked textiles | 2 | 0.07 | Craft: Prepare Denim Cord |
| `denim_padding` | Denim Padding | Worked textiles | 2 | 0.35 | Craft: Prepare Denim Padding |
| `denim_panel` | Denim Panel | Worked textiles | 2 | 0.27 | Craft: Prepare Denim Panel |
| `denim_reinforcement` | Denim Reinforcement | Worked textiles | 2 | 0.26 | Craft: Prepare Denim Reinforcement |
| `denim_textile` | Denim Textile | Textile stock | 1 | 0.33 | Loot: clothing, depot, house, suburban, warehouse |
| `duckcloth_cord` | Duckcloth Cord | Worked textiles | 2 | 0.07 | Craft: Prepare Duckcloth Cord |
| `duckcloth_padding` | Duckcloth Padding | Worked textiles | 2 | 0.37 | Craft: Prepare Duckcloth Padding |
| `duckcloth_panel` | Duckcloth Panel | Worked textiles | 2 | 0.29 | Craft: Prepare Duckcloth Panel |
| `duckcloth_reinforcement` | Duckcloth Reinforcement | Worked textiles | 2 | 0.28 | Craft: Prepare Duckcloth Reinforcement |
| `duckcloth_textile` | Duckcloth Textile | Textile stock | 1 | 0.34 | Loot: clothing, depot, house, suburban, warehouse |
| `duct_tape` | Duct tape | materials | 0 | 0.18 | Loot: depot, garage, hardware, industrial, warehouse, workshop |
| `elm_frame` | Elm Frame | Worked timber | 1 | 0.62 | Craft: Shape Elm Frame |
| `elm_grip` | Elm Grip | Worked timber | 1 | 0.14 | Craft: Shape Elm Grip |
| `elm_shaft` | Elm Shaft | Worked timber | 1 | 0.43 | Craft: Shape Elm Shaft |
| `elm_slat` | Elm Slats | Worked timber | 1 | 0.21 | Craft: Shape Elm Slats |
| `elm_timber` | Elm Timber | Timber stock | 1 | 0.64 | Loot: cabin, camp, farm, forest, ranger |
| `empty_bottle` | Empty bottle | materials | 0 | 0.20 | Loot: default, house, river, suburban, urban |
| `empty_can` | Empty can | materials | 0 | 0.10 | Loot: grocery, house, market, suburban, urban |
| `felt_blend_cord` | Felt Blend Cord | Worked textiles | 2 | 0.07 | Craft: Prepare Felt Blend Cord |
| `felt_blend_padding` | Felt Blend Padding | Worked textiles | 2 | 0.35 | Craft: Prepare Felt Blend Padding |
| `felt_blend_panel` | Felt Blend Panel | Worked textiles | 2 | 0.27 | Craft: Prepare Felt Blend Panel |
| `felt_blend_reinforcement` | Felt Blend Reinforcement | Worked textiles | 2 | 0.26 | Craft: Prepare Felt Blend Reinforcement |
| `felt_blend_textile` | Felt Blend Textile | Textile stock | 1 | 0.32 | Loot: clothing, depot, house, suburban, warehouse |
| `filter_mesh` | Filter mesh | materials | 0 | 0.12 | Loot: depot, river, warehouse |
| `sand` | Fine sand | materials | 0 | 0.80 | Loot: river |
| `firecloth_cord` | Firecloth Cord | Worked textiles | 4 | 0.09 | Craft: Prepare Firecloth Cord |
| `firecloth_padding` | Firecloth Padding | Worked textiles | 4 | 0.43 | Craft: Prepare Firecloth Padding |
| `firecloth_panel` | Firecloth Panel | Worked textiles | 4 | 0.33 | Craft: Prepare Firecloth Panel |
| `firecloth_reinforcement` | Firecloth Reinforcement | Worked textiles | 4 | 0.32 | Craft: Prepare Firecloth Reinforcement |
| `firecloth_textile` | Firecloth Textile | Textile stock | 3 | 0.40 | Loot: clothing, depot, house, suburban, warehouse |
| `fleece_cord` | Fleece Cord | Worked textiles | 1 | 0.06 | Craft: Prepare Fleece Cord |
| `fleece_padding` | Fleece Padding | Worked textiles | 1 | 0.30 | Craft: Prepare Fleece Padding |
| `fleece_panel` | Fleece Panel | Worked textiles | 1 | 0.24 | Craft: Prepare Fleece Panel |
| `fleece_reinforcement` | Fleece Reinforcement | Worked textiles | 1 | 0.23 | Craft: Prepare Fleece Reinforcement |
| `fleece_textile` | Fleece Textile | Textile stock | 0 | 0.28 | Loot: clothing, depot, house, suburban, warehouse |
| `fuel` | Fuel flask | materials | 0 | 0.70 | Loot: fuel, garage, industrial |
| `glass` | Glass fragments | materials | 0 | 0.40 | Loot: industrial |
| `gravel` | Gravel | materials | 0 | 1.20 | Loot: river |
| `gunpowder` | Gunpowder tin | materials | 0 | 0.25 | Loot: gunshop |
| `harbor_receiver` | Harbor Receiver Assembly | Ranged equipment components | 2 | 0.42 | Loot: depot, garage, gunshop, police, warehouse |
| `hemp_canvas_cord` | Hemp Canvas Cord | Worked textiles | 2 | 0.07 | Craft: Prepare Hemp Canvas Cord |
| `hemp_canvas_padding` | Hemp Canvas Padding | Worked textiles | 2 | 0.34 | Craft: Prepare Hemp Canvas Padding |
| `hemp_canvas_panel` | Hemp Canvas Panel | Worked textiles | 2 | 0.26 | Craft: Prepare Hemp Canvas Panel |
| `hemp_canvas_reinforcement` | Hemp Canvas Reinforcement | Worked textiles | 2 | 0.25 | Craft: Prepare Hemp Canvas Reinforcement |
| `hemp_canvas_textile` | Hemp Canvas Textile | Textile stock | 1 | 0.31 | Loot: clothing, depot, house, suburban, warehouse |
| `hickory_frame` | Hickory Frame | Worked timber | 1 | 0.76 | Craft: Shape Hickory Frame |
| `hickory_grip` | Hickory Grip | Worked timber | 1 | 0.17 | Craft: Shape Hickory Grip |
| `hickory_shaft` | Hickory Shaft | Worked timber | 1 | 0.52 | Craft: Shape Hickory Shaft |
| `hickory_slat` | Hickory Slats | Worked timber | 1 | 0.26 | Craft: Shape Hickory Slats |
| `hickory_timber` | Hickory Timber | Timber stock | 2 | 0.78 | Loot: cabin, camp, farm, forest, ranger |
| `highland_receiver` | Highland Receiver Assembly | Ranged equipment components | 2 | 0.54 | Loot: depot, garage, gunshop, police, warehouse |
| `iron_ingot` | Iron ingot | materials | 0 | 0.60 | Craft: Process iron ore |
| `iron_ore` | Iron ore | materials | 0 | 0.80 | Loot: default, depot, garage, hardware, industrial, suburban, warehouse, workshop |
| `laminated_mesh_cord` | Laminated Mesh Cord | Worked textiles | 5 | 0.06 | Craft: Prepare Laminated Mesh Cord |
| `laminated_mesh_padding` | Laminated Mesh Padding | Worked textiles | 5 | 0.31 | Craft: Prepare Laminated Mesh Padding |
| `laminated_mesh_panel` | Laminated Mesh Panel | Worked textiles | 5 | 0.24 | Craft: Prepare Laminated Mesh Panel |
| `laminated_mesh_reinforcement` | Laminated Mesh Reinforcement | Worked textiles | 5 | 0.23 | Craft: Prepare Laminated Mesh Reinforcement |
| `laminated_mesh_textile` | Laminated Mesh Textile | Textile stock | 4 | 0.28 | Loot: clothing, depot, house, suburban, warehouse |
| `lanternworks_receiver` | Lanternworks Receiver Assembly | Ranged equipment components | 2 | 0.39 | Loot: depot, garage, gunshop, police, warehouse |
| `lead` | Lead ingot | materials | 0 | 0.80 | Loot: gunshop |
| `leather_suede_cord` | Leather Suede Cord | Worked textiles | 3 | 0.09 | Craft: Prepare Leather Suede Cord |
| `leather_suede_padding` | Leather Suede Padding | Worked textiles | 3 | 0.45 | Craft: Prepare Leather Suede Padding |
| `leather_suede_panel` | Leather Suede Panel | Worked textiles | 3 | 0.35 | Craft: Prepare Leather Suede Panel |
| `leather_suede_reinforcement` | Leather Suede Reinforcement | Worked textiles | 3 | 0.34 | Craft: Prepare Leather Suede Reinforcement |
| `leather_suede_textile` | Leather Suede Textile | Textile stock | 2 | 0.42 | Loot: clothing, depot, house, suburban, warehouse |
| `leather` | Leather hide | materials | 0 | 0.50 | Loot: clothing, depot, garage, warehouse |
| `linen_cord` | Linen Cord | Worked textiles | 1 | 0.05 | Craft: Prepare Linen Cord |
| `linen_padding` | Linen Padding | Worked textiles | 1 | 0.23 | Craft: Prepare Linen Padding |
| `linen_panel` | Linen Panel | Worked textiles | 1 | 0.18 | Craft: Prepare Linen Panel |
| `linen_reinforcement` | Linen Reinforcement | Worked textiles | 1 | 0.17 | Craft: Prepare Linen Reinforcement |
| `linen_textile` | Linen Textile | Textile stock | 0 | 0.21 | Loot: clothing, depot, house, suburban, warehouse |
| `manganese_steel_bar` | Manganese Steel Bar | Worked metal | 4 | 0.53 | Craft: Shape Manganese Steel Bar |
| `manganese_steel_billet` | Manganese Steel Billet | Worked metal | 4 | 0.90 | Craft: Shape Manganese Steel Billet |
| `manganese_steel_edge` | Manganese Steel Edged Blank | Worked metal | 4 | 0.36 | Craft: Shape Manganese Steel Edged Blank |
| `manganese_steel_hinge` | Manganese Steel Hinge Set | Worked metal | 4 | 0.22 | Craft: Shape Manganese Steel Hinge Set |
| `manganese_steel_mechanism` | Manganese Steel Mechanism | Worked metal | 4 | 0.46 | Craft: Shape Manganese Steel Mechanism |
| `manganese_steel_plate` | Manganese Steel Plate | Worked metal | 4 | 0.63 | Craft: Shape Manganese Steel Plate |
| `manganese_steel_stock` | Manganese Steel Stock | Metal stock | 3 | 0.67 | Loot: depot, garage, hardware, industrial, warehouse |
| `maple_frame` | Maple Frame | Worked timber | 1 | 0.69 | Craft: Shape Maple Frame |
| `maple_grip` | Maple Grip | Worked timber | 1 | 0.16 | Craft: Shape Maple Grip |
| `maple_shaft` | Maple Shaft | Worked timber | 1 | 0.47 | Craft: Shape Maple Shaft |
| `maple_slat` | Maple Slats | Worked timber | 1 | 0.24 | Craft: Shape Maple Slats |
| `maple_timber` | Maple Timber | Timber stock | 3 | 0.71 | Loot: cabin, camp, farm, forest, ranger |
| `scrap` | Metal scrap | materials | 0 | 0.45 | Loot: default, depot, garage, hardware, industrial, suburban, warehouse, workshop |
| `metal_tube` | Metal tubing | materials | 0 | 0.75 | Loot: depot, garage, hardware, industrial, warehouse, workshop |
| `mild_steel_bar` | Mild Steel Bar | Worked metal | 2 | 0.46 | Craft: Shape Mild Steel Bar |
| `mild_steel_billet` | Mild Steel Billet | Worked metal | 2 | 0.78 | Craft: Shape Mild Steel Billet |
| `mild_steel_edge` | Mild Steel Edged Blank | Worked metal | 2 | 0.31 | Craft: Shape Mild Steel Edged Blank |
| `mild_steel_hinge` | Mild Steel Hinge Set | Worked metal | 2 | 0.19 | Craft: Shape Mild Steel Hinge Set |
| `mild_steel_mechanism` | Mild Steel Mechanism | Worked metal | 2 | 0.40 | Craft: Shape Mild Steel Mechanism |
| `mild_steel_plate` | Mild Steel Plate | Worked metal | 2 | 0.55 | Craft: Shape Mild Steel Plate |
| `mild_steel_stock` | Mild Steel Stock | Metal stock | 1 | 0.58 | Loot: depot, garage, hardware, industrial, warehouse |
| `nails` | Nail box | materials | 0 | 0.25 | Loot: depot, garage, hardware, industrial, suburban, warehouse, workshop |
| `neoprene_cord` | Neoprene Cord | Worked textiles | 3 | 0.07 | Craft: Prepare Neoprene Cord |
| `neoprene_padding` | Neoprene Padding | Worked textiles | 3 | 0.34 | Craft: Prepare Neoprene Padding |
| `neoprene_panel` | Neoprene Panel | Worked textiles | 3 | 0.26 | Craft: Prepare Neoprene Panel |
| `neoprene_reinforcement` | Neoprene Reinforcement | Worked textiles | 3 | 0.25 | Craft: Prepare Neoprene Reinforcement |
| `neoprene_textile` | Neoprene Textile | Textile stock | 2 | 0.31 | Loot: clothing, depot, house, suburban, warehouse |
| `nickel_alloy_bar` | Nickel Alloy Bar | Worked metal | 5 | 0.54 | Craft: Shape Nickel Alloy Bar |
| `nickel_alloy_billet` | Nickel Alloy Billet | Worked metal | 5 | 0.92 | Craft: Shape Nickel Alloy Billet |
| `nickel_alloy_edge` | Nickel Alloy Edged Blank | Worked metal | 5 | 0.37 | Craft: Shape Nickel Alloy Edged Blank |
| `nickel_alloy_hinge` | Nickel Alloy Hinge Set | Worked metal | 5 | 0.22 | Craft: Shape Nickel Alloy Hinge Set |
| `nickel_alloy_mechanism` | Nickel Alloy Mechanism | Worked metal | 5 | 0.47 | Craft: Shape Nickel Alloy Mechanism |
| `nickel_alloy_plate` | Nickel Alloy Plate | Worked metal | 5 | 0.65 | Craft: Shape Nickel Alloy Plate |
| `nickel_alloy_stock` | Nickel Alloy Stock | Metal stock | 4 | 0.68 | Loot: depot, garage, hardware, industrial, warehouse |
| `nickel_steel_bar` | Nickel Steel Bar | Worked metal | 4 | 0.50 | Craft: Shape Nickel Steel Bar |
| `nickel_steel_billet` | Nickel Steel Billet | Worked metal | 4 | 0.84 | Craft: Shape Nickel Steel Billet |
| `nickel_steel_edge` | Nickel Steel Edged Blank | Worked metal | 4 | 0.33 | Craft: Shape Nickel Steel Edged Blank |
| `nickel_steel_hinge` | Nickel Steel Hinge Set | Worked metal | 4 | 0.21 | Craft: Shape Nickel Steel Hinge Set |
| `nickel_steel_mechanism` | Nickel Steel Mechanism | Worked metal | 4 | 0.43 | Craft: Shape Nickel Steel Mechanism |
| `nickel_steel_plate` | Nickel Steel Plate | Worked metal | 4 | 0.59 | Craft: Shape Nickel Steel Plate |
| `nickel_steel_stock` | Nickel Steel Stock | Metal stock | 3 | 0.63 | Loot: depot, garage, hardware, industrial, warehouse |
| `nylon_webbing_cord` | Nylon Webbing Cord | Worked textiles | 3 | 0.05 | Craft: Prepare Nylon Webbing Cord |
| `nylon_webbing_padding` | Nylon Webbing Padding | Worked textiles | 3 | 0.24 | Craft: Prepare Nylon Webbing Padding |
| `nylon_webbing_panel` | Nylon Webbing Panel | Worked textiles | 3 | 0.18 | Craft: Prepare Nylon Webbing Panel |
| `nylon_webbing_reinforcement` | Nylon Webbing Reinforcement | Worked textiles | 3 | 0.18 | Craft: Prepare Nylon Webbing Reinforcement |
| `nylon_webbing_textile` | Nylon Webbing Textile | Textile stock | 2 | 0.22 | Loot: clothing, depot, house, suburban, warehouse |
| `oak_frame` | Oak Frame | Worked timber | 1 | 0.78 | Craft: Shape Oak Frame |
| `oak_grip` | Oak Grip | Worked timber | 1 | 0.18 | Craft: Shape Oak Grip |
| `oak_shaft` | Oak Shaft | Worked timber | 1 | 0.54 | Craft: Shape Oak Shaft |
| `oak_slat` | Oak Slats | Worked timber | 1 | 0.27 | Craft: Shape Oak Slats |
| `oak_timber` | Oak Timber | Timber stock | 0 | 0.81 | Loot: cabin, camp, farm, forest, ranger |
| `oilskin_cord` | Oilskin Cord | Worked textiles | 2 | 0.07 | Craft: Prepare Oilskin Cord |
| `oilskin_padding` | Oilskin Padding | Worked textiles | 2 | 0.33 | Craft: Prepare Oilskin Padding |
| `oilskin_panel` | Oilskin Panel | Worked textiles | 2 | 0.25 | Craft: Prepare Oilskin Panel |
| `oilskin_reinforcement` | Oilskin Reinforcement | Worked textiles | 2 | 0.25 | Craft: Prepare Oilskin Reinforcement |
| `oilskin_textile` | Oilskin Textile | Textile stock | 1 | 0.30 | Loot: clothing, depot, house, suburban, warehouse |
| `orchard_receiver` | Orchard Receiver Assembly | Ranged equipment components | 2 | 0.41 | Loot: depot, garage, gunshop, police, warehouse |
| `outpost_receiver` | Outpost Receiver Assembly | Ranged equipment components | 2 | 0.50 | Loot: depot, garage, gunshop, police, warehouse |
| `pewter_bar` | Pewter Bar | Worked metal | 2 | 0.44 | Craft: Shape Pewter Bar |
| `pewter_billet` | Pewter Billet | Worked metal | 2 | 0.75 | Craft: Shape Pewter Billet |
| `pewter_edge` | Pewter Edged Blank | Worked metal | 2 | 0.30 | Craft: Shape Pewter Edged Blank |
| `pewter_hinge` | Pewter Hinge Set | Worked metal | 2 | 0.18 | Craft: Shape Pewter Hinge Set |
| `pewter_mechanism` | Pewter Mechanism | Worked metal | 2 | 0.38 | Craft: Shape Pewter Mechanism |
| `pewter_plate` | Pewter Plate | Worked metal | 2 | 0.53 | Craft: Shape Pewter Plate |
| `pewter_stock` | Pewter Stock | Metal stock | 1 | 0.56 | Loot: depot, garage, hardware, industrial, warehouse |
| `pine_frame` | Pine Frame | Worked timber | 1 | 0.43 | Craft: Shape Pine Frame |
| `pine_grip` | Pine Grip | Worked timber | 1 | 0.10 | Craft: Shape Pine Grip |
| `pine_shaft` | Pine Shaft | Worked timber | 1 | 0.30 | Craft: Shape Pine Shaft |
| `pine_slat` | Pine Slats | Worked timber | 1 | 0.15 | Craft: Shape Pine Slats |
| `pine_timber` | Pine Timber | Timber stock | 1 | 0.45 | Loot: cabin, camp, farm, forest, ranger |
| `resin` | Pine resin | materials | 0 | 0.14 | Loot: cabin, camp, forest, ranger, river |
| `plain_canvas_cord` | Plain Canvas Cord | Worked textiles | 2 | 0.07 | Craft: Prepare Plain Canvas Cord |
| `plain_canvas_padding` | Plain Canvas Padding | Worked textiles | 2 | 0.34 | Craft: Prepare Plain Canvas Padding |
| `plain_canvas_panel` | Plain Canvas Panel | Worked textiles | 2 | 0.27 | Craft: Prepare Plain Canvas Panel |
| `plain_canvas_reinforcement` | Plain Canvas Reinforcement | Worked textiles | 2 | 0.26 | Craft: Prepare Plain Canvas Reinforcement |
| `plain_canvas_textile` | Plain Canvas Textile | Textile stock | 1 | 0.32 | Loot: clothing, depot, house, suburban, warehouse |
| `plastic` | Plastic pieces | materials | 0 | 0.15 | Loot: depot, garage, hardware, industrial, warehouse, workshop |
| `poplar_frame` | Poplar Frame | Worked timber | 1 | 0.41 | Craft: Shape Poplar Frame |
| `poplar_grip` | Poplar Grip | Worked timber | 1 | 0.09 | Craft: Shape Poplar Grip |
| `poplar_shaft` | Poplar Shaft | Worked timber | 1 | 0.28 | Craft: Shape Poplar Shaft |
| `poplar_slat` | Poplar Slats | Worked timber | 1 | 0.14 | Craft: Shape Poplar Slats |
| `poplar_timber` | Poplar Timber | Timber stock | 2 | 0.42 | Loot: cabin, camp, farm, forest, ranger |
| `primer` | Primer tray | materials | 0 | 0.08 | Loot: gunshop |
| `quilted_cotton_cord` | Quilted Cotton Cord | Worked textiles | 3 | 0.08 | Craft: Prepare Quilted Cotton Cord |
| `quilted_cotton_padding` | Quilted Cotton Padding | Worked textiles | 3 | 0.42 | Craft: Prepare Quilted Cotton Padding |
| `quilted_cotton_panel` | Quilted Cotton Panel | Worked textiles | 3 | 0.33 | Craft: Prepare Quilted Cotton Panel |
| `quilted_cotton_reinforcement` | Quilted Cotton Reinforcement | Worked textiles | 3 | 0.32 | Craft: Prepare Quilted Cotton Reinforcement |
| `quilted_cotton_textile` | Quilted Cotton Textile | Textile stock | 2 | 0.39 | Loot: clothing, depot, house, suburban, warehouse |
| `parts` | Radio parts | materials | 0 | 0.35 | Loot: default, depot, industrial, police, radio, urban, warehouse, workshop |
| `ridgeway_receiver` | Ridgeway Receiver Assembly | Ranged equipment components | 2 | 0.57 | Loot: depot, garage, gunshop, police, warehouse |
| `ripstop_cord` | Ripstop Cord | Worked textiles | 3 | 0.04 | Craft: Prepare Ripstop Cord |
| `ripstop_padding` | Ripstop Padding | Worked textiles | 3 | 0.21 | Craft: Prepare Ripstop Padding |
| `ripstop_panel` | Ripstop Panel | Worked textiles | 3 | 0.16 | Craft: Prepare Ripstop Panel |
| `ripstop_reinforcement` | Ripstop Reinforcement | Worked textiles | 3 | 0.16 | Craft: Prepare Ripstop Reinforcement |
| `ripstop_textile` | Ripstop Textile | Textile stock | 2 | 0.20 | Loot: clothing, depot, house, suburban, warehouse |
| `rope` | Rope coil | materials | 0 | 0.40 | Loot: cabin, camp, depot, farm, forest, garage, hardware, industrial, ranger, river, warehouse, workshop |
| `rubber` | Rubber strip | materials | 0 | 0.20 | Loot: depot, fuel, garage, hardware, industrial, warehouse, workshop |
| `sailcloth_cord` | Sailcloth Cord | Worked textiles | 3 | 0.07 | Craft: Prepare Sailcloth Cord |
| `sailcloth_padding` | Sailcloth Padding | Worked textiles | 3 | 0.34 | Craft: Prepare Sailcloth Padding |
| `sailcloth_panel` | Sailcloth Panel | Worked textiles | 3 | 0.26 | Craft: Prepare Sailcloth Panel |
| `sailcloth_reinforcement` | Sailcloth Reinforcement | Worked textiles | 3 | 0.26 | Craft: Prepare Sailcloth Reinforcement |
| `sailcloth_textile` | Sailcloth Textile | Textile stock | 2 | 0.31 | Loot: clothing, depot, house, suburban, warehouse |
| `salt` | Salt packet | materials | 0 | 0.08 | Loot: grocery, house, market, restaurant, suburban, urban |
| `screws` | Screw box | materials | 0 | 0.20 | Loot: depot, garage, hardware, industrial, warehouse, workshop |
| `seatbelt_weave_cord` | Seatbelt Weave Cord | Worked textiles | 4 | 0.08 | Craft: Prepare Seatbelt Weave Cord |
| `seatbelt_weave_padding` | Seatbelt Weave Padding | Worked textiles | 4 | 0.38 | Craft: Prepare Seatbelt Weave Padding |
| `seatbelt_weave_panel` | Seatbelt Weave Panel | Worked textiles | 4 | 0.30 | Craft: Prepare Seatbelt Weave Panel |
| `seatbelt_weave_reinforcement` | Seatbelt Weave Reinforcement | Worked textiles | 4 | 0.29 | Craft: Prepare Seatbelt Weave Reinforcement |
| `seatbelt_weave_textile` | Seatbelt Weave Textile | Textile stock | 3 | 0.36 | Loot: clothing, depot, house, suburban, warehouse |
| `soap` | Soap bar | materials | 0 | 0.09 | Loot: default, house, suburban, urban |
| `spring_steel_bar` | Spring Steel Bar | Worked metal | 4 | 0.45 | Craft: Shape Spring Steel Bar |
| `spring_steel_billet` | Spring Steel Billet | Worked metal | 4 | 0.76 | Craft: Shape Spring Steel Billet |
| `spring_steel_edge` | Spring Steel Edged Blank | Worked metal | 4 | 0.30 | Craft: Shape Spring Steel Edged Blank |
| `spring_steel_hinge` | Spring Steel Hinge Set | Worked metal | 4 | 0.19 | Craft: Shape Spring Steel Hinge Set |
| `spring_steel_mechanism` | Spring Steel Mechanism | Worked metal | 4 | 0.39 | Craft: Shape Spring Steel Mechanism |
| `spring_steel_plate` | Spring Steel Plate | Worked metal | 4 | 0.54 | Craft: Shape Spring Steel Plate |
| `spring_steel_stock` | Spring Steel Stock | Metal stock | 3 | 0.57 | Loot: depot, garage, hardware, industrial, warehouse |
| `spruce_frame` | Spruce Frame | Worked timber | 1 | 0.39 | Craft: Shape Spruce Frame |
| `spruce_grip` | Spruce Grip | Worked timber | 1 | 0.09 | Craft: Shape Spruce Grip |
| `spruce_shaft` | Spruce Shaft | Worked timber | 1 | 0.26 | Craft: Shape Spruce Shaft |
| `spruce_slat` | Spruce Slats | Worked timber | 1 | 0.13 | Craft: Shape Spruce Slats |
| `spruce_timber` | Spruce Timber | Timber stock | 3 | 0.40 | Loot: cabin, camp, farm, forest, ranger |
| `stainless_steel_bar` | Stainless Steel Bar | Worked metal | 3 | 0.49 | Craft: Shape Stainless Steel Bar |
| `stainless_steel_billet` | Stainless Steel Billet | Worked metal | 3 | 0.83 | Craft: Shape Stainless Steel Billet |
| `stainless_steel_edge` | Stainless Steel Edged Blank | Worked metal | 3 | 0.33 | Craft: Shape Stainless Steel Edged Blank |
| `stainless_steel_hinge` | Stainless Steel Hinge Set | Worked metal | 3 | 0.20 | Craft: Shape Stainless Steel Hinge Set |
| `stainless_steel_mechanism` | Stainless Steel Mechanism | Worked metal | 3 | 0.42 | Craft: Shape Stainless Steel Mechanism |
| `stainless_steel_plate` | Stainless Steel Plate | Worked metal | 3 | 0.58 | Craft: Shape Stainless Steel Plate |
| `stainless_steel_stock` | Stainless Steel Stock | Metal stock | 2 | 0.61 | Loot: depot, garage, hardware, industrial, warehouse |
| `steel_sheet` | Steel sheet | materials | 0 | 1.80 | Loot: depot, industrial, warehouse |
| `stone` | Stone chunks | materials | 0 | 0.65 | Loot: default, depot, garage, hardware, industrial, suburban, warehouse, workshop |
| `sugar` | Sugar packet | materials | 0 | 0.08 | Loot: grocery, house, market, restaurant, suburban, urban |
| `switchyard_receiver` | Switchyard Receiver Assembly | Ranged equipment components | 2 | 0.52 | Loot: depot, garage, gunshop, police, warehouse |
| `thread` | Thread spool | materials | 0 | 0.04 | Loot: clothing, default, house, suburban, urban |
| `wood` | Timber | materials | 0 | 0.80 | Loot: cabin, camp, default, depot, forest, garage, hardware, industrial, ranger, river, suburban, warehouse, workshop |
| `titanium_bar` | Titanium Bar | Worked metal | 5 | 0.29 | Craft: Shape Titanium Bar |
| `titanium_billet` | Titanium Billet | Worked metal | 5 | 0.48 | Craft: Shape Titanium Billet |
| `titanium_edge` | Titanium Edged Blank | Worked metal | 5 | 0.19 | Craft: Shape Titanium Edged Blank |
| `titanium_hinge` | Titanium Hinge Set | Worked metal | 5 | 0.12 | Craft: Shape Titanium Hinge Set |
| `titanium_mechanism` | Titanium Mechanism | Worked metal | 5 | 0.25 | Craft: Shape Titanium Mechanism |
| `titanium_plate` | Titanium Plate | Worked metal | 5 | 0.34 | Craft: Shape Titanium Plate |
| `titanium_stock` | Titanium Stock | Metal stock | 4 | 0.36 | Loot: depot, garage, hardware, industrial, warehouse |
| `tool_steel_bar` | Tool Steel Bar | Worked metal | 4 | 0.52 | Craft: Shape Tool Steel Bar |
| `tool_steel_billet` | Tool Steel Billet | Worked metal | 4 | 0.88 | Craft: Shape Tool Steel Billet |
| `tool_steel_edge` | Tool Steel Edged Blank | Worked metal | 4 | 0.35 | Craft: Shape Tool Steel Edged Blank |
| `tool_steel_hinge` | Tool Steel Hinge Set | Worked metal | 4 | 0.21 | Craft: Shape Tool Steel Hinge Set |
| `tool_steel_mechanism` | Tool Steel Mechanism | Worked metal | 4 | 0.45 | Craft: Shape Tool Steel Mechanism |
| `tool_steel_plate` | Tool Steel Plate | Worked metal | 4 | 0.62 | Craft: Shape Tool Steel Plate |
| `tool_steel_stock` | Tool Steel Stock | Metal stock | 3 | 0.66 | Loot: depot, garage, hardware, industrial, warehouse |
| `walnut_frame` | Walnut Frame | Worked timber | 1 | 0.62 | Craft: Shape Walnut Frame |
| `walnut_grip` | Walnut Grip | Worked timber | 1 | 0.14 | Craft: Shape Walnut Grip |
| `walnut_shaft` | Walnut Shaft | Worked timber | 1 | 0.42 | Craft: Shape Walnut Shaft |
| `walnut_slat` | Walnut Slats | Worked timber | 1 | 0.21 | Craft: Shape Walnut Slats |
| `walnut_timber` | Walnut Timber | Timber stock | 0 | 0.63 | Loot: cabin, camp, farm, forest, ranger |
| `waxed_canvas_cord` | Waxed Canvas Cord | Worked textiles | 3 | 0.08 | Craft: Prepare Waxed Canvas Cord |
| `waxed_canvas_padding` | Waxed Canvas Padding | Worked textiles | 3 | 0.38 | Craft: Prepare Waxed Canvas Padding |
| `waxed_canvas_panel` | Waxed Canvas Panel | Worked textiles | 3 | 0.29 | Craft: Prepare Waxed Canvas Panel |
| `waxed_canvas_reinforcement` | Waxed Canvas Reinforcement | Worked textiles | 3 | 0.28 | Craft: Prepare Waxed Canvas Reinforcement |
| `waxed_canvas_textile` | Waxed Canvas Textile | Textile stock | 2 | 0.35 | Loot: clothing, depot, house, suburban, warehouse |
| `wayfarer_receiver` | Wayfarer Receiver Assembly | Ranged equipment components | 2 | 0.36 | Loot: depot, garage, gunshop, police, warehouse |
| `wire` | Wire spool | materials | 0 | 0.15 | Loot: depot, industrial, radio, urban, warehouse, workshop |
| `wool_felt_cord` | Wool Felt Cord | Worked textiles | 2 | 0.08 | Craft: Prepare Wool Felt Cord |
| `wool_felt_padding` | Wool Felt Padding | Worked textiles | 2 | 0.39 | Craft: Prepare Wool Felt Padding |
| `wool_felt_panel` | Wool Felt Panel | Worked textiles | 2 | 0.30 | Craft: Prepare Wool Felt Panel |
| `wool_felt_reinforcement` | Wool Felt Reinforcement | Worked textiles | 2 | 0.29 | Craft: Prepare Wool Felt Reinforcement |
| `wool_felt_textile` | Wool Felt Textile | Textile stock | 1 | 0.36 | Loot: clothing, depot, house, suburban, warehouse |
| `wrought_iron_bar` | Wrought Iron Bar | Worked metal | 2 | 0.47 | Craft: Shape Wrought Iron Bar |
| `wrought_iron_billet` | Wrought Iron Billet | Worked metal | 2 | 0.80 | Craft: Shape Wrought Iron Billet |
| `wrought_iron_edge` | Wrought Iron Edged Blank | Worked metal | 2 | 0.32 | Craft: Shape Wrought Iron Edged Blank |
| `wrought_iron_hinge` | Wrought Iron Hinge Set | Worked metal | 2 | 0.19 | Craft: Shape Wrought Iron Hinge Set |
| `wrought_iron_mechanism` | Wrought Iron Mechanism | Worked metal | 2 | 0.41 | Craft: Shape Wrought Iron Mechanism |
| `wrought_iron_plate` | Wrought Iron Plate | Worked metal | 2 | 0.56 | Craft: Shape Wrought Iron Plate |
| `wrought_iron_stock` | Wrought Iron Stock | Metal stock | 1 | 0.59 | Loot: depot, garage, hardware, industrial, warehouse |
| `yew_frame` | Yew Frame | Worked timber | 1 | 0.64 | Craft: Shape Yew Frame |
| `yew_grip` | Yew Grip | Worked timber | 1 | 0.15 | Craft: Shape Yew Grip |
| `yew_shaft` | Yew Shaft | Worked timber | 1 | 0.44 | Craft: Shape Yew Shaft |
| `yew_slat` | Yew Slats | Worked timber | 1 | 0.22 | Craft: Shape Yew Slats |
| `yew_timber` | Yew Timber | Timber stock | 1 | 0.66 | Loot: cabin, camp, farm, forest, ranger |
| `zinc_alloy_bar` | Zinc Alloy Bar | Worked metal | 2 | 0.40 | Craft: Shape Zinc Alloy Bar |
| `zinc_alloy_billet` | Zinc Alloy Billet | Worked metal | 2 | 0.67 | Craft: Shape Zinc Alloy Billet |
| `zinc_alloy_edge` | Zinc Alloy Edged Blank | Worked metal | 2 | 0.27 | Craft: Shape Zinc Alloy Edged Blank |
| `zinc_alloy_hinge` | Zinc Alloy Hinge Set | Worked metal | 2 | 0.16 | Craft: Shape Zinc Alloy Hinge Set |
| `zinc_alloy_mechanism` | Zinc Alloy Mechanism | Worked metal | 2 | 0.34 | Craft: Shape Zinc Alloy Mechanism |
| `zinc_alloy_plate` | Zinc Alloy Plate | Worked metal | 2 | 0.47 | Craft: Shape Zinc Alloy Plate |
| `zinc_alloy_stock` | Zinc Alloy Stock | Metal stock | 1 | 0.50 | Loot: depot, garage, hardware, industrial, warehouse |

## Medical

| Stable ID | Item | Family | Tier | kg | Obtain |
| --- | --- | --- | ---: | ---: | --- |
| `adhesive_dressing` | Adhesive dressing | medical | 0 | 0.05 | Loot: clinic, pharmacy, urban |
| `anise_seed_clean_wrap` | Anise Seed Clean Wrap | Prepared field care | 2 | 0.17 | Craft: Anise Seed Clean Wrap |
| `anise_seed_compress` | Anise Seed Field Compress | Prepared field care | 1 | 0.13 | Craft: Anise Seed Field Compress |
| `anise_seed_poultice` | Anise Seed Packed Poultice | Prepared field care | 1 | 0.18 | Craft: Anise Seed Packed Poultice |
| `anise_seed_recovery_kit` | Anise Seed Recovery Kit | Prepared field care | 3 | 0.49 | Craft: Anise Seed Recovery Kit |
| `anise_seed_care_tonic` | Anise Seed Recovery Tonic | Prepared field care | 2 | 0.31 | Craft: Anise Seed Recovery Tonic |
| `anise_seed_field_dressing` | Anise Seed Reinforced Dressing | Prepared field care | 3 | 0.24 | Craft: Anise Seed Reinforced Dressing |
| `antibiotics` | Antibiotic pack | medical | 0 | 0.05 | Loot: clinic, pharmacy |
| `antiseptic` | Antiseptic bottle | medical | 0 | 0.20 | Loot: clinic, pharmacy, urban |
| `antiseptic_wipes` | Antiseptic wipes | medical | 0 | 0.07 | Loot: clinic, pharmacy, urban |
| `burn_gel` | Burn dressing | medical | 0 | 0.12 | Loot: clinic, pharmacy |
| `chamomile_clean_wrap` | Chamomile Clean Wrap | Prepared field care | 2 | 0.17 | Craft: Chamomile Clean Wrap |
| `chamomile_compress` | Chamomile Field Compress | Prepared field care | 1 | 0.13 | Craft: Chamomile Field Compress |
| `chamomile_poultice` | Chamomile Packed Poultice | Prepared field care | 1 | 0.18 | Craft: Chamomile Packed Poultice |
| `chamomile_recovery_kit` | Chamomile Recovery Kit | Prepared field care | 3 | 0.49 | Craft: Chamomile Recovery Kit |
| `chamomile_care_tonic` | Chamomile Recovery Tonic | Prepared field care | 2 | 0.31 | Craft: Chamomile Recovery Tonic |
| `chamomile_field_dressing` | Chamomile Reinforced Dressing | Prepared field care | 3 | 0.24 | Craft: Chamomile Reinforced Dressing |
| `cinnamon_bark_clean_wrap` | Cinnamon Bark Clean Wrap | Prepared field care | 2 | 0.16 | Craft: Cinnamon Bark Clean Wrap |
| `cinnamon_bark_compress` | Cinnamon Bark Field Compress | Prepared field care | 1 | 0.12 | Craft: Cinnamon Bark Field Compress |
| `cinnamon_bark_poultice` | Cinnamon Bark Packed Poultice | Prepared field care | 1 | 0.17 | Craft: Cinnamon Bark Packed Poultice |
| `cinnamon_bark_recovery_kit` | Cinnamon Bark Recovery Kit | Prepared field care | 3 | 0.48 | Craft: Cinnamon Bark Recovery Kit |
| `cinnamon_bark_care_tonic` | Cinnamon Bark Recovery Tonic | Prepared field care | 2 | 0.30 | Craft: Cinnamon Bark Recovery Tonic |
| `cinnamon_bark_field_dressing` | Cinnamon Bark Reinforced Dressing | Prepared field care | 3 | 0.23 | Craft: Cinnamon Bark Reinforced Dressing |
| `clove_bud_clean_wrap` | Clove Bud Clean Wrap | Prepared field care | 2 | 0.17 | Craft: Clove Bud Clean Wrap |
| `clove_bud_compress` | Clove Bud Field Compress | Prepared field care | 1 | 0.13 | Craft: Clove Bud Field Compress |
| `clove_bud_poultice` | Clove Bud Packed Poultice | Prepared field care | 1 | 0.18 | Craft: Clove Bud Packed Poultice |
| `clove_bud_recovery_kit` | Clove Bud Recovery Kit | Prepared field care | 3 | 0.49 | Craft: Clove Bud Recovery Kit |
| `clove_bud_care_tonic` | Clove Bud Recovery Tonic | Prepared field care | 2 | 0.31 | Craft: Clove Bud Recovery Tonic |
| `clove_bud_field_dressing` | Clove Bud Reinforced Dressing | Prepared field care | 3 | 0.24 | Craft: Clove Bud Reinforced Dressing |
| `coriander_seed_clean_wrap` | Coriander Seed Clean Wrap | Prepared field care | 2 | 0.18 | Craft: Coriander Seed Clean Wrap |
| `coriander_seed_compress` | Coriander Seed Field Compress | Prepared field care | 1 | 0.14 | Craft: Coriander Seed Field Compress |
| `coriander_seed_poultice` | Coriander Seed Packed Poultice | Prepared field care | 1 | 0.19 | Craft: Coriander Seed Packed Poultice |
| `coriander_seed_recovery_kit` | Coriander Seed Recovery Kit | Prepared field care | 3 | 0.50 | Craft: Coriander Seed Recovery Kit |
| `coriander_seed_care_tonic` | Coriander Seed Recovery Tonic | Prepared field care | 2 | 0.32 | Craft: Coriander Seed Recovery Tonic |
| `coriander_seed_field_dressing` | Coriander Seed Reinforced Dressing | Prepared field care | 3 | 0.25 | Craft: Coriander Seed Reinforced Dressing |
| `cumin_seed_clean_wrap` | Cumin Seed Clean Wrap | Prepared field care | 2 | 0.16 | Craft: Cumin Seed Clean Wrap |
| `cumin_seed_compress` | Cumin Seed Field Compress | Prepared field care | 1 | 0.12 | Craft: Cumin Seed Field Compress |
| `cumin_seed_poultice` | Cumin Seed Packed Poultice | Prepared field care | 1 | 0.17 | Craft: Cumin Seed Packed Poultice |
| `cumin_seed_recovery_kit` | Cumin Seed Recovery Kit | Prepared field care | 3 | 0.48 | Craft: Cumin Seed Recovery Kit |
| `cumin_seed_care_tonic` | Cumin Seed Recovery Tonic | Prepared field care | 2 | 0.30 | Craft: Cumin Seed Recovery Tonic |
| `cumin_seed_field_dressing` | Cumin Seed Reinforced Dressing | Prepared field care | 3 | 0.23 | Craft: Cumin Seed Reinforced Dressing |
| `elderflower_clean_wrap` | Elderflower Clean Wrap | Prepared field care | 2 | 0.18 | Craft: Elderflower Clean Wrap |
| `elderflower_compress` | Elderflower Field Compress | Prepared field care | 1 | 0.14 | Craft: Elderflower Field Compress |
| `elderflower_poultice` | Elderflower Packed Poultice | Prepared field care | 1 | 0.19 | Craft: Elderflower Packed Poultice |
| `elderflower_recovery_kit` | Elderflower Recovery Kit | Prepared field care | 3 | 0.50 | Craft: Elderflower Recovery Kit |
| `elderflower_care_tonic` | Elderflower Recovery Tonic | Prepared field care | 2 | 0.32 | Craft: Elderflower Recovery Tonic |
| `elderflower_field_dressing` | Elderflower Reinforced Dressing | Prepared field care | 3 | 0.25 | Craft: Elderflower Reinforced Dressing |
| `emergency_dressing` | Emergency dressing | medical | 0 | 0.18 | Loot: clinic, pharmacy |
| `fennel_seed_clean_wrap` | Fennel Seed Clean Wrap | Prepared field care | 2 | 0.16 | Craft: Fennel Seed Clean Wrap |
| `fennel_seed_compress` | Fennel Seed Field Compress | Prepared field care | 1 | 0.12 | Craft: Fennel Seed Field Compress |
| `fennel_seed_poultice` | Fennel Seed Packed Poultice | Prepared field care | 1 | 0.17 | Craft: Fennel Seed Packed Poultice |
| `fennel_seed_recovery_kit` | Fennel Seed Recovery Kit | Prepared field care | 3 | 0.48 | Craft: Fennel Seed Recovery Kit |
| `fennel_seed_care_tonic` | Fennel Seed Recovery Tonic | Prepared field care | 2 | 0.30 | Craft: Fennel Seed Recovery Tonic |
| `fennel_seed_field_dressing` | Fennel Seed Reinforced Dressing | Prepared field care | 3 | 0.23 | Craft: Fennel Seed Reinforced Dressing |
| `bandage` | Field bandage | medical | 0 | 0.15 | Loot: cabin, clinic, default, pharmacy, urban |
| `splint` | Field splint | medical | 0 | 0.35 | Loot: clinic, pharmacy |
| `first_aid_kit` | First aid kit | medical | 0 | 0.65 | Loot: clinic, pharmacy, police |
| `ginger_piece_clean_wrap` | Ginger Piece Clean Wrap | Prepared field care | 2 | 0.17 | Craft: Ginger Piece Clean Wrap |
| `ginger_piece_compress` | Ginger Piece Field Compress | Prepared field care | 1 | 0.13 | Craft: Ginger Piece Field Compress |
| `ginger_piece_poultice` | Ginger Piece Packed Poultice | Prepared field care | 1 | 0.18 | Craft: Ginger Piece Packed Poultice |
| `ginger_piece_recovery_kit` | Ginger Piece Recovery Kit | Prepared field care | 3 | 0.49 | Craft: Ginger Piece Recovery Kit |
| `ginger_piece_care_tonic` | Ginger Piece Recovery Tonic | Prepared field care | 2 | 0.31 | Craft: Ginger Piece Recovery Tonic |
| `ginger_piece_field_dressing` | Ginger Piece Reinforced Dressing | Prepared field care | 3 | 0.24 | Craft: Ginger Piece Reinforced Dressing |
| `herbal_poultice` | Herbal compress | medical | 0 | 0.15 | Craft: Herbal compress |
| `hibiscus_clean_wrap` | Hibiscus Clean Wrap | Prepared field care | 2 | 0.18 | Craft: Hibiscus Clean Wrap |
| `hibiscus_compress` | Hibiscus Field Compress | Prepared field care | 1 | 0.14 | Craft: Hibiscus Field Compress |
| `hibiscus_poultice` | Hibiscus Packed Poultice | Prepared field care | 1 | 0.19 | Craft: Hibiscus Packed Poultice |
| `hibiscus_recovery_kit` | Hibiscus Recovery Kit | Prepared field care | 3 | 0.50 | Craft: Hibiscus Recovery Kit |
| `hibiscus_care_tonic` | Hibiscus Recovery Tonic | Prepared field care | 2 | 0.32 | Craft: Hibiscus Recovery Tonic |
| `hibiscus_field_dressing` | Hibiscus Reinforced Dressing | Prepared field care | 3 | 0.25 | Craft: Hibiscus Reinforced Dressing |
| `juniper_tip_clean_wrap` | Juniper Tip Clean Wrap | Prepared field care | 2 | 0.17 | Craft: Juniper Tip Clean Wrap |
| `juniper_tip_compress` | Juniper Tip Field Compress | Prepared field care | 1 | 0.13 | Craft: Juniper Tip Field Compress |
| `juniper_tip_poultice` | Juniper Tip Packed Poultice | Prepared field care | 1 | 0.18 | Craft: Juniper Tip Packed Poultice |
| `juniper_tip_recovery_kit` | Juniper Tip Recovery Kit | Prepared field care | 3 | 0.49 | Craft: Juniper Tip Recovery Kit |
| `juniper_tip_care_tonic` | Juniper Tip Recovery Tonic | Prepared field care | 2 | 0.31 | Craft: Juniper Tip Recovery Tonic |
| `juniper_tip_field_dressing` | Juniper Tip Reinforced Dressing | Prepared field care | 3 | 0.24 | Craft: Juniper Tip Reinforced Dressing |
| `lavender_clean_wrap` | Lavender Clean Wrap | Prepared field care | 2 | 0.18 | Craft: Lavender Clean Wrap |
| `lavender_compress` | Lavender Field Compress | Prepared field care | 1 | 0.14 | Craft: Lavender Field Compress |
| `lavender_poultice` | Lavender Packed Poultice | Prepared field care | 1 | 0.19 | Craft: Lavender Packed Poultice |
| `lavender_recovery_kit` | Lavender Recovery Kit | Prepared field care | 3 | 0.50 | Craft: Lavender Recovery Kit |
| `lavender_care_tonic` | Lavender Recovery Tonic | Prepared field care | 2 | 0.32 | Craft: Lavender Recovery Tonic |
| `lavender_field_dressing` | Lavender Reinforced Dressing | Prepared field care | 3 | 0.25 | Craft: Lavender Reinforced Dressing |
| `lemon_balm_clean_wrap` | Lemon Balm Clean Wrap | Prepared field care | 2 | 0.17 | Craft: Lemon Balm Clean Wrap |
| `lemon_balm_compress` | Lemon Balm Field Compress | Prepared field care | 1 | 0.13 | Craft: Lemon Balm Field Compress |
| `lemon_balm_poultice` | Lemon Balm Packed Poultice | Prepared field care | 1 | 0.18 | Craft: Lemon Balm Packed Poultice |
| `lemon_balm_recovery_kit` | Lemon Balm Recovery Kit | Prepared field care | 3 | 0.49 | Craft: Lemon Balm Recovery Kit |
| `lemon_balm_care_tonic` | Lemon Balm Recovery Tonic | Prepared field care | 2 | 0.31 | Craft: Lemon Balm Recovery Tonic |
| `lemon_balm_field_dressing` | Lemon Balm Reinforced Dressing | Prepared field care | 3 | 0.24 | Craft: Lemon Balm Reinforced Dressing |
| `licorice_root_clean_wrap` | Licorice Root Clean Wrap | Prepared field care | 2 | 0.18 | Craft: Licorice Root Clean Wrap |
| `licorice_root_compress` | Licorice Root Field Compress | Prepared field care | 1 | 0.14 | Craft: Licorice Root Field Compress |
| `licorice_root_poultice` | Licorice Root Packed Poultice | Prepared field care | 1 | 0.19 | Craft: Licorice Root Packed Poultice |
| `licorice_root_recovery_kit` | Licorice Root Recovery Kit | Prepared field care | 3 | 0.50 | Craft: Licorice Root Recovery Kit |
| `licorice_root_care_tonic` | Licorice Root Recovery Tonic | Prepared field care | 2 | 0.32 | Craft: Licorice Root Recovery Tonic |
| `licorice_root_field_dressing` | Licorice Root Reinforced Dressing | Prepared field care | 3 | 0.25 | Craft: Licorice Root Reinforced Dressing |
| `marsh_mallow_clean_wrap` | Marsh Mallow Clean Wrap | Prepared field care | 2 | 0.18 | Craft: Marsh Mallow Clean Wrap |
| `marsh_mallow_compress` | Marsh Mallow Field Compress | Prepared field care | 1 | 0.14 | Craft: Marsh Mallow Field Compress |
| `marsh_mallow_poultice` | Marsh Mallow Packed Poultice | Prepared field care | 1 | 0.19 | Craft: Marsh Mallow Packed Poultice |
| `marsh_mallow_recovery_kit` | Marsh Mallow Recovery Kit | Prepared field care | 3 | 0.50 | Craft: Marsh Mallow Recovery Kit |
| `marsh_mallow_care_tonic` | Marsh Mallow Recovery Tonic | Prepared field care | 2 | 0.32 | Craft: Marsh Mallow Recovery Tonic |
| `marsh_mallow_field_dressing` | Marsh Mallow Reinforced Dressing | Prepared field care | 3 | 0.25 | Craft: Marsh Mallow Reinforced Dressing |
| `meadow_mint_clean_wrap` | Meadow Mint Clean Wrap | Prepared field care | 2 | 0.16 | Craft: Meadow Mint Clean Wrap |
| `meadow_mint_compress` | Meadow Mint Field Compress | Prepared field care | 1 | 0.12 | Craft: Meadow Mint Field Compress |
| `meadow_mint_poultice` | Meadow Mint Packed Poultice | Prepared field care | 1 | 0.17 | Craft: Meadow Mint Packed Poultice |
| `meadow_mint_recovery_kit` | Meadow Mint Recovery Kit | Prepared field care | 3 | 0.48 | Craft: Meadow Mint Recovery Kit |
| `meadow_mint_care_tonic` | Meadow Mint Recovery Tonic | Prepared field care | 2 | 0.30 | Craft: Meadow Mint Recovery Tonic |
| `meadow_mint_field_dressing` | Meadow Mint Reinforced Dressing | Prepared field care | 3 | 0.23 | Craft: Meadow Mint Reinforced Dressing |
| `nettle_leaf_clean_wrap` | Nettle Leaf Clean Wrap | Prepared field care | 2 | 0.17 | Craft: Nettle Leaf Clean Wrap |
| `nettle_leaf_compress` | Nettle Leaf Field Compress | Prepared field care | 1 | 0.13 | Craft: Nettle Leaf Field Compress |
| `nettle_leaf_poultice` | Nettle Leaf Packed Poultice | Prepared field care | 1 | 0.18 | Craft: Nettle Leaf Packed Poultice |
| `nettle_leaf_recovery_kit` | Nettle Leaf Recovery Kit | Prepared field care | 3 | 0.49 | Craft: Nettle Leaf Recovery Kit |
| `nettle_leaf_care_tonic` | Nettle Leaf Recovery Tonic | Prepared field care | 2 | 0.31 | Craft: Nettle Leaf Recovery Tonic |
| `nettle_leaf_field_dressing` | Nettle Leaf Reinforced Dressing | Prepared field care | 3 | 0.24 | Craft: Nettle Leaf Reinforced Dressing |
| `painkillers` | Pain relief tablets | medical | 0 | 0.03 | Loot: clinic, pharmacy |
| `plantain_leaf_clean_wrap` | Plantain Leaf Clean Wrap | Prepared field care | 2 | 0.16 | Craft: Plantain Leaf Clean Wrap |
| `plantain_leaf_compress` | Plantain Leaf Field Compress | Prepared field care | 1 | 0.12 | Craft: Plantain Leaf Field Compress |
| `plantain_leaf_poultice` | Plantain Leaf Packed Poultice | Prepared field care | 1 | 0.17 | Craft: Plantain Leaf Packed Poultice |
| `plantain_leaf_recovery_kit` | Plantain Leaf Recovery Kit | Prepared field care | 3 | 0.48 | Craft: Plantain Leaf Recovery Kit |
| `plantain_leaf_care_tonic` | Plantain Leaf Recovery Tonic | Prepared field care | 2 | 0.30 | Craft: Plantain Leaf Recovery Tonic |
| `plantain_leaf_field_dressing` | Plantain Leaf Reinforced Dressing | Prepared field care | 3 | 0.23 | Craft: Plantain Leaf Reinforced Dressing |
| `raspberry_leaf_clean_wrap` | Raspberry Leaf Clean Wrap | Prepared field care | 2 | 0.16 | Craft: Raspberry Leaf Clean Wrap |
| `raspberry_leaf_compress` | Raspberry Leaf Field Compress | Prepared field care | 1 | 0.12 | Craft: Raspberry Leaf Field Compress |
| `raspberry_leaf_poultice` | Raspberry Leaf Packed Poultice | Prepared field care | 1 | 0.17 | Craft: Raspberry Leaf Packed Poultice |
| `raspberry_leaf_recovery_kit` | Raspberry Leaf Recovery Kit | Prepared field care | 3 | 0.48 | Craft: Raspberry Leaf Recovery Kit |
| `raspberry_leaf_care_tonic` | Raspberry Leaf Recovery Tonic | Prepared field care | 2 | 0.30 | Craft: Raspberry Leaf Recovery Tonic |
| `raspberry_leaf_field_dressing` | Raspberry Leaf Reinforced Dressing | Prepared field care | 3 | 0.23 | Craft: Raspberry Leaf Reinforced Dressing |
| `rosehip_clean_wrap` | Rosehip Clean Wrap | Prepared field care | 2 | 0.16 | Craft: Rosehip Clean Wrap |
| `rosehip_compress` | Rosehip Field Compress | Prepared field care | 1 | 0.12 | Craft: Rosehip Field Compress |
| `rosehip_poultice` | Rosehip Packed Poultice | Prepared field care | 1 | 0.17 | Craft: Rosehip Packed Poultice |
| `rosehip_recovery_kit` | Rosehip Recovery Kit | Prepared field care | 3 | 0.48 | Craft: Rosehip Recovery Kit |
| `rosehip_care_tonic` | Rosehip Recovery Tonic | Prepared field care | 2 | 0.30 | Craft: Rosehip Recovery Tonic |
| `rosehip_field_dressing` | Rosehip Reinforced Dressing | Prepared field care | 3 | 0.23 | Craft: Rosehip Reinforced Dressing |
| `rosemary_clean_wrap` | Rosemary Clean Wrap | Prepared field care | 2 | 0.18 | Craft: Rosemary Clean Wrap |
| `rosemary_compress` | Rosemary Field Compress | Prepared field care | 1 | 0.14 | Craft: Rosemary Field Compress |
| `rosemary_poultice` | Rosemary Packed Poultice | Prepared field care | 1 | 0.19 | Craft: Rosemary Packed Poultice |
| `rosemary_recovery_kit` | Rosemary Recovery Kit | Prepared field care | 3 | 0.50 | Craft: Rosemary Recovery Kit |
| `rosemary_care_tonic` | Rosemary Recovery Tonic | Prepared field care | 2 | 0.32 | Craft: Rosemary Recovery Tonic |
| `rosemary_field_dressing` | Rosemary Reinforced Dressing | Prepared field care | 3 | 0.25 | Craft: Rosemary Reinforced Dressing |
| `sage_clean_wrap` | Sage Clean Wrap | Prepared field care | 2 | 0.17 | Craft: Sage Clean Wrap |
| `sage_compress` | Sage Field Compress | Prepared field care | 1 | 0.13 | Craft: Sage Field Compress |
| `sage_poultice` | Sage Packed Poultice | Prepared field care | 1 | 0.18 | Craft: Sage Packed Poultice |
| `sage_recovery_kit` | Sage Recovery Kit | Prepared field care | 3 | 0.49 | Craft: Sage Recovery Kit |
| `sage_care_tonic` | Sage Recovery Tonic | Prepared field care | 2 | 0.31 | Craft: Sage Recovery Tonic |
| `sage_field_dressing` | Sage Reinforced Dressing | Prepared field care | 3 | 0.24 | Craft: Sage Reinforced Dressing |
| `gauze` | Sterile gauze | medical | 0 | 0.08 | Loot: clinic, pharmacy, urban |
| `suture_kit` | Suture kit | medical | 0 | 0.18 | Loot: clinic, pharmacy |
| `thyme_clean_wrap` | Thyme Clean Wrap | Prepared field care | 2 | 0.16 | Craft: Thyme Clean Wrap |
| `thyme_compress` | Thyme Field Compress | Prepared field care | 1 | 0.12 | Craft: Thyme Field Compress |
| `thyme_poultice` | Thyme Packed Poultice | Prepared field care | 1 | 0.17 | Craft: Thyme Packed Poultice |
| `thyme_recovery_kit` | Thyme Recovery Kit | Prepared field care | 3 | 0.48 | Craft: Thyme Recovery Kit |
| `thyme_care_tonic` | Thyme Recovery Tonic | Prepared field care | 2 | 0.30 | Craft: Thyme Recovery Tonic |
| `thyme_field_dressing` | Thyme Reinforced Dressing | Prepared field care | 3 | 0.23 | Craft: Thyme Reinforced Dressing |
| `tourniquet` | Tourniquet | medical | 0 | 0.08 | Loot: clinic, pharmacy |
| `turmeric_piece_clean_wrap` | Turmeric Piece Clean Wrap | Prepared field care | 2 | 0.18 | Craft: Turmeric Piece Clean Wrap |
| `turmeric_piece_compress` | Turmeric Piece Field Compress | Prepared field care | 1 | 0.14 | Craft: Turmeric Piece Field Compress |
| `turmeric_piece_poultice` | Turmeric Piece Packed Poultice | Prepared field care | 1 | 0.19 | Craft: Turmeric Piece Packed Poultice |
| `turmeric_piece_recovery_kit` | Turmeric Piece Recovery Kit | Prepared field care | 3 | 0.50 | Craft: Turmeric Piece Recovery Kit |
| `turmeric_piece_care_tonic` | Turmeric Piece Recovery Tonic | Prepared field care | 2 | 0.32 | Craft: Turmeric Piece Recovery Tonic |
| `turmeric_piece_field_dressing` | Turmeric Piece Reinforced Dressing | Prepared field care | 3 | 0.25 | Craft: Turmeric Piece Reinforced Dressing |
| `vitamins` | Vitamin bottle | medical | 0 | 0.04 | Loot: clinic, pharmacy |

## Melee

| Stable ID | Item | Family | Tier | kg | Obtain |
| --- | --- | --- | ---: | ---: | --- |
| `aluminum_boarding_axe` | Aluminum Boarding Axe | Material melee weapons | 1 | 0.93 | Craft: Assemble Aluminum Boarding Axe |
| `aluminum_partisan` | Aluminum Broad Spear | Material melee weapons | 2 | 0.91 | Craft: Assemble Aluminum Broad Spear |
| `aluminum_camp_axe` | Aluminum Camp Axe | Material melee weapons | 1 | 0.71 | Craft: Assemble Aluminum Camp Axe |
| `aluminum_cleaver` | Aluminum Camp Cleaver | Material melee weapons | 1 | 0.32 | Craft: Assemble Aluminum Camp Cleaver |
| `aluminum_cutlass` | Aluminum Camp Cutlass | Material melee weapons | 1 | 0.52 | Craft: Assemble Aluminum Camp Cutlass |
| `aluminum_combat_knife` | Aluminum Combat Knife | Material melee weapons | 1 | 0.18 | Craft: Assemble Aluminum Combat Knife |
| `aluminum_mace` | Aluminum Field Mace | Material melee weapons | 1 | 0.81 | Craft: Assemble Aluminum Field Mace |
| `aluminum_kukri` | Aluminum Forward-Curved Knife | Material melee weapons | 1 | 0.32 | Craft: Assemble Aluminum Forward-Curved Knife |
| `aluminum_guard_baton` | Aluminum Guard Baton | Material melee weapons | 1 | 0.46 | Craft: Assemble Aluminum Guard Baton |
| `aluminum_halberd` | Aluminum Guard Halberd | Material melee weapons | 2 | 1.14 | Craft: Assemble Aluminum Guard Halberd |
| `aluminum_hand_axe` | Aluminum Hand Axe | Material melee weapons | 1 | 0.49 | Craft: Assemble Aluminum Hand Axe |
| `aluminum_sickle` | Aluminum Harvest Sickle | Material melee weapons | 1 | 0.35 | Craft: Assemble Aluminum Harvest Sickle |
| `aluminum_maul` | Aluminum Heavy Maul | Material melee weapons | 2 | 1.91 | Craft: Assemble Aluminum Heavy Maul |
| `aluminum_hook_spear` | Aluminum Hook Spear | Material melee weapons | 2 | 0.82 | Craft: Assemble Aluminum Hook Spear |
| `aluminum_war_pick` | Aluminum Hooked Impact Pick | Material melee weapons | 1 | 0.84 | Craft: Assemble Aluminum Hooked Impact Pick |
| `aluminum_war_hammer` | Aluminum Impact Hammer | Material melee weapons | 1 | 1.03 | Craft: Assemble Aluminum Impact Hammer |
| `aluminum_chain_morningstar` | Aluminum Linked Impact Club | Material melee weapons | 1 | 1.10 | Craft: Assemble Aluminum Linked Impact Club |
| `aluminum_glaive` | Aluminum Long Glaive | Material melee weapons | 2 | 0.95 | Craft: Assemble Aluminum Long Glaive |
| `aluminum_poleaxe` | Aluminum Long Poleaxe | Material melee weapons | 2 | 1.26 | Craft: Assemble Aluminum Long Poleaxe |
| `aluminum_longsword` | Aluminum Long Sword | Material melee weapons | 1 | 0.78 | Craft: Assemble Aluminum Long Sword |
| `aluminum_pry_baton` | Aluminum Pry Baton | Material melee weapons | 1 | 0.72 | Craft: Assemble Aluminum Pry Baton |
| `aluminum_flanged_mace` | Aluminum Ribbed Mace | Material melee weapons | 1 | 0.84 | Craft: Assemble Aluminum Ribbed Mace |
| `aluminum_sabre` | Aluminum Scout Sabre | Material melee weapons | 1 | 0.46 | Craft: Assemble Aluminum Scout Sabre |
| `aluminum_shortsword` | Aluminum Short Sword | Material melee weapons | 1 | 0.40 | Craft: Assemble Aluminum Short Sword |
| `aluminum_spear` | Aluminum Socket Spear | Material melee weapons | 2 | 0.64 | Craft: Assemble Aluminum Socket Spear |
| `aluminum_trench_club` | Aluminum Weighted Field Club | Material melee weapons | 1 | 0.76 | Craft: Assemble Aluminum Weighted Field Club |
| `bat` | Baseball bat | melee | 0 | 1.20 | Loot: house |
| `boron_steel_boarding_axe` | Boron Steel Boarding Axe | Material melee weapons | 4 | 1.91 | Craft: Assemble Boron Steel Boarding Axe |
| `boron_steel_partisan` | Boron Steel Broad Spear | Material melee weapons | 5 | 1.85 | Craft: Assemble Boron Steel Broad Spear |
| `boron_steel_camp_axe` | Boron Steel Camp Axe | Material melee weapons | 4 | 1.52 | Craft: Assemble Boron Steel Camp Axe |
| `boron_steel_cleaver` | Boron Steel Camp Cleaver | Material melee weapons | 4 | 0.59 | Craft: Assemble Boron Steel Camp Cleaver |
| `boron_steel_cutlass` | Boron Steel Camp Cutlass | Material melee weapons | 4 | 1.01 | Craft: Assemble Boron Steel Camp Cutlass |
| `boron_steel_combat_knife` | Boron Steel Combat Knife | Material melee weapons | 4 | 0.38 | Craft: Assemble Boron Steel Combat Knife |
| `boron_steel_mace` | Boron Steel Field Mace | Material melee weapons | 4 | 1.63 | Craft: Assemble Boron Steel Field Mace |
| `boron_steel_kukri` | Boron Steel Forward-Curved Knife | Material melee weapons | 4 | 0.64 | Craft: Assemble Boron Steel Forward-Curved Knife |
| `boron_steel_guard_baton` | Boron Steel Guard Baton | Material melee weapons | 4 | 0.87 | Craft: Assemble Boron Steel Guard Baton |
| `boron_steel_halberd` | Boron Steel Guard Halberd | Material melee weapons | 5 | 2.35 | Craft: Assemble Boron Steel Guard Halberd |
| `boron_steel_hand_axe` | Boron Steel Hand Axe | Material melee weapons | 4 | 0.99 | Craft: Assemble Boron Steel Hand Axe |
| `boron_steel_sickle` | Boron Steel Harvest Sickle | Material melee weapons | 4 | 0.63 | Craft: Assemble Boron Steel Harvest Sickle |
| `boron_steel_maul` | Boron Steel Heavy Maul | Material melee weapons | 5 | 4.03 | Craft: Assemble Boron Steel Heavy Maul |
| `boron_steel_hook_spear` | Boron Steel Hook Spear | Material melee weapons | 5 | 1.66 | Craft: Assemble Boron Steel Hook Spear |
| `boron_steel_war_pick` | Boron Steel Hooked Impact Pick | Material melee weapons | 4 | 1.81 | Craft: Assemble Boron Steel Hooked Impact Pick |
| `boron_steel_war_hammer` | Boron Steel Impact Hammer | Material melee weapons | 4 | 2.09 | Craft: Assemble Boron Steel Impact Hammer |
| `boron_steel_chain_morningstar` | Boron Steel Linked Impact Club | Material melee weapons | 4 | 2.36 | Craft: Assemble Boron Steel Linked Impact Club |
| `boron_steel_glaive` | Boron Steel Long Glaive | Material melee weapons | 5 | 1.97 | Craft: Assemble Boron Steel Long Glaive |
| `boron_steel_poleaxe` | Boron Steel Long Poleaxe | Material melee weapons | 5 | 2.60 | Craft: Assemble Boron Steel Long Poleaxe |
| `boron_steel_longsword` | Boron Steel Long Sword | Material melee weapons | 4 | 1.59 | Craft: Assemble Boron Steel Long Sword |
| `boron_steel_pry_baton` | Boron Steel Pry Baton | Material melee weapons | 4 | 1.50 | Craft: Assemble Boron Steel Pry Baton |
| `boron_steel_flanged_mace` | Boron Steel Ribbed Mace | Material melee weapons | 4 | 1.78 | Craft: Assemble Boron Steel Ribbed Mace |
| `boron_steel_sabre` | Boron Steel Scout Sabre | Material melee weapons | 4 | 0.86 | Craft: Assemble Boron Steel Scout Sabre |
| `boron_steel_shortsword` | Boron Steel Short Sword | Material melee weapons | 4 | 0.79 | Craft: Assemble Boron Steel Short Sword |
| `boron_steel_spear` | Boron Steel Socket Spear | Material melee weapons | 5 | 1.34 | Craft: Assemble Boron Steel Socket Spear |
| `boron_steel_trench_club` | Boron Steel Weighted Field Club | Material melee weapons | 4 | 1.54 | Craft: Assemble Boron Steel Weighted Field Club |
| `brass_boarding_axe` | Brass Boarding Axe | Material melee weapons | 1 | 2.08 | Craft: Assemble Brass Boarding Axe |
| `brass_partisan` | Brass Broad Spear | Material melee weapons | 2 | 2.01 | Craft: Assemble Brass Broad Spear |
| `brass_camp_axe` | Brass Camp Axe | Material melee weapons | 1 | 1.63 | Craft: Assemble Brass Camp Axe |
| `brass_cleaver` | Brass Camp Cleaver | Material melee weapons | 1 | 0.60 | Craft: Assemble Brass Camp Cleaver |
| `brass_cutlass` | Brass Camp Cutlass | Material melee weapons | 1 | 1.10 | Craft: Assemble Brass Camp Cutlass |
| `brass_combat_knife` | Brass Combat Knife | Material melee weapons | 1 | 0.38 | Craft: Assemble Brass Combat Knife |
| `brass_mace` | Brass Field Mace | Material melee weapons | 1 | 1.70 | Craft: Assemble Brass Field Mace |
| `brass_kukri` | Brass Forward-Curved Knife | Material melee weapons | 1 | 0.71 | Craft: Assemble Brass Forward-Curved Knife |
| `brass_guard_baton` | Brass Guard Baton | Material melee weapons | 1 | 0.97 | Craft: Assemble Brass Guard Baton |
| `brass_halberd` | Brass Guard Halberd | Material melee weapons | 2 | 2.56 | Craft: Assemble Brass Guard Halberd |
| `brass_hand_axe` | Brass Hand Axe | Material melee weapons | 1 | 1.06 | Craft: Assemble Brass Hand Axe |
| `brass_sickle` | Brass Harvest Sickle | Material melee weapons | 1 | 0.69 | Craft: Assemble Brass Harvest Sickle |
| `brass_maul` | Brass Heavy Maul | Material melee weapons | 2 | 4.31 | Craft: Assemble Brass Heavy Maul |
| `brass_hook_spear` | Brass Hook Spear | Material melee weapons | 2 | 1.75 | Craft: Assemble Brass Hook Spear |
| `brass_war_pick` | Brass Hooked Impact Pick | Material melee weapons | 1 | 1.92 | Craft: Assemble Brass Hooked Impact Pick |
| `brass_war_hammer` | Brass Impact Hammer | Material melee weapons | 1 | 2.27 | Craft: Assemble Brass Impact Hammer |
| `brass_chain_morningstar` | Brass Linked Impact Club | Material melee weapons | 1 | 2.53 | Craft: Assemble Brass Linked Impact Club |
| `brass_glaive` | Brass Long Glaive | Material melee weapons | 2 | 2.10 | Craft: Assemble Brass Long Glaive |
| `brass_poleaxe` | Brass Long Poleaxe | Material melee weapons | 2 | 2.83 | Craft: Assemble Brass Long Poleaxe |
| `brass_longsword` | Brass Long Sword | Material melee weapons | 1 | 1.67 | Craft: Assemble Brass Long Sword |
| `brass_pry_baton` | Brass Pry Baton | Material melee weapons | 1 | 1.61 | Craft: Assemble Brass Pry Baton |
| `brass_flanged_mace` | Brass Ribbed Mace | Material melee weapons | 1 | 1.88 | Craft: Assemble Brass Ribbed Mace |
| `brass_sabre` | Brass Scout Sabre | Material melee weapons | 1 | 0.96 | Craft: Assemble Brass Scout Sabre |
| `brass_shortsword` | Brass Short Sword | Material melee weapons | 1 | 0.83 | Craft: Assemble Brass Short Sword |
| `brass_spear` | Brass Socket Spear | Material melee weapons | 2 | 1.46 | Craft: Assemble Brass Socket Spear |
| `brass_trench_club` | Brass Weighted Field Club | Material melee weapons | 1 | 1.69 | Craft: Assemble Brass Weighted Field Club |
| `bronze_boarding_axe` | Bronze Boarding Axe | Material melee weapons | 1 | 2.10 | Craft: Assemble Bronze Boarding Axe |
| `bronze_partisan` | Bronze Broad Spear | Material melee weapons | 2 | 2.05 | Craft: Assemble Bronze Broad Spear |
| `bronze_camp_axe` | Bronze Camp Axe | Material melee weapons | 1 | 1.65 | Craft: Assemble Bronze Camp Axe |
| `bronze_cleaver` | Bronze Camp Cleaver | Material melee weapons | 1 | 0.66 | Craft: Assemble Bronze Camp Cleaver |
| `bronze_cutlass` | Bronze Camp Cutlass | Material melee weapons | 1 | 1.13 | Craft: Assemble Bronze Camp Cutlass |
| `bronze_combat_knife` | Bronze Combat Knife | Material melee weapons | 1 | 0.36 | Craft: Assemble Bronze Combat Knife |
| `bronze_mace` | Bronze Field Mace | Material melee weapons | 1 | 1.73 | Craft: Assemble Bronze Field Mace |
| `bronze_kukri` | Bronze Forward-Curved Knife | Material melee weapons | 1 | 0.72 | Craft: Assemble Bronze Forward-Curved Knife |
| `bronze_guard_baton` | Bronze Guard Baton | Material melee weapons | 1 | 1.00 | Craft: Assemble Bronze Guard Baton |
| `bronze_halberd` | Bronze Guard Halberd | Material melee weapons | 2 | 2.59 | Craft: Assemble Bronze Guard Halberd |
| `bronze_hand_axe` | Bronze Hand Axe | Material melee weapons | 1 | 1.05 | Craft: Assemble Bronze Hand Axe |
| `bronze_sickle` | Bronze Harvest Sickle | Material melee weapons | 1 | 0.69 | Craft: Assemble Bronze Harvest Sickle |
| `bronze_maul` | Bronze Heavy Maul | Material melee weapons | 2 | 4.43 | Craft: Assemble Bronze Heavy Maul |
| `bronze_hook_spear` | Bronze Hook Spear | Material melee weapons | 2 | 1.80 | Craft: Assemble Bronze Hook Spear |
| `bronze_war_pick` | Bronze Hooked Impact Pick | Material melee weapons | 1 | 1.92 | Craft: Assemble Bronze Hooked Impact Pick |
| `bronze_war_hammer` | Bronze Impact Hammer | Material melee weapons | 1 | 2.30 | Craft: Assemble Bronze Impact Hammer |
| `bronze_chain_morningstar` | Bronze Linked Impact Club | Material melee weapons | 1 | 2.57 | Craft: Assemble Bronze Linked Impact Club |
| `bronze_glaive` | Bronze Long Glaive | Material melee weapons | 2 | 2.16 | Craft: Assemble Bronze Long Glaive |
| `bronze_poleaxe` | Bronze Long Poleaxe | Material melee weapons | 2 | 2.89 | Craft: Assemble Bronze Long Poleaxe |
| `bronze_longsword` | Bronze Long Sword | Material melee weapons | 1 | 1.72 | Craft: Assemble Bronze Long Sword |
| `bronze_pry_baton` | Bronze Pry Baton | Material melee weapons | 1 | 1.61 | Craft: Assemble Bronze Pry Baton |
| `bronze_flanged_mace` | Bronze Ribbed Mace | Material melee weapons | 1 | 1.91 | Craft: Assemble Bronze Ribbed Mace |
| `bronze_sabre` | Bronze Scout Sabre | Material melee weapons | 1 | 0.96 | Craft: Assemble Bronze Scout Sabre |
| `bronze_shortsword` | Bronze Short Sword | Material melee weapons | 1 | 0.86 | Craft: Assemble Bronze Short Sword |
| `bronze_spear` | Bronze Socket Spear | Material melee weapons | 2 | 1.48 | Craft: Assemble Bronze Socket Spear |
| `bronze_trench_club` | Bronze Weighted Field Club | Material melee weapons | 1 | 1.70 | Craft: Assemble Bronze Weighted Field Club |
| `carbon_steel_boarding_axe` | Carbon Steel Boarding Axe | Material melee weapons | 2 | 1.86 | Craft: Assemble Carbon Steel Boarding Axe |
| `carbon_steel_partisan` | Carbon Steel Broad Spear | Material melee weapons | 3 | 1.84 | Craft: Assemble Carbon Steel Broad Spear |
| `carbon_steel_camp_axe` | Carbon Steel Camp Axe | Material melee weapons | 2 | 1.46 | Craft: Assemble Carbon Steel Camp Axe |
| `carbon_steel_cleaver` | Carbon Steel Camp Cleaver | Material melee weapons | 2 | 0.58 | Craft: Assemble Carbon Steel Camp Cleaver |
| `carbon_steel_cutlass` | Carbon Steel Camp Cutlass | Material melee weapons | 2 | 1.01 | Craft: Assemble Carbon Steel Camp Cutlass |
| `carbon_steel_combat_knife` | Carbon Steel Combat Knife | Material melee weapons | 2 | 0.34 | Loot: depot, garage, hardware, warehouse |
| `carbon_steel_mace` | Carbon Steel Field Mace | Material melee weapons | 2 | 1.57 | Craft: Assemble Carbon Steel Field Mace |
| `carbon_steel_kukri` | Carbon Steel Forward-Curved Knife | Material melee weapons | 2 | 0.62 | Craft: Assemble Carbon Steel Forward-Curved Knife |
| `carbon_steel_guard_baton` | Carbon Steel Guard Baton | Material melee weapons | 2 | 0.86 | Craft: Assemble Carbon Steel Guard Baton |
| `carbon_steel_halberd` | Carbon Steel Guard Halberd | Material melee weapons | 3 | 2.33 | Craft: Assemble Carbon Steel Guard Halberd |
| `carbon_steel_hand_axe` | Carbon Steel Hand Axe | Material melee weapons | 2 | 1.00 | Loot: depot, garage, hardware, warehouse |
| `carbon_steel_sickle` | Carbon Steel Harvest Sickle | Material melee weapons | 2 | 0.62 | Loot: depot, garage, hardware, warehouse |
| `carbon_steel_maul` | Carbon Steel Heavy Maul | Material melee weapons | 3 | 3.96 | Craft: Assemble Carbon Steel Heavy Maul |
| `carbon_steel_hook_spear` | Carbon Steel Hook Spear | Material melee weapons | 3 | 1.64 | Craft: Assemble Carbon Steel Hook Spear |
| `carbon_steel_war_pick` | Carbon Steel Hooked Impact Pick | Material melee weapons | 2 | 1.74 | Craft: Assemble Carbon Steel Hooked Impact Pick |
| `carbon_steel_war_hammer` | Carbon Steel Impact Hammer | Material melee weapons | 2 | 2.06 | Craft: Assemble Carbon Steel Impact Hammer |
| `carbon_steel_chain_morningstar` | Carbon Steel Linked Impact Club | Material melee weapons | 2 | 2.29 | Craft: Assemble Carbon Steel Linked Impact Club |
| `carbon_steel_glaive` | Carbon Steel Long Glaive | Material melee weapons | 3 | 1.95 | Craft: Assemble Carbon Steel Long Glaive |
| `carbon_steel_poleaxe` | Carbon Steel Long Poleaxe | Material melee weapons | 3 | 2.55 | Craft: Assemble Carbon Steel Long Poleaxe |
| `carbon_steel_longsword` | Carbon Steel Long Sword | Material melee weapons | 2 | 1.57 | Craft: Assemble Carbon Steel Long Sword |
| `carbon_steel_pry_baton` | Carbon Steel Pry Baton | Material melee weapons | 2 | 1.50 | Loot: depot, garage, hardware, warehouse |
| `carbon_steel_flanged_mace` | Carbon Steel Ribbed Mace | Material melee weapons | 2 | 1.75 | Craft: Assemble Carbon Steel Ribbed Mace |
| `carbon_steel_sabre` | Carbon Steel Scout Sabre | Material melee weapons | 2 | 0.88 | Craft: Assemble Carbon Steel Scout Sabre |
| `carbon_steel_shortsword` | Carbon Steel Short Sword | Material melee weapons | 2 | 0.79 | Craft: Assemble Carbon Steel Short Sword |
| `carbon_steel_spear` | Carbon Steel Socket Spear | Material melee weapons | 3 | 1.30 | Craft: Assemble Carbon Steel Socket Spear |
| `carbon_steel_trench_club` | Carbon Steel Weighted Field Club | Material melee weapons | 2 | 1.50 | Craft: Assemble Carbon Steel Weighted Field Club |
| `cast_iron_boarding_axe` | Cast Iron Boarding Axe | Material melee weapons | 1 | 2.12 | Craft: Assemble Cast Iron Boarding Axe |
| `cast_iron_partisan` | Cast Iron Broad Spear | Material melee weapons | 2 | 2.10 | Craft: Assemble Cast Iron Broad Spear |
| `cast_iron_camp_axe` | Cast Iron Camp Axe | Material melee weapons | 1 | 1.67 | Craft: Assemble Cast Iron Camp Axe |
| `cast_iron_cleaver` | Cast Iron Camp Cleaver | Material melee weapons | 1 | 0.65 | Craft: Assemble Cast Iron Camp Cleaver |
| `cast_iron_cutlass` | Cast Iron Camp Cutlass | Material melee weapons | 1 | 1.16 | Craft: Assemble Cast Iron Camp Cutlass |
| `cast_iron_combat_knife` | Cast Iron Combat Knife | Material melee weapons | 1 | 0.36 | Craft: Assemble Cast Iron Combat Knife |
| `cast_iron_mace` | Cast Iron Field Mace | Material melee weapons | 1 | 1.81 | Craft: Assemble Cast Iron Field Mace |
| `cast_iron_kukri` | Cast Iron Forward-Curved Knife | Material melee weapons | 1 | 0.73 | Craft: Assemble Cast Iron Forward-Curved Knife |
| `cast_iron_guard_baton` | Cast Iron Guard Baton | Material melee weapons | 1 | 1.00 | Craft: Assemble Cast Iron Guard Baton |
| `cast_iron_halberd` | Cast Iron Guard Halberd | Material melee weapons | 2 | 2.68 | Craft: Assemble Cast Iron Guard Halberd |
| `cast_iron_hand_axe` | Cast Iron Hand Axe | Material melee weapons | 1 | 1.09 | Craft: Assemble Cast Iron Hand Axe |
| `cast_iron_sickle` | Cast Iron Harvest Sickle | Material melee weapons | 1 | 0.70 | Craft: Assemble Cast Iron Harvest Sickle |
| `cast_iron_maul` | Cast Iron Heavy Maul | Material melee weapons | 2 | 4.52 | Craft: Assemble Cast Iron Heavy Maul |
| `cast_iron_hook_spear` | Cast Iron Hook Spear | Material melee weapons | 2 | 1.88 | Craft: Assemble Cast Iron Hook Spear |
| `cast_iron_war_pick` | Cast Iron Hooked Impact Pick | Material melee weapons | 1 | 1.97 | Craft: Assemble Cast Iron Hooked Impact Pick |
| `cast_iron_war_hammer` | Cast Iron Impact Hammer | Material melee weapons | 1 | 2.35 | Craft: Assemble Cast Iron Impact Hammer |
| `cast_iron_chain_morningstar` | Cast Iron Linked Impact Club | Material melee weapons | 1 | 2.62 | Craft: Assemble Cast Iron Linked Impact Club |
| `cast_iron_glaive` | Cast Iron Long Glaive | Material melee weapons | 2 | 2.22 | Craft: Assemble Cast Iron Long Glaive |
| `cast_iron_poleaxe` | Cast Iron Long Poleaxe | Material melee weapons | 2 | 2.95 | Craft: Assemble Cast Iron Long Poleaxe |
| `cast_iron_longsword` | Cast Iron Long Sword | Material melee weapons | 1 | 1.80 | Craft: Assemble Cast Iron Long Sword |
| `cast_iron_pry_baton` | Cast Iron Pry Baton | Material melee weapons | 1 | 1.66 | Craft: Assemble Cast Iron Pry Baton |
| `cast_iron_flanged_mace` | Cast Iron Ribbed Mace | Material melee weapons | 1 | 1.97 | Craft: Assemble Cast Iron Ribbed Mace |
| `cast_iron_sabre` | Cast Iron Scout Sabre | Material melee weapons | 1 | 1.01 | Craft: Assemble Cast Iron Scout Sabre |
| `cast_iron_shortsword` | Cast Iron Short Sword | Material melee weapons | 1 | 0.88 | Craft: Assemble Cast Iron Short Sword |
| `cast_iron_spear` | Cast Iron Socket Spear | Material melee weapons | 2 | 1.51 | Craft: Assemble Cast Iron Socket Spear |
| `cast_iron_trench_club` | Cast Iron Weighted Field Club | Material melee weapons | 1 | 1.71 | Craft: Assemble Cast Iron Weighted Field Club |
| `chrome_steel_boarding_axe` | Chrome Steel Boarding Axe | Material melee weapons | 4 | 2.00 | Craft: Assemble Chrome Steel Boarding Axe |
| `chrome_steel_partisan` | Chrome Steel Broad Spear | Material melee weapons | 5 | 1.95 | Craft: Assemble Chrome Steel Broad Spear |
| `chrome_steel_camp_axe` | Chrome Steel Camp Axe | Material melee weapons | 4 | 1.58 | Craft: Assemble Chrome Steel Camp Axe |
| `chrome_steel_cleaver` | Chrome Steel Camp Cleaver | Material melee weapons | 4 | 0.64 | Craft: Assemble Chrome Steel Camp Cleaver |
| `chrome_steel_cutlass` | Chrome Steel Camp Cutlass | Material melee weapons | 4 | 1.06 | Craft: Assemble Chrome Steel Camp Cutlass |
| `chrome_steel_combat_knife` | Chrome Steel Combat Knife | Material melee weapons | 4 | 0.35 | Craft: Assemble Chrome Steel Combat Knife |
| `chrome_steel_mace` | Chrome Steel Field Mace | Material melee weapons | 4 | 1.71 | Craft: Assemble Chrome Steel Field Mace |
| `chrome_steel_kukri` | Chrome Steel Forward-Curved Knife | Material melee weapons | 4 | 0.67 | Craft: Assemble Chrome Steel Forward-Curved Knife |
| `chrome_steel_guard_baton` | Chrome Steel Guard Baton | Material melee weapons | 4 | 0.94 | Craft: Assemble Chrome Steel Guard Baton |
| `chrome_steel_halberd` | Chrome Steel Guard Halberd | Material melee weapons | 5 | 2.51 | Craft: Assemble Chrome Steel Guard Halberd |
| `chrome_steel_hand_axe` | Chrome Steel Hand Axe | Material melee weapons | 4 | 1.05 | Craft: Assemble Chrome Steel Hand Axe |
| `chrome_steel_sickle` | Chrome Steel Harvest Sickle | Material melee weapons | 4 | 0.66 | Craft: Assemble Chrome Steel Harvest Sickle |
| `chrome_steel_maul` | Chrome Steel Heavy Maul | Material melee weapons | 5 | 4.28 | Craft: Assemble Chrome Steel Heavy Maul |
| `chrome_steel_hook_spear` | Chrome Steel Hook Spear | Material melee weapons | 5 | 1.75 | Craft: Assemble Chrome Steel Hook Spear |
| `chrome_steel_war_pick` | Chrome Steel Hooked Impact Pick | Material melee weapons | 4 | 1.86 | Craft: Assemble Chrome Steel Hooked Impact Pick |
| `chrome_steel_war_hammer` | Chrome Steel Impact Hammer | Material melee weapons | 4 | 2.21 | Craft: Assemble Chrome Steel Impact Hammer |
| `chrome_steel_chain_morningstar` | Chrome Steel Linked Impact Club | Material melee weapons | 4 | 2.47 | Craft: Assemble Chrome Steel Linked Impact Club |
| `chrome_steel_glaive` | Chrome Steel Long Glaive | Material melee weapons | 5 | 2.08 | Craft: Assemble Chrome Steel Long Glaive |
| `chrome_steel_poleaxe` | Chrome Steel Long Poleaxe | Material melee weapons | 5 | 2.77 | Craft: Assemble Chrome Steel Long Poleaxe |
| `chrome_steel_longsword` | Chrome Steel Long Sword | Material melee weapons | 4 | 1.67 | Craft: Assemble Chrome Steel Long Sword |
| `chrome_steel_pry_baton` | Chrome Steel Pry Baton | Material melee weapons | 4 | 1.59 | Craft: Assemble Chrome Steel Pry Baton |
| `chrome_steel_flanged_mace` | Chrome Steel Ribbed Mace | Material melee weapons | 4 | 1.89 | Craft: Assemble Chrome Steel Ribbed Mace |
| `chrome_steel_sabre` | Chrome Steel Scout Sabre | Material melee weapons | 4 | 0.94 | Craft: Assemble Chrome Steel Scout Sabre |
| `chrome_steel_shortsword` | Chrome Steel Short Sword | Material melee weapons | 4 | 0.83 | Craft: Assemble Chrome Steel Short Sword |
| `chrome_steel_spear` | Chrome Steel Socket Spear | Material melee weapons | 5 | 1.41 | Craft: Assemble Chrome Steel Socket Spear |
| `chrome_steel_trench_club` | Chrome Steel Weighted Field Club | Material melee weapons | 4 | 1.61 | Craft: Assemble Chrome Steel Weighted Field Club |
| `cobalt_alloy_boarding_axe` | Cobalt Alloy Boarding Axe | Material melee weapons | 5 | 2.21 | Craft: Assemble Cobalt Alloy Boarding Axe |
| `cobalt_alloy_partisan` | Cobalt Alloy Broad Spear | Material melee weapons | 5 | 2.19 | Craft: Assemble Cobalt Alloy Broad Spear |
| `cobalt_alloy_camp_axe` | Cobalt Alloy Camp Axe | Material melee weapons | 5 | 1.74 | Craft: Assemble Cobalt Alloy Camp Axe |
| `cobalt_alloy_cleaver` | Cobalt Alloy Camp Cleaver | Material melee weapons | 5 | 0.68 | Craft: Assemble Cobalt Alloy Camp Cleaver |
| `cobalt_alloy_cutlass` | Cobalt Alloy Camp Cutlass | Material melee weapons | 5 | 1.20 | Craft: Assemble Cobalt Alloy Camp Cutlass |
| `cobalt_alloy_combat_knife` | Cobalt Alloy Combat Knife | Material melee weapons | 5 | 0.40 | Craft: Assemble Cobalt Alloy Combat Knife |
| `cobalt_alloy_mace` | Cobalt Alloy Field Mace | Material melee weapons | 5 | 1.87 | Craft: Assemble Cobalt Alloy Field Mace |
| `cobalt_alloy_kukri` | Cobalt Alloy Forward-Curved Knife | Material melee weapons | 5 | 0.73 | Craft: Assemble Cobalt Alloy Forward-Curved Knife |
| `cobalt_alloy_guard_baton` | Cobalt Alloy Guard Baton | Material melee weapons | 5 | 1.01 | Craft: Assemble Cobalt Alloy Guard Baton |
| `cobalt_alloy_halberd` | Cobalt Alloy Guard Halberd | Material melee weapons | 5 | 2.78 | Craft: Assemble Cobalt Alloy Guard Halberd |
| `cobalt_alloy_hand_axe` | Cobalt Alloy Hand Axe | Material melee weapons | 5 | 1.17 | Craft: Assemble Cobalt Alloy Hand Axe |
| `cobalt_alloy_sickle` | Cobalt Alloy Harvest Sickle | Material melee weapons | 5 | 0.73 | Craft: Assemble Cobalt Alloy Harvest Sickle |
| `cobalt_alloy_maul` | Cobalt Alloy Heavy Maul | Material melee weapons | 5 | 4.72 | Craft: Assemble Cobalt Alloy Heavy Maul |
| `cobalt_alloy_hook_spear` | Cobalt Alloy Hook Spear | Material melee weapons | 5 | 1.94 | Craft: Assemble Cobalt Alloy Hook Spear |
| `cobalt_alloy_war_pick` | Cobalt Alloy Hooked Impact Pick | Material melee weapons | 5 | 2.07 | Craft: Assemble Cobalt Alloy Hooked Impact Pick |
| `cobalt_alloy_war_hammer` | Cobalt Alloy Impact Hammer | Material melee weapons | 5 | 2.45 | Craft: Assemble Cobalt Alloy Impact Hammer |
| `cobalt_alloy_chain_morningstar` | Cobalt Alloy Linked Impact Club | Material melee weapons | 5 | 2.73 | Craft: Assemble Cobalt Alloy Linked Impact Club |
| `cobalt_alloy_glaive` | Cobalt Alloy Long Glaive | Material melee weapons | 5 | 2.32 | Craft: Assemble Cobalt Alloy Long Glaive |
| `cobalt_alloy_poleaxe` | Cobalt Alloy Long Poleaxe | Material melee weapons | 5 | 3.04 | Craft: Assemble Cobalt Alloy Long Poleaxe |
| `cobalt_alloy_longsword` | Cobalt Alloy Long Sword | Material melee weapons | 5 | 1.86 | Craft: Assemble Cobalt Alloy Long Sword |
| `cobalt_alloy_pry_baton` | Cobalt Alloy Pry Baton | Material melee weapons | 5 | 1.77 | Craft: Assemble Cobalt Alloy Pry Baton |
| `cobalt_alloy_flanged_mace` | Cobalt Alloy Ribbed Mace | Material melee weapons | 5 | 2.07 | Craft: Assemble Cobalt Alloy Ribbed Mace |
| `cobalt_alloy_sabre` | Cobalt Alloy Scout Sabre | Material melee weapons | 5 | 1.03 | Craft: Assemble Cobalt Alloy Scout Sabre |
| `cobalt_alloy_shortsword` | Cobalt Alloy Short Sword | Material melee weapons | 5 | 0.93 | Craft: Assemble Cobalt Alloy Short Sword |
| `cobalt_alloy_spear` | Cobalt Alloy Socket Spear | Material melee weapons | 5 | 1.55 | Craft: Assemble Cobalt Alloy Socket Spear |
| `cobalt_alloy_trench_club` | Cobalt Alloy Weighted Field Club | Material melee weapons | 5 | 1.79 | Craft: Assemble Cobalt Alloy Weighted Field Club |
| `copper_boarding_axe` | Copper Boarding Axe | Material melee weapons | 1 | 2.14 | Craft: Assemble Copper Boarding Axe |
| `copper_partisan` | Copper Broad Spear | Material melee weapons | 2 | 2.09 | Craft: Assemble Copper Broad Spear |
| `copper_camp_axe` | Copper Camp Axe | Material melee weapons | 1 | 1.70 | Craft: Assemble Copper Camp Axe |
| `copper_cleaver` | Copper Camp Cleaver | Material melee weapons | 1 | 0.62 | Craft: Assemble Copper Camp Cleaver |
| `copper_cutlass` | Copper Camp Cutlass | Material melee weapons | 1 | 1.15 | Craft: Assemble Copper Camp Cutlass |
| `copper_combat_knife` | Copper Combat Knife | Material melee weapons | 1 | 0.40 | Craft: Assemble Copper Combat Knife |
| `copper_mace` | Copper Field Mace | Material melee weapons | 1 | 1.75 | Craft: Assemble Copper Field Mace |
| `copper_kukri` | Copper Forward-Curved Knife | Material melee weapons | 1 | 0.72 | Craft: Assemble Copper Forward-Curved Knife |
| `copper_guard_baton` | Copper Guard Baton | Material melee weapons | 1 | 1.02 | Craft: Assemble Copper Guard Baton |
| `copper_halberd` | Copper Guard Halberd | Material melee weapons | 2 | 2.63 | Craft: Assemble Copper Guard Halberd |
| `copper_hand_axe` | Copper Hand Axe | Material melee weapons | 1 | 1.10 | Craft: Assemble Copper Hand Axe |
| `copper_sickle` | Copper Harvest Sickle | Material melee weapons | 1 | 0.67 | Craft: Assemble Copper Harvest Sickle |
| `copper_maul` | Copper Heavy Maul | Material melee weapons | 2 | 4.46 | Craft: Assemble Copper Heavy Maul |
| `copper_hook_spear` | Copper Hook Spear | Material melee weapons | 2 | 1.84 | Craft: Assemble Copper Hook Spear |
| `copper_war_pick` | Copper Hooked Impact Pick | Material melee weapons | 1 | 1.98 | Craft: Assemble Copper Hooked Impact Pick |
| `copper_war_hammer` | Copper Impact Hammer | Material melee weapons | 1 | 2.31 | Craft: Assemble Copper Impact Hammer |
| `copper_chain_morningstar` | Copper Linked Impact Club | Material melee weapons | 1 | 2.64 | Craft: Assemble Copper Linked Impact Club |
| `copper_glaive` | Copper Long Glaive | Material melee weapons | 2 | 2.16 | Craft: Assemble Copper Long Glaive |
| `copper_poleaxe` | Copper Long Poleaxe | Material melee weapons | 2 | 2.94 | Craft: Assemble Copper Long Poleaxe |
| `copper_longsword` | Copper Long Sword | Material melee weapons | 1 | 1.76 | Craft: Assemble Copper Long Sword |
| `copper_pry_baton` | Copper Pry Baton | Material melee weapons | 1 | 1.67 | Craft: Assemble Copper Pry Baton |
| `copper_flanged_mace` | Copper Ribbed Mace | Material melee weapons | 1 | 1.97 | Craft: Assemble Copper Ribbed Mace |
| `copper_sabre` | Copper Scout Sabre | Material melee weapons | 1 | 0.97 | Craft: Assemble Copper Scout Sabre |
| `copper_shortsword` | Copper Short Sword | Material melee weapons | 1 | 0.84 | Craft: Assemble Copper Short Sword |
| `copper_spear` | Copper Socket Spear | Material melee weapons | 2 | 1.50 | Craft: Assemble Copper Socket Spear |
| `copper_trench_club` | Copper Weighted Field Club | Material melee weapons | 1 | 1.74 | Craft: Assemble Copper Weighted Field Club |
| `crowbar` | Crowbar | melee | 0 | 1.60 | Loot: garage |
| `fire_axe` | Fire axe | melee | 0 | 2.20 | Loot: hardware |
| `frying_pan` | Frying pan | melee | 0 | 1.00 | Loot: house, restaurant, suburban, urban |
| `iron_pick` | Iron mining pick | melee | 0 | 1.60 | Craft: Make an iron mining pick |
| `kitchen_knife` | Kitchen knife | melee | 0 | 0.20 | Loot: house, restaurant, suburban, urban |
| `machete` | Machete | melee | 0 | 0.75 | Craft: Make a rough machete |
| `manganese_steel_boarding_axe` | Manganese Steel Boarding Axe | Material melee weapons | 3 | 2.12 | Craft: Assemble Manganese Steel Boarding Axe |
| `manganese_steel_partisan` | Manganese Steel Broad Spear | Material melee weapons | 4 | 2.05 | Craft: Assemble Manganese Steel Broad Spear |
| `manganese_steel_camp_axe` | Manganese Steel Camp Axe | Material melee weapons | 3 | 1.66 | Craft: Assemble Manganese Steel Camp Axe |
| `manganese_steel_cleaver` | Manganese Steel Camp Cleaver | Material melee weapons | 3 | 0.64 | Craft: Assemble Manganese Steel Camp Cleaver |
| `manganese_steel_cutlass` | Manganese Steel Camp Cutlass | Material melee weapons | 3 | 1.11 | Craft: Assemble Manganese Steel Camp Cutlass |
| `manganese_steel_combat_knife` | Manganese Steel Combat Knife | Material melee weapons | 3 | 0.40 | Craft: Assemble Manganese Steel Combat Knife |
| `manganese_steel_mace` | Manganese Steel Field Mace | Material melee weapons | 3 | 1.77 | Craft: Assemble Manganese Steel Field Mace |
| `manganese_steel_kukri` | Manganese Steel Forward-Curved Knife | Material melee weapons | 3 | 0.74 | Craft: Assemble Manganese Steel Forward-Curved Knife |
| `manganese_steel_guard_baton` | Manganese Steel Guard Baton | Material melee weapons | 3 | 0.97 | Craft: Assemble Manganese Steel Guard Baton |
| `manganese_steel_halberd` | Manganese Steel Guard Halberd | Material melee weapons | 4 | 2.59 | Craft: Assemble Manganese Steel Guard Halberd |
| `manganese_steel_hand_axe` | Manganese Steel Hand Axe | Material melee weapons | 3 | 1.09 | Craft: Assemble Manganese Steel Hand Axe |
| `manganese_steel_sickle` | Manganese Steel Harvest Sickle | Material melee weapons | 3 | 0.66 | Craft: Assemble Manganese Steel Harvest Sickle |
| `manganese_steel_maul` | Manganese Steel Heavy Maul | Material melee weapons | 4 | 4.45 | Craft: Assemble Manganese Steel Heavy Maul |
| `manganese_steel_hook_spear` | Manganese Steel Hook Spear | Material melee weapons | 4 | 1.83 | Craft: Assemble Manganese Steel Hook Spear |
| `manganese_steel_war_pick` | Manganese Steel Hooked Impact Pick | Material melee weapons | 3 | 1.97 | Craft: Assemble Manganese Steel Hooked Impact Pick |
| `manganese_steel_war_hammer` | Manganese Steel Impact Hammer | Material melee weapons | 3 | 2.28 | Craft: Assemble Manganese Steel Impact Hammer |
| `manganese_steel_chain_morningstar` | Manganese Steel Linked Impact Club | Material melee weapons | 3 | 2.59 | Craft: Assemble Manganese Steel Linked Impact Club |
| `manganese_steel_glaive` | Manganese Steel Long Glaive | Material melee weapons | 4 | 2.14 | Craft: Assemble Manganese Steel Long Glaive |
| `manganese_steel_poleaxe` | Manganese Steel Long Poleaxe | Material melee weapons | 4 | 2.88 | Craft: Assemble Manganese Steel Long Poleaxe |
| `manganese_steel_longsword` | Manganese Steel Long Sword | Material melee weapons | 3 | 1.75 | Craft: Assemble Manganese Steel Long Sword |
| `manganese_steel_pry_baton` | Manganese Steel Pry Baton | Material melee weapons | 3 | 1.66 | Craft: Assemble Manganese Steel Pry Baton |
| `manganese_steel_flanged_mace` | Manganese Steel Ribbed Mace | Material melee weapons | 3 | 1.97 | Craft: Assemble Manganese Steel Ribbed Mace |
| `manganese_steel_sabre` | Manganese Steel Scout Sabre | Material melee weapons | 3 | 0.95 | Craft: Assemble Manganese Steel Scout Sabre |
| `manganese_steel_shortsword` | Manganese Steel Short Sword | Material melee weapons | 3 | 0.83 | Craft: Assemble Manganese Steel Short Sword |
| `manganese_steel_spear` | Manganese Steel Socket Spear | Material melee weapons | 4 | 1.52 | Craft: Assemble Manganese Steel Socket Spear |
| `manganese_steel_trench_club` | Manganese Steel Weighted Field Club | Material melee weapons | 3 | 1.72 | Craft: Assemble Manganese Steel Weighted Field Club |
| `cleaver` | Meat cleaver | melee | 0 | 0.45 | Loot: house, restaurant |
| `mild_steel_boarding_axe` | Mild Steel Boarding Axe | Material melee weapons | 1 | 1.87 | Craft: Assemble Mild Steel Boarding Axe |
| `mild_steel_partisan` | Mild Steel Broad Spear | Material melee weapons | 2 | 1.80 | Craft: Assemble Mild Steel Broad Spear |
| `mild_steel_camp_axe` | Mild Steel Camp Axe | Material melee weapons | 1 | 1.47 | Craft: Assemble Mild Steel Camp Axe |
| `mild_steel_cleaver` | Mild Steel Camp Cleaver | Material melee weapons | 1 | 0.54 | Craft: Assemble Mild Steel Camp Cleaver |
| `mild_steel_cutlass` | Mild Steel Camp Cutlass | Material melee weapons | 1 | 0.99 | Craft: Assemble Mild Steel Camp Cutlass |
| `mild_steel_combat_knife` | Mild Steel Combat Knife | Material melee weapons | 1 | 0.34 | Loot: depot, garage, hardware, warehouse |
| `mild_steel_mace` | Mild Steel Field Mace | Material melee weapons | 1 | 1.55 | Craft: Assemble Mild Steel Field Mace |
| `mild_steel_kukri` | Mild Steel Forward-Curved Knife | Material melee weapons | 1 | 0.65 | Craft: Assemble Mild Steel Forward-Curved Knife |
| `mild_steel_guard_baton` | Mild Steel Guard Baton | Material melee weapons | 1 | 0.85 | Craft: Assemble Mild Steel Guard Baton |
| `mild_steel_halberd` | Mild Steel Guard Halberd | Material melee weapons | 2 | 2.26 | Craft: Assemble Mild Steel Guard Halberd |
| `mild_steel_hand_axe` | Mild Steel Hand Axe | Material melee weapons | 1 | 0.98 | Loot: depot, garage, hardware, warehouse |
| `mild_steel_sickle` | Mild Steel Harvest Sickle | Material melee weapons | 1 | 0.58 | Loot: depot, garage, hardware, warehouse |
| `mild_steel_maul` | Mild Steel Heavy Maul | Material melee weapons | 2 | 3.85 | Craft: Assemble Mild Steel Heavy Maul |
| `mild_steel_hook_spear` | Mild Steel Hook Spear | Material melee weapons | 2 | 1.60 | Craft: Assemble Mild Steel Hook Spear |
| `mild_steel_war_pick` | Mild Steel Hooked Impact Pick | Material melee weapons | 1 | 1.71 | Craft: Assemble Mild Steel Hooked Impact Pick |
| `mild_steel_war_hammer` | Mild Steel Impact Hammer | Material melee weapons | 1 | 1.99 | Craft: Assemble Mild Steel Impact Hammer |
| `mild_steel_chain_morningstar` | Mild Steel Linked Impact Club | Material melee weapons | 1 | 2.28 | Craft: Assemble Mild Steel Linked Impact Club |
| `mild_steel_glaive` | Mild Steel Long Glaive | Material melee weapons | 2 | 1.90 | Craft: Assemble Mild Steel Long Glaive |
| `mild_steel_poleaxe` | Mild Steel Long Poleaxe | Material melee weapons | 2 | 2.51 | Craft: Assemble Mild Steel Long Poleaxe |
| `mild_steel_longsword` | Mild Steel Long Sword | Material melee weapons | 1 | 1.53 | Craft: Assemble Mild Steel Long Sword |
| `mild_steel_pry_baton` | Mild Steel Pry Baton | Material melee weapons | 1 | 1.47 | Loot: depot, garage, hardware, warehouse |
| `mild_steel_flanged_mace` | Mild Steel Ribbed Mace | Material melee weapons | 1 | 1.71 | Craft: Assemble Mild Steel Ribbed Mace |
| `mild_steel_sabre` | Mild Steel Scout Sabre | Material melee weapons | 1 | 0.83 | Craft: Assemble Mild Steel Scout Sabre |
| `mild_steel_shortsword` | Mild Steel Short Sword | Material melee weapons | 1 | 0.76 | Craft: Assemble Mild Steel Short Sword |
| `mild_steel_spear` | Mild Steel Socket Spear | Material melee weapons | 2 | 1.32 | Craft: Assemble Mild Steel Socket Spear |
| `mild_steel_trench_club` | Mild Steel Weighted Field Club | Material melee weapons | 1 | 1.52 | Craft: Assemble Mild Steel Weighted Field Club |
| `spiked_bat` | Nailed bat | melee | 0 | 1.45 | Craft: Reinforce a baseball bat |
| `nickel_alloy_boarding_axe` | Nickel Alloy Boarding Axe | Material melee weapons | 4 | 2.14 | Craft: Assemble Nickel Alloy Boarding Axe |
| `nickel_alloy_partisan` | Nickel Alloy Broad Spear | Material melee weapons | 5 | 2.09 | Craft: Assemble Nickel Alloy Broad Spear |
| `nickel_alloy_camp_axe` | Nickel Alloy Camp Axe | Material melee weapons | 4 | 1.73 | Craft: Assemble Nickel Alloy Camp Axe |
| `nickel_alloy_cleaver` | Nickel Alloy Camp Cleaver | Material melee weapons | 4 | 0.66 | Craft: Assemble Nickel Alloy Camp Cleaver |
| `nickel_alloy_cutlass` | Nickel Alloy Camp Cutlass | Material melee weapons | 4 | 1.13 | Craft: Assemble Nickel Alloy Camp Cutlass |
| `nickel_alloy_combat_knife` | Nickel Alloy Combat Knife | Material melee weapons | 4 | 0.40 | Craft: Assemble Nickel Alloy Combat Knife |
| `nickel_alloy_mace` | Nickel Alloy Field Mace | Material melee weapons | 4 | 1.82 | Craft: Assemble Nickel Alloy Field Mace |
| `nickel_alloy_kukri` | Nickel Alloy Forward-Curved Knife | Material melee weapons | 4 | 0.73 | Craft: Assemble Nickel Alloy Forward-Curved Knife |
| `nickel_alloy_guard_baton` | Nickel Alloy Guard Baton | Material melee weapons | 4 | 0.99 | Craft: Assemble Nickel Alloy Guard Baton |
| `nickel_alloy_halberd` | Nickel Alloy Guard Halberd | Material melee weapons | 5 | 2.68 | Craft: Assemble Nickel Alloy Guard Halberd |
| `nickel_alloy_hand_axe` | Nickel Alloy Hand Axe | Material melee weapons | 4 | 1.13 | Craft: Assemble Nickel Alloy Hand Axe |
| `nickel_alloy_sickle` | Nickel Alloy Harvest Sickle | Material melee weapons | 4 | 0.67 | Craft: Assemble Nickel Alloy Harvest Sickle |
| `nickel_alloy_maul` | Nickel Alloy Heavy Maul | Material melee weapons | 5 | 4.56 | Craft: Assemble Nickel Alloy Heavy Maul |
| `nickel_alloy_hook_spear` | Nickel Alloy Hook Spear | Material melee weapons | 5 | 1.89 | Craft: Assemble Nickel Alloy Hook Spear |
| `nickel_alloy_war_pick` | Nickel Alloy Hooked Impact Pick | Material melee weapons | 4 | 2.02 | Craft: Assemble Nickel Alloy Hooked Impact Pick |
| `nickel_alloy_war_hammer` | Nickel Alloy Impact Hammer | Material melee weapons | 4 | 2.34 | Craft: Assemble Nickel Alloy Impact Hammer |
| `nickel_alloy_chain_morningstar` | Nickel Alloy Linked Impact Club | Material melee weapons | 4 | 2.68 | Craft: Assemble Nickel Alloy Linked Impact Club |
| `nickel_alloy_glaive` | Nickel Alloy Long Glaive | Material melee weapons | 5 | 2.23 | Craft: Assemble Nickel Alloy Long Glaive |
| `nickel_alloy_poleaxe` | Nickel Alloy Long Poleaxe | Material melee weapons | 5 | 2.94 | Craft: Assemble Nickel Alloy Long Poleaxe |
| `nickel_alloy_longsword` | Nickel Alloy Long Sword | Material melee weapons | 4 | 1.81 | Craft: Assemble Nickel Alloy Long Sword |
| `nickel_alloy_pry_baton` | Nickel Alloy Pry Baton | Material melee weapons | 4 | 1.70 | Craft: Assemble Nickel Alloy Pry Baton |
| `nickel_alloy_flanged_mace` | Nickel Alloy Ribbed Mace | Material melee weapons | 4 | 2.00 | Craft: Assemble Nickel Alloy Ribbed Mace |
| `nickel_alloy_sabre` | Nickel Alloy Scout Sabre | Material melee weapons | 4 | 1.00 | Craft: Assemble Nickel Alloy Scout Sabre |
| `nickel_alloy_shortsword` | Nickel Alloy Short Sword | Material melee weapons | 4 | 0.88 | Craft: Assemble Nickel Alloy Short Sword |
| `nickel_alloy_spear` | Nickel Alloy Socket Spear | Material melee weapons | 5 | 1.52 | Craft: Assemble Nickel Alloy Socket Spear |
| `nickel_alloy_trench_club` | Nickel Alloy Weighted Field Club | Material melee weapons | 4 | 1.73 | Craft: Assemble Nickel Alloy Weighted Field Club |
| `nickel_steel_boarding_axe` | Nickel Steel Boarding Axe | Material melee weapons | 3 | 1.99 | Craft: Assemble Nickel Steel Boarding Axe |
| `nickel_steel_partisan` | Nickel Steel Broad Spear | Material melee weapons | 4 | 1.97 | Craft: Assemble Nickel Steel Broad Spear |
| `nickel_steel_camp_axe` | Nickel Steel Camp Axe | Material melee weapons | 3 | 1.57 | Craft: Assemble Nickel Steel Camp Axe |
| `nickel_steel_cleaver` | Nickel Steel Camp Cleaver | Material melee weapons | 3 | 0.58 | Craft: Assemble Nickel Steel Camp Cleaver |
| `nickel_steel_cutlass` | Nickel Steel Camp Cutlass | Material melee weapons | 3 | 1.09 | Craft: Assemble Nickel Steel Camp Cutlass |
| `nickel_steel_combat_knife` | Nickel Steel Combat Knife | Material melee weapons | 3 | 0.39 | Craft: Assemble Nickel Steel Combat Knife |
| `nickel_steel_mace` | Nickel Steel Field Mace | Material melee weapons | 3 | 1.66 | Craft: Assemble Nickel Steel Field Mace |
| `nickel_steel_kukri` | Nickel Steel Forward-Curved Knife | Material melee weapons | 3 | 0.69 | Craft: Assemble Nickel Steel Forward-Curved Knife |
| `nickel_steel_guard_baton` | Nickel Steel Guard Baton | Material melee weapons | 3 | 0.94 | Craft: Assemble Nickel Steel Guard Baton |
| `nickel_steel_halberd` | Nickel Steel Guard Halberd | Material melee weapons | 4 | 2.44 | Craft: Assemble Nickel Steel Guard Halberd |
| `nickel_steel_hand_axe` | Nickel Steel Hand Axe | Material melee weapons | 3 | 1.03 | Craft: Assemble Nickel Steel Hand Axe |
| `nickel_steel_sickle` | Nickel Steel Harvest Sickle | Material melee weapons | 3 | 0.64 | Craft: Assemble Nickel Steel Harvest Sickle |
| `nickel_steel_maul` | Nickel Steel Heavy Maul | Material melee weapons | 4 | 4.15 | Craft: Assemble Nickel Steel Heavy Maul |
| `nickel_steel_hook_spear` | Nickel Steel Hook Spear | Material melee weapons | 4 | 1.69 | Craft: Assemble Nickel Steel Hook Spear |
| `nickel_steel_war_pick` | Nickel Steel Hooked Impact Pick | Material melee weapons | 3 | 1.87 | Craft: Assemble Nickel Steel Hooked Impact Pick |
| `nickel_steel_war_hammer` | Nickel Steel Impact Hammer | Material melee weapons | 3 | 2.16 | Craft: Assemble Nickel Steel Impact Hammer |
| `nickel_steel_chain_morningstar` | Nickel Steel Linked Impact Club | Material melee weapons | 3 | 2.45 | Craft: Assemble Nickel Steel Linked Impact Club |
| `nickel_steel_glaive` | Nickel Steel Long Glaive | Material melee weapons | 4 | 2.02 | Craft: Assemble Nickel Steel Long Glaive |
| `nickel_steel_poleaxe` | Nickel Steel Long Poleaxe | Material melee weapons | 4 | 2.73 | Craft: Assemble Nickel Steel Long Poleaxe |
| `nickel_steel_longsword` | Nickel Steel Long Sword | Material melee weapons | 3 | 1.62 | Craft: Assemble Nickel Steel Long Sword |
| `nickel_steel_pry_baton` | Nickel Steel Pry Baton | Material melee weapons | 3 | 1.56 | Craft: Assemble Nickel Steel Pry Baton |
| `nickel_steel_flanged_mace` | Nickel Steel Ribbed Mace | Material melee weapons | 3 | 1.84 | Craft: Assemble Nickel Steel Ribbed Mace |
| `nickel_steel_sabre` | Nickel Steel Scout Sabre | Material melee weapons | 3 | 0.90 | Craft: Assemble Nickel Steel Scout Sabre |
| `nickel_steel_shortsword` | Nickel Steel Short Sword | Material melee weapons | 3 | 0.79 | Craft: Assemble Nickel Steel Short Sword |
| `nickel_steel_spear` | Nickel Steel Socket Spear | Material melee weapons | 4 | 1.42 | Craft: Assemble Nickel Steel Socket Spear |
| `nickel_steel_trench_club` | Nickel Steel Weighted Field Club | Material melee weapons | 3 | 1.61 | Craft: Assemble Nickel Steel Weighted Field Club |
| `pewter_boarding_axe` | Pewter Boarding Axe | Material melee weapons | 1 | 1.78 | Craft: Assemble Pewter Boarding Axe |
| `pewter_partisan` | Pewter Broad Spear | Material melee weapons | 2 | 1.75 | Craft: Assemble Pewter Broad Spear |
| `pewter_camp_axe` | Pewter Camp Axe | Material melee weapons | 1 | 1.40 | Craft: Assemble Pewter Camp Axe |
| `pewter_cleaver` | Pewter Camp Cleaver | Material melee weapons | 1 | 0.54 | Craft: Assemble Pewter Camp Cleaver |
| `pewter_cutlass` | Pewter Camp Cutlass | Material melee weapons | 1 | 0.97 | Craft: Assemble Pewter Camp Cutlass |
| `pewter_combat_knife` | Pewter Combat Knife | Material melee weapons | 1 | 0.34 | Craft: Assemble Pewter Combat Knife |
| `pewter_mace` | Pewter Field Mace | Material melee weapons | 1 | 1.46 | Craft: Assemble Pewter Field Mace |
| `pewter_kukri` | Pewter Forward-Curved Knife | Material melee weapons | 1 | 0.63 | Craft: Assemble Pewter Forward-Curved Knife |
| `pewter_guard_baton` | Pewter Guard Baton | Material melee weapons | 1 | 0.83 | Craft: Assemble Pewter Guard Baton |
| `pewter_halberd` | Pewter Guard Halberd | Material melee weapons | 2 | 2.22 | Craft: Assemble Pewter Guard Halberd |
| `pewter_hand_axe` | Pewter Hand Axe | Material melee weapons | 1 | 0.89 | Craft: Assemble Pewter Hand Axe |
| `pewter_sickle` | Pewter Harvest Sickle | Material melee weapons | 1 | 0.59 | Craft: Assemble Pewter Harvest Sickle |
| `pewter_maul` | Pewter Heavy Maul | Material melee weapons | 2 | 3.71 | Craft: Assemble Pewter Heavy Maul |
| `pewter_hook_spear` | Pewter Hook Spear | Material melee weapons | 2 | 1.51 | Craft: Assemble Pewter Hook Spear |
| `pewter_war_pick` | Pewter Hooked Impact Pick | Material melee weapons | 1 | 1.65 | Craft: Assemble Pewter Hooked Impact Pick |
| `pewter_war_hammer` | Pewter Impact Hammer | Material melee weapons | 1 | 1.95 | Craft: Assemble Pewter Impact Hammer |
| `pewter_chain_morningstar` | Pewter Linked Impact Club | Material melee weapons | 1 | 2.18 | Craft: Assemble Pewter Linked Impact Club |
| `pewter_glaive` | Pewter Long Glaive | Material melee weapons | 2 | 1.80 | Craft: Assemble Pewter Long Glaive |
| `pewter_poleaxe` | Pewter Long Poleaxe | Material melee weapons | 2 | 2.43 | Craft: Assemble Pewter Long Poleaxe |
| `pewter_longsword` | Pewter Long Sword | Material melee weapons | 1 | 1.45 | Craft: Assemble Pewter Long Sword |
| `pewter_pry_baton` | Pewter Pry Baton | Material melee weapons | 1 | 1.36 | Craft: Assemble Pewter Pry Baton |
| `pewter_flanged_mace` | Pewter Ribbed Mace | Material melee weapons | 1 | 1.64 | Craft: Assemble Pewter Ribbed Mace |
| `pewter_sabre` | Pewter Scout Sabre | Material melee weapons | 1 | 0.85 | Craft: Assemble Pewter Scout Sabre |
| `pewter_shortsword` | Pewter Short Sword | Material melee weapons | 1 | 0.71 | Craft: Assemble Pewter Short Sword |
| `pewter_spear` | Pewter Socket Spear | Material melee weapons | 2 | 1.28 | Craft: Assemble Pewter Socket Spear |
| `pewter_trench_club` | Pewter Weighted Field Club | Material melee weapons | 1 | 1.45 | Craft: Assemble Pewter Weighted Field Club |
| `metal_pipe` | Pipe baton | melee | 0 | 1.20 | Craft: Assemble pipe baton |
| `pipe_wrench` | Pipe wrench | melee | 0 | 1.80 | Loot: garage |
| `pitchfork` | Pitchfork | melee | 0 | 1.50 | Loot: farm |
| `rolling_pin` | Rolling pin | melee | 0 | 0.55 | Loot: house |
| `shovel` | Shovel | melee | 0 | 1.90 | Loot: farm, hardware |
| `sickle` | Sickle | melee | 0 | 0.60 | Loot: farm |
| `sledgehammer` | Sledgehammer | melee | 0 | 4.40 | Loot: hardware, industrial |
| `spring_steel_boarding_axe` | Spring Steel Boarding Axe | Material melee weapons | 3 | 1.81 | Craft: Assemble Spring Steel Boarding Axe |
| `spring_steel_partisan` | Spring Steel Broad Spear | Material melee weapons | 4 | 1.79 | Craft: Assemble Spring Steel Broad Spear |
| `spring_steel_camp_axe` | Spring Steel Camp Axe | Material melee weapons | 3 | 1.40 | Craft: Assemble Spring Steel Camp Axe |
| `spring_steel_cleaver` | Spring Steel Camp Cleaver | Material melee weapons | 3 | 0.57 | Craft: Assemble Spring Steel Camp Cleaver |
| `spring_steel_cutlass` | Spring Steel Camp Cutlass | Material melee weapons | 3 | 1.00 | Craft: Assemble Spring Steel Camp Cutlass |
| `spring_steel_combat_knife` | Spring Steel Combat Knife | Material melee weapons | 3 | 0.34 | Craft: Assemble Spring Steel Combat Knife |
| `spring_steel_mace` | Spring Steel Field Mace | Material melee weapons | 3 | 1.51 | Craft: Assemble Spring Steel Field Mace |
| `spring_steel_kukri` | Spring Steel Forward-Curved Knife | Material melee weapons | 3 | 0.63 | Craft: Assemble Spring Steel Forward-Curved Knife |
| `spring_steel_guard_baton` | Spring Steel Guard Baton | Material melee weapons | 3 | 0.86 | Craft: Assemble Spring Steel Guard Baton |
| `spring_steel_halberd` | Spring Steel Guard Halberd | Material melee weapons | 4 | 2.25 | Craft: Assemble Spring Steel Guard Halberd |
| `spring_steel_hand_axe` | Spring Steel Hand Axe | Material melee weapons | 3 | 0.92 | Craft: Assemble Spring Steel Hand Axe |
| `spring_steel_sickle` | Spring Steel Harvest Sickle | Material melee weapons | 3 | 0.59 | Craft: Assemble Spring Steel Harvest Sickle |
| `spring_steel_maul` | Spring Steel Heavy Maul | Material melee weapons | 4 | 3.81 | Craft: Assemble Spring Steel Heavy Maul |
| `spring_steel_hook_spear` | Spring Steel Hook Spear | Material melee weapons | 4 | 1.55 | Craft: Assemble Spring Steel Hook Spear |
| `spring_steel_war_pick` | Spring Steel Hooked Impact Pick | Material melee weapons | 3 | 1.68 | Craft: Assemble Spring Steel Hooked Impact Pick |
| `spring_steel_war_hammer` | Spring Steel Impact Hammer | Material melee weapons | 3 | 1.98 | Craft: Assemble Spring Steel Impact Hammer |
| `spring_steel_chain_morningstar` | Spring Steel Linked Impact Club | Material melee weapons | 3 | 2.20 | Craft: Assemble Spring Steel Linked Impact Club |
| `spring_steel_glaive` | Spring Steel Long Glaive | Material melee weapons | 4 | 1.88 | Craft: Assemble Spring Steel Long Glaive |
| `spring_steel_poleaxe` | Spring Steel Long Poleaxe | Material melee weapons | 4 | 2.48 | Craft: Assemble Spring Steel Long Poleaxe |
| `spring_steel_longsword` | Spring Steel Long Sword | Material melee weapons | 3 | 1.48 | Craft: Assemble Spring Steel Long Sword |
| `spring_steel_pry_baton` | Spring Steel Pry Baton | Material melee weapons | 3 | 1.40 | Craft: Assemble Spring Steel Pry Baton |
| `spring_steel_flanged_mace` | Spring Steel Ribbed Mace | Material melee weapons | 3 | 1.65 | Craft: Assemble Spring Steel Ribbed Mace |
| `spring_steel_sabre` | Spring Steel Scout Sabre | Material melee weapons | 3 | 0.85 | Craft: Assemble Spring Steel Scout Sabre |
| `spring_steel_shortsword` | Spring Steel Short Sword | Material melee weapons | 3 | 0.77 | Craft: Assemble Spring Steel Short Sword |
| `spring_steel_spear` | Spring Steel Socket Spear | Material melee weapons | 4 | 1.29 | Craft: Assemble Spring Steel Socket Spear |
| `spring_steel_trench_club` | Spring Steel Weighted Field Club | Material melee weapons | 3 | 1.47 | Craft: Assemble Spring Steel Weighted Field Club |
| `stainless_steel_boarding_axe` | Stainless Steel Boarding Axe | Material melee weapons | 2 | 1.93 | Craft: Assemble Stainless Steel Boarding Axe |
| `stainless_steel_partisan` | Stainless Steel Broad Spear | Material melee weapons | 3 | 1.91 | Craft: Assemble Stainless Steel Broad Spear |
| `stainless_steel_camp_axe` | Stainless Steel Camp Axe | Material melee weapons | 2 | 1.52 | Craft: Assemble Stainless Steel Camp Axe |
| `stainless_steel_cleaver` | Stainless Steel Camp Cleaver | Material melee weapons | 2 | 0.59 | Craft: Assemble Stainless Steel Camp Cleaver |
| `stainless_steel_cutlass` | Stainless Steel Camp Cutlass | Material melee weapons | 2 | 1.06 | Craft: Assemble Stainless Steel Camp Cutlass |
| `stainless_steel_combat_knife` | Stainless Steel Combat Knife | Material melee weapons | 2 | 0.33 | Loot: depot, garage, hardware, warehouse |
| `stainless_steel_mace` | Stainless Steel Field Mace | Material melee weapons | 2 | 1.64 | Craft: Assemble Stainless Steel Field Mace |
| `stainless_steel_kukri` | Stainless Steel Forward-Curved Knife | Material melee weapons | 2 | 0.67 | Craft: Assemble Stainless Steel Forward-Curved Knife |
| `stainless_steel_guard_baton` | Stainless Steel Guard Baton | Material melee weapons | 2 | 0.92 | Craft: Assemble Stainless Steel Guard Baton |
| `stainless_steel_halberd` | Stainless Steel Guard Halberd | Material melee weapons | 3 | 2.44 | Craft: Assemble Stainless Steel Guard Halberd |
| `stainless_steel_hand_axe` | Stainless Steel Hand Axe | Material melee weapons | 2 | 0.99 | Loot: depot, garage, hardware, warehouse |
| `stainless_steel_sickle` | Stainless Steel Harvest Sickle | Material melee weapons | 2 | 0.64 | Loot: depot, garage, hardware, warehouse |
| `stainless_steel_maul` | Stainless Steel Heavy Maul | Material melee weapons | 3 | 4.10 | Craft: Assemble Stainless Steel Heavy Maul |
| `stainless_steel_hook_spear` | Stainless Steel Hook Spear | Material melee weapons | 3 | 1.71 | Craft: Assemble Stainless Steel Hook Spear |
| `stainless_steel_war_pick` | Stainless Steel Hooked Impact Pick | Material melee weapons | 2 | 1.79 | Craft: Assemble Stainless Steel Hooked Impact Pick |
| `stainless_steel_war_hammer` | Stainless Steel Impact Hammer | Material melee weapons | 2 | 2.14 | Craft: Assemble Stainless Steel Impact Hammer |
| `stainless_steel_chain_morningstar` | Stainless Steel Linked Impact Club | Material melee weapons | 2 | 2.37 | Craft: Assemble Stainless Steel Linked Impact Club |
| `stainless_steel_glaive` | Stainless Steel Long Glaive | Material melee weapons | 3 | 2.02 | Craft: Assemble Stainless Steel Long Glaive |
| `stainless_steel_poleaxe` | Stainless Steel Long Poleaxe | Material melee weapons | 3 | 2.68 | Craft: Assemble Stainless Steel Long Poleaxe |
| `stainless_steel_longsword` | Stainless Steel Long Sword | Material melee weapons | 2 | 1.64 | Craft: Assemble Stainless Steel Long Sword |
| `stainless_steel_pry_baton` | Stainless Steel Pry Baton | Material melee weapons | 2 | 1.51 | Loot: depot, garage, hardware, warehouse |
| `stainless_steel_flanged_mace` | Stainless Steel Ribbed Mace | Material melee weapons | 2 | 1.79 | Craft: Assemble Stainless Steel Ribbed Mace |
| `stainless_steel_sabre` | Stainless Steel Scout Sabre | Material melee weapons | 2 | 0.92 | Craft: Assemble Stainless Steel Scout Sabre |
| `stainless_steel_shortsword` | Stainless Steel Short Sword | Material melee weapons | 2 | 0.81 | Craft: Assemble Stainless Steel Short Sword |
| `stainless_steel_spear` | Stainless Steel Socket Spear | Material melee weapons | 3 | 1.38 | Craft: Assemble Stainless Steel Socket Spear |
| `stainless_steel_trench_club` | Stainless Steel Weighted Field Club | Material melee weapons | 2 | 1.55 | Craft: Assemble Stainless Steel Weighted Field Club |
| `stone_pick` | Stone mining pick | melee | 0 | 1.30 | Craft: Make a stone mining pick |
| `tire_iron` | Tire iron | melee | 0 | 0.80 | Loot: fuel, garage |
| `titanium_boarding_axe` | Titanium Boarding Axe | Material melee weapons | 4 | 1.20 | Craft: Assemble Titanium Boarding Axe |
| `titanium_partisan` | Titanium Broad Spear | Material melee weapons | 5 | 1.14 | Craft: Assemble Titanium Broad Spear |
| `titanium_camp_axe` | Titanium Camp Axe | Material melee weapons | 4 | 0.94 | Craft: Assemble Titanium Camp Axe |
| `titanium_cleaver` | Titanium Camp Cleaver | Material melee weapons | 4 | 0.35 | Craft: Assemble Titanium Camp Cleaver |
| `titanium_cutlass` | Titanium Camp Cutlass | Material melee weapons | 4 | 0.64 | Craft: Assemble Titanium Camp Cutlass |
| `titanium_combat_knife` | Titanium Combat Knife | Material melee weapons | 4 | 0.24 | Craft: Assemble Titanium Combat Knife |
| `titanium_mace` | Titanium Field Mace | Material melee weapons | 4 | 0.99 | Craft: Assemble Titanium Field Mace |
| `titanium_kukri` | Titanium Forward-Curved Knife | Material melee weapons | 4 | 0.43 | Craft: Assemble Titanium Forward-Curved Knife |
| `titanium_guard_baton` | Titanium Guard Baton | Material melee weapons | 4 | 0.55 | Craft: Assemble Titanium Guard Baton |
| `titanium_halberd` | Titanium Guard Halberd | Material melee weapons | 5 | 1.42 | Craft: Assemble Titanium Guard Halberd |
| `titanium_hand_axe` | Titanium Hand Axe | Material melee weapons | 4 | 0.64 | Craft: Assemble Titanium Hand Axe |
| `titanium_sickle` | Titanium Harvest Sickle | Material melee weapons | 4 | 0.38 | Craft: Assemble Titanium Harvest Sickle |
| `titanium_maul` | Titanium Heavy Maul | Material melee weapons | 5 | 2.41 | Craft: Assemble Titanium Heavy Maul |
| `titanium_hook_spear` | Titanium Hook Spear | Material melee weapons | 5 | 1.02 | Craft: Assemble Titanium Hook Spear |
| `titanium_war_pick` | Titanium Hooked Impact Pick | Material melee weapons | 4 | 1.09 | Craft: Assemble Titanium Hooked Impact Pick |
| `titanium_war_hammer` | Titanium Impact Hammer | Material melee weapons | 4 | 1.26 | Craft: Assemble Titanium Impact Hammer |
| `titanium_chain_morningstar` | Titanium Linked Impact Club | Material melee weapons | 4 | 1.45 | Craft: Assemble Titanium Linked Impact Club |
| `titanium_glaive` | Titanium Long Glaive | Material melee weapons | 5 | 1.20 | Craft: Assemble Titanium Long Glaive |
| `titanium_poleaxe` | Titanium Long Poleaxe | Material melee weapons | 5 | 1.57 | Craft: Assemble Titanium Long Poleaxe |
| `titanium_longsword` | Titanium Long Sword | Material melee weapons | 4 | 0.98 | Craft: Assemble Titanium Long Sword |
| `titanium_pry_baton` | Titanium Pry Baton | Material melee weapons | 4 | 0.95 | Craft: Assemble Titanium Pry Baton |
| `titanium_flanged_mace` | Titanium Ribbed Mace | Material melee weapons | 4 | 1.09 | Craft: Assemble Titanium Ribbed Mace |
| `titanium_sabre` | Titanium Scout Sabre | Material melee weapons | 4 | 0.53 | Craft: Assemble Titanium Scout Sabre |
| `titanium_shortsword` | Titanium Short Sword | Material melee weapons | 4 | 0.50 | Craft: Assemble Titanium Short Sword |
| `titanium_spear` | Titanium Socket Spear | Material melee weapons | 5 | 0.85 | Craft: Assemble Titanium Socket Spear |
| `titanium_trench_club` | Titanium Weighted Field Club | Material melee weapons | 4 | 0.98 | Craft: Assemble Titanium Weighted Field Club |
| `tool_steel_boarding_axe` | Tool Steel Boarding Axe | Material melee weapons | 3 | 2.08 | Craft: Assemble Tool Steel Boarding Axe |
| `tool_steel_partisan` | Tool Steel Broad Spear | Material melee weapons | 4 | 2.04 | Craft: Assemble Tool Steel Broad Spear |
| `tool_steel_camp_axe` | Tool Steel Camp Axe | Material melee weapons | 3 | 1.64 | Craft: Assemble Tool Steel Camp Axe |
| `tool_steel_cleaver` | Tool Steel Camp Cleaver | Material melee weapons | 3 | 0.62 | Craft: Assemble Tool Steel Camp Cleaver |
| `tool_steel_cutlass` | Tool Steel Camp Cutlass | Material melee weapons | 3 | 1.13 | Craft: Assemble Tool Steel Camp Cutlass |
| `tool_steel_combat_knife` | Tool Steel Combat Knife | Material melee weapons | 3 | 0.39 | Craft: Assemble Tool Steel Combat Knife |
| `tool_steel_mace` | Tool Steel Field Mace | Material melee weapons | 3 | 1.71 | Craft: Assemble Tool Steel Field Mace |
| `tool_steel_kukri` | Tool Steel Forward-Curved Knife | Material melee weapons | 3 | 0.73 | Craft: Assemble Tool Steel Forward-Curved Knife |
| `tool_steel_guard_baton` | Tool Steel Guard Baton | Material melee weapons | 3 | 0.97 | Craft: Assemble Tool Steel Guard Baton |
| `tool_steel_halberd` | Tool Steel Guard Halberd | Material melee weapons | 4 | 2.60 | Craft: Assemble Tool Steel Guard Halberd |
| `tool_steel_hand_axe` | Tool Steel Hand Axe | Material melee weapons | 3 | 1.04 | Craft: Assemble Tool Steel Hand Axe |
| `tool_steel_sickle` | Tool Steel Harvest Sickle | Material melee weapons | 3 | 0.68 | Craft: Assemble Tool Steel Harvest Sickle |
| `tool_steel_maul` | Tool Steel Heavy Maul | Material melee weapons | 4 | 4.36 | Craft: Assemble Tool Steel Heavy Maul |
| `tool_steel_hook_spear` | Tool Steel Hook Spear | Material melee weapons | 4 | 1.77 | Craft: Assemble Tool Steel Hook Spear |
| `tool_steel_war_pick` | Tool Steel Hooked Impact Pick | Material melee weapons | 3 | 1.93 | Craft: Assemble Tool Steel Hooked Impact Pick |
| `tool_steel_war_hammer` | Tool Steel Impact Hammer | Material melee weapons | 3 | 2.28 | Craft: Assemble Tool Steel Impact Hammer |
| `tool_steel_chain_morningstar` | Tool Steel Linked Impact Club | Material melee weapons | 3 | 2.55 | Craft: Assemble Tool Steel Linked Impact Club |
| `tool_steel_glaive` | Tool Steel Long Glaive | Material melee weapons | 4 | 2.11 | Craft: Assemble Tool Steel Long Glaive |
| `tool_steel_poleaxe` | Tool Steel Long Poleaxe | Material melee weapons | 4 | 2.84 | Craft: Assemble Tool Steel Long Poleaxe |
| `tool_steel_longsword` | Tool Steel Long Sword | Material melee weapons | 3 | 1.69 | Craft: Assemble Tool Steel Long Sword |
| `tool_steel_pry_baton` | Tool Steel Pry Baton | Material melee weapons | 3 | 1.60 | Craft: Assemble Tool Steel Pry Baton |
| `tool_steel_flanged_mace` | Tool Steel Ribbed Mace | Material melee weapons | 3 | 1.92 | Craft: Assemble Tool Steel Ribbed Mace |
| `tool_steel_sabre` | Tool Steel Scout Sabre | Material melee weapons | 3 | 0.98 | Craft: Assemble Tool Steel Scout Sabre |
| `tool_steel_shortsword` | Tool Steel Short Sword | Material melee weapons | 3 | 0.82 | Craft: Assemble Tool Steel Short Sword |
| `tool_steel_spear` | Tool Steel Socket Spear | Material melee weapons | 4 | 1.49 | Craft: Assemble Tool Steel Socket Spear |
| `tool_steel_trench_club` | Tool Steel Weighted Field Club | Material melee weapons | 3 | 1.69 | Craft: Assemble Tool Steel Weighted Field Club |
| `staff` | Walking staff | melee | 0 | 0.80 | Loot: cabin, camp, forest, ranger, river |
| `spear` | Wooden spear | melee | 0 | 1.10 | Craft: Carve wooden spear |
| `shard_knife` | Wrapped glass edge | melee | 0 | 0.13 | Craft: Wrap a glass edge |
| `wrought_iron_boarding_axe` | Wrought Iron Boarding Axe | Material melee weapons | 1 | 1.86 | Craft: Assemble Wrought Iron Boarding Axe |
| `wrought_iron_partisan` | Wrought Iron Broad Spear | Material melee weapons | 2 | 1.81 | Craft: Assemble Wrought Iron Broad Spear |
| `wrought_iron_camp_axe` | Wrought Iron Camp Axe | Material melee weapons | 1 | 1.51 | Craft: Assemble Wrought Iron Camp Axe |
| `wrought_iron_cleaver` | Wrought Iron Camp Cleaver | Material melee weapons | 1 | 0.58 | Craft: Assemble Wrought Iron Camp Cleaver |
| `wrought_iron_cutlass` | Wrought Iron Camp Cutlass | Material melee weapons | 1 | 0.99 | Craft: Assemble Wrought Iron Camp Cutlass |
| `wrought_iron_combat_knife` | Wrought Iron Combat Knife | Material melee weapons | 1 | 0.36 | Loot: depot, garage, hardware, warehouse |
| `wrought_iron_mace` | Wrought Iron Field Mace | Material melee weapons | 1 | 1.58 | Craft: Assemble Wrought Iron Field Mace |
| `wrought_iron_kukri` | Wrought Iron Forward-Curved Knife | Material melee weapons | 1 | 0.64 | Craft: Assemble Wrought Iron Forward-Curved Knife |
| `wrought_iron_guard_baton` | Wrought Iron Guard Baton | Material melee weapons | 1 | 0.86 | Craft: Assemble Wrought Iron Guard Baton |
| `wrought_iron_halberd` | Wrought Iron Guard Halberd | Material melee weapons | 2 | 2.33 | Craft: Assemble Wrought Iron Guard Halberd |
| `wrought_iron_hand_axe` | Wrought Iron Hand Axe | Material melee weapons | 1 | 0.99 | Loot: depot, garage, hardware, warehouse |
| `wrought_iron_sickle` | Wrought Iron Harvest Sickle | Material melee weapons | 1 | 0.59 | Loot: depot, garage, hardware, warehouse |
| `wrought_iron_maul` | Wrought Iron Heavy Maul | Material melee weapons | 2 | 3.96 | Craft: Assemble Wrought Iron Heavy Maul |
| `wrought_iron_hook_spear` | Wrought Iron Hook Spear | Material melee weapons | 2 | 1.65 | Craft: Assemble Wrought Iron Hook Spear |
| `wrought_iron_war_pick` | Wrought Iron Hooked Impact Pick | Material melee weapons | 1 | 1.76 | Craft: Assemble Wrought Iron Hooked Impact Pick |
| `wrought_iron_war_hammer` | Wrought Iron Impact Hammer | Material melee weapons | 1 | 2.03 | Craft: Assemble Wrought Iron Impact Hammer |
| `wrought_iron_chain_morningstar` | Wrought Iron Linked Impact Club | Material melee weapons | 1 | 2.33 | Craft: Assemble Wrought Iron Linked Impact Club |
| `wrought_iron_glaive` | Wrought Iron Long Glaive | Material melee weapons | 2 | 1.94 | Craft: Assemble Wrought Iron Long Glaive |
| `wrought_iron_poleaxe` | Wrought Iron Long Poleaxe | Material melee weapons | 2 | 2.55 | Craft: Assemble Wrought Iron Long Poleaxe |
| `wrought_iron_longsword` | Wrought Iron Long Sword | Material melee weapons | 1 | 1.58 | Craft: Assemble Wrought Iron Long Sword |
| `wrought_iron_pry_baton` | Wrought Iron Pry Baton | Material melee weapons | 1 | 1.49 | Loot: depot, garage, hardware, warehouse |
| `wrought_iron_flanged_mace` | Wrought Iron Ribbed Mace | Material melee weapons | 1 | 1.74 | Craft: Assemble Wrought Iron Ribbed Mace |
| `wrought_iron_sabre` | Wrought Iron Scout Sabre | Material melee weapons | 1 | 0.87 | Craft: Assemble Wrought Iron Scout Sabre |
| `wrought_iron_shortsword` | Wrought Iron Short Sword | Material melee weapons | 1 | 0.77 | Craft: Assemble Wrought Iron Short Sword |
| `wrought_iron_spear` | Wrought Iron Socket Spear | Material melee weapons | 2 | 1.32 | Craft: Assemble Wrought Iron Socket Spear |
| `wrought_iron_trench_club` | Wrought Iron Weighted Field Club | Material melee weapons | 1 | 1.50 | Craft: Assemble Wrought Iron Weighted Field Club |
| `zinc_alloy_boarding_axe` | Zinc Alloy Boarding Axe | Material melee weapons | 1 | 1.60 | Craft: Assemble Zinc Alloy Boarding Axe |
| `zinc_alloy_partisan` | Zinc Alloy Broad Spear | Material melee weapons | 2 | 1.59 | Craft: Assemble Zinc Alloy Broad Spear |
| `zinc_alloy_camp_axe` | Zinc Alloy Camp Axe | Material melee weapons | 1 | 1.24 | Craft: Assemble Zinc Alloy Camp Axe |
| `zinc_alloy_cleaver` | Zinc Alloy Camp Cleaver | Material melee weapons | 1 | 0.51 | Craft: Assemble Zinc Alloy Camp Cleaver |
| `zinc_alloy_cutlass` | Zinc Alloy Camp Cutlass | Material melee weapons | 1 | 0.89 | Craft: Assemble Zinc Alloy Camp Cutlass |
| `zinc_alloy_combat_knife` | Zinc Alloy Combat Knife | Material melee weapons | 1 | 0.31 | Craft: Assemble Zinc Alloy Combat Knife |
| `zinc_alloy_mace` | Zinc Alloy Field Mace | Material melee weapons | 1 | 1.33 | Craft: Assemble Zinc Alloy Field Mace |
| `zinc_alloy_kukri` | Zinc Alloy Forward-Curved Knife | Material melee weapons | 1 | 0.56 | Craft: Assemble Zinc Alloy Forward-Curved Knife |
| `zinc_alloy_guard_baton` | Zinc Alloy Guard Baton | Material melee weapons | 1 | 0.76 | Craft: Assemble Zinc Alloy Guard Baton |
| `zinc_alloy_halberd` | Zinc Alloy Guard Halberd | Material melee weapons | 2 | 1.99 | Craft: Assemble Zinc Alloy Guard Halberd |
| `zinc_alloy_hand_axe` | Zinc Alloy Hand Axe | Material melee weapons | 1 | 0.81 | Craft: Assemble Zinc Alloy Hand Axe |
| `zinc_alloy_sickle` | Zinc Alloy Harvest Sickle | Material melee weapons | 1 | 0.53 | Craft: Assemble Zinc Alloy Harvest Sickle |
| `zinc_alloy_maul` | Zinc Alloy Heavy Maul | Material melee weapons | 2 | 3.35 | Craft: Assemble Zinc Alloy Heavy Maul |
| `zinc_alloy_hook_spear` | Zinc Alloy Hook Spear | Material melee weapons | 2 | 1.36 | Craft: Assemble Zinc Alloy Hook Spear |
| `zinc_alloy_war_pick` | Zinc Alloy Hooked Impact Pick | Material melee weapons | 1 | 1.49 | Craft: Assemble Zinc Alloy Hooked Impact Pick |
| `zinc_alloy_war_hammer` | Zinc Alloy Impact Hammer | Material melee weapons | 1 | 1.74 | Craft: Assemble Zinc Alloy Impact Hammer |
| `zinc_alloy_chain_morningstar` | Zinc Alloy Linked Impact Club | Material melee weapons | 1 | 1.93 | Craft: Assemble Zinc Alloy Linked Impact Club |
| `zinc_alloy_glaive` | Zinc Alloy Long Glaive | Material melee weapons | 2 | 1.67 | Craft: Assemble Zinc Alloy Long Glaive |
| `zinc_alloy_poleaxe` | Zinc Alloy Long Poleaxe | Material melee weapons | 2 | 2.19 | Craft: Assemble Zinc Alloy Long Poleaxe |
| `zinc_alloy_longsword` | Zinc Alloy Long Sword | Material melee weapons | 1 | 1.30 | Craft: Assemble Zinc Alloy Long Sword |
| `zinc_alloy_pry_baton` | Zinc Alloy Pry Baton | Material melee weapons | 1 | 1.23 | Craft: Assemble Zinc Alloy Pry Baton |
| `zinc_alloy_flanged_mace` | Zinc Alloy Ribbed Mace | Material melee weapons | 1 | 1.45 | Craft: Assemble Zinc Alloy Ribbed Mace |
| `zinc_alloy_sabre` | Zinc Alloy Scout Sabre | Material melee weapons | 1 | 0.76 | Craft: Assemble Zinc Alloy Scout Sabre |
| `zinc_alloy_shortsword` | Zinc Alloy Short Sword | Material melee weapons | 1 | 0.69 | Craft: Assemble Zinc Alloy Short Sword |
| `zinc_alloy_spear` | Zinc Alloy Socket Spear | Material melee weapons | 2 | 1.14 | Craft: Assemble Zinc Alloy Socket Spear |
| `zinc_alloy_trench_club` | Zinc Alloy Weighted Field Club | Material melee weapons | 1 | 1.30 | Craft: Assemble Zinc Alloy Weighted Field Club |

## Tools

| Stable ID | Item | Family | Tier | kg | Obtain |
| --- | --- | --- | ---: | ---: | --- |
| `wrench` | Adjustable wrench | tools | 0 | 0.70 | Loot: depot, fuel, garage, hardware, industrial, warehouse, workshop |
| `aluminum_cabinet_saw` | Aluminum Cabinet Saw | Material field tools | 1 | 0.34 | Craft: Assemble Aluminum Cabinet Saw |
| `aluminum_camp_pot` | Aluminum Camp Pot | Material field tools | 2 | 0.50 | Craft: Assemble Aluminum Camp Pot |
| `aluminum_chipping_pick` | Aluminum Chipping Pick | Material field tools | 2 | 0.86 | Craft: Assemble Aluminum Chipping Pick |
| `aluminum_claw_hammer` | Aluminum Claw Hammer | Material field tools | 1 | 0.47 | Craft: Assemble Aluminum Claw Hammer |
| `aluminum_demolition_hammer` | Aluminum Demolition Hammer | Material field tools | 2 | 1.52 | Craft: Assemble Aluminum Demolition Hammer |
| `aluminum_field_file` | Aluminum Field File | Material field tools | 1 | 0.18 | Craft: Assemble Aluminum Field File |
| `aluminum_flat_driver` | Aluminum Flat Driver | Material field tools | 1 | 0.12 | Craft: Assemble Aluminum Flat Driver |
| `aluminum_grip_pliers` | Aluminum Grip Pliers | Material field tools | 1 | 0.19 | Craft: Assemble Aluminum Grip Pliers |
| `aluminum_hand_borer` | Aluminum Hand Borer | Material field tools | 2 | 0.43 | Craft: Assemble Aluminum Hand Borer |
| `aluminum_herb_mortar` | Aluminum Herb Mortar | Material field tools | 2 | 0.36 | Craft: Assemble Aluminum Herb Mortar |
| `aluminum_hinge_wrench` | Aluminum Hinge Wrench | Material field tools | 1 | 0.40 | Craft: Assemble Aluminum Hinge Wrench |
| `aluminum_joiner_mallet` | Aluminum Joiner Mallet | Material field tools | 1 | 0.58 | Craft: Assemble Aluminum Joiner Mallet |
| `aluminum_piercing_awl` | Aluminum Piercing Awl | Material field tools | 1 | 0.10 | Craft: Assemble Aluminum Piercing Awl |
| `aluminum_sheet_cutter` | Aluminum Sheet Cutter | Material field tools | 1 | 0.28 | Craft: Assemble Aluminum Sheet Cutter |
| `aluminum_tack_hammer` | Aluminum Tack Hammer | Material field tools | 1 | 0.24 | Craft: Assemble Aluminum Tack Hammer |
| `aluminum_wire_shear` | Aluminum Wire Shear | Material field tools | 1 | 0.22 | Craft: Assemble Aluminum Wire Shear |
| `boron_steel_cabinet_saw` | Boron Steel Cabinet Saw | Material field tools | 4 | 0.70 | Craft: Assemble Boron Steel Cabinet Saw |
| `boron_steel_camp_pot` | Boron Steel Camp Pot | Material field tools | 5 | 1.05 | Craft: Assemble Boron Steel Camp Pot |
| `boron_steel_chipping_pick` | Boron Steel Chipping Pick | Material field tools | 5 | 1.82 | Craft: Assemble Boron Steel Chipping Pick |
| `boron_steel_claw_hammer` | Boron Steel Claw Hammer | Material field tools | 4 | 0.97 | Craft: Assemble Boron Steel Claw Hammer |
| `boron_steel_demolition_hammer` | Boron Steel Demolition Hammer | Material field tools | 5 | 3.27 | Craft: Assemble Boron Steel Demolition Hammer |
| `boron_steel_field_file` | Boron Steel Field File | Material field tools | 4 | 0.32 | Craft: Assemble Boron Steel Field File |
| `boron_steel_flat_driver` | Boron Steel Flat Driver | Material field tools | 4 | 0.22 | Craft: Assemble Boron Steel Flat Driver |
| `boron_steel_grip_pliers` | Boron Steel Grip Pliers | Material field tools | 4 | 0.39 | Craft: Assemble Boron Steel Grip Pliers |
| `boron_steel_hand_borer` | Boron Steel Hand Borer | Material field tools | 5 | 0.90 | Craft: Assemble Boron Steel Hand Borer |
| `boron_steel_herb_mortar` | Boron Steel Herb Mortar | Material field tools | 5 | 0.72 | Craft: Assemble Boron Steel Herb Mortar |
| `boron_steel_hinge_wrench` | Boron Steel Hinge Wrench | Material field tools | 4 | 0.81 | Craft: Assemble Boron Steel Hinge Wrench |
| `boron_steel_joiner_mallet` | Boron Steel Joiner Mallet | Material field tools | 4 | 1.23 | Craft: Assemble Boron Steel Joiner Mallet |
| `boron_steel_piercing_awl` | Boron Steel Piercing Awl | Material field tools | 4 | 0.16 | Craft: Assemble Boron Steel Piercing Awl |
| `boron_steel_sheet_cutter` | Boron Steel Sheet Cutter | Material field tools | 4 | 0.57 | Craft: Assemble Boron Steel Sheet Cutter |
| `boron_steel_tack_hammer` | Boron Steel Tack Hammer | Material field tools | 4 | 0.48 | Craft: Assemble Boron Steel Tack Hammer |
| `boron_steel_wire_shear` | Boron Steel Wire Shear | Material field tools | 4 | 0.46 | Craft: Assemble Boron Steel Wire Shear |
| `brass_cabinet_saw` | Brass Cabinet Saw | Material field tools | 1 | 0.74 | Craft: Assemble Brass Cabinet Saw |
| `brass_camp_pot` | Brass Camp Pot | Material field tools | 2 | 1.13 | Craft: Assemble Brass Camp Pot |
| `brass_chipping_pick` | Brass Chipping Pick | Material field tools | 2 | 1.98 | Craft: Assemble Brass Chipping Pick |
| `brass_claw_hammer` | Brass Claw Hammer | Material field tools | 1 | 1.06 | Craft: Assemble Brass Claw Hammer |
| `brass_demolition_hammer` | Brass Demolition Hammer | Material field tools | 2 | 3.52 | Craft: Assemble Brass Demolition Hammer |
| `brass_field_file` | Brass Field File | Material field tools | 1 | 0.35 | Craft: Assemble Brass Field File |
| `brass_flat_driver` | Brass Flat Driver | Material field tools | 1 | 0.25 | Craft: Assemble Brass Flat Driver |
| `brass_grip_pliers` | Brass Grip Pliers | Material field tools | 1 | 0.41 | Craft: Assemble Brass Grip Pliers |
| `brass_hand_borer` | Brass Hand Borer | Material field tools | 2 | 0.97 | Craft: Assemble Brass Hand Borer |
| `brass_herb_mortar` | Brass Herb Mortar | Material field tools | 2 | 0.79 | Craft: Assemble Brass Herb Mortar |
| `brass_hinge_wrench` | Brass Hinge Wrench | Material field tools | 1 | 0.87 | Craft: Assemble Brass Hinge Wrench |
| `brass_joiner_mallet` | Brass Joiner Mallet | Material field tools | 1 | 1.32 | Craft: Assemble Brass Joiner Mallet |
| `brass_piercing_awl` | Brass Piercing Awl | Material field tools | 1 | 0.17 | Craft: Assemble Brass Piercing Awl |
| `brass_sheet_cutter` | Brass Sheet Cutter | Material field tools | 1 | 0.60 | Craft: Assemble Brass Sheet Cutter |
| `brass_tack_hammer` | Brass Tack Hammer | Material field tools | 1 | 0.51 | Craft: Assemble Brass Tack Hammer |
| `brass_wire_shear` | Brass Wire Shear | Material field tools | 1 | 0.48 | Craft: Assemble Brass Wire Shear |
| `bronze_cabinet_saw` | Bronze Cabinet Saw | Material field tools | 1 | 0.77 | Craft: Assemble Bronze Cabinet Saw |
| `bronze_camp_pot` | Bronze Camp Pot | Material field tools | 2 | 1.13 | Craft: Assemble Bronze Camp Pot |
| `bronze_chipping_pick` | Bronze Chipping Pick | Material field tools | 2 | 2.01 | Craft: Assemble Bronze Chipping Pick |
| `bronze_claw_hammer` | Bronze Claw Hammer | Material field tools | 1 | 1.07 | Craft: Assemble Bronze Claw Hammer |
| `bronze_demolition_hammer` | Bronze Demolition Hammer | Material field tools | 2 | 3.60 | Craft: Assemble Bronze Demolition Hammer |
| `bronze_field_file` | Bronze Field File | Material field tools | 1 | 0.34 | Craft: Assemble Bronze Field File |
| `bronze_flat_driver` | Bronze Flat Driver | Material field tools | 1 | 0.25 | Craft: Assemble Bronze Flat Driver |
| `bronze_grip_pliers` | Bronze Grip Pliers | Material field tools | 1 | 0.42 | Craft: Assemble Bronze Grip Pliers |
| `bronze_hand_borer` | Bronze Hand Borer | Material field tools | 2 | 0.98 | Craft: Assemble Bronze Hand Borer |
| `bronze_herb_mortar` | Bronze Herb Mortar | Material field tools | 2 | 0.80 | Craft: Assemble Bronze Herb Mortar |
| `bronze_hinge_wrench` | Bronze Hinge Wrench | Material field tools | 1 | 0.88 | Craft: Assemble Bronze Hinge Wrench |
| `bronze_joiner_mallet` | Bronze Joiner Mallet | Material field tools | 1 | 1.37 | Craft: Assemble Bronze Joiner Mallet |
| `bronze_piercing_awl` | Bronze Piercing Awl | Material field tools | 1 | 0.16 | Craft: Assemble Bronze Piercing Awl |
| `bronze_sheet_cutter` | Bronze Sheet Cutter | Material field tools | 1 | 0.62 | Craft: Assemble Bronze Sheet Cutter |
| `bronze_tack_hammer` | Bronze Tack Hammer | Material field tools | 1 | 0.53 | Craft: Assemble Bronze Tack Hammer |
| `bronze_wire_shear` | Bronze Wire Shear | Material field tools | 1 | 0.50 | Craft: Assemble Bronze Wire Shear |
| `carbon_steel_cabinet_saw` | Carbon Steel Cabinet Saw | Material field tools | 2 | 0.68 | Loot: garage, hardware, workshop |
| `carbon_steel_camp_pot` | Carbon Steel Camp Pot | Material field tools | 3 | 1.02 | Craft: Assemble Carbon Steel Camp Pot |
| `carbon_steel_chipping_pick` | Carbon Steel Chipping Pick | Material field tools | 3 | 1.81 | Loot: garage, hardware, workshop |
| `carbon_steel_claw_hammer` | Carbon Steel Claw Hammer | Material field tools | 2 | 0.97 | Loot: garage, hardware, workshop |
| `carbon_steel_demolition_hammer` | Carbon Steel Demolition Hammer | Material field tools | 3 | 3.22 | Craft: Assemble Carbon Steel Demolition Hammer |
| `carbon_steel_field_file` | Carbon Steel Field File | Material field tools | 2 | 0.31 | Craft: Assemble Carbon Steel Field File |
| `carbon_steel_flat_driver` | Carbon Steel Flat Driver | Material field tools | 2 | 0.23 | Loot: garage, hardware, workshop |
| `carbon_steel_grip_pliers` | Carbon Steel Grip Pliers | Material field tools | 2 | 0.38 | Craft: Assemble Carbon Steel Grip Pliers |
| `carbon_steel_hand_borer` | Carbon Steel Hand Borer | Material field tools | 3 | 0.87 | Craft: Assemble Carbon Steel Hand Borer |
| `carbon_steel_herb_mortar` | Carbon Steel Herb Mortar | Material field tools | 3 | 0.72 | Craft: Assemble Carbon Steel Herb Mortar |
| `carbon_steel_hinge_wrench` | Carbon Steel Hinge Wrench | Material field tools | 2 | 0.80 | Loot: garage, hardware, workshop |
| `carbon_steel_joiner_mallet` | Carbon Steel Joiner Mallet | Material field tools | 2 | 1.22 | Craft: Assemble Carbon Steel Joiner Mallet |
| `carbon_steel_piercing_awl` | Carbon Steel Piercing Awl | Material field tools | 2 | 0.14 | Craft: Assemble Carbon Steel Piercing Awl |
| `carbon_steel_sheet_cutter` | Carbon Steel Sheet Cutter | Material field tools | 2 | 0.55 | Craft: Assemble Carbon Steel Sheet Cutter |
| `carbon_steel_tack_hammer` | Carbon Steel Tack Hammer | Material field tools | 2 | 0.48 | Craft: Assemble Carbon Steel Tack Hammer |
| `carbon_steel_wire_shear` | Carbon Steel Wire Shear | Material field tools | 2 | 0.46 | Craft: Assemble Carbon Steel Wire Shear |
| `cast_iron_cabinet_saw` | Cast Iron Cabinet Saw | Material field tools | 1 | 0.78 | Craft: Assemble Cast Iron Cabinet Saw |
| `cast_iron_camp_pot` | Cast Iron Camp Pot | Material field tools | 2 | 1.17 | Craft: Assemble Cast Iron Camp Pot |
| `cast_iron_chipping_pick` | Cast Iron Chipping Pick | Material field tools | 2 | 2.05 | Craft: Assemble Cast Iron Chipping Pick |
| `cast_iron_claw_hammer` | Cast Iron Claw Hammer | Material field tools | 1 | 1.09 | Craft: Assemble Cast Iron Claw Hammer |
| `cast_iron_demolition_hammer` | Cast Iron Demolition Hammer | Material field tools | 2 | 3.67 | Craft: Assemble Cast Iron Demolition Hammer |
| `cast_iron_field_file` | Cast Iron Field File | Material field tools | 1 | 0.36 | Craft: Assemble Cast Iron Field File |
| `cast_iron_flat_driver` | Cast Iron Flat Driver | Material field tools | 1 | 0.25 | Craft: Assemble Cast Iron Flat Driver |
| `cast_iron_grip_pliers` | Cast Iron Grip Pliers | Material field tools | 1 | 0.42 | Craft: Assemble Cast Iron Grip Pliers |
| `cast_iron_hand_borer` | Cast Iron Hand Borer | Material field tools | 2 | 1.01 | Craft: Assemble Cast Iron Hand Borer |
| `cast_iron_herb_mortar` | Cast Iron Herb Mortar | Material field tools | 2 | 0.83 | Craft: Assemble Cast Iron Herb Mortar |
| `cast_iron_hinge_wrench` | Cast Iron Hinge Wrench | Material field tools | 1 | 0.92 | Craft: Assemble Cast Iron Hinge Wrench |
| `cast_iron_joiner_mallet` | Cast Iron Joiner Mallet | Material field tools | 1 | 1.38 | Craft: Assemble Cast Iron Joiner Mallet |
| `cast_iron_piercing_awl` | Cast Iron Piercing Awl | Material field tools | 1 | 0.17 | Craft: Assemble Cast Iron Piercing Awl |
| `cast_iron_sheet_cutter` | Cast Iron Sheet Cutter | Material field tools | 1 | 0.63 | Craft: Assemble Cast Iron Sheet Cutter |
| `cast_iron_tack_hammer` | Cast Iron Tack Hammer | Material field tools | 1 | 0.53 | Craft: Assemble Cast Iron Tack Hammer |
| `cast_iron_wire_shear` | Cast Iron Wire Shear | Material field tools | 1 | 0.51 | Craft: Assemble Cast Iron Wire Shear |
| `chrome_steel_cabinet_saw` | Chrome Steel Cabinet Saw | Material field tools | 4 | 0.73 | Craft: Assemble Chrome Steel Cabinet Saw |
| `chrome_steel_camp_pot` | Chrome Steel Camp Pot | Material field tools | 5 | 1.09 | Craft: Assemble Chrome Steel Camp Pot |
| `chrome_steel_chipping_pick` | Chrome Steel Chipping Pick | Material field tools | 5 | 1.94 | Craft: Assemble Chrome Steel Chipping Pick |
| `chrome_steel_claw_hammer` | Chrome Steel Claw Hammer | Material field tools | 4 | 1.04 | Craft: Assemble Chrome Steel Claw Hammer |
| `chrome_steel_demolition_hammer` | Chrome Steel Demolition Hammer | Material field tools | 5 | 3.46 | Craft: Assemble Chrome Steel Demolition Hammer |
| `chrome_steel_field_file` | Chrome Steel Field File | Material field tools | 4 | 0.33 | Craft: Assemble Chrome Steel Field File |
| `chrome_steel_flat_driver` | Chrome Steel Flat Driver | Material field tools | 4 | 0.25 | Craft: Assemble Chrome Steel Flat Driver |
| `chrome_steel_grip_pliers` | Chrome Steel Grip Pliers | Material field tools | 4 | 0.41 | Craft: Assemble Chrome Steel Grip Pliers |
| `chrome_steel_hand_borer` | Chrome Steel Hand Borer | Material field tools | 5 | 0.94 | Craft: Assemble Chrome Steel Hand Borer |
| `chrome_steel_herb_mortar` | Chrome Steel Herb Mortar | Material field tools | 5 | 0.77 | Craft: Assemble Chrome Steel Herb Mortar |
| `chrome_steel_hinge_wrench` | Chrome Steel Hinge Wrench | Material field tools | 4 | 0.86 | Craft: Assemble Chrome Steel Hinge Wrench |
| `chrome_steel_joiner_mallet` | Chrome Steel Joiner Mallet | Material field tools | 4 | 1.31 | Craft: Assemble Chrome Steel Joiner Mallet |
| `chrome_steel_piercing_awl` | Chrome Steel Piercing Awl | Material field tools | 4 | 0.17 | Craft: Assemble Chrome Steel Piercing Awl |
| `chrome_steel_sheet_cutter` | Chrome Steel Sheet Cutter | Material field tools | 4 | 0.59 | Craft: Assemble Chrome Steel Sheet Cutter |
| `chrome_steel_tack_hammer` | Chrome Steel Tack Hammer | Material field tools | 4 | 0.51 | Craft: Assemble Chrome Steel Tack Hammer |
| `chrome_steel_wire_shear` | Chrome Steel Wire Shear | Material field tools | 4 | 0.50 | Craft: Assemble Chrome Steel Wire Shear |
| `hammer` | Claw hammer | tools | 0 | 0.90 | Loot: depot, garage, hardware, industrial, warehouse, workshop |
| `cobalt_alloy_cabinet_saw` | Cobalt Alloy Cabinet Saw | Material field tools | 5 | 0.81 | Craft: Assemble Cobalt Alloy Cabinet Saw |
| `cobalt_alloy_camp_pot` | Cobalt Alloy Camp Pot | Material field tools | 5 | 1.22 | Craft: Assemble Cobalt Alloy Camp Pot |
| `cobalt_alloy_chipping_pick` | Cobalt Alloy Chipping Pick | Material field tools | 5 | 2.15 | Craft: Assemble Cobalt Alloy Chipping Pick |
| `cobalt_alloy_claw_hammer` | Cobalt Alloy Claw Hammer | Material field tools | 5 | 1.15 | Craft: Assemble Cobalt Alloy Claw Hammer |
| `cobalt_alloy_demolition_hammer` | Cobalt Alloy Demolition Hammer | Material field tools | 5 | 3.85 | Craft: Assemble Cobalt Alloy Demolition Hammer |
| `cobalt_alloy_field_file` | Cobalt Alloy Field File | Material field tools | 5 | 0.37 | Craft: Assemble Cobalt Alloy Field File |
| `cobalt_alloy_flat_driver` | Cobalt Alloy Flat Driver | Material field tools | 5 | 0.27 | Craft: Assemble Cobalt Alloy Flat Driver |
| `cobalt_alloy_grip_pliers` | Cobalt Alloy Grip Pliers | Material field tools | 5 | 0.45 | Craft: Assemble Cobalt Alloy Grip Pliers |
| `cobalt_alloy_hand_borer` | Cobalt Alloy Hand Borer | Material field tools | 5 | 1.03 | Craft: Assemble Cobalt Alloy Hand Borer |
| `cobalt_alloy_herb_mortar` | Cobalt Alloy Herb Mortar | Material field tools | 5 | 0.85 | Craft: Assemble Cobalt Alloy Herb Mortar |
| `cobalt_alloy_hinge_wrench` | Cobalt Alloy Hinge Wrench | Material field tools | 5 | 0.95 | Craft: Assemble Cobalt Alloy Hinge Wrench |
| `cobalt_alloy_joiner_mallet` | Cobalt Alloy Joiner Mallet | Material field tools | 5 | 1.45 | Craft: Assemble Cobalt Alloy Joiner Mallet |
| `cobalt_alloy_piercing_awl` | Cobalt Alloy Piercing Awl | Material field tools | 5 | 0.17 | Craft: Assemble Cobalt Alloy Piercing Awl |
| `cobalt_alloy_sheet_cutter` | Cobalt Alloy Sheet Cutter | Material field tools | 5 | 0.65 | Craft: Assemble Cobalt Alloy Sheet Cutter |
| `cobalt_alloy_tack_hammer` | Cobalt Alloy Tack Hammer | Material field tools | 5 | 0.57 | Craft: Assemble Cobalt Alloy Tack Hammer |
| `cobalt_alloy_wire_shear` | Cobalt Alloy Wire Shear | Material field tools | 5 | 0.54 | Craft: Assemble Cobalt Alloy Wire Shear |
| `cooking_pot` | Cooking pot | tools | 0 | 0.80 | Loot: cabin, camp, house, ranger, restaurant, suburban, urban |
| `copper_cabinet_saw` | Copper Cabinet Saw | Material field tools | 1 | 0.78 | Craft: Assemble Copper Cabinet Saw |
| `copper_camp_pot` | Copper Camp Pot | Material field tools | 2 | 1.15 | Craft: Assemble Copper Camp Pot |
| `copper_chipping_pick` | Copper Chipping Pick | Material field tools | 2 | 2.03 | Craft: Assemble Copper Chipping Pick |
| `copper_claw_hammer` | Copper Claw Hammer | Material field tools | 1 | 1.08 | Craft: Assemble Copper Claw Hammer |
| `copper_demolition_hammer` | Copper Demolition Hammer | Material field tools | 2 | 3.65 | Craft: Assemble Copper Demolition Hammer |
| `copper_field_file` | Copper Field File | Material field tools | 1 | 0.36 | Craft: Assemble Copper Field File |
| `copper_flat_driver` | Copper Flat Driver | Material field tools | 1 | 0.25 | Craft: Assemble Copper Flat Driver |
| `copper_grip_pliers` | Copper Grip Pliers | Material field tools | 1 | 0.43 | Craft: Assemble Copper Grip Pliers |
| `copper_hand_borer` | Copper Hand Borer | Material field tools | 2 | 1.01 | Craft: Assemble Copper Hand Borer |
| `copper_herb_mortar` | Copper Herb Mortar | Material field tools | 2 | 0.80 | Craft: Assemble Copper Herb Mortar |
| `copper_hinge_wrench` | Copper Hinge Wrench | Material field tools | 1 | 0.89 | Craft: Assemble Copper Hinge Wrench |
| `copper_joiner_mallet` | Copper Joiner Mallet | Material field tools | 1 | 1.38 | Craft: Assemble Copper Joiner Mallet |
| `copper_piercing_awl` | Copper Piercing Awl | Material field tools | 1 | 0.17 | Craft: Assemble Copper Piercing Awl |
| `copper_sheet_cutter` | Copper Sheet Cutter | Material field tools | 1 | 0.63 | Craft: Assemble Copper Sheet Cutter |
| `copper_tack_hammer` | Copper Tack Hammer | Material field tools | 1 | 0.54 | Craft: Assemble Copper Tack Hammer |
| `copper_wire_shear` | Copper Wire Shear | Material field tools | 1 | 0.52 | Craft: Assemble Copper Wire Shear |
| `firestarter` | Fire steel | tools | 0 | 0.08 | Loot: cabin, camp, forest, ranger, river |
| `funnel` | Funnel | tools | 0 | 0.08 | Loot: restaurant |
| `drill` | Hand drill | tools | 0 | 0.85 | Loot: hardware, industrial |
| `saw` | Hand saw | tools | 0 | 0.55 | Loot: cabin, depot, garage, hardware, industrial, warehouse, workshop |
| `hatchet` | Hatchet | tools | 0 | 1.10 | Loot: cabin, camp, forest, hardware, ranger, river |
| `needle` | Heavy needle | tools | 0 | 0.01 | Loot: house, suburban, urban |
| `manganese_steel_cabinet_saw` | Manganese Steel Cabinet Saw | Material field tools | 3 | 0.76 | Craft: Assemble Manganese Steel Cabinet Saw |
| `manganese_steel_camp_pot` | Manganese Steel Camp Pot | Material field tools | 4 | 1.15 | Craft: Assemble Manganese Steel Camp Pot |
| `manganese_steel_chipping_pick` | Manganese Steel Chipping Pick | Material field tools | 4 | 2.03 | Craft: Assemble Manganese Steel Chipping Pick |
| `manganese_steel_claw_hammer` | Manganese Steel Claw Hammer | Material field tools | 3 | 1.09 | Craft: Assemble Manganese Steel Claw Hammer |
| `manganese_steel_demolition_hammer` | Manganese Steel Demolition Hammer | Material field tools | 4 | 3.63 | Craft: Assemble Manganese Steel Demolition Hammer |
| `manganese_steel_field_file` | Manganese Steel Field File | Material field tools | 3 | 0.34 | Craft: Assemble Manganese Steel Field File |
| `manganese_steel_flat_driver` | Manganese Steel Flat Driver | Material field tools | 3 | 0.25 | Craft: Assemble Manganese Steel Flat Driver |
| `manganese_steel_grip_pliers` | Manganese Steel Grip Pliers | Material field tools | 3 | 0.43 | Craft: Assemble Manganese Steel Grip Pliers |
| `manganese_steel_hand_borer` | Manganese Steel Hand Borer | Material field tools | 4 | 0.99 | Craft: Assemble Manganese Steel Hand Borer |
| `manganese_steel_herb_mortar` | Manganese Steel Herb Mortar | Material field tools | 4 | 0.81 | Craft: Assemble Manganese Steel Herb Mortar |
| `manganese_steel_hinge_wrench` | Manganese Steel Hinge Wrench | Material field tools | 3 | 0.90 | Craft: Assemble Manganese Steel Hinge Wrench |
| `manganese_steel_joiner_mallet` | Manganese Steel Joiner Mallet | Material field tools | 3 | 1.38 | Craft: Assemble Manganese Steel Joiner Mallet |
| `manganese_steel_piercing_awl` | Manganese Steel Piercing Awl | Material field tools | 3 | 0.17 | Craft: Assemble Manganese Steel Piercing Awl |
| `manganese_steel_sheet_cutter` | Manganese Steel Sheet Cutter | Material field tools | 3 | 0.61 | Craft: Assemble Manganese Steel Sheet Cutter |
| `manganese_steel_tack_hammer` | Manganese Steel Tack Hammer | Material field tools | 3 | 0.52 | Craft: Assemble Manganese Steel Tack Hammer |
| `manganese_steel_wire_shear` | Manganese Steel Wire Shear | Material field tools | 3 | 0.50 | Craft: Assemble Manganese Steel Wire Shear |
| `file` | Metal file | tools | 0 | 0.20 | Loot: hardware, industrial |
| `mild_steel_cabinet_saw` | Mild Steel Cabinet Saw | Material field tools | 1 | 0.66 | Loot: garage, hardware, workshop |
| `mild_steel_camp_pot` | Mild Steel Camp Pot | Material field tools | 2 | 1.01 | Craft: Assemble Mild Steel Camp Pot |
| `mild_steel_chipping_pick` | Mild Steel Chipping Pick | Material field tools | 2 | 1.76 | Loot: garage, hardware, workshop |
| `mild_steel_claw_hammer` | Mild Steel Claw Hammer | Material field tools | 1 | 0.94 | Loot: garage, hardware, workshop |
| `mild_steel_demolition_hammer` | Mild Steel Demolition Hammer | Material field tools | 2 | 3.16 | Craft: Assemble Mild Steel Demolition Hammer |
| `mild_steel_field_file` | Mild Steel Field File | Material field tools | 1 | 0.31 | Craft: Assemble Mild Steel Field File |
| `mild_steel_flat_driver` | Mild Steel Flat Driver | Material field tools | 1 | 0.23 | Loot: garage, hardware, workshop |
| `mild_steel_grip_pliers` | Mild Steel Grip Pliers | Material field tools | 1 | 0.38 | Craft: Assemble Mild Steel Grip Pliers |
| `mild_steel_hand_borer` | Mild Steel Hand Borer | Material field tools | 2 | 0.85 | Craft: Assemble Mild Steel Hand Borer |
| `mild_steel_herb_mortar` | Mild Steel Herb Mortar | Material field tools | 2 | 0.71 | Craft: Assemble Mild Steel Herb Mortar |
| `mild_steel_hinge_wrench` | Mild Steel Hinge Wrench | Material field tools | 1 | 0.79 | Loot: garage, hardware, workshop |
| `mild_steel_joiner_mallet` | Mild Steel Joiner Mallet | Material field tools | 1 | 1.20 | Craft: Assemble Mild Steel Joiner Mallet |
| `mild_steel_piercing_awl` | Mild Steel Piercing Awl | Material field tools | 1 | 0.16 | Craft: Assemble Mild Steel Piercing Awl |
| `mild_steel_sheet_cutter` | Mild Steel Sheet Cutter | Material field tools | 1 | 0.53 | Craft: Assemble Mild Steel Sheet Cutter |
| `mild_steel_tack_hammer` | Mild Steel Tack Hammer | Material field tools | 1 | 0.46 | Craft: Assemble Mild Steel Tack Hammer |
| `mild_steel_wire_shear` | Mild Steel Wire Shear | Material field tools | 1 | 0.43 | Craft: Assemble Mild Steel Wire Shear |
| `mortar` | Mortar and pestle | tools | 0 | 0.60 | Loot: pharmacy |
| `nickel_alloy_cabinet_saw` | Nickel Alloy Cabinet Saw | Material field tools | 4 | 0.80 | Craft: Assemble Nickel Alloy Cabinet Saw |
| `nickel_alloy_camp_pot` | Nickel Alloy Camp Pot | Material field tools | 5 | 1.18 | Craft: Assemble Nickel Alloy Camp Pot |
| `nickel_alloy_chipping_pick` | Nickel Alloy Chipping Pick | Material field tools | 5 | 2.06 | Craft: Assemble Nickel Alloy Chipping Pick |
| `nickel_alloy_claw_hammer` | Nickel Alloy Claw Hammer | Material field tools | 4 | 1.10 | Craft: Assemble Nickel Alloy Claw Hammer |
| `nickel_alloy_demolition_hammer` | Nickel Alloy Demolition Hammer | Material field tools | 5 | 3.72 | Craft: Assemble Nickel Alloy Demolition Hammer |
| `nickel_alloy_field_file` | Nickel Alloy Field File | Material field tools | 4 | 0.37 | Craft: Assemble Nickel Alloy Field File |
| `nickel_alloy_flat_driver` | Nickel Alloy Flat Driver | Material field tools | 4 | 0.25 | Craft: Assemble Nickel Alloy Flat Driver |
| `nickel_alloy_grip_pliers` | Nickel Alloy Grip Pliers | Material field tools | 4 | 0.42 | Craft: Assemble Nickel Alloy Grip Pliers |
| `nickel_alloy_hand_borer` | Nickel Alloy Hand Borer | Material field tools | 5 | 1.01 | Craft: Assemble Nickel Alloy Hand Borer |
| `nickel_alloy_herb_mortar` | Nickel Alloy Herb Mortar | Material field tools | 5 | 0.82 | Craft: Assemble Nickel Alloy Herb Mortar |
| `nickel_alloy_hinge_wrench` | Nickel Alloy Hinge Wrench | Material field tools | 4 | 0.91 | Craft: Assemble Nickel Alloy Hinge Wrench |
| `nickel_alloy_joiner_mallet` | Nickel Alloy Joiner Mallet | Material field tools | 4 | 1.40 | Craft: Assemble Nickel Alloy Joiner Mallet |
| `nickel_alloy_piercing_awl` | Nickel Alloy Piercing Awl | Material field tools | 4 | 0.19 | Craft: Assemble Nickel Alloy Piercing Awl |
| `nickel_alloy_sheet_cutter` | Nickel Alloy Sheet Cutter | Material field tools | 4 | 0.64 | Craft: Assemble Nickel Alloy Sheet Cutter |
| `nickel_alloy_tack_hammer` | Nickel Alloy Tack Hammer | Material field tools | 4 | 0.54 | Craft: Assemble Nickel Alloy Tack Hammer |
| `nickel_alloy_wire_shear` | Nickel Alloy Wire Shear | Material field tools | 4 | 0.52 | Craft: Assemble Nickel Alloy Wire Shear |
| `nickel_steel_cabinet_saw` | Nickel Steel Cabinet Saw | Material field tools | 3 | 0.73 | Craft: Assemble Nickel Steel Cabinet Saw |
| `nickel_steel_camp_pot` | Nickel Steel Camp Pot | Material field tools | 4 | 1.08 | Craft: Assemble Nickel Steel Camp Pot |
| `nickel_steel_chipping_pick` | Nickel Steel Chipping Pick | Material field tools | 4 | 1.90 | Craft: Assemble Nickel Steel Chipping Pick |
| `nickel_steel_claw_hammer` | Nickel Steel Claw Hammer | Material field tools | 3 | 1.02 | Craft: Assemble Nickel Steel Claw Hammer |
| `nickel_steel_demolition_hammer` | Nickel Steel Demolition Hammer | Material field tools | 4 | 3.41 | Craft: Assemble Nickel Steel Demolition Hammer |
| `nickel_steel_field_file` | Nickel Steel Field File | Material field tools | 3 | 0.35 | Craft: Assemble Nickel Steel Field File |
| `nickel_steel_flat_driver` | Nickel Steel Flat Driver | Material field tools | 3 | 0.23 | Craft: Assemble Nickel Steel Flat Driver |
| `nickel_steel_grip_pliers` | Nickel Steel Grip Pliers | Material field tools | 3 | 0.40 | Craft: Assemble Nickel Steel Grip Pliers |
| `nickel_steel_hand_borer` | Nickel Steel Hand Borer | Material field tools | 4 | 0.93 | Craft: Assemble Nickel Steel Hand Borer |
| `nickel_steel_herb_mortar` | Nickel Steel Herb Mortar | Material field tools | 4 | 0.75 | Craft: Assemble Nickel Steel Herb Mortar |
| `nickel_steel_hinge_wrench` | Nickel Steel Hinge Wrench | Material field tools | 3 | 0.83 | Craft: Assemble Nickel Steel Hinge Wrench |
| `nickel_steel_joiner_mallet` | Nickel Steel Joiner Mallet | Material field tools | 3 | 1.29 | Craft: Assemble Nickel Steel Joiner Mallet |
| `nickel_steel_piercing_awl` | Nickel Steel Piercing Awl | Material field tools | 3 | 0.15 | Craft: Assemble Nickel Steel Piercing Awl |
| `nickel_steel_sheet_cutter` | Nickel Steel Sheet Cutter | Material field tools | 3 | 0.58 | Craft: Assemble Nickel Steel Sheet Cutter |
| `nickel_steel_tack_hammer` | Nickel Steel Tack Hammer | Material field tools | 3 | 0.51 | Craft: Assemble Nickel Steel Tack Hammer |
| `nickel_steel_wire_shear` | Nickel Steel Wire Shear | Material field tools | 3 | 0.48 | Craft: Assemble Nickel Steel Wire Shear |
| `pewter_cabinet_saw` | Pewter Cabinet Saw | Material field tools | 1 | 0.65 | Craft: Assemble Pewter Cabinet Saw |
| `pewter_camp_pot` | Pewter Camp Pot | Material field tools | 2 | 0.97 | Craft: Assemble Pewter Camp Pot |
| `pewter_chipping_pick` | Pewter Chipping Pick | Material field tools | 2 | 1.70 | Craft: Assemble Pewter Chipping Pick |
| `pewter_claw_hammer` | Pewter Claw Hammer | Material field tools | 1 | 0.91 | Craft: Assemble Pewter Claw Hammer |
| `pewter_demolition_hammer` | Pewter Demolition Hammer | Material field tools | 2 | 3.02 | Craft: Assemble Pewter Demolition Hammer |
| `pewter_field_file` | Pewter Field File | Material field tools | 1 | 0.30 | Craft: Assemble Pewter Field File |
| `pewter_flat_driver` | Pewter Flat Driver | Material field tools | 1 | 0.23 | Craft: Assemble Pewter Flat Driver |
| `pewter_grip_pliers` | Pewter Grip Pliers | Material field tools | 1 | 0.35 | Craft: Assemble Pewter Grip Pliers |
| `pewter_hand_borer` | Pewter Hand Borer | Material field tools | 2 | 0.83 | Craft: Assemble Pewter Hand Borer |
| `pewter_herb_mortar` | Pewter Herb Mortar | Material field tools | 2 | 0.68 | Craft: Assemble Pewter Herb Mortar |
| `pewter_hinge_wrench` | Pewter Hinge Wrench | Material field tools | 1 | 0.76 | Craft: Assemble Pewter Hinge Wrench |
| `pewter_joiner_mallet` | Pewter Joiner Mallet | Material field tools | 1 | 1.14 | Craft: Assemble Pewter Joiner Mallet |
| `pewter_piercing_awl` | Pewter Piercing Awl | Material field tools | 1 | 0.16 | Craft: Assemble Pewter Piercing Awl |
| `pewter_sheet_cutter` | Pewter Sheet Cutter | Material field tools | 1 | 0.51 | Craft: Assemble Pewter Sheet Cutter |
| `pewter_tack_hammer` | Pewter Tack Hammer | Material field tools | 1 | 0.43 | Craft: Assemble Pewter Tack Hammer |
| `pewter_wire_shear` | Pewter Wire Shear | Material field tools | 1 | 0.42 | Craft: Assemble Pewter Wire Shear |
| `pickaxe` | Pickaxe | tools | 0 | 2.80 | Loot: hardware |
| `pliers` | Pliers | tools | 0 | 0.25 | Loot: depot, garage, hardware, industrial, warehouse, workshop |
| `lighter` | Pocket lighter | tools | 0 | 0.05 | Loot: house, suburban, urban |
| `reloading_press` | Reloading press | tools | 0 | 2.80 | Loot: gunshop |
| `screwdriver` | Screwdriver | tools | 0 | 0.15 | Loot: depot, garage, hardware, industrial, radio, warehouse, workshop |
| `sewing_kit` | Sewing kit | tools | 0 | 0.12 | Loot: clothing, house, suburban, urban |
| `sharpening_stone` | Sharpening stone | tools | 0 | 0.30 | Loot: hardware |
| `spring_steel_cabinet_saw` | Spring Steel Cabinet Saw | Material field tools | 3 | 0.67 | Loot: garage, hardware, workshop |
| `spring_steel_camp_pot` | Spring Steel Camp Pot | Material field tools | 4 | 0.97 | Craft: Assemble Spring Steel Camp Pot |
| `spring_steel_chipping_pick` | Spring Steel Chipping Pick | Material field tools | 4 | 1.73 | Loot: garage, hardware, workshop |
| `spring_steel_claw_hammer` | Spring Steel Claw Hammer | Material field tools | 3 | 0.93 | Loot: garage, hardware, workshop |
| `spring_steel_demolition_hammer` | Spring Steel Demolition Hammer | Material field tools | 4 | 3.09 | Craft: Assemble Spring Steel Demolition Hammer |
| `spring_steel_field_file` | Spring Steel Field File | Material field tools | 3 | 0.30 | Craft: Assemble Spring Steel Field File |
| `spring_steel_flat_driver` | Spring Steel Flat Driver | Material field tools | 3 | 0.22 | Loot: garage, hardware, workshop |
| `spring_steel_grip_pliers` | Spring Steel Grip Pliers | Material field tools | 3 | 0.38 | Craft: Assemble Spring Steel Grip Pliers |
| `spring_steel_hand_borer` | Spring Steel Hand Borer | Material field tools | 4 | 0.84 | Craft: Assemble Spring Steel Hand Borer |
| `spring_steel_herb_mortar` | Spring Steel Herb Mortar | Material field tools | 4 | 0.68 | Craft: Assemble Spring Steel Herb Mortar |
| `spring_steel_hinge_wrench` | Spring Steel Hinge Wrench | Material field tools | 3 | 0.77 | Loot: garage, hardware, workshop |
| `spring_steel_joiner_mallet` | Spring Steel Joiner Mallet | Material field tools | 3 | 1.17 | Craft: Assemble Spring Steel Joiner Mallet |
| `spring_steel_piercing_awl` | Spring Steel Piercing Awl | Material field tools | 3 | 0.14 | Craft: Assemble Spring Steel Piercing Awl |
| `spring_steel_sheet_cutter` | Spring Steel Sheet Cutter | Material field tools | 3 | 0.54 | Craft: Assemble Spring Steel Sheet Cutter |
| `spring_steel_tack_hammer` | Spring Steel Tack Hammer | Material field tools | 3 | 0.45 | Craft: Assemble Spring Steel Tack Hammer |
| `spring_steel_wire_shear` | Spring Steel Wire Shear | Material field tools | 3 | 0.44 | Craft: Assemble Spring Steel Wire Shear |
| `stainless_steel_cabinet_saw` | Stainless Steel Cabinet Saw | Material field tools | 2 | 0.71 | Loot: garage, hardware, workshop |
| `stainless_steel_camp_pot` | Stainless Steel Camp Pot | Material field tools | 3 | 1.07 | Craft: Assemble Stainless Steel Camp Pot |
| `stainless_steel_chipping_pick` | Stainless Steel Chipping Pick | Material field tools | 3 | 1.86 | Loot: garage, hardware, workshop |
| `stainless_steel_claw_hammer` | Stainless Steel Claw Hammer | Material field tools | 2 | 0.99 | Loot: garage, hardware, workshop |
| `stainless_steel_demolition_hammer` | Stainless Steel Demolition Hammer | Material field tools | 3 | 3.33 | Craft: Assemble Stainless Steel Demolition Hammer |
| `stainless_steel_field_file` | Stainless Steel Field File | Material field tools | 2 | 0.33 | Craft: Assemble Stainless Steel Field File |
| `stainless_steel_flat_driver` | Stainless Steel Flat Driver | Material field tools | 2 | 0.23 | Loot: garage, hardware, workshop |
| `stainless_steel_grip_pliers` | Stainless Steel Grip Pliers | Material field tools | 2 | 0.38 | Craft: Assemble Stainless Steel Grip Pliers |
| `stainless_steel_hand_borer` | Stainless Steel Hand Borer | Material field tools | 3 | 0.92 | Craft: Assemble Stainless Steel Hand Borer |
| `stainless_steel_herb_mortar` | Stainless Steel Herb Mortar | Material field tools | 3 | 0.76 | Craft: Assemble Stainless Steel Herb Mortar |
| `stainless_steel_hinge_wrench` | Stainless Steel Hinge Wrench | Material field tools | 2 | 0.83 | Loot: garage, hardware, workshop |
| `stainless_steel_joiner_mallet` | Stainless Steel Joiner Mallet | Material field tools | 2 | 1.25 | Craft: Assemble Stainless Steel Joiner Mallet |
| `stainless_steel_piercing_awl` | Stainless Steel Piercing Awl | Material field tools | 2 | 0.16 | Craft: Assemble Stainless Steel Piercing Awl |
| `stainless_steel_sheet_cutter` | Stainless Steel Sheet Cutter | Material field tools | 2 | 0.58 | Craft: Assemble Stainless Steel Sheet Cutter |
| `stainless_steel_tack_hammer` | Stainless Steel Tack Hammer | Material field tools | 2 | 0.48 | Craft: Assemble Stainless Steel Tack Hammer |
| `stainless_steel_wire_shear` | Stainless Steel Wire Shear | Material field tools | 2 | 0.47 | Craft: Assemble Stainless Steel Wire Shear |
| `tin_snips` | Tin snips | tools | 0 | 0.45 | Loot: hardware, industrial |
| `titanium_cabinet_saw` | Titanium Cabinet Saw | Material field tools | 4 | 0.42 | Craft: Assemble Titanium Cabinet Saw |
| `titanium_camp_pot` | Titanium Camp Pot | Material field tools | 5 | 0.64 | Craft: Assemble Titanium Camp Pot |
| `titanium_chipping_pick` | Titanium Chipping Pick | Material field tools | 5 | 1.11 | Craft: Assemble Titanium Chipping Pick |
| `titanium_claw_hammer` | Titanium Claw Hammer | Material field tools | 4 | 0.60 | Craft: Assemble Titanium Claw Hammer |
| `titanium_demolition_hammer` | Titanium Demolition Hammer | Material field tools | 5 | 1.97 | Craft: Assemble Titanium Demolition Hammer |
| `titanium_field_file` | Titanium Field File | Material field tools | 4 | 0.21 | Craft: Assemble Titanium Field File |
| `titanium_flat_driver` | Titanium Flat Driver | Material field tools | 4 | 0.16 | Craft: Assemble Titanium Flat Driver |
| `titanium_grip_pliers` | Titanium Grip Pliers | Material field tools | 4 | 0.26 | Craft: Assemble Titanium Grip Pliers |
| `titanium_hand_borer` | Titanium Hand Borer | Material field tools | 5 | 0.54 | Craft: Assemble Titanium Hand Borer |
| `titanium_herb_mortar` | Titanium Herb Mortar | Material field tools | 5 | 0.45 | Craft: Assemble Titanium Herb Mortar |
| `titanium_hinge_wrench` | Titanium Hinge Wrench | Material field tools | 4 | 0.51 | Craft: Assemble Titanium Hinge Wrench |
| `titanium_joiner_mallet` | Titanium Joiner Mallet | Material field tools | 4 | 0.76 | Craft: Assemble Titanium Joiner Mallet |
| `titanium_piercing_awl` | Titanium Piercing Awl | Material field tools | 4 | 0.11 | Craft: Assemble Titanium Piercing Awl |
| `titanium_sheet_cutter` | Titanium Sheet Cutter | Material field tools | 4 | 0.34 | Craft: Assemble Titanium Sheet Cutter |
| `titanium_tack_hammer` | Titanium Tack Hammer | Material field tools | 4 | 0.30 | Craft: Assemble Titanium Tack Hammer |
| `titanium_wire_shear` | Titanium Wire Shear | Material field tools | 4 | 0.28 | Craft: Assemble Titanium Wire Shear |
| `tool_steel_cabinet_saw` | Tool Steel Cabinet Saw | Material field tools | 3 | 0.76 | Craft: Assemble Tool Steel Cabinet Saw |
| `tool_steel_camp_pot` | Tool Steel Camp Pot | Material field tools | 4 | 1.13 | Craft: Assemble Tool Steel Camp Pot |
| `tool_steel_chipping_pick` | Tool Steel Chipping Pick | Material field tools | 4 | 1.99 | Craft: Assemble Tool Steel Chipping Pick |
| `tool_steel_claw_hammer` | Tool Steel Claw Hammer | Material field tools | 3 | 1.07 | Craft: Assemble Tool Steel Claw Hammer |
| `tool_steel_demolition_hammer` | Tool Steel Demolition Hammer | Material field tools | 4 | 3.55 | Craft: Assemble Tool Steel Demolition Hammer |
| `tool_steel_field_file` | Tool Steel Field File | Material field tools | 3 | 0.35 | Craft: Assemble Tool Steel Field File |
| `tool_steel_flat_driver` | Tool Steel Flat Driver | Material field tools | 3 | 0.26 | Craft: Assemble Tool Steel Flat Driver |
| `tool_steel_grip_pliers` | Tool Steel Grip Pliers | Material field tools | 3 | 0.41 | Craft: Assemble Tool Steel Grip Pliers |
| `tool_steel_hand_borer` | Tool Steel Hand Borer | Material field tools | 4 | 0.97 | Craft: Assemble Tool Steel Hand Borer |
| `tool_steel_herb_mortar` | Tool Steel Herb Mortar | Material field tools | 4 | 0.79 | Craft: Assemble Tool Steel Herb Mortar |
| `tool_steel_hinge_wrench` | Tool Steel Hinge Wrench | Material field tools | 3 | 0.89 | Craft: Assemble Tool Steel Hinge Wrench |
| `tool_steel_joiner_mallet` | Tool Steel Joiner Mallet | Material field tools | 3 | 1.34 | Craft: Assemble Tool Steel Joiner Mallet |
| `tool_steel_piercing_awl` | Tool Steel Piercing Awl | Material field tools | 3 | 0.18 | Craft: Assemble Tool Steel Piercing Awl |
| `tool_steel_sheet_cutter` | Tool Steel Sheet Cutter | Material field tools | 3 | 0.60 | Craft: Assemble Tool Steel Sheet Cutter |
| `tool_steel_tack_hammer` | Tool Steel Tack Hammer | Material field tools | 3 | 0.51 | Craft: Assemble Tool Steel Tack Hammer |
| `tool_steel_wire_shear` | Tool Steel Wire Shear | Material field tools | 3 | 0.49 | Craft: Assemble Tool Steel Wire Shear |
| `wire_cutters` | Wire cutters | tools | 0 | 0.30 | Loot: depot, garage, hardware, industrial, warehouse, workshop |
| `wrought_iron_cabinet_saw` | Wrought Iron Cabinet Saw | Material field tools | 1 | 0.70 | Loot: garage, hardware, workshop |
| `wrought_iron_camp_pot` | Wrought Iron Camp Pot | Material field tools | 2 | 1.03 | Craft: Assemble Wrought Iron Camp Pot |
| `wrought_iron_chipping_pick` | Wrought Iron Chipping Pick | Material field tools | 2 | 1.79 | Loot: garage, hardware, workshop |
| `wrought_iron_claw_hammer` | Wrought Iron Claw Hammer | Material field tools | 1 | 0.95 | Loot: garage, hardware, workshop |
| `wrought_iron_demolition_hammer` | Wrought Iron Demolition Hammer | Material field tools | 2 | 3.22 | Craft: Assemble Wrought Iron Demolition Hammer |
| `wrought_iron_field_file` | Wrought Iron Field File | Material field tools | 1 | 0.32 | Craft: Assemble Wrought Iron Field File |
| `wrought_iron_flat_driver` | Wrought Iron Flat Driver | Material field tools | 1 | 0.22 | Loot: garage, hardware, workshop |
| `wrought_iron_grip_pliers` | Wrought Iron Grip Pliers | Material field tools | 1 | 0.37 | Craft: Assemble Wrought Iron Grip Pliers |
| `wrought_iron_hand_borer` | Wrought Iron Hand Borer | Material field tools | 2 | 0.88 | Craft: Assemble Wrought Iron Hand Borer |
| `wrought_iron_herb_mortar` | Wrought Iron Herb Mortar | Material field tools | 2 | 0.71 | Craft: Assemble Wrought Iron Herb Mortar |
| `wrought_iron_hinge_wrench` | Wrought Iron Hinge Wrench | Material field tools | 1 | 0.79 | Loot: garage, hardware, workshop |
| `wrought_iron_joiner_mallet` | Wrought Iron Joiner Mallet | Material field tools | 1 | 1.22 | Craft: Assemble Wrought Iron Joiner Mallet |
| `wrought_iron_piercing_awl` | Wrought Iron Piercing Awl | Material field tools | 1 | 0.17 | Craft: Assemble Wrought Iron Piercing Awl |
| `wrought_iron_sheet_cutter` | Wrought Iron Sheet Cutter | Material field tools | 1 | 0.56 | Craft: Assemble Wrought Iron Sheet Cutter |
| `wrought_iron_tack_hammer` | Wrought Iron Tack Hammer | Material field tools | 1 | 0.47 | Craft: Assemble Wrought Iron Tack Hammer |
| `wrought_iron_wire_shear` | Wrought Iron Wire Shear | Material field tools | 1 | 0.45 | Craft: Assemble Wrought Iron Wire Shear |
| `zinc_alloy_cabinet_saw` | Zinc Alloy Cabinet Saw | Material field tools | 1 | 0.59 | Craft: Assemble Zinc Alloy Cabinet Saw |
| `zinc_alloy_camp_pot` | Zinc Alloy Camp Pot | Material field tools | 2 | 0.86 | Craft: Assemble Zinc Alloy Camp Pot |
| `zinc_alloy_chipping_pick` | Zinc Alloy Chipping Pick | Material field tools | 2 | 1.52 | Craft: Assemble Zinc Alloy Chipping Pick |
| `zinc_alloy_claw_hammer` | Zinc Alloy Claw Hammer | Material field tools | 1 | 0.82 | Craft: Assemble Zinc Alloy Claw Hammer |
| `zinc_alloy_demolition_hammer` | Zinc Alloy Demolition Hammer | Material field tools | 2 | 2.72 | Craft: Assemble Zinc Alloy Demolition Hammer |
| `zinc_alloy_field_file` | Zinc Alloy Field File | Material field tools | 1 | 0.27 | Craft: Assemble Zinc Alloy Field File |
| `zinc_alloy_flat_driver` | Zinc Alloy Flat Driver | Material field tools | 1 | 0.20 | Craft: Assemble Zinc Alloy Flat Driver |
| `zinc_alloy_grip_pliers` | Zinc Alloy Grip Pliers | Material field tools | 1 | 0.34 | Craft: Assemble Zinc Alloy Grip Pliers |
| `zinc_alloy_hand_borer` | Zinc Alloy Hand Borer | Material field tools | 2 | 0.74 | Craft: Assemble Zinc Alloy Hand Borer |
| `zinc_alloy_herb_mortar` | Zinc Alloy Herb Mortar | Material field tools | 2 | 0.60 | Craft: Assemble Zinc Alloy Herb Mortar |
| `zinc_alloy_hinge_wrench` | Zinc Alloy Hinge Wrench | Material field tools | 1 | 0.68 | Craft: Assemble Zinc Alloy Hinge Wrench |
| `zinc_alloy_joiner_mallet` | Zinc Alloy Joiner Mallet | Material field tools | 1 | 1.03 | Craft: Assemble Zinc Alloy Joiner Mallet |
| `zinc_alloy_piercing_awl` | Zinc Alloy Piercing Awl | Material field tools | 1 | 0.12 | Craft: Assemble Zinc Alloy Piercing Awl |
| `zinc_alloy_sheet_cutter` | Zinc Alloy Sheet Cutter | Material field tools | 1 | 0.48 | Craft: Assemble Zinc Alloy Sheet Cutter |
| `zinc_alloy_tack_hammer` | Zinc Alloy Tack Hammer | Material field tools | 1 | 0.40 | Craft: Assemble Zinc Alloy Tack Hammer |
| `zinc_alloy_wire_shear` | Zinc Alloy Wire Shear | Material field tools | 1 | 0.39 | Craft: Assemble Zinc Alloy Wire Shear |

## Utility

| Stable ID | Item | Family | Tier | kg | Obtain |
| --- | --- | --- | ---: | ---: | --- |
| `anise_seed` | Anise Seed | Herbs and spices | 1 | 0.05 | Loot: grocery, house, market, pharmacy, restaurant |
| `binoculars` | Binoculars | utility | 0 | 0.65 | Loot: cabin, camp, forest, ranger, river |
| `candle` | Candle | utility | 0 | 0.10 | Loot: house, suburban, urban |
| `carrot_seeds` | Carrot seeds | utility | 0 | 0.02 | Loot: cabin, default, farm, grocery, house, market, restaurant, suburban, urban |
| `chamomile` | Chamomile | Herbs and spices | 0 | 0.07 | Loot: cabin, camp, farm, forest, ranger, river |
| `cinnamon_bark` | Cinnamon Bark | Herbs and spices | 1 | 0.05 | Loot: grocery, house, market, pharmacy, restaurant |
| `clove_bud` | Clove Bud | Herbs and spices | 1 | 0.06 | Loot: grocery, house, market, pharmacy, restaurant |
| `coffee_beans` | Coffee beans | utility | 0 | 0.15 | Loot: house, restaurant |
| `coriander_seed` | Coriander Seed | Herbs and spices | 1 | 0.06 | Loot: grocery, house, market, pharmacy, restaurant |
| `cumin_seed` | Cumin Seed | Herbs and spices | 1 | 0.06 | Loot: grocery, house, market, pharmacy, restaurant |
| `herbs` | Dried herbs | utility | 0 | 0.05 | Loot: cabin, camp, forest, ranger, river |
| `elderflower` | Elderflower | Herbs and spices | 0 | 0.06 | Loot: cabin, camp, farm, forest, ranger, river |
| `fennel_seed` | Fennel Seed | Herbs and spices | 0 | 0.04 | Loot: grocery, house, market, pharmacy, restaurant |
| `lantern` | Field lantern | utility | 0 | 0.45 | Loot: camp, ranger |
| `water_filter` | Field water filter | utility | 0 | 0.30 | Loot: cabin, camp, forest, ranger, river |
| `repair_kit` | General repair kit | utility | 0 | 0.60 | Loot: depot, fuel, garage, industrial, radio, warehouse, workshop |
| `ginger_piece` | Ginger Piece | Herbs and spices | 1 | 0.07 | Loot: grocery, house, market, pharmacy, restaurant |
| `hibiscus` | Hibiscus | Herbs and spices | 0 | 0.04 | Loot: cabin, camp, farm, forest, ranger, river |
| `juniper_tip` | Juniper Tip | Herbs and spices | 0 | 0.06 | Loot: cabin, camp, farm, forest, ranger, river |
| `lavender` | Lavender | Herbs and spices | 0 | 0.07 | Loot: cabin, camp, farm, forest, ranger, river |
| `lemon_balm` | Lemon Balm | Herbs and spices | 0 | 0.05 | Loot: cabin, camp, farm, forest, ranger, river |
| `licorice_root` | Licorice Root | Herbs and spices | 1 | 0.06 | Loot: grocery, house, market, pharmacy, restaurant |
| `marsh_mallow` | Marsh Mallow | Herbs and spices | 0 | 0.06 | Loot: cabin, camp, farm, forest, ranger, river |
| `meadow_mint` | Meadow Mint | Herbs and spices | 0 | 0.04 | Loot: cabin, camp, farm, forest, ranger, river |
| `whistle` | Metal whistle | utility | 0 | 0.02 | Loot: camp, ranger |
| `nettle_leaf` | Nettle Leaf | Herbs and spices | 0 | 0.04 | Loot: cabin, camp, farm, forest, ranger, river |
| `plantain_leaf` | Plantain Leaf | Herbs and spices | 0 | 0.06 | Loot: cabin, camp, farm, forest, ranger, river |
| `compass` | Pocket compass | utility | 0 | 0.09 | Loot: cabin, camp, forest, ranger, river |
| `raspberry_leaf` | Raspberry Leaf | Herbs and spices | 0 | 0.07 | Loot: cabin, camp, farm, forest, ranger, river |
| `rosehip` | Rosehip | Herbs and spices | 0 | 0.05 | Loot: cabin, camp, farm, forest, ranger, river |
| `rosemary` | Rosemary | Herbs and spices | 0 | 0.05 | Loot: cabin, camp, farm, forest, ranger, river |
| `sage` | Sage | Herbs and spices | 0 | 0.06 | Loot: cabin, camp, farm, forest, ranger, river |
| `flare` | Signal flare | utility | 0 | 0.20 | Loot: camp, ranger |
| `sleeping_bag` | Sleeping bag | utility | 0 | 1.50 | Loot: camp, forest, ranger |
| `tarp` | Tarpaulin | utility | 0 | 0.80 | Loot: cabin, camp, depot, forest, ranger, river, warehouse |
| `tea_leaves` | Tea leaves | utility | 0 | 0.08 | Loot: house, restaurant |
| `thyme` | Thyme | Herbs and spices | 0 | 0.06 | Loot: cabin, camp, farm, forest, ranger, river |
| `turmeric_piece` | Turmeric Piece | Herbs and spices | 1 | 0.04 | Loot: grocery, house, market, pharmacy, restaurant |
| `blanket` | Wool blanket | utility | 0 | 0.70 | Loot: clothing, default, house, suburban, urban |

Generated from `src/catalog.js` with `npm run catalogue`. The in-game reference reads the same frozen registry.
