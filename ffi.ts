import { join, normalize } from "https://deno.land/std@0.145.0/path/mod.ts";

let libSuffix = "";
switch (Deno.build.os) {
  case "windows":
    libSuffix = "dll";
    break;
  case "darwin":
    libSuffix = "dylib";
    break;
  default:
    libSuffix = "so";
    break;
}

const lib = `./libexpandhome.${libSuffix}`;
const dylib = Deno.dlopen(lib, {
  "expandhome": { parameters: ["pointer"], result: "pointer" },
  "free_buf": { parameters: ["pointer"], result: "void" },
});

function homePath(user: string | undefined): string {
  const buf = new TextEncoder().encode((user || "") + "\0");
  const result = dylib.symbols.expandhome(buf);
  if (result.valueOf() === 0n) {
    return "";
  }
  const view = new Deno.UnsafePointerView(result);
  const path = view.getCString();
  dylib.symbols.free_buf(result);
  return path;
}

function expandPath(path: string): string {
  return normalize(path).replace(/^~([^\/\\]*)/, (all, sub) => {
    return homePath(sub);
  });
}

console.log(expandPath("~"));
console.log(expandPath("~/"));
console.log(expandPath("~/foo"));
console.log(expandPath("~mattn"));
console.log(expandPath("~mattn/"));
console.log(expandPath("~mattn/foo"));
