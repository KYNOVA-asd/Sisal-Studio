const clean = (value = '') => String(value).normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7E]/g, '')
  .replace(/[()\\]/g, '\\$&');

export const downloadDemoProposalPdf = (data) => {
  const nameCode = clean(data.cliente_nombre || 'cliente').toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 18) || 'CLIENTE';
  const day = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  const suffix = crypto.getRandomValues(new Uint32Array(1))[0].toString(36).toUpperCase().slice(0, 4).padStart(4, '0');
  const clientId = `SIS-${day}-${nameCode}-${suffix}`;
  const generatedAt = new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Cancun',
  }).format(new Date());
  const packages = { esencial: 'Coleccion Esencial - 6 horas', editorial: 'Coleccion Editorial - 9 horas', legado: 'Coleccion Legado - 12 horas' };
  const lines = [
    ['SISAL STUDIO', 22], ['PROPUESTA FINE ART DE DEMOSTRACION', 13], [`Referencia: ${clientId}`, 9], [`Generado el: ${generatedAt} (Cancun)`, 9], ['', 10],
    [`Cliente: ${data.cliente_nombre || ''}`, 11], [`Fecha de boda: ${data.fecha_boda || ''}`, 11],
    [`Locacion: ${data.venue || ''}`, 11], [`Paquete: ${packages[data.paquete_id] || data.paquete_id || ''}`, 11],
    [`Email: ${data.email || ''}`, 11], [`WhatsApp: ${data.whatsapp || ''}`, 11], ['', 10],
    ['Documento informativo sujeto a disponibilidad.', 9],
    ['Para reservar se requiere confirmacion, contrato y anticipo.', 9],
    ['Contacto: wa.me/529987449856', 9],
  ];
  let y = 755;
  const stream = lines.map(([line, size]) => {
    const command = `BT /F1 ${size} Tf 72 ${y} Td (${clean(line)}) Tj ET`;
    y -= size + 13;
    return command;
  }).join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => { offsets.push(pdf.length); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xref = pdf.length;
  pdf += `xref\n0 6\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  const url = URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' }));
  const link = Object.assign(document.createElement('a'), { href: url, download: `propuesta-${clientId.toLowerCase()}.pdf` });
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};
