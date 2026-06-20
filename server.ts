import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase limit to allow pasting of large articles/documents
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Set of models that have hit a 429 quota limit during the container's lifetime
const exhaustedModels = new Set<string>();

// Shared Gemini client utility (server-side only)
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("La clé API GEMINI_API_KEY est manquante dans l'environnement.");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Helper function to extract visible text from any URL source for presentation slides
async function extractTextFromUrl(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch URL. Status code ${response.status}`);
  }
  const html = await response.text();
  
  // Clean elements and extract readable text from HTML
  let text = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // remove scripts
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')   // remove styles
    .replace(/<[^>]+>/g, ' ')                                            // remove tags
    .replace(/\s+/g, ' ')                                                // collapse spaces
    .trim();
    
  if (text.length > 8000) {
    text = text.substring(0, 8000);
  }
  return text;
}

// API Endpoint to generate PowerPoint slides from input content (or URLs)
app.post("/api/generate-slides", async (req, res) => {
  try {
    const { text, slideCount = 15, tone = "professionnel", additionalInstructions = "", language = "FR" } = req.body;

    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return res.status(400).json({ error: "Le contenu textuel est obligatoire pour générer des diapositives." });
    }

    let finalInputText = text;
    // Automatic URL detection and scraping of contents
    if (text.trim().startsWith("http://") || text.trim().startsWith("https://")) {
      try {
        console.log(`[Content Extraction] Détection d'URL. Lancement de l'extraction sur : ${text.trim()}`);
        finalInputText = await extractTextFromUrl(text.trim());
        console.log(`[Content Extraction] Extraction réussie ! (${finalInputText.length} caractères extraits)`);
      } catch (scrapingErr: any) {
        console.error(`[Content Extraction] Échec d'extraction de l'URL :`, scrapingErr);
        return res.status(400).json({ 
          error: "Échec de l'extraction de l'URL fournie.", 
          details: scrapingErr?.message || scrapingErr 
        });
      }
    }

    const ai = getGeminiClient();
    
    // Validate custom slide count within 15-20 bounds as requested
    const finalSlideCount = Math.max(15, Math.min(20, Number(slideCount)));

    const systemInstruction = `Tu es un expert en création de présentations PowerPoint professionnelles, modernes et impactantes pour le service 'Expert Diapos'.
Ton rôle est de transformer le contenu brut ou le document fourni par l'utilisateur en une présentation structurée d'exactement ${finalSlideCount} slides en langue ${language}.

STRUCTURE RECOMMANDÉE :
1. Slide de titre (avec titre accrocheur, sous-titre engageant)
2. Table des matières / Vue d'ensemble (sommaire)
3 à ${finalSlideCount - 2}. Contenu principal (divisé en sections logiques et thématiques pour explorer en profondeur le sujet avec rigueur et variété : statistiques, listes, citations)
${finalSlideCount - 1}. Conclusion, synthèse et appels à l'action clairs
${finalSlideCount}. Remerciements / Contact pour clore professionnellement

CONSIGNES DE CONTENU POUR CHAQUE SLIDE :
- Titre : Clair, court et accrocheur.
- Points clés (content) : Crée 3 à 5 points clés maximum par slide. Chaque point doit être complet et informatif (pas juste un mot).
- suggestions d'éléments visuels (visualElements) : Description textuelle précise d'un graphique, schéma, diagramme ou type d'image idéal pour renforcer le message.
- Animations/transitions recommandées (animation) : Transition dynamique ou entrée d'éléments (ex : "fade", "slide-in-right", "zoom-on-heading", "staggered-points").
- Notes de présentation (notes) : Écris 2 à 3 phrases complètes et structurées pour guider l'orateur lors de sa prise de parole sur cette slide.

Adapte le ton général de la présentation selon le choix suivant : ${tone} (ex: académique, commercial, créatif, professionnel ou technologique/start-up).
Respecte les instructions additionnelles suivantes : ${additionalInstructions}.
Génère obligatoirement le format JSON structuré demandé.`;

    const userPrompt = `Voici le contenu à partir duquel générer les ${finalSlideCount} slides :\n\n${finalInputText}`;

    // High availability models first to avoid 429 quota traps or 503 demand spikes on the free tier
    const baseModels = [
      "gemini-3.1-flash-lite", // Extremely stable, ultra-fast, high free-tier quotas (1500/day vs 20 for 3.5-flash)
      "gemini-flash-latest",   // High base rate-limits, very stable
      "gemini-3.5-flash",      // Fallback model if the lite models are busy
      "gemini-3.1-pro-preview" // Paid tier fallback model
    ];

    // Priority-sort base models dynamic skip-list to instantly ignore exhausted models
    const modelsToTry = [
      ...baseModels.filter(m => !exhaustedModels.has(m)),
      ...baseModels.filter(m => exhaustedModels.has(m))
    ];

    let lastError: any = null;
    let response: any = null;

    for (const modelName of modelsToTry) {
      let retries = 2; // Reduced to 2 allowed tries per model to avoid timing out the HTTP Gateway
      let delay = 800; // Fast initial delay with jitter

      while (retries > 0) {
        try {
          console.log(`[Gemini API] Tentative de génération avec le modèle : ${modelName} (Essai ${3 - retries}/2)`);
          response = await ai.models.generateContent({
            model: modelName,
            contents: userPrompt,
            config: {
              systemInstruction: systemInstruction,
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  presentation: {
                    type: Type.OBJECT,
                    properties: {
                      title: { 
                        type: Type.STRING,
                        description: "Le titre général principal de la présentation PowerPoint"
                      },
                      subtitle: {
                        type: Type.STRING,
                        description: "Le sous-titre de la présentation"
                      },
                      mainTopic: {
                        type: Type.STRING,
                        description: "Le sujet principal résumé de la présentation en 2 à 4 mots clés pour orienter le style visuel (ex: Énergie Solaire, Intelligence Artificielle, Gestion Stress, Transition Écologique)"
                      },
                      slides: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            number: { 
                              type: Type.INTEGER,
                              description: "Le numéro séquentiel de la slide (de 1 à n)"
                            },
                            title: { 
                              type: Type.STRING,
                              description: "Le titre de cette diapositive" 
                            },
                            content: {
                              type: Type.ARRAY,
                              items: { type: Type.STRING },
                              description: "Points clés à puce (entre 3 et 5 max par slide)"
                            },
                            visualElements: { 
                              type: Type.STRING,
                              description: "Description de l'image, infographie, icône ou graphique recommandé pour cette diapositive"
                            },
                            animation: { 
                              type: Type.STRING,
                              description: "Transition ou effet d'animation recommandé"
                            },
                            notes: { 
                              type: Type.STRING,
                              description: "Notes complètes de présentation pour l'orateur (2-3 phrases)" 
                            }
                          },
                          required: ["number", "title", "content", "visualElements", "animation", "notes"]
                        }
                      }
                    },
                    required: ["title", "slides", "mainTopic"]
                  }
                },
                required: ["presentation"]
              }
            }
          });

          if (response && response.text) {
            console.log(`[Gemini API] Génération réussie avec le modèle : ${modelName}`);
            break; // successfully generated, exit retry loop
          }
        } catch (err: any) {
          const errMsg = err?.message || JSON.stringify(err);
          const is503 = errMsg.includes("503") || errMsg.includes("UNAVAILABLE") || errMsg.includes("high demand") || err?.status === 503;
          const is429 = errMsg.includes("429") || errMsg.includes("quota") || errMsg.includes("RESOURCE_EXHAUSTED") || err?.status === 429;
          
          if (is429) {
            console.log(`[Gemini API] Information : Le modèle ${modelName} a temporairement épuisé ses limites (429 Quota). Enregistré pour évitement rapide.`);
            exhaustedModels.add(modelName);
          } else {
            console.log(`[Gemini API] Information : Le modèle ${modelName} est temporairement indisponible.`);
          }
          
          lastError = err;

          if (is503) {
            retries--;
            if (retries > 0) {
              const jitter = Math.floor(Math.random() * 500);
              const currentDelay = delay + jitter;
              console.log(`[Gemini API] Surcharge (503) pour ${modelName}. Nouvelle tentative dans ${currentDelay}ms.`);
              await new Promise((resolve) => setTimeout(resolve, currentDelay));
              delay *= 1.5; // exponential dynamic backoff with scale
              continue;
            }
          }
          break; // other errors or retries exhausted, immediately fallback to next model in the list
        }
      }

      if (response && response.text) {
        break; // successfully generated, exit model selection loop
      }
    }

    if (!response || !response.text) {
      throw lastError || new Error("Aucun modèle de génération de l'API Gemini n'a pu répondre correctement car les serveurs connaissent une surcharge momentanée. Veuillez réessayer.");
    }

    const resultText = response.text;
    if (!resultText) {
      throw new Error("L'IA a retourné une réponse vide.");
    }

    const data = JSON.parse(resultText);
    res.json(data);
  } catch (error: any) {
    console.error("Erreur génération de diapositive:", error);
    res.status(500).json({ 
      error: "Erreur lors de la génération de la présentation.",
      details: error?.message || error
    });
  }
});

// Lazy builder for OpenAI Client to prevent startup failure when IMAGE_API_KEY is unset
let openaiClient: OpenAI | null = null;
const getOpenAIClient = () => {
  const apiKey = process.env.IMAGE_API_KEY;
  if (!apiKey || apiKey.trim().length === 0) {
    return null;
  }
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
};

// API Endpoint to generate slide illustration images using OpenAI (with multiple premium and free backup tiers)
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt, aspectRatio = "16:9", title, content, style = "professional" } = req.body;
    
    // Construct prompt according to user requirements
    let targetPrompt = prompt;
    if (!targetPrompt) {
      if (title || content) {
        targetPrompt = `Create presentation image.

Title:
${title || "Slide Visual Title"}

Content:
${content || "Modern professional layout"}

Style:
${style || "professional"}

Requirements:
- professional
- modern
- no text
- presentation ready
- 16:9
- clean background`;
      } else {
        return res.status(400).json({ error: "Le prompt ou les éléments textuels de la slide sont requis pour générer une image." });
      }
    }

    // Try OpenAI API Route first if key is present
    const openAI = getOpenAIClient();
    if (openAI) {
      console.log(`[OpenAI API] Lancement de gpt-image-1 pour "${title || 'image'}"`);
      try {
        const response = await openAI.images.generate({
          model: "gpt-image-1",
          prompt: targetPrompt,
          size: "1536x1024"
        });

        const imgUrl = response.data[0]?.url;
        if (imgUrl) {
          console.log("[OpenAI API] Image générée avec succès via gpt-image-1 !");
          const imgFetcher = await fetch(imgUrl);
          if (imgFetcher.ok) {
            const buffer = await imgFetcher.arrayBuffer();
            const base64Image = Buffer.from(buffer).toString("base64");
            return res.json({ base64: base64Image });
          }
        }
      } catch (openaiErr: any) {
        console.warn(`[OpenAI API Info] Le modèle 'gpt-image-1' ou la clé de l'utilisateur n'est pas actif/supporté (${openaiErr.message || openaiErr}). Tentative avec dall-e-2...`);
        try {
          const response = await openAI.images.generate({
            model: "dall-e-2",
            prompt: targetPrompt,
            size: "1024x1024"
          });

          const imgUrl = response.data[0]?.url;
          if (imgUrl) {
            console.log("[OpenAI API Fallback] Image dall-e-2 générée avec succès !");
            const imgFetcher = await fetch(imgUrl);
            if (imgFetcher.ok) {
              const buffer = await imgFetcher.arrayBuffer();
              const base64Image = Buffer.from(buffer).toString("base64");
              return res.json({ base64: base64Image });
            }
          }
        } catch (dalleErr: any) {
          console.warn("[OpenAI SDK Error] L'API d'OpenAI a retourné une erreur, activation du système de secours.", dalleErr?.message || dalleErr);
        }
      }
    } else {
      console.log("[OpenAI SDK Info] IMAGE_API_KEY non configurée. Lancement direct de la chaine de secours.");
    }

    // Backup Tier 1: Imagen 4.0 Fast (Google GenAI)
    const ai = getGeminiClient();
    if (ai) {
      console.log(`[Gemini API] Essai de secours avec Imagen 4.0 Fast pour le prompt: "${targetPrompt.substring(0, 80)}..."`);
      try {
        const response = await ai.models.generateImages({
          model: "imagen-4.0-fast-generate-001",
          prompt: targetPrompt,
          config: {
            numberOfImages: 1,
            outputMimeType: "image/jpeg",
            aspectRatio: aspectRatio === "16:9" ? "16:9" : "1:1",
          },
        });

        const imageBytes = response?.generatedImages?.[0]?.image?.imageBytes;
        if (imageBytes) {
          console.log("[Gemini API] Génération par Imagen 4.0 réussie !");
          return res.json({ base64: imageBytes });
        }
      } catch (imagenErr: any) {
        console.log("[Gemini API Info] Imagen n'est pas disponible en Tier gratuit. Suite de la chaine de secours.");
      }
    }

    // Clean prompt for free services to optimize accuracy
    const cleanPrompt = targetPrompt
      .replace(/no watermarks?/gi, "")
      .replace(/no text overlay/gi, "")
      .replace(/no text tags/gi, "")
      .replace(/Requirements/gi, "")
      .replace(/Create presentation image/gi, "")
      .replace(/Style/gi, "")
      .replace(/Title/gi, "")
      .replace(/Content/gi, "")
      .replace(/[^a-zA-Z0-9\s,\.:\-'\(\)]/g, "")
      .trim();

    const seed = Math.floor(Math.random() * 999999);
    const width = aspectRatio === "16:9" ? 960 : 768;
    const height = aspectRatio === "16:9" ? 540 : 576;

    const pollinationsUrl = `https://image.pollinations.ai/p/${encodeURIComponent(cleanPrompt.substring(0, 400))}?width=${width}&height=${height}&seed=${seed}&nologo=true&private=true&enhance=false&model=flux`;

    // Backup Tier 2: Pollinations AI with automatic backoff retry on rate limits (429)
    console.log("[Gemini API Fallback] Lancement du moteur de secours AI-Flux...");
    let fetchRes: any = null;
    let attempts = 0;
    const maxAttempts = 3;
    let delayMs = 1500;

    while (attempts < maxAttempts) {
      try {
        fetchRes = await fetch(pollinationsUrl);
        if (fetchRes.ok) {
          console.log(`[Backup Tier 2] Succès du moteur Flux à la tentative ${attempts + 1}`);
          break;
        }
        if (fetchRes.status === 429) {
          console.warn(`[Backup Tier 2 Warning] Limite de taux (429). Pause de ${delayMs}ms (Tentative ${attempts + 1}/${maxAttempts})...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
          delayMs *= 2.5;
        } else {
          break;
        }
      } catch (fetchErr: any) {
        console.warn(`[Backup Tier 2 Warning] Échec réseau lors de la tentative ${attempts + 1}:`, fetchErr?.message || fetchErr);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        delayMs *= 2.0;
      }
      attempts++;
    }

    if (fetchRes && fetchRes.ok) {
      const buffer = await fetchRes.arrayBuffer();
      const base64Image = Buffer.from(buffer).toString("base64");
      return res.json({ base64: base64Image });
    }

    // Backup Tier 3: Responsive visual keyword service (Loremflickr)
    console.log("[Backup Tier 3] Lancement de Loremflickr basé sur les mots-clés...");
    const cleanPromptWords = cleanPrompt
      .split(/\s+/)
      .filter(w => w.length > 3 && !["topic", "instruction", "style", "guidelines", "professional", "clean", "presentation", "ready", "quality", "aspect", "ratio", "high", "create", "image", "title", "content", "requirements"].includes(w.toLowerCase()));
    const keyword = cleanPromptWords.slice(0, 3).join(",") || "business,technology";
    
    const flickrUrl = `https://loremflickr.com/${width}/${height}/${encodeURIComponent(keyword)}?random=${seed}`;
    
    try {
      const flickrRes = await fetch(flickrUrl);
      if (flickrRes.ok) {
        const buffer = await flickrRes.arrayBuffer();
        const base64Image = Buffer.from(buffer).toString("base64");
        console.log(`[Backup Tier 3] Succès Loremflickr pour le mot-clé : [${keyword}]`);
        return res.json({ base64: base64Image });
      }
    } catch (flickrErr: any) {
      console.warn("[Backup Tier 3 Warning] Échec Loremflickr:", flickrErr?.message || flickrErr);
    }

    // Backup Tier 4: Unsplash Curated presentation concept photos (High Availability guaranteed)
    console.log("[Backup Tier 4] Lancement du système de secours final Unsplash...");
    const normalizedPrompt = cleanPrompt.toLowerCase();
    let selectedImage = "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=960&auto=format&fit=crop"; // Warm Fluid Gradient

    if (normalizedPrompt.match(/nature|green|ecolog|environ|planet|sustain|arbre|plante/i)) {
      selectedImage = "https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=960&auto=format&fit=crop";
    } else if (normalizedPrompt.match(/techno|ai|digital|robot|code|network|science|dev|virtu|system/i)) {
      selectedImage = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=960&auto=format&fit=crop";
    } else if (normalizedPrompt.match(/business|finance|corporate|market|analyt|money|ventes|projet|expert/i)) {
      selectedImage = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=960&auto=format&fit=crop";
    } else {
      selectedImage = "https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=960&auto=format&fit=crop";
    }

    try {
      const fallbackRes = await fetch(selectedImage);
      if (fallbackRes.ok) {
        const buffer = await fallbackRes.arrayBuffer();
        const base64Image = Buffer.from(buffer).toString("base64");
        console.log("[Backup Tier 4] Succès de la récupération Unsplash !");
        return res.json({ base64: base64Image });
      }
    } catch (assetErr: any) {
      console.error("[Backup Tier 4 Error] Échec général des services d'images :", assetErr?.message || assetErr);
    }

    throw new Error("L'API d'illustrations n'a pas pu générer ou récupérer une image valide.");
  } catch (error: any) {
    console.error("Erreur générale lors de la génération d'image:", error);
    res.status(500).json({
      error: "Erreur lors de la génération de l'image.",
      details: error?.message || error
    });
  }
});

// Configure Vite middleware in development or serve static assets in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Serveur d'Expert Diapos démarré sur http://localhost:${PORT}`);
  });
}

startServer();
