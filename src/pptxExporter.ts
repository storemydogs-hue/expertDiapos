import pptxgen from "pptxgenjs";
import { Slide, SlideTheme } from "./types";

export function exportPresentationToPPTX(title: string, subtitle: string, slides: Slide[], theme: SlideTheme) {
  const pptx = new pptxgen();

  // Set PPTX presentation layout as standard 16:9 widescreen
  pptx.layout = "LAYOUT_16x9";

  // Define some helpful colors from our selected theme (standardize on clean, uppercase hex strings without '#')
  const bgHex = theme.bgHex.replace("#", "");
  const titleHex = theme.titleHex.replace("#", "");
  const subtitleHex = (theme.subtitleHex || "666666").replace("#", "");
  const textHex = theme.textHex.replace("#", "");
  const accentHex = theme.accentHex.replace("#", "");
  const cardBgHex = (theme.cardBgHex || "F3F4F6").replace("#", "");

  // 1. COVER SLIDE
  const coverSlide = pptx.addSlide();
  coverSlide.background = { fill: bgHex };

  // Add a thick, beautifully colored top accent banner
  coverSlide.addShape((pptx as any).shapes.RECTANGLE, {
    x: 0,
    y: 0,
    w: "100%",
    h: 0.25,
    fill: { color: accentHex }
  });

  // Main high-impact Presentation Title
  coverSlide.addText(title || "Présentation Sans Titre", {
    x: 1.0,
    y: 1.8,
    w: slides[0]?.imageUrl ? 6.5 : 11.3,
    h: 2.2,
    fontSize: slides[0]?.imageUrl ? 32 : 38,
    fontFace: theme.fontTitle || "Arial",
    color: titleHex,
    bold: true,
    valign: "middle",
    align: "left"
  });

  // Elegant Subtitle
  if (subtitle) {
    coverSlide.addText(subtitle, {
      x: 1.0,
      y: 4.1,
      w: slides[0]?.imageUrl ? 6.5 : 11.3,
      h: 0.9,
      fontSize: slides[0]?.imageUrl ? 15 : 18,
      fontFace: theme.fontBody || "Arial",
      color: subtitleHex,
      italic: true,
      align: "left"
    });
  }

  // Cover image if first slide has an image (PowerPoint optimized 16:9 aspect ratio)
  if (slides[0]?.imageUrl) {
    // Beautiful rounded rectangle frame for cover image
    coverSlide.addShape((pptx as any).shapes.ROUNDED_RECTANGLE, {
      x: 7.6,
      y: 1.9,
      w: 5.0,
      h: 3.1,
      fill: { color: "FFFFFF" },
      line: { color: accentHex, width: 2 }
    });
    coverSlide.addImage({
      data: slides[0].imageUrl,
      x: 7.7,
      y: 2.0,
      w: 4.8,
      h: 2.7
    });
  }

  // Cover branding badge
  coverSlide.addText("Créé et édité via Expert Diapos (expert-diapos.com)", {
    x: 1.0,
    y: 6.0,
    w: 8.0,
    h: 0.4,
    fontSize: 10,
    fontFace: "Arial",
    color: "999999"
  });

  // Date on Title Slide
  const formattedDate = new Date().toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  coverSlide.addText(formattedDate, {
    x: 10.0,
    y: 6.0,
    w: 2.3,
    h: 0.4,
    fontSize: 11,
    fontFace: "Arial",
    color: "888888",
    align: "right"
  });


  // 2. MAIN CONTENT SLIDES
  slides.forEach((slideItem, index) => {
    const slide = pptx.addSlide();
    slide.background = { fill: bgHex };

    // Set side-by-side columns:
    // Left side: Bullet points (W: 6.8")
    // Right side: Visual Suggestion Box (W: 4.8")

    // Slide Top/Corner Accent
    slide.addShape((pptx as any).shapes.RECTANGLE, {
      x: 0,
      y: 0,
      w: "100%",
      h: 0.15,
      fill: { color: accentHex }
    });

    // Slide Title
    slide.addText(slideItem.title || `Diapositive ${index + 1}`, {
      x: 0.8,
      y: 0.4,
      w: 11.5,
      h: 0.8,
      fontSize: 24,
      fontFace: theme.fontTitle || "Arial",
      color: titleHex,
      bold: true,
      valign: "middle"
    });

    // Left Column Content: Map lists of bullet points
    const bulletList = Array.isArray(slideItem.content) ? slideItem.content : [];
    
    if (bulletList.length > 0) {
      // Map points into the exact format requested by pptxgenjs representing bullet points
      const pptsTextParts = bulletList.map(textLine => {
        return {
          text: textLine,
          options: {
            bullet: true,
            indent: 14,
            fontSize: 13,
            color: textHex,
            fontFace: theme.fontBody || "Arial",
            lineSpacing: 22
          }
        };
      });

      slide.addText(pptsTextParts, {
        x: 0.8,
        y: 1.5,
        w: 6.4,
        h: 4.6,
        valign: "top"
      });
    } else {
      slide.addText("Aucun point clé spécifié pour cette diapositive.", {
        x: 0.8,
        y: 1.5,
        w: 6.4,
        h: 4.6,
        fontSize: 13,
        color: "999999",
        italic: true
      });
    }

    // Right Column visual content or Suggestion box
    if (slideItem.imageUrl) {
      // Draw a neat border/glow box matching the 16:9 image aspect ratio perfectly!
      slide.addShape((pptx as any).shapes.ROUNDED_RECTANGLE, {
        x: 7.5,
        y: 1.8,
        w: 5.0,
        h: 3.1,
        fill: { color: "FFFFFF" },
        line: { color: accentHex, width: 2 }
      });
      // Add the real generated base64 / URL image
      slide.addImage({
        data: slideItem.imageUrl,
        x: 7.6,
        y: 1.9,
        w: 4.8,
        h: 2.7
      });
    } else {
      // Right Column visual Suggestion box (using a rounded rectangle for visual frame)
      slide.addShape((pptx as any).shapes.ROUNDED_RECTANGLE, {
        x: 7.7,
        y: 1.5,
        w: 4.6,
        h: 4.4,
        fill: { color: cardBgHex },
        line: { color: accentHex, width: 1.5 }
      });

      // Suggestion Header
      slide.addText("💡 SUGGESTION VISUELLE", {
        x: 8.0,
        y: 1.7,
        w: 4.0,
        h: 0.3,
        fontSize: 10,
        fontFace: theme.fontTitle || "Arial",
        color: accentHex,
        bold: true
      });

      // Visual suggestion content
      slide.addText(slideItem.visualElements || "Inclure une diapositive d'illustration ou une courbe ici.", {
        x: 8.0,
        y: 2.1,
        w: 4.0,
        h: 3.5,
        fontSize: 11,
        fontFace: theme.fontBody || "Arial",
        color: textHex,
        valign: "top"
      });

      // Animation recommended info box (bottom of the suggestion container)
      slide.addText(`Transition: ${slideItem.animation || "fade"}`, {
        x: 8.0,
        y: 5.4,
        w: 4.0,
        h: 0.3,
        fontSize: 9,
        fontFace: "Arial",
        color: "777777",
        italic: true
      });
    }

    // FOOTERS
    // Brand signature Left
    slide.addText("Expert Diapos | expert-diapos.com", {
      x: 0.8,
      y: 6.8,
      w: 6.0,
      h: 0.3,
      fontSize: 8,
      fontFace: "Arial",
      color: "999999"
    });

    // Slide Number Right
    slide.addText(`Slide ${slideItem.number || (index + 1)}`, {
      x: 10.5,
      y: 6.8,
      w: 1.8,
      h: 0.3,
      fontSize: 9,
      fontFace: "Arial",
      color: "999999",
      align: "right"
    });
  });

  // 3. FILE EMITTING (Trigger client download)
  const sanitizedTitle = (title || "Presentation").substring(0, 30).replace(/[^a-z0-9]/gi, "_").toLowerCase();
  const filename = `${sanitizedTitle}_expert_diapos.pptx`;

  pptx.writeFile({ fileName: filename });
}
