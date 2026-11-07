import assert from "node:assert/strict";
import test from "node:test";
import {
  formatPriceFromMinor,
  legacyPriceToMinor,
  MAX_PRICE_MINOR,
  parsePriceToMinor,
} from "../lib/money.ts";

test("parses decimal prices exactly into minor units", () => {
  assert.equal(parsePriceToMinor("0"), 0);
  assert.equal(parsePriceToMinor("12.3"), 1230);
  assert.equal(parsePriceToMinor("12.30"), 1230);
  assert.equal(parsePriceToMinor("999999999999.99"), MAX_PRICE_MINOR - 1);
});

test("rejects negative, malformed, imprecise, and unsafe prices", () => {
  for (const price of ["-0.01", ".50", "1.", "1.001", "1e2", "9007199254740992"]) {
    assert.throws(() => parsePriceToMinor(price), { name: "Error" }, price);
  }
});

test("formats minor units canonically and rejects invalid stored amounts", () => {
  assert.equal(formatPriceFromMinor(0), "0.00");
  assert.equal(formatPriceFromMinor(1205), "12.05");
  assert.equal(formatPriceFromMinor(null), null);
  assert.throws(() => formatPriceFromMinor(-1));
  assert.throws(() => formatPriceFromMinor(1.5));
});

test("converts legacy floating prices with nearest-cent rounding", () => {
  assert.equal(legacyPriceToMinor(12.345), 1235);
  assert.equal(legacyPriceToMinor(12.344), 1234);
  assert.equal(legacyPriceToMinor(null), null);
  assert.throws(() => legacyPriceToMinor(-0.01));
});
