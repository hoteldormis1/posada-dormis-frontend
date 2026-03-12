"use client";

import React, { useState } from "react";
import { FaCalendarAlt, FaBed, FaUsers, FaCheckCircle, FaWifi, FaParking, FaCoffee, FaSignInAlt, FaArrowLeft } from "react-icons/fa";
import Link from "next/link";
import PhoneInput, { isValidPhoneNumber } from "@/components/forms/formComponents/PhoneInput";


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
  direccion: string;
}

interface FormularioErrores {
  nombre?: string;
  apellido?: string;
  dni?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
}

type DniLookupEstado = "idle" | "buscando" | "encontrado" | "confirmando" | "verificado" | "no_encontrado" | "error";

const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const DAYS = ["Lu","Ma","Mi","Ju","Vi","Sa","Do"];
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDay(year: number, month: number) {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

function parseDDMMYYYY(dateString: string): Date | null {
  if (!dateString || dateString.length !== 10) return null;
  const [dd, mm, yyyy] = dateString.split("/").map(Number);
  const parsed = new Date(yyyy, mm - 1, dd);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function formatDDMMYYYY(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

type MiniCalendarProps = {
  selected?: string;
  onSelect: (d: Date) => void;
  minDate?: Date;
  label: string;
};

function MiniCalendar({ selected, onSelect, minDate, label }: MiniCalendarProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDay(viewYear, viewMonth);
  const cells = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));
  const selectedDate = parseDDMMYYYY(selected ?? "");

  const isSelected = (d: number | null) =>
    !!selectedDate &&
    !!d &&
    selectedDate.getDate() === d &&
    selectedDate.getMonth() === viewMonth &&
    selectedDate.getFullYear() === viewYear;

  const isDisabled = (d: number | null) => {
    if (!d) return false;
    const date = new Date(viewYear, viewMonth, d);
    if (minDate) {
      return date < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
    }
    return date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };

  const isToday = (d: number | null) =>
    !!d &&
    d === today.getDate() &&
    viewMonth === today.getMonth() &&
    viewYear === today.getFullYear();

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
      return;
    }
    setViewMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
      return;
    }
    setViewMonth((m) => m + 1);
  };

  return (
    <div className="flex-1">
      <p className="text-[11px] font-semibold tracking-[1px] uppercase text-white/45 mb-2.5">{label}</p>
      <div className="bg-white/5 border border-white/12 rounded-2xl p-4 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={prevMonth}
            className="h-7 w-7 rounded-md bg-white/8 text-white/70 hover:bg-white/16 transition-colors cursor-pointer"
          >
            ‹
          </button>
          <span className="text-sm font-semibold text-white">
            {MONTHS[viewMonth]} {viewYear}
          </span>
          <button
            type="button"
            onClick={nextMonth}
            className="h-7 w-7 rounded-md bg-white/8 text-white/70 hover:bg-white/16 transition-colors cursor-pointer"
          >
            ›
          </button>
        </div>

        <div className="grid grid-cols-7 mb-1.5">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-[10px] font-semibold text-white/60 tracking-[0.4px] py-0.5">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0.5">
          {cells.map((d, i) => {
            const selectedCell = isSelected(d);
            const disabledCell = isDisabled(d);
            const todayCell = isToday(d);
            return (
              <button
                key={`day-${i}`}
                type="button"
                disabled={!d || disabledCell}
                onClick={() => d && onSelect(new Date(viewYear, viewMonth, d))}
                className={`h-8 rounded-md text-xs transition-colors ${
                  selectedCell
                    ? "bg-emerald-400 text-[#0a2318] font-bold"
                    : todayCell
                    ? "text-emerald-300 border border-emerald-300/35 bg-emerald-400/10"
                    : disabledCell
                    ? "text-white/20 cursor-not-allowed"
                    : "text-white/75 hover:bg-white/10 cursor-pointer"
                }`}
              >
                {d ?? ""}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const ReservasPublicasPage = () => {
  const [paso, setPaso] = useState(1);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [habitacionesDisponibles, setHabitacionesDisponibles] = useState<Habitacion[]>([]);
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState<Habitacion | null>(null);
  const [formulario, setFormulario] = useState<FormularioReserva>({
    nombre: "",
    apellido: "",
    dni: "",
    telefono: "",
    email: "",
    direccion: "",
  });
  const [erroresFormulario, setErroresFormulario] = useState<FormularioErrores>({});
  const [loading, setLoading] = useState(false);
  const [reservaExitosa, setReservaExitosa] = useState(false);
  const [emailConfirmacion, setEmailConfirmacion] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // ── DNI lookup state ──────────────────────────────────────────────────────
  const [dniLookupEstado, setDniLookupEstado] = useState<DniLookupEstado>("idle");
  const [dniLookupInput, setDniLookupInput] = useState("");
  const [telefonoConfirmar, setTelefonoConfirmar] = useState("");
  const [dniLookupError, setDniLookupError] = useState<string | null>(null);
  const [huespedPreloaded, setHuespedPreloaded] = useState(false);
  const [idHuespedPreloaded, setIdHuespedPreloaded] = useState<number | null>(null);

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

    const nochesCalc = Math.round((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
    if (nochesCalc < 2) {
      setError("La estadía mínima es de 2 noches");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL ;
      const fechaInicioAPI = convertirAFormatoAPI(fechaInicio);
      const fechaFinAPI = convertirAFormatoAPI(fechaFin);
      const response = await fetch(
        `${apiUrl}/public/habitaciones/disponibles?fechaInicio=${fechaInicioAPI}&fechaFin=${fechaFinAPI}`
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
        if (!/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s'-]+$/.test(valor)) return "Solo se permiten letras";
        return undefined;

      case "dni": {
        const raw = valor.replace(/\D/g, "");
        if (!raw) return "El DNI es obligatorio";
        if (raw.length < 7 || raw.length > 8) return "El DNI debe tener 7 u 8 dígitos numéricos";
        return undefined;
      }

      case "telefono": {
        if (!valor.trim()) return "El teléfono es obligatorio";
        if (!isValidPhoneNumber(valor.trim()))
          return "Ingresá un teléfono válido con prefijo de país";
        return undefined;
      }

      case "email":
        if (!valor.trim()) return "El email es obligatorio";
        if (!EMAIL_RE.test(valor.trim()) || /\.\./.test(valor.trim()))
          return "Ingresá un email válido (ej: juan@gmail.com)";
        return undefined;

      case "direccion":
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

  const handleCampoChange = (campo: keyof FormularioReserva, valor: string) => {
    setFormulario({ ...formulario, [campo]: valor });
    if (erroresFormulario[campo]) {
      setErroresFormulario({ ...erroresFormulario, [campo]: undefined });
    }
  };

  // ── DNI lookup handlers ───────────────────────────────────────────────────
  const buscarPorDni = async () => {
    const dni = dniLookupInput.replace(/\D/g, "");
    if (!dni || dni.length < 7 || dni.length > 8) {
      setDniLookupError("Ingresá un DNI válido de 7 u 8 dígitos");
      return;
    }
    setDniLookupEstado("buscando");
    setDniLookupError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const res = await fetch(`${apiUrl}/public/huespedes/buscar-dni`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dni }),
      });
      const data = await res.json();
      if (res.status === 403 && data.code === "DNI_BLACKLISTED") {
        setDniLookupEstado("idle");
        setDniLookupError("Este DNI tiene restricciones de ingreso en esta posada. No es posible realizar una reserva.");
        return;
      }
      if (data.encontrado) {
        setDniLookupEstado("encontrado");
        setFormulario((f) => ({ ...f, dni }));
      } else {
        setDniLookupEstado("no_encontrado");
        setFormulario((f) => ({ ...f, dni }));
      }
    } catch {
      setDniLookupEstado("idle");
      setDniLookupError("No se pudo conectar con el servidor. Intentá de nuevo.");
    }
  };

  const confirmarTelefono = async () => {
    const telefono = telefonoConfirmar.trim();
    if (!telefono) {
      setDniLookupError("Ingresá tu número de teléfono");
      return;
    }
    setDniLookupEstado("confirmando");
    setDniLookupError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const res = await fetch(`${apiUrl}/public/huespedes/verificar-telefono`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dni: formulario.dni, telefono }),
      });
      if (res.status === 401 || res.status === 404) {
        setDniLookupEstado("error");
        setDniLookupError("El teléfono no coincide con el registrado. Revisalo o ingresá tus datos manualmente.");
        return;
      }
      const data = await res.json();
      setFormulario({
        nombre: data.nombre ?? "",
        apellido: data.apellido ?? "",
        dni: String(data.dni),
        telefono: data.telefono ?? "",
        email: data.email ?? "",
        direccion: data.direccion ?? "",
      });
      setHuespedPreloaded(true);
      setIdHuespedPreloaded(data.idHuesped ?? null);
      setDniLookupEstado("verificado");
      setErroresFormulario({});
    } catch {
      setDniLookupEstado("error");
      setDniLookupError("Error al verificar. Intentá de nuevo.");
    }
  };

  const ingresarManualmente = () => {
    setDniLookupEstado("no_encontrado");
    setDniLookupError(null);
    setHuespedPreloaded(false);
    setIdHuespedPreloaded(null);
    setFormulario({ nombre: "", apellido: "", dni: dniLookupInput.replace(/\D/g, ""), telefono: "", email: "", direccion: "" });
    setErroresFormulario({});
  };

  const resetDniLookup = () => {
    setDniLookupEstado("idle");
    setDniLookupInput("");
    setTelefonoConfirmar("");
    setDniLookupError(null);
    setHuespedPreloaded(false);
    setIdHuespedPreloaded(null);
    setFormulario({ nombre: "", apellido: "", dni: "", telefono: "", email: "", direccion: "" });
    setErroresFormulario({});
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
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const fechaInicioAPI = convertirAFormatoAPI(fechaInicio);
      const fechaFinAPI = convertirAFormatoAPI(fechaFin);
      const response = await fetch(`${apiUrl}/public/reservas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          huesped: {
            ...formulario,
            dni: formulario.dni.replace(/\D/g, ""),
            origen: "Argentina",
            ...(idHuespedPreloaded ? { idHuesped: idHuespedPreloaded } : {}),
          },
          idHabitacion: habitacionSeleccionada.idHabitacion,
          fechaDesde: fechaInicioAPI,
          fechaHasta: fechaFinAPI,
        })
      });

      const data = await response.json();

      if (!response.ok) {
        const errMsg =
          response.status === 403 && data.code === "DNI_BLACKLISTED"
            ? "Este DNI tiene restricciones de ingreso en esta posada. No es posible completar la reserva."
            : (data.error || "Error al crear la reserva");
        throw new Error(errMsg);
      }

      setEmailConfirmacion(data.email ?? formulario.email);
      setReservaExitosa(true);
      setPaso(4);
    } catch (err: any) {
      const msg: string = err.message || "";
      // Si el back devuelve error de mínimo de noches, volver al paso 1 limpiamente
      if (msg.includes("mínima") || msg.includes("2 noches")) {
        setFechaInicio("");
        setFechaFin("");
        setHabitacionSeleccionada(null);
        setHabitacionesDisponibles([]);
        setPaso(1);
      } else {
        setError(msg || "Error al procesar la reserva. Por favor intenta nuevamente.");
      }
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
    setFormulario({ nombre: "", apellido: "", dni: "", telefono: "", email: "", direccion: "" });
    setErroresFormulario({});
    setReservaExitosa(false);
    setEmailConfirmacion("");
    setError(null);
    setDniLookupEstado("idle");
    setDniLookupInput("");
    setTelefonoConfirmar("");
    setDniLookupError(null);
    setHuespedPreloaded(false);
  };

  // Volver al paso anterior
  const volverPasoAnterior = () => {
    if (paso > 1) {
      if (paso === 3) {
        setDniLookupEstado("idle");
        setDniLookupInput("");
        setTelefonoConfirmar("");
        setDniLookupError(null);
        setHuespedPreloaded(false);
        setFormulario({ nombre: "", apellido: "", dni: "", telefono: "", email: "", direccion: "" });
        setErroresFormulario({});
      }
      setPaso(paso - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(160deg,#0a2318_0%,#0d3320_40%,#1a4a2e_70%,#0f2d1e_100%)] text-white">
      {/* Header Público */}
      <header className="sticky top-0 z-50 border-b border-white/10 backdrop-blur-md bg-black/20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl border border-emerald-400/30 bg-emerald-400/15 flex items-center justify-center">
              <FaBed className="text-emerald-300 text-xl" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Posada Dormi&apos;s</h1>
              <p className="text-xs text-white/50">Mina Clavero · Córdoba</p>
            </div>
          </div>
          <Link
            href="/login"
            className="flex items-center gap-2 bg-emerald-400 hover:bg-emerald-300 text-[#0a2318] font-semibold px-4 py-2 rounded-lg transition-all"
          >
            <FaSignInAlt />
            <span>Ingresar</span>
          </Link>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: "Fechas" },
              { num: 2, label: "Habitación" },
              { num: 3, label: "Datos" },
              { num: 4, label: "Confirmación" }
            ].map((item, idx) => (
              <React.Fragment key={item.num}>
                <div className="flex flex-col items-center min-w-[70px]">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    paso >= item.num
                      ? "bg-emerald-400 text-[#0a2318]"
                      : "bg-white/10 text-white/40 border border-white/15"
                  }`}>
                    {paso > item.num ? <FaCheckCircle /> : item.num}
                  </div>
                  <span className={`text-[11px] mt-2 ${paso >= item.num ? "text-emerald-300 font-semibold" : "text-white/35"}`}>
                    {item.label}
                  </span>
                </div>
                {idx < 3 && (
                  <div className={`flex-1 h-px mx-2 ${paso > item.num ? "bg-emerald-300/70" : "bg-white/15"}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Paso 1: Selección de Fechas */}
        {paso === 1 && (
          <div className="max-w-2xl mx-auto animate-fade-in relative">
            <div className="bg-white/6 border border-white/15 rounded-2xl shadow-xl p-8 md:p-12 min-h-[600px] flex flex-col backdrop-blur-md">
              <div className="text-center mb-8">
                <FaCalendarAlt className="text-5xl text-emerald-300 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-white mb-2">
                  ¿Cuándo querés hospedarte?
                </h2>
                <p className="text-white/60">Seleccioná las fechas de tu estadía</p>
              </div>

              <div className="space-y-6 flex-1">
                <div className="grid md:grid-cols-2 gap-5">
                  <MiniCalendar
                    label="Fecha de entrada"
                    selected={fechaInicio}
                    onSelect={(d) => {
                      setFechaInicio(formatDDMMYYYY(d));
                      setError(null);
                      // Limpiar salida si queda a menos de 2 noches de la nueva entrada
                      const salidaActual = parseDDMMYYYY(fechaFin);
                      if (salidaActual) {
                        const minSalida = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 2);
                        if (salidaActual < minSalida) {
                          setFechaFin("");
                        }
                      }
                    }}
                  />
                  <MiniCalendar
                    label="Fecha de salida"
                    selected={fechaFin}
                    onSelect={(d) => { setFechaFin(formatDDMMYYYY(d)); setError(null); }}
                    minDate={fechaInicio ? (() => {
                      const entrada = parseDDMMYYYY(fechaInicio);
                      if (!entrada) return new Date();
                      // Mínimo 2 noches: la salida más temprana posible es entrada + 2 días
                      return new Date(entrada.getFullYear(), entrada.getMonth(), entrada.getDate() + 2);
                    })() : undefined}
                  />
                </div>

                {noches > 0 && (
                  <div className="bg-emerald-400/15 border border-emerald-300/25 p-4 rounded-lg">
                    <p className="text-center text-emerald-200 font-semibold">
                      {noches} {noches === 1 ? "noche" : "noches"}
                    </p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-500/15 border border-red-400/40 text-red-200 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <button
                  onClick={buscarHabitaciones}
                  disabled={loading || !fechaInicio || !fechaFin}
                  className="w-full bg-emerald-400 hover:bg-emerald-300 text-[#0a2318] font-bold py-4 px-6 rounded-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? "Buscando..." : "Buscar habitaciones disponibles →"}
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
              className="absolute top-4 right-4 z-10 bg-white hover:bg-main hover:text-white text-main p-3 rounded-full shadow-lg transition-all transform hover:scale-110 cursor-pointer"
              title="Volver al paso anterior"
            >
              <FaArrowLeft />
            </button>

            <div className="bg-white/6 border border-white/15 rounded-2xl shadow-xl p-8 md:p-12 min-h-[600px] flex flex-col backdrop-blur-md">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">
                  Habitaciones disponibles
                </h2>
                <p className="text-white/60">
                  Del {fechaInicio} al {fechaFin} ({noches} {noches === 1 ? "noche" : "noches"})
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 flex-1">
                {habitacionesDisponibles.map((habitacion) => (
                  <div
                    key={habitacion.idHabitacion}
                    className="bg-white/6 border border-white/15 rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-2xl hover:scale-[1.02] hover:border-emerald-300/35 hover:bg-emerald-400/5 transition-all duration-300 h-fit"
                    onClick={() => seleccionarHabitacion(habitacion)}
                  >
                    <div className="h-[130px] relative flex items-center justify-center text-white border-b border-white/10 bg-[linear-gradient(135deg,rgba(15,35,25,0.95),rgba(10,50,30,0.85))]">
                      <span className="absolute top-3.5 left-4 text-[11px] font-bold tracking-[1.2px] uppercase text-white/35">
                        N° {String(habitacion.numero).padStart(2, "0")}
                      </span>
                      <FaBed className="text-4xl relative z-10" />
                    </div>
                    <div className="p-6 bg-black/20">
                      <h3 className="text-lg font-bold text-white tracking-tight">Habitación {habitacion.numero}</h3>
                      <p className="text-[12px] text-white/45 mt-0.5 mb-4">{habitacion.tipo}</p>
                      <div className="border-t border-white/10 pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white/60 text-sm">Precio por noche</span>
                          <span className="text-xl font-bold text-emerald-300 font-mono">
                            ${habitacion.precio.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white font-semibold">Total {noches} {noches === 1 ? "noche" : "noches"}</span>
                          <span className="text-2xl font-bold text-emerald-300">
                            ${(habitacion.precio * noches).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => seleccionarHabitacion(habitacion)}
                        className="cursor-pointer w-full mt-5 rounded-xl py-3 px-4 font-bold transition-all border border-white/15 bg-white/8 text-white/85 hover:bg-emerald-400/15 hover:border-emerald-300/35 hover:text-emerald-200"
                      >
                        Seleccionar habitación
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
              className="absolute top-4 right-4 z-10 bg-white hover:bg-main hover:text-white text-main p-3 rounded-full shadow-lg transition-all transform hover:scale-110 cursor-pointer"
              title="Volver al paso anterior"
            >
              <FaArrowLeft />
            </button>

            <div className="bg-white/6 border border-white/15 rounded-2xl shadow-xl p-8 md:p-12 min-h-[600px] backdrop-blur-md">
              <div className="grid md:grid-cols-3 gap-6">
                {/* Resumen */}
                <div className="md:col-span-1">
                  <div className="bg-white/6 border border-white/15 rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Resumen</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">Habitación</span>
                        <span className="font-semibold">{habitacionSeleccionada.numero}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Tipo</span>
                        <span className="font-semibold">{habitacionSeleccionada.tipo}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Entrada</span>
                        <span className="font-semibold">
                          {fechaInicio}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Salida</span>
                        <span className="font-semibold">
                          {fechaFin}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Noches</span>
                        <span className="font-semibold">{noches}</span>
                      </div>
                      <div className="border-t pt-3 flex justify-between items-center">
                        <span className="font-bold text-white">Total</span>
                        <span className="text-2xl font-bold text-emerald-300">
                          ${precioTotal.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Formulario */}
                <div className="md:col-span-2">
                  <form onSubmit={enviarReserva} className="bg-white/6 border border-white/15 rounded-xl shadow-lg p-8">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Tus datos
                    </h3>

                    {/* ── DNI Lookup Widget ──────────────────────────────── */}
                    <div className="mb-6">
                      {/* Estado idle: búsqueda inicial */}
                      {(dniLookupEstado === "idle" || dniLookupEstado === "buscando") && (
                        <div className="bg-white/5 border border-white/12 rounded-xl p-4">
                          <p className="text-xs text-white/50 mb-3 font-medium tracking-wide uppercase">
                            ¿Ya te hospedaste antes? Pre-llenamos tus datos
                          </p>
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="\d*"
                                maxLength={8}
                                placeholder="Ingresá tu DNI"
                                value={dniLookupInput}
                                onChange={(e) => {
                                  setDniLookupInput(e.target.value.replace(/\D/g, ""));
                                  setDniLookupError(null);
                                }}
                                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), buscarPorDni())}
                                className="w-full bg-white/8 border border-white/15 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/35 focus:outline-none focus:border-emerald-400/60 focus:bg-white/10 transition-all"
                              />
                              {dniLookupError && (
                                <p className="text-xs text-red-300 mt-1">{dniLookupError}</p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={buscarPorDni}
                              disabled={dniLookupEstado === "buscando"}
                              className="cursor-pointer bg-emerald-400/15 hover:bg-emerald-400/25 border border-emerald-400/30 text-emerald-300 font-semibold px-4 py-2.5 rounded-lg text-sm transition-all disabled:opacity-50 whitespace-nowrap"
                            >
                              {dniLookupEstado === "buscando" ? "Buscando…" : "Buscar"}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Estado encontrado: confirmar teléfono */}
                      {(dniLookupEstado === "encontrado" || dniLookupEstado === "confirmando" || dniLookupEstado === "error") && (
                        <div className="bg-white/5 border border-emerald-400/20 rounded-xl p-4">
                          {dniLookupEstado !== "error" && (
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-emerald-400 text-sm">✓</span>
                              <p className="text-xs text-emerald-300/80 font-medium">
                                DNI encontrado · Confirmá tu identidad con tu teléfono
                              </p>
                            </div>
                          )}
                          {dniLookupEstado === "error" && (
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-red-400 text-sm">✗</span>
                              <p className="text-xs text-red-300 font-medium">{dniLookupError}</p>
                            </div>
                          )}
                          <div className="flex gap-2">
                            <div className="flex-1">
                              <PhoneInput
                                inputKey="telefonoConfirmar"
                                label="Teléfono registrado"
                                value={telefonoConfirmar}
                                onChange={(e) => {
                                  setTelefonoConfirmar(e.target.value);
                                  setDniLookupError(null);
                                  if (dniLookupEstado === "error") setDniLookupEstado("encontrado");
                                }}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={confirmarTelefono}
                              disabled={dniLookupEstado === "confirmando"}
                              className="cursor-pointer bg-emerald-400/20 hover:bg-emerald-400/30 border border-emerald-400/35 text-emerald-300 font-semibold px-4 py-2.5 rounded-lg text-sm transition-all disabled:opacity-50 whitespace-nowrap"
                            >
                              {dniLookupEstado === "confirmando" ? "Verificando…" : "Confirmar"}
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={ingresarManualmente}
                            className="cursor-pointer underline mt-2.5 text-xs text-white/40 hover:text-white/70 transition-colors underline-offset-2 hover:underline"
                          >
                            Ingresar mis datos manualmente
                          </button>
                        </div>
                      )}

                      {/* Estado verificado: datos pre-llenados */}
                      {dniLookupEstado === "verificado" && (
                        <div className="flex items-center justify-between bg-emerald-400/8 border border-emerald-400/25 rounded-xl px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <span className="text-emerald-400 text-base">✓</span>
                            <div>
                              <p className="text-sm font-semibold text-emerald-300">Identidad verificada</p>
                              <p className="text-xs text-white/45">Datos completados automáticamente · podés editarlos si cambiaron</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={resetDniLookup}
                            className="cursor-pointer text-xs text-white/35 hover:text-white/65 transition-colors ml-4 whitespace-nowrap underline-offset-2 hover:underline"
                          >
                            Reiniciar
                          </button>
                        </div>
                      )}

                      {/* Estado no_encontrado: ingreso manual */}
                      {dniLookupEstado === "no_encontrado" && (
                        <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <span className="text-white/40 text-base">ℹ</span>
                            <p className="text-xs text-white/50">DNI no registrado · Completá tus datos a continuación</p>
                          </div>
                          <button
                            type="button"
                            onClick={resetDniLookup}
                            className="cursor-pointer text-xs text-white/35 hover:text-white/65 transition-colors ml-4 whitespace-nowrap underline-offset-2 hover:underline"
                          >
                            Buscar otro DNI
                          </button>
                        </div>
                      )}
                    </div>
                    {/* ── Fin DNI Lookup ──────────────────────────────────── */}

                    {/* Campos del formulario (visibles solo después del lookup) */}
                    {(dniLookupEstado === "verificado" || dniLookupEstado === "no_encontrado") && (
                      <div className="grid md:grid-cols-2 gap-4">
                        {(["nombre", "apellido"] as const).map((campo) => (
                          <div key={campo}>
                            <label className="block text-xs font-semibold text-white mb-1.5 uppercase tracking-wide">
                              {campo === "nombre" ? "Nombre *" : "Apellido *"}
                            </label>
                            <input
                              type="text"
                              placeholder={campo === "nombre" ? "Ej: Juan" : "Ej: Pérez"}
                              value={formulario[campo]}
                              readOnly={huespedPreloaded}
                              onChange={(e) => !huespedPreloaded && handleCampoChange(campo, e.target.value)}
                              className={`w-full bg-white/8 border rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/35 transition-all focus:outline-none ${
                                huespedPreloaded
                                  ? "border-white/10 opacity-70 cursor-not-allowed"
                                  : erroresFormulario[campo]
                                  ? "border-red-400/60 focus:border-red-400"
                                  : "border-white/15 focus:border-emerald-400/60 focus:bg-white/10"
                              }`}
                            />
                            {erroresFormulario[campo] && (
                              <p className="text-xs text-red-300 mt-1">{erroresFormulario[campo]}</p>
                            )}
                          </div>
                        ))}

                        {!huespedPreloaded && (
                          <div>
                            <label className="block text-xs font-semibold text-white mb-1.5 uppercase tracking-wide">
                              DNI *
                            </label>
                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={8}
                              placeholder="Ej: 12345678"
                              value={formulario.dni}
                              onChange={(e) => handleCampoChange("dni", e.target.value.replace(/\D/g, ""))}
                              className={`w-full bg-white/8 border rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/35 transition-all focus:outline-none ${
                                erroresFormulario.dni
                                  ? "border-red-400/60 focus:border-red-400"
                                  : "border-white/15 focus:border-emerald-400/60 focus:bg-white/10"
                              }`}
                            />
                            {erroresFormulario.dni && (
                              <p className="text-xs text-red-300 mt-1">{erroresFormulario.dni}</p>
                            )}
                          </div>
                        )}

                        <div>
                          <PhoneInput
                            inputKey="telefono"
                            label="Teléfono *"
                            value={formulario.telefono}
                            onChange={(e) => handleCampoChange("telefono", e.target.value)}
                            error={erroresFormulario.telefono}
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-white mb-1.5 uppercase tracking-wide">
                            Email *
                          </label>
                          <input
                            type="email"
                            placeholder="Ej: juan@email.com"
                            value={formulario.email}
                            onChange={(e) => handleCampoChange("email", e.target.value)}
                            className={`w-full bg-white/8 border rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/35 transition-all focus:outline-none ${
                              erroresFormulario.email
                                ? "border-red-400/60 focus:border-red-400"
                                : "border-white/15 focus:border-emerald-400/60 focus:bg-white/10"
                            }`}
                          />
                          {erroresFormulario.email && (
                            <p className="text-xs text-red-300 mt-1">{erroresFormulario.email}</p>
                          )}
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-xs font-semibold text-white mb-1.5 uppercase tracking-wide">
                            Dirección
                          </label>
                          <input
                            type="text"
                            placeholder="Ej: Calle 123, Ciudad"
                            value={formulario.direccion}
                            onChange={(e) => handleCampoChange("direccion", e.target.value)}
                            className="w-full bg-white/8 border border-white/15 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/35 focus:outline-none focus:border-emerald-400/60 focus:bg-white/10 transition-all"
                          />
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="mt-4 bg-red-500/15 border border-red-400/40 text-red-200 px-4 py-3 rounded-lg">
                        {error}
                      </div>
                    )}

                    <div className="mt-5 mb-6 flex gap-3 bg-white/5 border border-white/10 rounded-xl p-3.5">
                      <span className="text-sm">ℹ️</span>
                      <p className="text-xs text-white/55 leading-5">
                        Al confirmar, tu reserva quedará en estado <strong className="text-white/80">pendiente</strong> hasta que la administración la valide.
                      </p>
                    </div>

                    <div className="mt-6 flex gap-4">
                      <button
                        type="button"
                        onClick={() => setPaso(2)}
                        className="bg-white/10 hover:bg-white/15 text-white/85 font-semibold py-3 px-6 rounded-xl transition-all border border-white/20 cursor-pointer"
                      >
                        ← Volver
                      </button>
                      {(dniLookupEstado === "verificado" || dniLookupEstado === "no_encontrado") && (
                        <button
                          type="submit"
                          disabled={loading}
                          className={loading ? "cursor-pointer flex-1 bg-emerald-400 hover:bg-emerald-300 text-[#0a2318] font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_6px_20px_rgba(52,211,153,0.22)]" : "cursor-pointer flex-1 bg-emerald-400 hover:bg-emerald-300 text-[#0a2318] font-bold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_6px_20px_rgba(52,211,153,0.22)]"}
                        >
                          {loading ? "Procesando..." : "Confirmar reserva"}
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Paso 4: Revisá tu email */}
        {paso === 4 && reservaExitosa && (
          <div className="max-w-xl mx-auto animate-fade-in">
            <div className="bg-white/6 border border-white/15 rounded-2xl shadow-xl p-8 md:p-12 flex flex-col items-center text-center backdrop-blur-md">

              {/* Ícono */}
              <div className="w-20 h-20 rounded-2xl bg-blue-400/15 border border-blue-400/25 flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-blue-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5A2.25 2.25 0 012.25 17.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0-9.75 6.75L2.25 6.75" />
                </svg>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">
                Revisá tu email
              </h2>
              <p className="text-white/55 text-sm mb-6 leading-relaxed">
                Te enviamos un mensaje a{" "}
                <strong className="text-blue-300">{emailConfirmacion}</strong>
                {" "}para verificar que fuiste vos quien solicitó la reserva.
              </p>

              {/* Pasos */}
              <div className="w-full space-y-3 mb-7">
                {[
                  { n: 1, texto: "Abrí el email que te enviamos", color: "text-blue-300", border: "border-blue-400/25", bg: "bg-blue-400/8" },
                  { n: 2, texto: "Hacé clic en \"Sí, confirmar mi reserva\"", color: "text-emerald-300", border: "border-emerald-400/25", bg: "bg-emerald-400/8" },
                  { n: 3, texto: "La posada recibirá tu solicitud y te avisará", color: "text-white/60", border: "border-white/10", bg: "bg-white/5" },
                ].map(({ n, texto, color, border, bg }) => (
                  <div key={n} className={`flex items-center gap-3 rounded-xl px-4 py-3 border ${border} ${bg}`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${color} border ${border}`}>
                      {n}
                    </span>
                    <p className={`text-sm ${color}`}>{texto}</p>
                  </div>
                ))}
              </div>

              <p className="text-xs text-white/60 mb-6">
                El enlace del email expira en 4 horas. Confirmalo cuanto antes: la disponibilidad no está garantizada hasta que confirmes. Si no ves el email, revisá spam.
              </p>

              <button
                onClick={reiniciar}
                className="cursor-pointer w-full bg-white/8 hover:bg-white/12 border border-white/15 text-white/75 font-semibold py-3 px-6 rounded-xl transition-all"
              >
                Volver al inicio
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ReservasPublicasPage;

