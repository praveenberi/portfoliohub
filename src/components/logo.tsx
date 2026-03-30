import Image from "next/image";

interface LogoProps {
  size?: number;
  className?: string;
  /** Show the stylized "MySkillsPage" text next to the icon */
  withText?: boolean;
  /** Scale of the text relative to default. Default ~text-base */
  textSize?: "sm" | "base" | "lg" | "xl" | "2xl";
}

const textSizeMap = {
  sm:  { my: "text-sm",  skills: "text-sm",  page: "text-sm"  },
  base:{ my: "text-base",skills: "text-base",page: "text-base"},
  lg:  { my: "text-lg",  skills: "text-lg",  page: "text-lg"  },
  xl:  { my: "text-xl",  skills: "text-xl",  page: "text-xl"  },
  "2xl":{ my: "text-2xl",skills: "text-2xl", page: "text-2xl" },
};

export function BrandName({ size = "base" }: { size?: "sm" | "base" | "lg" | "xl" | "2xl" }) {
  const s = textSizeMap[size];
  return (
    <span className="inline-flex items-baseline gap-0 leading-none select-none">
      <span
        className={`${s.my} font-bold`}
        style={{ fontFamily: "var(--font-dancing)", color: "#FF5E1A" }}
      >
        My
      </span>
      <span
        className={`${s.skills} font-black tracking-tight uppercase`}
        style={{ color: "#1a1a2e" }}
      >
        SKILLS
      </span>
      <span
        className={`${s.page} font-bold`}
        style={{ fontFamily: "var(--font-dancing)", color: "#FF2D55" }}
      >
        page
      </span>
    </span>
  );
}

export function Logo({ size = 28, className = "", withText = false, textSize = "base" }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Image
        src="/logo-v2.svg"
        alt="myskillspage logo"
        width={size}
        height={size}
        className="rounded-md shrink-0"
        priority
      />
      {withText && <BrandName size={textSize} />}
    </span>
  );
}
