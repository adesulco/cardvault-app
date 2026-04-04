import urllib.request
import urllib.parse
import re
import os

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

def get_image(query, filename):
    url = "https://duckduckgo.com/html/?q=" + urllib.parse.quote(query)
    req = urllib.request.Request(url, headers=HEADERS)
    html = urllib.request.urlopen(req).read().decode('utf-8')
    images = re.findall(r'src="//external-content\.duckduckgo\.com/iu/\?u=([^&;]+)', html)
    if images:
        img_url = urllib.parse.unquote(images[0])
        print(f"Downloading {img_url} to {filename}...")
        img_req = urllib.request.Request(img_url, headers=HEADERS)
        with open(f"public/images/{filename}", 'wb') as f:
            f.write(urllib.request.urlopen(img_req).read())
        return f"/images/{filename}"
    return None

os.makedirs("public/images", exist_ok=True)
ohtani = get_image("Shohei Ohtani Topps Chrome Rookie Auto slab PSA 10", "ohtani-psa10.jpg")
lotus = get_image("MTG Alpha Black Lotus graded PSA 10 slab", "lotus-psa10.jpg")

with open("update_db.js", "w") as f:
    f.write(f"""
const {{ PrismaClient }} = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {{
  const lotus = await prisma.card.findFirst({{ where: {{ cardName: {{ contains: 'Lotus' }} }} }});
  if (lotus) await prisma.card.update({{ where: {{ id: lotus.id }}, data: {{ images: ['{lotus}'], gradingCompany: 'PSA', grade: '10' }} }});
  
  const ohtani = await prisma.card.findFirst({{ where: {{ cardName: {{ contains: 'Ohtani' }} }} }});
  if (ohtani) await prisma.card.update({{ where: {{ id: ohtani.id }}, data: {{ images: ['{ohtani}'] }} }});
  
  console.log('DB Updated');
}}
main().finally(() => prisma.$disconnect());
    """)
