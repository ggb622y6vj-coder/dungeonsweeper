// Generated from data/monsters.csv by scripts/compile-monsters.py.
const ENEMIES=[
  {
    "id": "slime",
    "name": "洞窟スライム",
    "unknown": "不定形",
    "floor": 1,
    "level": 2,
    "hp": [
      1,
      6,
      3
    ],
    "ac": 9,
    "hit": 1,
    "attack": [
      1,
      4,
      0
    ],
    "xp": 6.0,
    "groupSize": [
      1,
      2
    ],
    "gold": [
      1,
      4,
      2
    ],
    "race": "不定形",
    "swings": 1,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [
      {
        "type": "poison",
        "chance": 0.15
      }
    ],
    "resistance": "なし",
    "boss": false,
    "icon": "◉",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "skeleton",
    "name": "骸骨の衛兵",
    "unknown": "動く死体",
    "floor": 1,
    "level": 2,
    "hp": [
      2,
      6,
      4
    ],
    "ac": 7,
    "hit": 3,
    "attack": [
      1,
      6,
      1
    ],
    "xp": 12.0,
    "groupSize": [
      2,
      3
    ],
    "gold": [
      2,
      4,
      2
    ],
    "race": "不死",
    "swings": 1,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [],
    "resistance": "毒無効",
    "boss": false,
    "icon": "☠",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "wolf",
    "name": "灰狼",
    "unknown": "素早い牙",
    "floor": 1,
    "level": 2,
    "hp": [
      2,
      5,
      3
    ],
    "ac": 6,
    "hit": 4,
    "attack": [
      1,
      6,
      2
    ],
    "xp": 14.0,
    "groupSize": [
      2,
      3
    ],
    "gold": [
      2,
      5,
      2
    ],
    "race": "獣",
    "swings": 1,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [],
    "resistance": "なし",
    "boss": false,
    "icon": "♞",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "goblin",
    "name": "迷宮ゴブリン",
    "unknown": "小鬼",
    "floor": 1,
    "level": 2,
    "hp": [
      2,
      6,
      5
    ],
    "ac": 5,
    "hit": 4,
    "attack": [
      1,
      8,
      0
    ],
    "xp": 17.0,
    "groupSize": [
      2,
      3
    ],
    "gold": [
      2,
      6,
      2
    ],
    "race": "人型",
    "swings": 1,
    "rear": false,
    "flee": 0.4,
    "summon": 0.1,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [],
    "resistance": "なし",
    "boss": false,
    "icon": "♟",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "bat",
    "name": "洞窟蝙蝠",
    "unknown": "羽ばたく影",
    "floor": 1,
    "level": 3,
    "hp": [
      1,
      6,
      2
    ],
    "ac": 8,
    "hit": 2,
    "attack": [
      1,
      4,
      0
    ],
    "xp": 13.0,
    "groupSize": [
      1,
      2
    ],
    "gold": [
      1,
      6,
      2
    ],
    "race": "獣",
    "swings": 1,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [],
    "resistance": "なし",
    "boss": false,
    "icon": "♞",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "rat",
    "name": "大鼠",
    "unknown": "小さな獣",
    "floor": 1,
    "level": 3,
    "hp": [
      1,
      6,
      2
    ],
    "ac": 8,
    "hit": 2,
    "attack": [
      1,
      5,
      0
    ],
    "xp": 15.0,
    "groupSize": [
      2,
      4
    ],
    "gold": [
      1,
      6,
      2
    ],
    "race": "獣",
    "swings": 1,
    "rear": false,
    "flee": 0,
    "summon": 0.4,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [],
    "resistance": "なし",
    "boss": false,
    "icon": "♞",
    "summonCap": 6,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "spider",
    "name": "髑髏蜘蛛",
    "unknown": "うごめく虫",
    "floor": 1,
    "level": 3,
    "hp": [
      1,
      6,
      2
    ],
    "ac": 8,
    "hit": 2,
    "attack": [
      1,
      6,
      0
    ],
    "xp": 17.0,
    "groupSize": [
      1,
      2
    ],
    "gold": [
      1,
      6,
      2
    ],
    "race": "虫",
    "swings": 1,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [
      {
        "type": "poison",
        "chance": 0.15
      }
    ],
    "resistance": "なし",
    "boss": false,
    "icon": "✥",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "scout",
    "name": "盗賊の斥候",
    "unknown": "怪しい人影",
    "floor": 1,
    "level": 3,
    "hp": [
      1,
      6,
      2
    ],
    "ac": 8,
    "hit": 2,
    "attack": [
      1,
      6,
      0
    ],
    "xp": 19.0,
    "groupSize": [
      2,
      4
    ],
    "gold": [
      1,
      6,
      2
    ],
    "race": "人型",
    "swings": 1,
    "rear": false,
    "flee": 0.4,
    "summon": 0,
    "steal": 0.1,
    "drain": 0,
    "death": 0,
    "statuses": [],
    "resistance": "なし",
    "boss": false,
    "icon": "♟",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "apprentice",
    "name": "迷宮の詐欺師",
    "unknown": "杖を持つ人影",
    "floor": 1,
    "level": 4,
    "hp": [
      1,
      6,
      2
    ],
    "ac": 7,
    "hit": 3,
    "attack": [
      1,
      6,
      0
    ],
    "xp": 21.0,
    "groupSize": [
      1,
      2
    ],
    "gold": [
      1,
      6,
      2
    ],
    "race": "人型",
    "swings": 1,
    "rear": true,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [],
    "resistance": "なし",
    "boss": false,
    "icon": "♟",
    "summonCap": 4,
    "breath": null,
    "spell": 0.5,
    "spellInfo": {
      "id": "halito",
      "name": "ハリト",
      "target": "one",
      "dice": [
        1,
        8,
        0
      ],
      "effect": "damage"
    }
  },
  {
    "id": "guardian",
    "name": "迷宮の守護者",
    "unknown": "武装した人影",
    "floor": 1,
    "level": 4,
    "hp": [
      4,
      8,
      14
    ],
    "ac": 3,
    "hit": 6,
    "attack": [
      2,
      6,
      2
    ],
    "xp": 75.0,
    "groupSize": [
      1,
      1
    ],
    "gold": [
      4,
      10,
      20
    ],
    "race": "人型",
    "swings": 1,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [],
    "resistance": "なし",
    "boss": true,
    "icon": "♛",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "poisonslime",
    "name": "毒スライム",
    "unknown": "不定形",
    "floor": 2,
    "level": 4,
    "hp": [
      2,
      6,
      4
    ],
    "ac": 9,
    "hit": 2,
    "attack": [
      1,
      8,
      1
    ],
    "xp": 15.0,
    "groupSize": [
      1,
      2
    ],
    "gold": [
      2,
      6,
      4
    ],
    "race": "不定形",
    "swings": 1,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [
      {
        "type": "poison",
        "chance": 0.15
      }
    ],
    "resistance": "なし",
    "boss": false,
    "icon": "◉",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "ghostknight",
    "name": "亡霊騎士",
    "unknown": "動く死体",
    "floor": 2,
    "level": 4,
    "hp": [
      2,
      6,
      4
    ],
    "ac": 8,
    "hit": 2,
    "attack": [
      1,
      8,
      1
    ],
    "xp": 22.0,
    "groupSize": [
      3,
      4
    ],
    "gold": [
      2,
      6,
      4
    ],
    "race": "不死",
    "swings": 1,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [],
    "resistance": "毒無効",
    "boss": false,
    "icon": "☠",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "firefly",
    "name": "火蜻蛉",
    "unknown": "巨大な虫",
    "floor": 2,
    "level": 4,
    "hp": [
      2,
      6,
      0
    ],
    "ac": 8,
    "hit": 2,
    "attack": [
      1,
      8,
      0
    ],
    "xp": 24.0,
    "groupSize": [
      1,
      3
    ],
    "gold": [
      2,
      6,
      4
    ],
    "race": "虫",
    "swings": 1,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [],
    "resistance": "炎半減",
    "boss": false,
    "icon": "✥",
    "summonCap": 4,
    "breath": {
      "element": "炎",
      "dice": [
        2,
        6,
        0
      ],
      "chance": 0.6
    },
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "orc",
    "name": "オーク戦士",
    "unknown": "鬼",
    "floor": 2,
    "level": 4,
    "hp": [
      2,
      6,
      4
    ],
    "ac": 8,
    "hit": 2,
    "attack": [
      1,
      8,
      1
    ],
    "xp": 26.0,
    "groupSize": [
      1,
      2
    ],
    "gold": [
      2,
      6,
      4
    ],
    "race": "人型",
    "swings": 1,
    "rear": false,
    "flee": 0.2,
    "summon": 0.1,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [],
    "resistance": "なし",
    "boss": false,
    "icon": "♟",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "bigspider",
    "name": "武者蜘蛛",
    "unknown": "巨大な虫",
    "floor": 2,
    "level": 5,
    "hp": [
      2,
      10,
      0
    ],
    "ac": 7,
    "hit": 3,
    "attack": [
      1,
      8,
      1
    ],
    "xp": 28.0,
    "groupSize": [
      1,
      2
    ],
    "gold": [
      2,
      6,
      4
    ],
    "race": "虫",
    "swings": 1,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [],
    "resistance": "なし",
    "boss": false,
    "icon": "✥",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "mage",
    "name": "洞窟の魔術師",
    "unknown": "杖を持つ人影",
    "floor": 2,
    "level": 5,
    "hp": [
      2,
      6,
      4
    ],
    "ac": 7,
    "hit": 3,
    "attack": [
      1,
      8,
      1
    ],
    "xp": 30.0,
    "groupSize": [
      2,
      4
    ],
    "gold": [
      2,
      6,
      4
    ],
    "race": "人型",
    "swings": 1,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [],
    "resistance": "なし",
    "boss": false,
    "icon": "♟",
    "summonCap": 4,
    "breath": null,
    "spell": 0.5,
    "spellInfo": {
      "id": "halito",
      "name": "ハリト",
      "target": "one",
      "dice": [
        1,
        8,
        0
      ],
      "effect": "damage"
    }
  },
  {
    "id": "bandit",
    "name": "山賊の頭目",
    "unknown": "怪しい人影",
    "floor": 2,
    "level": 5,
    "hp": [
      2,
      6,
      4
    ],
    "ac": 7,
    "hit": 3,
    "attack": [
      1,
      8,
      1
    ],
    "xp": 32.0,
    "groupSize": [
      1,
      2
    ],
    "gold": [
      2,
      6,
      4
    ],
    "race": "人型",
    "swings": 1,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0.1,
    "drain": 0,
    "death": 0,
    "statuses": [
      {
        "type": "poison",
        "chance": 0.15
      }
    ],
    "resistance": "なし",
    "boss": false,
    "icon": "♟",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "ghoul",
    "name": "腐肉食い",
    "unknown": "動く死体",
    "floor": 2,
    "level": 5,
    "hp": [
      2,
      6,
      4
    ],
    "ac": 7,
    "hit": 3,
    "attack": [
      1,
      8,
      1
    ],
    "xp": 34.0,
    "groupSize": [
      2,
      4
    ],
    "gold": [
      2,
      6,
      4
    ],
    "race": "不死",
    "swings": 1,
    "rear": false,
    "flee": 0.1,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [
      {
        "type": "paralysis",
        "chance": 0.1
      }
    ],
    "resistance": "毒無効",
    "boss": false,
    "icon": "☠",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "stone",
    "name": "石の番人",
    "unknown": "震える石像",
    "floor": 2,
    "level": 6,
    "hp": [
      2,
      6,
      4
    ],
    "ac": 6,
    "hit": 4,
    "attack": [
      1,
      8,
      1
    ],
    "xp": 36.0,
    "groupSize": [
      1,
      2
    ],
    "gold": [
      2,
      6,
      4
    ],
    "race": "構造体",
    "swings": 1,
    "rear": true,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [],
    "resistance": "毒無効",
    "boss": false,
    "icon": "◆",
    "summonCap": 4,
    "breath": null,
    "spell": 0.5,
    "spellInfo": {
      "id": "halito",
      "name": "ハリト",
      "target": "one",
      "dice": [
        1,
        8,
        0
      ],
      "effect": "damage"
    }
  },
  {
    "id": "general",
    "name": "深層の魔将",
    "unknown": "武装した人影",
    "floor": 2,
    "level": 6,
    "hp": [
      3,
      8,
      5
    ],
    "ac": 6,
    "hit": 4,
    "attack": [
      3,
      7,
      0
    ],
    "xp": 75.0,
    "groupSize": [
      1,
      1
    ],
    "gold": [
      2,
      15,
      0
    ],
    "race": "悪魔",
    "swings": 2,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [
      {
        "type": "paralysis",
        "chance": 0.1
      }
    ],
    "resistance": "なし",
    "boss": true,
    "icon": "♛",
    "summonCap": 4,
    "breath": {
      "element": "炎",
      "dice": [
        2,
        8,
        0
      ],
      "chance": 0.6
    },
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "acidslime",
    "name": "硫化スライム",
    "unknown": "不定形",
    "floor": 3,
    "level": 6,
    "hp": [
      3,
      6,
      6
    ],
    "ac": 8,
    "hit": 3,
    "attack": [
      2,
      6,
      2
    ],
    "xp": 30.0,
    "groupSize": [
      1,
      2
    ],
    "gold": [
      3,
      6,
      6
    ],
    "race": "不定形",
    "swings": 1,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [
      {
        "type": "poison",
        "chance": 0.15
      },
      {
        "type": "paralysis",
        "chance": 0.1
      }
    ],
    "resistance": "なし",
    "boss": false,
    "icon": "◉",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "archer",
    "name": "骸骨の射手",
    "unknown": "動く死体",
    "floor": 3,
    "level": 6,
    "hp": [
      3,
      6,
      6
    ],
    "ac": 7,
    "hit": 3,
    "attack": [
      2,
      6,
      2
    ],
    "xp": 47.0,
    "groupSize": [
      2,
      3
    ],
    "gold": [
      3,
      6,
      6
    ],
    "race": "不死",
    "swings": 1,
    "rear": true,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [],
    "resistance": "毒無効",
    "boss": false,
    "icon": "☠",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "blackwolf",
    "name": "黒牙狼",
    "unknown": "素早い牙",
    "floor": 3,
    "level": 6,
    "hp": [
      3,
      6,
      6
    ],
    "ac": 7,
    "hit": 3,
    "attack": [
      2,
      8,
      2
    ],
    "xp": 49.0,
    "groupSize": [
      2,
      4
    ],
    "gold": [
      3,
      6,
      6
    ],
    "race": "魔獣",
    "swings": 1,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [],
    "resistance": "なし",
    "boss": false,
    "icon": "♞",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "shaman",
    "name": "オーク呪術師",
    "unknown": "鬼",
    "floor": 3,
    "level": 6,
    "hp": [
      3,
      6,
      0
    ],
    "ac": 7,
    "hit": 3,
    "attack": [
      2,
      6,
      2
    ],
    "xp": 51.0,
    "groupSize": [
      1,
      4
    ],
    "gold": [
      3,
      6,
      6
    ],
    "race": "人型",
    "swings": 1,
    "rear": false,
    "flee": 0.1,
    "summon": 0.1,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [],
    "resistance": "なし",
    "boss": false,
    "icon": "♟",
    "summonCap": 4,
    "breath": null,
    "spell": 0.5,
    "spellInfo": {
      "id": "halito",
      "name": "ハリト",
      "target": "one",
      "dice": [
        1,
        8,
        0
      ],
      "effect": "damage"
    }
  },
  {
    "id": "venomspider",
    "name": "髑髏武者蜘蛛",
    "unknown": "おぞましい虫",
    "floor": 3,
    "level": 7,
    "hp": [
      3,
      8,
      0
    ],
    "ac": 6,
    "hit": 4,
    "attack": [
      3,
      7,
      0
    ],
    "xp": 53.0,
    "groupSize": [
      2,
      4
    ],
    "gold": [
      3,
      6,
      6
    ],
    "race": "虫",
    "swings": 1,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [],
    "resistance": "なし",
    "boss": false,
    "icon": "✥",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "thief",
    "name": "影の盗人",
    "unknown": "怪しい人影",
    "floor": 3,
    "level": 7,
    "hp": [
      3,
      5,
      0
    ],
    "ac": 6,
    "hit": 4,
    "attack": [
      2,
      6,
      2
    ],
    "xp": 55.0,
    "groupSize": [
      2,
      4
    ],
    "gold": [
      3,
      6,
      6
    ],
    "race": "人型",
    "swings": 1,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0.1,
    "drain": 0,
    "death": 0,
    "statuses": [],
    "resistance": "なし",
    "boss": false,
    "icon": "♟",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "dragon",
    "name": "炎竜",
    "unknown": "竜",
    "floor": 3,
    "level": 7,
    "hp": [
      3,
      6,
      0
    ],
    "ac": 6,
    "hit": 4,
    "attack": [
      3,
      8,
      0
    ],
    "xp": 57.0,
    "groupSize": [
      1,
      2
    ],
    "gold": [
      3,
      6,
      6
    ],
    "race": "竜",
    "swings": 1,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [
      {
        "type": "poison",
        "chance": 0.15
      }
    ],
    "resistance": "炎半減",
    "boss": false,
    "icon": "♜",
    "summonCap": 4,
    "breath": {
      "element": "炎",
      "dice": [
        2,
        8,
        0
      ],
      "chance": 0.5
    },
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "rabbit",
    "name": "赤兎",
    "unknown": "獣",
    "floor": 3,
    "level": 7,
    "hp": [
      3,
      4,
      0
    ],
    "ac": 6,
    "hit": 4,
    "attack": [
      3,
      5,
      0
    ],
    "xp": 59.0,
    "groupSize": [
      2,
      4
    ],
    "gold": [
      3,
      6,
      6
    ],
    "race": "獣",
    "swings": 1,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0.03,
    "statuses": [],
    "resistance": "なし",
    "boss": false,
    "icon": "♞",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "iron",
    "name": "鉄の番人",
    "unknown": "不気味な立像",
    "floor": 3,
    "level": 8,
    "hp": [
      3,
      10,
      0
    ],
    "ac": 6,
    "hit": 5,
    "attack": [
      3,
      7,
      0
    ],
    "xp": 61.0,
    "groupSize": [
      1,
      2
    ],
    "gold": [
      3,
      6,
      6
    ],
    "race": "構造体",
    "swings": 1,
    "rear": true,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [
      {
        "type": "paralysis",
        "chance": 0.1
      }
    ],
    "resistance": "毒無効",
    "boss": false,
    "icon": "◆",
    "summonCap": 4,
    "breath": null,
    "spell": 0.6,
    "spellInfo": {
      "id": "halito",
      "name": "ハリト",
      "target": "one",
      "dice": [
        1,
        8,
        0
      ],
      "effect": "damage"
    }
  },
  {
    "id": "terror",
    "name": "テラー",
    "unknown": "幽霊",
    "floor": 3,
    "level": 8,
    "hp": [
      3,
      10,
      0
    ],
    "ac": 6,
    "hit": 4,
    "attack": [
      3,
      6,
      0
    ],
    "xp": 50.0,
    "groupSize": [
      1,
      1
    ],
    "gold": [
      3,
      10,
      0
    ],
    "race": "不死",
    "swings": 1,
    "rear": true,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0.1,
    "death": 0,
    "statuses": [],
    "resistance": "なし",
    "boss": false,
    "icon": "☠",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "watcher",
    "name": "奈落の監視者",
    "unknown": "武装した人影",
    "floor": 3,
    "level": 8,
    "hp": [
      4,
      6,
      9
    ],
    "ac": 5,
    "hit": 5,
    "attack": [
      3,
      6,
      2
    ],
    "xp": 83.0,
    "groupSize": [
      1,
      1
    ],
    "gold": [
      3,
      10,
      0
    ],
    "race": "悪魔",
    "swings": 2,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [
      {
        "type": "poison",
        "chance": 0.15
      }
    ],
    "resistance": "なし",
    "boss": true,
    "icon": "♛",
    "summonCap": 4,
    "breath": {
      "element": "氷",
      "dice": [
        2,
        8,
        0
      ],
      "chance": 0.6
    },
    "spell": 0.1,
    "spellInfo": {
      "id": "halito",
      "name": "ハリト",
      "target": "one",
      "dice": [
        1,
        8,
        0
      ],
      "effect": "damage"
    }
  },
  {
    "id": "ogre",
    "name": "オーガ",
    "unknown": "大きな鬼",
    "floor": 4,
    "level": 8,
    "hp": [
      4,
      8,
      8
    ],
    "ac": 5,
    "hit": 5,
    "attack": [
      2,
      8,
      2
    ],
    "xp": 70.0,
    "groupSize": [
      1,
      2
    ],
    "gold": [
      4,
      6,
      8
    ],
    "race": "人型",
    "swings": 1,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [],
    "resistance": "なし",
    "boss": false,
    "icon": "♟",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "zombie",
    "name": "ゾンビ",
    "unknown": "動く死体",
    "floor": 4,
    "level": 7,
    "hp": [
      4,
      6,
      6
    ],
    "ac": 7,
    "hit": 4,
    "attack": [
      2,
      6,
      2
    ],
    "xp": 55.0,
    "groupSize": [
      2,
      5
    ],
    "gold": [
      3,
      6,
      6
    ],
    "race": "不死",
    "swings": 1,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [
      {
        "type": "paralysis",
        "chance": 0.1
      }
    ],
    "resistance": "毒無効",
    "boss": false,
    "icon": "☠",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "harpy",
    "name": "ハーピー",
    "unknown": "翼ある影",
    "floor": 4,
    "level": 7,
    "hp": [
      3,
      8,
      4
    ],
    "ac": 5,
    "hit": 5,
    "attack": [
      1,
      8,
      2
    ],
    "xp": 60.0,
    "groupSize": [
      2,
      4
    ],
    "gold": [
      3,
      6,
      6
    ],
    "race": "魔獣",
    "swings": 2,
    "rear": true,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [],
    "resistance": "なし",
    "boss": false,
    "icon": "♞",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "viper",
    "name": "大毒蛇",
    "unknown": "大きな蛇",
    "floor": 4,
    "level": 8,
    "hp": [
      4,
      6,
      6
    ],
    "ac": 6,
    "hit": 5,
    "attack": [
      2,
      6,
      0
    ],
    "xp": 65.0,
    "groupSize": [
      1,
      3
    ],
    "gold": [
      3,
      6,
      6
    ],
    "race": "獣",
    "swings": 1,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [
      {
        "type": "poison",
        "chance": 0.25
      }
    ],
    "resistance": "なし",
    "boss": false,
    "icon": "♞",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "armorant",
    "name": "鎧蟻",
    "unknown": "巨大な虫",
    "floor": 4,
    "level": 7,
    "hp": [
      3,
      10,
      0
    ],
    "ac": 3,
    "hit": 4,
    "attack": [
      2,
      6,
      0
    ],
    "xp": 60.0,
    "groupSize": [
      2,
      5
    ],
    "gold": [
      3,
      6,
      6
    ],
    "race": "虫",
    "swings": 1,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [],
    "resistance": "なし",
    "boss": false,
    "icon": "✥",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "darkpriest",
    "name": "闇の司祭",
    "unknown": "ローブの人影",
    "floor": 4,
    "level": 8,
    "hp": [
      3,
      8,
      2
    ],
    "ac": 6,
    "hit": 3,
    "attack": [
      1,
      8,
      0
    ],
    "xp": 75.0,
    "groupSize": [
      1,
      3
    ],
    "gold": [
      4,
      6,
      8
    ],
    "race": "人型",
    "swings": 1,
    "rear": true,
    "flee": 0,
    "summon": 0.1,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [],
    "resistance": "なし",
    "boss": false,
    "icon": "♟",
    "summonCap": 4,
    "breath": null,
    "spell": 0.3,
    "spellInfo": {
      "id": "montino",
      "name": "モンティノ",
      "target": "all",
      "dice": null,
      "effect": "silence"
    }
  },
  {
    "id": "sorcerer",
    "name": "迷宮の妖術師",
    "unknown": "杖を持つ人影",
    "floor": 4,
    "level": 9,
    "hp": [
      3,
      8,
      0
    ],
    "ac": 6,
    "hit": 3,
    "attack": [
      1,
      6,
      0
    ],
    "xp": 85.0,
    "groupSize": [
      1,
      2
    ],
    "gold": [
      4,
      6,
      8
    ],
    "race": "人型",
    "swings": 1,
    "rear": true,
    "flee": 0.1,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [],
    "resistance": "なし",
    "boss": false,
    "icon": "♟",
    "summonCap": 4,
    "breath": null,
    "spell": 0.25,
    "spellInfo": {
      "id": "mahalito",
      "name": "マハリト",
      "target": "all",
      "dice": [
        4,
        6,
        0
      ],
      "effect": "damage"
    }
  },
  {
    "id": "gargoyle",
    "name": "ガーゴイル",
    "unknown": "翼ある石像",
    "floor": 4,
    "level": 9,
    "hp": [
      4,
      8,
      6
    ],
    "ac": 4,
    "hit": 6,
    "attack": [
      1,
      8,
      2
    ],
    "xp": 85.0,
    "groupSize": [
      1,
      3
    ],
    "gold": [
      4,
      6,
      8
    ],
    "race": "構造体",
    "swings": 2,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [
      {
        "type": "stone",
        "chance": 0.05
      }
    ],
    "resistance": "毒無効",
    "boss": false,
    "icon": "◆",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "minogate",
    "name": "牛頭の門番",
    "unknown": "巨大な人影",
    "floor": 4,
    "level": 11,
    "hp": [
      10,
      8,
      20
    ],
    "ac": 3,
    "hit": 8,
    "attack": [
      3,
      8,
      4
    ],
    "xp": 400.0,
    "groupSize": [
      1,
      1
    ],
    "gold": [
      6,
      10,
      30
    ],
    "race": "人型",
    "swings": 2,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [],
    "resistance": "なし",
    "boss": true,
    "icon": "♛",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "wight",
    "name": "墓所の亡者",
    "unknown": "動く死体",
    "floor": 5,
    "level": 9,
    "hp": [
      4,
      8,
      6
    ],
    "ac": 5,
    "hit": 6,
    "attack": [
      1,
      8,
      2
    ],
    "xp": 110.0,
    "groupSize": [
      1,
      3
    ],
    "gold": [
      4,
      8,
      10
    ],
    "race": "不死",
    "swings": 1,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0.08,
    "death": 0,
    "statuses": [],
    "resistance": "毒無効",
    "boss": false,
    "icon": "☠",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "troll",
    "name": "トロル",
    "unknown": "醜い大男",
    "floor": 5,
    "level": 10,
    "hp": [
      6,
      8,
      10
    ],
    "ac": 5,
    "hit": 6,
    "attack": [
      2,
      8,
      3
    ],
    "xp": 120.0,
    "groupSize": [
      1,
      2
    ],
    "gold": [
      4,
      8,
      10
    ],
    "race": "人型",
    "swings": 1,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [],
    "resistance": "なし",
    "boss": false,
    "icon": "♟",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "werewolf",
    "name": "人狼",
    "unknown": "素早い牙",
    "floor": 5,
    "level": 9,
    "hp": [
      4,
      8,
      8
    ],
    "ac": 4,
    "hit": 7,
    "attack": [
      1,
      10,
      3
    ],
    "xp": 115.0,
    "groupSize": [
      2,
      4
    ],
    "gold": [
      4,
      8,
      10
    ],
    "race": "魔獣",
    "swings": 2,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [],
    "resistance": "なし",
    "boss": false,
    "icon": "♞",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "scorpion",
    "name": "大蠍",
    "unknown": "巨大な甲虫",
    "floor": 5,
    "level": 9,
    "hp": [
      4,
      8,
      4
    ],
    "ac": 3,
    "hit": 6,
    "attack": [
      2,
      6,
      2
    ],
    "xp": 105.0,
    "groupSize": [
      1,
      3
    ],
    "gold": [
      4,
      8,
      10
    ],
    "race": "虫",
    "swings": 1,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [
      {
        "type": "poison",
        "chance": 0.15
      },
      {
        "type": "paralysis",
        "chance": 0.15
      }
    ],
    "resistance": "なし",
    "boss": false,
    "icon": "✥",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "ninja",
    "name": "忍びの者",
    "unknown": "怪しい人影",
    "floor": 5,
    "level": 10,
    "hp": [
      3,
      10,
      5
    ],
    "ac": 2,
    "hit": 8,
    "attack": [
      1,
      8,
      2
    ],
    "xp": 130.0,
    "groupSize": [
      2,
      4
    ],
    "gold": [
      4,
      8,
      10
    ],
    "race": "人型",
    "swings": 2,
    "rear": false,
    "flee": 0.1,
    "summon": 0,
    "steal": 0.1,
    "drain": 0,
    "death": 0.04,
    "statuses": [],
    "resistance": "なし",
    "boss": false,
    "icon": "♟",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "highmage",
    "name": "高位の魔術師",
    "unknown": "杖を持つ人影",
    "floor": 5,
    "level": 10,
    "hp": [
      3,
      8,
      4
    ],
    "ac": 5,
    "hit": 4,
    "attack": [
      1,
      6,
      0
    ],
    "xp": 125.0,
    "groupSize": [
      1,
      2
    ],
    "gold": [
      4,
      8,
      10
    ],
    "race": "人型",
    "swings": 1,
    "rear": true,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [],
    "resistance": "なし",
    "boss": false,
    "icon": "♟",
    "summonCap": 4,
    "breath": null,
    "spell": 0.25,
    "spellInfo": {
      "id": "mahalito",
      "name": "マハリト",
      "target": "all",
      "dice": [
        4,
        6,
        0
      ],
      "effect": "damage"
    }
  },
  {
    "id": "salamander",
    "name": "火蜥蜴",
    "unknown": "赤い鱗",
    "floor": 5,
    "level": 10,
    "hp": [
      5,
      8,
      0
    ],
    "ac": 4,
    "hit": 6,
    "attack": [
      2,
      6,
      0
    ],
    "xp": 130.0,
    "groupSize": [
      1,
      2
    ],
    "gold": [
      4,
      8,
      10
    ],
    "race": "竜",
    "swings": 1,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [],
    "resistance": "炎半減",
    "boss": false,
    "icon": "♜",
    "summonCap": 4,
    "breath": {
      "element": "炎",
      "dice": [
        3,
        8,
        0
      ],
      "chance": 0.25
    },
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "blob",
    "name": "ブロブ",
    "unknown": "泡立つ膜",
    "floor": 5,
    "level": 9,
    "hp": [
      8,
      8,
      0
    ],
    "ac": 9,
    "hit": 4,
    "attack": [
      3,
      6,
      0
    ],
    "xp": 90.0,
    "groupSize": [
      1,
      2
    ],
    "gold": [
      4,
      8,
      10
    ],
    "race": "不定形",
    "swings": 1,
    "rear": false,
    "flee": 0,
    "summon": 0.15,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [
      {
        "type": "poison",
        "chance": 0.2
      }
    ],
    "resistance": "なし",
    "boss": false,
    "icon": "◉",
    "summonCap": 3,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "necromancer",
    "name": "屍術師",
    "unknown": "ローブの人影",
    "floor": 5,
    "level": 13,
    "hp": [
      8,
      8,
      20
    ],
    "ac": 2,
    "hit": 8,
    "attack": [
      2,
      8,
      0
    ],
    "xp": 600.0,
    "groupSize": [
      1,
      1
    ],
    "gold": [
      8,
      10,
      40
    ],
    "race": "人型",
    "swings": 1,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0.05,
    "death": 0,
    "statuses": [],
    "resistance": "なし",
    "boss": true,
    "icon": "♛",
    "summonCap": 4,
    "breath": null,
    "spell": 0.35,
    "spellInfo": {
      "id": "mahalito",
      "name": "マハリト",
      "target": "all",
      "dice": [
        4,
        6,
        0
      ],
      "effect": "damage"
    }
  },
  {
    "id": "wraith",
    "name": "亡霊",
    "unknown": "幽霊",
    "floor": 6,
    "level": 11,
    "hp": [
      5,
      8,
      0
    ],
    "ac": 3,
    "hit": 7,
    "attack": [
      1,
      10,
      0
    ],
    "xp": 170.0,
    "groupSize": [
      1,
      3
    ],
    "gold": [
      5,
      8,
      12
    ],
    "race": "不死",
    "swings": 1,
    "rear": true,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0.1,
    "death": 0,
    "statuses": [
      {
        "type": "fear",
        "chance": 0.15
      }
    ],
    "resistance": "毒無効",
    "boss": false,
    "icon": "☠",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "stonegiant",
    "name": "石巨人",
    "unknown": "巨大な石像",
    "floor": 6,
    "level": 12,
    "hp": [
      8,
      8,
      10
    ],
    "ac": 2,
    "hit": 8,
    "attack": [
      3,
      8,
      3
    ],
    "xp": 200.0,
    "groupSize": [
      1,
      2
    ],
    "gold": [
      5,
      8,
      12
    ],
    "race": "構造体",
    "swings": 1,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [
      {
        "type": "stone",
        "chance": 0.08
      }
    ],
    "resistance": "毒無効",
    "boss": false,
    "icon": "◆",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "chimera",
    "name": "キメラ",
    "unknown": "異形の獣",
    "floor": 6,
    "level": 12,
    "hp": [
      6,
      8,
      6
    ],
    "ac": 3,
    "hit": 7,
    "attack": [
      2,
      8,
      0
    ],
    "xp": 210.0,
    "groupSize": [
      1,
      2
    ],
    "gold": [
      5,
      8,
      12
    ],
    "race": "魔獣",
    "swings": 2,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [],
    "resistance": "炎半減",
    "boss": false,
    "icon": "♞",
    "summonCap": 4,
    "breath": {
      "element": "炎",
      "dice": [
        3,
        8,
        0
      ],
      "chance": 0.2
    },
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "darkknight",
    "name": "闇の騎士",
    "unknown": "武装した人影",
    "floor": 6,
    "level": 12,
    "hp": [
      6,
      8,
      12
    ],
    "ac": 0,
    "hit": 9,
    "attack": [
      2,
      8,
      4
    ],
    "xp": 220.0,
    "groupSize": [
      1,
      2
    ],
    "gold": [
      5,
      8,
      12
    ],
    "race": "人型",
    "swings": 2,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [],
    "resistance": "なし",
    "boss": false,
    "icon": "♟",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "fungus",
    "name": "毒茸の群れ",
    "unknown": "動く茸",
    "floor": 6,
    "level": 10,
    "hp": [
      5,
      8,
      0
    ],
    "ac": 8,
    "hit": 5,
    "attack": [
      2,
      6,
      0
    ],
    "xp": 150.0,
    "groupSize": [
      2,
      4
    ],
    "gold": [
      5,
      8,
      12
    ],
    "race": "不定形",
    "swings": 1,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [
      {
        "type": "poison",
        "chance": 0.3
      },
      {
        "type": "paralysis",
        "chance": 0.1
      }
    ],
    "resistance": "毒無効",
    "boss": false,
    "icon": "◉",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "darkelf",
    "name": "ダークエルフ",
    "unknown": "邪悪な妖精",
    "floor": 6,
    "level": 11,
    "hp": [
      4,
      8,
      0
    ],
    "ac": 3,
    "hit": 6,
    "attack": [
      1,
      8,
      0
    ],
    "xp": 190.0,
    "groupSize": [
      1,
      2
    ],
    "gold": [
      5,
      8,
      12
    ],
    "race": "人型",
    "swings": 1,
    "rear": true,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [],
    "resistance": "なし",
    "boss": false,
    "icon": "♟",
    "summonCap": 4,
    "breath": null,
    "spell": 0.25,
    "spellInfo": {
      "id": "mahalito",
      "name": "マハリト",
      "target": "all",
      "dice": [
        4,
        6,
        0
      ],
      "effect": "damage"
    }
  },
  {
    "id": "vampbat",
    "name": "吸血蝙蝠",
    "unknown": "羽ばたく影",
    "floor": 6,
    "level": 10,
    "hp": [
      3,
      10,
      0
    ],
    "ac": 3,
    "hit": 8,
    "attack": [
      1,
      6,
      2
    ],
    "xp": 140.0,
    "groupSize": [
      2,
      4
    ],
    "gold": [
      5,
      8,
      12
    ],
    "race": "獣",
    "swings": 2,
    "rear": true,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [
      {
        "type": "poison",
        "chance": 0.1
      }
    ],
    "resistance": "なし",
    "boss": false,
    "icon": "♞",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "vampire",
    "name": "吸血鬼",
    "unknown": "黒い死体",
    "floor": 6,
    "level": 15,
    "hp": [
      10,
      8,
      30
    ],
    "ac": 0,
    "hit": 10,
    "attack": [
      2,
      8,
      4
    ],
    "xp": 900.0,
    "groupSize": [
      1,
      1
    ],
    "gold": [
      10,
      10,
      60
    ],
    "race": "不死",
    "swings": 2,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0.2,
    "death": 0,
    "statuses": [],
    "resistance": "毒無効",
    "boss": true,
    "icon": "♛",
    "summonCap": 4,
    "breath": null,
    "spell": 0.2,
    "spellInfo": {
      "id": "mahalito",
      "name": "マハリト",
      "target": "all",
      "dice": [
        4,
        6,
        0
      ],
      "effect": "damage"
    }
  },
  {
    "id": "gasdragon",
    "name": "毒竜",
    "unknown": "竜",
    "floor": 7,
    "level": 13,
    "hp": [
      8,
      8,
      0
    ],
    "ac": 2,
    "hit": 8,
    "attack": [
      2,
      8,
      0
    ],
    "xp": 320.0,
    "groupSize": [
      1,
      2
    ],
    "gold": [
      6,
      8,
      15
    ],
    "race": "竜",
    "swings": 1,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [],
    "resistance": "毒無効",
    "boss": false,
    "icon": "♜",
    "summonCap": 4,
    "breath": {
      "element": "毒",
      "dice": [
        4,
        8,
        0
      ],
      "chance": 0.3
    },
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "minotaur",
    "name": "牛頭の戦士",
    "unknown": "巨大な人影",
    "floor": 7,
    "level": 13,
    "hp": [
      8,
      8,
      16
    ],
    "ac": 2,
    "hit": 10,
    "attack": [
      3,
      8,
      4
    ],
    "xp": 330.0,
    "groupSize": [
      1,
      2
    ],
    "gold": [
      6,
      8,
      15
    ],
    "race": "人型",
    "swings": 2,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [],
    "resistance": "なし",
    "boss": false,
    "icon": "♟",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "fleshgolem",
    "name": "肉の巨像",
    "unknown": "蠢く石像",
    "floor": 7,
    "level": 14,
    "hp": [
      10,
      8,
      20
    ],
    "ac": 4,
    "hit": 9,
    "attack": [
      3,
      10,
      0
    ],
    "xp": 340.0,
    "groupSize": [
      1,
      1
    ],
    "gold": [
      6,
      8,
      15
    ],
    "race": "構造体",
    "swings": 1,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [],
    "resistance": "毒無効",
    "boss": false,
    "icon": "◆",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "ninjachief",
    "name": "忍びの頭目",
    "unknown": "怪しい人影",
    "floor": 7,
    "level": 13,
    "hp": [
      6,
      8,
      0
    ],
    "ac": 0,
    "hit": 11,
    "attack": [
      2,
      6,
      2
    ],
    "xp": 350.0,
    "groupSize": [
      1,
      3
    ],
    "gold": [
      6,
      8,
      15
    ],
    "race": "人型",
    "swings": 2,
    "rear": false,
    "flee": 0.1,
    "summon": 0,
    "steal": 0.1,
    "drain": 0,
    "death": 0.06,
    "statuses": [],
    "resistance": "なし",
    "boss": false,
    "icon": "♟",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "deathmage",
    "name": "死霊魔導士",
    "unknown": "ローブの死体",
    "floor": 7,
    "level": 13,
    "hp": [
      6,
      8,
      0
    ],
    "ac": 2,
    "hit": 7,
    "attack": [
      1,
      10,
      0
    ],
    "xp": 360.0,
    "groupSize": [
      1,
      2
    ],
    "gold": [
      6,
      8,
      15
    ],
    "race": "不死",
    "swings": 1,
    "rear": true,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0.05,
    "death": 0,
    "statuses": [],
    "resistance": "毒無効",
    "boss": false,
    "icon": "☠",
    "summonCap": 4,
    "breath": null,
    "spell": 0.25,
    "spellInfo": {
      "id": "dalto",
      "name": "ダルト",
      "target": "all",
      "dice": [
        5,
        6,
        0
      ],
      "effect": "damage"
    }
  },
  {
    "id": "hellhound",
    "name": "地獄の犬",
    "unknown": "燃える獣",
    "floor": 7,
    "level": 12,
    "hp": [
      6,
      8,
      0
    ],
    "ac": 3,
    "hit": 9,
    "attack": [
      2,
      8,
      0
    ],
    "xp": 300.0,
    "groupSize": [
      2,
      3
    ],
    "gold": [
      6,
      8,
      15
    ],
    "race": "魔獣",
    "swings": 1,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [
      {
        "type": "fear",
        "chance": 0.15
      }
    ],
    "resistance": "炎半減",
    "boss": false,
    "icon": "♞",
    "summonCap": 4,
    "breath": {
      "element": "炎",
      "dice": [
        4,
        6,
        0
      ],
      "chance": 0.3
    },
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "crawler",
    "name": "這い寄る大蟲",
    "unknown": "巨大な虫",
    "floor": 7,
    "level": 12,
    "hp": [
      7,
      8,
      0
    ],
    "ac": 4,
    "hit": 8,
    "attack": [
      2,
      6,
      0
    ],
    "xp": 280.0,
    "groupSize": [
      1,
      3
    ],
    "gold": [
      6,
      8,
      15
    ],
    "race": "虫",
    "swings": 1,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [
      {
        "type": "paralysis",
        "chance": 0.2
      }
    ],
    "resistance": "なし",
    "boss": false,
    "icon": "✥",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "ettin",
    "name": "双頭の巨人",
    "unknown": "異形の大男",
    "floor": 7,
    "level": 17,
    "hp": [
      14,
      8,
      30
    ],
    "ac": -1,
    "hit": 12,
    "attack": [
      3,
      10,
      5
    ],
    "xp": 1400.0,
    "groupSize": [
      1,
      1
    ],
    "gold": [
      12,
      10,
      80
    ],
    "race": "人型",
    "swings": 2,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [],
    "resistance": "なし",
    "boss": true,
    "icon": "♛",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "lesserdemon",
    "name": "レッサーデーモン",
    "unknown": "悪魔",
    "floor": 8,
    "level": 15,
    "hp": [
      9,
      8,
      10
    ],
    "ac": -1,
    "hit": 11,
    "attack": [
      3,
      8,
      0
    ],
    "xp": 500.0,
    "groupSize": [
      1,
      3
    ],
    "gold": [
      8,
      8,
      20
    ],
    "race": "悪魔",
    "swings": 2,
    "rear": false,
    "flee": 0,
    "summon": 0.1,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [],
    "resistance": "なし",
    "boss": false,
    "icon": "♜",
    "summonCap": 3,
    "breath": null,
    "spell": 0.2,
    "spellInfo": {
      "id": "mahalito",
      "name": "マハリト",
      "target": "all",
      "dice": [
        4,
        6,
        0
      ],
      "effect": "damage"
    }
  },
  {
    "id": "bluedragon",
    "name": "雷竜",
    "unknown": "竜",
    "floor": 8,
    "level": 15,
    "hp": [
      10,
      8,
      0
    ],
    "ac": 0,
    "hit": 10,
    "attack": [
      3,
      8,
      0
    ],
    "xp": 520.0,
    "groupSize": [
      1,
      2
    ],
    "gold": [
      8,
      8,
      20
    ],
    "race": "竜",
    "swings": 1,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [],
    "resistance": "なし",
    "boss": false,
    "icon": "♜",
    "summonCap": 4,
    "breath": {
      "element": "雷",
      "dice": [
        4,
        8,
        0
      ],
      "chance": 0.25
    },
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "deathknight",
    "name": "死の騎士",
    "unknown": "武装した死体",
    "floor": 8,
    "level": 15,
    "hp": [
      10,
      8,
      15
    ],
    "ac": -2,
    "hit": 12,
    "attack": [
      3,
      8,
      5
    ],
    "xp": 560.0,
    "groupSize": [
      1,
      2
    ],
    "gold": [
      8,
      8,
      20
    ],
    "race": "不死",
    "swings": 2,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0.1,
    "death": 0,
    "statuses": [],
    "resistance": "毒無効",
    "boss": false,
    "icon": "☠",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "witch",
    "name": "魔女",
    "unknown": "ローブの人影",
    "floor": 8,
    "level": 14,
    "hp": [
      6,
      8,
      0
    ],
    "ac": 2,
    "hit": 8,
    "attack": [
      1,
      8,
      0
    ],
    "xp": 480.0,
    "groupSize": [
      1,
      2
    ],
    "gold": [
      8,
      8,
      20
    ],
    "race": "人型",
    "swings": 1,
    "rear": true,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [],
    "resistance": "なし",
    "boss": false,
    "icon": "♟",
    "summonCap": 4,
    "breath": null,
    "spell": 0.25,
    "spellInfo": {
      "id": "montino",
      "name": "モンティノ",
      "target": "all",
      "dice": null,
      "effect": "silence"
    }
  },
  {
    "id": "hydra",
    "name": "多頭竜",
    "unknown": "竜",
    "floor": 8,
    "level": 15,
    "hp": [
      12,
      8,
      0
    ],
    "ac": 3,
    "hit": 10,
    "attack": [
      2,
      8,
      0
    ],
    "xp": 540.0,
    "groupSize": [
      1,
      1
    ],
    "gold": [
      8,
      8,
      20
    ],
    "race": "竜",
    "swings": 3,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [],
    "resistance": "なし",
    "boss": false,
    "icon": "♜",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "assassin",
    "name": "影の暗殺者",
    "unknown": "怪しい人影",
    "floor": 8,
    "level": 14,
    "hp": [
      7,
      8,
      0
    ],
    "ac": -2,
    "hit": 12,
    "attack": [
      2,
      8,
      0
    ],
    "xp": 500.0,
    "groupSize": [
      1,
      3
    ],
    "gold": [
      8,
      8,
      20
    ],
    "race": "人型",
    "swings": 2,
    "rear": true,
    "flee": 0.15,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0.1,
    "statuses": [],
    "resistance": "なし",
    "boss": false,
    "icon": "♟",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "evileye",
    "name": "邪眼",
    "unknown": "跳ねる眼球",
    "floor": 8,
    "level": 14,
    "hp": [
      6,
      8,
      0
    ],
    "ac": 0,
    "hit": 8,
    "attack": [
      1,
      10,
      0
    ],
    "xp": 460.0,
    "groupSize": [
      1,
      2
    ],
    "gold": [
      8,
      8,
      20
    ],
    "race": "魔獣",
    "swings": 1,
    "rear": true,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [
      {
        "type": "paralysis",
        "chance": 0.3
      },
      {
        "type": "stone",
        "chance": 0.1
      }
    ],
    "resistance": "なし",
    "boss": false,
    "icon": "♞",
    "summonCap": 4,
    "breath": null,
    "spell": 0.4,
    "spellInfo": {
      "id": "halito",
      "name": "ハリト",
      "target": "one",
      "dice": [
        1,
        8,
        0
      ],
      "effect": "damage"
    }
  },
  {
    "id": "demongeneral",
    "name": "魔将軍",
    "unknown": "異形の巨人",
    "floor": 8,
    "level": 19,
    "hp": [
      14,
      8,
      35
    ],
    "ac": -3,
    "hit": 13,
    "attack": [
      4,
      8,
      4
    ],
    "xp": 2200.0,
    "groupSize": [
      1,
      1
    ],
    "gold": [
      15,
      10,
      100
    ],
    "race": "悪魔",
    "swings": 2,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [],
    "resistance": "なし",
    "boss": true,
    "icon": "♛",
    "summonCap": 4,
    "breath": null,
    "spell": 0.3,
    "spellInfo": {
      "id": "dalto",
      "name": "ダルト",
      "target": "all",
      "dice": [
        5,
        6,
        0
      ],
      "effect": "damage"
    }
  },
  {
    "id": "greaterdemon",
    "name": "グレーターデーモン",
    "unknown": "悪魔",
    "floor": 9,
    "level": 17,
    "hp": [
      11,
      8,
      20
    ],
    "ac": -3,
    "hit": 13,
    "attack": [
      3,
      8,
      0
    ],
    "xp": 900.0,
    "groupSize": [
      1,
      2
    ],
    "gold": [
      10,
      8,
      30
    ],
    "race": "悪魔",
    "swings": 2,
    "rear": false,
    "flee": 0,
    "summon": 0.05,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [],
    "resistance": "なし",
    "boss": false,
    "icon": "♜",
    "summonCap": 3,
    "breath": null,
    "spell": 0.1,
    "spellInfo": {
      "id": "madalto",
      "name": "マダルト",
      "target": "all",
      "dice": [
        6,
        8,
        0
      ],
      "effect": "damage"
    }
  },
  {
    "id": "frostgiant",
    "name": "霜の巨人",
    "unknown": "巨大な人影",
    "floor": 9,
    "level": 17,
    "hp": [
      14,
      8,
      20
    ],
    "ac": -1,
    "hit": 13,
    "attack": [
      3,
      10,
      0
    ],
    "xp": 880.0,
    "groupSize": [
      1,
      2
    ],
    "gold": [
      10,
      8,
      30
    ],
    "race": "人型",
    "swings": 1,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [],
    "resistance": "なし",
    "boss": false,
    "icon": "♟",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "vampirelord",
    "name": "夜の貴族",
    "unknown": "青白い貴人",
    "floor": 9,
    "level": 18,
    "hp": [
      12,
      8,
      0
    ],
    "ac": -3,
    "hit": 13,
    "attack": [
      2,
      10,
      0
    ],
    "xp": 1000.0,
    "groupSize": [
      1,
      2
    ],
    "gold": [
      10,
      8,
      30
    ],
    "race": "不死",
    "swings": 2,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0.2,
    "death": 0,
    "statuses": [],
    "resistance": "毒無効",
    "boss": false,
    "icon": "☠",
    "summonCap": 4,
    "breath": null,
    "spell": 0.15,
    "spellInfo": {
      "id": "dalto",
      "name": "ダルト",
      "target": "all",
      "dice": [
        5,
        6,
        0
      ],
      "effect": "damage"
    }
  },
  {
    "id": "reddragon",
    "name": "赤竜",
    "unknown": "竜",
    "floor": 9,
    "level": 18,
    "hp": [
      14,
      8,
      0
    ],
    "ac": -2,
    "hit": 12,
    "attack": [
      4,
      8,
      0
    ],
    "xp": 1050.0,
    "groupSize": [
      1,
      1
    ],
    "gold": [
      10,
      8,
      30
    ],
    "race": "竜",
    "swings": 1,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [],
    "resistance": "炎半減",
    "boss": false,
    "icon": "♜",
    "summonCap": 4,
    "breath": {
      "element": "炎",
      "dice": [
        5,
        8,
        0
      ],
      "chance": 0.25
    },
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "masterninja",
    "name": "上忍",
    "unknown": "怪しい人影",
    "floor": 9,
    "level": 17,
    "hp": [
      9,
      8,
      0
    ],
    "ac": -4,
    "hit": 14,
    "attack": [
      2,
      6,
      2
    ],
    "xp": 950.0,
    "groupSize": [
      1,
      2
    ],
    "gold": [
      10,
      8,
      30
    ],
    "race": "人型",
    "swings": 3,
    "rear": false,
    "flee": 0.1,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0.08,
    "statuses": [],
    "resistance": "なし",
    "boss": false,
    "icon": "♟",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "lich",
    "name": "リッチ",
    "unknown": "ローブの死体",
    "floor": 9,
    "level": 18,
    "hp": [
      10,
      8,
      0
    ],
    "ac": -2,
    "hit": 10,
    "attack": [
      2,
      8,
      0
    ],
    "xp": 1100.0,
    "groupSize": [
      1,
      1
    ],
    "gold": [
      10,
      8,
      30
    ],
    "race": "不死",
    "swings": 1,
    "rear": true,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0.15,
    "death": 0,
    "statuses": [],
    "resistance": "毒無効",
    "boss": false,
    "icon": "☠",
    "summonCap": 4,
    "breath": null,
    "spell": 0.25,
    "spellInfo": {
      "id": "madalto",
      "name": "マダルト",
      "target": "all",
      "dice": [
        6,
        8,
        0
      ],
      "effect": "damage"
    }
  },
  {
    "id": "fiendhound",
    "name": "魔界の猟犬",
    "unknown": "燃える獣",
    "floor": 9,
    "level": 16,
    "hp": [
      9,
      8,
      0
    ],
    "ac": -1,
    "hit": 12,
    "attack": [
      2,
      8,
      0
    ],
    "xp": 820.0,
    "groupSize": [
      1,
      3
    ],
    "gold": [
      10,
      8,
      30
    ],
    "race": "魔獣",
    "swings": 1,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [
      {
        "type": "fear",
        "chance": 0.15
      }
    ],
    "resistance": "炎半減",
    "boss": false,
    "icon": "♞",
    "summonCap": 4,
    "breath": {
      "element": "炎",
      "dice": [
        4,
        6,
        0
      ],
      "chance": 0.25
    },
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "ancientdragon",
    "name": "古竜",
    "unknown": "竜",
    "floor": 9,
    "level": 21,
    "hp": [
      16,
      8,
      32
    ],
    "ac": -4,
    "hit": 14,
    "attack": [
      5,
      8,
      0
    ],
    "xp": 3500.0,
    "groupSize": [
      1,
      1
    ],
    "gold": [
      20,
      10,
      150
    ],
    "race": "竜",
    "swings": 2,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [],
    "resistance": "炎半減",
    "boss": true,
    "icon": "♛",
    "summonCap": 4,
    "breath": {
      "element": "炎",
      "dice": [
        7,
        8,
        0
      ],
      "chance": 0.25
    },
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "royalguard",
    "name": "魔王の近衛",
    "unknown": "武装した人影",
    "floor": 10,
    "level": 19,
    "hp": [
      14,
      8,
      20
    ],
    "ac": -5,
    "hit": 15,
    "attack": [
      3,
      8,
      4
    ],
    "xp": 1500.0,
    "groupSize": [
      1,
      2
    ],
    "gold": [
      12,
      8,
      40
    ],
    "race": "人型",
    "swings": 2,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [],
    "resistance": "なし",
    "boss": false,
    "icon": "♟",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "fallenangel",
    "name": "堕天使",
    "unknown": "醜いカラス",
    "floor": 10,
    "level": 20,
    "hp": [
      13,
      8,
      0
    ],
    "ac": -4,
    "hit": 14,
    "attack": [
      2,
      10,
      0
    ],
    "xp": 1700.0,
    "groupSize": [
      1,
      2
    ],
    "gold": [
      12,
      8,
      40
    ],
    "race": "悪魔",
    "swings": 2,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [],
    "resistance": "なし",
    "boss": false,
    "icon": "♜",
    "summonCap": 4,
    "breath": null,
    "spell": 0.15,
    "spellInfo": {
      "id": "madalto",
      "name": "マダルト",
      "target": "all",
      "dice": [
        6,
        8,
        0
      ],
      "effect": "damage"
    }
  },
  {
    "id": "reaper",
    "name": "死神",
    "unknown": "黒衣の影",
    "floor": 10,
    "level": 20,
    "hp": [
      12,
      8,
      0
    ],
    "ac": -4,
    "hit": 14,
    "attack": [
      3,
      8,
      0
    ],
    "xp": 1600.0,
    "groupSize": [
      1,
      2
    ],
    "gold": [
      12,
      8,
      40
    ],
    "race": "不死",
    "swings": 1,
    "rear": true,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0.15,
    "death": 0.1,
    "statuses": [
      {
        "type": "fear",
        "chance": 0.2
      }
    ],
    "resistance": "毒無効",
    "boss": false,
    "icon": "☠",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "chaosdragon",
    "name": "混沌の竜",
    "unknown": "竜",
    "floor": 10,
    "level": 20,
    "hp": [
      16,
      8,
      0
    ],
    "ac": -3,
    "hit": 14,
    "attack": [
      3,
      10,
      0
    ],
    "xp": 1800.0,
    "groupSize": [
      1,
      1
    ],
    "gold": [
      12,
      8,
      40
    ],
    "race": "竜",
    "swings": 1,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [],
    "resistance": "なし",
    "boss": false,
    "icon": "♜",
    "summonCap": 4,
    "breath": {
      "element": "冷気",
      "dice": [
        6,
        8,
        0
      ],
      "chance": 0.25
    },
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "chaosspawn",
    "name": "混沌の落とし子",
    "unknown": "不定形",
    "floor": 10,
    "level": 18,
    "hp": [
      18,
      8,
      0
    ],
    "ac": 2,
    "hit": 12,
    "attack": [
      3,
      8,
      0
    ],
    "xp": 1300.0,
    "groupSize": [
      1,
      2
    ],
    "gold": [
      12,
      8,
      40
    ],
    "race": "不定形",
    "swings": 1,
    "rear": false,
    "flee": 0,
    "summon": 0.1,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [
      {
        "type": "poison",
        "chance": 0.3
      },
      {
        "type": "paralysis",
        "chance": 0.1
      },
      {
        "type": "stone",
        "chance": 0.05
      }
    ],
    "resistance": "なし",
    "boss": false,
    "icon": "◉",
    "summonCap": 4,
    "breath": null,
    "spell": 0,
    "spellInfo": null
  },
  {
    "id": "archmage",
    "name": "大魔導師",
    "unknown": "杖を持つ人影",
    "floor": 10,
    "level": 20,
    "hp": [
      10,
      8,
      0
    ],
    "ac": -2,
    "hit": 10,
    "attack": [
      2,
      8,
      0
    ],
    "xp": 1800.0,
    "groupSize": [
      1,
      1
    ],
    "gold": [
      12,
      8,
      40
    ],
    "race": "人型",
    "swings": 1,
    "rear": true,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0,
    "death": 0,
    "statuses": [],
    "resistance": "なし",
    "boss": false,
    "icon": "♟",
    "summonCap": 4,
    "breath": null,
    "spell": 0.15,
    "spellInfo": {
      "id": "tiltowait",
      "name": "ティルトウェイト",
      "target": "all",
      "dice": [
        8,
        8,
        0
      ],
      "effect": "damage"
    }
  },
  {
    "id": "labyrinthlord",
    "name": "迷宮の主",
    "unknown": "玉座の影",
    "floor": 10,
    "level": 25,
    "hp": [
      44,
      8,
      110
    ],
    "ac": -6,
    "hit": 16,
    "attack": [
      5,
      10,
      0
    ],
    "xp": 10000.0,
    "groupSize": [
      1,
      1
    ],
    "gold": [
      30,
      10,
      300
    ],
    "race": "悪魔",
    "swings": 4,
    "rear": false,
    "flee": 0,
    "summon": 0,
    "steal": 0,
    "drain": 0.1,
    "death": 0,
    "statuses": [],
    "resistance": "毒無効",
    "boss": true,
    "icon": "♛",
    "summonCap": 4,
    "breath": null,
    "spell": 0.35,
    "spellInfo": {
      "id": "tiltowait",
      "name": "ティルトウェイト",
      "target": "all",
      "dice": [
        8,
        8,
        0
      ],
      "effect": "damage"
    }
  }
];
