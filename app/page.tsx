import Link from "next/link";

export default function Home() {
	return (
		<div
			className="flex flex-col justify-center items-center h-screen w-full bg-cover bg-center px-4"
			style={{ backgroundImage: "url('/carlos_paz.png')" }}
		>
			<div className="flex flex-col gap-4 w-full max-w-sm">
				<Link
					href="/login"
					className="bg-[#43AC6A] hover:bg-[#37985C] text-white text-center py-3 px-4 rounded-lg transition duration-200 font-medium"
				>
					Ingresar
				</Link>
				<Link
					href="/olvidarContrasena"
					className="text-white text-center underline hover:text-gray-200 transition"
				>
					Olvidé mi contraseña
				</Link>
			</div>
		</div>
	);
}
