export default function Badge({ children, color = "blue" }) {
  const colors = {
    blue: "bg-blue-50 text-blue-700",

    green: "bg-emerald-50 text-emerald-700",

    red: "bg-red-50 text-red-700",

    yellow: "bg-amber-50 text-amber-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-4 py-2 text-xs font-bold ${colors[color]}`}
    >
      {children}
    </span>
  );
}
