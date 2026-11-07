import {
  bigint,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const sales = pgTable("sales", {
  id: text("id").primaryKey(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  year: integer("year"),
  vin: text("vin"),
  soldAt: text("sold_at").notNull(),
  seller: text("seller").notNull(),
  location: text("location").notNull(),
  buyer: text("buyer"),
  priceMinor: bigint("price_minor", { mode: "number" }),
  currency: text("currency").notNull().default("USD"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});
