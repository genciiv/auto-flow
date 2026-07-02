import InvoiceRowActions from "@/components/invoices/InvoiceRowActions";

const invoices = [
  {
    id: "#INV-1024",
    customer: "Arben Hoxha",
    vehicle: "BMW X5",
    plate: "AA123BB",
    service: "Ndërrim vaji + filtra",
    date: "02/07/2026",
    total: "€240",
    status: "Paguar",
  },
  {
    id: "#INV-1025",
    customer: "Elira Dervishi",
    vehicle: "Audi A4",
    plate: "AB456CD",
    service: "Diagnostikim OBD",
    date: "02/07/2026",
    total: "€35",
    status: "Në pritje",
  },
  {
    id: "#INV-1026",
    customer: "Gentian Kola",
    vehicle: "Mercedes C220",
    plate: "AC789EF",
    service: "Kontroll frenash",
    date: "01/07/2026",
    total: "€180",
    status: "Paguar",
  },
  {
    id: "#INV-1027",
    customer: "Mira Leka",
    vehicle: "Toyota Yaris",
    plate: "AD321FG",
    service: "Goma + balancim",
    date: "30/06/2026",
    total: "€90",
    status: "Vonuar",
  },
];

export default function InvoicesTable() {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-950">Lista e faturave</h2>
        <p className="mt-1 text-sm text-slate-500">
          Faturat e krijuara nga shërbimet dhe porositë.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1050px]">
          <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Klienti</th>
              <th className="px-6 py-4">Automjeti</th>
              <th className="px-6 py-4">Shërbimi</th>
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4">Totali</th>
              <th className="px-6 py-4">Statusi</th>
              <th className="px-6 py-4 text-right">Veprime</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-slate-50">
                <td className="px-6 py-5 text-sm font-bold text-blue-600">
                  {invoice.id}
                </td>

                <td className="px-6 py-5 font-bold text-slate-950">
                  {invoice.customer}
                </td>

                <td className="px-6 py-5">
                  <p className="font-bold text-slate-950">{invoice.vehicle}</p>
                  <p className="mt-1 text-sm text-slate-500">{invoice.plate}</p>
                </td>

                <td className="px-6 py-5 text-sm text-slate-600">
                  {invoice.service}
                </td>

                <td className="px-6 py-5 text-sm font-medium text-slate-600">
                  {invoice.date}
                </td>

                <td className="px-6 py-5 text-sm font-bold text-slate-950">
                  {invoice.total}
                </td>

                <td className="px-6 py-5">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      invoice.status === "Paguar"
                        ? "bg-emerald-50 text-emerald-700"
                        : invoice.status === "Vonuar"
                          ? "bg-red-50 text-red-700"
                          : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {invoice.status}
                  </span>
                </td>

                <td className="px-6 py-5">
                  <div className="flex justify-end">
                    <InvoiceRowActions />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
