import { test, expect } from "bun:test";

test("environment variables should be defined", () => {
  expect(process.env).toBeDefined();
});

test("basic logic", () => {
  expect(1 + 1).toBe(2);
});
