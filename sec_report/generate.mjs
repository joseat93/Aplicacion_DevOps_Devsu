import fs from 'fs';
import path from 'path';

/**
 * Busca un archivo por nombre de forma recursiva desde un directorio base.
 */
function findFile(filename, startDir = process.cwd()) {
  const entries = fs.readdirSync(startDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(startDir, entry.name);

    if (entry.isFile() && entry.name === filename) {
      return fullPath;
    }

    if (entry.isDirectory()) {
      const found = findFile(filename, fullPath);
      if (found) return found;
    }
  }

  return null;
}

// 🔍 Buscar coverage-summary.json
const coverageSummaryPath = findFile('coverage-summary.json');
if (!coverageSummaryPath) {
  throw new Error('No se encontró coverage-summary.json en el workspace');
}

// 🔍 Buscar trivy-report.json
const trivyReportPath = findFile('trivy-report.json');
if (!trivyReportPath) {
  throw new Error('No se encontró trivy-report.json en el workspace');
}

console.log('Usando coverage:', coverageSummaryPath);
console.log('Usando trivy   :', trivyReportPath);

// Leer coverage
const coverageData = JSON.parse(fs.readFileSync(coverageSummaryPath, 'utf8'));
const total = coverageData.total;

// Leer trivy
const trivy = JSON.parse(fs.readFileSync(trivyReportPath, 'utf8'));

const vulnerabilityCounts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, UNKNOWN: 0 };

if (trivy.Results) {
  for (const result of trivy.Results) {
    if (result.Vulnerabilities) {
      for (const v of result.Vulnerabilities) {
        const sev = v.Severity || 'UNKNOWN';
        vulnerabilityCounts[sev] = (vulnerabilityCounts[sev] || 0) + 1;
      }
    }
  }
}

const md = `
# 📊 CI Consolidated Report

## 🧪 Code Coverage (Jest)
| Metric     | Percentage |
|-----------|------------|
| Statements| ${total.statements.pct}% |
| Branches  | ${total.branches.pct}% |
| Functions | ${total.functions.pct}% |
| Lines     | ${total.lines.pct}% |

---

## 🔐 Vulnerability Summary (Trivy)
| Severity | Count |
|---------|-------|
| CRITICAL | ${vulnerabilityCounts.CRITICAL} |
| HIGH     | ${vulnerabilityCounts.HIGH} |
| MEDIUM   | ${vulnerabilityCounts.MEDIUM} |
| LOW      | ${vulnerabilityCounts.LOW} |
| UNKNOWN  | ${vulnerabilityCounts.UNKNOWN} |

---

## ⏱️ Generated At
${new Date().toISOString()}
`;

fs.writeFileSync('ci-report.md', md, 'utf8');
console.log('Generated ci-report.md');
