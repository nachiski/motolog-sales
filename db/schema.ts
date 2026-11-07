import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const sales = sqliteTable("sales", {
  id: text("id").primaryKey(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  year: integer("year"),
  vin: text("vin"),
  soldAt: text("sold_at").notNull(),
  seller: text("seller").notNull(),
  location: text("location").notNull(),
  buyer: text("buyer"),
  // Kept during the minor-unit migration for rollback and old-client compatibility.
  price: real("price"),
  priceMinor: integer("price_minor"),
  currency: text("currency").notNull().default("USD"),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
});
