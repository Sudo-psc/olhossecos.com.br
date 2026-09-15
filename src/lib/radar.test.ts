import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getRadarReportPath,
  groupFindingsBySection,
  latestRadarReport,
  radarReports,
} from "./radar.ts";

const SEALED_SETEMBRO_DOIS = [
  "10.1002/14651858.CD010051.pub3",
  "10.2147/DDDT.S620553",
  "10.1007/s10792-026-04178-5",
  "10.1038/s41598-026-62115-z",
] as const;

test("o relatório mais recente é setembro-2026 e vem primeiro", () => {
  const latest = latestRadarReport();
  assert.equal(latest?.slug, "setembro-2026");
  assert.equal(radarReports[0]?.slug, "setembro-2026");
  assert.deepEqual(
    radarReports.map((report) => report.slug),
    ["setembro-2026", "agosto-2026", "julho-2026"],
  );
  assert.equal(getRadarReportPath(latest!), "/superficie/radar/setembro-2026");
});

test("setembro-2026 publica só o núcleo selado de quatro achados", () => {
  const report = radarReports[0];
  assert.ok(report);
  assert.equal(report.findings.length, 4);
  assert.deepEqual(
    report.findings.map((finding) => finding.doi),
    [...SEALED_SETEMBRO_DOIS],
  );
  assert.equal(report.industry.length, 0);
  assert.equal(report.publishedAt, "2026-09-15");
});

test("nenhum achado do RADAR entra sem URL e DOI verificável", () => {
  for (const report of radarReports) {
    for (const finding of report.findings) {
      assert.match(finding.url, /^https:\/\//, finding.title);
      if (finding.doi) {
        assert.match(finding.doi, /^10\.\d{4,9}\/\S+$/, finding.title);
      }
    }
  }
});

test("Chen permanece fora do ciclo de setembro", () => {
  const setembro = radarReports.find(
    (report) => report.slug === "setembro-2026",
  );
  assert.ok(setembro);
  const blob = JSON.stringify(setembro.findings);
  assert.doesNotMatch(blob, /Chen/u);
  assert.doesNotMatch(blob, /10807683261424112/u);
});

test("groupFindingsBySection preserva a ordem e não mistura seções", () => {
  const setembro = latestRadarReport();
  assert.ok(setembro);
  const groups = groupFindingsBySection(setembro);
  assert.deepEqual(
    groups.map((group) => group.section),
    ["Farmacologia e pipeline", "Tecnologias diagnósticas e terapêuticas"],
  );
  assert.equal(groups[0]?.findings.length, 3);
  assert.equal(groups[1]?.findings.length, 1);
});
