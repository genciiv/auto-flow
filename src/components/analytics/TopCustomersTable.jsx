import { Users } from "lucide-react";

function formatMoney(value) {
  return new Intl.NumberFormat("sq-AL", {
    style: "currency",
    currency: "ALL",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatNumber(value) {
  return new Intl.NumberFormat("sq-AL").format(Number(value || 0));
}

export default function TopCustomersTable({ customers = [] }) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-950">Klientët kryesorë</h2>

        <p className="mt-1 text-sm text-slate-500">
          Klientët me vlerën më të lartë të faturave të paguara.
        </p>
      </div>

      {customers.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
            <Users size={22} />
          </div>

          <p className="mt-4 font-bold text-slate-700">Nuk ka ende të dhëna</p>

          <p className="mt-1 text-sm text-slate-500">
            Klientët do të shfaqen pasi të krijohen faturat dhe shërbimet.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4">Klienti</th>
                <th className="px-6 py-4">Automjeti</th>
                <th className="px-6 py-4">Vizita</th>
                <th className="px-6 py-4">Shpenzuar</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {customers.map((customer) => (
                <tr key={customer.id} className="transition hover:bg-slate-50">
                  <td className="px-6 py-5">
                    <p className="font-bold text-slate-950">{customer.name}</p>

                    {customer.phone ? (
                      <p className="mt-1 text-xs text-slate-400">
                        {customer.phone}
                      </p>
                    ) : null}
                  </td>

                  <td className="px-6 py-5">
                    <p className="text-sm font-medium text-slate-700">
                      {customer.vehicle}
                    </p>

                    {customer.plate ? (
                      <p className="mt-1 text-xs font-semibold uppercase text-slate-400">
                        {customer.plate}
                      </p>
                    ) : null}
                  </td>

                  <td className="px-6 py-5 text-sm font-medium text-slate-600">
                    {formatNumber(customer.visits)}{" "}
                    {customer.visits === 1 ? "vizitë" : "vizita"}
                  </td>

                  <td className="px-6 py-5 text-sm font-bold text-slate-950">
                    {formatMoney(customer.totalSpent)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
