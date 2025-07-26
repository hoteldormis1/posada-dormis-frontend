import React from "react";
import { FaCheck, FaTimes, FaEdit } from "react-icons/fa";

type TableColumn = { header: string; key: string };

interface TableRowProps<T> {
  item: T;
  columns: TableColumn[];
  showFormActions: boolean;
  onEdit?: (id: string) => void;
}

const TableRow = <T extends { id: string }>({
  item,
  columns,
  showFormActions,
  onEdit,
}: TableRowProps<T>) => {
  return (
    <tr className="hover:bg-gray-100 text-fontSecondary h-[20px]">
      {columns.map((column) => (
        <td
          key={column.key}
          className="text-xs px-4 py-2 border-b-[1px] border-border text-center leading-none truncate h-[20px]"
        >
          {typeof item[column.key as keyof T] === "boolean" ? (
            item[column.key as keyof T] ? (
              <FaCheck className="text-green-600 text-xs mx-auto" />
            ) : (
              <FaTimes className="text-red-600 text-xs mx-auto" />
            )
          ) : (
            (item[column.key as keyof T] as string | number)
          )}
        </td>
      ))}
      {showFormActions && (
        <td className="px-4 border-b text-center leading-none h-[20px]">
          <button
            onClick={() => onEdit && onEdit(item.id)}
            className="text-blue-500 hover:text-blue-700 mr-2"
          >
            <FaEdit className="text-black text-xs" />
          </button>
        </td>
      )}
    </tr>
  );
};

export default TableRow;
