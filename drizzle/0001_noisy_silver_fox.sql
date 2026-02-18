CREATE TABLE `team_invites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teamId` int NOT NULL,
	`inviteCode` varchar(32) NOT NULL,
	`email` varchar(320),
	`invitedById` int NOT NULL,
	`suggestedRole` enum('admin','editor','reader','data_user') NOT NULL DEFAULT 'editor',
	`status` enum('pending','accepted','rejected','expired') NOT NULL DEFAULT 'pending',
	`acceptedById` int,
	`acceptedRole` enum('admin','editor','reader','data_user'),
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `team_invites_id` PRIMARY KEY(`id`),
	CONSTRAINT `team_invites_inviteCode_unique` UNIQUE(`inviteCode`)
);
--> statement-breakpoint
ALTER TABLE `team_members` MODIFY COLUMN `role` enum('admin','editor','reader','data_user') NOT NULL DEFAULT 'editor';--> statement-breakpoint
ALTER TABLE `team_members` ADD `isCreator` boolean DEFAULT false NOT NULL;