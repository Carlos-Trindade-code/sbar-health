CREATE TABLE `hospital_networks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(256) NOT NULL,
	`code` varchar(32) NOT NULL,
	`logoUrl` text,
	`website` varchar(256),
	`type` enum('public','private','mixed','university') NOT NULL DEFAULT 'private',
	`isPreRegistered` boolean NOT NULL DEFAULT false,
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hospital_networks_id` PRIMARY KEY(`id`),
	CONSTRAINT `hospital_networks_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `team_hospitals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teamId` int NOT NULL,
	`hospitalId` int NOT NULL,
	`isPrimary` boolean NOT NULL DEFAULT false,
	`addedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `team_hospitals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `teams` MODIFY COLUMN `hospitalId` int;--> statement-breakpoint
ALTER TABLE `hospitals` ADD `networkId` int;--> statement-breakpoint
ALTER TABLE `hospitals` ADD `neighborhood` varchar(128);--> statement-breakpoint
ALTER TABLE `hospitals` ADD `zipCode` varchar(16);--> statement-breakpoint
ALTER TABLE `hospitals` ADD `latitude` decimal(10,8);--> statement-breakpoint
ALTER TABLE `hospitals` ADD `longitude` decimal(11,8);--> statement-breakpoint
ALTER TABLE `hospitals` ADD `bedsIcu` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `hospitals` ADD `isPreRegistered` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `teams` ADD `archived` boolean DEFAULT false NOT NULL;