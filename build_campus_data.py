import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

buildings = [
    # ==================== 總院西址 (West Campus - 陶瓦紅磚茶色系) ====================
    {
        "id": "W01_LOBBY",
        "campus": "west",
        "code": "W01-L",
        "name": "常德街中央大廳 (西址正門)",
        "category": "門診/歷史大廳",
        "floors": 2,
        "floorHeight": 3.6,
        "height": 7.2,
        "color": "#944434",
        "roofColor": "#c27854",
        "hasRoofDome": True,
        "position": {"x": -85, "z": -108},
        "dimensions": {"width": 32, "depth": 22},
        "description": "文藝復興挑高圓頂正門大廳，百年巴洛克式列柱與雕飾山牆，常德街主要門診出入口。"
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
        "color": "#a85442",
        "position": {"x": -126, "z": -96},
        "dimensions": {"width": 46, "depth": 16},
        "description": "門診部調劑組、藥劑部諮詢、批價掛號櫃台、門診會議室。"
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
        "color": "#8c7b6e",
        "position": {"x": -44, "z": -96},
        "dimensions": {"width": 46, "depth": 16},
        "description": "病歷資訊管理室、病歷申請室、駐警隊值班室、行政辦公區。"
    },
    {
        "id": "W01_SPINE",
        "campus": "west",
        "code": "W01-SPINE",
        "name": "中央紅磚主長廊 (Central Spine)",
        "category": "古蹟走廊/連通道",
        "floors": 1,
        "floorHeight": 5.0,
        "height": 5.0,
        "color": "#853a29",
        "position": {"x": -85, "z": -32},
        "dimensions": {"width": 8, "depth": 136},
        "description": "西址貫穿南北的百年歷史紅磚長廊，串接東、西兩側各翼樓病房棟。"
    },
    {
        "id": "W02_WEST",
        "campus": "west",
        "code": "W02-W",
        "name": "西三棟 (03W2 精神病房)",
        "category": "住院病房",
        "floors": 2,
        "floorHeight": 3.6,
        "height": 7.2,
        "color": "#b86b58",
        "position": {"x": -128, "z": -66},
        "dimensions": {"width": 48, "depth": 16},
        "description": "2樓為 03W2 精神醫學部病房（36張病床），設有保護室與精神科治療空間。"
    },
    {
        "id": "W02_EAST",
        "campus": "west",
        "code": "W02-E",
        "name": "東三棟 (03E2 公務病房)",
        "category": "住院病房",
        "floors": 2,
        "floorHeight": 3.6,
        "height": 7.2,
        "color": "#8c7b6e",
        "position": {"x": -42, "z": -66},
        "dimensions": {"width": 48, "depth": 16},
        "description": "2樓為 03E2 公務與特等住院病房，設有獨立護理站。"
    },
    {
        "id": "W03_WEST",
        "campus": "west",
        "code": "W03-W",
        "name": "西四棟 (4W1/4W2 骨科與整形外科)",
        "category": "住院病房",
        "floors": 2,
        "floorHeight": 3.6,
        "height": 7.2,
        "color": "#b86b58",
        "position": {"x": -132, "z": -32},
        "dimensions": {"width": 52, "depth": 17},
        "description": "1樓為 4W1 創傷與整形外科病房，2樓為 4W2 骨科病房（23間病室）。"
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
        "color": "#8c7b6e",
        "position": {"x": -38, "z": -32},
        "dimensions": {"width": 52, "depth": 17},
        "description": "1樓為 4E1 復健部病房（含復健講堂、吞嚥治療室），2樓為 4E2 老年醫學部病房（老人健檢）。"
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
        "color": "#a85442",
        "highlightBorder": True,
        "position": {"x": -136, "z": 8},
        "dimensions": {"width": 56, "depth": 36},
        "description": "2樓為 5W2 胸腔外科示範病房（16間病室、36床、污物室、清潔間、負壓隔離房），亦包含 5W1、5W3、5W4、6W3。"
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
        "color": "#8c7b6e",
        "position": {"x": -34, "z": 8},
        "dimensions": {"width": 56, "depth": 36},
        "description": "東五/東六棟住院病房與加護單位。"
    },
    {
        "id": "W05_RESEARCH",
        "campus": "west",
        "code": "W05",
        "name": "研究大樓 / 九西大樓",
        "category": "教學研究",
        "floors": 4,
        "floorHeight": 3.6,
        "height": 14.4,
        "color": "#7a6a5d",
        "position": {"x": -142, "z": 62},
        "dimensions": {"width": 42, "depth": 30},
        "description": "醫學臨床研究實驗室、分子生物與基因醫學研究核心設施。"
    },
    {
        "id": "W06_CHILD",
        "campus": "west",
        "code": "W06",
        "name": "兒童心理衛生中心",
        "category": "專科門診",
        "floors": 2,
        "floorHeight": 3.6,
        "height": 7.2,
        "color": "#8a7b6d",
        "position": {"x": -150, "z": 106},
        "dimensions": {"width": 30, "depth": 22},
        "description": "兒童與青少年精神身心門診、日間照護與早期療育教室。"
    },
    {
        "id": "W07_PSYCH",
        "campus": "west",
        "code": "W07",
        "name": "精神大樓 (精神醫學部大樓)",
        "category": "專科大樓",
        "floors": 7,
        "floorHeight": 3.6,
        "height": 25.2,
        "color": "#7a6a5d",
        "position": {"x": -155, "z": -120},
        "dimensions": {"width": 34, "depth": 28},
        "description": "精神醫學部日間留院、急性病房、成癮防制中心與心理治療室。"
    },
    {
        "id": "W08_LAB",
        "campus": "west",
        "code": "W08",
        "name": "檢驗大樓 (檢驗醫學部)",
        "category": "醫事檢驗",
        "floors": 7,
        "floorHeight": 3.6,
        "height": 25.2,
        "color": "#8c7b6e",
        "position": {"x": -32, "z": 62},
        "dimensions": {"width": 36, "depth": 28},
        "description": "臨床微生物室、生化檢驗、血庫、分子病理自動化檢驗流水線。"
    },
    {
        "id": "W09_SURGERY",
        "campus": "west",
        "code": "W09",
        "name": "西址手術大樓",
        "category": "手術中心",
        "floors": 4,
        "floorHeight": 3.6,
        "height": 14.4,
        "color": "#944434",
        "position": {"x": -85, "z": 58},
        "dimensions": {"width": 38, "depth": 26},
        "description": "外科手術室群、術後恢復室、麻醉部辦公室。"
    },
    "dimensions": {"width": 42, "depth": 28},
        "description": "物理治療室、職能治療室、語言治療與水療中心。"
    },
    {
        "id": "W11_STAFF",
        "campus": "west",
        "code": "W11",
        "name": "醫護大樓 (宿舍與行政)",
        "category": "行政宿舍",
        "floors": 11,
        "floorHeight": 3.6,
        "height": 39.6,
        "color": "#6e5e52",
        "position": {"x": -85, "z": 142},
        "dimensions": {"width": 52, "depth": 32},
        "description": "醫護同仁宿舍、值班室、行政辦公處與院史展覽會議廳。"
    },

    # ==================== 兒童醫療大樓 (兒醫 - 蜜糖杏橙奶茶色系) ====================
    {
        "id": "CHILD_HOSPITAL",
        "campus": "children",
        "code": "CH-MAIN",
        "name": "兒童醫療大樓 (兒醫大樓)",
        "category": "兒科婦幼醫學中心",
        "floors": 14,
        "floorHeight": 3.6,
        "height": 50.4,
        "color": "#d97736",
        "roofColor": "#ea9a60",
        "highlightBorder": True,
        "position": {"x": -22, "z": 138},
        "dimensions": {"width": 58, "depth": 48},
        "description": "台大醫院兒童醫院（青島西路/中山南路口）。涵蓋兒科急診、PICU (0PII)、NICU (0PNI)、兒科加護病房與 05PE~14PW 住院病房。"
    },
    "dimensions": {"width": 38, "depth": 22},
        "description": "兒童醫院專用不斷電備援系統、高壓受電站與中央空調冰水主機。"
    },
    {
        "id": "JINGFU_HALL",
        "campus": "children",
        "code": "CH-JINGFU",
        "name": "臺大景福館",
        "category": "校友與歷史館",
        "floors": 3,
        "floorHeight": 3.6,
        "height": 10.8,
        "color": "#c0805c",
        "position": {"x": -132, "z": 138},
        "dimensions": {"width": 36, "depth": 26},
        "description": "景福醫學基金會、校友交流會所、歷史文獻陳列室。"
    },

    # ==================== 總院東址 (East Campus - 莫蘭迪石藍茶色系) ====================
    {
        "id": "E01_MAIN",
        "campus": "east",
        "code": "E01",
        "name": "總院東址大樓 (East Campus Main Center)",
        "category": "現代醫學中心",
        "floors": 15,
        "floorHeight": 3.6,
        "height": 54.0,
        "color": "#4a7a96",
        "highlightBorder": True,
        "position": {"x": 110, "z": 0},
        "dimensions": {"width": 84, "depth": 116},
        "description": "東址 15 層智慧醫療大樓。圍繞中央大廳與電梯核心，分佈 7A、7B、7C、7D 及各層住院病房。"
    },

    # ==================== 景福地下通道 (橫跨中山南路) ====================
    {
        "id": "JINGFU_TUNNEL",
        "campus": "link",
        "code": "TUNNEL",
        "name": "景福地下連通道 (橫跨中山南路/徐州路地下)",
        "category": "地下通道",
        "floors": 1,
        "floorHeight": 2.8,
        "height": 1.2,
        "color": "#5e937d",
        "position": {"x": 12, "z": -35},
        "dimensions": {"width": 72, "depth": 8},
        "description": "貫通西址、兒醫與東址地下街之景福通道，全天候提供病人推床與人員快速直達通道。"
    }
]

campus_data_js = f"""// js/data/campus-data.js - 建物量體資料庫 (包含總院西址、總院東址、兒童醫療大樓兒醫)
window.CAMPUS_DATA = {{
  campusScale: 400.0,
  defaultFloorHeight: 3.6,
  campuses: {{
    west: {{ id: 'west', name: '總院西址 (歷史建築群)', color: '#a44b36' }},
    east: {{ id: 'east', name: '總院東址 (15層主大樓)', color: '#4a7a96' }},
    children: {{ id: 'children', name: '兒童醫療大樓 (兒醫)', color: '#d97736' }},
    all: {{ id: 'all', name: '全院區總覽', color: '#7a6858' }}
  }},
  buildings: {json.dumps(buildings, ensure_ascii=False, indent=2)}
}};

if (typeof module !== 'undefined' && module.exports) {{
  module.exports = window.CAMPUS_DATA;
}}
"""

with open('js/data/campus-data.js', 'w', encoding='utf-8') as f:
    f.write(campus_data_js)
print("Updated js/data/campus-data.js with children's hospital!")

# 更新 rooms-data.js 加入兒醫護理站與建物關聯
with open('所有床號.txt', 'r', encoding='utf-8', errors='ignore') as f:
    lines = [l.strip() for l in f if l.strip()]

bed_data = {}
for line in lines[1:]:
    parts = line.split('-')
    if len(parts) >= 3:
        ward = parts[1].strip()
        room = parts[2].strip()
        bed_seq = parts[3].strip() if len(parts) > 3 else '01'
        if ward not in bed_data: bed_data[ward] = {}
        if room not in bed_data[ward]: bed_data[ward][room] = []
        bed_data[ward][room].append(bed_seq)

wards_structured = {}
for ward, rooms in bed_data.items():
    campus = 'east'
    building_id = 'E01_MAIN'
    floor_num = '7F'
    
    # 判斷是否為兒醫 (Children's Hospital Wards)
    if any(k in ward for k in ['PII', 'PIM', 'PNI', 'PNO', 'PE', 'PW', 'PB']):
        campus = 'children'
        building_id = 'CHILD_HOSPITAL'
        # 樓層解析
        digits = ''.join([c for c in ward if c.isdigit()])
        if digits:
            floor_num = f'{int(digits)}F'
        else:
            if 'PI' in ward or 'PN' in ward:
                floor_num = '3F' # 加護病房在3~4樓
            else:
                floor_num = '5F'
    elif 'W' in ward or 'E' in ward:
        campus = 'west'
        if '03W' in ward: building_id = 'W02_WEST'; floor_num = '2F'
        elif '03E' in ward: building_id = 'W02_EAST'; floor_num = '2F'
        elif '04W1' in ward: building_id = 'W03_WEST'; floor_num = '1F'
        elif '04W2' in ward: building_id = 'W03_WEST'; floor_num = '2F'
        elif '04E1' in ward: building_id = 'W03_EAST'; floor_num = '1F'
        elif '04E2' in ward: building_id = 'W03_EAST'; floor_num = '2F'
        elif '05W1' in ward: building_id = 'W04_WEST'; floor_num = '1F'
        elif '05W2' in ward: building_id = 'W04_WEST'; floor_num = '2F'
        elif '05W3' in ward or '06W3' in ward: building_id = 'W04_WEST'; floor_num = '3F'
        elif '05W4' in ward: building_id = 'W04_WEST'; floor_num = '4F'
        elif '05E3' in ward: building_id = 'W04_EAST'; floor_num = '3F'
        elif '06E2' in ward: building_id = 'W04_EAST'; floor_num = '2F'
        else: building_id = 'W04_WEST'; floor_num = '2F'
    else:
        campus = 'east'
        building_id = 'E01_MAIN'
        digits = ''.join([c for c in ward if c.isdigit()])
        floor_num = f'{int(digits)}F' if digits else '7F'

    room_items = []
    for r_code in sorted(rooms.keys()):
        b_list = sorted(rooms[r_code])
        b_count = len(b_list)
        category = 'PATIENT_ROOM'
        room_type = '三人房'
        if b_count == 1:
            room_type = '單人房'
            if r_code in ['20', '22', '27']: category = 'ISOLATION'; room_type = '負壓隔離房'
        elif b_count == 2:
            room_type = '雙人房'
            if r_code in ['27']: category = 'ISOLATION'; room_type = '接觸隔離房'
        elif b_count >= 4:
            room_type = f'{b_count}人房'

        bed_objs = []
        for seq in b_list:
            if seq == '01':
                pos_type = 'DOOR_SIDE'; pos_desc = '靠近病室門/浴廁玄關'
            elif seq == '02' and b_count > 2:
                pos_type = 'MIDDLE'; pos_desc = '中間床位'
            else:
                pos_type = 'WINDOW_SIDE'; pos_desc = '遠離病室門/外側靠窗'
            bed_objs.append({
                "bedId": f"T0-{ward}-{r_code}-{seq}",
                "bedSeq": seq,
                "positionType": pos_type,
                "positionDesc": pos_desc
            })

        room_items.append({
            "roomCode": r_code,
            "fullRoomId": f"{ward}-{r_code}",
            "roomName": f"{ward}區 {r_code}病室",
            "roomType": room_type,
            "category": category,
            "bedCount": b_count,
            "beds": bed_objs
        })

    room_items.append({
        "roomCode": f"{ward}-DIRTY",
        "fullRoomId": f"{ward}-DIRTY",
        "roomName": f"⚠️ {ward} 污物室",
        "roomType": "污物集中管制室",
        "category": "DIRTY_UTILITY",
        "bedCount": 0,
        "beds": [],
        "description": "管制髒污被服、感染性廢棄物與排泄物，落實雙層黃袋密封。"
    })
    room_items.append({
        "roomCode": f"{ward}-CLEAN",
        "fullRoomId": f"{ward}-CLEAN",
        "roomName": f"🧹 {ward} 清潔間",
        "roomType": "無菌備品與清潔室",
        "category": "CLEAN_UTILITY",
        "bedCount": 0,
        "beds": [],
        "description": "存放無菌耗材、乾淨被服床單與醫療級消毒液，物理正壓隔離。"
    })

    wards_structured[ward] = {
        "ward": ward,
        "campus": campus,
        "buildingId": building_id,
        "floor": floor_num,
        "nursingStationName": f"{ward} 護理站",
        "totalRooms": len(room_items),
        "totalBeds": sum(r["bedCount"] for r in room_items),
        "rooms": room_items
    }

rooms_data_js = f"""// js/data/rooms-data.js - 病室配置與床位資料檔 (全院 86 護理站，含東址、西址、兒醫)
window.ROOMS_DATA = {{
  totalWards: {len(wards_structured)},
  totalBedsAcrossHospital: {len(lines) - 1},
  orientation: "SOUTH_AT_TOP",
  wards: {json.dumps(wards_structured, ensure_ascii=False, indent=2)}
}};

if (typeof module !== 'undefined' && module.exports) {{
  module.exports = window.ROOMS_DATA;
}}
"""

with open('js/data/rooms-data.js', 'w', encoding='utf-8') as f:
    f.write(rooms_data_js)
print(f"Updated js/data/rooms-data.js with {len(wards_structured)} wards including Children's Hospital!")
