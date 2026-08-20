// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Stemarcade from "./Stemarcade";

vi.mock("@/components/GalleryTunnel", () => ({
  default: () => <div data-testid="gallery-tunnel" />,
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
});
