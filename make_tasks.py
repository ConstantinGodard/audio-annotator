import copy, json, shutil
from pathlib import Path
from urllib.parse import quote

AUDIO_ROOT = Path("static/audio")
JSON_PATH = Path("static/json/sample_data.json")
BACKUP = JSON_PATH.with_suffix(".json.bak")

if not BACKUP.exists():
    shutil.copy(JSON_PATH, BACKUP)

data = json.loads(BACKUP.read_text(encoding="utf-8"))

# Localise la liste de tâches : racine, ou une clé du dict racine
if isinstance(data, list):
    container, key, tasks = None, None, data
elif isinstance(data, dict):
    container, key, tasks = data, None, None
    for k, v in data.items():
        if isinstance(v, list) and v and isinstance(v[0], dict):
            key, tasks = k, v
            break
    if tasks is None:
        raise SystemExit("Structure inconnue, clés à la racine : " + str(list(data.keys())))
else:
    raise SystemExit("Type inattendu : " + str(type(data)))

template = tasks[0]
out = []
for wav in sorted(AUDIO_ROOT.rglob("*.wav")):
    t = copy.deepcopy(template)
    t["url"] = "/" + quote(wav.as_posix())
    out.append(t)

if container is None:
    result = out
else:
    container[key] = out
    result = container

JSON_PATH.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
print(len(out), "audios ajoutés")