import { pageRoutes } from "../../constants";
import clsx from "clsx";
import { LucideIcon } from "lucide-react";
import { useLocation } from "react-router";

export default function RouteSelect() {
  const location = useLocation();

  return (
    <div className="space-y-1">
      {pageRoutes.map(({ name, path, icon }, index) => (
        <Route
          key={index}
          Icon={icon}
          selected={location.pathname === path}
          title={name}
          href={path}
        />
      ))}
    </div>
  );
}

const Route = ({
  Icon,
  selected,
  title,
  href
}: {
  Icon: LucideIcon;
  selected: boolean;
  title: string;
  href: string;
}) => {
  return (
    <a
      href={href}
      className={clsx(
        "flex items-center justify-start gap-2 w-full rounded px-2 py-1.5 text-sm transition-all",
        selected ?
          "bg-white text-stone-950 shadow" :
          "hover:bg-stone-200 bg-transparent text-stone-500 shadow-none"
      )}
    >
      <Icon className={`${selected && "text-violet-500"}`} size={16} />

      <span>
        {title}
      </span>
    </a>
  );
}