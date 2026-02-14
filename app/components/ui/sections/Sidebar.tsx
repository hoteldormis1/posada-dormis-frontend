"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FaBars, FaCalendarAlt, FaSignOutAlt, FaTimes, FaUserCircle, FaUsers, FaDollarSign, FaFileAlt } from "react-icons/fa";
import { FaBed } from "react-icons/fa6";
import { MdArticle, MdDashboard, MdHistory } from "react-icons/md";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { AppDispatch, RootState } from "@/lib/store/store";
import { logoutUser } from "@/lib/store/utils/user/userSlice";

interface NavItem {
	name: string;
	label: string;
	icon: React.ReactNode;
	link: string;
	sysadminOnly?: boolean;
}

interface NavSection {
	title: string;
	items: NavItem[];
}

const navSections: NavSection[] = [
	{
		title: "Gestión",
		items: [
			{
				name: "Calendario",
				label: "Calendario",
				icon: <FaCalendarAlt size={18} />,
				link: "/admin/calendario",
			},
		/*{
			name: "Dashboard",
			label: "Dashboard",
			icon: <MdDashboard size={18} />,
			link: "/admin/dashboard",
		},*/
		{
			name: "Contable",
			label: "Contable",
			icon: <FaDollarSign size={18} />,
			link: "/admin/contable",
		},
		{
			name: "Reportes",
			label: "Reportes",
			icon: <FaFileAlt size={18} />,
			link: "/admin/reportes",
		},
	],
},
	{
		title: "Admin",
		items: [
			{
				name: "Usuarios",
				label: "Usuarios",
				icon: <FaUserCircle size={18} />,
				link: "/admin/usuarios",
			},
			{
				name: "Habitaciones",
				label: "Habitaciones",
				icon: <FaBed size={18} />,
				link: "/admin/habitaciones",
			},
			{
				name: "Huespedes",
				label: "Huéspedes",
				icon: <FaUsers size={18} />,
				link: "/admin/huespedes",
			},
			{
				name: "Reservas",
				label: "Reservas",
				icon: <MdArticle size={18} />,
				link: "/admin/reservas",
			},
			{
				name: "Auditorias",
				label: "Auditorías",
				icon: <MdHistory size={18} />,
				link: "/admin/auditorias",
				sysadminOnly: true,
			},
		],
	},
];

export default function Sidebar() {
	const pathname = usePathname();
	const router = useRouter();
	const dispatch: AppDispatch = useAppDispatch();
	const { currentUser, tiposUsuarios } = useAppSelector((state: RootState) => state.user);
	const [mobileOpen, setMobileOpen] = useState(false);

	// Close mobile drawer on route change
	useEffect(() => {
		setMobileOpen(false);
	}, [pathname]);

	const handleLogout = async () => {
		try {
			await dispatch(logoutUser()).unwrap();
			router.push("/login");
		} catch (error) {
			console.error("Logout error:", error);
		}
	};

	const isSysadmin = useMemo(() => {
		const sysadminType = tiposUsuarios.find((t) => t.nombre === "sysadmin");
		return sysadminType ? currentUser?.idTipoUsuario === sysadminType.idTipoUsuario : false;
	}, [currentUser?.idTipoUsuario, tiposUsuarios]);

	const visibleSections = useMemo(
		() =>
			navSections.map((section) => ({
				...section,
				items: section.items.filter((item) => !item.sysadminOnly || isSysadmin),
			})),
		[isSysadmin]
	);

	const toggleMobile = useCallback(() => setMobileOpen((v) => !v), []);

	/** Shared sidebar content */
	const sidebarContent = (
		<>
			{/* Logo */}
			<div className="px-5 py-5 border-b border-gray-100 flex items-center justify-between">
				<div>
					<h1 className="text-xl font-bold text-main leading-tight">Posada Dormi&apos;s</h1>
					<p className="text-xs text-muted">Carlos Paz — Córdoba</p>
				</div>
				{/* Close button — mobile only */}
				<button
					onClick={toggleMobile}
					className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 cursor-pointer"
					aria-label="Cerrar menú"
				>
					<FaTimes size={18} />
				</button>
			</div>

			{/* Nav sections */}
			<nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
				{visibleSections.map((section) => (
					<div key={section.title}>
						<p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
							{section.title}
						</p>
						<ul className="space-y-1">
							{section.items.map(({ name, label, icon, link }) => {
								const isActive = pathname === link || pathname.startsWith(link + "/");

								return (
									<li key={name}>
										<Link
											href={link}
											className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
												${
													isActive
														? "bg-main text-white shadow-sm"
														: "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
												}`}
										>
											<span className="shrink-0">{icon}</span>
											{label}
										</Link>
									</li>
								);
							})}
						</ul>
					</div>
				))}
			</nav>

			{/* Logout */}
			<div className="px-3 py-4 border-t border-gray-100">
				<button
					onClick={handleLogout}
					className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-150 cursor-pointer"
				>
					<FaSignOutAlt size={18} />
					Cerrar sesión
				</button>
			</div>
		</>
	);

	return (
		<>
			{/* Mobile: hamburger button */}
			<button
				onClick={toggleMobile}
				className="fixed top-4 left-4 z-50 md:hidden p-2.5 bg-white rounded-lg shadow-md border border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer"
				aria-label="Abrir menú"
			>
				<FaBars size={20} />
			</button>

			{/* Mobile: overlay */}
			{mobileOpen && (
				<div
					className="fixed inset-0 bg-black/40 z-40 md:hidden"
					onClick={toggleMobile}
				/>
			)}

			{/* Mobile: drawer */}
			<aside
				className={`fixed top-0 left-0 bottom-0 w-[75vw] max-w-[280px] bg-white border-r border-gray-200 flex flex-col z-50 transition-transform duration-300 ease-in-out md:hidden
					${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
			>
				{sidebarContent}
			</aside>

			{/* Desktop/Tablet: always visible sidebar */}
			<aside className="layout-sidebar bg-white border-r border-gray-200 hidden md:flex flex-col">
				{sidebarContent}
			</aside>
		</>
	);
}
