import { useEffect, useRef } from "react";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

import "../styles.css";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const logoRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = (dark: boolean) => {
      document.documentElement.classList.toggle("dark", dark);
      if (logoRef.current) {
        logoRef.current.src = dark
          ? "https://xcdn.in/logo.svg"
          : "https://xcdn.in/logo-dark.svg";
      }
    };

    applyTheme(mq.matches);
    const handler = (e: MediaQueryListEvent) => applyTheme(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <>
      <TooltipProvider>
        <div className="flex flex-col min-h-screen bg-background text-foreground">
          <Header logoRef={logoRef} />
          <main className="grow">
            <Outlet />
          </main>
          <Footer />
        </div>
      </TooltipProvider>
      <TanStackDevtools
        config={{ position: "bottom-right" }}
        plugins={[{ name: "TanStack Router", render: <TanStackRouterDevtoolsPanel /> }]}
      />
    </>
  );
}