function formatCurrency(value) {
  return `${new Intl.NumberFormat("sq-AL", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value || 0))} Lekë`;
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("sq-AL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getPartTotal(usage) {
  const storedTotal = Number(usage?.total || 0);

  if (storedTotal > 0) {
    return storedTotal;
  }

  return Number(usage?.quantity || 0) * Number(usage?.unitPrice || 0);
}

const statusLabels = {
  DRAFT: "Draft",
  UNPAID: "E papaguar",
  PAID: "E paguar",
  OVERDUE: "E vonuar",
};

export default function InvoicePrintView({ invoice }) {
  const parts = invoice?.service?.partsUsed || [];

  const partsTotal = parts.reduce((sum, usage) => {
    return sum + getPartTotal(usage);
  }, 0);

  const serviceTotal = Number(invoice?.service?.total || 0);

  const laborTotal = invoice?.service
    ? Math.max(serviceTotal - partsTotal, 0)
    : 0;

  const invoiceTotal = Number(invoice?.total || 0);

  const businessAddress = [invoice?.business?.address, invoice?.business?.city]
    .filter(Boolean)
    .join(", ");

  const vehicleName = [invoice?.vehicle?.brand, invoice?.vehicle?.model]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="invoice-print-root hidden bg-white text-slate-950">
      <div className="mx-auto w-full">
        <header className="flex items-start justify-between gap-10 border-b border-slate-300 pb-6">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">
              AF
            </div>

            <h1 className="mt-4 text-2xl font-bold">
              {invoice?.business?.name || "AutoFlow"}
            </h1>

            {businessAddress && (
              <p className="mt-2 text-sm text-slate-600">{businessAddress}</p>
            )}

            {invoice?.business?.phone && (
              <p className="mt-1 text-sm text-slate-600">
                Tel: {invoice.business.phone}
              </p>
            )}

            {invoice?.business?.email && (
              <p className="mt-1 text-sm text-slate-600">
                Email: {invoice.business.email}
              </p>
            )}
          </div>

          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              Faturë
            </p>

            <p className="mt-2 text-2xl font-bold">{invoice?.number || "—"}</p>

            <p className="mt-3 text-sm text-slate-600">
              Data: {formatDate(invoice?.createdAt)}
            </p>

            <span className="mt-3 inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {statusLabels[invoice?.status] || "Draft"}
            </span>
          </div>
        </header>

        <section className="mt-7 grid grid-cols-2 gap-5">
          <div className="rounded-xl border border-slate-300 p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
              Klienti
            </p>

            <p className="mt-3 text-base font-bold">
              {invoice?.customer?.name || "Pa klient"}
            </p>

            <p className="mt-2 text-sm text-slate-600">
              {invoice?.customer?.phone || "Pa telefon"}
            </p>

            <p className="mt-1 text-sm text-slate-600">
              {invoice?.customer?.email || "Pa email"}
            </p>

            <p className="mt-1 text-sm text-slate-600">
              {invoice?.customer?.city || "Pa qytet"}
            </p>
          </div>

          <div className="rounded-xl border border-slate-300 p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
              Automjeti
            </p>

            <p className="mt-3 text-base font-bold">
              {vehicleName || "Pa automjet"}
            </p>

            <p className="mt-2 text-sm text-slate-600">
              Targa: {invoice?.vehicle?.plate || "—"}
            </p>

            <p className="mt-1 text-sm text-slate-600">
              Viti: {invoice?.vehicle?.year || "—"}
            </p>

            <p className="mt-1 break-all text-sm text-slate-600">
              VIN: {invoice?.vehicle?.vin || "—"}
            </p>
          </div>
        </section>

        {invoice?.service && (
          <section className="mt-5 rounded-xl border border-slate-300 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
              Shërbimi
            </p>

            <p className="mt-3 text-base font-bold">{invoice.service.title}</p>

            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
              {invoice.service.description || "Nuk është vendosur përshkrim."}
            </p>
          </section>
        )}

        <section className="mt-7 overflow-hidden rounded-xl border border-slate-300">
          <table className="w-full border-collapse">
            <thead className="bg-slate-100">
              <tr className="text-left text-xs uppercase tracking-wide text-slate-600">
                <th className="px-4 py-3">Kodi</th>
                <th className="px-4 py-3">Përshkrimi</th>
                <th className="px-4 py-3 text-right">Sasia</th>
                <th className="px-4 py-3 text-right">Çmimi</th>
                <th className="px-4 py-3 text-right">Totali</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200">
              {parts.length > 0 ? (
                parts.map((usage) => (
                  <tr key={usage.id}>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {usage.part?.code || "—"}
                    </td>

                    <td className="px-4 py-3 text-sm font-semibold">
                      {usage.part?.name || "Pjesë"}
                    </td>

                    <td className="px-4 py-3 text-right text-sm">
                      {Number(usage.quantity || 0)}
                    </td>

                    <td className="px-4 py-3 text-right text-sm">
                      {formatCurrency(usage.unitPrice)}
                    </td>

                    <td className="px-4 py-3 text-right text-sm font-bold">
                      {formatCurrency(getPartTotal(usage))}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-4 text-sm text-slate-600">—</td>

                  <td className="px-4 py-4 text-sm font-semibold">
                    {invoice?.service?.title || "Shërbim / Faturë manuale"}
                  </td>

                  <td className="px-4 py-4 text-right text-sm">1</td>

                  <td className="px-4 py-4 text-right text-sm">
                    {formatCurrency(invoiceTotal)}
                  </td>

                  <td className="px-4 py-4 text-right text-sm font-bold">
                    {formatCurrency(invoiceTotal)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="mt-7 flex justify-end">
          <div className="w-80 rounded-xl border border-slate-300 p-5">
            {invoice?.service && (
              <>
                <div className="flex justify-between gap-5 py-2 text-sm">
                  <span className="text-slate-600">Pjesët</span>
                  <span className="font-semibold">
                    {formatCurrency(partsTotal)}
                  </span>
                </div>

                <div className="flex justify-between gap-5 py-2 text-sm">
                  <span className="text-slate-600">Puna</span>
                  <span className="font-semibold">
                    {formatCurrency(laborTotal)}
                  </span>
                </div>
              </>
            )}

            <div className="mt-2 flex items-end justify-between gap-5 border-t border-slate-300 pt-4">
              <span className="font-bold">Total për pagesë</span>

              <span className="text-xl font-bold text-blue-700">
                {formatCurrency(invoiceTotal)}
              </span>
            </div>
          </div>
        </section>

        <footer className="mt-12 border-t border-slate-300 pt-5 text-center text-xs text-slate-500">
          Faleminderit që zgjodhët {invoice?.business?.name || "AutoFlow"}.
        </footer>
      </div>
    </div>
  );
}
