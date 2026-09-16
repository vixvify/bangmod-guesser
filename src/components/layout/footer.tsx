import { Contributors } from "@/lib/data";

export function Footer() {
  return (
    <footer className="relative z-20 px-6 py-5 sm:px-10">
      <div className="flex flex-col items-center justify-between gap-2 text-[0.6rem] tracking-wide text-secondary-light/60 sm:flex-row">
        <span>Made at Bangmod</span>
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          {Contributors.map((contributor) => (
            <li key={contributor.name}>
              <a
                href={contributor.href}
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-focus"
              >
                {contributor.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
