// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import Home from "./Home";
import { JourneyLanding } from "@/components/JourneyLanding";
import { DeviceAIMentor } from "@/components/DeviceAIMentor";
import { DeviceProfileManager } from "@/components/DeviceProfileManager";
import { JOURNEY_EVENTS } from "@/lib/journeyContract";
import {
  loadOrCreateLocalLearner,
  signOutLocalLearner,
} from "@/lib/localProgress";

vi.mock("@/components/OrangeVisuals", () => ({
  ReactiveLinesBackdrop: () => <div data-testid="reactive-lines" />,
  OrbitCube: () => <div data-testid="orbit-cube" />,
  TypewriterWordmark: () => <div>STEMQUEST</div>,
}));

vi.mock("@/components/AIChatBox", () => ({
  AIChatBox: () => <div>Mentor conversation</div>,
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    stem: {
      generateQuestion: {
        useMutation: () => ({ mutate: vi.fn(), isPending: false }),
      },
      submitAnswer: {
        useMutation: () => ({ mutate: vi.fn(), isPending: false }),
      },
      followUp: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
    },
    mentor: {
      chat: { useMutation: () => ({ mutate: vi.fn(), isPending: false }) },
    },
  },
}));

class TestResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(globalThis, "ResizeObserver", {
  configurable: true,
  value: TestResizeObserver,
});

const scrollIntoView = vi.fn();
Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
  configurable: true,
  value: scrollIntoView,
});

afterEach(() => {
  localStorage.clear();
  signOutLocalLearner();
  document.body.innerHTML = "";
});

describe("redesigned learner journey UI", () => {
  it("moves from landing through setup into the real workspace and exposes the working profile, mentor, subject, and follow-up controls", async () => {
    const user = userEvent.setup();
    window.history.pushState({}, "", "/");
    const first = render(
      <>
        <Home />
        <DeviceProfileManager />
        <DeviceAIMentor />
      </>
    );

    expect(
      screen.getByRole("heading", { name: /practice with curiosity/i })
    ).toBeTruthy();
    expect(
      screen.getAllByRole("button", { name: /start learning/i })
    ).toHaveLength(2);
    expect(
      screen.getByRole("button", { name: /configure ai provider/i })
    ).toBeTruthy();
    await user.click(
      screen.getAllByRole("button", { name: /start learning/i })[0]
    );
    expect(scrollIntoView).toHaveBeenCalled();
    await user.click(
      screen.getByRole("button", { name: /configure ai provider/i })
    );
    expect(screen.getByText(/bring your own ai provider/i)).toBeTruthy();
    await user.click(
      screen.getByRole("button", { name: /close provider settings/i })
    );

    await user.type(screen.getByLabelText(/learner name/i), "Ada");
    await user.click(
      screen.getByRole("button", { name: /search & enter workspace/i })
    );

    expect(screen.getByText("Learning workspace")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Profile" })).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /start practice/i })
    ).toBeTruthy();
    expect(screen.getByText("Choose a practice area")).toBeTruthy();
    for (const subject of [
      "Science",
      "Technology",
      "Engineering",
      "Mathematics",
    ])
      expect(
        screen.getByRole("button", { name: new RegExp(subject, "i") })
      ).toBeTruthy();
    expect(document.querySelectorAll(".subject-peel")).toHaveLength(4);
    expect(document.querySelectorAll(".subject-peel-corner")).toHaveLength(4);
    const stemarcadeButtons = screen.getAllByRole("button", {
      name: "STEMARCADE",
    });
    expect(stemarcadeButtons).toHaveLength(2);
    const desktopStemarcade = stemarcadeButtons.find(
      button => button.dataset.stemarcadeVariant === "desktop"
    );
    const mobileStemarcade = stemarcadeButtons.find(
      button => button.dataset.stemarcadeVariant === "mobile"
    );
    expect(desktopStemarcade).toBeTruthy();
    expect(mobileStemarcade).toBeTruthy();
    await user.hover(desktopStemarcade!);
    await user.click(desktopStemarcade!);
    expect(document.querySelector(".stemarcade-route-transition")).toBeTruthy();
    mobileStemarcade!.focus();
    expect(document.activeElement).toBe(mobileStemarcade);
    await user.click(mobileStemarcade!);
    expect(screen.getByText("Learning workspace")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Profile" }));
    expect(
      screen.getByRole("dialog", { name: /manage learner profile/i })
    ).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /close profile/i }));
    await user.click(screen.getByRole("button", { name: /ai mentor/i }));
    expect(screen.getByText(/performance-aware ai mentor/i)).toBeTruthy();
    await user.click(screen.getByRole("button", { name: /close ai mentor/i }));
    await user.click(screen.getByRole("button", { name: /^science/i }));
    expect(
      screen.getByRole("heading", { name: /set your challenge/i })
    ).toBeTruthy();
    expect(screen.getByText(/need more help/i)).toBeTruthy();
    expect(screen.queryByText(/current setup/i)).toBeNull();
    expect(screen.queryByText(/your practice space is ready/i)).toBeNull();
    expect(screen.queryByText(/select the focus and format/i)).toBeNull();
    expect(screen.queryByText(/recent activity/i)).toBeNull();

    first.unmount();
    window.history.pushState({}, "", "/?followUpPreview=1");
    render(
      <>
        <Home />
        <DeviceProfileManager />
        <DeviceAIMentor />
      </>
    );
    expect(screen.getByRole("button", { name: /next question/i })).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /ask about this question/i })
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: /ask tutor/i })).toBeTruthy();
  });

  it("wires the setup provider control to the active provider-settings event", async () => {
    const user = userEvent.setup();
    const onSettings = vi.fn();
    window.addEventListener(JOURNEY_EVENTS.openMentorSettings, onSettings);
    render(<JourneyLanding onEnter={vi.fn()} />);
    await user.click(
      screen.getByRole("button", { name: /configure ai provider/i })
    );
    expect(onSettings).toHaveBeenCalledTimes(1);
    window.removeEventListener(JOURNEY_EVENTS.openMentorSettings, onSettings);
  });

  it("opens the actual profile and provider overlays from their registered global events", () => {
    loadOrCreateLocalLearner("Ada");
    render(
      <>
        <DeviceProfileManager />
        <DeviceAIMentor />
      </>
    );

    fireEvent(window, new Event(JOURNEY_EVENTS.openProfile));
    expect(
      screen.getByRole("dialog", { name: /manage learner profile/i })
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /switch learner/i })
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /delete this learner profile/i })
    ).toBeTruthy();

    fireEvent(window, new Event(JOURNEY_EVENTS.openMentorSettings));
    expect(screen.getByText(/bring your own ai provider/i)).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /save session connection/i })
    ).toBeTruthy();
  });
});
