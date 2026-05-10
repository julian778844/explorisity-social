import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, ImagePlus, Send, X } from "lucide-react";
import { api, type SocialPost } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const MAX_POST_IMAGE_SIZE = 3 * 1024 * 1024;

const categories: Array<{ value: SocialPost["category"]; label: string }> = [
  { value: "general", label: "General" },
  { value: "job", label: "Job" },
  { value: "event", label: "Event" },
  { value: "promotion", label: "Promotion" },
];

export default function EasyPostWidget({ compact = false }: { compact?: boolean }) {
  const { user, openSignIn } = useAuth();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [category, setCategory] = useState<SocialPost["category"]>("general");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: api.createPost,
    onSuccess: () => {
      setTitle("");
      setBody("");
      setUrl("");
      setImageUrl(null);
      setCategory("general");
      setError(null);
      qc.invalidateQueries({ queryKey: ["posts"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["public-profile"] });
    },
    onError: (e: Error) => setError(e.message),
  });

  function handleFile(file?: File) {
    setError(null);
    if (!file) return;

    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError("Use a PNG, JPG, JPEG, or WEBP image.");
      return;
    }

    if (file.size > MAX_POST_IMAGE_SIZE) {
      setError("Use an image under 3MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setImageUrl(String(reader.result || ""));
    reader.onerror = () => setError("Could not read that image. Try another file.");
    reader.readAsDataURL(file);
  }

  function submit() {
    setError(null);

    if (!user) {
      openSignIn("signin");
      return;
    }

    if (title.trim().length < 2) {
      setError("Add a short title.");
      return;
    }

    if (!body.trim()) {
      setError("Write something before posting.");
      return;
    }

    createMutation.mutate({
      category,
      title: title.trim(),
      body: body.trim(),
      url: url.trim() || null,
      imageUrl,
    });
  }

  return (
    <section className={`rounded-3xl border border-border bg-card shadow-sm ${compact ? "p-4" : "p-5"}`}>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Send className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-black">Post something</h2>
          <p className="text-xs font-semibold text-muted-foreground">Share an update, opportunity, event, or student milestone.</p>
        </div>
      </div>

      {!user && (
        <button
          onClick={() => openSignIn("signin")}
          className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-black text-primary-foreground"
        >
          Sign in to post
        </button>
      )}

      {user && (
        <div className="space-y-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as SocialPost["category"])}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-bold"
          >
            {categories.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title"
            className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm font-bold focus:border-primary focus:outline-none"
          />

          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What do you want to share?"
            rows={compact ? 3 : 4}
            className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm font-medium focus:border-primary focus:outline-none"
          />

          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Optional link"
            className="w-full rounded-xl border border-border bg-muted px-4 py-3 text-sm font-medium focus:border-primary focus:outline-none"
          />

          {imageUrl && (
            <div className="relative overflow-hidden rounded-2xl border border-border">
              <img src={imageUrl} alt="Post preview" className="max-h-80 w-full object-cover" />
              <button
                type="button"
                onClick={() => setImageUrl(null)}
                className="absolute right-3 top-3 rounded-full bg-black/70 p-2 text-white"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-black hover:bg-muted"
            >
              <ImagePlus className="h-4 w-4" />
              Add picture
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-black hover:bg-muted"
            >
              <Camera className="h-4 w-4" />
              Upload image
            </button>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700">
              {error}
            </div>
          )}

          <button
            onClick={submit}
            disabled={createMutation.isPending}
            className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-black text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {createMutation.isPending ? "Posting..." : "Post now"}
          </button>
        </div>
      )}
    </section>
  );
}
