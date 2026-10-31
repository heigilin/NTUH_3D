window.CAMPUS_DATA = {
  "name": "國立臺灣大學醫學院附設醫院 (NTUH)",
  "campuses": {
    "west": {
      "id": "west",
      "name": "西址",
      "color": "#c77960"
    },
    "east": {
      "id": "east",
      "name": "東址",
      "color": "#dfbf8b"
    },
    "children": {
      "id": "children",
      "name": "兒醫",
      "color": "#d6a27e"
    },
    "all": {
      "id": "all",
      "name": "全院",
      "color": "#7a6858"
    }
  },
  "scale": {
    "ratio": "每層 3.6 公尺，比例尺以凱達格蘭大道與仁愛路景福門為南端基準對應真實院區",
    "worldSizeMeters": 380
  },
  "buildings": [
    {
      "id": "JINGFU_GATE",
      "campus": "all",
      "code": "JF-GATE",
      "name": "景福門",
      "category": "國定古蹟/交通核心",
      "floors": 2,
      "floorHeight": 5.0,
      "height": 12.0,
      "color": "#c0392b",
      "roofColor": "#27ae60",
      "position": {
        "x": 13.7,
        "z": 138.9
      },
      "dimensions": {
        "width": 26.0,
        "depth": 26.0
      },
      "description": ""
    },
    {
      "id": "W01_LOBBY",
      "campus": "west",
      "code": "W01-L",
      "name": "西址大廳",
      "category": "門診/歷史大廳",
      "floors": 2,
      "floorHeight": 3.6,
      "height": 7.2,
      "color": "#bf7658",
      "roofColor": "#717365",
      "hasRoofDome": false,
      "position": {
        "x": -8.9,
        "z": 58.8
      },
      "dimensions": {
        "width": 28.0,
        "depth": 18.0
      },
      "description": "西址歷史大門：紅磚與灰米色石材橫帶、古典雙柱門廊、陽台欄杆、中央曲線山牆及兩側山牆；依提供照片作辨識性造型，尺寸非實測。",
      "exteriorDisplayHeight": 12.6
    },
    {
      "id": "W01_SPINE",
      "campus": "west",
      "code": "W-CORR",
      "name": "中央紅磚主長廊 (古蹟廊道)",
      "category": "古蹟走廊/連通道",
      "floors": 1,
      "floorHeight": 3.6,
      "height": 3.6,
      "color": "#c77960",
      "position": {
        "x": -8.9,
        "z": 24.0
      },
      "dimensions": {
        "width": 6.0,
        "depth": 68.0
      },
      "description": "貫穿西址南北之百年木構拱形紅磚走廊，串聯各翼病房棟。"
    },
    {
      "id": "W01_WEST",
      "campus": "west",
      "code": "W01-W",
      "name": "西一棟 / 西二棟 (門診調劑處)",
      "category": "門診醫療",
      "floors": 2,
      "floorHeight": 3.6,
      "height": 7.2,
      "color": "#c77960",
      "position": {
        "x": -31.0,
        "z": 48.0
      },
      "dimensions": {
        "width": 36.0,
        "depth": 14.0
      },
      "description": "門診部調劑組、藥劑部諮詢、批價掛號櫃台、門診會議室。"
    },
    {
      "id": "W02_WEST",
      "campus": "west",
      "code": "W02-W",
      "name": "西三棟 (03W2 精神醫學病房)",
      "category": "住院病房",
      "floors": 2,
      "floorHeight": 3.6,
      "height": 7.2,
      "color": "#c77960",
      "position": {
        "x": -31.0,
        "z": 32.0
      },
      "dimensions": {
        "width": 36.0,
        "depth": 14.0
      },
      "description": "精神醫學部示範病房（3W2）、身心日間照護病房與心理治療諮商室。"
    },
    {
      "id": "W03_WEST",
      "campus": "west",
      "code": "W03-W",
      "name": "西四棟 (4W1/4W2 骨科/復健病房)",
      "category": "住院病房",
      "floors": 2,
      "floorHeight": 3.6,
      "height": 7.2,
      "color": "#c77960",
      "position": {
        "x": -31.0,
        "z": 16.0
      },
      "dimensions": {
        "width": 36.0,
        "depth": 14.0
      },
      "description": "骨科部示範病房（4W1、4W2）、關節重建中心與骨科術後照護專區。"
    },
    {
      "id": "W04_WEST",
      "campus": "west",
      "code": "W04-W",
      "name": "西五/西六棟 (5W1~5W4, 6W3 外科/胸腔外科)",
      "category": "住院病房",
      "floors": 4,
      "floorHeight": 3.6,
      "height": 14.4,
      "color": "#c77960",
      "highlightBorder": true,
      "position": {
        "x": -31.0,
        "z": -2.0
      },
      "dimensions": {
        "width": 36.0,
        "depth": 18.0
      },
      "description": "2樓為 5W2 胸腔外科示範病房（16間病室、36床、污物室、清潔間、負壓隔離房），亦包含 5W1、5W3、5W4、6W3。"
    },
    {
      "id": "W01_EAST",
      "campus": "west",
      "code": "W01-E",
      "name": "東一棟 / 東二棟 (病歷室/行政)",
      "category": "行政管理",
      "floors": 2,
      "floorHeight": 3.6,
      "height": 7.2,
      "color": "#c77960",
      "position": {
        "x": 8.0,
        "z": 48.0
      },
      "dimensions": {
        "width": 26.0,
        "depth": 14.0
      },
      "description": "醫療事務室病歷組、人事室、出納組與總務行政核心。"
    },
    {
      "id": "W02_EAST",
      "campus": "west",
      "code": "W02-E",
      "name": "東三棟 (3E2 住院病房)",
      "category": "住院病房",
      "floors": 2,
      "floorHeight": 3.6,
      "height": 7.2,
      "color": "#c77960",
      "position": {
        "x": 8.0,
        "z": 32.0
      },
      "dimensions": {
        "width": 26.0,
        "depth": 14.0
      },
      "description": "內科部臨床示範病房（3E2）、內分泌暨新陳代謝專科病房。"
    },
    {
      "id": "W03_EAST",
      "campus": "west",
      "code": "W03-E",
      "name": "東四棟 (4E1 復健部 / 4E2 老年醫學部)",
      "category": "住院病房",
      "floors": 2,
      "floorHeight": 3.6,
      "height": 7.2,
      "color": "#c77960",
      "position": {
        "x": 8.0,
        "z": 16.0
      },
      "dimensions": {
        "width": 26.0,
        "depth": 14.0
      },
      "description": "1樓為 4E1 復健部病房（含復健講堂、吞嚥治療室），2樓為 4E2 老年醫學部病房（老人健檢）。"
    },
    {
      "id": "W04_EAST",
      "campus": "west",
      "code": "W04-E",
      "name": "東五/東六棟 (5E3, 6E1, 6E2)",
      "category": "住院病房",
      "floors": 3,
      "floorHeight": 3.6,
      "height": 10.8,
      "color": "#c77960",
      "position": {
        "x": 8.0,
        "z": -2.0
      },
      "dimensions": {
        "width": 26.0,
        "depth": 18.0
      },
      "description": "外科部臨床示範病房（5E3、6E1、6E2）、心臟血管外科照護病房。"
    },
    {
      "id": "JINGFU_TUNNEL",
      "campus": "link",
      "code": "TUNNEL",
      "name": "景福地下通道 (連通西址與東址)",
      "category": "地下聯絡通道",
      "floors": 1,
      "floorHeight": 3.6,
      "height": 3.6,
      "color": "#5e937d",
      "position": {
        "x": 38.0,
        "z": 58.8
      },
      "dimensions": {
        "width": 54.0,
        "depth": 8.0
      },
      "description": "穿越中山南路地下之全天候空調連通道，串聯西址與東址醫療區。"
    },
    {
      "id": "E01_MAIN",
      "campus": "east",
      "code": "E01",
      "name": "東址大樓",
      "category": "現代醫學中心",
      "floors": 15,
      "floorHeight": 3.6,
      "height": 54.0,
      "color": "#dfbf8b",
      "highlightBorder": true,
      "position": {
        "x": 83.7,
        "z": 70.8
      },
      "dimensions": {
        "width": 64.0,
        "depth": 76.0
      },
      "description": "宗邁建築師事務所設計、達欣工程承造。中山南路立面並排經典四棟暖黃色二丁掛磚病房大樓 (A/B/C/D棟)、中央挑高15層深色玻璃中庭、正面三連三角山牆迎賓車道大廳與頂樓直升機停機坪 [H]。"
    },
    {
      "id": "CHILD_HOSPITAL",
      "campus": "children",
      "code": "CH-MAIN",
      "name": "兒童醫療大樓 (兒醫大樓)",
      "category": "兒科婦幼醫學中心",
      "floors": 14,
      "floorHeight": 3.6,
      "height": 50.4,
      "color": "#d6a27e",
      "roofColor": "#e2bd96",
      "highlightBorder": true,
      "position": {
        "x": -4.0,
        "z": -56.0
      },
      "dimensions": {
        "width": 38.0,
        "depth": 34.0
      },
      "description": "青島西路／中山南路口兒童醫療大樓。位於西址北側，主要入口朝東、面向中山南路。外觀具鮮黃A字斜柱、粉紅基座、深藍玻璃帷幕與空中花園。涵蓋兒科急診、PICU (0PII)、NICU (0PNI)、兒科加護與 05PE~14PW 病房。",
      "entranceDirection": "east",
      "entranceRoad": "中山南路"
    }
  ]
};
