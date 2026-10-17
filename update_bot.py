import json
import os

DATA_FILE = "data.json"

def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {
        "MEGA 6/45": [],
        "POWER 6/55": [],
        "MAX 3D PRO": [],
        "KENO": [],
        "LOTTO 5/35": [],
        "XSKT (GĐB)": []
    }

def save_data(data):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

def add_new_draw(game_name, new_numbers):
    data = load_data()
    if game_name in data:
        data[game_name].insert(0, new_numbers)
        save_data(data)
        print(f"Đã cập nhật kỳ quay mới cho {game_name}: {new_numbers}")

if __name__ == "__main__":
    # Test thử thêm một kỳ quay mẫu
    sample_result = ["03", "15", "22", "31", "40", "44"]
    add_new_draw("MEGA 6/45", sample_result)
