ALTER TABLE `notifications` MODIFY COLUMN `type` enum('info','warning','critical','success','handoff','discharge','status_update') NOT NULL DEFAULT 'info';--> statement-breakpoint
ALTER TABLE `notifications` ADD `category` enum('system','patient','team','recovery_room') DEFAULT 'system' NOT NULL;--> statement-breakpoint
ALTER TABLE `notifications` ADD `metadata` json;--> statement-breakpoint
ALTER TABLE `notifications` ADD `expiresAt` timestamp;