#!/usr/bin/env node
// Regenerates crawler-friendly static content from the #locations-data JSON in index.html:
//   1. Static location cards between <!-- STATIC-LOCATIONS:START/END --> (replaced by JS at runtime)
//   2. JSON-LD structured data between <!-- JSON-LD:START/END -->
//   3. llms.txt (Markdown summary for LLM crawlers)
// Usage: node scripts/build-static.mjs   (run after editing the locations JSON or EVENT below)

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const indexPath = join(root, 'index.html');

const SITE = 'https://camanoarthop.com/';
const EVENT = {
  name: 'ArtHop Camano Island 2026',
  description:
    'A free, self-guided art tour of galleries, studios, and creative spaces on Camano Island, Washington. Gifts of fine art and craft from local artists.',
  startDate: '2026-12-04T10:00:00-08:00',
  endDate: '2026-12-05T16:00:00-08:00',
  scheduleDates: ['2026-12-04', '2026-12-05'],
  startTime: '10:00',
  endTime: '16:00',
  humanDates: 'Friday-Saturday, December 4-5, 2026',
  humanTimes: '10am-4pm',
  facebook: 'https://www.facebook.com/events/2341991139898609/',
  image: `${SITE}art-hop-share.png`,
  calendar: `${SITE}arthop-2026.ics`,
};
const CITY = { locality: 'Camano Island', region: 'WA', postalCode: '98282', country: 'US' };

const html = readFileSync(indexPath, 'utf8');
const dataMatch = html.match(/<script type="application\/json" id="locations-data">([\s\S]*?)<\/script>/);
if (!dataMatch) throw new Error('Could not find #locations-data JSON in index.html');
const locations = JSON.parse(dataMatch[1]);

// Data fields may contain small bits of HTML (e.g. <br> in hours); the JS renders them as HTML too.
const attr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const text = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const plain = (s) => String(s || '').replace(/<br\s*\/?>/gi, '; ').replace(/<[^>]+>/g, '').trim();
const mapsUrl = (loc) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(loc.address + ' Camano Island WA 98282')}`;
const artistsOf = (loc) =>
  loc.artistLinks && loc.artistLinks.length
    ? loc.artistLinks
    : (loc.artists || []).map((name) => ({ name, url: '#' }));
const link = (url, label) => `<a href="${attr(url)}" target="_blank" rel="noopener noreferrer">${text(label)}</a>`;

// ---------- 1. Static cards (mirrors loadLocations() markup) ----------
function renderCard(loc, indent) {
  const p = loc.popup || {};
  const lines = [];
  lines.push(`<div class="location-card${loc.popup ? ' has-popup' : ''}">`);
  lines.push(`    <div class="location-number">${loc.number}</div>`);
  lines.push(`    <h3 class="location-name">${text(loc.name)}</h3>`);
  lines.push(`    <div class="location-address">${text(loc.address)}, ${CITY.locality}, ${CITY.region} ${CITY.postalCode}</div>`);
  const artists = artistsOf(loc);
  if (artists.length) {
    const label = loc.number === 4 ? 'Groups' : 'Artists';
    const list = artists.map((a) => (a.url === '#' ? text(a.name) : link(a.url, a.name))).join(', ');
    lines.push(`    <div class="location-artists">`);
    lines.push(`        <div class="location-artists-label">${label}</div>`);
    lines.push(`        <div class="location-artists-list">${list}</div>`);
    lines.push(`    </div>`);
  }
  if (loc.notes && loc.notes.trim()) lines.push(`    <div class="location-notes">${loc.notes}</div>`);

  const details = [];
  if (p.description) details.push(`<p>${p.description}</p>`);
  if (p.hours) details.push(`<p>Regular hours: ${p.hours}</p>`);
  if (p.website) details.push(`<p>Website: ${link(p.website, p.website)}</p>`);
  const contact = [];
  if (p.email) contact.push(`<a href="mailto:${attr(p.email)}">${text(p.email)}</a>`);
  if (p.phone) contact.push(`<a href="tel:${attr(p.phone)}">${text(p.phone)}</a>`);
  if (contact.length) details.push(`<p>Contact: ${contact.join(' · ')}</p>`);
  if (p.facebook) details.push(`<p>${link(p.facebook, 'Facebook page')}</p>`);
  if (p.news) {
    const items = [].concat(p.news).map((n) => `<li>${link(n.url, n.title)}</li>`).join('');
    details.push(`<p>In the news:</p><ul>${items}</ul>`);
  }
  if (details.length) {
    lines.push(`    <div class="location-static-details">`);
    details.forEach((d) => lines.push(`        ${d}`));
    lines.push(`    </div>`);
  }
  lines.push(`    <a href="${attr(mapsUrl(loc))}" target="_blank" class="location-directions-button">Get Directions</a>`);
  lines.push(`</div>`);
  return lines.map((l) => indent + l).join('\n');
}

// ---------- 2. JSON-LD ----------
function buildJsonLd() {
  const places = locations.map((loc) => {
    const p = loc.popup || {};
    const place = {
      '@type': 'Place',
      name: loc.name,
      address: {
        '@type': 'PostalAddress',
        streetAddress: loc.address,
        addressLocality: CITY.locality,
        addressRegion: CITY.region,
        postalCode: CITY.postalCode,
        addressCountry: CITY.country,
      },
    };
    if (p.website) place.url = p.website;
    if (p.email) place.email = p.email;
    if (p.phone) place.telephone = p.phone;
    const desc = plain(p.description || loc.notes);
    if (desc) place.description = desc;
    if (p.facebook) place.sameAs = [p.facebook];
    return place;
  });

  const performers = [];
  const seen = new Set();
  for (const loc of locations) {
    for (const a of artistsOf(loc)) {
      if (seen.has(a.name)) continue;
      seen.add(a.name);
      const person = { '@type': 'Person', name: a.name };
      if (a.url && a.url !== '#') person.url = a.url;
      performers.push(person);
    }
  }

  const org = { '@type': 'Organization', '@id': `${SITE}#organization`, name: 'ArtHop Camano Island', url: SITE };
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebSite', '@id': `${SITE}#website`, name: 'ArtHop - Camano Island, WA', url: SITE, publisher: { '@id': org['@id'] } },
      org,
      {
        '@type': 'ExhibitionEvent',
        '@id': `${SITE}#event`,
        name: EVENT.name,
        description: EVENT.description,
        url: SITE,
        image: [EVENT.image],
        startDate: EVENT.startDate,
        endDate: EVENT.endDate,
        eventSchedule: EVENT.scheduleDates.map((d) => ({
          '@type': 'Schedule',
          startDate: d,
          endDate: d,
          startTime: EVENT.startTime,
          endTime: EVENT.endTime,
          scheduleTimezone: 'America/Los_Angeles',
        })),
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD', availability: 'https://schema.org/InStock', url: SITE },
        organizer: { '@id': org['@id'] },
        sameAs: [EVENT.facebook],
        location: places,
        performer: performers,
      },
    ],
  };
}

// ---------- 3. llms.txt ----------
function buildLlmsTxt() {
  const out = [];
  out.push('# ArtHop - Camano Island, WA', '');
  out.push(`> ${EVENT.description}`, '');
  out.push(`- Dates: ${EVENT.humanDates}`);
  out.push(`- Hours: ${EVENT.humanTimes} both days`);
  out.push(`- Where: ${locations.length} locations on Camano Island, WA, all within about 2 miles`);
  out.push('- Cost: Free');
  out.push(`- Website: ${SITE}`);
  out.push(`- Facebook event: ${EVENT.facebook}`);
  out.push(`- Calendar file: ${EVENT.calendar}`, '');
  out.push('## Locations', '');
  for (const loc of locations) {
    const p = loc.popup || {};
    out.push(`### ${loc.number}. ${loc.name}`, '');
    out.push(`- Address: ${loc.address}, ${CITY.locality}, ${CITY.region} ${CITY.postalCode}`);
    const artists = artistsOf(loc);
    if (artists.length) {
      const label = loc.number === 4 ? 'Groups' : 'Artists';
      out.push(`- ${label}: ${artists.map((a) => (a.url === '#' ? a.name : `[${a.name}](${a.url})`)).join(', ')}`);
    }
    if (loc.notes && loc.notes.trim()) out.push(`- Notes: ${plain(loc.notes)}`);
    if (p.description) out.push(`- About: ${plain(p.description)}`);
    if (p.hours) out.push(`- Regular hours: ${plain(p.hours)}`);
    if (p.website) out.push(`- Website: ${p.website}`);
    if (p.email) out.push(`- Email: ${p.email}`);
    if (p.phone) out.push(`- Phone: ${p.phone}`);
    if (p.facebook) out.push(`- Facebook: ${p.facebook}`);
    if (p.news) for (const n of [].concat(p.news)) out.push(`- News: [${n.title}](${n.url})`);
    out.push(`- Directions: ${mapsUrl(loc)}`, '');
  }
  return out.join('\n');
}

// ---------- Write ----------
function replaceBetween(src, startMarker, endMarker, body) {
  const re = new RegExp(`(<!-- ${startMarker}[^>]*-->)[\\s\\S]*?(\\n([ \\t]*)<!-- ${endMarker} -->)`);
  if (!re.test(src)) throw new Error(`Markers ${startMarker}/${endMarker} not found in index.html`);
  return src.replace(re, (_, start, end) => `${start}\n${body}${end}`);
}

const cardIndent = ' '.repeat(20);
const cards = locations.map((loc) => renderCard(loc, cardIndent)).join('\n');
const jsonLd = JSON.stringify(buildJsonLd(), null, 2).replace(/</g, '\\u003c');
const jsonLdBlock = `    <script type="application/ld+json">\n${jsonLd.replace(/^/gm, '    ')}\n    </script>`;

let out = replaceBetween(html, 'STATIC-LOCATIONS:START', 'STATIC-LOCATIONS:END', cards);
out = replaceBetween(out, 'JSON-LD:START', 'JSON-LD:END', jsonLdBlock);

writeFileSync(indexPath, out);
writeFileSync(join(root, 'llms.txt'), buildLlmsTxt() + '\n');
console.log(`Updated index.html (${locations.length} locations) and llms.txt`);
