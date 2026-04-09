import { Surface } from "@/components/ui/surface";

export default function ComparisonLoading() {
  return (
    <main className="page">
      <section className="dashboard-hero mb-6">
        <div className="loading-block mb-3 h-[18px] w-40" />
        <div className="loading-block mb-2.5 h-10 w-[46%]" />
        <div className="loading-block h-5 w-[74%]" />
      </section>
      <section className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Surface as="article" key={index} className="comparison-card">
            <div className="loading-block h-40 w-full" />
          </Surface>
        ))}
      </section>
    </main>
  );
}
