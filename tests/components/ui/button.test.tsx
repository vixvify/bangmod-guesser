import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders a disabled primary button with native button semantics", () => {
    const markup = renderToStaticMarkup(<Button disabled>Play</Button>);

    expect(markup).toContain("Play");
    expect(markup).toContain("disabled");
    expect(markup).toContain("background-color:var(--color-primary-main)");
    expect(markup).toContain(".Mui-disabled");
    expect(markup).toContain('type="button"');
  });

  it("supports reusable outline icon buttons", () => {
    const markup = renderToStaticMarkup(
      <Button variant="outline" size="icon" aria-label="Settings">
        <span>⚙</span>
      </Button>,
    );

    expect(markup).toContain('aria-label="Settings"');
    expect(markup).toContain("width:2.5rem");
    expect(markup).toContain("height:2.5rem");
    expect(markup).toContain("border:0.0625rem solid rgb(255 255 255 / 15%)");
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

    expect(markup).toContain(
      "color:color-mix(in srgb, var(--color-secondary-light) 75%, transparent)",
    );
    expect(markup).toContain("custom-button-class");
  });

  it("supports a reusable light surface style", () => {
    const markup = renderToStaticMarkup(
      <Button variant="surface">Open menu</Button>,
    );

    expect(markup).toContain("background-color:#fff");
    expect(markup).toContain("color:#000");
    expect(markup).toContain(":not(.Mui-disabled):hover");
    expect(markup).toContain("border-color:var(--color-primary-main)");
    expect(markup).toContain("transition:background-color 180ms ease");
    expect(markup).not.toContain("translateY");
  });

  it("uses the same inherited font for surface links and native buttons", () => {
    const login = renderToStaticMarkup(
      <Button href="/login" variant="surface" size="small">
        เข้าสู่ระบบ
      </Button>,
    );
    const logout = renderToStaticMarkup(
      <Button variant="surface" size="small">
        ออกจากระบบ
      </Button>,
    );

    expect(login).toContain("font-family:inherit");
    expect(logout).toContain("font-family:inherit");
    expect(login).toContain("text-decoration:none");
    expect(logout).toContain("text-decoration:none");
  });

  it("only animates the Play glow on hover", () => {
    const markup = renderToStaticMarkup(<Button variant="play">PLAY</Button>);

    expect(markup).toContain("0 0 0 rgb(255 122 47 / 0%)");
    expect(markup).toContain("box-shadow 240ms");
    expect(markup).toContain("0 0 2rem rgb(255 122 47 / 55%)");
    expect(markup).not.toContain("filter:brightness");
    expect(markup).not.toContain("::after");
    expect(markup).not.toContain("transform:");
  });
});
