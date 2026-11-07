ALTER TABLE `sales` ADD `price_minor` integer;
--> statement-breakpoint
-- Backfill at the nearest cent. Existing prices are non-negative; SQLite ROUND
-- therefore rounds half up to the next cent for positive values.
UPDATE `sales`
SET `price_minor` = CAST(ROUND(`price` * 100) AS INTEGER)
WHERE `price` IS NOT NULL;
