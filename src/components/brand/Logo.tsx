type LogoProps = {
  className?: string | undefined;
  size?: number | undefined;
};

/**
 * AFTERCUT mark — a solid block sliced by a diagonal cut, the two halves
 * offset. Reads at 16px in a nav and at 300mm on a hoodie back print.
 */
export function LogoMark({ className, size = 24 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path d="M0 0 H208 L0 208 Z" fill="currentColor" />
      <path d="M256 48 V256 H48 Z" fill="currentColor" />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return <span className={className}>aftercut</span>;
}

export function Logo({
  className,
  markClassName,
  wordClassName,
  size = 24,
}: {
  className?: string;
  markClassName?: string;
  wordClassName?: string;
  size?: number;
}) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <LogoMark size={size} className={markClassName} />
      <Wordmark className={`text-lg font-semibold tracking-tight ${wordClassName ?? ""}`} />
    </div>
  );
}
