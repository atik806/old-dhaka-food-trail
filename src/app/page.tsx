import TrailLoader from "@/components/TrailLoader";

export default function Home() {
  return (
    <div className="flex h-dvh flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-line bg-paper px-4 py-3 sm:px-6">
        <div>
          <h1 className="font-display text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            Old Dhaka <span className="text-terracotta">Food Trail</span>
          </h1>
          <p className="hidden text-sm text-muted sm:block">
            Pick the spots, we&apos;ll draw the walk — biryani, bakarkhani and Mughal lanes.
          </p>
        </div>
        <p className="max-w-56 text-right text-[11px] leading-snug text-muted">
          Locations are approximate (lane-level). Hours &amp; prices are indicative.
        </p>
      </header>
      <TrailLoader />
    </div>
  );
}
