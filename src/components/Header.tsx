import Link from "next/link";
/*buttons and their paths */
const ITEMS = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Work" },
  { href: "/other", label: "Other" },
];

export default function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-12 items-center gap-8 bg-black/100 px-6">
      <div
        aria-hidden="true"
        className="guide absolute inset-x-0 bottom-0 h-px"
      />
      {ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-label={item.label}
          className="group guide relative flex items-center self-stretch px-4 font-nanum text-xs tracking-[0.2em] text-white select-none transition-colors duration-300 hover:bg-white/[0.1] hover:text-[#dd9ff5]"
        >
          {item.label}
          {/* underline for buttons */}
          {/* <span
            aria-hidden="true"
            className="absolute right-4 bottom-2 left-4 h-px origin-left scale-x-0 bg-[#dd9ff5] transition-transform duration-150 group-hover:scale-x-100"
          /> */}
        </Link>
      ))}
      <button
        type="button"
        aria-label="sidebar navigator"
        className="guide ml-auto p-3 text-white select-none transition-colors duration-300 hover:bg-white/[0.06] hover:text-[#dd9ff5]"
      >
        <span aria-hidden="true" className="font-nanum text-xs tracking-[0.2em]">
          ⚞^. .^⚟
        </span>
      </button>
    </header>
  );
}
