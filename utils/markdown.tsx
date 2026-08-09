import ReactMarkdown from "react-markdown";
import CodeBlock from "@/components/CodeBlock";

const Markdown = ({ content }: { content: string }) => (
  <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
);

export default Markdown;

export const markdownComponents: Record<string, any> = {
  // ─── Headings ────────────────────────────────────────────────────────────────
  h1: ({ children }: any) => (
    <h1 className="text-3xl font-bold mt-8 mb-4 text-foreground tracking-tight border-b border-border pb-2">
      {children}
    </h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-2xl font-semibold mt-7 mb-3 text-foreground tracking-tight">
      {children}
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-xl font-semibold mt-5 mb-2 text-foreground">
      {children}
    </h3>
  ),
  h4: ({ children }: any) => (
    <h4 className="text-lg font-medium mt-4 mb-2 text-foreground">
      {children}
    </h4>
  ),

  // ─── Body text ───────────────────────────────────────────────────────────────
  p: ({ children }: any) => (
    <p className="text-base leading-7 my-3 text-foreground/90">{children}</p>
  ),

  // ─── Links ───────────────────────────────────────────────────────────────────
  a: ({ href, children }: any) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline decoration-primary/40 underline-offset-2 hover:decoration-primary transition-colors"
    >
      {children}
    </a>
  ),

  // ─── Lists ───────────────────────────────────────────────────────────────────
  ul: ({ children }: any) => (
    <ul className="list-disc list-outside my-4 ml-5 space-y-1.5 text-foreground/90">
      {children}
    </ul>
  ),
  ol: ({ children }: any) => (
    <ol className="list-decimal list-outside my-4 ml-5 space-y-1.5 text-foreground/90">
      {children}
    </ol>
  ),
  li: ({ children }: any) => <li className="leading-7">{children}</li>,

  // ─── Blockquote ──────────────────────────────────────────────────────────────
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-4 border-primary/50 pl-4 py-1 my-4 bg-primary/5 rounded-r-lg italic text-muted-foreground">
      {children}
    </blockquote>
  ),

  // ─── Inline code ─────────────────────────────────────────────────────────────
  code: ({ inline, className, children }: any) => {
    const language = (className ?? "").replace("language-", "");
    const code = String(children).replace(/\n$/, "");

    if (!inline && (language || code.includes("\n"))) {
      return <CodeBlock language={language} code={code} />;
    }

    // Inline code
    return (
      <code className="bg-muted text-primary font-mono text-[0.85em] px-1.5 py-0.5 rounded-md border border-border">
        {children}
      </code>
    );
  },

  // ─── pre: let `code` handle everything above ─────────────────────────────────
  pre: ({ children }: any) => <>{children}</>,

  // ─── Images ──────────────────────────────────────────────────────────────────
  img: ({ src, alt }: any) => (
    <span className="block my-6">
      <img
        src={src}
        alt={alt}
        className="max-w-full rounded-xl border border-border shadow-md mx-auto"
      />
      {alt && (
        <span className="block text-center text-xs text-muted-foreground mt-2 italic">
          {alt}
        </span>
      )}
    </span>
  ),

  // ─── Horizontal rule ─────────────────────────────────────────────────────────
  hr: () => <hr className="my-8 border-border" />,

  // ─── Table ───────────────────────────────────────────────────────────────────
  table: ({ children }: any) => (
    <div className="overflow-x-auto my-6 rounded-xl border border-border shadow-sm">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }: any) => (
    <thead className="bg-muted text-muted-foreground font-semibold">
      {children}
    </thead>
  ),
  tbody: ({ children }: any) => (
    <tbody className="divide-y divide-border">{children}</tbody>
  ),
  tr: ({ children }: any) => (
    <tr className="hover:bg-muted/50 transition-colors">{children}</tr>
  ),
  th: ({ children }: any) => (
    <th className="px-4 py-3 text-left font-semibold tracking-wide">
      {children}
    </th>
  ),
  td: ({ children }: any) => (
    <td className="px-4 py-3 text-foreground/90">{children}</td>
  ),

  // ─── Strong / Em ─────────────────────────────────────────────────────────────
  strong: ({ children }: any) => (
    <strong className="font-bold text-foreground">{children}</strong>
  ),
  em: ({ children }: any) => (
    <em className="italic text-foreground/80">{children}</em>
  ),
};
