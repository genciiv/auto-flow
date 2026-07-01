import { Calendar, Car, Package, Wrench } from "lucide-react";

const features = [
  {
    icon: Wrench,
    title: "Menaxhim servisi",
    description:
      "Organizo klientët, automjetet, shërbimet, punonjësit dhe faturat në një vend.",
  },
  {
    icon: Package,
    title: "Magazina e pjesëve",
    description:
      "Kontrollo stokun, çmimet, furnitorët dhe pjesët që përdoren në servis.",
  },
  {
    icon: Calendar,
    title: "Rezervime online",
    description:
      "Klientët mund të rezervojnë termine dhe të marrin njoftime automatike.",
  },
  {
    icon: Car,
    title: "Marketplace automotive",
    description:
      "Pjesë këmbimi, makina, motorë dhe pajisje për industrinë automotive.",
  },
];

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="border-t border-slate-100 bg-slate-50 py-24"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
            Features
          </p>
          <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
            Çdo gjë që i duhet një biznesi automotive.
          </h2>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Icon size={24} />
                </div>

                <h3 className="text-xl font-bold text-slate-950">
                  {feature.title}
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
