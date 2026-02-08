"use client";

import Link from "next/link";
import { useAppDispatch } from "@/lib/store/hooks";
import { logoutUser } from "@/lib/store/utils/user/userSlice";
import { useRouter, usePathname } from "next/navigation";
import { AppDispatch } from "@/lib/store/store";
import { FaBed, FaSignInAlt } from "react-icons/fa";

export default function Navbar() {
	const dispatch: AppDispatch = useAppDispatch();
	const router = useRouter();
	const pathname = usePathname();

	const handleLogout = async () => {
		try {
			await dispatch(logoutUser()).unwrap();
			router.push("/login");
		} catch (error) {
			console.error("Logout error:", error);
		}
	};

	if (pathname === "/") {
		return (
			<div className="bg-white fixed top-0 w-full h-20 z-50 py-2 rounded-t-3xl">
				<div className="flex items-center justify-between px-4">
					<div className="flex items-center gap-3">
						<FaBed className="text-main text-4xl" />
						<div>
							<h1 className="text-2xl font-bold text-main">Posada Dormis</h1>
							<p className="text-sm text-muted">Carlos Paz - Córdoba</p>
						</div>
					</div>

					<Link
						href="/login"
						className="flex items-center gap-2 border-2 border-main text-main hover:bg-main hover:text-white cursor-pointer px-4 py-2 rounded-sm font-bold transition-all duration-[800ms]"
					>
						<FaSignInAlt />
						Ingresar
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-white h-20 z-50 py-2 border-b border-gray-200">
			<div className="flex items-center justify-end px-6 h-full">
				<button
					onClick={handleLogout}
					className="border-2 border-main text-main hover:bg-main hover:text-white cursor-pointer px-4 py-2 rounded-sm font-bold transition-all duration-[800ms]"
				>
					Logout
				</button>
			</div>
		</div>
	);
}
