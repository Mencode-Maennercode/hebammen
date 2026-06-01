// Content Type Interfaces for Google Sheets CMS

export interface AktuellesEntry {
  titel: string;
  text: string;
  bildname: string;
  datum: string;
  kategorie: string;
}

export interface FAQEntry {
  frage: string;
  antwort: string;
  kategorie: string;
}

export interface TippsTricksEntry {
  titel: string;
  inhalt: string;
  kategorie: string;
  bildname?: string;
}

export type ContentType = 'aktuelles' | 'faq' | 'tipps-tricks';

export type ContentData = AktuellesEntry[] | FAQEntry[] | TippsTricksEntry[];
