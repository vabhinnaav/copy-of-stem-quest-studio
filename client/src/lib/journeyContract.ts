export const JOURNEY_EVENTS = {
  openMentor: "stem-open-mentor",
  openMentorSettings: "stem-open-mentor-settings",
  openProfile: "stem-open-profile-manager",
} as const;

export const JOURNEY_CONTROLS = {
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
} as const;

export function normalizeJourneyName(value: string) {
  return value.trim().slice(0, 48);
}

export function canEnterWorkspace(value: string) {
  return normalizeJourneyName(value).length > 0;
}

export function dispatchJourneyEvent(event: keyof typeof JOURNEY_EVENTS) {
  window.dispatchEvent(new Event(JOURNEY_EVENTS[event]));
}
