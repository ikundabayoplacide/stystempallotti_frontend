import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-primary-500 text-secondary-200 hover:bg-primary-600 active:bg-primary-700",
  secondary:
    "bg-secondary-100 text-secondary-200 hover:bg-secondary-400 active:bg-secondary-300",
  outline:
    "border border-primary-500 text-primary-500 hover:bg-primary-50 active:bg-primary-100",
  ghost:
    "text-primary-500 hover:bg-primary-50 active:bg-primary-100",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-base",
  lg: "px-7 py-3.5 text-lg",
};

export default function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl font-semibold
        font-[family-name:var(--font-family-primary)] cursor-pointer
        transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
