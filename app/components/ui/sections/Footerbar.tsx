"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaCalendarAlt, FaUserCircle, FaUsers } from "react-icons/fa";
import { FaBed } from "react-icons/fa6";
import { MdArticle, MdDashboard, MdHistory } from "react-icons/md";
import { useAppSelector } from "@/lib/store/hooks";
import { RootState } from "@/lib/store/store";

interface FooterItem {
	name: string;
	label: string;
	icon: React.ReactNode;
	link: string;
	sysadminOnly?: boolean;
}

const footerItems: FooterItem[] = [
	{
		name: "Usuarios",
		label: "Usuarios",
		icon: <FaUserCircle size={24} />,
		link: "/admin/usuarios",
	},
	{
		name: "Habitaciones",
		label: "Habitaciones",
		icon: <FaBed size={24} />,
		link: "/admin/habitaciones",
	},
	{
		name: "Huespedes",
		label: "Huéspedes",
		icon: <FaUsers size={24} />,
		link: "/admin/huespedes",
	},
	{
		name: "Reservas",
		label: "Reservas",
		icon: <MdArticle size={24} />,
		link: "/admin/reservas",
	},
	{
		name: "Calendario",
		label: "Calendario",
		icon: <FaCalendarAlt size={24} />,
		link: "/admin/calendario",
	},
	{
		name: "Dashboard",
		label: "Dashboard",
		icon: <MdDashboard size={24} />,
		link: "/admin/dashboard",
	},
	{
		name: "Auditorias",
		label: "Auditorías",
		icon: <MdHistory size={24} />,
		link: "/admin/auditorias",
		sysadminOnly: true,
	},
];

export default function Footerbar() {
	const pathname = usePathname();
	const { currentUser, tiposUsuarios } = useAppSelector((state: RootState) => state.user);

	const isSysadmin = useMemo(() => {
		const sysadminType = tiposUsuarios.find((t) => t.nombre === "sysadmin");
		return sysadminType ? currentUser?.idTipoUsuario === sysadminType.idTipoUsuario : false;
	}, [currentUser?.idTipoUsuario, tiposUsuarios]);

	const visibleItems = useMemo(
		() => footerItems.filter((item) => !item.sysadminOnly || isSysadmin),
		[isSysadmin]
	);

	return (
		<div className="fixed bottom-0 w-full z-50 bg-white py-2 rounded-t-3xl">
			<div className="flex justify-around">
				{visibleItems.map(({ name, label, icon, link }) => {
					const isActive = pathname === link || pathname.startsWith(link + "/");

					return (
						<Link
							key={name}
							href={link}
							aria-label={label}
							className="w-full flex flex-col items-center justify-center gap-1 px-2 py-3 text-sm"
						>
							<div
								className={`flex justify-center items-center w-14 h-14 rounded-full transition-all duration-200 ease-in
                ${
																	isActive
																		? "bg-main text-white shadow-lg scale-95"
																		: "text-gray-500 hover:bg-background"
																}`}
							>
								{icon}
							</div>
							<span
								className={`text-xs transition-colors ${
									isActive ? "font-bold text-main" : "text-gray-500 hover:text-main"
								}`}
							>
								{label}
							</span>
						</Link>
					);
				})}
			</div>
		</div>
	);
}
