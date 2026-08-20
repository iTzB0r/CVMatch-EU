"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ensureSession } from "@/lib/supabase/client";

type Step = "idle" | "extracting" | "analyzing" | "error";

export function UploadCard() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setFileName(file.name);

      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        setStep("error");
        setError("Envie um arquivo PDF.");
        return;
      }

      try {
        // Import dinâmico: pdfjs fica de fora do bundle inicial da landing.
        const { extractTextFromPdf } = await import("@/lib/pdf/extract");

        setStep("extracting");
        const text = await extractTextFromPdf(file);

        setStep("analyzing");
        const { session } = await ensureSession();

        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            text,
            market: "pt",
            originalName: file.name,
            sizeBytes: file.size,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error ?? "Falha na análise. Tente novamente.");
        }

        router.push(`/analysis/${data.analysisId}`);
      } catch (err) {
        setStep("error");
        setError(err instanceof Error ? err.message : "Algo deu errado. Tente novamente.");
      }
    },
    [router],
  );

  return (
    <div className="w-full max-w-xl">
      <div
        role="button"
        tabIndex={0}
        aria-label="Enviar currículo em PDF"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) void handleFile(file);
        }}
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
          dragging
            ? "border-emerald-500 bg-emerald-50"
            : "border-neutral-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/40"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = ""; // permite reenviar o mesmo arquivo depois
            if (file) void handleFile(file);
          }}
        />

        {step === "idle" && (
          <>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <svg
                className="h-7 w-7 text-emerald-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 16V4m0 0 4 4m-4-4-4 4M4 20h16"
                />
              </svg>
            </div>
            <p className="text-lg font-semibold text-neutral-800">
              Arraste seu currículo aqui ou clique para escolher
            </p>
            <p className="mt-1 text-sm text-neutral-500">PDF, até 10 MB</p>
          </>
        )}

        {(step === "extracting" || step === "analyzing") && (
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
            <div>
              <p className="font-semibold text-neutral-800">
                {fileName ? `Analisando ${fileName}` : "Analisando seu currículo"}
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                {step === "extracting"
                  ? "Extraindo o texto do PDF…"
                  : "A IA está avaliando seu currículo. Isso leva de 20 a 60 segundos."}
              </p>
            </div>
          </div>
        )}

        {step === "error" && (
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
                />
              </svg>
            </div>
            <p className="max-w-md text-sm font-medium text-red-700">{error}</p>
            <button
              onClick={() => setStep("idle")}
              className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              Tentar outro arquivo
            </button>
          </div>
        )}
      </div>

      <p className="mt-3 text-center text-xs text-neutral-400">
        Seus dados são tratados com privacidade. Você pode apagar sua análise a
        qualquer momento.
      </p>
    </div>
  );
}
