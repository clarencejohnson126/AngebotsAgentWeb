
export type Language = 'de' | 'en';

export enum Gewerk {
  Trockenbau = 'Trockenbau',
  Estrich = 'Estrich',
  Abdichtung = 'Abdichtung',
  Oberbelag = 'Oberbelag',
  Gerüstbau = 'Gerüstbau'
}

export interface Project {
  id: string;
  name: string;
  client: string;
  status: 'Draft' | 'Analyzed' | 'OfferSent';
  createdAt: string;
  documents: ProjectDocument[];
}

export interface ProjectDocument {
  id: string;
  name: string;
  type: 'Tender' | 'Plan';
  uploadDate: string;
}

export interface LVItem {
  id: string;
  pos: string;
  description: string;
  quantity: number;
  unit: string;
  sourceRef: string; // e.g., "Doc A, Page 12"
  pricePerUnit?: number;
  status: 'extracted' | 'measured' | 'confirmed';
}

export interface RiskAnalysis {
  id: string;
  type: 'QuantityMismatch' | 'MissingDetail' | 'Contradiction';
  description: string;
  justification: string;
  sourceRef: string;
  suggestedQuery: string;
}

export interface UserProfile {
  companyName: string;
  gewerk: Gewerk;
  standardMargin: number; // percentage
  language: Language;
}
