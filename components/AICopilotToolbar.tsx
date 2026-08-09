"use client";

import { useState } from "react";
import {
  SparklesIcon,
  Wand2Icon,
  LightbulbIcon,
  NetworkIcon,
  LoaderCircleIcon,
  CheckIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  generateTagsAction,
  polishMarkdownAction,
  suggestTitlesAction,
  generateMermaidDiagramAction,
} from "@/actions/ai.actions";

interface AICopilotToolbarProps {
  title: string;
  content: string;
  onApplyTags: (tags: string[]) => void;
  onApplyContent: (content: string) => void;
  onApplyTitle: (title: string) => void;
  onInsertDiagram: (diagramMarkdown: string) => void;
}

export default function AICopilotToolbar({
  title,
  content,
  onApplyTags,
  onApplyContent,
  onApplyTitle,
  onInsertDiagram,
}: AICopilotToolbarProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [suggestedTitles, setSuggestedTitles] = useState<string[]>([]);
  const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);
  
  const [diagramPrompt, setDiagramPrompt] = useState("");
  const [isDiagramModalOpen, setIsDiagramModalOpen] = useState(false);

  // 1. Auto Tags
  const handleAutoTags = async () => {
    if (!title.trim() && !content.trim()) {
      toast.error("Please add a title or content before generating tags.");
      return;
    }
    setLoadingAction("tags");
    try {
      const res = await generateTagsAction(title, content);
      if (res.success && res.data) {
        onApplyTags(res.data);
        toast.success(`Generated ${res.data.length} tags!`);
      } else {
        toast.error(res.error || "Failed to generate tags.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Error generating tags.");
    } finally {
      setLoadingAction(null);
    }
  };

  // 2. Polish Markdown
  const handlePolishMarkdown = async () => {
    if (!content.trim()) {
      toast.error("Please write some post content first.");
      return;
    }
    setLoadingAction("polish");
    try {
      const res = await polishMarkdownAction(title, content);
      if (res.success && res.data) {
        onApplyContent(res.data);
        toast.success("Markdown polished successfully!");
      } else {
        toast.error(res.error || "Failed to polish markdown.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Error polishing markdown.");
    } finally {
      setLoadingAction(null);
    }
  };

  // 3. Suggest Titles
  const handleSuggestTitles = async () => {
    if (!content.trim()) {
      toast.error("Please add content to generate title suggestions.");
      return;
    }
    setLoadingAction("titles");
    try {
      const res = await suggestTitlesAction(content);
      if (res.success && res.data) {
        setSuggestedTitles(res.data);
        setIsTitleModalOpen(true);
      } else {
        toast.error(res.error || "Failed to suggest titles.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Error suggesting titles.");
    } finally {
      setLoadingAction(null);
    }
  };

  // 4. Generate Mermaid Diagram
  const handleGenerateDiagram = async () => {
    if (!diagramPrompt.trim()) {
      toast.error("Please describe the diagram you want to generate.");
      return;
    }
    setLoadingAction("diagram");
    try {
      const res = await generateMermaidDiagramAction(diagramPrompt);
      if (res.success && res.data) {
        onInsertDiagram(res.data);
        toast.success("Mermaid diagram added to post!");
        setIsDiagramModalOpen(false);
        setDiagramPrompt("");
      } else {
        toast.error(res.error || "Failed to generate diagram.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Error generating diagram.");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-primary/5 dark:bg-muted/30 border border-primary/20 rounded-xl shadow-xs">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-primary px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
          <SparklesIcon className="w-3.5 h-3.5" />
          AI Copilot
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Auto Tags Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAutoTags}
          disabled={loadingAction !== null}
          className="h-8 text-xs gap-1.5 rounded-lg border-primary/20 hover:bg-primary/10 transition-colors"
        >
          {loadingAction === "tags" ? (
            <LoaderCircleIcon className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <SparklesIcon className="w-3.5 h-3.5 text-amber-500" />
          )}
          Auto Tags
        </Button>

        {/* Polish Markdown Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handlePolishMarkdown}
          disabled={loadingAction !== null}
          className="h-8 text-xs gap-1.5 rounded-lg border-primary/20 hover:bg-primary/10 transition-colors"
        >
          {loadingAction === "polish" ? (
            <LoaderCircleIcon className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Wand2Icon className="w-3.5 h-3.5 text-purple-500" />
          )}
          Polish Markdown
        </Button>

        {/* Suggest Titles Button / Modal */}
        <Dialog open={isTitleModalOpen} onOpenChange={setIsTitleModalOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSuggestTitles}
              disabled={loadingAction !== null}
              className="h-8 text-xs gap-1.5 rounded-lg border-primary/20 hover:bg-primary/10 transition-colors"
            >
              {loadingAction === "titles" ? (
                <LoaderCircleIcon className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LightbulbIcon className="w-3.5 h-3.5 text-yellow-500" />
              )}
              Suggest Titles
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <LightbulbIcon className="w-5 h-5 text-yellow-500" />
                Suggested Catchy Titles
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-2.5 py-3">
              {suggestedTitles.map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onApplyTitle(t);
                    setIsTitleModalOpen(false);
                    toast.success("Title applied!");
                  }}
                  className="flex items-center justify-between text-left text-sm p-3 rounded-lg border border-border bg-background hover:bg-accent hover:border-primary/40 transition-all group"
                >
                  <span>{t}</span>
                  <CheckIcon className="w-4 h-4 opacity-0 group-hover:opacity-100 text-primary transition-opacity" />
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Generate Mermaid Diagram Modal */}
        <Dialog open={isDiagramModalOpen} onOpenChange={setIsDiagramModalOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5 rounded-lg border-primary/20 hover:bg-primary/10 transition-colors"
            >
              <NetworkIcon className="w-3.5 h-3.5 text-blue-500" />
              AI Diagram
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <NetworkIcon className="w-5 h-5 text-blue-500" />
                Generate Mermaid Diagram
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-3 py-2">
              <label className="text-xs text-muted-foreground">
                Describe the architecture, sequence, or workflow chart you want to generate:
              </label>
              <input
                type="text"
                value={diagramPrompt}
                onChange={(e) => setDiagramPrompt(e.target.value)}
                placeholder="e.g. User login authentication flow with NextAuth & PostgreSQL"
                className="w-full px-3 py-2 text-sm border rounded-lg bg-background"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleGenerateDiagram();
                  }
                }}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={handleGenerateDiagram}
                disabled={loadingAction === "diagram"}
                className="gap-2"
              >
                {loadingAction === "diagram" ? (
                  <LoaderCircleIcon className="w-4 h-4 animate-spin" />
                ) : (
                  <SparklesIcon className="w-4 h-4" />
                )}
                Insert Diagram
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
