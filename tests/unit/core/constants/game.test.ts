import { describe, expect, it } from "vitest";
import {
  GAME_MESSAGES,
  GAME_DEFAULTS,
  MAP_CONFIG,
} from "@/core/constants/game";

describe("GAME_MESSAGES", () => {
  it("contains exit game action messages", () => {
    expect(GAME_MESSAGES.exitGame.button).toBe("ออกจากเกม");
    expect(GAME_MESSAGES.exitGame.title).toBeTruthy();
    expect(GAME_MESSAGES.exitGame.description).toBeTruthy();
    expect(GAME_MESSAGES.exitGame.confirm).toBeTruthy();
    expect(GAME_MESSAGES.exitGame.cancel).toBeTruthy();
  });
});

describe("GAME_DEFAULTS", () => {
  it("starts the mock game at round one", () => {
    expect(GAME_DEFAULTS.currentRound).toBe(1);
  });

  it("defines a positive round duration", () => {
    expect(GAME_DEFAULTS.roundDurationSeconds).toBeGreaterThan(0);
  });
});

describe("MAP_CONFIG", () => {
  it("has a valid center coordinate", () => {
    expect(MAP_CONFIG.center.lat).toBeGreaterThan(0);
    expect(MAP_CONFIG.center.lng).toBeGreaterThan(0);
  });

  it("has reasonable zoom settings", () => {
    expect(MAP_CONFIG.defaultZoom).toBeGreaterThanOrEqual(1);
    expect(MAP_CONFIG.maxZoom).toBeGreaterThan(MAP_CONFIG.defaultZoom);
  });

  it("has a tile URL with expected placeholders", () => {
    expect(MAP_CONFIG.tileUrl).toContain("{s}");
    expect(MAP_CONFIG.tileUrl).toContain("{z}");
    expect(MAP_CONFIG.tileUrl).toContain("{x}");
    expect(MAP_CONFIG.tileUrl).toContain("{y}");
  });

  it("has marker icon URLs defined", () => {
    expect(MAP_CONFIG.markerIcon.iconUrl).toContain("marker-icon");
    expect(MAP_CONFIG.markerIcon.iconRetinaUrl).toContain("marker-icon-2x");
    expect(MAP_CONFIG.markerIcon.shadowUrl).toContain("marker-shadow");
  });

  it("has valid marker icon dimensions", () => {
    expect(MAP_CONFIG.markerIcon.iconSize).toHaveLength(2);
    expect(MAP_CONFIG.markerIcon.iconAnchor).toHaveLength(2);
    expect(MAP_CONFIG.markerIcon.shadowSize).toHaveLength(2);
  });
});
