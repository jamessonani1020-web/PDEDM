"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export function GlobalLoader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-background flex flex-col items-center justify-center">
      <Loader2 className="h-8 w-8 text-slate-400 animate-spin mb-4" />
      <p className="text-sm text-slate-500 font-medium tracking-wide">Loading PDEDM...</p>
    </div>
  );
}
