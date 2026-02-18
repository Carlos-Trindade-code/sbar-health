CREATE TABLE `support_tickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('bug','suggestion','question','security') NOT NULL DEFAULT 'bug',
	`subject` varchar(256) NOT NULL,
	`description` text NOT NULL,
	`status` enum('open','in_progress','resolved','closed') NOT NULL DEFAULT 'open',
	`priority` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`adminNotes` text,
	`resolvedAt` timestamp,
	`resolvedById` int,
	`userAgent` text,
	`pageUrl` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `support_tickets_id` PRIMARY KEY(`id`)
);
