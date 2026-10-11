const WHATSAPP_NUMBER = '529987449856';

const LOCAL_LOCATIONS = {
  cancun: { name: 'Playa en Cancún', latitude: 21.1619, longitude: -86.8515, timezone: 'America/Cancun' },
  merida: { name: 'Hacienda en Mérida', latitude: 20.9674, longitude: -89.5926, timezone: 'America/Merida' },
  tulum: { name: 'Cenote / Hotel en Tulum', latitude: 20.2114, longitude: -87.4654, timezone: 'America/Cancun' },
  playa: { name: 'Riviera Maya / Playa del Carmen', latitude: 20.6296, longitude: -87.0739, timezone: 'America/Cancun' },
};

const DAY_MS = 86_400_000;
const RAD = Math.PI / 180;
const J1970 = 2440588;
const J2000 = 2451545;
const J0 = 0.0009;

const toJulian = (date) => date.valueOf() / DAY_MS - 0.5 + J1970;
const fromJulian = (julian) => new Date((julian + 0.5 - J1970) * DAY_MS);
const solarMeanAnomaly = (day) => RAD * (357.5291 + 0.98560028 * day);
const eclipticLongitude = (meanAnomaly) => {
  const equation = RAD * (1.9148 * Math.sin(meanAnomaly) + 0.02 * Math.sin(2 * meanAnomaly) + 0.0003 * Math.sin(3 * meanAnomaly));
  return meanAnomaly + equation + RAD * 102.9372 + Math.PI;
};
const solarTransit = (julianApprox, meanAnomaly, eclipticLongitudeValue) => J2000 + julianApprox + 0.0053 * Math.sin(meanAnomaly) - 0.0069 * Math.sin(2 * eclipticLongitudeValue);

const getSunset = (dateValue, latitude, longitude) => {
  const [year, month, day] = dateValue.split('-').map(Number);
  const dateAtNoonUtc = new Date(Date.UTC(year, month - 1, day, 12));
  const daysSinceJ2000 = toJulian(dateAtNoonUtc) - J2000;
  const longitudeWest = -longitude * RAD;
  const cycle = Math.round(daysSinceJ2000 - J0 - longitudeWest / (2 * Math.PI));
  const approxTransit = J0 + (longitudeWest / (2 * Math.PI)) + cycle;
  const meanAnomaly = solarMeanAnomaly(approxTransit);
  const longitudeSun = eclipticLongitude(meanAnomaly);
  const declination = Math.asin(Math.sin(longitudeSun) * Math.sin(23.4397 * RAD));
  const latitudeRad = latitude * RAD;
  const hourAngle = Math.acos(
    (Math.sin(-0.833 * RAD) - Math.sin(latitudeRad) * Math.sin(declination))
      / (Math.cos(latitudeRad) * Math.cos(declination)),
  );
  const setTransit = J0 + (hourAngle + longitudeWest) / (2 * Math.PI) + cycle;
  return fromJulian(solarTransit(setTransit, meanAnomaly, longitudeSun));
};

const formatTimeInZone = (date, timezone) => new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
  timeZone: timezone,
}).format(date);

const calculateLocally = (dateValue, locationKey) => {
  const location = LOCAL_LOCATIONS[locationKey];
  if (!location) throw new Error('Selecciona una ubicación válida.');

  const sunsetDate = getSunset(dateValue, location.latitude, location.longitude);
  const addMinutes = (minutes) => new Date(sunsetDate.getTime() + minutes * 60_000);
  const format = (date) => formatTimeInZone(date, location.timezone);
  const ceremony = addMinutes(-75);

  return {
    date: dateValue,
    location: locationKey,
    location_name: location.name,
    timezone: location.timezone,
    sunset: format(sunsetDate),
    golden_hour_start: format(addMinutes(-60)),
    blue_hour_end: format(addMinutes(20)),
    recommended_ceremony: format(ceremony),
    timeline: [
      { event: 'Getting Ready', time: format(new Date(ceremony.getTime() - 180 * 60_000)) },
      { event: 'First Look / Retratos', time: format(new Date(ceremony.getTime() - 60 * 60_000)) },
      { event: 'Ceremonia (Luz dorada)', time: format(ceremony) },
      { event: 'Sesión de Pareja', time: format(addMinutes(-60)) },
      { event: 'Recepción / Fiesta', time: format(sunsetDate) },
    ],
    note: 'Horario solar estimado para planeación. El equipo ajustará el timeline final según el venue, clima y temporada.',
  };
};

const formatDate = (dateValue) => {
  const [year, month, day] = dateValue.split('-').map(Number);
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, day));
};

const getLocalToday = () => {
  const today = new Date();
  const offset = today.getTimezoneOffset() * 60_000;
  return new Date(today.getTime() - offset).toISOString().split('T')[0];
};

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const renderResult = (container, data) => {
  const safeLocation = escapeHtml(data.location_name);
  const safeCeremony = escapeHtml(data.recommended_ceremony);
  const safeSunset = escapeHtml(data.sunset);
  const safeGoldenStart = escapeHtml(data.golden_hour_start);
  const safeBlueEnd = escapeHtml(data.blue_hour_end);
  const readableDate = formatDate(data.date);
  const message = `Hola Sisal Studio, usé su calculadora para mi boda el ${readableDate} en ${data.location_name}. La ceremonia sugerida es a las ${data.recommended_ceremony}. ¿Tienen disponibilidad para esta fecha?`;
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  const timelineItems = data.timeline.map((item) => `
    <li class="golden-calculator__timeline-item">
      <time class="golden-calculator__timeline-time">${escapeHtml(item.time)}</time>
      <span class="golden-calculator__timeline-event">${escapeHtml(item.event)}</span>
    </li>
  `).join('');

  container.innerHTML = `
    <div class="golden-calculator__result-grid">
      <article class="golden-calculator__card golden-calculator__card--featured">
        <p class="golden-calculator__card-label">Ceremonia recomendada</p>
        <p class="golden-calculator__ceremony-time">${safeCeremony}</p>
        <p class="golden-calculator__card-copy">${safeLocation} · ${escapeHtml(readableDate)}</p>
        <dl class="golden-calculator__light-data">
          <div><dt>Hora dorada</dt><dd>${safeGoldenStart}</dd></div>
          <div><dt>Puesta de sol</dt><dd>${safeSunset}</dd></div>
          <div><dt>Fin hora azul</dt><dd>${safeBlueEnd}</dd></div>
        </dl>
      </article>
      <article class="golden-calculator__card">
        <p class="golden-calculator__card-label">Cronograma sugerido</p>
        <ol class="golden-calculator__timeline">${timelineItems}</ol>
      </article>
    </div>
    <p class="golden-calculator__note">${escapeHtml(data.note)}</p>
    <a class="button golden-calculator__whatsapp" href="${whatsappUrl}" target="_blank" rel="noopener noreferrer">
      Enviar este timeline a Sisal Studio para cotizar mi fecha
    </a>
  `;
  container.hidden = false;
  container.focus();
};

export const initGoldenHourCalculator = () => {
  const form = document.querySelector('[data-golden-form]');
  const dateInput = document.querySelector('[data-golden-date]');
  const submitButton = document.querySelector('[data-golden-submit]');
  const result = document.querySelector('[data-golden-result]');
  const status = document.querySelector('[data-golden-status]');

  if (!form || !dateInput || !submitButton || !result || !status) return;

  dateInput.min = getLocalToday();

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const formData = new FormData(form);
    const params = new URLSearchParams({
      date: formData.get('date'),
      location: formData.get('location'),
    });

    submitButton.disabled = true;
    submitButton.classList.add('is-loading');
    submitButton.querySelector('span').textContent = 'Calculando la luz…';
    status.textContent = 'Calculando la posición del sol…';
    result.hidden = true;

    try {
      let data;
      try {
        const response = await fetch(`/api/golden_hour?${params.toString()}`);
        if (!response.ok) throw new Error('API no disponible');
        data = await response.json();
      } catch {
        // Vite no ejecuta funciones Python durante el desarrollo local. Este
        // cálculo astronómico equivalente mantiene operativa la experiencia.
        data = calculateLocally(String(formData.get('date')), String(formData.get('location')));
      }

      renderResult(result, data);
      sessionStorage.setItem('sisalGoldenHour', JSON.stringify(data));
      status.textContent = 'Tu timeline está listo.';
    } catch (error) {
      status.textContent = error.message || 'Ocurrió un error. Inténtalo nuevamente.';
      result.hidden = true;
    } finally {
      submitButton.disabled = false;
      submitButton.classList.remove('is-loading');
      submitButton.querySelector('span').textContent = 'Calcular luz de mi boda';
    }
  });
};
