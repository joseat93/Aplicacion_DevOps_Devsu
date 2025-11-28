import fs from 'fs';
import path from 'path';

// Paths to artifacts
const coverageSummaryPath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
const trivyReportPath = path.join(process.cwd(), 'trivy-report.json');

// Read coverage
const coverageData = JSON.parse(fs.readFileSync(coverageSummaryPath, 'utf8'));
const total = coverageData.total;

// Read trivy data
const trivy = JSON.parse(fs.readFileSync(trivyReportPath, 'utf8'));

const vulnerabilityCounts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, UNKNOWN: 0 };

if (trivy.Results) {
  for (const result of trivy.Results) {
    if (result.Vulnerabilities) {
      for (const v of result.Vulnerabilities) {
        vulnerabilityCounts[v.Severity] = (vulnerabilityCounts[v.Severity] || 0) + 1;
      }
    }
  }
}

// Build markdown report
const md = `
# 📊 CI Consolidated Report

## 🧪 Code Coverage (Jest)
| Metric | Percentage |
|--------|------------|
| Statements | ${total.statements.pct}% |
| Branches | ${total.branches.pct}% |
| Functions | ${total.functions.pct}% |
| Lines | ${total.lines.pct}% |

---

## 🔐 Vulnerability Summary (Trivy)
| Severity | Count |
|----------|-------|
| CRITICAL | ${vulnerabilityCounts.CRITICAL} |
| HIGH     | ${vulnerabilityCounts.HIGH} |
| MEDIUM   | ${vulnerabilityCounts.MEDIUM} |
| LOW      | ${vulnerabilityCounts.LOW} |
| UNKNOWN  | ${vulnerabilityCounts.UNKNOWN} |

---

## ⏱️ Generated At
${new Date().toISOString()}

`;

fs.writeFileSync('ci-report.md', md);
console.log('Generated ci-report.md');

