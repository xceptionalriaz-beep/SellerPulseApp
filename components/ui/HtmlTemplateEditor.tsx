'use client'

/**
 * HtmlTemplateEditor — Shared rich text + HTML editor component
 * Used by:
 *   - Step2Media (listing description)
 *   - Design tool (template builder)
 *
 * Props:
 *   value         — current HTML string
 *   onChange      — callback when content changes
 *   onAiWrite     — optional AI generation trigger
 *   aiLoading     — whether AI is currently generating
 *   uploadedPhotos — photo URLs available to insert into description
 *   supabaseUpload — upload function for inline images
 *   showHeader    — whether to show the "Product Description" header (default true)
 *   placeholder   — editor placeholder text
 */

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { FileText, X, Zap, Copy, Trash2, Monitor, Tablet, Smartphone, RefreshCw } from 'lucide-react'
import {
    EditorToolbar, sanitiseHtml,
} from '@/components/ui/EditorToolbar'
import DescriptionLibrary from '@/components/ui/DescriptionLibrary'

// ── Design tokens ─────────────────────────────────────────────
const C = {
    bg: '#f8f7ff',
    surface: '#ffffff',
    border: '#ede9fe',
    borderInput: '#e5e0f5',
    primary: '#7530fb',
    primaryLight: '#f3eeff',
    accent: '#b8fa33',
    dark: '#1e1535',
    body: '#1f1d2e',
    secondary: '#6b7280',
    muted: '#9ca3af',
    success: '#16a34a',
    successBg: '#dcfce7',
    warning: '#d97706',
    warningBg: '#fef3c7',
    danger: '#ef4444',
    dangerBg: '#fee2e2',
}

const CHAR_LIMIT = 500000

// ── Real HTML syntax highlighter ──────────────────────────────
// Colors match VSCode Dark+ theme
function syntaxHighlight(code: string): string {
    if (!code) return ''
    const e = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')

    // Process line by line to avoid regex catastrophic backtracking
    return e.split('\n').map(line => {
        // Comments
        if (/&lt;!--/.test(line))
            return `<span style="color:#6a9955">${line}</span>`
        // DOCTYPE
        if (/&lt;!DOCTYPE/i.test(line))
            return `<span style="color:#808080">${line}</span>`

        // Replace tag syntax with colored spans
        return line
            // Closing tags: </tagname>
            .replace(/(&lt;\/)([a-zA-Z][a-zA-Z0-9]*)(.*?&gt;)/g,
                '<span style="color:#808080">&lt;/</span><span style="color:#569cd6">$2</span><span style="color:#808080">&gt;</span>')
            // Opening tags: <tagname attrs>
            .replace(/(&lt;)([a-zA-Z][a-zA-Z0-9]*)((?:\s+[^&].*?)?)(\/?&gt;)/g,
                (_, _lt, tag, attrs, close) => {
                    const coloredAttrs = attrs
                        // attr="value" or attr='value'
                        .replace(/\s([a-zA-Z][a-zA-Z0-9-]*)=(&quot;[^&]*?&quot;|&#39;[^&]*?&#39;)/g,
                            ' <span style="color:#9cdcfe">$1</span><span style="color:#d4d4d4">=</span><span style="color:#ce9178">$2</span>')
                        // standalone attr (boolean)
                        .replace(/\s([a-zA-Z][a-zA-Z0-9-]*)(?=\s|$)/g,
                            ' <span style="color:#9cdcfe">$1</span>')
                    return `<span style="color:#808080">&lt;</span><span style="color:#569cd6">${tag}</span>${coloredAttrs}<span style="color:#808080">${close}</span>`
                })
            // Text content between tags — white
            .replace(/(&gt;)([^&][^<]*)(&lt;)/g,
                '$1<span style="color:#ffffff">$2</span>$3')
            // Lines with no tags — white
            .replace(/^([^<&].*)$/, '<span style="color:#ffffff">$1</span>')
    }).join('\n')
}

// ── Props ──────────────────────────────────────────────────────
interface HtmlTemplateEditorProps {
    value: string
    onChange: (html: string) => void
    onAiWrite?: () => void
    aiLoading?: boolean
    uploadedPhotos?: string[]
    supabaseUpload?: (file: File) => Promise<string | null>
    showHeader?: boolean
    showPreviewControls?: boolean   // device switcher + refresh — off in Step2, on in Design tool
    placeholder?: string
    isTyping?: boolean
    autoSaved?: boolean
}

export default function HtmlTemplateEditor({
    value,
    onChange,
    onAiWrite,
    aiLoading = false,
    uploadedPhotos = [],
    supabaseUpload,
    showHeader = true,
    showPreviewControls = false,
    placeholder = 'Write your listing description here, or use AI to generate one...',
    isTyping = false,
    autoSaved = false,
}: HtmlTemplateEditorProps) {

    const descRef = useRef<HTMLDivElement>(null)
    const codeTextareaRef = useRef<HTMLTextAreaElement>(null)
    const lineNumbersRef = useRef<HTMLDivElement>(null)
    const highlightRef = useRef<HTMLPreElement>(null)
    const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    const [htmlContent, setHtmlContent] = useState(value || '')
    const [descMode, setDescMode] = useState<'rich' | 'html'>('rich')
    const [descTab, setDescTab] = useState<'templates' | 'library'>('templates')
    const [descPreview, setDescPreview] = useState<'edit' | 'mobile' | 'desktop'>('edit')
    const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set())
    const [copied, setCopied] = useState(false)
    const [internalAutoSaved, setInternalAutoSaved] = useState(false)
    const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
    const [previewKey, setPreviewKey] = useState(0)

    // Sync value prop → internal state when changed externally
    useEffect(() => {
        if (value !== htmlContent) {
            setHtmlContent(value || '')
            if (descRef.current && descMode === 'rich') {
                descRef.current.innerHTML = value || ''
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value])

    // Init rich editor with existing content
    useEffect(() => {
        if (descRef.current && value) {
            descRef.current.innerHTML = value
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Schedule auto-save
    const scheduleAutosave = useCallback((html: string) => {
        if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
        autosaveTimer.current = setTimeout(() => {
            onChange(sanitiseHtml(html))
            setInternalAutoSaved(true)
            setTimeout(() => setInternalAutoSaved(false), 2000)
        }, 1200)
    }, [onChange])

    // execCmd for EditorToolbar
    const execCmd = useCallback((cmd: string, value?: string) => {
        document.execCommand(cmd, false, value)
        if (descRef.current) {
            const html = descRef.current.innerHTML
            setHtmlContent(html)
            onChange(sanitiseHtml(html))
        }
        setActiveFormats(prev => {
            const next = new Set(prev)
            if (['bold', 'italic', 'underline', 'strikeThrough'].includes(cmd)) {
                document.queryCommandState(cmd) ? next.add(cmd) : next.delete(cmd)
            }
            return next
        })
    }, [onChange])

    const onInput = useCallback(() => {
        if (!descRef.current) return
        const html = descRef.current.innerHTML
        setHtmlContent(html)
        scheduleAutosave(html)
        // Update active formats
        const formats = new Set<string>()
            ;['bold', 'italic', 'underline', 'strikeThrough'].forEach(f => {
                if (document.queryCommandState(f)) formats.add(f)
            })
        setActiveFormats(formats)
    }, [scheduleAutosave])

    const copyContent = useCallback(() => {
        if (descRef.current) setHtmlContent(descRef.current.innerHTML)
        navigator.clipboard.writeText(htmlContent)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }, [htmlContent])

    const clearContent = useCallback(() => {
        onChange('')
        setHtmlContent('')
        if (descRef.current) descRef.current.innerHTML = ''
        setDescPreview('edit')
    }, [onChange])

    const wordCount = htmlContent.replace(/<[^>]*>/g, '').trim().split(/\s+/).filter(Boolean).length
    const charCount = htmlContent.length
    const showAutoSaved = autoSaved || internalAutoSaved

    return (
        <div className="flex flex-col gap-3 flex-1">

            {/* Header */}
            {showHeader && (
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: C.primaryLight }}>
                        <FileText size={13} style={{ color: C.primary }} />
                    </div>
                    <h2 className="text-[15px] font-bold"
                        style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                        Product Description
                    </h2>
                </div>
            )}

            {/* Design Library Modal */}
            {descTab === 'library' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: 'rgba(30,21,53,0.6)', backdropFilter: 'blur(4px)' }}>
                    <div className="flex flex-col rounded-2xl overflow-hidden shadow-2xl w-full max-w-2xl"
                        style={{ backgroundColor: C.surface, border: `1px solid ${C.border}`, maxHeight: '85vh' }}>

                        {/* Modal header */}
                        <div className="flex items-center justify-between px-5 py-4 shrink-0"
                            style={{ borderBottom: `1px solid ${C.border}`, backgroundColor: C.bg }}>
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: C.primaryLight }}>
                                    <Zap size={13} style={{ color: C.primary }} />
                                </div>
                                <div>
                                    <h2 className="text-[15px] font-bold"
                                        style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
                                        Design Library
                                    </h2>
                                    <p className="text-[11px]"
                                        style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                                        37 eBay-safe blocks — click any to insert
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setDescTab('templates')}
                                className="w-8 h-8 flex items-center justify-center rounded-xl transition-all hover:opacity-70"
                                style={{ backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                                <X size={14} style={{ color: C.secondary }} />
                            </button>
                        </div>

                        {/* Modal body */}
                        <div className="flex-1 overflow-y-auto p-4">
                            <DescriptionLibrary
                                onInsert={html => {
                                    const newContent = (htmlContent || '') + '\n' + html
                                    setHtmlContent(newContent)
                                    onChange(sanitiseHtml(newContent))
                                    if (descRef.current) descRef.current.innerHTML = sanitiseHtml(newContent)
                                    setDescMode('rich')
                                    setDescPreview('edit')
                                    setDescTab('templates')
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Editor card */}
            <div className="rounded-2xl flex flex-col xl:flex-1"
                style={{ backgroundColor: C.surface, border: `1px solid ${C.border}` }}>

                {/* Toolbar */}
                {descMode === 'rich' && (
                    <div className="sticky top-0 z-20 rounded-t-2xl overflow-hidden"
                        style={{ backgroundColor: C.surface, boxShadow: '0 2px 8px rgba(117,48,251,0.08)' }}>
                        <EditorToolbar
                            activeFormats={activeFormats}
                            onExec={execCmd}
                            descPreview={descPreview}
                            onPreview={setDescPreview}
                            uploadedPhotos={uploadedPhotos}
                            supabaseUpload={supabaseUpload}
                            onLibrary={() => setDescTab('library')}
                            onAiWrite={onAiWrite}
                            aiLoading={aiLoading}
                        />
                    </div>
                )}

                {/* Editor area */}
                <div className="flex flex-col xl:flex-1" style={{ display: descPreview === 'edit' ? 'flex' : 'none' }}>

                    {/* Rich text editor */}
                    <div className="xl:flex-1" style={{ display: descMode === 'rich' ? 'flex' : 'none', flexDirection: 'column' }}>
                        <div
                            ref={descRef}
                            contentEditable
                            suppressContentEditableWarning
                            spellCheck
                            onInput={onInput}
                            className="p-4 outline-none scrollbar-hide xl:flex-1"
                            style={{
                                minHeight: 'calc(100svh - 320px)',
                                fontSize: 13,
                                color: C.body,
                                fontFamily: 'DM Sans, sans-serif',
                                lineHeight: 1.6,
                                wordBreak: 'break-word',
                                pointerEvents: isTyping ? 'none' : 'auto',
                                userSelect: isTyping ? 'none' : 'auto',
                            }}
                            data-placeholder={placeholder}
                        />
                    </div>

                    {/* HTML editor — redesigned split view matching Riazify design */}
                    {descMode === 'html' && (() => {
                        const ebayWarnings: string[] = []
                        if (/<script/i.test(htmlContent)) ebayWarnings.push('<script>')
                        if (/<form/i.test(htmlContent)) ebayWarnings.push('<form>')
                        if (/<iframe/i.test(htmlContent)) ebayWarnings.push('<iframe>')
                        if (/on\w+=/i.test(htmlContent)) ebayWarnings.push('onclick/onload')
                        if (/javascript:/i.test(htmlContent)) ebayWarnings.push('javascript:')
                        if (/<input/i.test(htmlContent)) ebayWarnings.push('<input>')
                        if (/http:\/\//i.test(htmlContent)) ebayWarnings.push('HTTP images')
                        const isCompliant = ebayWarnings.length === 0

                        return (
                            <div className="flex flex-1 min-h-0">

                                {/* ── LEFT: Code editor panel ───────────────── */}
                                <div className="flex flex-col shrink-0" style={{ width: '50%', borderRight: '1px solid #2d2d2d' }}>

                                    {/* Panel header — fresh light */}
                                    <div className="flex items-center justify-between px-4 py-2.5 shrink-0"
                                        style={{ backgroundColor: C.primaryLight, borderBottom: `1px solid ${C.border}` }}>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                                                style={{ backgroundColor: C.primary, color: '#fff', fontFamily: 'monospace', letterSpacing: 1 }}>
                                                HTML
                                            </span>
                                            <span className="text-[11px] font-semibold"
                                                style={{ color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>
                                                HTML &amp; CSS Source Code
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const pretty = htmlContent
                                                    .replace(/<\/([a-z][a-z0-9]*)[^>]*>/gi, '</$1>\n')
                                                    .replace(/(<(?:br|hr|img|input)[^>]*\/?>)/gi, '$1\n')
                                                    .replace(/(<(?!\/|br|strong|em|a|span|b|i|u)[a-z][a-z0-9]*[^>]*>)/gi, '\n$1')
                                                    .split('\n').map((l: string) => l.trimEnd())
                                                    .filter((l: string, i: number, arr: string[]) => !(l === '' && arr[i - 1] === ''))
                                                    .join('\n').trim()
                                                setHtmlContent(pretty)
                                                onChange(sanitiseHtml(pretty))
                                                if (descRef.current) descRef.current.innerHTML = sanitiseHtml(pretty)
                                            }}
                                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold hover:opacity-80 transition-all"
                                            style={{ backgroundColor: C.primary, color: '#fff', fontFamily: 'DM Sans, sans-serif', border: 'none' }}>
                                            <span style={{ fontSize: 9 }}>☰</span> Format Code
                                        </button>
                                    </div>

                                    {/* Code editor — line numbers + highlighted textarea */}
                                    <div className="flex flex-1 overflow-hidden" style={{ backgroundColor: '#1e1e1e' }}>

                                        {/* Line numbers */}
                                        <div
                                            ref={lineNumbersRef}
                                            className="select-none shrink-0"
                                            style={{
                                                width: 44,
                                                backgroundColor: '#1e1e1e',
                                                borderRight: '1px solid #333',
                                                fontFamily: '"Fira Code","Cascadia Code","Courier New",monospace',
                                                fontSize: 12,
                                                color: '#858585',
                                                textAlign: 'right',
                                                paddingRight: 10,
                                                paddingTop: 14,
                                                paddingBottom: 14,
                                                overflowY: 'auto',
                                                overflowX: 'hidden',
                                                scrollbarWidth: 'none' as const,
                                                lineHeight: '21.6px',
                                            }}>
                                            {(htmlContent || '\n').split('\n').map((_: string, i: number) => (
                                                <div key={i} style={{ height: '21.6px' }}>{i + 1}</div>
                                            ))}
                                        </div>

                                        {/* Editor area — textarea only, pre overlay removed (scroll sync issue) */}
                                        {/* We use a single textarea with CSS gradient-based syntax colors */}
                                        <div className="flex-1 relative" style={{ overflow: 'hidden' }}>
                                            {/* Syntax highlighted layer — scrolls in sync with textarea */}
                                            <pre
                                                ref={highlightRef}
                                                aria-hidden="true"
                                                style={{
                                                    position: 'absolute',
                                                    top: 0, left: 0,
                                                    margin: 0,
                                                    padding: '14px 16px',
                                                    fontSize: 12,
                                                    lineHeight: '21.6px',
                                                    fontFamily: '"Fira Code","Cascadia Code","Courier New",monospace',
                                                    whiteSpace: 'pre',
                                                    overflowWrap: 'normal',
                                                    pointerEvents: 'none',
                                                    minWidth: '100%',
                                                    minHeight: '100%',
                                                    zIndex: 1,
                                                }}
                                                dangerouslySetInnerHTML={{ __html: syntaxHighlight(htmlContent) }}
                                            />
                                            {/* Transparent textarea on top — drives scroll */}
                                            <textarea
                                                ref={codeTextareaRef}
                                                value={htmlContent}
                                                onChange={e => {
                                                    const val = e.target.value
                                                    setHtmlContent(val)
                                                    onChange(sanitiseHtml(val))
                                                    if (descRef.current) descRef.current.innerHTML = sanitiseHtml(val)
                                                    scheduleAutosave(val)
                                                }}
                                                onScroll={e => {
                                                    const ta = e.target as HTMLTextAreaElement
                                                    if (lineNumbersRef.current)
                                                        lineNumbersRef.current.scrollTop = ta.scrollTop
                                                    if (highlightRef.current) {
                                                        highlightRef.current.style.top = `-${ta.scrollTop}px`
                                                        highlightRef.current.style.left = `-${ta.scrollLeft}px`
                                                    }
                                                }}
                                                onKeyDown={e => {
                                                    if (e.key === 'Tab') {
                                                        e.preventDefault()
                                                        const ta = e.target as HTMLTextAreaElement
                                                        const s = ta.selectionStart
                                                        const newVal = htmlContent.substring(0, s) + '  ' + htmlContent.substring(ta.selectionEnd)
                                                        setHtmlContent(newVal)
                                                        setTimeout(() => { ta.selectionStart = ta.selectionEnd = s + 2 }, 0)
                                                    }
                                                }}
                                                spellCheck={false}
                                                className="outline-none"
                                                style={{
                                                    position: 'absolute',
                                                    top: 0, left: 0, right: 0, bottom: 0,
                                                    width: '100%',
                                                    height: '100%',
                                                    padding: '14px 16px',
                                                    fontSize: 12,
                                                    color: 'transparent',
                                                    caretColor: '#fff',
                                                    backgroundColor: 'transparent',
                                                    border: 'none',
                                                    resize: 'none',
                                                    lineHeight: '21.6px',
                                                    fontFamily: '"Fira Code","Cascadia Code","Courier New",monospace',
                                                    whiteSpace: 'pre',
                                                    overflow: 'auto',
                                                    overflowWrap: 'normal',
                                                    zIndex: 2,
                                                    scrollbarWidth: 'thin' as const,
                                                    scrollbarColor: '#444 #1e1e1e',
                                                }}
                                                placeholder="<!-- Start writing HTML here... -->"
                                            />
                                        </div>
                                    </div>

                                    {/* Bottom status bar */}
                                    <div className="flex items-center gap-2 px-4 py-2 shrink-0"
                                        style={{ backgroundColor: isCompliant ? '#0f2a1a' : '#2a0f0f', borderTop: `1px solid ${isCompliant ? 'rgba(22,163,74,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                                        <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0"
                                            style={{ backgroundColor: isCompliant ? C.success : C.danger }}>
                                            <span style={{ fontSize: 8, color: '#fff' }}>{isCompliant ? '✓' : '✗'}</span>
                                        </div>
                                        {isCompliant ? (
                                            <span className="text-[10px] font-semibold"
                                                style={{ color: C.success, fontFamily: 'DM Sans, sans-serif' }}>
                                                Active Content Free • 100% eBay Policy Compliant Code
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-semibold"
                                                style={{ color: C.danger, fontFamily: 'DM Sans, sans-serif' }}>
                                                eBay blocked: {ebayWarnings.join(', ')}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* ── RIGHT: Preview panel ──────────────────── */}
                                <div className="flex flex-col flex-1 overflow-hidden">

                                    {/* Preview toolbar — only in Design tool */}
                                    {showPreviewControls && (
                                        <div className="flex items-center justify-between px-3 py-2 shrink-0"
                                            style={{ backgroundColor: C.bg, borderBottom: `1px solid ${C.border}` }}>
                                            {/* Device switcher with Lucide icons */}
                                            <div className="flex items-center gap-1">
                                                {[
                                                    { id: 'desktop' as const, Icon: Monitor, label: 'Desktop' },
                                                    { id: 'tablet' as const, Icon: Tablet, label: 'Tablet' },
                                                    { id: 'mobile' as const, Icon: Smartphone, label: 'Mobile' },
                                                ].map(d => (
                                                    <button key={d.id}
                                                        onClick={() => setPreviewDevice(d.id)}
                                                        title={d.label}
                                                        className="w-7 h-7 flex items-center justify-center rounded-lg transition-all hover:opacity-80"
                                                        style={{
                                                            backgroundColor: previewDevice === d.id ? C.primary : 'transparent',
                                                            border: `1px solid ${previewDevice === d.id ? C.primary : C.border}`,
                                                        }}>
                                                        <d.Icon size={13} style={{ color: previewDevice === d.id ? '#fff' : C.muted }} />
                                                    </button>
                                                ))}
                                            </div>
                                            {/* Refresh */}
                                            <button
                                                onClick={() => setPreviewKey(k => k + 1)}
                                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold hover:opacity-80 transition-all"
                                                style={{ backgroundColor: C.primaryLight, color: C.primary, border: `1px solid ${C.border}`, fontFamily: 'DM Sans, sans-serif' }}>
                                                <RefreshCw size={10} /> Refresh Preview
                                            </button>
                                        </div>
                                    )}

                                    {/* Browser chrome — mac dots only when showPreviewControls */}
                                    <div className="flex flex-col flex-1 overflow-hidden" style={{ backgroundColor: '#f0f0f0' }}>

                                        {showPreviewControls && (
                                            <div className="flex items-center gap-2 px-4 py-2 shrink-0"
                                                style={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #e5e5e5' }}>
                                                {['#ef4444', '#f59e0b', '#22c55e'].map(c => (
                                                    <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
                                                ))}
                                            </div>
                                        )}

                                        {/* Preview area */}
                                        <div className="flex-1 overflow-auto flex justify-center py-4"
                                            style={{ backgroundColor: '#e8e8e8' }}>
                                            <div key={previewKey} style={{
                                                width: previewDevice === 'mobile' ? 375 : previewDevice === 'tablet' ? 768 : '100%',
                                                maxWidth: previewDevice === 'desktop' ? 860 : undefined,
                                                backgroundColor: '#fff',
                                                borderRadius: 8,
                                                boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
                                                overflow: 'hidden',
                                                minHeight: 400,
                                            }}>
                                                <div className="p-5"
                                                    style={{ fontSize: previewDevice === 'mobile' ? 13 : 14, color: C.body, fontFamily: 'DM Sans, sans-serif', lineHeight: 1.7 }}
                                                    dangerouslySetInnerHTML={{
                                                        __html: htmlContent ||
                                                            '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;gap:12px"><div style="font-size:32px">✦</div><p style="color:#9ca3af;font-size:13px;text-align:center;font-family:DM Sans,sans-serif">Live preview appears here as you type HTML on the left</p></div>'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })()}
                </div>

                {/* Mobile / Desktop preview */}
                {(descPreview === 'mobile' || descPreview === 'desktop') && (
                    <div className="flex justify-center p-6 overflow-auto"
                        style={{ minHeight: 420, backgroundColor: '#f0f0f0' }}>
                        <div style={{
                            width: descPreview === 'mobile' ? 375 : '100%',
                            maxWidth: descPreview === 'desktop' ? 860 : undefined,
                            backgroundColor: '#fff',
                            borderRadius: descPreview === 'mobile' ? 24 : 12,
                            boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                            overflow: 'hidden',
                        }}>
                            <div className="flex items-center gap-1.5 px-4 py-2.5"
                                style={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #e5e5e5' }}>
                                {descPreview === 'desktop' && (
                                    <div className="contents">
                                        {['#ef4444', '#f59e0b', '#22c55e'].map(c => (
                                            <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
                                        ))}
                                        <div className="flex-1 mx-3 py-1 px-3 rounded-md text-[11px]"
                                            style={{ backgroundColor: '#fff', border: '1px solid #e5e5e5', color: '#9ca3af', fontFamily: 'DM Sans, sans-serif' }}>
                                            ebay.com/itm/listing
                                        </div>
                                    </div>
                                )}
                                {descPreview === 'mobile' && (
                                    <div className="w-full text-center text-[11px]"
                                        style={{ color: '#9ca3af', fontFamily: 'DM Sans, sans-serif' }}>
                                        ebay.com
                                    </div>
                                )}
                            </div>
                            <div className="p-5 overflow-auto"
                                style={{
                                    fontSize: descPreview === 'mobile' ? 14 : 15,
                                    color: C.body, fontFamily: 'DM Sans, sans-serif', lineHeight: 1.7,
                                    maxHeight: 600,
                                }}
                                dangerouslySetInnerHTML={{ __html: htmlContent || '<p style="color:#9ca3af;text-align:center;padding:40px 0">No description yet</p>' }}
                            />
                        </div>
                    </div>
                )}

                {/* Bottom bar */}
                <div className="flex items-center justify-between px-3 py-2"
                    style={{ borderTop: `2px solid ${C.primary}`, backgroundColor: C.primaryLight }}>
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Rich/HTML toggle */}
                        <div className="flex items-center rounded-lg overflow-hidden"
                            style={{ border: `1px solid ${C.border}` }}>
                            {(['rich', 'html'] as const).map(mode => (
                                <button key={mode} onClick={() => {
                                    setDescMode(mode)
                                    setDescPreview('edit')
                                }}
                                    className="px-2.5 py-1 text-[11px] font-semibold transition-all"
                                    style={{
                                        backgroundColor: descMode === mode ? C.primary : 'transparent',
                                        color: descMode === mode ? '#fff' : C.muted,
                                        fontFamily: 'DM Sans, sans-serif',
                                    }}>
                                    {mode === 'rich' ? 'Rich Text' : 'HTML'}
                                </button>
                            ))}
                        </div>
                        {/* Copy */}
                        <button onClick={copyContent}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold hover:opacity-80"
                            style={{ color: copied ? C.success : C.muted, border: `1px solid ${C.border}`, fontFamily: 'DM Sans, sans-serif' }}>
                            <Copy size={10} />
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                        {/* Clear */}
                        {htmlContent && (
                            <button onClick={clearContent}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold hover:opacity-80"
                                style={{ backgroundColor: C.dangerBg, color: C.danger, border: `1px solid #fca5a5`, fontFamily: 'DM Sans, sans-serif' }}>
                                <Trash2 size={10} /> Clear
                            </button>
                        )}
                        <div className="w-px h-3" style={{ backgroundColor: C.border }} />
                        <span className="text-[11px]" style={{
                            color: charCount > CHAR_LIMIT ? C.danger : charCount > CHAR_LIMIT * 0.9 ? C.warning : C.muted,
                            fontFamily: 'DM Sans, sans-serif',
                            fontWeight: charCount > CHAR_LIMIT * 0.9 ? 700 : 400,
                        }}>
                            {wordCount}w · {charCount.toLocaleString()} / 500k
                            {charCount > CHAR_LIMIT && ' ⚠ Limit reached!'}
                            {charCount > CHAR_LIMIT * 0.9 && charCount <= CHAR_LIMIT && ' ⚠ Near limit'}
                        </span>
                        {showAutoSaved && (
                            <span className="text-[10px] font-semibold"
                                style={{ color: C.success, fontFamily: 'DM Sans, sans-serif' }}>
                                ✓ Saved
                            </span>
                        )}
                        {isTyping && (
                            <span className="flex items-center gap-1 text-[11px] font-medium"
                                style={{ color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>
                                <span style={{
                                    display: 'inline-block',
                                    width: 2, height: 13,
                                    backgroundColor: C.primary,
                                    borderRadius: 1,
                                    animation: 'sp-blink 0.7s step-end infinite',
                                }} />
                                AI writing...
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
