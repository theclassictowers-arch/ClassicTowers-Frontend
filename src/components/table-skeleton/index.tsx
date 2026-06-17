import Skeleton from "@mui/material/Skeleton";

type TableSkeletonProps = {
  columns?: number;
  rows?: number;
};

export const TableSkeleton = ({ columns = 6, rows = 8 }: TableSkeletonProps) => (
  <div style={{ padding: 12, width: "100%" }}>
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <Skeleton height={36} variant="rounded" />
      <div
        style={{
          display: "grid",
          gap: 8,
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={`header-${index}`} height={34} variant="rounded" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={`row-${rowIndex}`}
          style={{
            display: "grid",
            gap: 8,
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: columns }).map((_, columnIndex) => (
            <Skeleton
              key={`cell-${rowIndex}-${columnIndex}`}
              height={30}
              variant="rounded"
            />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export default TableSkeleton;
