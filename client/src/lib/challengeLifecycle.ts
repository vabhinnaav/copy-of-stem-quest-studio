import { SUBJECT_CONFIG, type StemSubject } from "@shared/stem";

export type EmptyChallengeState = {
  question: null;
  selectedAnswer: string;
  shortAnswer: string;
  evaluation: null;
  hintOpen: boolean;
};

export function createEmptyChallengeState(): EmptyChallengeState {
  return {
    question: null,
    selectedAnswer: "",
    shortAnswer: "",
    evaluation: null,
    hintOpen: false,
  };
}

export function prepareSectorEntry(subject: StemSubject) {
  return {
    subject,
    topic: SUBJECT_CONFIG[subject].topics[0],
    shouldGenerateQuestion: false,
    challenge: createEmptyChallengeState(),
  };
}
