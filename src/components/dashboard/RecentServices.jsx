export default function RecentServices({ services = [] }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">Shërbimet e fundit</h2>

      <div className="mt-6 space-y-4">
        {services.map((service) => (
          <div
            key={service.id}
            className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
          >
            <p className="font-bold text-slate-950">
              {service.vehicle?.brand} {service.vehicle?.model}
            </p>
            <p className="mt-1 text-sm text-slate-500">{service.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
