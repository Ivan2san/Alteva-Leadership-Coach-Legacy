import { clsx } from "clsx";
import { useState } from "react";

type Props = {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
};

export function TileButton({
  title, subtitle, icon, selected = false, disabled = false, onClick, className
}: Props) {
  const [pressing, setPressing] = useState(false);

  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      onPointerDown={() => setPressing(true)}
      onPointerUp={() => setPressing(false)}
      onPointerCancel={() => setPressing(false)}
      className={clsx(
        "group w-full text-left rounded-2xl p-5 outline-none transition-all duration-normal",
        "ring-1 ring-slate-200 shadow-sm",
        "focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
        !disabled && "hover:ring-slate-300 hover:shadow-md",
        !disabled && "active:opacity-90",
        pressing && "scale-[var(--press-scale)]",
        selected ? "bg-brand-50 ring-2 ring-brand-500" : "bg-white",
        disabled && "opacity-60 cursor-not-allowed",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div className={clsx(
            "rounded-xl p-2",
            selected ? "bg-brand-100 text-brand-700" : "bg-blue-50 text-blue-600"
          )}>
            {icon}
          </div>
        )}
        <div className="flex-1">
          <div className="text-lg font-semibold text-slate-900">{title}</div>
          {subtitle && <div className="mt-1 text-slate-600">{subtitle}</div>}
        </div>
        {selected && (
          <span className="ml-auto mt-1 inline-flex items-center rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
            Selected
          </span>
        )}
      </div>
    </button>
  );
}