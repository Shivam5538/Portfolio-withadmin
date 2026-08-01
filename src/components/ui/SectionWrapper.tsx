"use client";

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

/**
 * Lightweight Section Wrapper
 * Eliminates per-section exit scroll listeners to ensure 60fps buttery scroll.
 */
export function SectionWrapper({ children, className = "", id }: SectionWrapperProps) {
  return (
    <div id={id} className={className}>
      {children}
    </div>
  );
}
