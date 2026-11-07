import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";

const migrationFiles = [
  new URL("../drizzle/0000_clear_winter_soldier.sql", import.meta.url),
  new URL("../drizzle/0001_price_minor_units.sql", import.meta.url),
];

test("applies migrations 0000 to 0001 and backfills prices to cents", async () => {
  const database = new DatabaseSync(":memory:");
  try {
    const initialMigration = await readFile(migrationFiles[0], "utf8");
    database.exec(initialMigration);
    database
      .prepare(
        "INSERT INTO sales (id, brand, model, sold_at, seller, location, price, currency, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .run("sale-1", "Yadea", "Test", "2026-11-01", "Ana", "TITIPAPA", 12.345, "USD", "2026-11-01T00:00:00.000Z");
    database
      .prepare(
        "INSERT INTO sales (id, brand, model, sold_at, seller, location, price, currency, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .run("sale-2", "Yadea", "No price", "2026-11-02", "Ana", "TITIPAPA", null, "USD", "2026-11-02T00:00:00.000Z");

    const nextMigration = await readFile(migrationFiles[1], "utf8");
    database.exec(nextMigration);

    assert.deepEqual(
      database.prepare("SELECT id, price_minor FROM sales ORDER BY id").all().map((row) => ({ ...row })),
      [
        { id: "sale-1", price_minor: 1235 },
        { id: "sale-2", price_minor: null },
      ],
    );
    assert.equal(database.prepare("PRAGMA integrity_check").get().integrity_check, "ok");
  } finally {
    database.close();
  }
});
