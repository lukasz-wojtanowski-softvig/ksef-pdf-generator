import { xml2js } from 'xml-js';
import { Faktura } from '../lib-public/types/fa2.types';

type Utf16Endiannes = 'utf-16le' | 'utf-16be';

export function stripPrefix(key: string): string {
  return key.includes(':') ? key.split(':')[1] : key;
}

export async function parseXML(file: File): Promise<unknown> {
  const encoding = await detectEncodingFile(file);

  return new Promise((resolve, reject): void => {
    const reader = new FileReader();

    reader.onload = function (e: ProgressEvent<FileReader>): void {
      try {
        const xmlStr: string = e.target?.result as string;
        const jsonDoc: Faktura = xml2js(xmlStr, {
          compact: true,
          cdataKey: '_text',
          trim: true,
          elementNameFn: stripPrefix,
          attributeNameFn: stripPrefix,
        }) as Faktura;

        resolve(jsonDoc);
      } catch (error) {
        reject(error);
      }
    };

    reader.readAsText(file, encoding);
  });
}

async function detectEncodingFile(file: File): Promise<Utf16Endiannes | 'utf-8'> {
  const headerBuffer = await file.slice(0, 8).arrayBuffer();
  const bytes = new Uint8Array(headerBuffer);

  if ((bytes[0] === 0xff && bytes[1] === 0xfe) || (bytes[0] === 0x3c && bytes[1] === 0x00)) {
    return 'utf-16le';
  }

  if ((bytes[0] === 0xfe && bytes[1] === 0xff) || (bytes[0] === 0x00 && bytes[1] === 0x3c)) {
    return 'utf-16be';
  }

  return 'utf-8';
}
