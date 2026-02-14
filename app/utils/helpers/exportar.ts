// utils/helpers/exportar.ts
// Utilidades para exportar datos a CSV y PDF

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ─────────────────────────── Tipos ───────────────────────────

export interface ColumnaExport {
  header: string;
  key: string;
}

export interface ExportOptions {
  filename: string;
  titulo?: string;
  subtitulo?: string;
  columnas: ColumnaExport[];
  datos: Record<string, unknown>[];
}

// ─────────────────────────── CSV ───────────────────────────

/**
 * Genera y descarga un archivo CSV a partir de columnas y datos.
 */
export function exportarCSV({ filename, columnas, datos }: ExportOptions) {
  const separator = ";";

  // Header
  const headerLine = columnas.map((c) => `"${c.header}"`).join(separator);

  // Rows
  const rows = datos.map((row) =>
    columnas
      .map((c) => {
        const val = row[c.key];
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      })
      .join(separator)
  );

  const bom = "\uFEFF"; // UTF-8 BOM para que Excel lo lea bien
  const csv = bom + [headerLine, ...rows].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ─────────────────────────── PDF ───────────────────────────

/**
 * Genera y descarga un archivo PDF con tabla usando jsPDF + autoTable.
 */
export function exportarPDF({
  filename,
  titulo,
  subtitulo,
  columnas,
  datos,
}: ExportOptions) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });

  let cursorY = 15;

  // Título
  if (titulo) {
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(titulo, 14, cursorY);
    cursorY += 8;
  }

  // Subtítulo
  if (subtitulo) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(subtitulo, 14, cursorY);
    doc.setTextColor(0);
    cursorY += 8;
  }

  // Tabla
  const head = [columnas.map((c) => c.header)];
  const body = datos.map((row) =>
    columnas.map((c) => {
      const val = row[c.key];
      if (val === null || val === undefined) return "";
      return String(val);
    })
  );

  autoTable(doc, {
    startY: cursorY,
    head,
    body,
    theme: "grid",
    headStyles: {
      fillColor: [59, 130, 246], // azul
      textColor: 255,
      fontStyle: "bold",
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 7.5,
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    styles: {
      cellPadding: 2,
      overflow: "linebreak",
    },
    margin: { left: 14, right: 14 },
  });

  // Pie de página
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Página ${i} de ${pageCount} — Generado el ${new Date().toLocaleDateString("es-AR")}`,
      14,
      doc.internal.pageSize.height - 10
    );
  }

  doc.save(`${filename}.pdf`);
}
