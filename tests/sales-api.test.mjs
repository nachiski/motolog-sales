import assert from "node:assert/strict";
import test from "node:test";
import { createSalesApiHandlers } from "../lib/sales-api.ts";

const validSale = {
  brand: "YADEA",
  model: "E8S",
  year: 2025,
  vin: "VIN-TEST-001",
  soldAt: "2026-11-06",
  seller: "Ana",
  location: "TIPITAPA",
  buyer: "Luis",
  price: "1234.56",
  currency: "USD",
  notes: "Venta de prueba",
};

function createTestApi() {
  let rows = [];
  const repository = {
    list: async () => [...rows],
    create: async (sale) => {
      rows = [...rows, sale];
      return sale;
    },
    update: async (id, sale) => {
      const existing = rows.find((row) => row.id === id);
      if (!existing) return null;
      const updated = { ...existing, ...sale };
      rows = rows.map((row) => (row.id === id ? updated : row));
      return updated;
    },
    delete: async (id) => {
      rows = rows.filter((row) => row.id !== id);
    },
  };
  return { rows: () => rows, handlers: createSalesApiHandlers(repository) };
}

function jsonRequest(body) {
  return new Request("http://localhost/api/sales", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

test("sales API validates input and supports create, read, update, and delete", async () => {
  const { rows, handlers } = createTestApi();
  const invalid = await handlers.POST(jsonRequest({ ...validSale, price: "-1.00" }));
  assert.equal(invalid.status, 400);

    const created = await handlers.POST(jsonRequest(validSale));
    assert.equal(created.status, 201);
    const createdSale = await created.json();
    assert.match(createdSale.id, /^[0-9a-f-]{36}$/i);
    assert.equal(createdSale.price, "1234.56");
    assert.equal(rows()[0].priceMinor, 123456);

    const list = await handlers.GET();
    assert.equal(list.headers.get("cache-control"), "no-store");
    assert.deepEqual((await list.json()).map(({ id }) => id), [createdSale.id]);

    const updated = await handlers.PUT(
      new Request("http://localhost/api/sales", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...validSale, id: createdSale.id, price: "900.01" }),
      }),
    );
    assert.equal(updated.status, 200);
    assert.equal((await updated.json()).price, "900.01");
    assert.equal(rows()[0].priceMinor, 90001);

    const missingId = await handlers.PUT(
      new Request("http://localhost/api/sales", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(validSale),
      }),
    );
    assert.equal(missingId.status, 400);

    const missingSale = await handlers.PUT(
      new Request("http://localhost/api/sales", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...validSale, id: "missing-sale" }),
      }),
    );
    assert.equal(missingSale.status, 404);

    const deleted = await handlers.DELETE(new Request(`http://localhost/api/sales?id=${createdSale.id}`, { method: "DELETE" }));
    assert.equal(deleted.status, 200);
    assert.deepEqual(await deleted.json(), { ok: true });
    assert.deepEqual(await (await handlers.GET()).json(), []);

    const noDeleteId = await handlers.DELETE(new Request("http://localhost/api/sales", { method: "DELETE" }));
    assert.equal(noDeleteId.status, 400);
});
