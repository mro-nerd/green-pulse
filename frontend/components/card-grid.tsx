import { ReactNode } from "react";

interface CardGridProps {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
}

export function CardGrid({ children, columns = 3 }: CardGridProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  }[columns];

  return <div className={`grid gap-6 ${gridCols}`}>{children}</div>;
}
