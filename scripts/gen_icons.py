from PIL import Image
import os, shutil

src = "icons/mipmap-xxxhdpi/ic_launcher.png"
img = Image.open(src).convert("RGBA")

configs = [
  ("mipmap-mdpi", 48),
  ("mipmap-hdpi", 72),
  ("mipmap-xhdpi", 96),
  ("mipmap-xxhdpi", 144),
  ("mipmap-xxxhdpi", 192),
]

base = "android/app/src/main/res"
for folder, size in configs:
    path = os.path.join(base, folder)
    os.makedirs(path, exist_ok=True)
    resized = img.resize((size, size), Image.LANCZOS)
    resized.save(os.path.join(path, "ic_launcher.png"))
    resized.save(os.path.join(path, "ic_launcher_round.png"))
    print(f"Done {folder} {size}px")

anydpi = os.path.join(base, "mipmap-anydpi-v26")
if os.path.exists(anydpi):
    shutil.rmtree(anydpi)
    print("Removed mipmap-anydpi-v26")
