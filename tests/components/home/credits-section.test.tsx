import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CreditsSection } from "@/components/home/credits-section";

describe("CreditsSection", () => {
  it("renders the contributors section with the list of creators", () => {
    const markup = renderToStaticMarkup(<CreditsSection />);

    expect(markup).toContain('id="credits"');
    expect(markup).toContain("03 — THE PEOPLE BEHIND THE PINS");
    expect(markup).toContain("คณะผู้จัดทำ");
    expect(markup).toContain("Asnawee Ezor");
    expect(markup).toContain("Chanyanuch Thanusorn");
    expect(markup).toContain("Chitaworn Sinsuk");
  });
});
