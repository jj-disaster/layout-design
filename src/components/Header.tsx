"use client";

import Link from "next/link";
import { useState } from "react";
/*buttons and their paths */
const ITEMS = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/other", label: "Other" },
];

export default function Header() {
  const [showGuides, setShowGuides] = useState(false);
  const [catOn, setCatOn] = useState(false);

  const toggleGuides = () => {
    const next = !showGuides;
    setShowGuides(next);
    document.documentElement.style.setProperty("--show-guides", next ? "1" : "0");
  };

  // Dev-only toggle: tree-shaken out of production static exports.
  const showGuideToggle = process.env.NODE_ENV === "development";

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-12 items-center gap-0 bg-black/100 px-0">
      <div
        aria-hidden="true"
        className="guide absolute inset-x-0 bottom-0 h-px"
      />
      {ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-label={item.label}
          className="group guide relative flex items-center self-stretch px-4 md:px-6 font-nanum text-xs tracking-[0.2em] text-white select-none transition-colors duration-300 hover:bg-white/[0.1] hover:text-highlight"
        >
          {item.label}
          {/* underline for buttons */}
          {/* <span
            aria-hidden="true"
            className="absolute right-4 bottom-2 left-4 h-px origin-left scale-x-0 bg-highlight transition-transform duration-150 group-hover:scale-x-100"
          /> */}
        </Link>
      ))}
      <div className="guide ml-auto flex items-center">
        {showGuideToggle && (
          <button
            type="button"
            aria-label="toggle layout guide lines"
            aria-pressed={showGuides}
            onClick={toggleGuides}
            className="guide flex items-center justify-center p-3 text-white select-none transition-colors duration-300 hover:bg-white/[0.06] hover:text-highlight"
          >
            <span
              aria-hidden="true"
              className={`text-sm leading-none transition-colors ${
                showGuides ? "text-highlight" : "text-white/30"
              }`}
            >
              ✓
            </span>
          </button>
        )}
        <button
          type="button"
          aria-label="sidebar navigator"
          aria-pressed={catOn}
          onClick={() => setCatOn(!catOn)}
          className="guide p-3 text-white select-none transition-colors duration-300 hover:bg-white/[0.06] hover:text-highlight"
        >
          <span
            aria-hidden="true"
            className={`font-nanum text-xs tracking-[0.2em] transition-colors ${
              catOn ? "text-highlight" : ""
            }`}
          >
            ⚞^. .^⚟
          </span>
        </button>
      </div>
    </header>
  );
}