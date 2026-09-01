'use client';

import React, { useState, useMemo } from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import {
    Code,
    Sparkles,
    Layers,
    Copy,
    Check,
    Eye,
    Sliders,
    RotateCcw,
    Zap,
    ShieldCheck,
    Smartphone,
    Monitor,
    HelpCircle,
    Headphones,
    Truck,
    ChevronDown,
    CheckCircle2,
    Lock,
    Package,
    Lightbulb,
    Camera,
    Shirt,
    Wrench,
    Heart,
    Building,
    Image as ImageIcon,
    X,
} from 'lucide-react';

// ==========================================
// 1. DATA DEFINITIONS & MOCK DATA
// ==========================================

export interface TemplateItem {
    id: string;
    title: string;
    category: string;
    description: string;
    accentColor: string;
    tags: string[];
    features: {
        mobileOptimized: boolean;
        hasSpecsTable: boolean;
        hasTrustBadges: boolean;
        hasImageGallery: boolean;
    };
    sampleHtml: string;
}

export interface ModularBlock {
    id: string;
    title: string;
    iconName: string;
    category: 'Structure' | 'Trust' | 'Specs' | 'Policy' | 'Media';
    description: string;
    previewContent: string;
}

export interface DynamicTag {
    tag: string;
    label: string;
    description: string;
    exampleValue: string;
}

export interface FaqItem {
    question: string;
    answer: string;
}

const TEMPLATES: TemplateItem[] = [
    {
        id: 't-tech-01',
        title: 'Titan Tech Electronics & Hardware',
        category: 'Electronics',
        description: 'High-contrast dark-mode layout engineered for consumer electronics, refurbished phones, and PC hardware.',
        accentColor: '#7530fb',
        tags: ['Tech', 'Electronics', 'Dark Mode', 'Specs Matrix'],
        features: {
            mobileOptimized: true,
            hasSpecsTable: true,
            hasTrustBadges: true,
            hasImageGallery: true,
        },
        sampleHtml: `<div style="font-family:'DM Sans',sans-serif; max-width:900px; margin:auto; background:#1e1535; color:#ffffff; border-radius:12px; border:1px solid #3d2f63; overflow:hidden;">
  <div style="background:#271c42; padding:28px 24px; text-align:center; border-bottom:4px solid #b8fa33;">
    <span style="background:#7530fb; color:#ffffff; font-size:11px; font-weight:700; padding:4px 12px; border-radius:20px; text-transform:uppercase;">OFFICIAL OUTLET STORE</span>
    <h1 style="font-family:'Syne',sans-serif; font-size:24px; font-weight:800; margin:14px 0 6px; color:#ffffff;">{{PRODUCT_TITLE}}</h1>
    <p style="color:#d4caf7; font-size:13px; margin:0;">Seller: {{SELLER_NAME}} • Condition: {{ITEM_CONDITION}}</p>
  </div>
  <div style="padding:24px; display:grid; grid-template-columns:1fr 1fr; gap:20px;">
    <div style="background:#271c42; padding:18px; border-radius:8px; border:1px solid #3d2f63;">
      <h3 style="color:#b8fa33; font-size:16px; margin-top:0; font-weight:700;">Key Specifications</h3>
      <ul style="padding-left:18px; font-size:13px; line-height:1.8; color:#d4caf7;">
        <li>Original Brand Factory Tested</li>
        <li>100% Guaranteed Authentic Hardware</li>
        <li>Clean IMEI &amp; Unlocked for all carriers</li>
      </ul>
    </div>
    <div style="background:#271c42; padding:18px; border-radius:8px; border:1px solid #3d2f63;">
      <h3 style="color:#b8fa33; font-size:16px; margin-top:0; font-weight:700;">Buyer Protection</h3>
      <p style="font-size:13px; color:#d4caf7; line-height:1.6; margin:0;">
        Special Price: <strong style="color:#fff; font-size:18px;">{{ITEM_PRICE}}</strong><br>
        30-Day Hassle-Free Returns • Free Tracked Shipping • 1-Year Seller Warranty
      </p>
    </div>
  </div>
  <div style="background:#170f2b; padding:16px 24px; text-align:center; font-size:12px; color:#8f84b3; border-top:1px solid #3d2f63;">
    Pure HTML5/CSS3 • 100% VeRO &amp; eBay Active-Content Compliant
  </div>
</div>`,
    },
    {
        id: 't-fashion-02',
        title: 'Aura Minimalist Fashion & Apparel',
        category: 'Fashion',
        description: 'Clean luxury layout with rich sizing guide tables, garment care instructions, and authenticity badges.',
        accentColor: '#7530fb',
        tags: ['Fashion', 'Minimalist', 'Apparel', 'Size Matrix'],
        features: {
            mobileOptimized: true,
            hasSpecsTable: true,
            hasTrustBadges: true,
            hasImageGallery: true,
        },
        sampleHtml: `<div style="font-family:'DM Sans',sans-serif; max-width:900px; margin:auto; background:#ffffff; color:#1f1d2e; border-radius:12px; border:1px solid #ede9fe; overflow:hidden;">
  <div style="background:#f8f7ff; padding:32px 24px; text-align:center; border-bottom:1px solid #ede9fe;">
    <span style="border:1px solid #7530fb; color:#7530fb; font-size:11px; font-weight:700; padding:4px 14px; border-radius:20px; text-transform:uppercase;">AUTHENTIC DESIGNER BOUTIQUE</span>
    <h1 style="font-family:'Syne',sans-serif; font-size:26px; font-weight:800; margin:16px 0 8px; color:#1e1535;">{{PRODUCT_TITLE}}</h1>
    <div style="font-size:20px; font-weight:800; color:#7530fb; margin-top:8px;">{{ITEM_PRICE}}</div>
  </div>
  <div style="padding:28px 24px;">
    <h3 style="font-size:16px; font-weight:700; color:#1e1535; border-bottom:2px solid #f3eeff; padding-bottom:8px;">Product Highlights &amp; Fabric Composition</h3>
    <p style="font-size:14px; color:#4a5568; line-height:1.7;">
      Curated authentic piece. Inspected for fabric integrity, stitching precision, and genuine serial markers.
    </p>
  </div>
</div>`,
    },
    {
        id: 't-auto-03',
        title: 'TorquePro Automotive & Performance Parts',
        category: 'Auto Parts',
        description: 'High-converting industrial design featuring OEM compatibility matrix, VIN check notes, and fitment tables.',
        accentColor: '#7530fb',
        tags: ['Automotive', 'OEM Fitment', 'Heavy Duty'],
        features: {
            mobileOptimized: true,
            hasSpecsTable: true,
            hasTrustBadges: true,
            hasImageGallery: false,
        },
        sampleHtml: `<div style="font-family:'DM Sans',sans-serif; max-width:900px; margin:auto; background:#1e1535; color:#ffffff; border-radius:12px; border:2px solid #b8fa33; overflow:hidden;">
  <div style="background:#271c42; padding:20px; border-bottom:2px solid #3d2f63; display:flex; justify-content:space-between; align-items:center;">
    <div style="font-weight:900; font-size:18px; color:#b8fa33;">TORQUE-PRO GARAGE</div>
    <div style="font-size:12px; color:#d4caf7;">Direct OEM Fitment Guaranteed</div>
  </div>
  <div style="padding:24px;">
    <h2 style="font-size:22px; font-weight:800; margin-top:0; color:#fff;">{{PRODUCT_TITLE}}</h2>
    <div style="background:#170f2b; padding:16px; border-radius:8px; border:1px solid #3d2f63; margin-top:16px;">
      <div style="color:#b8fa33; font-weight:bold; font-size:14px; margin-bottom:8px;">EXACT OEM SPECIFICATION</div>
      <p style="font-size:13px; color:#d4caf7; margin:0; line-height:1.5;">Direct replacement part. Tested against manufacturer tolerances for seamless bolt-on fitment.</p>
    </div>
  </div>
</div>`,
    },
    {
        id: 't-pet-04',
        title: 'Paw & Tail Organic Pet Supplies',
        category: 'Pet Supplies',
        description: 'Approachable design with veterinarian seal callouts, ingredient badges, and safety assurances.',
        accentColor: '#7530fb',
        tags: ['Pet Care', 'Organic', 'Friendly'],
        features: {
            mobileOptimized: true,
            hasSpecsTable: true,
            hasTrustBadges: true,
            hasImageGallery: true,
        },
        sampleHtml: `<div style="font-family:'DM Sans',sans-serif; max-width:900px; margin:auto; background:#ffffff; color:#1f1d2e; border-radius:12px; border:1px solid #ede9fe; overflow:hidden;">
  <div style="background:#f3eeff; padding:24px; text-align:center; border-bottom:1px solid #ede9fe;">
    <span style="background:#7530fb; color:#fff; font-size:11px; font-weight:700; padding:4px 12px; border-radius:20px;">100% PET SAFE &amp; APPROVED</span>
    <h1 style="font-size:24px; font-weight:800; color:#1e1535; margin:10px 0;">{{PRODUCT_TITLE}}</h1>
    <p style="font-size:14px; color:#6b7280; margin:0;">Offered by {{SELLER_NAME}} • Guaranteed Fresh &amp; Safe</p>
  </div>
</div>`,
    },
    {
        id: 't-home-05',
        title: 'Haven & Hearth Home, Kitchen & Garden',
        category: 'Home & Garden',
        description: 'Clean lifestyle layout balancing dimensions specifications with multi-room lifestyle photo grids.',
        accentColor: '#7530fb',
        tags: ['Home Goods', 'Kitchen', 'Lifestyle'],
        features: {
            mobileOptimized: true,
            hasSpecsTable: true,
            hasTrustBadges: true,
            hasImageGallery: true,
        },
        sampleHtml: `<div style="font-family:'DM Sans',sans-serif; max-width:900px; margin:auto; background:#ffffff; color:#1f1d2e; border-radius:12px; border:1px solid #ede9fe; overflow:hidden;">
  <div style="background:#1e1535; color:#ffffff; padding:28px 20px; text-align:center;">
    <h1 style="font-size:22px; font-weight:800; margin:0 0 6px;">{{PRODUCT_TITLE}}</h1>
    <div style="color:#b8fa33; font-weight:bold; font-size:18px;">{{ITEM_PRICE}}</div>
  </div>
  <div style="padding:24px;">
    <p style="font-size:14px; color:#4a5568; line-height:1.7;">Premium home essentials designed for long-lasting durability.</p>
  </div>
</div>`,
    },
    {
        id: 't-sports-06',
        title: 'Apex Athlete Sporting & Outdoor Gear',
        category: 'Sports & Outdoors',
        description: 'High-energy layout equipped with weather resistance seals, technical gear matrix, and sizing chart.',
        accentColor: '#7530fb',
        tags: ['Sporting Goods', 'Outdoors', 'Fitness'],
        features: {
            mobileOptimized: true,
            hasSpecsTable: true,
            hasTrustBadges: true,
            hasImageGallery: true,
        },
        sampleHtml: `<div style="font-family:'DM Sans',sans-serif; max-width:900px; margin:auto; background:#1e1535; color:#ffffff; border-radius:12px; border:1px solid #3d2f63; overflow:hidden;">
  <div style="background:#271c42; padding:24px; text-align:center; border-bottom:3px solid #b8fa33;">
    <span style="background:#b8fa33; color:#1e1535; font-size:11px; font-weight:800; padding:4px 12px; border-radius:20px;">PERFORMANCE TESTED</span>
    <h1 style="font-size:22px; font-weight:800; margin:10px 0 4px;">{{PRODUCT_TITLE}}</h1>
  </div>
</div>`,
    },
    {
        id: 't-jewelry-07',
        title: 'LuxeVault Fine Jewelry & Timepieces',
        category: 'Fine Jewelry',
        description: 'Ultra-prestigious layout for luxury watches, precious metals, natural gemstones, and appraised jewelry.',
        accentColor: '#7530fb',
        tags: ['Luxury', 'Watches', 'Diamonds', 'Vault Direct'],
        features: {
            mobileOptimized: true,
            hasSpecsTable: true,
            hasTrustBadges: true,
            hasImageGallery: true,
        },
        sampleHtml: `<div style="font-family:'DM Sans',sans-serif; max-width:900px; margin:auto; background:#1e1535; color:#ffffff; border-radius:14px; border:1px solid #b8fa33; overflow:hidden;">
  <div style="background:linear-gradient(180deg, #271c42 0%, #1e1535 100%); padding:32px 24px; text-align:center; border-bottom:2px solid #3d2f63;">
    <span style="border:1px solid #b8fa33; color:#b8fa33; font-size:11px; font-weight:800; padding:5px 14px; border-radius:24px; text-transform:uppercase;">CERTIFIED APPRAISED AUTHENTICITY</span>
    <h1 style="font-family:'Syne',sans-serif; font-size:26px; font-weight:800; margin:14px 0 8px; color:#ffffff;">{{PRODUCT_TITLE}}</h1>
    <p style="color:#d4caf7; font-size:13px; margin:0;">Appraiser Verified • Vault Dispatch by {{SELLER_NAME}}</p>
  </div>
  <div style="padding:24px; display:grid; grid-template-columns:1fr 1fr; gap:16px;">
    <div style="background:#271c42; padding:18px; border-radius:10px; border:1px solid #3d2f63;">
      <h3 style="color:#b8fa33; font-size:15px; margin-top:0; font-weight:700;">Precious Metal &amp; Stones</h3>
      <ul style="padding-left:18px; font-size:13px; line-height:1.8; color:#d4caf7; margin:0;">
        <li>18K Solid Gold / Platinum Tested</li>
        <li>Conflict-Free Natural Gemstones</li>
      </ul>
    </div>
    <div style="background:#271c42; padding:18px; border-radius:10px; border:1px solid #3d2f63;">
      <h3 style="color:#b8fa33; font-size:15px; margin-top:0; font-weight:700;">Vault Direct Guarantee</h3>
      <p style="font-size:13px; color:#d4caf7; line-height:1.6; margin:0;">
        Verified Value: <strong style="color:#ffffff; font-size:18px;">{{ITEM_PRICE}}</strong><br>
        Shipped via armored insured courier with adult signature required.
      </p>
    </div>
  </div>
</div>`,
    },
    {
        id: 't-cards-08',
        title: 'MintGrade Trading Cards & Collectibles',
        category: 'Collectibles',
        description: 'Engineered for PSA / BGS / CGC graded cards, vintage comics, signed memorabilia, and rare coin auctions.',
        accentColor: '#7530fb',
        tags: ['PSA Graded', 'Pokemon & Sports', 'Collectibles', 'Tamper Evident'],
        features: {
            mobileOptimized: true,
            hasSpecsTable: true,
            hasTrustBadges: true,
            hasImageGallery: true,
        },
        sampleHtml: `<div style="font-family:'DM Sans',sans-serif; max-width:900px; margin:auto; background:#ffffff; color:#1e1535; border-radius:14px; border:2px solid #ede9fe; overflow:hidden;">
  <div style="background:#1e1535; color:#ffffff; padding:24px 20px; text-align:center; border-bottom:4px solid #7530fb;">
    <div style="display:inline-block; background:#7530fb; color:#ffffff; font-size:11px; font-weight:800; padding:4px 14px; border-radius:20px; text-transform:uppercase; margin-bottom:8px;">
      GEM MINT 10 CERTIFIED
    </div>
    <h1 style="font-family:'Syne',sans-serif; font-size:24px; font-weight:800; margin:4px 0 6px;">{{PRODUCT_TITLE}}</h1>
    <div style="color:#b8fa33; font-size:18px; font-weight:800;">{{ITEM_PRICE}}</div>
  </div>
  <div style="padding:20px; background:#f8f7ff;">
    <p style="font-size:13px; color:#4a5568; margin:0;">Slab serial and certification code verified prior to listing.</p>
  </div>
</div>`,
    },
];

const MODULAR_BLOCKS: ModularBlock[] = [
    {
        id: 'b-header-1',
        title: 'Branded Hero Header & Dynamic Title',
        iconName: 'Building',
        category: 'Structure',
        description: 'Header container containing seller logo, Top Rated badge, and dynamic title macro tags.',
        previewContent: 'OFFICIAL STORE • {{PRODUCT_TITLE}} • {{ITEM_PRICE}}',
    },
    {
        id: 'b-specs-1',
        title: '2-Column Mobile-Stacked Technical Specs Table',
        iconName: 'Zap',
        category: 'Specs',
        description: 'Clean alternating row table highlighting condition, model, SKU, dimensions, and OEM compatibility.',
        previewContent: 'Brand: Sony | Condition: Grade A+ | Model: WH-1000XM5',
    },
    {
        id: 'b-trust-1',
        title: 'VeRO & eBay Safe Trust Badges Ribbon',
        iconName: 'ShieldCheck',
        category: 'Trust',
        description: 'Pre-formatted SVG trust badges: 30-Day Money Back, 100% Authentic, Fast SSL Delivery, 24/7 Support.',
        previewContent: '30-Day Returns • 24h Dispatch • SSL Verified • Top Rated Seller',
    },
    {
        id: 'b-policy-1',
        title: 'Pure CSS Tabbed Shipping & Policy Box',
        iconName: 'HelpCircle',
        category: 'Policy',
        description: 'Mobile-collapsible pure CSS tabs detailing international shipping options, return conditions, and policies.',
        previewContent: 'Shipping Options | 30-Day Returns Policy | Payment Security',
    },
    {
        id: 'b-gallery-1',
        title: 'Multi-Image Responsive Product Showcase',
        iconName: 'ImageIcon',
        category: 'Media',
        description: 'HTTPS SSL CDN-ready image grid that gracefully collapses to single-column thumbnails on smartphones.',
        previewContent: 'Primary Main Angle + 4 Detail Zoom Inspection Tiles',
    },
];

const DYNAMIC_TAGS: DynamicTag[] = [
    {
        tag: '{{PRODUCT_TITLE}}',
        label: 'Listing Title',
        description: 'Automatically inserts the active eBay listing headline.',
        exampleValue: 'Sony WH-1000XM5 Wireless Noise-Canceling Headphones',
    },
    {
        tag: '{{ITEM_PRICE}}',
        label: 'Buy-It-Now Price',
        description: 'Resolves to current active price and currency marker.',
        exampleValue: '$348.00 USD',
    },
    {
        tag: '{{SELLER_NAME}}',
        label: 'eBay Store / Seller ID',
        description: 'Injects your verified business username or brand name.',
        exampleValue: 'SoundWave_Direct',
    },
    {
        tag: '{{ITEM_CONDITION}}',
        label: 'Item State / Grade',
        description: 'Pulls the standardized eBay condition string.',
        exampleValue: 'Brand New (Factory Sealed)',
    },
    {
        tag: '{{SHIPPING_TIME}}',
        label: 'Estimated Dispatch',
        description: 'Display handling turnaround SLA (e.g. Same Day / 24h).',
        exampleValue: 'Within 24 Hours (Tracked & Insured)',
    },
];

const FAQ_ITEMS: FaqItem[] = [
    {
        question: 'Are these templates 100% compliant with eBay VeRO and active content rules?',
        answer: 'Yes! Every template generated uses strict HTML5 and inline CSS3 without external JavaScript, Flash, form embeds, or unapproved cookies. Your listings will never trigger eBay policy flags or search suppression.',
    },
    {
        question: 'How do I insert these templates into eBay?',
        answer: 'In the eBay listing editor, toggle into the "HTML" code view tab, paste your generated template code, and switch back to Standard View. You can also import them into listing managers like InkFrog, DSM Tool, AutoDS, or File Exchange.',
    },
    {
        question: 'Will these templates look good on the eBay mobile app?',
        answer: 'Absolutely. Over 70% of eBay shoppers browse on smartphones. All our layouts use mobile-first responsive grids, legible font sizes, and fluid tables to guarantee high conversion across iOS and Android.',
    },
    {
        question: 'Can I host my product photos on any server?',
        answer: 'eBay requires all external image links to use secure HTTPS SSL URLs. Our templates include ready-to-use SSL image container tags compatible with Imgur, Cloudinary, AWS S3, or your own CDN.',
    },
];

// ==========================================
// 2. MAIN PAGE COMPONENT
// ==========================================

export default function TemplatesStudioPage() {
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem | null>(null);
    const [modalCopied, setModalCopied] = useState(false);
    const [modalExported, setModalExported] = useState(false);

    const handleModalCopy = () => {
        if (selectedTemplate) {
            navigator.clipboard.writeText(selectedTemplate.title);
            setModalCopied(true);
            setTimeout(() => setModalCopied(false), 2000);
        }
    };

    const handleModalExport = () => {
        if (selectedTemplate) {
            navigator.clipboard.writeText(selectedTemplate.sampleHtml);
            setModalExported(true);
            setTimeout(() => setModalExported(false), 2000);
        }
    };

    return (
        <div className="min-h-screen bg-[#ffffff] text-[#1e1535] font-sans antialiased selection:bg-[#b8fa33] selection:text-[#1e1535]">
            {/* 1. Global Navigation Bar */}
            <Navbar />

            {/* 2. Hero Section */}
            <HeroSection />

            {/* 3. Interactive Split-Editor Workbench */}
            <div id="interactive-editor" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
                <InteractiveSplitEditor />
            </div>

            {/* 4. Three Creation Engines */}
            <CreationEnginesSection />

            {/* 5. Modular Block Library & Dynamic Tag Engine */}
            <ModularBlocksSection />

            {/* 6. Pre-Made Niche Templates (8-Card Grid) */}
            <div id="templates-gallery">
                <TemplateGallerySection onSelectTemplate={(t) => setSelectedTemplate(t)} />
            </div>

            {/* 7. Optimization & VeRO Compliance Matrix */}
            <div id="vero-guarantee">
                <VeroTechGridSection />
            </div>

            {/* 8. Mobile vs Desktop Simulation & FAQ Accordion */}
            <div id="faq-section">
                <DevicePreviewAndFaqSection />
            </div>

            {/* 9. High-Converting CTA Card */}
            <CtaSection />

            {/* 10. Template Preview & Export Dialog Modal */}
            {selectedTemplate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1e1535]/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl border border-[#ede9fe] flex flex-col overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-[#1e1535] px-6 py-4 flex items-center justify-between border-b border-[#2d1f4e] text-white">
                            <div className="flex items-center gap-3">
                                <span className="px-2.5 py-0.5 rounded-full bg-[#7530fb] text-white text-xs font-bold uppercase">
                                    {selectedTemplate.category}
                                </span>
                                <h3 className="font-syne font-bold text-base sm:text-lg text-white truncate max-w-md">
                                    {selectedTemplate.title}
                                </h3>
                            </div>
                            <button
                                onClick={() => setSelectedTemplate(null)}
                                className="w-8 h-8 rounded-full bg-[#271c42] hover:bg-[#322355] text-white flex items-center justify-center transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Preview Body */}
                        <div className="flex-1 p-6 overflow-y-auto bg-[#f8f7ff]">
                            <div
                                className="bg-white p-6 rounded-2xl border border-[#ede9fe] shadow-sm max-w-3xl mx-auto"
                                dangerouslySetInnerHTML={{ __html: selectedTemplate.sampleHtml }}
                            />
                        </div>

                        {/* Modal Bottom Footer Actions */}
                        <div className="bg-[#f8fafc] px-6 py-4 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
                            <button
                                onClick={handleModalCopy}
                                className="px-4 py-2.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                            >
                                {modalCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                                <span>{modalCopied ? 'Copied to Clipboard!' : 'Copy Title'}</span>
                            </button>

                            <button
                                onClick={handleModalExport}
                                className="px-5 py-2.5 bg-[#b8fa33] hover:bg-[#7530fb] hover:text-white text-[#0f172a] text-xs font-black uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer"
                            >
                                <Layers className="w-4 h-4" />
                                <span>{modalExported ? 'Exported to Studio!' : 'Export to Listing Studio'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 11. Global Custom Footer Component */}
            <Footer />
        </div>
    );
}

// ==========================================
// 3. SUB-COMPONENTS
// ==========================================

function HeroSection() {
    const scrollToWorkbench = (e: React.MouseEvent) => {
        e.preventDefault();
        document.getElementById('interactive-editor')?.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToGallery = (e: React.MouseEvent) => {
        e.preventDefault();
        document.getElementById('templates-gallery')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section className="relative pt-16 pb-12 sm:pt-24 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f3eeff] border border-[#ede9fe] text-[#7530fb] text-xs font-bold tracking-wider uppercase mb-8 shadow-sm hover:border-[#7530fb]/40 transition-colors">
                <Zap className="w-3.5 h-3.5 text-[#7530fb]" />
                <span>ALL-IN-ONE EBAY TEMPLATE SUITE</span>
            </div>

            {/* Main H1 Headline */}
            <h1 className="font-syne font-extrabold text-4xl sm:text-5xl lg:text-6xl text-[#1e1535] max-w-4xl mx-auto leading-[1.15] tracking-tight mb-6">
                Create{' '}
                <span className="inline-block bg-[#b8fa33] text-[#1e1535] px-3.5 py-1 rounded-xl shadow-sm -rotate-1">
                    High-Converting
                </span>{' '}
                eBay Listings in Seconds
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg lg:text-xl text-[#6b7280] max-w-3xl mx-auto leading-relaxed mb-10 font-normal">
                Build mobile-responsive, 100% VeRO-compliant templates with custom HTML, AI generation, or drag-and-drop visual blocks.
            </p>

            {/* Dual CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <a
                    href="#interactive-editor"
                    onClick={scrollToWorkbench}
                    className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#b8fa33] text-[#1e1535] font-syne font-extrabold text-base hover:bg-[#a6e625] transition-all shadow-[0_4px_20px_rgba(184,250,51,0.35)] transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
                >
                    <Zap className="w-5 h-5 text-[#1e1535]" />
                    <span>Start Building Free</span>
                </a>

                <a
                    href="#templates-gallery"
                    onClick={scrollToGallery}
                    className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#1e1535] text-white font-syne font-bold text-base hover:bg-[#2d1f4e] transition-all shadow-md transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
                >
                    <Eye className="w-5 h-5 text-[#b8fa33]" />
                    <span>Explore 50+ Templates</span>
                </a>
            </div>

            {/* Trust Badges Row */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs sm:text-sm font-semibold text-[#1e1535]/80 pt-2">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#7530fb]" />
                    <span>100% VeRO Safe Guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[#7530fb]" />
                    <span>Mobile Fluid Architecture</span>
                </div>
                <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#7530fb]" />
                    <span>Zero JavaScript Active Content</span>
                </div>
            </div>
        </section>
    );
}

function InteractiveSplitEditor() {
    const [activeTab, setActiveTab] = useState<'html' | 'ai' | 'blocks'>('html');
    const [copiedCode, setCopiedCode] = useState(false);
    const [copiedTag, setCopiedTag] = useState<string | null>(null);
    const [isAiGenerating, setIsAiGenerating] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('Refurbished Apple iPhone 15 Pro with Titanium build & warranty');

    const [templateValues, setTemplateValues] = useState({
        title: 'Apple iPhone 15 Pro Max 256GB Natural Titanium (Unlocked)',
        price: '$899.00 USD',
        seller: 'Titan_Electronics_Direct',
        condition: 'Refurbished - Grade A+ Pristine Condition',
        shipping: 'Free 2-Day FedEx Express Delivery',
    });

    const [activeThemeColor, setActiveThemeColor] = useState('#1e1535');
    const [activeBlocks, setActiveBlocks] = useState({
        header: true,
        specs: true,
        trustBadges: true,
        gallery: true,
        policy: true,
    });

    const [customHtml, setCustomHtml] = useState(`<div class="ebay-listing-container" style="font-family:'DM Sans',sans-serif; max-width:900px; margin:auto; background:#ffffff; border:1px solid #ede9fe; border-radius:12px; overflow:hidden;">
  <!-- Store Header -->
  <div style="background:#1e1535; color:#ffffff; padding:24px 20px; text-align:center; border-bottom:4px solid #b8fa33;">
    <span style="background:#7530fb; color:#ffffff; font-size:11px; font-weight:700; padding:4px 12px; border-radius:20px; text-transform:uppercase; letter-spacing:0.5px;">TOP RATED PLUS SELLER</span>
    <h1 style="font-family:'Syne',sans-serif; font-size:24px; font-weight:800; margin:12px 0 6px; color:#ffffff;">{{PRODUCT_TITLE}}</h1>
    <p style="color:#d4caf7; font-size:13px; margin:0;">Seller: {{SELLER_NAME}} • Condition: {{ITEM_CONDITION}}</p>
  </div>

  <!-- Key Specs Grid -->
  <div style="padding:24px; background:#f8f7ff;">
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:16px;">
      <div style="background:#ffffff; padding:16px; border-radius:8px; border:1px solid #ede9fe;">
        <div style="color:#7530fb; font-weight:700; font-size:14px; margin-bottom:4px;">Instant Buy-It-Now</div>
        <div style="font-size:20px; font-weight:800; color:#1e1535;">{{ITEM_PRICE}}</div>
      </div>
      <div style="background:#ffffff; padding:16px; border-radius:8px; border:1px solid #ede9fe;">
        <div style="color:#7530fb; font-weight:700; font-size:14px; margin-bottom:4px;">Fast Dispatch</div>
        <div style="font-size:14px; color:#1f1d2e; font-weight:600;">Same-Day Free Express Shipping</div>
      </div>
    </div>
  </div>

  <!-- Trust Bar -->
  <div style="background:#1e1535; color:#ffffff; padding:14px 20px; display:flex; justify-content:space-around; text-align:center; font-size:12px; font-weight:700;">
    <span style="color:#b8fa33;">30-Day Returns</span>
    <span>Free Express Post</span>
    <span style="color:#b8fa33;">2-Year Warranty</span>
  </div>
</div>`);

    const renderedHtml = useMemo(() => {
        let output = customHtml;
        output = output.replace(/{{PRODUCT_TITLE}}/g, templateValues.title);
        output = output.replace(/{{ITEM_PRICE}}/g, templateValues.price);
        output = output.replace(/{{SELLER_NAME}}/g, templateValues.seller);
        output = output.replace(/{{ITEM_CONDITION}}/g, templateValues.condition);
        output = output.replace(/{{SHIPPING_TIME}}/g, templateValues.shipping);
        return output;
    }, [customHtml, templateValues]);

    const handleCopyCode = () => {
        navigator.clipboard.writeText(renderedHtml);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
    };

    const handleCopyTag = (tag: string) => {
        navigator.clipboard.writeText(tag);
        setCopiedTag(tag);
        setTimeout(() => setCopiedTag(null), 1500);
    };

    const handleTriggerAiGenerate = (customQuery?: string) => {
        setIsAiGenerating(true);
        setTimeout(() => {
            const q = customQuery || aiPrompt;
            setTemplateValues({
                title: q,
                price: '$249.99 USD',
                seller: 'Certified_Outlet_Direct',
                condition: 'Brand New (Factory Sealed with Warranty)',
                shipping: '1-Day Expedited Delivery with Tracking',
            });
            setIsAiGenerating(false);
        }, 700);
    };

    return (
        <div className="bg-[#ffffff] rounded-3xl border border-[#ede9fe] shadow-2xl overflow-hidden">
            {/* Workbench Header */}
            <div className="bg-[#1e1535] px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-[#2d1f4e]">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#7530fb] flex items-center justify-center text-white shadow-md">
                        <Sliders className="w-5 h-5 text-[#b8fa33]" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-syne font-bold text-white text-base">Templates Studio Workbench</span>
                            <span className="bg-[#b8fa33] text-[#1e1535] text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                v2.0 Live Engine
                            </span>
                        </div>
                        <p className="text-xs text-[#d4caf7]">Pure HTML5 • Real-time Viewport &amp; Dynamic Tag Resolution</p>
                    </div>
                </div>

                {/* Action Controls */}
                <div className="flex items-center gap-2 sm:gap-3">
                    <button
                        onClick={handleCopyCode}
                        className="px-4 py-2 rounded-xl bg-[#b8fa33] text-[#1e1535] font-syne font-bold text-xs sm:text-sm hover:bg-[#a6e625] transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                        {copiedCode ? <Check className="w-4 h-4 text-[#1e1535]" /> : <Copy className="w-4 h-4 text-[#1e1535]" />}
                        <span>{copiedCode ? 'Copied HTML!' : 'Copy eBay Code'}</span>
                    </button>
                </div>
            </div>

            {/* Main Split Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#ede9fe] min-h-[580px]">
                {/* Left Side: Builder Controls & Code View (5 cols) */}
                <div className="lg:col-span-5 bg-[#faf9ff] p-4 sm:p-6 flex flex-col justify-between">
                    <div className="space-y-5">
                        {/* Mode Switcher Tabs */}
                        <div className="bg-[#ede9fe]/60 p-1 rounded-xl flex items-center gap-1">
                            <button
                                onClick={() => setActiveTab('html')}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'html' ? 'bg-[#7530fb] text-white shadow-sm' : 'text-[#1e1535] hover:bg-white/60'
                                    }`}
                            >
                                <Code className="w-3.5 h-3.5" />
                                <span>HTML Code</span>
                            </button>

                            <button
                                onClick={() => setActiveTab('ai')}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'ai' ? 'bg-[#7530fb] text-white shadow-sm' : 'text-[#1e1535] hover:bg-white/60'
                                    }`}
                            >
                                <Sparkles className="w-3.5 h-3.5 text-[#b8fa33]" />
                                <span>AI Generator</span>
                            </button>

                            <button
                                onClick={() => setActiveTab('blocks')}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${activeTab === 'blocks' ? 'bg-[#7530fb] text-white shadow-sm' : 'text-[#1e1535] hover:bg-white/60'
                                    }`}
                            >
                                <Layers className="w-3.5 h-3.5" />
                                <span>Visual Blocks</span>
                            </button>
                        </div>

                        {/* TAB 1: Raw HTML Mode */}
                        {activeTab === 'html' && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs text-[#6b7280]">
                                    <span className="font-semibold text-[#1e1535]">Monokai Syntax Editor</span>
                                    <span className="font-mono text-[11px] text-[#7530fb]">Auto-Validates Pure HTML</span>
                                </div>
                                <div className="relative rounded-xl overflow-hidden border border-[#2d1f4e] shadow-inner bg-[#1e1535]">
                                    <textarea
                                        value={customHtml}
                                        onChange={(e) => setCustomHtml(e.target.value)}
                                        rows={12}
                                        className="w-full bg-[#1e1535] text-[#b8fa33] font-mono text-xs p-4 focus:outline-none focus:ring-1 focus:ring-[#7530fb] resize-none leading-relaxed"
                                        spellCheck={false}
                                    />
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-[#6b7280]">Click to copy macro tag:</span>
                                    <div className="flex gap-1.5 flex-wrap">
                                        {DYNAMIC_TAGS.slice(0, 3).map((dt) => (
                                            <button
                                                key={dt.tag}
                                                onClick={() => handleCopyTag(dt.tag)}
                                                className="px-2 py-1 bg-[#ffffff] hover:bg-[#f3eeff] border border-[#ede9fe] rounded text-[11px] font-mono text-[#7530fb] font-semibold transition-colors cursor-pointer"
                                            >
                                                {copiedTag === dt.tag ? 'Copied!' : dt.tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 2: AI Listing Mode */}
                        {activeTab === 'ai' && (
                            <div className="space-y-4">
                                <div className="bg-[#f3eeff] border border-[#ede9fe] rounded-xl p-3.5">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Sparkles className="w-4 h-4 text-[#7530fb]" />
                                        <span className="font-bold text-xs text-[#7530fb]">AI Smart Copywriter</span>
                                    </div>
                                    <p className="text-xs text-[#6b7280]">
                                        Type any item name or SKU. The generator automatically builds high-converting bullet points, warranty seals, and clean structure.
                                    </p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[#1e1535]">Item Title or Search Query</label>
                                    <input
                                        type="text"
                                        value={aiPrompt}
                                        onChange={(e) => setAiPrompt(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-white border border-[#ede9fe] rounded-xl text-xs text-[#1e1535] focus:outline-none focus:border-[#7530fb]"
                                        placeholder="e.g. Vintage leather motorcycle jacket"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="text-xs text-[#6b7280] font-semibold">Quick Niche Presets:</div>
                                    <div className="flex flex-wrap gap-1.5">
                                        {[
                                            { label: 'Electronics', icon: Smartphone, query: 'Refurbished Apple iPhone 15 Pro with Titanium build & warranty' },
                                            { label: 'Fashion & Apparel', icon: Shirt, query: 'Vintage handcrafted leather motorcycle jacket with size guide' },
                                            { label: 'Auto Parts', icon: Wrench, query: 'Ceramic brake pad kit with OEM fitment compatibility table' },
                                            { label: 'Pet Supplies', icon: Heart, query: 'Orthopedic memory foam pet bed with veterinarian seal' },
                                        ].map((chip) => {
                                            const IconComp = chip.icon;
                                            return (
                                                <button
                                                    key={chip.label}
                                                    onClick={() => {
                                                        setAiPrompt(chip.query);
                                                        handleTriggerAiGenerate(chip.query);
                                                    }}
                                                    className="px-2.5 py-1.5 bg-[#ffffff] hover:bg-[#f3eeff] border border-[#ede9fe] hover:border-[#7530fb] text-[#1e1535] text-xs rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5"
                                                >
                                                    <IconComp className="w-3.5 h-3.5 text-[#7530fb]" />
                                                    <span>{chip.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleTriggerAiGenerate()}
                                    disabled={isAiGenerating}
                                    className="w-full py-3 bg-[#7530fb] hover:bg-[#6324db] text-white rounded-xl font-syne font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md"
                                >
                                    {isAiGenerating ? (
                                        <>
                                            <RotateCcw className="w-4 h-4 animate-spin text-[#b8fa33]" />
                                            <span>Generating Optimized Listing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Zap className="w-4 h-4 text-[#b8fa33]" />
                                            <span>Generate Instant Mobile Template</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}

                        {/* TAB 3: Visual Blocks Mode */}
                        {activeTab === 'blocks' && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <span className="text-xs font-bold text-[#1e1535]">Brand Theme Preset</span>
                                    <div className="flex items-center gap-3">
                                        {[
                                            { color: '#1e1535', label: 'Dark Violet' },
                                            { color: '#7530fb', label: 'Electric Purple' },
                                            { color: '#0f172a', label: 'Midnight Slate' },
                                            { color: '#14532d', label: 'Forest Green' },
                                            { color: '#991b1b', label: 'Crimson Red' },
                                        ].map((theme) => (
                                            <button
                                                key={theme.color}
                                                onClick={() => setActiveThemeColor(theme.color)}
                                                style={{ backgroundColor: theme.color }}
                                                className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${activeThemeColor === theme.color ? 'ring-4 ring-[#b8fa33] scale-110' : 'hover:scale-105'
                                                    }`}
                                                title={theme.label}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <span className="text-xs font-bold text-[#1e1535]">Modular Layout Stack</span>
                                    <div className="space-y-1.5">
                                        {[
                                            { key: 'header', name: 'Branded Hero Banner & Dynamic Title', icon: Building },
                                            { key: 'specs', name: 'Key Specifications & Technical Matrix', icon: Zap },
                                            { key: 'trustBadges', name: 'Buyer Guarantee & 30-Day Return Seals', icon: ShieldCheck },
                                            { key: 'gallery', name: 'Multi-Angle Image Showcase Grid', icon: ImageIcon },
                                            { key: 'policy', name: 'Shipping & Payment Policy Accordion', icon: Package },
                                        ].map((block) => {
                                            const isEnabled = activeBlocks[block.key as keyof typeof activeBlocks];
                                            const BlockIcon = block.icon;
                                            return (
                                                <div
                                                    key={block.key}
                                                    onClick={() =>
                                                        setActiveBlocks((prev) => ({
                                                            ...prev,
                                                            [block.key]: !prev[block.key as keyof typeof activeBlocks],
                                                        }))
                                                    }
                                                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all text-xs ${isEnabled ? 'bg-white border-[#7530fb] shadow-sm' : 'bg-[#f1f0f7] border-transparent opacity-60'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <BlockIcon className="w-3.5 h-3.5 text-[#7530fb]" />
                                                        <span className="font-semibold text-[#1e1535]">{block.name}</span>
                                                    </div>
                                                    <div className={`w-4 h-4 rounded flex items-center justify-center ${isEnabled ? 'bg-[#7530fb] text-white' : 'bg-[#e2e8f0]'}`}>
                                                        {isEnabled && <Check className="w-3 h-3" />}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="p-3 bg-[#ffffff] rounded-lg border border-[#ede9fe] text-xs text-[#6b7280] flex items-center gap-2">
                                    <Lightbulb className="w-3.5 h-3.5 text-[#7530fb] shrink-0" />
                                    <span>Tip: Click any block to toggle its inclusion in the live generated listing.</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Dynamic Values Form */}
                    <div className="pt-4 border-t border-[#ede9fe] mt-4">
                        <div className="text-[11px] font-bold uppercase tracking-wider text-[#6b7280] mb-2 flex items-center justify-between">
                            <span>Dynamic Tag Overrides</span>
                            <span className="text-[#7530fb] font-mono">Live Sync</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type="text"
                                value={templateValues.title}
                                onChange={(e) => setTemplateValues((prev) => ({ ...prev, title: e.target.value }))}
                                placeholder="Product Title"
                                className="col-span-2 px-2.5 py-1.5 bg-white border border-[#ede9fe] rounded-lg text-xs text-[#1e1535] focus:outline-none focus:border-[#7530fb]"
                            />
                            <input
                                type="text"
                                value={templateValues.price}
                                onChange={(e) => setTemplateValues((prev) => ({ ...prev, price: e.target.value }))}
                                placeholder="Item Price"
                                className="px-2.5 py-1.5 bg-white border border-[#ede9fe] rounded-lg text-xs text-[#1e1535] focus:outline-none focus:border-[#7530fb]"
                            />
                            <input
                                type="text"
                                value={templateValues.seller}
                                onChange={(e) => setTemplateValues((prev) => ({ ...prev, seller: e.target.value }))}
                                placeholder="Seller Name"
                                className="px-2.5 py-1.5 bg-white border border-[#ede9fe] rounded-lg text-xs text-[#1e1535] focus:outline-none focus:border-[#7530fb]"
                            />
                        </div>
                    </div>
                </div>

                {/* Right Side: Live Interactive Visual Preview (7 cols) */}
                <div className="lg:col-span-7 bg-[#f8f7ff] p-4 sm:p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                            <span className="text-xs font-bold text-[#1e1535]">Live eBay Simulation Canvas</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#6b7280]">
                            <span>Resolution: <strong>Fluid Mobile &amp; Desktop</strong></span>
                        </div>
                    </div>

                    {/* Render Preview Shell */}
                    <div className="flex-1 bg-white rounded-2xl border border-[#ede9fe] shadow-sm p-4 sm:p-6 overflow-y-auto max-h-[580px]">
                        {activeTab === 'html' ? (
                            <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />
                        ) : (
                            <div className="space-y-4 font-sans text-[#1e1535]">
                                {/* 1. Header Block */}
                                {activeBlocks.header && (
                                    <div className="p-6 rounded-xl text-center text-white relative overflow-hidden" style={{ backgroundColor: activeThemeColor }}>
                                        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#b8fa33] text-[#1e1535] text-[10px] font-extrabold uppercase tracking-wide mb-2 shadow-sm">
                                            <Zap className="w-3 h-3 text-[#1e1535]" />
                                            <span>100% Guaranteed Authentic</span>
                                        </div>
                                        <h2 className="font-syne font-bold text-base sm:text-lg leading-tight mb-1 text-white">
                                            {templateValues.title}
                                        </h2>
                                        <div className="text-xs text-[#d4caf7]">
                                            Seller: <strong>{templateValues.seller}</strong> • Condition:{' '}
                                            <span className="text-[#b8fa33] font-bold">{templateValues.condition}</span>
                                        </div>
                                    </div>
                                )}

                                {/* 2. Media Showcase Grid */}
                                {activeBlocks.gallery && (
                                    <div className="p-4 bg-[#f8f7ff] rounded-xl border border-[#ede9fe]">
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="col-span-2 h-28 bg-[#f8f7ff] rounded-lg border border-[#ede9fe] flex flex-col items-center justify-center p-2 text-center">
                                                <div className="w-8 h-8 rounded-full bg-[#f3eeff] flex items-center justify-center text-[#7530fb] font-bold text-xs mb-1">
                                                    <Camera className="w-4 h-4 text-[#7530fb]" />
                                                </div>
                                                <span className="text-[11px] font-semibold text-[#1e1535]">High-Res CDN Image</span>
                                                <span className="text-[10px] text-[#6b7280]">HTTPS SSL Hosted</span>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <div className="h-13 bg-white rounded border border-[#ede9fe] flex items-center justify-center text-[10px] text-[#7530fb] font-bold">
                                                    Angle 2
                                                </div>
                                                <div className="h-13 bg-white rounded border border-[#ede9fe] flex items-center justify-center text-[10px] text-[#7530fb] font-bold">
                                                    Seal
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 3. Specs Table Block */}
                                {activeBlocks.specs && (
                                    <div className="p-4 bg-white rounded-xl border border-[#ede9fe] space-y-2">
                                        <div className="flex items-center justify-between border-b border-[#ede9fe] pb-2">
                                            <span className="font-bold text-xs text-[#1e1535]">Technical Specifications</span>
                                            <span className="text-xs font-bold text-[#7530fb]">{templateValues.price}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div className="bg-[#f8f7ff] p-2 rounded">
                                                <span className="text-[#6b7280] block text-[10px]">Brand SKU</span>
                                                <span className="font-bold text-[#1e1535]">OEM Genuine</span>
                                            </div>
                                            <div className="bg-[#f8f7ff] p-2 rounded">
                                                <span className="text-[#6b7280] block text-[10px]">Shipping SLA</span>
                                                <span className="font-bold text-[#1e1535]">{templateValues.shipping}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 4. Trust Ribbon */}
                                {activeBlocks.trustBadges && (
                                    <div className="p-3 bg-[#1e1535] text-white flex items-center justify-around text-center text-[10px] font-bold">
                                        <div className="flex items-center gap-1 text-[#b8fa33]">
                                            <ShieldCheck className="w-3 h-3 text-[#b8fa33]" />
                                            <span>30-Day Returns</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-white">
                                            <Zap className="w-3 h-3 text-[#b8fa33]" />
                                            <span>Fast Shipping</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-[#b8fa33]">
                                            <Lock className="w-3 h-3 text-[#b8fa33]" />
                                            <span>Buyer Safe</span>
                                        </div>
                                    </div>
                                )}

                                {/* 5. Policy Block */}
                                {activeBlocks.policy && (
                                    <div className="p-4 bg-white text-[11px] text-[#6b7280] space-y-1.5">
                                        <div className="font-bold text-[#1e1535] text-xs flex items-center gap-1.5">
                                            <Package className="w-3.5 h-3.5 text-[#7530fb]" />
                                            <span>Shipping &amp; Warranty Policy</span>
                                        </div>
                                        <p className="leading-relaxed">
                                            All orders are carefully packed in protective tamper-evident parcel boxes. Shipped with full insurance and tracking number provided immediately upon carrier dispatch.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function CreationEnginesSection() {
    const [selectedBlockType, setSelectedBlockType] = useState('Key Specifications Matrix');

    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-20">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f3eeff] border border-[#ede9fe] text-[#7530fb] text-xs font-bold uppercase tracking-wider mb-4">
                    <Zap className="w-3.5 h-3.5 text-[#7530fb]" />
                    <span>THREE TAILORED WORKFLOWS</span>
                </div>
                <h2 className="font-syne font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#1e1535] leading-tight mb-4">
                    Choose How You Build Your Listings
                </h2>
                <p className="text-base sm:text-lg text-[#6b7280]">
                    Whether you want raw code control, instant AI listing generation, or modular drag-and-drop assembly, Templates Studio has the exact engine you need.
                </p>
            </div>

            {/* 3 Engines Alternating Zig-Zag Grid */}
            <div className="space-y-20">
                {/* ENGINE 1: Custom HTML Builder */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                    <div className="lg:col-span-7 bg-[#1e1535] rounded-3xl p-6 sm:p-8 border border-[#3d2f63] shadow-xl text-white">
                        <div className="flex items-center justify-between pb-4 border-b border-[#3d2f63] mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                                <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                                <span className="text-xs font-mono text-[#d4caf7] ml-2">custom-listing.html</span>
                            </div>
                            <span className="text-[11px] font-mono text-[#b8fa33] font-bold">100% Pure HTML/CSS</span>
                        </div>
                        <pre className="font-mono text-xs text-[#d4caf7] overflow-x-auto leading-relaxed bg-[#170f2b] p-4 rounded-xl border border-[#2d1f4e]">
                            <code>
                                {`<!-- eBay Optimized Container -->
<div style="font-family:'DM Sans',sans-serif; max-width:900px;">
  <div style="background:#1e1535; padding:24px; color:#fff;">
    <h1 style="color:#b8fa33;">{{PRODUCT_TITLE}}</h1>
    <p>Guaranteed Price: <strong>{{ITEM_PRICE}}</strong></p>
  </div>
  <!-- Mobile-First Fluid Specifications -->
  <table style="width:100%; border-collapse:collapse;">
    <tr>
      <td style="padding:8px; border-bottom:1px solid #eee;">Condition</td>
      <td style="padding:8px; border-bottom:1px solid #eee;">{{ITEM_CONDITION}}</td>
    </tr>
  </table>
</div>`}
                            </code>
                        </pre>
                    </div>

                    <div className="lg:col-span-5 space-y-6 text-left">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#f3eeff] text-[#7530fb] font-bold text-xs">
                            <Zap className="w-3.5 h-3.5 text-[#7530fb]" />
                            <span>FOR POWER USERS</span>
                        </div>
                        <h3 className="font-syne font-extrabold text-2xl sm:text-3xl text-[#1e1535] leading-tight">
                            Custom HTML Builder with Monokai Code Editor
                        </h3>
                        <p className="text-sm sm:text-base text-[#6b7280] leading-relaxed">
                            Total creative freedom with direct access to pure HTML5 markup and inline CSS styling. No bloated wrappers or messy output.
                        </p>
                        <ul className="space-y-3 text-sm text-[#1e1535] font-medium">
                            <li className="flex items-center gap-2.5">
                                <CheckCircle2 className="w-4 h-4 text-[#7530fb] shrink-0" />
                                <span>Real-time syntax linting and bracket matching</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <CheckCircle2 className="w-4 h-4 text-[#7530fb] shrink-0" />
                                <span>Instant dynamic tag auto-completion</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <CheckCircle2 className="w-4 h-4 text-[#7530fb] shrink-0" />
                                <span>One-click clipboard copy ready for eBay Seller Hub</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* ENGINE 2: AI Listing Generator */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                    <div className="lg:col-span-5 space-y-6 text-left order-2 lg:order-1">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#b8fa33] text-[#1e1535] font-bold text-xs">
                            <Sparkles className="w-3.5 h-3.5 text-[#1e1535]" />
                            <span>AI-POWERED ENGINE</span>
                        </div>
                        <h3 className="font-syne font-extrabold text-2xl sm:text-3xl text-[#1e1535] leading-tight">
                            AI Template Generator &amp; Niche Copywriter
                        </h3>
                        <p className="text-sm sm:text-base text-[#6b7280] leading-relaxed">
                            Enter your item title or SKU. Our smart copywriter automatically structures technical bullet points, sizing tables, and warranty assurances.
                        </p>
                        <ul className="space-y-3 text-sm text-[#1e1535] font-medium">
                            <li className="flex items-center gap-2.5">
                                <CheckCircle2 className="w-4 h-4 text-[#7530fb] shrink-0" />
                                <span>Niche-specific color palettes tailored to your product</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <CheckCircle2 className="w-4 h-4 text-[#7530fb] shrink-0" />
                                <span>High-converting trust seals generated automatically</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <CheckCircle2 className="w-4 h-4 text-[#7530fb] shrink-0" />
                                <span>Eliminates writer&apos;s block in under 5 seconds</span>
                            </li>
                        </ul>
                    </div>

                    <div className="lg:col-span-7 bg-[#1e1535] rounded-3xl p-6 sm:p-8 border border-[#3d2f63] shadow-xl text-white order-1 lg:order-2">
                        <div className="space-y-4">
                            <div className="bg-[#271c42] p-4 rounded-xl border border-[#3d2f63]">
                                <div className="text-xs text-[#b8fa33] font-bold uppercase mb-1">AI Prompt Input</div>
                                <div className="text-sm text-white font-mono">
                                    &ldquo;Refurbished Apple iPhone 15 Pro Max 256GB with 1-Year Warranty&rdquo;
                                </div>
                            </div>
                            <div className="flex items-center justify-between text-xs text-[#d4caf7] px-1">
                                <span>Output Format: <strong>Responsive eBay HTML</strong></span>
                                <span className="text-[#b8fa33] font-mono">Mobile Ready • Pure HTML</span>
                            </div>
                            <div className="bg-[#271c42] p-3 rounded-lg border border-[#3d2f63] text-xs space-y-1">
                                <div className="text-[#b8fa33] font-bold font-syne text-sm flex items-center gap-1.5">
                                    <Zap className="w-3.5 h-3.5 text-[#b8fa33]" />
                                    <span>Auto-Generated Listing Header</span>
                                </div>
                                <div className="text-[#d4caf7]">
                                    Includes dynamic tags: <span className="text-white font-mono font-bold">{"{{PRODUCT_TITLE}}"}</span>,{' '}
                                    <span className="text-white font-mono font-bold">{"{{ITEM_PRICE}}"}</span>
                                </div>
                                <div className="text-xs text-[#a89cc8] pt-1 border-t border-[#3d2f63] flex items-center gap-1.5">
                                    <Check className="w-3.5 h-3.5 text-[#b8fa33] shrink-0" />
                                    <span>Clean 2-column specifications table &amp; buyer confidence seals generated.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ENGINE 3: Visual Section Stacker */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                    <div className="lg:col-span-7 bg-[#ffffff] rounded-3xl p-6 sm:p-8 border border-[#ede9fe] shadow-xl">
                        <div className="space-y-3">
                            <div className="text-xs font-bold text-[#6b7280] uppercase tracking-wider mb-2">
                                Live Modular Stacking Canvas
                            </div>
                            <div className="p-3 bg-[#f8f7ff] border border-[#ede9fe] rounded-xl flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <Building className="w-4 h-4 text-[#7530fb]" />
                                    <span className="font-bold text-[#1e1535]">Hero Header &amp; Store Logo</span>
                                </div>
                                <span className="text-[10px] text-[#10b981] font-bold bg-[#ecfdf5] px-2 py-0.5 rounded">Active</span>
                            </div>
                            <div className="p-3 bg-[#f8f7ff] border-2 border-dashed border-[#7530fb] rounded-xl flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <Zap className="w-3.5 h-3.5 text-[#7530fb]" />
                                    <span className="font-bold text-[#7530fb]">{selectedBlockType}</span>
                                    <span className="text-[#6b7280]">• Active Selection</span>
                                </div>
                                <span className="text-[10px] text-[#7530fb] font-bold bg-[#f3eeff] px-2 py-0.5 rounded">Included</span>
                            </div>
                            <div className="p-3 bg-[#f8f7ff] border border-[#ede9fe] rounded-xl flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-[#7530fb]" />
                                    <span className="font-bold text-[#1e1535]">30-Day Money Back Trust Ribbon</span>
                                </div>
                                <span className="text-[10px] text-[#10b981] font-bold bg-[#ecfdf5] px-2 py-0.5 rounded">Active</span>
                            </div>
                            <div className="flex gap-2 pt-2">
                                {['Specifications Table', 'Image Gallery Grid', 'Shipping & Policies'].map((blockName) => (
                                    <button
                                        key={blockName}
                                        onClick={() => setSelectedBlockType(blockName)}
                                        className="px-2.5 py-1.5 bg-[#f3eeff] hover:bg-[#ede9fe] text-[#7530fb] text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                                    >
                                        + {blockName}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5 space-y-6 text-left">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#f3eeff] text-[#7530fb] font-bold text-xs">
                            <Layers className="w-3.5 h-3.5 text-[#7530fb]" />
                            <span>DRAG &amp; DROP ASSEMBLE</span>
                        </div>
                        <h3 className="font-syne font-extrabold text-2xl sm:text-3xl text-[#1e1535] leading-tight">
                            Visual Section Stacker &amp; Modular Blocks
                        </h3>
                        <p className="text-sm sm:text-base text-[#6b7280] leading-relaxed">
                            Mix and match modular building blocks like puzzle pieces. Reorder sections and preview layout changes instantly.
                        </p>
                        <ul className="space-y-3 text-sm text-[#1e1535] font-medium">
                            <li className="flex items-center gap-2.5">
                                <CheckCircle2 className="w-4 h-4 text-[#7530fb] shrink-0" />
                                <span>Pre-styled headers, gallery grids, and policy tabs</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <CheckCircle2 className="w-4 h-4 text-[#7530fb] shrink-0" />
                                <span>Zero design skills required</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <CheckCircle2 className="w-4 h-4 text-[#7530fb] shrink-0" />
                                <span>Automatically compiles to lightweight clean HTML</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}

function ModularBlocksSection() {
    const [copiedTag, setCopiedTag] = useState<string | null>(null);

    const handleCopy = (tag: string) => {
        navigator.clipboard.writeText(tag);
        setCopiedTag(tag);
        setTimeout(() => setCopiedTag(null), 1500);
    };

    return (
        <section className="py-20 bg-[#f8f7ff] border-y border-[#ede9fe]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f3eeff] border border-[#ede9fe] text-[#7530fb] text-xs font-bold uppercase tracking-wider mb-4">
                        <Layers className="w-3.5 h-3.5 text-[#7530fb]" />
                        <span>MODULAR ARCHITECTURE</span>
                    </div>
                    <h2 className="font-syne font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#1e1535] leading-tight mb-4">
                        Modular Blocks &amp; Dynamic Tag Engine
                    </h2>
                    <p className="text-base sm:text-lg text-[#6b7280]">
                        Assemble your listing piece-by-piece using battle-tested components, and embed dynamic macro tags that automatically pull live eBay data.
                    </p>
                </div>

                {/* 2-Column Split Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    {/* Left Column: Modular Block Library (6 cols) */}
                    <div className="lg:col-span-6 space-y-4">
                        <h3 className="font-syne font-bold text-xl text-[#1e1535] mb-2 flex items-center justify-between">
                            <span>Ready-To-Stack Block Components</span>
                            <span className="text-xs font-mono font-normal text-[#7530fb] bg-[#f3eeff] px-2.5 py-1 rounded-full">
                                5 Core Blocks
                            </span>
                        </h3>

                        <div className="space-y-3">
                            {MODULAR_BLOCKS.map((block) => (
                                <div
                                    key={block.id}
                                    className="p-4 bg-white rounded-2xl border border-[#ede9fe] hover:border-[#7530fb] hover:shadow-md transition-all space-y-2 group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-[#f3eeff] group-hover:bg-[#7530fb] group-hover:text-white text-[#7530fb] flex items-center justify-center transition-colors">
                                                <Layers className="w-4 h-4" />
                                            </div>
                                            <span className="font-syne font-bold text-sm text-[#1e1535]">{block.title}</span>
                                        </div>
                                        <span className="text-[11px] font-bold text-[#7530fb] bg-[#f3eeff] px-2.5 py-0.5 rounded-full">
                                            {block.category}
                                        </span>
                                    </div>

                                    <p className="text-xs text-[#6b7280] leading-relaxed">{block.description}</p>

                                    <div className="p-2 bg-[#f8f7ff] rounded-lg border border-[#ede9fe] text-[11px] font-mono text-[#1e1535]">
                                        {block.previewContent}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Dynamic Tag Reference (6 cols) */}
                    <div className="lg:col-span-6 bg-[#1e1535] rounded-3xl p-6 sm:p-8 text-white border border-[#3d2f63] shadow-xl space-y-6">
                        <div className="flex items-center justify-between border-b border-[#3d2f63] pb-4">
                            <div>
                                <h3 className="font-syne font-bold text-xl text-white">eBay Dynamic Tag Engine</h3>
                                <p className="text-xs text-[#d4caf7] mt-0.5">Click any macro tag below to copy it to clipboard</p>
                            </div>
                            <span className="px-2.5 py-1 rounded-full bg-[#b8fa33] text-[#1e1535] font-extrabold text-[10px] uppercase">
                                Zero Setup
                            </span>
                        </div>

                        <div className="space-y-3">
                            {DYNAMIC_TAGS.map((dt) => (
                                <div
                                    key={dt.tag}
                                    onClick={() => handleCopy(dt.tag)}
                                    className="p-3.5 bg-[#271c42] hover:bg-[#322355] border border-[#3d2f63] hover:border-[#b8fa33] rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                                >
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-xs font-bold text-[#b8fa33] bg-[#170f2b] px-2 py-0.5 rounded border border-[#3d2f63]">
                                                {dt.tag}
                                            </span>
                                            <span className="text-xs font-semibold text-white">{dt.label}</span>
                                        </div>
                                        <div className="text-[11px] text-[#d4caf7]">{dt.description}</div>
                                        <div className="text-[10px] text-[#a89cc8]">
                                            Sample: <span className="text-white italic">&ldquo;{dt.exampleValue}&rdquo;</span>
                                        </div>
                                    </div>

                                    <div className="w-7 h-7 rounded-lg bg-[#170f2b] group-hover:bg-[#b8fa33] group-hover:text-[#1e1535] text-[#d4caf7] flex items-center justify-center transition-colors shrink-0 ml-3">
                                        {copiedTag === dt.tag ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Bottom Integration Notice */}
                        <div className="pt-4 border-t border-[#3d2f63] flex items-center justify-between text-xs text-[#d4caf7]">
                            <div className="flex items-center gap-1.5">
                                <Check className="w-3.5 h-3.5 text-[#b8fa33]" />
                                <span>Works with InkFrog, DSM Tool &amp; File Exchange</span>
                            </div>
                            <span className="font-mono text-[#b8fa33] text-[11px]">100% Macro Verified</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function TemplateGallerySection({ onSelectTemplate }: { onSelectTemplate: (t: TemplateItem) => void }) {
    const [activeCategory, setActiveCategory] = useState('All');

    const categories = [
        'All',
        'Electronics',
        'Fashion',
        'Auto Parts',
        'Pet Supplies',
        'Home & Garden',
        'Sports & Outdoors',
        'Fine Jewelry',
        'Collectibles',
    ];

    const filteredTemplates = useMemo(() => {
        if (activeCategory === 'All') return TEMPLATES;
        return TEMPLATES.filter((t) => t.category.toLowerCase().includes(activeCategory.toLowerCase()));
    }, [activeCategory]);

    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto mb-14">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f3eeff] border border-[#ede9fe] text-[#7530fb] text-xs font-bold uppercase tracking-wider mb-4">
                    <Sparkles className="w-3.5 h-3.5 text-[#7530fb]" />
                    <span>READY-TO-USE DESIGNS</span>
                </div>
                <h2 className="font-syne font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#1e1535] leading-tight mb-4">
                    Pre-Made Niche Templates
                </h2>
                <p className="text-base sm:text-lg text-[#6b7280]">
                    Pick any high-converting niche layout below. Preview live responsiveness and export pure eBay-ready HTML with a single click.
                </p>

                {/* Filter Pills */}
                <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${activeCategory === cat
                                    ? 'bg-[#7530fb] text-white shadow-md'
                                    : 'bg-[#f8f7ff] text-[#6b7280] hover:text-[#1e1535] hover:bg-[#ede9fe]'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* 8 Niche Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredTemplates.map((tmpl) => (
                    <div
                        key={tmpl.id}
                        className="bg-white rounded-2xl border border-[#ede9fe] hover:border-[#7530fb] shadow-sm hover:shadow-xl transition-all flex flex-col justify-between overflow-hidden group"
                    >
                        {/* Visual Thumbnail Top */}
                        <div className="h-44 bg-[#1e1535] p-5 flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#b8fa33_1px,transparent_1px)] [background-size:12px_12px]" />
                            <div className="relative z-10 flex items-center justify-between">
                                <span className="px-2.5 py-0.5 rounded-full bg-[#7530fb] text-white text-[10px] font-bold uppercase tracking-wider">
                                    {tmpl.category}
                                </span>
                                <span className="text-[10px] font-mono text-[#b8fa33] font-bold">VeRO 100%</span>
                            </div>

                            <div className="relative z-10 space-y-1">
                                <div className="h-1.5 w-12 bg-[#b8fa33] rounded-full" />
                                <h4 className="font-syne font-bold text-white text-base leading-snug line-clamp-2">
                                    {tmpl.title}
                                </h4>
                            </div>
                        </div>

                        {/* Content & Specs */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                            <p className="text-xs text-[#6b7280] line-clamp-3 leading-relaxed">
                                {tmpl.description}
                            </p>

                            <div className="space-y-3 pt-2 border-t border-[#f1f0f7]">
                                <div className="flex flex-wrap gap-1.5">
                                    {tmpl.tags.map((tag) => (
                                        <span key={tag} className="text-[10px] font-semibold text-[#7530fb] bg-[#f3eeff] px-2 py-0.5 rounded-md">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>

                                {/* Features Check */}
                                <div className="grid grid-cols-2 gap-1 text-[11px] text-[#1e1535] font-medium pt-1">
                                    <div className="flex items-center gap-1.5">
                                        <Check className="w-3 h-3 text-[#10b981]" />
                                        <span>Mobile Fluid</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Check className="w-3 h-3 text-[#10b981]" />
                                        <span>Specs Matrix</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Check className="w-3 h-3 text-[#10b981]" />
                                        <span>Trust Badges</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Check className="w-3 h-3 text-[#10b981]" />
                                        <span>Active Tags</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-2 flex gap-2">
                                <button
                                    onClick={() => onSelectTemplate(tmpl)}
                                    className="flex-1 py-2.5 bg-[#7530fb] hover:bg-[#6324db] text-white rounded-xl font-syne font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                                >
                                    <Eye className="w-3.5 h-3.5 text-[#b8fa33]" />
                                    <span>Preview &amp; HTML</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

function VeroTechGridSection() {
    const highlights = [
        {
            icon: ShieldCheck,
            title: 'Zero Active Content (100% VeRO Compliant)',
            desc: 'No banned JavaScript, no iframe wrappers, no external form redirects. Your listing stays 100% compliant with eBay core policies.',
        },
        {
            icon: Smartphone,
            title: 'Adaptive Mobile-First Geometry',
            desc: 'Smart media queries and fluid flexbox grids automatically compress and wrap seamlessly across iPhone, Android, and tablets.',
        },
        {
            icon: Zap,
            title: 'High-Speed HTTPS SSL Image Delivery',
            desc: 'Clean container tags designed for HTTPS SSL asset servers to prevent eBay insecure content warnings and mixed content blocks.',
        },
        {
            icon: Sparkles,
            title: 'Pure Inline CSS Styling (No CSS Conflicts)',
            desc: 'Scoped inline styling guarantees your listing template looks identical whether viewed on eBay.com, eBay UK, or eBay Australia.',
        },
    ];

    return (
        <section className="py-20 bg-[#1e1535] text-white border-y border-[#3d2f63]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f3eeff] border border-[#ede9fe] text-[#7530fb] text-xs font-bold uppercase tracking-wider mb-4">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#7530fb]" />
                        <span>PROTECTION &amp; PERFORMANCE</span>
                    </div>
                    <h2 className="font-syne font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white leading-tight mb-4">
                        Built for eBay VeRO Safety &amp; High Conversions
                    </h2>
                    <p className="text-base sm:text-lg text-[#d4caf7]">
                        Every single line of code generated by Templates Studio adheres to strict eBay Seller Guidelines. Avoid search suppression and listing takedowns forever.
                    </p>
                </div>

                {/* 2x2 Feature Matrix Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {highlights.map((item, idx) => {
                        const IconComponent = item.icon;
                        return (
                            <div
                                key={idx}
                                className="p-6 sm:p-8 bg-[#271c42] rounded-3xl border border-[#3d2f63] hover:border-[#b8fa33] transition-all space-y-4 group"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-[#170f2b] group-hover:bg-[#b8fa33] group-hover:text-[#1e1535] text-[#b8fa33] flex items-center justify-center transition-colors">
                                    <IconComponent className="w-6 h-6" />
                                </div>
                                <h3 className="font-syne font-bold text-xl text-white">{item.title}</h3>
                                <p className="text-sm text-[#d4caf7] leading-relaxed">{item.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

function DevicePreviewAndFaqSection() {
    const [deviceMode, setDeviceMode] = useState<'mobile' | 'desktop'>('mobile');
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

    const toggleFaq = (index: number) => {
        setOpenFaqIndex(openFaqIndex === index ? null : index);
    };

    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-24">
            {/* 1. Mobile vs Desktop Simulation Canvas */}
            <div>
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f3eeff] border border-[#ede9fe] text-[#7530fb] text-xs font-bold uppercase tracking-wider mb-4">
                        <Smartphone className="w-3.5 h-3.5 text-[#7530fb]" />
                        <span>FLUID ADAPTIVE LAYOUTS</span>
                    </div>
                    <h2 className="font-syne font-extrabold text-3xl sm:text-4xl lg:text-5xl text-[#1e1535] leading-tight mb-4">
                        Test Mobile (375px) vs. Desktop (1200px)
                    </h2>
                    <p className="text-base sm:text-lg text-[#6b7280]">
                        Over 70% of eBay transactions take place on smartphones. Toggle between viewports to see how Templates Studio automatically reorganizes layout blocks.
                    </p>

                    {/* Viewport Switcher Buttons */}
                    <div className="flex items-center justify-center gap-3 mt-8">
                        <button
                            onClick={() => setDeviceMode('mobile')}
                            className={`px-6 py-3 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${deviceMode === 'mobile'
                                    ? 'bg-[#7530fb] text-white shadow-md scale-105'
                                    : 'bg-[#f8f7ff] text-[#6b7280] hover:text-[#1e1535] border border-[#ede9fe]'
                                }`}
                        >
                            <Smartphone className={`w-4 h-4 ${deviceMode === 'mobile' ? 'text-[#b8fa33]' : 'text-[#7530fb]'}`} />
                            <span>Mobile View (375px)</span>
                        </button>
                        <button
                            onClick={() => setDeviceMode('desktop')}
                            className={`px-6 py-3 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${deviceMode === 'desktop'
                                    ? 'bg-[#7530fb] text-white shadow-md scale-105'
                                    : 'bg-[#f8f7ff] text-[#6b7280] hover:text-[#1e1535] border border-[#ede9fe]'
                                }`}
                        >
                            <Monitor className={`w-4 h-4 ${deviceMode === 'desktop' ? 'text-[#b8fa33]' : 'text-[#7530fb]'}`} />
                            <span>Desktop View (1200px)</span>
                        </button>
                    </div>
                </div>

                {/* Interactive Responsive Shell Frame */}
                <div className="bg-[#f8f7ff] p-6 sm:p-10 rounded-3xl border border-[#ede9fe] flex justify-center items-center overflow-hidden">
                    <div
                        className={`transition-all duration-500 bg-[#ffffff] border-[6px] border-[#1e1535] rounded-3xl shadow-2xl overflow-hidden flex flex-col ${deviceMode === 'mobile' ? 'w-[375px] h-[640px]' : 'w-full max-w-5xl min-h-[500px]'
                            }`}
                    >
                        {/* Fake Device Bezel Bar */}
                        <div className="bg-[#1e1535] px-4 py-2.5 flex items-center justify-between text-white text-[11px] font-mono border-b border-[#2d1f4e]">
                            <div className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                                <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                                <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                                <span className="text-[#d4caf7] text-[10px] ml-2">
                                    {deviceMode === 'mobile' ? 'eBay Mobile App (iOS / Android)' : 'eBay Desktop Listing Portal'}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 text-[#b8fa33]">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>VeRO 100% Safe</span>
                            </div>
                        </div>

                        {/* Listing Content inside Device Shell */}
                        <div className="p-4 sm:p-6 overflow-y-auto flex-1 font-sans space-y-4">
                            {/* Store Header */}
                            <div className="bg-[#1e1535] text-white p-4 sm:p-5 rounded-2xl text-center relative overflow-hidden">
                                <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#b8fa33] text-[#1e1535] text-[10px] font-extrabold uppercase mb-2">
                                    Official Factory Outlet Store
                                </div>
                                <h3 className="font-syne font-extrabold text-base sm:text-xl text-white mb-1">
                                    Sony WH-1000XM5 Wireless Noise-Canceling Headphones
                                </h3>
                                <div className="text-xs text-[#d4caf7] flex items-center justify-center gap-2 flex-wrap">
                                    <span>Seller: <strong>SoundWave_Direct</strong></span>
                                    <span>•</span>
                                    <span className="text-[#b8fa33] font-bold">Price: $348.00 USD</span>
                                </div>
                            </div>

                            {/* Listing Sub-grid */}
                            <div className={`grid gap-4 ${deviceMode === 'mobile' ? 'grid-cols-1' : 'grid-cols-12'}`}>
                                {/* Left Column: Photo & Trust Seals */}
                                <div className={`${deviceMode === 'mobile' ? 'col-span-1' : 'col-span-5'} space-y-3`}>
                                    <div className="h-44 bg-[#f8f7ff] rounded-xl border border-[#ede9fe] flex flex-col items-center justify-center p-3 text-center">
                                        <div className="w-12 h-12 rounded-full bg-[#f3eeff] text-[#7530fb] flex items-center justify-center text-xl mb-2 font-bold">
                                            <Headphones className="w-6 h-6 text-[#7530fb]" />
                                        </div>
                                        <span className="text-xs font-bold text-[#1e1535]">Certified Refurbished (Grade A+)</span>
                                        <span className="text-[11px] text-[#6b7280]">Original Box &amp; Cables Included</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-[11px] text-center">
                                        <div className="bg-[#f3eeff] p-2 rounded-lg text-[#7530fb] font-bold border border-[#ede9fe] flex items-center justify-center gap-1.5">
                                            <Truck className="w-3.5 h-3.5 text-[#7530fb]" />
                                            <span>Free Express Post</span>
                                        </div>
                                        <div className="bg-[#f3eeff] p-2 rounded-lg text-[#7530fb] font-bold border border-[#ede9fe] flex items-center justify-center gap-1.5">
                                            <ShieldCheck className="w-3.5 h-3.5 text-[#7530fb]" />
                                            <span>2-Year Warranty</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Interactive Specs & Policy Tabs */}
                                <div className={`${deviceMode === 'mobile' ? 'col-span-1' : 'col-span-7'} space-y-3`}>
                                    <div className="bg-[#f8f7ff] p-3.5 rounded-xl border border-[#ede9fe] space-y-2">
                                        <div className="font-bold text-xs text-[#1e1535] border-b border-[#ede9fe] pb-1.5">
                                            Technical Specifications
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 text-xs">
                                            <div>
                                                <span className="text-[10px] text-[#6b7280] block">Battery Life</span>
                                                <span className="font-bold text-[#1e1535]">30 Hours Continuous</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-[#6b7280] block">Noise Canceling</span>
                                                <span className="font-bold text-[#1e1535]">Dual Auto NC Optimizer</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-[#6b7280] block">Connection</span>
                                                <span className="font-bold text-[#1e1535]">Bluetooth 5.2 / 3.5mm</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-[#6b7280] block">Condition</span>
                                                <span className="font-bold text-[#7530fb]">Grade A+ Factory</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white p-3.5 rounded-xl border border-[#ede9fe] text-xs text-[#6b7280] space-y-1.5">
                                        <div className="font-bold text-xs text-[#1e1535]">Shipping &amp; Return Policies</div>
                                        <p className="text-[11px] leading-relaxed">
                                            Ships within 24 hours of cleared payment with signature tracking. 30-day money-back return policy guaranteed.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. FAQ Accordion */}
            <div className="max-w-4xl mx-auto pt-8">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f3eeff] border border-[#ede9fe] text-[#7530fb] text-xs font-bold uppercase tracking-wider mb-4">
                        <HelpCircle className="w-3.5 h-3.5 text-[#7530fb]" />
                        <span>GOT QUESTIONS? WE&apos;VE GOT ANSWERS</span>
                    </div>
                    <h2 className="font-syne font-extrabold text-3xl sm:text-4xl text-[#1e1535] leading-tight mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-sm sm:text-base text-[#6b7280]">
                        Everything you need to know about using Templates Studio with eBay Seller Hub and third-party tools.
                    </p>
                </div>

                <div className="space-y-4">
                    {FAQ_ITEMS.map((faq, index) => {
                        const isOpen = openFaqIndex === index;
                        return (
                            <div
                                key={index}
                                className="rounded-2xl border border-[#ede9fe] bg-[#ffffff] overflow-hidden transition-all shadow-sm"
                            >
                                <button
                                    onClick={() => toggleFaq(index)}
                                    className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#faf9ff] transition-colors"
                                >
                                    <span className="font-syne font-bold text-base sm:text-lg text-[#1e1535]">
                                        {faq.question}
                                    </span>
                                    <div
                                        className={`w-8 h-8 rounded-full bg-[#f3eeff] text-[#7530fb] flex items-center justify-center shrink-0 transition-transform ${isOpen ? 'rotate-180 bg-[#7530fb] text-white' : ''
                                            }`}
                                    >
                                        <ChevronDown className="w-4 h-4" />
                                    </div>
                                </button>

                                {isOpen && (
                                    <div className="px-6 pb-6 pt-1 text-sm sm:text-base text-[#6b7280] leading-relaxed border-t border-[#f1f0f7]">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

function CtaSection() {
    const scrollToWorkbench = (e: React.MouseEvent) => {
        e.preventDefault();
        document.getElementById('interactive-editor')?.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToGallery = (e: React.MouseEvent) => {
        e.preventDefault();
        document.getElementById('templates-gallery')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="bg-gradient-to-br from-[#1e1535] via-[#271c42] to-[#36245c] rounded-3xl p-8 sm:p-14 border border-[#4a3a75] shadow-2xl relative overflow-hidden text-center max-w-5xl mx-auto">
                {/* Background Glow Accents */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#7530fb]/20 rounded-full blur-3xl pointer-events-none -z-0" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#b8fa33]/10 rounded-full blur-3xl pointer-events-none -z-0" />

                <div className="relative z-10 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#b8fa33] text-[#1e1535] text-xs font-extrabold uppercase tracking-wider shadow-sm">
                        <Zap className="w-3.5 h-3.5 text-[#1e1535]" />
                        <span>START SCALING YOUR EBAY STORE</span>
                    </div>

                    <h2 className="font-syne font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white leading-tight max-w-3xl mx-auto">
                        Ready to Boost Your eBay Sales &amp; Conversions?
                    </h2>

                    <p className="text-sm sm:text-lg text-[#d4caf7] max-w-2xl mx-auto leading-relaxed">
                        Join thousands of professional sellers who create VeRO-safe, mobile-first eBay listings in seconds. No coding skills required.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                        <a
                            href="#interactive-editor"
                            onClick={scrollToWorkbench}
                            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#b8fa33] text-[#1e1535] font-syne font-extrabold text-base hover:bg-[#a6e625] transition-all shadow-[0_4px_20px_rgba(184,250,51,0.35)] hover:shadow-[0_6px_25px_rgba(184,250,51,0.5)] transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
                        >
                            <Zap className="w-5 h-5 text-[#1e1535]" />
                            <span>Launch Studio Workbench</span>
                        </a>

                        <a
                            href="#templates-gallery"
                            onClick={scrollToGallery}
                            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#170f2b] border border-[#4a3a75] hover:border-[#b8fa33] text-white font-syne font-bold text-base hover:bg-[#20153b] transition-all shadow-md transform hover:-translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
                        >
                            <Eye className="w-5 h-5 text-[#b8fa33]" />
                            <span>Browse 50+ Templates</span>
                        </a>
                    </div>

                    {/* Micro Trust Proofs */}
                    <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-[#d4caf7]/80 pt-4">
                        <div className="flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#b8fa33]" />
                            <span>100% VeRO Compliant</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Smartphone className="w-3.5 h-3.5 text-[#b8fa33]" />
                            <span>Mobile-First Formats</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#b8fa33]" />
                            <span>No Active Content Restrictions</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
