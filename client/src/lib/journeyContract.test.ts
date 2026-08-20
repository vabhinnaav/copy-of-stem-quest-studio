import { describe, expect, it } from "vitest";
import { JOURNEY_CONTROLS, JOURNEY_EVENTS, canEnterWorkspace, dispatchJourneyEvent, normalizeJourneyName } from "./journeyContract";

describe("redesigned STEM Quest journey", () => {
  it("normalizes learner entry before the animated workspace transition", () => {
    expect(normalizeJourneyName("  Ada Lovelace  ")).toBe("Ada Lovelace");
    expect(canEnterWorkspace("  ")).toBe(false);
    expect(canEnterWorkspace("Ada")).toBe(true);
  });

  it("declares active destinations for every redesigned global journey control", () => {
    expect(JOURNEY_CONTROLS).toMatchObject({
      landingStart: "setup",
      landingAbout: "about",
      landingEmail: "mailto:hello@stemquest.study",
      setupProvider: JOURNEY_EVENTS.openMentorSettings,
      setupEntry: "workspace",
      workspaceMentor: JOURNEY_EVENTS.openMentor,
      workspaceProfile: JOURNEY_EVENTS.openProfile,
      workspacePractice: "practice-settings",
      workspaceActivity: "activity",
      workspaceScience: "launch.science",
      workspaceTechnology: "launch.technology",
      workspaceEngineering: "launch.engineering",
      workspaceMathematics: "launch.mathematics",
      practiceBack: "workspace",
      practiceGenerate: "stem.generateQuestion",
      questionHint: "toggleHint",
      questionSubmit: "stem.submitAnswer",
      resultNext: "stem.generateQuestion",
      gradedFollowUp: "stem.followUp",
      followUpSend: "stem.followUp",
      profileClose: "closeProfile",
      profileSwitch: "signOutLocalLearner",
      profileDelete: "clearLocalLearner",
      mentorClose: "closeMentor",
      mentorSettings: JOURNEY_EVENTS.openMentorSettings,
      mentorSend: "mentor.chat",
      providerClose: "closeProviderSettings",
      providerClear: "clearAIConnection",
      providerSave: "saveAIConnection",
    });
  });

  it("dispatches the provider-settings event used by the redesigned setup control", () => {
    const originalWindow = globalThis.window;
    let received = "";
    Object.defineProperty(globalThis, "window", { configurable: true, value: { dispatchEvent: (event: Event) => { received = event.type; return true; } } });
    try {
      dispatchJourneyEvent("openMentorSettings");
      expect(received).toBe(JOURNEY_EVENTS.openMentorSettings);
    } finally {
      Object.defineProperty(globalThis, "window", { configurable: true, value: originalWindow });
    }
  });
});
