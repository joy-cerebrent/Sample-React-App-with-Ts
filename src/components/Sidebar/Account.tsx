import { ChevronDown, ChevronUp } from "lucide-react";

export default function Account() {
  return (
    <div className="border-b mb-4 mt-2 pb-4 border-stone-300">
      <button className="flex p-0.5 hover:bg-stone-200 rounded transition-colors relative gap-2 w-full items-center">
        <img
          src="https://avatars.githubusercontent.com/u/67324809"
          alt="Profile Picture"
          className="size-8 rounded shrink-0 bg-violet-500 shadow"
          height={32}
          width={32}
        />

        <div className="text-start">
          <span className="text-sm font-bold block">
            Joy Brar
          </span>

          <span className="text-xs block text-stone-500">
            joy@cerebrent.com
          </span>
        </div>

        <ChevronUp
          size={12}
          className="absolute right-2 top-1/2 translate-y-[calc(-50%-4px)] text-xs"
        />
        <ChevronDown
          size={12}
          className="absolute right-2 top-1/2 translate-y-[calc(-50%+4px)] text-xs"
        />
      </button>
    </div>
  );
}