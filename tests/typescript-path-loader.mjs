import { extname, resolve as resolvePath } from "node:path";
import { pathToFileURL } from "node:url";

export async function resolve(specifier, context, nextResolve) {
  if (!specifier.startsWith("@/")) {
    return nextResolve(specifier, context);
  }

  let target = resolvePath(process.cwd(), specifier.slice(2));
  if (!extname(target)) target += ".ts";

  return nextResolve(pathToFileURL(target).href, context);
}
