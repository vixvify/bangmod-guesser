import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders a disabled primary button with native button semantics", () => {
    const markup = renderToStaticMarkup(<Button disabled>Play</Button>);

    expect(markup).toContain("Play");
    expect(markup).toContain("disabled");
    expect(markup).toContain("bg-primary-main");
    expect(markup).toContain('type="button"');
  });

  it("supports reusable outline icon buttons", () => {
    const markup = renderToStaticMarkup(
      <Button variant="outline" size="icon" aria-label="Settings">
        <span>⚙</span>
      </Button>,
    );

    expect(markup).toContain('aria-label="Settings"');
    expect(markup).toContain("h-10 w-10");
    expect(markup).toContain("border-white/15");
  });

  it("renders navigation buttons as links when href is provided", () => {
    const markup = renderToStaticMarkup(<Button href="/login">Login</Button>);

    expect(markup).toContain('href="/login"');
    expect(markup).toContain("Login");
  });

  it("supports ghost styling and custom classes", () => {
    const markup = renderToStaticMarkup(
      <Button variant="ghost" className="custom-button-class">
        Logout
      </Button>,
    );

    expect(markup).toContain("text-secondary-light/75");
    expect(markup).toContain("custom-button-class");
  });
});
