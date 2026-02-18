CREATE TABLE `activity_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`action` varchar(64) NOT NULL,
	`entityType` varchar(64) NOT NULL,
	`entityId` int,
	`metadata` json,
	`ipAddress` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `activity_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `admissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patientId` int NOT NULL,
	`hospitalId` int NOT NULL,
	`teamId` int NOT NULL,
	`bed` varchar(32) NOT NULL,
	`sector` varchar(128),
	`admissionDate` timestamp NOT NULL DEFAULT (now()),
	`dischargeDate` timestamp,
	`mainDiagnosis` text,
	`secondaryDiagnoses` json,
	`insuranceProvider` varchar(128),
	`insuranceNumber` varchar(64),
	`priority` enum('critical','high','medium','low') NOT NULL DEFAULT 'medium',
	`status` enum('active','discharged','transferred','deceased') NOT NULL DEFAULT 'active',
	`dischargeType` enum('improved','cured','transferred','deceased','other'),
	`estimatedDischargeDate` timestamp,
	`aiPredictedDischarge` timestamp,
	`aiDischargeConfidence` decimal(5,2),
	`createdById` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `admissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_predictions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`admissionId` int NOT NULL,
	`predictionType` enum('discharge','prognosis','risk') NOT NULL,
	`predictedValue` text NOT NULL,
	`confidence` decimal(5,2) NOT NULL,
	`factors` json,
	`modelVersion` varchar(32),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_predictions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `evolutions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`admissionId` int NOT NULL,
	`authorId` int NOT NULL,
	`situation` text,
	`background` text,
	`assessment` text,
	`recommendation` text,
	`vitalSigns` json,
	`isDraft` boolean NOT NULL DEFAULT false,
	`draftSavedAt` timestamp,
	`lockedAt` timestamp,
	`lockedFields` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `evolutions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hospital_admins` (
	`id` int AUTO_INCREMENT NOT NULL,
	`hospitalId` int NOT NULL,
	`userId` int NOT NULL,
	`permissions` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `hospital_admins_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hospitals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`code` varchar(32) NOT NULL,
	`address` text,
	`city` varchar(128),
	`state` varchar(64),
	`phone` varchar(32),
	`type` enum('public','private','mixed') NOT NULL DEFAULT 'private',
	`bedsTotal` int DEFAULT 0,
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hospitals_id` PRIMARY KEY(`id`),
	CONSTRAINT `hospitals_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(256) NOT NULL,
	`message` text NOT NULL,
	`type` enum('info','warning','critical','success') NOT NULL DEFAULT 'info',
	`read` boolean NOT NULL DEFAULT false,
	`actionUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `patients` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`birthDate` timestamp,
	`gender` enum('M','F','O'),
	`cpf` varchar(14),
	`phone` varchar(32),
	`emergencyContact` varchar(256),
	`emergencyPhone` varchar(32),
	`bloodType` varchar(8),
	`allergies` text,
	`comorbidities` text,
	`createdById` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `patients_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`hospitalId` int,
	`plan` enum('free','pro','enterprise') NOT NULL,
	`status` enum('active','cancelled','expired','trial') NOT NULL DEFAULT 'active',
	`patientsLimit` int NOT NULL DEFAULT 10,
	`teamMembersLimit` int NOT NULL DEFAULT 3,
	`aiCredits` int NOT NULL DEFAULT 0,
	`startDate` timestamp NOT NULL DEFAULT (now()),
	`endDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `team_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teamId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('leader','member','observer') NOT NULL DEFAULT 'member',
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `team_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`hospitalId` int NOT NULL,
	`specialty` varchar(128),
	`color` varchar(16) DEFAULT '#0F766E',
	`leaderId` int,
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `teams_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin','hospital_admin') NOT NULL DEFAULT 'user',
	`plan` enum('free','pro','enterprise') NOT NULL DEFAULT 'free',
	`specialty` varchar(128),
	`crm` varchar(32),
	`phone` varchar(32),
	`avatarUrl` text,
	`onboardingCompleted` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
