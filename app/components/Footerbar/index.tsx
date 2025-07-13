"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaCalendarAlt, FaUserCircle } from "react-icons/fa";
import { FaBed } from "react-icons/fa6";
import { MdArticle, MdDashboard } from "react-icons/md";

const footerItems = [
  {
    name: "Dashboard",
    label: "Dashboard",
    icon: <MdDashboard size={24} />,
    link: "/dashboard",
  },
  {
    name: "Habitaciones",
    label: "Habitaciones",
    icon: <FaBed size={24} />,
    link: "/habitaciones",
  },
  {
    name: "Reservas",
    label: "Reservas",
    icon: <MdArticle size={24} />,
    link: "/reservas", // corregido (antes era /Reservas)
  },
  {
    name: "Calendario",
    label: "Calendario",
    icon: <FaCalendarAlt size={24} />,
    link: "/calendario",
  },
  {
    name: "Usuarios",
    label: "Usuarios",
    icon: <FaUserCircle size={24} />,
    link: "/usuarios",
  },
];

export default function Footerbar() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 w-full z-50 bg-white py-2 rounded-t-3xl shadow-md">
      <div className="flex justify-around">
        {footerItems.map(({ name, label, icon, link }) => {
          const isActive = pathname === link || pathname.startsWith(link + "/");

          return (
            <Link
              key={name}
              href={link}
              aria-label={label}
              className="w-full flex flex-col items-center justify-center gap-1 text-main px-2 py-3"
            >
              <div
                className={`flex justify-center items-center w-14 h-14 rounded-full transition-all ${
                  isActive ? "bg-main scale-95 text-white" : "text-gray-500"
                }`}
              >
                {icon}
              </div>
              <span className={`text-xs ${isActive ? "font-bold text-main" : "text-gray-500"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
