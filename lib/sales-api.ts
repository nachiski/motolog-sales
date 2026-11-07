import { MOTORCYCLE_BRANDS, SALES_LOCATIONS } from "./motorcycle-brands.ts";
import { formatPriceFromMinor, parsePriceToMinor, SUPPORTED_CURRENCIES } from "./money.ts";
import { z } from "zod";

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
        message: error instanceof Error ? error.message : "El precio no es válido.",
      });
    }
  })
  .transform((value) => (value === null ? null : String(value)));

const fields = z.object({
  brand: z.enum(MOTORCYCLE_BRANDS),
  model: z.string().trim().min(1).max(150),
  year: z.number().int().min(1900).max(2100).nullable(),
  vin: z.string().trim().max(100),
  soldAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(
    (value) => !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value,
  ),
  seller: z.string().trim().min(1).max(150),
  location: z.enum(SALES_LOCATIONS),
  buyer: z.string().trim().max(150),
  price: priceInput,
  currency: z.enum(SUPPORTED_CURRENCIES),
  notes: z.string().trim().max(2000),
});

export type SaleInput = z.infer<typeof fields>;
export type StoredSale = {
  id: string;
  brand: string;
  model: string;
  year: number | null;
  vin: string | null;
  soldAt: string;
  seller: string;
  location: string;
  buyer: string | null;
  priceMinor: number | null;
  currency: string;
  notes: string | null;
  createdAt: Date | string;
};

export type SalesRepository = {
  list(): Promise<StoredSale[]>;
  create(sale: StoredSale): Promise<StoredSale>;
  update(id: string, sale: Omit<StoredSale, "id" | "createdAt">): Promise<StoredSale | null>;
  delete(id: string): Promise<void>;
};

function toApiSale(row: StoredSale) {
  const { priceMinor, createdAt, ...sale } = row;
  return {
    ...sale,
    createdAt: createdAt instanceof Date ? createdAt.toISOString() : createdAt,
    price: formatPriceFromMinor(priceMinor),
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

export function createSalesApiHandlers(repository: SalesRepository) {
  return {
    async GET() {
      try {
        const rows = await repository.list();
        return Response.json(rows.map(toApiSale), {
          headers: { "Cache-Control": "no-store" },
        });
      } catch (error) {
        return fail(error);
      }
    },

    async POST(request: Request) {
      try {
        const parsed = fields.safeParse(await request.json());
        if (!parsed.success) return validationError();
        const { price, ...sale } = parsed.data;
        const row = await repository.create({
          ...sale,
          priceMinor: price === null ? null : parsePriceToMinor(price),
          id: crypto.randomUUID(),
          createdAt: new Date(),
        });
        return Response.json(toApiSale(row), { status: 201 });
      } catch (error) {
        return fail(error);
      }
    },

    async PUT(request: Request) {
      try {
        const raw = (await request.json()) as Record<string, unknown>;
        const parsed = fields.safeParse(raw);
        if (!parsed.success || typeof raw.id !== "string") return validationError();
        const { price, ...sale } = parsed.data;
        const row = await repository.update(raw.id, {
          ...sale,
          priceMinor: price === null ? null : parsePriceToMinor(price),
        });
        if (!row) {
          return Response.json({ error: "No se encontró la venta." }, { status: 404 });
        }
        return Response.json(toApiSale(row));
      } catch (error) {
        return fail(error);
      }
    },

    async DELETE(request: Request) {
      try {
        const id = new URL(request.url).searchParams.get("id");
        if (!id) {
          return Response.json({ error: "Falta el identificador de la venta" }, { status: 400 });
        }
        await repository.delete(id);
        return Response.json({ ok: true });
      } catch (error) {
        return fail(error);
      }
    },
  };
}
