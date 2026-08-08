import { resolve } from "node:path";
import { getAnalyticsSummary } from "../src/lib/analytics-operations.ts";

const databasePath = resolve(
  process.env.ANALYTICS_DATABASE_PATH ?? "/var/lib/olhossecos/analytics.sqlite",
);
const days = Number(process.env.ANALYTICS_REPORT_DAYS ?? "30");
const summary = getAnalyticsSummary({ databasePath, days });
console.log(JSON.stringify(summary, null, 2));
