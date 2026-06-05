import { createFileRoute } from "@tanstack/react-router";
import Wrapped from "@/wrapped/Wrapped";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Year in Code · Wrapped" },
      { name: "description", content: "A mobile-first year-in-review story for your GitHub year." },
      { property: "og:title", content: "Year in Code · Wrapped" },
      { property: "og:description", content: "A mobile-first year-in-review story for your GitHub year." },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Mona+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700;800&display=swap",
      },
    ],
  }),
  component: Wrapped,
});
