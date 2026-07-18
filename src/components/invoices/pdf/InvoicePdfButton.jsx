"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

export default function InvoicePdfButton({ invoice }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  async function handleDownload() {
    try {
      setIsGenerating(true);
      setError("");

      const [{ pdf }, documentModule] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/invoices/pdf/InvoicePdfDocument"),
      ]);

      const InvoicePdfDocument = documentModule.default;

      const blob = await pdf(<InvoicePdfDocument invoice={invoice} />).toBlob();

      const downloadUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");

      const safeInvoiceNumber = String(invoice?.number || "fature")
        .trim()
        .replace(/[^a-zA-Z0-9-_]/g, "-");

      link.href = downloadUrl;
      link.download = `${safeInvoiceNumber}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => {
        URL.revokeObjectURL(downloadUrl);
      }, 1000);
    } catch (downloadError) {
      console.error("PDF generation error:", downloadError);

      setError("PDF-ja nuk mund të gjenerohej.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleDownload}
        disabled={isGenerating}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Duke gjeneruar...
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Shkarko PDF
          </>
        )}
      </button>

      {error && (
        <div className="absolute right-0 top-13 z-50 w-64 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
}
