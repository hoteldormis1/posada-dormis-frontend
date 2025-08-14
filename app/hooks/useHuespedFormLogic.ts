import { useState, useEffect } from "react";
import { useAppSelector } from "@/lib/store/hooks";
import { RootState } from "@/lib/store/store";

export const useHuespedFormLogic = (
    formData: Record<string, any>,
    handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
) => {
    const { datos: huespedes } = useAppSelector((state: RootState) => state.huespedes);
    const [huespedMode, setHuespedMode] = useState<string>("nuevo");

    // Obtener el huésped seleccionado
    const getHuespedById = (id: string) => {
        return huespedes?.find(h => String(h.idHuesped) === id) || null;
    };

    // Función auxiliar para crear eventos sintéticos
    const createSyntheticEvent = (field: string, value: string) => {
        return {
            target: { name: field, value }
        } as React.ChangeEvent<HTMLInputElement | HTMLSelectElement>;
    };

    // Manejar cambio de modo (existente vs nuevo)
    const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newMode = e.target.value;
        setHuespedMode(newMode);

        if (newMode === "nuevo") {
            // Limpiar campos cuando se cambia a nuevo huésped
            const fields = ["idHuesped", "nombre", "apellido", "dni", "telefono", "email", "origen"];
            fields.forEach(field => {
                const event = createSyntheticEvent(field, field === "origen" ? "AR" : "");
                handleFormChange(event);
            });
        }
    };

    // Manejar selección de huésped existente
    const handleHuespedChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const huespedId = e.target.value;
        const huesped = getHuespedById(huespedId);

        if (huesped) {
            // Autocompletar campos con datos del huésped seleccionado
            const fields = {
                idHuesped: huespedId,
                nombre: huesped.nombre || "",
                apellido: huesped.apellido || "",
                dni: huesped.dni || "",
                telefono: huesped.telefono || "",
                email: huesped.email || "",
                origen: huesped.origen || "AR"
            };

            // Actualizar cada campo
            Object.entries(fields).forEach(([field, value]) => {
                const event = createSyntheticEvent(field, value);
                handleFormChange(event);
            });
        }
    };

    // Determinar si los campos son editables
    const isFieldEditable = (field: string) => {
        if (huespedMode === "nuevo") return true;
        if (huespedMode === "existente") {
            if (field !== "fechaHasta" && field !== "fechaDesde" && field !== "montoPagado" && field !== "idHabitacion") {
                return false
            }
        };
        return true; // fallback
    };

    return {
        huespedMode,
        setHuespedMode,
        handleModeChange,
        handleHuespedChange,
        isFieldEditable,
        huespedes
    };
};
