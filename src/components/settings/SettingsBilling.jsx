export default function SettingsBilling() {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">Abonimi</h2>
      <p className="mt-1 text-sm text-slate-500">
        Plani aktual dhe informacioni i pagesës.
      </p>

      <div className="mt-6 rounded-3xl bg-blue-600 p-6 text-white">
        <p className="text-sm font-semibold text-blue-100">Plani aktual</p>
        <h3 className="mt-2 text-3xl font-bold">Professional</h3>
        <p className="mt-2 text-blue-100">50€ / muaj</p>

        <button className="mt-6 rounded-full bg-white px-6 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50">
          Ndrysho planin
        </button>
      </div>
    </div>
  );
}
