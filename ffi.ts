import { CachePolicy, download, join, normalize, prepare } from "./deps.ts";

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

const version = "v0.0.3";
const policy = Deno.env.get("PLUGIN_URL") === undefined
  ? CachePolicy.STORE
  : CachePolicy.NONE;
let url = Deno.env.get("PLUGIN_URL") ??
  `https://github.com/mattn/deno-expandhome/releases/download/${version}/`;

url = join(url, lib);

const dylib = await prepare(
  {
    name: "expandhome",
    url,
    policy,
  },
  {
    "expandhome": { parameters: ["pointer"], result: "pointer" },
    "free_buf": { parameters: ["pointer"], result: "void" },
  } as const,
);

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
