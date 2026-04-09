import pdfMake, { TCreatedPdf } from 'pdfmake/build/pdfmake.js';
import pdfFonts from 'pdfmake/build/vfs_fonts.js';
import { TDocumentDefinitions } from 'pdfmake/interfaces.js';
import { Position } from '../shared/enums/common.enum.js';
import { generateStyle } from '../shared/PDF-functions.js';
import { generateDaneFaKorygowanej } from './generators/common/DaneFaKorygowanej.js';
import { generateRozliczenie } from './generators/common/Rozliczenie.js';
import { generateStopka } from './generators/common/Stopka.js';
import { generateDodatkoweInformacje } from './generators/FA_RR/DodatkoweInformacje.js';
import { generateNaglowek } from './generators/FA_RR/Naglowek.js';
import { generatePlatnosc } from './generators/FA_RR/Platnosc.js';
import { generatePodmioty } from './generators/FA_RR/Podmioty.js';
import { generateSzczegoly } from './generators/FA_RR/Szczegoly.js';
import { generateWiersze } from './generators/FA_RR/Wiersze.js';
import { AdditionalDataTypes } from './types/common.types';
import { FaRR } from './types/FaRR.types';

pdfMake.vfs = pdfFonts.vfs;

export function generateFARR(invoice: FaRR, additionalData: AdditionalDataTypes): TCreatedPdf {
  const docDefinition: TDocumentDefinitions = {
    watermark: additionalData?.watermark,
    content: [
      ...generateNaglowek(invoice.FakturaRR, additionalData),
      generateDaneFaKorygowanej(invoice.FakturaRR),
      ...generatePodmioty(invoice),
      generateSzczegoly(invoice.FakturaRR!),
      generateWiersze(invoice.FakturaRR!),
      generateDodatkoweInformacje(invoice.FakturaRR!),
      generateRozliczenie(invoice.FakturaRR?.Rozliczenie, invoice.FakturaRR?.KodWaluty?._text ?? ''),
      generatePlatnosc(invoice.FakturaRR?.Platnosc),
      ...generateStopka(additionalData, invoice.Stopka, invoice.Naglowek),
    ],
    footer: (currentPage, pageCount) => {
      return {
        text: currentPage.toString() + ' z ' + pageCount,
        alignment: Position.RIGHT,
        margin: [0, 0, 40, 0],
      };
    },
    ...generateStyle(),
  };

  return pdfMake.createPdf(docDefinition);
}
