export default function SectionTitle({
  badge,
  title,
  description,
  center = false,
}) {
  return (
    <div className={center ? "mx-auto max-w-3xl text-center" : ""}>
      {badge && (
        <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
          {badge}
        </p>
      )}

      <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
        {title}
      </h2>

      {description && (
        <p className="mt-5 text-lg leading-8 text-slate-600">{description}</p>
      )}
    </div>
  );
}
