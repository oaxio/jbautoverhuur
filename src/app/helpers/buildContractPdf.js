import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const W = 595;
const H = 842;
const M = 36;

const GOLD  = rgb(0.91, 0.72, 0.29);
const BLACK = rgb(0, 0, 0);
const GRAY  = rgb(0.42, 0.42, 0.42);
const LGRAY = rgb(0.91, 0.91, 0.91);
const DARK  = rgb(0.08, 0.08, 0.12);

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

function wrapText(text, maxWidth, fontSize, font) {
  const words = String(text || '').split(' ');
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
  tenantInfo = '',
} = {}) {

  const btw = parseFloat(btwPercentage) || 21;
  const autoPrijs = parseFloat(tarief || 0) * parseFloat(dagen || 0);
  const prijsBtw = (autoPrijs / (100 + btw)) * btw;
  const prijsExcBtw = autoPrijs - prijsBtw;

  const pdfDoc = await PDFDocument.create();
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const reg  = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const txt = (page, text, x, y, { size = 8.5, f = reg, color = BLACK } = {}) => {
    const s = String(text ?? '');
    if (!s) return;
    page.drawText(s, { x, y, size, font: f, color });
  };

  const hLine = (page, x1, y1, x2, { thickness = 0.5, color = rgb(0.75, 0.75, 0.75) } = {}) => {
    page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y1 }, thickness, color });
  };

  const fillRect = (page, x, y, w, h, color) => {
    page.drawRectangle({ x, y, width: w, height: h, color });
  };

  const sectionBar = (page, label, y) => {
    fillRect(page, M, y - 3, W - M * 2, 13, LGRAY);
    txt(page, label, M + 4, y, { size: 7.5, f: bold });
    return y - 17;
  };

  // ──────────────── PAGE 1: CONTRACT ────────────────
  const p1 = pdfDoc.addPage([W, H]);

  // Header bar
  fillRect(p1, 0, H - 44, W, 44, DARK);
  txt(p1, tenantName, M, H - 24, { size: 15, f: bold, color: GOLD });
  if (tenantInfo) txt(p1, tenantInfo, M, H - 37, { size: 6.5, color: rgb(0.65, 0.65, 0.65) });

  // Kenteken (top right)
  if (kenteken) {
    const k = kenteken.toUpperCase();
    const kw = bold.widthOfTextAtSize(k, 13);
    txt(p1, 'KENTEKEN', W - M - kw, H - 23, { size: 6, color: rgb(0.55, 0.55, 0.55) });
    txt(p1, k, W - M - kw, H - 36, { size: 13, f: bold, color: GOLD });
  }

  // Title
  txt(p1, 'HUURCONTRACT', M, H - 58, { size: 17, f: bold });
  hLine(p1, M, H - 62, W - M, { thickness: 1.5, color: GOLD });

  let y = H - 78;

  // ── HUURDER / BESTUURDER ──
  y = sectionBar(p1, 'HUURDER / BESTUURDER', y);

  const c2  = W / 2 + 5;
  const lw  = 96;

  const leftFields = [
    ['Voornaam',            voornaam],
    ['Achternaam',          achternaam],
    ['Geboortedatum',       fmtDate(geboortedatum)],
    ['E-mail',              email],
    ['Telefoon',            telefoon],
  ];
  const rightFields = [
    ['Straatnaam / nr',     straatnaam],
    ['Postcode / Woonplaats', postcodeWoonplaats],
    ['Document / BSN nr',   documentnummer],
    ['Rijbewijs afgiftedatum', fmtDate(rijbewijsAfgifteDatum)],
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

  y = hY - Math.max(leftFields.length, rightFields.length) * 13 - 8;

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
    txt(p1, h,    tx, y,      { size: 7,   color: GRAY });
    txt(p1, tV[i],tx, y - 12, { size: 8.5, f: bold });
  });
  y -= 28;

  // ── PRIJS BEREKENING (right) + OPMERKINGEN (left) ──
  const calcW = 178;
  const calcX = W - M - calcW;
  const blockTop = y;

  // Calc box background
  fillRect(p1, calcX - 4, blockTop - 75, calcW + 4, 88, rgb(0.95, 0.95, 0.95));

  const calcRows = [
    ['Subtotaal excl. BTW', prijsExcBtw.toFixed(2)],
    [`BTW bedrag (${btwPercentage || 21}%)`, prijsBtw.toFixed(2)],
    ['Subtotaal',  autoPrijs.toFixed(2)],
    ['Borg voldaan op', borgVoldaanDatum ? fmtDateTime(borgVoldaanDatum) : '—'],
    ['TOTAAL',     autoPrijs.toFixed(2)],
  ];
  calcRows.forEach(([label, val], i) => {
    const ry     = blockTop - 4 - i * 14;
    const isTot  = label === 'TOTAAL';
    const sz     = isTot ? 9 : 7.5;
    const fnt    = isTot ? bold : reg;
    const col    = isTot ? BLACK : GRAY;
    txt(p1, label, calcX, ry, { size: sz, f: fnt, color: col });
    const vw = fnt.widthOfTextAtSize(val, sz);
    txt(p1, val, W - M - vw, ry, { size: sz, f: fnt, color: col });
  });

  // Opmerkingen (left side)
  txt(p1, 'OPMERKINGEN', M, blockTop, { size: 7.5, f: bold });
  const opLines = (opmerkingen || '').split('\n').slice(0, 6);
  opLines.forEach((line, i) => {
    txt(p1, line, M, blockTop - 13 - i * 11, { size: 8 });
  });

  y = blockTop - 86;
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
  activeBullets.slice(0, 7).forEach((b, i) => {
    txt(p1, `- ${b}`, M, y - i * 11, { size: 7.5, color: GRAY });
  });
  y -= Math.min(activeBullets.length, 7) * 11 + 8;

  // ── HANDTEKENING ──
  hLine(p1, M, y, W - M, { thickness: 1, color: GOLD });
  y -= 6;
  txt(p1, 'Handtekening huurder/bestuurder:', M, y, { size: 7, color: GRAY });
  txt(p1, 'Door te tekenen gaat u akkoord met de algemene voorwaarden.', M + 155, y, { size: 7, color: GRAY });

  const sigY = y - 52;

  if (handtekeningDataUrl) {
    try {
      const img  = await pdfDoc.embedPng(handtekeningDataUrl);
      const dims = img.scale(0.15);
      p1.drawImage(img, { x: M, y: sigY, width: dims.width, height: dims.height });
    } catch (_) {}
  }

  if (handtekeningSchadeDataUrl) {
    try {
      const img2 = await pdfDoc.embedPng(handtekeningSchadeDataUrl);
      p1.drawImage(img2, { x: M + 155, y: sigY - 10, width: 140, height: 60 });
    } catch (_) {}
  }

  // ──────────────── PAGE 2+: ALGEMENE VOORWAARDEN ────────────────
  if (contractTerms && contractTerms.trim()) {
    const newTermsPage = () => {
      const tp = pdfDoc.addPage([W, H]);
      fillRect(tp, 0, H - 44, W, 44, DARK);
      txt(tp, tenantName, M, H - 24, { size: 14, f: bold, color: GOLD });
      txt(tp, 'ALGEMENE VOORWAARDEN', M, H - 37, { size: 7, color: rgb(0.6, 0.6, 0.6) });
      return { tp, ty: H - 58 };
    };

    let { tp, ty } = newTermsPage();
    const maxW = W - M * 2;

    for (const rawLine of contractTerms.split('\n')) {
      const l = rawLine.trimEnd();

      if (ty < M + 18) {
        const next = newTermsPage();
        tp = next.tp;
        ty = next.ty;
      }

      if (!l.trim()) { ty -= 5; continue; }

      const isHeader = /^ARTIKEL\s+\d+/i.test(l.trim());
      if (isHeader) {
        ty -= 3;
        txt(tp, l.trim(), M, ty, { size: 9, f: bold });
        ty -= 13;
        continue;
      }

      // Wrap long lines
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
