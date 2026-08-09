"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { CheckIcon, CopyIcon } from "lucide-react";
import Mermaid from "./Mermaid";

interface CodeBlockProps {
  language: string;
  code: string;
}

export default function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  if (language === "mermaid") {
    return <Mermaid chart={code} />;
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const el = document.createElement("textarea");
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative group my-4 rounded-xl overflow-hidden border border-white/10 shadow-lg">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1a1b26] border-b border-white/10">
        <div className="flex items-center gap-2">
          {/* Traffic light dots */}
          <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="text-xs font-mono text-zinc-400 tracking-widest uppercase select-none">
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors duration-150 bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-md border border-white/10"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <CheckIcon className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <CopyIcon className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Syntax highlighted code */}
      <SyntaxHighlighter
        language={language || "text"}
        style={oneDark}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          padding: "1.25rem 1.5rem",
          fontSize: "0.875rem",
          lineHeight: "1.7",
          background: "#1e1e2e",
        }}
        showLineNumbers={true}
        lineNumberStyle={{
          color: "#4a4f69",
          minWidth: "2.5em",
          paddingRight: "1.5em",
          userSelect: "none",
        }}
        wrapLongLines={false}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
