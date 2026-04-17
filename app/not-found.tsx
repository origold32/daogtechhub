import { useRouter } from "next/navigation";
import { ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0718] text-white px-4">
      <div className="max-w-2xl text-center space-y-6 rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl shadow-black/30">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/15 text-blue-300">
          <Search className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-4xl font-black">Page not found</h1>
          <p className="mt-3 text-sm text-muted-lavender">We couldn’t find the page you were looking for. Try checking the URL or going back to the homepage.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button onClick={() => router.push("/")} className="bg-lilac text-deep-purple">Go Home</Button>
          <Button onClick={() => router.back()} variant="outline" className="border-white/10 text-white"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
        </div>
      </div>
    </div>
  );
}
