import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { verifyBackupFile } from "../scripts/verify-d1-backup.mjs";

test("restores a SQL backup into an isolated database and verifies sales", async () => {
  const directory = await mkdtemp(join(tmpdir(), "motolog-test-backup-"));
  const backupPath = join(directory, "backup.sql");
  try {
    await writeFile(
      backupPath,
      "CREATE TABLE sales (id TEXT PRIMARY KEY, model TEXT NOT NULL); INSERT INTO sales VALUES ('test-1', 'E8S');",
    );
    assert.deepEqual(await verifyBackupFile(backupPath), {
      integrity: "ok",
      salesCount: 1,
    });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("rejects a restored database without the expected sales table", async () => {
  const directory = await mkdtemp(join(tmpdir(), "motolog-test-backup-"));
  const backupPath = join(directory, "backup.sql");
  try {
    await writeFile(backupPath, "CREATE TABLE other_table (id TEXT PRIMARY KEY);");
    await assert.rejects(verifyBackupFile(backupPath), /does not contain a sales table/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
