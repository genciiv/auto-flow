export default function SettingsProfile() {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">Profili</h2>
      <p className="mt-1 text-sm text-slate-500">
        Informacionet e përdoruesit kryesor.
      </p>

      <div className="mt-6 space-y-4">
        <input
          defaultValue="Auto Service Owner"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
        />

        <input
          defaultValue="owner@autoflow.al"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
        />

        <input
          defaultValue="+355 69 000 0000"
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
        />

        <button className="rounded-full bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700">
          Ruaj ndryshimet
        </button>
      </div>
    </div>
  );
}
