import styles from "./Skeleton.module.scss";

interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
  circle?: boolean;
}

export function Skeleton({
  width = "100%",
  height = "16px",
  className = "",
  circle = false,
}: SkeletonProps) {
  return (
    <div
      className={`${styles.skeleton} ${circle ? styles.circle : ""} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}
