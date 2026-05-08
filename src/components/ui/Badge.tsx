type BadgeVariant = "primary" | "accent" | "neutral" | "success" | "danger";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  primary: "bg-primary-100 text-primary-700",
  accent:  "bg-custom-100 text-primary-600",
  neutral: "bg-secondary-400 text-secondary-100",
  success: "bg-primary-100 text-primary-800",
  danger:  "bg-custom-200 text-primary-900",
};

export default function Badge({ variant = "primary", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
        font-[family-name:var(--font-family-primary)]
        ${variants[variant]} ${className}
      `}
    >
      {children}
    </span>
  );
}
