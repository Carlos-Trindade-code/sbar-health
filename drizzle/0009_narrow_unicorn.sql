ALTER TABLE `users` ADD `cpf` varchar(14);--> statement-breakpoint
ALTER TABLE `users` ADD `professionalType` enum('medico','enfermeiro','fisioterapeuta','nutricionista','farmaceutico','psicologo','fonoaudiologo','terapeuta_ocupacional','estudante','gestor','outro') DEFAULT 'medico';--> statement-breakpoint
ALTER TABLE `users` ADD `councilType` enum('CRM','COREN','CREFITO','CRN','CRF','CRP','CRFa','COFFITO','outro');--> statement-breakpoint
ALTER TABLE `users` ADD `councilNumber` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD `councilState` varchar(2);--> statement-breakpoint
ALTER TABLE `users` ADD `rqeNumber` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD `rqeSpecialty` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `university` varchar(256);--> statement-breakpoint
ALTER TABLE `users` ADD `graduationYear` int;--> statement-breakpoint
ALTER TABLE `users` ADD `enrollmentNumber` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `institutionalRole` varchar(128);--> statement-breakpoint
ALTER TABLE `users` ADD `verificationStatus` enum('unverified','pending','verified','rejected') DEFAULT 'unverified' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `verificationDate` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `verificationNotes` text;--> statement-breakpoint
ALTER TABLE `users` ADD `documentUrl` text;