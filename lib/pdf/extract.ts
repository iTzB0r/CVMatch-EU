"use client";

import * as pdfjs from "pdfjs-dist";

// O worker é empacotado localmente pelo bundler (Next/webpack).
// Se houver erro de worker em runtime, o fallback é apontar para um CDN:
// pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const MIN_EXTRACTED_CHARS = 100;

export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);
  const pdf = await pdfjs.getDocument({ data }).promise;

  let text = "";
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    text += pageText + "\n";
  }

  const clean = text.trim();
  if (clean.length < MIN_EXTRACTED_CHARS) {
    throw new Error(
      "Não conseguimos extrair texto deste PDF. Ele parece ser escaneado (imagem). Envie a versão em texto do seu currículo.",
    );
  }

  return clean;
}
