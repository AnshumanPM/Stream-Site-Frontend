import type { RefObject } from "react";

interface HeaderProps {
  logoRef: RefObject<HTMLImageElement | null>;
}

export default function Header({ logoRef }: HeaderProps) {
  return (
    <header>
      <nav className="bg-card border-b border-border">
        <div className="max-w-7xl flex items-center justify-center mx-auto p-4">
          <a href="/">
            <img
              ref={logoRef}
              src="https://xcdn.in/logo.svg"
              className="h-8"
              alt="logo"
              width={120}
              height={32}
            />
          </a>
        </div>
      </nav>
    </header>
  );
}
