import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Download, Printer, FileImage } from 'lucide-react';
import { ExportOptions } from '@/types';

interface ExportControlsProps {
  onPrint: () => void;
  onDownloadPNG: () => void;
  exportOptions: ExportOptions;
  onExportOptionsChange: (options: ExportOptions) => void;
  isExporting: boolean;
}

export const ExportControls: React.FC<ExportControlsProps> = ({
  onPrint,
  onDownloadPNG,
  exportOptions,
  onExportOptionsChange,
  isExporting
}) => {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex flex-wrap gap-4 justify-center">
            <Button 
              onClick={onPrint} 
              variant="outline" 
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Print BIBs
            </Button>
            
            <Button 
              onClick={onDownloadPNG} 
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              <FileImage className="h-4 w-4" />
              {isExporting ? 'Exporting...' : 'Download PNG'}
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="transparent"
                checked={exportOptions.transparent}
                onCheckedChange={(checked) => 
                  onExportOptionsChange({ 
                    ...exportOptions, 
                    transparent: checked === true 
                  })
                }
              />
              <Label htmlFor="transparent" className="text-sm font-medium">
                Export with transparent background
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="textOnly"
                checked={exportOptions.textOnly}
                onCheckedChange={(checked) => 
                  onExportOptionsChange({ 
                    ...exportOptions, 
                    textOnly: checked === true 
                  })
                }
              />
              <Label htmlFor="textOnly" className="text-sm font-medium">
                Export text only (remove decorative elements)
              </Label>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground text-center">
            PNG files will be exported as high-resolution images with optional transparency
          </div>
        </div>
      </CardContent>
    </Card>
  );
};