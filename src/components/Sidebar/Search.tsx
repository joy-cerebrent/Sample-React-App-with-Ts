import { Search as SearchIcon } from "lucide-react";

export default function Search() {
  return (
    <div className="bg-stone-200 mb-4 rounded flex items-center px-2 py-1.5 text-sm">
      <SearchIcon className="mr-2" size={16} />

      <input
        type="text"
        placeholder="Seach"
        className="w-full bg-transparent placeholder:text-stone-400 focus:outline-none"
      />
    </div>
  );
}