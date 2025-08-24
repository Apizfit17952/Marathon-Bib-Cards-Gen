// @ts-ignore
import bwipjs from 'bwip-js';

export const generateBarcode = async (text: string): Promise<string> => {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 100;
      
      bwipjs.toCanvas(canvas, {
        bcid: 'pdf417',
        text: text,
        scale: 2.0,
        height: 18,
        width: 56,
        includetext: false,
        eclevel: 5,
        paddingwidth: 1,
        paddingheight: 1,
        columns: 5
      });
      
      resolve(canvas.toDataURL('image/png'));
      
    } catch (error) {
      console.error('Error generating barcode:', error);
      
      // Fallback: Create a simple pattern
      const canvas = document.createElement('canvas');
      canvas.width = 200;
      canvas.height = 50;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 200, 50);
        ctx.fillStyle = 'red';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Barcode: ' + (text || '').substring(0, 20), 100, 25);
      }
      
      resolve(canvas.toDataURL());
    }
  });
};