import React from "react";
import { LoginIzquierda } from "../_components";

const Page = () => {
    return (
        <div
            className="flex flex-col justify-center items-center h-screen w-full bg-cover bg-center"
            style={{ backgroundImage: "url('/carlos_paz.png')" }} // o puede ser una URL externa
        >
            <div className="flex">
                {/* Izquierda: información de la posada */}
				<LoginIzquierda includeDescription={false}/>


                {/* Derecha: formulario de login */}
                <div className="flex flex-col justify-center  w-full md:w-1/2 bg-black bg-opacity-80 p-8 text-white">
                    <h2 className="text-2xl font-semibold mb-6">Ingresar a tu cuenta</h2>
                    <form className="w-full max-w-sm space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                className="w-full px-4 py-2 rounded bg-white text-black focus:outline-none"
                                placeholder="usuario@ejemplo.com"
                            />
                        </div>
                        <div className="flex items-center justify-between gap-4 pt-4">
                            <button
                                type="button"
                                className="w-full bg-[#43AC6A] hover:bg-[#43AC6A] text-white py-2 px-4 rounded transition duration-200"
                            >
                                Enviar email
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Page;
