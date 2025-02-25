import { LogOut } from "lucide-react";

export default function Logout() {
  return (
    <div className="flex sticky top-[calc(100vh-48px-16px)] flex-col h-12 border-t px-2 border-t-stone-300 justify-end text-xs">
      <div className="flex items-center justify-between">
        <p className="font-medium">
          Logout
        </p>

        <button className="p-2 bg-stone-200 hover:bg-stone-300 transition-colors rounded">
          <LogOut size={12} />
        </button>
      </div>
    </div>
  );
}