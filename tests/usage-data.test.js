import test from "node:test";
import assert from "node:assert/strict";
import { searchMerchants, understandQuestion } from "../usage-data.js";

test("finds a brand by name and alias", () => {
  assert.equal(searchMerchants("씨유")[0]?.id, "cu");
  assert.equal(searchMerchants("핫트렉스")[0]?.id, "hottracks");
});

test("limits category results to that category", () => {
  const found = searchMerchants("", "편의점");
  assert.equal(found.length, 4);
  assert.ok(found.every((merchant) => merchant.category === "편의점"));
});

test("extracts a brand and a product-specific caveat from a question", () => {
  const result = understandQuestion("CU에서 담배도 살 수 있나요?");
  assert.deepEqual(result.merchants.map((merchant) => merchant.id), ["cu"]);
  assert.equal(result.itemSpecific, true);
});

test("extracts a category without inventing a merchant", () => {
  const result = understandQuestion("영화관에서 어떻게 쓰나요?");
  assert.equal(result.category, "영화");
  assert.deepEqual(result.merchants, []);
});

test("leaves unknown merchants unresolved", () => {
  assert.deepEqual(searchMerchants("없는상호"), []);
  assert.deepEqual(understandQuestion("없는상호에서 되나요?").merchants, []);
  assert.deepEqual(understandQuestion("Cultureland 상품권은 어디서 써요?").merchants, []);
});
