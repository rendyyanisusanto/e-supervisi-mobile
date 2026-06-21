import { ref } from 'vue';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { toastController } from '@ionic/vue';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toJpeg } from 'html-to-image';

export const useReportFile = () => {
  const isGenerating = ref(false);

  const showToast = async (message: string, color: 'success' | 'danger' | 'warning' = 'success') => {
    const toast = await toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom',
    });
    await toast.present();
  };

  const generatePdfBlob = async (elementId: string): Promise<Blob> => {
    const element = document.getElementById(elementId);
    if (!element) throw new Error('Element not found');

    // Make element suitable for printing (force desktop width for A4 aspect ratio)
    const originalClasses = element.className;
    const originalWidth = element.style.width;
    const originalMaxWidth = element.style.maxWidth;
    element.className = 'bg-white text-black p-0 m-0';
    element.style.width = '800px';
    element.style.maxWidth = '800px';
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
      const topElement = document.getElementById(`${elementId}-top`);
      const bottomElement = document.getElementById(`${elementId}-bottom`);
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const margin = 15;
      const pdfWidth = pdf.internal.pageSize.getWidth() - (margin * 2);
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      let currentY = margin;
      
      if (topElement) {
        const topWidth = topElement.scrollWidth;
        const topHeight = topElement.scrollHeight;
        const topImg = await toJpeg(topElement, { quality: 0.98, pixelRatio: 2, backgroundColor: '#ffffff', width: topWidth, height: topHeight });
        const imgHeight = (topHeight * pdfWidth) / topWidth;
        pdf.addImage(topImg, 'JPEG', margin, currentY, pdfWidth, imgHeight);
        currentY += imgHeight + 5;
      }
      
      autoTable(pdf, {
        html: `#${elementId}-table`,
        startY: currentY,
        theme: 'grid',
        styles: { font: 'times', fontSize: 10, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.2 },
        headStyles: { fillColor: [240, 240, 240], fontStyle: 'bold', textColor: [0, 0, 0] },
        margin: { left: margin, right: margin, bottom: margin, top: margin },
        didParseCell: function(data) {
          if (data.cell.colSpan === 4) {
            const cellText = (data.cell.text && data.cell.text.length > 0) ? data.cell.text[0].trim() : '';
            if (cellText.startsWith('>')) {
              // Category row
              data.cell.styles.fillColor = [245, 245, 245];
              data.cell.styles.fontStyle = 'bolditalic';
              data.cell.styles.textColor = [0, 0, 0];
              data.cell.styles.halign = 'left';
            } else {
              // Instrument row
              data.cell.styles.fillColor = [220, 220, 220];
              data.cell.styles.fontStyle = 'bold';
              data.cell.styles.textColor = [0, 0, 0];
              data.cell.styles.halign = 'left';
            }
          }
        }
      });
      
      currentY = (pdf as any).lastAutoTable.finalY + 10;
      
      if (bottomElement) {
        const bottomWidth = bottomElement.scrollWidth;
        const bottomHeight = bottomElement.scrollHeight;
        const bottomImg = await toJpeg(bottomElement, { quality: 0.98, pixelRatio: 2, backgroundColor: '#ffffff', width: bottomWidth, height: bottomHeight });
        const imgHeight = (bottomHeight * pdfWidth) / bottomWidth;
        
        if (currentY + imgHeight > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
        }
        pdf.addImage(bottomImg, 'JPEG', margin, currentY, pdfWidth, imgHeight);
      }
      
      return pdf.output('blob');
    } finally {
      element.className = originalClasses;
      element.style.width = originalWidth;
      element.style.maxWidth = originalMaxWidth;
    }
  };

  const getBase64FromBlob = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const result = reader.result as string;
        // remove the data:application/pdf;base64, part
        const base64Data = result.split(',')[1];
        resolve(base64Data);
      };
      reader.readAsDataURL(blob);
    });
  };

  const checkFileExists = async (fileName: string): Promise<string | null> => {
    if (!Capacitor.isNativePlatform()) return null;
    
    try {
      const result = await Filesystem.stat({
        directory: Directory.Documents,
        path: fileName
      });
      return result.uri;
    } catch (e) {
      return null; // file doesn't exist
    }
  };

  const downloadPdf = async (elementId: string, fileName: string) => {
    isGenerating.value = true;
    try {
      if (Capacitor.isNativePlatform()) {
        const existingUri = await checkFileExists(fileName);
        if (existingUri) {
          await showToast('File sudah ada di perangkat.', 'success');
          // Optionally we could open it directly here.
          return;
        }

        const blob = await generatePdfBlob(elementId);
        const base64Data = await getBase64FromBlob(blob);
        
        await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Documents,
        });

        await showToast(`Berhasil mengunduh: ${fileName}`, 'success');
      } else {
        // Web fallback
        const blob = await generatePdfBlob(elementId);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        await showToast('Berhasil mengunduh PDF', 'success');
      }
    } catch (error) {
      console.error('Download error:', error);
      await showToast('Gagal mengunduh rapor', 'danger');
      throw error;
    } finally {
      isGenerating.value = false;
    }
  };

  const sharePdf = async (elementId: string, fileName: string, title: string) => {
    isGenerating.value = true;
    try {
      if (Capacitor.isNativePlatform()) {
        let uri = await checkFileExists(fileName);
        
        if (!uri) {
          // generate and save first
          const blob = await generatePdfBlob(elementId);
          const base64Data = await getBase64FromBlob(blob);
          const result = await Filesystem.writeFile({
            path: fileName,
            data: base64Data,
            directory: Directory.Documents,
          });
          uri = result.uri;
        }

        await Share.share({
          title,
          text: `Berikut adalah ${title}`,
          url: uri,
          dialogTitle: 'Bagikan Rapor',
        });
      } else {
        // Web fallback (if supported)
        const blob = await generatePdfBlob(elementId);
        const file = new File([blob], fileName, { type: 'application/pdf' });
        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: title,
            text: `Berikut adalah ${title}`
          });
        } else {
          await showToast('Fitur share tidak didukung di browser ini', 'warning');
        }
      }
    } catch (error) {
      console.error('Share error:', error);
      await showToast('Gagal membagikan rapor', 'danger');
      throw error;
    } finally {
      isGenerating.value = false;
    }
  };

  return {
    isGenerating,
    downloadPdf,
    sharePdf
  };
};
