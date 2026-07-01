const schedule = [
  ["09:30", "BMW X5", "Ndërrim vaji"],
  ["11:00", "Audi A4", "Diagnostikim"],
  ["13:45", "VW Golf 7", "Frena"],
  ["15:20", "Mercedes C220", "Goma"],
];

export default function CalendarWidget() {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-slate-950">Kalendari sot</h2>
      <div className="mt-6 space-y-3">
        {schedule.map(([time, car, service]) => (
          <div key={time} className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-bold text-blue-600">{time}</p>
            <p className="mt-1 font-bold text-slate-950">{car}</p>
            <p className="text-sm text-slate-500">{service}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
