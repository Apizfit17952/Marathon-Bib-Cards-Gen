import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FileUpload } from '@/components/ui/file-upload';
import { ProgressPanel } from '@/components/ui/progress-panel';
import { BibCard } from '@/components/BibCard';
import { ExportControls } from '@/components/ExportControls';
import { useBibGenerator } from '@/hooks/useBibGenerator';
import { ThemeType, ExportOptions } from '@/types';
import { FileText, Image, Palette, Play } from 'lucide-react';

const Index = () => {
  const {
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
  } = useBibGenerator();

  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    transparent: false,
    textOnly: false
  });

  const showExportControls = participants.length > 0 && barcodes.size > 0;
  const showProgress = isGenerating || isExporting;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-lg">
            🏃‍♂️ Marathon BIB Creator
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
            Create professional race bibs with transparent backgrounds, barcodes, and custom themes
          </p>
        </header>

        {/* Controls Panel */}
        <Card className="backdrop-blur-md bg-white/95 border-0 shadow-elegant">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* CSV Upload */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base font-semibold">
                  <FileText className="h-5 w-5" />
                  Upload CSV File
                </Label>
                <FileUpload
                  accept=".csv"
                  onFileSelect={handleCSVUpload}
                  className="h-32"
                >
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground text-center">
                      Drop CSV file here or click to browse
                    </p>
                  </div>
                </FileUpload>
                <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                  Format: Event Name, Race Category, BIB Number, Participant Name, Date
                </div>
              </div>

              {/* Background Image */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base font-semibold">
                  <Image className="h-5 w-5" />
                  Background Image
                </Label>
                <FileUpload
                  accept="image/*"
                  onFileSelect={handleBackgroundImageUpload}
                  className="h-32"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Image className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground text-center">
                      Optional background image
                    </p>
                  </div>
                </FileUpload>
                {backgroundImage && (
                  <div className="mt-2">
                    <img 
                      src={backgroundImage} 
                      alt="Background preview" 
                      className="w-full h-16 object-cover rounded border"
                    />
                  </div>
                )}
              </div>

              {/* Theme Selection */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base font-semibold">
                  <Palette className="h-5 w-5" />
                  Color Theme
                </Label>
                <Select value={theme} onValueChange={(value) => setTheme(value as ThemeType)}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="theme-red">Red Orange</SelectItem>
                    <SelectItem value="theme-blue">Blue Purple</SelectItem>
                    <SelectItem value="theme-green">Green Teal</SelectItem>
                    <SelectItem value="theme-orange">Orange Pink</SelectItem>
                    <SelectItem value="theme-purple">Purple</SelectItem>
                    <SelectItem value="theme-transparent">Transparent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Generate Button */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-base font-semibold">
                  <Play className="h-5 w-5" />
                  Generate BIBs
                </Label>
                <Button 
                  onClick={generateBarcodes}
                  disabled={participants.length === 0 || isGenerating}
                  className="w-full h-12 text-base"
                  size="lg"
                >
                  {isGenerating ? 'Generating...' : '🎯 Generate BIB Cards'}
                </Button>
                {participants.length > 0 && (
                  <div className="text-xs text-muted-foreground text-center">
                    {participants.length} participants loaded
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Panel */}
        {showProgress && (
          <ProgressPanel
            isVisible={showProgress}
            progress={Math.round((progress.current / Math.max(progress.total, 1)) * 100)}
            stage={progress.stage}
            description={`${progress.current}/${progress.total} ${progress.stage === 'generating' ? 'generated' : progress.stage === 'exporting' ? 'exported' : 'processed'}`}
          />
        )}

        {/* Export Controls */}
        {showExportControls && (
          <ExportControls
            onPrint={printBibs}
            onDownloadPNG={() => exportToPNG(exportOptions)}
            exportOptions={exportOptions}
            onExportOptionsChange={setExportOptions}
            isExporting={isExporting}
          />
        )}

        {/* BIB Cards Preview */}
        {participants.length > 0 && barcodes.size > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white text-center">
              BIB Cards Preview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
              {participants.map((participant, index) => {
                const barcodeDataURL = barcodes.get(participant.bibNumber);
                if (!barcodeDataURL) return null;

                return (
                  <div key={participant.bibNumber} className="w-fit">
                    <BibCard
                      participant={participant}
                      theme={theme}
                      backgroundImage={backgroundImage}
                      barcodeDataURL={barcodeDataURL}
                      isPreview={true}
                      className="shadow-glow hover:shadow-2xl"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Sample BIB Card when no data */}
        {participants.length === 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white text-center">
              Sample BIB Card
            </h2>
            <div className="flex justify-center">
              <BibCard
                participant={{
                  eventName: "MARATHON 2024",
                  raceCategory: "Full Marathon",
                  bibNumber: "2024",
                  participantName: "Sample Runner",
                  date: "2024-12-31",
                  qrData: "2024"
                }}
                theme={theme}
                backgroundImage={backgroundImage}
                barcodeDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
                isPreview={true}
                className="shadow-glow"
              />
            </div>
          </div>
        )}
        {/* Footer */}
        <footer className="mt-12 text-center text-white/80 text-sm">
          © APIZFIT6007 2025
        </footer>
      </div>
    </div>
  );
};

export default Index;
