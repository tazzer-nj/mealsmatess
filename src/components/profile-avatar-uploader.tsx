import { useState, useRef } from "react";
import { Camera, Sparkles, Upload, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { MASCOT_THEMES } from "@/lib/mascot-theme";

const MIA_DEFAULT_AVATARS = [
  ...MASCOT_THEMES.map((t) => ({ name: t.name, url: t.image })),
  { name: "Chef Mia", url: "/src/assets/mealmate-chef.png" },
];

type ProfileAvatarUploaderProps = {
  value: string;
  onChange: (url: string) => void;
};

export function ProfileAvatarUploader({ value, onChange }: ProfileAvatarUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<"upload" | "mia">("upload");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Image file is too large. Please choose an image under 3MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onChange(reader.result);
        toast.success("Avatar loaded from your library!");
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="group relative h-24 w-24 overflow-hidden rounded-full border-2 border-border bg-secondary shadow-sm">
          {value ? (
            <img src={value} alt="Profile Avatar" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
              <UserIcon className="h-10 w-10" />
            </div>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100"
            title="Change photo"
          >
            <Camera className="h-6 w-6 text-white" />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex items-center gap-2 rounded-xl bg-secondary p-1">
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === "upload"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            Device Library
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("mia")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === "mia"
                ? "bg-card text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Mia Mascot Pics
          </button>
        </div>
      </div>

      {activeTab === "upload" ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-4 text-center">
          <p className="text-xs font-medium text-foreground">Choose a photo from your device</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">JPG, PNG, WebP up to 3MB</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-3 inline-flex items-center gap-2 rounded-xl border border-border bg-secondary px-4 py-2 text-xs font-medium text-foreground hover:bg-muted"
          >
            <Upload className="h-4 w-4" />
            Browse Device Library
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Pick a Mia mascot & chef default
          </p>
          <div className="grid grid-cols-4 gap-2.5 max-h-44 overflow-y-auto p-1">
            {MIA_DEFAULT_AVATARS.map((avatar) => {
              const selected = value === avatar.url;
              return (
                <button
                  key={avatar.name}
                  type="button"
                  onClick={() => {
                    onChange(avatar.url);
                    toast.success(`Selected ${avatar.name}!`);
                  }}
                  className={`group relative flex flex-col items-center gap-1 rounded-xl border p-1.5 transition-all ${
                    selected
                      ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-secondary">
                    <img
                      src={avatar.url}
                      alt={avatar.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <span className="w-full truncate text-center text-[10px] font-medium text-muted-foreground group-hover:text-foreground">
                    {avatar.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
