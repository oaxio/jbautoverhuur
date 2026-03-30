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
    '\u2022': '-',   '\u25CB': 'o',   '\u25CF': 'o',   '\u25BA': '>',
    '\u2013': '-',   '\u2014': '-',   '\u2015': '-',   '\u2026': '...',
    '\u201C': '"',   '\u201D': '"',   '\u2018': "'",   '\u2019': "'",
    '\u20AC': 'EUR', '\u00D7': 'x',   '\u2212': '-',   '\u2192': '->',
    '\u2190': '<-',  '\u00B7': '-',   '\u2010': '-',   '\u2011': '-',
    '\u00A0': ' ',   '\u00AB': '"',   '\u00BB': '"',
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

  const accentColor = hexToRgb(primaryColor) || rgb(0.91, 0.72, 0.29);
  const headerBg    = hexToRgb(bgColor)       || rgb(0.08, 0.08, 0.12);

  const pdfDoc = await PDFDocument.create();
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const reg  = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // ── Embed tenant logo ──
  let logoImage = null;
  if (logoUrl) {
    try {
      const res   = await fetch(logoUrl);
      const bytes = new Uint8Array(await res.arrayBuffer());
      try { logoImage = await pdfDoc.embedPng(bytes); }
      catch { logoImage = await pdfDoc.embedJpg(bytes); }
    } catch (_) {}
  }

  // ── Embed damage-car.jpg background ──
  let damageCarImage = null;
  try {
    const res   = await fetch('/damage-car.jpg');
    const bytes = new Uint8Array(await res.arrayBuffer());
    damageCarImage = await pdfDoc.embedJpg(bytes);
  } catch (_) {}

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

  // ── Header (reused for terms pages) ──
  const drawHeader = (page, subtitle = '') => {
    fillRect(page, 0, H - 48, W, 48, headerBg);
    let nameX = M;
    if (logoImage) {
      const dims = logoImage.scaleToFit(80, 32);
      page.drawImage(logoImage, { x: M, y: H - 44, width: dims.width, height: dims.height });
      nameX = M + dims.width + 10;
    }
    txt(page, tenantName, nameX, H - 26, { size: 14, f: bold, color: accentColor });
    if (subtitle) {
      txt(page, subtitle, nameX, H - 39, { size: 6.5, color: rgb(0.6, 0.6, 0.6) });
    }
  };

  // ──────────────── PAGE 1: CONTRACT ────────────────
  const p1 = pdfDoc.addPage([W, H]);

  drawHeader(p1);

  if (kenteken) {
    const k = kenteken.toUpperCase();
    const kw = bold.widthOfTextAtSize(k, 13);
    txt(p1, 'KENTEKEN', W - M - kw, H - 25, { size: 6, color: rgb(0.55, 0.55, 0.55) });
    txt(p1, k, W - M - kw, H - 38, { size: 13, f: bold, color: accentColor });
  }

  // Title — ruim veld onder de header
  txt(p1, 'HUURCONTRACT', M, H - 76, { size: 18, f: bold });
  hLine(p1, M, H - 81, W - M, { thickness: 1.5, color: accentColor });

  let y = H - 106;   // 25pt ademruimte tussen onderlijning en eerste sectie

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
    tarief || '0', dagen || '0',
    autoPrijs.toFixed(2), prijsExcBtw.toFixed(2),
    `${btwPercentage || '21'}%`, prijsBtw.toFixed(2), autoPrijs.toFixed(2),
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
    ['Borg voldaan op', borgVoldaanDatum ? fmtDateTime(borgVoldaanDatum) : '-'],
    ['TOTAAL',     autoPrijs.toFixed(2)],
  ];
  calcRows.forEach(([label, val], i) => {
    const ry    = blockTop - 4 - i * 14;
    const isTot = label === 'TOTAAL';
    const sz    = isTot ? 9 : 7.5;
    const fnt   = isTot ? bold : reg;
    const col   = isTot ? BLACK : GRAY;
    txt(p1, label, calcX, ry, { size: sz, f: fnt, color: col });
    const vw = fnt.widthOfTextAtSize(sanitize(val), sz);
    txt(p1, val, W - M - vw, ry, { size: sz, f: fnt, color: col });
  });

  txt(p1, 'OPMERKINGEN', M, blockTop, { size: 7.5, f: bold });
  (opmerkingen || '').split('\n').slice(0, 6).forEach((opLine, i) => {
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

  const halfW     = (W - M * 2 - 16) / 2;
  const col2start = M + halfW + 16;
  const imgAreaH  = 95;   // taller for the car diagram

  txt(p1, 'Handtekening huurder/bestuurder', M, y, { size: 7.5, f: bold });
  txt(p1, 'Schaderapport', col2start, y, { size: 7.5, f: bold });
  txt(p1, 'Door te tekenen gaat u akkoord met de algemene voorwaarden.', M, y - 10, { size: 6.5, color: GRAY });
  y -= 20;

  // Signature (left)
  if (handtekeningDataUrl) {
    try {
      const img  = await pdfDoc.embedPng(handtekeningDataUrl);
      const dims = img.scaleToFit(halfW, imgAreaH);
      p1.drawImage(img, { x: M, y: y - dims.height, width: dims.width, height: dims.height });
    } catch (_) {}
  } else {
    p1.drawRectangle({ x: M, y: y - imgAreaH, width: halfW, height: imgAreaH, borderColor: rgb(0.8, 0.8, 0.8), borderWidth: 0.5, color: rgb(0.98, 0.98, 0.98) });
  }

  // Schade (right) — gecombineerde PNG (auto + markeringen al samengevoegd door de frontend)
  const schadeX = col2start;
  const schadeY = y - imgAreaH;

  // Teken schade-afbeelding met behoud van aspect ratio, gecentreerd in het vak
  const drawFit = (page, image, areaX, areaY, areaW, areaH) => {
    const dims = image.scaleToFit(areaW, areaH);
    const ox   = (areaW - dims.width)  / 2;
    const oy   = (areaH - dims.height) / 2;
    page.drawImage(image, { x: areaX + ox, y: areaY + oy, width: dims.width, height: dims.height });
  };

  if (handtekeningSchadeDataUrl) {
    try {
      const img2 = await pdfDoc.embedPng(handtekeningSchadeDataUrl);
      drawFit(p1, img2, schadeX, schadeY, halfW, imgAreaH);
    } catch (_) {
      if (damageCarImage) drawFit(p1, damageCarImage, schadeX, schadeY, halfW, imgAreaH);
    }
  } else if (damageCarImage) {
    drawFit(p1, damageCarImage, schadeX, schadeY, halfW, imgAreaH);
  } else {
    p1.drawRectangle({ x: schadeX, y: schadeY, width: halfW, height: imgAreaH, borderColor: rgb(0.8, 0.8, 0.8), borderWidth: 0.5, color: rgb(0.98, 0.98, 0.98) });
  }

  // ──────────────── PAGE 2+: ALGEMENE VOORWAARDEN (2 kolommen) ────────────────
  if (contractTerms && contractTerms.trim()) {
    const colW    = (W - M * 2 - 12) / 2;   // column width
    const col1x   = M;
    const col2x   = M + colW + 12;
    const pageTop = H - 68;                  // y where text starts (below header)
    const bottomY = M + 16;

    const BODY_SIZE   = 6.5;
    const HEAD_SIZE   = 7.5;
    const BODY_LEAD   = 8.5;

    let tp, col, ty;

    const addPage = () => {
      tp  = pdfDoc.addPage([W, H]);
      drawHeader(tp, 'ALGEMENE VOORWAARDEN');
      col = 1;
      ty  = pageTop;
    };

    const getX = () => col === 1 ? col1x : col2x;

    const advance = () => {
      if (ty < bottomY) {
        if (col === 1) {
          col = 2;
          ty  = pageTop;
        } else {
          addPage();
        }
      }
    };

    addPage();

    for (const rawLine of contractTerms.split('\n')) {
      const l = sanitize(rawLine.trimEnd());

      advance();

      if (!l.trim()) { ty -= 5; continue; }

      const isHeader = /^ARTIKEL\s+\d+/i.test(l.trim());
      if (isHeader) {
        ty -= 4;
        advance();
        // Wrap artikel-headers binnen de kolombreedte
        const headWrapped = wrapText(l.trim(), colW, HEAD_SIZE, bold);
        for (const hl of headWrapped) {
          advance();
          tp.drawText(hl, { x: getX(), y: ty, size: HEAD_SIZE, font: bold, color: BLACK });
          ty -= HEAD_SIZE + 3;
        }
        continue;
      }

      const wrapped = wrapText(l, colW, BODY_SIZE, reg);
      for (const wl of wrapped) {
        advance();
        tp.drawText(wl, { x: getX(), y: ty, size: BODY_SIZE, font: reg, color: BLACK });
        ty -= BODY_LEAD;
      }
    }
  }

  return await pdfDoc.save();
}
