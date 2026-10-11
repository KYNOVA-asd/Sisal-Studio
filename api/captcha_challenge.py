import hashlib
import hmac
import json
import os
import secrets
import time
from http.server import BaseHTTPRequestHandler


def sign(payload):
    secret = os.environ.get("CAPTCHA_SECRET_KEY", "").encode("utf-8")
    if not secret:
        raise RuntimeError("CAPTCHA_SECRET_KEY no está configurada.")
    return hmac.new(secret, payload.encode("utf-8"), hashlib.sha256).hexdigest()


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            issued = int(time.time())
            nonce = secrets.token_urlsafe(10)
            payload = f"human:{issued}:{nonce}"
            body = json.dumps({
                "challenge": payload,
                "signature": sign(payload),
            }, ensure_ascii=False).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Cache-Control", "no-store")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        except Exception:
            body = json.dumps({"error": "No se pudo crear la verificación."}).encode()
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
