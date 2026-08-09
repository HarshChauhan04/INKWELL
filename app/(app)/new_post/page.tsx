"use client";
import { createPost } from "@/actions/post.actions";
import RevealHero from "@/components/animations/RevealHero";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Markdown from "@/utils/markdown";
import {
  ArrowBigDownIcon,
  ExternalLinkIcon,
  LoaderCircleIcon,
  PencilIcon,
  TagIcon,
  XIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useState, KeyboardEvent } from "react";
import AICopilotToolbar from "@/components/AICopilotToolbar";

type PostFormValues = {
  title: string;
  content: string;
};

export default function NewPostPage() {
  const router = useRouter();
  const form = useForm<PostFormValues>({
    defaultValues: { title: "", content: "" },
  });
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const addTag = () => {
    const normalized = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (normalized && !tags.includes(normalized) && tags.length < 5) {
      setTags((prev) => [...prev, normalized]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  const scrollToPreview = () => {
    const previewSection = document.querySelector("#preview");
    if (previewSection) {
      previewSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSubmit = async (data: PostFormValues) => {
    try {
      const postData = await createPost({
        title: data.title,
        content: data.content,
        tags,
      });

      if (postData.id) {
        toast.success("Post created successfully!");
        router.push(`/posts/${postData.id}`);
      } else {
        throw new Error("Post creation failed.");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post. Please try again.");
    }
  };

  return (
    <section className="flex flex-col h-full gap-5 max-w-4xl mx-auto p-4 w-full">
      <RevealHero className="mx-auto">
        <div className="flex items-center gap-3">
          <span className="w-1 h-7 bg-primary rounded-full block" />
          <span className="text-2xl font-bold tracking-tight">New Post</span>
        </div>
      </RevealHero>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-4"
      >
        <input
          {...form.register("title", { required: true })}
          placeholder="Post title..."
          className="border border-border/50 rounded-xl px-4 py-3 bg-card text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all duration-200 text-lg font-semibold"
        />

        {/* Tags input */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 border border-border/50 rounded-xl px-3 py-2.5 bg-card flex-wrap focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/40 transition-all duration-200">
            <TagIcon className="w-4 h-4 text-primary/60 shrink-0" />
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-medium px-2 py-0.5 rounded-full border border-primary/20"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-destructive transition-colors ml-0.5"
                >
                  <XIcon className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={addTag}
              placeholder={tags.length < 5 ? "Add tags (Enter or comma)..." : "Max 5 tags"}
              disabled={tags.length >= 5}
              className="flex-1 min-w-[180px] bg-transparent outline-none text-sm placeholder:text-muted-foreground/50"
            />
          </div>
          <p className="text-xs text-muted-foreground/60">
            Up to 5 tags. Press <kbd className="px-1 py-0.5 bg-muted/60 rounded text-xs border border-border/30">Enter</kbd> or <kbd className="px-1 py-0.5 bg-muted/60 rounded text-xs border border-border/30">,</kbd> to add.
          </p>
        </div>

        <AICopilotToolbar
          title={form.watch("title") || ""}
          content={form.watch("content") || ""}
          onApplyTags={(newTags) => {
            setTags((prev) => Array.from(new Set([...prev, ...newTags])).slice(0, 5));
          }}
          onApplyContent={(newContent) => {
            form.setValue("content", newContent);
          }}
          onApplyTitle={(newTitle) => {
            form.setValue("title", newTitle);
          }}
          onInsertDiagram={(diagramMarkdown) => {
            const current = form.getValues("content") || "";
            const updated = current ? `${current}\n\n${diagramMarkdown}` : diagramMarkdown;
            form.setValue("content", updated);
          }}
        />

        <Textarea
          {...form.register("content", { required: true })}
          placeholder="Write your post in markdown..."
          className="min-h-[200px] border-border/50 bg-card rounded-xl focus:ring-primary/30 focus:border-primary/40 placeholder:text-muted-foreground/50 resize-y transition-all duration-200"
        />
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 hover:shadow-primary/35 transition-all"
          >
            {form.formState.isSubmitting ? (
              <LoaderCircleIcon className="animate-spin" />
            ) : (
              <PencilIcon />
            )}
            Create Post
          </Button>
          <Button type="button" variant="secondary" onClick={scrollToPreview} className="border border-border/50">
            Preview
            <ArrowBigDownIcon />
          </Button>
        </div>
      </form>

      <div className="flex flex-col gap-4 mt-4">
        <div className="text-balance text-center border border-border/40 bg-card/60 shadow-sm rounded-2xl py-3 px-4 w-max max-w-full mx-auto text-sm text-muted-foreground">
          <b className="text-foreground">Tip:</b>{" "}
          Use markdown syntax for formatting.{" "}
          <Link
            href="https://www.markdownguide.org/basic-syntax/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="link" className="text-primary px-1 h-auto">
              Markdown Guide
              <ExternalLinkIcon className="w-3 h-3" />
            </Button>
          </Link>
          or try
          <Link
            href="https://stackedit.io/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="link" className="text-primary px-1 h-auto">
              StackEdit
              <ExternalLinkIcon className="w-3 h-3" />
            </Button>
          </Link>
        </div>
        <div
          id="preview"
          className="border border-border/40 shadow-md rounded-2xl overflow-hidden bg-card"
        >
          <p className="py-3 px-5 bg-card font-bold text-base border-b border-border/40 flex items-center gap-2">
            <span className="w-1 h-5 bg-primary rounded-full block" />
            Preview
          </p>
          <div className="px-5 py-2 prose dark:prose-invert max-w-none">
            <Markdown
              content={form.watch("content") || `# No Content to display`}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
