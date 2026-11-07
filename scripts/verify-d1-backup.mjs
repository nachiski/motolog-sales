import { DatabaseSync } from "node:sqlite";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export async function verifyBackupFile(backupPath) {
  const sql = await readFile(backupPath, "utf8");
  const scratchDirectory = await mkdtemp(join(tmpdir(), "motolog-backup-restore-"));
  const databasePath = join(scratchDirectory, "restored.sqlite");
  const database = new DatabaseSync(databasePath);

  try {
    database.exec(sql);
    const { integrity_check: integrity } = database
      .prepare("PRAGMA integrity_check")
      .get();
    if (integrity !== "ok") {
      throw new Error(`SQLite integrity check failed: ${integrity}`);
    }

    const salesTable = database
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'sales'")
      .get();
    if (!salesTable) {
      throw new Error("The restored database does not contain a sales table.");
    }

    const { count } = database.prepare("SELECT COUNT(*) AS count FROM sales").get();
    return { integrity, salesCount: count };
  } finally {
    database.close();
    await rm(scratchDirectory, { recursive: true, force: true });
  }
}

const invokedPath = process.argv[1] && pathToFileURL(process.argv[1]).href;
if (invokedPath === import.meta.url) {
  const backupPath = process.argv[2];
  if (!backupPath) {
    console.error("Usage: npm run db:backup:verify -- <backup.sql>");
    process.exitCode = 2;
  } else {
    try {
      const result = await verifyBackupFile(backupPath);
      console.log(`Restore verified: integrity ${result.integrity}; ${result.salesCount} sales.`);
    } catch (error) {
      console.error(`Backup restore verification failed: ${error.message}`);
      process.exitCode = 1;
    }
  }
}
