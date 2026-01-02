"use client";

import Image from "next/image";
import { useAppDispatch } from "@/lib/store/hooks";
import { logoutUser } from "@/lib/store/utils/user/userSlice";
import { useRouter } from "next/navigation";
import { AppDispatch } from "@/lib/store/store";
import { logo_dormis } from "../../../../public/public-api";
import { FaBed } from "react-icons/fa";

export default function Navbar() {
	const dispatch: AppDispatch = useAppDispatch();
	const router = useRouter();

	const handleLogout = async () => {
		try {
			await dispatch(logoutUser()).unwrap(); // 🔁 backend: borra cookie
			router.push("/login"); // 🔁 redirige
		} catch (error) {
			console.error("Error al cerrar sesión:", error);
		}
	};

	return (
		<div className="bg-white fixed top-0 w-full h-20 z-50 py-2 rounded-t-3xl">
			<div className="flex items-center justify-between px-4">
				{/* Logo */}
				<div className="flex items-center gap-3">
					<FaBed className="text-main text-4xl" />
					<div>
					<h1 className="text-2xl font-bold text-main">Posada Dormis</h1>
					<p className="text-sm text-muted">Carlos Paz - Córdoba</p>
					</div>
				</div>

				{/* Perfil + Logout */}
				<div className="flex items-center gap-4">
					<button
						onClick={handleLogout}
						className="border-2 border-main text-main hover:bg-main hover:text-white cursor-pointer px-4 py-2 rounded-sm font-bold transition-all duration-[800ms]"
					>
						Logout
					</button>
				</div>
			</div>
		</div>
	);
}
