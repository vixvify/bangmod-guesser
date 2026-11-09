// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { UpdateLocation } from "@/features/locations/components/update-location";
import { LOCATION_MESSAGES } from "@/features/locations/location.constants";

const mocks = vi.hoisted(() => ({
  put: vi.fn(), error: vi.fn(), success: vi.fn(), push: vi.fn(),
  HttpError: class extends Error {
    constructor(message: string, public status: number) { super(message); }
  },
}));

vi.mock("@/shared/lib/http", () => ({ default: { put: mocks.put }, HttpError: mocks.HttpError }));
vi.mock("@/features/locations/location.routes", () => ({ LocationRoutes: { update: (id: string) => `/locations/${id}` } }));
vi.mock("sonner", () => ({ toast: { error: mocks.error, success: mocks.success } }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock("@/features/locations/components/location-form", () => ({
  LocationForm: ({ onSave }: { onSave: (values: unknown, images: unknown) => void }) => (
    <button onClick={() => onSave(
      { name: "CB2", description: "", latitude: 13.65, longitude: 100.49 },
      { keepImageNumbers: [1], newImages: [] },
    )}>save</button>
  ),
}));

afterEach(() => { cleanup(); vi.clearAllMocks(); });

it("sends the loaded image snapshot and shows a conflict without navigating away", async () => {
  mocks.put.mockRejectedValueOnce(new mocks.HttpError("Conflict", 409));
  render(<UpdateLocation header={null} location={{
    id: "loc_1", name: "CB2", description: null, latitude: 13.65, longitude: 100.49,
    images: [{ imageNumber: 1, url: "https://example.com/image.jpg" }],
  }} />);
  fireEvent.click(screen.getByRole("button", { name: "save" }));
  await waitFor(() => expect(mocks.error).toHaveBeenCalledWith(LOCATION_MESSAGES.updateConflict));
  const form = mocks.put.mock.calls[0][1] as FormData;
  expect(JSON.parse(String(form.get("expectedImages")))).toEqual([
    { imageNumber: 1, imageUrl: "https://example.com/image.jpg" },
  ]);
  expect(mocks.push).not.toHaveBeenCalled();
});
