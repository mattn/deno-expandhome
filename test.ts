import { assertEquals } from "https://deno.land/std@0.65.0/testing/asserts.ts";
import { expandHome } from "./mod.ts";
import { join } from "https://deno.land/std@0.145.0/path/mod.ts";

const home = Deno.build.os === "windows"
  ? Deno.env.get("USERPROFILE")!
  : Deno.env.get("HOME")!;

Deno.test("test simple #1", () => {
  const want = home;
  const got = expandHome("~");
  assertEquals(got, want);
});

Deno.test("test simple #1", () => {
  const want = join(home, "/");
  const got = expandHome("~/");
  assertEquals(got, want);
});

Deno.test("test simple #3", () => {
  const want = join(home, "/path/to");
  const got = expandHome("~/path/to");
  assertEquals(got, want);
});
