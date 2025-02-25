import { Calendar } from "lucide-react";

export default function Topbar() {
  return (
    <div className="border-b px-4 mb-4 mt-2 pb-4 border-stone-200">
      <div className="flex items-center justify-between p-0.5">
        <div>
          <span className="text-sm font-bold block">
            👋 Good Morning, Joy!
          </span>

          <span className="text-xs block text-stone-500">
            Wednesday, Jan 15th 2025
          </span>
        </div>

        <button className="flex text-sm items-center gap-2 bg-stone-100 transition-colors hover:bg-violet-100 hover:text-violet-700 px-3 py-1.5 rounded">
          <Calendar />
          <span>
            Prev 2 weeks
          </span>
        </button>
      </div>
    </div>
  );
}