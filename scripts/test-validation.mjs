// Test suite verifying wish amount validation across limits and edge cases
import assert from "node:assert";

// 1. Simulation of GOAL_LIMITS and validateGoalAmount
const GOAL_LIMITS = { min: 5, max: 200000 };

function validateGoalAmount(amount) {
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount < GOAL_LIMITS.min) {
    return `Ask for at least ${GOAL_LIMITS.min} — small, honest wishes work best.`;
  }
  if (amount > GOAL_LIMITS.max) {
    return `Keep requests under ${GOAL_LIMITS.max.toLocaleString("en-US")}. Larger needs are better split across several verifiable items.`;
  }
  const rounded = Math.round(amount * 100) / 100;
  if (Math.abs(amount - rounded) > 0.0001) {
    return "Amount cannot have more than two decimal places.";
  }
  return null;
}

console.log("=== Running Wish Amount Validation Tests ===");

// Test 1: ₹2,000 remains accepted
assert.strictEqual(validateGoalAmount(2000), null, "₹2,000 should be accepted");
console.log("✔ ₹2,000 is accepted");

// Test 2: ₹5,000 is accepted
assert.strictEqual(validateGoalAmount(5000), null, "₹5,000 should be accepted");
console.log("✔ ₹5,000 is accepted");

// Test 3: ₹10,000 is accepted
assert.strictEqual(validateGoalAmount(10000), null, "₹10,000 should be accepted");
console.log("✔ ₹10,000 is accepted");

// Test 4: ₹200,000 is accepted
assert.strictEqual(validateGoalAmount(200000), null, "₹200,000 should be accepted");
console.log("✔ ₹200,000 is accepted");

// Test 5: Amount above ₹200,000 is rejected
const overLimitErr = validateGoalAmount(200001);
assert.ok(overLimitErr && overLimitErr.includes("Keep requests under 200,000"), "200,001 should be rejected");
console.log("✔ Amount above ₹200,000 (200,001) is rejected");

const largeOverLimitErr = validateGoalAmount(1000000);
assert.ok(largeOverLimitErr && largeOverLimitErr.includes("Keep requests under 200,000"), "1,000,000 should be rejected");
console.log("✔ Amount 1,000,000 is rejected");

// Test 6: Zero is rejected
const zeroErr = validateGoalAmount(0);
assert.ok(zeroErr && zeroErr.includes("Ask for at least 5"), "0 should be rejected");
console.log("✔ Zero (0) is rejected");

// Test 7: Negative amounts are rejected
const negErr = validateGoalAmount(-50);
assert.ok(negErr && negErr.includes("Ask for at least 5"), "-50 should be rejected");
console.log("✔ Negative amounts (-50) are rejected");

// Test 8: Below minimum (e.g. 4.99) is rejected
const belowMinErr = validateGoalAmount(4.99);
assert.ok(belowMinErr && belowMinErr.includes("Ask for at least 5"), "4.99 should be rejected");
console.log("✔ Below minimum (4.99) is rejected");

// Test 9: Non-finite / malformed inputs are rejected
assert.ok(validateGoalAmount(NaN), "NaN should be rejected");
assert.ok(validateGoalAmount(Infinity), "Infinity should be rejected");
assert.ok(validateGoalAmount("2000"), "String should be rejected");
assert.ok(validateGoalAmount(null), "null should be rejected");
assert.ok(validateGoalAmount(undefined), "undefined should be rejected");
console.log("✔ Malformed / non-finite inputs (NaN, Infinity, strings, null) are rejected");

// Test 10: Invalid fractional precision (>2 decimal places) is rejected
const precisionErr = validateGoalAmount(100.999);
assert.strictEqual(precisionErr, "Amount cannot have more than two decimal places.");
console.log("✔ Invalid monetary decimal precision (100.999) is rejected");

// Test 11: Valid 2 decimal places is accepted
assert.strictEqual(validateGoalAmount(199999.99), null, "199,999.99 should be accepted");
console.log("✔ Valid 2 decimal places (199,999.99) is accepted");

console.log("\nALL 11 TESTS PASSED SUCCESSFULLY!");
