"use client";

import { ReactNode, useState } from "react";
import { PopupContainer } from "@/components/index";

type PopupFormAgregarProps<T> = {
  isOpen: boolean;
  title?: string;
  defaultData: T;
  onClose: () => void;
  onSave: (data: T) => void;
  children: (
    formData: T,
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  ) => ReactNode;
  validateForm?: () => boolean;
  hasErrors?: boolean;
  description?: string;
};

function PopupFormAgregar<T>({
  isOpen,
  title = "Agregar",
  defaultData,
  onClose,
  onSave,
  children,
  validateForm,
  hasErrors = false,
  description,
}: PopupFormAgregarProps<T>) {
  const [formData, setFormData] = useState<T>(defaultData);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (validateForm && !validateForm()) {
      return;
    }
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <PopupContainer onClose={onClose} title={title}>
      <div className="relative h-full flex flex-col pt-4 space-y-6">
        {description && (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-md">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">{description}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-auto pr-1 pb-20">
          {children(formData, handleChange)}
        </div>

        <div className="absolute bottom-4 right-4 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 font-medium shadow-sm"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={hasErrors}
            className={`px-5 py-2.5 text-white rounded-lg font-medium shadow-md transition-all duration-200 ${
              hasErrors 
                ? 'bg-gray-400 cursor-not-allowed opacity-60' 
                : 'bg-[var(--color-main)] hover:bg-green-700 hover:shadow-lg transform hover:-translate-y-0.5'
            }`}
          >
            Agregar
          </button>
        </div>
      </div>
    </PopupContainer>
  );
}

export default PopupFormAgregar;
