"use client";

import * as pdfjs from "pdfjs-dist";
import { ANALYSIS } from "@/lib/config";

// O worker é empacotado localmente pelo bundler (Next/webpack).
// Se houver erro de worker em runtime, o fallback é apontar para um CDN:
// pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export async function extractTextFromPdf(file: File): Promise<string> {
  if (file.size > ANALYSIS.MAX_FILE_BYTES) {
    throw new Error("O PDF deve ter no máximo 10 MB.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);
  let pdf;
  try {
    pdf = await pdfjs.getDocument({ data }).promise;
  } catch (error) {
    const name = error instanceof Error ? error.name : "";
    if (name === "PasswordException") {
      throw new Error("O PDF está protegido por senha. Envie uma cópia desbloqueada.");
    }
    throw new Error("Não conseguimos abrir este PDF. Verifique se o arquivo não está corrompido.");
  }

  try {
    if (pdf.numPages > ANALYSIS.MAX_PDF_PAGES) {
      throw new Error("O PDF deve ter no máximo 30 páginas.");
    }

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

      if (text.length > ANALYSIS.MAX_TEXT_CHARS) {
        throw new Error(
          "O texto do PDF é longo demais. Envie um currículo com até 50 mil caracteres.",
        );
      }
    }

    const clean = text.trim();
    if (clean.length < ANALYSIS.MIN_TEXT_CHARS) {
      throw new Error(
        "Não conseguimos extrair texto deste PDF. Ele parece ser escaneado (imagem). Envie a versão em texto do seu currículo.",
      );
    }

    return clean;
  } finally {
    await pdf.destroy();
  }
}
