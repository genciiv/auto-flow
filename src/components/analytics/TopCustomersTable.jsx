const customers = [
  ["Arben Hoxha", "BMW X5", "8 vizita", "€1,240"],
  ["Gentian Kola", "Mercedes C220", "5 vizita", "€860"],
  ["Elira Dervishi", "Audi A4", "3 vizita", "€420"],
  ["Mira Leka", "Toyota Yaris", "2 vizita", "€180"],
];

export default function TopCustomersTable() {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-950">Klientët kryesorë</h2>
        <p className="mt-1 text-sm text-slate-500">
          Klientët me vlerën më të lartë për servisin.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-6 py-4">Klienti</th>
              <th className="px-6 py-4">Automjeti</th>
              <th className="px-6 py-4">Vizita</th>
              <th className="px-6 py-4">Shpenzuar</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {customers.map(([name, vehicle, visits, spent]) => (
              <tr key={name} className="hover:bg-slate-50">
                <td className="px-6 py-5 font-bold text-slate-950">{name}</td>
                <td className="px-6 py-5 text-sm text-slate-600">{vehicle}</td>
                <td className="px-6 py-5 text-sm font-medium text-slate-600">
                  {visits}
                </td>
                <td className="px-6 py-5 text-sm font-bold text-slate-950">
                  {spent}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
