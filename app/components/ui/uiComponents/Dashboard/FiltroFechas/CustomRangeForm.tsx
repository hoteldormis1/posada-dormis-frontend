"use client";

import React from "react";
import { ButtonForm } from "@/components";
import InputDateForm from "@/components/forms/formComponents/InputDateForm";
import { MdSearch } from "react-icons/md";

type Props = {
  fromUI: string;
  toUI: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  rangoInvalido: boolean;
};

const CustomRangeForm: React.FC<Props> = ({
  fromUI, toUI, onChange, onSubmit, rangoInvalido,
}) => {
  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col lg:flex-row gap-4 w-full rounded-xl shadow-md p-4 border border-gray-300 bg-white/70"
    >
      <div className="w-full lg:w-1/2">
        <InputDateForm
          inputKey="from"
          label="Fecha desde"
          value={fromUI}
          onChange={onChange}
          placeholder="dd/mm/yyyy"
        />
      </div>
      <div className="w-full lg:w-1/2">
        <InputDateForm
          inputKey="to"
          label="Fecha hasta"
          value={toUI}
          onChange={onChange}
          placeholder="dd/mm/yyyy"
        />
      </div>
      <div className="flex items-end">
        <ButtonForm
          type="submit"
          disabled={rangoInvalido}
          title={rangoInvalido ? "El rango es inválido (desde > hasta)" : "Aplicar filtro"}
          icon={<MdSearch size={18} />}
          className={rangoInvalido ? "bg-gray-200 text-gray-500 border-gray-300" : "bg-main text-white"}
        >
          Aplicar
        </ButtonForm>
      </div>

      {rangoInvalido && (
        <div className="text-red-600 text-sm">
          El rango es inválido: “Fecha desde” no puede ser mayor que “Fecha hasta”.
        </div>
      )}
    </form>
  );
};

export default CustomRangeForm;
