import json
from datetime import datetime, timedelta
from http.server import BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse

import pytz
from astral import LocationInfo
from astral.sun import sun


LOCATIONS = {
    "cancun": {
        "name": "Playa en Cancún",
        "latitude": 21.1619,
        "longitude": -86.8515,
        "timezone": "America/Cancun",
    },
    "merida": {
        "name": "Hacienda en Mérida",
        "latitude": 20.9674,
        "longitude": -89.5926,
        "timezone": "America/Merida",
    },
    "tulum": {
        "name": "Cenote / Hotel en Tulum",
        "latitude": 20.2114,
        "longitude": -87.4654,
        "timezone": "America/Cancun",
    },
    "playa": {
        "name": "Riviera Maya / Playa del Carmen",
        "latitude": 20.6296,
        "longitude": -87.0739,
        "timezone": "America/Cancun",
    },
}


def format_time(value):
    return value.strftime("%I:%M %p")


def build_response(date_value, location_key):
    if location_key not in LOCATIONS:
        raise ValueError("La ubicación no es válida.")

    try:
        wedding_date = datetime.strptime(date_value, "%Y-%m-%d").date()
    except (TypeError, ValueError) as exc:
        raise ValueError("La fecha debe tener el formato YYYY-MM-DD.") from exc

    location_data = LOCATIONS[location_key]
    timezone = pytz.timezone(location_data["timezone"])
    location = LocationInfo(
        location_data["name"],
        "México",
        location_data["timezone"],
        location_data["latitude"],
        location_data["longitude"],
    )
    solar_events = sun(location.observer, date=wedding_date, tzinfo=timezone)
    sunset = solar_events["sunset"]
    golden_hour_start = sunset - timedelta(hours=1)
    blue_hour_end = sunset + timedelta(minutes=20)
    ceremony = sunset - timedelta(hours=1, minutes=15)

    timeline = [
        {"event": "Getting Ready", "time": format_time(ceremony - timedelta(hours=3))},
        {"event": "First Look / Retratos", "time": format_time(ceremony - timedelta(hours=1))},
        {"event": "Ceremonia (Luz dorada)", "time": format_time(ceremony)},
        {"event": "Sesión de Pareja", "time": format_time(golden_hour_start)},
        {"event": "Recepción / Fiesta", "time": format_time(sunset)},
    ]

    return {
        "date": wedding_date.isoformat(),
        "location": location_key,
        "location_name": location_data["name"],
        "timezone": location_data["timezone"],
        "sunset": format_time(sunset),
        "golden_hour_start": format_time(golden_hour_start),
        "blue_hour_end": format_time(blue_hour_end),
        "recommended_ceremony": format_time(ceremony),
        "timeline": timeline,
        "note": "Los horarios son una guía basada en la posición solar y pueden ajustarse según el venue y las condiciones climáticas.",
    }


class handler(BaseHTTPRequestHandler):
    def _send_json(self, status_code, payload):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Cache-Control", "public, max-age=86400, s-maxage=604800")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self._send_json(204, {})

    def do_GET(self):
        query = parse_qs(urlparse(self.path).query)
        date_value = query.get("date", [None])[0]
        location_key = query.get("location", [None])[0]

        if not date_value or not location_key:
            self._send_json(400, {"error": "Los parámetros date y location son obligatorios."})
            return

        try:
            self._send_json(200, build_response(date_value, location_key))
        except ValueError as error:
            self._send_json(400, {"error": str(error)})
        except Exception:
            self._send_json(500, {"error": "No fue posible calcular la luz para esta fecha."})
