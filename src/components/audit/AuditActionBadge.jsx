const ACTION_CONFIG = {
  CREATE: {
    label: "Krijim",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },

  UPDATE: {
    label: "Përditësim",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },

  DELETE: {
    label: "Fshirje",
    className: "border-red-200 bg-red-50 text-red-700",
  },

  RESTORE: {
    label: "Rikthim",
    className: "border-cyan-200 bg-cyan-50 text-cyan-700",
  },

  STATUS_CHANGE: {
    label: "Ndryshim statusi",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },

  LOGIN: {
    label: "Hyrje",
    className: "border-violet-200 bg-violet-50 text-violet-700",
  },

  LOGOUT: {
    label: "Dalje",
    className: "border-slate-200 bg-slate-100 text-slate-700",
  },

  EXPORT: {
    label: "Eksport",
    className: "border-indigo-200 bg-indigo-50 text-indigo-700",
  },

  IMPORT: {
    label: "Import",
    className: "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700",
  },

  PAYMENT: {
    label: "Pagesë",
    className: "border-purple-200 bg-purple-50 text-purple-700",
  },

  CUSTOM: {
    label: "Veprim",
    className: "border-slate-200 bg-slate-50 text-slate-700",
  },
};

export function getAuditActionLabel(action) {
  return ACTION_CONFIG[action]?.label || action || "E panjohur";
}

export default function AuditActionBadge({ action }) {
  const config = ACTION_CONFIG[action] || {
    label: action || "E panjohur",
    className: "border-slate-200 bg-slate-50 text-slate-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${config.className}`}
    >
      {config.label}
    </span>
  );
}
