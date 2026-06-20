export interface Slide {
  number: number;
  title: string;
  content: string[];
  visualElements: string;
  animation: string;
  notes: string;
  imageUrl?: string;
}

export interface PresentationData {
  title: string;
  subtitle: string;
  slides: Slide[];
}

export interface SlideTheme {
  id: string;
  name: string;
  description: string;
  bgClass: string;
  bgHex: string;
  cardBgHex: string;
  titleClass: string;
  titleHex: string;
  subtitleClass: string;
  subtitleHex: string;
  textClass: string;
  textHex: string;
  accentClass: string;
  accentHex: string;
  fontTitle: string;
  fontBody: string;
}
