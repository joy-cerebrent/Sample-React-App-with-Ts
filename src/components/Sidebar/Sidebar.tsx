import Account from "./Account";
import Search from "./Search";
import RouteSelect from "./RouteSelect";
import Logout from "./Logout";

export default function Sidebar() {
  return (
    <div>
      <div className="overflow-y-scroll sticky top-4 h-[calc(100vh-32px-48px)] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-stone-100 [&::-webkit-scrollbar-thumb]:bg-stone-300">
        <Account />
        <Search />
        <RouteSelect />
      </div>
      <Logout />
    </div>
  );
}