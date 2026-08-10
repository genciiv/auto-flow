const baseUrl = String(process.env.DEPLOYMENT_URL || process.argv[2] || "").replace(/\/$/, "");
if (!baseUrl) throw new Error("Vendos DEPLOYMENT_URL ose jep URL-në si argument.");
const url = new URL(baseUrl);
if (url.protocol !== "https:" && !["localhost", "127.0.0.1"].includes(url.hostname)) throw new Error("Post-deploy checks kërkojnë HTTPS jashtë localhost.");

const checks = [
  ["/api/health/live", 200],
  ["/api/health/ready", 200],
  ["/login", 200],
];

for (const [path, expected] of checks) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`${baseUrl}${path}`, { redirect: "manual", signal: controller.signal });
    if (response.status !== expected) throw new Error(`${path}: pritej ${expected}, u mor ${response.status}`);

    if (response.headers.has("x-powered-by")) throw new Error(`${path}: X-Powered-By nuk duhet ekspozuar.`);
    if (response.headers.get("x-content-type-options")?.toLowerCase() !== "nosniff") {
      throw new Error(`${path}: X-Content-Type-Options duhet të jetë nosniff.`);
    }
    if (url.protocol === "https:" && !response.headers.get("strict-transport-security")) {
      throw new Error(`${path}: Strict-Transport-Security mungon.`);
    }

    if (path.startsWith("/api/health/")) {
      const payload = await response.json();
      if (payload?.data?.status !== "ok") throw new Error(`${path}: status jo-ok`);
      if (response.headers.get("cache-control") !== "no-store") throw new Error(`${path}: cache-control duhet no-store`);
    }
    console.log(`OK ${path} (${response.status})`);
  } finally {
    clearTimeout(timer);
  }
}
console.log(`Post-deploy verification: OK — ${baseUrl}`);
