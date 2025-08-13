import { ReactNode } from "react";

interface ButtonProps {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  disabled?: boolean;
  title?: string;
  type?: "button" | "submit" | "reset";
}

export const ButtonForm = ({
  onClick,
  children,
  className = "",
  icon,
  disabled = false,
  title,
  type = "button",
}: ButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-disabled={disabled}
      className={`text-sm flex items-center space-x-2 rounded-lg px-4 py-2 font-bold border shadow-sm transition
        ${disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"}
        ${className}
      `}
    >
      {icon && <span>{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

export default ButtonForm;