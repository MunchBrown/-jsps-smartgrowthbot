export const APP_NAME = "Smart Growth Bot Painting AI";

export function BrandMark({ size = "md" }: { size?: "sm" | "md" }) {
  const box = size === "sm" ? "h-8 w-8 text-sm" : "h-10 w-10 text-base";
  return (
    <div className="flex items-center gap-3 min-w-0">
      <div className={`${box} shrink-0 rounded-xl bg-orange-500 flex items-center justify-center text-white font-black shadow-lg shadow-orange-500/10`} aria-hidden>
        SG
      </div>
      <div className="text-left min-w-0">
        <p className="text-base md:text-lg font-bold font-serif text-white tracking-tight leading-none truncate">Smart Growth Bot</p>
        <p className="text-[10px] uppercase tracking-wider text-orange-400 font-bold mt-1">Painting AI</p>
      </div>
    </div>
  );
}
