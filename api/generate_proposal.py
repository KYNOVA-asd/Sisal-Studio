import json
from io import BytesIO
from http.server import BaseHTTPRequestHandler
from fpdf import FPDF

PACKAGES = {
    "esencial": {"name": "Colección Esencial", "hours": "6 horas", "price": "$38,000 MXN", "items": ["Cobertura documental", "Galería digital privada", "300+ fotografías editadas"]},
    "editorial": {"name": "Colección Editorial", "hours": "9 horas", "price": "$56,000 MXN", "items": ["Getting Ready a recepción", "Segundo fotógrafo", "Galería privada", "500+ fotografías editadas"]},
    "legado": {"name": "Colección Legado", "hours": "12 horas", "price": "$78,000 MXN", "items": ["Cobertura completa", "Segundo fotógrafo", "Sesión previa", "Álbum Fine Art", "700+ fotografías editadas"]},
}

class ProposalPDF(FPDF):
    def header(self):
        self.set_fill_color(250, 249, 246)
        self.rect(0, 0, 210, 297, "F")
        self.set_text_color(44, 44, 44)
        self.set_font("Helvetica", "B", 11)
        self.set_xy(18, 16)
        self.cell(0, 8, "S I S A L   S T U D I O")

def create_pdf(data):
    package = PACKAGES[data["paquete_id"]]
    pdf = ProposalPDF()
    pdf.set_auto_page_break(True, 20)
    pdf.add_page()
    pdf.set_xy(18, 48)
    pdf.set_font("Times", "", 32)
    pdf.multi_cell(170, 12, "Una propuesta para\n" + data["cliente_nombre"])
    pdf.ln(5)
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(74, 83, 70)
    pdf.cell(0, 7, f'{data["fecha_boda"]}  |  {data["venue"]}')
    pdf.ln(24)
    pdf.set_draw_color(212, 197, 185)
    pdf.line(18, pdf.get_y(), 192, pdf.get_y())
    pdf.ln(12)
    pdf.set_text_color(44, 44, 44)
    pdf.set_font("Times", "", 24)
    pdf.cell(120, 10, package["name"])
    pdf.set_font("Helvetica", "B", 11)
    pdf.cell(54, 10, package["price"], align="R")
    pdf.ln(15)
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 7, "Cobertura: " + package["hours"])
    pdf.ln(10)
    for item in package["items"]:
        pdf.cell(8, 7, "-")
        pdf.cell(0, 7, item)
        pdf.ln(8)
    pdf.ln(18)
    y = pdf.get_y()
    pdf.set_fill_color(74, 83, 70)
    pdf.rect(18, y, 174, 18, "F")
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_xy(18, y + 5)
    pdf.cell(174, 8, "CONFIRMAR DISPONIBILIDAD POR WHATSAPP", align="C", link="https://wa.me/529987449856")
    pdf.set_text_color(44, 44, 44)
    pdf.set_xy(18, y + 30)
    pdf.set_font("Helvetica", "", 8)
    pdf.multi_cell(174, 5, "Propuesta informativa sujeta a disponibilidad y confirmacion. Vigencia: 15 dias. Para reservar se requiere contrato firmado y anticipo.")
    return bytes(pdf.output())

class handler(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def do_OPTIONS(self):
        self.send_response(204); self._cors(); self.end_headers()

    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", "0"))
            data = json.loads(self.rfile.read(length))
            required = ["cliente_nombre", "fecha_boda", "venue", "paquete_id", "email", "whatsapp"]
            if any(not str(data.get(field, "")).strip() for field in required):
                raise ValueError("Todos los campos son obligatorios.")
            if data["paquete_id"] not in PACKAGES:
                raise ValueError("El paquete seleccionado no existe.")
            content = create_pdf(data)
            filename = "propuesta-sisal-studio.pdf"
            self.send_response(200); self.send_header("Content-Type", "application/pdf")
            self.send_header("Content-Disposition", f'attachment; filename="{filename}"')
            self.send_header("Content-Length", str(len(content))); self._cors(); self.end_headers(); self.wfile.write(content)
        except (ValueError, KeyError, json.JSONDecodeError) as error:
            payload = json.dumps({"error": str(error)}).encode()
            self.send_response(400); self.send_header("Content-Type", "application/json"); self.send_header("Content-Length", str(len(payload))); self._cors(); self.end_headers(); self.wfile.write(payload)
        except Exception:
            payload = json.dumps({"error": "No fue posible generar la propuesta."}).encode()
            self.send_response(500); self.send_header("Content-Type", "application/json"); self.send_header("Content-Length", str(len(payload))); self._cors(); self.end_headers(); self.wfile.write(payload)
