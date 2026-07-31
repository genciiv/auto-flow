import { CircleAlert, CircleCheckBig, Info } from "lucide-react";

const variants = {
  error: { icon: CircleAlert, className: "border-red-200 bg-red-50 text-red-700" },
  success: { icon: CircleCheckBig, className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  info: { icon: Info, className: "border-blue-200 bg-blue-50 text-blue-700" },
};

export default function Alert({ children, variant = "error", title, className = "" }) {
  const config = variants[variant] || variants.error;
  const Icon = config.icon;
  return <div role={variant === "error" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm leading-6 ${config.className} ${className}`}><div className="flex items-start gap-3"><Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" /><div>{title ? <p className="font-bold">{title}</p> : null}<div>{children}</div></div></div></div>;
}
