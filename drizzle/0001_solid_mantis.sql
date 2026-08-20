CREATE TABLE `learningActivity` (
	`id` varchar(32) NOT NULL,
	`userId` int NOT NULL,
	`stemSubject` enum('science','technology','engineering','mathematics') NOT NULL,
	`activityType` enum('question_answered','level_up','streak_milestone') NOT NULL,
	`title` varchar(180) NOT NULL,
	`detail` varchar(300) NOT NULL,
	`xpChange` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `learningActivity_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quizAttempts` (
	`id` varchar(32) NOT NULL,
	`userId` int NOT NULL,
	`questionId` varchar(32) NOT NULL,
	`answer` text NOT NULL,
	`isCorrect` int NOT NULL,
	`feedback` text NOT NULL,
	`earnedXp` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quizAttempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quizQuestions` (
	`id` varchar(32) NOT NULL,
	`userId` int NOT NULL,
	`stemSubject` enum('science','technology','engineering','mathematics') NOT NULL,
	`topic` varchar(100) NOT NULL,
	`difficulty` enum('foundation','explorer','challenge') NOT NULL,
	`questionType` enum('multiple_choice','short_answer','true_false') NOT NULL,
	`title` varchar(120) NOT NULL,
	`prompt` text NOT NULL,
	`choices` json NOT NULL,
	`answer` json NOT NULL,
	`hint` text NOT NULL,
	`explanation` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quizQuestions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subjectProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stemSubject` enum('science','technology','engineering','mathematics') NOT NULL,
	`totalXp` int NOT NULL DEFAULT 0,
	`questionsAttempted` int NOT NULL DEFAULT 0,
	`questionsCorrect` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subjectProgress_id` PRIMARY KEY(`id`),
	CONSTRAINT `subjectProgress_user_subject_unique` UNIQUE(`userId`,`stemSubject`)
);
--> statement-breakpoint
CREATE TABLE `userRewards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totalXp` int NOT NULL DEFAULT 0,
	`currentLevel` int NOT NULL DEFAULT 1,
	`badge` varchar(64) NOT NULL DEFAULT 'Orbit',
	`streak` int NOT NULL DEFAULT 0,
	`lastActivityAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userRewards_id` PRIMARY KEY(`id`),
	CONSTRAINT `userRewards_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
ALTER TABLE `learningActivity` ADD CONSTRAINT `learningActivity_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quizAttempts` ADD CONSTRAINT `quizAttempts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quizAttempts` ADD CONSTRAINT `quizAttempts_questionId_quizQuestions_id_fk` FOREIGN KEY (`questionId`) REFERENCES `quizQuestions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `quizQuestions` ADD CONSTRAINT `quizQuestions_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subjectProgress` ADD CONSTRAINT `subjectProgress_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userRewards` ADD CONSTRAINT `userRewards_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `learningActivity_user_created_idx` ON `learningActivity` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `quizAttempts_user_created_idx` ON `quizAttempts` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `quizAttempts_question_idx` ON `quizAttempts` (`questionId`);--> statement-breakpoint
CREATE INDEX `quizQuestions_user_created_idx` ON `quizQuestions` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `quizQuestions_subject_idx` ON `quizQuestions` (`stemSubject`);