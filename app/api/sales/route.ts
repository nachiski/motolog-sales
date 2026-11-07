import { auth } from "../../../auth";
import { getDb } from "../../../db";
import { createDrizzleSalesRepository } from "../../../db/sales-repository";
import { createSalesApiHandlers } from "../../../lib/sales-api";

export const dynamic = "force-dynamic";

const handlers = createSalesApiHandlers(createDrizzleSalesRepository(getDb));

async function requireUser() {
  const session = await auth();
  return session?.user ? null : Response.json({ error: "Inicia sesión para continuar." }, { status: 401 });
}

function requireSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || origin !== new URL(request.url).origin) {
    return Response.json({ error: "Solicitud de otro origen rechazada." }, { status: 403 });
  }
  return null;
}

export async function GET() {
  const denied = await requireUser();
  return denied ?? handlers.GET();
}

export async function POST(request: Request) {
  const denied = await requireUser();
  if (denied) return denied;
  const originError = requireSameOrigin(request);
  return originError ?? handlers.POST(request);
}

export async function PUT(request: Request) {
  const denied = await requireUser();
  if (denied) return denied;
  const originError = requireSameOrigin(request);
  return originError ?? handlers.PUT(request);
}

export async function DELETE(request: Request) {
  const denied = await requireUser();
  if (denied) return denied;
  const originError = requireSameOrigin(request);
  return originError ?? handlers.DELETE(request);
}
