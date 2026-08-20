"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ensureSession } from "@/lib/supabase/client";
import { ANALYSIS } from "@/lib/config";

type Step = "idle" | "extracting" | "analyzing" | "error";

export function UploadCard() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [targetRole, setTargetRole] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setFileName(file.name);

      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        setStep("error");
        setError("Envie um arquivo PDF.");
        return;
      }

      if (file.size > ANALYSIS.MAX_FILE_BYTES) {
        setStep("error");
        setError("O PDF deve ter no máximo 10 MB.");
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
            targetRole: targetRole.trim() || null,
            jobDescription: jobDescription.trim() || null,
            originalName: file.name,
            sizeBytes: file.size,
          }),
          signal: AbortSignal.timeout(ANALYSIS.CLIENT_TIMEOUT_MS),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error ?? "Falha na análise. Tente novamente.");
        }

        router.push(`/analysis/${data.analysisId}`);
      } catch (err) {
        setStep("error");
        const timedOut =
          err instanceof Error &&
          (err.name === "TimeoutError" || err.name === "AbortError");
        setError(
          timedOut
            ? "A análise demorou mais que o esperado. Tente novamente em instantes."
            : err instanceof Error
              ? err.message
              : "Algo deu errado. Tente novamente.",
        );
      }
    },
    [jobDescription, router, targetRole],
  );

  return (
    <div className="w-full">
      <div className="mb-5 grid gap-4 text-left">
        <div>
          <label
            htmlFor="target-role"
            className="mb-1 block text-sm font-medium text-neutral-700"
          >
            Cargo desejado <span className="font-normal text-neutral-400">(opcional)</span>
          </label>
          <input
            id="target-role"
            value={targetRole}
            onChange={(event) => setTargetRole(event.target.value)}
            maxLength={120}
            placeholder="Ex.: Frontend Developer"
            disabled={step === "extracting" || step === "analyzing"}
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50/70 px-4 py-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100/70 disabled:bg-neutral-50"
          />
        </div>
        <div>
          <label
            htmlFor="job-description"
            className="mb-1 block text-sm font-medium text-neutral-700"
          >
            Descrição da vaga <span className="font-normal text-neutral-400">(opcional)</span>
          </label>
          <textarea
            id="job-description"
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            maxLength={15_000}
            rows={5}
            placeholder="Cole aqui os requisitos da vaga para receber uma porcentagem de compatibilidade verificável."
            disabled={step === "extracting" || step === "analyzing"}
            className="w-full resize-y rounded-xl border border-neutral-200 bg-neutral-50/70 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-neutral-400 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100/70 disabled:bg-neutral-50"
          />
          <p className="mt-1 text-xs text-neutral-400">
            Sem a descrição, mostramos apenas a qualidade geral do currículo.
          </p>
        </div>
      </div>
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
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all sm:p-10 ${
          dragging
            ? "scale-[1.01] border-emerald-500 bg-emerald-50"
            : "border-neutral-200 bg-neutral-50/70 hover:border-emerald-400 hover:bg-emerald-50/50"
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
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 shadow-sm">
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
            <p className="text-base font-bold text-neutral-800 sm:text-lg">
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

      <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-neutral-400">
        <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
          <path d="M6.5 8V6.5a3.5 3.5 0 1 1 7 0V8M5 8h10v8H5V8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        Seus dados são tratados com privacidade. Você pode apagar sua análise a
        qualquer momento.
      </p>
    </div>
  );
}
