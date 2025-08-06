import { ReactNode } from "react";

interface ButtonProps {
  onClick: () => void;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}

const Button = ({
  onClick,
  children,
  className = "",
  icon,
}: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`text-sm flex items-center space-x-2 rounded-lg p-2 font-bold ${className}`}
    >
      {icon && <span>{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

export default Button;
