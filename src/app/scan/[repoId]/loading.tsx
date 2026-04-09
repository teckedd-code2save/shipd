import { Surface } from "@/components/ui/surface";

export default function ScanLoading() {
  return (
    <main className="page">
      <div className="loading-block mb-2.5 h-9 w-[220px]" />
      <div className="loading-block mb-6 h-[18px] w-[360px]" />
      <Surface className="grid gap-3.5 p-5">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="loading-block h-[84px] w-full" />
        ))}
      </Surface>
    </main>
  );
}
