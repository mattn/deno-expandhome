let libSuffix = "expandhome";
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

function expandHome(user: string | undefined): string {
  const buf = new TextEncoder().encode((user || "") + "\0");
  const result = dylib.symbols.expandhome(buf);
  if (result.valueOf() === 0n) {
    return "";
  }
  const view = new Deno.UnsafePointerView(result);
  const home = view.getCString();
  dylib.symbols.free_buf(result);
  return home;
}

console.log(expandHome());
