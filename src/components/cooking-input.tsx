import { Link } from "@tanstack/react-router";
import { Camera, Refrigerator, ArrowUp, Loader2, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CookingInput({
  value,
  onChange,
  onSubmit,
  busy = false,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  busy?: boolean;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="cooking-input rounded-3xl border border-border/80 bg-card/90 p-3 backdrop-blur-md transition-colors"
    >
      <Input
        aria-label="Ask MealMate"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="What can I cook today?"
        maxLength={200}
        className="h-11 min-w-0 border-0 bg-transparent px-2 text-base shadow-none focus-visible:border-transparent focus-visible:bg-transparent focus-visible:ring-0"
      />
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
        <div className="flex min-w-0 gap-1">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="size-11 rounded-full"
            title="Scan ingredients"
          >
            <Link to="/scan" search={{ mode: "ingredients" }} aria-label="Scan ingredients">
              <Camera />
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="size-11 rounded-full"
            title="Pantry"
          >
            <Link to="/pantry" aria-label="Pantry">
              <Refrigerator />
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="size-11 rounded-full"
            title="Meal planner"
          >
            <Link to="/planner" aria-label="Meal planner">
              <CalendarDays />
            </Link>
          </Button>
        </div>
        <Button
          type="submit"
          size="icon"
          className="size-11 shrink-0 rounded-full"
          disabled={busy || !value.trim()}
          aria-label="Send question"
        >
          {busy ? <Loader2 className="animate-spin" /> : <ArrowUp />}
        </Button>
      </div>
    </form>
  );
}
