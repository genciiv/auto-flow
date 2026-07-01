export default function AiAssistantWidget() {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
      <p className="text-sm font-semibold text-blue-300">AutoFlow AI</p>

      <h2 className="mt-3 text-2xl font-bold">
        Asistent për diagnostikim dhe ofertë.
      </h2>

      <div className="mt-6 rounded-2xl bg-white/10 p-4 text-sm">
        Makina bën zhurmë kur frenoj. Çfarë mund të jetë?
      </div>

      <div className="mt-4 rounded-2xl bg-white p-4 text-sm text-slate-900">
        <p className="font-bold">Sugjerime:</p>
        <p className="mt-2">1. Ferodo të konsumuara</p>
        <p>2. Disqe frenash</p>
        <p>3. Kushinetë rrote</p>
      </div>

      <button className="mt-5 w-full rounded-full bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700">
        Krijo Work Order
      </button>
    </div>
  );
}
