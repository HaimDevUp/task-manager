import Image from "next/image";
import styles from "./Avatar.module.scss";

interface AvatarProps {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg";
}

export function Avatar({ src, alt, size = "md" }: AvatarProps) {
  return (
    <div className={`${styles.avatar} ${styles[size]}`}>
      <Image src={src} alt={alt} fill sizes="48px" className={styles.image} />
    </div>
  );
}
