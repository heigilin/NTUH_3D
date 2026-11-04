# build_database.py - 同時支援東址大樓與西址歷史大樓病房（5W2, 4W2）之完整空間與感管資料庫
import json, os, random
import openpyxl

CX = 554.0
CY = 790.0
SCALE = 0.08

def to_3d(px, py, pw, ph, floor_y=0.0):
    center_px = px + pw / 2.0
    center_py = py + ph / 2.0
    x = round((center_px - CX) * SCALE, 2)
    z = round((center_py - CY) * SCALE, 2)
    w = round(pw * SCALE, 2)
    d = round(ph * SCALE, 2)
    return {
        'x': x,
        'y': round(floor_y, 2),
        'z': z,
        'width': w,
        'depth': d,
        'height': 1.2
    }

# ==================== 東址 7F 資料定義 ====================
rooms_7f_raw = [
    # 7A North Wing
    ('7A06', 158, 40, 58, 95, '雙人病室', '7A', 26.5, 'PATIENT_ROOM'),
    ('7A07', 216, 40, 58, 95, '雙人病室', '7A', 26.5, 'PATIENT_ROOM'),
    ('7A08', 274, 40, 58, 95, '雙人病室', '7A', 26.5, 'PATIENT_ROOM'),
    ('7A09', 332, 40, 58, 95, '雙人病室', '7A', 26.5, 'PATIENT_ROOM'),
    ('7A10', 390, 40, 60, 95, '雙人病室', '7A', 26.5, 'PATIENT_ROOM'),
    ('7A11', 580, 40, 60, 95, '雙人病室', '7A', 26.5, 'PATIENT_ROOM'),
    ('7A12', 640, 40, 60, 95, '雙人病室', '7A', 26.5, 'PATIENT_ROOM'),
    ('7A13', 700, 40, 60, 95, '雙人病室', '7A', 26.5, 'PATIENT_ROOM'),
    ('7A15', 760, 40, 60, 95, '單人病室', '7A', 29.4, 'PATIENT_ROOM'),
    ('7A16', 820, 40, 65, 95, '單人病室', '7A', 29.4, 'PATIENT_ROOM'),
    ('7A05', 45, 160, 70, 140, '單人病室', '7A', 26.1, 'PATIENT_ROOM'),
    ('7A03', 115, 160, 65, 140, '單人病室', '7A', 24.1, 'PATIENT_ROOM'),
    ('7A02', 180, 215, 65, 155, '三人病室', '7A', 37.1, 'PATIENT_ROOM'),
    ('7A01', 245, 215, 70, 155, '三人病室', '7A', 37.7, 'PATIENT_ROOM'),
    ('7A19', 670, 230, 65, 140, '三人病室', '7A', 36.5, 'PATIENT_ROOM'),
    ('7A18', 735, 230, 65, 140, '三人病室', '7A', 36.5, 'PATIENT_ROOM'),
    ('7A17', 800, 230, 60, 140, '單人病室', '7A', 26.8, 'PATIENT_ROOM'),
    ('7A20', 860, 230, 80, 140, '負壓隔離病房', '7A', 38.5, 'ISOLATION'),
    ('7A-DIRTY', 315, 215, 40, 55, '7A 污物室', '7A', 3.6, 'DIRTY_UTILITY'),
    ('7A-CLEAN', 430, 145, 35, 45, '7A 清潔間', '7A', 3.0, 'CLEAN_UTILITY'),

    # 7B North-West Wing
    ('7B05', 65, 380, 65, 140, '單人病室', '7B', 26.1, 'PATIENT_ROOM'),
    ('7B03', 130, 380, 65, 140, '單人病室', '7B', 24.1, 'PATIENT_ROOM'),
    ('7B02', 195, 350, 65, 120, '三人病室', '7B', 37.1, 'PATIENT_ROOM'),
    ('7B01', 260, 350, 70, 120, '三人病室', '7B', 37.7, 'PATIENT_ROOM'),
    ('7B06', 135, 570, 68, 110, '單人病室', '7B', 25.7, 'PATIENT_ROOM'),
    ('7B07', 203, 570, 60, 110, '雙人病室', '7B', 26.9, 'PATIENT_ROOM'),
    ('7B08', 263, 570, 60, 110, '雙人病室', '7B', 26.6, 'PATIENT_ROOM'),
    ('7B09', 323, 570, 60, 110, '雙人病室', '7B', 26.9, 'PATIENT_ROOM'),
    ('7B10', 383, 570, 60, 110, '雙人病室', '7B', 26.6, 'PATIENT_ROOM'),
    ('7B11', 443, 570, 60, 110, '雙人病室', '7B', 26.9, 'PATIENT_ROOM'),
    ('7B12', 503, 570, 60, 110, '雙人病室', '7B', 26.6, 'PATIENT_ROOM'),
    ('7B13', 563, 570, 60, 110, '雙人病室', '7B', 26.9, 'PATIENT_ROOM'),
    ('7B15', 623, 570, 60, 110, '雙人病室', '7B', 29.4, 'PATIENT_ROOM'),
    ('7B16', 730, 570, 65, 110, '雙人病室', '7B', 29.4, 'PATIENT_ROOM'),
    ('7B17', 795, 570, 60, 110, '單人病室', '7B', 26.8, 'PATIENT_ROOM'),
    ('7B18', 855, 570, 65, 110, '單人病室', '7B', 26.8, 'PATIENT_ROOM'),
    ('7B21', 730, 380, 70, 140, '三人病室', '7B', 36.5, 'PATIENT_ROOM'),
    ('7B20', 800, 380, 70, 140, '三人病室', '7B', 36.5, 'PATIENT_ROOM'),
    ('7B19', 870, 380, 50, 140, '單人病室', '7B', 25.0, 'PATIENT_ROOM'),
    ('7B22', 920, 380, 50, 140, '隔離病室', '7B', 26.5, 'ISOLATION'),
    ('7B-DIRTY', 330, 420, 40, 50, '7B 污物室', '7B', 3.6, 'DIRTY_UTILITY'),
    ('7B-CLEAN', 300, 470, 35, 45, '7B 清潔間', '7B', 3.1, 'CLEAN_UTILITY'),

    # 7C Center-South Wing
    ('7C06', 235, 800, 68, 105, '單人病室', '7C', 25.7, 'PATIENT_ROOM'),
    ('7C07', 303, 800, 60, 105, '雙人病室', '7C', 26.9, 'PATIENT_ROOM'),
    ('7C08', 363, 800, 60, 105, '雙人病室', '7C', 26.6, 'PATIENT_ROOM'),
    ('7C09', 423, 800, 60, 105, '雙人病室', '7C', 26.9, 'PATIENT_ROOM'),
    ('7C10', 483, 800, 60, 105, '雙人病室', '7C', 26.6, 'PATIENT_ROOM'),
    ('7C11', 595, 800, 60, 105, '雙人病室', '7C', 26.6, 'PATIENT_ROOM'),
    ('7C12', 655, 800, 60, 105, '雙人病室', '7C', 26.6, 'PATIENT_ROOM'),
    ('7C13', 715, 800, 60, 105, '雙人病室', '7C', 26.9, 'PATIENT_ROOM'),
    ('7C15', 775, 800, 60, 105, '雙人病室', '7C', 29.4, 'PATIENT_ROOM'),
    ('7C16', 835, 800, 60, 105, '雙人病室', '7C', 29.4, 'PATIENT_ROOM'),
    ('7C17', 895, 800, 60, 105, '單人病室', '7C', 26.8, 'PATIENT_ROOM'),
    ('7C18', 955, 800, 65, 105, '單人病室', '7C', 26.8, 'PATIENT_ROOM'),
    ('7C05', 165, 920, 70, 140, '單人病室', '7C', 26.1, 'PATIENT_ROOM'),
    ('7C03', 235, 920, 65, 140, '單人病室', '7C', 24.1, 'PATIENT_ROOM'),
    ('7C02', 300, 950, 65, 120, '三人病室', '7C', 37.1, 'PATIENT_ROOM'),
    ('7C01', 365, 950, 70, 120, '三人病室', '7C', 37.7, 'PATIENT_ROOM'),
    ('7C21', 825, 920, 65, 140, '三人病室', '7C', 36.5, 'PATIENT_ROOM'),
    ('7C20', 890, 920, 65, 140, '三人病室', '7C', 36.5, 'PATIENT_ROOM'),
    ('7C19', 955, 920, 60, 140, '單人病室', '7C', 26.8, 'PATIENT_ROOM'),
    ('7C22', 1015, 920, 65, 140, '隔離病室', '7C', 28.5, 'ISOLATION'),
    ('7C-DIRTY', 410, 950, 40, 50, '7C 污物室', '7C', 3.6, 'DIRTY_UTILITY'),
    ('7C-CLEAN', 340, 1000, 35, 45, '7C 清潔間', '7C', 3.0, 'CLEAN_UTILITY'),

    # 7D South-West Wing
    ('7D05', 165, 1160, 70, 140, '單人病室', '7D', 26.1, 'PATIENT_ROOM'),
    ('7D03', 235, 1160, 65, 140, '單人病室', '7D', 24.1, 'PATIENT_ROOM'),
    ('7D02', 300, 1140, 65, 120, '三人病室', '7D', 37.1, 'PATIENT_ROOM'),
    ('7D01', 365, 1140, 70, 120, '三人病室', '7D', 37.7, 'PATIENT_ROOM'),
    ('7D06', 235, 1350, 68, 110, '單人病室', '7D', 25.7, 'PATIENT_ROOM'),
    ('7D07', 303, 1350, 60, 110, '雙人病室', '7D', 26.9, 'PATIENT_ROOM'),
    ('7D08', 363, 1350, 60, 110, '雙人病室', '7D', 26.6, 'PATIENT_ROOM'),
    ('7D09', 423, 1350, 60, 110, '雙人病室', '7D', 26.9, 'PATIENT_ROOM'),
    ('7D10', 483, 1350, 60, 110, '雙人病室', '7D', 26.6, 'PATIENT_ROOM'),
    ('7D11', 543, 1350, 60, 110, '雙人病室', '7D', 26.9, 'PATIENT_ROOM'),
    ('7D15', 725, 1350, 65, 110, '雙人病室', '7D', 29.4, 'PATIENT_ROOM'),
    ('7D16', 790, 1350, 60, 110, '雙人病室', '7D', 29.4, 'PATIENT_ROOM'),
    ('7D17', 850, 1350, 60, 110, '單人病室', '7D', 26.8, 'PATIENT_ROOM'),
    ('7D18', 910, 1350, 65, 110, '單人病室', '7D', 26.8, 'PATIENT_ROOM'),
    ('7D21', 825, 1160, 65, 140, '三人病室', '7D', 36.5, 'PATIENT_ROOM'),
    ('7D20', 890, 1160, 65, 140, '三人病室', '7D', 36.5, 'PATIENT_ROOM'),
    ('7D19', 955, 1160, 50, 140, '單人病室', '7D', 25.0, 'PATIENT_ROOM'),
    ('7D22', 1005, 1160, 50, 140, '負壓隔離病房', '7D', 26.5, 'ISOLATION'),
    ('7D-DIRTY', 410, 1210, 40, 50, '7D 污物室', '7D', 3.6, 'DIRTY_UTILITY'),
    ('7D-CLEAN', 340, 1260, 35, 45, '7D 清潔間', '7D', 3.0, 'CLEAN_UTILITY'),
]

bed_rules = {
    '01': 3, '02': 3, '03': 1, '05': 1, '06': 1,
    '07': 2, '08': 2, '09': 2, '10': 2, '11': 2, '12': 2, '13': 2,
    '15': 2, '16': 2, '17': 1, '18': 1, '19': 1, '20': 3, '21': 3, '22': 1
}

def generate_beds(room_3d, room_code, ward, bed_count):
    beds = []
    rx, rz = room_3d['x'], room_3d['z']
    rw, rd = room_3d['width'], room_3d['depth']
    bw, bd = 0.9, 1.8
    if bed_count == 1:
        beds.append({'bedId': f'{room_code}-1', 'roomCode': room_code, 'ward': ward, 'x': rx, 'y': room_3d['y'] + 0.35, 'z': rz, 'width': bw, 'depth': bd, 'height': 0.7, 'rotation': 0})
    elif bed_count == 2:
        dx = rw * 0.25
        beds.append({'bedId': f'{room_code}-1', 'roomCode': room_code, 'ward': ward, 'x': round(rx - dx, 2), 'y': room_3d['y'] + 0.35, 'z': rz, 'width': bw, 'depth': bd, 'height': 0.7, 'rotation': 0})
        beds.append({'bedId': f'{room_code}-2', 'roomCode': room_code, 'ward': ward, 'x': round(rx + dx, 2), 'y': room_3d['y'] + 0.35, 'z': rz, 'width': bw, 'depth': bd, 'height': 0.7, 'rotation': 0})
    elif bed_count >= 3:
        dx = rw * 0.25
        dz = rd * 0.25
        positions = [(rx - dx, rz - dz), (rx + dx, rz - dz), (rx - dx, rz + dz), (rx + dx, rz + dz)]
        for idx in range(bed_count):
            bx, bz = positions[idx]
            beds.append({'bedId': f'{room_code}-{idx+1}', 'roomCode': room_code, 'ward': ward, 'x': round(bx, 2), 'y': room_3d['y'] + 0.35, 'z': round(bz, 2), 'width': bw, 'depth': bd, 'height': 0.7, 'rotation': 0})
    return beds

rooms_7f = []
all_beds_7f = []
for code, px, py, pw, ph, r_type, ward, area, category in rooms_7f_raw:
    room_geo = to_3d(px, py, pw, ph, floor_y=0.0)
    suffix = code[-2:]
    b_count = 0
    if category in ['PATIENT_ROOM', 'ISOLATION']:
        b_count = bed_rules.get(suffix, 1)
        if category == 'ISOLATION': b_count = 1
    beds = generate_beds(room_geo, code, ward, b_count)
    all_beds_7f.extend(beds)
    rooms_7f.append({
        'roomCode': code, 'roomName': f'{code} {r_type}', 'ward': ward, 'roomType': r_type,
        'category': category, 'areaPing': round(area * 0.3025, 1), 'areaM2': area,
        'bounds': room_geo, 'bedCount': len(beds), 'beds': [b['bedId'] for b in beds]
    })

ns_list_7f = [
    {'id': 'NS-7A', 'name': '7A護理站', 'ward': '7A', 'bounds': to_3d(430, 230, 100, 100), 'color': '#00bcd4'},
    {'id': 'NS-7B', 'name': '7B護理站', 'ward': '7B', 'bounds': to_3d(430, 410, 100, 100), 'color': '#2196f3'},
    {'id': 'NS-7C', 'name': '7C護理站', 'ward': '7C', 'bounds': to_3d(525, 930, 100, 100), 'color': '#4caf50'},
    {'id': 'NS-7D', 'name': '7D護理站', 'ward': '7D', 'bounds': to_3d(525, 1190, 100, 100), 'color': '#ff9800'}
]

fac_list_7f = [
    {'id': 'FAC-ELEV-VIS', 'name': '訪客電梯廳', 'type': 'elevator', 'bounds': to_3d(390, 1080, 95, 55)},
    {'id': 'FAC-ELEV-BED-N', 'name': '北病床電梯廳', 'type': 'elevator', 'bounds': to_3d(540, 370, 110, 50)},
    {'id': 'FAC-ELEV-BED-S', 'name': '南病床電梯廳', 'type': 'elevator', 'bounds': to_3d(660, 1080, 100, 55)},
    {'id': 'FAC-ELEV-CARGO', 'name': '載物電梯室', 'type': 'elevator', 'bounds': to_3d(580, 320, 70, 45)},
    {'id': 'FAC-STAIR-N1', 'name': 'N1安全梯', 'type': 'stair', 'bounds': to_3d(45, 50, 45, 50)},
    {'id': 'FAC-STAIR-N2', 'name': 'N2安全梯', 'type': 'stair', 'bounds': to_3d(885, 50, 45, 50)},
    {'id': 'FAC-STAIR-S4', 'name': 'S4安全梯', 'type': 'stair', 'bounds': to_3d(140, 1360, 45, 50)},
    {'id': 'FAC-STAIR-S5', 'name': 'S5安全梯', 'type': 'stair', 'bounds': to_3d(975, 1360, 45, 50)},
]

corridors_7f = [
    {'id': 'CORR-SPINE', 'name': '南北中央穿廊', 'bounds': to_3d(485, 340, 50, 850)},
    {'id': 'CORR-7A', 'name': '7A病房走道', 'bounds': to_3d(220, 145, 560, 50)},
    {'id': 'CORR-7B', 'name': '7B病房走道', 'bounds': to_3d(200, 520, 660, 50)},
    {'id': 'CORR-7C', 'name': '7C病房走道', 'bounds': to_3d(310, 905, 650, 50)},
    {'id': 'CORR-7D', 'name': '7D病房走道', 'bounds': to_3d(310, 1300, 650, 50)},
]

# ==================== 西址 (West Campus) 官方配置圖與病房定義 ====================
# 西址大樓歷史長廊與分棟配置 (依據台大官網 fid=3063 西址平面圖)
west_wings = [
    {'id': 'WING-LOBBY', 'name': '中央大廳 (常德街正門入口)', 'code': 'LOBBY', 'bounds': {'x': 0, 'y': 0, 'z': -54, 'width': 26, 'depth': 18, 'height': 3.5}, 'color': '#b91c1c'},
    {'id': 'WING-SPINE', 'name': '中央紅磚主長廊 (Central Spine)', 'code': 'SPINE', 'bounds': {'x': 0, 'y': 0, 'z': 0, 'width': 7, 'depth': 110, 'height': 2.5}, 'color': '#991b1b'},
    {'id': 'WING-1W2W', 'name': '一西 / 二西棟 (門診/內科病房)', 'code': '1W2W', 'bounds': {'x': -28, 'y': 0, 'z': -40, 'width': 44, 'depth': 14, 'height': 3.0}, 'color': '#0284c7', 'activeCases': 1},
    {'id': 'WING-3W', 'name': '三西病房棟 (03W2 精神病房)', 'code': '3W', 'bounds': {'x': -28, 'y': 0, 'z': -15, 'width': 44, 'depth': 14, 'height': 3.0}, 'color': '#0284c7', 'activeCases': 1},
    {'id': 'WING-4W', 'name': '四西病房棟 (4W1/4W2 骨科/整形外科)', 'code': '4W', 'bounds': {'x': -30, 'y': 0, 'z': 12, 'width': 48, 'depth': 15, 'height': 3.0}, 'color': '#0284c7', 'activeCases': 2},
    {'id': 'WING-5W', 'name': '五西病房棟 (5W1/5W2/5W3 胸腔外科/外科)', 'code': '5W', 'bounds': {'x': -32, 'y': 0, 'z': 38, 'width': 52, 'depth': 16, 'height': 3.0}, 'color': '#0284c7', 'hasDetailedHD': True, 'activeCases': 4},
    {'id': 'WING-6W', 'name': '六西病房棟 (6W3 內科病房)', 'code': '6W', 'bounds': {'x': -32, 'y': 0, 'z': 62, 'width': 50, 'depth': 15, 'height': 3.0}, 'color': '#0284c7', 'activeCases': 1},
    # 東翼對稱部分
    {'id': 'WING-1E2E', 'name': '東一 / 東二棟 (檢驗處/領藥處)', 'code': '1E2E', 'bounds': {'x': 28, 'y': 0, 'z': -40, 'width': 44, 'depth': 14, 'height': 3.0}, 'color': '#334155'},
    {'id': 'WING-3E', 'name': '東三棟 (公務病房)', 'code': '3E', 'bounds': {'x': 28, 'y': 0, 'z': -15, 'width': 44, 'depth': 14, 'height': 3.0}, 'color': '#334155'},
    {'id': 'WING-4E', 'name': '東四棟 (研究室/病房)', 'code': '4E', 'bounds': {'x': 30, 'y': 0, 'z': 12, 'width': 48, 'depth': 15, 'height': 3.0}, 'color': '#334155'},
    {'id': 'WING-5E', 'name': '東五棟 (加護中心)', 'code': '5E', 'bounds': {'x': 32, 'y': 0, 'z': 38, 'width': 52, 'depth': 16, 'height': 3.0}, 'color': '#334155'},
]

# 西址 5W2 (五西二病房) 高解析度細部病房配置 (依據 I1007_BEDINFOINF.xlsx 實際床位主檔)
# 5W2 沿走道兩側奇數房號分佈，包含病室、5W2 污物室、5W2 清潔間、5W2-27 負壓隔離房
# 完全排除浴廁、管道間、封閉管道
rooms_5w2_raw = [
    # 北側排房
    ('5W2-01', -52.0, 33.0, 5.0, 6.5, '三人病室', 3, 37.0, 'PATIENT_ROOM'),
    ('5W2-03', -46.5, 33.0, 5.0, 6.5, '三人病室', 3, 37.0, 'PATIENT_ROOM'),
    ('5W2-05', -41.0, 33.0, 4.5, 6.5, '單人病室', 1, 26.0, 'PATIENT_ROOM'),
    ('5W2-07', -36.0, 33.0, 4.5, 6.5, '單人病室', 1, 26.0, 'PATIENT_ROOM'),
    ('5W2-09', -31.0, 33.0, 4.5, 6.5, '單人病室', 1, 26.0, 'PATIENT_ROOM'),
    ('5W2-11', -26.0, 33.0, 4.8, 6.5, '雙人病室', 2, 28.5, 'PATIENT_ROOM'),
    ('5W2-13', -20.5, 33.0, 5.2, 6.5, '三人病室', 3, 37.0, 'PATIENT_ROOM'),
    ('5W2-15', -15.0, 33.0, 5.2, 6.5, '三人病室', 3, 37.0, 'PATIENT_ROOM'),
    # 南側排房
    ('5W2-17', -52.0, 43.0, 5.0, 6.5, '三人病室', 3, 37.0, 'PATIENT_ROOM'),
    ('5W2-19', -46.5, 43.0, 4.8, 6.5, '雙人病室', 2, 28.5, 'PATIENT_ROOM'),
    ('5W2-21', -41.0, 43.0, 4.8, 6.5, '雙人病室', 2, 28.5, 'PATIENT_ROOM'),
    ('5W2-23', -36.0, 43.0, 4.8, 6.5, '雙人病室', 2, 28.5, 'PATIENT_ROOM'),
    ('5W2-25', -31.0, 43.0, 4.8, 6.5, '雙人病室', 2, 28.5, 'PATIENT_ROOM'),
    ('5W2-27', -26.0, 43.0, 4.8, 6.5, '負壓隔離病房', 2, 28.5, 'ISOLATION'),
    ('5W2-29', -20.5, 43.0, 5.2, 6.5, '三人病室', 3, 37.0, 'PATIENT_ROOM'),
    ('5W2-31', -15.0, 43.0, 5.2, 6.5, '三人病室', 3, 37.0, 'PATIENT_ROOM'),
    # 5W2 污物室與清潔間
    ('5W2-DIRTY', -9.0, 33.0, 3.8, 5.5, '5W2 污物室', 0, 19.8, 'DIRTY_UTILITY'),
    ('5W2-CLEAN', -9.0, 43.0, 3.8, 5.5, '5W2 清潔間', 0, 18.0, 'CLEAN_UTILITY'),
]

rooms_5w2 = []
beds_5w2 = []
for code, x, z, w, d, r_type, b_count, area, cat in rooms_5w2_raw:
    room_geo = {'x': round(x, 2), 'y': 0.0, 'z': round(z, 2), 'width': round(w, 2), 'depth': round(d, 2), 'height': 1.2}
    r_beds = generate_beds(room_geo, code, '5W2', b_count)
    beds_5w2.extend(r_beds)
    rooms_5w2.append({
        'roomCode': code, 'roomName': f'{code} {r_type}', 'ward': '5W2', 'roomType': r_type,
        'category': cat, 'areaPing': round(area * 0.3025, 1), 'areaM2': area,
        'bounds': room_geo, 'bedCount': len(r_beds), 'beds': [b['bedId'] for b in r_beds]
    })

ns_5w2 = [
    {'id': 'NS-5W2', 'name': '5W2 護理站', 'ward': '5W2', 'bounds': {'x': -3.5, 'y': 0.0, 'z': 38.0, 'width': 5.5, 'depth': 6.0, 'height': 1.1}, 'color': '#0ea5e9'}
]

corridors_5w2 = [
    {'id': 'CORR-5W2', 'name': '5W2 病房中央走道', 'bounds': {'x': -33.5, 'y': 0.0, 'z': 38.0, 'width': 45.0, 'depth': 3.5, 'height': 0.05}}
]

# 整合總 Layout
full_layout = {
    'currentCampus': 'east',
    'campuses': {
        'east': {
            'id': 'E01',
            'name': '總院東址大樓 (National Taiwan University Hospital East Campus)',
            'scale': SCALE,
            'dimensions': {'width': 82.0, 'depth': 118.0, 'totalHeight': 68.0},
            'floors': [
                {'floor': '3F', 'name': '3樓 加護與心導管中心', 'level': 3, 'y': 12.0, 'height': 3.8, 'type': 'ICU/Burn'},
                {'floor': '4F', 'name': '4樓 手術室與恢復室', 'level': 4, 'y': 16.0, 'height': 3.8, 'type': 'OR/ICU'},
                {'floor': '5F', 'name': '5樓 住院病房區', 'level': 5, 'y': 20.0, 'height': 3.8, 'type': 'Ward'},
                {'floor': '6F', 'name': '6樓 住院病房區', 'level': 6, 'y': 24.0, 'height': 3.8, 'type': 'Ward'},
                {'floor': '7F', 'name': '7樓 感管示範綜合病房 (7A/7B/7C/7D)', 'level': 7, 'y': 28.0, 'height': 3.8, 'type': 'Ward_HD', 'isHD': True},
                {'floor': '8F', 'name': '8樓 住院病房區', 'level': 8, 'y': 32.0, 'height': 3.8, 'type': 'Ward'},
                {'floor': '9F', 'name': '9樓 住院病房區', 'level': 9, 'y': 36.0, 'height': 3.8, 'type': 'Ward'},
                {'floor': '10F', 'name': '10樓 住院調劑與行政中心', 'level': 10, 'y': 40.0, 'height': 3.8, 'type': 'Pharmacy'},
                {'floor': '11F', 'name': '11樓 住院病房區', 'level': 11, 'y': 44.0, 'height': 3.8, 'type': 'Ward'},
                {'floor': '12F', 'name': '12樓 住院病房區', 'level': 12, 'y': 48.0, 'height': 3.8, 'type': 'Ward'},
                {'floor': '13F', 'name': '13樓 住院病房區', 'level': 13, 'y': 52.0, 'height': 3.8, 'type': 'Ward'},
                {'floor': '14F', 'name': '14樓 住院病房區', 'level': 14, 'y': 56.0, 'height': 3.8, 'type': 'Ward'},
                {'floor': '15F', 'name': '15樓 住院病房區', 'level': 15, 'y': 60.0, 'height': 3.8, 'type': 'Ward'},
            ],
            'floor7F': {
                'nursingStations': ns_list_7f,
                'facilities': fac_list_7f,
                'corridors': corridors_7f,
                'rooms': rooms_7f,
                'beds': all_beds_7f,
                'waypoints': [
                    {'id': 'WP-ELEV-VIS', 'name': '訪客電梯廳', 'x': 0.0, 'y': 0.5, 'z': 0.0},
                    {'id': 'WP-CORR-7D', 'name': '7D走道分流點', 'x': 12.0, 'y': 0.5, 'z': 8.0},
                    {'id': 'WP-CORR-7B', 'name': '7B走道分流點', 'x': -12.0, 'y': 0.5, 'z': 8.0},
                    {'id': 'WP-CORR-7A', 'name': '7A走道分流點', 'x': -12.0, 'y': 0.5, 'z': -8.0},
                    {'id': 'WP-NS-7D', 'name': '7D護理站', 'x': 18.0, 'y': 0.5, 'z': 12.0},
                    {'id': 'WP-7D-EAST', 'name': '7D20/7D22病室區', 'x': 28.0, 'y': 0.5, 'z': 24.0},
                    {'id': 'WP-7D-WEST', 'name': '7D01/7D02病室區', 'x': 15.0, 'y': 0.5, 'z': 30.0},
                    {'id': 'WP-NS-7C', 'name': '7C護理站', 'x': 18.0, 'y': 0.5, 'z': -12.0},
                    {'id': 'WP-NS-7B', 'name': '7B護理站', 'x': -18.0, 'y': 0.5, 'z': 12.0},
                    {'id': 'WP-NS-7A', 'name': '7A護理站', 'x': -18.0, 'y': 0.5, 'z': -12.0},
                ],
                'waypointEdges': [
                    ['WP-ELEV-VIS', 'WP-CORR-7D'],
                    ['WP-ELEV-VIS', 'WP-CORR-7B'],
                    ['WP-ELEV-VIS', 'WP-CORR-7A'],
                    ['WP-CORR-7D', 'WP-NS-7D'],
                    ['WP-NS-7D', 'WP-7D-EAST'],
                    ['WP-NS-7D', 'WP-7D-WEST'],
                    ['WP-CORR-7D', 'WP-NS-7C'],
                    ['WP-CORR-7B', 'WP-NS-7B'],
                    ['WP-CORR-7A', 'WP-NS-7A'],
                ]
            }
        },
        'west': {
            'id': 'W00',
            'name': '總院西址歷史大樓 (West Campus Historic Main Building)',
            'description': '依據台大官網西址平面圖 (fid=3063) 呈現文藝復興大廳、中央主長廊與各翼病房棟',
            'dimensions': {'width': 110.0, 'depth': 140.0, 'totalHeight': 18.0},
            'wings': west_wings,
            'ward5W2': {
                'ward': '5W2',
                'name': '五西二病房 (5W2 胸腔外科/外科)',
                'nursingStations': ns_5w2,
                'corridors': corridors_5w2,
                'rooms': rooms_5w2,
                'beds': beds_5w2,
                'summary': {
                    'totalRooms': len(rooms_5w2),
                    'totalBeds': len(beds_5w2),
                    'patientRooms': sum(1 for r in rooms_5w2 if r['category'] == 'PATIENT_ROOM'),
                    'isolationRooms': sum(1 for r in rooms_5w2 if r['category'] == 'ISOLATION'),
                    'dirtyUtilityRooms': sum(1 for r in rooms_5w2 if r['category'] == 'DIRTY_UTILITY'),
                    'cleanUtilityRooms': sum(1 for r in rooms_5w2 if r['category'] == 'CLEAN_UTILITY')
                }
            }
        }
    }
}

os.makedirs('smart-ipc-3d/data', exist_ok=True)
with open('smart-ipc-3d/data/ward_layout.json', 'w', encoding='utf-8') as f:
    json.dump(full_layout, f, ensure_ascii=False, indent=2)

print('ward_layout.json updated with both East Campus and West Campus data!')

# ==================== 動態個案資料 (包含東址與西址 5W2) ====================
cases = [
    # 東址個案
    {
        'case_id': 'CASE-2026-001', 'pathogen': 'CRAB', 'sample_date': '2026-10-03', 'infection_site': 'Sputum (痰液)',
        'isolation_type': '接觸隔離 (Contact Precautions)', 'device_days': {'CVC': 8, 'Foley': 14, 'Endotracheal': 6},
        'movement_history': [
            {'start_date': '2026-10-01', 'end_date': '2026-10-06', 'bed_id': '7D01-1', 'ward': '7D', 'room': '7D01', 'campus': 'east'},
            {'start_date': '2026-10-06', 'end_date': '2026-10-15', 'bed_id': '7D22-1', 'ward': '7D', 'room': '7D22', 'campus': 'east'}
        ]
    },
    {
        'case_id': 'CASE-2026-002', 'pathogen': 'CRAB', 'sample_date': '2026-10-04', 'infection_site': 'Sputum (痰液)',
        'isolation_type': '接觸隔離 (Contact Precautions)', 'device_days': {'CVC': 5, 'Foley': 9, 'Endotracheal': 0},
        'movement_history': [
            {'start_date': '2026-10-02', 'end_date': '2026-10-10', 'bed_id': '7D01-2', 'ward': '7D', 'room': '7D01', 'campus': 'east'},
            {'start_date': '2026-10-10', 'end_date': '2026-10-15', 'bed_id': '7D20-1', 'ward': '7D', 'room': '7D20', 'campus': 'east'}
        ]
    },
    {
        'case_id': 'CASE-2026-003', 'pathogen': 'NORMAL', 'sample_date': None, 'infection_site': '無感染',
        'isolation_type': '常規防護', 'device_days': {'CVC': 0, 'Foley': 3, 'Endotracheal': 0},
        'movement_history': [
            {'start_date': '2026-10-01', 'end_date': '2026-10-05', 'bed_id': '7D01-3', 'ward': '7D', 'room': '7D01', 'campus': 'east'},
            {'start_date': '2026-10-05', 'end_date': '2026-10-12', 'bed_id': '7D07-1', 'ward': '7D', 'room': '7D07', 'campus': 'east'}
        ]
    },
    # 西址 5W2 個案
    {
        'case_id': 'CASE-2026-W01', 'pathogen': 'CRE', 'sample_date': '2026-10-04', 'infection_site': 'Urine (尿液)',
        'isolation_type': '接觸隔離 (Contact Precautions)', 'device_days': {'CVC': 4, 'Foley': 12, 'Endotracheal': 0},
        'movement_history': [
            {'start_date': '2026-10-01', 'end_date': '2026-10-07', 'bed_id': '5W2-01-1', 'ward': '5W2', 'room': '5W2-01', 'campus': 'west'},
            {'start_date': '2026-10-07', 'end_date': '2026-10-15', 'bed_id': '5W2-27-1', 'ward': '5W2', 'room': '5W2-27', 'campus': 'west'}
        ]
    },
    {
        'case_id': 'CASE-2026-W02', 'pathogen': 'CRE', 'sample_date': '2026-10-05', 'infection_site': 'Sputum (痰液)',
        'isolation_type': '接觸隔離 (Contact Precautions)', 'device_days': {'CVC': 6, 'Foley': 7, 'Endotracheal': 0},
        'movement_history': [
            {'start_date': '2026-10-02', 'end_date': '2026-10-12', 'bed_id': '5W2-01-2', 'ward': '5W2', 'room': '5W2-01', 'campus': 'west'}
        ]
    },
    {
        'case_id': 'CASE-2026-W03', 'pathogen': 'VRE', 'sample_date': '2026-10-03', 'infection_site': 'Wound (傷口分泌物)',
        'isolation_type': '接觸隔離 (Contact Precautions)', 'device_days': {'CVC': 9, 'Foley': 15, 'Endotracheal': 0},
        'movement_history': [
            {'start_date': '2026-10-01', 'end_date': '2026-10-14', 'bed_id': '5W2-13-1', 'ward': '5W2', 'room': '5W2-13', 'campus': 'west'}
        ]
    },
    {
        'case_id': 'CASE-2026-W04', 'pathogen': 'MRSA', 'sample_date': '2026-10-06', 'infection_site': 'Blood (菌血症)',
        'isolation_type': '接觸隔離 (Contact Precautions)', 'device_days': {'CVC': 11, 'Foley': 8, 'Endotracheal': 3},
        'movement_history': [
            {'start_date': '2026-10-03', 'end_date': '2026-10-15', 'bed_id': '5W2-17-2', 'ward': '5W2', 'room': '5W2-17', 'campus': 'west'}
        ]
    }
]

# 隨機填入西址 5W2 其餘佔床
random.seed(99)
w_counter = 5
for b in beds_5w2:
    bid = b['bedId']
    if any(any(m['bed_id'] == bid for m in c['movement_history']) for c in cases): continue
    if random.random() < 0.65:
        c_code = f'CASE-2026-W{w_counter:02d}'
        w_counter += 1
        cases.append({
            'case_id': c_code, 'pathogen': 'NORMAL', 'sample_date': None, 'infection_site': '無感染',
            'isolation_type': '常規防護', 'device_days': {'CVC': 0, 'Foley': 2, 'Endotracheal': 0},
            'movement_history': [{'start_date': '2026-10-01', 'end_date': '2026-10-15', 'bed_id': bid, 'ward': '5W2', 'room': b['roomCode'], 'campus': 'west'}]
        })

# 隨機填入東址 7F 其餘佔床
e_counter = 4
for b in all_beds_7f:
    bid = b['bedId']
    if any(any(m['bed_id'] == bid for m in c['movement_history']) for c in cases): continue
    if random.random() < 0.65:
        c_code = f'CASE-2026-{e_counter:03d}'
        e_counter += 1
        cases.append({
            'case_id': c_code, 'pathogen': 'NORMAL', 'sample_date': None, 'infection_site': '無感染',
            'isolation_type': '常規防護', 'device_days': {'CVC': 0, 'Foley': 2, 'Endotracheal': 0},
            'movement_history': [{'start_date': '2026-10-01', 'end_date': '2026-10-15', 'bed_id': bid, 'ward': b['ward'], 'room': b['roomCode'], 'campus': 'east'}]
        })

movements_data = {
    'timeline_range': {'start_date': '2026-10-01', 'end_date': '2026-10-15', 'default_date': '2026-10-06'},
    'cases': cases
}

with open('smart-ipc-3d/data/movements.json', 'w', encoding='utf-8') as f:
    json.dump(movements_data, f, ensure_ascii=False, indent=2)

print(f'movements.json updated with {len(cases)} total cases across East & West campuses.')
