import { Content } from 'pdfmake/interfaces.js';
import { createLabelText } from '../../../shared/PDF-functions.js';
import { Podmiot1KDaneIdentyfikacyjne } from '../../types/FaRR.types';

export function generateDaneIdentyfikacyjneTPodmiot2Dto(
  daneIdentyfikacyjne: Podmiot1KDaneIdentyfikacyjne
): Content[] {
  return [
    createLabelText('NIP: ', daneIdentyfikacyjne.NIP),
    createLabelText('Nazwa: ', daneIdentyfikacyjne.Nazwa),
  ];
}
