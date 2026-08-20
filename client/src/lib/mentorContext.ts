import type { LocalLearner } from "./localProgress";

export function buildMentorPerformanceContext(learner: LocalLearner) {
  const attempted = learner.progress.reduce((total, item) => total + item.questionsAttempted, 0);
  const correct = learner.progress.reduce((total, item) => total + item.questionsCorrect, 0);
  const accuracy = attempted ? Math.round((correct / attempted) * 100) : 0;
  const subjects = learner.progress.map(item => `${item.subject}: ${item.questionsCorrect}/${item.questionsAttempted} correct`).join("; ");
  const recent = learner.activity.slice(0, 5).map(item => `${item.title} (${item.detail}, +${item.xpChange} XP)`).join("; ") || "No attempts recorded yet.";
  return `Learner: ${learner.name || "Learner"}. Total XP: ${learner.totalXp}. Streak: ${learner.streak} days. Overall accuracy: ${accuracy}% across ${attempted} attempts. Subject progress: ${subjects}. Recent learning activity: ${recent}`;
}
