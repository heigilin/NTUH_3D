with open('js/data/floorplans-data.js', 'r', encoding='utf-8') as f:
    for line in f:
        if ': {' in line:
            print(line.strip())
