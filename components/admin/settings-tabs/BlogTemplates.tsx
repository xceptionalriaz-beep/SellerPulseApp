'use client'
// components/admin/settings-tabs/BlogTemplates.tsx
// 10 professional blog post templates for the Riazify blog editor

import { useState } from 'react'
import {
  BookOpen, List, Star, BarChart2, Layers,
  TrendingUp, Megaphone, HelpCircle, Zap, Calendar,
  X, Check, ChevronRight, Shield, Calculator, Search,
  Mail, Users, MessageSquare, BookMarked, Package,
  FileText, Globe, RefreshCw, Award, Bell,
} from 'lucide-react'

const C = {
  lime:     '#8fff00', limeDeep: '#4a8f00', limeTint: '#f4ffe6',
  dark:     '#1a2410', text:     '#1a2410', muted:    '#8a9e78',
  border:   '#e8ede2', surface:  '#ffffff', bg:       '#f7f9f5',
  red:      '#b91c1c', amber:    '#d97706', green:    '#16a34a',
  blue:     '#1d4ed8',
}

// ── Reusable image blocks ─────────────────────────────────────────────────

const IMG = {
  // Featured hero image at top of post
  hero: (alt = 'Featured image') =>
    `<div style="width:100%;height:320px;background:linear-gradient(135deg,#1a2410 0%,#2d4020 100%);border-radius:16px;display:flex;align-items:center;justify-content:center;margin:16px 0;position:relative;overflow:hidden">
      <div style="text-align:center">
        <div style="width:64px;height:64px;background:rgba(143,255,0,0.15);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 12px">
          <svg width="28" height="28" fill="none" stroke="#8fff00" stroke-width="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
        </div>
        <p style="color:#8fff00;font-size:13px;font-weight:700;margin:0">Featured Image</p>
        <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:4px 0 0">${alt} — replace with your image</p>
      </div>
    </div>`,

  // Inline content image with caption
  inline: (caption = 'Image caption') =>
    `<figure style="margin:20px 0">
      <div style="width:100%;height:220px;background:#f7f9f5;border:2px dashed #e8ede2;border-radius:12px;display:flex;align-items:center;justify-content:center">
        <div style="text-align:center">
          <svg width="24" height="24" fill="none" stroke="#8a9e78" stroke-width="1.5" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
          <p style="color:#8a9e78;font-size:12px;margin:6px 0 0">Upload or paste image URL</p>
        </div>
      </div>
      <figcaption style="text-align:center;font-size:12px;color:#8a9e78;margin-top:8px;font-style:italic">${caption}</figcaption>
    </figure>`,

  // Side-by-side two images
  double: (cap1 = 'Before', cap2 = 'After') =>
    `<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:20px 0">
      <figure style="margin:0">
        <div style="height:180px;background:#f7f9f5;border:2px dashed #e8ede2;border-radius:12px;display:flex;align-items:center;justify-content:center">
          <p style="color:#8a9e78;font-size:12px;text-align:center">Image 1<br/><span style="font-size:10px">Upload or paste URL</span></p>
        </div>
        <figcaption style="text-align:center;font-size:12px;color:#8a9e78;margin-top:6px;font-style:italic">${cap1}</figcaption>
      </figure>
      <figure style="margin:0">
        <div style="height:180px;background:#f7f9f5;border:2px dashed #e8ede2;border-radius:12px;display:flex;align-items:center;justify-content:center">
          <p style="color:#8a9e78;font-size:12px;text-align:center">Image 2<br/><span style="font-size:10px">Upload or paste URL</span></p>
        </div>
        <figcaption style="text-align:center;font-size:12px;color:#8a9e78;margin-top:6px;font-style:italic">${cap2}</figcaption>
      </figure>
    </div>`,

  // Screenshot with browser chrome
  screenshot: (label = 'Screenshot') =>
    `<div style="margin:20px 0;border:1px solid #e8ede2;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08)">
      <div style="background:#f7f9f5;padding:8px 14px;display:flex;align-items:center;gap:6px;border-bottom:1px solid #e8ede2">
        <div style="width:10px;height:10px;border-radius:50%;background:#b91c1c"></div>
        <div style="width:10px;height:10px;border-radius:50%;background:#d97706"></div>
        <div style="width:10px;height:10px;border-radius:50%;background:#16a34a"></div>
        <div style="flex:1;background:#fff;border:1px solid #e8ede2;border-radius:6px;padding:3px 10px;margin:0 8px">
          <span style="font-size:11px;color:#8a9e78">riazify.com/dashboard</span>
        </div>
      </div>
      <div style="height:200px;background:#f7f9f5;display:flex;align-items:center;justify-content:center">
        <p style="color:#8a9e78;font-size:12px;text-align:center">${label}<br/><span style="font-size:10px">Paste screenshot URL or upload</span></p>
      </div>
    </div>`,
}

// ── Template Definitions ───────────────────────────────────────────────────

export interface BlogTemplate {
  id:          string
  name:        string
  description: string
  icon:        React.ElementType
  color:       string
  category:    string
  wordEstimate: string
  previewLines: string[]
  html:        string
  defaultTitle: string
  defaultMeta:  string
}

export const BLOG_TEMPLATES: BlogTemplate[] = [

  // ── 1. ULTIMATE GUIDE ────────────────────────────────────────────────────
  {
    id:          'ultimate-guide',
    name:        'Ultimate Guide',
    description: 'Premium long-form pillar content with stats dashboard, styled ToC, step cards, mistake cards, tool cards, 7-question FAQ, author bio, and 3 CTAs.',
    icon:        BookOpen,
    color:       C.limeDeep,
    category:    'Long-Form',
    wordEstimate: '2,500–4,000 words',
    previewLines: ['Hero + reading time bar', 'Who this is for box', 'Stats dashboard', 'Clickable styled ToC', 'Numbered step cards', 'Styled mistake cards', 'Tool cards with badges', '7-question FAQ', 'Author bio + CTA x3'],
    defaultTitle: 'The Ultimate Guide to [Topic]: Complete [Year] Playbook for eBay Sellers',
    defaultMeta:  'The complete [year] guide to [topic] for eBay sellers. Step-by-step strategies, expert tips, and proven frameworks to [achieve outcome]. Updated [month year].',
    html: `${IMG.hero('Ultimate Guide — The Complete [Topic] Resource for eBay Sellers')}

<div style="display:flex;align-items:center;gap:16px;padding:12px 16px;background:#f7f9f5;border-radius:10px;margin:16px 0;flex-wrap:wrap">
  <span style="font-size:12px;color:#8a9e78;display:flex;align-items:center;gap:5px">⏱ <strong>[X] min read</strong></span>
  <span style="color:#e8ede2">|</span>
  <span style="font-size:12px;color:#8a9e78">📅 Last updated: <strong>[Month Year]</strong></span>
  <span style="color:#e8ede2">|</span>
  <span style="font-size:12px;color:#8a9e78">✍️ By <strong>[Author Name]</strong></span>
  <span style="color:#e8ede2">|</span>
  <span style="font-size:12px;color:#8a9e78">📖 <strong>[X,XXX]</strong> words</span>
</div>

<h1>The Ultimate Guide to [Topic]: Complete [Year] Playbook for eBay Sellers</h1>

<p style="font-size:17px;line-height:1.8;color:#3a4a32;margin:0 0 20px">If you want to <strong>[achieve specific goal]</strong> as an eBay seller, this is the only guide you need. We cover everything — fundamentals to advanced tactics — with real examples, exact numbers, and zero fluff.</p>

<div style="background:#f4ffe6;border:1px solid rgba(74,143,0,0.3);border-radius:14px;padding:18px 22px;margin:20px 0">
  <p style="font-size:12px;font-weight:900;letter-spacing:0.08em;color:#4a8f00;margin:0 0 10px">WHO THIS GUIDE IS FOR</p>
  <div style="display:flex;flex-direction:column;gap:6px">
    <div style="display:flex;gap:8px;align-items:center"><span style="color:#4a8f00;font-size:14px">✓</span><span style="font-size:13px;color:#1a2410">[Seller type 1 — e.g. eBay sellers doing under $5k/month who want to scale]</span></div>
    <div style="display:flex;gap:8px;align-items:center"><span style="color:#4a8f00;font-size:14px">✓</span><span style="font-size:13px;color:#1a2410">[Seller type 2 — e.g. New sellers who want to get it right from the start]</span></div>
    <div style="display:flex;gap:8px;align-items:center"><span style="color:#4a8f00;font-size:14px">✓</span><span style="font-size:13px;color:#1a2410">[Seller type 3 — e.g. Experienced sellers who keep hitting the same wall]</span></div>
  </div>
</div>

<div style="background:#1a2410;border-radius:16px;padding:22px 24px;margin:24px 0;display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px">
  <div style="text-align:center;padding:14px 10px;background:rgba(255,255,255,0.05);border-radius:10px">
    <p style="font-size:28px;font-weight:900;color:#8fff00;margin:0;line-height:1">[X]%</p>
    <p style="font-size:11px;color:rgba(255,255,255,0.4);margin:6px 0 0;font-weight:700;text-transform:uppercase;letter-spacing:0.05em">[Stat label 1]</p>
  </div>
  <div style="text-align:center;padding:14px 10px;background:rgba(255,255,255,0.05);border-radius:10px">
    <p style="font-size:28px;font-weight:900;color:#8fff00;margin:0;line-height:1">$[X]</p>
    <p style="font-size:11px;color:rgba(255,255,255,0.4);margin:6px 0 0;font-weight:700;text-transform:uppercase;letter-spacing:0.05em">[Stat label 2]</p>
  </div>
  <div style="text-align:center;padding:14px 10px;background:rgba(255,255,255,0.05);border-radius:10px">
    <p style="font-size:28px;font-weight:900;color:#8fff00;margin:0;line-height:1">[X]x</p>
    <p style="font-size:11px;color:rgba(255,255,255,0.4);margin:6px 0 0;font-weight:700;text-transform:uppercase;letter-spacing:0.05em">[Stat label 3]</p>
  </div>
</div>

[CTA:free]

<div style="background:#f7f9f5;border:1px solid #e8ede2;border-radius:14px;padding:20px 24px;margin:24px 0">
  <p style="font-size:13px;font-weight:900;letter-spacing:0.08em;color:#8a9e78;margin:0 0 14px">TABLE OF CONTENTS</p>
  <div style="display:flex;flex-direction:column;gap:2px">
    <a href="#what-is" style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:8px;text-decoration:none;color:#1a2410;font-size:14px;font-weight:600;transition:background 0.15s" onmouseover="this.style.background='#f4ffe6'" onmouseout="this.style.background='transparent'"><span style="width:22px;height:22px;background:#1a2410;border-radius:50%;color:#8fff00;font-size:10px;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0">1</span> What is [Topic]?</a>
    <a href="#why-matters" style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:8px;text-decoration:none;color:#1a2410;font-size:14px;font-weight:600" onmouseover="this.style.background='#f4ffe6'" onmouseout="this.style.background='transparent'"><span style="width:22px;height:22px;background:#1a2410;border-radius:50%;color:#8fff00;font-size:10px;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0">2</span> Why [Topic] Matters for eBay Sellers</a>
    <a href="#getting-started" style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:8px;text-decoration:none;color:#1a2410;font-size:14px;font-weight:600" onmouseover="this.style.background='#f4ffe6'" onmouseout="this.style.background='transparent'"><span style="width:22px;height:22px;background:#1a2410;border-radius:50%;color:#8fff00;font-size:10px;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0">3</span> Step-by-Step: Getting Started</a>
    <a href="#advanced" style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:8px;text-decoration:none;color:#1a2410;font-size:14px;font-weight:600" onmouseover="this.style.background='#f4ffe6'" onmouseout="this.style.background='transparent'"><span style="width:22px;height:22px;background:#1a2410;border-radius:50%;color:#8fff00;font-size:10px;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0">4</span> Advanced Strategies</a>
    <a href="#mistakes" style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:8px;text-decoration:none;color:#1a2410;font-size:14px;font-weight:600" onmouseover="this.style.background='#f4ffe6'" onmouseout="this.style.background='transparent'"><span style="width:22px;height:22px;background:#1a2410;border-radius:50%;color:#8fff00;font-size:10px;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0">5</span> Common Mistakes to Avoid</a>
    <a href="#tools" style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:8px;text-decoration:none;color:#1a2410;font-size:14px;font-weight:600" onmouseover="this.style.background='#f4ffe6'" onmouseout="this.style.background='transparent'"><span style="width:22px;height:22px;background:#1a2410;border-radius:50%;color:#8fff00;font-size:10px;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0">6</span> Tools and Resources</a>
    <a href="#faq" style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:8px;text-decoration:none;color:#1a2410;font-size:14px;font-weight:600" onmouseover="this.style.background='#f4ffe6'" onmouseout="this.style.background='transparent'"><span style="width:22px;height:22px;background:#1a2410;border-radius:50%;color:#8fff00;font-size:10px;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0">7</span> Frequently Asked Questions</a>
  </div>
</div>

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<h2 id="what-is">1. What is [Topic]?</h2>

<p>[Topic] is <strong>[clear one-sentence definition]</strong>. For eBay sellers, this means [practical explanation that connects directly to their daily selling activity].</p>

<p>Think of it this way: [memorable analogy]. When you understand [topic] at this level, [specific benefit that follows].</p>

${IMG.inline('[Topic] explained — add a diagram or infographic showing the concept visually')}

:::info
Key Insight: [The one sentence that captures the most important truth about this topic. This is what separates sellers who get results from those who don't.]
:::

<p>Here's what makes [topic] different from [common alternative]: <strong>[specific differentiator with a real example]</strong>.</p>

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<h2 id="why-matters">2. Why [Topic] Matters for eBay Sellers</h2>

<p>Most eBay sellers overlook [topic] — and it's costing them money every single month. Here's what the data shows:</p>

<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin:20px 0">
  <div style="text-align:center;padding:18px 12px;background:#f7f9f5;border:1px solid #e8ede2;border-radius:12px">
    <p style="font-size:26px;font-weight:900;color:#16a34a;margin:0;line-height:1">[X]%</p>
    <p style="font-size:11px;color:#8a9e78;margin:7px 0 0;font-weight:700;text-transform:uppercase;letter-spacing:0.04em">[Benefit metric]</p>
  </div>
  <div style="text-align:center;padding:18px 12px;background:#f7f9f5;border:1px solid #e8ede2;border-radius:12px">
    <p style="font-size:26px;font-weight:900;color:#1d4ed8;margin:0;line-height:1">[X]hrs</p>
    <p style="font-size:11px;color:#8a9e78;margin:7px 0 0;font-weight:700;text-transform:uppercase;letter-spacing:0.04em">[Time saved metric]</p>
  </div>
  <div style="text-align:center;padding:18px 12px;background:#f7f9f5;border:1px solid #e8ede2;border-radius:12px">
    <p style="font-size:26px;font-weight:900;color:#d97706;margin:0;line-height:1">[X]x</p>
    <p style="font-size:11px;color:#8a9e78;margin:7px 0 0;font-weight:700;text-transform:uppercase;letter-spacing:0.04em">[ROI metric]</p>
  </div>
</div>

<p>Sellers who master [topic] consistently outperform those who don't because [specific mechanism — why does this actually work at a root level?]. The compound effect over [timeframe] is significant: [specific measurable result].</p>

<ul style="line-height:2.2">
  <li><strong>[Benefit 1]:</strong> [Specific explanation with real numbers or example]</li>
  <li><strong>[Benefit 2]:</strong> [Explanation]</li>
  <li><strong>[Benefit 3]:</strong> [Explanation]</li>
</ul>

:::warning
The Real Cost of Ignoring This: Sellers who overlook [topic] typically [specific negative outcome with a number]. That's not theoretical — that's [dollar amount or time] lost every single month.
:::

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<h2 id="getting-started">3. Step-by-Step: Getting Started with [Topic]</h2>

<p>Here is the exact process, in order. Do not skip steps — each one builds on the last.</p>

${IMG.screenshot('Step-by-step walkthrough — add a screenshot of the relevant eBay or Riazify interface here')}

<div style="display:flex;flex-direction:column;gap:14px;margin:24px 0">

  <div style="display:flex;gap:14px;align-items:flex-start;padding:18px;background:#f7f9f5;border:1px solid #e8ede2;border-radius:14px">
    <div style="width:36px;height:36px;border-radius:50%;background:#8fff00;color:#1a2410;font-weight:900;font-size:15px;display:flex;align-items:center;justify-content:center;flex-shrink:0">1</div>
    <div style="flex:1">
      <p style="font-size:15px;font-weight:800;color:#1a2410;margin:0 0 6px">Set Up Your Foundation</p>
      <p style="font-size:13px;line-height:1.7;color:#3a4a32;margin:0">[Action]. This is the foundation everything else builds on. Without it, the rest of the steps won't produce the results you're after.</p>
      <div style="background:#f4ffe6;border-left:3px solid #8fff00;padding:8px 12px;border-radius:0 8px 8px 0;margin-top:10px"><p style="font-size:12px;color:#4a8f00;margin:0"><strong>Expected result:</strong> [What the seller should see or experience after completing this step.]</p></div>
    </div>
  </div>

  <div style="display:flex;gap:14px;align-items:flex-start;padding:18px;background:#f7f9f5;border:1px solid #e8ede2;border-radius:14px">
    <div style="width:36px;height:36px;border-radius:50%;background:#8fff00;color:#1a2410;font-weight:900;font-size:15px;display:flex;align-items:center;justify-content:center;flex-shrink:0">2</div>
    <div style="flex:1">
      <p style="font-size:15px;font-weight:800;color:#1a2410;margin:0 0 6px">[Action Step 2]</p>
      <p style="font-size:13px;line-height:1.7;color:#3a4a32;margin:0">[Detailed explanation. Give exact numbers, timeframes, or menu names where possible. Write as if guiding someone over their shoulder.]</p>
    </div>
  </div>

  <div style="display:flex;gap:14px;align-items:flex-start;padding:18px;background:#f7f9f5;border:1px solid #e8ede2;border-radius:14px">
    <div style="width:36px;height:36px;border-radius:50%;background:#8fff00;color:#1a2410;font-weight:900;font-size:15px;display:flex;align-items:center;justify-content:center;flex-shrink:0">3</div>
    <div style="flex:1">
      <p style="font-size:15px;font-weight:800;color:#1a2410;margin:0 0 6px">[Action Step 3]</p>
      <p style="font-size:13px;line-height:1.7;color:#3a4a32;margin:0">[Explanation.]</p>
      :::info
      Pro Tip: [A shortcut or insider insight that makes this step faster or more effective. This is what separates beginners from pros.]
      :::
    </div>
  </div>

  <div style="display:flex;gap:14px;align-items:flex-start;padding:18px;background:#fffbeb;border:1px solid #fde68a;border-radius:14px">
    <div style="width:36px;height:36px;border-radius:50%;background:#d97706;color:#fff;font-weight:900;font-size:15px;display:flex;align-items:center;justify-content:center;flex-shrink:0">!</div>
    <div style="flex:1">
      <p style="font-size:15px;font-weight:800;color:#1a2410;margin:0 0 6px">Watch Out Here</p>
      <p style="font-size:13px;line-height:1.7;color:#3a4a32;margin:0">[Common mistake at this stage]. Most sellers [do wrong thing] because [wrong assumption]. The fix is simple: [correct action].</p>
    </div>
  </div>

  <div style="display:flex;gap:14px;align-items:flex-start;padding:18px;background:#f7f9f5;border:1px solid #e8ede2;border-radius:14px">
    <div style="width:36px;height:36px;border-radius:50%;background:#8fff00;color:#1a2410;font-weight:900;font-size:15px;display:flex;align-items:center;justify-content:center;flex-shrink:0">4</div>
    <div style="flex:1">
      <p style="font-size:15px;font-weight:800;color:#1a2410;margin:0 0 6px">[Action Step 4]</p>
      <p style="font-size:13px;line-height:1.7;color:#3a4a32;margin:0">[Explanation.]</p>
    </div>
  </div>

  <div style="display:flex;gap:14px;align-items:flex-start;padding:18px;background:#f4ffe6;border:1px solid rgba(143,255,0,0.3);border-radius:14px">
    <div style="width:36px;height:36px;border-radius:50%;background:#1a2410;color:#8fff00;font-weight:900;font-size:15px;display:flex;align-items:center;justify-content:center;flex-shrink:0">5</div>
    <div style="flex:1">
      <p style="font-size:15px;font-weight:800;color:#1a2410;margin:0 0 6px">Optimize and Scale</p>
      <p style="font-size:13px;line-height:1.7;color:#3a4a32;margin:0">Once steps 1–4 are in place, focus on scaling. The key metrics to track are <strong>[metric 1]</strong>, <strong>[metric 2]</strong>, and <strong>[metric 3]</strong>. When [metric 1] reaches [threshold], it's time to [next action].</p>
    </div>
  </div>

</div>

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<h2 id="advanced">4. Advanced Strategies</h2>

<p>If you've completed the getting-started steps, these tactics will multiply your results. Don't attempt these before the basics are solid.</p>

<h3>Strategy 1: [Name]</h3>
<p>[Explanation. This must be genuinely advanced — tactical knowledge that only experienced sellers would know. Include a specific example with real numbers.]</p>

${IMG.inline('[Strategy 1] in action — add a result screenshot or example image')}

<h3>Strategy 2: [Name]</h3>
<p>[Explanation.]</p>

<h3>Strategy 3: [Name — save the most powerful for last]</h3>
<p>[Explanation. This should be the most impactful tactic in the section.]</p>

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<h2 id="mistakes">5. Common Mistakes to Avoid</h2>

<p>These are the four mistakes we see most often — each one is expensive and entirely avoidable.</p>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:20px 0">
  <div style="background:#FEF2F2;border:1px solid #fecaca;border-radius:12px;padding:16px">
    <p style="font-size:11px;font-weight:900;color:#b91c1c;margin:0 0 6px;letter-spacing:0.06em">MISTAKE 1</p>
    <p style="font-size:14px;font-weight:800;color:#1a2410;margin:0 0 6px">[Mistake Name]</p>
    <p style="font-size:13px;color:#8a9e78;margin:0;line-height:1.6">[What it is, why sellers make it, and exactly how to avoid it.]</p>
  </div>
  <div style="background:#FEF2F2;border:1px solid #fecaca;border-radius:12px;padding:16px">
    <p style="font-size:11px;font-weight:900;color:#b91c1c;margin:0 0 6px;letter-spacing:0.06em">MISTAKE 2</p>
    <p style="font-size:14px;font-weight:800;color:#1a2410;margin:0 0 6px">[Mistake Name]</p>
    <p style="font-size:13px;color:#8a9e78;margin:0;line-height:1.6">[Description and fix.]</p>
  </div>
  <div style="background:#FEF2F2;border:1px solid #fecaca;border-radius:12px;padding:16px">
    <p style="font-size:11px;font-weight:900;color:#b91c1c;margin:0 0 6px;letter-spacing:0.06em">MISTAKE 3</p>
    <p style="font-size:14px;font-weight:800;color:#1a2410;margin:0 0 6px">[Mistake Name]</p>
    <p style="font-size:13px;color:#8a9e78;margin:0;line-height:1.6">[Description and fix.]</p>
  </div>
  <div style="background:#FEF2F2;border:1px solid #fecaca;border-radius:12px;padding:16px">
    <p style="font-size:11px;font-weight:900;color:#b91c1c;margin:0 0 6px;letter-spacing:0.06em">MISTAKE 4</p>
    <p style="font-size:14px;font-weight:800;color:#1a2410;margin:0 0 6px">[Mistake Name]</p>
    <p style="font-size:13px;color:#8a9e78;margin:0;line-height:1.6">[Description and fix.]</p>
  </div>
</div>

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<h2 id="tools">6. Tools and Resources</h2>

<p>These are the tools we actually use and recommend. No filler — only what genuinely moves the needle.</p>

<div style="display:flex;flex-direction:column;gap:12px;margin:20px 0">

  <div style="display:flex;gap:14px;align-items:flex-start;padding:16px;background:#f4ffe6;border:1px solid rgba(143,255,0,0.3);border-radius:12px">
    <div style="width:42px;height:42px;background:#1a2410;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="18" height="18" fill="none" stroke="#8fff00" stroke-width="1.5" viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg></div>
    <div>
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
        <p style="font-size:14px;font-weight:800;color:#1a2410;margin:0">Riazify</p>
        <span style="background:#8fff00;color:#1a2410;font-size:10px;padding:2px 8px;border-radius:20px;font-weight:900">EDITOR PICK</span>
      </div>
      <p style="font-size:13px;color:#8a9e78;margin:0;line-height:1.6">The all-in-one eBay seller platform — order protection, profit calculator, AI-powered title builder, product research, and more. <a href="/dashboard" style="color:#4a8f00;font-weight:700">Try free →</a></p>
    </div>
  </div>

  <div style="display:flex;gap:14px;align-items:flex-start;padding:16px;background:#f7f9f5;border:1px solid #e8ede2;border-radius:12px">
    <div style="width:42px;height:42px;background:#f7f9f5;border:1px solid #e8ede2;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="18" height="18" fill="none" stroke="#8a9e78" stroke-width="1.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></div>
    <div>
      <p style="font-size:14px;font-weight:700;color:#1a2410;margin:0 0 4px">[Tool 2 Name]</p>
      <p style="font-size:13px;color:#8a9e78;margin:0;line-height:1.6">[Description and specific use case. Why is this the right tool for this job?]</p>
    </div>
  </div>

  <div style="display:flex;gap:14px;align-items:flex-start;padding:16px;background:#f7f9f5;border:1px solid #e8ede2;border-radius:12px">
    <div style="width:42px;height:42px;background:#f7f9f5;border:1px solid #e8ede2;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="18" height="18" fill="none" stroke="#8a9e78" stroke-width="1.5" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
    <div>
      <p style="font-size:14px;font-weight:700;color:#1a2410;margin:0 0 4px">[Tool 3 Name]</p>
      <p style="font-size:13px;color:#8a9e78;margin:0;line-height:1.6">[Description.]</p>
    </div>
  </div>

</div>

[CTA:starter]

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<h2 id="faq">7. Frequently Asked Questions</h2>

:::faq
Q: What is the single most important thing to know about [topic]?
A: The most important thing is [specific direct answer]. Most sellers overcomplicate this. If you only do one thing from this guide, do [specific action] — it accounts for roughly [X]% of the total results.

Q: How long does it take to see results from [topic]?
A: Most sellers see measurable results within [timeframe]. However, [condition] can speed this up or slow it down. The key variable is [factor] — sellers who [specific action] consistently see results [X] times faster than those who approach it sporadically.

Q: Is [topic] safe for my eBay account?
A: Yes, [topic] is fully within eBay's Terms of Service as long as [condition]. If you're ever unsure, the safest check is [specific action in Seller Hub or policy page].

Q: How much does [topic] cost to implement?
A: The core approach in this guide costs [free / $X]. The optional tools mentioned in Section 6 range from [free] to [$X per month]. Most sellers see a clear ROI within [timeframe] because [reason].

Q: Can I do [topic] if I'm a brand new seller?
A: Yes — in fact, getting this right from the start gives you a major advantage over sellers who have to unlearn bad habits later. The step-by-step section above is specifically structured for beginners. Start at Step 1 and work through sequentially.

Q: What if I've already been doing [topic] the wrong way?
A: Very common, and almost always fixable. Start by [first corrective action]. Most sellers who pivot from the wrong approach see improvement within [timeframe]. The damage from [wrong approach] is typically [reversible / limited to X].

Q: What is the biggest mistake sellers make with [topic]?
A: Without question, it's [biggest mistake]. Sellers do this because [reason], but it leads to [consequence]. The fix is [specific solution] — and it usually takes less than [timeframe] to implement.
:::

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<div style="display:flex;gap:16px;align-items:center;padding:20px;background:#f7f9f5;border-radius:14px;border:1px solid #e8ede2;margin:24px 0">
  <div style="width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,#1a2410,#2d4020);display:flex;align-items:center;justify-content:center;flex-shrink:0">
    <svg width="24" height="24" fill="none" stroke="#8fff00" stroke-width="1.5" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  </div>
  <div>
    <p style="font-size:15px;font-weight:800;color:#1a2410;margin:0 0 3px">[Author Name]</p>
    <p style="font-size:12px;color:#8a9e78;margin:0;line-height:1.6">[Author bio — e.g. eBay seller since 2016 · $[X]M+ in sales · Founder of Riazify · Specialises in [topic]]</p>
  </div>
</div>

[CTA:free]

<p style="font-size:12px;color:#8a9e78;border-top:1px solid #e8ede2;padding-top:14px;margin-top:24px;line-height:1.7"><em>This guide was last updated <strong>[Month Year]</strong> to reflect the latest eBay policies and best practices. We review all guides quarterly. If you spot anything outdated, <a href="/contact" style="color:#8a9e78">let us know</a>.</em></p>`
  },

  // ── 2. STEP-BY-STEP HOW-TO ───────────────────────────────────────────────
  {
    id:          'how-to',
    name:        'Step-by-Step How-To',
    description: 'Premium numbered tutorial with quick-stats bar, requirements checklist, visual step cards, screenshot, troubleshooting accordion, and completion summary.',
    icon:        List,
    color:       C.blue,
    category:    'Tutorial',
    wordEstimate: '1,000–2,000 words',
    previewLines: ['Hero + quick stats bar', 'Requirements checklist card', 'Numbered visual step cards', 'Screenshot in context', 'Pro tip + warning cards', 'Troubleshooting section', 'Completion checklist'],
    defaultTitle: 'How to [Do Something] in [Timeframe]: Step-by-Step Guide for eBay Sellers',
    defaultMeta:  'Learn exactly how to [do something] with this step-by-step guide for eBay sellers. Includes screenshots, pro tips, and troubleshooting. Takes under [X] minutes.',
    html: `${IMG.hero('How to [Do Something] — Step-by-Step Guide for eBay Sellers')}

<div style="display:flex;align-items:center;gap:16px;padding:12px 16px;background:#f7f9f5;border-radius:10px;margin:16px 0;flex-wrap:wrap">
  <span style="font-size:12px;color:#8a9e78;display:flex;align-items:center;gap:5px">⏱ <strong>[X] min read</strong></span>
  <span style="color:#e8ede2">|</span>
  <span style="font-size:12px;color:#8a9e78">🎯 Difficulty: <strong>[Beginner / Intermediate]</strong></span>
  <span style="color:#e8ede2">|</span>
  <span style="font-size:12px;color:#8a9e78">💰 Cost: <strong>[Free / $X]</strong></span>
  <span style="color:#e8ede2">|</span>
  <span style="font-size:12px;color:#8a9e78">📅 Updated: <strong>[Month Year]</strong></span>
</div>

<h1>How to [Do Something] in [Timeframe]: Step-by-Step Guide for eBay Sellers</h1>

<p style="font-size:17px;line-height:1.8;color:#3a4a32;margin:0 0 20px">In this guide you will learn exactly how to <strong>[do something]</strong> — even if you have never done it before. Every step is explained in plain English, with screenshots and no fluff.</p>

<p style="font-size:16px;line-height:1.7;color:#3a4a32;margin:0 0 24px"><strong>What you will achieve:</strong> By the end, you will have [specific outcome]. Most eBay sellers complete this in <strong>[timeframe]</strong>.</p>

<div style="background:#1a2410;border-radius:14px;padding:20px 24px;margin:20px 0;display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px">
  <div style="text-align:center;padding:14px 10px;background:rgba(255,255,255,0.05);border-radius:10px">
    <p style="font-size:26px;font-weight:900;color:#8fff00;margin:0;line-height:1">[X]</p>
    <p style="font-size:11px;color:rgba(255,255,255,0.4);margin:6px 0 0;font-weight:700;text-transform:uppercase;letter-spacing:0.05em">Steps total</p>
  </div>
  <div style="text-align:center;padding:14px 10px;background:rgba(255,255,255,0.05);border-radius:10px">
    <p style="font-size:26px;font-weight:900;color:#8fff00;margin:0;line-height:1">[X] min</p>
    <p style="font-size:11px;color:rgba(255,255,255,0.4);margin:6px 0 0;font-weight:700;text-transform:uppercase;letter-spacing:0.05em">To complete</p>
  </div>
  <div style="text-align:center;padding:14px 10px;background:rgba(255,255,255,0.05);border-radius:10px">
    <p style="font-size:26px;font-weight:900;color:#8fff00;margin:0;line-height:1">Free</p>
    <p style="font-size:11px;color:rgba(255,255,255,0.4);margin:6px 0 0;font-weight:700;text-transform:uppercase;letter-spacing:0.05em">Cost</p>
  </div>
</div>

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<h2>Before You Start: What You Need</h2>

<div style="background:#f7f9f5;border:1px solid #e8ede2;border-radius:14px;padding:20px 24px;margin:16px 0">
  <p style="font-size:12px;font-weight:900;letter-spacing:0.08em;color:#8a9e78;margin:0 0 14px">REQUIREMENTS CHECKLIST</p>
  <div style="display:flex;flex-direction:column;gap:10px">
    <div style="display:flex;align-items:center;gap:12px">
      <div style="width:20px;height:20px;border-radius:4px;border:2px solid rgba(143,255,0,0.5);background:#f4ffe6;flex-shrink:0"></div>
      <div><span style="font-size:14px;font-weight:700;color:#1a2410">[Requirement 1]</span> <span style="font-size:13px;color:#8a9e78">— [Why you need it and where to get it]</span></div>
    </div>
    <div style="display:flex;align-items:center;gap:12px">
      <div style="width:20px;height:20px;border-radius:4px;border:2px solid rgba(143,255,0,0.5);background:#f4ffe6;flex-shrink:0"></div>
      <div><span style="font-size:14px;font-weight:700;color:#1a2410">[Requirement 2]</span> <span style="font-size:13px;color:#8a9e78">— [Why you need it]</span></div>
    </div>
    <div style="display:flex;align-items:center;gap:12px">
      <div style="width:20px;height:20px;border-radius:4px;border:2px solid rgba(143,255,0,0.5);background:#f4ffe6;flex-shrink:0"></div>
      <div><span style="font-size:14px;font-weight:700;color:#1a2410">[Requirement 3]</span> <span style="font-size:13px;color:#8a9e78">— [Why you need it]</span></div>
    </div>
  </div>
</div>

:::info
Quick Note: If you do not have [prerequisite] yet, complete [link to resource] first. This guide assumes you already have [baseline knowledge/setup].
:::

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<h2>The Steps</h2>

<div style="display:flex;flex-direction:column;gap:14px;margin:24px 0">

  <div style="display:flex;gap:14px;align-items:flex-start;padding:18px;background:#f7f9f5;border:1px solid #e8ede2;border-radius:14px">
    <div style="width:36px;height:36px;border-radius:50%;background:#8fff00;color:#1a2410;font-weight:900;font-size:15px;display:flex;align-items:center;justify-content:center;flex-shrink:0">1</div>
    <div style="flex:1">
      <p style="font-size:15px;font-weight:800;color:#1a2410;margin:0 0 6px">[Action Verb + What to Do]</p>
      <p style="font-size:13px;line-height:1.7;color:#3a4a32;margin:0">[Clear specific instruction. Write as if guiding someone over their shoulder. Use exact menu names, button labels, or field names where possible.]</p>
      ${IMG.screenshot('Step 1 — What you should see on screen after completing this step')}
      <div style="background:#f4ffe6;border-left:3px solid #8fff00;padding:8px 12px;border-radius:0 8px 8px 0;margin-top:10px"><p style="font-size:12px;color:#4a8f00;margin:0"><strong>What to expect:</strong> [What the reader should see or experience after this step is done correctly.]</p></div>
    </div>
  </div>

  <div style="display:flex;gap:14px;align-items:flex-start;padding:18px;background:#f7f9f5;border:1px solid #e8ede2;border-radius:14px">
    <div style="width:36px;height:36px;border-radius:50%;background:#8fff00;color:#1a2410;font-weight:900;font-size:15px;display:flex;align-items:center;justify-content:center;flex-shrink:0">2</div>
    <div style="flex:1">
      <p style="font-size:15px;font-weight:800;color:#1a2410;margin:0 0 6px">[Action Verb + What to Do]</p>
      <p style="font-size:13px;line-height:1.7;color:#3a4a32;margin:0">[Explanation. If there are variations or choices, explain each one briefly and when to use which.]</p>
      <div style="background:#f4ffe6;border-left:3px solid #8fff00;padding:8px 12px;border-radius:0 8px 8px 0;margin-top:10px"><p style="font-size:12px;color:#4a8f00;margin:0"><strong>Pro Tip:</strong> [A shortcut or insider insight that makes this step faster or more effective.]</p></div>
    </div>
  </div>

  <div style="display:flex;gap:14px;align-items:flex-start;padding:18px;background:#f7f9f5;border:1px solid #e8ede2;border-radius:14px">
    <div style="width:36px;height:36px;border-radius:50%;background:#8fff00;color:#1a2410;font-weight:900;font-size:15px;display:flex;align-items:center;justify-content:center;flex-shrink:0">3</div>
    <div style="flex:1">
      <p style="font-size:15px;font-weight:800;color:#1a2410;margin:0 0 6px">[Action Verb + What to Do]</p>
      <p style="font-size:13px;line-height:1.7;color:#3a4a32;margin:0">[Explanation.]</p>
    </div>
  </div>

  <div style="display:flex;gap:14px;align-items:flex-start;padding:18px;background:#fffbeb;border:1px solid #fde68a;border-radius:14px">
    <div style="width:36px;height:36px;border-radius:50%;background:#d97706;color:#fff;font-weight:900;font-size:17px;display:flex;align-items:center;justify-content:center;flex-shrink:0">!</div>
    <div style="flex:1">
      <p style="font-size:15px;font-weight:800;color:#1a2410;margin:0 0 6px">Common Mistake at This Stage</p>
      <p style="font-size:13px;line-height:1.7;color:#3a4a32;margin:0">[What people often do wrong here and exactly how to avoid it. Be specific — not just "be careful" but "make sure you do X before Y or Z will happen".]</p>
    </div>
  </div>

  <div style="display:flex;gap:14px;align-items:flex-start;padding:18px;background:#f7f9f5;border:1px solid #e8ede2;border-radius:14px">
    <div style="width:36px;height:36px;border-radius:50%;background:#8fff00;color:#1a2410;font-weight:900;font-size:15px;display:flex;align-items:center;justify-content:center;flex-shrink:0">4</div>
    <div style="flex:1">
      <p style="font-size:15px;font-weight:800;color:#1a2410;margin:0 0 6px">[Action Verb + What to Do]</p>
      <p style="font-size:13px;line-height:1.7;color:#3a4a32;margin:0">[Explanation.]</p>
    </div>
  </div>

  <div style="display:flex;gap:14px;align-items:flex-start;padding:18px;background:#f7f9f5;border:1px solid #e8ede2;border-radius:14px">
    <div style="width:36px;height:36px;border-radius:50%;background:#8fff00;color:#1a2410;font-weight:900;font-size:15px;display:flex;align-items:center;justify-content:center;flex-shrink:0">5</div>
    <div style="flex:1">
      <p style="font-size:15px;font-weight:800;color:#1a2410;margin:0 0 6px">[Action Verb + What to Do]</p>
      <p style="font-size:13px;line-height:1.7;color:#3a4a32;margin:0">[Explanation.]</p>
    </div>
  </div>

  <div style="display:flex;gap:14px;align-items:flex-start;padding:18px;background:#f7f9f5;border:1px solid #e8ede2;border-radius:14px">
    <div style="width:36px;height:36px;border-radius:50%;background:#8fff00;color:#1a2410;font-weight:900;font-size:15px;display:flex;align-items:center;justify-content:center;flex-shrink:0">6</div>
    <div style="flex:1">
      <p style="font-size:15px;font-weight:800;color:#1a2410;margin:0 0 6px">Verify and Test</p>
      <p style="font-size:13px;line-height:1.7;color:#3a4a32;margin:0">Before moving on, confirm everything worked by [specific check]. You should see <strong>[expected result]</strong>. If you see [error] instead, it means [cause] — go to the troubleshooting section below.</p>
    </div>
  </div>

  <div style="display:flex;gap:14px;align-items:flex-start;padding:18px;background:#f4ffe6;border:1px solid rgba(143,255,0,0.3);border-radius:14px">
    <div style="width:36px;height:36px;border-radius:50%;background:#1a2410;color:#8fff00;font-weight:900;font-size:15px;display:flex;align-items:center;justify-content:center;flex-shrink:0">7</div>
    <div style="flex:1">
      <p style="font-size:15px;font-weight:800;color:#1a2410;margin:0 0 6px">Done — Here's What to Do Next</p>
      <p style="font-size:13px;line-height:1.7;color:#3a4a32;margin:0">You have successfully [completed task]. Your [result] is now [status]. Here are the logical next steps to build on what you just did:</p>
      <div style="display:flex;flex-direction:column;gap:6px;margin-top:10px">
        <div style="display:flex;gap:8px;align-items:center"><span style="color:#4a8f00;font-size:14px">→</span><span style="font-size:13px;color:#1a2410">[Next logical action]</span></div>
        <div style="display:flex;gap:8px;align-items:center"><span style="color:#4a8f00;font-size:14px">→</span><span style="font-size:13px;color:#1a2410">[Related skill to learn next]</span></div>
        <div style="display:flex;gap:8px;align-items:center"><span style="color:#4a8f00;font-size:14px">→</span><span style="font-size:13px;color:#1a2410">[Way to scale or improve what you just built]</span></div>
      </div>
    </div>
  </div>

</div>

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<h2>Troubleshooting Common Issues</h2>

<div style="display:flex;flex-direction:column;gap:10px;margin:16px 0">

  <div style="background:#f7f9f5;border:1px solid #e8ede2;border-radius:12px;overflow:hidden">
    <div style="padding:14px 16px;display:flex;align-items:center;justify-content:space-between;cursor:pointer">
      <p style="font-size:14px;font-weight:700;color:#1a2410;margin:0">Problem: [Error or issue description]</p>
      <span style="color:#8a9e78;font-size:18px;font-weight:300">+</span>
    </div>
    <div style="padding:0 16px 14px;border-top:1px solid #e8ede2">
      <p style="font-size:13px;color:#8a9e78;margin:10px 0 0;line-height:1.7"><strong>Fix:</strong> [Specific step-by-step solution. Include exactly where to find the setting or what to click.]</p>
    </div>
  </div>

  <div style="background:#f7f9f5;border:1px solid #e8ede2;border-radius:12px;overflow:hidden">
    <div style="padding:14px 16px;display:flex;align-items:center;justify-content:space-between;cursor:pointer">
      <p style="font-size:14px;font-weight:700;color:#1a2410;margin:0">Problem: [Second issue]</p>
      <span style="color:#8a9e78;font-size:18px;font-weight:300">+</span>
    </div>
    <div style="padding:0 16px 14px;border-top:1px solid #e8ede2">
      <p style="font-size:13px;color:#8a9e78;margin:10px 0 0;line-height:1.7"><strong>Fix:</strong> [Solution.]</p>
    </div>
  </div>

  <div style="background:#f7f9f5;border:1px solid #e8ede2;border-radius:12px;overflow:hidden">
    <div style="padding:14px 16px;display:flex;align-items:center;justify-content:space-between;cursor:pointer">
      <p style="font-size:14px;font-weight:700;color:#1a2410;margin:0">Problem: [Third issue]</p>
      <span style="color:#8a9e78;font-size:18px;font-weight:300">+</span>
    </div>
    <div style="padding:0 16px 14px;border-top:1px solid #e8ede2">
      <p style="font-size:13px;color:#8a9e78;margin:10px 0 0;line-height:1.7"><strong>Fix:</strong> [Solution.]</p>
    </div>
  </div>

</div>

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<h2>What You Accomplished</h2>

<p>Here is a quick recap of everything you just completed:</p>

<div style="background:#f4ffe6;border:1px solid rgba(143,255,0,0.3);border-radius:14px;padding:20px 24px;margin:16px 0">
  <p style="font-size:12px;font-weight:900;letter-spacing:0.08em;color:#4a8f00;margin:0 0 14px">COMPLETED ✓</p>
  <div style="display:flex;flex-direction:column;gap:10px">
    <div style="display:flex;align-items:center;gap:10px">
      <div style="width:22px;height:22px;border-radius:50%;background:#8fff00;display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="11" height="11" fill="none" stroke="#1a2410" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg></div>
      <span style="font-size:13px;font-weight:700;color:#1a2410">[Achievement 1]</span>
    </div>
    <div style="display:flex;align-items:center;gap:10px">
      <div style="width:22px;height:22px;border-radius:50%;background:#8fff00;display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="11" height="11" fill="none" stroke="#1a2410" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg></div>
      <span style="font-size:13px;font-weight:700;color:#1a2410">[Achievement 2]</span>
    </div>
    <div style="display:flex;align-items:center;gap:10px">
      <div style="width:22px;height:22px;border-radius:50%;background:#8fff00;display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="11" height="11" fill="none" stroke="#1a2410" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg></div>
      <span style="font-size:13px;font-weight:700;color:#1a2410">[Achievement 3]</span>
    </div>
  </div>
</div>

[CTA:free]

<p style="font-size:12px;color:#8a9e78;border-top:1px solid #e8ede2;padding-top:14px;margin-top:24px;line-height:1.7"><em>Last updated <strong>[Month Year]</strong>. If any steps look different in your eBay account, <a href="/contact" style="color:#8a9e78">let us know</a> and we will update this guide.</em></p>`
  },

  // ── 3. PRODUCT REVIEW ────────────────────────────────────────────────────
  {
    id:          'product-review',
    name:        'Product / Tool Review',
    description: 'Premium review with dark rating dashboard, quick-verdict card, who-its-for grid, feature scores, styled pros/cons, pricing table with best-value badge, and verdict block.',
    icon:        Star,
    color:       C.amber,
    category:    'Review',
    wordEstimate: '1,500–2,500 words',
    previewLines: ['Hero + reading time bar', 'Dark rating dashboard', 'Quick verdict card', 'Who it is for grid', 'Feature scores', 'Styled pros/cons', 'Pricing table', 'Verdict block + CTA'],
    defaultTitle: '[Product Name] Review [Year]: Honest Assessment for eBay Sellers',
    defaultMeta:  'Honest, in-depth [product] review for eBay sellers. Tested for [X weeks] — features, pricing, pros/cons, and our verdict. Updated [year].',
    html: `${IMG.hero('[Product Name] — In-Depth Review for eBay Sellers')}

<div style="display:flex;align-items:center;gap:16px;padding:12px 16px;background:#f7f9f5;border-radius:10px;margin:16px 0;flex-wrap:wrap">
  <span style="font-size:12px;color:#8a9e78">⏱ <strong>[X] min read</strong></span>
  <span style="color:#e8ede2">|</span>
  <span style="font-size:12px;color:#8a9e78">🧪 Tested: <strong>[X weeks/months]</strong></span>
  <span style="color:#e8ede2">|</span>
  <span style="font-size:12px;color:#8a9e78">✍️ By <strong>[Author Name]</strong></span>
  <span style="color:#e8ede2">|</span>
  <span style="font-size:12px;color:#8a9e78">📅 Updated: <strong>[Month Year]</strong></span>
</div>

<h1>[Product Name] Review [Year]: Honest Assessment for eBay Sellers</h1>

<p style="font-size:17px;line-height:1.8;color:#3a4a32;margin:0 0 20px">I have been using <strong>[Product Name]</strong> for [X weeks/months] as an eBay seller. This review covers what it does well, where it falls short, and whether it is worth your money — no sponsored content, no sugarcoating.</p>

<div style="background:#1a2410;border-radius:16px;padding:24px;margin:24px 0">
  <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:20px">
    <div>
      <p style="color:rgba(255,255,255,0.5);font-size:11px;font-weight:900;letter-spacing:0.08em;margin:0 0 8px">OVERALL RATING</p>
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
        <span style="color:#8fff00;font-size:24px;line-height:1">★★★★</span><span style="color:rgba(255,255,255,0.2);font-size:24px;line-height:1">★</span>
        <span style="color:#fff;font-size:18px;font-weight:900;margin-left:4px">4.0 / 5</span>
      </div>
      <p style="color:#8fff00;font-size:13px;font-weight:700;margin:0">Recommended for [type of seller]</p>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div style="text-align:center;padding:12px 16px;background:rgba(255,255,255,0.06);border-radius:10px">
        <p style="color:#8fff00;font-size:17px;font-weight:900;margin:0">$[X]/mo</p>
        <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:3px 0 0;font-weight:700">Starting price</p>
      </div>
      <div style="text-align:center;padding:12px 16px;background:rgba(255,255,255,0.06);border-radius:10px">
        <p style="color:#8fff00;font-size:17px;font-weight:900;margin:0">[Yes/No]</p>
        <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:3px 0 0;font-weight:700">Free trial</p>
      </div>
      <div style="text-align:center;padding:12px 16px;background:rgba(255,255,255,0.06);border-radius:10px">
        <p style="color:#8fff00;font-size:17px;font-weight:900;margin:0">[X]+</p>
        <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:3px 0 0;font-weight:700">Active users</p>
      </div>
      <div style="text-align:center;padding:12px 16px;background:rgba(255,255,255,0.06);border-radius:10px">
        <p style="color:#8fff00;font-size:17px;font-weight:900;margin:0">[Year]</p>
        <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:3px 0 0;font-weight:700">Founded</p>
      </div>
    </div>
  </div>
</div>

<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:16px 20px;margin:20px 0">
  <p style="font-size:12px;font-weight:900;letter-spacing:0.08em;color:#d97706;margin:0 0 6px">BOTTOM LINE — IF YOU ARE IN A HURRY</p>
  <p style="font-size:14px;color:#1a2410;margin:0;line-height:1.7">[One honest paragraph verdict. Tell them exactly who should buy this and who should not. Do not be vague — be direct and specific.]</p>
</div>

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<h2>What is [Product Name]?</h2>

<p>[Product Name] is [clear description]. It was built for [target user] and focuses on solving [specific problem]. The core value proposition is [what makes it different in one sentence].</p>

<p>Unlike [main competitor], [Product Name] [specific differentiator]. This matters for eBay sellers because [reason it is relevant to their daily work].</p>

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<h2>Who is [Product Name] For?</h2>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:16px 0">
  <div style="background:#f4ffe6;border:1px solid rgba(74,143,0,0.3);border-radius:12px;padding:16px">
    <p style="font-size:12px;font-weight:900;letter-spacing:0.06em;color:#4a8f00;margin:0 0 10px">GREAT FIT IF YOU</p>
    <div style="display:flex;flex-direction:column;gap:7px">
      <div style="display:flex;gap:8px;align-items:flex-start"><span style="color:#4a8f00;font-size:14px;line-height:1.4;flex-shrink:0">✓</span><span style="font-size:13px;color:#1a2410;line-height:1.5">[Use case 1]</span></div>
      <div style="display:flex;gap:8px;align-items:flex-start"><span style="color:#4a8f00;font-size:14px;line-height:1.4;flex-shrink:0">✓</span><span style="font-size:13px;color:#1a2410;line-height:1.5">[Use case 2]</span></div>
      <div style="display:flex;gap:8px;align-items:flex-start"><span style="color:#4a8f00;font-size:14px;line-height:1.4;flex-shrink:0">✓</span><span style="font-size:13px;color:#1a2410;line-height:1.5">[Use case 3]</span></div>
    </div>
  </div>
  <div style="background:#FEF2F2;border:1px solid #fecaca;border-radius:12px;padding:16px">
    <p style="font-size:12px;font-weight:900;letter-spacing:0.06em;color:#b91c1c;margin:0 0 10px">NOT RIGHT FOR YOU IF</p>
    <div style="display:flex;flex-direction:column;gap:7px">
      <div style="display:flex;gap:8px;align-items:flex-start"><span style="color:#b91c1c;font-size:14px;line-height:1.4;flex-shrink:0">✗</span><span style="font-size:13px;color:#1a2410;line-height:1.5">[Exclusion 1]</span></div>
      <div style="display:flex;gap:8px;align-items:flex-start"><span style="color:#b91c1c;font-size:14px;line-height:1.4;flex-shrink:0">✗</span><span style="font-size:13px;color:#1a2410;line-height:1.5">[Exclusion 2]</span></div>
      <div style="display:flex;gap:8px;align-items:flex-start"><span style="color:#b91c1c;font-size:14px;line-height:1.4;flex-shrink:0">✗</span><span style="font-size:13px;color:#1a2410;line-height:1.5">[Exclusion 3]</span></div>
    </div>
  </div>
</div>

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<h2>Key Features Breakdown</h2>

${IMG.screenshot('[Product Name] — main dashboard screenshot. Add your own screenshot here.')}

<div style="display:flex;flex-direction:column;gap:16px;margin:20px 0">

  <div style="border:1px solid #e8ede2;border-radius:12px;padding:18px;background:#f7f9f5">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;flex-wrap:wrap;gap:8px">
      <p style="font-size:15px;font-weight:800;color:#1a2410;margin:0">[Feature 1 Name]</p>
      <div style="display:flex;gap:2px"><span style="color:#d97706;font-size:14px">★★★★★</span></div>
    </div>
    <p style="font-size:13px;line-height:1.7;color:#3a4a32;margin:0">[Detailed honest review of this feature. How does it work in practice? What result does it produce? Include a specific real-world example with numbers if possible.]</p>
  </div>

  <div style="border:1px solid #e8ede2;border-radius:12px;padding:18px;background:#f7f9f5">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;flex-wrap:wrap;gap:8px">
      <p style="font-size:15px;font-weight:800;color:#1a2410;margin:0">[Feature 2 Name]</p>
      <div style="display:flex;gap:2px"><span style="color:#d97706;font-size:14px">★★★★</span><span style="color:#e8ede2;font-size:14px">★</span></div>
    </div>
    <p style="font-size:13px;line-height:1.7;color:#3a4a32;margin:0">[Review with real-world context. If this feature has a notable limitation, mention it clearly here.]</p>
  </div>

  <div style="border:1px solid #e8ede2;border-radius:12px;padding:18px;background:#f7f9f5">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;flex-wrap:wrap;gap:8px">
      <p style="font-size:15px;font-weight:800;color:#1a2410;margin:0">[Feature 3 Name]</p>
      <div style="display:flex;gap:2px"><span style="color:#d97706;font-size:14px">★★★</span><span style="color:#e8ede2;font-size:14px">★★</span></div>
    </div>
    <p style="font-size:13px;line-height:1.7;color:#3a4a32;margin:0">[Review. If this is a weak area, say so directly — honest criticism builds trust with your readers more than anything else.]</p>
  </div>

  <div style="border:1px solid #e8ede2;border-radius:12px;padding:18px;background:#f7f9f5">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;flex-wrap:wrap;gap:8px">
      <p style="font-size:15px;font-weight:800;color:#1a2410;margin:0">[Feature 4 Name]</p>
      <div style="display:flex;gap:2px"><span style="color:#d97706;font-size:14px">★★★★</span><span style="color:#e8ede2;font-size:14px">★</span></div>
    </div>
    <p style="font-size:13px;line-height:1.7;color:#3a4a32;margin:0">[Review.]</p>
  </div>

</div>

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<h2>Pros and Cons</h2>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:16px 0">
  <div style="background:#f4ffe6;border:1px solid rgba(74,143,0,0.25);border-radius:12px;padding:18px">
    <p style="font-size:12px;font-weight:900;letter-spacing:0.08em;color:#4a8f00;margin:0 0 12px">PROS</p>
    <div style="display:flex;flex-direction:column;gap:9px">
      <div style="display:flex;gap:8px;align-items:flex-start"><div style="width:18px;height:18px;border-radius:50%;background:#4a8f00;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px"><svg width="9" height="9" fill="none" stroke="#fff" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg></div><span style="font-size:13px;color:#1a2410;line-height:1.5">[Pro 1 — be specific, not generic]</span></div>
      <div style="display:flex;gap:8px;align-items:flex-start"><div style="width:18px;height:18px;border-radius:50%;background:#4a8f00;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px"><svg width="9" height="9" fill="none" stroke="#fff" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg></div><span style="font-size:13px;color:#1a2410;line-height:1.5">[Pro 2]</span></div>
      <div style="display:flex;gap:8px;align-items:flex-start"><div style="width:18px;height:18px;border-radius:50%;background:#4a8f00;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px"><svg width="9" height="9" fill="none" stroke="#fff" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg></div><span style="font-size:13px;color:#1a2410;line-height:1.5">[Pro 3]</span></div>
      <div style="display:flex;gap:8px;align-items:flex-start"><div style="width:18px;height:18px;border-radius:50%;background:#4a8f00;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px"><svg width="9" height="9" fill="none" stroke="#fff" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg></div><span style="font-size:13px;color:#1a2410;line-height:1.5">[Pro 4]</span></div>
    </div>
  </div>
  <div style="background:#FEF2F2;border:1px solid #fecaca;border-radius:12px;padding:18px">
    <p style="font-size:12px;font-weight:900;letter-spacing:0.08em;color:#b91c1c;margin:0 0 12px">CONS</p>
    <div style="display:flex;flex-direction:column;gap:9px">
      <div style="display:flex;gap:8px;align-items:flex-start"><div style="width:18px;height:18px;border-radius:50%;background:#b91c1c;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px"><svg width="9" height="9" fill="none" stroke="#fff" stroke-width="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div><span style="font-size:13px;color:#1a2410;line-height:1.5">[Con 1]</span></div>
      <div style="display:flex;gap:8px;align-items:flex-start"><div style="width:18px;height:18px;border-radius:50%;background:#b91c1c;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px"><svg width="9" height="9" fill="none" stroke="#fff" stroke-width="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div><span style="font-size:13px;color:#1a2410;line-height:1.5">[Con 2]</span></div>
      <div style="display:flex;gap:8px;align-items:flex-start"><div style="width:18px;height:18px;border-radius:50%;background:#b91c1c;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px"><svg width="9" height="9" fill="none" stroke="#fff" stroke-width="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div><span style="font-size:13px;color:#1a2410;line-height:1.5">[Con 3]</span></div>
    </div>
  </div>
</div>

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<h2>Pricing</h2>

<table style="width:100%;border-collapse:collapse;margin:16px 0;border-radius:14px;overflow:hidden">
  <thead>
    <tr>
      <th style="border:1px solid #e8ede2;padding:12px 16px;background:#f7f9f5;font-size:12px;font-weight:900;text-align:left;color:#8a9e78;letter-spacing:0.04em">PLAN</th>
      <th style="border:1px solid #e8ede2;padding:12px 16px;background:#f7f9f5;font-size:12px;font-weight:900;text-align:center;color:#8a9e78;letter-spacing:0.04em">PRICE</th>
      <th style="border:1px solid #e8ede2;padding:12px 16px;background:#f7f9f5;font-size:12px;font-weight:900;text-align:left;color:#8a9e78;letter-spacing:0.04em">BEST FOR</th>
      <th style="border:1px solid #e8ede2;padding:12px 16px;background:#f7f9f5;font-size:12px;font-weight:900;text-align:center;color:#8a9e78;letter-spacing:0.04em">OUR TAKE</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #e8ede2;padding:12px 16px;font-size:13px;font-weight:700">Free</td>
      <td style="border:1px solid #e8ede2;padding:12px 16px;font-size:13px;text-align:center;font-weight:900">$0/mo</td>
      <td style="border:1px solid #e8ede2;padding:12px 16px;font-size:13px">[Who this suits]</td>
      <td style="border:1px solid #e8ede2;padding:12px 16px;font-size:12px;text-align:center;color:#8a9e78">Good start</td>
    </tr>
    <tr style="background:#f4ffe6">
      <td style="border:1px solid #e8ede2;padding:12px 16px;font-size:13px;font-weight:700">[Plan Name] <span style="background:#8fff00;color:#1a2410;font-size:9px;padding:2px 6px;border-radius:20px;font-weight:900;margin-left:4px">BEST VALUE</span></td>
      <td style="border:1px solid #e8ede2;padding:12px 16px;font-size:14px;text-align:center;font-weight:900;color:#4a8f00">$[X]/mo</td>
      <td style="border:1px solid #e8ede2;padding:12px 16px;font-size:13px">[Who this suits]</td>
      <td style="border:1px solid #e8ede2;padding:12px 16px;font-size:12px;text-align:center;font-weight:700;color:#4a8f00">Recommended</td>
    </tr>
    <tr>
      <td style="border:1px solid #e8ede2;padding:12px 16px;font-size:13px;font-weight:700">[Plan Name]</td>
      <td style="border:1px solid #e8ede2;padding:12px 16px;font-size:13px;text-align:center;font-weight:900">$[X]/mo</td>
      <td style="border:1px solid #e8ede2;padding:12px 16px;font-size:13px">[Who this suits]</td>
      <td style="border:1px solid #e8ede2;padding:12px 16px;font-size:12px;text-align:center;color:#8a9e78">Power users</td>
    </tr>
  </tbody>
</table>

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<h2>Our Verdict</h2>

<p>[2-3 sentences honest conclusion. Who should buy it, who should skip it, and why. Be direct — a wishy-washy verdict is the least useful thing you can write.]</p>

<div style="background:#1a2410;border-radius:14px;padding:20px 24px;margin:20px 0;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px">
  <div>
    <p style="color:rgba(255,255,255,0.5);font-size:11px;font-weight:900;letter-spacing:0.08em;margin:0 0 4px">FINAL SCORE</p>
    <div style="display:flex;align-items:center;gap:8px">
      <span style="color:#8fff00;font-size:32px;font-weight:900;line-height:1">[X]</span>
      <span style="color:rgba(255,255,255,0.3);font-size:20px;font-weight:300">/</span>
      <span style="color:rgba(255,255,255,0.3);font-size:20px;font-weight:300">10</span>
    </div>
  </div>
  <div style="flex:1;min-width:200px">
    <p style="color:#fff;font-size:14px;font-weight:700;margin:0 0 4px">[One sentence summary of why you gave this score]</p>
    <p style="color:rgba(255,255,255,0.5);font-size:12px;margin:0">Best for: [type of eBay seller]</p>
  </div>
</div>

[CTA:starter]

<div style="display:flex;gap:16px;align-items:center;padding:18px 20px;background:#f7f9f5;border-radius:14px;border:1px solid #e8ede2;margin:24px 0">
  <div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#1a2410,#2d4020);display:flex;align-items:center;justify-content:center;flex-shrink:0">
    <svg width="20" height="20" fill="none" stroke="#8fff00" stroke-width="1.5" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  </div>
  <div>
    <p style="font-size:14px;font-weight:800;color:#1a2410;margin:0 0 2px">[Author Name]</p>
    <p style="font-size:12px;color:#8a9e78;margin:0;line-height:1.6">[Author bio — e.g. eBay seller since 2016, tested [X]+ tools, writes about eBay selling strategy at Riazify]</p>
  </div>
</div>

<p style="font-size:12px;color:#8a9e78;border-top:1px solid #e8ede2;padding-top:14px;margin-top:20px;line-height:1.7"><em>Disclosure: This review may contain affiliate links. We earn a small commission if you purchase through our links, at no extra cost to you. Our editorial opinions are never influenced by commissions — we only recommend tools we have personally tested and believe in.</em></p>`
  },

  // ── 4. COMPARISON ────────────────────────────────────────────────────────
  {
    id:          'comparison',
    name:        'Comparison Article',
    description: 'Premium head-to-head with dual screenshot hero, dark winner cards, full feature table, deep-dive sections with strengths/weaknesses, use case guide, and verdict block.',
    icon:        BarChart2,
    color:       C.blue,
    category:    'Comparison',
    wordEstimate: '1,500–2,500 words',
    previewLines: ['Dual screenshots hero', 'Reading time bar', 'Dark winner verdict cards', 'Full feature comparison table', 'Deep-dive per option', 'Use case decision guide', 'Verdict block + FAQ'],
    defaultTitle: '[Option A] vs [Option B] for eBay Sellers: Which is Better in [Year]?',
    defaultMeta:  'Comparing [Option A] vs [Option B] for eBay sellers in [year]. Full feature breakdown, pricing, pros/cons, and our definitive recommendation.',
    html: `${IMG.double('[Option A] — interface or product screenshot', '[Option B] — interface or product screenshot')}

<div style="display:flex;align-items:center;gap:16px;padding:12px 16px;background:#f7f9f5;border-radius:10px;margin:16px 0;flex-wrap:wrap">
  <span style="font-size:12px;color:#8a9e78">⏱ <strong>[X] min read</strong></span>
  <span style="color:#e8ede2">|</span>
  <span style="font-size:12px;color:#8a9e78">🧪 Tested: <strong>[X weeks]</strong></span>
  <span style="color:#e8ede2">|</span>
  <span style="font-size:12px;color:#8a9e78">✍️ By <strong>[Author Name]</strong></span>
  <span style="color:#e8ede2">|</span>
  <span style="font-size:12px;color:#8a9e78">📅 Updated: <strong>[Month Year]</strong></span>
</div>

<h1>[Option A] vs [Option B] for eBay Sellers: Which is Better in [Year]?</h1>

<p style="font-size:17px;line-height:1.8;color:#3a4a32;margin:0 0 20px">Both <strong>[Option A]</strong> and <strong>[Option B]</strong> are worth considering — but for eBay sellers specifically, one is clearly the better choice depending on your situation. This comparison cuts through the marketing to give you a direct answer.</p>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:24px 0">
  <div style="background:#1a2410;border-radius:14px;padding:20px;text-align:center">
    <p style="font-size:11px;font-weight:900;letter-spacing:0.08em;color:#8fff00;margin:0 0 8px">BEST OVERALL</p>
    <p style="font-size:22px;font-weight:900;color:#fff;margin:0 0 6px">[Option A]</p>
    <p style="font-size:12px;color:rgba(255,255,255,0.5);margin:0 0 12px">Best for: [specific seller type]</p>
    <div style="display:flex;gap:2px;justify-content:center"><span style="color:#8fff00;font-size:16px">★★★★★</span></div>
  </div>
  <div style="background:#f7f9f5;border:1px solid #e8ede2;border-radius:14px;padding:20px;text-align:center">
    <p style="font-size:11px;font-weight:900;letter-spacing:0.08em;color:#8a9e78;margin:0 0 8px">RUNNER UP</p>
    <p style="font-size:22px;font-weight:900;color:#1a2410;margin:0 0 6px">[Option B]</p>
    <p style="font-size:12px;color:#8a9e78;margin:0 0 12px">Best for: [specific seller type]</p>
    <div style="display:flex;gap:2px;justify-content:center"><span style="color:#d97706;font-size:16px">★★★★</span><span style="color:#e8ede2;font-size:16px">★</span></div>
  </div>
</div>

<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:16px 20px;margin:20px 0">
  <p style="font-size:12px;font-weight:900;letter-spacing:0.08em;color:#d97706;margin:0 0 8px">QUICK VERDICT — IF YOU ARE IN A HURRY</p>
  <p style="font-size:14px;color:#1a2410;margin:0 0 6px;line-height:1.7">Choose <strong>[Option A]</strong> if: [specific situation — be concrete, not vague]</p>
  <p style="font-size:14px;color:#1a2410;margin:0;line-height:1.7">Choose <strong>[Option B]</strong> if: [specific situation]</p>
</div>

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<h2>Full Feature Comparison</h2>

<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <thead>
    <tr>
      <th style="border:1px solid #e8ede2;padding:12px 16px;background:#f7f9f5;font-size:12px;font-weight:900;text-align:left;color:#8a9e78;letter-spacing:0.04em">FEATURE</th>
      <th style="border:1px solid #e8ede2;padding:12px 16px;background:#1a2410;font-size:12px;font-weight:900;text-align:center;color:#8fff00;letter-spacing:0.04em">[Option A] ⭐</th>
      <th style="border:1px solid #e8ede2;padding:12px 16px;background:#f7f9f5;font-size:12px;font-weight:900;text-align:center;color:#8a9e78;letter-spacing:0.04em">[Option B]</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #e8ede2;padding:11px 16px;font-size:13px;font-weight:700;color:#1a2410">Price</td>
      <td style="border:1px solid #e8ede2;padding:11px 16px;font-size:13px;text-align:center;font-weight:700;background:#f4ffe6">$[X]/mo</td>
      <td style="border:1px solid #e8ede2;padding:11px 16px;font-size:13px;text-align:center;font-weight:700">$[X]/mo</td>
    </tr>
    <tr style="background:#f7f9f5">
      <td style="border:1px solid #e8ede2;padding:11px 16px;font-size:13px;font-weight:700;color:#1a2410">[Feature 1]</td>
      <td style="border:1px solid #e8ede2;padding:11px 16px;font-size:13px;text-align:center;color:#16a34a;font-weight:700;background:#f0fff4">✓ Yes</td>
      <td style="border:1px solid #e8ede2;padding:11px 16px;font-size:13px;text-align:center;color:#b91c1c;font-weight:700">✗ No</td>
    </tr>
    <tr>
      <td style="border:1px solid #e8ede2;padding:11px 16px;font-size:13px;font-weight:700;color:#1a2410">[Feature 2]</td>
      <td style="border:1px solid #e8ede2;padding:11px 16px;font-size:13px;text-align:center;color:#b91c1c;font-weight:700;background:#f4ffe6">✗ No</td>
      <td style="border:1px solid #e8ede2;padding:11px 16px;font-size:13px;text-align:center;color:#16a34a;font-weight:700">✓ Yes</td>
    </tr>
    <tr style="background:#f7f9f5">
      <td style="border:1px solid #e8ede2;padding:11px 16px;font-size:13px;font-weight:700;color:#1a2410">[Feature 3]</td>
      <td style="border:1px solid #e8ede2;padding:11px 16px;font-size:13px;text-align:center;color:#16a34a;font-weight:700;background:#f0fff4">✓ Full</td>
      <td style="border:1px solid #e8ede2;padding:11px 16px;font-size:13px;text-align:center;color:#d97706">Limited</td>
    </tr>
    <tr>
      <td style="border:1px solid #e8ede2;padding:11px 16px;font-size:13px;font-weight:700;color:#1a2410">[Feature 4]</td>
      <td style="border:1px solid #e8ede2;padding:11px 16px;font-size:13px;text-align:center;color:#16a34a;font-weight:700;background:#f4ffe6">✓ Yes</td>
      <td style="border:1px solid #e8ede2;padding:11px 16px;font-size:13px;text-align:center;color:#16a34a;font-weight:700">✓ Yes</td>
    </tr>
    <tr style="background:#f7f9f5">
      <td style="border:1px solid #e8ede2;padding:11px 16px;font-size:13px;font-weight:700;color:#1a2410">[Feature 5]</td>
      <td style="border:1px solid #e8ede2;padding:11px 16px;font-size:13px;text-align:center;color:#16a34a;font-weight:700;background:#f0fff4">✓ Yes</td>
      <td style="border:1px solid #e8ede2;padding:11px 16px;font-size:13px;text-align:center;color:#b91c1c;font-weight:700">✗ No</td>
    </tr>
    <tr>
      <td style="border:1px solid #e8ede2;padding:11px 16px;font-size:13px;font-weight:700;color:#1a2410">Free Trial</td>
      <td style="border:1px solid #e8ede2;padding:11px 16px;font-size:13px;text-align:center;background:#f4ffe6">[X] days</td>
      <td style="border:1px solid #e8ede2;padding:11px 16px;font-size:13px;text-align:center">[X] days</td>
    </tr>
    <tr style="background:#f7f9f5">
      <td style="border:1px solid #e8ede2;padding:11px 16px;font-size:13px;font-weight:700;color:#1a2410">eBay Integration</td>
      <td style="border:1px solid #e8ede2;padding:11px 16px;font-size:13px;text-align:center;color:#16a34a;font-weight:700;background:#f0fff4">✓ Native</td>
      <td style="border:1px solid #e8ede2;padding:11px 16px;font-size:13px;text-align:center;color:#d97706">Via API</td>
    </tr>
    <tr>
      <td style="border:1px solid #e8ede2;padding:11px 16px;font-size:13px;font-weight:700;color:#1a2410">Best For</td>
      <td style="border:1px solid #e8ede2;padding:11px 16px;font-size:13px;text-align:center;background:#f4ffe6">[Seller type]</td>
      <td style="border:1px solid #e8ede2;padding:11px 16px;font-size:13px;text-align:center">[Seller type]</td>
    </tr>
  </tbody>
</table>

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<h2>Deep Dive: [Option A]</h2>

${IMG.screenshot('[Option A] — main interface or key feature screenshot')}

<p>[Option A] was built for [purpose]. It has been on the market since [year] and is used by [X]+ sellers. The core philosophy is [philosophy — what do they believe about how this problem should be solved?]</p>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:16px 0">
  <div style="background:#f4ffe6;border:1px solid rgba(74,143,0,0.25);border-radius:12px;padding:16px">
    <p style="font-size:12px;font-weight:900;letter-spacing:0.06em;color:#4a8f00;margin:0 0 10px">WHAT IT DOES BEST</p>
    <div style="display:flex;flex-direction:column;gap:7px">
      <div style="display:flex;gap:8px;align-items:flex-start"><div style="width:16px;height:16px;border-radius:50%;background:#4a8f00;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px"><svg width="8" height="8" fill="none" stroke="#fff" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg></div><span style="font-size:13px;color:#1a2410;line-height:1.5">[Strength 1 with a specific example]</span></div>
      <div style="display:flex;gap:8px;align-items:flex-start"><div style="width:16px;height:16px;border-radius:50%;background:#4a8f00;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px"><svg width="8" height="8" fill="none" stroke="#fff" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg></div><span style="font-size:13px;color:#1a2410;line-height:1.5">[Strength 2]</span></div>
      <div style="display:flex;gap:8px;align-items:flex-start"><div style="width:16px;height:16px;border-radius:50%;background:#4a8f00;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px"><svg width="8" height="8" fill="none" stroke="#fff" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg></div><span style="font-size:13px;color:#1a2410;line-height:1.5">[Strength 3]</span></div>
    </div>
  </div>
  <div style="background:#FEF2F2;border:1px solid #fecaca;border-radius:12px;padding:16px">
    <p style="font-size:12px;font-weight:900;letter-spacing:0.06em;color:#b91c1c;margin:0 0 10px">WHERE IT FALLS SHORT</p>
    <div style="display:flex;flex-direction:column;gap:7px">
      <div style="display:flex;gap:8px;align-items:flex-start"><div style="width:16px;height:16px;border-radius:50%;background:#b91c1c;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px"><svg width="8" height="8" fill="none" stroke="#fff" stroke-width="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div><span style="font-size:13px;color:#1a2410;line-height:1.5">[Weakness 1]</span></div>
      <div style="display:flex;gap:8px;align-items:flex-start"><div style="width:16px;height:16px;border-radius:50%;background:#b91c1c;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px"><svg width="8" height="8" fill="none" stroke="#fff" stroke-width="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div><span style="font-size:13px;color:#1a2410;line-height:1.5">[Weakness 2]</span></div>
    </div>
  </div>
</div>

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<h2>Deep Dive: [Option B]</h2>

${IMG.screenshot('[Option B] — main interface or key feature screenshot')}

<p>[Option B] takes a different approach. It focuses on [focus] and is designed for sellers who [situation]. The key difference from [Option A] is [specific differentiator].</p>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:16px 0">
  <div style="background:#f4ffe6;border:1px solid rgba(74,143,0,0.25);border-radius:12px;padding:16px">
    <p style="font-size:12px;font-weight:900;letter-spacing:0.06em;color:#4a8f00;margin:0 0 10px">WHAT IT DOES BEST</p>
    <div style="display:flex;flex-direction:column;gap:7px">
      <div style="display:flex;gap:8px;align-items:flex-start"><div style="width:16px;height:16px;border-radius:50%;background:#4a8f00;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px"><svg width="8" height="8" fill="none" stroke="#fff" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg></div><span style="font-size:13px;color:#1a2410;line-height:1.5">[Strength 1]</span></div>
      <div style="display:flex;gap:8px;align-items:flex-start"><div style="width:16px;height:16px;border-radius:50%;background:#4a8f00;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px"><svg width="8" height="8" fill="none" stroke="#fff" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg></div><span style="font-size:13px;color:#1a2410;line-height:1.5">[Strength 2]</span></div>
      <div style="display:flex;gap:8px;align-items:flex-start"><div style="width:16px;height:16px;border-radius:50%;background:#4a8f00;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px"><svg width="8" height="8" fill="none" stroke="#fff" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg></div><span style="font-size:13px;color:#1a2410;line-height:1.5">[Strength 3]</span></div>
    </div>
  </div>
  <div style="background:#FEF2F2;border:1px solid #fecaca;border-radius:12px;padding:16px">
    <p style="font-size:12px;font-weight:900;letter-spacing:0.06em;color:#b91c1c;margin:0 0 10px">WHERE IT FALLS SHORT</p>
    <div style="display:flex;flex-direction:column;gap:7px">
      <div style="display:flex;gap:8px;align-items:flex-start"><div style="width:16px;height:16px;border-radius:50%;background:#b91c1c;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px"><svg width="8" height="8" fill="none" stroke="#fff" stroke-width="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div><span style="font-size:13px;color:#1a2410;line-height:1.5">[Weakness 1]</span></div>
      <div style="display:flex;gap:8px;align-items:flex-start"><div style="width:16px;height:16px;border-radius:50%;background:#b91c1c;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:1px"><svg width="8" height="8" fill="none" stroke="#fff" stroke-width="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></div><span style="font-size:13px;color:#1a2410;line-height:1.5">[Weakness 2]</span></div>
    </div>
  </div>
</div>

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<h2>Which Should You Choose?</h2>

<p>The answer depends entirely on your situation. Here is the clearest way to decide:</p>

<div style="display:flex;flex-direction:column;gap:12px;margin:20px 0">
  <div style="display:flex;gap:14px;align-items:flex-start;padding:18px;background:#1a2410;border-radius:14px">
    <div style="width:36px;height:36px;border-radius:50%;background:#8fff00;color:#1a2410;font-weight:900;font-size:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;text-align:center;line-height:1.2">OPT A</div>
    <div>
      <p style="font-size:14px;font-weight:800;color:#8fff00;margin:0 0 5px">Choose [Option A] if you</p>
      <p style="font-size:13px;color:rgba(255,255,255,0.7);margin:0;line-height:1.7">[Specific situation, seller type, or need that makes Option A the clear winner. Include a concrete example — "if you sell 100+ items/month and need X, Option A handles this better because Y."]</p>
    </div>
  </div>
  <div style="display:flex;gap:14px;align-items:flex-start;padding:18px;background:#f7f9f5;border:1px solid #e8ede2;border-radius:14px">
    <div style="width:36px;height:36px;border-radius:50%;background:#1a2410;color:#8a9e78;font-weight:900;font-size:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;text-align:center;line-height:1.2">OPT B</div>
    <div>
      <p style="font-size:14px;font-weight:800;color:#1a2410;margin:0 0 5px">Choose [Option B] if you</p>
      <p style="font-size:13px;color:#8a9e78;margin:0;line-height:1.7">[Situation where Option B is the better pick. Be just as specific as above.]</p>
    </div>
  </div>
</div>

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<h2>Our Verdict</h2>

<div style="background:#1a2410;border-radius:14px;padding:22px 24px;margin:20px 0">
  <p style="font-size:11px;font-weight:900;letter-spacing:0.08em;color:#8a9e78;margin:0 0 8px">OVERALL WINNER</p>
  <p style="font-size:20px;font-weight:900;color:#8fff00;margin:0 0 10px">[Option A / Option B]</p>
  <p style="font-size:14px;color:rgba(255,255,255,0.7);margin:0;line-height:1.7">[2-3 sentences. For most eBay sellers, [winner] is the better choice because [specific reason with data or example]. However, if [specific condition], [other option] is worth considering instead.]</p>
</div>

[CTA:free]

:::faq
Q: Can I use both [Option A] and [Option B] at the same time?
A: [Answer — when does it make sense to combine them, and when is it overkill?]

Q: Is there a free version of either?
A: [Answer — free plans, free trials, or free tiers for each option]

Q: Which is better for beginner eBay sellers?
A: [Answer — which has the shorter learning curve and why]

Q: Which has better customer support?
A: [Answer based on your experience testing both]

Q: If prices change, how does that affect the recommendation?
A: [Answer — which option becomes more or less competitive at different price points]
:::

<p style="font-size:12px;color:#8a9e78;border-top:1px solid #e8ede2;padding-top:14px;margin-top:24px;line-height:1.7"><em>Last updated <strong>[Month Year]</strong>. Pricing and features are verified at time of publication. Always check each product's website for the most current information before purchasing.</em></p>`
  },

  // ── 5. LISTICLE ──────────────────────────────────────────────────────────
  {
    id:          'listicle',
    name:        'Listicle (Top 10)',
    description: 'Premium ranked list with dark stats bar, scoring table, card-style items with metadata, editor pick badge, and final verdict.',
    icon:        Layers,
    color:       C.green,
    category:    'List',
    wordEstimate: '1,500–2,500 words',
    previewLines: ['Hero + reading time bar', 'Dark stats dashboard', 'Ranking criteria box', 'Scoring comparison table', 'Card-style ranked items', 'Editor pick badge', 'Final verdict'],
    defaultTitle: '10 Best [Things] for eBay Sellers in [Year] — Ranked and Reviewed',
    defaultMeta:  'The definitive ranking of the top 10 [things] for eBay sellers in [year]. Scored on [criteria 1], [criteria 2], and [criteria 3]. Find the right pick for your selling style.',
    html: `${IMG.hero('Top 10 [Things] for eBay Sellers — [Year] Definitive Ranking')}

<div style="display:flex;align-items:center;gap:16px;padding:12px 16px;background:#f7f9f5;border-radius:10px;margin:16px 0;flex-wrap:wrap">
  <span style="font-size:12px;color:#8a9e78">⏱ <strong>[X] min read</strong></span>
  <span style="color:#e8ede2">|</span>
  <span style="font-size:12px;color:#8a9e78">🧪 <strong>[X]</strong> options tested</span>
  <span style="color:#e8ede2">|</span>
  <span style="font-size:12px;color:#8a9e78">✍️ By <strong>[Author Name]</strong></span>
  <span style="color:#e8ede2">|</span>
  <span style="font-size:12px;color:#8a9e78">📅 Updated: <strong>[Month Year]</strong></span>
</div>

<h1>10 Best [Things] for eBay Sellers in [Year] — Ranked and Reviewed</h1>

<p style="font-size:17px;line-height:1.8;color:#3a4a32;margin:0 0 20px">We tested <strong>[X] different [things]</strong> and ranked the top 10 based on real eBay selling scenarios. Whether you are a part-time seller or scaling to six figures, there is a right pick on this list for you.</p>

<div style="background:#1a2410;border-radius:16px;padding:22px 24px;margin:24px 0;display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px">
  <div style="text-align:center;padding:14px 10px;background:rgba(255,255,255,0.05);border-radius:10px">
    <p style="font-size:28px;font-weight:900;color:#8fff00;margin:0;line-height:1">[X]</p>
    <p style="font-size:11px;color:rgba(255,255,255,0.4);margin:6px 0 0;font-weight:700;text-transform:uppercase;letter-spacing:0.05em">Options tested</p>
  </div>
  <div style="text-align:center;padding:14px 10px;background:rgba(255,255,255,0.05);border-radius:10px">
    <p style="font-size:28px;font-weight:900;color:#8fff00;margin:0;line-height:1">[X] hrs</p>
    <p style="font-size:11px;color:rgba(255,255,255,0.4);margin:6px 0 0;font-weight:700;text-transform:uppercase;letter-spacing:0.05em">Research time</p>
  </div>
  <div style="text-align:center;padding:14px 10px;background:rgba(255,255,255,0.05);border-radius:10px">
    <p style="font-size:28px;font-weight:900;color:#8fff00;margin:0;line-height:1">[Month]</p>
    <p style="font-size:11px;color:rgba(255,255,255,0.4);margin:6px 0 0;font-weight:700;text-transform:uppercase;letter-spacing:0.05em">Last updated</p>
  </div>
</div>

<div style="background:#f4ffe6;border:1px solid rgba(74,143,0,0.3);border-radius:12px;padding:16px 20px;margin:20px 0">
  <p style="font-size:12px;font-weight:900;letter-spacing:0.08em;color:#4a8f00;margin:0 0 8px">HOW WE RANKED THESE</p>
  <p style="font-size:13px;color:#3a4a32;margin:0;line-height:1.7">Each [option] was scored on <strong>[criteria 1]</strong> (40%), <strong>[criteria 2]</strong> (35%), and <strong>[criteria 3]</strong> (25%). We tested each one for [X weeks] with real eBay selling scenarios across multiple categories.</p>
</div>

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<h2>Quick Comparison: All 10 at a Glance</h2>

<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <thead>
    <tr>
      <th style="border:1px solid #e8ede2;padding:10px 14px;background:#f7f9f5;font-size:11px;font-weight:900;text-align:left;color:#8a9e78;letter-spacing:0.04em">RANK</th>
      <th style="border:1px solid #e8ede2;padding:10px 14px;background:#f7f9f5;font-size:11px;font-weight:900;text-align:left;color:#8a9e78;letter-spacing:0.04em">NAME</th>
      <th style="border:1px solid #e8ede2;padding:10px 14px;background:#f7f9f5;font-size:11px;font-weight:900;text-align:left;color:#8a9e78;letter-spacing:0.04em">BEST FOR</th>
      <th style="border:1px solid #e8ede2;padding:10px 14px;background:#f7f9f5;font-size:11px;font-weight:900;text-align:center;color:#8a9e78;letter-spacing:0.04em">PRICE</th>
      <th style="border:1px solid #e8ede2;padding:10px 14px;background:#f7f9f5;font-size:11px;font-weight:900;text-align:center;color:#8a9e78;letter-spacing:0.04em">SCORE</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background:#f4ffe6">
      <td style="border:1px solid #e8ede2;padding:10px 14px;font-size:13px;font-weight:900;color:#4a8f00">#1</td>
      <td style="border:1px solid #e8ede2;padding:10px 14px;font-size:13px;font-weight:800">[Name] ⭐</td>
      <td style="border:1px solid #e8ede2;padding:10px 14px;font-size:12px">[Use case]</td>
      <td style="border:1px solid #e8ede2;padding:10px 14px;font-size:13px;text-align:center;font-weight:700">$[X]</td>
      <td style="border:1px solid #e8ede2;padding:10px 14px;font-size:12px;text-align:center;color:#4a8f00;font-weight:900">9.5/10</td>
    </tr>
    <tr>
      <td style="border:1px solid #e8ede2;padding:10px 14px;font-size:13px;font-weight:700">#2</td>
      <td style="border:1px solid #e8ede2;padding:10px 14px;font-size:13px">[Name]</td>
      <td style="border:1px solid #e8ede2;padding:10px 14px;font-size:12px">[Use case]</td>
      <td style="border:1px solid #e8ede2;padding:10px 14px;font-size:13px;text-align:center;font-weight:700">$[X]</td>
      <td style="border:1px solid #e8ede2;padding:10px 14px;font-size:12px;text-align:center">9.0/10</td>
    </tr>
    <tr style="background:#f7f9f5">
      <td style="border:1px solid #e8ede2;padding:10px 14px;font-size:13px;font-weight:700">#3</td>
      <td style="border:1px solid #e8ede2;padding:10px 14px;font-size:13px">[Name]</td>
      <td style="border:1px solid #e8ede2;padding:10px 14px;font-size:12px">[Use case]</td>
      <td style="border:1px solid #e8ede2;padding:10px 14px;font-size:13px;text-align:center;font-weight:700">$[X]</td>
      <td style="border:1px solid #e8ede2;padding:10px 14px;font-size:12px;text-align:center">8.5/10</td>
    </tr>
    <tr>
      <td style="border:1px solid #e8ede2;padding:10px 14px;font-size:12px;color:#8a9e78">#4–#10</td>
      <td colspan="4" style="border:1px solid #e8ede2;padding:10px 14px;font-size:12px;color:#8a9e78">Full reviews below ↓</td>
    </tr>
  </tbody>
</table>

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<div style="border:2px solid #8fff00;border-radius:16px;overflow:hidden;margin:24px 0">
  <div style="background:#1a2410;padding:14px 20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px">
    <div style="display:flex;align-items:center;gap:10px">
      <span style="background:#8fff00;color:#1a2410;font-size:11px;font-weight:900;padding:3px 10px;border-radius:20px">EDITOR PICK — #1</span>
      <span style="color:#fff;font-size:16px;font-weight:900">[Name] — [Tagline]</span>
    </div>
    <span style="color:#8fff00;font-size:13px;font-weight:900">9.5/10</span>
  </div>
  <div style="padding:18px 20px;background:#f4ffe6">
    ${IMG.inline('#1 Pick — [Name] interface or product photo')}
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:14px">
      <div style="text-align:center;padding:10px;background:#fff;border-radius:10px;border:1px solid rgba(74,143,0,0.2)">
        <p style="font-size:11px;font-weight:900;color:#4a8f00;margin:0 0 3px;text-transform:uppercase;letter-spacing:0.04em">Best For</p>
        <p style="font-size:12px;font-weight:700;color:#1a2410;margin:0">[Type]</p>
      </div>
      <div style="text-align:center;padding:10px;background:#fff;border-radius:10px;border:1px solid rgba(74,143,0,0.2)">
        <p style="font-size:11px;font-weight:900;color:#4a8f00;margin:0 0 3px;text-transform:uppercase;letter-spacing:0.04em">Price</p>
        <p style="font-size:12px;font-weight:700;color:#1a2410;margin:0">$[X]/mo</p>
      </div>
      <div style="text-align:center;padding:10px;background:#fff;border-radius:10px;border:1px solid rgba(74,143,0,0.2)">
        <p style="font-size:11px;font-weight:900;color:#4a8f00;margin:0 0 3px;text-transform:uppercase;letter-spacing:0.04em">Key Feature</p>
        <p style="font-size:12px;font-weight:700;color:#1a2410;margin:0">[Feature]</p>
      </div>
    </div>
    <p style="font-size:14px;line-height:1.7;color:#1a2410;margin:0">[Why it is #1. Be specific — what makes it genuinely the best? Include a real example or data point.]</p>
  </div>
</div>

<div style="border:1px solid #e8ede2;border-radius:14px;overflow:hidden;margin:16px 0">
  <div style="background:#f7f9f5;padding:12px 20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
    <div style="display:flex;align-items:center;gap:8px">
      <span style="background:#1a2410;color:#8fff00;font-size:11px;font-weight:900;padding:2px 8px;border-radius:20px">#2</span>
      <span style="color:#1a2410;font-size:15px;font-weight:800">[Name] — [Tagline]</span>
    </div>
    <span style="color:#8a9e78;font-size:12px;font-weight:700">9.0/10</span>
  </div>
  <div style="padding:16px 20px">
    <div style="display:flex;gap:16px;margin-bottom:10px;flex-wrap:wrap">
      <span style="font-size:12px;color:#8a9e78"><strong style="color:#1a2410">Best for:</strong> [Type]</span>
      <span style="font-size:12px;color:#8a9e78"><strong style="color:#1a2410">Price:</strong> $[X]/mo</span>
      <span style="font-size:12px;color:#8a9e78"><strong style="color:#1a2410">Key feature:</strong> [Feature]</span>
    </div>
    <p style="font-size:13px;line-height:1.7;color:#3a4a32;margin:0">[Description. Explain what makes this #2 and not #1 — be honest about the gap.]</p>
  </div>
</div>

<div style="border:1px solid #e8ede2;border-radius:14px;overflow:hidden;margin:16px 0">
  <div style="background:#f7f9f5;padding:12px 20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
    <div style="display:flex;align-items:center;gap:8px">
      <span style="background:#1a2410;color:#8fff00;font-size:11px;font-weight:900;padding:2px 8px;border-radius:20px">#3</span>
      <span style="color:#1a2410;font-size:15px;font-weight:800">[Name] — [Tagline]</span>
    </div>
    <span style="color:#8a9e78;font-size:12px;font-weight:700">8.5/10</span>
  </div>
  <div style="padding:16px 20px">
    <div style="display:flex;gap:16px;margin-bottom:10px;flex-wrap:wrap">
      <span style="font-size:12px;color:#8a9e78"><strong style="color:#1a2410">Best for:</strong> [Type]</span>
      <span style="font-size:12px;color:#8a9e78"><strong style="color:#1a2410">Price:</strong> $[X]/mo</span>
    </div>
    <p style="font-size:13px;line-height:1.7;color:#3a4a32;margin:0">[Description.]</p>
  </div>
</div>

<div style="border:1px solid #e8ede2;border-radius:14px;overflow:hidden;margin:16px 0">
  <div style="background:#f7f9f5;padding:12px 20px;display:flex;align-items:center;justify-content:space-between"><div style="display:flex;align-items:center;gap:8px"><span style="background:#1a2410;color:#8fff00;font-size:11px;font-weight:900;padding:2px 8px;border-radius:20px">#4</span><span style="color:#1a2410;font-size:15px;font-weight:800">[Name]</span></div><span style="color:#8a9e78;font-size:12px;font-weight:700">8.0/10</span></div>
  <div style="padding:14px 20px"><p style="font-size:13px;line-height:1.7;color:#3a4a32;margin:0">[Description. Best for: [type] · Price: $[X]/mo]</p></div>
</div>

<div style="border:1px solid #e8ede2;border-radius:14px;overflow:hidden;margin:16px 0">
  <div style="background:#f7f9f5;padding:12px 20px;display:flex;align-items:center;justify-content:space-between"><div style="display:flex;align-items:center;gap:8px"><span style="background:#1a2410;color:#8fff00;font-size:11px;font-weight:900;padding:2px 8px;border-radius:20px">#5</span><span style="color:#1a2410;font-size:15px;font-weight:800">[Name]</span></div><span style="color:#8a9e78;font-size:12px;font-weight:700">7.5/10</span></div>
  <div style="padding:14px 20px"><p style="font-size:13px;line-height:1.7;color:#3a4a32;margin:0">[Description.]</p></div>
</div>

<h2>#6 Through #10</h2>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0">
  <div style="background:#f7f9f5;border:1px solid #e8ede2;border-radius:12px;padding:14px">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span style="background:#1a2410;color:#8fff00;font-size:10px;font-weight:900;padding:2px 7px;border-radius:20px">#6</span><span style="font-size:14px;font-weight:700;color:#1a2410">[Name]</span></div>
    <p style="font-size:12px;color:#8a9e78;margin:0;line-height:1.6">[One line description. Best for: [type]]</p>
  </div>
  <div style="background:#f7f9f5;border:1px solid #e8ede2;border-radius:12px;padding:14px">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span style="background:#1a2410;color:#8fff00;font-size:10px;font-weight:900;padding:2px 7px;border-radius:20px">#7</span><span style="font-size:14px;font-weight:700;color:#1a2410">[Name]</span></div>
    <p style="font-size:12px;color:#8a9e78;margin:0;line-height:1.6">[One line description.]</p>
  </div>
  <div style="background:#f7f9f5;border:1px solid #e8ede2;border-radius:12px;padding:14px">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span style="background:#1a2410;color:#8fff00;font-size:10px;font-weight:900;padding:2px 7px;border-radius:20px">#8</span><span style="font-size:14px;font-weight:700;color:#1a2410">[Name]</span></div>
    <p style="font-size:12px;color:#8a9e78;margin:0;line-height:1.6">[One line description.]</p>
  </div>
  <div style="background:#f7f9f5;border:1px solid #e8ede2;border-radius:12px;padding:14px">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span style="background:#1a2410;color:#8fff00;font-size:10px;font-weight:900;padding:2px 7px;border-radius:20px">#9</span><span style="font-size:14px;font-weight:700;color:#1a2410">[Name]</span></div>
    <p style="font-size:12px;color:#8a9e78;margin:0;line-height:1.6">[One line description.]</p>
  </div>
</div>
<div style="background:#f7f9f5;border:1px solid #e8ede2;border-radius:12px;padding:14px;margin-bottom:16px">
  <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span style="background:#1a2410;color:#8fff00;font-size:10px;font-weight:900;padding:2px 7px;border-radius:20px">#10</span><span style="font-size:14px;font-weight:700;color:#1a2410">[Name]</span></div>
  <p style="font-size:12px;color:#8a9e78;margin:0;line-height:1.6">[One line description.]</p>
</div>

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<h2>The Bottom Line</h2>

<div style="background:#1a2410;border-radius:14px;padding:20px 24px;margin:16px 0">
  <p style="font-size:11px;font-weight:900;letter-spacing:0.08em;color:#8a9e78;margin:0 0 8px">OUR TOP PICKS</p>
  <p style="font-size:14px;color:rgba(255,255,255,0.8);margin:0 0 8px;line-height:1.7"><strong style="color:#8fff00">Best overall:</strong> [#1 Name] — [specific reason with data]</p>
  <p style="font-size:14px;color:rgba(255,255,255,0.8);margin:0 0 8px;line-height:1.7"><strong style="color:#8fff00">Best budget pick:</strong> [Name] — [reason it punches above its price]</p>
  <p style="font-size:14px;color:rgba(255,255,255,0.8);margin:0;line-height:1.7"><strong style="color:#8fff00">Best for [specific need]:</strong> [Name] — [reason]</p>
</div>

[CTA:starter]

<p style="font-size:12px;color:#8a9e78;border-top:1px solid #e8ede2;padding-top:14px;margin-top:24px;line-height:1.7"><em>Last updated <strong>[Month Year]</strong>. Prices and features verified at time of publication. We update this list quarterly.</em></p>`
  },

  // ── 6. CASE STUDY ────────────────────────────────────────────────────────
  {
    id:          'case-study',
    name:        'Case Study',
    description: 'Premium story format with dark seller profile card, metrics dashboard, solution timeline, results grid, pull quote, and takeaway cards.',
    icon:        TrendingUp,
    color:       C.green,
    category:    'Case Study',
    wordEstimate: '1,000–1,800 words',
    previewLines: ['Hero + reading bar', 'Dark seller profile card', 'Challenge with pull quote', 'Solution timeline', 'Before/after images', 'Dark metrics grid', 'Testimonial pull quote', 'Takeaway cards'],
    defaultTitle: 'How [Seller Name] [Achieved Result] in [Timeframe] — eBay Success Story',
    defaultMeta:  'Real case study: how [seller] went from [before state] to [after state] in [timeframe]. The exact steps, numbers, and lessons learned.',
    html: `${IMG.hero('Case Study — [Seller Name] eBay Success Story')}

<div style="display:flex;align-items:center;gap:16px;padding:12px 16px;background:#f7f9f5;border-radius:10px;margin:16px 0;flex-wrap:wrap">
  <span style="font-size:12px;color:#8a9e78">⏱ <strong>[X] min read</strong></span>
  <span style="color:#e8ede2">|</span>
  <span style="font-size:12px;color:#8a9e78">📅 Published: <strong>[Month Year]</strong></span>
  <span style="color:#e8ede2">|</span>
  <span style="font-size:12px;color:#8a9e78">✍️ By <strong>[Author Name]</strong></span>
</div>

<h1>How [Seller Name] [Achieved Result] in [Timeframe] — eBay Success Story</h1>

<p style="font-size:17px;line-height:1.8;color:#3a4a32;margin:0 0 20px"><strong>[Seller Name]</strong> was [situation before — be specific]. Today, [current situation with a specific number]. This is the exact story of how that transformation happened, and what you can take from it.</p>

<div style="background:#1a2410;border-radius:16px;padding:24px;margin:24px 0">
  <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px">
    <div style="width:56px;height:56px;border-radius:50%;background:rgba(143,255,0,0.1);border:2px solid rgba(143,255,0,0.3);display:flex;align-items:center;justify-content:center;flex-shrink:0">
      <svg width="24" height="24" fill="none" stroke="#8fff00" stroke-width="1.5" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    </div>
    <div>
      <p style="color:#fff;font-size:17px;font-weight:900;margin:0">[Seller Name]</p>
      <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:3px 0 0">[City, Country] · eBay seller since [Year] · [Category]</p>
    </div>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
    <div style="text-align:center;padding:14px 10px;background:rgba(255,255,255,0.06);border-radius:10px">
      <p style="font-size:22px;font-weight:900;color:rgba(255,255,255,0.3);margin:0;line-height:1;text-decoration:line-through">[Before]</p>
      <p style="font-size:11px;color:rgba(255,255,255,0.4);margin:4px 0;font-weight:700;text-transform:uppercase;letter-spacing:0.04em">Revenue Before</p>
    </div>
    <div style="text-align:center;padding:14px 10px;background:rgba(143,255,0,0.1);border-radius:10px;border:1px solid rgba(143,255,0,0.2)">
      <p style="font-size:22px;font-weight:900;color:#8fff00;margin:0;line-height:1">[After]</p>
      <p style="font-size:11px;color:rgba(255,255,255,0.4);margin:4px 0;font-weight:700;text-transform:uppercase;letter-spacing:0.04em">Revenue After</p>
    </div>
    <div style="text-align:center;padding:14px 10px;background:rgba(255,255,255,0.06);border-radius:10px">
      <p style="font-size:22px;font-weight:900;color:#8fff00;margin:0;line-height:1">[X]</p>
      <p style="font-size:11px;color:rgba(255,255,255,0.4);margin:4px 0;font-weight:700;text-transform:uppercase;letter-spacing:0.04em">Timeframe</p>
    </div>
  </div>
</div>

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<h2>The Challenge</h2>

<p>[Seller Name] had been selling on eBay for [time] but was stuck. The core problem was [specific problem with context — be concrete, use numbers]. Despite trying [common solution], [consequence continued].</p>

<p style="font-size:18px;font-style:italic;border-left:4px solid rgba(143,255,0,0.5);padding:14px 20px;margin:20px 0;color:#3a4a32;background:#f7f9f5;border-radius:0 12px 12px 0;line-height:1.7">"[Quote from seller describing the frustration in their own words. Make it honest and specific — not generic.]"</p>

<p>The root cause was <strong>[underlying problem]</strong>. Without addressing this directly, [consequence] would have continued indefinitely.</p>

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<h2>The Solution</h2>

<p>The turning point came when [seller] [discovered/tried/implemented] [solution]. Here is exactly what changed, in order:</p>

<div style="display:flex;flex-direction:column;gap:0;margin:20px 0;position:relative">
  <div style="position:absolute;left:17px;top:20px;bottom:20px;width:2px;background:linear-gradient(to bottom,#8fff00,rgba(143,255,0,0.1))"></div>
  <div style="display:flex;gap:14px;padding-bottom:20px;position:relative">
    <div style="width:36px;height:36px;border-radius:50%;background:#8fff00;color:#1a2410;font-weight:900;font-size:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;z-index:1">1</div>
    <div style="padding-top:6px">
      <p style="font-size:15px;font-weight:800;color:#1a2410;margin:0 0 5px">[First action they took]</p>
      <p style="font-size:13px;color:#8a9e78;margin:0;line-height:1.7">[What this looked like in practice and the immediate result it produced.]</p>
    </div>
  </div>
  <div style="display:flex;gap:14px;padding-bottom:20px;position:relative">
    <div style="width:36px;height:36px;border-radius:50%;background:#8fff00;color:#1a2410;font-weight:900;font-size:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;z-index:1">2</div>
    <div style="padding-top:6px">
      <p style="font-size:15px;font-weight:800;color:#1a2410;margin:0 0 5px">[Second action]</p>
      <p style="font-size:13px;color:#8a9e78;margin:0;line-height:1.7">[Explanation and impact.]</p>
    </div>
  </div>
  <div style="display:flex;gap:14px;position:relative">
    <div style="width:36px;height:36px;border-radius:50%;background:#1a2410;color:#8fff00;font-weight:900;font-size:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;z-index:1">3</div>
    <div style="padding-top:6px">
      <p style="font-size:15px;font-weight:800;color:#1a2410;margin:0 0 5px">[The pivotal action — the one that changed everything]</p>
      <p style="font-size:13px;color:#8a9e78;margin:0;line-height:1.7">[This should be the most detailed step. What did they do, how, and what was the measurable outcome?]</p>
    </div>
  </div>
</div>

:::info
Key Insight: [The most important lesson from this case study — the single insight that made the biggest difference. This is what readers should walk away remembering.]
:::

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<h2>The Results</h2>

${IMG.double('Before — [Metric] at [old number]', 'After — [Metric] at [new number]')}

<div style="background:#1a2410;border-radius:16px;padding:22px 24px;margin:20px 0">
  <p style="font-size:12px;font-weight:900;letter-spacing:0.08em;color:#8fff00;margin:0 0 16px">KEY METRICS</p>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
    <div style="background:rgba(255,255,255,0.05);border-radius:10px;padding:14px">
      <p style="font-size:11px;color:rgba(255,255,255,0.4);margin:0 0 4px;font-weight:700;text-transform:uppercase">[METRIC 1]</p>
      <p style="font-size:13px;color:rgba(255,255,255,0.35);margin:0 0 4px;text-decoration:line-through">[Before value]</p>
      <p style="font-size:22px;font-weight:900;color:#8fff00;margin:0;line-height:1">[After value]</p>
    </div>
    <div style="background:rgba(255,255,255,0.05);border-radius:10px;padding:14px">
      <p style="font-size:11px;color:rgba(255,255,255,0.4);margin:0 0 4px;font-weight:700;text-transform:uppercase">[METRIC 2]</p>
      <p style="font-size:13px;color:rgba(255,255,255,0.35);margin:0 0 4px;text-decoration:line-through">[Before value]</p>
      <p style="font-size:22px;font-weight:900;color:#8fff00;margin:0;line-height:1">[After value]</p>
    </div>
    <div style="background:rgba(255,255,255,0.05);border-radius:10px;padding:14px">
      <p style="font-size:11px;color:rgba(255,255,255,0.4);margin:0 0 4px;font-weight:700;text-transform:uppercase">[METRIC 3]</p>
      <p style="font-size:13px;color:rgba(255,255,255,0.35);margin:0 0 4px;text-decoration:line-through">[Before value]</p>
      <p style="font-size:22px;font-weight:900;color:#8fff00;margin:0;line-height:1">[After value]</p>
    </div>
    <div style="background:rgba(255,255,255,0.05);border-radius:10px;padding:14px">
      <p style="font-size:11px;color:rgba(255,255,255,0.4);margin:0 0 4px;font-weight:700;text-transform:uppercase">[METRIC 4]</p>
      <p style="font-size:13px;color:rgba(255,255,255,0.35);margin:0 0 4px;text-decoration:line-through">[Before value]</p>
      <p style="font-size:22px;font-weight:900;color:#8fff00;margin:0;line-height:1">[After value]</p>
    </div>
  </div>
</div>

<p style="font-size:19px;font-style:italic;color:#1a2410;line-height:1.6;margin:24px 0;padding:20px 24px;background:#f4ffe6;border-radius:16px;border:1px solid rgba(143,255,0,0.2)">"[Testimonial quote — the most specific, emotional, and powerful thing the seller said about their results. Include a number if possible.]" — <strong>[Seller Name]</strong></p>

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<h2>What You Can Apply to Your Business</h2>

<p>You do not need to be in [seller's exact situation] to get similar results. Here are three things you can apply today:</p>

<div style="display:flex;flex-direction:column;gap:10px;margin:16px 0">
  <div style="display:flex;gap:12px;align-items:flex-start;padding:16px;background:#f7f9f5;border:1px solid #e8ede2;border-radius:12px">
    <div style="width:28px;height:28px;border-radius:50%;background:#8fff00;color:#1a2410;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:13px">1</div>
    <div><p style="font-size:14px;font-weight:700;color:#1a2410;margin:0 0 4px">[Takeaway 1 — make it specific and actionable]</p><p style="font-size:13px;color:#8a9e78;margin:0;line-height:1.6">[Brief explanation of how to apply this.]</p></div>
  </div>
  <div style="display:flex;gap:12px;align-items:flex-start;padding:16px;background:#f7f9f5;border:1px solid #e8ede2;border-radius:12px">
    <div style="width:28px;height:28px;border-radius:50%;background:#8fff00;color:#1a2410;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:13px">2</div>
    <div><p style="font-size:14px;font-weight:700;color:#1a2410;margin:0 0 4px">[Takeaway 2]</p><p style="font-size:13px;color:#8a9e78;margin:0;line-height:1.6">[Explanation.]</p></div>
  </div>
  <div style="display:flex;gap:12px;align-items:flex-start;padding:16px;background:#f4ffe6;border:1px solid rgba(143,255,0,0.2);border-radius:12px">
    <div style="width:28px;height:28px;border-radius:50%;background:#1a2410;color:#8fff00;font-weight:900;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:13px">3</div>
    <div><p style="font-size:14px;font-weight:700;color:#1a2410;margin:0 0 4px">[Takeaway 3 — save the most impactful for last]</p><p style="font-size:13px;color:#4a8f00;margin:0;line-height:1.6">[Explanation.]</p></div>
  </div>
</div>

[CTA:free]`
  },

  // ── 7. NEWS / ANNOUNCEMENT ───────────────────────────────────────────────
  {
    id:          'news',
    name:        'News / Announcement',
    description: 'Premium breaking news format with urgency alert, stats bar, old vs new table, impact by seller type, action step cards, and FAQ.',
    icon:        Megaphone,
    color:       C.red,
    category:    'News',
    wordEstimate: '600–1,200 words',
    previewLines: ['Red urgency alert banner', 'Reading time bar', 'Stats dashboard', 'Old vs new table', 'Impact by seller type', 'Numbered action cards', 'FAQ + last updated'],
    defaultTitle: 'eBay [Policy/Feature] Update [Month Year]: What Sellers Must Do Now',
    defaultMeta:  'eBay just updated [policy/feature]. Here is exactly what changed, who is affected, and the action steps every seller must take before [deadline].',
    html: `<div style="background:#b91c1c;border-radius:14px;padding:14px 20px;margin:0 0 20px;display:flex;align-items:center;gap:12px">
  <svg width="20" height="20" fill="none" stroke="#fff" stroke-width="2" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
  <div>
    <p style="color:rgba(255,255,255,0.7);font-size:11px;font-weight:900;letter-spacing:0.1em;margin:0 0 2px">ACTION REQUIRED</p>
    <p style="color:#fff;font-size:14px;font-weight:800;margin:0">This change takes effect <strong>[Date]</strong>. Sellers must act before then.</p>
  </div>
</div>

${IMG.hero('Breaking: eBay [Policy/Feature] Update — [Month Year]')}

<div style="display:flex;align-items:center;gap:16px;padding:12px 16px;background:#f7f9f5;border-radius:10px;margin:16px 0;flex-wrap:wrap">
  <span style="font-size:12px;color:#8a9e78">⏱ <strong>[X] min read</strong></span>
  <span style="color:#e8ede2">|</span>
  <span style="font-size:12px;color:#8a9e78">📅 Published: <strong>[Date]</strong></span>
  <span style="color:#e8ede2">|</span>
  <span style="font-size:12px;color:#8a9e78">✍️ By <strong>[Author Name]</strong></span>
</div>

<h1>eBay [Policy/Feature] Update [Month Year]: What Sellers Must Do Now</h1>

<p style="font-size:17px;line-height:1.8;color:#3a4a32;margin:0 0 20px"><strong>[Date]</strong> — eBay has just updated <strong>[Policy/Feature]</strong>. This affects [who] and takes effect <strong>[when]</strong>. Here is everything you need to know and exactly what to do.</p>

<div style="background:#1a2410;border-radius:14px;padding:20px 24px;margin:20px 0;display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px">
  <div style="text-align:center;padding:14px 10px;background:rgba(255,255,255,0.05);border-radius:10px">
    <p style="font-size:22px;font-weight:900;color:#8fff00;margin:0;line-height:1">[Date]</p>
    <p style="font-size:11px;color:rgba(255,255,255,0.4);margin:6px 0 0;font-weight:700;text-transform:uppercase;letter-spacing:0.05em">Effective date</p>
  </div>
  <div style="text-align:center;padding:14px 10px;background:rgba(255,255,255,0.05);border-radius:10px">
    <p style="font-size:22px;font-weight:900;color:#b91c1c;margin:0;line-height:1">[X]%</p>
    <p style="font-size:11px;color:rgba(255,255,255,0.4);margin:6px 0 0;font-weight:700;text-transform:uppercase;letter-spacing:0.05em">Sellers affected</p>
  </div>
  <div style="text-align:center;padding:14px 10px;background:rgba(255,255,255,0.05);border-radius:10px">
    <p style="font-size:22px;font-weight:900;color:#8fff00;margin:0;line-height:1">[X]</p>
    <p style="font-size:11px;color:rgba(255,255,255,0.4);margin:6px 0 0;font-weight:700;text-transform:uppercase;letter-spacing:0.05em">Actions required</p>
  </div>
</div>

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<h2>What Changed: Old vs New</h2>

<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <thead>
    <tr>
      <th style="border:1px solid #e8ede2;padding:12px 16px;background:#FEF2F2;color:#b91c1c;text-align:left;font-size:12px;font-weight:900;letter-spacing:0.04em">OLD POLICY (Before [Date])</th>
      <th style="border:1px solid #e8ede2;padding:12px 16px;background:#f4ffe6;color:#4a8f00;text-align:left;font-size:12px;font-weight:900;letter-spacing:0.04em">NEW POLICY (After [Date])</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #e8ede2;padding:12px 16px;font-size:13px;vertical-align:top;color:#8a9e78">[Old rule 1 — describe exactly how it worked before]</td>
      <td style="border:1px solid #e8ede2;padding:12px 16px;font-size:13px;vertical-align:top;font-weight:700;color:#1a2410">[New rule 1 — describe the change precisely]</td>
    </tr>
    <tr style="background:#f7f9f5">
      <td style="border:1px solid #e8ede2;padding:12px 16px;font-size:13px;vertical-align:top;color:#8a9e78">[Old rule 2]</td>
      <td style="border:1px solid #e8ede2;padding:12px 16px;font-size:13px;vertical-align:top;font-weight:700;color:#1a2410">[New rule 2]</td>
    </tr>
    <tr>
      <td style="border:1px solid #e8ede2;padding:12px 16px;font-size:13px;vertical-align:top;color:#8a9e78">[Unchanged rule]</td>
      <td style="border:1px solid #e8ede2;padding:12px 16px;font-size:13px;vertical-align:top;color:#8a9e78">No change</td>
    </tr>
  </tbody>
</table>

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<h2>How This Affects You</h2>

<div style="display:flex;flex-direction:column;gap:10px;margin:16px 0">
  <div style="padding:14px 18px;background:#FEF2F2;border-radius:12px;border-left:3px solid #b91c1c">
    <p style="font-size:12px;font-weight:900;color:#b91c1c;margin:0 0 4px;letter-spacing:0.06em">HIGH IMPACT</p>
    <p style="font-size:14px;color:#1a2410;margin:0;line-height:1.6">If you sell [category]: [specific impact with detail]</p>
  </div>
  <div style="padding:14px 18px;background:#fffbeb;border-radius:12px;border-left:3px solid #d97706">
    <p style="font-size:12px;font-weight:900;color:#d97706;margin:0 0 4px;letter-spacing:0.06em">MEDIUM IMPACT</p>
    <p style="font-size:14px;color:#1a2410;margin:0;line-height:1.6">If you are a [type of seller]: [impact]</p>
  </div>
  <div style="padding:14px 18px;background:#f4ffe6;border-radius:12px;border-left:3px solid #4a8f00">
    <p style="font-size:12px;font-weight:900;color:#4a8f00;margin:0 0 4px;letter-spacing:0.06em">NOT AFFECTED</p>
    <p style="font-size:14px;color:#1a2410;margin:0;line-height:1.6">If you only sell [type]: this change does not apply to you.</p>
  </div>
</div>

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<h2>What You Need to Do Right Now</h2>

<div style="display:flex;flex-direction:column;gap:12px;margin:20px 0">
  <div style="display:flex;gap:14px;align-items:flex-start;padding:16px;background:#f7f9f5;border:1px solid #e8ede2;border-radius:12px">
    <div style="width:32px;height:32px;border-radius:50%;background:#8fff00;color:#1a2410;font-weight:900;font-size:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0">1</div>
    <div><p style="font-size:14px;font-weight:800;color:#1a2410;margin:0 0 4px">[Immediate action — do this today]</p><p style="font-size:13px;color:#8a9e78;margin:0;line-height:1.6">[Specific instructions. Include exactly where to find it in eBay Seller Hub.]</p></div>
  </div>
  <div style="display:flex;gap:14px;align-items:flex-start;padding:16px;background:#f7f9f5;border:1px solid #e8ede2;border-radius:12px">
    <div style="width:32px;height:32px;border-radius:50%;background:#8fff00;color:#1a2410;font-weight:900;font-size:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0">2</div>
    <div><p style="font-size:14px;font-weight:800;color:#1a2410;margin:0 0 4px">[Next action]</p><p style="font-size:13px;color:#8a9e78;margin:0;line-height:1.6">[Instructions.]</p></div>
  </div>
  <div style="display:flex;gap:14px;align-items:flex-start;padding:16px;background:#f4ffe6;border:1px solid rgba(143,255,0,0.2);border-radius:12px">
    <div style="width:32px;height:32px;border-radius:50%;background:#1a2410;color:#8fff00;font-weight:900;font-size:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0">3</div>
    <div><p style="font-size:14px;font-weight:800;color:#1a2410;margin:0 0 4px">Verify compliance</p><p style="font-size:13px;color:#4a8f00;margin:0;line-height:1.6">[How to confirm you have done it correctly and where to check in Seller Hub.]</p></div>
  </div>
</div>

<h2>Our Take</h2>

<p>[Your honest analysis. This is what makes your article more valuable than the press release. Take a clear position — is this a good or bad change for sellers? What is the real-world impact?]</p>

:::faq
Q: Does this affect my existing listings?
A: [Direct answer — yes, no, or only if condition]

Q: What happens if I do not comply by [date]?
A: [Specific consequence from the policy — be exact, not vague]

Q: Is there an appeal or exception process?
A: [Answer]

Q: Where can I read the full official eBay policy?
A: [Link or where to find it in eBay Help]
:::

[CTA:free]

<p style="font-size:12px;color:#8a9e78;border-top:1px solid #e8ede2;padding-top:14px;margin-top:20px;line-height:1.7"><em>Last updated <strong>[Date]</strong>. We will update this article if eBay makes further changes. Bookmark this page for the latest information.</em></p>`
  },

  // ── 8. BEGINNER'S GUIDE ──────────────────────────────────────────────────
  {
    id:          'beginners-guide',
    name: "Beginner's Guide",
    description: 'Premium friendly tutorial with welcome banner, outcomes checklist, concept cards, step sequence, mistake cards, styled glossary, and roadmap grid.',
    icon:        HelpCircle,
    color:       C.limeDeep,
    category:    'Educational',
    wordEstimate: '1,500–2,500 words',
    previewLines: ['Dark welcome banner', 'Reading time bar', 'Outcomes checklist', 'Concept explanation cards', 'Numbered step sequence', 'Mistake cards', 'Styled glossary', 'Roadmap grid'],
    defaultTitle: '[Topic] for Beginners: The Complete [Year] Starter Guide',
    defaultMeta:  'New to [topic]? This beginner guide explains everything in plain English with real examples. No experience needed — start here.',
    html: `<div style="background:linear-gradient(135deg,#1a2410 0%,#2d4020 100%);border-radius:20px;padding:28px;margin:0 0 24px;text-align:center">
  <p style="color:#8fff00;font-size:11px;font-weight:900;letter-spacing:0.12em;margin:0 0 8px">COMPLETE BEGINNER GUIDE</p>
  <p style="color:#fff;font-size:22px;font-weight:900;margin:0 0 8px;line-height:1.3">[Topic] for Beginners</p>
  <p style="color:rgba(255,255,255,0.5);font-size:14px;margin:0">No experience needed. No jargon. Plain English with real examples.</p>
</div>

<div style="display:flex;align-items:center;gap:16px;padding:12px 16px;background:#f7f9f5;border-radius:10px;margin:16px 0;flex-wrap:wrap">
  <span style="font-size:12px;color:#8a9e78">⏱ <strong>[X] min read</strong></span>
  <span style="color:#e8ede2">|</span>
  <span style="font-size:12px;color:#8a9e78">📅 Updated: <strong>[Month Year]</strong></span>
  <span style="color:#e8ede2">|</span>
  <span style="font-size:12px;color:#8a9e78">✍️ By <strong>[Author Name]</strong></span>
</div>

<h1>[Topic] for Beginners: The Complete [Year] Starter Guide</h1>

<p style="font-size:17px;line-height:1.8;color:#3a4a32;margin:0 0 20px">If [topic] feels confusing right now, that is completely normal. This guide was written for complete beginners — everything from scratch, in plain English, with examples you can follow immediately.</p>

<div style="background:#f4ffe6;border:1px solid rgba(74,143,0,0.3);border-radius:14px;padding:18px 22px;margin:20px 0">
  <p style="font-size:12px;font-weight:900;letter-spacing:0.08em;color:#4a8f00;margin:0 0 12px">BY THE END OF THIS GUIDE YOU WILL KNOW HOW TO</p>
  <div style="display:flex;flex-direction:column;gap:8px">
    <div style="display:flex;gap:10px;align-items:center"><div style="width:20px;height:20px;border-radius:50%;background:#8fff00;display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="10" height="10" fill="none" stroke="#1a2410" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg></div><span style="font-size:13px;color:#1a2410">[Learning outcome 1]</span></div>
    <div style="display:flex;gap:10px;align-items:center"><div style="width:20px;height:20px;border-radius:50%;background:#8fff00;display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="10" height="10" fill="none" stroke="#1a2410" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg></div><span style="font-size:13px;color:#1a2410">[Learning outcome 2]</span></div>
    <div style="display:flex;gap:10px;align-items:center"><div style="width:20px;height:20px;border-radius:50%;background:#8fff00;display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="10" height="10" fill="none" stroke="#1a2410" stroke-width="2.5" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg></div><span style="font-size:13px;color:#1a2410">[Learning outcome 3]</span></div>
  </div>
</div>

${IMG.hero('[Topic] for Beginners — Visual Overview')}

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<h2>What is [Topic]? (Plain English Explanation)</h2>

<p>Think of [topic] like <strong>[simple analogy everyone understands]</strong>. Just as [analogy explanation], [topic] works by [simple mechanism].</p>

<p>In plain English: <strong>[one sentence definition that anyone could understand immediately]</strong>.</p>

<p>Here is a concrete example: [Specific relatable scenario a complete beginner would understand immediately — ideally involving a dollar amount or time savings].</p>

:::info
The Simplest Way to Think About It: [One sentence that makes the concept click. This is your "aha moment" for beginners.]
:::

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<h2>Why Does [Topic] Matter?</h2>

<p>You might be wondering if [topic] is really worth learning. Here is the honest answer: <strong>[direct yes/no and why]</strong>.</p>

<p>Sellers who understand [topic] from the start typically:</p>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:16px 0">
  <div style="padding:14px;background:#f7f9f5;border-radius:12px;border:1px solid #e8ede2"><p style="font-size:13px;font-weight:700;color:#1a2410;margin:0 0 4px">[Benefit 1]</p><p style="font-size:12px;color:#8a9e78;margin:0;line-height:1.5">[Specific concrete explanation]</p></div>
  <div style="padding:14px;background:#f7f9f5;border-radius:12px;border:1px solid #e8ede2"><p style="font-size:13px;font-weight:700;color:#1a2410;margin:0 0 4px">[Benefit 2]</p><p style="font-size:12px;color:#8a9e78;margin:0;line-height:1.5">[Explanation]</p></div>
  <div style="padding:14px;background:#f7f9f5;border-radius:12px;border:1px solid #e8ede2"><p style="font-size:13px;font-weight:700;color:#1a2410;margin:0 0 4px">[Benefit 3]</p><p style="font-size:12px;color:#8a9e78;margin:0;line-height:1.5">[Explanation]</p></div>
  <div style="padding:14px;background:#f7f9f5;border-radius:12px;border:1px solid #e8ede2"><p style="font-size:13px;font-weight:700;color:#1a2410;margin:0 0 4px">[Benefit 4]</p><p style="font-size:12px;color:#8a9e78;margin:0;line-height:1.5">[Explanation]</p></div>
</div>

:::warning
Beginner Mistake to Avoid: Most new sellers [do wrong thing] because they think [wrong assumption]. The reality is [correct understanding]. This single mistake costs beginners [time or money lost].
:::

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<h2>The Basics: Key Concepts Explained Simply</h2>

${IMG.inline('Visual overview of [Topic] basics — add a diagram or infographic here')}

<div style="display:flex;flex-direction:column;gap:12px;margin:20px 0">
  <div style="padding:16px;background:#f7f9f5;border:1px solid #e8ede2;border-radius:12px">
    <p style="font-size:15px;font-weight:800;color:#1a2410;margin:0 0 6px">[Basic Concept 1]</p>
    <p style="font-size:13px;line-height:1.7;color:#3a4a32;margin:0">[Simple explanation. Short sentences. No jargon. If you use a technical term, explain it in the same sentence.]</p>
  </div>
  <div style="padding:16px;background:#f7f9f5;border:1px solid #e8ede2;border-radius:12px">
    <p style="font-size:15px;font-weight:800;color:#1a2410;margin:0 0 6px">[Basic Concept 2]</p>
    <p style="font-size:13px;line-height:1.7;color:#3a4a32;margin:0">[Explanation.]</p>
  </div>
  <div style="padding:16px;background:#f7f9f5;border:1px solid #e8ede2;border-radius:12px">
    <p style="font-size:15px;font-weight:800;color:#1a2410;margin:0 0 6px">[Basic Concept 3]</p>
    <p style="font-size:13px;line-height:1.7;color:#3a4a32;margin:0">[Explanation.]</p>
  </div>
</div>

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<h2>Your First Steps: Getting Started Today</h2>

<div style="display:flex;flex-direction:column;gap:12px;margin:20px 0">
  <div style="display:flex;gap:14px;align-items:flex-start;padding:16px;background:#f7f9f5;border:1px solid #e8ede2;border-radius:12px">
    <div style="width:32px;height:32px;border-radius:50%;background:#1a2410;color:#8fff00;font-weight:900;font-size:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0">1</div>
    <div><p style="font-size:14px;font-weight:800;color:#1a2410;margin:0 0 4px">[The absolute first thing to do]</p><p style="font-size:13px;color:#8a9e78;margin:0;line-height:1.6">[Very simple instruction. Write as if guiding someone who has never done this before.]</p></div>
  </div>
  <div style="display:flex;gap:14px;align-items:flex-start;padding:16px;background:#f7f9f5;border:1px solid #e8ede2;border-radius:12px">
    <div style="width:32px;height:32px;border-radius:50%;background:#1a2410;color:#8fff00;font-weight:900;font-size:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0">2</div>
    <div><p style="font-size:14px;font-weight:800;color:#1a2410;margin:0 0 4px">[Second step]</p><p style="font-size:13px;color:#8a9e78;margin:0;line-height:1.6">[Simple instruction.]</p></div>
  </div>
  <div style="display:flex;gap:14px;align-items:flex-start;padding:16px;background:#f4ffe6;border:1px solid rgba(143,255,0,0.2);border-radius:12px">
    <div style="width:32px;height:32px;border-radius:50%;background:#8fff00;color:#1a2410;font-weight:900;font-size:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0">3</div>
    <div><p style="font-size:14px;font-weight:800;color:#1a2410;margin:0 0 4px">[Your quick win step]</p><p style="font-size:13px;color:#4a8f00;margin:0;line-height:1.6">After this step you should see [quick win result]. This is your first real success — it proves the concept works and builds momentum for everything that follows.</p></div>
  </div>
</div>

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<h2>Key Terms: Glossary for Beginners</h2>

<div style="display:flex;flex-direction:column;gap:8px;margin:16px 0">
  <div style="padding:12px 16px;background:#f7f9f5;border-radius:10px;border:1px solid #e8ede2"><span style="font-size:13px;font-weight:800;color:#1a2410">[Term 1]: </span><span style="font-size:13px;color:#8a9e78">[Plain English definition with a one-sentence example]</span></div>
  <div style="padding:12px 16px;background:#f7f9f5;border-radius:10px;border:1px solid #e8ede2"><span style="font-size:13px;font-weight:800;color:#1a2410">[Term 2]: </span><span style="font-size:13px;color:#8a9e78">[Definition]</span></div>
  <div style="padding:12px 16px;background:#f7f9f5;border-radius:10px;border:1px solid #e8ede2"><span style="font-size:13px;font-weight:800;color:#1a2410">[Term 3]: </span><span style="font-size:13px;color:#8a9e78">[Definition]</span></div>
  <div style="padding:12px 16px;background:#f7f9f5;border-radius:10px;border:1px solid #e8ede2"><span style="font-size:13px;font-weight:800;color:#1a2410">[Term 4]: </span><span style="font-size:13px;color:#8a9e78">[Definition]</span></div>
  <div style="padding:12px 16px;background:#f7f9f5;border-radius:10px;border:1px solid #e8ede2"><span style="font-size:13px;font-weight:800;color:#1a2410">[Term 5]: </span><span style="font-size:13px;color:#8a9e78">[Definition]</span></div>
</div>

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<h2>Your Growth Roadmap</h2>

<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin:16px 0">
  <div style="text-align:center;padding:18px 14px;background:#f7f9f5;border-radius:12px;border:1px solid #e8ede2">
    <p style="font-size:11px;font-weight:900;letter-spacing:0.06em;color:#8a9e78;margin:0 0 6px">WEEK 1</p>
    <p style="font-size:14px;font-weight:800;color:#1a2410;margin:0 0 6px">[Beginner milestone]</p>
    <p style="font-size:12px;color:#8a9e78;margin:0">[What this unlocks]</p>
  </div>
  <div style="text-align:center;padding:18px 14px;background:#f4ffe6;border-radius:12px;border:1px solid rgba(143,255,0,0.3)">
    <p style="font-size:11px;font-weight:900;letter-spacing:0.06em;color:#4a8f00;margin:0 0 6px">MONTH 1</p>
    <p style="font-size:14px;font-weight:800;color:#1a2410;margin:0 0 6px">[Intermediate milestone]</p>
    <p style="font-size:12px;color:#8a9e78;margin:0">[What this unlocks]</p>
  </div>
  <div style="text-align:center;padding:18px 14px;background:#1a2410;border-radius:12px">
    <p style="font-size:11px;font-weight:900;letter-spacing:0.06em;color:#8fff00;margin:0 0 6px">MONTH 3</p>
    <p style="font-size:14px;font-weight:800;color:#fff;margin:0 0 6px">[Advanced milestone]</p>
    <p style="font-size:12px;color:rgba(255,255,255,0.4);margin:0">[What this enables]</p>
  </div>
</div>

<p style="text-align:center;font-size:15px;color:#8a9e78;margin:20px 0;line-height:1.7">Remember: every expert was once exactly where you are now. The only difference is they took the first step — and you just did.</p>

[CTA:free]

:::faq
Q: How long will it take to learn [topic]?
A: Most beginners get comfortable with the basics in [timeframe]. You do not need to master everything — knowing [core skill] will get you [specific result]. The rest comes with practice.

Q: Do I need any special tools or software?
A: To get started, all you need is [minimum requirement]. Optional tools like [tool] can help later, but they are not necessary at the beginning.

Q: What if I make a mistake?
A: [Honest, reassuring answer. How recoverable is it? What specifically should they do if something goes wrong?]
:::

<p style="font-size:12px;color:#8a9e78;border-top:1px solid #e8ede2;padding-top:14px;margin-top:24px;line-height:1.7"><em>Last updated <strong>[Month Year]</strong>. This guide is reviewed quarterly to ensure all steps reflect current eBay features and policies.</em></p>`
  },

  // ── 9. PROBLEM → SOLUTION ────────────────────────────────────────────────
  {
    id:          'problem-solution',
    name:        'Problem → Solution',
    description: 'Premium agitate-diagnose-fix format with symptom checklist, why-fixes-fail cards, step cards, results stats, testimonial pull quote, and quick-reference summary.',
    icon:        Zap,
    color:       C.amber,
    category:    'Persuasive',
    wordEstimate: '1,000–1,800 words',
    previewLines: ['Hook + root cause reveal', 'Symptom checklist', 'Why fixes fail cards', 'Numbered fix step cards', 'Results stats dashboard', 'Testimonial pull quote', 'Quick reference summary'],
    defaultTitle: 'Why Your [Thing] Is Not Working — And the Exact Fix That Works',
    defaultMeta:  'Struggling with [problem]? Here is the real root cause — and the step-by-step fix that has helped [X]+ eBay sellers solve it permanently.',
    html: `${IMG.hero('Why Your [Thing] Is Not Working — And the Fix That Actually Works')}

<div style="display:flex;align-items:center;gap:16px;padding:12px 16px;background:#f7f9f5;border-radius:10px;margin:16px 0;flex-wrap:wrap">
  <span style="font-size:12px;color:#8a9e78">⏱ <strong>[X] min read</strong></span>
  <span style="color:#e8ede2">|</span>
  <span style="font-size:12px;color:#8a9e78">✍️ By <strong>[Author Name]</strong></span>
  <span style="color:#e8ede2">|</span>
  <span style="font-size:12px;color:#8a9e78">📅 Updated: <strong>[Month Year]</strong></span>
</div>

<h1>Why Your [Thing] Is Not Working — And the Exact Fix That Works</h1>

<p style="font-size:17px;line-height:1.8;color:#3a4a32;margin:0 0 20px">You have tried <strong>[common solution 1]</strong>. You have tried <strong>[common solution 2]</strong>. Nothing is working. Here is why — and the fix that actually solves it permanently.</p>

<div style="background:#fffbeb;border:2px solid #fde68a;border-radius:14px;padding:18px 22px;margin:20px 0">
  <p style="font-size:12px;font-weight:900;letter-spacing:0.08em;color:#d97706;margin:0 0 6px">THE REAL PROBLEM</p>
  <p style="font-size:16px;font-weight:800;color:#1a2410;margin:0;line-height:1.5">You are solving the wrong problem. The root cause is <strong>[root cause]</strong> — not [surface symptom that everyone focuses on].</p>
</div>

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<h2>Is This Your Problem? Check These Symptoms</h2>

<p>If you experience two or more of these, [root cause] is almost certainly what is happening:</p>

<div style="display:flex;flex-direction:column;gap:8px;margin:16px 0">
  <div style="display:flex;gap:10px;align-items:center;padding:12px 16px;background:#f7f9f5;border-radius:10px;border:1px solid #e8ede2">
    <div style="width:20px;height:20px;border-radius:4px;border:2px solid #d97706;background:#fffbeb;flex-shrink:0"></div>
    <span style="font-size:14px;color:#1a2410">[Symptom 1 — if the reader recognises this, they have this problem]</span>
  </div>
  <div style="display:flex;gap:10px;align-items:center;padding:12px 16px;background:#f7f9f5;border-radius:10px;border:1px solid #e8ede2">
    <div style="width:20px;height:20px;border-radius:4px;border:2px solid #d97706;background:#fffbeb;flex-shrink:0"></div>
    <span style="font-size:14px;color:#1a2410">[Symptom 2]</span>
  </div>
  <div style="display:flex;gap:10px;align-items:center;padding:12px 16px;background:#f7f9f5;border-radius:10px;border:1px solid #e8ede2">
    <div style="width:20px;height:20px;border-radius:4px;border:2px solid #d97706;background:#fffbeb;flex-shrink:0"></div>
    <span style="font-size:14px;color:#1a2410">[Symptom 3]</span>
  </div>
</div>

<h2>Why Common Fixes Do Not Work</h2>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0">
  <div style="background:#FEF2F2;border:1px solid #fecaca;border-radius:12px;padding:16px">
    <p style="font-size:11px;font-weight:900;color:#b91c1c;margin:0 0 6px;letter-spacing:0.06em">COMMON FIX 1</p>
    <p style="font-size:14px;font-weight:800;color:#1a2410;margin:0 0 6px">[What most people try]</p>
    <p style="font-size:12px;color:#8a9e78;margin:0;line-height:1.6">Why it fails: [specific reason it only treats the symptom, not the root cause]</p>
  </div>
  <div style="background:#FEF2F2;border:1px solid #fecaca;border-radius:12px;padding:16px">
    <p style="font-size:11px;font-weight:900;color:#b91c1c;margin:0 0 6px;letter-spacing:0.06em">COMMON FIX 2</p>
    <p style="font-size:14px;font-weight:800;color:#1a2410;margin:0 0 6px">[Second common attempt]</p>
    <p style="font-size:12px;color:#8a9e78;margin:0;line-height:1.6">Why it fails: [reason]</p>
  </div>
</div>

<p>[Explanation of why this is a widespread problem. Make readers feel understood — they are not alone and it is not their fault. The platform/market changed in a way that made old approaches obsolete.]</p>

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<h2>The Real Fix: Step by Step</h2>

${IMG.screenshot('The fix in action — add a screenshot of the correct approach here')}

<div style="display:flex;flex-direction:column;gap:14px;margin:24px 0">

  <div style="display:flex;gap:14px;align-items:flex-start;padding:18px;background:#f7f9f5;border:1px solid #e8ede2;border-radius:14px">
    <div style="width:36px;height:36px;border-radius:50%;background:#8fff00;color:#1a2410;font-weight:900;font-size:15px;display:flex;align-items:center;justify-content:center;flex-shrink:0">1</div>
    <div style="flex:1">
      <p style="font-size:15px;font-weight:800;color:#1a2410;margin:0 0 6px">Diagnose Your Specific Situation</p>
      <p style="font-size:13px;line-height:1.7;color:#3a4a32;margin:0">[Specific diagnostic action. What to look for, and what different results mean. If you see [result A], your issue is [cause A]. If you see [result B], your issue is [cause B].]</p>
    </div>
  </div>

  <div style="display:flex;gap:14px;align-items:flex-start;padding:18px;background:#f4ffe6;border:2px solid rgba(143,255,0,0.3);border-radius:14px">
    <div style="width:36px;height:36px;border-radius:50%;background:#1a2410;color:#8fff00;font-weight:900;font-size:15px;display:flex;align-items:center;justify-content:center;flex-shrink:0">2</div>
    <div style="flex:1">
      <p style="font-size:15px;font-weight:800;color:#1a2410;margin:0 0 6px">[Core Fix — The Most Important Step]</p>
      <p style="font-size:13px;line-height:1.7;color:#3a4a32;margin:0">[Detailed instruction. This is the step that addresses the root cause — give it the most detail of any step. Include exactly what to do, where to do it, and what the result should look like.]</p>
      <div style="background:#fff;border-left:3px solid #8fff00;padding:8px 12px;border-radius:0 8px 8px 0;margin-top:10px"><p style="font-size:12px;color:#4a8f00;margin:0"><strong>Why this works:</strong> [The insight that makes this step effective when everything else fails.]</p></div>
    </div>
  </div>

  <div style="display:flex;gap:14px;align-items:flex-start;padding:18px;background:#f7f9f5;border:1px solid #e8ede2;border-radius:14px">
    <div style="width:36px;height:36px;border-radius:50%;background:#8fff00;color:#1a2410;font-weight:900;font-size:15px;display:flex;align-items:center;justify-content:center;flex-shrink:0">3</div>
    <div style="flex:1">
      <p style="font-size:15px;font-weight:800;color:#1a2410;margin:0 0 6px">[Supporting Action]</p>
      <p style="font-size:13px;line-height:1.7;color:#3a4a32;margin:0">[Explanation.]</p>
    </div>
  </div>

  <div style="display:flex;gap:14px;align-items:flex-start;padding:18px;background:#f7f9f5;border:1px solid #e8ede2;border-radius:14px">
    <div style="width:36px;height:36px;border-radius:50%;background:#8fff00;color:#1a2410;font-weight:900;font-size:15px;display:flex;align-items:center;justify-content:center;flex-shrink:0">4</div>
    <div style="flex:1">
      <p style="font-size:15px;font-weight:800;color:#1a2410;margin:0 0 6px">Test and Verify</p>
      <p style="font-size:13px;line-height:1.7;color:#3a4a32;margin:0">[How to test if the fix worked]. You should see <strong>[expected result]</strong> within [timeframe]. If you do not, [specific troubleshooting step].</p>
    </div>
  </div>

  <div style="display:flex;gap:14px;align-items:flex-start;padding:18px;background:#f7f9f5;border:1px solid #e8ede2;border-radius:14px">
    <div style="width:36px;height:36px;border-radius:50%;background:#8fff00;color:#1a2410;font-weight:900;font-size:15px;display:flex;align-items:center;justify-content:center;flex-shrink:0">5</div>
    <div style="flex:1">
      <p style="font-size:15px;font-weight:800;color:#1a2410;margin:0 0 6px">Prevent It From Coming Back</p>
      <p style="font-size:13px;line-height:1.7;color:#3a4a32;margin:0">[Ongoing preventive measure]. Set a reminder to [recurring check] every [timeframe] so this does not creep back in.</p>
    </div>
  </div>

</div>

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<h2>Real Results from Sellers Who Applied This Fix</h2>

<div style="background:#1a2410;border-radius:14px;padding:20px 24px;margin:20px 0;display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px">
  <div style="text-align:center;padding:14px 10px;background:rgba(255,255,255,0.05);border-radius:10px">
    <p style="font-size:26px;font-weight:900;color:#8fff00;margin:0;line-height:1">[X] days</p>
    <p style="font-size:11px;color:rgba(255,255,255,0.4);margin:6px 0 0;font-weight:700;text-transform:uppercase;letter-spacing:0.05em">To first improvement</p>
  </div>
  <div style="text-align:center;padding:14px 10px;background:rgba(255,255,255,0.05);border-radius:10px">
    <p style="font-size:26px;font-weight:900;color:#8fff00;margin:0;line-height:1">[X]%</p>
    <p style="font-size:11px;color:rgba(255,255,255,0.4);margin:6px 0 0;font-weight:700;text-transform:uppercase;letter-spacing:0.05em">Fix it permanently</p>
  </div>
  <div style="text-align:center;padding:14px 10px;background:rgba(255,255,255,0.05);border-radius:10px">
    <p style="font-size:26px;font-weight:900;color:#8fff00;margin:0;line-height:1">[X]x</p>
    <p style="font-size:11px;color:rgba(255,255,255,0.4);margin:6px 0 0;font-weight:700;text-transform:uppercase;letter-spacing:0.05em">Average improvement</p>
  </div>
</div>

<p style="font-size:19px;font-style:italic;color:#1a2410;line-height:1.6;margin:24px 0;padding:20px 24px;background:#f4ffe6;border-radius:14px;border:1px solid rgba(143,255,0,0.2)">"[Testimonial from a seller who used this fix. Include a specific result and specific timeframe — generic quotes do nothing.]" — <strong>[Name]</strong>, [seller type]</p>

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<h2>Quick Reference: The Fix in 60 Seconds</h2>

<div style="background:#f7f9f5;border:1px solid #e8ede2;border-radius:12px;padding:18px 20px;margin:16px 0">
  <div style="display:flex;flex-direction:column;gap:8px">
    <div style="display:flex;gap:10px;align-items:center"><span style="background:#1a2410;color:#8fff00;font-size:11px;font-weight:900;padding:2px 8px;border-radius:20px;flex-shrink:0">1</span><span style="font-size:13px;color:#1a2410;font-weight:600">[Step 1 in one line]</span></div>
    <div style="display:flex;gap:10px;align-items:center"><span style="background:#1a2410;color:#8fff00;font-size:11px;font-weight:900;padding:2px 8px;border-radius:20px;flex-shrink:0">2</span><span style="font-size:13px;color:#1a2410;font-weight:600">[Step 2 in one line]</span></div>
    <div style="display:flex;gap:10px;align-items:center"><span style="background:#8fff00;color:#1a2410;font-size:11px;font-weight:900;padding:2px 8px;border-radius:20px;flex-shrink:0">3</span><span style="font-size:13px;color:#1a2410;font-weight:800">[Core fix — one line — this is the critical step]</span></div>
    <div style="display:flex;gap:10px;align-items:center"><span style="background:#1a2410;color:#8fff00;font-size:11px;font-weight:900;padding:2px 8px;border-radius:20px;flex-shrink:0">4</span><span style="font-size:13px;color:#1a2410;font-weight:600">[Step 4 in one line]</span></div>
    <div style="display:flex;gap:10px;align-items:center"><span style="background:#1a2410;color:#8fff00;font-size:11px;font-weight:900;padding:2px 8px;border-radius:20px;flex-shrink:0">5</span><span style="font-size:13px;color:#1a2410;font-weight:600">[Prevention step in one line]</span></div>
  </div>
</div>

[CTA:starter]

:::faq
Q: How long will this fix take?
A: [Specific timeframe — how long to implement, how long to see results]

Q: Will this work if I have had the problem for a long time?
A: [Honest answer — usually yes, with caveats]

Q: What if the fix does not work for me?
A: [Next step — what to try, who to contact, how to troubleshoot further]
:::

<p style="font-size:12px;color:#8a9e78;border-top:1px solid #e8ede2;padding-top:14px;margin-top:24px"><em>Updated <strong>[Month Year]</strong>. If your situation looks different from what is described above, <a href="/contact" style="color:#8a9e78">contact us</a> and we will help you diagnose it.</em></p>`
  },

  // ── 10. SEASONAL / TRENDING ───────────────────────────────────────────────
  {
    id:          'seasonal',
    name:        'Seasonal / Trending',
    description: 'Premium urgency guide with countdown banner, stats dashboard, demand trend bar, product cards with full data, profit estimate table, keyword list, what-to-avoid, and action plan.',
    icon:        Calendar,
    color:       C.red,
    category:    'Trending',
    wordEstimate: '1,000–1,800 words',
    previewLines: ['Countdown urgency banner', 'Reading time bar', 'Stats dashboard', 'Why this season is different', 'Demand trend visual', 'Product cards with margin/competition/demand', 'Profit estimate table', 'Top keywords section', 'What to avoid', 'Action plan checklist', 'Deadline CTA'],
    defaultTitle: 'Best eBay Products to Sell This [Season] [Year] — Seller Opportunity Guide',
    defaultMeta:  '[Season] is [X weeks] away. Here are the highest-demand eBay products, profit estimates, top keywords, and sourcing tips — everything you need before the window closes.',
    html: `<div style="background:#1a2410;border-radius:16px;padding:18px 22px;margin:0 0 20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px">
  <div>
    <p style="color:#b91c1c;font-size:11px;font-weight:900;letter-spacing:0.1em;margin:0 0 4px">⚠ TIME-SENSITIVE OPPORTUNITY</p>
    <p style="color:#fff;font-size:16px;font-weight:800;margin:0 0 2px">Peak demand window: <strong style="color:#8fff00">[Start Date] — [End Date]</strong></p>
    <p style="color:rgba(255,255,255,0.4);font-size:12px;margin:0">Sellers who list in the first [X] weeks capture [X]% of total seasonal sales</p>
  </div>
  <div style="background:rgba(185,28,28,0.25);border:1px solid rgba(185,28,28,0.5);border-radius:12px;padding:12px 20px;text-align:center;flex-shrink:0">
    <p style="color:#fff;font-size:32px;font-weight:900;margin:0;line-height:1">[X]</p>
    <p style="color:rgba(255,255,255,0.5);font-size:11px;margin:4px 0 0;font-weight:700;text-transform:uppercase;letter-spacing:0.06em">days left</p>
  </div>
</div>

${IMG.hero('[Season] [Year] eBay Selling — Top Product Opportunities')}

<div style="display:flex;align-items:center;gap:16px;padding:12px 16px;background:#f7f9f5;border-radius:10px;margin:16px 0;flex-wrap:wrap">
  <span style="font-size:12px;color:#8a9e78">⏱ <strong>[X] min read</strong></span>
  <span style="color:#e8ede2">|</span>
  <span style="font-size:12px;color:#8a9e78">📅 Published: <strong>[Date]</strong></span>
  <span style="color:#e8ede2">|</span>
  <span style="font-size:12px;color:#8a9e78">✍️ By <strong>[Author Name]</strong></span>
</div>

<h1>Best eBay Products to Sell This [Season] [Year] — Seller Opportunity Guide</h1>

<p style="font-size:17px;line-height:1.8;color:#3a4a32;margin:0 0 20px">Smart sellers are already sourcing inventory right now. If you move this week you capture the demand surge at full margin. If you wait until [date], you will be competing in a saturated market where prices have already been driven down.</p>

<div style="background:#1a2410;border-radius:16px;padding:22px 24px;margin:24px 0;display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:12px">
  <div style="text-align:center;padding:14px 8px;background:rgba(255,255,255,0.05);border-radius:10px">
    <p style="font-size:24px;font-weight:900;color:#8fff00;margin:0;line-height:1">[X]%</p>
    <p style="font-size:10px;color:rgba(255,255,255,0.4);margin:6px 0 0;font-weight:700;text-transform:uppercase;letter-spacing:0.05em">Sales surge</p>
  </div>
  <div style="text-align:center;padding:14px 8px;background:rgba(255,255,255,0.05);border-radius:10px">
    <p style="font-size:24px;font-weight:900;color:#8fff00;margin:0;line-height:1">$[X]B</p>
    <p style="font-size:10px;color:rgba(255,255,255,0.4);margin:6px 0 0;font-weight:700;text-transform:uppercase;letter-spacing:0.05em">eBay GMV</p>
  </div>
  <div style="text-align:center;padding:14px 8px;background:rgba(255,255,255,0.05);border-radius:10px">
    <p style="font-size:24px;font-weight:900;color:#8fff00;margin:0;line-height:1">[X] wks</p>
    <p style="font-size:10px;color:rgba(255,255,255,0.4);margin:6px 0 0;font-weight:700;text-transform:uppercase;letter-spacing:0.05em">Source window</p>
  </div>
  <div style="text-align:center;padding:14px 8px;background:rgba(185,28,28,0.2);border-radius:10px;border:1px solid rgba(185,28,28,0.3)">
    <p style="font-size:24px;font-weight:900;color:#b91c1c;margin:0;line-height:1">[X]</p>
    <p style="font-size:10px;color:rgba(255,255,255,0.4);margin:6px 0 0;font-weight:700;text-transform:uppercase;letter-spacing:0.05em">Days left</p>
  </div>
</div>

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<h2>Why [Season] [Year] Is a Different Opportunity</h2>

<p>[This season differs from previous years because: economic factor, trend shift, consumer behaviour change, platform algorithm update. Include at least one specific data point — not just "demand is up" but "demand is up [X]% vs last year because [specific reason]".]</p>

<div style="background:#f7f9f5;border:1px solid #e8ede2;border-radius:14px;padding:18px 22px;margin:20px 0">
  <p style="font-size:12px;font-weight:900;letter-spacing:0.08em;color:#8a9e78;margin:0 0 14px">DEMAND TREND — [SEASON] [YEAR]</p>
  <div style="display:flex;flex-direction:column;gap:8px">
    <div style="display:flex;align-items:center;gap:10px">
      <span style="font-size:12px;color:#8a9e78;width:70px;flex-shrink:0">[Month 1]</span>
      <div style="flex:1;height:10px;background:#e8ede2;border-radius:20px;overflow:hidden"><div style="height:100%;width:30%;background:#8fff00;border-radius:20px"></div></div>
      <span style="font-size:12px;font-weight:700;color:#1a2410;width:40px;text-align:right">30%</span>
    </div>
    <div style="display:flex;align-items:center;gap:10px">
      <span style="font-size:12px;color:#8a9e78;width:70px;flex-shrink:0">[Month 2]</span>
      <div style="flex:1;height:10px;background:#e8ede2;border-radius:20px;overflow:hidden"><div style="height:100%;width:55%;background:#8fff00;border-radius:20px"></div></div>
      <span style="font-size:12px;font-weight:700;color:#1a2410;width:40px;text-align:right">55%</span>
    </div>
    <div style="display:flex;align-items:center;gap:10px">
      <span style="font-size:12px;color:#8a9e78;width:70px;flex-shrink:0">[Peak Month]</span>
      <div style="flex:1;height:10px;background:#e8ede2;border-radius:20px;overflow:hidden"><div style="height:100%;width:100%;background:#8fff00;border-radius:20px"></div></div>
      <span style="font-size:12px;font-weight:900;color:#4a8f00;width:40px;text-align:right">PEAK</span>
    </div>
    <div style="display:flex;align-items:center;gap:10px">
      <span style="font-size:12px;color:#8a9e78;width:70px;flex-shrink:0">[After Peak]</span>
      <div style="flex:1;height:10px;background:#e8ede2;border-radius:20px;overflow:hidden"><div style="height:100%;width:25%;background:#e8ede2;border-radius:20px"></div></div>
      <span style="font-size:12px;font-weight:700;color:#b91c1c;width:40px;text-align:right">Drop</span>
    </div>
  </div>
  <p style="font-size:11px;color:#8a9e78;margin:12px 0 0;font-style:italic">Source: [Data source] · Update bars to reflect actual trend data</p>
</div>

:::info
The Opportunity Most Sellers Miss: [Specific insight — what trend or product type are most sellers overlooking this season, and why does moving early give a disproportionate advantage?]
:::

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<h2>Top Product Opportunities This Season</h2>

${IMG.inline('Top trending [Season] products — add a product collage, Google Trends screenshot, or demand chart')}

<div style="display:flex;flex-direction:column;gap:16px;margin:20px 0">

  <div style="border:2px solid rgba(143,255,0,0.4);border-radius:16px;overflow:hidden">
    <div style="background:#1a2410;padding:14px 20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
      <div style="display:flex;align-items:center;gap:10px">
        <span style="background:#8fff00;color:#1a2410;font-size:11px;font-weight:900;padding:3px 10px;border-radius:20px">#1 PICK</span>
        <span style="color:#fff;font-size:16px;font-weight:900">[Product Category 1]</span>
      </div>
      <div style="display:flex;align-items:center;gap:12px">
        <span style="color:#8fff00;font-size:13px;font-weight:900">$[X]–$[Y] avg sale</span>
        <span style="background:rgba(143,255,0,0.15);color:#8fff00;font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px">HOT NOW</span>
      </div>
    </div>
    <div style="padding:18px 20px;background:#f4ffe6">
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:10px;margin-bottom:14px">
        <div style="text-align:center;padding:10px 8px;background:#fff;border-radius:10px;border:1px solid rgba(74,143,0,0.2)">
          <p style="font-size:18px;font-weight:900;color:#4a8f00;margin:0;line-height:1">[X]%</p>
          <p style="font-size:10px;color:#8a9e78;margin:5px 0 0;font-weight:700;text-transform:uppercase">Margin</p>
        </div>
        <div style="text-align:center;padding:10px 8px;background:#fff;border-radius:10px;border:1px solid rgba(74,143,0,0.2)">
          <p style="font-size:18px;font-weight:900;color:#1d4ed8;margin:0;line-height:1">[Low]</p>
          <p style="font-size:10px;color:#8a9e78;margin:5px 0 0;font-weight:700;text-transform:uppercase">Competition</p>
        </div>
        <div style="text-align:center;padding:10px 8px;background:#fff;border-radius:10px;border:1px solid rgba(74,143,0,0.2)">
          <p style="font-size:18px;font-weight:900;color:#d97706;margin:0;line-height:1">[X]x</p>
          <p style="font-size:10px;color:#8a9e78;margin:5px 0 0;font-weight:700;text-transform:uppercase">Demand spike</p>
        </div>
        <div style="text-align:center;padding:10px 8px;background:#fff;border-radius:10px;border:1px solid rgba(74,143,0,0.2)">
          <p style="font-size:18px;font-weight:900;color:#4a8f00;margin:0;line-height:1">[X]%</p>
          <p style="font-size:10px;color:#8a9e78;margin:5px 0 0;font-weight:700;text-transform:uppercase">Sell-through</p>
        </div>
      </div>
      <p style="font-size:14px;color:#1a2410;margin:0 0 10px;line-height:1.7;font-weight:600">[Why this category is the top pick — what is specifically selling, what buyers are looking for, and what makes this season particularly strong for it.]</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <span style="font-size:12px;color:#4a8f00;font-weight:700">📦 Source: [Specific sourcing suggestion]</span>
        <span style="font-size:12px;color:#8a9e78">·</span>
        <span style="font-size:12px;color:#4a8f00;font-weight:700">🔑 Keywords: [keyword 1], [keyword 2], [keyword 3]</span>
      </div>
    </div>
  </div>

  <div style="border:1px solid #e8ede2;border-radius:16px;overflow:hidden">
    <div style="background:#f7f9f5;padding:14px 20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
      <div style="display:flex;align-items:center;gap:10px">
        <span style="background:#1a2410;color:#8fff00;font-size:11px;font-weight:900;padding:3px 10px;border-radius:20px">#2</span>
        <span style="color:#1a2410;font-size:16px;font-weight:800">[Product Category 2]</span>
      </div>
      <span style="color:#1a2410;font-size:13px;font-weight:900">$[X]–$[Y] avg</span>
    </div>
    <div style="padding:16px 20px">
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;margin-bottom:12px">
        <div style="text-align:center;padding:8px;background:#f7f9f5;border-radius:8px"><p style="font-size:16px;font-weight:900;color:#4a8f00;margin:0">[X]%</p><p style="font-size:10px;color:#8a9e78;margin:4px 0 0;font-weight:700;text-transform:uppercase">Margin</p></div>
        <div style="text-align:center;padding:8px;background:#f7f9f5;border-radius:8px"><p style="font-size:16px;font-weight:900;color:#1d4ed8;margin:0">[Med]</p><p style="font-size:10px;color:#8a9e78;margin:4px 0 0;font-weight:700;text-transform:uppercase">Competition</p></div>
        <div style="text-align:center;padding:8px;background:#f7f9f5;border-radius:8px"><p style="font-size:16px;font-weight:900;color:#d97706;margin:0">[X]x</p><p style="font-size:10px;color:#8a9e78;margin:4px 0 0;font-weight:700;text-transform:uppercase">Demand spike</p></div>
        <div style="text-align:center;padding:8px;background:#f7f9f5;border-radius:8px"><p style="font-size:16px;font-weight:900;color:#4a8f00;margin:0">[X]%</p><p style="font-size:10px;color:#8a9e78;margin:4px 0 0;font-weight:700;text-transform:uppercase">Sell-through</p></div>
      </div>
      <p style="font-size:13px;color:#3a4a32;margin:0 0 8px;line-height:1.7">[Why this is the strong #2 pick. What makes it different from #1 and who should focus here instead.]</p>
      <p style="font-size:12px;color:#8a9e78;margin:0">📦 <strong>Source:</strong> [Suggestion] · 🔑 <strong>Keywords:</strong> [keyword 1], [keyword 2]</p>
    </div>
  </div>

  <div style="border:1px solid #e8ede2;border-radius:16px;overflow:hidden">
    <div style="background:#f7f9f5;padding:14px 20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
      <div style="display:flex;align-items:center;gap:10px">
        <span style="background:#1a2410;color:#8fff00;font-size:11px;font-weight:900;padding:3px 10px;border-radius:20px">#3</span>
        <span style="color:#1a2410;font-size:16px;font-weight:800">[Product Category 3]</span>
      </div>
      <span style="color:#1a2410;font-size:13px;font-weight:900">$[X]–$[Y] avg</span>
    </div>
    <div style="padding:16px 20px">
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;margin-bottom:12px">
        <div style="text-align:center;padding:8px;background:#f7f9f5;border-radius:8px"><p style="font-size:16px;font-weight:900;color:#4a8f00;margin:0">[X]%</p><p style="font-size:10px;color:#8a9e78;margin:4px 0 0;font-weight:700;text-transform:uppercase">Margin</p></div>
        <div style="text-align:center;padding:8px;background:#f7f9f5;border-radius:8px"><p style="font-size:16px;font-weight:900;color:#1d4ed8;margin:0">[High]</p><p style="font-size:10px;color:#8a9e78;margin:4px 0 0;font-weight:700;text-transform:uppercase">Competition</p></div>
        <div style="text-align:center;padding:8px;background:#f7f9f5;border-radius:8px"><p style="font-size:16px;font-weight:900;color:#d97706;margin:0">[X]x</p><p style="font-size:10px;color:#8a9e78;margin:4px 0 0;font-weight:700;text-transform:uppercase">Demand spike</p></div>
        <div style="text-align:center;padding:8px;background:#f7f9f5;border-radius:8px"><p style="font-size:16px;font-weight:900;color:#4a8f00;margin:0">[X]%</p><p style="font-size:10px;color:#8a9e78;margin:4px 0 0;font-weight:700;text-transform:uppercase">Sell-through</p></div>
      </div>
      <p style="font-size:13px;color:#3a4a32;margin:0 0 8px;line-height:1.7">[Description. Higher competition but still worth it because [reason].]</p>
      <p style="font-size:12px;color:#8a9e78;margin:0">📦 <strong>Source:</strong> [Suggestion] · 🔑 <strong>Keywords:</strong> [keyword 1], [keyword 2]</p>
    </div>
  </div>

  <div style="padding:18px 20px;background:#fffbeb;border-radius:14px;border:1px solid #fde68a">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
      <span style="background:#d97706;color:#fff;font-size:11px;font-weight:900;padding:2px 8px;border-radius:20px">SLEEPER PICK</span>
      <span style="font-size:15px;font-weight:800;color:#1a2410">[Less Obvious Category]</span>
    </div>
    <p style="font-size:13px;color:#3a4a32;margin:0 0 8px;line-height:1.7">[X]% less competition than [main category 1] while commanding similar average prices. Most sellers overlook this because [reason]. The sellers who find it early capture [outcome].</p>
    <p style="font-size:12px;color:#d97706;font-weight:700;margin:0">📦 Source: [Suggestion] · Avg margin: [X]% · Best keywords: [keyword 1], [keyword 2]</p>
  </div>

</div>

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<h2>Profit Estimate: What You Can Realistically Make</h2>

<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <thead>
    <tr>
      <th style="border:1px solid #e8ede2;padding:10px 14px;background:#f7f9f5;font-size:11px;font-weight:900;text-align:left;color:#8a9e78;letter-spacing:0.04em">PRODUCT</th>
      <th style="border:1px solid #e8ede2;padding:10px 14px;background:#f7f9f5;font-size:11px;font-weight:900;text-align:center;color:#8a9e78">AVG SALE</th>
      <th style="border:1px solid #e8ede2;padding:10px 14px;background:#f7f9f5;font-size:11px;font-weight:900;text-align:center;color:#8a9e78">EST COST</th>
      <th style="border:1px solid #e8ede2;padding:10px 14px;background:#f7f9f5;font-size:11px;font-weight:900;text-align:center;color:#8a9e78">eBay FEES</th>
      <th style="border:1px solid #e8ede2;padding:10px 14px;background:#f7f9f5;font-size:11px;font-weight:900;text-align:center;color:#8a9e78">NET PROFIT</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background:#f4ffe6">
      <td style="border:1px solid #e8ede2;padding:10px 14px;font-size:13px;font-weight:800">[Product 1] ⭐</td>
      <td style="border:1px solid #e8ede2;padding:10px 14px;font-size:13px;text-align:center">$[X]</td>
      <td style="border:1px solid #e8ede2;padding:10px 14px;font-size:13px;text-align:center">$[X]</td>
      <td style="border:1px solid #e8ede2;padding:10px 14px;font-size:13px;text-align:center;color:#8a9e78">$[X]</td>
      <td style="border:1px solid #e8ede2;padding:10px 14px;font-size:14px;text-align:center;font-weight:900;color:#4a8f00">$[X]</td>
    </tr>
    <tr>
      <td style="border:1px solid #e8ede2;padding:10px 14px;font-size:13px;font-weight:700">[Product 2]</td>
      <td style="border:1px solid #e8ede2;padding:10px 14px;font-size:13px;text-align:center">$[X]</td>
      <td style="border:1px solid #e8ede2;padding:10px 14px;font-size:13px;text-align:center">$[X]</td>
      <td style="border:1px solid #e8ede2;padding:10px 14px;font-size:13px;text-align:center;color:#8a9e78">$[X]</td>
      <td style="border:1px solid #e8ede2;padding:10px 14px;font-size:13px;text-align:center;font-weight:700;color:#4a8f00">$[X]</td>
    </tr>
    <tr style="background:#f7f9f5">
      <td style="border:1px solid #e8ede2;padding:10px 14px;font-size:13px;font-weight:700">[Product 3]</td>
      <td style="border:1px solid #e8ede2;padding:10px 14px;font-size:13px;text-align:center">$[X]</td>
      <td style="border:1px solid #e8ede2;padding:10px 14px;font-size:13px;text-align:center">$[X]</td>
      <td style="border:1px solid #e8ede2;padding:10px 14px;font-size:13px;text-align:center;color:#8a9e78">$[X]</td>
      <td style="border:1px solid #e8ede2;padding:10px 14px;font-size:13px;text-align:center;font-weight:700;color:#4a8f00">$[X]</td>
    </tr>
  </tbody>
</table>

<p style="font-size:12px;color:#8a9e78;margin:0;font-style:italic">Estimates based on [X]% FVF + [X] shipping + [X] packaging. Use the <a href="/dashboard/profit-calculator" style="color:#4a8f00">Riazify profit calculator</a> for your exact numbers.</p>

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<h2>Top eBay Keywords for [Season] [Year]</h2>

<p>Include these in your listing titles to rank at peak season. Buyers are actively searching these terms right now:</p>

<div style="display:flex;flex-wrap:wrap;gap:8px;margin:16px 0">
  <span style="background:#1a2410;color:#8fff00;font-size:12px;font-weight:700;padding:6px 14px;border-radius:20px">[keyword 1]</span>
  <span style="background:#1a2410;color:#8fff00;font-size:12px;font-weight:700;padding:6px 14px;border-radius:20px">[keyword 2]</span>
  <span style="background:#1a2410;color:#8fff00;font-size:12px;font-weight:700;padding:6px 14px;border-radius:20px">[keyword 3]</span>
  <span style="background:#f7f9f5;color:#1a2410;font-size:12px;font-weight:700;padding:6px 14px;border-radius:20px;border:1px solid #e8ede2">[keyword 4]</span>
  <span style="background:#f7f9f5;color:#1a2410;font-size:12px;font-weight:700;padding:6px 14px;border-radius:20px;border:1px solid #e8ede2">[keyword 5]</span>
  <span style="background:#f7f9f5;color:#1a2410;font-size:12px;font-weight:700;padding:6px 14px;border-radius:20px;border:1px solid #e8ede2">[keyword 6]</span>
  <span style="background:#f7f9f5;color:#1a2410;font-size:12px;font-weight:700;padding:6px 14px;border-radius:20px;border:1px solid #e8ede2">[keyword 7]</span>
  <span style="background:#f7f9f5;color:#1a2410;font-size:12px;font-weight:700;padding:6px 14px;border-radius:20px;border:1px solid #e8ede2">[keyword 8]</span>
</div>

<p style="font-size:13px;color:#8a9e78;line-height:1.7">Put the top 3 (highlighted in dark) at the start of your title where Cassini weighs them most heavily. The remaining keywords should appear naturally in your description and item specifics.</p>

:::warning
What to Avoid This [Season]: Do not list [product type]. Despite looking attractive on paper, [product] sees [X]% return rates during this period because [specific reason — e.g. buyers choose based on photos and the actual product disappoints]. Returns will eliminate your margin and damage your seller metrics.
:::

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<h2>Your Action Plan This Week</h2>

<div style="background:#f7f9f5;border:1px solid #e8ede2;border-radius:14px;padding:20px 24px;margin:16px 0">
  <p style="font-size:12px;font-weight:900;letter-spacing:0.08em;color:#8a9e78;margin:0 0 16px">COMPLETE IN ORDER — DEADLINE: [DATE]</p>
  <div style="display:flex;flex-direction:column;gap:12px">
    <div style="display:flex;gap:12px;align-items:flex-start">
      <div style="width:22px;height:22px;border-radius:4px;border:2px solid #e8ede2;flex-shrink:0;margin-top:1px"></div>
      <div><p style="font-size:14px;font-weight:700;color:#1a2410;margin:0 0 2px"><strong>Today:</strong> [Immediate action — specific, not vague]</p><p style="font-size:12px;color:#8a9e78;margin:0">[Why this cannot wait and what happens if you delay]</p></div>
    </div>
    <div style="display:flex;gap:12px;align-items:flex-start">
      <div style="width:22px;height:22px;border-radius:4px;border:2px solid #e8ede2;flex-shrink:0;margin-top:1px"></div>
      <div><p style="font-size:14px;font-weight:700;color:#1a2410;margin:0 0 2px"><strong>By [Day]:</strong> [Source inventory action]</p><p style="font-size:12px;color:#8a9e78;margin:0">[Where to source, minimum quantities]</p></div>
    </div>
    <div style="display:flex;gap:12px;align-items:flex-start">
      <div style="width:22px;height:22px;border-radius:4px;border:2px solid #e8ede2;flex-shrink:0;margin-top:1px"></div>
      <div><p style="font-size:14px;font-weight:700;color:#1a2410;margin:0 0 2px"><strong>By [Day]:</strong> [Listing optimisation action]</p><p style="font-size:12px;color:#8a9e78;margin:0">Use the keywords above. Add seasonal item specifics.</p></div>
    </div>
    <div style="display:flex;gap:12px;align-items:flex-start">
      <div style="width:22px;height:22px;border-radius:4px;border:2px solid rgba(143,255,0,0.5);background:#f4ffe6;flex-shrink:0;margin-top:1px"></div>
      <div><p style="font-size:14px;font-weight:800;color:#4a8f00;margin:0 0 2px"><strong>By [Date]:</strong> All listings live — this is your hard deadline</p><p style="font-size:12px;color:#8a9e78;margin:0">After this date, competition increases and margins compress. Every day late costs you money.</p></div>
    </div>
  </div>
</div>

<p style="text-align:center;font-size:15px;font-weight:700;color:#8a9e78;margin:20px 0">The sellers who move this week own the search results at peak. Sellers who wait fight over the scraps.</p>

[CTA:growth]

<p style="font-size:12px;color:#8a9e78;border-top:1px solid #e8ede2;padding-top:14px;margin-top:20px;line-height:1.7"><em>Market data from [source] and historical eBay trends. Profit estimates use [X]% FVF. Always verify current conditions before committing to large inventory purchases. Updated [Date].</em></p>`
  },

  // ── 11. VERO SAFETY GUIDE ────────────────────────────────────────────────
  {
    id:           'vero-safety',
    name:         'VeRO Safety Guide',
    description:  'Explains VeRO protection, risky brands, how to check listings, and what to do if struck.',
    icon:         Shield,
    color:        '#b91c1c',
    category:     'eBay Specific',
    wordEstimate: '1,500–2,500 words',
    previewLines: ['What is VeRO?', 'Risky brand table', 'How to check', 'What happens if struck', 'Safety checklist'],
    defaultTitle: 'eBay VeRO Protection: Complete Guide for Sellers ([Year])',
    defaultMeta:  'Everything eBay sellers need to know about VeRO protection — what it is, which brands are risky, and how to protect your account.',
    html: `${IMG.hero('eBay VeRO Protection — Complete Safety Guide for Sellers')}

<h1>eBay VeRO Protection: Complete Guide for Sellers ([Year])</h1>

<p>If you've ever had a listing removed without warning, VeRO might be the reason. The Verified Rights Owner (VeRO) program is one of the most misunderstood — and most dangerous — aspects of selling on eBay. Get it wrong and you could lose your account permanently.</p>

<p>This guide covers everything you need to know: what VeRO is, which brands are most aggressive, how to check your listings before they get pulled, and exactly what to do if you receive a VeRO strike.</p>

:::warning
Account Safety Warning: VeRO violations are cumulative. Three strikes can result in permanent account suspension with no appeal. Read this guide carefully before listing branded products.
:::

<h2>What is VeRO?</h2>

<p>VeRO (Verified Rights Owner) is eBay's intellectual property protection program. It allows brand owners, manufacturers, and rights holders to report and remove listings that they believe infringe on their intellectual property — trademarks, copyrights, or patents.</p>

<p>The key thing to understand: <strong>eBay acts first, investigates later</strong>. When a VeRO complaint is filed, eBay removes the listing immediately. You don't get a warning. You don't get a chance to respond first.</p>

<h2>What Counts as a VeRO Violation?</h2>

<ul>
  <li><strong>Counterfeit items:</strong> Selling fake branded products</li>
  <li><strong>Unauthorized replicas:</strong> Items described as "inspired by" or "style of" a brand</li>
  <li><strong>Misleading keywords:</strong> Using brand names in titles for unrelated items</li>
  <li><strong>Unlicensed use:</strong> Using brand logos, artwork, or characters without permission</li>
  <li><strong>Gray market goods:</strong> Genuine products sold outside authorized channels in some regions</li>
</ul>

:::info
Important: Even genuine, authentic products can trigger VeRO in certain circumstances — particularly electronics, designer goods, and software. The brand owner decides, not eBay.
:::

<h2>The Most VeRO-Aggressive Brands</h2>

<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <thead>
    <tr>
      <th style="border:1px solid #e8ede2;padding:10px 14px;background:#FEF2F2;color:#b91c1c;text-align:left;font-size:12px">Brand</th>
      <th style="border:1px solid #e8ede2;padding:10px 14px;background:#FEF2F2;color:#b91c1c;text-align:left;font-size:12px">Risk Level</th>
      <th style="border:1px solid #e8ede2;padding:10px 14px;background:#FEF2F2;color:#b91c1c;text-align:left;font-size:12px">Common Trigger</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px">Apple</td><td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px;color:#b91c1c;font-weight:700">Very High</td><td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px">Accessories, cases, chargers</td></tr>
    <tr style="background:#f7f9f5"><td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px">Nike / Jordan</td><td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px;color:#b91c1c;font-weight:700">Very High</td><td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px">Footwear, apparel, accessories</td></tr>
    <tr><td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px">Louis Vuitton</td><td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px;color:#b91c1c;font-weight:700">Very High</td><td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px">Handbags, wallets, accessories</td></tr>
    <tr style="background:#f7f9f5"><td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px">OtterBox</td><td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px;color:#d97706;font-weight:700">High</td><td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px">Phone cases</td></tr>
    <tr><td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px">Rolex / Luxury Watches</td><td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px;color:#b91c1c;font-weight:700">Very High</td><td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px">Watches, watch parts, straps</td></tr>
    <tr style="background:#f7f9f5"><td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px">LEGO</td><td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px;color:#d97706;font-weight:700">High</td><td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px">Compatible bricks, custom sets</td></tr>
    <tr><td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px">Adidas / Yeezy</td><td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px;color:#b91c1c;font-weight:700">Very High</td><td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px">Footwear, sportswear</td></tr>
    <tr style="background:#f7f9f5"><td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px">Disney / Marvel</td><td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px;color:#d97706;font-weight:700">High</td><td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px">Character merchandise, artwork</td></tr>
  </tbody>
</table>

<h2>How to Check Your Listings Before They Get Pulled</h2>

### Step 1: Search eBay's VeRO database
<p>Go to <a href="https://vero.ebay.com">vero.ebay.com</a> and search for the brand you're listing. If they're registered, read their about me page carefully — it tells you exactly what they will and won't report.</p>

### Step 2: Check your title and description
<p>Remove any brand names you don't have explicit permission to use. Even using "compatible with [Brand]" can trigger some VeRO participants.</p>

### Step 3: Verify your product is authentic
<p>If selling genuine branded products, keep your proof of purchase. Some brands require invoices from authorized distributors before they'll reinstate removed listings.</p>

### Step 4: Use Riazify's VeRO Scanner
<p>Our built-in VeRO scanner checks your listing title and description against [X]+ known VeRO participants before you publish. Catch problems before eBay does.</p>

[CTA:free]

<h2>What Happens When You Get a VeRO Strike</h2>

<p>When a VeRO complaint is filed against your listing:</p>
<ol>
  <li>eBay removes the listing immediately (usually within hours)</li>
  <li>You receive an email from eBay explaining the removal</li>
  <li>The strike is recorded on your account</li>
  <li>You may contact the rights owner directly to resolve the issue</li>
  <li>If resolved, the rights owner can withdraw the complaint</li>
</ol>

:::warning
Three or more unresolved VeRO strikes within a short period can result in permanent suspension. Don't ignore VeRO emails — respond immediately.
:::

<h2>VeRO Safety Checklist</h2>

:::faq
Q: Can I sell genuine, authentic branded products on eBay?
A: Generally yes, but some brands (particularly luxury goods) restrict resale even of authentic items. Check the specific brand's VeRO page before listing.

Q: What if I didn't know the item was VeRO protected?
A: Ignorance is not a defense with eBay. However, contacting the rights owner and removing the listing quickly can help prevent further action.

Q: Can I appeal a VeRO removal?
A: You can contact the rights owner directly and ask them to retract the complaint. eBay itself doesn't mediate VeRO disputes — it's between you and the brand.

Q: Does using "not affiliated with [Brand]" protect me?
A: No. This disclaimer does not protect against VeRO complaints. If you're using a brand name without permission, the disclaimer won't help.
:::`
  },

  // ── 12. EBAY FEE CALCULATOR EXPLAINER ───────────────────────────────────
  {
    id:           'fee-calculator',
    name:         'eBay Fee Calculator Explainer',
    description:  'Breaks down every eBay fee with tables, embedded calculator, and profit maximization tips.',
    icon:         Calculator,
    color:        C.blue,
    category:     'eBay Specific',
    wordEstimate: '1,200–2,000 words',
    previewLines: ['Fee overview intro', 'Fee breakdown table', 'Category fee table', 'Live calculator block', 'Profit tips'],
    defaultTitle: 'eBay Seller Fees Explained: Complete Breakdown + Free Calculator ([Year])',
    defaultMeta:  'Every eBay seller fee explained in plain English — insertion fees, final value fees, promoted listings, and more. Includes a free profit calculator.',
    html: `${IMG.hero('eBay Fees Explained — Complete Breakdown + Calculator')}

<h1>eBay Seller Fees Explained: Complete Breakdown + Free Calculator ([Year])</h1>

<p>eBay fees can eat 15-20% of your revenue before you even factor in the cost of goods. Most sellers dramatically underestimate what they're actually paying — and it's killing their margins.</p>

<p>This guide breaks down every single eBay fee, shows you exactly how to calculate your true profit, and gives you a free calculator to use on every listing.</p>

:::info
Key Insight: The average eBay seller pays 13-15% in platform fees alone. Adding shipping supplies, returns, and payment processing, the real cost is often 20-25% of sale price. Knowing this changes how you price.
:::

<h2>The Main eBay Fees You Pay</h2>

<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <thead>
    <tr>
      <th style="border:1px solid #e8ede2;padding:10px 14px;background:#f7f9f5;font-size:12px;text-align:left">Fee Type</th>
      <th style="border:1px solid #e8ede2;padding:10px 14px;background:#f7f9f5;font-size:12px;text-align:left">When Charged</th>
      <th style="border:1px solid #e8ede2;padding:10px 14px;background:#f7f9f5;font-size:12px;text-align:left">Typical Rate</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px;font-weight:600">Insertion Fee</td><td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px">When you list (after free allowance)</td><td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px">$0.35 per listing</td></tr>
    <tr style="background:#f7f9f5"><td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px;font-weight:600">Final Value Fee</td><td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px">When item sells</td><td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px">3–15% of total sale</td></tr>
    <tr><td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px;font-weight:600">Promoted Listings</td><td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px">When promoted item sells</td><td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px">2–12% ad rate</td></tr>
    <tr style="background:#f7f9f5"><td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px;font-weight:600">Store Subscription</td><td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px">Monthly</td><td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px">$4.95–$2,999.95/mo</td></tr>
    <tr><td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px;font-weight:600">International Fee</td><td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px">On cross-border sales</td><td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px">+1.65% of sale</td></tr>
    <tr style="background:#f7f9f5"><td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px;font-weight:600">Below Standard Penalty</td><td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px">If seller rating drops</td><td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px">+5% on final value fee</td></tr>
  </tbody>
</table>

<h2>Final Value Fees by Category</h2>

<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <thead>
    <tr>
      <th style="border:1px solid #e8ede2;padding:8px 12px;background:#f7f9f5;font-size:11px;text-align:left">Category</th>
      <th style="border:1px solid #e8ede2;padding:8px 12px;background:#f7f9f5;font-size:11px;text-align:left">Fee Rate</th>
      <th style="border:1px solid #e8ede2;padding:8px 12px;background:#f7f9f5;font-size:11px;text-align:left">Max Fee</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="border:1px solid #e8ede2;padding:7px 12px;font-size:12px">Electronics</td><td style="border:1px solid #e8ede2;padding:7px 12px;font-size:12px">3%</td><td style="border:1px solid #e8ede2;padding:7px 12px;font-size:12px">$750</td></tr>
    <tr style="background:#f7f9f5"><td style="border:1px solid #e8ede2;padding:7px 12px;font-size:12px">Clothing, Shoes & Accessories</td><td style="border:1px solid #e8ede2;padding:7px 12px;font-size:12px">15% (under $100) / 9% (over $100)</td><td style="border:1px solid #e8ede2;padding:7px 12px;font-size:12px">$750</td></tr>
    <tr><td style="border:1px solid #e8ede2;padding:7px 12px;font-size:12px">Collectibles & Art</td><td style="border:1px solid #e8ede2;padding:7px 12px;font-size:12px">15% (under $1k) / 9% (over $1k)</td><td style="border:1px solid #e8ede2;padding:7px 12px;font-size:12px">No cap</td></tr>
    <tr style="background:#f7f9f5"><td style="border:1px solid #e8ede2;padding:7px 12px;font-size:12px">Home & Garden</td><td style="border:1px solid #e8ede2;padding:7px 12px;font-size:12px">13.25%</td><td style="border:1px solid #e8ede2;padding:7px 12px;font-size:12px">$750</td></tr>
    <tr><td style="border:1px solid #e8ede2;padding:7px 12px;font-size:12px">Toys & Hobbies</td><td style="border:1px solid #e8ede2;padding:7px 12px;font-size:12px">13.25%</td><td style="border:1px solid #e8ede2;padding:7px 12px;font-size:12px">$750</td></tr>
    <tr style="background:#f7f9f5"><td style="border:1px solid #e8ede2;padding:7px 12px;font-size:12px">Motors (vehicles)</td><td style="border:1px solid #e8ede2;padding:7px 12px;font-size:12px">Flat $35–$300</td><td style="border:1px solid #e8ede2;padding:7px 12px;font-size:12px">Varies</td></tr>
  </tbody>
</table>

<h2>Calculate Your Real Profit</h2>

<p>Use this calculator to find your true profit on any eBay listing — including all fees, shipping costs, and cost of goods:</p>

:::calculator:::

<h2>How to Maximize Your Profit Margins</h2>

### Tip 1: Price for fees from the start
<p>Never calculate profit on sale price alone. Always start with your desired profit and work backwards: Desired profit + COGS + fees + shipping = minimum sale price.</p>

### Tip 2: Know when a Store subscription pays off
<p>An eBay Store subscription gives you reduced final value fees and more free listings. Run the numbers: if your monthly fees exceed the store cost by more than the subscription price, get the store.</p>

### Tip 3: Be strategic with Promoted Listings
<p>Promoted listings add 2-12% to your fee bill. Only use them on items with margin to spare. Calculate: if the item sells for $50 at 5% promotion rate, that's an extra $2.50 fee per sale.</p>

### Tip 4: Maintain Top Rated Seller status
<p>Top Rated Sellers get a 10% discount on final value fees. On $10,000/month revenue at 13% fees, that's $130/month saved — worth more than most Store subscriptions.</p>

[CTA:free]

:::faq
Q: Are eBay fees charged on shipping too?
A: Yes — final value fees apply to the total amount including shipping and handling charges. This surprises many sellers.

Q: How do I calculate fees for international sales?
A: Add the standard final value fee + 1.65% international fee. Some categories have different rates for cross-border transactions.

Q: What is the free listing allowance?
A: Most sellers get 250 free listings per month. eBay Store subscribers get significantly more. After your allowance, insertion fees apply.
:::`
  },

  // ── 13. PRODUCT RESEARCH DEEP DIVE ───────────────────────────────────────
  {
    id:           'product-research',
    name:         'Product Research Deep Dive',
    description:  'Full niche analysis template with demand, competition, margins, sourcing, and verdict.',
    icon:         Search,
    color:        C.limeDeep,
    category:     'eBay Specific',
    wordEstimate: '1,500–2,500 words',
    previewLines: ['Niche overview', 'Demand analysis', 'Competition scan', 'Margin breakdown', 'Sourcing options', 'Go/No-Go verdict'],
    defaultTitle: '[Niche] on eBay: Is It Worth Selling in [Year]? (Full Research)',
    defaultMeta:  'Complete research breakdown for selling [niche] on eBay — demand data, competition analysis, profit margins, and sourcing guide.',
    html: `${IMG.hero('[Niche] on eBay — Full Market Research [Year]')}

<h1>[Niche] on eBay: Is It Worth Selling in [Year]? (Full Research)</h1>

<p>Before you invest time and money into a new eBay niche, you need to know the numbers. This deep dive covers everything: how much demand exists, how stiff the competition is, what margins look like, and where to source inventory.</p>

<p><strong>The short answer:</strong> [One sentence verdict — go or no-go and why.]</p>

<p style="background:#f7f9f5;border:1px solid #e8ede2;border-radius:12px;padding:16px;margin:16px 0;font-size:13px">
<strong>Research Summary</strong><br/>
<strong>Niche:</strong> [Niche Name]<br/>
<strong>eBay Category:</strong> [Category]<br/>
<strong>Average Sale Price:</strong> $[X]–$[Y]<br/>
<strong>Average Margin:</strong> [X]%<br/>
<strong>Competition Level:</strong> [Low / Medium / High / Very High]<br/>
<strong>Verdict:</strong> [Go / No-Go / Proceed with caution]
</p>

<h2>Demand Analysis</h2>

<h3>Search Volume & Trends</h3>
<p>[Analysis of how many people are searching for this product. Use eBay sold listings data, Google Trends, or other tools. Include specific numbers.]</p>

<h3>Seasonal Pattern</h3>
<p>[Does demand spike seasonally? When is peak season? When is the slow period? How should a seller plan inventory around this?]</p>

<h3>eBay Sold Listings Data</h3>
<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <thead>
    <tr>
      <th style="border:1px solid #e8ede2;padding:8px 12px;background:#f7f9f5;font-size:11px;text-align:left">Metric</th>
      <th style="border:1px solid #e8ede2;padding:8px 12px;background:#f7f9f5;font-size:11px;text-align:left">Data</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="border:1px solid #e8ede2;padding:8px 12px;font-size:13px">Active listings</td><td style="border:1px solid #e8ede2;padding:8px 12px;font-size:13px">[Number]</td></tr>
    <tr style="background:#f7f9f5"><td style="border:1px solid #e8ede2;padding:8px 12px;font-size:13px">Sold in last 30 days</td><td style="border:1px solid #e8ede2;padding:8px 12px;font-size:13px">[Number]</td></tr>
    <tr><td style="border:1px solid #e8ede2;padding:8px 12px;font-size:13px">Sell-through rate</td><td style="border:1px solid #e8ede2;padding:8px 12px;font-size:13px">[X]%</td></tr>
    <tr style="background:#f7f9f5"><td style="border:1px solid #e8ede2;padding:8px 12px;font-size:13px">Average sale price</td><td style="border:1px solid #e8ede2;padding:8px 12px;font-size:13px">$[X]</td></tr>
    <tr><td style="border:1px solid #e8ede2;padding:8px 12px;font-size:13px">Price range</td><td style="border:1px solid #e8ede2;padding:8px 12px;font-size:13px">$[low]–$[high]</td></tr>
  </tbody>
</table>

<h2>Competition Analysis</h2>

${IMG.screenshot('eBay search results for [Niche] — competition landscape screenshot')}

<h3>Who is Already Selling This?</h3>
<p>[Description of current top sellers in this niche — are they big stores or individual sellers? What are their feedback scores? How long have they been selling this?]</p>

<h3>Listing Quality Assessment</h3>
<p>[Are current listings well-optimized or is there room for a new seller to win with better photos, titles, or descriptions?]</p>

:::info
Opportunity Signal: [Describe a specific gap in the market — poor photos, weak titles, missing keywords, high prices — that a new seller could exploit.]
:::

<h3>Competition Verdict</h3>
<p>[Your honest assessment. High competition doesn't automatically mean no-go — it means demand exists. Low competition could mean no demand or could mean opportunity.]</p>

<h2>Profit Margin Breakdown</h2>

:::calculator:::

<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <thead>
    <tr>
      <th style="border:1px solid #e8ede2;padding:8px 12px;background:#f7f9f5;font-size:11px;text-align:left">Cost Component</th>
      <th style="border:1px solid #e8ede2;padding:8px 12px;background:#f7f9f5;font-size:11px;text-align:right">Amount</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="border:1px solid #e8ede2;padding:8px 12px;font-size:13px">Average sale price</td><td style="border:1px solid #e8ede2;padding:8px 12px;font-size:13px;text-align:right">$[X]</td></tr>
    <tr style="background:#f7f9f5"><td style="border:1px solid #e8ede2;padding:8px 12px;font-size:13px">Cost of goods</td><td style="border:1px solid #e8ede2;padding:8px 12px;font-size:13px;text-align:right;color:#b91c1c">-$[X]</td></tr>
    <tr><td style="border:1px solid #e8ede2;padding:8px 12px;font-size:13px">eBay fees (~13.25%)</td><td style="border:1px solid #e8ede2;padding:8px 12px;font-size:13px;text-align:right;color:#b91c1c">-$[X]</td></tr>
    <tr style="background:#f7f9f5"><td style="border:1px solid #e8ede2;padding:8px 12px;font-size:13px">Shipping cost</td><td style="border:1px solid #e8ede2;padding:8px 12px;font-size:13px;text-align:right;color:#b91c1c">-$[X]</td></tr>
    <tr><td style="border:1px solid #e8ede2;padding:8px 12px;font-size:13px">Packaging</td><td style="border:1px solid #e8ede2;padding:8px 12px;font-size:13px;text-align:right;color:#b91c1c">-$[X]</td></tr>
    <tr style="background:#f4ffe6"><td style="border:1px solid #e8ede2;padding:8px 12px;font-size:13px;font-weight:800;color:#4a8f00">Net Profit</td><td style="border:1px solid #e8ede2;padding:8px 12px;font-size:13px;text-align:right;font-weight:800;color:#4a8f00">$[X] ([X]%)</td></tr>
  </tbody>
</table>

<h2>Where to Source [Niche] Products</h2>

<h3>Option 1: [Source Type] — Best for [situation]</h3>
<p><strong>Where:</strong> [Specific platforms, marketplaces, or contacts]<br/>
<strong>MOQ:</strong> [Minimum order quantity]<br/>
<strong>Lead time:</strong> [Days/weeks]<br/>
<strong>Typical cost:</strong> $[X] per unit</p>

<h3>Option 2: [Source Type] — Best for [situation]</h3>
<p><strong>Where:</strong> [Source]<br/>
<strong>MOQ:</strong> [MOQ]<br/>
<strong>Lead time:</strong> [Time]<br/>
<strong>Typical cost:</strong> $[X] per unit</p>

<h3>Option 3: [Source Type] — Best for [situation]</h3>
<p>[Description.]</p>

:::warning
Sourcing Risk: [Specific risk for this niche — counterfeits, quality issues, VeRO concerns, seasonal availability, etc. Be specific and actionable.]
:::

<h2>The Verdict: Should You Sell [Niche] on eBay?</h2>

<p style="background:#f4ffe6;border:1px solid rgba(143,255,0,0.3);border-radius:12px;padding:20px;margin:16px 0">
<strong style="color:#4a8f00;display:block;margin-bottom:8px">Final Verdict: [GO / NO-GO / PROCEED WITH CAUTION]</strong>
<span style="font-size:13px;color:#1a2410">[2-3 sentence summary of your recommendation. Include the key reason for your verdict and the #1 thing a seller should do if they decide to enter this niche.]</span>
</p>

<p><strong>Best suited for:</strong> [Type of seller this niche is right for]<br/>
<strong>Avoid if:</strong> [Type of seller or situation where this is a bad fit]<br/>
<strong>First step if going ahead:</strong> [Specific actionable first step]</p>

[CTA:starter]`
  },

  // ── 14. WHOLESALE SUPPLIER DIRECTORY ─────────────────────────────────────
  {
    id:           'supplier-directory',
    name:         'Wholesale Supplier Directory',
    description:  'Structured supplier review template with ratings, MOQ, contact info, and pros/cons.',
    icon:         Package,
    color:        C.amber,
    category:     'eBay Specific',
    wordEstimate: '1,500–2,500 words',
    previewLines: ['Intro + how to use', 'Supplier cards with ratings', 'MOQ + pricing tables', 'Contact info section', 'Tips for approaching suppliers'],
    defaultTitle: 'Best [Category] Wholesale Suppliers for eBay Sellers: [Year] Directory',
    defaultMeta:  'The top wholesale suppliers for [category] products — verified, rated, and reviewed specifically for eBay sellers. Updated [year].',
    html: `${IMG.hero('Best [Category] Wholesale Suppliers — [Year] Verified Directory')}

<h1>Best [Category] Wholesale Suppliers for eBay Sellers: [Year] Directory</h1>

<p>Finding reliable wholesale suppliers is one of the biggest challenges for eBay sellers. There are thousands of directories online, but most are outdated or full of middlemen charging retail prices.</p>

<p>This directory lists [X] verified wholesale suppliers for [category], with real information on minimum orders, pricing, reliability, and how to approach them as an eBay seller.</p>

:::info
How This Directory Works: Each supplier has been verified and includes: minimum order quantity (MOQ), typical wholesale prices, eBay-friendliness rating, and direct contact method. Updated [Month Year].
:::

<h2>Quick Comparison: All Suppliers at a Glance</h2>

<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <thead>
    <tr>
      <th style="border:1px solid #e8ede2;padding:8px 12px;background:#f7f9f5;font-size:11px;text-align:left">Supplier</th>
      <th style="border:1px solid #e8ede2;padding:8px 12px;background:#f7f9f5;font-size:11px;text-align:left">MOQ</th>
      <th style="border:1px solid #e8ede2;padding:8px 12px;background:#f7f9f5;font-size:11px;text-align:left">Price Range</th>
      <th style="border:1px solid #e8ede2;padding:8px 12px;background:#f7f9f5;font-size:11px;text-align:left">eBay Friendly</th>
      <th style="border:1px solid #e8ede2;padding:8px 12px;background:#f7f9f5;font-size:11px;text-align:left">Rating</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background:#f4ffe6">
      <td style="border:1px solid #e8ede2;padding:8px 12px;font-size:13px;font-weight:700">[Supplier 1] ⭐ Editor's Pick</td>
      <td style="border:1px solid #e8ede2;padding:8px 12px;font-size:12px">[MOQ]</td>
      <td style="border:1px solid #e8ede2;padding:8px 12px;font-size:12px">$[X]–$[Y]</td>
      <td style="border:1px solid #e8ede2;padding:8px 12px;font-size:12px;color:#16a34a">✓ Yes</td>
      <td style="border:1px solid #e8ede2;padding:8px 12px;font-size:12px">⭐⭐⭐⭐⭐</td>
    </tr>
    <tr>
      <td style="border:1px solid #e8ede2;padding:8px 12px;font-size:13px">[Supplier 2]</td>
      <td style="border:1px solid #e8ede2;padding:8px 12px;font-size:12px">[MOQ]</td>
      <td style="border:1px solid #e8ede2;padding:8px 12px;font-size:12px">$[X]–$[Y]</td>
      <td style="border:1px solid #e8ede2;padding:8px 12px;font-size:12px;color:#16a34a">✓ Yes</td>
      <td style="border:1px solid #e8ede2;padding:8px 12px;font-size:12px">⭐⭐⭐⭐</td>
    </tr>
    <tr style="background:#f7f9f5">
      <td style="border:1px solid #e8ede2;padding:8px 12px;font-size:13px">[Supplier 3]</td>
      <td style="border:1px solid #e8ede2;padding:8px 12px;font-size:12px">[MOQ]</td>
      <td style="border:1px solid #e8ede2;padding:8px 12px;font-size:12px">$[X]–$[Y]</td>
      <td style="border:1px solid #e8ede2;padding:8px 12px;font-size:12px;color:#d97706">Limited</td>
      <td style="border:1px solid #e8ede2;padding:8px 12px;font-size:12px">⭐⭐⭐</td>
    </tr>
  </tbody>
</table>

<h2>Supplier Reviews</h2>

<h3>1. [Supplier Name] — Best Overall</h3>

<p style="background:#f7f9f5;border:1px solid #e8ede2;border-radius:10px;padding:14px;margin:12px 0;font-size:13px">
<strong>Website:</strong> <a href="[URL]">[URL]</a><br/>
<strong>Location:</strong> [Country/Region]<br/>
<strong>MOQ:</strong> [Quantity] units / $[Amount]<br/>
<strong>Payment:</strong> [Methods accepted]<br/>
<strong>Lead Time:</strong> [X–Y business days]<br/>
<strong>Dropshipping:</strong> [Yes/No]<br/>
<strong>eBay Policy:</strong> [Their policy on resellers]
</p>

<p>[Description of the supplier — how long they've been in business, what makes them stand out, what categories they specialize in, any red flags to know about.]</p>

<p><strong>What we like:</strong></p>
<ul>
  <li>[Strength 1]</li>
  <li>[Strength 2]</li>
  <li>[Strength 3]</li>
</ul>

<p><strong>What to watch out for:</strong></p>
<ul>
  <li>[Watch out 1]</li>
  <li>[Watch out 2]</li>
</ul>

<hr style="border:none;border-top:1px solid #e8ede2;margin:20px 0"/>

<h3>2. [Supplier Name] — Best for Small Orders</h3>

<p style="background:#f7f9f5;border:1px solid #e8ede2;border-radius:10px;padding:14px;margin:12px 0;font-size:13px">
<strong>Website:</strong> <a href="[URL]">[URL]</a><br/>
<strong>Location:</strong> [Location]<br/>
<strong>MOQ:</strong> [MOQ]<br/>
<strong>Payment:</strong> [Methods]<br/>
<strong>Lead Time:</strong> [Time]<br/>
<strong>Dropshipping:</strong> [Yes/No]
</p>

<p>[Description.]</p>

<hr style="border:none;border-top:1px solid #e8ede2;margin:20px 0"/>

<h3>3. [Supplier Name] — Best for [Specific Advantage]</h3>

<p style="background:#f7f9f5;border:1px solid #e8ede2;border-radius:10px;padding:14px;margin:12px 0;font-size:13px">
<strong>Website:</strong> <a href="[URL]">[URL]</a><br/>
<strong>Location:</strong> [Location]<br/>
<strong>MOQ:</strong> [MOQ]<br/>
<strong>Payment:</strong> [Methods]<br/>
<strong>Lead Time:</strong> [Time]
</p>

<p>[Description.]</p>

<h2>How to Approach These Suppliers as an eBay Seller</h2>

### Step 1: Have your business credentials ready
<p>Most legitimate wholesalers require proof you're a real business: your resale certificate, business registration, or at minimum a professional email address and website. Get these in order before reaching out.</p>

### Step 2: Start with a small test order
<p>Never commit to large inventory from a new supplier. Order the minimum, check quality thoroughly, then scale if satisfied. Even reputable suppliers have quality inconsistencies.</p>

### Step 3: Negotiate from the second order
<p>Your first order is about testing. Your second order is when you negotiate. Once you've proven you're a reliable customer, ask about volume discounts, net-30 terms, and exclusive arrangements.</p>

:::info
Pro Tip: When emailing suppliers, mention your eBay store specifically. Many wholesalers have worked with eBay sellers before and understand the resale model. Being upfront builds trust faster than being vague about your sales channel.
:::

[CTA:starter]`
  },

  // ── 15. EBAY POLICY UPDATE TRACKER ───────────────────────────────────────
  {
    id:           'policy-tracker',
    name:         'eBay Policy Update Tracker',
    description:  'Old vs new policy comparison with compliance checklist and deadline tracker.',
    icon:         Bell,
    color:        C.red,
    category:     'eBay Specific',
    wordEstimate: '800–1,500 words',
    previewLines: ['Policy change summary', 'Old vs new comparison table', 'Who is affected', 'Compliance checklist', 'FAQ'],
    defaultTitle: 'eBay [Policy Name] Update [Month Year]: What Changed and What To Do',
    defaultMeta:  'eBay updated its [policy] policy in [month]. Here is exactly what changed, who is affected, and the steps you need to take before [deadline].',
    html: `${IMG.hero('eBay Policy Update Alert — [Policy Name] Changes [Month Year]')}

<h1>eBay [Policy Name] Update [Month Year]: What Changed and What To Do</h1>

<p>eBay has updated its <strong>[Policy Name]</strong> policy, effective <strong>[Date]</strong>. This change affects [who is affected] and requires action from sellers who [specific condition].</p>

<p>This tracker gives you everything you need: exactly what changed, how it compares to the old policy, who needs to act, and a compliance checklist.</p>

:::warning
Deadline: Sellers must comply by [Date]. Non-compliance may result in [consequence]. If you sell [category/type], read this now.
:::

<h2>What Changed: Old Policy vs New Policy</h2>

<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <thead>
    <tr>
      <th style="border:1px solid #e8ede2;padding:10px 14px;background:#FEF2F2;color:#b91c1c;text-align:left;font-size:12px">Old Policy (Before [Date])</th>
      <th style="border:1px solid #e8ede2;padding:10px 14px;background:#f4ffe6;color:#4a8f00;text-align:left;font-size:12px">New Policy (After [Date])</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #e8ede2;padding:10px 14px;font-size:13px;vertical-align:top">[Old rule 1]</td>
      <td style="border:1px solid #e8ede2;padding:10px 14px;font-size:13px;vertical-align:top"><strong>[New rule 1]</strong></td>
    </tr>
    <tr style="background:#f7f9f5">
      <td style="border:1px solid #e8ede2;padding:10px 14px;font-size:13px;vertical-align:top">[Old rule 2]</td>
      <td style="border:1px solid #e8ede2;padding:10px 14px;font-size:13px;vertical-align:top"><strong>[New rule 2]</strong></td>
    </tr>
    <tr>
      <td style="border:1px solid #e8ede2;padding:10px 14px;font-size:13px;vertical-align:top">[Old rule 3]</td>
      <td style="border:1px solid #e8ede2;padding:10px 14px;font-size:13px;vertical-align:top"><strong>[New rule 3]</strong></td>
    </tr>
    <tr style="background:#f7f9f5">
      <td style="border:1px solid #e8ede2;padding:10px 14px;font-size:13px;vertical-align:top">[Old rule 4 — unchanged]</td>
      <td style="border:1px solid #e8ede2;padding:10px 14px;font-size:13px;vertical-align:top">[Same — no change]</td>
    </tr>
  </tbody>
</table>

<h2>Who Is Affected?</h2>

<p>This policy change affects you if:</p>
<ul>
  <li>[Condition 1 — be specific]</li>
  <li>[Condition 2]</li>
  <li>[Condition 3]</li>
</ul>

<p>This change does <strong>not</strong> affect:</p>
<ul>
  <li>[Exclusion 1]</li>
  <li>[Exclusion 2]</li>
</ul>

<h2>Why eBay Made This Change</h2>

<p>eBay's official reason: "[Quote from official eBay announcement or policy page]."</p>

<p>Our analysis: [Your interpretation of the real reason — regulatory pressure, buyer complaints, competitive response, etc.]</p>

<h2>Compliance Checklist</h2>

<p>Complete these steps before <strong>[Deadline Date]</strong>:</p>

<p>☐ <strong>[Action 1]</strong> — [How to do it, where to find it in eBay seller hub]</p>
<p>☐ <strong>[Action 2]</strong> — [Instructions]</p>
<p>☐ <strong>[Action 3]</strong> — [Instructions]</p>
<p>☐ <strong>[Action 4]</strong> — [Instructions]</p>
<p>☐ <strong>Verify compliance</strong> — [How to confirm you're now compliant]</p>

:::info
Quick Check: The fastest way to verify compliance is [specific check in eBay Seller Hub or Account Settings]. If you see [indicator], you're compliant. If you see [other indicator], take action immediately.
:::

<h2>What Happens If You Don't Comply</h2>

<p>According to eBay's policy: [Quote the specific consequence]. In practice, this typically means [realistic explanation of enforcement].</p>

<h2>Our Recommendation</h2>

<p>[Your practical advice. Be direct. If the change is annoying but minor, say so. If it's genuinely disruptive, say so. Sellers value honest assessment over neutral reporting.]</p>

:::faq
Q: I've been selling on eBay for years — do I still need to do anything?
A: [Answer]

Q: What if I've already been doing [new requirement]?
A: [Answer — usually they're already compliant and don't need to do anything]

Q: Where can I read the full official policy?
A: The full updated policy is available at [eBay policy page URL]. We recommend bookmarking it as eBay updates policies frequently.

Q: Will this affect my seller rating?
A: [Answer]
:::

<p><em>Last updated: [Date]. We monitor eBay policy updates and will revise this article if further changes are announced. Bookmark this page for the latest information.</em></p>

[CTA:free]`
  },

  // ── 16. EMAIL NEWSLETTER ─────────────────────────────────────────────────
  {
    id:           'email-newsletter',
    name:         'Email Newsletter',
    description:  'Weekly/monthly seller roundup with tips, tool spotlight, news, and CTA.',
    icon:         Mail,
    color:        C.blue,
    category:     'Content Marketing',
    wordEstimate: '500–900 words',
    previewLines: ['Week in review intro', '3 quick tips', 'Featured tool spotlight', 'Community highlight', 'CTA footer'],
    defaultTitle: 'The Riazify Seller Report — [Month] [Year] Edition',
    defaultMeta:  'Your monthly eBay seller digest: top tips, platform updates, tool recommendations, and exclusive insights from the Riazify team.',
    html: `${IMG.hero('The Riazify Seller Report — [Month] [Year] Edition')}

<h1>The Riazify Seller Report</h1>

<p style="font-size:13px;color:#8a9e78">[Month] [Year] · Issue #[Number] · [X] sellers reading</p>

<hr style="border:none;border-top:2px solid #e8ede2;margin:20px 0"/>

<h2>This Month in eBay Selling</h2>

<p>[2-3 sentence overview of the most important thing that happened in the eBay selling world this month. Keep it conversational — write like you're emailing a friend who also sells on eBay.]</p>

<p>[Second paragraph with your personal take or reaction to the news.]</p>

<hr style="border:none;border-top:1px solid #e8ede2;margin:20px 0"/>

<h2>3 Tips Worth Your Time This Week</h2>

<h3>1. [Tip Title]</h3>
<p>[Actionable tip in 2-3 sentences. Be specific — include a number, a tool name, or an exact step. "Optimize your listings" is not a tip. "Add your top 3 keywords in the first 5 words of your title" is a tip.]</p>

<h3>2. [Tip Title]</h3>
<p>[Tip.]</p>

<h3>3. [Tip Title]</h3>
<p>[Tip.]</p>

<hr style="border:none;border-top:1px solid #e8ede2;margin:20px 0"/>

<h2>Tool Spotlight: [Tool Name]</h2>

<p>[1-2 paragraph honest review of a tool — could be Riazify feature, a third-party tool, an eBay feature, or even a free resource. What does it do? Who should use it? What does it cost?]</p>

<p><strong>Best for:</strong> [Type of seller]<br/>
<strong>Cost:</strong> [Free / $X]<br/>
<strong>Try it:</strong> <a href="[URL]">[Link text]</a></p>

<hr style="border:none;border-top:1px solid #e8ede2;margin:20px 0"/>

<h2>From the Community</h2>

<p>[Share a seller question, success story, or forum discussion that's worth highlighting. Could be a question you received, something from the Riazify community, or a tip from one of your users.]</p>

<p><em>"[Quote from community member if you have one]" — [Name/Username]</em></p>

<hr style="border:none;border-top:1px solid #e8ede2;margin:20px 0"/>

<h2>Quick Reads This Month</h2>

<ul>
  <li><a href="[URL]">[Article title]</a> — [One sentence on why it's worth reading]</li>
  <li><a href="[URL]">[Article title]</a> — [Description]</li>
  <li><a href="[URL]">[Article title]</a> — [Description]</li>
</ul>

<hr style="border:none;border-top:2px solid #e8ede2;margin:20px 0"/>

[CTA:free]

<p style="font-size:12px;color:#8a9e78;text-align:center;margin-top:20px">
You're receiving this because you signed up at riazify.com<br/>
<a href="/unsubscribe" style="color:#8a9e78">Unsubscribe</a> · <a href="/blog" style="color:#8a9e78">Read online</a>
</p>`
  },

  // ── 17. INTERVIEW / Q&A ───────────────────────────────────────────────────
  {
    id:           'interview',
    name:         'Interview / Q&A',
    description:  'Seller or expert interview with bio block, styled Q&A pairs, and pull quotes.',
    icon:         MessageSquare,
    color:        C.limeDeep,
    category:     'Content Marketing',
    wordEstimate: '1,200–2,000 words',
    previewLines: ['Expert bio card', 'Context intro', 'Styled Q&A pairs', 'Pull quote blocks', 'Key takeaways'],
    defaultTitle: '"[Key Quote]" — An Interview with [Name], [Title]',
    defaultMeta:  'We sat down with [Name] to talk about [topic]. Here is what this [X]-year eBay veteran had to say about [key insight].',
    html: `${IMG.inline('[Name] — Interview portrait or headshot placeholder')}

<h1>"[Key Quote from the Interview]" — A Conversation with [Name]</h1>

<p>[Name] has been selling on eBay for [X] years. In that time, [they've/he's/she's] [key achievement — specific numbers preferred]. We sat down with [them/him/her] to talk about [main topic] and what [they've] learned that most sellers don't know.</p>

<p style="background:#f7f9f5;border:1px solid #e8ede2;border-radius:12px;padding:16px;margin:16px 0;font-size:13px">
<strong style="font-size:15px;display:block;margin-bottom:4px">[Full Name]</strong>
<span style="color:#8a9e78">[Title / Role]</span><br/><br/>
<strong>eBay selling since:</strong> [Year]<br/>
<strong>Speciality:</strong> [Category/Niche]<br/>
<strong>Monthly revenue:</strong> $[X]<br/>
<strong>Number of listings:</strong> [X]<br/>
<strong>Location:</strong> [City, Country]
</p>

<hr style="border:none;border-top:1px solid #e8ede2;margin:24px 0"/>

<p style="font-size:13px;color:#8a9e78;font-style:italic">The following interview has been lightly edited for clarity and length.</p>

<h2>The Interview</h2>

<p style="background:#f4ffe6;border-left:3px solid #8fff00;padding:14px 16px;border-radius:0 12px 12px 0;margin:16px 0"><strong>Riazify:</strong> [Question 1 — start broad, let them introduce themselves and their story]</p>

<p style="background:#f7f9f5;padding:14px 16px;border-radius:12px;margin:8px 0"><strong>[Name]:</strong> [Answer. Write conversationally — use their actual words if you have them, or write as if you do. Include specific details, numbers, and anecdotes.]</p>

<p style="background:#f4ffe6;border-left:3px solid #8fff00;padding:14px 16px;border-radius:0 12px 12px 0;margin:16px 0"><strong>Riazify:</strong> [Question 2 — dig into a specific challenge or turning point]</p>

<p style="background:#f7f9f5;padding:14px 16px;border-radius:12px;margin:8px 0"><strong>[Name]:</strong> [Answer.]</p>

<p style="font-size:18px;font-style:italic;border-left:4px solid #8fff00;padding:16px 20px;margin:24px 0;color:#1a2410;line-height:1.5">"[Pull the most quotable, insightful sentence from their answer and put it here as a blockquote. This breaks up the page visually and teases the best content.]"</p>

<p style="background:#f4ffe6;border-left:3px solid #8fff00;padding:14px 16px;border-radius:0 12px 12px 0;margin:16px 0"><strong>Riazify:</strong> [Question 3 — ask about a specific strategy or tactic]</p>

<p style="background:#f7f9f5;padding:14px 16px;border-radius:12px;margin:8px 0"><strong>[Name]:</strong> [Answer.]</p>

<p style="background:#f4ffe6;border-left:3px solid #8fff00;padding:14px 16px;border-radius:0 12px 12px 0;margin:16px 0"><strong>Riazify:</strong> [Question 4 — ask about a mistake or failure]</p>

<p style="background:#f7f9f5;padding:14px 16px;border-radius:12px;margin:8px 0"><strong>[Name]:</strong> [Answer. Vulnerability and honesty here makes this section the most shareable.]</p>

<p style="background:#f4ffe6;border-left:3px solid #8fff00;padding:14px 16px;border-radius:0 12px 12px 0;margin:16px 0"><strong>Riazify:</strong> [Question 5 — what advice would you give someone starting out today?]</p>

<p style="background:#f7f9f5;padding:14px 16px;border-radius:12px;margin:8px 0"><strong>[Name]:</strong> [Answer.]</p>

<p style="font-size:18px;font-style:italic;border-left:4px solid #8fff00;padding:16px 20px;margin:24px 0;color:#1a2410;line-height:1.5">"[Second pull quote — ideally the most actionable or surprising thing they said.]"</p>

<p style="background:#f4ffe6;border-left:3px solid #8fff00;padding:14px 16px;border-radius:0 12px 12px 0;margin:16px 0"><strong>Riazify:</strong> [Final question — what's next for you / where can people follow you?]</p>

<p style="background:#f7f9f5;padding:14px 16px;border-radius:12px;margin:8px 0"><strong>[Name]:</strong> [Answer. Include their social media or eBay store link if they have one.]</p>

<hr style="border:none;border-top:2px solid #e8ede2;margin:24px 0"/>

<h2>Key Takeaways</h2>

<ul>
  <li>[Most important lesson from the interview]</li>
  <li>[Second key insight]</li>
  <li>[Third actionable takeaway]</li>
  <li>[Any surprising or counterintuitive thing they said]</li>
</ul>

<p><em>Want to be featured in a future Riazify interview? <a href="/contact">Get in touch</a> — we feature sellers at all levels, from part-time side hustlers to seven-figure eBay businesses.</em></p>

[CTA:free]`
  },

  // ── 18. GLOSSARY ─────────────────────────────────────────────────────────
  {
    id:           'glossary',
    name:         'Glossary / Dictionary',
    description:  'Alphabetical reference article with definitions, examples, and related terms.',
    icon:         BookMarked,
    color:        C.blue,
    category:     'Content Marketing',
    wordEstimate: '2,000–4,000 words',
    previewLines: ['Intro + how to use', 'Alphabetical sections', 'Term cards with examples', 'Related terms', 'CTA at bottom'],
    defaultTitle: 'eBay Seller Glossary: [X] Terms Every Seller Needs to Know ([Year])',
    defaultMeta:  'The complete eBay seller glossary — [X] terms defined in plain English, with examples and related concepts. Bookmark this for reference.',
    html: `${IMG.hero('eBay Seller Glossary — [X] Essential Terms Explained [Year]')}

<h1>eBay Seller Glossary: [X] Terms Every Seller Needs to Know ([Year])</h1>

<p>eBay selling comes with its own language. From VeRO to FVF to PowerSeller, the jargon can be overwhelming — especially when you're just starting out. This glossary defines the most important terms in plain English, with examples of how each one applies to real eBay selling.</p>

<p><strong>How to use this glossary:</strong> Use Ctrl+F (or Cmd+F on Mac) to search for a specific term, or browse alphabetically through the sections below.</p>

:::info
Bookmark This Page: eBay policies and features change regularly. We update this glossary when terminology changes. Save this URL for quick reference when you encounter an unfamiliar term.
:::

<hr style="border:none;border-top:2px solid #e8ede2;margin:24px 0"/>

<h2>A</h2>

<h3>Auction-Style Listing</h3>
<p><strong>Definition:</strong> A listing format where buyers bid against each other and the highest bidder at the end of the auction period wins the item.</p>
<p><strong>Example:</strong> You list a vintage camera starting at $1 with a 7-day auction. Five buyers bid, and the final price reaches $85.</p>
<p><strong>Related terms:</strong> Buy It Now, Reserve Price, Starting Bid</p>

<h3>About Me Page</h3>
<p><strong>Definition:</strong> A customizable page on eBay where sellers can share information about their business, policies, and background.</p>
<p><strong>Example:</strong> [Example]</p>
<p><strong>Related terms:</strong> Seller Profile, Feedback Score</p>

<h2>B</h2>

<h3>Best Offer</h3>
<p><strong>Definition:</strong> A feature that allows buyers to submit an offer below the listed price. Sellers can accept, decline, or counter the offer.</p>
<p><strong>Example:</strong> You list an item at $100 with Best Offer enabled. A buyer offers $80. You counter at $90, they accept.</p>
<p><strong>Related terms:</strong> Fixed Price, Negotiation, Auto-Accept</p>

<h3>Buy It Now (BIN)</h3>
<p><strong>Definition:</strong> A fixed price listing format where buyers can purchase immediately at the listed price without bidding.</p>
<p><strong>Example:</strong> [Example]</p>
<p><strong>Related terms:</strong> Auction, Fixed Price, Immediate Purchase</p>

<h2>C</h2>

<h3>Cassini</h3>
<p><strong>Definition:</strong> eBay's search algorithm that determines which listings appear at the top of search results and in what order.</p>
<p><strong>Example:</strong> A listing with complete item specifics, competitive pricing, and fast shipping ranks higher in Cassini than a listing missing these elements.</p>
<p><strong>Related terms:</strong> Search Rankings, Best Match, Item Specifics</p>

<h2>D</h2>

<h3>Defect Rate</h3>
<p><strong>Definition:</strong> The percentage of transactions that result in negative seller performance events — such as cancelled transactions, late shipments, or cases closed without seller resolution.</p>
<p><strong>Example:</strong> If you have 100 transactions and 2 result in defects, your defect rate is 2%.</p>
<p><strong>Related terms:</strong> Seller Performance, Top Rated Seller, Service Metrics</p>

<h2>F</h2>

<h3>Feedback Score</h3>
<p><strong>Definition:</strong> A cumulative score based on ratings left by buyers and sellers after transactions. Each positive feedback adds 1 point; each negative subtracts 1.</p>
<p><strong>Example:</strong> [Example]</p>
<p><strong>Related terms:</strong> Positive Feedback Percentage, DSR, Seller Rating</p>

<h3>Final Value Fee (FVF)</h3>
<p><strong>Definition:</strong> The fee eBay charges when an item sells, calculated as a percentage of the total transaction amount including shipping.</p>
<p><strong>Example:</strong> You sell an item for $50 with $8 shipping. eBay charges the FVF on the full $58.</p>
<p><strong>Related terms:</strong> Insertion Fee, Selling Fees, Fee Calculator</p>

<h2>I</h2>

<h3>Item Specifics</h3>
<p><strong>Definition:</strong> Structured data fields that describe key attributes of a listing — such as brand, size, color, condition, and material. eBay uses these for search filtering.</p>
<p><strong>Example:</strong> For a shirt listing: Brand = Nike, Size = Medium, Color = Blue, Material = Cotton.</p>
<p><strong>Related terms:</strong> Cassini, Search Visibility, Category</p>

<h2>P</h2>

<h3>PowerSeller</h3>
<p><strong>Definition:</strong> A historical eBay seller tier for high-volume sellers. eBay replaced it with the Top Rated Seller program in 2011, but the term is still used informally.</p>
<p><strong>Related terms:</strong> Top Rated Seller, Seller Level</p>

<h3>Promoted Listings</h3>
<p><strong>Definition:</strong> A paid advertising feature that gives your listings more visibility in search results. You set an ad rate and only pay when a buyer clicks your promoted listing and makes a purchase within 30 days.</p>
<p><strong>Example:</strong> You set a 5% ad rate on a $100 item. When it sells through the promoted listing, you pay an extra $5 ad fee.</p>
<p><strong>Related terms:</strong> Advertising, Visibility, Ad Rate</p>

<h2>S</h2>

<h3>Sell-Through Rate</h3>
<p><strong>Definition:</strong> The percentage of listings that result in a sale within a given period. Calculated as: (Number of items sold ÷ Number of items listed) × 100.</p>
<p><strong>Example:</strong> You list 50 items and 35 sell. Your sell-through rate is 70%.</p>
<p><strong>Related terms:</strong> Conversion Rate, Demand, Listing Performance</p>

<h2>T</h2>

<h3>Top Rated Seller (TRS)</h3>
<p><strong>Definition:</strong> eBay's highest seller tier, awarded to sellers who maintain low defect rates, fast shipping, and high buyer satisfaction. TRS sellers receive a 10% discount on final value fees.</p>
<p><strong>Related terms:</strong> Seller Level, Performance Standards, Fee Discounts</p>

<h2>V</h2>

<h3>VeRO (Verified Rights Owner)</h3>
<p><strong>Definition:</strong> eBay's intellectual property protection program allowing brand owners to report and remove listings that infringe on their trademarks or copyrights.</p>
<p><strong>Example:</strong> A listing selling counterfeit designer handbags gets reported through VeRO and removed within hours.</p>
<p><strong>Related terms:</strong> Intellectual Property, DMCA, Listing Removal</p>

<hr style="border:none;border-top:2px solid #e8ede2;margin:24px 0"/>

<p><em>Missing a term? <a href="/contact">Contact us</a> and we'll add it to the next update. This glossary is reviewed and updated quarterly.</em></p>

[CTA:free]`
  },

  // ── 19. RESOURCE ROUNDUP ─────────────────────────────────────────────────
  {
    id:           'resource-roundup',
    name:         'Resource Roundup',
    description:  'Curated tools, articles, and videos with category sections and editor picks.',
    icon:         BookOpen,
    color:        C.green,
    category:     'Content Marketing',
    wordEstimate: '1,000–1,800 words',
    previewLines: ['Intro + curation criteria', 'Tool cards by category', 'Editor pick badges', 'Rating + link per resource', 'Closing CTA'],
    defaultTitle: 'The Best eBay Seller Resources in [Year]: [X] Tools, Guides & Communities',
    defaultMeta:  'The ultimate resource list for eBay sellers — [X] carefully curated tools, guides, communities, and learning resources. All free or low cost.',
    html: `${IMG.hero('Best eBay Seller Resources [Year] — Tools, Guides & Communities')}

<h1>The Best eBay Seller Resources in [Year]: [X] Tools, Guides & Communities</h1>

<p>There's no shortage of eBay selling advice online — but most of it is outdated, generic, or trying to sell you something. This roundup cuts through the noise.</p>

<p>Everything on this list has been personally used and vetted. Each resource is rated on usefulness (does it actually help you sell more?), accessibility (is it free or affordable?), and currency (is it still relevant in [Year]?).</p>

:::info
Curation Standard: We only include resources we would personally recommend to a seller we care about. No sponsored placements, no affiliate arrangements. Just the tools that genuinely work.
:::

<h2>Research & Market Analysis Tools</h2>

<h3>1. [Tool Name] — Best for [Use Case]</h3>
<p style="background:#f7f9f5;border:1px solid #e8ede2;border-radius:10px;padding:12px 14px;margin:8px 0;font-size:13px">
<strong>Cost:</strong> [Free / $X/mo] &nbsp;|&nbsp; <strong>Rating:</strong> ⭐⭐⭐⭐⭐ &nbsp;|&nbsp; <a href="[URL]">Visit Tool →</a>
</p>
<p>[2-3 sentence description. What does it do? Who should use it? What's the one thing it does better than anything else?]</p>

<h3>2. [Tool Name] — Best for [Use Case]</h3>
<p style="background:#f7f9f5;border:1px solid #e8ede2;border-radius:10px;padding:12px 14px;margin:8px 0;font-size:13px">
<strong>Cost:</strong> [Free / $X/mo] &nbsp;|&nbsp; <strong>Rating:</strong> ⭐⭐⭐⭐ &nbsp;|&nbsp; <a href="[URL]">Visit Tool →</a>
</p>
<p>[Description.]</p>

<h3>3. [Tool Name]</h3>
<p style="background:#f7f9f5;border:1px solid #e8ede2;border-radius:10px;padding:12px 14px;margin:8px 0;font-size:13px">
<strong>Cost:</strong> [Cost] &nbsp;|&nbsp; <strong>Rating:</strong> ⭐⭐⭐ &nbsp;|&nbsp; <a href="[URL]">Visit Tool →</a>
</p>
<p>[Description.]</p>

<h2>Listing Optimization</h2>

<h3>4. Riazify Title Builder ⭐ Editor's Pick</h3>
<p style="background:#f4ffe6;border:1px solid rgba(143,255,0,0.3);border-radius:10px;padding:12px 14px;margin:8px 0;font-size:13px">
<strong>Cost:</strong> Free &nbsp;|&nbsp; <strong>Rating:</strong> ⭐⭐⭐⭐⭐ &nbsp;|&nbsp; <a href="/dashboard/title-builder">Try Free →</a>
</p>
<p>AI-powered eBay title builder that generates optimized titles based on keywords, category data, and eBay's Cassini algorithm. The fastest way to write titles that actually rank.</p>

<h3>5. [Tool Name]</h3>
<p style="background:#f7f9f5;border:1px solid #e8ede2;border-radius:10px;padding:12px 14px;margin:8px 0;font-size:13px">
<strong>Cost:</strong> [Cost] &nbsp;|&nbsp; <strong>Rating:</strong> ⭐⭐⭐⭐ &nbsp;|&nbsp; <a href="[URL]">Visit Tool →</a>
</p>
<p>[Description.]</p>

<h2>Finance & Accounting</h2>

<h3>6. Riazify Profit Calculator ⭐ Editor's Pick</h3>
<p style="background:#f4ffe6;border:1px solid rgba(143,255,0,0.3);border-radius:10px;padding:12px 14px;margin:8px 0;font-size:13px">
<strong>Cost:</strong> Free &nbsp;|&nbsp; <strong>Rating:</strong> ⭐⭐⭐⭐⭐ &nbsp;|&nbsp; <a href="/dashboard/profit-calculator">Try Free →</a>
</p>
<p>Calculates real eBay profit after all fees — insertion, final value, promoted listings, shipping, and cost of goods. The most accurate fee calculator we've found.</p>

<h3>7. [Tool Name]</h3>
<p style="background:#f7f9f5;border:1px solid #e8ede2;border-radius:10px;padding:12px 14px;margin:8px 0;font-size:13px">
<strong>Cost:</strong> [Cost] &nbsp;|&nbsp; <strong>Rating:</strong> ⭐⭐⭐ &nbsp;|&nbsp; <a href="[URL]">Visit →</a>
</p>
<p>[Description.]</p>

<h2>Learning & Education</h2>

<h3>8. [Resource Name]</h3>
<p style="background:#f7f9f5;border:1px solid #e8ede2;border-radius:10px;padding:12px 14px;margin:8px 0;font-size:13px">
<strong>Format:</strong> [YouTube / Course / Podcast / Blog] &nbsp;|&nbsp; <strong>Cost:</strong> [Free / $X] &nbsp;|&nbsp; <a href="[URL]">Access →</a>
</p>
<p>[Description. Who runs it? What level is it aimed at? What's the best thing about it?]</p>

<h3>9. [Resource Name]</h3>
<p style="background:#f7f9f5;border:1px solid #e8ede2;border-radius:10px;padding:12px 14px;margin:8px 0;font-size:13px">
<strong>Format:</strong> [Format] &nbsp;|&nbsp; <strong>Cost:</strong> [Cost] &nbsp;|&nbsp; <a href="[URL]">Access →</a>
</p>
<p>[Description.]</p>

<h2>Communities & Networking</h2>

<h3>10. [Community Name]</h3>
<p style="background:#f7f9f5;border:1px solid #e8ede2;border-radius:10px;padding:12px 14px;margin:8px 0;font-size:13px">
<strong>Platform:</strong> [Reddit / Facebook / Discord / Forum] &nbsp;|&nbsp; <strong>Members:</strong> [X]k &nbsp;|&nbsp; <a href="[URL]">Join →</a>
</p>
<p>[Description. What kind of discussions happen here? Is it beginner-friendly or advanced? What makes this community worth joining?]</p>

<hr style="border:none;border-top:2px solid #e8ede2;margin:24px 0"/>

<h2>The Riazify Suite — All Your eBay Tools in One Place</h2>

<p>Everything above is great for specific tasks. But if you want one platform that handles order protection, profit calculation, title building, and product research all in one place, Riazify was built specifically for eBay sellers.</p>

[CTA:starter]`
  },

  // ── 20. LANDING PAGE STYLE POST ──────────────────────────────────────────
  {
    id:           'landing-page-post',
    name:         'Landing Page Style Post',
    description:  'High-conversion blog post with pain points, solution, social proof, pricing, and CTAs throughout.',
    icon:         Globe,
    color:        C.limeDeep,
    category:     'Sales & Conversion',
    wordEstimate: '1,500–2,500 words',
    previewLines: ['Hero + hook', 'Pain points section', 'Solution reveal', 'Social proof', 'Pricing table', 'FAQ + CTA'],
    defaultTitle: 'Stop Losing Money on eBay: How [Solution] Fixes [Problem] for Good',
    defaultMeta:  'Most eBay sellers lose [X]% of revenue to [problem]. Here s the system that fixes it — used by [X]+ sellers to [result].',
    html: `${IMG.hero('Stop Losing Money on eBay — How [Solution] Fixes [Problem]')}

<h1>Stop Losing Money on eBay: How [Solution] Fixes [Problem] for Good</h1>

<p>The average eBay seller loses <strong>[X]% of their revenue</strong> to [problem]. That's not a rounding error — on $5,000/month revenue, that's $[X] gone every single month.</p>

<p>If you've been selling on eBay for more than a few months, you know the feeling: [emotional description of the pain]. You're doing everything right, but [problem] keeps eating into your margins.</p>

<p>There's a fix. And it's simpler than you think.</p>

<hr style="border:none;border-top:1px solid #e8ede2;margin:24px 0"/>

<h2>The Problem Most Sellers Ignore (Until It's Too Late)</h2>

<p>[Paint the problem vividly. Use specifics. What does it feel like? What does it cost? What does a bad day look like for a seller dealing with this?]</p>

<p>Here's what actually happens when [problem] goes unresolved:</p>
<ul>
  <li>[Consequence 1 — make it concrete and emotionally resonant]</li>
  <li>[Consequence 2]</li>
  <li>[Consequence 3]</li>
  <li>[Consequence 4 — this should be the worst one]</li>
</ul>

:::warning
The Hidden Cost: Most sellers underestimate how much [problem] is costing them because [reason it's hard to see]. When you actually calculate it — [calculation] — the number is shocking.
:::

<h2>Why Common Solutions Don't Work</h2>

<p>You've probably already tried [common solution 1]. Maybe [common solution 2]. Here's why they don't fix the real problem:</p>

<p><strong>[Common solution 1]</strong> addresses [symptom] but not [root cause]. So the problem keeps coming back.</p>

<p><strong>[Common solution 2]</strong> works for some sellers, but requires [downside — time, cost, complexity] that makes it unsustainable at scale.</p>

<p>What actually works is [your approach]. Here's why it's different.</p>

<hr style="border:none;border-top:1px solid #e8ede2;margin:24px 0"/>

<h2>The Solution: [Solution Name]</h2>

<p>[Solution] works by [mechanism — how does it actually solve the root cause?]. Instead of [old approach], it [new approach]. The result: [outcome].</p>

<p><strong>The key difference:</strong> [The one thing that makes this solution fundamentally better than the alternatives.]</p>

:::info
Here's the Core Insight: [The most important, counterintuitive thing about how this solution works. This is the "aha moment" that makes readers think "I never thought of it that way."]
:::

<h2>What Sellers Are Saying</h2>

<p>"[Testimonial 1 — specific result, specific seller, specific timeframe. Not generic.]" — <strong>[Name]</strong>, [type of seller]</p>

<p>"[Testimonial 2]" — <strong>[Name]</strong>, [type of seller]</p>

<p>"[Testimonial 3]" — <strong>[Name]</strong>, [type of seller]</p>

<h2>The Numbers</h2>

<p style="background:#f4ffe6;border:1px solid rgba(143,255,0,0.3);border-radius:12px;padding:20px;margin:16px 0">
<strong style="color:#4a8f00;font-size:15px;display:block;margin-bottom:12px">Results from [X]+ Riazify Sellers</strong>
<span style="display:block;font-size:14px;color:#1a2410;margin-bottom:6px">📈 Average revenue increase: <strong>[X]%</strong></span>
<span style="display:block;font-size:14px;color:#1a2410;margin-bottom:6px">💰 Average monthly savings: <strong>$[X]</strong></span>
<span style="display:block;font-size:14px;color:#1a2410;margin-bottom:6px">⏱ Time to first result: <strong>[X] days</strong></span>
<span style="display:block;font-size:14px;color:#1a2410">✓ Sellers who would recommend: <strong>[X]%</strong></span>
</p>

[CTA:free]

<h2>How It Works: 3 Simple Steps</h2>

### Step 1: [Action]
<p>[Brief description. Keep it simple — this is a sales argument, not a tutorial. The goal is to make it sound achievable.]</p>

### Step 2: [Action]
<p>[Description.]</p>

### Step 3: [Action — the payoff]
<p>[Description. End with the result they get.]</p>

<h2>Plans & Pricing</h2>

<table style="width:100%;border-collapse:collapse;margin:16px 0">
  <thead>
    <tr>
      <th style="border:1px solid #e8ede2;padding:10px 14px;background:#f7f9f5;font-size:12px;text-align:left">Plan</th>
      <th style="border:1px solid #e8ede2;padding:10px 14px;background:#f7f9f5;font-size:12px;text-align:center">Free</th>
      <th style="border:1px solid #e8ede2;padding:10px 14px;background:#f4ffe6;color:#4a8f00;font-size:12px;text-align:center">Starter ⭐ Popular</th>
      <th style="border:1px solid #e8ede2;padding:10px 14px;background:#f7f9f5;font-size:12px;text-align:center">Growth</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px">Price</td>
      <td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px;text-align:center">$0/mo</td>
      <td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px;text-align:center;background:#f4ffe6;font-weight:700">$[X]/mo</td>
      <td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px;text-align:center">$[X]/mo</td>
    </tr>
    <tr style="background:#f7f9f5">
      <td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px">[Feature]</td>
      <td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px;text-align:center">Limited</td>
      <td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px;text-align:center;background:#f4ffe6">Unlimited</td>
      <td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px;text-align:center">Unlimited</td>
    </tr>
    <tr>
      <td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px">[Feature]</td>
      <td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px;text-align:center;color:#b91c1c">✗</td>
      <td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px;text-align:center;background:#f4ffe6;color:#16a34a">✓</td>
      <td style="border:1px solid #e8ede2;padding:8px 14px;font-size:13px;text-align:center;color:#16a34a">✓</td>
    </tr>
  </tbody>
</table>

:::faq
Q: Is there a free trial?
A: Yes — the Free plan has no time limit. You can use [features] forever at no cost.

Q: Do I need a credit card to sign up?
A: No. Sign up with just your email address. No credit card required.

Q: How quickly will I see results?
A: Most sellers see their first [result] within [timeframe]. The full benefit compounds over [longer timeframe].

Q: What if it doesn't work for me?
A: We offer a [X]-day money-back guarantee on all paid plans. No questions asked.
:::

[CTA:growth]`
  },

  // ── 21. FREE TOOL / CALCULATOR POST ─────────────────────────────────────
  {
    id:           'free-tool-post',
    name:         'Free Tool / Calculator Post',
    description:  'Wraps an embedded calculator with educational content to drive signups.',
    icon:         Calculator,
    color:        C.blue,
    category:     'Sales & Conversion',
    wordEstimate: '800–1,500 words',
    previewLines: ['What the tool does', 'Embedded calculator', 'How to use it guide', 'Results interpretation', 'Upgrade CTA'],
    defaultTitle: 'Free eBay [Tool Name]: [What It Calculates] in Seconds',
    defaultMeta:  'Free eBay [tool] — [what it does] instantly. No signup required. Used by [X]+ sellers to [result].',
    html: `${IMG.screenshot('Free eBay [Tool Name] — try it below')}

<h1>Free eBay [Tool Name]: [What It Calculates] in Seconds</h1>

<p>This free tool lets you [what it does] in seconds. No spreadsheets, no manual calculations, no guessing. Just enter your numbers and get an instant, accurate answer.</p>

<p>Used by [X]+ eBay sellers every month to [result].</p>

<h2>The [Tool Name]</h2>

<p>Enter your details below to calculate your [result]:</p>

:::calculator:::

<h2>How to Use This Calculator</h2>

### Step 1: Enter your sale price
<p>This is the price the buyer paid — including any shipping charges if you're charging separately. eBay fees apply to the total transaction amount.</p>

### Step 2: Enter the eBay fee rate
<p>The fee varies by category. Electronics are typically 3%, while clothing and accessories are 15% on the first $100. Check eBay's fee schedule or use 13.25% as a general estimate for most categories.</p>

### Step 3: Enter your cost of goods
<p>This is what you paid for the item — including your purchase price, any sourcing costs, and storage if applicable.</p>

### Step 4: Read your results
<p>The calculator shows your net profit and profit margin. A healthy eBay margin is typically 15-25%. Below 10%, you're working hard for very little reward.</p>

:::info
What's a Good Margin? For most eBay categories, aim for at least 15% net margin after all costs. If your margin is below 10%, consider raising prices, sourcing cheaper, or switching to a higher-margin category.
:::

<h2>Understanding Your Results</h2>

<h3>Profit is positive — what now?</h3>
<p>[Advice on what to do with profitable items — scale, source more, optimize listing, etc.]</p>

<h3>Profit is negative — what now?</h3>
<p>[Advice on negative margin — raise price, source cheaper, consider whether the item is worth selling at all.]</p>

<h3>Profit is very low (under 10%) — what now?</h3>
<p>[Advice on razor-thin margins — often not worth the time and risk.]</p>

<h2>Beyond Basic Calculations: The Full Picture</h2>

<p>This calculator handles the core fees, but your true profit also depends on:</p>

<ul>
  <li><strong>Return rate:</strong> If 5% of your sales result in returns, you need to factor that into your margin</li>
  <li><strong>Promoted listing fees:</strong> If you use promoted listings, add 2-12% to your total fee burden</li>
  <li><strong>Packaging costs:</strong> Boxes, tape, bubble wrap — typically $0.50-$3 per order</li>
  <li><strong>Time value:</strong> At what hourly rate is your time worth? Low-margin, high-volume selling can look profitable until you account for labor</li>
</ul>

<p>Riazify's full profit calculator includes all of these factors, plus automatic fee calculations based on your actual eBay category and seller level.</p>

[CTA:free]

:::faq
Q: How accurate is this calculator?
A: This calculator uses eBay's standard fee rates as of [date]. Fee rates change occasionally — always verify current rates on eBay's fee schedule page.

Q: Does this include PayPal fees?
A: eBay now manages payments directly through its Managed Payments system. The fees shown include eBay's payment processing component.

Q: Can I use this for international sales?
A: For international sales, add approximately 1.65% for the international fee. Currency conversion fees may also apply.
:::`
  },

  // ── 22. CHANGELOG / PRODUCT UPDATE ───────────────────────────────────────
  {
    id:           'changelog',
    name:         'Changelog / Product Update',
    description:  'Announces new Riazify features with version number, feature cards, and upgrade CTA.',
    icon:         RefreshCw,
    color:        C.limeDeep,
    category:     'Sales & Conversion',
    wordEstimate: '600–1,200 words',
    previewLines: ['Version + release date', 'New feature cards', 'Improvements list', 'Bug fixes', 'Coming next preview'],
    defaultTitle: 'Riazify Update [Version]: [Key Feature] and [X] More Improvements',
    defaultMeta:  'Riazify [version] is live — introducing [key feature], plus [X] improvements and bug fixes. Here s everything that is new.',
    html: `${IMG.screenshot('Riazify [Version] — New dashboard screenshot')}

<h1>Riazify Update [Version]: [Key Feature] and [X] More Improvements</h1>

<p style="font-size:13px;color:#8a9e78"><strong>Released:</strong> [Date] &nbsp;·&nbsp; <strong>Version:</strong> [X.X.X] &nbsp;·&nbsp; <strong>Type:</strong> [Major / Minor / Patch] Update</p>

<p>We've been heads-down building, and today's update is one we're genuinely excited about. Here's everything that's new in Riazify [version].</p>

:::info
Already a Riazify user? Your account has been automatically updated. Refresh your browser if you don't see the new features yet.
:::

<hr style="border:none;border-top:2px solid #e8ede2;margin:24px 0"/>

<h2>What's New</h2>

<h3>[Feature 1 Name] — [Tagline]</h3>

<p style="background:#f4ffe6;border:1px solid rgba(143,255,0,0.3);border-radius:12px;padding:16px;margin:12px 0">
<strong style="color:#4a8f00;display:block;margin-bottom:6px">New Feature</strong>
<span style="font-size:13px;color:#1a2410">[1-2 sentence description of the feature and what problem it solves.]</span>
</p>

<p>[Longer explanation of the feature. Why did we build it? What feedback drove it? How does it work in practice? Include a specific example of how a seller would use it.]</p>

<p><strong>How to access it:</strong> [Where to find it in the dashboard — e.g., "Go to Dashboard → Orders → click the new 'Protection Status' button on any order."]</p>

<h3>[Feature 2 Name] — [Tagline]</h3>

<p style="background:#f4ffe6;border:1px solid rgba(143,255,0,0.3);border-radius:12px;padding:16px;margin:12px 0">
<strong style="color:#4a8f00;display:block;margin-bottom:6px">New Feature</strong>
<span style="font-size:13px;color:#1a2410">[Description.]</span>
</p>

<p>[Explanation.]</p>

<p><strong>How to access it:</strong> [Location in dashboard.]</p>

<h3>[Feature 3 Name] — [Tagline]</h3>

<p style="background:#f4ffe6;border:1px solid rgba(143,255,0,0.3);border-radius:12px;padding:16px;margin:12px 0">
<strong style="color:#4a8f00;display:block;margin-bottom:6px">New Feature</strong>
<span style="font-size:13px;color:#1a2410">[Description.]</span>
</p>

<p>[Explanation.]</p>

<hr style="border:none;border-top:1px solid #e8ede2;margin:24px 0"/>

<h2>Improvements</h2>

<ul>
  <li><strong>[Improvement 1]</strong> — [What changed and why it's better]</li>
  <li><strong>[Improvement 2]</strong> — [Description]</li>
  <li><strong>[Improvement 3]</strong> — [Description]</li>
  <li><strong>[Improvement 4]</strong> — [Description]</li>
  <li><strong>[Improvement 5]</strong> — [Description]</li>
</ul>

<h2>Bug Fixes</h2>

<ul>
  <li>Fixed: [Bug description — be specific and honest. "Fixed an issue where X would happen when Y" is better than vague language]</li>
  <li>Fixed: [Bug]</li>
  <li>Fixed: [Bug]</li>
  <li>Fixed: [Bug]</li>
</ul>

<h2>What's Coming Next</h2>

<p>Here's a preview of what we're working on for the next release:</p>

<ul>
  <li><strong>[Upcoming feature 1]</strong> — [Brief description] — <em>Estimated: [Month Year]</em></li>
  <li><strong>[Upcoming feature 2]</strong> — [Description] — <em>Estimated: [Month Year]</em></li>
  <li><strong>[Upcoming feature 3]</strong> — [Description] — <em>In research phase</em></li>
</ul>

<p>Have a feature request? <a href="/contact">Send it our way</a> — [X]% of our features come directly from seller requests.</p>

<h2>Thank You</h2>

<p>Every update is shaped by the sellers using Riazify every day. If you've sent us feedback, submitted a bug report, or voted on a feature request — thank you. This release exists because of you.</p>

<p>— The Riazify Team</p>

[CTA:starter]

<p style="font-size:12px;color:#8a9e78;margin-top:16px"><em>Questions about this update? Email <a href="mailto:support@riazify.com" style="color:#8a9e78">support@riazify.com</a> or use the support chat in your dashboard.</em></p>`
  },

  // ── 23. SUCCESS STORY / TESTIMONIAL PAGE ──────────────────────────────────
  {
    id:           'success-stories',
    name:         'Success Story Page',
    description:  'Premium social proof page with dark aggregate stats, seller profile cards with before/after metrics, pull quotes, mini quote grid, and conversion CTA.',
    icon:         Award,
    color:        C.amber,
    category:     'Sales & Conversion',
    wordEstimate: '1,200–2,000 words',
    previewLines: ['Hero + reading bar', 'Dark aggregate stats dashboard', 'Credibility statement', '3 full seller story cards with profile + metrics + quote + result badge', 'Mini quote grid', 'Your story CTA section'],
    defaultTitle: 'Real eBay Sellers, Real Results: [X] Riazify Success Stories',
    defaultMeta:  '[X]+ eBay sellers are using Riazify to grow their business. Real stories, real numbers, real results — not cherry-picked outliers.',
    html: `${IMG.hero('Real Riazify Sellers — Real Results, Real Numbers')}

<div style="display:flex;align-items:center;gap:16px;padding:12px 16px;background:#f7f9f5;border-radius:10px;margin:16px 0;flex-wrap:wrap">
  <span style="font-size:12px;color:#8a9e78">⏱ <strong>[X] min read</strong></span>
  <span style="color:#e8ede2">|</span>
  <span style="font-size:12px;color:#8a9e78">📅 Updated: <strong>[Month Year]</strong></span>
  <span style="color:#e8ede2">|</span>
  <span style="font-size:12px;color:#8a9e78">✍️ By <strong>[Author Name]</strong></span>
</div>

<h1>Real eBay Sellers, Real Results: [X] Riazify Success Stories</h1>

<p style="font-size:17px;line-height:1.8;color:#3a4a32;margin:0 0 24px">These are not cherry-picked outliers. These are sellers from our community — part-time and full-time, beginners and veterans — sharing exactly what changed when they started using Riazify. Names, numbers, and results are real.</p>

<div style="background:#1a2410;border-radius:16px;padding:24px;margin:24px 0">
  <p style="font-size:12px;font-weight:900;letter-spacing:0.08em;color:#8a9e78;margin:0 0 16px">RIAZIFY BY THE NUMBERS</p>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:12px">
    <div style="text-align:center;padding:16px 10px;background:rgba(255,255,255,0.05);border-radius:12px">
      <p style="font-size:26px;font-weight:900;color:#8fff00;margin:0;line-height:1">[X]+</p>
      <p style="font-size:11px;color:rgba(255,255,255,0.4);margin:7px 0 0;font-weight:700;text-transform:uppercase;letter-spacing:0.05em">Active sellers</p>
    </div>
    <div style="text-align:center;padding:16px 10px;background:rgba(255,255,255,0.05);border-radius:12px">
      <p style="font-size:26px;font-weight:900;color:#8fff00;margin:0;line-height:1">[X]%</p>
      <p style="font-size:11px;color:rgba(255,255,255,0.4);margin:7px 0 0;font-weight:700;text-transform:uppercase;letter-spacing:0.05em">Avg revenue lift</p>
    </div>
    <div style="text-align:center;padding:16px 10px;background:rgba(255,255,255,0.05);border-radius:12px">
      <p style="font-size:26px;font-weight:900;color:#8fff00;margin:0;line-height:1">[X,XXX]+</p>
      <p style="font-size:11px;color:rgba(255,255,255,0.4);margin:7px 0 0;font-weight:700;text-transform:uppercase;letter-spacing:0.05em">Orders protected</p>
    </div>
    <div style="text-align:center;padding:16px 10px;background:rgba(255,255,255,0.05);border-radius:12px">
      <p style="font-size:26px;font-weight:900;color:#8fff00;margin:0;line-height:1">[X.X]/5</p>
      <p style="font-size:11px;color:rgba(255,255,255,0.4);margin:7px 0 0;font-weight:700;text-transform:uppercase;letter-spacing:0.05em">Avg seller rating</p>
    </div>
  </div>
</div>

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<h2>Seller Stories</h2>

<div style="display:flex;flex-direction:column;gap:24px;margin:20px 0">

  <div style="border:1px solid #e8ede2;border-radius:16px;overflow:hidden">
    <div style="background:#1a2410;padding:18px 22px;display:flex;align-items:center;gap:16px;flex-wrap:wrap">
      <div style="width:52px;height:52px;border-radius:50%;background:rgba(143,255,0,0.1);border:2px solid rgba(143,255,0,0.3);display:flex;align-items:center;justify-content:center;flex-shrink:0">
        <svg width="22" height="22" fill="none" stroke="#8fff00" stroke-width="1.5" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </div>
      <div style="flex:1">
        <p style="color:#fff;font-size:16px;font-weight:900;margin:0">[Seller 1 Full Name]</p>
        <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:3px 0 0">[City, Country] · eBay since [Year] · [Category]</p>
      </div>
      <span style="background:rgba(143,255,0,0.15);color:#8fff00;font-size:11px;font-weight:900;padding:4px 12px;border-radius:20px;border:1px solid rgba(143,255,0,0.3)">[Seller type — e.g. Part-time seller]</span>
    </div>
    <div style="padding:20px 22px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:18px">
        <div style="padding:14px;background:#FEF2F2;border-radius:10px">
          <p style="font-size:11px;font-weight:900;color:#b91c1c;margin:0 0 4px;letter-spacing:0.06em;text-transform:uppercase">Before Riazify</p>
          <p style="font-size:14px;font-weight:700;color:#1a2410;margin:0">[Before metric — e.g. $1,200/mo revenue]</p>
          <p style="font-size:12px;color:#8a9e78;margin:3px 0 0;line-height:1.5">[Brief context — what was the problem]</p>
        </div>
        <div style="padding:14px;background:#f4ffe6;border-radius:10px">
          <p style="font-size:11px;font-weight:900;color:#4a8f00;margin:0 0 4px;letter-spacing:0.06em;text-transform:uppercase">After Riazify</p>
          <p style="font-size:20px;font-weight:900;color:#4a8f00;margin:0;line-height:1">[After metric — e.g. $4,800/mo]</p>
          <p style="font-size:12px;color:#8a9e78;margin:3px 0 0">[Timeframe — e.g. within 3 months]</p>
        </div>
      </div>
      <p style="font-size:16px;font-style:italic;color:#1a2410;line-height:1.7;margin:0 0 14px;padding:14px 18px;background:#f7f9f5;border-radius:10px;border-left:3px solid #8fff00">"[2-3 sentence quote. Be specific — a real number, a real problem solved, a real moment of realisation. Generic quotes do not convert.]"</p>
      <div style="background:#f4ffe6;border:1px solid rgba(143,255,0,0.3);border-radius:10px;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
        <span style="font-size:13px;font-weight:700;color:#4a8f00">Key result achieved:</span>
        <span style="font-size:14px;font-weight:900;color:#1a2410">[Specific measurable outcome — e.g. +[X]% revenue in [X] months]</span>
      </div>
    </div>
  </div>

  <div style="border:1px solid #e8ede2;border-radius:16px;overflow:hidden">
    <div style="background:#1a2410;padding:18px 22px;display:flex;align-items:center;gap:16px;flex-wrap:wrap">
      <div style="width:52px;height:52px;border-radius:50%;background:rgba(143,255,0,0.1);border:2px solid rgba(143,255,0,0.3);display:flex;align-items:center;justify-content:center;flex-shrink:0">
        <svg width="22" height="22" fill="none" stroke="#8fff00" stroke-width="1.5" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </div>
      <div style="flex:1">
        <p style="color:#fff;font-size:16px;font-weight:900;margin:0">[Seller 2 Full Name]</p>
        <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:3px 0 0">[City, Country] · eBay since [Year] · [Category]</p>
      </div>
      <span style="background:rgba(143,255,0,0.15);color:#8fff00;font-size:11px;font-weight:900;padding:4px 12px;border-radius:20px;border:1px solid rgba(143,255,0,0.3)">[Seller type]</span>
    </div>
    <div style="padding:20px 22px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:18px">
        <div style="padding:14px;background:#FEF2F2;border-radius:10px">
          <p style="font-size:11px;font-weight:900;color:#b91c1c;margin:0 0 4px;letter-spacing:0.06em;text-transform:uppercase">Before Riazify</p>
          <p style="font-size:14px;font-weight:700;color:#1a2410;margin:0">[Before metric]</p>
          <p style="font-size:12px;color:#8a9e78;margin:3px 0 0;line-height:1.5">[Context]</p>
        </div>
        <div style="padding:14px;background:#f4ffe6;border-radius:10px">
          <p style="font-size:11px;font-weight:900;color:#4a8f00;margin:0 0 4px;letter-spacing:0.06em;text-transform:uppercase">After Riazify</p>
          <p style="font-size:20px;font-weight:900;color:#4a8f00;margin:0;line-height:1">[After metric]</p>
          <p style="font-size:12px;color:#8a9e78;margin:3px 0 0">[Timeframe]</p>
        </div>
      </div>
      <p style="font-size:16px;font-style:italic;color:#1a2410;line-height:1.7;margin:0 0 14px;padding:14px 18px;background:#f7f9f5;border-radius:10px;border-left:3px solid #8fff00">"[Quote.]"</p>
      <div style="background:#f4ffe6;border:1px solid rgba(143,255,0,0.3);border-radius:10px;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
        <span style="font-size:13px;font-weight:700;color:#4a8f00">Key result achieved:</span>
        <span style="font-size:14px;font-weight:900;color:#1a2410">[Outcome]</span>
      </div>
    </div>
  </div>

  <div style="border:1px solid #e8ede2;border-radius:16px;overflow:hidden">
    <div style="background:#1a2410;padding:18px 22px;display:flex;align-items:center;gap:16px;flex-wrap:wrap">
      <div style="width:52px;height:52px;border-radius:50%;background:rgba(143,255,0,0.1);border:2px solid rgba(143,255,0,0.3);display:flex;align-items:center;justify-content:center;flex-shrink:0">
        <svg width="22" height="22" fill="none" stroke="#8fff00" stroke-width="1.5" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      </div>
      <div style="flex:1">
        <p style="color:#fff;font-size:16px;font-weight:900;margin:0">[Seller 3 Full Name]</p>
        <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:3px 0 0">[City, Country] · eBay since [Year] · [Category]</p>
      </div>
      <span style="background:rgba(143,255,0,0.15);color:#8fff00;font-size:11px;font-weight:900;padding:4px 12px;border-radius:20px;border:1px solid rgba(143,255,0,0.3)">[Seller type]</span>
    </div>
    <div style="padding:20px 22px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:18px">
        <div style="padding:14px;background:#FEF2F2;border-radius:10px">
          <p style="font-size:11px;font-weight:900;color:#b91c1c;margin:0 0 4px;letter-spacing:0.06em;text-transform:uppercase">Before Riazify</p>
          <p style="font-size:14px;font-weight:700;color:#1a2410;margin:0">[Before metric]</p>
          <p style="font-size:12px;color:#8a9e78;margin:3px 0 0;line-height:1.5">[Context]</p>
        </div>
        <div style="padding:14px;background:#f4ffe6;border-radius:10px">
          <p style="font-size:11px;font-weight:900;color:#4a8f00;margin:0 0 4px;letter-spacing:0.06em;text-transform:uppercase">After Riazify</p>
          <p style="font-size:20px;font-weight:900;color:#4a8f00;margin:0;line-height:1">[After metric]</p>
          <p style="font-size:12px;color:#8a9e78;margin:3px 0 0">[Timeframe]</p>
        </div>
      </div>
      <p style="font-size:16px;font-style:italic;color:#1a2410;line-height:1.7;margin:0 0 14px;padding:14px 18px;background:#f7f9f5;border-radius:10px;border-left:3px solid #8fff00">"[Quote.]"</p>
      <div style="background:#f4ffe6;border:1px solid rgba(143,255,0,0.3);border-radius:10px;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
        <span style="font-size:13px;font-weight:700;color:#4a8f00">Key result achieved:</span>
        <span style="font-size:14px;font-weight:900;color:#1a2410">[Outcome]</span>
      </div>
    </div>
  </div>

</div>

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<h2>More Sellers, More Results</h2>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:20px 0">
  <div style="padding:18px;background:#f7f9f5;border-radius:14px;border:1px solid #e8ede2">
    <p style="font-size:14px;font-style:italic;color:#1a2410;line-height:1.7;margin:0 0 12px">"[Short punchy quote — one or two sentences max. The most quotable thing this seller said.]"</p>
    <div style="display:flex;align-items:center;gap:10px">
      <div style="width:32px;height:32px;border-radius:50%;background:#1a2410;display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="14" height="14" fill="none" stroke="#8fff00" stroke-width="1.5" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
      <div><p style="font-size:13px;font-weight:700;color:#1a2410;margin:0">[Name]</p><p style="font-size:11px;color:#8a9e78;margin:0">[Location] · [Category]</p></div>
    </div>
  </div>
  <div style="padding:18px;background:#f7f9f5;border-radius:14px;border:1px solid #e8ede2">
    <p style="font-size:14px;font-style:italic;color:#1a2410;line-height:1.7;margin:0 0 12px">"[Short quote.]"</p>
    <div style="display:flex;align-items:center;gap:10px">
      <div style="width:32px;height:32px;border-radius:50%;background:#1a2410;display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="14" height="14" fill="none" stroke="#8fff00" stroke-width="1.5" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
      <div><p style="font-size:13px;font-weight:700;color:#1a2410;margin:0">[Name]</p><p style="font-size:11px;color:#8a9e78;margin:0">[Location] · [Category]</p></div>
    </div>
  </div>
  <div style="padding:18px;background:#f7f9f5;border-radius:14px;border:1px solid #e8ede2">
    <p style="font-size:14px;font-style:italic;color:#1a2410;line-height:1.7;margin:0 0 12px">"[Short quote.]"</p>
    <div style="display:flex;align-items:center;gap:10px">
      <div style="width:32px;height:32px;border-radius:50%;background:#1a2410;display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="14" height="14" fill="none" stroke="#8fff00" stroke-width="1.5" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
      <div><p style="font-size:13px;font-weight:700;color:#1a2410;margin:0">[Name]</p><p style="font-size:11px;color:#8a9e78;margin:0">[Location] · [Category]</p></div>
    </div>
  </div>
  <div style="padding:18px;background:#f7f9f5;border-radius:14px;border:1px solid #e8ede2">
    <p style="font-size:14px;font-style:italic;color:#1a2410;line-height:1.7;margin:0 0 12px">"[Short quote.]"</p>
    <div style="display:flex;align-items:center;gap:10px">
      <div style="width:32px;height:32px;border-radius:50%;background:#1a2410;display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg width="14" height="14" fill="none" stroke="#8fff00" stroke-width="1.5" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>
      <div><p style="font-size:13px;font-weight:700;color:#1a2410;margin:0">[Name]</p><p style="font-size:11px;color:#8a9e78;margin:0">[Location] · [Category]</p></div>
    </div>
  </div>
</div>

<div style="display:flex;align-items:center;gap:12px;margin:32px 0"><div style="flex:1;height:1px;background:#e8ede2"></div><div style="width:6px;height:6px;border-radius:50%;background:#8fff00;flex-shrink:0"></div><div style="flex:1;height:1px;background:#e8ede2"></div></div>

<div style="background:#1a2410;border-radius:16px;padding:28px;margin:24px 0;text-align:center">
  <p style="color:#8fff00;font-size:12px;font-weight:900;letter-spacing:0.1em;margin:0 0 10px">YOUR STORY COULD BE NEXT</p>
  <p style="color:#fff;font-size:20px;font-weight:900;margin:0 0 10px;line-height:1.4">Every seller on this page started exactly where you are right now.</p>
  <p style="color:rgba(255,255,255,0.5);font-size:14px;margin:0 0 20px;line-height:1.7">Same doubts. Same questions. Same problems. The only difference is they took the first step.</p>
  [CTA:free]
</div>

<p style="font-size:12px;color:#8a9e78;text-align:center;margin-top:16px;line-height:1.7"><em>Want to share your Riazify success story? <a href="/contact" style="color:#8a9e78">Get in touch</a> — we feature sellers at all levels, from side hustles to seven-figure eBay businesses.</em></p>`
  },

]

// ── Template Picker Component ──────────────────────────────────────────────

interface BlogTemplatesProps {
  onSelect: (template: BlogTemplate) => void
  onClose:  () => void
}

export default function BlogTemplates({ onSelect, onClose }: BlogTemplatesProps) {
  const [selected,   setSelected]   = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<string>('All')

  const categories = ['All', ...Array.from(new Set(BLOG_TEMPLATES.map(t => t.category)))]
  const filtered   = activeFilter === 'All' ? BLOG_TEMPLATES : BLOG_TEMPLATES.filter(t => t.category === activeFilter)
  const preview    = BLOG_TEMPLATES.find(t => t.id === selected)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
         onClick={onClose}>
      <div className="w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
           style={{ backgroundColor: C.surface }}
           onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0"
             style={{ borderColor: C.border, backgroundColor: C.bg }}>
          <div>
            <p className="text-[16px] font-black" style={{ color: C.dark }}>Blog Post Templates</p>
            <p className="text-[12px]" style={{ color: C.muted }}>Choose a template to load into the editor — then customize it</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:opacity-70" style={{ backgroundColor: C.border }}>
            <X size={16} style={{ color: C.muted }} />
          </button>
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2 px-6 py-3 border-b shrink-0 overflow-x-auto"
             style={{ borderColor: C.border }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setActiveFilter(cat)}
              className="px-3 py-1.5 rounded-lg text-[11px] font-bold border shrink-0 transition-all"
              style={{ backgroundColor: activeFilter === cat ? '#8fff00' : C.bg, borderColor: activeFilter === cat ? '#8fff00' : C.border, color: activeFilter === cat ? '#1a2410' : C.muted }}>
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-1 overflow-hidden">

          {/* Template grid */}
          <div className="w-[55%] p-4 overflow-y-auto grid grid-cols-2 gap-3 content-start border-r"
               style={{ borderColor: C.border }}>
            {filtered.map(template => {
              const Icon = template.icon
              const isSelected = selected === template.id
              return (
                <button key={template.id}
                  onClick={() => setSelected(template.id)}
                  className="p-4 rounded-2xl border text-left transition-all hover:shadow-md"
                  style={{
                    borderColor:     isSelected ? template.color : C.border,
                    backgroundColor: isSelected ? template.color + '10' : C.surface,
                    outline:         isSelected ? `2px solid ${template.color}` : 'none',
                  }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                         style={{ backgroundColor: template.color + '18' }}>
                      <Icon size={16} style={{ color: template.color }} />
                    </div>
                    <div>
                      <p className="text-[12px] font-black leading-tight" style={{ color: C.dark }}>{template.name}</p>
                      <p className="text-[10px]" style={{ color: C.muted }}>{template.wordEstimate}</p>
                    </div>
                  </div>
                  <p className="text-[11px] leading-relaxed" style={{ color: C.muted }}>{template.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {template.previewLines.slice(0, 3).map((line, i) => (
                      <span key={i} className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{ backgroundColor: C.bg, color: C.muted }}>{line}</span>
                    ))}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Preview pane — single scrollable column */}
          <div className="flex-1 overflow-y-auto">
            {preview ? (
              <div className="p-5 flex flex-col gap-4">

                {/* Header: icon + name + category */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                       style={{ backgroundColor: preview.color + '18' }}>
                    <preview.icon size={20} style={{ color: preview.color }} />
                  </div>
                  <div>
                    <p className="text-[15px] font-black" style={{ color: C.dark }}>{preview.name}</p>
                    <p className="text-[11px]" style={{ color: C.muted }}>{preview.category} · {preview.wordEstimate}</p>
                  </div>
                </div>

                {/* Structure list */}
                <div className="p-3 rounded-xl" style={{ backgroundColor: C.bg }}>
                  <p className="text-[10px] font-black tracking-wider mb-1" style={{ color: C.muted }}>STRUCTURE</p>
                  {preview.previewLines.map((line, i) => (
                    <div key={i} className="flex items-center gap-2 py-1">
                      <ChevronRight size={10} style={{ color: preview.color, flexShrink: 0 }} />
                      <span className="text-[11px]" style={{ color: C.text }}>{line}</span>
                    </div>
                  ))}
                </div>

                {/* Default title */}
                <div>
                  <p className="text-[10px] font-black tracking-wider mb-1" style={{ color: C.muted }}>DEFAULT TITLE</p>
                  <p className="text-[12px] font-bold" style={{ color: C.dark }}>{preview.defaultTitle}</p>
                </div>

                {/* CTA button */}
                <button
                  onClick={() => onSelect(preview)}
                  className="w-full py-3 rounded-xl text-[13px] font-black flex items-center justify-center gap-2 shrink-0"
                  style={{ backgroundColor: '#8fff00', color: '#1a2410' }}>
                  <Check size={15} /> Use This Template
                </button>

                {/* Rendered HTML preview */}
                <div>
                  <p className="text-[10px] font-black tracking-wider mb-2" style={{ color: C.muted }}>CONTENT PREVIEW</p>
                  <div
                    className="rounded-xl p-4 text-[12px] leading-relaxed"
                    style={{ backgroundColor: '#fff', border: `1px solid ${C.border}`, fontFamily: 'Inter, sans-serif', color: C.dark, pointerEvents: 'none' }}
                    dangerouslySetInnerHTML={{ __html: preview.html }}
                  />
                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 p-8 h-full">
                <BookOpen size={40} style={{ color: C.border }} />
                <p className="text-[14px] font-bold" style={{ color: C.muted }}>Select a template to preview</p>
                <p className="text-[12px] text-center" style={{ color: C.border }}>Click any template on the left to see its structure and content preview</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}