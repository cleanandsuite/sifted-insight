import json
from collections import defaultdict

with open('scraped_articles.json') as f:
    d = json.load(f)
print(f'Total: {len(d)} articles')
print(f'With images: {sum(1 for a in d if a.get("image_url"))}')
print()

# Stats by source
stats = defaultdict(lambda: {'total': 0, 'with_img': 0})
for a in d:
    stats[a['source_name']]['total'] += 1
    if a.get('image_url'):
        stats[a['source_name']]['with_img'] += 1

print('Images by source:')
for src, s in sorted(stats.items()):
    print(f'  {src}: {s["with_img"]}/{s["total"]}')

print('\nAll articles:')
for a in d:
    img = a.get('image_url', '')[:50]
    print(f'{a["source_name"]:18} | {img}')
