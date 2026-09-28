import json
from datetime import datetime
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import quote, urlparse

AUDIO_ROOT = Path("static/audio")
TEMPLATE = json.loads(Path("static/json/sample_data.json.bak").read_text(encoding="utf-8"))["task"]
RESULTS = Path("results.jsonl")

wavs = sorted(p.as_posix() for p in AUDIO_ROOT.rglob("*.wav"))
done = set()
if RESULTS.exists():
    for line in RESULTS.read_text(encoding="utf-8").splitlines():
        if line.strip():
            done.add(json.loads(line)["audio"])
state = {"current": None}


class Handler(SimpleHTTPRequestHandler):
    def _json(self, code, obj):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if urlparse(self.path).path == "/task":
            todo = [w for w in wavs if w not in done]
            if not todo:
                print("Tous les audios sont labellisés.")
                return self._json(404, {"error": "fini"})
            state["current"] = todo[0]
            task = dict(TEMPLATE)
            task["url"] = "/" + quote(todo[0])
            print(f"[{len(done) + 1}/{len(wavs)}] {todo[0]}")
            return self._json(200, {"task": task})
        return super().do_GET()

    def do_POST(self):
        if urlparse(self.path).path == "/submit":
            n = int(self.headers.get("Content-Length", 0))
            raw = self.rfile.read(n).decode("utf-8")
            try:
                payload = json.loads(raw)
            except ValueError:
                payload = {"raw": raw}
            audio = state["current"]
            if audio is None:
                return self._json(400, {"error": "aucun audio en cours"})
            with RESULTS.open("a", encoding="utf-8") as f:
                f.write(json.dumps({
                    "audio": audio,
                    "time": datetime.now().isoformat(),
                    "payload": payload,
                }, ensure_ascii=False) + "\n")
            done.add(audio)
            return self._json(200, {"ok": True})
        self.send_error(404)


if __name__ == "__main__":
    print(f"{len(wavs)} audios, {len(done)} déjà labellisés")
    ThreadingHTTPServer(("", 8000), Handler).serve_forever()