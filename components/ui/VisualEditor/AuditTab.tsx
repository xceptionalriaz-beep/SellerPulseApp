'use client'
// components/ui/VisualEditor/AuditTab.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Riazify — Visual Editor / Audit Tab
//
// Live eBay compliance linter. Runs every time the HTML changes.
// Checks against eBay's active content policy + accessibility best practices.
//
// Issue severity levels:
//   error   — will cause eBay listing rejection or removal
//   warning — may cause issues or hurt performance
//   info    — best practice suggestions
//
// Checks performed:
//   ERRORS:
//     • <script> tags present (active content violation)
//     • <iframe> tags present (active content violation)
//     • <form> tags present (active content violation)
//     • javascript: hrefs (active content violation)
//     • on* event handlers (onclick, onload etc.)
//     • HTTP (non-HTTPS) image URLs
//     • External CSS <link> tags
//
//   WARNINGS:
//     • Images missing alt text
//     • Images with empty alt text
//     • Very large template (>50KB — slow load)
//     • Unfilled {{PLACEHOLDERS}} still present
//     • <style> blocks (eBay may strip inline styles)
//     • Flash / object embeds
//
//   INFO:
//     • No product title found
//     • No price found
//     • No shipping info found
//     • Block count (informational)
//
// Props:
//   html        — current assembled HTML string
//   blockCount  — number of blocks on canvas
// ─────────────────────────────────────────────────────────────────────────────

import React, { useMemo, useState } from 'react'
import {
    CheckCircle2, AlertTriangle, XCircle,
    Info, RefreshCw, ChevronDown, ShieldCheck,
} from 'lucide-react'

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
    bg: '#f8f7ff',
    surface: '#ffffff',
    border: '#ede9fe',
    primary: '#7530fb',
    primaryLight: '#f3eeff',
    dark: '#1e1535',
    body: '#1f1d2e',
    secondary: '#6b7280',
    muted: '#9ca3af',
    accent: '#b8fa33',
    success: '#16a34a',
    successBg: '#dcfce7',
    successBorder: '#86efac50',
    warning: '#d97706',
    warningBg: '#fef3c7',
    warningBorder: '#fde68a50',
    danger: '#ef4444',
    dangerBg: '#fee2e2',
    dangerBorder: '#fecaca50',
    info: '#0ea5e9',
    infoBg: '#e0f2fe',
    infoBorder: '#bae6fd50',
}

// ── Issue types ───────────────────────────────────────────────────────────────
type Severity = 'error' | 'warning' | 'info'

interface AuditIssue {
    id: string
    severity: Severity
    title: string
    detail: string
    fixHint?: string
    count?: number      // how many instances found
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface AuditTabProps {
    html: string
    blockCount: number
}

// ─────────────────────────────────────────────────────────────────────────────
// AUDIT ENGINE
// Pure function — runs all checks on the HTML string
// ─────────────────────────────────────────────────────────────────────────────
function runAudit(html: string, blockCount: number): AuditIssue[] {
    const issues: AuditIssue[] = []
    if (!html || html.trim().length < 50) return issues

    // ── ERRORS ────────────────────────────────────────────────────────────────

    // Script tags
    const scriptMatches = html.match(/<script\b[^>]*>/gi)
    if (scriptMatches) {
        issues.push({
            id: 'script-tags',
            severity: 'error',
            title: '<script> tags detected',
            detail: `Found ${scriptMatches.length} <script> tag${scriptMatches.length > 1 ? 's' : ''}. eBay prohibits all JavaScript in listing descriptions — this will cause your listing to be removed.`,
            fixHint: 'Remove all <script> tags and JavaScript from your template.',
            count: scriptMatches.length,
        })
    }

    // iFrame tags
    const iframeMatches = html.match(/<iframe\b[^>]*>/gi)
    if (iframeMatches) {
        issues.push({
            id: 'iframe-tags',
            severity: 'error',
            title: '<iframe> tags detected',
            detail: `Found ${iframeMatches.length} <iframe> element${iframeMatches.length > 1 ? 's' : ''}. Embedded iframes are active content and violate eBay's listing policy.`,
            fixHint: 'Remove all <iframe> elements.',
            count: iframeMatches.length,
        })
    }

    // Form tags
    const formMatches = html.match(/<form\b[^>]*>/gi)
    if (formMatches) {
        issues.push({
            id: 'form-tags',
            severity: 'error',
            title: '<form> tags detected',
            detail: `Found ${formMatches.length} <form> element${formMatches.length > 1 ? 's' : ''}. HTML forms are not allowed in eBay listing descriptions.`,
            fixHint: 'Remove all <form> and <input> elements.',
            count: formMatches.length,
        })
    }

    // Event handlers
    const eventMatches = html.match(/\bon\w+\s*=\s*["'][^"']*["']/gi)
    if (eventMatches) {
        issues.push({
            id: 'event-handlers',
            severity: 'error',
            title: 'JavaScript event handlers detected',
            detail: `Found ${eventMatches.length} event handler${eventMatches.length > 1 ? 's' : ''} (e.g. onclick, onload, onmouseover). These are active content and will be stripped by eBay.`,
            fixHint: 'Remove all on* event attributes from HTML elements.',
            count: eventMatches.length,
        })
    }

    // javascript: hrefs
    const jsHrefMatches = html.match(/href\s*=\s*["']javascript:/gi)
    if (jsHrefMatches) {
        issues.push({
            id: 'javascript-hrefs',
            severity: 'error',
            title: 'javascript: links detected',
            detail: `Found ${jsHrefMatches.length} href with javascript: protocol. These are blocked by eBay's content security policy.`,
            fixHint: 'Replace javascript: links with # or a real HTTPS URL.',
            count: jsHrefMatches.length,
        })
    }

    // HTTP (non-HTTPS) image URLs
    const httpImgMatches = html.match(/src\s*=\s*["']http:\/\//gi)
    if (httpImgMatches) {
        issues.push({
            id: 'http-images',
            severity: 'error',
            title: 'HTTP (non-secure) image URLs',
            detail: `Found ${httpImgMatches.length} image${httpImgMatches.length > 1 ? 's' : ''} using HTTP instead of HTTPS. eBay requires all external resources to use HTTPS.`,
            fixHint: 'Change all http:// image URLs to https://.',
            count: httpImgMatches.length,
        })
    }

    // External CSS link tags
    const linkTagMatches = html.match(/<link\b[^>]*rel\s*=\s*["']stylesheet["'][^>]*>/gi)
    if (linkTagMatches) {
        issues.push({
            id: 'external-css',
            severity: 'error',
            title: 'External CSS stylesheets detected',
            detail: `Found ${linkTagMatches.length} external CSS <link> tag${linkTagMatches.length > 1 ? 's' : ''}. eBay strips external stylesheets — use inline styles only.`,
            fixHint: 'Move all CSS to inline style="" attributes.',
            count: linkTagMatches.length,
        })
    }

    // Flash / object embeds
    const embedMatches = html.match(/<(object|embed|applet)\b[^>]*>/gi)
    if (embedMatches) {
        issues.push({
            id: 'embed-elements',
            severity: 'error',
            title: 'Embedded objects detected',
            detail: `Found ${embedMatches.length} <object>/<embed>/<applet> element${embedMatches.length > 1 ? 's' : ''}. These are active content and banned by eBay.`,
            fixHint: 'Remove all object, embed and applet elements.',
            count: embedMatches.length,
        })
    }

    // ── WARNINGS ──────────────────────────────────────────────────────────────

    // Images missing alt text
    const imgTagsAll = html.match(/<img\b[^>]*>/gi) || []
    const imgsMissingAlt = imgTagsAll.filter(tag =>
        !tag.match(/alt\s*=\s*["'][^"']+["']/i)
    )
    if (imgsMissingAlt.length > 0) {
        issues.push({
            id: 'missing-alt',
            severity: 'warning',
            title: 'Images missing alt text',
            detail: `${imgsMissingAlt.length} of ${imgTagsAll.length} image${imgTagsAll.length > 1 ? 's' : ''} ${imgsMissingAlt.length > 1 ? 'are' : 'is'} missing descriptive alt text. This hurts accessibility and eBay's mobile search ranking.`,
            fixHint: 'Add descriptive alt="" attributes to every <img> tag.',
            count: imgsMissingAlt.length,
        })
    }

    // Inline <style> blocks
    const styleBlockMatches = html.match(/<style\b[^>]*>[\s\S]*?<\/style>/gi)
    if (styleBlockMatches) {
        issues.push({
            id: 'style-blocks',
            severity: 'warning',
            title: '<style> blocks may be stripped',
            detail: `Found ${styleBlockMatches.length} <style> block${styleBlockMatches.length > 1 ? 's' : ''}. Some eBay categories and regions strip <style> blocks — inline styles are safer.`,
            fixHint: 'Convert <style> rules to inline style="" attributes where possible.',
            count: styleBlockMatches.length,
        })
    }

    // Template size
    const sizeKb = Math.round(html.length / 1024)
    if (sizeKb > 50) {
        issues.push({
            id: 'template-size',
            severity: 'warning',
            title: `Template is large (${sizeKb}KB)`,
            detail: `Templates over 50KB can slow page load on mobile. eBay recommends keeping listing descriptions under 50KB for best performance.`,
            fixHint: 'Remove unused blocks or reduce image counts to trim the template size.',
        })
    }

    // Unfilled placeholders
    const placeholderMatches = html.match(/\{\{[A-Z_]+\}\}/g)
    if (placeholderMatches) {
        const unique = [...new Set(placeholderMatches)]
        issues.push({
            id: 'unfilled-placeholders',
            severity: 'warning',
            title: `${unique.length} unfilled placeholder${unique.length > 1 ? 's' : ''}`,
            detail: `Found: ${unique.slice(0, 5).join(', ')}${unique.length > 5 ? ` and ${unique.length - 5} more` : ''}. These will show as literal text in the listing unless replaced by your listing tool.`,
            fixHint: 'Placeholders are filled automatically by your eBay listing tool — this is expected if using dynamic templates.',
            count: unique.length,
        })
    }

    // External image URLs (not Supabase, not eBay CDN)
    const extImgMatches = (html.match(/src\s*=\s*["']https?:\/\/[^"']+["']/gi) || [])
        .filter(src =>
            !src.includes('ebayimg.com') &&
            !src.includes('supabase') &&
            !src.includes('placeholder') &&
            !src.includes('via.placeholder') &&
            !src.includes('{{') &&
            !src.includes('#')
        )
    if (extImgMatches.length > 0) {
        issues.push({
            id: 'external-images',
            severity: 'warning',
            title: `${extImgMatches.length} external image${extImgMatches.length > 1 ? 's' : ''} detected`,
            detail: `Images hosted on external servers may fail to load if the host goes down or blocks eBay's crawler. Use eBay-hosted or Supabase-hosted images for reliability.`,
            fixHint: 'Upload images to My Assets and use the Supabase URLs instead.',
            count: extImgMatches.length,
        })
    }

    // ── INFO ──────────────────────────────────────────────────────────────────

    // Block count
    if (blockCount > 0) {
        issues.push({
            id: 'block-count',
            severity: 'info',
            title: `${blockCount} block${blockCount !== 1 ? 's' : ''} on canvas`,
            detail: blockCount > 20
                ? `Your template has ${blockCount} blocks. Consider simplifying — buyers typically scan listings rather than reading every section.`
                : `Good template length. Most high-converting listings have 8–15 blocks.`,
        })
    }

    // No product title block
    if (!html.includes('{{PRODUCT_TITLE}}') && !html.includes('PRODUCT_TITLE')) {
        issues.push({
            id: 'no-product-title',
            severity: 'info',
            title: 'No product title placeholder',
            detail: 'Your template does not include a {{PRODUCT_TITLE}} placeholder. Adding one helps buyers immediately identify the item.',
            fixHint: 'Add a Product Title block from the block library.',
        })
    }

    // No price
    if (!html.includes('{{ITEM_PRICE}}') && !html.includes('ITEM_PRICE')) {
        issues.push({
            id: 'no-price',
            severity: 'info',
            title: 'No price placeholder',
            detail: 'Your template does not include a {{ITEM_PRICE}} placeholder. Showing price in the description reinforces value.',
            fixHint: 'Add a Price Block from the block library.',
        })
    }

    // No shipping info
    const hasShipping = html.toLowerCase().includes('shipping') ||
        html.includes('{{SHIPPING') ||
        html.includes('{{RETURN')
    if (!hasShipping && blockCount > 3) {
        issues.push({
            id: 'no-shipping',
            severity: 'info',
            title: 'No shipping information',
            detail: 'Buyers consistently cite shipping info as a key purchase factor. Consider adding a Shipping Info or Policy Tabs block.',
            fixHint: 'Add a Shipping Info Bar or Policy Tabs block.',
        })
    }

    return issues
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function AuditTab({ html, blockCount }: AuditTabProps) {
    const [expanded, setExpanded] = useState<Set<string>>(new Set())

    const issues = useMemo(() => runAudit(html, blockCount), [html, blockCount])

    const errors = issues.filter(i => i.severity === 'error')
    const warnings = issues.filter(i => i.severity === 'warning')
    const infos = issues.filter(i => i.severity === 'info')

    const isCompliant = errors.length === 0
    const sizeKb = Math.round(html.length / 1024)

    const toggleExpand = (id: string) => {
        setExpanded(prev => {
            const next = new Set(prev)
            next.has(id) ? next.delete(id) : next.add(id)
            return next
        })
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: C.bg }}>

            {/* ── Header ── */}
            <div style={{
                padding: '14px 14px 12px',
                borderBottom: `1px solid ${C.border}`,
                backgroundColor: C.surface,
                flexShrink: 0,
            }}>
                <p style={{
                    margin: '0 0 8px',
                    fontFamily: 'Syne, sans-serif',
                    fontWeight: 700, fontSize: 13,
                    color: C.dark, letterSpacing: '0.02em',
                    textTransform: 'uppercase',
                }}>
                    eBay Compliance Audit
                </p>

                {/* Overall status badge */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '10px 12px',
                    borderRadius: 10,
                    backgroundColor: isCompliant ? C.successBg : C.dangerBg,
                    border: `1px solid ${isCompliant ? C.successBorder : C.dangerBorder}`,
                }}>
                    {isCompliant
                        ? <ShieldCheck size={18} style={{ color: C.success, flexShrink: 0 }} />
                        : <XCircle size={18} style={{ color: C.danger, flexShrink: 0 }} />
                    }
                    <div>
                        <p style={{
                            margin: 0,
                            fontFamily: 'DM Sans, sans-serif', fontSize: 12,
                            fontWeight: 700,
                            color: isCompliant ? C.success : C.danger,
                        }}>
                            {isCompliant
                                ? '100% eBay Policy Compliant'
                                : `${errors.length} compliance error${errors.length > 1 ? 's' : ''} found`
                            }
                        </p>
                        <p style={{
                            margin: '1px 0 0',
                            fontFamily: 'DM Sans, sans-serif', fontSize: 10,
                            color: isCompliant ? '#166534' : '#991b1b',
                        }}>
                            {isCompliant
                                ? `${warnings.length} warning${warnings.length !== 1 ? 's' : ''} · ${sizeKb}KB · ${blockCount} blocks`
                                : 'Fix errors before publishing to avoid listing removal'
                            }
                        </p>
                    </div>
                </div>

                {/* Issue count pills */}
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    <CountPill count={errors.length} label="Errors" color={C.danger} bg={C.dangerBg} />
                    <CountPill count={warnings.length} label="Warnings" color={C.warning} bg={C.warningBg} />
                    <CountPill count={infos.length} label="Info" color={C.info} bg={C.infoBg} />
                </div>
            </div>

            {/* ── Issue list ── */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0 16px' }}>

                {issues.length === 0 && blockCount === 0 ? (
                    <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                        <ShieldCheck size={32} style={{ color: C.border, margin: '0 auto 10px', display: 'block' }} />
                        <p style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: C.muted }}>
                            Add blocks to your canvas and the audit will run automatically.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Errors */}
                        {errors.length > 0 && (
                            <IssueGroup
                                title="Errors"
                                issues={errors}
                                expanded={expanded}
                                onToggle={toggleExpand}
                            />
                        )}

                        {/* Warnings */}
                        {warnings.length > 0 && (
                            <IssueGroup
                                title="Warnings"
                                issues={warnings}
                                expanded={expanded}
                                onToggle={toggleExpand}
                            />
                        )}

                        {/* Info */}
                        {infos.length > 0 && (
                            <IssueGroup
                                title="Info"
                                issues={infos}
                                expanded={expanded}
                                onToggle={toggleExpand}
                            />
                        )}

                        {/* All clear message */}
                        {errors.length === 0 && warnings.length === 0 && (
                            <div style={{
                                margin: '8px 12px',
                                padding: '12px 14px',
                                backgroundColor: C.successBg,
                                border: `1px solid ${C.successBorder}`,
                                borderRadius: 10,
                                display: 'flex', alignItems: 'center', gap: 10,
                            }}>
                                <CheckCircle2 size={16} style={{ color: C.success, flexShrink: 0 }} />
                                <div>
                                    <p style={{ margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 700, color: C.success }}>
                                        No errors or warnings
                                    </p>
                                    <p style={{ margin: '2px 0 0', fontFamily: 'DM Sans, sans-serif', fontSize: 10, color: '#166534' }}>
                                        Your template is safe to publish on eBay.
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* ── Footer — eBay policy link ── */}
            <div style={{
                padding: '10px 14px',
                borderTop: `1px solid ${C.border}`,
                backgroundColor: C.surface,
                flexShrink: 0,
            }}>
                <p style={{
                    margin: 0, fontFamily: 'DM Sans, sans-serif', fontSize: 10,
                    color: C.muted, textAlign: 'center', lineHeight: 1.5,
                }}>
                    Audit runs on every change · Based on{' '}
                    <a
                        href="https://www.ebay.co.uk/help/policies/listing-policies/active-content-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: C.primary, textDecoration: 'none' }}
                    >
                        eBay Active Content Policy
                    </a>
                </p>
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// ISSUE GROUP
// ─────────────────────────────────────────────────────────────────────────────
function IssueGroup({
    title, issues, expanded, onToggle,
}: {
    title: string
    issues: AuditIssue[]
    expanded: Set<string>
    onToggle: (id: string) => void
}) {
    return (
        <div style={{ marginBottom: 4 }}>
            <p style={{
                margin: '0 0 4px',
                padding: '4px 14px',
                fontFamily: 'DM Sans, sans-serif', fontSize: 10,
                fontWeight: 700, color: C.muted,
                textTransform: 'uppercase', letterSpacing: '0.07em',
                backgroundColor: C.bg,
            }}>
                {title} ({issues.length})
            </p>
            {issues.map(issue => (
                <IssueCard
                    key={issue.id}
                    issue={issue}
                    isExpanded={expanded.has(issue.id)}
                    onToggle={() => onToggle(issue.id)}
                />
            ))}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// ISSUE CARD
// ─────────────────────────────────────────────────────────────────────────────
function IssueCard({
    issue, isExpanded, onToggle,
}: {
    issue: AuditIssue
    isExpanded: boolean
    onToggle: () => void
}) {
    const severityConfig = {
        error: {
            Icon: XCircle,
            color: C.danger,
            bg: C.dangerBg,
            border: C.dangerBorder,
        },
        warning: {
            Icon: AlertTriangle,
            color: C.warning,
            bg: C.warningBg,
            border: C.warningBorder,
        },
        info: {
            Icon: Info,
            color: C.info,
            bg: C.infoBg,
            border: C.infoBorder,
        },
    }

    const config = severityConfig[issue.severity]
    const { Icon } = config

    return (
        <div
            style={{
                margin: '0 12px 5px',
                borderRadius: 9,
                border: `1px solid ${config.border}`,
                backgroundColor: config.bg,
                overflow: 'hidden',
            }}
        >
            {/* Header row — always visible */}
            <button
                onClick={onToggle}
                style={{
                    width: '100%', display: 'flex',
                    alignItems: 'flex-start', gap: 8,
                    padding: '9px 10px',
                    background: 'none', border: 'none',
                    cursor: 'pointer', textAlign: 'left' as const,
                }}
            >
                <Icon size={13} style={{ color: config.color, flexShrink: 0, marginTop: 1 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
                        <p style={{
                            margin: 0, fontFamily: 'DM Sans, sans-serif',
                            fontSize: 11, fontWeight: 700, color: config.color,
                            flex: 1,
                        }}>
                            {issue.title}
                        </p>
                        {issue.count !== undefined && (
                            <span style={{
                                flexShrink: 0,
                                backgroundColor: config.color,
                                color: '#fff',
                                fontFamily: 'DM Sans, sans-serif',
                                fontSize: 9, fontWeight: 700,
                                padding: '1px 5px', borderRadius: 10,
                            }}>
                                {issue.count}
                            </span>
                        )}
                    </div>
                </div>
                <ChevronDown
                    size={12}
                    style={{
                        color: config.color, flexShrink: 0,
                        transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                        transition: 'transform 0.2s', marginTop: 1,
                    }}
                />
            </button>

            {/* Expanded detail */}
            {isExpanded && (
                <div style={{
                    padding: '0 10px 10px 31px',
                    borderTop: `1px solid ${config.border}`,
                }}>
                    <p style={{
                        margin: '8px 0 0',
                        fontFamily: 'DM Sans, sans-serif', fontSize: 11,
                        color: C.body, lineHeight: 1.6,
                    }}>
                        {issue.detail}
                    </p>
                    {issue.fixHint && (
                        <div style={{
                            marginTop: 8, padding: '6px 8px',
                            backgroundColor: 'rgba(255,255,255,0.6)',
                            borderRadius: 6, border: `1px solid ${config.border}`,
                        }}>
                            <p style={{
                                margin: 0, fontFamily: 'DM Sans, sans-serif',
                                fontSize: 10, color: C.secondary, lineHeight: 1.5,
                            }}>
                                <strong style={{ color: C.dark }}>Fix: </strong>
                                {issue.fixHint}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────────────────────
// COUNT PILL
// ─────────────────────────────────────────────────────────────────────────────
function CountPill({
    count, label, color, bg,
}: {
    count: number
    label: string
    color: string
    bg: string
}) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '3px 8px',
            backgroundColor: count > 0 ? bg : C.bg,
            border: `1px solid ${count > 0 ? color + '44' : C.border}`,
            borderRadius: 20,
        }}>
            <span style={{
                fontFamily: 'DM Sans, sans-serif', fontSize: 12,
                fontWeight: 800, color: count > 0 ? color : C.muted,
            }}>
                {count}
            </span>
            <span style={{
                fontFamily: 'DM Sans, sans-serif', fontSize: 10,
                color: count > 0 ? color : C.muted,
            }}>
                {label}
            </span>
        </div>
    )
}
