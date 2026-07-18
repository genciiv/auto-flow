import InvoiceRowActions from "@/components/invoices/InvoiceRowActions";

export default function InvoicesTable({ invoices }) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-950">Lista e faturave</h2>
        <p className="mt-1 text-sm text-slate-500">
          Faturat e regjistruara në databazë.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px]">
          <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-6 py-4">Nr. Faturës</th>
              <th className="px-6 py-4">Klienti</th>
              <th className="px-6 py-4">Automjeti</th>
              <th className="px-6 py-4">Shërbimi</th>
              <th className="px-6 py-4">Totali</th>
              <th className="px-6 py-4">Statusi</th>
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4 text-right">Veprime</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {invoices.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  className="px-6 py-10 text-center text-slate-500"
                >
                  Nuk ka fatura në databazë.
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => {
                const statusLabel =
                  invoice.status === "PAID"
                    ? "Paguar"
                    : invoice.status === "OVERDUE"
                      ? "Vonuar"
                      : invoice.status === "UNPAID"
                        ? "Pa paguar"
                        : "Draft";

                return (
                  <tr key={invoice.id} className="hover:bg-slate-50">
                    <td className="px-6 py-5 text-sm font-bold text-blue-600">
                      {invoice.number}
                    </td>

                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-950">
                        {invoice.customer?.name || "-"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {invoice.customer?.phone || "Pa telefon"}
                      </p>
                    </td>

                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-950">
                        {invoice.vehicle
                          ? `${invoice.vehicle.brand} ${invoice.vehicle.model || ""}`
                          : "-"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {invoice.vehicle?.plate || "-"}
                      </p>
                    </td>

                    <td className="px-6 py-5 text-sm text-slate-600">
                      {invoice.service?.title || "-"}
                    </td>

                    <td className="px-6 py-5 text-sm font-bold text-slate-950">
                      €{Number(invoice.total || 0).toFixed(0)}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          invoice.status === "PAID"
                            ? "bg-emerald-50 text-emerald-700"
                            : invoice.status === "OVERDUE"
                              ? "bg-red-50 text-red-700"
                              : invoice.status === "UNPAID"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {statusLabel}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-sm font-medium text-slate-600">
                      {new Intl.DateTimeFormat("sq-AL", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      }).format(new Date(invoice.createdAt))}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <InvoiceRowActions invoice={invoice} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
