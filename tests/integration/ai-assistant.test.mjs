import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

async function source(path) {
  return readFile(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("AI assistant përdor business context dhe query të kufizuar", async () => {
  const actionCode = await source("src/actions/ai-assistant-actions.js");
  const contextCode = await source("src/lib/ai-assistant-context.js");
  const widgetCode = await source("src/components/ai/AiAssistantWidget.jsx");
  const shellCode = await source("src/components/dashboard/DashboardShell.jsx");
  const sidebarCode = await source("src/components/dashboard/Sidebar.jsx");

  assert.match(actionCode, /PERMISSIONS\.AI_ASSISTANT_USE/);
  assert.match(actionCode, /requireBusinessActionPermission/);
  assert.match(actionCode, /businessId:\s*context\.businessId/);
  assert.match(actionCode, /validateObject/);
  assert.match(actionCode, /actionSuccess/);
  assert.match(actionCode, /errorFailure/);
  assert.match(contextCode, /where:\s*\{\s*businessId\s*\}/);
  assert.doesNotMatch(contextCode, /\$queryRaw|\$executeRaw/);
  assert.match(widgetCode, /askAiAssistantAction/);
  assert.match(widgetCode, /onPointerDown/);
  assert.match(widgetCode, /localStorage/);
  assert.match(shellCode, /AiAssistantWidget/);
  assert.match(shellCode, /PERMISSIONS\.AI_ASSISTANT_USE/);
  assert.doesNotMatch(sidebarCode, /Asistenti AI/);
});

test("service list ekspozon filtrin financiar dhe arkëtimet reale", async () => {
  const pageCode = await source("src/app/dashboard/services/page.jsx");
  const tableCode = await source("src/components/services/ServicesTable.jsx");
  const filtersCode = await source("src/components/services/ServiceFilters.jsx");
  const statsCode = await source("src/components/services/ServiceStats.jsx");

  assert.match(pageCode, /getServiceFinancialSummary/);
  assert.match(tableCode, /paymentStatus/);
  assert.match(tableCode, /matchesPaymentStatus/);
  assert.match(filtersCode, /Vetëm të paguara/);
  assert.match(filtersCode, /Pjesërisht të paguara/);
  assert.match(statsCode, /Të arkëtuara/);
  assert.match(statsCode, /Për t’u arkëtuar/);
});
