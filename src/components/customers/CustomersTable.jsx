import CustomerRowActions from "@/components/customers/CustomerRowActions";

const customers = [
  {
    name: "Arben Hoxha",
    phone: "+355 69 123 4567",
    city: "Fier",
    vehicles: "BMW X5, VW Golf 7",
    visits: 8,
    spent: "€1,240",
    status: "Aktiv",
  },
  {
    name: "Elira Dervishi",
    phone: "+355 68 987 6543",
    city: "Tiranë",
    vehicles: "Audi A4",
    visits: 3,
    spent: "€420",
    status: "Aktiv",
  },
  {
    name: "Gentian Kola",
    phone: "+355 67 222 3344",
    city: "Durrës",
    vehicles: "Mercedes C220",
    visits: 5,
    spent: "€860",
    status: "Në pritje",
  },
  {
    name: "Mira Leka",
    phone: "+355 69 555 1212",
    city: "Vlorë",
    vehicles: "Toyota Yaris",
    visits: 2,
    spent: "€180",
    status: "Jo aktiv",
  },
];

export default function CustomersTable() {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-950">Lista e klientëve</h2>
        <p className="mt-1 text-sm text-slate-500">
          Klientët më të fundit të regjistruar në servis.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-6 py-4">Klienti</th>
              <th className="px-6 py-4">Qyteti</th>
              <th className="px-6 py-4">Automjetet</th>
              <th className="px-6 py-4">Vizita</th>
              <th className="px-6 py-4">Shpenzuar</th>
              <th className="px-6 py-4">Statusi</th>
              <th className="px-6 py-4 text-right">Veprime</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {customers.map((customer) => (
              <tr key={customer.phone} className="hover:bg-slate-50">
                <td className="px-6 py-5">
                  <p className="font-bold text-slate-950">{customer.name}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {customer.phone}
                  </p>
                </td>

                <td className="px-6 py-5 text-sm font-medium text-slate-600">
                  {customer.city}
                </td>

                <td className="px-6 py-5 text-sm text-slate-600">
                  {customer.vehicles}
                </td>

                <td className="px-6 py-5 text-sm font-bold text-slate-950">
                  {customer.visits}
                </td>

                <td className="px-6 py-5 text-sm font-bold text-slate-950">
                  {customer.spent}
                </td>

                <td className="px-6 py-5">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      customer.status === "Aktiv"
                        ? "bg-emerald-50 text-emerald-700"
                        : customer.status === "Në pritje"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {customer.status}
                  </span>
                </td>

                <td className="px-6 py-5">
                  <div className="flex justify-end">
                    <CustomerRowActions />
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
