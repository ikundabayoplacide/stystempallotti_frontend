interface SectionTitleProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center" | "right";
  className?: string;
}

const alignClass = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

export default function SectionTitle({ title, subtitle, align = "center", className = "" }: SectionTitleProps) {
  return (
    <div className={`flex flex-col gap-2 ${alignClass[align]} ${className}`}>
      <h2 className="text-2xl xs:text-3xl lg:text-4xl font-bold text-secondary-100 font-[family-name:var(--font-family-primary)] leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-base lg:text-lg text-custom-700 font-[family-name:var(--font-family-primary)] max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}
