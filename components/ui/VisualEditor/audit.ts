// components/ui/VisualEditor/audit.ts
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — eBay HTML Compliance Audit
//
// Single source of truth for eBay-safe HTML checks. Used by:
//   - VisualEditor.tsx     → status bar error count
//   - PropertiesPanel.tsx  → per-block "eBay Compliant" badge
//   - AuditTab (future)    → sidebar audit report
//
// Counts the number of distinct compliance issues found in the given HTML.
// Each rule contributes 1 to the count if ANY occurrence is detected, so the
// status bar shows a meaningful "N compliance errors" label rather than just
// "compliant" / "not compliant".
//
// eBay listing HTML rules enforced here:
//   - No <script>, <iframe>, <form>, <object>, <embed>, <applet>
//   - No <style>, <link rel="stylesheet">, <base>
//   - No <meta http-equiv="refresh">
//   - No inline event handlers (onclick, onerror, etc.)
//   - No javascript: / data:text/html URIs
//   - No http:// (must be https://)
//   - No target="_blank" or target attribute on links
// ─────────────────────────────────────────────────────────────────────────────

export interface AuditResult {
    /** Number of distinct compliance issues detected */
    count: number
    /** Human-readable labels for each issue type (parallel to rules) */
    issues: string[]
}

// ── Hard errors — will cause eBay listing rejection ───────────────────────────
// NOTE: <style> and target= are intentionally excluded here:
//   • <style> is flagged as a WARNING in AuditTab (eBay may strip it, not reject)
//   • target= is standard on template links and not an eBay violation
const RULES: Array<{ name: string; pattern: RegExp }> = [
    { name: '<script> tag', pattern: /<script\b/i },
    { name: '<iframe> tag', pattern: /<iframe\b/i },
    { name: '<form> tag', pattern: /<form\b/i },
    { name: '<object> tag', pattern: /<object\b/i },
    { name: '<embed> tag', pattern: /<embed\b/i },
    { name: '<applet> tag', pattern: /<applet\b/i },
    { name: '<link rel=stylesheet>', pattern: /<link\b[^>]*rel\s*=\s*["']stylesheet/i },
    { name: '<base> tag', pattern: /<base\b/i },
    { name: '<meta refresh>', pattern: /<meta\b[^>]*http-equiv\s*=\s*["']refresh/i },
    { name: 'inline event handler', pattern: /\bon[a-z]+\s*=/i },
    { name: 'javascript: URI', pattern: /(href|src)\s*=\s*["']javascript:/i },
    { name: 'data:text/html URI', pattern: /(href|src)\s*=\s*["']data:text\/html/i },
    { name: 'HTTP image (must be HTTPS)', pattern: /src\s*=\s*["']http:\/\//i },
    { name: 'localhost image URL', pattern: /src\s*=\s*["']https?:\/\/(localhost|127\.0\.0\.1)/i },
    { name: 'relative image path', pattern: /<img\b[^>]*\bsrc\s*=\s*["']\.?\//i },
    { name: 'non-eBay link (will be stripped)', pattern: /href\s*=\s*["']https?:\/\/(?!(?:[a-z0-9-]+\.)*ebay\.(?:com|co\.uk|com\.au|de|fr|it|es|ca|com\.sg|com\.hk|at|be|nl|pl|ch|ie))[^"'#]/i },
]

/**
 * Audit a chunk of HTML for eBay compliance.
 * Returns the count of distinct issues and the list of issue labels.
 * Pure function — safe to call inside useMemo / render.
 */
export function auditHtml(html: string): AuditResult {
    if (!html) return { count: 0, issues: [] }
    const issues: string[] = []
    for (const rule of RULES) {
        if (rule.pattern.test(html)) issues.push(rule.name)
    }
    return { count: issues.length, issues }
}
