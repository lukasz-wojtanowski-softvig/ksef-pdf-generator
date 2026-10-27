import {
  borderedBox,
  createInlineLabelValue,
  createPefHeader,
  createPEFSubHeader,
} from '@shared/functions-pef';
import { Content, ContentText } from 'pdfmake/interfaces';
import i18n from 'i18next';
import { PEFInvoiceDelivery } from '../../types/pef-invoice.types';
import { formatText, getTable, getText, getValue, hasValue } from '@shared/PDF-functions';
import { createAddress } from './shared/address';
import FormatTyp from '@shared/enums/common.enum';

export function generateDelivery(deliveryArray: PEFInvoiceDelivery[]): Content[] {
  const result: Content[] = [];

  if (deliveryArray.length === 0) {
    return result;
  }

  const delivery = deliveryArray[0];

  const address: Content[] = createAddress(delivery?.DeliveryLocation?.Address);
  const Name = getTable(delivery.DeliveryParty?.PartyName)[0]?.Name;
  const borderedBoxContent = [];

  borderedBoxContent.push(
    createPefHeader(i18n.t('pef.delivery.header')),
    createPEFSubHeader(getText(Name)),
    ...(hasValue(delivery.DeliveryLocation?.ID)
      ? [
          createInlineLabelValue(
            getValue(delivery.DeliveryLocation?.ID),
            i18n.t('pef.delivery.deliveryLocationID')
          ),
        ]
      : [])
  );

  if (hasValue(delivery.ActualDeliveryDate)) {
    borderedBoxContent.push(
      createInlineLabelValue(
        `${(formatText(getText(delivery.ActualDeliveryDate), FormatTyp.Date) as ContentText).text}`,
        i18n.t('pef.delivery.actualDeliveryDate')
      )
    );
  }
  borderedBoxContent.push(address);
  result.push(borderedBox(borderedBoxContent));

  return result;
}
