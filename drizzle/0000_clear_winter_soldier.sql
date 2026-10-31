CREATE TABLE `sales` (
	`id` text PRIMARY KEY NOT NULL,
	`brand` text NOT NULL,
	`model` text NOT NULL,
	`year` integer,
	`vin` text,
	`sold_at` text NOT NULL,
	`seller` text NOT NULL,
	`location` text NOT NULL,
	`buyer` text,
	`price` real,
	`currency` text DEFAULT 'USD' NOT NULL,
	`notes` text,
	`created_at` text NOT NULL
);
