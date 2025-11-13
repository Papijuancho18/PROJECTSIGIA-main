import Image from "next/image"
import Link from "next/link"

interface LogoProps {
  className?: string
  showText?: boolean
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "light" | "dark"
  padding?: "none" | "sm" | "md" | "lg"
}

export function Logo({ className = "", showText = false, size = "md", variant = "dark", padding = "md" }: LogoProps) {
  const sizes = {
    sm: { width: 40, height: 40, textClass: "text-lg" },
    md: { width: 60, height: 60, textClass: "text-xl" },
    lg: { width: 80, height: 80, textClass: "text-2xl" },
    xl: { width: 120, height: 120, textClass: "text-3xl" },
  }

  const paddings = {
    none: "",
    sm: "p-1",
    md: "p-2",
    lg: "p-3",
  }

  const { width, height, textClass } = sizes[size]
  const paddingClass = paddings[padding]

  return (
    <Link href="/" className={`flex items-center gap-3 ${paddingClass} ${className}`}>
      <div className="relative">
        <Image
          src="/images/logo.png"
          alt="SIGIA Logo"
          width={width}
          height={height}
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <span className={`font-bold ${textClass} ${variant === "light" ? "text-white" : "text-primary"}`}>SIGIA</span>
      )}
    </Link>
  )
}
