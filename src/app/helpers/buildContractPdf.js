import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const W = 595;
const H = 842;
const M = 38;

const BLACK = rgb(0, 0, 0);
const GRAY  = rgb(0.42, 0.42, 0.42);
const LGRAY = rgb(0.91, 0.91, 0.91);

function hexToRgb(hex) {
  if (!hex || typeof hex !== 'string') return null;
  const h = hex.replace('#', '');
  if (h.length !== 6) return null;
  try {
    return rgb(
      parseInt(h.slice(0, 2), 16) / 255,
      parseInt(h.slice(2, 4), 16) / 255,
      parseInt(h.slice(4, 6), 16) / 255,
    );
  } catch { return null; }
}

function fmtDate(v) {
  if (!v) return '';
  const p = v.split('-');
  return p.length === 3 ? `${p[2]}-${p[1]}-${p[0]}` : v;
}

function fmtDateTime(v) {
  if (!v) return '';
  const [date, time] = v.split('T');
  return `${fmtDate(date)} ${time || ''}`.trim();
}

function sanitize(text) {
  if (!text) return '';
  const MAP = {
    '\u2022': '-',   // bullet •
    '\u25CB': 'o',   // white circle ○
    '\u25CF': 'o',   // black circle ●
    '\u25BA': '>',   // filled right triangle ►
    '\u2013': '-',   // en dash –
    '\u2014': '-',   // em dash —
    '\u2015': '-',   // horizontal bar ―
    '\u2026': '...',  // ellipsis …
    '\u201C': '"',   // left double quote "
    '\u201D': '"',   // right double quote "
    '\u2018': "'",   // left single quote '
    '\u2019': "'",   // right single quote '
    '\u20AC': 'EUR', // euro sign €
    '\u00D7': 'x',   // multiplication ×
    '\u2212': '-',   // minus −
    '\u2192': '->',  // right arrow →
    '\u2190': '<-',  // left arrow ←
    '\u00B7': '-',   // middle dot ·
    '\u2010': '-',   // hyphen ‐
    '\u2011': '-',   // non-breaking hyphen ‑
    '\u00A0': ' ',   // non-breaking space
    '\u00AB': '"',   // «
    '\u00BB': '"',   // »
  };
  return String(text).replace(/[^\x20-\xFF]/g, ch => MAP[ch] ?? '?');
}

function wrapText(text, maxWidth, fontSize, font) {
  const words = sanitize(String(text || '')).split(' ');
  const lines = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? `${cur} ${w}` : w;
    if (font.widthOfTextAtSize(test, fontSize) > maxWidth && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

export async function buildContractPdf({
  voornaam = '', achternaam = '', email = '', telefoon = '',
  geboortedatum = '', straatnaam = '', postcodeWoonplaats = '',
  documentnummer = '', rijbewijsAfgifteDatum = '',
  ophaaldatum = '', ophaaltijd = '', retourdatum = '', retourtijd = '',
  autogegevens = '', kenteken = '', kleur = '', brandstof = '', startKmStand = '',
  tarief = '0', dagen = '0', btwPercentage = '21',
  borgVoldaanDatum = '', opmerkingen = '',
  handtekeningDataUrl = null, handtekeningSchadeDataUrl = null,
  contractTerms = '',
  contractBullets = '',
  tenantName = 'Autoverhuur',
  primaryColor = '#e8b84b',
  bgColor = '#0a0a14',
  logoUrl = '',
} = {}) {

  const btw = parseFloat(btwPercentage) || 21;
  const autoPrijs = parseFloat(tarief || 0) * parseFloat(dagen || 0);
  const prijsBtw = (autoPrijs / (100 + btw)) * btw;
  const prijsExcBtw = autoPrijs - prijsBtw;

  // Parse tenant colors with fallbacks
  const accentColor = hexToRgb(primaryColor) || rgb(0.91, 0.72, 0.29);
  const headerBg    = hexToRgb(bgColor)       || rgb(0.08, 0.08, 0.12);

  const pdfDoc = await PDFDocument.create();
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const reg  = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Try embedding logo
  let logoImage = null;
  if (logoUrl) {
    try {
      const res   = await fetch(logoUrl);
      const bytes = new Uint8Array(await res.arrayBuffer());
      try { logoImage = await pdfDoc.embedPng(bytes); }
      catch { logoImage = await pdfDoc.embedJpg(bytes); }
    } catch (_) {}
  }

  // ── Drawing helpers ──
  const txt = (page, text, x, y, { size = 8.5, f = reg, color = BLACK } = {}) => {
    const s = sanitize(text);
    if (!s) return;
    page.drawText(s, { x, y, size, font: f, color });
  };

  const hLine = (page, x1, y1, x2, { thickness = 0.5, color = rgb(0.75, 0.75, 0.75) } = {}) => {
    page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y1 }, thickness, color });
  };

  const fillRect = (page, x, y, w, h, color) => {
    page.drawRectangle({ x, y, width: w, height: h, color });
  };

  const sectionBar = (page, label, y, { gap = 17 } = {}) => {
    fillRect(page, M, y - 3, W - M * 2, 14, LGRAY);
    txt(page, label, M + 5, y + 1, { size: 7.5, f: bold });
    return y - gap;
  };

  // ── Header builder (reused for terms pages) ──
  const drawHeader = (page, subtitle = '') => {
    fillRect(page, 0, H - 48, W, 48, headerBg);

    let nameX = M;

    // Logo (max 80x32 pt)
    if (logoImage) {
      const dims = logoImage.scaleToFit(80, 32);
      page.drawImage(logoImage, { x: M, y: H - 44, width: dims.width, height: dims.height });
      nameX = M + dims.width + 10;
    }

    // Company name
    txt(page, tenantName, nameX, H - 26, { size: 14, f: bold, color: accentColor });
    if (subtitle) {
      txt(page, subtitle, nameX, H - 39, { size: 6.5, color: rgb(0.6, 0.6, 0.6) });
    }
  };

  // ──────────────── PAGE 1: CONTRACT ────────────────
  const p1 = pdfDoc.addPage([W, H]);

  drawHeader(p1);

  // Kenteken (top right of header)
  if (kenteken) {
    const k = kenteken.toUpperCase();
    const kw = bold.widthOfTextAtSize(k, 13);
    txt(p1, 'KENTEKEN', W - M - kw, H - 25, { size: 6, color: rgb(0.55, 0.55, 0.55) });
    txt(p1, k, W - M - kw, H - 38, { size: 13, f: bold, color: accentColor });
  }

  // Title + accent underline (with extra breathing room below header)
  txt(p1, 'HUURCONTRACT', M, H - 64, { size: 18, f: bold });
  hLine(p1, M, H - 69, W - M, { thickness: 1.5, color: accentColor });

  let y = H - 88;   // 19pt gap between underline and first section

  // ── HUURDER / BESTUURDER ──
  y = sectionBar(p1, 'HUURDER / BESTUURDER', y);

  const c2 = W / 2 + 5;
  const lw = 96;

  const leftFields = [
    ['Voornaam',              voornaam],
    ['Achternaam',            achternaam],
    ['Geboortedatum',         fmtDate(geboortedatum)],
    ['E-mail',                email],
    ['Telefoon',              telefoon],
  ];
  const rightFields = [
    ['Straatnaam / nr',       straatnaam],
    ['Postcode / Woonplaats', postcodeWoonplaats],
    ['Document / BSN nr',     documentnummer],
    ['Rijbewijs afgiftedatum',fmtDate(rijbewijsAfgifteDatum)],
  ];

  const hY = y;
  leftFields.forEach(([label, val], i) => {
    const fy = hY - i * 13;
    txt(p1, label, M, fy, { size: 7.5, color: GRAY });
    txt(p1, val, M + lw, fy, { size: 8, f: bold });
    hLine(p1, M + lw, fy - 2, c2 - 6);
  });
  rightFields.forEach(([label, val], i) => {
    const fy = hY - i * 13;
    txt(p1, label, c2, fy, { size: 7.5, color: GRAY });
    txt(p1, val, c2 + lw, fy, { size: 8, f: bold });
    hLine(p1, c2 + lw, fy - 2, W - M);
  });

  y = hY - Math.max(leftFields.length, rightFields.length) * 13 - 10;

  // ── RESERVERING ──
  y = sectionBar(p1, 'RESERVERING', y);
  const cw4 = (W - M * 2) / 4;
  [
    ['Ophaaldatum', fmtDate(ophaaldatum)],
    ['Ophaaltijd',  ophaaltijd],
    ['Retourdatum', fmtDate(retourdatum)],
    ['Retourtijd',  retourtijd],
  ].forEach(([label, val], i) => {
    const rx = M + i * cw4;
    txt(p1, label, rx, y,      { size: 7.5, color: GRAY });
    txt(p1, val,   rx, y - 12, { size: 9,   f: bold });
  });
  y -= 28;

  // ── VOERTUIG ──
  y = sectionBar(p1, 'VOERTUIG', y);
  const cw5 = (W - M * 2) / 5;
  [
    ['Autogegevens', autogegevens],
    ['Kenteken',     kenteken],
    ['Kleur',        kleur],
    ['Brandstof',    brandstof],
    ['Begin KM-stand', startKmStand],
  ].forEach(([label, val], i) => {
    const vx = M + i * cw5;
    txt(p1, label, vx, y,      { size: 7.5, color: GRAY });
    txt(p1, val,   vx, y - 12, { size: 8.5, f: bold });
  });
  y -= 28;

  // ── TARIEVEN ──
  y = sectionBar(p1, 'TARIEVEN', y);
  const cw7 = (W - M * 2) / 7;
  const tH = ['Tarief/dag', 'Dagen', 'Prijs', 'Excl. BTW', 'BTW%', 'BTW bedrag', 'Totaal'];
  const tV = [
    tarief || '0',
    dagen  || '0',
    autoPrijs.toFixed(2),
    prijsExcBtw.toFixed(2),
    `${btwPercentage || '21'}%`,
    prijsBtw.toFixed(2),
    autoPrijs.toFixed(2),
  ];
  tH.forEach((h, i) => {
    const tx = M + i * cw7;
    txt(p1, h,     tx, y,      { size: 7,   color: GRAY });
    txt(p1, tV[i], tx, y - 12, { size: 8.5, f: bold });
  });
  y -= 28;

  // ── PRIJS BEREKENING (right) + OPMERKINGEN (left) ──
  const calcW    = 180;
  const calcX    = W - M - calcW;
  const blockTop = y;

  fillRect(p1, calcX - 4, blockTop - 78, calcW + 4, 90, rgb(0.95, 0.95, 0.95));

  const calcRows = [
    ['Subtotaal excl. BTW', prijsExcBtw.toFixed(2)],
    [`BTW bedrag (${btwPercentage || 21}%)`, prijsBtw.toFixed(2)],
    ['Subtotaal',  autoPrijs.toFixed(2)],
    ['Borg voldaan op', borgVoldaanDatum ? fmtDateTime(borgVoldaanDatum) : '—'],
    ['TOTAAL',     autoPrijs.toFixed(2)],
  ];
  calcRows.forEach(([label, val], i) => {
    const ry    = blockTop - 4 - i * 14;
    const isTot = label === 'TOTAAL';
    const sz    = isTot ? 9 : 7.5;
    const fnt   = isTot ? bold : reg;
    const col   = isTot ? BLACK : GRAY;
    txt(p1, label, calcX, ry, { size: sz, f: fnt, color: col });
    const vw = fnt.widthOfTextAtSize(val, sz);
    txt(p1, val, W - M - vw, ry, { size: sz, f: fnt, color: col });
  });

  // Opmerkingen left side
  txt(p1, 'OPMERKINGEN', M, blockTop, { size: 7.5, f: bold });
  const opLines = (opmerkingen || '').split('\n').slice(0, 6);
  opLines.forEach((opLine, i) => {
    txt(p1, opLine, M, blockTop - 13 - i * 11, { size: 8 });
  });

  y = blockTop - 90;
  hLine(p1, M, y, W - M, { thickness: 0.5 });
  y -= 6;

  // ── VOORWAARDEN BULLETS ──
  y = sectionBar(p1, 'VOORWAARDEN', y);
  const bullets = (contractBullets || '').split('\n').map(b => b.trim()).filter(Boolean);
  const defaultBullets = [
    'Eigen risico per gebeurtenis: EUR 5.000,- (kan oplopen tot EUR 10.000,-)',
    'Borg: EUR 2.500,- (kan oplopen tot EUR 5.000,-)',
    'Extra kilometers worden berekend a EUR 1,- per km',
    'Roken verboden - bij constatering EUR 250,- in rekening gebracht',
    'Te laat inleveren: EUR 100,- per uur',
    'Auto vuil ingeleverd: EUR 25,- schoonmaakkosten',
  ];
  const activeBullets = bullets.length > 0 ? bullets : defaultBullets;
  activeBullets.slice(0, 6).forEach((b, i) => {
    txt(p1, `- ${b}`, M, y - i * 11, { size: 7.5, color: GRAY });
  });
  y -= Math.min(activeBullets.length, 6) * 11 + 8;

  // ── HANDTEKENING + SCHADERAPPORT (side by side) ──
  hLine(p1, M, y, W - M, { thickness: 1, color: accentColor });
  y -= 8;

  const halfW = (W - M * 2 - 16) / 2;
  const col2start = M + halfW + 16;

  // Column labels
  txt(p1, 'Handtekening huurder/bestuurder', M, y, { size: 7.5, f: bold });
  txt(p1, 'Schaderapport — getekend op auto', col2start, y, { size: 7.5, f: bold });
  txt(p1, 'Door te tekenen gaat u akkoord met de algemene voorwaarden.', M, y - 10, { size: 6.5, color: GRAY });
  y -= 20;

  const imgAreaH = 60;

  // Signature image
  if (handtekeningDataUrl) {
    try {
      const img  = await pdfDoc.embedPng(handtekeningDataUrl);
      const dims = img.scaleToFit(halfW, imgAreaH);
      p1.drawImage(img, { x: M, y: y - dims.height, width: dims.width, height: dims.height });
    } catch (_) {}
  } else {
    // Empty signature box
    p1.drawRectangle({ x: M, y: y - imgAreaH, width: halfW, height: imgAreaH, borderColor: rgb(0.8, 0.8, 0.8), borderWidth: 0.5, color: rgb(0.98, 0.98, 0.98) });
  }

  // Damage image (right column)
  if (handtekeningSchadeDataUrl) {
    try {
      const img2  = await pdfDoc.embedPng(handtekeningSchadeDataUrl);
      const dims2 = img2.scaleToFit(halfW, imgAreaH);
      p1.drawImage(img2, { x: col2start, y: y - dims2.height, width: dims2.width, height: dims2.height });
    } catch (_) {}
  } else {
    p1.drawRectangle({ x: col2start, y: y - imgAreaH, width: halfW, height: imgAreaH, borderColor: rgb(0.8, 0.8, 0.8), borderWidth: 0.5, color: rgb(0.98, 0.98, 0.98) });
  }

  // ──────────────── PAGE 2+: ALGEMENE VOORWAARDEN ────────────────
  if (contractTerms && contractTerms.trim()) {
    const newTermsPage = () => {
      const tp  = pdfDoc.addPage([W, H]);
      drawHeader(tp, 'ALGEMENE VOORWAARDEN');
      return { tp, ty: H - 64 };
    };

    let { tp, ty } = newTermsPage();
    const maxW = W - M * 2;

    for (const rawLine of contractTerms.split('\n')) {
      const l = sanitize(rawLine.trimEnd());

      if (ty < M + 18) {
        const next = newTermsPage();
        tp = next.tp;
        ty = next.ty;
      }

      if (!l.trim()) { ty -= 5; continue; }

      const isHeader = /^ARTIKEL\s+\d+/i.test(l.trim());
      if (isHeader) {
        ty -= 4;
        txt(tp, l.trim(), M, ty, { size: 9, f: bold });
        ty -= 13;
        continue;
      }

      const wrapped = wrapText(l, maxW, 8, reg);
      for (const wl of wrapped) {
        if (ty < M + 18) {
          const next = newTermsPage();
          tp = next.tp;
          ty = next.ty;
        }
        txt(tp, wl, M, ty, { size: 8 });
        ty -= 11;
      }
    }
  }

  return await pdfDoc.save();
}
