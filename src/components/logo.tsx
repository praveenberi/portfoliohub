import Image from "next/image";

interface LogoProps {
  size?: number;
  className?: string;
  /** Show the text "myskillspage" next to the icon */
  withText?: boolean;
  textClassName?: string;
}

export function Logo({ size = 28, className = "", withText = false, textClassName = "" }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className="inline-flex items-center justify-center rounded-md bg-white shrink-0 border border-zinc-100"
        style={{ width: size, height: size }}
      >
        <Image
          src="/logo.svg"
          alt="myskillspage logo"
          width={size - 4}
          height={size - 4}
          priority
        />
      </span>
      {withText && (
        <span className={`font-semibold tracking-tight ${textClassName}`}>
          myskillspage
        </span>
      )}
    </span>
  );
}
