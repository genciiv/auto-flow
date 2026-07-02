export default function SettingsBusiness() {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">Biznesi</h2>
      <p className="mt-1 text-sm text-slate-500">
        Të dhënat kryesore të servisit.
      </p>

      <div className="mt-6 space-y-4">
        <input
          defaultValue="Auto Service Fier"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
        />

        <input
          defaultValue="Fier, Albania"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
        />

        <input
          defaultValue="NIPT: L00000000A"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
        />

        <button className="rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white hover:bg-slate-800">
          Përditëso biznesin
        </button>
      </div>
    </div>
  );
}
