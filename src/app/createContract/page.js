"use client"
import { Box, TextField, Button } from "@mui/material"
import defaultPdfString from "../helpers/defaultPdfString";
import defaultPdfFactureString from "../helpers/defaultPdfFactureString"

import { PDFDocument } from 'pdf-lib';

import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';

import SignatureCanvas from 'react-signature-canvas'

import { useState, useRef } from "react";

export default function CreateContract() {

  var date = new Date();


  const [factuurPath, setfactuurPath] = useState('')

  // Personal info
  const [Voornaam, setVoornaam] = useState('');
  const [Achternaam, setAchternaam] = useState('');
  const [Telefoon, setTelefoon] = useState('');
  const [Geboortedatum, setGeboortedatum] = useState('');
  const [PostcodeWoonplaats, setPostcodeWoonplaats] = useState('');
  const [Documentnummer, setDocumentnummer] = useState('');
  const [RijbewijsAfgifteDatum, setRijbewijsAfgifteDatum] = useState('');
  const [Straatnaam, setStraatnaam] = useState('');
  const [Email, setEmail] = useState('');

  // Car detail
  const [RetourDatum, setRetourDatum] = useState('');
  const [RetourTijd, setRetourTijd] = useState('');
  const [Ophaaldatum, setOphaaldatum] = useState('');
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

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (value) => {
    setOpen(false);
  };

  const printToPdf = async () => {

    handleClickOpen()


    const originalBytes = defaultPdfString;

    // Calculate BTW and Pricing

    var autoPrijs = (TarievenAuto * DagenAuto).toFixed(2).toString();

    var prijsBtw = ((autoPrijs / 121) * 21).toFixed(2).toString();

    var prijsExcBtw = (autoPrijs - prijsBtw).toFixed(2).toString();


    // Create PDF
    const pdfDoc = await PDFDocument.load(originalBytes)
    const pages = pdfDoc.getPages()
    const firstPage = pages[0]
    const { width, height } = firstPage.getSize()

    const pngImage = await pdfDoc.embedPng(sigCanvas.current.toDataURL('image/png'));
    const pngDims = pngImage.scale(0.15);

    const pngImageDamage = await pdfDoc.embedPng(sigCanvasDamage.current.toDataURL('image/png'));

    // Draw the PNG image in the signature field
    firstPage.drawImage(pngImage, {
      x: 60,
      y: 120,
      width: pngDims.width,
      height: pngDims.height,
      backgroundColor: "#fff"
    })

    firstPage.drawImage(pngImageDamage, {
      x: 95,
      y: 220,
      width: 160,
      height: 160,
      backgroundColor: "#fff"
    })


    firstPage.drawText(Voornaam, {
      x: 135,
      y: 632,
      size: 10,
    })

    firstPage.drawText(Achternaam, {
      x: 135,
      y: 620,
      size: 10,
    })

    firstPage.drawText(Geboortedatum, {
      x: 135,
      y: 608,
      size: 10,
    })

    firstPage.drawText(Email, {
      x: 135,
      y: 596,
      size: 10,
    })

    firstPage.drawText(Telefoon, {
      x: 135,
      y: 584,
      size: 10,
    })

    firstPage.drawText(Straatnaam, {
      x: 420,
      y: 633,
      size: 10,
    })

    firstPage.drawText(PostcodeWoonplaats, {
      x: 420,
      y: 619,
      size: 10,
    })

    firstPage.drawText(Documentnummer, {
      x: 420,
      y: 607,
      size: 10,
    })

    firstPage.drawText(RijbewijsAfgifteDatum, {
      x: 420,
      y: 594,
      size: 10,
    })

    firstPage.drawText(Ophaaldatum, {
      x: 150,
      y: 550,
      size: 10,
    })

    firstPage.drawText(OphaalTijd, {
      x: 150,
      y: 537,
      size: 10,
    })

    firstPage.drawText(RetourDatum, {
      x: 395,
      y: 550,
      size: 10,
    })

    firstPage.drawText(RetourTijd, {
      x: 395,
      y: 537,
      size: 10,
    })

    firstPage.drawText(Autogegevens, {
      x: 80,
      y: 491,
      size: 10,
    })

    // Kenteken boven

    firstPage.drawText(Kenteken, {
      x: 280,
      y: 670,
      size: 10,
    })

    firstPage.drawText(Kenteken, {
      x: 170,
      y: 491,
      size: 10,
    })

    firstPage.drawText(Kleur, {
      x: 260,
      y: 491,
      size: 10,
    })

    firstPage.drawText(Brandstof, {
      x: 350,
      y: 491,
      size: 10,
    })

    firstPage.drawText(startKmStand, {
      x: 440,
      y: 491,
      size: 10,
    })

    firstPage.drawText(TarievenAuto, {
      x: 80,
      y: 430,
      size: 10,
    })

    firstPage.drawText(DagenAuto, {
      x: 145,
      y: 430,
      size: 10,
    })

    firstPage.drawText(autoPrijs, {
      x: 210,
      y: 430,
      size: 10,
    })

    firstPage.drawText(prijsExcBtw, {
      x: 275,
      y: 430,
      size: 10,
    })

    firstPage.drawText("21", {
      x: 340,
      y: 430,
      size: 10,
    })

    firstPage.drawText(prijsBtw, {
      x: 400,
      y: 430,
      size: 10,
    })

    firstPage.drawText(autoPrijs, {
      x: 465,
      y: 430,
      size: 10,
    })

    // Total prices calc block

    firstPage.drawText(prijsExcBtw, {
      x: 483,
      y: 375,
      size: 10,
    })

    firstPage.drawText(prijsBtw, {
      x: 483,
      y: 352,
      size: 10,
    })

    firstPage.drawText(autoPrijs, {
      x: 483,
      y: 329,
      size: 10,
    })

    firstPage.drawText(borgVoldaanDatum, {
      x: 477,
      y: 283,
      size: 8,
    })

    firstPage.drawText(autoPrijs, {
      x: 483,
      y: 258,
      size: 10,
    })

    const pdfBytes = await pdfDoc.saveAsBase64()

    const binaryData = new Uint8Array(atob(pdfBytes).split('').map(char => char.charCodeAt(0)));


    const pdfBlob = new Blob([binaryData], { type: 'application/pdf' });

    const link = URL.createObjectURL(pdfBlob);

    setUrl(link)

  };

  const invoiceToPdf = async () => {

    var autoPrijs = (TarievenAuto * DagenAuto).toFixed(2).toString();

    var prijsBtw = ((autoPrijs / 121) * 21).toFixed(2).toString();

    var prijsExcBtw = (autoPrijs - prijsBtw).toFixed(2).toString();

    const originalBytes = defaultPdfFactureString;

    // Create PDF
    const pdfDoc = await PDFDocument.load(originalBytes)
    const pages = pdfDoc.getPages()
    const firstPage = pages[0]
    const { width, height } = firstPage.getSize()

    firstPage.drawText(Voornaam, {
      x: 75,
      y: 640,
      size: 10,
    })

    firstPage.drawText(Straatnaam, {
      x: 75,
      y: 620,
      size: 10,
    })

    firstPage.drawText(PostcodeWoonplaats, {
      x: 75,
      y: 600,
      size: 10,
    })

    firstPage.drawText(orderNummer, {
      x: 155,
      y: 452,
      size: 10,
    })

    firstPage.drawText(Ophaaldatum, {
      x: 155,
      y: 425,
      size: 10,
    })

    firstPage.drawText("Autoverhuur", {
      x: 80,
      y: 342,
      size: 10,
    })

    firstPage.drawText("1x", {
      x: 317,
      y: 342,
      size: 10,
    })

    firstPage.drawText(autoPrijs, {
      x: 347,
      y: 342,
      size: 10,
    })

    firstPage.drawText(prijsExcBtw, {
      x: 405,
      y: 342,
      size: 10,
    })

    // Total prices calc block

    firstPage.drawText(prijsExcBtw, {
      x: 445,
      y: 246,
      size: 10,
    })

    firstPage.drawText(prijsBtw, {
      x: 445,
      y: 222,
      size: 10,
    })

    firstPage.drawText(autoPrijs, {
      x: 445,
      y: 198,
      size: 10,
    })

    const pdfBytes = await pdfDoc.saveAsBase64()

    const binaryData = new Uint8Array(atob(pdfBytes).split('').map(char => char.charCodeAt(0)));

    const pdfBlob = new Blob([binaryData], { type: 'application/pdf' });

    const link = URL.createObjectURL(pdfBlob);

    setUrl(link)

  };

  const sigCanvas = useRef({});

  const sigCanvasDamage = useRef({});


  return (
    <main className="w-full md:container mx-auto p-4 md:p-0">
      <Box className="grid md:grid-cols-2 gap-8 mt-16 md:mt-24">
        <TextField value={Voornaam} fullWidth variant="standard" label="Voornaam" onChange={(e) => {
          setVoornaam(e.target.value);
        }} />
        <TextField value={Achternaam} fullWidth variant="standard" label="Achternaam" onChange={(e) => {
          setAchternaam(e.target.value);
        }} />
        <TextField value={Email} fullWidth variant="standard" label="Email" onChange={(e) => {
          setEmail(e.target.value);
        }} />
        <TextField value={Telefoon} fullWidth variant="standard" label="Telefoon" onChange={(e) => {
          setTelefoon(e.target.value);
        }} />
        <TextField value={Geboortedatum} fullWidth variant="standard" label="Geboortedatum" onChange={(e) => {
          setGeboortedatum(e.target.value);
        }} />
        <TextField value={Straatnaam} fullWidth variant="standard" label="Straatnaam + Huisnummer" onChange={(e) => {
          setStraatnaam(e.target.value);
        }} />
        <TextField value={PostcodeWoonplaats} fullWidth variant="standard" label="Postcode + Woonplaats" onChange={(e) => {
          setPostcodeWoonplaats(e.target.value);
        }} />

        <TextField value={Documentnummer} fullWidth variant="standard" label="Documentnummer" onChange={(e) => {
          setDocumentnummer(e.target.value);
        }} />

        <TextField value={RijbewijsAfgifteDatum} fullWidth variant="standard" label="Rijbewijs afgifte datum" onChange={(e) => {
          setRijbewijsAfgifteDatum(e.target.value);
        }} />

        <TextField value={Ophaaldatum} fullWidth variant="standard" label="Ophaaldatum" onChange={(e) => {
          setOphaaldatum(e.target.value);
        }} />

        <TextField value={OphaalTijd} fullWidth variant="standard" label="Ophaaltijd" onChange={(e) => {
          setOphaalTijd(e.target.value);
        }} />

        <TextField value={RetourDatum} fullWidth variant="standard" label="Retourdatum" onChange={(e) => {
          setRetourDatum(e.target.value);
        }} />

        <TextField value={RetourTijd} fullWidth variant="standard" label="Retourtijd" onChange={(e) => {
          setRetourTijd(e.target.value);
        }} />

        <TextField value={Autogegevens} fullWidth variant="standard" label="Autogegevens" onChange={(e) => {
          setAutogegevens(e.target.value);
        }} />

        <TextField value={Kenteken} fullWidth variant="standard" label="Kenteken" onChange={(e) => {
          setKenteken(e.target.value);
        }} />

        <TextField value={Kleur} fullWidth variant="standard" label="Kleur" onChange={(e) => {
          setKleur(e.target.value);
        }} />

        <TextField value={Brandstof} fullWidth variant="standard" label="Brandstof" onChange={(e) => {
          setBrandstof(e.target.value);
        }} />


        <TextField value={startKmStand} fullWidth variant="standard" label="Begin KM stand" onChange={(e) => {
          setstartKmStand(e.target.value);
        }} />

        <TextField value={TarievenAuto} fullWidth variant="standard" label="Tarief" onChange={(e) => {
          setTarievenAuto(e.target.value);
        }} />

        <TextField value={DagenAuto} fullWidth variant="standard" label="Dagen" onChange={(e) => {
          setDagenAuto(e.target.value);
        }} />

        <TextField value={borgVoldaanDatum} fullWidth variant="standard" label="Borg voldaan (Datum + Tijd)" onChange={(e) => {
          setborgVoldaanDatum(e.target.value);
        }} />

        <TextField value={orderNummer} fullWidth variant="standard" label="Factuur nummer" onChange={(e) => {
          setOrderNummer(e.target.value);
        }} />      </Box>


      <Box className="relative">

        <Button
          style={{ marginTop: '20px', marginBottom: '10px' }}
          onClick={(e) => sigCanvasDamage.current.clear()}
        >Clear</Button>

        <SignatureCanvas
          ref={sigCanvasDamage}
          penColor="red"
          style={{ border: '1px solid black' }}
          canvasProps={{ minWidth: 300, minHeight: 300, width: 300, height: 300, className: 'signature-canvas' }}
        />
      </Box>


      <Button
                style={{ marginBottom: '10px' }}

        onClick={(e) => sigCanvas.current.clear()}
      >Clear</Button>

      <SignatureCanvas
        ref={sigCanvas}
        style={{ border: '1px solid black' }}
        canvasProps={{ width: 300, height: 200, className: 'signature-canvas-2' }}
      />


      <Box className="mb-16 mt-6">
        <Button onClick={(e) => printToPdf()} variant="outlined">Maak contract</Button>
      </Box>


      <Dialog fullWidth={true}
        maxWidth="lg" onClose={handleClose} open={open}>
        <DialogTitle className="flex">
          Contract
          <Button style={{ marginLeft: 'auto' }}
            href={url}
          >
            Download
          </Button>
          <Button style={{ marginLeft: 'auto' }}
            onClick={(e) => invoiceToPdf()}
          >
            Factuur
          </Button>
        </DialogTitle>

        <iframe style={{height: '100%'}} src={url}  />


      </Dialog>

    </main>
  )
}
