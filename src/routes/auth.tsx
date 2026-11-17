import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/auth")({
  beforeLoad: () => {
    throw redirect({ to: "/welcome" });
  },
  head: () => ({
    meta: [
      { title: "Welcome to MealMate" },
      {
        name: "description",
        content: "Discover restaurants, plan meals, and make every bite count with MealMate.",
      },
      { property: "og:title", content: "Welcome to MealMate" },
      {
        property: "og:description",
        content: "Discover restaurants, plan meals, and make every bite count with MealMate.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});