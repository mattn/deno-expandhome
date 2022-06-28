import { assertEquals } from "https://deno.land/std@0.65.0/testing/asserts.ts";
import { expandHome } from "./mod.ts";
import { join } from "https://deno.land/std@0.145.0/path/mod.ts";

Deno.test("test simple #1", () => {
  const want = join(Deno.env.get("HOME")!, "/path/to");
  const got = expandHome("~/path/to");
  assertEquals(got, want);
});
