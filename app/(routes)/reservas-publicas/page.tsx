"use client";

import React, { useState } from "react";
import { FaCalendarAlt, FaBed, FaUsers, FaCheckCircle, FaWifi, FaParking, FaCoffee, FaSignInAlt, FaArrowLeft } from "react-icons/fa";
import Link from "next/link";
import { InputForm, InputDateForm } from "@/components";


interface Habitacion {
  idHabitacion: number;
  numero: number;
  tipo: string;
  precio: number;
  idTipoHabitacion: number;
}

interface FormularioReserva {
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  email: string;
  origen: string;
}

interface FormularioErrores {
  nombre?: string;
  apellido?: string;
  dni?: string;
  telefono?: string;
  email?: string;
  origen?: string;
}

const ReservasPublicasPage = () => {
  // Estados
  const [paso, setPaso] = useState(1);
  const [fechaInicio, setFechaInicio] = useState(""); // formato dd/MM/yyyy
  const [fechaFin, setFechaFin] = useState(""); // formato dd/MM/yyyy
  const [habitacionesDisponibles, setHabitacionesDisponibles] = useState<Habitacion[]>([]);
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState<Habitacion | null>(null);
  const [formulario, setFormulario] = useState<FormularioReserva>({
    nombre: "",
    apellido: "",
    dni: "",
    telefono: "",
    email: "",
    origen: "Argentina",
  });
  const [erroresFormulario, setErroresFormulario] = useState<FormularioErrores>({});
  const [loading, setLoading] = useState(false);
  const [reservaExitosa, setReservaExitosa] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convertir dd/MM/yyyy a yyyy-mm-dd para la API
  const convertirAFormatoAPI = (fechaDDMMYYYY: string): string => {
    if (!fechaDDMMYYYY || fechaDDMMYYYY.length !== 10) return "";
    const [dia, mes, anio] = fechaDDMMYYYY.split("/");
    return `${anio}-${mes}-${dia}`;
  };

  // Calcular noches y precio total
  const calcularNoches = () => {
    if (!fechaInicio || !fechaFin) return 0;
    const [diaI, mesI, anioI] = fechaInicio.split("/").map(Number);
    const [diaF, mesF, anioF] = fechaFin.split("/").map(Number);
    const inicio = new Date(anioI, mesI - 1, diaI);
    const fin = new Date(anioF, mesF - 1, diaF);
    const diff = fin.getTime() - inicio.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const noches = calcularNoches();
  const precioTotal = habitacionSeleccionada ? habitacionSeleccionada.precio * noches : 0;

  // Buscar habitaciones disponibles
  const buscarHabitaciones = async () => {
    if (!fechaInicio || !fechaFin) {
      setError("Por favor selecciona ambas fechas");
      return;
    }

    const [diaI, mesI, anioI] = fechaInicio.split("/").map(Number);
    const [diaF, mesF, anioF] = fechaFin.split("/").map(Number);
    const inicio = new Date(anioI, mesI - 1, diaI);
    const fin = new Date(anioF, mesF - 1, diaF);

    if (fin <= inicio) {
      setError("La fecha de salida debe ser posterior a la fecha de entrada");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const fechaInicioAPI = convertirAFormatoAPI(fechaInicio);
      const fechaFinAPI = convertirAFormatoAPI(fechaFin);
      const response = await fetch(
        `${apiUrl}/api/public/habitaciones/disponibles?fechaInicio=${fechaInicioAPI}&fechaFin=${fechaFinAPI}`
      );
      
      if (!response.ok) {
        throw new Error("Error al buscar habitaciones");
      }

      const data = await response.json();
      
      if (data.habitaciones && data.habitaciones.length === 0) {
        setError("No hay habitaciones disponibles para las fechas seleccionadas");
        setHabitacionesDisponibles([]);
        return;
      }

      // Mapear la respuesta al formato esperado
      const habitacionesFormateadas: Habitacion[] = data.habitaciones.map((h: any) => ({
        idHabitacion: h.idHabitacion,
        numero: h.numero,
        tipo: h.tipo,
        precio: h.precio,
        idTipoHabitacion: h.idTipoHabitacion,
      }));
      
      setHabitacionesDisponibles(habitacionesFormateadas);
      setPaso(2);
    } catch (err) {
      setError("Error al buscar habitaciones disponibles. Por favor intenta nuevamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Seleccionar habitación y pasar al formulario
  const seleccionarHabitacion = (habitacion: Habitacion) => {
    setHabitacionSeleccionada(habitacion);
    setPaso(3);
  };

  // Validar campo individual
  const validarCampo = (campo: keyof FormularioReserva, valor: string): string | undefined => {
    switch (campo) {
      case "nombre":
      case "apellido":
        if (!valor.trim()) return "Este campo es obligatorio";
        if (valor.trim().length < 2) return "Debe tener al menos 2 caracteres";
        if (!/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/.test(valor)) return "Solo se permiten letras";
        return undefined;

      case "dni":
        if (!valor.trim()) return "El DNI es obligatorio";
        if (!/^\d{7,8}$/.test(valor.trim())) return "El DNI debe tener 7 u 8 dígitos";
        return undefined;

      case "telefono":
        if (!valor.trim()) return "El teléfono es obligatorio";
        if (!/^[\d\s\-\+\(\)]{8,20}$/.test(valor.trim())) return "Formato de teléfono inválido";
        return undefined;

      case "email":
        if (!valor.trim()) return "El email es obligatorio";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(valor.trim())) return "Email inválido";
        return undefined;

      case "origen":
        if (!valor.trim()) return "El país de origen es obligatorio";
        if (valor.trim().length < 2) return "Debe tener al menos 2 caracteres";
        return undefined;

      default:
        return undefined;
    }
  };

  // Validar todos los campos del formulario
  const validarFormulario = (): boolean => {
    const errores: FormularioErrores = {};
    let esValido = true;

    (Object.keys(formulario) as Array<keyof FormularioReserva>).forEach((campo) => {
      const error = validarCampo(campo, formulario[campo]);
      if (error) {
        errores[campo] = error;
        esValido = false;
      }
    });

    setErroresFormulario(errores);
    return esValido;
  };

  // Manejar cambio en campos del formulario
  const handleCampoChange = (campo: keyof FormularioReserva, valor: string) => {
    setFormulario({ ...formulario, [campo]: valor });
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (erroresFormulario[campo]) {
      setErroresFormulario({ ...erroresFormulario, [campo]: undefined });
    }
  };

  // Enviar reserva
  const enviarReserva = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!habitacionSeleccionada) return;

    // Validar formulario antes de enviar
    if (!validarFormulario()) {
      setError("Por favor corregí los errores en el formulario");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const fechaInicioAPI = convertirAFormatoAPI(fechaInicio);
      const fechaFinAPI = convertirAFormatoAPI(fechaFin);
      const response = await fetch(`${apiUrl}/api/public/reservas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          huesped: formulario,
          idHabitacion: habitacionSeleccionada.idHabitacion,
          fechaDesde: fechaInicioAPI,
          fechaHasta: fechaFinAPI,
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear la reserva");
      }
      
      setReservaExitosa(true);
      setPaso(4);
    } catch (err: any) {
      setError(err.message || "Error al procesar la reserva. Por favor intenta nuevamente.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const reiniciar = () => {
    setPaso(1);
    setFechaInicio("");
    setFechaFin("");
    setHabitacionesDisponibles([]);
    setHabitacionSeleccionada(null);
    setFormulario({
      nombre: "",
      apellido: "",
      dni: "",
      telefono: "",
      email: "",
      origen: "Argentina",
    });
    setErroresFormulario({});
    setReservaExitosa(false);
    setError(null);
  };

  // Volver al paso anterior
  const volverPasoAnterior = () => {
    if (paso > 1) {
      setPaso(paso - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background from-tertiary via-background to-secondary-light">
      {/* Header Público */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaBed className="text-main text-4xl" />
            <div>
              <h1 className="text-2xl font-bold text-main">Posada Dormis</h1>
              <p className="text-sm text-muted">Mina Clavero - Córdoba</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Link 
              href="/login"
              className="flex items-center gap-2 bg-main hover:bg-main-dark text-white font-semibold px-4 py-2 rounded-lg transition-all transform hover:scale-105"
            >
              <FaSignInAlt />
              <span>Ingresar</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-grayed shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {[
              { num: 1, label: "Fechas" },
              { num: 2, label: "Habitación" },
              { num: 3, label: "Datos" },
              { num: 4, label: "Confirmación" }
            ].map((item, idx) => (
              <React.Fragment key={item.num}>
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    paso >= item.num 
                      ? "bg-main text-white scale-110" 
                      : "bg-grayed text-gray-600"
                  }`}>
                    {paso > item.num ? <FaCheckCircle /> : item.num}
                  </div>
                  <span className={`text-xs mt-2 ${paso >= item.num ? "text-main font-semibold" : "text-muted"}`}>
                    {item.label}
                  </span>
                </div>
                {idx < 3 && (
                  <div className={`flex-1 h-1 mx-2 rounded transition-all ${
                    paso > item.num ? "bg-main" : "bg-grayed"
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <main className="container mx-auto px-4 py-12">
        {/* Paso 1: Selección de Fechas */}
        {paso === 1 && (
          <div className="max-w-2xl mx-auto animate-fade-in relative">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 min-h-[600px] flex flex-col">
              <div className="text-center mb-8">
                <FaCalendarAlt className="text-5xl text-main mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-text mb-2">
                  ¿Cuándo querés hospedarte?
                </h2>
                <p className="text-muted">Seleccioná las fechas de tu estadía</p>
              </div>

              <div className="space-y-6 flex-1">
                <InputDateForm
                  inputKey="fechaInicio"
                  label="Fecha de entrada *"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  minDate={new Date()}
                />

                <InputDateForm
                  inputKey="fechaFin"
                  label="Fecha de salida *"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  minDate={fechaInicio ? (() => {
                    const [dia, mes, anio] = fechaInicio.split("/").map(Number);
                    return new Date(anio, mes - 1, dia);
                  })() : new Date()}
                />

                {noches > 0 && (
                  <div className="bg-tertiary p-4 rounded-lg">
                    <p className="text-center text-main font-semibold">
                      {noches} {noches === 1 ? "noche" : "noches"}
                    </p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  onClick={buscarHabitaciones}
                  disabled={loading || !fechaInicio || !fechaFin}
                  className="w-full bg-main hover:bg-main-dark text-white font-bold py-4 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                >
                  {loading ? "Buscando..." : "Buscar habitaciones disponibles"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Paso 2: Selección de Habitación */}
        {paso === 2 && (
          <div className="max-w-5xl mx-auto animate-fade-in relative">
            {/* Botón volver al paso anterior */}
            <button
              onClick={volverPasoAnterior}
              className="absolute top-4 right-4 z-10 bg-white hover:bg-main hover:text-white text-main p-3 rounded-full shadow-lg transition-all transform hover:scale-110"
              title="Volver al paso anterior"
            >
              <FaArrowLeft />
            </button>

            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 min-h-[600px] flex flex-col">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-text mb-2">
                  Habitaciones disponibles
                </h2>
                <p className="text-muted">
                  Del {fechaInicio} al {fechaFin} ({noches} {noches === 1 ? "noche" : "noches"})
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 flex-1">
                {habitacionesDisponibles.map((habitacion) => (
                  <div
                    key={habitacion.idHabitacion}
                    className="bg-grayed rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 h-fit"
                    onClick={() => seleccionarHabitacion(habitacion)}
                  >
                    <div className="bg-gradient-to-br from-main to-main-dark p-8 text-white text-center">
                      <FaBed className="text-5xl mx-auto mb-2" />
                      <h3 className="text-2xl font-bold">Habitación {habitacion.numero}</h3>
                      <p className="text-sm opacity-90">{habitacion.tipo}</p>
                    </div>
                    <div className="p-6 bg-white">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-muted">
                          <FaUsers />
                          <span className="text-sm">2-4 personas</span>
                        </div>
                      </div>
                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-muted text-sm">Precio por noche</span>
                          <span className="text-xl font-bold text-main">
                            ${habitacion.precio.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-text font-semibold">Total {noches} {noches === 1 ? "noche" : "noches"}</span>
                          <span className="text-2xl font-bold text-main">
                            ${(habitacion.precio * noches).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => seleccionarHabitacion(habitacion)}
                        className="w-full mt-4 bg-main hover:bg-main-dark text-white font-bold py-3 px-4 rounded-lg transition-all"
                      >
                        Seleccionar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Paso 3: Formulario de Datos */}
        {paso === 3 && habitacionSeleccionada && (
          <div className="max-w-4xl mx-auto animate-fade-in relative">
            {/* Botón volver al paso anterior */}
            <button
              onClick={volverPasoAnterior}
              className="absolute top-4 right-4 z-10 bg-white hover:bg-main hover:text-white text-main p-3 rounded-full shadow-lg transition-all transform hover:scale-110"
              title="Volver al paso anterior"
            >
              <FaArrowLeft />
            </button>

            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 min-h-[600px]">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Resumen */}
                <div className="md:col-span-1">
                  <div className="bg-grayed rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-text mb-4">Resumen</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted">Habitación</span>
                        <span className="font-semibold">{habitacionSeleccionada.numero}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Tipo</span>
                        <span className="font-semibold">{habitacionSeleccionada.tipo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Entrada</span>
                        <span className="font-semibold">
                          {fechaInicio}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Salida</span>
                        <span className="font-semibold">
                          {fechaFin}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Noches</span>
                        <span className="font-semibold">{noches}</span>
                      </div>
                      <div className="border-t pt-3 flex justify-between items-center">
                        <span className="font-bold text-text">Total</span>
                        <span className="text-2xl font-bold text-main">
                          ${precioTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Formulario */}
                <div className="md:col-span-2">
                  <form onSubmit={enviarReserva} className="bg-grayed rounded-xl shadow-lg p-8">
                    <h3 className="text-2xl font-bold text-text mb-6">
                      Tus datos
                    </h3>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <InputForm
                          inputKey="nombre"
                          InputForm="text"
                          placeholder="Ej: Juan"
                          value={formulario.nombre}
                          onChange={(e) => handleCampoChange("nombre", e.target.value)}
                          error={erroresFormulario.nombre}
                        >
                          Nombre *
                        </InputForm>
                      </div>

                      <div>
                        <InputForm
                          inputKey="apellido"
                          InputForm="text"
                          placeholder="Ej: Pérez"
                          value={formulario.apellido}
                          onChange={(e) => handleCampoChange("apellido", e.target.value)}
                          error={erroresFormulario.apellido}
                        >
                          Apellido *
                        </InputForm>
                      </div>

                      <div>
                        <InputForm
                          inputKey="dni"
                          InputForm="text"
                          placeholder="Ej: 12345678"
                          value={formulario.dni}
                          onChange={(e) => handleCampoChange("dni", e.target.value)}
                          error={erroresFormulario.dni}
                        >
                          DNI *
                        </InputForm>
                      </div>

                      <div>
                        <InputForm
                          inputKey="telefono"
                          InputForm="tel"
                          placeholder="Ej: +54 351 123-4567"
                          value={formulario.telefono}
                          onChange={(e) => handleCampoChange("telefono", e.target.value)}
                          error={erroresFormulario.telefono}
                        >
                          Teléfono *
                        </InputForm>
                      </div>

                      <div className="md:col-span-2">
                        <InputForm
                          inputKey="email"
                          InputForm="email"
                          placeholder="Ej: juan.perez@email.com"
                          value={formulario.email}
                          onChange={(e) => handleCampoChange("email", e.target.value)}
                          error={erroresFormulario.email}
                        >
                          Email *
                        </InputForm>
                      </div>

                      <div className="md:col-span-2">
                        <InputForm
                          inputKey="origen"
                          InputForm="text"
                          placeholder="Ej: Argentina"
                          value={formulario.origen}
                          onChange={(e) => handleCampoChange("origen", e.target.value)}
                          error={erroresFormulario.origen}
                        >
                          País de origen *
                        </InputForm>
                      </div>
                    </div>

                    {error && (
                      <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                      </div>
                    )}

                    <div className="mt-6 flex gap-4">
                      <button
                        type="button"
                        onClick={() => setPaso(2)}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-text font-bold py-3 px-6 rounded-lg transition-all"
                      >
                        ← Volver
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-main hover:bg-main-dark text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? "Procesando..." : "Confirmar reserva"}
                      </button>
                    </div>

                    <p className="text-xs text-muted mt-4 text-center">
                      Al confirmar, tu reserva quedará en estado pendiente hasta que la administración la valide.
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Paso 4: Confirmación */}
        {paso === 4 && reservaExitosa && (
          <div className="max-w-2xl mx-auto animate-fade-in relative">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 min-h-[600px] flex flex-col justify-center text-center">
              <div className="inline-block animate-bounce-in mx-auto">
                <FaCheckCircle className="text-7xl text-success mb-6" />
              </div>

              <h2 className="text-3xl font-bold text-text mb-4">
                ¡Reserva solicitada con éxito!
              </h2>
              
              <p className="text-muted mb-6">
                Tu reserva ha sido registrada y está en estado <strong className="text-main">PENDIENTE</strong>.
              </p>

              <div className="bg-tertiary rounded-lg p-6 mb-6 text-left">
                <h3 className="font-bold text-text mb-3">Próximos pasos:</h3>
                <ol className="space-y-2 text-sm text-muted list-decimal list-inside">
                  <li>La administración revisará tu reserva</li>
                  <li>Recibirás un email con las instrucciones de pago</li>
                  <li>Una vez confirmado el pago, tu reserva será confirmada</li>
                </ol>
              </div>

              <div className="bg-grayed rounded-lg p-4 mb-6 text-sm text-left">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-muted block">Habitación</span>
                    <span className="font-semibold">{habitacionSeleccionada?.numero}</span>
                  </div>
                  <div>
                    <span className="text-muted block">Noches</span>
                    <span className="font-semibold">{noches}</span>
                  </div>
                  <div>
                    <span className="text-muted block">Entrada</span>
                    <span className="font-semibold">
                      {fechaInicio}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted block">Salida</span>
                    <span className="font-semibold">
                      {fechaFin}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={reiniciar}
                className="w-full bg-main hover:bg-main-dark text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 active:scale-95"
              >
                Hacer otra reserva
              </button>

              <p className="text-xs text-muted mt-4">
                Recibirás un correo electrónico con todos los detalles a {formulario.email}
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ReservasPublicasPage;

