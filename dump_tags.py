with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

with open('check_right_panel_tags.txt', 'w', encoding='utf-8') as f:
    for i in range(350, 450):
        f.write(f"{i+1}: {lines[i]}")
print("Saved check_right_panel_tags.txt")
