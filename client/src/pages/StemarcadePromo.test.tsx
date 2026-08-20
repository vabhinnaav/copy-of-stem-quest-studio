// @vitest-environment jsdom
import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import StemarcadePromo from "./StemarcadePromo";

vi.mock("@/components/LightBloom", () => ({
  default: () => <div data-testid="light-bloom" />,
}));
vi.mock("@/components/RotatingText", () => ({
  default: ({ prefix, texts }: { prefix: string; texts: string[] }) => (
    <div data-testid="rotating-stemarcade-title">{prefix}{texts.join("")}</div>
  ),
}));
vi.mock("@/components/ZoomTextTunnel", () => ({
  default: () => <div data-testid="think-solve-play" />,
}));

describe("STEMARCADE promotional page", () => {
  it("keeps the supplied animation placements, requested contact address, and arcade destination", () => {
    render(<StemarcadePromo />);

    expect(screen.getByTestId("light-bloom")).toBeTruthy();
    expect(screen.getByTestId("rotating-stemarcade-title").textContent).toBe("STEMARCADE");
    expect(screen.getByTestId("think-solve-play")).toBeTruthy();
    expect(screen.getByText("atharvadeshpande2502@gmail.com")).toBeTruthy();
    expect(screen.getByText(/Tired of all the quizzes on STEMQUEST/i)).toBeTruthy();
    expect(screen.getByRole("link", { name: /take me there/i }).getAttribute("href")).toBe(
      "https://stemquestg-queoopxf.manus.space"
    );
  });
});
