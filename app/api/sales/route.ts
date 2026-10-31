import { MOTORCYCLE_BRANDS, SALES_LOCATIONS } from "../../../lib/motorcycle-brands";
import { getDb } from "../../../db";
import { sales } from "../../../db/schema";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
export const dynamic = "force-dynamic";
const fields=z.object({brand:z.enum(MOTORCYCLE_BRANDS),model:z.string().trim().min(1).max(150),year:z.number().int().min(1900).max(2100).nullable(),vin:z.string().trim().max(100),soldAt:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>!isNaN(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v),seller:z.string().trim().min(1).max(150),location:z.enum(SALES_LOCATIONS),buyer:z.string().trim().max(150),price:z.number().min(0).max(1e12).nullable(),currency:z.enum(["USD","GTQ","MXN","EUR","GBP","CAD"]),notes:z.string().trim().max(2000)});
function fail(e:unknown){console.error(e);return Response.json({error:"No se pudo acceder a tu base de datos. Intenta de nuevo."},{status:500});}
export async function GET(){try{return Response.json(await getDb().select().from(sales).orderBy(desc(sales.soldAt),desc(sales.createdAt)),{headers:{"Cache-Control":"no-store"}});}catch(e){return fail(e);}}
export async function POST(req:Request){try{const p=fields.safeParse(await req.json());if(!p.success)return Response.json({error:"Revisa los datos de la venta. Selecciona una marca válida y la ubicación TIPITAPA o GRANADA."},{status:400});const row={...p.data,id:crypto.randomUUID(),createdAt:new Date().toISOString()};await getDb().insert(sales).values(row);return Response.json(row,{status:201});}catch(e){return fail(e);}}
export async function PUT(req:Request){try{const raw=await req.json() as Record<string,unknown>;const p=fields.safeParse(raw);if(!p.success||typeof raw.id!=="string")return Response.json({error:"Revisa los datos de la venta. Selecciona una marca válida y la ubicación TIPITAPA o GRANADA."},{status:400});const rows=await getDb().update(sales).set(p.data).where(eq(sales.id,raw.id)).returning();if(!rows.length)return Response.json({error:"No se encontró la venta."},{status:404});return Response.json(rows[0]);}catch(e){return fail(e);}}
export async function DELETE(req:Request){try{const id=new URL(req.url).searchParams.get("id");if(!id)return Response.json({error:"Falta el identificador de la venta"},{status:400});await getDb().delete(sales).where(eq(sales.id,id));return Response.json({ok:true});}catch(e){return fail(e);}}

