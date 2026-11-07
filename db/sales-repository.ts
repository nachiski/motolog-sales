import { desc, eq } from "drizzle-orm";
import { sales } from "./schema-pg";
import type { getDb } from "./index";
import type { SalesRepository, StoredSale } from "../lib/sales-api";

type Database = ReturnType<typeof getDb>;

export function createDrizzleSalesRepository(getDb: () => Database): SalesRepository {
  return {
    async list() {
      const db = getDb();
      return db.select().from(sales).orderBy(desc(sales.soldAt), desc(sales.createdAt));
    },
    async create(sale) {
      const db = getDb();
      const rows = await db.insert(sales).values({
        ...sale,
        createdAt: sale.createdAt instanceof Date ? sale.createdAt : new Date(sale.createdAt),
      }).returning();
      return rows[0] as StoredSale;
    },
    async update(id, sale) {
      const db = getDb();
      const rows = await db.update(sales).set(sale).where(eq(sales.id, id)).returning();
      return (rows[0] as StoredSale | undefined) ?? null;
    },
    async delete(id) {
      const db = getDb();
      await db.delete(sales).where(eq(sales.id, id));
    },
  };
}
