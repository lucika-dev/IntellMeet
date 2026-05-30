import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 text-center">
      <div className="space-y-4">
        <h1 className="text-9xl font-bold tracking-tighter text-white/10 select-none">
          404
        </h1>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            Page not found
          </h2>
          <p className="mx-auto max-w-[300px] text-zinc-500">
            The design you are looking for doesn't exist or has been moved to another dimension.
          </p>
        </div>

        <div className="pt-4">
          <Button asChild variant="outline" className="border-zinc-800 bg-zinc-950 text-zinc-400 hover:bg-zinc-900 hover:text-white">
            <Link href="/">Return to Dashboard</Link>
          </Button>
        </div>
      </div>

      <div className="fixed bottom-8 font-mono text-[10px] uppercase tracking-[0.3em] text-zinc-700">
        Error Code: 0x404_NULL_REFERENCE
      </div>
    </div>
  );
}