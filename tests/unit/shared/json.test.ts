import { describe, expect, it } from "vitest";
import { parseJson, readJson } from "@/shared/lib/json";

describe("JSON input", () => {
  it("parses a valid JSON string", () => {
    expect(parseJson('{"value":1}')).toEqual({ value: 1 });
  });

  it("reports invalid string and request JSON as a 400 error", async () => {
    expect(() => parseJson("{")).toThrow("Invalid JSON payload");
    await expect(readJson(new Request("http://localhost", { method: "POST", body: "{" })))
      .rejects.toMatchObject({ status: 400, message: "Invalid JSON payload" });
  });
});
