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
    "spell": 0
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
    "spell": 0
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
    "spell": 0
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
    "spell": 0
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
    "spell": 0
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
    "spell": 0
  },
  {
    "id": "spider",
    "name": "毒蜘蛛",
    "unknown": "虫",
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
    "spell": 0
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
    "spell": 0
  },
  {
    "id": "apprentice",
    "name": "迷宮の見習い",
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
    "spell": 0.5
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
    "spell": 0
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
      2,
      6,
      0
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
    "spell": 0
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
      2,
      6,
      0
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
    "spell": 0
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
      2,
      5,
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
    "spell": 0
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
      2,
      6,
      0
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
    "spell": 0
  },
  {
    "id": "bigspider",
    "name": "大蜘蛛",
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
      2,
      6,
      0
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
    "spell": 0
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
      2,
      6,
      0
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
    "spell": 0.5
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
      2,
      6,
      0
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
    "spell": 0
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
      2,
      6,
      0
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
    "spell": 0
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
      2,
      6,
      0
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
    "spell": 0.5
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
    "spell": 0
  },
  {
    "id": "acidslime",
    "name": "酸性スライム",
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
      3,
      6,
      0
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
    "spell": 0
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
      3,
      6,
      0
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
    "spell": 0
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
      3,
      9,
      0
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
    "spell": 0
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
      3,
      6,
      0
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
    "spell": 0.5
  },
  {
    "id": "venomspider",
    "name": "猛毒蜘蛛",
    "unknown": "巨大な虫",
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
    "spell": 0
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
      3,
      6,
      0
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
    "spell": 0
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
    "spell": 0
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
    "spell": 0
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
    "spell": 0.6
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
    "spell": 0
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
    "spell": 0.1
  }
];
