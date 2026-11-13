// 正本: data/loot-tables.json。一致は tests/chest-loot.cjs で検証する。
const LOOT_TABLES = {
 "version": 1,
 "monsterGroups": {
  "rat": 1,
  "slime": 1,
  "skeleton": 1,
  "wolf": 1,
  "goblin": 1,
  "bat": 2,
  "spider": 2,
  "scout": 2,
  "sirakaba": 2,
  "apprentice": 2,
  "guardian": 2,
  "poisonslime": 2,
  "ghostknight": 2,
  "firefly": 2,
  "orc": 2,
  "takenoko": 2,
  "kinoko": 2,
  "dendenko": 2,
  "gas": 3,
  "bigspider": 3,
  "mage": 3,
  "bandit": 3,
  "ghoul": 3,
  "stone": 3,
  "general": 3,
  "acidslime": 3,
  "archer": 3,
  "blackwolf": 3,
  "shaman": 3,
  "venomspider": 4,
  "thief": 4,
  "dragon": 4,
  "rabbit": 4,
  "zombie": 4,
  "harpy": 4,
  "armorant": 4,
  "poisongiant": 4,
  "iron": 4,
  "terror": 4,
  "watcher": 4,
  "ogre": 4,
  "viper": 4,
  "darkpriest": 4,
  "insectivore": 4,
  "dynamotuboro": 4,
  "akumaikire": 4,
  "sorcerer": 5,
  "gargoyle": 5,
  "wight": 5,
  "werewolf": 5,
  "scorpion": 5,
  "blob": 5,
  "troll": 5,
  "ninja": 5,
  "highmage": 5,
  "salamander": 5,
  "fungus": 5,
  "vampbat": 5,
  "daidaraboti": 5,
  "minogate": 6,
  "wraith": 6,
  "darkelf": 6,
  "stonegiant": 6,
  "chimera": 6,
  "darkknight": 6,
  "hellhound": 6,
  "crawler": 6,
  "succubus": 6,
  "necromancer": 6,
  "gasdragon": 6,
  "minotaur": 6,
  "ninjachief": 6,
  "deathmage": 6,
  "fleshgolem": 7,
  "witch": 7,
  "assassin": 7,
  "evileye": 7,
  "vampire": 7,
  "lesserdemon": 7,
  "bluedragon": 7,
  "deathknight": 7,
  "hydra": 7,
  "fiendhound": 7,
  "ettin": 8,
  "greaterdemon": 8,
  "frostgiant": 8,
  "masterninja": 8,
  "vampirelord": 8,
  "reddragon": 8,
  "lich": 8,
  "chaosspawn": 8,
  "demongeneral": 8,
  "royalguard": 8,
  "fallenangel": 9,
  "reaper": 9,
  "chaosdragon": 9,
  "archmage": 9,
  "ancientdragon": 9,
  "kashadokuro": 10,
  "labyrinthlord": 10
 },
 "groups": {
  "1": {
   "slots": [
    {
     "chance": 0.1,
     "pool": "T1"
    },
    {
     "chance": 0,
     "pool": "T2"
    },
    {
     "chance": 0,
     "pool": "T3"
    }
   ]
  },
  "2": {
   "slots": [
    {
     "chance": 0.2,
     "pool": "T1"
    },
    {
     "chance": 0.1,
     "pool": "T2"
    },
    {
     "chance": 0,
     "pool": "T3"
    }
   ]
  },
  "3": {
   "slots": [
    {
     "chance": 0.3,
     "pool": "T2"
    },
    {
     "chance": 0.15,
     "pool": "T3"
    },
    {
     "chance": 0,
     "pool": "T4"
    }
   ]
  },
  "4": {
   "slots": [
    {
     "chance": 0.4,
     "pool": "T2"
    },
    {
     "chance": 0.2,
     "pool": "T3"
    },
    {
     "chance": 0,
     "pool": "T4"
    }
   ]
  },
  "5": {
   "slots": [
    {
     "chance": 0.5,
     "pool": "T3"
    },
    {
     "chance": 0.3,
     "pool": "T4"
    },
    {
     "chance": 0.1,
     "pool": "T5"
    }
   ]
  },
  "6": {
   "slots": [
    {
     "chance": 1,
     "pool": "T3"
    },
    {
     "chance": 0.5,
     "pool": "T4"
    },
    {
     "chance": 0.2,
     "pool": "T5"
    }
   ]
  },
  "7": {
   "slots": [
    {
     "chance": 0.75,
     "pool": "T4"
    },
    {
     "chance": 0.25,
     "pool": "T5"
    },
    {
     "chance": 0.1,
     "pool": "T5"
    }
   ]
  },
  "8": {
   "slots": [
    {
     "chance": 1,
     "pool": "T4"
    },
    {
     "chance": 0.5,
     "pool": "T5"
    },
    {
     "chance": 0.15,
     "pool": "T5"
    }
   ]
  },
  "9": {
   "slots": [
    {
     "chance": 0.7,
     "pool": "T5"
    },
    {
     "chance": 0.25,
     "pool": "T5"
    },
    {
     "chance": 0.05,
     "pool": "T5"
    }
   ]
  },
  "10": {
   "slots": [
    {
     "chance": 1,
     "pool": "T5"
    },
    {
     "chance": 0.5,
     "pool": "T5"
    },
    {
     "chance": 0.1,
     "pool": "T5"
    }
   ]
  }
 },
 "pools": {
  "T1": {
   "medicineShare": 0.05714285714285714,
   "rankWeights": {
    "1": 24,
    "2": 8
   },
   "medicineIds": [
    "healingPotion",
    "antidote"
   ]
  },
  "T2": {
   "medicineShare": 0.125,
   "rankWeights": {
    "1": 4,
    "2": 18,
    "3": 6
   },
   "medicineIds": [
    "healingPotion",
    "antidote",
    "paralysisCure",
    "greaterPotion"
   ]
  },
  "T3": {
   "medicineShare": 0.09302325581395349,
   "rankWeights": {
    "1": 8,
    "2": 12,
    "3": 19
   },
   "medicineIds": [
    "healingPotion",
    "antidote",
    "paralysisCure",
    "greaterPotion"
   ]
  },
  "T4": {
   "medicineShare": 0.2,
   "rankWeights": {
    "1": 8,
    "2": 1,
    "4": 11
   },
   "medicineIds": [
    "healingPotion",
    "antidote",
    "paralysisCure",
    "greaterPotion",
    "elixir"
   ]
  },
  "T5": {
   "medicineShare": 0.15384615384615385,
   "rankWeights": {
    "1": 8,
    "2": 1,
    "4": 11,
    "5": 2
   },
   "medicineIds": [
    "antidote",
    "paralysisCure",
    "greaterPotion",
    "elixir"
   ]
  }
 }
};

// Validate settings once at load time, keeping the draw path deterministic.
function validateLootTables(tables = LOOT_TABLES, equipment = WEAPONS, medicines = MEDICINES) {
 for (const [tier, pool] of Object.entries(tables.pools)) {
  if (!Number.isFinite(pool.medicineShare) || pool.medicineShare < 0 || pool.medicineShare >= 1)
   throw new Error(`Invalid medicineShare: ${tier}`);
  if (!Array.isArray(pool.medicineIds) || (pool.medicineShare > 0 && !pool.medicineIds.length))
   throw new Error(`Missing medicine candidates: ${tier}`);
  for (const id of pool.medicineIds) {
   if (!medicines.some(item => item.id === id && item.kind === 'medicine'))
    throw new Error(`Invalid medicine ID: ${tier}/${id}`);
  }
  for (const [rank, weight] of Object.entries(pool.rankWeights)) {
   if (!/^[1-5]$/.test(rank) || !Number.isInteger(weight) || weight < 0)
    throw new Error(`Invalid rank weight: ${tier}/${rank}`);
   if (weight > 0 && !equipment.some(item => item.lootRank === +rank))
    throw new Error(`Missing rank equipment: ${tier}/${rank}`);
  }
 }
}
validateLootTables();

// A/B/C are independent. Floor does not restrict medicine or equipment candidates.
function rollChestItems(monsterId, floor, rng = Math.random) {
 const group = Object.hasOwn(LOOT_TABLES.monsterGroups, monsterId) && LOOT_TABLES.monsterGroups[monsterId];
 if (!group) throw new Error(`Unknown chest monster ID: ${monsterId}`);
 const items = [];
 for (const slot of LOOT_TABLES.groups[group].slots) {
  if (rng() < slot.chance) {
   const pool = LOOT_TABLES.pools[slot.pool];
   const ranks = Object.entries(pool.rankWeights);
   const total = ranks.reduce((sum, [, weight]) => sum + weight, 0);
   if (!total && !pool.medicineShare) continue;
   if (rng() < pool.medicineShare) {
    items.push(pool.medicineIds[Math.floor(rng() * pool.medicineIds.length)]);
   } else if (total) {
    let roll = rng() * total;
    for (const [rank, weight] of ranks) {
     if (roll < weight) {
      const candidates = WEAPONS.filter(item => item.lootRank === +rank);
      items.push(candidates[Math.floor(rng() * candidates.length)].id);
      break;
     }
     roll -= weight;
    }
   }
  }
 }
 return items;
}
