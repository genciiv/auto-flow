import CustomerRowActions from "@/components/customers/CustomerRowActions";

export default function CustomersTable({ customers }) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-950">Lista e klientëve</h2>
        <p className="mt-1 text-sm text-slate-500">
          Klientët e regjistruar në databazë.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-6 py-4">Klienti</th>
              <th className="px-6 py-4">Qyteti</th>
              <th className="px-6 py-4">Automjetet</th>
              <th className="px-6 py-4">Fatura</th>
              <th className="px-6 py-4">Shpenzuar</th>
              <th className="px-6 py-4">Statusi</th>
              <th className="px-6 py-4 text-right">Veprime</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {customers.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="px-6 py-10 text-center text-slate-500"
                >
                  Nuk ka klientë në databazë.
                </td>
              </tr>
            ) : (
              customers.map((customer) => {
                const spent = customer.invoices.reduce(
                  (sum, invoice) => sum + Number(invoice.total || 0),
                  0,
                );

                const status =
                  customer.vehicles.length > 0 || customer.invoices.length > 0
                    ? "Aktiv"
                    : "Jo aktiv";

                return (
                  <tr key={customer.id} className="hover:bg-slate-50">
                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-950">
                        {customer.name}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {customer.phone || "Pa telefon"}
                      </p>
                    </td>

                    <td className="px-6 py-5 text-sm font-medium text-slate-600">
                      {customer.city || "-"}
                    </td>

                    <td className="px-6 py-5 text-sm text-slate-600">
                      {customer.vehicles.length > 0
                        ? customer.vehicles
                            .map(
                              (vehicle) =>
                                `${vehicle.brand}${vehicle.model ? ` ${vehicle.model}` : ""}`,
                            )
                            .join(", ")
                        : "-"}
                    </td>

                    <td className="px-6 py-5 text-sm font-bold text-slate-950">
                      {customer.invoices.length}
                    </td>

                    <td className="px-6 py-5 text-sm font-bold text-slate-950">
                      €{spent.toFixed(0)}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          status === "Aktiv"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {status}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex justify-end">
                        <CustomerRowActions customer={customer} />
                      </div>
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
