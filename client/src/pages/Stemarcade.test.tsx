// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Stemarcade from "./Stemarcade";

vi.mock("@/components/GalleryTunnel", () => ({
  default: ({ onHoldComplete }: { onHoldComplete?: () => void }) => (
    <button data-testid="gallery-tunnel" type="button" onClick={onHoldComplete}>
      Gallery Tunnel
    </button>
  ),
}));

afterEach(() => {
  vi.useRealTimers();
  sessionStorage.clear();
  document.body.innerHTML = "";
});

describe("STEMARCADE page", () => {
  it("mounts the dedicated full-screen Gallery Tunnel experience", () => {
    render(<Stemarcade />);

    expect(
      screen
        .getByRole("main", { name: "STEMARCADE" })
        .classList.contains("stemarcade-page")
    ).toBe(true);
    expect(screen.getByTestId("gallery-tunnel")).toBeTruthy();
  });

  it("reveals the STEM concept deck after the tunnel reports a completed hold", () => {
    render(<Stemarcade />);

    expect(
      document.querySelector(".stemarcade-deck-layer.is-revealed")
    ).toBeNull();
    fireEvent.click(screen.getByTestId("gallery-tunnel"));
    expect(
      document.querySelector(".stemarcade-deck-layer.is-revealed")
    ).toBeTruthy();
    expect(
      screen.getByRole("group", { name: "STEM concept deck" })
    ).toBeTruthy();
    expect(screen.getByLabelText("Physics")).toBeTruthy();
    expect(screen.getByLabelText("Chemistry")).toBeTruthy();
    expect(screen.getByLabelText("Math")).toBeTruthy();
    expect(screen.getByLabelText("Coding")).toBeTruthy();
  });

  it("returns to the learning workspace through the visible return control", () => {
    vi.useFakeTimers();
    window.history.pushState({}, "", "/stemarcade");
    sessionStorage.setItem("stemarcade-return-path", "/?workspacePreview=1");
    render(<Stemarcade />);

    fireEvent.click(screen.getByRole("button", { name: /back to workspace/i }));
    expect(
      document.querySelector(".stemarcade-return-transition")
    ).toBeTruthy();

    vi.advanceTimersByTime(260);
    expect(`${window.location.pathname}${window.location.search}`).toBe(
      "/?workspacePreview=1"
    );
  });

  it("opens a selected subject game immediately without a transition overlay", () => {
    window.history.pushState({}, "", "/stemarcade");
    render(<Stemarcade />);

    fireEvent.click(screen.getByTestId("gallery-tunnel"));
    fireEvent.click(screen.getByLabelText("Physics"));
    expect(window.location.pathname).toBe("/stemarcade/physics");
    expect(document.querySelector(".stemarcade-game-transition")).toBeNull();
  });

  it("renders the corresponding user-supplied game in an isolated frame", () => {
    window.history.pushState({}, "", "/stemarcade/coding");
    render(<Stemarcade />);

    const frame = screen.getByTitle("Coding · Challenge Arena");
    expect(frame.getAttribute("src")).toBe(
      "/manus-storage/coding-challenge-arena_fc7cdf74.html"
    );
    expect(
      screen.getByRole("link", { name: /back to arcade/i })
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /learning workspace/i })
    ).toBeTruthy();
  });

  it("returns from a supplied game to the visible revealed deck", () => {
    window.history.pushState({}, "", "/stemarcade/chemistry");
    render(<Stemarcade />);

    const returnLink = screen.getByRole("link", { name: /back to arcade/i });
    expect(returnLink.getAttribute("href")).toBe("/stemarcade?deckPreview=1");
  });
});
