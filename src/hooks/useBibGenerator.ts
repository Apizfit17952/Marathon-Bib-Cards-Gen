import { useState, useCallback } from 'react';
import { Participant, ThemeType, ExportOptions, GenerationProgress } from '@/types';
import { parseCSVFile } from '@/lib/csv-parser';
import { generateBarcode } from '@/lib/barcode';
import { computeAverageColor, sanitizeFileName } from '@/lib/image-utils';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { useToast } from '@/hooks/use-toast';

export const useBibGenerator = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [backgroundAvgColor, setBackgroundAvgColor] = useState<string>('');
  const [theme, setTheme] = useState<ThemeType>('theme-red');
  const [barcodes, setBarcodes] = useState<Map<string, string>>(new Map());
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<GenerationProgress>({
    current: 0,
    total: 0,
    stage: 'parsing'
  });
  
  const { toast } = useToast();

  const handleCSVUpload = useCallback(async (file: File) => {
    try {
      setProgress({ current: 0, total: 0, stage: 'parsing' });
      const parsedParticipants = await parseCSVFile(file);
      
      // Sort by BIB number
      parsedParticipants.sort((a, b) => {
        const aNum = parseInt(a.bibNumber, 10);
        const bNum = parseInt(b.bibNumber, 10);
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return aNum - bNum;
        }
        return a.bibNumber.localeCompare(b.bibNumber);
      });
      
      setParticipants(parsedParticipants);
      toast({
        title: "CSV Loaded",
        description: `Successfully loaded ${parsedParticipants.length} participants`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to parse CSV file",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleBackgroundImageUpload = useCallback(async (file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageSrc = e.target?.result as string;
        setBackgroundImage(imageSrc);
        
        try {
          const avgColor = await computeAverageColor(imageSrc);
          setBackgroundAvgColor(avgColor);
        } catch (err) {
          console.warn('Average color computation failed:', err);
          setBackgroundAvgColor('#ffffff');
        }
        
        toast({
          title: "Background Image Loaded",
          description: "Background image applied successfully",
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load background image",
        variant: "destructive",
      });
    }
  }, [toast]);

  const generateBarcodes = useCallback(async () => {
    if (participants.length === 0) {
      toast({
        title: "No Data",
        description: "Please upload a CSV file first",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setProgress({ current: 0, total: participants.length, stage: 'generating' });
    
    try {
      const newBarcodes = new Map<string, string>();
      
      for (let i = 0; i < participants.length; i++) {
        const participant = participants[i];
        const barcodeDataURL = await generateBarcode(participant.qrData);
        newBarcodes.set(participant.bibNumber, barcodeDataURL);
        
        setProgress({
          current: i + 1,
          total: participants.length,
          stage: 'generating'
        });
        
        // Yield to browser every 10 barcodes
        if ((i + 1) % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }
      
      setBarcodes(newBarcodes);
      setProgress({ current: participants.length, total: participants.length, stage: 'complete' });
      
      toast({
        title: "BIB Cards Generated",
        description: `Successfully generated ${participants.length} BIB cards`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate BIB cards",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }, [participants, toast]);

  const exportToPNG = useCallback(async (options: ExportOptions) => {
    if (participants.length === 0 || barcodes.size === 0) {
      toast({
        title: "No Data",
        description: "Please generate BIB cards first",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    setProgress({ current: 0, total: participants.length, stage: 'exporting' });
    
    try {
      const zip = new JSZip();
      const scale = 6; // High resolution
      
      // Hide controls during capture
      const controlsPanel = document.querySelector('.controls-panel');
      const exportControls = document.querySelector('.export-controls');
      
      if (controlsPanel) (controlsPanel as HTMLElement).style.visibility = 'hidden';
      if (exportControls) (exportControls as HTMLElement).style.visibility = 'hidden';
      
      for (let i = 0; i < participants.length; i++) {
        const participant = participants[i];
        
        // Find the BIB card element
        const bibCard = document.querySelector(`[data-bib="${participant.bibNumber}"]`) as HTMLElement;
        
        if (!bibCard) {
          console.warn(`BIB card not found for participant ${participant.bibNumber}`);
          continue;
        }
        
        // Create a temporary container for export
        const exportContainer = document.createElement('div');
        exportContainer.style.position = 'fixed';
        exportContainer.style.left = '-9999px';
        exportContainer.style.top = '0';
        exportContainer.style.background = 'white';
        exportContainer.style.padding = '20px';
        
        // Clone the card
        const clone = bibCard.cloneNode(true) as HTMLElement;
        
        // Remove preview scaling and apply export styling
        clone.classList.remove('bib-card-preview');
        clone.style.transform = 'none';
        clone.style.margin = '0';
        clone.style.width = '210mm';
        clone.style.height = '148mm';
        
        // Apply transparency options
        if (options.transparent) {
          // Complete background removal - no colors at all
          clone.classList.add('fully-transparent');
          exportContainer.style.background = 'transparent';
          exportContainer.classList.add('fully-transparent');
          
          // Force remove all backgrounds including inline styles
          const allElements = clone.querySelectorAll('*');
          allElements.forEach(el => {
            const element = el as HTMLElement;
            element.style.background = 'transparent';
            element.style.backgroundColor = 'transparent';
            element.style.backgroundImage = 'none';
          });
          
          // Specifically target the main card
          clone.style.background = 'transparent';
          clone.style.backgroundColor = 'transparent';
          clone.style.backgroundImage = 'none';
        }
        
        if (options.textOnly) {
          // Hide decorative elements for text-only export
          const decorativeElements = clone.querySelectorAll('.hole-punch');
          decorativeElements.forEach(el => {
            (el as HTMLElement).style.display = 'none';
          });
        }
        
        exportContainer.appendChild(clone);
        document.body.appendChild(exportContainer);
        
        // Capture with html2canvas
        const canvas = await html2canvas(exportContainer, {
          scale,
          backgroundColor: (options.transparent || options.textOnly) ? null : '#ffffff',
          logging: false,
          useCORS: true,
          allowTaint: true,
          removeContainer: false
        });
        
        // Clean up
        document.body.removeChild(exportContainer);
        
        // Convert to blob and add to zip
        await new Promise<void>(resolve => {
          canvas.toBlob(blob => {
            if (blob) {
              const fileName = sanitizeFileName(participant.bibNumber) || `bib-card-${i + 1}`;
              zip.file(`${fileName}.png`, blob);
            } else {
              console.error(`Failed to create blob for participant ${participant.bibNumber}`);
            }
            resolve();
          }, 'image/png', 1.0);
        });
        
        setProgress({
          current: i + 1,
          total: participants.length,
          stage: 'exporting'
        });
        
        // Yield to browser
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Generate and download zip
      const zipBlob = await zip.generateAsync({ 
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      });
      
      if (zipBlob.size === 0) {
        throw new Error('Generated ZIP file is empty');
      }
      
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `marathon-bib-cards-${new Date().getTime()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Show controls again
      if (controlsPanel) (controlsPanel as HTMLElement).style.visibility = 'visible';
      if (exportControls) (exportControls as HTMLElement).style.visibility = 'visible';
      
      toast({
        title: "Export Complete",
        description: `Successfully exported ${participants.length} BIB cards`,
      });
      
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: `Failed to export BIB cards: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
      
      // Show controls again in case of error
      const controlsPanel = document.querySelector('.controls-panel');
      const exportControls = document.querySelector('.export-controls');
      if (controlsPanel) (controlsPanel as HTMLElement).style.visibility = 'visible';
      if (exportControls) (exportControls as HTMLElement).style.visibility = 'visible';
    } finally {
      setIsExporting(false);
      setProgress({ current: 0, total: 0, stage: 'complete' });
    }
  }, [participants, barcodes, toast]);

  const printBibs = useCallback(() => {
    window.print();
  }, []);

  return {
    participants,
    backgroundImage,
    theme,
    barcodes,
    isGenerating,
    isExporting,
    progress,
    setTheme,
    handleCSVUpload,
    handleBackgroundImageUpload,
    generateBarcodes,
    exportToPNG,
    printBibs
  };
};