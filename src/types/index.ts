export interface Participant {
  eventName: string;
  raceCategory: string;
  bibNumber: string;
  participantName: string;
  date: string;
  qrData: string;
}

export type ThemeType = 'theme-red' | 'theme-blue' | 'theme-green' | 'theme-orange' | 'theme-purple' | 'theme-transparent';

export interface ExportOptions {
  transparent: boolean;
  textOnly: boolean;
}

export interface GenerationProgress {
  current: number;
  total: number;
  stage: 'parsing' | 'generating' | 'exporting' | 'complete';
}