CREATE TABLE IF NOT EXISTS `chat_users` (
	`chat_id` int NOT NULL,
	`user_id` int NOT NULL,
	CONSTRAINT `chat_users_chat_id_user_id_pk` PRIMARY KEY(`chat_id`,`user_id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `chats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('private','group') DEFAULT 'group',
	`name` varchar(64),
	CONSTRAINT `chats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `emojis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(64) NOT NULL,
	`uploader_id` int NOT NULL,
	CONSTRAINT `emojis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `fcm_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`token` varchar(256) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`user_id` int NOT NULL,
	CONSTRAINT `fcm_tokens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`chat_id` int NOT NULL,
	`sender_id` int NOT NULL,
	`content` text NOT NULL,
	`sent_at` timestamp DEFAULT (now()),
	`seen` boolean DEFAULT false,
	`seen_at` timestamp,
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`subscription` json NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `turn_keys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`api_key` varchar(128) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	`available_for` int DEFAULT 14400,
	`chat_id` int NOT NULL,
	CONSTRAINT `turn_keys_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(64),
	`email` varchar(64),
	`password` varchar(64),
	`avatar` varchar(64) DEFAULT 'replace',
	CONSTRAINT `users_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `chat_users` DROP CONSTRAINT IF EXISTS `chat_users_chat_id_chats_id_fk`;--> statement-breakpoint
ALTER TABLE `chat_users` ADD CONSTRAINT `chat_users_chat_id_chats_id_fk` FOREIGN KEY (`chat_id`) REFERENCES `chats`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

ALTER TABLE `chat_users` DROP CONSTRAINT IF EXISTS `chat_users_user_id_users_id_fk`;--> statement-breakpoint
ALTER TABLE `chat_users` ADD CONSTRAINT `chat_users_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

ALTER TABLE `emojis` DROP CONSTRAINT IF EXISTS `emojis_uploader_id_users_id_fk`;--> statement-breakpoint
ALTER TABLE `emojis` ADD CONSTRAINT `emojis_uploader_id_users_id_fk` FOREIGN KEY (`uploader_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

ALTER TABLE `fcm_tokens` DROP CONSTRAINT IF EXISTS `fcm_tokens_user_id_users_id_fk`;--> statement-breakpoint
ALTER TABLE `fcm_tokens` ADD CONSTRAINT `fcm_tokens_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

ALTER TABLE `messages` DROP CONSTRAINT IF EXISTS `messages_chat_id_chats_id_fk`;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_chat_id_chats_id_fk` FOREIGN KEY (`chat_id`) REFERENCES `chats`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

ALTER TABLE `messages` DROP CONSTRAINT IF EXISTS `messages_sender_id_users_id_fk`;--> statement-breakpoint
ALTER TABLE `messages` ADD CONSTRAINT `messages_sender_id_users_id_fk` FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint

ALTER TABLE `subscriptions` DROP CONSTRAINT IF EXISTS `subscriptions_user_id_users_id_fk`;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint

ALTER TABLE `turn_keys` DROP CONSTRAINT IF EXISTS `turn_keys_chat_id_chats_id_fk`;--> statement-breakpoint
ALTER TABLE `turn_keys` ADD CONSTRAINT `turn_keys_chat_id_chats_id_fk` FOREIGN KEY (`chat_id`) REFERENCES `chats`(`id`) ON DELETE cascade ON UPDATE no action;
