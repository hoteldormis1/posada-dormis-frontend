import { pantallaPrincipalEstilos } from '@/styles/global-styles'
import React from 'react'

const page = () => {
  return (
	<div className={`${pantallaPrincipalEstilos} flex flex-col items-center h-screen`}>
		Perfil
		</div>
  )
}

export default page

// "use client";

// import React, { useState } from "react";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import InputType from "@/components/InputType";
// import { BiHomeAlt, BiSave } from "react-icons/bi";
// import { pantallaPrincipalEstilos } from "@/styles/global-styles";
// // import { DateRange } from "react-date-range";
// // import "react-date-range/dist/styles.css";
// // import "react-date-range/dist/theme/default.css";

// const tabs = ["Perfil", "Preferencias", "Seguridad"];

// const Perfil = () => {
// 	const [activeTab, setActiveTab] = useState("Perfil");
// 	const router = useRouter();

// 	// Estados
// 	const [profileImage, setProfileImage] = useState("/perfil-default.png");
// 	const [name, setName] = useState("Usuario");
// 	const [pagination, setPagination] = useState(10);
// 	const [password, setPassword] = useState("");

// 	// Estado para time window
// 	// const [defaultTime, setDefaultTime] = useState("24h"); // Valor por defecto
// 	// const [customRange, setCustomRange] = useState([
// 	// 	{
// 	// 		startDate: new Date(),
// 	// 		endDate: new Date(),
// 	// 		key: "selection",
// 	// 	},
// 	// ]);

// 	// Cambiar imagen
// 	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// 		const file = e.target.files?.[0];
// 		if (file) {
// 			const imageUrl = URL.createObjectURL(file);
// 			setProfileImage(imageUrl);
// 		}
// 	};

// 	const handleSave = () => {
// 		console.log({
// 			name,
// 			// defaultTime,
// 			pagination,
// 			profileImage,
// 			// customRange: defaultTime === "custom" ? customRange : null,
// 		});
// 		alert("¡Configuraciones guardadas!");
// 	};

// 	const handleGoHome = () => {
// 		router.push("/usuarios");
// 	};

// 	return (
// 		<div className={`${pantallaPrincipalEstilos} flex flex-col items-center h-screen`}>
// 			{/* CONTENIDO PRINCIPAL */}
// 			<div className="w-full max-w-2xl bg-white rounded-xl shadow-lg flex flex-col flex-1 p-6 mb-6">
// 				{/* TABS */}
// 				<div className="flex border-b border-gray-200 mb-4">
// 					{tabs.map((tab) => (
// 						<button
// 							key={tab}
// 							className={`flex-1 py-4 font-medium text-lg transition-colors cursor-pointer ${
// 								activeTab === tab
// 									? "text-main border-b-2 border-main"
// 									: "text-gray-500 hover:text-main"
// 							}`}
// 							onClick={() => setActiveTab(tab)}
// 						>
// 							{tab}
// 						</button>
// 					))}
// 				</div>

// 				{/* CONTENIDO CON ALTURA FIJA Y SCROLL */}
// 				<div className="flex-1 overflow-y-auto h-[calc(100vh-280px)] space-y-6 pr-2">
// 					{activeTab === "Perfil" && (
// 						<div className="space-y-6">
// 							<h1 className="text-xl font-bold text-gray-800">Información de Perfil</h1>

// 							{/* Foto de perfil */}
// 							<div className="flex flex-col items-center gap-4">
// 								<Image
// 									src={profileImage}
// 									alt="Foto de perfil"
// 									width={100}
// 									height={100}
// 									className="rounded-full border-4 border-main shadow-md"
// 								/>
// 								<label className="cursor-pointer text-sm bg-main text-white px-3 py-2 rounded-md hover:bg-opacity-80 transition">
// 									Cambiar foto
// 									<input
// 										type="file"
// 										accept="image/*"
// 										onChange={handleImageChange}
// 										className="hidden"
// 									/>
// 								</label>
// 							</div>

// 							<InputType
// 								inputKey="name"
// 								placeholder="Ingresa tu nombre"
// 								value={name}
// 								onChange={(e) => setName(e.target.value)}
// 							>
// 								Nombre
// 							</InputType>
// 						</div>
// 					)}

// 					{activeTab === "Preferencias" && (
// 						<div className="space-y-6">
// 							<h1 className="text-xl font-bold text-gray-800">Preferencias</h1>

// 							{/* Selector de tiempo por defecto */}
// 							{/* <div>
// 								<label className="block mb-2 text-base font-medium text-gray-900">
// 									Rango de tiempo por defecto
// 								</label>
// 								<select
// 									value={defaultTime}
// 									onChange={(e) => setDefaultTime(e.target.value)}
// 									className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-main"
// 								>
// 									<option value="15m">Últimos 15 minutos</option>
// 									<option value="1h">Última hora</option>
// 									<option value="24h">Últimas 24 horas</option>
// 									<option value="7d">Últimos 7 días</option>
// 									<option value="30d">Últimos 30 días</option>
// 									<option value="custom">Personalizado...</option>
// 								</select>
// 							</div> */}

// 							{/* DateRangePicker si es personalizado */}
// 							{/* {defaultTime === "custom" && (
// 								<div className="mt-4 border border-gray-200 rounded-md p-4">
// 									<DateRange
// 										editableDateInputs={true}
// 										onChange={(item) => setCustomRange([item.selection])}
// 										moveRangeOnFirstSelection={false}
// 										ranges={customRange}
// 										maxDate={new Date()}
// 									/>
// 								</div>
// 							)} */}

// 							{/* Paginación */}
// 							<div>
// 								<label className="block mb-2 text-base font-medium text-gray-900">
// 									Items por página
// 								</label>
// 								<select
// 									value={pagination}
// 									onChange={(e) => setPagination(Number(e.target.value))}
// 									className="border border-gray-300 p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-main"
// 								>
// 									<option value={5}>5</option>
// 									<option value={10}>10</option>
// 									<option value={20}>20</option>
// 									<option value={50}>50</option>
// 								</select>
// 							</div>
// 						</div>
// 					)}

// 					{activeTab === "Seguridad" && (
// 						<div className="space-y-6">
// 							<h1 className="text-xl font-bold text-gray-800">Seguridad</h1>
// 							<InputType
// 								inputKey="password"
// 								inputType="password"
// 								placeholder="Nueva contraseña"
// 								value={password}
// 								onChange={(e) => setPassword(e.target.value)}
// 							>
// 								Cambiar contraseña
// 							</InputType>
// 						</div>
// 					)}
// 				</div>
// 			</div>

// 			{/* BOTONES */}
// 			<div className="flex flex-col sm:flex-row justify-center gap-4 w-full max-w-2xl">
// 				<button
// 					onClick={handleGoHome}
// 					className="cursor-pointer flex items-center justify-center gap-2 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-bold shadow hover:bg-gray-300 transition w-full sm:w-auto"
// 				>
// 					<BiHomeAlt size={18} /> Volver al inicio
// 				</button>

// 				<button
// 					onClick={handleSave}
// 					className="cursor-pointer flex items-center justify-center gap-2 bg-main text-white px-6 py-3 rounded-lg font-bold shadow hover:bg-opacity-90 transition w-full sm:w-auto"
// 				>
// 					<BiSave size={18} /> Guardar Cambios
// 				</button>
// 			</div>
// 		</div>
// 	);
// };

// export default Perfil;
