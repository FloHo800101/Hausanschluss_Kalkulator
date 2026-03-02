import jsPDF from 'jspdf';
import type { Anfrage, Kalkulation } from '@/types';

function euro(n: number) {
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

function datum(iso: string) {
  return new Date(iso).toLocaleDateString('de-DE');
}

export function druckeKalkulationPDF(anfrage: Anfrage, kalkulation: Kalkulation) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageW = 210;
  const marginL = 20;
  const marginR = 20;
  const contentW = pageW - marginL - marginR;
  let y = 20;

  // --- Hilfsfunktionen ---
  function text(str: string, x: number, yPos: number, options?: { align?: 'left' | 'right' | 'center'; fontSize?: number; bold?: boolean; color?: [number, number, number] }) {
    doc.setFontSize(options?.fontSize ?? 10);
    doc.setFont('helvetica', options?.bold ? 'bold' : 'normal');
    if (options?.color) doc.setTextColor(...options.color);
    else doc.setTextColor(30, 30, 30);
    doc.text(str, x, yPos, { align: options?.align ?? 'left' });
  }

  function line(yPos: number, color: [number, number, number] = [200, 200, 200]) {
    doc.setDrawColor(...color);
    doc.line(marginL, yPos, pageW - marginR, yPos);
  }

  function rect(x: number, yPos: number, w: number, h: number, fillColor: [number, number, number]) {
    doc.setFillColor(...fillColor);
    doc.rect(x, yPos, w, h, 'F');
  }

  // --- Header ---
  rect(0, 0, pageW, 28, [30, 64, 175]);
  text('Netz-KA GmbH', marginL, 11, { fontSize: 14, bold: true, color: [255, 255, 255] });
  text('Hausanschluss-Kalkulator', marginL, 17, { fontSize: 9, color: [147, 197, 253] });
  text(`Angebot ${anfrage.nummer}`, pageW - marginR, 11, { align: 'right', fontSize: 12, bold: true, color: [255, 255, 255] });
  text(`Erstellt: ${datum(kalkulation.erstelltAm)}`, pageW - marginR, 17, { align: 'right', fontSize: 8, color: [147, 197, 253] });
  y = 38;

  // --- Anschlussnehmer + Anschlussdaten ---
  const boxH = 30;
  rect(marginL, y, contentW / 2 - 3, boxH, [248, 250, 252]);
  rect(marginL + contentW / 2 + 3, y, contentW / 2 - 3, boxH, [248, 250, 252]);

  text('ANSCHLUSSNEHMER', marginL + 3, y + 6, { fontSize: 7, bold: true, color: [100, 116, 139] });
  text(`${anfrage.kunde.vorname} ${anfrage.kunde.nachname}`, marginL + 3, y + 12, { fontSize: 9, bold: true });
  text(`${anfrage.kunde.anschlussStrasse} ${anfrage.kunde.anschlussHausnummer}`, marginL + 3, y + 18, { fontSize: 9 });
  text(`${anfrage.kunde.anschlussPLZ} ${anfrage.kunde.anschlussOrt}`, marginL + 3, y + 23, { fontSize: 9 });
  text(anfrage.kunde.email, marginL + 3, y + 28, { fontSize: 8, color: [71, 85, 105] });

  const rx = marginL + contentW / 2 + 6;
  text('ANSCHLUSSPARAMETER', rx, y + 6, { fontSize: 7, bold: true, color: [100, 116, 139] });
  text(`Sparte: ${anfrage.anschluss.sparte}${anfrage.anschluss.sparteMSH ? ` (${anfrage.anschluss.sparteMSH.join(', ')})` : ''}`, rx, y + 12, { fontSize: 9 });
  text(`Typ: ${anfrage.anschluss.anschlussTyp} · Gebäude: ${anfrage.anschluss.gebaeude}`, rx, y + 18, { fontSize: 9 });
  text(`Trasse: ${anfrage.anschluss.laengeOeffentlich} m öff. + ${anfrage.anschluss.laengePrivat} m priv.`, rx, y + 23, { fontSize: 9 });
  text(`Sachbearbeiter: ${kalkulation.erstelltVon}`, rx, y + 28, { fontSize: 8, color: [71, 85, 105] });

  y += boxH + 8;

  // --- Einzelfall-Hinweis ---
  if (kalkulation.istEinzelfall) {
    rect(marginL, y, contentW, 14, [255, 251, 235]);
    doc.setDrawColor(252, 211, 77);
    doc.rect(marginL, y, contentW, 14);
    text('⚠  EINZELFALL / VOR-ORT-TERMIN EMPFOHLEN', marginL + 3, y + 6, { fontSize: 8, bold: true, color: [146, 64, 14] });
    text(kalkulation.einzelfallGruende[0] ?? '', marginL + 3, y + 11, { fontSize: 7.5, color: [120, 53, 15] });
    y += 18;
    if (kalkulation.kostenspanneMin && kalkulation.kostenspanneMax) {
      text(`Indikative Kostenspanne: ${euro(kalkulation.kostenspanneMin)} – ${euro(kalkulation.kostenspanneMax)} brutto`, marginL, y, { fontSize: 8.5, bold: true, color: [120, 53, 15] });
      y += 7;
    }
  }

  // --- Positionsliste Header ---
  rect(marginL, y, contentW, 9, [30, 64, 175]);
  text('POSITION', marginL + 2, y + 6, { fontSize: 8, bold: true, color: [255, 255, 255] });
  text('MENGE', marginL + contentW * 0.60, y + 6, { fontSize: 8, bold: true, color: [255, 255, 255], align: 'right' });
  text('EINHEIT', marginL + contentW * 0.63, y + 6, { fontSize: 8, bold: true, color: [255, 255, 255] });
  text('EINZELPREIS', marginL + contentW * 0.87, y + 6, { fontSize: 8, bold: true, color: [255, 255, 255], align: 'right' });
  text('GESAMT', pageW - marginR, y + 6, { fontSize: 8, bold: true, color: [255, 255, 255], align: 'right' });
  y += 11;

  // --- Positionen ---
  const KATEGORIE_COLORS: Record<string, [number, number, number]> = {
    Grundleistung: [239, 246, 255],
    Länge: [236, 254, 255],
    Zuschlag: [255, 247, 237],
    Admin: [249, 250, 251],
    BKZ: [250, 245, 255],
  };

  let prevKat = '';
  for (const pos of kalkulation.positionen) {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
    const bg = KATEGORIE_COLORS[pos.kategorie] ?? [255, 255, 255];
    if (pos.kategorie !== prevKat) {
      // Kategorietrennlinie
      if (prevKat) { line(y - 0.5, [220, 220, 220]); }
      prevKat = pos.kategorie;
    }
    rect(marginL, y - 4, contentW, 6, bg);
    text(pos.bezeichnung, marginL + 2, y, { fontSize: 8.5 });
    text(String(pos.menge), marginL + contentW * 0.60, y, { fontSize: 8.5, align: 'right' });
    text(pos.einheit, marginL + contentW * 0.63 + 2, y, { fontSize: 8.5 });
    text(euro(pos.einzelpreis), marginL + contentW * 0.87, y, { fontSize: 8.5, align: 'right' });
    text(euro(pos.gesamtpreis), pageW - marginR, y, { fontSize: 8.5, align: 'right' });
    y += 6;
  }

  // --- Summen ---
  y += 4;
  line(y, [30, 64, 175]);
  y += 5;
  text('Zwischensumme (netto)', marginL + 2, y, { fontSize: 9 });
  text(euro(kalkulation.zwischensumme), pageW - marginR, y, { align: 'right', fontSize: 9 });
  y += 6;
  text('MwSt. 19 %', marginL + 2, y, { fontSize: 9 });
  text(euro(kalkulation.mwstBetrag), pageW - marginR, y, { align: 'right', fontSize: 9 });
  y += 2;
  line(y, [30, 64, 175]);
  y += 5;
  rect(marginL, y - 4, contentW, 9, [239, 246, 255]);
  text('GESAMTBETRAG (BRUTTO)', marginL + 2, y + 1, { fontSize: 11, bold: true, color: [30, 64, 175] });
  text(euro(kalkulation.gesamtBrutto), pageW - marginR, y + 1, { align: 'right', fontSize: 11, bold: true, color: [30, 64, 175] });
  y += 14;

  // --- Annahmen ---
  if (y > 240) { doc.addPage(); y = 20; }
  text('KALKULATIONSANNAHMEN UND GRUNDLAGEN', marginL, y, { fontSize: 8, bold: true, color: [100, 116, 139] });
  y += 5;
  for (const annahme of kalkulation.annahmen) {
    if (y > 280) { doc.addPage(); y = 20; }
    text(`• ${annahme}`, marginL + 2, y, { fontSize: 7.5, color: [71, 85, 105] });
    y += 5;
  }

  // --- Footer ---
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    rect(0, 292, pageW, 8, [248, 250, 252]);
    doc.setDrawColor(226, 232, 240);
    doc.line(0, 292, pageW, 292);
    text('Netz-KA GmbH · Hausanschluss-Kalkulator · Nur zur internen Verwendung', pageW / 2, 297, { align: 'center', fontSize: 7, color: [148, 163, 184] });
    text(`Seite ${i} / ${pageCount}`, pageW - marginR, 297, { align: 'right', fontSize: 7, color: [148, 163, 184] });
    text(`Version: ${kalkulation.preiskonfigurationVersion}`, marginL, 297, { fontSize: 7, color: [148, 163, 184] });
  }

  doc.save(`Angebot_${anfrage.nummer}_${datum(kalkulation.erstelltAm).replace(/\./g, '-')}.pdf`);
}
