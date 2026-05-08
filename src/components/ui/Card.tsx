interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className = "", hoverable = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-style-600 border border-custom-300 rounded-2xl p-6
        font-[family-name:var(--font-family-primary)]
        ${hoverable ? "hover:shadow-md hover:border-primary-300 transition-all duration-200 cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
