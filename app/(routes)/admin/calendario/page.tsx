"use client";

import React, { useEffect, useMemo, useCallback, useState, useRef } from "react";
import { pantallaPrincipalEstilos, inputBaseEstilos, labelBaseEstilos } from "@/styles/global-styles";
import { fetchHabitaciones } from "@/lib/store/utils/habitaciones/habitacionesSlice";
import { fetchReservasCalendar } from "@/lib/store/utils/calendario/calendarioSlice";
import { AppDispatch, RootState } from "@/lib/store/store";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { useReservasSocket } from "@/hooks/useReservasSocket";
import { Booking, Room } from "@/components/ui/calendario/Calendario";
import CalendarioContainer from "@/components/ui/calendario/CalendarioContainer";
import { toYMDLocal } from "@/utils/helpers/date";
import { LoadingSpinner, PopupContainer } from "@/components";
import { buildReservaFields } from "@/components/reservas/buildReservaFields";
import { reservaAddSchema } from "@/utils/validations/reservaSchema";
import { addReserva, fetchReservas, fetchHuespedes } from "@/lib/store/utils/index";
import { useToastAlert } from "@/hooks/useToastAlert";
import { getCountryName } from "@/utils/helpers/format";
import { diffNoches, parseDateWithFallbackISO } from "@/utils/helpers/date";
import { getPrecioHabitacion } from "@/utils/helpers/money";
import makeCustomFields from "@/components/reservas/makeCustomFields";
import { Huesped } from "@/models/types/huesped";
import { Option } from "@/components/reservas/types";
import { EstadoReserva } from "@/models/types";
import FormRenderer from "@/components/reservas/FormRenderer";
import { useHuespedFormLogic } from "@/hooks/useHuespedFormLogic";
import DetallesReservaPopup from "@/components/ui/calendario/DetallesReservaPopup";
import EstadoSlider from "@/components/ui/calendario/EstadoSlider";

export default function CalendarioPage() {
  const dispatch: AppDispatch = useAppDispatch();

  const { accessToken } = useAppSelector((state: RootState) => state.user);

  // Ref que guarda el rango visible actual del calendario para usarlo en el socket
  const calRangeRef = useRef({
    startDate: toYMDLocal(new Date()),
    endDate: toYMDLocal(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
  });

  // Siempre apunta al refetch con el rango actual (evita stale closure)
  const refreshRef = useRef<() => void>(() => {});
  useEffect(() => {
    refreshRef.current = () =>
      dispatch(fetchReservasCalendar(calRangeRef.current));
  });

  const refreshCalendarInCurrentRange = useCallback(() => {
    dispatch(fetchReservasCalendar(calRangeRef.current));
  }, [dispatch]);

  // Socket: actualiza el calendario en tiempo real
  useReservasSocket({
    enabled: !!accessToken,
    onNuevaReserva: () => refreshRef.current(),
    onReservaActualizada: () => refreshRef.current(),
  });

  // Cargar habitaciones y datos del calendario - solo si hay token
  useEffect(() => {
    if (!accessToken) return;

    dispatch(fetchHabitaciones({}));
    dispatch(fetchHuespedes()); // Cargar huéspedes para el formulario
    
    // Cargar datos del calendario para el rango actual (próximos 30 días)
    const hoy = new Date();
    const startDate = toYMDLocal(hoy);
    const endDate = toYMDLocal(new Date(hoy.getTime() + 30 * 24 * 60 * 60 * 1000));
    
    dispatch(fetchReservasCalendar({ startDate, endDate }));
  }, [dispatch, accessToken]);

  // 🔎 Traer datos del store
  const { datos: habitaciones = [], loading: loadingHabitaciones } =
    useAppSelector((s: any) => s.habitaciones ?? {});
  
  const { bookings: calendarioBookings = [], calendarStatus: loadingCalendario } =
    useAppSelector((s: any) => s.calendario ?? {});

  const { datos: huespedes = [] } = useAppSelector((s: any) => s.huespedes ?? {});
  const EstadoReservas = useAppSelector((s: any) => s.habitaciones.estadosDeReserva);
  const { errorToast, successToast } = useToastAlert();

  // 🎯 Estado para datos preseleccionados del calendario
  const [selectedRange, setSelectedRange] = useState<{
    start: Date;
    end: Date;
    roomId: string | number;
  } | null>(null);

  // 🏗️ Configurar popup de crear reserva
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 🏗️ Estado para el popup de detalles de reserva
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);


  // 🎯 Lógica de huésped
  const huespedLogic = useHuespedFormLogic(formData, (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  });

  // ✅ Validar formulario
  const validateForm = (): boolean => {
    try {
      reservaAddSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof Error && 'issues' in error) {
        const errorMap: Record<string, string> = {};
        (error as any).issues.forEach((err: any) => {
          const field = err.path.join(".");
          errorMap[field] = err.message;
        });
        setErrors(errorMap);
      }
      return false;
    }
  };

  // ✅ opciones de huéspedes para el builder
  const huespedesOpts: Option[] = useMemo(
    () =>
      (huespedes ?? []).map((h: Huesped) => ({
        value: h.idHuesped,
        label: `${h.nombre} ${h.apellido}`,
      })),
    [huespedes]
  );

  // ✅ habitaciones ordenadas por número
  const habitacionesOrdenadas = useMemo(() => {
    const arr = (habitaciones ?? []) as any[];
    return [...arr].sort((a, b) => Number(a.numero) - Number(b.numero));
  }, [habitaciones]);

  // ✅ campos del formulario con el builder reutilizable (modificado para calendario)
  const inputOptions = useMemo(() => {
    const fields = buildReservaFields(habitacionesOrdenadas, (EstadoReservas ?? []) as EstadoReserva[], huespedesOpts);
    
    // Modificar campos para que no sean editables cuando vienen del calendario
    return fields.map(field => {
      if (field.key === 'idHabitacion' || field.key === 'fechaDesde' || field.key === 'fechaHasta') {
        return { ...field, editable: false };
      }
      return field;
    });
  }, [habitacionesOrdenadas, EstadoReservas, huespedesOpts]);
  const inputOptionsSinEstado = useMemo(
    () => inputOptions.filter((field) => field.key !== "idEstadoReserva"),
    [inputOptions]
  );
  const estadoPendienteId = useMemo(() => {
    const pendiente = (EstadoReservas ?? []).find(
      (e: any) => String(e?.nombre || "").toLowerCase() === "pendiente"
    );
    return pendiente?.idEstadoReserva ?? "";
  }, [EstadoReservas]);
  const estadoActualNombre = useMemo(() => {
    const estado = (EstadoReservas ?? []).find(
      (e: any) => Number(e?.idEstadoReserva) === Number(formData?.idEstadoReserva)
    );
    return String(estado?.nombre || "");
  }, [EstadoReservas, formData?.idEstadoReserva]);

  // ✅ custom fields (Origen, MontoPagado)
  const customFields = useMemo(() => {
    const { origen, montoPagado } = makeCustomFields({
      labelBaseEstilos,
      inputBaseEstilos,
      habitaciones: { datos: habitaciones },
    });
    return { origen, montoPagado } as const;
  }, [habitaciones]);

  // 🧭 Mapear habitaciones del backend → Room (memo para identidad estable)
  const rooms: Room[] = useMemo(
    () => {
      const mappedRooms = (habitaciones as any[]).map((h) => ({
        id: h.numero ?? h.idHabitacion ?? h.id ?? h.ID ?? String(h.nombre ?? h.name), // Usar numero como id principal
        name: h.nombre ?? h.name ?? `Habitación ${h.numero ?? h.id}`,
        numero: h.numero, // Guardar el número para ordenar
      }));
      
      // Ordenar por número de habitación (menor a mayor)
      return mappedRooms.sort((a, b) => {
        const numA = Number(a.numero) || 0;
        const numB = Number(b.numero) || 0;
        return numA - numB;
      });
    },
    [habitaciones]
  );

  // 📅 Mapear bookings del calendario → Booking (memo estable)
  const bookings: Booking[] = useMemo(
    () => {
      // Si no hay bookings del backend, usar datos de ejemplo para debug
      if (calendarioBookings.length === 0) {
        const hoy = new Date();
      }
      
      return (calendarioBookings as any[]).map((b) => {
        return {
          id: b.id ?? b.idReserva,
          roomId: b.roomId ?? b.roomNumber ?? b.idHabitacion,
          start: b.start ?? b.fechaDesde,
          end: b.end ?? b.fechaHasta,
          guest: b.guest ?? b.huespedNombre,
          price: b.price ?? b.montoTotal,
          montoPagado: Number(b.montoPagado ?? 0),
          status: b.status ?? b.estadoReserva,
          idEstadoReserva: b.idEstadoReserva,
        }
      });
    },
    [calendarioBookings, rooms.length] // Solo dependemos de la longitud de rooms, no del objeto completo
  );

  // 🖱️ Handler memoizado para abrir detalles de reserva
  const handleBookingClick = useCallback((id: string | number) => {
    console.log("🔍 Click en reserva, ID:", id);
    // Buscar el booking en el array de bookings
    const booking = bookings.find(b => String(b.id) === String(id));
    console.log("📋 Booking encontrado:", booking);
    if (booking) {
      setSelectedBooking(booking);
    }
  }, [bookings]);

  // 🖱️ Handler para cambio de rango del calendario
  const handleRangeChange = useCallback((start: Date, end: Date) => {
    const startDate = toYMDLocal(start);
    const endDate = toYMDLocal(end);
    calRangeRef.current = { startDate, endDate }; // mantener ref sincronizada
    dispatch(fetchReservasCalendar({ startDate, endDate }));
  }, [dispatch]);

  // 🖱️ Handler para selección de rango de fechas (crear nueva reserva)
  const handleDateRangeSelect = useCallback((range: { start: Date; end: Date; roomId: string | number }) => {
    console.log('Rango seleccionado:', range);
    
    // Encontrar la habitación correcta por su ID
    const habitacionSeleccionada = habitacionesOrdenadas.find(h => 
      h.idHabitacion === range.roomId || h.numero === range.roomId
    );
    
    // Convertir fechas a formato DD/MM/YYYY para el InputDateForm
    const formatToDDMMYYYY = (date: Date) => {
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };
    
    const newFormData = {
      huespedMode: "nuevo",
      idHabitacion: habitacionSeleccionada?.idHabitacion || range.roomId,
      fechaDesde: formatToDDMMYYYY(range.start),
      fechaHasta: formatToDDMMYYYY(range.end),
      idEstadoReserva: estadoPendienteId,
      montoPagado: "",
      // Campos de huésped
      nombre: "",
      apellido: "",
      dni: "",
      telefono: "",
      email: "",
      origen: "AR",
    };
    
    console.log('Habitación encontrada:', habitacionSeleccionada);
    console.log('FormData seteado:', newFormData);
    setFormData(newFormData);
    setSelectedRange(range);
    setShowAddPopup(true);
  }, [habitacionesOrdenadas, estadoPendienteId]);

  // 💾 Función para guardar nueva reserva
  const onSaveAdd = useCallback(async (formData: Record<string, unknown>) => {
    const {
      huespedMode, idHuesped,
      nombre, apellido, dni, telefono, email, origen,
      idHabitacion, idEstadoReserva, fechaDesde, fechaHasta, montoPagado
    } = formData;

    const countryName = getCountryName(String(origen || "AR"), "es");

    const precioPorDia = getPrecioHabitacion(habitaciones, idHabitacion);
    const noches = diffNoches(String(fechaDesde), String(fechaHasta));
    const montoTotal = precioPorDia * noches;
    const pagadoNum = Number(montoPagado) || 0;
    const montoPagadoSeguro = Math.min(pagadoNum, montoTotal);

    const payload: any = {
      idHabitacion: Number(idHabitacion),
      idEstadoReserva: Number(idEstadoReserva),
      fechaDesde: parseDateWithFallbackISO(String(fechaDesde)),
      fechaHasta: parseDateWithFallbackISO(String(fechaHasta)),
      montoPagado: montoPagadoSeguro,
    };

    if (huespedMode === "existente") {
      payload.idHuesped = Number(idHuesped);
    } else {
      payload.huesped = {
        nombre: String(nombre || ""),
        apellido: String(apellido || ""),
        dni: String(dni || ""),
        telefono: String(telefono || ""),
        email: String(email || ""),
        origen: countryName,
      };
      if (idHuesped) {
        payload.idHuesped = Number(idHuesped);
      }
    }

    try {
      await dispatch(addReserva(payload)).unwrap();
      await dispatch(fetchReservas());
      // Refrescar calendario en el rango actualmente visible
      refreshCalendarInCurrentRange();
      
      successToast("Reserva creada exitosamente.");
      setShowAddPopup(false);
      setSelectedRange(null);
    } catch (err) {
      errorToast(typeof err === "string" ? err : "Error al crear reserva.");
    }
  }, [dispatch, habitaciones, successToast, errorToast, refreshCalendarInCurrentRange]);

  const isLoading = loadingHabitaciones || loadingCalendario === 'pending';

  return (
    <div className={"p-4 content-shell " + pantallaPrincipalEstilos}>
      {isLoading ? (
        <div className="p-4 text-sm text-emerald-100/70">
          <LoadingSpinner/>
        </div>
      ) : (
        <>
          <CalendarioContainer
            rooms={rooms}
            bookings={bookings}
            days={14}
            onBookingClick={handleBookingClick}
            onRangeChange={handleRangeChange}
            onDateRangeSelect={handleDateRangeSelect}
            onRefreshCalendar={() => {
              // Refrescar los datos del calendario en el rango visible
              refreshCalendarInCurrentRange();
            }}
          />
          
          {/* Popup para detalles de reserva */}
          {selectedBooking && (
            <DetallesReservaPopup
              booking={selectedBooking}
              roomName={rooms.find(r => String(r.id) === String(selectedBooking.roomId))?.name}
              onClose={() => setSelectedBooking(null)}
              onStatusChange={() => {
                refreshCalendarInCurrentRange();
              }}
            />
          )}

          {/* Popup para crear reserva */}
          {showAddPopup && (
            <PopupContainer
              onClose={() => {
                setShowAddPopup(false);
                setSelectedRange(null);
              }}
              title="Crear Nueva Reserva"
            >
              <div className="relative h-full flex flex-col pt-4 space-y-6">
                {/* Contenido del formulario */}
                <div className="flex-1 overflow-auto pr-1 pb-20">
                  <FormRenderer
                    fields={inputOptionsSinEstado}
                    formData={formData}
                    onChange={(e) => {
                      const { name, value } = e.target;
                      
                      // Si se selecciona un huésped existente, llenar automáticamente sus datos
                      if (name === 'idHuesped' && value) {
                        const huespedSeleccionado = huespedes.find((h: any) => h.idHuesped === Number(value));
                        if (huespedSeleccionado) {
                          setFormData((prev) => ({
                            ...prev,
                            [name]: value,
                            nombre: huespedSeleccionado.nombre || '',
                            apellido: huespedSeleccionado.apellido || '',
                            dni: huespedSeleccionado.dni || '',
                            telefono: huespedSeleccionado.telefono || '',
                            email: huespedSeleccionado.email || '',
                            origen: huespedSeleccionado.origen || 'AR',
                          }));
                          console.log('Datos del huésped cargados:', huespedSeleccionado);
                        }
                      }
                      // Si se cambia a "nuevo huésped", limpiar los campos del huésped
                      else if (name === 'huespedMode' && value === 'nuevo') {
                        setFormData((prev) => ({
                          ...prev,
                          [name]: value,
                          idHuesped: '',
                          nombre: '',
                          apellido: '',
                          dni: '',
                          telefono: '',
                          email: '',
                          origen: 'AR',
                        }));
                        console.log('Cambiado a nuevo huésped, campos limpiados');
                      }
                      // Si se cambia a "huésped existente", limpiar los campos de datos personales
                      else if (name === 'huespedMode' && value === 'existente') {
                        setFormData((prev) => ({
                          ...prev,
                          [name]: value,
                          nombre: '',
                          apellido: '',
                          dni: '',
                          telefono: '',
                          email: '',
                          origen: 'AR',
                        }));
                        console.log('Cambiado a huésped existente, campos de datos personales limpiados');
                      }
                      else {
                        setFormData((prev) => ({ ...prev, [name]: value }));
                      }
                      
                      // Limpiar error del campo cuando el usuario empiece a escribir
                      if (errors[name]) {
                        setErrors((prev) => {
                          const newErrors = { ...prev };
                          delete newErrors[name];
                          return newErrors;
                        });
                      }
                    }}
                    errors={errors}
                    mode="add"
                    customFields={customFields}
                  />
                  {/* Estado con slider (reemplaza el select de estado para calendario) */}
                  <div className="mt-5">
                    <EstadoSlider
                      estadoActual={estadoActualNombre}
                      estados={(EstadoReservas ?? []).filter(
                        (e: any) => String(e?.nombre || "").toLowerCase() !== "rechazada"
                      )}
                      onChange={(estadoNombre) => {
                        const estadoDestino = (EstadoReservas ?? []).find(
                          (e: any) =>
                            String(e?.nombre || "").toLowerCase() === String(estadoNombre).toLowerCase()
                        );
                        if (!estadoDestino?.idEstadoReserva) return;
                        setFormData((prev) => ({
                          ...prev,
                          idEstadoReserva: Number(estadoDestino.idEstadoReserva),
                        }));
                        if (errors.idEstadoReserva) {
                          setErrors((prev) => {
                            const next = { ...prev };
                            delete next.idEstadoReserva;
                            return next;
                          });
                        }
                      }}
                    />
                    {errors.idEstadoReserva && (
                      <p className="text-red-300 text-xs mt-2">{errors.idEstadoReserva}</p>
                    )}
                  </div>
                </div>

                {/* Footer con botones */}
                <div className="absolute bottom-4 right-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddPopup(false);
                      setSelectedRange(null);
                    }}
                    className="px-4 py-2 admin-button-ghost rounded-md"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (validateForm()) {
                        onSaveAdd(formData);
                      }
                    }}
                    disabled={Object.keys(errors).length > 0}
                    className={`px-4 py-2 rounded-md ${
                      Object.keys(errors).length > 0
                        ? 'bg-white/20 text-white/55 cursor-not-allowed'
                        : 'admin-button-primary'
                    }`}
                  >
                    Agregar
                  </button>
                </div>
              </div>
            </PopupContainer>
          )}
        </>
      )}
    </div>
  );
}
