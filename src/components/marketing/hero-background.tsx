
export function HeroBackground({
  videoSrc,
  posterSrc,
}: {
  videoSrc?: string;
  posterSrc?: string;
}) {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-navy">
      {videoSrc ? (
        <video
          className="h-full w-full object-cover opacity-70"
          autoPlay
          muted
          loop
          playsInline
          poster={posterSrc}
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : (
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "radial-gradient(900px 500px at 50% -10%, rgba(199,226,63,0.16), transparent 60%)," +
              "radial-gradient(700px 500px at 90% 100%, rgba(224,138,76,0.14), transparent 60%)," +
              "repeating-conic-gradient(from 200deg at 50% -20%, rgba(255,255,255,0.05) 0deg 2deg, transparent 2deg 14deg)",
          }}
        />
      )}
      <div
        aria-hidden
        className="absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-lime/20 blur-[100px]"
      />
      <div
        aria-hidden
        className="absolute -right-24 top-10 h-80 w-80 rounded-full bg-terracotta/20 blur-[110px]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/85 to-navy/50" />
    </div>
  );
}
