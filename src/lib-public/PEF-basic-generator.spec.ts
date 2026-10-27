import { beforeEach, describe, expect, it, MockInstance, vi } from 'vitest';
import { generateBasicPEF } from './PEF-basic-generator';
import pdfMake, { TCreatedPdf } from 'pdfmake/build/pdfmake';
import { AdditionalDataTypes } from './types/common.types';
import { LegalMonetaryTotal, ListAgencyNameEnum, Party, PEFBasicInvoice } from './types/pef-invoice.types';

vi.mock('./generators/PEF/AccountingParty', () => ({
  generateAccountingParty: vi.fn(() => ({ example: 'AccountingCustomerParty' })),
}));
vi.mock('./generators/PEF/AccountingParty', () => ({
  generateAccountingParty: vi.fn(() => ({ example: 'AccountingSupplierParty.Party' })),
}));
vi.mock('./generators/PEF/AllowanceCharge', () => ({
  generateAllowanceCharge: vi.fn(() => ({ example: 'AllowanceCharge' })),
}));
vi.mock('./generators/PEF/Delivery', () => ({ generateDelivery: vi.fn(() => ({ example: 'Delivery' })) }));
vi.mock('./generators/PEF/InvoiceDescription', () => ({
  generateInvoiceDescription: vi.fn(() => ({ example: 'InvoiceDescription' })),
}));
vi.mock('./generators/PEF/InvoiceHeader', () => ({
  generateInvoiceHeader: vi.fn(() => ({
    example: 'InvoiceHeader',
    numberKSeF: ':5555555555-20250808-9231003CA67B-BE',
  })),
}));
vi.mock('./generators/PEF/InvoiceLine', () => ({
  generateInvoiceLine: vi.fn(() => ({ example: 'InvoiceLine' })),
}));
vi.mock('./generators/PEF/LegalMonetaryTotal', () => ({
  generateLegalMonetaryTotal: vi.fn(() => ({ example: 'LegalMonetaryTotal' })),
}));
vi.mock('./generators/PEF/PayeeParty', () => ({
  generatePayeeParty: vi.fn(() => ({ example: 'PayeeParty' })),
}));
vi.mock('./generators/PEF/Payment', () => ({ generatePayment: vi.fn(() => ({ example: 'Payment' })) }));
vi.mock('./generators/PEF/TaxRepresentativeParty', () => ({
  generateTaxRepresentativeParty: vi.fn(() => ({ example: 'TaxRepresentativeParty' })),
}));
vi.mock('./generators/PEF/TaxTotal', () => ({ generateTaxTotal: vi.fn(() => ({ example: 'TaxTotal' })) }));

vi.mock('./PDF-functions', () => ({
  generateStyle: vi.fn(() => ({ styles: {}, defaultStyle: {} })),
}));

const Party: Partial<Party> = {
  Contact: {
    ElectronicMail: { _text: 'fake@email.com' as ListAgencyNameEnum },
    Name: { _text: 'Fake' as ListAgencyNameEnum },
    Telephone: { _text: '999999999' as ListAgencyNameEnum },
  },
  EndpointID: { _text: '77777777' },
  PartyLegalEntity: [
    {
      CompanyID: { _text: '77777777' },
      CompanyLegalForm: { _text: 'form' as ListAgencyNameEnum },
      RegistrationName: { _text: 'Fake registration' as ListAgencyNameEnum },
    },
  ],
  PartyName: [
    {
      Name: { _text: 'Fake name' as ListAgencyNameEnum },
    },
  ],
  PartyTaxScheme: [
    {
      CompanyID: { _text: '77777777' },
      TaxScheme: {
        ID: { _text: 'Fake ID' },
      },
    },
  ],
  PostalAddress: {
    AdditionalStreetName: { _text: 'additional street' as ListAgencyNameEnum },
    CityName: { _text: 'city' as ListAgencyNameEnum },
    CountrySubentity: { _text: 'country subEntity' as ListAgencyNameEnum },
    PostalZone: { _text: 'postal' as ListAgencyNameEnum },
    StreetName: { _text: 'street' as ListAgencyNameEnum },
    AddressLine: [{ Line: { _text: 'additional line' as ListAgencyNameEnum } }],
    Country: { IdentificationCode: { _text: 'PL' } },
  },
};

describe('generatePEF', (): void => {
  const mockCreatePdfReturn = { example: 'pdfCreatedObject' };

  beforeEach((): void => {
    vi.restoreAllMocks();
  });

  it('should call pdfMake.createPdf and return its result', () => {
    const invoiceHeader = {
      ID: { _text: 'INVOICE_PeF_1.0' },
      InvoiceTypeCode: { _text: '380' },
      DocumentCurrencyCode: { _text: 'PLN' },
      TaxCurrencyCode: { _text: 'EUR' },
      LegalMonetaryTotal: {
        PayableAmount: { _text: '1000.00' },
      },
      DueDate: { _text: '2018-09-30' },
      BuyerReference: { _text: '12345' as ListAgencyNameEnum },
      IssueDate: { _text: '2018-08-31' },
      TaxPointDate: { _text: '2018-08-32' },
      InvoicePeriod: [
        {
          DescriptionCode: [{ _text: '35' }],
          StartDate: { _text: '2018-08-01' },
          EndDate: { _text: '2018-08-31' },
        },
      ],
      ContractDocumentReference: [
        {
          ID: { _text: 'Contract321' },
        },
      ],
      OrderReference: {
        ID: { _text: '123' },
        SalesOrderID: { _text: 'SO123' },
      },
      DespatchDocumentReference: [
        {
          ID: { _text: 'D12345' },
        },
      ],
      ReceiptDocumentReference: [
        {
          ID: { _text: 'R12345' },
        },
      ],
      Note: [
        {
          _text:
            'registration court and registration number, initial capital, invested capital' as ListAgencyNameEnum,
        },
      ],
    };

    const legalMonetaryTotal: LegalMonetaryTotal = {
      PayableAmount: { _text: '555.95' },
    };

    const accountingCustomerPartyKeys = {
      AccountingCustomerParty: {
        Party,
      },
    };

    const accountingSupplierPartyKeys = {
      AccountingSupplierParty: {
        Party,
      },
    };

    const invoice: Partial<PEFBasicInvoice> = {
      ...invoiceHeader,
      ...legalMonetaryTotal,
      ...accountingCustomerPartyKeys,
      ...accountingSupplierPartyKeys,
    };

    const additionalData: AdditionalDataTypes = { nrKSeF: 'nrKSeF' };

    const createPdfSpy: MockInstance = vi
      .spyOn(pdfMake, 'createPdf')
      .mockReturnValue(mockCreatePdfReturn as any);

    const result: TCreatedPdf = generateBasicPEF(invoice as PEFBasicInvoice, additionalData);

    expect(createPdfSpy).toHaveBeenCalled();
    expect(result).toBe(mockCreatePdfReturn);
  });
});
