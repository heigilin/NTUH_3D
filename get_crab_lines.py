import sys

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

lines = text.splitlines()
out = []
for i, l in enumerate(lines):
    if 'CRAB' in l:
        out.append(f"Line {i+1}:")
        for j in range(max(0, i-4), min(len(lines), i+6)):
            out.append(f"  {j+1}: {lines[j]}")
        out.append("="*40)

with open('crab_lines.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(out))
print("Saved crab_lines.txt")
