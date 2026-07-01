const plans = [
  {
    name: "Starter",
    price: "20€",
    description: "Për servise të vogla",
    features: [
      "Klientë & automjete",
      "Shërbime",
      "Fatura bazë",
      "Magazinë e thjeshtë",
    ],
  },
  {
    name: "Professional",
    price: "50€",
    description: "Për servise në rritje",
    features: [
      "Çdo gjë te Starter",
      "Punonjës",
      "Raporte",
      "Njoftime",
      "Marketplace",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Për rrjete servisesh",
    features: [
      "Role të avancuara",
      "Multi-branch",
      "Integrime",
      "Support prioritar",
    ],
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
            Çmimet
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
            Plane të thjeshta për çdo servis.
          </h2>
          <p className="mt-5 text-lg text-slate-600">
            Fillo thjeshtë dhe rrite platformën bashkë me biznesin.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-[2rem] border p-8 ${
                plan.highlighted
                  ? "border-blue-600 bg-blue-600 text-white shadow-2xl shadow-blue-600/20"
                  : "border-slate-200 bg-white text-slate-950 shadow-sm"
              }`}
            >
              <h3 className="text-2xl font-bold">{plan.name}</h3>

              <p
                className={`mt-3 ${plan.highlighted ? "text-blue-100" : "text-slate-500"}`}
              >
                {plan.description}
              </p>

              <div className="mt-8 flex items-end gap-2">
                <span className="text-5xl font-bold">{plan.price}</span>
                {plan.price !== "Custom" && (
                  <span
                    className={
                      plan.highlighted ? "text-blue-100" : "text-slate-500"
                    }
                  >
                    /muaj
                  </span>
                )}
              </div>

              <ul className="mt-8 space-y-4">
                {plan.features.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span>✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`mt-8 w-full rounded-full px-6 py-4 text-sm font-bold ${
                  plan.highlighted
                    ? "bg-white text-blue-600 hover:bg-blue-50"
                    : "bg-slate-950 text-white hover:bg-slate-800"
                }`}
              >
                Zgjidh planin
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
