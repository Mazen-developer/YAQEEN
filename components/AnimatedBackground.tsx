export default function AnimatedBackground() {
  return (
    <div className="animated-bg" aria-hidden="true">
      <span className="left-[-10%] top-[-10%] h-[420px] w-[420px] animate-blob-float-1 bg-brand-200" />
      <span className="right-[-12%] top-[10%] h-[360px] w-[360px] animate-blob-float-2 bg-brand-300/70" />
      <span className="bottom-[-15%] left-[15%] h-[460px] w-[460px] animate-blob-float-3 bg-brand-100" />
      <span className="bottom-[5%] right-[5%] h-[260px] w-[260px] animate-blob-float-2 bg-brand-400/40" />
    </div>
  );
}
