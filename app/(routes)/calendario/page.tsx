// app/(lo-que-sea)/calendario/page.tsx
"use client";

import React, { useLayoutEffect } from "react";
import { pantallaPrincipalEstilos, fuenteDeTitulo } from "@/styles/global-styles";
import { MainCalendario } from "@/components";
import { fetchHabitaciones } from "@/lib/store/utils/habitaciones/habitacionesSlice";
import { AppDispatch } from "@/lib/store/store";
import { useAppDispatch } from "@/lib/store/hooks";

export default function CalendarioPage() {
const dispatch: AppDispatch = useAppDispatch();

  useLayoutEffect(() => {
    dispatch(fetchHabitaciones({}));
  }, [dispatch]);

  return (
    <div className={"bg-background content-shell " + pantallaPrincipalEstilos}>
      {/*<h1 className={fuenteDeTitulo}>Calendario de disponibilidad</h1>*/}
      <MainCalendario />
    </div>
  );
}
