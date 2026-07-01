const timeline = [
  {
    time: "09:00",
    title: "BMW X5 hyri në servis",
    description: "U krijua work order për ndërrim vaji dhe filtra.",
  },
  {
    time: "10:20",
    title: "Audi A4 përfundoi diagnostikimin",
    description: "U lexuan kodet OBD dhe u krijua raporti.",
  },
  {
    time: "11:45",
    title: "U përdorën pjesë nga magazina",
    description: "Filtri vajit dhe 5L vaj u zbritën nga stoku.",
  },
  {
    time: "13:10",
    title: "Faturë e re",
    description: "Fatura #1024 u krijua dhe u shënua si e paguar.",
  },
];

export default function ActivityTimeline() {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">Timeline</h2>
      <p className="mt-1 text-sm text-slate-500">
        Aktivitetet kryesore të ditës.
      </p>

      <div className="mt-6 space-y-6">
        {timeline.map((item, index) => (
          <div key={item.time} className="relative flex gap-4">
            <div className="flex w-14 shrink-0 justify-end text-sm font-bold text-blue-600">
              {item.time}
            </div>

            <div className="relative flex flex-col items-center">
              <div className="h-3 w-3 rounded-full bg-blue-600" />
              {index !== timeline.length - 1 && (
                <div className="mt-2 h-full w-px bg-slate-200" />
              )}
            </div>

            <div className="-mt-1 pb-2">
              <p className="font-bold text-slate-950">{item.title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
