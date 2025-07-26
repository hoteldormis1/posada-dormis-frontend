import React from "react";

type TableColumn = { header: string; key: string };

interface TableHeaderProps {
  columns: TableColumn[];
  showFormActions: boolean;
}

const TableHeader: React.FC<TableHeaderProps> = ({ columns, showFormActions }) => {
  return (
    <thead className="bg-main text-white sticky top-0">
      <tr>
        {columns.map((column) => (
          <th
            key={column.key}
            className="text-xs py-4 px-4 border-b leading-none"
          >
            {column.header}
          </th>
        ))}
        {showFormActions && (
          <th className="text-xs py-2 px-4 border-b leading-none">Acciones</th>
        )}
      </tr>
    </thead>
  );
};

export default TableHeader;
