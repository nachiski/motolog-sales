import { MOTORCYCLE_BRANDS, SALES_LOCATIONS } from "../../../lib/motorcycle-brands";
import {
  formatPriceFromMinor,
  legacyPriceToMinor,
  parsePriceToMinor,
  SUPPORTED_CURRENCIES,
} from "../../../lib/money";
import { getDb } from "../../../db";
import { sales } from "../../../db/schema";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";

export const dynamic = "force-dynamic";

const priceInput = z
  .union([z.string().trim(), z.number().finite()])
  .nullable()
  .superRefine((value, context) => {
    if (value === null) return;

    try {
      parsePriceToMinor(String(value));
    } catch (error) {
      context.addIssue({
        code: "custom",
        message:
          error instanceof Error ? error.message : "El precio no es válido.",
      });
    }
  })
  .transform((value) => (value === null ? null : String(value)));

const fields = z.object({
  brand: z.enum(MOTORCYCLE_BRANDS),
  model: z.string().trim().min(1).max(150),
  year: z.number().int().min(1900).max(2100).nullable(),
  vin: z.string().trim().max(100),
  soldAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine(
      (value) =>
        !Number.isNaN(Date.parse(value)) &&
        new Date(value).toISOString().slice(0, 10) === value,
    ),
  seller: z.string().trim().min(1).max(150),
  location: z.enum(SALES_LOCATIONS),
  buyer: z.string().trim().max(150),
  price: priceInput,
  currency: z.enum(SUPPORTED_CURRENCIES),
  notes: z.string().trim().max(2000),
});

type SaleRow = typeof sales.$inferSelect;

function toApiSale(row: SaleRow) {
  const { price, priceMinor, ...sale } = row;
  const minor = priceMinor ?? legacyPriceToMinor(price);
  return { ...sale, price: formatPriceFromMinor(minor) };
}

function toDatabasePrice(price: string | null) {
  const priceMinor = price === null ? null : parsePriceToMinor(price);
  return {
    // Keep writing the old column until all deployed clients use price_minor.
    // New code reads the integer column as the authoritative value.
    price: price === null ? null : Number(price),
    priceMinor,
  };
}

function validationError() {
  return Response.json(
    {
      error:
        "Revisa los datos de la venta. El precio no puede ser negativo y debe tener como máximo dos decimales; selecciona una marca, moneda y ubicación válidas.",
    },
    { status: 400 },
  );
}

function fail(error: unknown) {
  console.error(error);
  return Response.json(
    { error: "No se pudo acceder a tu base de datos. Intenta de nuevo." },
    { status: 500 },
  );
}

export async function GET() {
  try {
    const rows = await getDb()
      .select()
      .from(sales)
      .orderBy(desc(sales.soldAt), desc(sales.createdAt));
    return Response.json(rows.map(toApiSale), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const parsed = fields.safeParse(await request.json());
    if (!parsed.success) return validationError();

    const row = {
      ...parsed.data,
      ...toDatabasePrice(parsed.data.price),
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    await getDb().insert(sales).values(row);
    return Response.json(toApiSale(row), { status: 201 });
  } catch (error) {
    return fail(error);
  }
}

export async function PUT(request: Request) {
  try {
    const raw = (await request.json()) as Record<string, unknown>;
    const parsed = fields.safeParse(raw);
    if (!parsed.success || typeof raw.id !== "string") {
      return validationError();
    }

    const rows = await getDb()
      .update(sales)
      .set({ ...parsed.data, ...toDatabasePrice(parsed.data.price) })
      .where(eq(sales.id, raw.id))
      .returning();
    if (!rows.length) {
      return Response.json({ error: "No se encontró la venta." }, { status: 404 });
    }
    return Response.json(toApiSale(rows[0]));
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) {
      return Response.json({ error: "Falta el identificador de la venta" }, { status: 400 });
    }
    await getDb().delete(sales).where(eq(sales.id, id));
    return Response.json({ ok: true });
  } catch (error) {
    return fail(error);
  }
}
