// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
export const sales = sqliteTable("sales", {
 id:text("id").primaryKey(), brand:text("brand").notNull(), model:text("model").notNull(), year:integer("year"), vin:text("vin"), soldAt:text("sold_at").notNull(), seller:text("seller").notNull(), location:text("location").notNull(), buyer:text("buyer"), price:real("price"), currency:text("currency").notNull().default("USD"), notes:text("notes"), createdAt:text("created_at").notNull()
});
