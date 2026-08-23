import { DatabaseSync } from "node:sqlite";

export const getAnalyticsSummary = ({
  databasePath,
  days,
  now = new Date(),
}: {
  databasePath: string;
  days: number;
  now?: Date;
}) => {
  if (!Number.isInteger(days) || days < 1 || days > 365) {
    throw new Error("O período deve ter entre 1 e 365 dias.");
  }
  const since = new Date(
    now.getTime() - days * 24 * 60 * 60 * 1_000,
  ).toISOString();
  const database = new DatabaseSync(databasePath, { readOnly: true });
  try {
    const total = database
      .prepare(
        "SELECT COUNT(*) AS total FROM analytics_events WHERE created_at >= ?",
      )
      .get(since) as { total: number };
    const eventRows = database
      .prepare(
        `SELECT event_name AS event, COUNT(*) AS total
         FROM analytics_events
         WHERE created_at >= ?
         GROUP BY event_name
         ORDER BY total DESC, event_name ASC`,
      )
      .all(since) as Array<{ event: string; total: number }>;
    const pageRows = database
      .prepare(
        `SELECT page_path AS path, COUNT(*) AS total
         FROM analytics_events
         WHERE created_at >= ?
         GROUP BY page_path
         ORDER BY total DESC, page_path ASC
         LIMIT 25`,
      )
      .all(since) as Array<{ path: string; total: number }>;
    const events = eventRows.map(({ event, total }) => ({ event, total }));
    const pages = pageRows.map(({ path, total }) => ({ path, total }));

    return {
      generatedAt: now.toISOString(),
      days,
      total: total.total,
      events,
      pages,
    };
  } finally {
    database.close();
  }
};
