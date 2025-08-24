import Papa from 'papaparse';
import { Participant } from '@/types';

export const parseCSVFile = (file: File): Promise<Participant[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: false,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const participants: Participant[] = [];
          const rows = results.data as string[][];
          
          // Skip header row and process data
          for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            if (row.length >= 5 && row.some(cell => cell?.trim().length > 0)) {
              const eventName = row[0]?.trim() || 'Marathon Event';
              const raceCategory = row[1]?.trim() || 'Race Category';
              const bibNumber = row[2]?.trim() || '000';
              const participantName = row[3]?.trim() || 'Runner Name';
              const date = row[4]?.trim() || '2024-12-31';
              
              participants.push({
                eventName,
                raceCategory,
                bibNumber,
                participantName,
                date,
                qrData: bibNumber.toString().trim()
              });
            }
          }
          
          resolve(participants);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};