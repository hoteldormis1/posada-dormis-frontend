// app/(lo-que-sea)/calendario/page.tsx
"use client";

import React from "react";
import { pantallaPrincipalEstilos, fuenteDeTitulo } from "@/styles/global-styles";
import { MainCalendario } from "@/components";

export default function CalendarioPage() {
  return (
    <div className={pantallaPrincipalEstilos}>
      <h1 className={fuenteDeTitulo}>Calendario de disponibilidad</h1>
      <MainCalendario />
    </div>
  );
}
