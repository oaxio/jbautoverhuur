"use client"
import { TextField, Button } from "@mui/material"
import defaultPdfString from "../helpers/defaultPdfString";
import defaultPdfFactureString from "../helpers/defaultPdfFactureString"
import { PDFDocument } from 'pdf-lib';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import SignatureCanvas from 'react-signature-canvas'
import { useState, useRef, useEffect } from "react";
import { QRCodeSVG } from 'qrcode.react';

function SectionCard({ title, icon, children }) {
  return (
    <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '1.25rem' }}>
      <div className="section-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span>{icon}</span> {title}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem 2rem' }}>
        {children}
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type }) {
  return (
    <TextField
      fullWidth
      variant="standard"
      label={label}
      value={value}
      type={type || 'text'}
      onChange={(e) => onChange(e.target.value)}
      InputLabelProps={{ shrink: type === 'date' || type === 'time' ? true : undefined }}
    />
  )
}

export default function CreateContract() {
  const [Voornaam, setVoornaam] = useState('');
  const [Achternaam, setAchternaam] = useState('');
  const [Telefoon, setTelefoon] = useState('');
  const [Geboortedatum, setGeboortedatum] = useState('');
  const [PostcodeWoonplaats, setPostcodeWoonplaats] = useState('');
  const [Documentnummer, setDocumentnummer] = useState('');
  const [RijbewijsAfgifteDatum, setRijbewijsAfgifteDatum] = useState('');
  const [Straatnaam, setStraatnaam] = useState('');
  const [Email, setEmail] = useState('');

  const [RetourDatum, setRetourDatum] = useState('');
  const [RetourTijd, setRetourTijd] = useState('');
  const [Ophaaldatum, setOphaaldatum] = useState(() => {
    const d = new Date();
    return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
  });
  const [OphaalTijd, setOphaalTijd] = useState('');
  const [Autogegevens, setAutogegevens] = useState('');
  const [Kenteken, setKenteken] = useState('');
  const [Kleur, setKleur] = useState('');
  const [Brandstof, setBrandstof] = useState('');
  const [startKmStand, setstartKmStand] = useState('');
  const [TarievenAuto, setTarievenAuto] = useState('');
  const [borgVoldaanDatum, setborgVoldaanDatum] = useState('');
  const [DagenAuto, setDagenAuto] = useState('');
  const [orderNummer, setOrderNummer] = useState('');

  const [url, setUrl] = useState('');
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [cars, setCars] = useState([]);
  const [selectedCarId, setSelectedCarId] = useState('');

  const [intakeToken, setIntakeToken] = useState('');
  const [intakeUrl, setIntakeUrl] = useState('');
  const [intakeStatus, setIntakeStatus] = useState('');
  const [intakeLinkCopied, setIntakeLinkCopied] = useState(false);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [loadingIntake, setLoadingIntake] = useState(false);

  useEffect(() => {
    fetch('/api/cars').then(r => r.ok ? r.json() : []).then(setCars).catch(() => {});
  }, []);

  const generateIntakeLink = async () => {
    setGeneratingLink(true);
    try {
      const res = await fetch('/api/intake', { method: 'POST' });
      const { token } = await res.json();
      const url = `${window.location.origin}/intake/${token}`;
      setIntakeToken(token);
      setIntakeUrl(url);
      setIntakeStatus('pending');
    } catch {}
    setGeneratingLink(false);
  };

  const copyIntakeLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'JB Autoverhuur — vul uw gegevens in',
          text: 'Klik op de link om uw huurgegevens in te vullen:',
          url: intakeUrl,
        });
        return;
      } catch {}
    }
    navigator.clipboard.writeText(intakeUrl);
    setIntakeLinkCopied(true);
    setTimeout(() => setIntakeLinkCopied(false), 2000);
  };

  const loadIntakeData = async () => {
    if (!intakeToken) return;
    setLoadingIntake(true);
    try {
      const res = await fetch(`/api/intake/${intakeToken}`);
      const d = await res.json();
      if (d.status === 'submitted' && d.data) {
        const data = d.data;
        if (data.voornaam) setVoornaam(data.voornaam);
        if (data.achternaam) setAchternaam(data.achternaam);
        if (data.email) setEmail(data.email);
        if (data.telefoon) setTelefoon(data.telefoon);
        if (data.geboortedatum) setGeboortedatum(data.geboortedatum);
        if (data.straat) setStraatnaam(data.straat);
        if (data.postcode && data.woonplaats) setPostcodeWoonplaats(`${data.postcode}  ${data.woonplaats}`);
        if (data.documentnummer) setDocumentnummer(data.documentnummer);
        if (data.rijbewijsAfgiftedatum) setRijbewijsAfgifteDatum(data.rijbewijsAfgiftedatum);
        setIntakeStatus('loaded');
      } else {
        setIntakeStatus('pending');
        alert('De klant heeft de link nog niet ingevuld.');
      }
    } catch {}
    setLoadingIntake(false);
  };

  // Aanpasbare PDF-teksten
  const [disclaimer, setDisclaimer] = useState('Door te tekenen gaat u akkoord met de algemene voorwaarden.');
  const [btwPercentage, setBtwPercentage] = useState('21');
  const [factuurOmschrijving, setFactuurOmschrijving] = useState('Autoverhuur');

  const sigCanvas = useRef({});
  const sigCanvasDamage = useRef({});

  const handleClose = () => setOpen(false);

  const printToPdf = async () => {
    setGenerating(true);
    setOpen(true);

    const originalBytes = defaultPdfString;
    const btw = parseFloat(btwPercentage) || 21;
    var autoPrijs = (TarievenAuto * DagenAuto).toFixed(2).toString();
    var prijsBtw = ((autoPrijs / (100 + btw)) * btw).toFixed(2).toString();
    var prijsExcBtw = (autoPrijs - prijsBtw).toFixed(2).toString();

    const pdfDoc = await PDFDocument.load(originalBytes)
    const pages = pdfDoc.getPages()
    const firstPage = pages[0]

    const pngImage = await pdfDoc.embedPng(sigCanvas.current.toDataURL('image/png'));
    const pngDims = pngImage.scale(0.15);
    const pngImageDamage = await pdfDoc.embedPng(sigCanvasDamage.current.toDataURL('image/png'));

    firstPage.drawImage(pngImage, { x: 60, y: 120, width: pngDims.width, height: pngDims.height })
    firstPage.drawText(disclaimer, {
      x: 70,
      y: 113,
      size: 6.5,
    })
    firstPage.drawImage(pngImageDamage, { x: 95, y: 220, width: 160, height: 160 })

    firstPage.drawText(Voornaam, { x: 135, y: 632, size: 10 })
    firstPage.drawText(Achternaam, { x: 135, y: 620, size: 10 })
    firstPage.drawText(Geboortedatum, { x: 135, y: 608, size: 10 })
    firstPage.drawText(Email, { x: 135, y: 596, size: 10 })
    firstPage.drawText(Telefoon, { x: 135, y: 584, size: 10 })
    firstPage.drawText(Straatnaam, { x: 420, y: 633, size: 10 })
    firstPage.drawText(PostcodeWoonplaats, { x: 420, y: 619, size: 10 })
    firstPage.drawText(Documentnummer, { x: 420, y: 607, size: 10 })
    firstPage.drawText(RijbewijsAfgifteDatum, { x: 420, y: 594, size: 10 })
    firstPage.drawText(Ophaaldatum, { x: 150, y: 550, size: 10 })
    firstPage.drawText(OphaalTijd, { x: 150, y: 537, size: 10 })
    firstPage.drawText(RetourDatum, { x: 395, y: 550, size: 10 })
    firstPage.drawText(RetourTijd, { x: 395, y: 537, size: 10 })
    firstPage.drawText(Autogegevens, { x: 80, y: 491, size: 10 })
    firstPage.drawText(Kenteken, { x: 280, y: 670, size: 10 })
    firstPage.drawText(Kenteken, { x: 170, y: 491, size: 10 })
    firstPage.drawText(Kleur, { x: 260, y: 491, size: 10 })
    firstPage.drawText(Brandstof, { x: 350, y: 491, size: 10 })
    firstPage.drawText(startKmStand, { x: 440, y: 491, size: 10 })
    firstPage.drawText(TarievenAuto, { x: 80, y: 430, size: 10 })
    firstPage.drawText(DagenAuto, { x: 145, y: 430, size: 10 })
    firstPage.drawText(autoPrijs, { x: 210, y: 430, size: 10 })
    firstPage.drawText(prijsExcBtw, { x: 275, y: 430, size: 10 })
    firstPage.drawText(btwPercentage, { x: 340, y: 430, size: 10 })
    firstPage.drawText(prijsBtw, { x: 400, y: 430, size: 10 })
    firstPage.drawText(autoPrijs, { x: 465, y: 430, size: 10 })
    firstPage.drawText(prijsExcBtw, { x: 483, y: 375, size: 10 })
    firstPage.drawText(prijsBtw, { x: 483, y: 352, size: 10 })
    firstPage.drawText(autoPrijs, { x: 483, y: 329, size: 10 })
    firstPage.drawText(borgVoldaanDatum, { x: 477, y: 283, size: 8 })
    firstPage.drawText(autoPrijs, { x: 483, y: 258, size: 10 })

    const pdfBytes = await pdfDoc.saveAsBase64()
    const binaryData = new Uint8Array(atob(pdfBytes).split('').map(c => c.charCodeAt(0)));
    const pdfBlob = new Blob([binaryData], { type: 'application/pdf' });
    setUrl(URL.createObjectURL(pdfBlob));
    setGenerating(false);
  };

  const invoiceToPdf = async () => {
    setGenerating(true);
    const btw = parseFloat(btwPercentage) || 21;
    var autoPrijs = (TarievenAuto * DagenAuto).toFixed(2).toString();
    var prijsBtw = ((autoPrijs / (100 + btw)) * btw).toFixed(2).toString();
    var prijsExcBtw = (autoPrijs - prijsBtw).toFixed(2).toString();

    const pdfDoc = await PDFDocument.load(defaultPdfFactureString)
    const pages = pdfDoc.getPages()
    const firstPage = pages[0]

    firstPage.drawText(Voornaam, { x: 75, y: 640, size: 10 })
    firstPage.drawText(Straatnaam, { x: 75, y: 620, size: 10 })
    firstPage.drawText(PostcodeWoonplaats, { x: 75, y: 600, size: 10 })
    firstPage.drawText(orderNummer, { x: 155, y: 452, size: 10 })
    firstPage.drawText(Ophaaldatum, { x: 155, y: 425, size: 10 })
    firstPage.drawText(factuurOmschrijving, { x: 80, y: 342, size: 10 })
    firstPage.drawText("1x", { x: 317, y: 342, size: 10 })
    firstPage.drawText(autoPrijs, { x: 347, y: 342, size: 10 })
    firstPage.drawText(prijsExcBtw, { x: 405, y: 342, size: 10 })
    firstPage.drawText(prijsExcBtw, { x: 445, y: 246, size: 10 })
    firstPage.drawText(prijsBtw, { x: 445, y: 222, size: 10 })
    firstPage.drawText(autoPrijs, { x: 445, y: 198, size: 10 })

    const pdfBytes = await pdfDoc.saveAsBase64()
    const binaryData = new Uint8Array(atob(pdfBytes).split('').map(c => c.charCodeAt(0)));
    const pdfBlob = new Blob([binaryData], { type: 'application/pdf' });
    setUrl(URL.createObjectURL(pdfBlob));
    setGenerating(false);
  };

  return (
    <main style={{ position: 'relative', zIndex: 1, padding: '5.5rem 1rem 3rem' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        <div style={{ marginBottom: '2rem' }}>
          <a href="/" style={{
            color: 'rgba(255,255,255,0.4)',
            fontSize: '0.8rem',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            marginBottom: '0.75rem',
          }}>
            ← Terug
          </a>
          <h1 style={{
            color: 'white',
            fontWeight: 800,
            fontSize: 'clamp(1.4rem, 3vw, 1.9rem)',
            letterSpacing: '-0.01em',
            marginBottom: '0.3rem',
          }}>
            Nieuw Contract
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
            Vul alle velden in en teken om een verhuurcontract te genereren.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '1.25rem' }}>
          <div className="section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>👤</span> Klantgegevens
            </span>
            {intakeStatus === 'loaded' && (
              <span style={{
                fontSize: '0.72rem', background: 'rgba(80,200,80,0.12)',
                border: '1px solid rgba(80,200,80,0.3)', color: '#6dda6d',
                borderRadius: 20, padding: '0.25rem 0.75rem', fontWeight: 600,
              }}>✓ Klantdata geladen</span>
            )}
          </div>

          <div style={{
            background: 'rgba(232,184,75,0.06)',
            border: '1px solid rgba(232,184,75,0.2)',
            borderRadius: 10,
            padding: '1rem 1.1rem',
            marginBottom: '1.25rem',
          }}>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', marginBottom: '0.75rem' }}>
              📲 Stuur een link naar de klant om zelf zijn gegevens in te vullen — bespaart u het typen.
            </p>
            {!intakeUrl ? (
              <button
                onClick={generateIntakeLink}
                disabled={generatingLink}
                style={{
                  background: 'linear-gradient(135deg, #e8b84b, #c9962e)',
                  color: '#1a0f00', border: 'none', borderRadius: 8,
                  padding: '0.55rem 1.1rem', fontWeight: 700, fontSize: '0.82rem',
                  cursor: generatingLink ? 'not-allowed' : 'pointer',
                  opacity: generatingLink ? 0.6 : 1,
                }}
              >
                {generatingLink ? 'Bezig…' : '🔗 Genereer klantlink'}
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <input
                    readOnly value={intakeUrl}
                    style={{
                      flex: 1, minWidth: 0,
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 7, color: 'rgba(255,255,255,0.7)',
                      padding: '0.45rem 0.75rem', fontSize: '0.78rem',
                      fontFamily: 'monospace',
                    }}
                  />
                  <button
                    onClick={copyIntakeLink}
                    style={{
                      background: intakeLinkCopied ? 'rgba(80,200,80,0.2)' : 'rgba(255,255,255,0.1)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: 7, color: intakeLinkCopied ? '#6dda6d' : 'white',
                      padding: '0.45rem 0.85rem', fontSize: '0.78rem',
                      cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap',
                    }}
                  >
                    {intakeLinkCopied ? '✓ Gekopieerd' : (typeof navigator !== 'undefined' && navigator.share ? '📤 Delen' : 'Kopieer')}
                  </button>
                  <button
                    onClick={loadIntakeData}
                    disabled={loadingIntake}
                    style={{
                      background: 'rgba(232,184,75,0.15)',
                      border: '1px solid rgba(232,184,75,0.3)',
                      borderRadius: 7, color: '#e8b84b',
                      padding: '0.45rem 0.85rem', fontSize: '0.78rem',
                      cursor: loadingIntake ? 'not-allowed' : 'pointer',
                      fontWeight: 600, whiteSpace: 'nowrap',
                      opacity: loadingIntake ? 0.6 : 1,
                    }}
                  >
                    {loadingIntake ? 'Controleren…' : '⬇ Gegevens laden'}
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                  <div style={{
                    background: 'white',
                    borderRadius: 10,
                    padding: '0.55rem',
                    display: 'inline-flex',
                    flexShrink: 0,
                  }}>
                    <QRCodeSVG value={intakeUrl} size={100} />
                  </div>
                  <div style={{ flex: 1, minWidth: 140 }}>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', margin: '0 0 0.4rem 0', fontWeight: 600 }}>
                      Scan of stuur de link
                    </p>
                    <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)', margin: 0, lineHeight: 1.5 }}>
                      Klant scant de QR-code met zijn telefoon, of stuur de link via WhatsApp / e-mail. Klik daarna op "Gegevens laden" zodra de klant klaar is.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem 2rem' }}>
            <Field label="Voornaam" value={Voornaam} onChange={setVoornaam} />
            <Field label="Achternaam" value={Achternaam} onChange={setAchternaam} />
            <Field label="E-mailadres" value={Email} onChange={setEmail} />
            <Field label="Telefoonnummer" value={Telefoon} onChange={setTelefoon} />
            <Field label="Geboortedatum" value={Geboortedatum} onChange={setGeboortedatum} />
            <Field label="Straatnaam + Huisnummer" value={Straatnaam} onChange={setStraatnaam} />
            <Field label="Postcode + Woonplaats" value={PostcodeWoonplaats} onChange={setPostcodeWoonplaats} />
            <Field label="Documentnummer" value={Documentnummer} onChange={setDocumentnummer} />
            <Field label="Rijbewijs afgiftedatum" value={RijbewijsAfgifteDatum} onChange={setRijbewijsAfgifteDatum} />
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '1.25rem' }}>
          <div className="section-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <span>🚗</span> Voertuiggegevens
          </div>

          {cars.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.4rem', letterSpacing: '0.04em' }}>
                Snel laden uit opgeslagen voertuigen
              </label>
              <select
                value={selectedCarId}
                onChange={e => {
                  const id = e.target.value;
                  setSelectedCarId(id);
                  if (id) {
                    const car = cars.find(c => String(c.id) === id);
                    if (car) {
                      setAutogegevens(car.autogegevens);
                      setKenteken(car.kenteken);
                      setKleur(car.kleur);
                      setBrandstof(car.brandstof);
                    }
                  }
                }}
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 8,
                  color: 'white',
                  padding: '0.6rem 0.85rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                }}
              >
                <option value="" style={{ background: '#1a1a1a' }}>— Selecteer een voertuig —</option>
                {cars.map(car => (
                  <option key={car.id} value={car.id} style={{ background: '#1a1a1a' }}>
                    {car.autogegevens} — {car.kenteken}{car.kleur ? ` (${car.kleur})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem 2rem' }}>
            <Field label="Autogegevens" value={Autogegevens} onChange={setAutogegevens} />
            <Field label="Kenteken" value={Kenteken} onChange={setKenteken} />
            <Field label="Kleur" value={Kleur} onChange={setKleur} />
            <Field label="Brandstof" value={Brandstof} onChange={setBrandstof} />
            <Field label="Begin KM-stand" value={startKmStand} onChange={setstartKmStand} />
          </div>

          {cars.length === 0 && (
            <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>
              💡 Sla voertuigen op via <a href="/autos" style={{ color: '#e8b84b', textDecoration: 'none' }}>Voertuigbeheer</a> om ze hier snel te laden.
            </p>
          )}
        </div>

        <SectionCard title="Verhuurperiode" icon="📅">
          <Field label="Ophaaldatum" value={Ophaaldatum} onChange={setOphaaldatum} />
          <Field label="Ophaaltijd" value={OphaalTijd} onChange={setOphaalTijd} />
          <Field label="Retourdatum" value={RetourDatum} onChange={setRetourDatum} />
          <Field label="Retourtijd" value={RetourTijd} onChange={setRetourTijd} />
        </SectionCard>

        <SectionCard title="Tarieven & Betaling" icon="💶">
          <Field label="Tarief per dag (€)" value={TarievenAuto} onChange={setTarievenAuto} type="number" />
          <Field label="Aantal dagen" value={DagenAuto} onChange={setDagenAuto} type="number" />
          <Field label="Borg voldaan (datum + tijd)" value={borgVoldaanDatum} onChange={setborgVoldaanDatum} />
          <Field label="Factuurnummer" value={orderNummer} onChange={setOrderNummer} />
        </SectionCard>

        <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '1.25rem' }}>
          <div className="section-header">🖊 Schaderapport — teken op de auto</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <SignatureCanvas
              ref={sigCanvasDamage}
              penColor="red"
              canvasProps={{ width: 300, height: 300, className: 'signature-canvas' }}
            />
            <button
              onClick={() => sigCanvasDamage.current.clear()}
              style={{
                alignSelf: 'flex-start',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.7)',
                borderRadius: 8,
                padding: '0.35rem 0.9rem',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              Wissen
            </button>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
          <div className="section-header">✍️ Handtekening klant</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <SignatureCanvas
              ref={sigCanvas}
              canvasProps={{ width: 400, height: 180, className: 'signature-canvas-2' }}
            />
            <button
              onClick={() => sigCanvas.current.clear()}
              style={{
                alignSelf: 'flex-start',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.7)',
                borderRadius: 8,
                padding: '0.35rem 0.9rem',
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              Wissen
            </button>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem 1.75rem', marginBottom: '1.25rem' }}>
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 600,
              padding: 0,
              width: '100%',
            }}
          >
            <span style={{ fontSize: '1rem' }}>⚙️</span>
            PDF Instellingen
            <span style={{ marginLeft: 'auto', fontSize: '0.75rem', opacity: 0.5 }}>
              {settingsOpen ? '▲ verberg' : '▼ toon'}
            </span>
          </button>

          {settingsOpen && (
            <div style={{ marginTop: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem 2rem' }}>
              <TextField
                fullWidth
                variant="standard"
                label="Disclaimer tekst (contract)"
                value={disclaimer}
                onChange={(e) => setDisclaimer(e.target.value)}
                inputProps={{ style: { fontSize: '0.85rem' } }}
              />
              <TextField
                fullWidth
                variant="standard"
                label="BTW-percentage (%)"
                value={btwPercentage}
                onChange={(e) => setBtwPercentage(e.target.value)}
                type="number"
              />
              <TextField
                fullWidth
                variant="standard"
                label="Omschrijving factuur"
                value={factuurOmschrijving}
                onChange={(e) => setFactuurOmschrijving(e.target.value)}
              />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '3rem' }}>
          <button
            onClick={printToPdf}
            style={{
              background: 'linear-gradient(135deg, #e8b84b, #d4a033)',
              color: '#000',
              border: 'none',
              borderRadius: 10,
              padding: '0.85rem 2.25rem',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              letterSpacing: '0.02em',
              boxShadow: '0 4px 20px rgba(232,184,75,0.3)',
            }}
          >
            Contract genereren →
          </button>
        </div>
      </div>

      <Dialog
        fullWidth
        maxWidth="lg"
        onClose={handleClose}
        open={open}
        PaperProps={{
          style: {
            background: '#111',
            color: 'white',
            height: '90vh',
            borderRadius: 16,
            border: '1px solid rgba(255,255,255,0.1)',
          }
        }}
      >
        <DialogTitle style={{
          background: '#1a1a1a',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          padding: '0.75rem 1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ flex: 1, fontWeight: 700, fontSize: '0.95rem', color: 'white' }}>
              📄 Contract Preview
            </span>
            <button
              onClick={handleClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.4)',
                fontSize: '1.2rem',
                cursor: 'pointer',
                padding: '0.2rem',
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>
          {!generating && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
              <a
                href={url}
                download="contract.pdf"
                style={{
                  background: 'rgba(232,184,75,0.15)',
                  border: '1px solid rgba(232,184,75,0.35)',
                  color: '#e8b84b',
                  borderRadius: 8,
                  padding: '0.4rem 0.85rem',
                  textDecoration: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                }}
              >
                ↓ Download Contract
              </a>
              <button
                onClick={invoiceToPdf}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  color: 'rgba(255,255,255,0.8)',
                  borderRadius: 8,
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Factuur genereren
              </button>
            </div>
          )}
        </DialogTitle>
        {generating ? (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255,255,255,0.5)',
            fontSize: '0.9rem',
          }}>
            Contract wordt gegenereerd...
          </div>
        ) : (
          <iframe
            src={url}
            style={{ flex: 1, border: 'none', width: '100%', height: '100%' }}
            title="Contract Preview"
          />
        )}
      </Dialog>
    </main>
  )
}
