"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type WsEvent =
  | { event: "connected"; ts: number }
  | { event: "nueva_reserva"; data: { id: number; habitacion?: number | null; huesped?: string | null }; ts: number }
  | { event: "reserva_actualizada"; data: { id: number; estado: string }; ts: number };

interface UseReservasSocketOptions {
  /** Llamado cuando llega un evento "nueva_reserva" */
  onNuevaReserva?: (data: { id: number; habitacion?: number | null; huesped?: string | null }) => void;
  /** Llamado cuando llega un evento "reserva_actualizada" */
  onReservaActualizada?: (data: { id: number; estado: string }) => void;
  /** Si false (default) el hook no conecta — útil para no montar en SSR */
  enabled?: boolean;
}

function getWsUrl(): string {
  const apiUrl =
    (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_BASE_URL) ||
    "http://localhost:4000/api";
  // http://localhost:4000/api → ws://localhost:4000
  return apiUrl
    .replace(/^https/, "wss")
    .replace(/^http/, "ws")
    .replace(/\/api\/?$/, "");
}

const MIN_RETRY_MS = 1_000;
const MAX_RETRY_MS = 30_000;

export interface UseReservasSocketReturn {
  /** true mientras el WebSocket está abierto */
  isConnected: boolean;
  /** true si llegó al menos una "nueva_reserva" sin haber sido limpiada */
  hasNewReserva: boolean;
  /** Limpia la flag de nueva reserva (llamar al abrir el popup) */
  clearNewReserva: () => void;
}

export function useReservasSocket({
  onNuevaReserva,
  onReservaActualizada,
  enabled = true,
}: UseReservasSocketOptions = {}): UseReservasSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [hasNewReserva, setHasNewReserva] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryDelayRef = useRef(MIN_RETRY_MS);
  const unmountedRef = useRef(false);

  // Refs estables para los callbacks para evitar re-conectar en cada render
  const onNuevaRef = useRef(onNuevaReserva);
  const onActualizadaRef = useRef(onReservaActualizada);
  useEffect(() => { onNuevaRef.current = onNuevaReserva; }, [onNuevaReserva]);
  useEffect(() => { onActualizadaRef.current = onReservaActualizada; }, [onReservaActualizada]);

  const connect = useCallback(() => {
    if (unmountedRef.current || !enabled) return;

    const url = getWsUrl();
    let ws: WebSocket;
    try {
      ws = new WebSocket(url);
    } catch {
      // Si el navegador no soporta WS o la URL es inválida, no reintentar agresivamente
      retryTimerRef.current = setTimeout(() => {
        retryDelayRef.current = Math.min(retryDelayRef.current * 2, MAX_RETRY_MS);
        connect();
      }, retryDelayRef.current);
      return;
    }

    wsRef.current = ws;

    ws.onopen = () => {
      if (unmountedRef.current) { ws.close(); return; }
      setIsConnected(true);
      retryDelayRef.current = MIN_RETRY_MS; // reset backoff
    };

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data as string) as WsEvent;
        if (msg.event === "nueva_reserva") {
          setHasNewReserva(true);
          onNuevaRef.current?.(msg.data);
        } else if (msg.event === "reserva_actualizada") {
          onActualizadaRef.current?.(msg.data);
        }
      } catch {
        // mensaje no JSON – ignorar
      }
    };

    ws.onerror = () => {
      ws.close();
    };

    ws.onclose = () => {
      if (unmountedRef.current) return;
      setIsConnected(false);
      retryTimerRef.current = setTimeout(() => {
        retryDelayRef.current = Math.min(retryDelayRef.current * 2, MAX_RETRY_MS);
        connect();
      }, retryDelayRef.current);
    };
  }, [enabled]); // solo depende de `enabled`

  useEffect(() => {
    if (!enabled) return;
    unmountedRef.current = false;
    connect();

    return () => {
      unmountedRef.current = true;
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      wsRef.current?.close();
    };
  }, [enabled, connect]);

  const clearNewReserva = useCallback(() => setHasNewReserva(false), []);

  return { isConnected, hasNewReserva, clearNewReserva };
}
