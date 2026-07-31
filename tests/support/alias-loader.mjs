import { access } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import path from "node:path";

const root = process.cwd();
const nextServerMock = pathToFileURL(
  path.join(root, "tests/support/next-server.mock.mjs"),
).href;

async function resolveProjectFile(specifier) {
  const relativePath = specifier.slice(2);
  const basePath = path.join(root, "src", relativePath);
  const candidates = [basePath, `${basePath}.js`, `${basePath}.mjs`, path.join(basePath, "index.js")];

  for (const candidate of candidates) {
    try {
      await access(candidate);
      return pathToFileURL(candidate).href;
    } catch {
      // Provo kandidatin tjetër.
    }
  }

  return pathToFileURL(basePath).href;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "server-only") {
    return {
      url: "data:text/javascript,export default {};",
      shortCircuit: true,
    };
  }

  if (specifier === "next/server") {
    return {
      url: nextServerMock,
      shortCircuit: true,
    };
  }

  if (specifier.startsWith("@/")) {
    return {
      url: await resolveProjectFile(specifier),
      shortCircuit: true,
    };
  }

  return nextResolve(specifier, context);
}
