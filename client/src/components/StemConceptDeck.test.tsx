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
  it("keeps wheel movement while a single click selects a card without re-centering it", () => {
    vi.useFakeTimers();
    const onSelect = vi.fn();
    render(<StemConceptDeck onSelect={onSelect} />);

    const deck = screen.getByRole("group", { name: "STEM concept deck" });
    const physics = screen.getByLabelText("Physics");
    const chemistry = screen.getByLabelText("Chemistry");

    expect(physics.style.transform).toContain("translateX(0px)");
    fireEvent.wheel(deck, { deltaY: 120 });
    expect(physics.style.transform).toContain("translateX(-240px)");

    vi.advanceTimersByTime(600);
    const beforeHover = chemistry.style.transform;
    fireEvent.pointerEnter(chemistry);
    expect(chemistry.style.transform).not.toBe(beforeHover);
    fireEvent.pointerLeave(chemistry);

    const beforeSelect = chemistry.style.transform;
    fireEvent.click(chemistry);
    expect(onSelect).toHaveBeenCalledWith("Chemistry");
    expect(chemistry.style.transform).toBe(beforeSelect);
  });

  it("advances the revealed STEM deck through a mobile touch swipe", () => {
    vi.useFakeTimers();
    render(<StemConceptDeck />);

    const deck = screen.getByRole("group", { name: "STEM concept deck" });
    const physics = screen.getByLabelText("Physics");
    fireEvent.pointerDown(deck, { pointerType: "touch", clientX: 260 });
    fireEvent.pointerUp(deck, { pointerType: "touch", clientX: 80 });

    expect(physics.style.transform).toContain("translateX(-240px)");
  });
});
