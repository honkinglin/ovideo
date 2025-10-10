import { cn } from "@/lib/utils"

type LogoProps = {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-full border border-border/60 bg-card/80 px-3 py-1.5 shadow-md backdrop-blur-sm",
        className,
      )}
    >
      <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border/60 bg-gradient-to-br from-primary/10 via-background to-secondary/20">
        <img src="/logo.svg" alt="Ovideo logo" className="h-8 w-8 object-contain" loading="lazy" />
      </span>
      <div className="leading-none">
        <p className="text-sm font-semibold">Ovideo</p>
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Player</p>
      </div>
    </div>
  )
}
