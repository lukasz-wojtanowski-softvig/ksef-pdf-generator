import { Content, ContentQr, ContentStack } from 'pdfmake/interfaces';
import FormatTyp from '../../../shared/enums/common.enum.js';
import {
  createHeader,
  createLabelText,
  createSection,
  createSubHeader,
  formatText,
  generateLine,
  generateQRCode,
  generateTwoColumns,
  getContentTable,
  getTable,
  verticalSpacing,
} from '../../../shared/PDF-functions.js';
import { FormContentState } from '../../../shared/types/additional-data.types';
import { HeaderDefine } from '../../../shared/types/pdf-types.js';
import { AdditionalDataTypes } from '../../types/common.types';
import { Informacje, Rejestry } from '../../types/fa1.types';
import { FP, Naglowek, Stopka } from '../../types/fa2.types';
import { Zalacznik } from '../../types/fa3.types';
import { generateZalaczniki } from './Zalaczniki.js';

export function generateStopka(
  additionalData?: AdditionalDataTypes,
  stopka?: Stopka,
  naglowek?: Naglowek,
  wz?: FP[],
  zalacznik?: Zalacznik
): Content[] {
  const wzty: Content[] = generateWZ(wz);
  const rejestry: Content[] = generateRejestry(stopka);
  const informacje: Content[] = generateInformacje(stopka);
  const qrCode: Content[] = generateQRCodeData(additionalData);
  const qr2Code: Content[] = generateQR2CodeData(additionalData);
  const zalaczniki: Content[] = !additionalData?.isMobile ? generateZalaczniki(zalacznik) : [];

  const result: Content = [
    verticalSpacing(1),
    ...(wzty.length ? [generateLine()] : []),
    ...(wzty.length ? [generateTwoColumns(wzty, [])] : []),
    ...(rejestry.length || informacje.length ? [generateLine()] : []),
    ...rejestry,
    ...informacje,
    ...(zalaczniki.length ? zalaczniki : []),
    { stack: [...qrCode], unbreakable: true },
    { stack: [...qr2Code], unbreakable: true },
    createSection(
      [
        {
          stack: createLabelText('Wytworzona w: ', naglowek?.SystemInfo),
          margin: [0, 8, 0, 0],
        },
      ],
      false,
      [0, 0, 0, 0]
    ),
  ];

  return createSection(result, false);
}

function generateWZ(wz?: FP[]): Content[] {
  const result: Content[] = [];
  const definedHeader: HeaderDefine[] = [{ name: '', title: 'Numer WZ', format: FormatTyp.Default }];
  const faWiersze: FP[] = getTable(wz ?? []);
  const content: FormContentState = getContentTable<(typeof faWiersze)[0]>(
    [...definedHeader],
    faWiersze,
    '*'
  );

  if (content.fieldsWithValue.length && content.content) {
    result.push(createSubHeader('Numery dokumentów magazynowych WZ', [0, 8, 0, 4]));
    result.push(content.content);
  }
  return result;
}

function generateRejestry(stopka?: Stopka): Content[] {
  const result: Content[] = [];
  const definedHeader: HeaderDefine[] = [
    { name: 'PelnaNazwa', title: 'Pełna nazwa', format: FormatTyp.Default },
    { name: 'KRS', title: 'KRS', format: FormatTyp.Default },
    { name: 'REGON', title: 'REGON', format: FormatTyp.Default },
    { name: 'BDO', title: 'BDO', format: FormatTyp.Default },
  ];
  const faWiersze: Rejestry[] = getTable(stopka?.Rejestry ?? []);
  const content: FormContentState = getContentTable<(typeof faWiersze)[0]>(
    [...definedHeader],
    faWiersze,
    '*',
    undefined,
    30
  );

  if (content.fieldsWithValue.length && content.content) {
    result.push(createHeader('Rejestry'));
    result.push(content.content);
  }
  return result;
}

function generateInformacje(stopka?: Stopka): Content[] {
  const result: Content[] = [];
  const definedHeader: HeaderDefine[] = [
    { name: 'StopkaFaktury', title: 'Stopka faktury', format: FormatTyp.Default },
  ];
  const faWiersze: Informacje[] = getTable(stopka?.Informacje ?? []);
  const content: FormContentState = getContentTable<(typeof faWiersze)[0]>(
    [...definedHeader],
    faWiersze,
    '*'
  );

  if (content.fieldsWithValue.length && content.content) {
    result.push(createHeader('Pozostałe informacje'));
    result.push(content.content);
  }
  return result;
}

function generateQRCodeData(additionalData?: AdditionalDataTypes): Content[] {
  const result: Content = [];

  if (additionalData?.qrCode) {
    const qrCode: ContentQr | undefined = generateQRCode(additionalData.qrCode);

    result.push(createHeader('Sprawdź, czy Twoja faktura znajduje się w KSeF!'));
    if (qrCode) {
      result.push({
        columns: [
          {
            stack: [
              qrCode,
              {
                stack: [formatText(additionalData.nrKSeF ?? 'OFFLINE', FormatTyp.Default)],
                width: 'auto',
                alignment: 'left',
                marginLeft: 0,
                marginRight: 10,
                marginTop: 10,
              } as ContentStack,
            ],
            width: 200,
          } as ContentStack,
          {
            stack: [
              formatText(
                'Nie możesz zeskanować kodu z obrazka? Kliknij w link weryfikacyjny i przejdź do weryfikacji faktury!',
                FormatTyp.Label
              ),
              {
                stack: [formatText(additionalData.qrCode, FormatTyp.Link)],
                marginTop: 5,
                link: additionalData.qrCode,
              },
            ],

            margin: [10, (qrCode.fit ?? 120) / 2 - 30, 0, 0],
            width: 'auto',
          } as ContentStack,
        ],
      });
    }
  }
  if (additionalData?.qr2Code && !additionalData.nrKSeF) {
    const qrCode: ContentQr | undefined = generateQRCode(additionalData.qr2Code);

    result.push(createHeader('Zweryfikuj wystawcę faktury!'));
    if (qrCode) {
      qrCode.fit = 200;

      result.push({
        columns: [
          {
            stack: [
              qrCode,

              {
                stack: [formatText('CERTYFIKAT', FormatTyp.Default)],
                width: 'auto',
                alignment: 'center',
                marginLeft: 0,
                // ECDSA certificate QR Code fit almost full width so we need to increase margin
                marginRight: additionalData.qr2Code.length > 300 ? 28 : 18,
                marginTop: 10,
              } as ContentStack,
            ],
            width: 200,
          } as ContentStack,
          {
            stack: [
              formatText(
                'Nie możesz zeskanować kodu z obrazka? Kliknij w link weryfikacyjny i przejdź do weryfikacji wystawcy!',
                FormatTyp.Value
              ),
              {
                stack: [formatText(additionalData.qr2Code.substring(0, 150) + '...', FormatTyp.Link)],
                marginTop: 5,
              },
            ],
            link: additionalData.qr2Code,
            noWrap: false,
            margin: [10, (qrCode.fit ?? 120) / 2 - 30, 0, 0],
            width: 'auto',
          } as ContentStack,
        ],
      });
    }
  }
  return createSection(result, true);
}
function generateQR2CodeData(additionalData?: AdditionalDataTypes): Content[] {
  const result: Content = [];

  if (additionalData?.qr2Code) {
    const qrCode: ContentQr | undefined = generateQRCode(additionalData.qr2Code);

    result.push(createHeader('Zweryfikuj dostawcę faktury'));
    if (qrCode) {
      result.push({
        columns: [
          {
            stack: [
              qrCode,
              {
                stack: [formatText('CERTYFIKAT', FormatTyp.Default)],
                width: 'auto',
                alignment: 'left',
                marginLeft: 0,
                marginRight: 10,
                marginTop: 10,
              } as ContentStack,
            ],
            width: 150,
          } as ContentStack,
          {
            stack: [
              formatText(
                'Nie możesz zeskanować kodu z obrazka? Kliknij w link weryfikacyjny i przejdź do weryfikacji wystawcy faktury!',
                FormatTyp.Label
              ),
              {
                stack: [formatText(additionalData.qr2Code, FormatTyp.Link)],
                marginTop: 5,
                link: additionalData.qrCode,
              },
            ],

            margin: [10, (qrCode.fit ?? 120) / 2 - 30, 0, 0],
            width: 'auto',
          } as ContentStack,
        ],
      });
    }
  }
  return createSection(result, true);
}
