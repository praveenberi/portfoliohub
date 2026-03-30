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
      <Image
        src="/logo.svg"
        alt="myskillspage logo"
        width={size}
        height={size}
        className="rounded-md shrink-0"
        priority
      />
      {withText && (
        <span className={`font-semibold tracking-tight ${textClassName}`}>
          myskillspage
        </span>
      )}
    </span>
  );
}
