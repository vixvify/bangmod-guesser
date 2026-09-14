import { vi } from "vitest";

// jsdom has no native modal top layer. Browser checks cover focus and Escape.
export function mockDialog() {
  const prototype = HTMLDialogElement.prototype;
  const originalShow = Object.getOwnPropertyDescriptor(prototype, "showModal");
  const originalClose = Object.getOwnPropertyDescriptor(prototype, "close");
  Object.defineProperty(prototype, "showModal", {
    configurable: true,
    value: vi.fn(function (this: HTMLDialogElement) { this.open = true; }),
  });
  Object.defineProperty(prototype, "close", {
    configurable: true,
    value: vi.fn(function (this: HTMLDialogElement) { this.open = false; }),
  });
  return () => {
    if (originalShow) Object.defineProperty(prototype, "showModal", originalShow);
    else Reflect.deleteProperty(prototype, "showModal");
    if (originalClose) Object.defineProperty(prototype, "close", originalClose);
    else Reflect.deleteProperty(prototype, "close");
  };
}
