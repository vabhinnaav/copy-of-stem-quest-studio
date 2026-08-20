// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import StemConceptDeck from "./StemConceptDeck";

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = "";
});

describe("STEM concept coverflow", () => {
  it("preserves the supplied coverflow wheel, keyboard, and card-centering mechanics with STEM-only card content", () => {
    vi.useFakeTimers();
    render(<StemConceptDeck />);

    const deck = screen.getByRole("group", { name: "STEM concept deck" });
    const science = screen.getByLabelText("Science");
    const technology = screen.getByLabelText("Technology");

    expect(science.style.transform).toContain("translateX(0px)");
    fireEvent.wheel(deck, { deltaY: 120 });
    expect(science.style.transform).toContain("translateX(-240px)");

    vi.advanceTimersByTime(600);
    fireEvent.keyDown(deck, { key: "ArrowLeft" });
    expect(science.style.transform).toContain("translateX(0px)");

    vi.advanceTimersByTime(600);
    fireEvent.click(technology);
    expect(technology.style.transform).toContain("translateX(0px)");
  });

  it("advances the revealed STEM deck through a mobile touch swipe", () => {
    vi.useFakeTimers();
    render(<StemConceptDeck />);

    const deck = screen.getByRole("group", { name: "STEM concept deck" });
    const science = screen.getByLabelText("Science");
    fireEvent.pointerDown(deck, { pointerType: "touch", clientX: 260 });
    fireEvent.pointerUp(deck, { pointerType: "touch", clientX: 80 });

    expect(science.style.transform).toContain("translateX(-240px)");
  });
});
