type Tone = "lime" | "terracotta" | "gold" | "navy" | "danger";

const TONE_CLASSES: Record<Tone, string> = {
  lime: "bg-lime/15 text-lime-dark",
  terracotta: "bg-terracotta/15 text-terracotta",
  gold: "bg-gold/20 text-gold",
  navy: "bg-navy text-white",
  danger: "bg-danger/10 text-danger",
};

export function Badge({
  tone = "lime",
  children,
}: {
  tone?: Tone;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
