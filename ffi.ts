import { join, normalize } from "https://deno.land/std@0.145.0/path/mod.ts";

let suffix = "";
switch (Deno.build.os) {
  case "windows":
    suffix = "dll";
    break;
  case "darwin":
    suffix = "dylib";
    break;
  default:
    suffix = "so";
    break;
}

const lib = `./libexpandhome-${Deno.build.arch}.${suffix}`;
const dylib = Deno.dlopen(lib, {
  "expandhome": { parameters: ["pointer"], result: "pointer" },
  "free_buf": { parameters: ["pointer"], result: "void" },
});

export function homePath(user: string | undefined): string {
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

export function expandHome(path: string): string {
  return normalize(path).replace(/^~([^\/\\]*)/, (all, sub) => {
    return homePath(sub);
  });
}

/*
console.log(expandHome("~"));
console.log(expandHome("~/"));
console.log(expandHome("~/foo"));
console.log(expandHome("~mattn"));
console.log(expandHome("~mattn/"));
console.log(expandHome("~mattn/foo"));
*/
