import Image from "next/image";
import logoIcon from "../../../public/brand/logo-icon.png";

export function Logo({ size = 36 }: { size?: number }) {
  return (
    <Image
      src={logoIcon}
      alt="Event Prest'Art"
      width={size}
      height={size}
      className="rounded-full"
      style={{ width: size, height: size }}
      priority
    />
  );
}
