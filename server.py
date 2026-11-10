#!/usr/bin/env python3
"""VeriSight local static server + judge phone upload bridge."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse
import json, mimetypes, socket, time, uuid

ROOT = Path(__file__).resolve().parent
UPLOADS = ROOT / "uploads"
UPLOADS.mkdir(exist_ok=True)
MAX_BYTES = 12 * 1024 * 1024

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)
    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/mobile":
            self.path = "/mobile.html"
            return super().do_GET()
        if path == "/api/latest":
            files = sorted((p for p in UPLOADS.iterdir() if p.is_file() and p.name != ".gitkeep"), key=lambda p: p.stat().st_mtime, reverse=True)
            payload = {"id": files[0].name, "name": files[0].name} if files else None
            return self.reply(200, json.dumps(payload).encode(), "application/json")
        if path == "/api/info":
            return self.reply(200, json.dumps({"mobile_url": f"http://{self.server.lan_ip}:{self.server.server_port}/mobile"}).encode(), "application/json")
        if path.startswith("/api/evidence/"):
            name = Path(path.rsplit("/", 1)[-1]).name
            f = UPLOADS / name
            if not f.is_file(): return self.reply(404, b"Not found", "text/plain")
            return self.reply(200, f.read_bytes(), mimetypes.guess_type(f.name)[0] or "application/octet-stream")
        if path == "/qr.png":
            try:
                import qrcode
                url = f"http://{self.server.lan_ip}:{self.server.server_port}/mobile"
                img = qrcode.make(url)
                import io
                buf = io.BytesIO(); img.save(buf, format="PNG")
                return self.reply(200, buf.getvalue(), "image/png")
            except ImportError:
                return self.reply(503, b"Install requirements.txt to enable QR generation", "text/plain")
        return super().do_GET()
    def do_POST(self):
        if urlparse(self.path).path != "/api/upload": return self.reply(404, b"Not found", "text/plain")
        size = int(self.headers.get("Content-Length", "0"))
        if size < 1 or size > MAX_BYTES + 1024 * 1024: return self.reply(413, b'{"error":"Upload too large (12 MB maximum)."}', "application/json")
        body = self.rfile.read(size)
        ctype = self.headers.get("Content-Type", "")
        boundary = ctype.split("boundary=", 1)[-1].strip('"')
        if not boundary: return self.reply(400, b'{"error":"Expected multipart image upload."}', "application/json")
        parts = body.split(b"--" + boundary.encode())
        data = None; filename = "evidence.png"
        for part in parts:
            if b"name=\"evidence\"" not in part: continue
            head, sep, payload = part.partition(b"\r\n\r\n")
            if not sep: continue
            if b"filename=\"" in head:
                filename = head.split(b"filename=\"", 1)[1].split(b"\"", 1)[0].decode("utf-8", "replace")
            data = payload.removesuffix(b"\r\n")
            break
        if not data: return self.reply(400, b'{"error":"No image was received."}', "application/json")
        if not data.startswith((b"\x89PNG\r\n\x1a\n", b"\xff\xd8\xff", b"GIF87a", b"GIF89a", b"RIFF")):
            return self.reply(415, b'{"error":"Unsupported or invalid image file."}', "application/json")
        ext = Path(filename).suffix.lower()
        if ext not in {".png", ".jpg", ".jpeg", ".webp", ".gif"}: ext = ".img"
        ident = f"{int(time.time())}-{uuid.uuid4().hex[:8]}{ext}"
        (UPLOADS / ident).write_bytes(data)
        return self.reply(201, json.dumps({"id": ident, "name": Path(filename).name}).encode(), "application/json")
    def reply(self, code, body, content_type):
        self.send_response(code); self.send_header("Content-Type", content_type); self.send_header("Content-Length", str(len(body))); self.send_header("Cache-Control", "no-store"); self.end_headers(); self.wfile.write(body)
    def log_message(self, fmt, *args): print(f"[{self.log_date_time_string()}] {fmt % args}")

def lan_ip():
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try: sock.connect(("192.0.2.1", 80)); return sock.getsockname()[0]
    except OSError: return "127.0.0.1"
    finally: sock.close()

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Run the VeriSight prototype locally")
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()
    server = ThreadingHTTPServer(("0.0.0.0", args.port), Handler)
    server.lan_ip = lan_ip()
    print("VeriSight workbench: http://localhost:%d" % args.port)
    print("Phone intake (same Wi-Fi): http://%s:%d/mobile" % (server.lan_ip, args.port))
    print("Press Ctrl+C to stop.")
    try: server.serve_forever()
    except KeyboardInterrupt: print("\nStopping VeriSight.")
