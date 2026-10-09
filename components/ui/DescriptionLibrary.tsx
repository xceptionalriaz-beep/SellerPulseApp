'use client'
// components/ui/DescriptionLibrary.tsx
// ─────────────────────────────────────────────────────────────
// Riazify — eBay Description Design Library
//
// 37 blocks across 9 categories, all eBay-safe:
//   ✓ Table-based layout only (no flexbox/grid)
//   ✓ Inline CSS only
//   ✓ No JavaScript
//   ✓ No external fonts or resources
//   ✓ HTTPS image placeholders
// ─────────────────────────────────────────────────────────────

import { useState, JSX } from 'react'
import {
  ChevronDown, ChevronRight, Zap,
  LayoutTemplate, ShieldCheck, ListChecks,
  Table2, Tag, Truck, Image, Store, Minus,
  ShoppingBag, HelpCircle, Package, Star,
  Car, BookOpen, Gem, Trophy,
} from 'lucide-react'

// ── Design tokens ──────────────────────────────────────────────
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
  success: '#16a34a',
  successBg: '#dcfce7',
  warning: '#d97706',
  warningBg: '#fef3c7',
  danger: '#ef4444',
  dangerBg: '#fee2e2',
  accent: '#b8fa33',
}

// ── Block definition ───────────────────────────────────────────
export interface DesignBlock {
  id: string
  name: string
  desc: string
  popular?: boolean
  html: string
}

export interface BlockCategory {
  id: string
  label: string
  icon: JSX.Element
  color: string
  blocks: DesignBlock[]
}

// ─────────────────────────────────────────────────────────────
// All 37 blocks
// ─────────────────────────────────────────────────────────────
export const DESIGN_LIBRARY: BlockCategory[] = [

  // ── 1. Headers & Banners ──────────────────────────────────
  {
    id: 'headers',
    label: 'Headers & Banners',
    icon: <LayoutTemplate size={13} />,
    color: '#dbeafe',
    blocks: [
      {
        id: 'hero-banner',
        name: 'Hero Banner',
        desc: 'Full-width gradient header with title + subtitle',
        popular: true,
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,#7530fb 0%,#4c1d95 100%);border-radius:12px;overflow:hidden;margin-bottom:20px;">
  <tr><td style="padding:35px 25px;text-align:center;">
    <p style="margin:0 0 10px 0;font-size:11px;font-weight:800;letter-spacing:2px;color:#b8fa33;text-transform:uppercase;font-family:Arial,sans-serif;">Premium Quality</p>
    <h1 style="margin:0 0 12px 0;font-size:28px;font-weight:800;color:#ffffff;font-family:Arial,sans-serif;letter-spacing:0.5px;">Product Title Goes Here</h1>
    <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.8);font-family:Arial,sans-serif;">Tested Quality &bull; Fast Delivery &bull; Hassle-Free Returns</p>
  </td></tr>
</table>`,
      },
      {
        id: 'simple-title',
        name: 'Simple Title Bar',
        desc: 'Clean heading with coloured left border accent',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
  <tr><td style="border-left:4px solid #7530fb;padding:10px 16px;background:#f8f7ff;">
    <h2 style="margin:0;font-size:20px;font-weight:700;color:#1e1535;font-family:Arial,sans-serif;">Section Title</h2>
    <p style="margin:4px 0 0 0;font-size:13px;color:#6b7280;font-family:Arial,sans-serif;">Supporting subtitle text goes here</p>
  </td></tr>
</table>`,
      },
      {
        id: 'store-brand-header',
        name: 'Store Brand Header',
        desc: 'Logo placeholder + store name + tagline',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#1e1535;border-radius:12px;margin-bottom:20px;">
  <tr>
    <td width="70" style="padding:20px 0 20px 20px;">
      <table width="56" height="56" cellpadding="0" cellspacing="0" border="0" style="background:#7530fb;border-radius:12px;">
        <tr><td style="text-align:center;vertical-align:middle;font-size:22px;font-weight:800;color:#ffffff;font-family:Arial,sans-serif;">S</td></tr>
      </table>
    </td>
    <td style="padding:20px 20px 20px 12px;">
      <p style="margin:0 0 2px 0;font-size:18px;font-weight:800;color:#ffffff;font-family:Arial,sans-serif;">Your Store Name</p>
      <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.5);font-family:Arial,sans-serif;">Official Authorised Seller &bull; Est. 2020</p>
    </td>
  </tr>
</table>`,
      },
      {
        id: 'sale-banner',
        name: 'Sale Banner',
        desc: 'Bold SALE callout with % off badge',
        popular: true,
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ef4444;border-radius:12px;margin-bottom:20px;">
  <tr>
    <td style="padding:20px 25px;text-align:center;">
      <table width="80" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 10px auto;background:#ffffff;border-radius:40px;">
        <tr><td style="padding:4px 14px;font-size:12px;font-weight:800;color:#ef4444;font-family:Arial,sans-serif;text-align:center;">SALE</td></tr>
      </table>
      <h2 style="margin:0 0 6px 0;font-size:26px;font-weight:800;color:#ffffff;font-family:Arial,sans-serif;">20% OFF TODAY ONLY</h2>
      <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.85);font-family:Arial,sans-serif;">Limited time offer &bull; While stocks last</p>
    </td>
  </tr>
</table>`,
      },
      {
        id: 'announcement-bar',
        name: 'Announcement Bar',
        desc: 'Slim top bar — free shipping, limited offer etc',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#b8fa33;border-radius:8px;margin-bottom:20px;">
  <tr><td style="padding:10px 20px;text-align:center;">
    <p style="margin:0;font-size:13px;font-weight:700;color:#1e1535;font-family:Arial,sans-serif;">&#128666; FREE UK SHIPPING on all orders over &pound;20 &bull; Same day dispatch before 2pm</p>
  </td></tr>
</table>`,
      },
      {
        id: 'new-arrival',
        name: 'New Arrival Badge',
        desc: 'Corner ribbon / "Just In" label overlay',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
  <tr>
    <td style="padding:16px 20px;background:#f3eeff;border-radius:12px;border:2px solid #7530fb;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td>
            <table cellpadding="0" cellspacing="0" border="0" style="background:#7530fb;border-radius:20px;display:inline-block;">
              <tr><td style="padding:4px 14px;font-size:11px;font-weight:700;color:#ffffff;font-family:Arial,sans-serif;">&#10024; NEW ARRIVAL</td></tr>
            </table>
            <h2 style="margin:8px 0 4px 0;font-size:18px;font-weight:700;color:#1e1535;font-family:Arial,sans-serif;">Just landed in store — limited stock</h2>
            <p style="margin:0;font-size:13px;color:#6b7280;font-family:Arial,sans-serif;">Be the first to own this item before it sells out</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`,
      },
    ],
  },

  // ── 2. Trust & Guarantee ──────────────────────────────────
  {
    id: 'trust',
    label: 'Trust & Guarantee Badges',
    icon: <ShieldCheck size={13} />,
    color: '#dcfce7',
    blocks: [
      {
        id: 'trust-badge-row',
        name: 'Trust Badge Row',
        desc: '4 icons: secure, fast shipping, returns, authentic',
        popular: true,
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8f7ff;border-radius:12px;margin-bottom:20px;">
  <tr>
    <td width="25%" style="padding:18px 8px;text-align:center;border-right:1px solid #ede9fe;">
      <p style="margin:0 0 4px 0;font-size:20px;">&#128274;</p>
      <p style="margin:0;font-size:11px;font-weight:700;color:#1e1535;font-family:Arial,sans-serif;">Secure Payment</p>
    </td>
    <td width="25%" style="padding:18px 8px;text-align:center;border-right:1px solid #ede9fe;">
      <p style="margin:0 0 4px 0;font-size:20px;">&#128666;</p>
      <p style="margin:0;font-size:11px;font-weight:700;color:#1e1535;font-family:Arial,sans-serif;">Fast Dispatch</p>
    </td>
    <td width="25%" style="padding:18px 8px;text-align:center;border-right:1px solid #ede9fe;">
      <p style="margin:0 0 4px 0;font-size:20px;">&#128260;</p>
      <p style="margin:0;font-size:11px;font-weight:700;color:#1e1535;font-family:Arial,sans-serif;">Easy Returns</p>
    </td>
    <td width="25%" style="padding:18px 8px;text-align:center;">
      <p style="margin:0 0 4px 0;font-size:20px;">&#9989;</p>
      <p style="margin:0;font-size:11px;font-weight:700;color:#1e1535;font-family:Arial,sans-serif;">100% Genuine</p>
    </td>
  </tr>
</table>`,
      },
      {
        id: 'money-back',
        name: 'Money-Back Guarantee',
        desc: 'Highlighted box with guarantee statement',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#dcfce7;border-radius:12px;border:1px solid #86efac;margin-bottom:20px;">
  <tr>
    <td width="60" style="padding:20px 0 20px 20px;vertical-align:top;">
      <p style="margin:0;font-size:32px;line-height:1;">&#128176;</p>
    </td>
    <td style="padding:20px 20px 20px 12px;">
      <p style="margin:0 0 4px 0;font-size:15px;font-weight:700;color:#166534;font-family:Arial,sans-serif;">30-Day Money-Back Guarantee</p>
      <p style="margin:0;font-size:12px;color:#16a34a;font-family:Arial,sans-serif;">Not happy? Return it within 30 days for a full refund — no questions asked.</p>
    </td>
  </tr>
</table>`,
      },
      {
        id: 'authenticity-card',
        name: 'Authenticity Card',
        desc: '"100% Genuine" with verification text',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:2px solid #7530fb;border-radius:12px;margin-bottom:20px;">
  <tr><td style="background:#f3eeff;padding:14px 20px;border-radius:10px 10px 0 0;text-align:center;">
    <p style="margin:0;font-size:13px;font-weight:700;color:#7530fb;letter-spacing:1px;font-family:Arial,sans-serif;">&#10024; AUTHENTICITY GUARANTEED</p>
  </td></tr>
  <tr><td style="padding:16px 20px;background:#ffffff;border-radius:0 0 10px 10px;">
    <p style="margin:0;font-size:13px;color:#374151;font-family:Arial,sans-serif;line-height:1.6;">All items are <strong>100% genuine and original</strong>. We only source directly from authorised distributors and manufacturers. Every item is checked before dispatch.</p>
  </td></tr>
</table>`,
      },
      {
        id: 'seller-rating',
        name: 'Seller Rating Box',
        desc: 'Stars + feedback score + positive % text',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;margin-bottom:20px;">
  <tr>
    <td style="padding:16px 20px;text-align:center;">
      <p style="margin:0 0 6px 0;font-size:22px;letter-spacing:3px;">&#11088;&#11088;&#11088;&#11088;&#11088;</p>
      <p style="margin:0 0 4px 0;font-size:18px;font-weight:800;color:#1e1535;font-family:Arial,sans-serif;">99.8% Positive Feedback</p>
      <p style="margin:0;font-size:12px;color:#6b7280;font-family:Arial,sans-serif;">Based on 2,400+ transactions &bull; Top Rated Seller</p>
    </td>
  </tr>
</table>`,
      },
      {
        id: 'secure-payment',
        name: 'Secure Payment Row',
        desc: 'PayPal / card icons with "safe checkout" text',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8faff;border:1px solid #e0e7ff;border-radius:12px;margin-bottom:20px;">
  <tr><td style="padding:14px 20px;text-align:center;">
    <p style="margin:0 0 8px 0;font-size:11px;font-weight:700;color:#6b7280;letter-spacing:1px;font-family:Arial,sans-serif;">SAFE &amp; SECURE CHECKOUT</p>
    <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
      <tr>
        <td style="padding:0 6px;font-size:24px;">&#128178;</td>
        <td style="padding:0 6px;font-size:24px;">&#128179;</td>
        <td style="padding:0 6px;font-size:24px;">&#128180;</td>
        <td style="padding:0 6px;font-size:24px;">&#128274;</td>
      </tr>
    </table>
    <p style="margin:8px 0 0 0;font-size:11px;color:#9ca3af;font-family:Arial,sans-serif;">All payments are encrypted and secure</p>
  </td></tr>
</table>`,
      },
    ],
  },

  // ── 3. Features & Benefits ────────────────────────────────
  {
    id: 'features',
    label: 'Features & Benefits',
    icon: <ListChecks size={13} />,
    color: '#fef3c7',
    blocks: [
      {
        id: 'checklist',
        name: 'Checklist',
        desc: '✓ ticked rows in branded colour',
        popular: true,
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
  <tr><td style="padding-bottom:12px;"><p style="margin:0;font-size:16px;font-weight:700;color:#1e1535;font-family:Arial,sans-serif;">What's Included</p></td></tr>
  ${['Brand new, factory sealed', 'Full manufacturer warranty', 'All original accessories', 'Same-day dispatch before 2pm', 'Tracked delivery included', 'UK seller — fast and reliable'].map(item => `  <tr><td style="padding:6px 0;border-bottom:1px solid #f3f4f6;">
    <table cellpadding="0" cellspacing="0" border="0"><tr>
      <td width="24" style="vertical-align:top;"><span style="display:inline-block;width:18px;height:18px;background:#7530fb;border-radius:50%;text-align:center;line-height:18px;font-size:11px;color:#ffffff;font-family:Arial,sans-serif;">&#10003;</span></td>
      <td style="padding-left:8px;font-size:13px;color:#374151;font-family:Arial,sans-serif;line-height:1.5;">${item}</td>
    </tr></table>
  </td></tr>`).join('\n')}
</table>`,
      },
      {
        id: 'feature-grid',
        name: '2-Col Feature Grid',
        desc: 'Icon + title + 1-line desc, 2 per row',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
  <tr>
    <td width="50%" style="padding:12px 8px 12px 0;vertical-align:top;">
      <table cellpadding="0" cellspacing="0" border="0"><tr>
        <td width="40" style="vertical-align:top;"><span style="font-size:24px;">&#9889;</span></td>
        <td style="padding-left:8px;"><p style="margin:0 0 2px 0;font-size:13px;font-weight:700;color:#1e1535;font-family:Arial,sans-serif;">Fast Performance</p><p style="margin:0;font-size:12px;color:#6b7280;font-family:Arial,sans-serif;">Built for speed and reliability</p></td>
      </tr></table>
    </td>
    <td width="50%" style="padding:12px 0 12px 8px;vertical-align:top;">
      <table cellpadding="0" cellspacing="0" border="0"><tr>
        <td width="40" style="vertical-align:top;"><span style="font-size:24px;">&#128293;</span></td>
        <td style="padding-left:8px;"><p style="margin:0 0 2px 0;font-size:13px;font-weight:700;color:#1e1535;font-family:Arial,sans-serif;">Premium Quality</p><p style="margin:0;font-size:12px;color:#6b7280;font-family:Arial,sans-serif;">High-grade materials only</p></td>
      </tr></table>
    </td>
  </tr>
  <tr>
    <td width="50%" style="padding:12px 8px 0 0;vertical-align:top;">
      <table cellpadding="0" cellspacing="0" border="0"><tr>
        <td width="40" style="vertical-align:top;"><span style="font-size:24px;">&#128736;</span></td>
        <td style="padding-left:8px;"><p style="margin:0 0 2px 0;font-size:13px;font-weight:700;color:#1e1535;font-family:Arial,sans-serif;">Easy Setup</p><p style="margin:0;font-size:12px;color:#6b7280;font-family:Arial,sans-serif;">Ready to use out of the box</p></td>
      </tr></table>
    </td>
    <td width="50%" style="padding:12px 0 0 8px;vertical-align:top;">
      <table cellpadding="0" cellspacing="0" border="0"><tr>
        <td width="40" style="vertical-align:top;"><span style="font-size:24px;">&#127775;</span></td>
        <td style="padding-left:8px;"><p style="margin:0 0 2px 0;font-size:13px;font-weight:700;color:#1e1535;font-family:Arial,sans-serif;">Highly Rated</p><p style="margin:0;font-size:12px;color:#6b7280;font-family:Arial,sans-serif;">Loved by thousands of buyers</p></td>
      </tr></table>
    </td>
  </tr>
</table>`,
      },
      {
        id: 'numbered-steps',
        name: 'Numbered Steps',
        desc: 'How it works: 1 → 2 → 3 visual flow',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
  <tr><td style="padding-bottom:14px;"><p style="margin:0;font-size:16px;font-weight:700;color:#1e1535;font-family:Arial,sans-serif;">How It Works</p></td></tr>
  ${[['Order Today', 'Place your order before 2pm for same-day dispatch'], ['Fast Delivery', 'Receive your item within 1–3 working days'], ['Enjoy & Review', 'Happy with your purchase? Leave us a review!']].map(([title, desc], i) => `  <tr><td style="padding:10px 0;${i < 2 ? 'border-bottom:1px solid #f3f4f6;' : ''}">
    <table cellpadding="0" cellspacing="0" border="0"><tr>
      <td width="36" style="vertical-align:top;">
        <table width="28" height="28" cellpadding="0" cellspacing="0" border="0" style="background:#7530fb;border-radius:50%;"><tr><td style="text-align:center;vertical-align:middle;font-size:13px;font-weight:700;color:#ffffff;font-family:Arial,sans-serif;">${i + 1}</td></tr></table>
      </td>
      <td style="padding-left:10px;vertical-align:top;"><p style="margin:0 0 2px 0;font-size:13px;font-weight:700;color:#1e1535;font-family:Arial,sans-serif;">${title}</p><p style="margin:0;font-size:12px;color:#6b7280;font-family:Arial,sans-serif;">${desc}</p></td>
    </tr></table>
  </td></tr>`).join('\n')}
</table>`,
      },
      {
        id: 'highlight-pills',
        name: 'Highlight Pill Row',
        desc: '5 coloured pill badges: key selling points',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
  <tr><td style="padding:16px;background:#f8f7ff;border-radius:12px;text-align:center;">
    <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;"><tr>
      ${[['#7530fb', '#f3eeff', 'Waterproof'], ['#16a34a', '#dcfce7', 'Lightweight'], ['#d97706', '#fef3c7', 'Long Battery'], ['#ef4444', '#fee2e2', 'Fast Charge'], ['#0ea5e9', '#e0f2fe', 'Bluetooth 5.0']].map(([color, bg, label]) =>
          `<td style="padding:0 4px;"><table cellpadding="0" cellspacing="0" border="0" style="background:${bg};border-radius:20px;"><tr><td style="padding:6px 14px;font-size:11px;font-weight:700;color:${color};font-family:Arial,sans-serif;white-space:nowrap;">${label}</td></tr></table></td>`
        ).join('\n      ')}
    </tr></table>
  </td></tr>
</table>`,
      },
      {
        id: 'before-after',
        name: 'Before / After Row',
        desc: 'Two-column compare: old vs new',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
  <tr>
    <td width="50%" style="padding:16px;background:#fee2e2;border-radius:12px 0 0 12px;vertical-align:top;">
      <p style="margin:0 0 8px 0;font-size:11px;font-weight:700;color:#ef4444;letter-spacing:1px;font-family:Arial,sans-serif;">&#10060; WITHOUT</p>
      <ul style="margin:0;padding-left:16px;"><li style="font-size:12px;color:#374151;font-family:Arial,sans-serif;margin-bottom:4px;">Slow and unreliable</li><li style="font-size:12px;color:#374151;font-family:Arial,sans-serif;margin-bottom:4px;">Wasted time and money</li><li style="font-size:12px;color:#374151;font-family:Arial,sans-serif;">Frustrating experience</li></ul>
    </td>
    <td width="4" style="background:#ffffff;"></td>
    <td width="50%" style="padding:16px;background:#dcfce7;border-radius:0 12px 12px 0;vertical-align:top;">
      <p style="margin:0 0 8px 0;font-size:11px;font-weight:700;color:#16a34a;letter-spacing:1px;font-family:Arial,sans-serif;">&#10003; WITH OUR PRODUCT</p>
      <ul style="margin:0;padding-left:16px;"><li style="font-size:12px;color:#374151;font-family:Arial,sans-serif;margin-bottom:4px;">Fast and dependable</li><li style="font-size:12px;color:#374151;font-family:Arial,sans-serif;margin-bottom:4px;">Saves time and money</li><li style="font-size:12px;color:#374151;font-family:Arial,sans-serif;">Total peace of mind</li></ul>
    </td>
  </tr>
</table>`,
      },
    ],
  },

  // ── 4. Spec & Info Tables ─────────────────────────────────
  {
    id: 'tables',
    label: 'Spec & Info Tables',
    icon: <Table2 size={13} />,
    color: '#ede9fe',
    blocks: [
      {
        id: 'clean-spec-table',
        name: 'Clean Spec Table',
        desc: 'Label | Value rows, white bg, light border',
        popular: true,
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:20px;">
  <tr style="background:#f8f7ff;"><td colspan="2" style="padding:12px 16px;font-size:14px;font-weight:700;color:#1e1535;font-family:Arial,sans-serif;border-bottom:2px solid #7530fb;">Technical Specifications</td></tr>
  ${[['Brand', 'Your Brand Name'], ['Model', 'Model XYZ-100'], ['Colour', 'Space Grey'], ['Weight', '320g'], ['Dimensions', '15 x 8 x 1.2 cm'], ['Warranty', '12 Months'], ['Condition', 'Brand New'], ['Country of Origin', 'United Kingdom']].map(([label, val], i) => `  <tr style="background:${i % 2 === 0 ? '#ffffff' : '#f9fafb'};">
    <td style="padding:10px 16px;font-size:12px;font-weight:600;color:#6b7280;width:35%;border-bottom:1px solid #f3f4f6;font-family:Arial,sans-serif;">${label}</td>
    <td style="padding:10px 16px;font-size:13px;color:#1f2937;border-bottom:1px solid #f3f4f6;font-family:Arial,sans-serif;">${val}</td>
  </tr>`).join('\n')}
</table>`,
      },
      {
        id: 'striped-table',
        name: 'Striped Table',
        desc: 'Alternating row colours, branded header',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius:12px;overflow:hidden;margin-bottom:20px;">
  <tr style="background:#7530fb;">
    <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#ffffff;font-family:Arial,sans-serif;">Feature</td>
    <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#ffffff;font-family:Arial,sans-serif;">Details</td>
  </tr>
  ${[['Battery Life', 'Up to 24 hours'], ['Connectivity', 'Bluetooth 5.0 + USB-C'], ['Water Resistance', 'IPX7 Rated'], ['Charging Time', '90 minutes'], ['Compatibility', 'iOS & Android']].map(([f, d], i) => `  <tr style="background:${i % 2 === 0 ? '#f8f7ff' : '#ffffff'};">
    <td style="padding:10px 16px;font-size:12px;font-weight:600;color:#374151;font-family:Arial,sans-serif;">${f}</td>
    <td style="padding:10px 16px;font-size:12px;color:#6b7280;font-family:Arial,sans-serif;">${d}</td>
  </tr>`).join('\n')}
</table>`,
      },
      {
        id: 'compare-table',
        name: '2-Col Compare Table',
        desc: 'Your item vs competitor side by side',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius:12px;overflow:hidden;margin-bottom:20px;">
  <tr>
    <td width="40%" style="padding:12px 16px;background:#f3f4f6;font-size:13px;font-weight:700;color:#6b7280;font-family:Arial,sans-serif;">Feature</td>
    <td width="30%" style="padding:12px 16px;background:#7530fb;font-size:13px;font-weight:700;color:#ffffff;text-align:center;font-family:Arial,sans-serif;">Our Product</td>
    <td width="30%" style="padding:12px 16px;background:#e5e7eb;font-size:13px;font-weight:700;color:#6b7280;text-align:center;font-family:Arial,sans-serif;">Competitor</td>
  </tr>
  ${[['Battery Life', '24 hours', '8 hours'], ['Warranty', '12 months', '3 months'], ['Water Resistant', 'Yes ✓', 'No ✗'], ['Free Shipping', 'Yes ✓', 'No ✗'], ['Returns', '30 days', '14 days']].map(([f, ours, theirs], i) => `  <tr style="background:${i % 2 === 0 ? '#ffffff' : '#f9fafb'};">
    <td style="padding:10px 16px;font-size:12px;color:#374151;font-family:Arial,sans-serif;border-bottom:1px solid #f3f4f6;">${f}</td>
    <td style="padding:10px 16px;font-size:12px;font-weight:700;color:#7530fb;text-align:center;font-family:Arial,sans-serif;border-bottom:1px solid #f3f4f6;">${ours}</td>
    <td style="padding:10px 16px;font-size:12px;color:#9ca3af;text-align:center;font-family:Arial,sans-serif;border-bottom:1px solid #f3f4f6;">${theirs}</td>
  </tr>`).join('\n')}
</table>`,
      },
      {
        id: 'size-chart',
        name: 'Size / Measurement Chart',
        desc: 'XS–XXL size guide table for clothing',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:20px;">
  <tr style="background:#1e1535;">
    ${['Size', 'Chest (cm)', 'Waist (cm)', 'Hip (cm)', 'Length (cm)'].map(h => `<td style="padding:10px 12px;font-size:11px;font-weight:700;color:#ffffff;text-align:center;font-family:Arial,sans-serif;">${h}</td>`).join('')}
  </tr>
  ${[['XS', '82–86', '66–70', '88–92', '65'], ['S', '86–90', '70–74', '92–96', '66'], ['M', '90–94', '74–78', '96–100', '67'], ['L', '94–98', '78–82', '100–104', '68'], ['XL', '98–102', '82–86', '104–108', '69'], ['XXL', '102–108', '86–92', '108–114', '70']].map(([size, ...vals], i) => `  <tr style="background:${i % 2 === 0 ? '#ffffff' : '#f9fafb'};">
    <td style="padding:9px 12px;font-size:12px;font-weight:700;color:#7530fb;text-align:center;font-family:Arial,sans-serif;border-top:1px solid #f3f4f6;">${size}</td>
    ${vals.map(v => `<td style="padding:9px 12px;font-size:12px;color:#374151;text-align:center;font-family:Arial,sans-serif;border-top:1px solid #f3f4f6;">${v}</td>`).join('')}
  </tr>`).join('\n')}
</table>`,
      },
    ],
  },

  // ── 5. Offer & Pricing ────────────────────────────────────
  {
    id: 'offers',
    label: 'Offer & Pricing Boxes',
    icon: <Tag size={13} />,
    color: '#fee2e2',
    blocks: [
      {
        id: 'flash-sale',
        name: 'Flash Sale Box',
        desc: 'Red urgency box — "Ends tonight" style',
        popular: true,
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#1e1535;border-radius:12px;margin-bottom:20px;border:2px solid #ef4444;">
  <tr><td style="padding:20px 25px;text-align:center;">
    <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 10px auto;background:#ef4444;border-radius:6px;">
      <tr><td style="padding:4px 16px;font-size:11px;font-weight:800;color:#ffffff;letter-spacing:2px;font-family:Arial,sans-serif;">&#9889; FLASH SALE — ENDS TONIGHT</td></tr>
    </table>
    <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
      <tr>
        <td style="padding:0 16px;text-align:center;">
          <p style="margin:0 0 2px 0;font-size:11px;color:rgba(255,255,255,0.5);font-family:Arial,sans-serif;">WAS</p>
          <p style="margin:0;font-size:20px;font-weight:700;color:#9ca3af;text-decoration:line-through;font-family:Arial,sans-serif;">&pound;49.99</p>
        </td>
        <td style="padding:0 16px;text-align:center;border-left:1px solid rgba(255,255,255,0.1);border-right:1px solid rgba(255,255,255,0.1);">
          <p style="margin:0 0 2px 0;font-size:11px;color:rgba(255,255,255,0.5);font-family:Arial,sans-serif;">NOW</p>
          <p style="margin:0;font-size:28px;font-weight:800;color:#b8fa33;font-family:Arial,sans-serif;">&pound;34.99</p>
        </td>
        <td style="padding:0 16px;text-align:center;">
          <p style="margin:0 0 2px 0;font-size:11px;color:rgba(255,255,255,0.5);font-family:Arial,sans-serif;">SAVE</p>
          <p style="margin:0;font-size:20px;font-weight:700;color:#ef4444;font-family:Arial,sans-serif;">30%</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>`,
      },
      {
        id: 'bundle-deal',
        name: 'Bundle Deal Card',
        desc: 'Buy 2 get 1 / combo offer layout',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fffbeb;border:2px dashed #f59e0b;border-radius:12px;margin-bottom:20px;">
  <tr><td style="padding:20px 25px;text-align:center;">
    <p style="margin:0 0 8px 0;font-size:13px;font-weight:700;color:#d97706;letter-spacing:1px;font-family:Arial,sans-serif;">&#127873; BUNDLE &amp; SAVE</p>
    <p style="margin:0 0 14px 0;font-size:20px;font-weight:800;color:#1e1535;font-family:Arial,sans-serif;">Buy 2 — Get 1 FREE</p>
    <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
      <tr>
        <td style="padding:8px 16px;background:#7530fb;border-radius:8px;font-size:13px;font-weight:700;color:#ffffff;font-family:Arial,sans-serif;">Add 3 to Cart</td>
        <td width="12"></td>
        <td style="font-size:12px;color:#6b7280;font-family:Arial,sans-serif;">Discount applied automatically</td>
      </tr>
    </table>
  </td></tr>
</table>`,
      },
      {
        id: 'was-now-price',
        name: 'Was / Now Price',
        desc: 'Crossed-out old price + bold new price',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8f7ff;border-radius:12px;border-left:4px solid #7530fb;margin-bottom:20px;">
  <tr>
    <td style="padding:16px 20px;">
      <table cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="vertical-align:middle;padding-right:20px;">
          <p style="margin:0 0 2px 0;font-size:11px;color:#9ca3af;font-family:Arial,sans-serif;">Was</p>
          <p style="margin:0;font-size:18px;color:#9ca3af;text-decoration:line-through;font-family:Arial,sans-serif;">&pound;59.99</p>
        </td>
        <td style="vertical-align:middle;border-left:1px solid #ede9fe;padding-left:20px;">
          <p style="margin:0 0 2px 0;font-size:11px;color:#7530fb;font-family:Arial,sans-serif;">Now</p>
          <p style="margin:0;font-size:28px;font-weight:800;color:#7530fb;font-family:Arial,sans-serif;">&pound;39.99</p>
        </td>
        <td style="vertical-align:middle;padding-left:20px;">
          <table cellpadding="0" cellspacing="0" border="0" style="background:#ef4444;border-radius:8px;">
            <tr><td style="padding:6px 12px;font-size:13px;font-weight:700;color:#ffffff;font-family:Arial,sans-serif;">Save &pound;20</td></tr>
          </table>
        </td>
      </tr></table>
    </td>
  </tr>
</table>`,
      },
      {
        id: 'free-shipping-callout',
        name: 'Free Shipping Callout',
        desc: 'Highlighted banner — free shipping terms',
        popular: true,
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#dcfce7;border-radius:12px;margin-bottom:20px;">
  <tr>
    <td width="50" style="padding:16px 0 16px 20px;vertical-align:middle;font-size:28px;line-height:1;">&#128666;</td>
    <td style="padding:16px 20px 16px 12px;vertical-align:middle;">
      <p style="margin:0 0 2px 0;font-size:14px;font-weight:700;color:#166534;font-family:Arial,sans-serif;">FREE UK Shipping Included</p>
      <p style="margin:0;font-size:12px;color:#16a34a;font-family:Arial,sans-serif;">Dispatched same day on orders before 2pm &bull; Tracked delivery 1–3 days</p>
    </td>
  </tr>
</table>`,
      },
    ],
  },

  // ── 6. Shipping & Policy ──────────────────────────────────
  {
    id: 'shipping',
    label: 'Shipping & Policy',
    icon: <Truck size={13} />,
    color: '#e0f2fe',
    blocks: [
      {
        id: 'shipping-info',
        name: 'Shipping Info Box',
        desc: 'Dispatch time, carrier, estimated delivery',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:20px;">
  <tr style="background:#f8f7ff;"><td colspan="2" style="padding:12px 16px;font-size:14px;font-weight:700;color:#1e1535;font-family:Arial,sans-serif;border-bottom:1px solid #e5e7eb;">&#128666; Shipping Information</td></tr>
  ${[['Dispatch', 'Same day on orders before 2pm (Mon–Fri)'], ['Carrier', 'Royal Mail / DPD Tracked'], ['UK Delivery', '1–3 Working Days'], ['Express', 'Next Day available at checkout'], ['International', 'Available — see listing for details']].map(([label, val]) => `  <tr>
    <td style="padding:10px 16px;font-size:12px;font-weight:600;color:#6b7280;width:30%;border-bottom:1px solid #f3f4f6;font-family:Arial,sans-serif;">${label}</td>
    <td style="padding:10px 16px;font-size:12px;color:#374151;border-bottom:1px solid #f3f4f6;font-family:Arial,sans-serif;">${val}</td>
  </tr>`).join('\n')}
</table>`,
      },
      {
        id: 'returns-policy',
        name: 'Returns Policy Card',
        desc: '30-day return terms in clear readable layout',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;margin-bottom:20px;">
  <tr><td style="padding:20px 24px;">
    <p style="margin:0 0 12px 0;font-size:14px;font-weight:700;color:#1e40af;font-family:Arial,sans-serif;">&#128260; 30-Day Returns Policy</p>
    <p style="margin:0 0 8px 0;font-size:12px;color:#374151;font-family:Arial,sans-serif;line-height:1.6;">We want you to be 100% happy with your purchase. If for any reason you're not satisfied, simply return the item within 30 days of receipt for a full refund.</p>
    <table cellpadding="0" cellspacing="0" border="0">
      ${['Item must be in original condition', 'Return postage covered by buyer', 'Refund processed within 48 hours', 'No restocking fees'].map(item => `<tr><td style="padding:3px 0;"><table cellpadding="0" cellspacing="0" border="0"><tr><td style="color:#3b82f6;font-size:12px;padding-right:6px;font-family:Arial,sans-serif;">&#10003;</td><td style="font-size:12px;color:#374151;font-family:Arial,sans-serif;">${item}</td></tr></table></td></tr>`).join('\n      ')}
    </table>
  </td></tr>
</table>`,
      },
      {
        id: 'packaging-info',
        name: 'Packaging Info',
        desc: '"Ships in original box" / eco packaging note',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0fdf4;border-radius:12px;border:1px solid #bbf7d0;margin-bottom:20px;">
  <tr>
    <td width="50" style="padding:16px 0 16px 20px;font-size:28px;line-height:1;">&#9851;</td>
    <td style="padding:16px 20px 16px 12px;">
      <p style="margin:0 0 4px 0;font-size:13px;font-weight:700;color:#166534;font-family:Arial,sans-serif;">Eco-Friendly Packaging</p>
      <p style="margin:0;font-size:12px;color:#16a34a;font-family:Arial,sans-serif;">Shipped in 100% recyclable packaging. Item sealed in original manufacturer box with all accessories and documentation.</p>
    </td>
  </tr>
</table>`,
      },
      {
        id: 'international-shipping',
        name: 'International Shipping',
        desc: 'Countries shipped to + customs note',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:20px;">
  <tr style="background:#1e1535;"><td style="padding:12px 16px;font-size:13px;font-weight:700;color:#ffffff;font-family:Arial,sans-serif;">&#127758; International Shipping Available</td></tr>
  <tr><td style="padding:16px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td width="50%" style="padding:6px 12px 6px 0;font-size:12px;color:#374151;font-family:Arial,sans-serif;vertical-align:top;"><strong>Europe:</strong> 3–7 days &bull; Tracked</td>
        <td width="50%" style="padding:6px 0 6px 12px;font-size:12px;color:#374151;font-family:Arial,sans-serif;vertical-align:top;border-left:1px solid #f3f4f6;"><strong>USA / Canada:</strong> 5–10 days &bull; Tracked</td>
      </tr>
      <tr>
        <td colspan="2" style="padding:10px 0 0 0;font-size:11px;color:#9ca3af;font-family:Arial,sans-serif;border-top:1px solid #f3f4f6;">&#9432; Customs &amp; import duties may apply and are the buyer's responsibility.</td>
      </tr>
    </table>
  </td></tr>
</table>`,
      },
    ],
  },

  // ── 7. Image Layouts ──────────────────────────────────────
  {
    id: 'images',
    label: 'Image Layouts',
    icon: <Image size={13} />,
    color: '#dbeafe',
    blocks: [
      {
        id: 'image-text-side',
        name: 'Image + Text Side',
        desc: 'Photo left, description text right (2-col)',
        popular: true,
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
  <tr>
    <td width="45%" style="vertical-align:top;padding-right:16px;">
      <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='220' viewBox='0 0 300 220'%3E%3Crect width='300' height='220' fill='%237530fb'/%3E%3Crect x='110' y='80' width='80' height='60' rx='8' fill='rgba(255,255,255,0.2)'/%3E%3Ccircle cx='130' cy='100' r='12' fill='rgba(255,255,255,0.4)'/%3E%3Cpolygon points='122,118 138,118 145,100 115,100' fill='rgba(255,255,255,0.3)'/%3E%3Ctext x='150' y='160' font-family='Arial' font-size='12' fill='rgba(255,255,255,0.6)' text-anchor='middle'%3EYour Photo Here%3C/text%3E%3C/svg%3E" alt="Product image" width="100%" height="auto" style="display:block;border-radius:10px;max-width:300px;" />
    </td>
    <td width="55%" style="vertical-align:top;">
      <h3 style="margin:0 0 10px 0;font-size:17px;font-weight:700;color:#1e1535;font-family:Arial,sans-serif;">Product Headline</h3>
      <p style="margin:0 0 12px 0;font-size:13px;color:#6b7280;font-family:Arial,sans-serif;line-height:1.6;">Describe the key feature of this product in detail. Explain what makes it special and why buyers will love it.</p>
      <table cellpadding="0" cellspacing="0" border="0">
        ${['Premium build quality', 'Includes all accessories', '12-month warranty'].map(item => `<tr><td style="padding:4px 0;"><table cellpadding="0" cellspacing="0" border="0"><tr><td style="color:#7530fb;font-size:13px;padding-right:6px;">&#10003;</td><td style="font-size:13px;color:#374151;font-family:Arial,sans-serif;">${item}</td></tr></table></td></tr>`).join('\n        ')}
      </table>
    </td>
  </tr>
</table>`,
      },
      {
        id: 'image-gallery-row',
        name: 'Image Gallery Row',
        desc: '3 images side by side with captions',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
  <tr>
    <td width="33%" style="padding:0 4px;text-align:center;">
      <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='160' viewBox='0 0 200 160'%3E%3Crect width='200' height='160' fill='%237530fb'/%3E%3Crect x='70' y='50' width='60' height='60' rx='6' fill='rgba(255,255,255,0.2)'/%3E%3Ccircle cx='90' cy='68' r='10' fill='rgba(255,255,255,0.4)'/%3E%3Cpolygon points='82,95 98,95 105,75 75,75' fill='rgba(255,255,255,0.3)'/%3E%3C/svg%3E" alt="Front View" width="100%" height="auto" style="display:block;border-radius:10px;margin-bottom:6px;" />
      <p style="margin:0;font-size:11px;color:#6b7280;font-family:Arial,sans-serif;">Front View</p>
    </td>
    <td width="33%" style="padding:0 4px;text-align:center;">
      <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='160' viewBox='0 0 200 160'%3E%3Crect width='200' height='160' fill='%231e1535'/%3E%3Crect x='70' y='50' width='60' height='60' rx='6' fill='rgba(255,255,255,0.1)'/%3E%3Ccircle cx='90' cy='68' r='10' fill='rgba(184,250,51,0.3)'/%3E%3Cpolygon points='82,95 98,95 105,75 75,75' fill='rgba(117,48,251,0.4)'/%3E%3C/svg%3E" alt="Side View" width="100%" height="auto" style="display:block;border-radius:10px;margin-bottom:6px;" />
      <p style="margin:0;font-size:11px;color:#6b7280;font-family:Arial,sans-serif;">Side View</p>
    </td>
    <td width="33%" style="padding:0 4px;text-align:center;">
      <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='160' viewBox='0 0 200 160'%3E%3Crect width='200' height='160' fill='%23f3eeff'/%3E%3Crect x='70' y='50' width='60' height='60' rx='6' fill='%23ede9fe'/%3E%3Ccircle cx='90' cy='68' r='10' fill='%237530fb' opacity='0.4'/%3E%3Cpolygon points='82,95 98,95 105,75 75,75' fill='%237530fb' opacity='0.3'/%3E%3C/svg%3E" alt="Detail" width="100%" height="auto" style="display:block;border-radius:10px;margin-bottom:6px;" />
      <p style="margin:0;font-size:11px;color:#6b7280;font-family:Arial,sans-serif;">Detail</p>
    </td>
  </tr>
</table>`,
      },
      {
        id: 'infographic-card',
        name: 'Infographic Card',
        desc: 'Full-width image with overlaid text caption',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;position:relative;">
  <tr><td style="padding:0;border-radius:12px;overflow:hidden;">
    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='700' height='280' viewBox='0 0 700 280'%3E%3Crect width='700' height='280' fill='%231e1535'/%3E%3Crect x='280' y='90' width='140' height='100' rx='10' fill='rgba(255,255,255,0.1)'/%3E%3Ccircle cx='320' cy='125' r='20' fill='rgba(184,250,51,0.4)'/%3E%3Cpolygon points='308,155 332,155 345,125 295,125' fill='rgba(117,48,251,0.5)'/%3E%3Ctext x='350' y='220' font-family='Arial' font-size='14' fill='rgba(255,255,255,0.4)' text-anchor='middle'%3EReplace with your infographic image%3C/text%3E%3C/svg%3E" alt="Product infographic" width="100%" height="auto" style="display:block;border-radius:12px;" />
  </td></tr>
  <tr><td style="padding:12px 16px;background:#f8f7ff;border-radius:0 0 12px 12px;border:1px solid #ede9fe;border-top:none;">
    <p style="margin:0;font-size:12px;color:#6b7280;text-align:center;font-family:Arial,sans-serif;">&#9432; Replace this with your own infographic or product image — max 700px wide, HTTPS only</p>
  </td></tr>
</table>`,
      },
    ],
  },

  // ── 8. About Seller ───────────────────────────────────────
  {
    id: 'seller',
    label: 'About Seller',
    icon: <Store size={13} />,
    color: '#dcfce7',
    blocks: [
      {
        id: 'store-info',
        name: 'Store Info Card',
        desc: 'Store name + years trading + feedback summary',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#1e1535;border-radius:12px;margin-bottom:20px;">
  <tr>
    <td width="60" style="padding:20px 0 20px 20px;vertical-align:top;">
      <table width="48" height="48" cellpadding="0" cellspacing="0" border="0" style="background:#7530fb;border-radius:12px;">
        <tr><td style="text-align:center;vertical-align:middle;font-size:20px;font-weight:800;color:#ffffff;font-family:Arial,sans-serif;">S</td></tr>
      </table>
    </td>
    <td style="padding:20px;vertical-align:top;">
      <p style="margin:0 0 2px 0;font-size:16px;font-weight:700;color:#ffffff;font-family:Arial,sans-serif;">Your Store Name</p>
      <p style="margin:0 0 10px 0;font-size:11px;color:rgba(255,255,255,0.5);font-family:Arial,sans-serif;">Top Rated Seller &bull; Trading since 2018</p>
      <table cellpadding="0" cellspacing="0" border="0">
        <tr>
          ${[['2,400+', 'Transactions'], ['99.8%', 'Positive'], ['5★', 'Rating']].map(([val, label]) => `<td style="padding:0 16px 0 0;text-align:center;">
            <p style="margin:0 0 1px 0;font-size:16px;font-weight:700;color:#b8fa33;font-family:Arial,sans-serif;">${val}</p>
            <p style="margin:0;font-size:10px;color:rgba(255,255,255,0.4);font-family:Arial,sans-serif;">${label}</p>
          </td>`).join('\n          ')}
        </tr>
      </table>
    </td>
  </tr>
</table>`,
      },
      {
        id: 'contact-questions',
        name: 'Contact / Questions Box',
        desc: '"Message me before buying" CTA box',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3eeff;border:1px solid #ddd6fe;border-radius:12px;margin-bottom:20px;">
  <tr><td style="padding:20px 24px;text-align:center;">
    <p style="margin:0 0 6px 0;font-size:20px;">&#128172;</p>
    <p style="margin:0 0 6px 0;font-size:15px;font-weight:700;color:#1e1535;font-family:Arial,sans-serif;">Have a Question?</p>
    <p style="margin:0;font-size:12px;color:#6b7280;font-family:Arial,sans-serif;line-height:1.6;">Feel free to message me before purchasing. I typically respond within a few hours and am happy to help with any queries about the item, postage, or bundling.</p>
  </td></tr>
</table>`,
      },
      {
        id: 'see-more-listings',
        name: 'See More Listings',
        desc: '"Visit my store" footer with category links',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:2px solid #7530fb;margin-bottom:20px;padding-top:16px;">
  <tr><td style="padding-bottom:12px;text-align:center;">
    <p style="margin:0;font-size:13px;color:#6b7280;font-family:Arial,sans-serif;">&#127975; Visit our store for more great deals</p>
  </td></tr>
  <tr><td style="text-align:center;">
    <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
      <tr>
        ${['Electronics', 'Accessories', 'Clothing', 'Home & Garden'].map(cat => `<td style="padding:0 6px;">
          <table cellpadding="0" cellspacing="0" border="0" style="background:#f8f7ff;border:1px solid #ede9fe;border-radius:8px;">
            <tr><td style="padding:6px 14px;font-size:11px;font-weight:600;color:#7530fb;font-family:Arial,sans-serif;">${cat}</td></tr>
          </table>
        </td>`).join('\n        ')}
      </tr>
    </table>
  </td></tr>
</table>`,
      },
    ],
  },

  // ── 9. Dividers & Spacers ─────────────────────────────────
  {
    id: 'dividers',
    label: 'Dividers & Spacers',
    icon: <Minus size={13} />,
    color: '#f3f4f6',
    blocks: [
      {
        id: 'gradient-divider',
        name: 'Gradient Divider',
        desc: 'Purple → lime branded separator line',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;">
  <tr><td style="height:3px;background:linear-gradient(to right,#7530fb,#b8fa33);border-radius:2px;"></td></tr>
</table>`,
      },
      {
        id: 'section-label',
        name: 'Section Label Divider',
        desc: 'Centred text divider "— Overview —"',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;">
  <tr>
    <td style="border-top:1px solid #ede9fe;vertical-align:middle;"></td>
    <td style="padding:0 16px;white-space:nowrap;">
      <p style="margin:0;font-size:11px;font-weight:700;color:#9ca3af;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">— Overview —</p>
    </td>
    <td style="border-top:1px solid #ede9fe;vertical-align:middle;"></td>
  </tr>
</table>`,
      },
      {
        id: 'spacer',
        name: 'Spacer Block',
        desc: 'Empty vertical gap block (16 / 32 / 48px)',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr><td style="height:32px;font-size:0;line-height:0;">&nbsp;</td></tr>
</table>`,
      },
    ],
  },

  // ── 10. Cross-Sell & Upsell ───────────────────────────────
  {
    id: 'crosssell',
    label: 'Cross-Sell & Upsell',
    icon: <ShoppingBag size={13} />,
    color: '#fce7f3',
    blocks: [
      {
        id: 'crosssell-row',
        name: 'Cross-Sell Row',
        desc: '3 items from your store — keeps buyers browsing',
        popular: true,
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
  <tr><td style="padding-bottom:12px;">
    <p style="margin:0;font-size:14px;font-weight:700;color:#1e1535;font-family:Arial,sans-serif;">You May Also Like</p>
  </td></tr>
  <tr>
    <td width="33%" style="padding:0 6px;vertical-align:top;text-align:center;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border:1px solid #ede9fe;border-radius:10px;overflow:hidden;">
        <tr><td><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='140' viewBox='0 0 160 140'%3E%3Crect width='160' height='140' fill='%237530fb'/%3E%3Ccircle cx='80' cy='65' r='28' fill='rgba(255,255,255,0.15)'/%3E%3Ccircle cx='68' cy='55' r='10' fill='rgba(255,255,255,0.4)'/%3E%3Cpolygon points='60,85 76,85 82,65 54,65' fill='rgba(255,255,255,0.3)'/%3E%3C/svg%3E" alt="Item One" width="100%" height="auto" style="display:block;" /></td></tr>
        <tr><td style="padding:8px;"><p style="margin:0 0 4px 0;font-size:12px;font-weight:600;color:#1e1535;font-family:Arial,sans-serif;">Item One</p><p style="margin:0;font-size:13px;font-weight:700;color:#7530fb;font-family:Arial,sans-serif;">£29.99</p></td></tr>
      </table>
    </td>
    <td width="33%" style="padding:0 6px;vertical-align:top;text-align:center;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border:1px solid #ede9fe;border-radius:10px;overflow:hidden;">
        <tr><td><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='140' viewBox='0 0 160 140'%3E%3Crect width='160' height='140' fill='%231e1535'/%3E%3Ccircle cx='80' cy='65' r='28' fill='rgba(255,255,255,0.08)'/%3E%3Ccircle cx='68' cy='55' r='10' fill='rgba(184,250,51,0.4)'/%3E%3Cpolygon points='60,85 76,85 82,65 54,65' fill='rgba(117,48,251,0.4)'/%3E%3C/svg%3E" alt="Item Two" width="100%" height="auto" style="display:block;" /></td></tr>
        <tr><td style="padding:8px;"><p style="margin:0 0 4px 0;font-size:12px;font-weight:600;color:#1e1535;font-family:Arial,sans-serif;">Item Two</p><p style="margin:0;font-size:13px;font-weight:700;color:#7530fb;font-family:Arial,sans-serif;">£19.99</p></td></tr>
      </table>
    </td>
    <td width="33%" style="padding:0 6px;vertical-align:top;text-align:center;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border:1px solid #ede9fe;border-radius:10px;overflow:hidden;">
        <tr><td><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='140' viewBox='0 0 160 140'%3E%3Crect width='160' height='140' fill='%23b8fa33'/%3E%3Ccircle cx='80' cy='65' r='28' fill='rgba(30,21,53,0.12)'/%3E%3Ccircle cx='68' cy='55' r='10' fill='rgba(30,21,53,0.3)'/%3E%3Cpolygon points='60,85 76,85 82,65 54,65' fill='rgba(30,21,53,0.2)'/%3E%3C/svg%3E" alt="Item Three" width="100%" height="auto" style="display:block;" /></td></tr>
        <tr><td style="padding:8px;"><p style="margin:0 0 4px 0;font-size:12px;font-weight:600;color:#1e1535;font-family:Arial,sans-serif;">Item Three</p><p style="margin:0;font-size:13px;font-weight:700;color:#7530fb;font-family:Arial,sans-serif;">£39.99</p></td></tr>
      </table>
    </td>
  </tr>
</table>`,
      },
      {
        id: 'accessories-upsell',
        name: 'Accessories Upsell',
        desc: '"Complete the look" — 3 suggested add-ons',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8f7ff;border-radius:12px;margin-bottom:20px;padding:16px;">
  <tr><td style="padding-bottom:12px;">
    <p style="margin:0 0 2px 0;font-size:14px;font-weight:700;color:#1e1535;font-family:Arial,sans-serif;">Complete Your Setup</p>
    <p style="margin:0;font-size:12px;color:#6b7280;font-family:Arial,sans-serif;">Frequently bought together with this item</p>
  </td></tr>
  <tr>
    ${[['Carry Case', 'Protective storage', '£12.99'], ['Screen Protector', 'Pack of 3', '£7.99'], ['Charging Cable', '1m braided', '£9.99']].map(([name, sub, price]) => `<td width="33%" style="padding:0 4px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border:1px solid #ede9fe;border-radius:10px;">
        <tr><td style="padding:10px;text-align:center;">
          <p style="margin:0 0 2px 0;font-size:11px;font-weight:700;color:#1e1535;font-family:Arial,sans-serif;">${name}</p>
          <p style="margin:0 0 4px 0;font-size:10px;color:#9ca3af;font-family:Arial,sans-serif;">${sub}</p>
          <p style="margin:0;font-size:12px;font-weight:700;color:#7530fb;font-family:Arial,sans-serif;">+ ${price}</p>
        </td></tr>
      </table>
    </td>`).join('\n    ')}
  </tr>
</table>`,
      },
      {
        id: 'social-proof-counter',
        name: 'Social Proof Counter',
        desc: '"500+ sold this month" urgency stat badges',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
  <tr>
    ${[['500+', 'Sold This Month', '#7530fb', '#f3eeff'], ['2,400+', 'Happy Buyers', '#16a34a', '#dcfce7'], ['3', 'Left In Stock', '#ef4444', '#fee2e2']].map(([num, label, color, bg]) => `<td width="33%" style="padding:0 4px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${bg};border-radius:12px;text-align:center;">
        <tr><td style="padding:14px 8px;">
          <p style="margin:0 0 2px 0;font-size:20px;font-weight:800;color:${color};font-family:Arial,sans-serif;">${num}</p>
          <p style="margin:0;font-size:10px;font-weight:600;color:${color};font-family:Arial,sans-serif;opacity:0.8;">${label}</p>
        </td></tr>
      </table>
    </td>`).join('\n    ')}
  </tr>
</table>`,
      },
      {
        id: 'urgency-stock',
        name: 'Low Stock Warning',
        desc: '"Only 3 left" urgency block — static HTML',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fff7ed;border:2px solid #fed7aa;border-radius:12px;margin-bottom:20px;">
  <tr><td style="padding:14px 20px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td width="32" style="vertical-align:middle;font-size:22px;line-height:1;">&#9888;</td>
      <td style="padding-left:10px;vertical-align:middle;">
        <p style="margin:0 0 2px 0;font-size:13px;font-weight:700;color:#c2410c;font-family:Arial,sans-serif;">Only 3 Left In Stock!</p>
        <p style="margin:0;font-size:12px;color:#ea580c;font-family:Arial,sans-serif;">This item is selling fast — order now to avoid missing out</p>
      </td>
      <td style="text-align:right;vertical-align:middle;padding-left:12px;">
        <table cellpadding="0" cellspacing="0" border="0" style="background:#ea580c;border-radius:20px;margin-left:auto;">
          <tr><td style="padding:5px 14px;font-size:11px;font-weight:700;color:#ffffff;font-family:Arial,sans-serif;white-space:nowrap;">Hurry!</td></tr>
        </table>
      </td>
    </tr></table>
  </td></tr>
</table>`,
      },
    ],
  },

  // ── 11. Buyer Info ────────────────────────────────────────
  {
    id: 'buyerinfo',
    label: 'Buyer Information',
    icon: <HelpCircle size={13} />,
    color: '#e0f2fe',
    blocks: [
      {
        id: 'faq-block',
        name: 'FAQ / Q&A Block',
        desc: 'Top 5 buyer questions answered inline',
        popular: true,
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
  <tr><td style="padding-bottom:12px;">
    <p style="margin:0;font-size:15px;font-weight:700;color:#1e1535;font-family:Arial,sans-serif;">Frequently Asked Questions</p>
  </td></tr>
  ${[
            ['Is this brand new and sealed?', 'Yes, this item is 100% brand new, factory sealed, and in original manufacturer packaging. All accessories are included.'],
            ['How fast will it be dispatched?', 'We dispatch the same business day on orders placed before 2pm (Mon–Fri). You\'ll receive a tracking number via email.'],
            ['Do you accept returns?', 'Yes — we offer a 30-day hassle-free returns policy. Simply message us and we\'ll arrange the return.'],
            ['Is the warranty valid in the UK?', 'Yes, full 12-month manufacturer warranty. Contact us if you have any issues and we\'ll handle it promptly.'],
            ['Can I buy multiple items?', 'Yes! Message us before purchasing for a combined postage discount on multiple items.'],
          ].map(([q, a], i) => `  <tr><td style="padding:10px 0;${i < 4 ? 'border-bottom:1px solid #f3f4f6;' : ''}">
    <p style="margin:0 0 4px 0;font-size:13px;font-weight:700;color:#7530fb;font-family:Arial,sans-serif;">Q: ${q}</p>
    <p style="margin:0;font-size:12px;color:#374151;font-family:Arial,sans-serif;line-height:1.6;">A: ${a}</p>
  </td></tr>`).join('\n')}
</table>`,
      },
      {
        id: 'whats-in-box',
        name: "What's in the Box",
        desc: 'Every included item listed — most asked question',
        popular: true,
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #ede9fe;border-radius:12px;overflow:hidden;margin-bottom:20px;">
  <tr style="background:#7530fb;"><td style="padding:12px 16px;">
    <p style="margin:0;font-size:13px;font-weight:700;color:#ffffff;font-family:Arial,sans-serif;">&#128230; What's in the Box</p>
  </td></tr>
  <tr><td style="padding:16px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      ${[
            ['1x', 'Main Unit (as pictured)'],
            ['1x', 'Power Adapter / Charger'],
            ['1x', 'USB Cable (1 metre)'],
            ['1x', 'User Manual'],
            ['1x', 'Quick Start Guide'],
            ['2x', 'Replacement Tips / Accessories'],
            ['1x', 'Original Manufacturer Packaging'],
          ].map(([qty, item]) => `<tr>
        <td width="40" style="padding:5px 0;vertical-align:top;"><span style="display:inline-block;background:#f3eeff;border-radius:6px;padding:1px 8px;font-size:11px;font-weight:700;color:#7530fb;font-family:Arial,sans-serif;">${qty}</span></td>
        <td style="padding:5px 0;font-size:12px;color:#374151;font-family:Arial,sans-serif;">${item}</td>
      </tr>`).join('\n      ')}
    </table>
  </td></tr>
</table>`,
      },
      {
        id: 'condition-grading',
        name: 'Condition Grading Scale',
        desc: 'A/B/C visual grade scale for used items',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
  <tr><td style="padding-bottom:12px;">
    <p style="margin:0;font-size:14px;font-weight:700;color:#1e1535;font-family:Arial,sans-serif;">Item Condition Guide</p>
  </td></tr>
  <tr>
    ${[
            ['A', 'Excellent', 'Like new. No visible wear. May have been opened but unused.', '#16a34a', '#dcfce7', '#86efac'],
            ['B', 'Good', 'Light use. Minor surface marks only. Fully functional.', '#d97706', '#fef3c7', '#fde68a'],
            ['C', 'Fair', 'Visible signs of use. Some cosmetic marks. Fully working.', '#ef4444', '#fee2e2', '#fca5a5'],
          ].map(([grade, label, desc, color, bg, border]) => `<td width="33%" style="padding:0 4px;vertical-align:top;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${bg};border:2px solid ${border};border-radius:10px;text-align:center;">
        <tr><td style="padding:14px 8px;">
          <p style="margin:0 0 3px 0;font-size:22px;font-weight:800;color:${color};font-family:Arial,sans-serif;">${grade}</p>
          <p style="margin:0 0 6px 0;font-size:12px;font-weight:700;color:${color};font-family:Arial,sans-serif;">${label}</p>
          <p style="margin:0;font-size:10px;color:${color};font-family:Arial,sans-serif;opacity:0.8;line-height:1.4;">${desc}</p>
        </td></tr>
      </table>
    </td>`).join('\n    ')}
  </tr>
  <tr><td colspan="3" style="padding-top:10px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3eeff;border-radius:8px;border-left:4px solid #7530fb;">
      <tr><td style="padding:10px 14px;font-size:12px;color:#7530fb;font-family:Arial,sans-serif;"><strong>This item is graded: B — Good</strong> — Please see photos for exact condition details.</td></tr>
    </table>
  </td></tr>
</table>`,
      },
      {
        id: 'care-instructions',
        name: 'Care Instructions',
        desc: 'Washing, storage, usage care guide',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:20px;">
  <tr style="background:#f8f7ff;"><td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;">
    <p style="margin:0;font-size:13px;font-weight:700;color:#1e1535;font-family:Arial,sans-serif;">Care &amp; Maintenance Instructions</p>
  </td></tr>
  <tr><td style="padding:16px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      ${[
            ['&#9748;', 'Washing', 'Machine wash at 30°C on gentle cycle only'],
            ['&#128684;', 'Drying', 'Air dry flat — do not tumble dry'],
            ['&#9878;', 'Ironing', 'Low heat only — do not iron print areas'],
            ['&#128206;', 'Storage', 'Store in cool, dry place away from direct sunlight'],
            ['&#10007;', 'Avoid', 'Bleach, harsh chemicals, abrasive cleaners'],
          ].map(([icon, label, val]) => `<tr style="border-bottom:1px solid #f3f4f6;">
        <td width="30" style="padding:9px 0;font-size:16px;line-height:1;">${icon}</td>
        <td width="80" style="padding:9px 8px;font-size:12px;font-weight:600;color:#6b7280;font-family:Arial,sans-serif;">${label}</td>
        <td style="padding:9px 0;font-size:12px;color:#374151;font-family:Arial,sans-serif;">${val}</td>
      </tr>`).join('\n      ')}
    </table>
  </td></tr>
</table>`,
      },
      {
        id: 'video-placeholder',
        name: 'Video Demo Placeholder',
        desc: 'YouTube demo link card — eBay allows this',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#1e1535;border-radius:12px;margin-bottom:20px;overflow:hidden;">
  <tr><td style="padding:28px 24px;text-align:center;">
    <table width="64" height="64" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 14px auto;background:rgba(117,48,251,0.8);border-radius:50%;">
      <tr><td style="text-align:center;vertical-align:middle;font-size:26px;color:#ffffff;">&#9654;</td></tr>
    </table>
    <p style="margin:0 0 6px 0;font-size:16px;font-weight:700;color:#ffffff;font-family:Arial,sans-serif;">Watch the Full Product Demo</p>
    <p style="margin:0 0 16px 0;font-size:12px;color:rgba(255,255,255,0.6);font-family:Arial,sans-serif;">See features, unboxing, and real-world performance in action</p>
    <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;background:#7530fb;border-radius:8px;">
      <tr><td style="padding:10px 24px;font-size:13px;font-weight:700;color:#ffffff;font-family:Arial,sans-serif;">
        <a href="https://www.youtube.com/watch?v=YOUR_VIDEO_ID" style="color:#ffffff;text-decoration:none;">Watch on YouTube &#8594;</a>
      </td></tr>
    </table>
  </td></tr>
</table>`,
      },
      {
        id: 'compatibility-list',
        name: 'Compatibility / Fits List',
        desc: 'Fits: iPhone 14, 15 Pro... — for accessories',
        popular: true,
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #ede9fe;border-radius:12px;overflow:hidden;margin-bottom:20px;">
  <tr style="background:#f3eeff;"><td style="padding:12px 16px;border-bottom:1px solid #ede9fe;">
    <p style="margin:0;font-size:13px;font-weight:700;color:#7530fb;font-family:Arial,sans-serif;">&#10003; Compatible Devices / Models</p>
  </td></tr>
  <tr><td style="padding:14px 16px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td width="50%" style="vertical-align:top;padding-right:12px;">
          ${['iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15 Plus', 'iPhone 15', 'iPhone 14 Pro Max', 'iPhone 14 Pro'].map(m => `<table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:5px;"><tr><td style="color:#7530fb;font-size:12px;padding-right:6px;font-family:Arial,sans-serif;">&#10003;</td><td style="font-size:12px;color:#374151;font-family:Arial,sans-serif;">${m}</td></tr></table>`).join('\n          ')}
        </td>
        <td width="50%" style="vertical-align:top;border-left:1px solid #ede9fe;padding-left:12px;">
          ${['iPhone 14', 'iPhone 14 Plus', 'iPhone 13 Pro Max', 'iPhone 13 Pro', 'iPhone 13', 'iPhone 12 series'].map(m => `<table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:5px;"><tr><td style="color:#7530fb;font-size:12px;padding-right:6px;font-family:Arial,sans-serif;">&#10003;</td><td style="font-size:12px;color:#374151;font-family:Arial,sans-serif;">${m}</td></tr></table>`).join('\n          ')}
        </td>
      </tr>
    </table>
    <p style="margin:10px 0 0 0;font-size:11px;color:#9ca3af;font-family:Arial,sans-serif;border-top:1px solid #f3f4f6;padding-top:8px;">&#9432; Please check your exact model before ordering. Message us if unsure.</p>
  </td></tr>
</table>`,
      },
      {
        id: 'star-rating-summary',
        name: 'Star Rating Summary',
        desc: 'Visual 5-star breakdown with bar chart',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:20px;">
  <tr><td style="padding:20px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td width="40%" style="text-align:center;border-right:1px solid #f3f4f6;padding-right:16px;">
          <p style="margin:0 0 4px 0;font-size:42px;font-weight:800;color:#1e1535;font-family:Arial,sans-serif;">4.9</p>
          <p style="margin:0 0 6px 0;font-size:18px;letter-spacing:2px;color:#f59e0b;">&#11088;&#11088;&#11088;&#11088;&#11088;</p>
          <p style="margin:0;font-size:11px;color:#9ca3af;font-family:Arial,sans-serif;">Based on 2,400+ reviews</p>
        </td>
        <td style="padding-left:16px;">
          ${[[5, '92%'], [4, '5%'], [3, '2%'], [2, '0%'], [1, '1%']].map(([star, pct]) => `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:5px;"><tr>
            <td width="16" style="font-size:11px;color:#6b7280;font-family:Arial,sans-serif;">${star}&#11088;</td>
            <td style="padding:0 8px;"><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3f4f6;border-radius:4px;height:8px;"><tr><td style="background:#f59e0b;border-radius:4px;width:${pct};height:8px;"></td></tr></table></td>
            <td width="32" style="font-size:11px;color:#6b7280;font-family:Arial,sans-serif;text-align:right;">${pct}</td>
          </tr></table>`).join('\n          ')}
        </td>
      </tr>
    </table>
  </td></tr>
</table>`,
      },
      {
        id: 'award-badge-row',
        name: 'Award / Press Badge Row',
        desc: '"As seen in..." / award winner badges',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
  <tr><td style="text-align:center;padding-bottom:10px;">
    <p style="margin:0;font-size:11px;font-weight:700;color:#9ca3af;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">As Seen In &amp; Award Winning</p>
  </td></tr>
  <tr>
    ${[
            ['&#127942;', 'Best Seller', '2024'],
            ['&#128240;', 'Featured In', 'Tech Weekly'],
            ['&#9989;', 'Editor\'s', 'Choice'],
            ['&#11088;', 'Top Rated', 'Seller'],
          ].map(([icon, label1, label2]) => `<td width="25%" style="text-align:center;padding:0 4px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:2px solid #ede9fe;border-radius:10px;padding:12px 8px;">
        <tr><td style="text-align:center;">
          <p style="margin:0 0 4px 0;font-size:22px;">${icon}</p>
          <p style="margin:0 0 1px 0;font-size:10px;font-weight:700;color:#1e1535;font-family:Arial,sans-serif;">${label1}</p>
          <p style="margin:0;font-size:10px;color:#9ca3af;font-family:Arial,sans-serif;">${label2}</p>
        </td></tr>
      </table>
    </td>`).join('\n    ')}
  </tr>
</table>`,
      },
      {
        id: 'two-col-text',
        name: 'Two-Column Text Layout',
        desc: 'General purpose 2-col text for longer content',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
  <tr>
    <td width="50%" style="vertical-align:top;padding-right:16px;">
      <h3 style="margin:0 0 8px 0;font-size:14px;font-weight:700;color:#7530fb;font-family:Arial,sans-serif;">About This Item</h3>
      <p style="margin:0;font-size:13px;color:#374151;font-family:Arial,sans-serif;line-height:1.7;">Describe the first key aspect of your product here. Keep this section focused on benefits rather than features — explain how it helps the buyer.</p>
    </td>
    <td width="50%" style="vertical-align:top;padding-left:16px;border-left:2px solid #ede9fe;">
      <h3 style="margin:0 0 8px 0;font-size:14px;font-weight:700;color:#7530fb;font-family:Arial,sans-serif;">Why Choose Us</h3>
      <p style="margin:0;font-size:13px;color:#374151;font-family:Arial,sans-serif;line-height:1.7;">Explain what makes your listing stand out from competitors. Focus on your unique selling points, service quality, or what makes your store special.</p>
    </td>
  </tr>
</table>`,
      },
    ],
  },

  // ── 12. Category Specific ─────────────────────────────────
  {
    id: 'category',
    label: 'Category Specific',
    icon: <Package size={13} />,
    color: '#fef9c3',
    blocks: [
      {
        id: 'automotive-fitment',
        name: 'Automotive Fitment Table',
        desc: 'Year / Make / Model / Engine — for car parts',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:20px;">
  <tr style="background:#1e1535;">
    ${['Year', 'Make', 'Model', 'Engine', 'Notes'].map(h => `<td style="padding:10px 12px;font-size:11px;font-weight:700;color:#ffffff;text-align:left;font-family:Arial,sans-serif;">${h}</td>`).join('')}
  </tr>
  ${[
            ['2020–2024', 'Ford', 'Focus', '1.0L EcoBoost', 'All trims'],
            ['2019–2023', 'Volkswagen', 'Golf Mk8', '1.5L TSI', 'Excl. GTI'],
            ['2018–2023', 'Vauxhall', 'Astra', '1.2L Turbo', 'K & L series'],
            ['2017–2022', 'Toyota', 'Corolla', '1.8L Hybrid', 'E210 series'],
            ['2016–2021', 'BMW', '3 Series', '2.0L Diesel', 'G20 series'],
          ].map(([year, make, model, engine, notes], i) => `  <tr style="background:${i % 2 === 0 ? '#ffffff' : '#f9fafb'};">
    ${[year, make, model, engine, notes].map(v => `<td style="padding:8px 12px;font-size:12px;color:#374151;font-family:Arial,sans-serif;border-top:1px solid #f3f4f6;">${v}</td>`).join('')}
  </tr>`).join('\n')}
</table>`,
      },
      {
        id: 'jewellery-card',
        name: 'Jewellery / Gemstone Card',
        desc: 'Carat, cut, clarity, colour, metal type specs',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,#1e1535 0%,#3b1d6e 100%);border-radius:12px;margin-bottom:20px;">
  <tr><td style="padding:20px 24px;">
    <p style="margin:0 0 14px 0;font-size:13px;font-weight:700;color:#b8fa33;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">&#128142; Gemstone Certificate</p>
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      ${[
            ['Stone', 'Natural Diamond'], ['Shape', 'Round Brilliant'], ['Carat Weight', '0.75 ct'],
            ['Colour Grade', 'G — Near Colourless'], ['Clarity Grade', 'VS1 — Very Slightly Included'],
            ['Cut Grade', 'Excellent'], ['Metal', '925 Sterling Silver'], ['Setting', '4-Prong Solitaire'],
          ].map(([label, val]) => `<tr>
        <td style="padding:5px 0;font-size:11px;color:rgba(255,255,255,0.5);font-family:Arial,sans-serif;width:40%;border-bottom:1px solid rgba(255,255,255,0.06);">${label}</td>
        <td style="padding:5px 0;font-size:12px;font-weight:600;color:#ffffff;font-family:Arial,sans-serif;border-bottom:1px solid rgba(255,255,255,0.06);">${val}</td>
      </tr>`).join('\n      ')}
    </table>
  </td></tr>
</table>`,
      },
      {
        id: 'book-media-card',
        name: 'Book / Media Details Card',
        desc: 'ISBN, publisher, edition, pages — books, DVDs, games',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:20px;">
  <tr style="background:#f8f7ff;"><td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;">
    <p style="margin:0;font-size:13px;font-weight:700;color:#1e1535;font-family:Arial,sans-serif;">&#128218; Publication Details</p>
  </td></tr>
  <tr><td style="padding:0;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      ${[
            ['Title', 'The Example Book: A Complete Guide'],
            ['Author', 'John Smith'],
            ['Publisher', 'Publisher Name Ltd'],
            ['Edition', '3rd Edition (Revised)'],
            ['Publication Date', 'January 2023'],
            ['ISBN-13', '978-0-000000-00-0'],
            ['Pages', '384 pages'],
            ['Language', 'English'],
            ['Format', 'Hardcover'],
          ].map(([label, val], i) => `<tr style="background:${i % 2 === 0 ? '#ffffff' : '#f9fafb'};">
        <td style="padding:8px 16px;font-size:12px;font-weight:600;color:#6b7280;width:35%;border-bottom:1px solid #f3f4f6;font-family:Arial,sans-serif;">${label}</td>
        <td style="padding:8px 16px;font-size:12px;color:#374151;border-bottom:1px solid #f3f4f6;font-family:Arial,sans-serif;">${val}</td>
      </tr>`).join('\n      ')}
    </table>
  </td></tr>
</table>`,
      },
      {
        id: 'collectible-grade',
        name: 'Collectible Grade Card',
        desc: 'PSA/CGC style grading for cards, coins, comics',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
  <tr>
    <td width="55%" style="vertical-align:top;padding-right:16px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,#1e1535,#312e81);border-radius:12px;border:3px solid #b8fa33;">
        <tr><td style="padding:20px;text-align:center;">
          <p style="margin:0 0 4px 0;font-size:10px;font-weight:700;color:#b8fa33;letter-spacing:3px;font-family:Arial,sans-serif;">GRADED</p>
          <p style="margin:0 0 2px 0;font-size:48px;font-weight:800;color:#ffffff;font-family:Arial,sans-serif;line-height:1;">9.5</p>
          <p style="margin:0 0 8px 0;font-size:12px;color:rgba(255,255,255,0.6);font-family:Arial,sans-serif;">GEM MINT</p>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid rgba(255,255,255,0.15);">
            <tr><td style="padding-top:10px;font-size:10px;color:rgba(255,255,255,0.4);text-align:center;font-family:Arial,sans-serif;">Third Party Grading Company</td></tr>
          </table>
        </td></tr>
      </table>
    </td>
    <td width="45%" style="vertical-align:top;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        ${[
            ['Item', 'Pokémon Charizard Holo'], ['Set', 'Base Set 1st Edition'], ['Year', '1999'],
            ['Cert #', '00000000'], ['Centering', '55/45 L-R'], ['Surface', 'Near Perfect'],
          ].map(([label, val]) => `<tr>
          <td style="padding:5px 0;font-size:10px;color:#9ca3af;font-family:Arial,sans-serif;border-bottom:1px solid #f3f4f6;width:45%;">${label}</td>
          <td style="padding:5px 0;font-size:11px;font-weight:600;color:#1e1535;font-family:Arial,sans-serif;border-bottom:1px solid #f3f4f6;">${val}</td>
        </tr>`).join('\n        ')}
      </table>
    </td>
  </tr>
</table>`,
      },
    ],
  },

  // ── 13. Category Headers ──────────────────────────────────
  {
    id: 'catheaders',
    label: 'Niche Category Headers',
    icon: <Star size={13} />,
    color: '#fce7f3',
    blocks: [
      {
        id: 'electronics-header',
        name: 'Electronics Header',
        desc: 'Branded header for tech & electronics listings',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%);border-radius:12px;margin-bottom:20px;">
  <tr>
    <td width="60" style="padding:20px 0 20px 20px;vertical-align:middle;font-size:32px;line-height:1;">&#9889;</td>
    <td style="padding:20px 20px 20px 12px;vertical-align:middle;">
      <p style="margin:0 0 2px 0;font-size:9px;font-weight:700;color:#60a5fa;letter-spacing:3px;text-transform:uppercase;font-family:Arial,sans-serif;">Electronics & Technology</p>
      <p style="margin:0 0 4px 0;font-size:20px;font-weight:800;color:#ffffff;font-family:Arial,sans-serif;">Product Name Goes Here</p>
      <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.5);font-family:Arial,sans-serif;">Model No. XYZ-100 &bull; Brand New &bull; UK Seller</p>
    </td>
    <td width="80" style="padding:20px 20px 20px 0;text-align:center;vertical-align:middle;">
      <table cellpadding="0" cellspacing="0" border="0" style="background:#3b82f6;border-radius:8px;margin-left:auto;">
        <tr><td style="padding:6px 12px;font-size:11px;font-weight:700;color:#ffffff;font-family:Arial,sans-serif;text-align:center;">Brand<br/>New</td></tr>
      </table>
    </td>
  </tr>
</table>`,
      },
      {
        id: 'clothing-header',
        name: 'Fashion / Clothing Header',
        desc: 'Stylish header for fashion & clothing listings',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,#1e1535 0%,#7530fb 100%);border-radius:12px;margin-bottom:20px;">
  <tr><td style="padding:24px;text-align:center;">
    <p style="margin:0 0 6px 0;font-size:9px;font-weight:700;color:#b8fa33;letter-spacing:4px;text-transform:uppercase;font-family:Arial,sans-serif;">Fashion Collection</p>
    <p style="margin:0 0 8px 0;font-size:22px;font-weight:800;color:#ffffff;letter-spacing:1px;font-family:Arial,sans-serif;">Item Name / Brand</p>
    <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
      <tr>
        ${['XS', 'S', 'M', 'L', 'XL'].map(size => `<td style="padding:0 3px;"><table cellpadding="0" cellspacing="0" border="0" style="background:rgba(255,255,255,0.15);border-radius:6px;"><tr><td style="padding:4px 10px;font-size:11px;font-weight:700;color:#ffffff;font-family:Arial,sans-serif;">${size}</td></tr></table></td>`).join('')}
      </tr>
    </table>
  </td></tr>
</table>`,
      },
      {
        id: 'automotive-header',
        name: 'Automotive Header',
        desc: 'Bold header for car parts & accessories',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#1e1535;border-radius:12px;margin-bottom:20px;border-left:6px solid #ef4444;">
  <tr>
    <td width="60" style="padding:18px 0 18px 16px;vertical-align:middle;font-size:30px;line-height:1;">&#128663;</td>
    <td style="padding:18px 16px;vertical-align:middle;">
      <p style="margin:0 0 2px 0;font-size:9px;font-weight:700;color:#ef4444;letter-spacing:3px;text-transform:uppercase;font-family:Arial,sans-serif;">Automotive Parts</p>
      <p style="margin:0 0 3px 0;font-size:17px;font-weight:800;color:#ffffff;font-family:Arial,sans-serif;">Part Name / Description</p>
      <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.45);font-family:Arial,sans-serif;">OEM Part No: ABC-12345 &bull; Genuine / Aftermarket</p>
    </td>
  </tr>
</table>`,
      },
      {
        id: 'home-garden-header',
        name: 'Home & Garden Header',
        desc: 'Clean header for home, garden & lifestyle',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,#064e3b 0%,#065f46 100%);border-radius:12px;margin-bottom:20px;">
  <tr>
    <td width="60" style="padding:20px 0 20px 20px;vertical-align:middle;font-size:30px;line-height:1;">&#127968;</td>
    <td style="padding:20px 16px;vertical-align:middle;">
      <p style="margin:0 0 2px 0;font-size:9px;font-weight:700;color:#6ee7b7;letter-spacing:3px;text-transform:uppercase;font-family:Arial,sans-serif;">Home &amp; Garden</p>
      <p style="margin:0 0 3px 0;font-size:18px;font-weight:800;color:#ffffff;font-family:Arial,sans-serif;">Product Name Here</p>
      <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.5);font-family:Arial,sans-serif;">Perfect for indoor &amp; outdoor use</p>
    </td>
    <td width="80" style="padding:20px 20px 20px 0;text-align:right;vertical-align:middle;">
      <table cellpadding="0" cellspacing="0" border="0" style="background:#b8fa33;border-radius:8px;margin-left:auto;">
        <tr><td style="padding:6px 12px;font-size:11px;font-weight:700;color:#1e1535;font-family:Arial,sans-serif;text-align:center;">Eco<br/>Friendly</td></tr>
      </table>
    </td>
  </tr>
</table>`,
      },
      {
        id: 'sports-header',
        name: 'Sports & Fitness Header',
        desc: 'High-energy header for sports equipment',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,#b8fa33 0%,#84cc16 100%);border-radius:12px;margin-bottom:20px;">
  <tr>
    <td width="60" style="padding:18px 0 18px 20px;vertical-align:middle;font-size:30px;line-height:1;">&#127947;</td>
    <td style="padding:18px 16px;vertical-align:middle;">
      <p style="margin:0 0 2px 0;font-size:9px;font-weight:700;color:rgba(30,21,53,0.6);letter-spacing:3px;text-transform:uppercase;font-family:Arial,sans-serif;">Sports &amp; Fitness</p>
      <p style="margin:0 0 3px 0;font-size:18px;font-weight:800;color:#1e1535;font-family:Arial,sans-serif;">Product Name Here</p>
      <p style="margin:0;font-size:11px;color:rgba(30,21,53,0.6);font-family:Arial,sans-serif;">Professional Grade &bull; UK Stock</p>
    </td>
  </tr>
</table>`,
      },
    ],
  },

  // ── 14. Finishing Touches ─────────────────────────────────
  {
    id: 'finishing',
    label: 'Finishing Touches',
    icon: <Trophy size={13} />,
    color: '#f0fdf4',
    blocks: [
      {
        id: 'vat-invoice',
        name: 'VAT / Invoice Note',
        desc: 'UK business seller legal VAT + invoice info',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8faff;border:1px solid #e0e7ff;border-radius:12px;margin-bottom:20px;">
  <tr><td style="padding:14px 20px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td width="32" style="vertical-align:top;padding-right:10px;font-size:20px;line-height:1;">&#128203;</td>
      <td style="vertical-align:top;">
        <p style="margin:0 0 4px 0;font-size:13px;font-weight:700;color:#1e40af;font-family:Arial,sans-serif;">VAT Registered Business Seller</p>
        <p style="margin:0 0 2px 0;font-size:12px;color:#374151;font-family:Arial,sans-serif;">VAT Number: <strong>GB 123 4567 89</strong></p>
        <p style="margin:0 0 2px 0;font-size:12px;color:#374151;font-family:Arial,sans-serif;">A full VAT invoice is available upon request — please message us after purchase.</p>
        <p style="margin:0;font-size:11px;color:#6b7280;font-family:Arial,sans-serif;">All prices include UK VAT at the current rate of 20%.</p>
      </td>
    </tr></table>
  </td></tr>
</table>`,
      },
      {
        id: 'bulk-pricing',
        name: 'Wholesale / Bulk Pricing',
        desc: 'Tiered Buy 1 / Buy 5 / Buy 10 pricing table',
        popular: true,
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #ede9fe;border-radius:12px;overflow:hidden;margin-bottom:20px;">
  <tr style="background:#7530fb;">
    <td style="padding:10px 16px;font-size:12px;font-weight:700;color:#ffffff;font-family:Arial,sans-serif;">Quantity</td>
    <td style="padding:10px 16px;font-size:12px;font-weight:700;color:#ffffff;font-family:Arial,sans-serif;">Price Each</td>
    <td style="padding:10px 16px;font-size:12px;font-weight:700;color:#ffffff;font-family:Arial,sans-serif;">You Save</td>
    <td style="padding:10px 16px;font-size:12px;font-weight:700;color:#b8fa33;font-family:Arial,sans-serif;">Discount</td>
  </tr>
  ${[
            ['1 item', '£24.99', '—', 'Standard price'],
            ['2–4 items', '£22.49', '£2.50 each', 'Save 10%'],
            ['5–9 items', '£19.99', '£5.00 each', 'Save 20%'],
            ['10–19 items', '£17.49', '£7.50 each', 'Save 30%'],
            ['20+ items', '£14.99', '£10.00 each', 'Save 40% ⭐'],
          ].map(([qty, price, save, disc], i) => `  <tr style="background:${i % 2 === 0 ? '#ffffff' : '#faf9ff'};">
    <td style="padding:9px 16px;font-size:12px;font-weight:600;color:#1e1535;font-family:Arial,sans-serif;border-top:1px solid #f3f4f6;">${qty}</td>
    <td style="padding:9px 16px;font-size:13px;font-weight:700;color:#7530fb;font-family:Arial,sans-serif;border-top:1px solid #f3f4f6;">${price}</td>
    <td style="padding:9px 16px;font-size:12px;color:#16a34a;font-family:Arial,sans-serif;border-top:1px solid #f3f4f6;">${save}</td>
    <td style="padding:9px 16px;font-size:11px;font-weight:600;color:#6b7280;font-family:Arial,sans-serif;border-top:1px solid #f3f4f6;">${disc}</td>
  </tr>`).join('\n')}
  <tr><td colspan="4" style="padding:10px 16px;background:#f3eeff;font-size:11px;color:#7530fb;font-family:Arial,sans-serif;">
    &#9432; Bulk discounts applied automatically at checkout. Message us for orders of 50+.
  </td></tr>
</table>`,
      },
      {
        id: 'offer-expiry',
        name: 'Offer Expiry / Deal Deadline',
        desc: 'Static deadline urgency box — no JS needed',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#1e1535;border-radius:12px;margin-bottom:20px;">
  <tr><td style="padding:18px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
      <td style="vertical-align:middle;">
        <p style="margin:0 0 3px 0;font-size:10px;font-weight:700;color:#b8fa33;letter-spacing:2px;text-transform:uppercase;font-family:Arial,sans-serif;">&#9200; Limited Time Offer</p>
        <p style="margin:0 0 2px 0;font-size:17px;font-weight:800;color:#ffffff;font-family:Arial,sans-serif;">This price expires Sunday at midnight</p>
        <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.5);font-family:Arial,sans-serif;">Original price returns after the offer ends — don't miss out</p>
      </td>
      <td width="100" style="text-align:right;vertical-align:middle;padding-left:16px;">
        <table cellpadding="0" cellspacing="0" border="0" style="margin-left:auto;">
          <tr>
            ${['Sun', 'Mon', 'Tue'].map((d, i) => `<td style="text-align:center;padding:0 4px;">
              <table cellpadding="0" cellspacing="0" border="0" style="background:${i === 0 ? '#7530fb' : 'rgba(255,255,255,0.08)'};border-radius:8px;min-width:36px;">
                <tr><td style="padding:6px 8px;font-size:16px;font-weight:800;color:#ffffff;text-align:center;font-family:Arial,sans-serif;">0${3 - i}</td></tr>
                <tr><td style="padding:0 4px 4px;font-size:8px;color:rgba(255,255,255,0.4);text-align:center;font-family:Arial,sans-serif;">${d}</td></tr>
              </table>
            </td>`).join('')}
          </tr>
        </table>
      </td>
    </tr></table>
  </td></tr>
</table>`,
      },
      {
        id: 'gift-wrapping',
        name: 'Gift Wrapping Available',
        desc: 'Gift box card — popular for jewellery & clothing',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg,#fdf2f8 0%,#fce7f3 100%);border:1px solid #f9a8d4;border-radius:12px;margin-bottom:20px;">
  <tr>
    <td width="60" style="padding:18px 0 18px 20px;vertical-align:middle;font-size:30px;line-height:1;">&#127873;</td>
    <td style="padding:18px 20px 18px 12px;vertical-align:middle;">
      <p style="margin:0 0 3px 0;font-size:14px;font-weight:700;color:#9d174d;font-family:Arial,sans-serif;">Gift Wrapping Available</p>
      <p style="margin:0 0 6px 0;font-size:12px;color:#be185d;font-family:Arial,sans-serif;">Make it extra special — add a personalised gift message at checkout</p>
      <table cellpadding="0" cellspacing="0" border="0"><tr>
        ${['Luxury gift box', 'Ribbon & bow', 'Free gift card'].map(item => `<td style="padding-right:12px;">
          <table cellpadding="0" cellspacing="0" border="0" style="background:rgba(255,255,255,0.7);border-radius:6px;">
            <tr><td style="padding:3px 10px;font-size:10px;font-weight:600;color:#9d174d;font-family:Arial,sans-serif;">&#10003; ${item}</td></tr>
          </table>
        </td>`).join('')}
      </tr></table>
    </td>
  </tr>
</table>`,
      },
      {
        id: 'pull-quote',
        name: 'Pull Quote / Big Statement',
        desc: 'Large bold trust statement — centred display',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
  <tr><td style="padding:28px 24px;text-align:center;border-left:4px solid #b8fa33;border-right:4px solid #b8fa33;background:#f8f7ff;border-radius:12px;">
    <p style="margin:0 0 8px 0;font-size:28px;font-weight:800;color:#1e1535;font-family:Arial,sans-serif;line-height:1.2;">"Trusted by over 10,000 happy customers"</p>
    <p style="margin:0;font-size:12px;color:#9ca3af;font-family:Arial,sans-serif;letter-spacing:1px;">&#11088;&#11088;&#11088;&#11088;&#11088; &nbsp; 99.8% Positive Feedback &nbsp; &#11088;&#11088;&#11088;&#11088;&#11088;</p>
  </td></tr>
</table>`,
      },
      {
        id: 'colour-variants',
        name: 'Colour / Variant Selector',
        desc: 'Visual swatch row showing available colours',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f8f7ff;border-radius:12px;padding:16px;margin-bottom:20px;">
  <tr><td style="padding-bottom:12px;">
    <p style="margin:0;font-size:13px;font-weight:700;color:#1e1535;font-family:Arial,sans-serif;">Available Colours</p>
  </td></tr>
  <tr><td>
    <table cellpadding="0" cellspacing="0" border="0"><tr>
      ${[
            ['#1e1535', 'Midnight Black', '#ffffff'],
            ['#ffffff', 'Pearl White', '#1e1535'],
            ['#7530fb', 'Royal Purple', '#ffffff'],
            ['#ef4444', 'Cherry Red', '#ffffff'],
            ['#3b82f6', 'Ocean Blue', '#ffffff'],
            ['#16a34a', 'Forest Green', '#ffffff'],
          ].map(([bg, name, text]) => `<td style="padding:0 5px 0 0;vertical-align:top;">
        <table cellpadding="0" cellspacing="0" border="0" style="text-align:center;">
          <tr><td>
            <table width="40" height="40" cellpadding="0" cellspacing="0" border="0" style="background:${bg};border-radius:50%;border:2px solid #ede9fe;margin:0 auto;">
              <tr><td></td></tr>
            </table>
          </td></tr>
          <tr><td style="padding-top:4px;font-size:9px;color:#6b7280;font-family:Arial,sans-serif;white-space:nowrap;">${name}</td></tr>
        </table>
      </td>`).join('')}
    </tr></table>
  </td></tr>
  <tr><td style="padding-top:10px;">
    <p style="margin:0;font-size:11px;color:#9ca3af;font-family:Arial,sans-serif;">&#9432; Select your colour from the drop-down menu above when adding to basket. Message us if your preferred colour is not listed.</p>
  </td></tr>
</table>`,
      },
      {
        id: 'measurement-guide',
        name: 'How to Measure Guide',
        desc: 'Step-by-step fit guide to reduce returns',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin-bottom:20px;">
  <tr style="background:#f8f7ff;"><td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;">
    <p style="margin:0;font-size:13px;font-weight:700;color:#1e1535;font-family:Arial,sans-serif;">&#128210; How to Measure for the Best Fit</p>
  </td></tr>
  <tr><td style="padding:16px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      ${[
            ['1', 'Chest', 'Measure around the fullest part of your chest, keeping the tape horizontal'],
            ['2', 'Waist', 'Measure around your natural waistline, just above your belly button'],
            ['3', 'Hips', 'Measure around the fullest part of your hips, about 20cm below your waist'],
            ['4', 'Inseam', 'Measure from the crotch seam to the bottom of your leg'],
            ['5', 'Length', 'Measure from the top of the shoulder to the desired hem length'],
          ].map(([num, label, desc]) => `<tr>
        <td width="28" style="padding:8px 0;vertical-align:top;">
          <table width="22" height="22" cellpadding="0" cellspacing="0" border="0" style="background:#7530fb;border-radius:50%;">
            <tr><td style="text-align:center;vertical-align:middle;font-size:11px;font-weight:700;color:#ffffff;font-family:Arial,sans-serif;">${num}</td></tr>
          </table>
        </td>
        <td width="70" style="padding:8px 8px;vertical-align:top;font-size:12px;font-weight:700;color:#374151;font-family:Arial,sans-serif;">${label}</td>
        <td style="padding:8px 0;vertical-align:top;font-size:12px;color:#6b7280;font-family:Arial,sans-serif;border-bottom:1px solid #f3f4f6;">${desc}</td>
      </tr>`).join('\n      ')}
    </table>
    <p style="margin:10px 0 0 0;font-size:11px;color:#9ca3af;font-family:Arial,sans-serif;">&#9432; All measurements in centimetres. If between sizes, we recommend sizing up. See our size chart above.</p>
  </td></tr>
</table>`,
      },
      {
        id: 'footer-closing',
        name: 'Footer / Closing Block',
        desc: 'Professional sign-off with store link & feedback',
        html: `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;">
  <tr><td style="height:2px;background:linear-gradient(to right,#7530fb,#b8fa33);border-radius:2px;"></td></tr>
  <tr><td style="padding:20px 0;text-align:center;">
    <p style="margin:0 0 6px 0;font-size:15px;font-weight:700;color:#1e1535;font-family:Arial,sans-serif;">Thank you for viewing our listing!</p>
    <p style="margin:0 0 12px 0;font-size:12px;color:#6b7280;font-family:Arial,sans-serif;line-height:1.6;">We are a UK-based seller committed to quality products and outstanding service.<br/>Please don't hesitate to message us with any questions — we're happy to help.</p>
    <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 12px auto;">
      <tr>
        <td style="padding:0 6px;">
          <table cellpadding="0" cellspacing="0" border="0" style="background:#f3eeff;border:1px solid #ede9fe;border-radius:8px;">
            <tr><td style="padding:7px 16px;font-size:11px;font-weight:600;color:#7530fb;font-family:Arial,sans-serif;">&#127975; Visit Our Store</td></tr>
          </table>
        </td>
        <td style="padding:0 6px;">
          <table cellpadding="0" cellspacing="0" border="0" style="background:#f3eeff;border:1px solid #ede9fe;border-radius:8px;">
            <tr><td style="padding:7px 16px;font-size:11px;font-weight:600;color:#7530fb;font-family:Arial,sans-serif;">&#128172; Message Us</td></tr>
          </table>
        </td>
        <td style="padding:0 6px;">
          <table cellpadding="0" cellspacing="0" border="0" style="background:#dcfce7;border:1px solid #86efac;border-radius:8px;">
            <tr><td style="padding:7px 16px;font-size:11px;font-weight:600;color:#16a34a;font-family:Arial,sans-serif;">&#11088; Leave Feedback</td></tr>
          </table>
        </td>
      </tr>
    </table>
    <p style="margin:0;font-size:10px;color:#d1d5db;font-family:Arial,sans-serif;">&#169; Your Store Name &bull; All rights reserved &bull; Powered by Riazify</p>
  </td></tr>
</table>`,
      },
    ],
  },
]

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
interface Props {
  onInsert: (html: string) => void
}

export default function DescriptionLibrary({ onInsert }: Props): JSX.Element {
  const [openCat, setOpenCat] = useState<string | null>(null)
  const [hoveredBlock, setHoveredBlock] = useState<string | null>(null)
  const [inserted, setInserted] = useState<string | null>(null)

  const totalBlocks = DESIGN_LIBRARY.reduce((sum, cat) => sum + cat.blocks.length, 0)

  function handleInsert(block: DesignBlock) {
    onInsert(block.html)
    setInserted(block.id)
    setTimeout(() => setInserted(null), 1500)
  }

  return (
    <div className="flex flex-col gap-2">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap size={13} style={{ color: C.primary }} />
          <span className="text-[12px] font-bold" style={{ color: C.dark, fontFamily: 'Syne, sans-serif' }}>
            Design Library
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
            style={{ backgroundColor: C.primaryLight, color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>
            {totalBlocks} blocks
          </span>
        </div>
        <span className="text-[10px]" style={{ color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
          Click any block to insert
        </span>
      </div>

      {/* Categories — 2-column grid */}
      <div className="grid grid-cols-2 gap-2">
        {DESIGN_LIBRARY.map(cat => (
          <div key={cat.id} className="rounded-xl overflow-hidden flex flex-col"
            style={{ border: `1px solid ${C.border}`, gridColumn: openCat === cat.id ? 'span 2' : 'span 1' }}>

            {/* Category header */}
            <button
              onClick={() => setOpenCat(openCat === cat.id ? null : cat.id)}
              className="w-full flex items-center justify-between px-3 py-2.5 transition-all hover:opacity-80"
              style={{ backgroundColor: openCat === cat.id ? cat.color : C.surface }}>
              <div className="flex items-center gap-1.5 min-w-0">
                <span style={{ color: C.primary, flexShrink: 0 }}>{cat.icon}</span>
                <span className="text-[11px] font-semibold truncate"
                  style={{ color: C.body, fontFamily: 'DM Sans, sans-serif' }}>
                  {cat.label}
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full shrink-0"
                  style={{ backgroundColor: C.bg, color: C.muted, fontFamily: 'DM Sans, sans-serif' }}>
                  {cat.blocks.length}
                </span>
              </div>
              {openCat === cat.id
                ? <ChevronDown size={12} style={{ color: C.muted, flexShrink: 0 }} />
                : <ChevronRight size={12} style={{ color: C.muted, flexShrink: 0 }} />
              }
            </button>

            {/* Blocks grid */}
            {openCat === cat.id && (
              <div className="p-3 grid grid-cols-2 gap-3"
                style={{ backgroundColor: C.bg, borderTop: `1px solid ${C.border}` }}>
                {cat.blocks.map(block => (
                  <button
                    key={block.id}
                    onClick={() => handleInsert(block)}
                    onMouseEnter={() => setHoveredBlock(block.id)}
                    onMouseLeave={() => setHoveredBlock(null)}
                    className="flex flex-col rounded-xl overflow-hidden text-left transition-all"
                    style={{
                      border: `2px solid ${inserted === block.id ? '#16a34a'
                        : hoveredBlock === block.id ? C.primary
                          : C.border}`,
                      boxShadow: hoveredBlock === block.id ? `0 0 0 3px ${C.primaryLight}` : 'none',
                    }}>

                    {/* Live HTML preview */}
                    <div className="w-full overflow-hidden pointer-events-none"
                      style={{ backgroundColor: '#ffffff', height: 140 }}>
                      <div style={{
                        transform: 'scale(0.55)',
                        transformOrigin: 'top left',
                        width: '182%',
                        padding: '8px 10px',
                        lineHeight: 1.4,
                        fontFamily: 'Arial, sans-serif',
                        fontSize: 14,
                        color: '#1f1d2e',
                      }}
                        dangerouslySetInnerHTML={{ __html: block.html }}
                      />
                    </div>

                    {/* Footer label */}
                    <div className="flex items-center justify-between px-2.5 py-2 shrink-0"
                      style={{
                        backgroundColor: inserted === block.id ? '#dcfce7'
                          : hoveredBlock === block.id ? C.primaryLight
                            : C.surface,
                        borderTop: `1px solid ${C.border}`,
                      }}>
                      <span className="text-[11px] font-semibold"
                        style={{
                          color: inserted === block.id ? C.success
                            : hoveredBlock === block.id ? C.primary
                              : C.body,
                          fontFamily: 'DM Sans, sans-serif',
                        }}>
                        {inserted === block.id ? '✓ Inserted!' : block.name}
                      </span>
                      {block.popular && inserted !== block.id && (
                        <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold"
                          style={{ backgroundColor: C.primaryLight, color: C.primary, fontFamily: 'DM Sans, sans-serif' }}>
                          Popular
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
