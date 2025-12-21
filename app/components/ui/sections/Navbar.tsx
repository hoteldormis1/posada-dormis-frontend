"use client";

import Image from "next/image";
import { useAppDispatch } from "@/lib/store/hooks";
import { logoutUser } from "@/lib/store/utils/user/userSlice";
import { useRouter } from "next/navigation";
import { AppDispatch } from "@/lib/store/store";
import { logo_dormis } from "../../../../public/public-api";

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
				<div className="flex items-center gap-2">
					<Image src={logo_dormis} alt="Dormis logo" width={50} height={50} />
					<label className="text-xl font-bold">Dormis</label>
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
