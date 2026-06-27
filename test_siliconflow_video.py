with open("e:\\pixelda\\logs\\pixelda_server.log", "r", encoding="utf-8") as f:
    lines = f.readlines()

for line in lines:
    if "0nvf6ql97d6s" in line:
        print(line.strip())
