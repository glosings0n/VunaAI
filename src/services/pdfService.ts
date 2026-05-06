import { jsPDF } from 'jspdf';
import { AnalysisResult } from './geminiService';
import { translations, Language } from '../constants/translations';

const generatePDFDoc = (result: AnalysisResult, language: Language) => {
  const t = translations[language];
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const primaryColor = '#059669'; // emerald-600
  const textColor = '#0f172a'; // slate-900
  const secondaryColor = '#475569'; // slate-600
  
  // Header background
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, 210, 35, 'F');

  // Brand Name (Centered and Clean)
  doc.setTextColor('#ffffff');
  doc.setFont('times', 'bold');
  doc.setFontSize(28);
  doc.text('VunaAI', 20, 22);
  
  // Diagnostic Header
  doc.setTextColor(textColor);
  doc.setFontSize(22);
  doc.setFont('times', 'bold');
  
  // Long title wrapping
  const wrappedTitle = doc.splitTextToSize(result.commonName, 170);
  doc.text(wrappedTitle, 20, 50);
  let currentY = 50 + (wrappedTitle.length * 9);

  if (result.scientificName) {
    doc.setFontSize(11);
    doc.setFont('times', 'italic');
    doc.setTextColor(primaryColor);
    doc.text(result.scientificName, 20, currentY);
    currentY += 8;
  }

  // Severity Badge
  const severityKey = `severity${result.severity.charAt(0).toUpperCase()}${result.severity.slice(1)}` as keyof typeof t;
  const severityLabel = (t as any)[severityKey] || result.severity;
  
  const getSeverityColor = (sev: string) => {
    switch(sev) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#eab308';
      default: return '#10b981';
    }
  };

  doc.setFont('times', 'bold');
  doc.setFontSize(10);
  doc.setTextColor('#ffffff');
  const badgeWidth = doc.getTextWidth(severityLabel) + 12;
  doc.setFillColor(getSeverityColor(result.severity));
  doc.roundedRect(20, currentY, badgeWidth, 7, 1, 1, 'F');
  doc.text(severityLabel, 20 + badgeWidth/2, currentY + 5, { align: 'center' });

  currentY += 15;

  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > 275) {
      doc.addPage();
      currentY = 25;
      return true;
    }
    return false;
  };

  const addSection = (title: string, content: string | string[]) => {
    const spacing = 6;
    checkPageBreak(25);
    
    // Section Title
    doc.setTextColor(primaryColor);
    doc.setFontSize(14);
    doc.setFont('times', 'bold');
    doc.text(title, 20, currentY);
    currentY += 2;
    
    doc.setDrawColor(primaryColor);
    doc.setLineWidth(0.5);
    doc.line(20, currentY, 35, currentY);
    currentY += 8;

    doc.setTextColor(textColor);
    doc.setFont('times', 'normal');
    doc.setFontSize(11);

    if (typeof content === 'string') {
      const contentLines = doc.splitTextToSize(content, 170);
      contentLines.forEach((line: string) => {
        if (checkPageBreak(spacing)) {
          doc.setFontSize(11);
          doc.setTextColor(textColor);
          doc.setFont('times', 'normal');
        }
        doc.text(line, 20, currentY);
        currentY += spacing;
      });
    } else {
      content.forEach(item => {
        const bullet = "•";
        const bulletWidth = 5;
        const textX = 20 + bulletWidth;
        const contentWidth = 170 - bulletWidth;
        
        const itemLines = doc.splitTextToSize(item, contentWidth);
        
        itemLines.forEach((line: string, index: number) => {
          if (checkPageBreak(spacing)) {
            doc.setFontSize(11);
            doc.setTextColor(textColor);
            doc.setFont('times', 'normal');
          }
          
          if (index === 0) {
            doc.setFont('times', 'bold');
            doc.text(bullet, 20, currentY);
            doc.setFont('times', 'normal');
          }
          
          doc.text(line, textX, currentY);
          currentY += spacing;
        });
        currentY += 2; // Extra gap between bullets
      });
    }
    currentY += 8; // Gap between sections
  };

  // Sections
  addSection(t.descriptionLabel, result.description);
  addSection(t.treatmentBio, result.biologicalTreatment);
  addSection(t.treatmentChemical, result.chemicalTreatment);
  
  if (result.spacingAdvice) {
    const spacingContent = [
      `${t.optimalSpacing}: ${result.spacingAdvice.optimalSpacing}`,
      `${result.spacingAdvice.description}`,
      `${t.climateImpact}: ${result.spacingAdvice.climateFactors}`,
      `${t.soilImpact}: ${result.spacingAdvice.soilTypeFactors}`
    ];
    addSection(t.spacingLabel, spacingContent);
  }

  if (result.preventionTips && result.preventionTips.length > 0) {
    addSection(t.preventionLabel, result.preventionTips);
  }

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setDrawColor('#e2e8f0');
  doc.setLineWidth(0.1);
  doc.line(20, pageHeight - 20, 190, pageHeight - 20);
  
  doc.setTextColor(secondaryColor);
  doc.setFontSize(9);
  doc.setFont('times', 'normal');
  const dateStr = new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : (language === 'sw' ? 'sw-TZ' : 'en-US'), {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  doc.text(`${t.pdfReportTitle} - ${dateStr}`, 20, pageHeight - 12);
  
  doc.setFont('times', 'bold');
  doc.setTextColor(primaryColor);
  doc.text(t.producedBy, 190, pageHeight - 12, { align: 'right' });

  const filename = `${t.exportFilename}_${result.commonName.replace(/\s+/g, '_')}.pdf`;
  return { doc, filename };
};

export const downloadPDF = (result: AnalysisResult, language: Language) => {
  const { doc, filename } = generatePDFDoc(result, language);
  doc.save(filename);
};

export const sharePDF = async (result: AnalysisResult, language: Language) => {
  const { doc, filename } = generatePDFDoc(result, language);
  const pdfBlob = doc.output('blob');
  const file = new File([pdfBlob], filename, { type: 'application/pdf' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: `VunaAI - ${result.commonName}`,
        text: translations[language].sharePdfText.replace('{name}', result.commonName)
      });
    } catch (error) {
      console.error('Error sharing PDF:', error);
      // Fallback to download if sharing fails or is cancelled
    }
  } else {
    // Fallback for browsers that don't support file sharing
    doc.save(filename);
  }
};
