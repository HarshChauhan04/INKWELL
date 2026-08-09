"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  securityLevel: "loose",
});

interface MermaidProps {
  chart: string;
}

export default function Mermaid({ chart }: MermaidProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (!hasMounted || !ref.current) return;

    let isSubscribed = true;
    const uniqueId = `mermaid-${Math.floor(Math.random() * 1000000)}`;

    const renderChart = async () => {
      try {
        setError(null);
        // Clear previous content
        ref.current!.innerHTML = "";
        
        // Parse and render SVG
        const { svg: renderedSvg } = await mermaid.render(uniqueId, chart);
        if (isSubscribed) {
          setSvg(renderedSvg);
        }
      } catch (err: any) {
        console.error("Mermaid parsing error:", err);
        // Clear corrupt internal mermaid state/cache if any
        if (isSubscribed) {
          setError("Failed to render diagram. Please check your Mermaid syntax.");
        }
      }
    };

    renderChart();

    return () => {
      isSubscribed = false;
    };
  }, [chart, hasMounted]);

  if (!hasMounted) {
    return (
      <pre className="p-4 bg-muted/40 border border-border rounded-xl text-xs font-mono overflow-auto">
        {chart}
      </pre>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-xl">
        <p className="font-semibold mb-1">Visual Diagram Error</p>
        <pre className="text-xs font-mono bg-background/50 p-2.5 rounded-lg overflow-auto mt-2 text-foreground">
          {chart}
        </pre>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-[#1a1b26]/50 dark:bg-muted/10 border border-border rounded-xl my-4 overflow-x-auto shadow-sm">
      <div
        ref={ref}
        className="w-full flex justify-center"
        dangerouslySetInnerHTML={{ __html: svg || '<div className="animate-pulse text-muted-foreground text-sm">Rendering diagram...</div>' }}
      />
    </div>
  );
}
