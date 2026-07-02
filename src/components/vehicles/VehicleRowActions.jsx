import { MoreHorizontal } from "lucide-react";

export default function VehicleRowActions() {
  return (
    <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-slate-100">
      <MoreHorizontal size={18} className="text-slate-500" />
    </button>
  );
}
