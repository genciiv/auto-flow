import { Building2, ChevronDown, Plus } from "lucide-react";

export default function WorkspaceSwitcher() {
  return (
    <button className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left hover:bg-slate-100">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
          <Building2 size={19} />
        </div>

        <div>
          <p className="text-sm font-bold text-slate-950">Auto Service Fier</p>
          <p className="text-xs font-medium text-slate-500">Workspace aktiv</p>
        </div>
      </div>

      <ChevronDown size={17} className="text-slate-400" />
    </button>
  );
}
