"use client";
import React, { useState } from 'react';
import {
    Sparkles,
    ShieldCheck,
    ArrowRight,
    Lock,
    CheckCircle2,
    TrendingUp,
    Layers,
    Copy,
    Check,
    Plus,
    AlertTriangle,
    Search,
    RefreshCw,
    Activity,
    Zap,
    Edit3,
    PlusCircle,
    Rocket,
    Star,
    Users,
    ChevronDown,
    HelpCircle,
    X,
    Info
} from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

/* ==========================================================================
   TYPES & INTERFACES (Self-Contained)
   ========================================================================== */

export interface KeywordItem {
    id: string;
    keyword: string;
    inListingsPct: number;
    competition: number;
    avgPrice: number;
    estSearches: number;
    estSales: number;
    isVeROSafe: boolean;
    isAdded?: boolean;
}

export interface Testimonial {
    name: string;
    role: string;
    quote: string;
    stars: number;
    verifiedSales?: string;
}

export interface FAQItem {
    id: string;
    question: string;
    answer: string;
}

/* ==========================================================================
   MOCK DATA & REPOSITORIES (Self-Contained)
   ========================================================================== */

const INITIAL_KEYWORDS: KeywordItem[] = [
    {
        id: 'k1',
        keyword: 'Cat Hair Remover',
        inListingsPct: 6,
        competition: 83877,
        avgPrice: 8.23,
        estSearches: 32023,
        estSales: 528,
        isVeROSafe: true,
        isAdded: true,
    },
    {
        id: 'k2',
        keyword: 'Pet Grooming Tool',
        inListingsPct: 4,
        competition: 55785,
        avgPrice: 27.71,
        estSearches: 8747,
        estSales: 144,
        isVeROSafe: true,
        isAdded: false,
    },
    {
        id: 'k3',
        keyword: 'Furniture Carpet Fur',
        inListingsPct: 4,
        competition: 55785,
        avgPrice: 14.50,
        estSearches: 9640,
        estSales: 182,
        isVeROSafe: true,
        isAdded: false,
    },
    {
        id: 'k4',
        keyword: 'Self Cleaning Roller',
        inListingsPct: 5,
        competition: 42150,
        avgPrice: 11.99,
        estSearches: 18420,
        estSales: 310,
        isVeROSafe: true,
        isAdded: false,
    },
    {
        id: 'k5',
        keyword: 'Reusable Dog Lint Brush',
        inListingsPct: 3,
        competition: 31200,
        avgPrice: 9.45,
        estSearches: 14850,
        estSales: 245,
        isVeROSafe: true,
        isAdded: false,
    },
    {
        id: 'k6',
        keyword: 'Automatic Feeder',
        inListingsPct: 4,
        competition: 55785,
        avgPrice: 42.75,
        estSearches: 5623,
        estSales: 93,
        isVeROSafe: true,
        isAdded: false,
    },
    {
        id: 'k7',
        keyword: 'Brush Dog Cat',
        inListingsPct: 4,
        competition: 55785,
        avgPrice: 8.49,
        estSearches: 13884,
        estSales: 228,
        isVeROSafe: true,
        isAdded: false,
    },
    {
        id: 'k8',
        keyword: 'Cleaning Brush',
        inListingsPct: 4,
        competition: 55785,
        avgPrice: 5.97,
        estSearches: 12498,
        estSales: 206,
        isVeROSafe: true,
        isAdded: false,
    },
];

const LONG_TAIL_ANALYTICS_DATA = [
    {
        phrase: 'Self Cleaning Cat Brush',
        searches: '12,450',
        sales: 412,
        competitionScore: 'Low',
        growth: '+28%',
        veroStatus: '100% Safe',
    },
    {
        phrase: 'Pet Hair Remover Tool',
        searches: '8,920',
        sales: 285,
        competitionScore: 'Medium',
        growth: '+15%',
        veroStatus: '100% Safe',
    },
    {
        phrase: 'Furniture Fur Remover',
        searches: '5,600',
        sales: 198,
        competitionScore: 'Low',
        growth: '+42%',
        veroStatus: '100% Safe',
    },
    {
        phrase: 'Double-Sided Lint Scraper',
        searches: '4,890',
        sales: 167,
        competitionScore: 'Low',
        growth: '+31%',
        veroStatus: '100% Safe',
    },
];

const VERO_PROTECTED_BRANDS = [
    { brand: 'VELCRO®', risk: 'HIGH', note: 'Strictly trademarked - use "Hook & Loop"' },
    { brand: 'DYSON®', risk: 'CRITICAL', note: 'Requires authorized reseller license' },
    { brand: 'POKÉMON®', risk: 'CRITICAL', note: 'Strict IP enforcement' },
    { brand: 'GORE-TEX®', risk: 'HIGH', note: 'Use "Waterproof breathable fabric"' },
    { brand: 'BAND-AID®', risk: 'HIGH', note: 'Use "Adhesive bandage"' },
];

const TESTIMONIALS: Testimonial[] = [
    {
        name: 'Mark T.',
        role: 'Top Rated eBay PowerSeller',
        quote: 'Title Builder alone doubled our eBay listing impressions in under 14 days. The Cassini algorithm loves the keyword density.',
        stars: 5,
        verifiedSales: '$340k/yr Volume',
    },
    {
        name: 'Sarah K.',
        role: 'Top Rated Plus Electronics Merchant',
        quote: 'The VeRO risk check saved our account twice from accidental trademark strikes. It pays for itself immediately.',
        stars: 5,
        verifiedSales: '99.8% Positive Feedback',
    },
    {
        name: 'Alex R.',
        role: 'Wholesale Retailer & Consignor',
        quote: 'The 1-click +Inject keywords feature saves me 20 minutes per listing. We push 50+ optimized titles daily directly into Listing Studio.',
        stars: 5,
        verifiedSales: '12k+ Lifetime Orders',
    },
];

const FAQ_ITEMS: FAQItem[] = [
    {
        id: 'faq-1',
        question: 'How does the VeRO Risk Assessment work?',
        answer: 'Our proprietary engine scans your title and item specifics in real-time against eBay\'s official VeRO restricted brand registry, USPTO trademarks, and global IP databases. If you inadvertently type a protected brand name or restricted trademark phrase (like "Velcro" or "Post-it"), Reazify instantly highlights the risk and suggests safe generic alternatives.',
    },
    {
        id: 'faq-2',
        question: 'Does this help with eBay Cassini algorithm search rankings?',
        answer: 'Yes! eBay\'s Cassini search engine weights the first 80 characters of listing titles higher than almost any other listing field. Reazify analyzes live eBay buyer search queries, calculates exact keyword density, and ensures mandatory item specifics are indexed so your listing surfaces at the top of organic search results.',
    },
    {
        id: 'faq-3',
        question: 'Can I transfer generated titles into Reazify Listing Studio?',
        answer: 'Absolutely. With a single click, your optimized 80-character title string, detected item specifics, and high-converting keyword tags drop straight into your Reazify Listing Studio templates, ready for instant eBay publishing.',
    },
    {
        id: 'faq-4',
        question: 'Is there a free plan available?',
        answer: 'Yes! You can test and build up to 25 titles per month on our Free Forever plan with full access to the live 80-character counter, basic VeRO database checks, and real-time Cassini score meter—no credit card required.',
    },
    {
        id: 'faq-5',
        question: 'How often is the keyword search volume data updated?',
        answer: 'Our Cassini Market Intelligence feeds update in near real-time, syncing search volumes, sell-through velocity, and competitor listing counts across US, UK, CA, AU, and European eBay marketplaces multiple times daily.',
    },
    {
        id: 'faq-6',
        question: 'Can I bulk-optimize existing active eBay listings?',
        answer: 'Yes! With our Pro and Enterprise plans, you can connect your eBay store via official eBay APIs and run batch title optimizations across hundreds of active listings in just a few clicks.',
    },
];

const PRESET_PRODUCTS = [
    {
        name: 'Pet Fur Remover',
        baseTitle: 'Cat Hair Remover Pet Grooming Tool',
        keywords: ['Furniture Carpet', 'Reusable Roller', 'Self-Cleaning', 'Dog Fur Lint Brush'],
        itemSpecs: { Condition: 'Brand New', Target: 'Cat / Dog', Type: 'Roller Brush', Features: 'Reusable' },
    },
    {
        name: 'Vintage Leather Jacket',
        baseTitle: 'Vintage Leather Bomber Jacket Mens',
        keywords: ['Brown Biker Coat', 'Motorcycle Riding', 'Heavy Duty Zip', 'Distressed Cowhide'],
        itemSpecs: { Condition: 'Pre-Owned', OuterShell: 'Genuine Leather', Size: 'L / Large', Style: 'Bomber' },
    },
    {
        name: 'Wireless Earbuds',
        baseTitle: 'Wireless Earbuds Bluetooth 5.3',
        keywords: ['Noise Cancelling', 'IPX7 Waterproof', 'Charging Case Mic', 'Sport Headset'],
        itemSpecs: { Condition: 'Brand New', Connectivity: 'Bluetooth 5.3', FormFactor: 'In-Ear', Color: 'Matte Black' },
    },
    {
        name: 'Stainless Steel Watch',
        baseTitle: 'Mens Chronograph Watch Stainless Steel',
        keywords: ['Waterproof Quartz', 'Military Sport', 'Analog Wristwatch', 'Luminous Hands'],
        itemSpecs: { Condition: 'Brand New with Tags', Department: 'Men', Display: 'Analog', Movement: 'Quartz' },
    },
];

/* ==========================================================================
   MAIN EXPORTED COMPONENT: TitleBuilderLandingPage
   (Self-contained interior body excluding Header & Footer)
   ========================================================================== */

export default function TitleBuilderLandingPage() {
    // Modal & Global State
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Section 1 (Hero) State
    const [heroTitle, setHeroTitle] = useState('Cat Hair Remover Pet Grooming Tool for Furniture Carpet');
    const [heroCopied, setHeroCopied] = useState(false);
    const [activeHeroMetric, setActiveHeroMetric] = useState<'impressions' | 'sales'>('impressions');

    // Section 2 (Tabbed Showcase) State
    const [activeTab, setActiveTab] = useState<'builder' | 'vero' | 'market'>('builder');
    const [showcaseTitle, setShowcaseTitle] = useState('Cat Hair Remover');
    const [keywords, setKeywords] = useState<KeywordItem[]>(INITIAL_KEYWORDS);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [veroCheckQuery, setVeroCheckQuery] = useState('Velcro Straps');
    const [veroResult, setVeroResult] = useState<{ status: 'safe' | 'warning' | 'danger'; message: string; replacement?: string } | null>({
        status: 'warning',
        message: '"Velcro" is a registered trademark of Velcro BVBA. Risk of VeRO takedown.',
        replacement: 'Hook & Loop Fasteners',
    });

    // Section 3 (Z-Pattern) State
    const [injectedRows, setInjectedRows] = useState<Record<number, boolean>>({});
    const [attributeScoreToggled, setAttributeScoreToggled] = useState(false);

    // Section 7 (FAQ) State
    const [openFaqIds, setOpenFaqIds] = useState<Record<string, boolean>>({
        'faq-1': true,
        'faq-2': true,
    });

    // Section 8 (Pre-Footer) State
    const [prefooterEmail, setPrefooterEmail] = useState('');
    const [prefooterSubmitted, setPrefooterSubmitted] = useState(false);

    // Quick Optimizer Modal State
    const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
    const [modalTitle, setModalTitle] = useState(PRESET_PRODUCTS[0].baseTitle);
    const [modalCopied, setModalCopied] = useState(false);
    const [modalExported, setModalExported] = useState(false);
    const [modalAddedKeywords, setModalAddedKeywords] = useState<Record<string, boolean>>({});

    /* Handlers */
    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const handleHeroCopy = () => {
        navigator.clipboard.writeText(heroTitle);
        setHeroCopied(true);
        setTimeout(() => setHeroCopied(false), 2000);
    };

    const handleInjectShowcaseKeyword = (item: KeywordItem) => {
        if (item.isAdded) return;
        const newTitle = showcaseTitle ? `${showcaseTitle} ${item.keyword}` : item.keyword;
        setShowcaseTitle(newTitle.slice(0, 80));
        setKeywords(prev => prev.map(k => (k.id === item.id ? { ...k, isAdded: true } : k)));
    };

    const handleResetShowcaseTitle = () => {
        setShowcaseTitle('Cat Hair Remover');
        setKeywords(INITIAL_KEYWORDS);
    };

    const handleAIShowcaseOptimize = () => {
        setIsOptimizing(true);
        setTimeout(() => {
            setShowcaseTitle('Cat Hair Remover Pet Grooming Tool Furniture Carpet Fur Cleaner');
            setKeywords(prev => prev.map(k => ({ ...k, isAdded: true })));
            setIsOptimizing(false);
        }, 600);
    };

    const handleTestVeRO = (query: string) => {
        setVeroCheckQuery(query);
        const lower = query.toLowerCase();
        if (lower.includes('velcro')) {
            setVeroResult({
                status: 'warning',
                message: '"Velcro" is a registered trademark. Using it risks eBay VeRO policy strikes.',
                replacement: 'Hook and Loop Fastener Tape',
            });
        } else if (lower.includes('dyson') || lower.includes('pokemon') || lower.includes('apple') || lower.includes('nike')) {
            setVeroResult({
                status: 'danger',
                message: 'Strict brand trademark detected! Unauthorized resale can cause account suspension.',
                replacement: 'Compatible With / Replacement For...',
            });
        } else {
            setVeroResult({
                status: 'safe',
                message: '100% VeRO Safe! No restricted trademarks detected in global registry.',
            });
        }
    };

    const toggleFaq = (id: string) => {
        setOpenFaqIds(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handlePrefooterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!prefooterEmail || !prefooterEmail.includes('@')) return;
        setPrefooterSubmitted(true);
        setTimeout(() => {
            handleOpenModal();
        }, 1000);
    };

    const handleSelectModalPreset = (index: number) => {
        setSelectedPresetIndex(index);
        setModalTitle(PRESET_PRODUCTS[index].baseTitle);
        setModalAddedKeywords({});
    };

    const handleAddModalKeyword = (kw: string) => {
        if (modalAddedKeywords[kw]) return;
        const newTitle = modalTitle ? `${modalTitle} ${kw}` : kw;
        setModalTitle(newTitle.slice(0, 80));
        setModalAddedKeywords(prev => ({ ...prev, [kw]: true }));
    };

    const handleModalCopy = () => {
        navigator.clipboard.writeText(modalTitle);
        setModalCopied(true);
        setTimeout(() => setModalCopied(false), 2000);
    };

    const handleModalExport = () => {
        setModalExported(true);
        setTimeout(() => setModalExported(false), 3000);
    };

    // Helper Calculations
    const heroCharCount = heroTitle.length;
    const showcaseCharCount = showcaseTitle.length;
    const showcaseScore = (() => {
        let score = 12;
        if (showcaseCharCount > 25) score += 20;
        if (showcaseCharCount > 45) score += 30;
        if (showcaseCharCount >= 70 && showcaseCharCount <= 80) score += 36;
        if (showcaseCharCount > 80) score = Math.max(20, score - 30);
        return Math.min(score, 98);
    })();
    const showcaseScoreLevel = showcaseScore >= 80 ? 'EXCELLENT' : showcaseScore >= 50 ? 'MODERATE' : 'WEAK';

    const modalCharCount = modalTitle.length;
    const modalScore = (() => {
        let s = 25;
        if (modalCharCount > 35) s += 25;
        if (modalCharCount > 55) s += 25;
        if (modalCharCount >= 70 && modalCharCount <= 80) s += 24;
        if (modalCharCount > 80) s = Math.max(20, s - 35);
        return Math.min(s, 99);
    })();

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-purple-500 selection:text-white overflow-x-hidden flex flex-col">
            <Navbar />

            {/* =========================================================================
          1. HERO SECTION
          ========================================================================= */}
            <section className="relative overflow-hidden pt-12 pb-16 md:pt-16 md:pb-24 px-4 sm:px-8 bg-white border-b border-[#E2E8F0]">
                <div className="absolute top-0 right-0 w-full sm:w-1/2 h-full bg-gradient-to-bl from-purple-100/60 via-indigo-50/40 to-transparent pointer-events-none -z-0 rounded-bl-[120px]" />

                <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">

                    {/* Left Column: Hero Headline & CTA */}
                    <div className="lg:col-span-6 flex flex-col gap-6">

                        {/* Eyebrow Badge */}
                        <div className="inline-flex items-center gap-2 self-start">
                            <span className="px-3.5 py-1 rounded-full bg-[#f2e8ff] border border-[#d0bcff] text-[#5c00da] text-xs font-extrabold uppercase tracking-widest flex items-center gap-1.5 shadow-xs">
                                <Sparkles className="w-3.5 h-3.5 text-[#5c00da]" />
                                REAZIFY TITLE BUILDER
                            </span>
                            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Cassini 2026 Ready
                            </span>
                        </div>

                        {/* Main Headline (H1) */}
                        <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-[#191c1e] tracking-tight leading-[1.12]">
                            Build eBay Titles That <span className="text-[#5c00da] underline decoration-[#b8fa33] decoration-4 underline-offset-8">Rank #1</span> &amp; Drive Sales
                        </h1>

                        {/* Subheadline */}
                        <p className="text-lg sm:text-xl text-slate-600 font-normal leading-relaxed max-w-xl">
                            Maximize your 80-character limit with AI keyword recommendations, real-time SEO scoring, and intelligent character counting. Built for sellers who demand precision.
                        </p>

                        {/* Primary CTA + Trust Assurances */}
                        <div className="flex flex-col sm:flex-row gap-4 sm:items-center pt-2">
                            <button
                                id="hero-primary-cta"
                                onClick={handleOpenModal}
                                className="bg-[#b8fa33] hover:bg-[#7530fb] text-[#0f172a] px-8 py-4 rounded-xl font-bold text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer active:scale-95"
                            >
                                <span>Start Building Titles Free</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-[#0f172a]" />
                            </button>

                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 px-2 py-1">
                                <Lock className="w-4 h-4 text-slate-400" />
                                <span>No credit card required</span>
                                <span className="text-slate-300">•</span>
                                <span className="text-emerald-600 font-bold">100% Free Trial</span>
                            </div>
                        </div>

                        {/* Metrics Counter Bar */}
                        <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-100 max-w-lg">
                            <div>
                                <div className="text-2xl font-black text-[#5c00da]">80/80</div>
                                <div className="text-xs font-medium text-slate-500">Character Precision</div>
                            </div>
                            <div>
                                <div className="text-2xl font-black text-[#191c1e]">100%</div>
                                <div className="text-xs font-medium text-slate-500">VeRO Policy Safe</div>
                            </div>
                            <div>
                                <div className="text-2xl font-black text-emerald-600">+2.4x</div>
                                <div className="text-xs font-medium text-slate-500">Search Impressions</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Interactive UI Preview Card */}
                    <div className="lg:col-span-6 relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#7530fb]/20 to-[#b8fa33]/20 rounded-2xl blur-xl opacity-70"></div>

                        <div className="relative bg-white rounded-2xl shadow-xl border border-[#E2E8F0] overflow-hidden">

                            {/* Window Header */}
                            <div className="bg-[#f8fafc] px-4 py-3 border-b border-[#E2E8F0] flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block"></span>
                                    <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block"></span>
                                    <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block"></span>
                                    <span className="text-xs font-bold text-slate-500 ml-2 font-mono">Live Title Workspace</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleHeroCopy}
                                        className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-[#5c00da] bg-white border border-slate-200 px-2 py-1 rounded transition-colors cursor-pointer"
                                        title="Copy Title"
                                    >
                                        {heroCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                        <span>{heroCopied ? 'Copied' : 'Copy'}</span>
                                    </button>
                                    <span className="text-[10px] font-bold text-emerald-700 bg-[#b5f72f]/30 px-2 py-0.5 rounded border border-[#b8fa33]/50 flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3 text-emerald-700" /> VeRO SECURE
                                    </span>
                                </div>
                            </div>

                            {/* Title Sandbox Input */}
                            <div className="p-4 sm:p-5 border-b border-[#E2E8F0] bg-white">
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex justify-between items-center">
                                    <span>Active eBay Title (80 Chars Max)</span>
                                    <span className={`font-mono text-xs font-bold ${heroCharCount > 80 ? 'text-red-600' : heroCharCount >= 70 ? 'text-[#5c00da]' : 'text-slate-500'}`}>
                                        {heroCharCount} / 80 Chars
                                    </span>
                                </label>

                                <div className="relative">
                                    <input
                                        id="hero-title-input"
                                        type="text"
                                        value={heroTitle}
                                        onChange={(e) => setHeroTitle(e.target.value)}
                                        className="w-full bg-[#F1F5F9] border-2 border-[#5c00da] focus:border-[#7530fb] rounded-xl px-4 py-3 font-mono text-xs sm:text-sm text-[#191c1e] font-semibold tracking-tight shadow-inner focus:outline-none transition-all"
                                        placeholder="Enter product title keywords..."
                                    />

                                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                                        <button
                                            onClick={() => setHeroTitle('Cat Hair Remover Pet Grooming Tool Furniture Carpet Cleaner')}
                                            className="text-[10px] font-extrabold uppercase tracking-wide bg-[#5c00da] text-white hover:bg-[#7530fb] px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 shadow-xs cursor-pointer"
                                        >
                                            <Sparkles className="w-3 h-3 text-[#b8fa33]" /> AI Optimize
                                        </button>
                                    </div>
                                </div>

                                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 ${heroCharCount > 80 ? 'bg-red-500' : heroCharCount >= 70 ? 'bg-[#b8fa33]' : 'bg-[#5c00da]'
                                            }`}
                                        style={{ width: `${Math.min((heroCharCount / 80) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>

                            {/* Diagnostic Split: SEO Score & Cassini Simulation */}
                            <div className="grid grid-cols-1 sm:grid-cols-12 divide-y sm:divide-y-0 sm:divide-x divide-[#E2E8F0]">

                                {/* Left: Score Gauge */}
                                <div className="sm:col-span-5 p-4 sm:p-5 flex flex-col justify-between gap-4 bg-white">
                                    <div>
                                        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                                            SEO Strength Gauge
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <div className="w-14 h-14 rounded-full border-4 border-[#b8fa33] bg-emerald-50/50 flex flex-col items-center justify-center shadow-xs">
                                                <span className="text-xl font-black text-[#191c1e] leading-none">98</span>
                                                <span className="text-[8px] font-bold text-slate-500 uppercase">/ 100</span>
                                            </div>

                                            <div>
                                                <div className="text-xs font-black text-emerald-800 tracking-wider flex items-center gap-1">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-[#b8fa33]" />
                                                    EXCELLENT
                                                </div>
                                                <p className="text-[11px] text-slate-500 leading-tight">
                                                    Optimal keyword density &amp; zero VeRO risks
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                            Detected Keywords
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            <span className="px-2 py-0.5 bg-[#7530fb] text-white rounded-full text-[11px] font-semibold">
                                                Cat Hair
                                            </span>
                                            <span className="px-2 py-0.5 bg-[#7530fb] text-white rounded-full text-[11px] font-semibold">
                                                Pet Grooming
                                            </span>
                                            <span className="px-2 py-0.5 bg-[#7530fb] text-white rounded-full text-[11px] font-semibold">
                                                Remover
                                            </span>
                                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded-full text-[11px] font-semibold">
                                                Furniture
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Cassini Simulation Chart */}
                                <div className="sm:col-span-7 p-4 sm:p-5 bg-[#F8FAFC] flex flex-col justify-between gap-3">
                                    <div className="flex items-center justify-between">
                                        <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                                            <TrendingUp className="w-3.5 h-3.5 text-[#5c00da]" />
                                            Cassini Performance Simulation
                                        </div>
                                        <div className="flex gap-1 text-[10px]">
                                            <button
                                                onClick={() => setActiveHeroMetric('impressions')}
                                                className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${activeHeroMetric === 'impressions' ? 'bg-[#5c00da] text-white' : 'bg-slate-200 text-slate-600'
                                                    }`}
                                            >
                                                Search
                                            </button>
                                            <button
                                                onClick={() => setActiveHeroMetric('sales')}
                                                className={`px-2 py-0.5 rounded font-bold transition-colors cursor-pointer ${activeHeroMetric === 'sales' ? 'bg-[#5c00da] text-white' : 'bg-slate-200 text-slate-600'
                                                    }`}
                                            >
                                                Sales
                                            </button>
                                        </div>
                                    </div>

                                    <div className="bg-white p-3 rounded-xl border border-slate-200 flex flex-col gap-2 shadow-xs">
                                        <div className="flex justify-between items-baseline text-xs">
                                            <span className="font-semibold text-slate-600">Est. 30-Day Organic Views:</span>
                                            <span className="font-mono font-bold text-[#5c00da]">
                                                {activeHeroMetric === 'impressions' ? '32,023 (+140%)' : '528 Orders ($4,345)'}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-6 gap-1.5 items-end h-16 pt-2">
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="w-full bg-slate-200 rounded-t h-4"></div>
                                                <span className="text-[9px] text-slate-400 font-mono">W1</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="w-full bg-slate-300 rounded-t h-6"></div>
                                                <span className="text-[9px] text-slate-400 font-mono">W2</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="w-full bg-indigo-200 rounded-t h-8"></div>
                                                <span className="text-[9px] text-slate-400 font-mono">W3</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="w-full bg-indigo-400 rounded-t h-11"></div>
                                                <span className="text-[9px] text-slate-400 font-mono">W4</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="w-full bg-[#7530fb] rounded-t h-14"></div>
                                                <span className="text-[9px] text-slate-500 font-mono">W5</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1">
                                                <div className="w-full bg-[#b8fa33] rounded-t h-16 shadow-xs relative">
                                                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[8px] bg-slate-900 text-white px-1 rounded font-bold font-mono">
                                                        #1
                                                    </span>
                                                </div>
                                                <span className="text-[9px] text-[#5c00da] font-mono font-bold">Now</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
                                        <span>Keyword rank projection: <strong>Top 3 Organic Spot</strong></span>
                                        <span className="text-emerald-700 font-bold">● Live Sync</span>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Footer inside Preview Card */}
                            <div className="bg-[#f1f5f9] px-4 py-2.5 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between text-[11px] text-slate-600">
                                <span className="flex items-center gap-1">
                                    <Layers className="w-3.5 h-3.5 text-[#5c00da]" />
                                    1-Click Export to <strong>Reazify Listing Studio</strong>
                                </span>
                                <button
                                    onClick={handleOpenModal}
                                    className="text-[#5c00da] hover:underline font-bold text-xs cursor-pointer"
                                >
                                    Try Interactive Demo &rarr;
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </section>


            {/* =========================================================================
          2. TABBED PRODUCT SHOWCASE & WORKSPACE
          ========================================================================= */}
            <section id="title-builder-workspace" className="py-16 md:py-24 px-4 sm:px-8 bg-[#f2f4f6] border-b border-[#E2E8F0]">
                <div className="max-w-[1280px] mx-auto">

                    {/* Section Header */}
                    <div className="text-center mb-10">
                        <span className="inline-block px-3.5 py-1 rounded-full bg-[#e9ddff] text-[#5c00da] text-xs font-extrabold uppercase tracking-widest mb-3 border border-[#d0bcff]">
                            POWERED BY LIVE MARKET DATA
                        </span>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#191c1e] tracking-tight">
                            Everything You Need to Rank #1 on eBay Search
                        </h2>
                        <p className="text-slate-600 max-w-2xl mx-auto mt-3 text-base sm:text-lg">
                            Interact with our live workspace below to see how keyword injection, VeRO risk assessment, and item specific flags transform an ordinary title into a top-ranking eBay listing.
                        </p>
                    </div>

                    {/* 3 Interactive Tab Selectors */}
                    <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3 mb-8">
                        <button
                            id="tab-btn-builder"
                            onClick={() => setActiveTab('builder')}
                            className={`px-5 sm:px-6 py-3 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'builder'
                                ? 'bg-[#6366f1] text-white shadow-md shadow-indigo-500/20 scale-[1.02]'
                                : 'bg-white text-slate-700 hover:bg-slate-100 border border-[#E2E8F0]'
                                }`}
                        >
                            <Sparkles className="w-4 h-4 text-[#b8fa33]" />
                            <span>Title Builder &amp; SEO Engine</span>
                        </button>

                        <button
                            id="tab-btn-vero"
                            onClick={() => setActiveTab('vero')}
                            className={`px-5 sm:px-6 py-3 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'vero'
                                ? 'bg-[#6366f1] text-white shadow-md shadow-indigo-500/20 scale-[1.02]'
                                : 'bg-white text-slate-700 hover:bg-slate-100 border border-[#E2E8F0]'
                                }`}
                        >
                            <ShieldCheck className="w-4 h-4 text-[#b8fa33]" />
                            <span>VeRO Risk &amp; Policy Shield</span>
                        </button>

                        <button
                            id="tab-btn-market"
                            onClick={() => setActiveTab('market')}
                            className={`px-5 sm:px-6 py-3 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'market'
                                ? 'bg-[#6366f1] text-white shadow-md shadow-indigo-500/20 scale-[1.02]'
                                : 'bg-white text-slate-700 hover:bg-slate-100 border border-[#E2E8F0]'
                                }`}
                        >
                            <TrendingUp className="w-4 h-4 text-[#b8fa33]" />
                            <span>Keyword &amp; Market Intelligence</span>
                        </button>
                    </div>

                    {/* Desktop App Container Mockup */}
                    <div className="bg-white rounded-2xl shadow-xl border border-[#E2E8F0] overflow-hidden">

                        {/* Window Chrome Header */}
                        <div className="bg-[#f8fafc] px-4 py-3 border-b border-[#E2E8F0] flex items-center gap-4">
                            <div className="flex gap-2">
                                <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block"></span>
                                <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block"></span>
                                <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block"></span>
                            </div>

                            <div className="flex-1 max-w-md mx-auto bg-white border border-[#E2E8F0] rounded-lg py-1 px-4 text-center text-xs text-slate-500 font-mono flex items-center justify-center gap-1.5 shadow-xs">
                                <span className="text-emerald-600 font-bold">https://</span>
                                <span>app.reazify.com/title-builder</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="hidden sm:inline-flex text-[10px] font-bold text-[#5c00da] bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                                    PRO ENGINE v4.8
                                </span>
                            </div>
                        </div>

                        {/* TAB 1: TITLE BUILDER & SEO ENGINE */}
                        {activeTab === 'builder' && (
                            <div className="p-0">
                                {/* Active Title Sandbox */}
                                <div className="p-4 sm:p-5 border-b border-[#E2E8F0] bg-[#fdfdfd] flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex-1 min-w-[280px]">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                                Live eBay Title Sandbox
                                            </span>
                                            <span className="text-xs font-mono font-bold text-slate-700">
                                                <span className={showcaseCharCount > 80 ? 'text-red-600' : showcaseCharCount >= 70 ? 'text-emerald-700' : 'text-[#5c00da]'}>
                                                    {showcaseCharCount}
                                                </span>
                                                /80 Chars
                                            </span>
                                        </div>

                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={showcaseTitle}
                                                onChange={(e) => setShowcaseTitle(e.target.value)}
                                                className="w-full bg-[#F1F5F9] border-2 border-[#5c00da] focus:border-[#7530fb] rounded-xl px-4 py-2.5 font-mono text-sm sm:text-base font-semibold text-[#191c1e] shadow-inner focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2">
                                        <button
                                            id="builder-ai-optimize-btn"
                                            onClick={handleAIShowcaseOptimize}
                                            disabled={isOptimizing}
                                            className="bg-[#5c00da] hover:bg-[#7530fb] text-white px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                                        >
                                            <Sparkles className={`w-3.5 h-3.5 text-[#b8fa33] ${isOptimizing ? 'animate-spin' : ''}`} />
                                            <span>{isOptimizing ? 'Optimizing...' : 'AI Optimize'}</span>
                                        </button>

                                        <span className="px-3 py-2 bg-[#b8fa33] text-[#0f172a] rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                                            <ShieldCheck className="w-4 h-4 text-[#0f172a]" /> VeRO SECURE
                                        </span>

                                        <button
                                            onClick={handleResetShowcaseTitle}
                                            className="p-2 text-slate-500 hover:text-slate-800 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
                                            title="Reset Title"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Columns: Diagnostics & Keyword Data Grid */}
                                <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#E2E8F0]">

                                    {/* Left Column: Diagnostics */}
                                    <div className="lg:col-span-4 p-5 sm:p-6 bg-[#FAFAFC] flex flex-col gap-6">
                                        {/* Cassini Score */}
                                        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                                                    SEO CASSINI SCORE
                                                </h4>
                                                <span className="text-[10px] font-bold text-slate-400 font-mono">Algorithm v2026</span>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div
                                                    className={`w-14 h-14 rounded-full border-4 flex flex-col items-center justify-center font-mono font-black ${showcaseScoreLevel === 'EXCELLENT'
                                                        ? 'border-[#b8fa33] bg-emerald-50 text-slate-900'
                                                        : showcaseScoreLevel === 'MODERATE'
                                                            ? 'border-amber-400 bg-amber-50 text-amber-900'
                                                            : 'border-red-500 bg-red-50 text-red-700'
                                                        }`}
                                                >
                                                    <span className="text-xl leading-none">{showcaseScore}</span>
                                                    <span className="text-[8px] font-semibold opacity-70">/100</span>
                                                </div>

                                                <div>
                                                    <div
                                                        className={`text-xs font-extrabold tracking-wider ${showcaseScoreLevel === 'EXCELLENT'
                                                            ? 'text-emerald-700'
                                                            : showcaseScoreLevel === 'MODERATE'
                                                                ? 'text-amber-700'
                                                                : 'text-red-600'
                                                            }`}
                                                    >
                                                        {showcaseScoreLevel}
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                        {showcaseScoreLevel === 'EXCELLENT'
                                                            ? 'Maximized organic search density!'
                                                            : 'Click "+ Inject" to boost your rank score.'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
                                                <span>Target: 75–80 Characters</span>
                                                <span className="font-bold text-slate-700">{showcaseCharCount}/80 Used</span>
                                            </div>
                                        </div>

                                        {/* Item Specifics */}
                                        <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs">
                                            <div className="flex items-center justify-between mb-3">
                                                <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                                                    ITEM SPECIFICS COVERAGE
                                                </h4>
                                                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                                                    4/5 Found
                                                </span>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-lg border border-slate-100">
                                                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                                                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Condition:
                                                    </span>
                                                    <span className="font-mono text-slate-600 font-medium">Brand New</span>
                                                </div>

                                                <div className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-lg border border-slate-100">
                                                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                                                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Type:
                                                    </span>
                                                    <span className="font-mono text-slate-600 font-medium">Hair Remover Roller</span>
                                                </div>

                                                <div className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-lg border border-slate-100">
                                                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                                                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Target Animal:
                                                    </span>
                                                    <span className="font-mono text-slate-600 font-medium">Cat / Dog</span>
                                                </div>

                                                <div className="flex items-center justify-between text-xs p-2 bg-slate-50 rounded-lg border border-slate-100">
                                                    <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                                                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Features:
                                                    </span>
                                                    <span className="font-mono text-slate-600 font-medium">Self-Cleaning, Reusable</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-indigo-50/70 p-3 rounded-xl border border-indigo-100 text-xs text-indigo-950 flex items-start gap-2">
                                            <Info className="w-4 h-4 text-[#5c00da] shrink-0 mt-0.5" />
                                            <span>
                                                <strong>Cassini Pro Tip:</strong> Put the strongest generic search keywords in the first 40 characters for highest mobile click-through rate.
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right Column: Keyword Data Grid */}
                                    <div className="lg:col-span-8 p-4 sm:p-6 overflow-x-auto">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                                                    High-Converting eBay Keywords
                                                </h3>
                                                <p className="text-xs text-slate-500">
                                                    Live search volume, competition rates, and 1-click injection.
                                                </p>
                                            </div>
                                            <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                                                Real-time Feed
                                            </span>
                                        </div>

                                        <table className="w-full text-left border-collapse text-xs">
                                            <thead>
                                                <tr className="bg-[#F1F5F9] text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-[#E2E8F0]">
                                                    <th className="p-3">Keyword</th>
                                                    <th className="p-3 text-center">In Listings %</th>
                                                    <th className="p-3 text-center">Competition</th>
                                                    <th className="p-3 text-center">Avg Price</th>
                                                    <th className="p-3 text-center">Est. Searches</th>
                                                    <th className="p-3 text-center">Est. Sales</th>
                                                    <th className="p-3 text-center">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="font-mono divide-y divide-[#E2E8F0]">
                                                {keywords.map((item) => {
                                                    const isContained = showcaseTitle.toLowerCase().includes(item.keyword.toLowerCase()) || item.isAdded;
                                                    return (
                                                        <tr
                                                            key={item.id}
                                                            className={`hover:bg-slate-50 transition-colors ${isContained ? 'bg-indigo-50/40 font-semibold' : ''
                                                                }`}
                                                        >
                                                            <td className="p-3 text-slate-900 font-sans font-medium flex items-center gap-2">
                                                                {item.keyword}
                                                                {isContained && (
                                                                    <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-sans font-bold">
                                                                        IN TITLE
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="p-3 text-center text-slate-600">{item.inListingsPct}%</td>
                                                            <td className="p-3 text-center text-slate-600">{item.competition.toLocaleString()}</td>
                                                            <td className="p-3 text-center text-slate-800 font-bold">${item.avgPrice.toFixed(2)}</td>
                                                            <td className="p-3 text-center text-[#5c00da] font-bold">{item.estSearches.toLocaleString()}</td>
                                                            <td className="p-3 text-center text-emerald-700 font-bold">{item.estSales}</td>
                                                            <td className="p-3 text-center">
                                                                {isContained ? (
                                                                    <span className="text-[11px] text-slate-400 font-sans font-semibold flex items-center justify-center gap-1">
                                                                        <Check className="w-3.5 h-3.5 text-emerald-600" /> Added
                                                                    </span>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => handleInjectShowcaseKeyword(item)}
                                                                        className="text-[#5c00da] hover:text-[#7530fb] hover:bg-indigo-50 font-bold font-sans px-2.5 py-1 rounded transition-colors inline-flex items-center gap-1 border border-indigo-200 cursor-pointer"
                                                                    >
                                                                        <Plus className="w-3.5 h-3.5" /> Inject
                                                                    </button>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>

                                        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                                            <span className="text-slate-500">
                                                Showing 8 high-velocity long tail keywords for Pet Grooming &amp; Fur Removers
                                            </span>
                                            <button
                                                onClick={handleOpenModal}
                                                className="text-[#5c00da] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                                            >
                                                Export Title to Listing Studio &rarr;
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        )}

                        {/* TAB 2: VERO RISK & POLICY SHIELD */}
                        {activeTab === 'vero' && (
                            <div className="p-6 sm:p-8 bg-white">
                                <div className="max-w-3xl mx-auto flex flex-col gap-6">

                                    <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                                        <div className="w-12 h-12 rounded-xl bg-[#b8fa33] text-[#0f172a] flex items-center justify-center shrink-0 shadow-sm">
                                            <ShieldCheck className="w-7 h-7" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-extrabold text-slate-900">
                                                Live Trademark &amp; VeRO Protection Engine
                                            </h3>
                                            <p className="text-xs text-slate-600">
                                                Scans against 45,000+ registered brands in the eBay Verified Rights Owner (VeRO) program and USPTO trademark registries.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Sandbox Tester */}
                                    <div className="bg-[#F8FAFC] p-5 rounded-2xl border border-[#E2E8F0]">
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                            Test Any Brand Name or Title Phrase For VeRO Risks:
                                        </label>

                                        <div className="flex flex-col sm:flex-row gap-2.5">
                                            <div className="relative flex-1">
                                                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                                <input
                                                    type="text"
                                                    value={veroCheckQuery}
                                                    onChange={(e) => handleTestVeRO(e.target.value)}
                                                    placeholder="Type a word like Velcro, Dyson, or Generic Pet Brush..."
                                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl font-mono text-sm focus:outline-none focus:border-[#5c00da]"
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleTestVeRO('Velcro')}
                                                    className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer"
                                                >
                                                    Try "Velcro"
                                                </button>
                                                <button
                                                    onClick={() => handleTestVeRO('Dyson Pet')}
                                                    className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer"
                                                >
                                                    Try "Dyson"
                                                </button>
                                                <button
                                                    onClick={() => handleTestVeRO('Lint Roller Reusable')}
                                                    className="px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer"
                                                >
                                                    Try "Lint Roller"
                                                </button>
                                            </div>
                                        </div>

                                        {/* Result */}
                                        {veroResult && (
                                            <div
                                                className={`mt-4 p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${veroResult.status === 'danger'
                                                    ? 'bg-red-50 border-red-200 text-red-900'
                                                    : veroResult.status === 'warning'
                                                        ? 'bg-amber-50 border-amber-200 text-amber-900'
                                                        : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-2.5">
                                                    {veroResult.status === 'safe' ? (
                                                        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                                    ) : (
                                                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                                    )}
                                                    <div>
                                                        <div className="text-xs font-bold uppercase tracking-wider">
                                                            {veroResult.status === 'safe' ? 'VERO COMPLIANT' : 'INTELLECTUAL PROPERTY RISK DETECTED'}
                                                        </div>
                                                        <p className="text-xs mt-0.5">{veroResult.message}</p>
                                                        {veroResult.replacement && (
                                                            <div className="mt-1.5 text-xs">
                                                                <strong>Recommended Safe Alternative:</strong>{' '}
                                                                <span className="font-mono bg-white px-2 py-0.5 rounded border border-amber-200 font-bold text-[#5c00da]">
                                                                    {veroResult.replacement}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {veroResult.replacement && (
                                                    <button
                                                        onClick={() => {
                                                            setShowcaseTitle(prev => prev.replace(/velcro/gi, 'Hook & Loop'));
                                                            setActiveTab('builder');
                                                        }}
                                                        className="self-start sm:self-center px-3 py-1.5 bg-[#5c00da] text-white rounded-lg text-xs font-bold whitespace-nowrap hover:bg-[#7530fb] transition-colors cursor-pointer"
                                                    >
                                                        Auto-Fix in Title
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Brand Registry List */}
                                    <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
                                        <div className="bg-[#F1F5F9] px-4 py-2.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                                            Frequently Flagged eBay VeRO Trademarks (Auto-Protected)
                                        </div>
                                        <div className="divide-y divide-slate-100">
                                            {VERO_PROTECTED_BRANDS.map((b, idx) => (
                                                <div key={idx} className="p-3 px-4 flex items-center justify-between text-xs">
                                                    <span className="font-bold text-slate-800 font-mono">{b.brand}</span>
                                                    <span className="text-slate-600">{b.note}</span>
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800">
                                                        {b.risk} RISK
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            </div>
                        )}

                        {/* TAB 3: KEYWORD & MARKET INTELLIGENCE */}
                        {activeTab === 'market' && (
                            <div className="p-6 sm:p-8 bg-white">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                    <div className="bg-[#F8FAFC] p-5 rounded-xl border border-[#E2E8F0]">
                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                            Cassini Algorithm Index
                                        </div>
                                        <div className="text-2xl font-black text-[#5c00da] mt-1">94.8%</div>
                                        <p className="text-xs text-slate-600 mt-2">
                                            Keyword correlation score with top 10 organic eBay rank holders.
                                        </p>
                                        <div className="w-full bg-slate-200 h-2 rounded-full mt-3 overflow-hidden">
                                            <div className="bg-[#5c00da] h-full w-[94.8%]"></div>
                                        </div>
                                    </div>

                                    <div className="bg-[#F8FAFC] p-5 rounded-xl border border-[#E2E8F0]">
                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                            Average Sell-Through Price
                                        </div>
                                        <div className="text-2xl font-black text-emerald-700 mt-1">$14.85</div>
                                        <p className="text-xs text-slate-600 mt-2">
                                            Optimal price sweet-spot with 420+ weekly sales velocity in category.
                                        </p>
                                        <div className="w-full bg-slate-200 h-2 rounded-full mt-3 overflow-hidden">
                                            <div className="bg-emerald-500 h-full w-[78%]"></div>
                                        </div>
                                    </div>

                                    <div className="bg-[#F8FAFC] p-5 rounded-xl border border-[#E2E8F0]">
                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                                            Market Competition Density
                                        </div>
                                        <div className="text-2xl font-black text-amber-600 mt-1">Low-Medium</div>
                                        <p className="text-xs text-slate-600 mt-2">
                                            Opportunity score: 8.9/10 for long-tail phrases with item specific flags.
                                        </p>
                                        <div className="w-full bg-slate-200 h-2 rounded-full mt-3 overflow-hidden">
                                            <div className="bg-amber-400 h-full w-[60%]"></div>
                                        </div>
                                    </div>

                                </div>

                                <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between">
                                    <span className="text-xs font-semibold text-indigo-900">
                                        Ready to unlock deep Cassini search volume across all 400+ eBay categories?
                                    </span>
                                    <button
                                        onClick={handleOpenModal}
                                        className="px-4 py-2 bg-[#5c00da] text-white rounded-lg text-xs font-bold hover:bg-[#7530fb] transition-colors cursor-pointer"
                                    >
                                        Start 14-Day Full Access Free &rarr;
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>

                </div>
            </section>


            {/* =========================================================================
          3. Z-PATTERN FEATURE BREAKDOWN
          ========================================================================= */}
            <section id="features-section" className="py-20 md:py-28 px-4 sm:px-8 bg-white border-b border-[#E2E8F0]">
                <div className="max-w-[1280px] mx-auto flex flex-col gap-24 md:gap-32">

                    {/* ROW 1: KEYWORD DENSITY & SEARCH VOLUME (Image Left / Text Right) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

                        {/* Visual Card */}
                        <div className="lg:col-span-6">
                            <div className="bg-[#F8FAFC] rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] shadow-md relative overflow-hidden">
                                <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3 mb-3">
                                    <div className="flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-[#5c00da]" />
                                        <span className="font-bold text-sm text-[#191c1e] font-sans">Keyword Analytics</span>
                                    </div>
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#5c00da] bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                        Live eBay Data
                                    </span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs">
                                        <thead className="text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                                            <tr>
                                                <th className="text-left py-2.5">Long-Tail Phrase</th>
                                                <th className="text-center py-2.5">Est. Searches</th>
                                                <th className="text-center py-2.5">Est. Sales</th>
                                                <th className="text-right py-2.5">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 font-mono">
                                            {LONG_TAIL_ANALYTICS_DATA.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-white transition-colors">
                                                    <td className="py-3 font-sans font-medium text-slate-800 flex flex-col">
                                                        <span>{item.phrase}</span>
                                                        <span className="text-[9px] text-emerald-600 font-mono font-bold">{item.growth} growth</span>
                                                    </td>
                                                    <td className="text-center py-3 font-bold text-[#5c00da]">{item.searches}</td>
                                                    <td className="text-center py-3 font-bold text-emerald-700">{item.sales}</td>
                                                    <td className="text-right py-3 font-sans">
                                                        <button
                                                            onClick={() => setInjectedRows(prev => ({ ...prev, [idx]: !prev[idx] }))}
                                                            className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${injectedRows[idx]
                                                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                                                : 'text-[#5c00da] bg-indigo-50 hover:bg-indigo-100 border border-indigo-200'
                                                                }`}
                                                        >
                                                            {injectedRows[idx] ? (
                                                                <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Added</span>
                                                            ) : (
                                                                <span className="flex items-center gap-1"><Plus className="w-3 h-3" /> Inject</span>
                                                            )}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="mt-3 pt-2 text-[11px] text-slate-400 text-right">
                                    Syncs directly with eBay Cassini search volume index
                                </div>
                            </div>
                        </div>

                        {/* Text Description */}
                        <div className="lg:col-span-6 flex flex-col gap-5">
                            <span className="text-[#6366f1] font-extrabold text-xs uppercase tracking-widest">
                                KEYWORD DENSITY &amp; INTELLIGENCE
                            </span>
                            <h3 className="text-3xl sm:text-4xl font-extrabold text-[#191c1e] tracking-tight leading-tight">
                                Live Search Volume &amp; Keyword Intelligence
                            </h3>
                            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                                Stop guessing which keywords drive traffic. Access live eBay search volume, sales data, and competition density directly in your workspace.
                            </p>

                            <ul className="flex flex-col gap-3.5 mt-2">
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-[#6366f1] shrink-0 mt-0.5" />
                                    <span className="text-slate-700 text-base font-medium">
                                        Live search volume &amp; 30-day sales conversion metrics
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-[#6366f1] shrink-0 mt-0.5" />
                                    <span className="text-slate-700 text-base font-medium">
                                        Competition scoring for fast organic Cassini ranking
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-[#6366f1] shrink-0 mt-0.5" />
                                    <span className="text-slate-700 text-base font-medium">
                                        1-click Inject into active title with automatic space balancing
                                    </span>
                                </li>
                            </ul>

                            <div className="pt-2">
                                <button
                                    onClick={handleOpenModal}
                                    className="text-[#5c00da] hover:text-[#7530fb] font-bold text-sm inline-flex items-center gap-1.5 hover:underline cursor-pointer"
                                >
                                    <span>Explore Keyword Intelligence Features</span> &rarr;
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* ROW 2: 100% VERO RISK ASSESSMENT (Text Left / Image Right) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

                        {/* Text Description */}
                        <div className="lg:col-span-6 flex flex-col gap-5 order-2 lg:order-1">
                            <span className="text-[#6366f1] font-extrabold text-xs uppercase tracking-widest">
                                POLICY PROTECTION &amp; COMPLIANCE
                            </span>
                            <h3 className="text-3xl sm:text-4xl font-extrabold text-[#191c1e] tracking-tight leading-tight">
                                100% VeRO Risk Assessment &amp; Safety Shield
                            </h3>
                            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                                Never risk an account suspension again. Our engine automatically cross-references your keywords against eBay's strict trademark database to keep your store safe.
                            </p>

                            <ul className="flex flex-col gap-3.5 mt-2">
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-[#6366f1] shrink-0 mt-0.5" />
                                    <span className="text-slate-700 text-base font-medium">
                                        Real-time trademark cross-referencing against 45,000+ brands
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-[#6366f1] shrink-0 mt-0.5" />
                                    <span className="text-slate-700 text-base font-medium">
                                        Instant high-risk keyword warnings with 1-click safe replacements
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-[#6366f1] shrink-0 mt-0.5" />
                                    <span className="text-slate-700 text-base font-medium">
                                        VeRO SECURE compliance badge for risk-free eBay listing
                                    </span>
                                </li>
                            </ul>

                            <div className="pt-2">
                                <button
                                    onClick={handleOpenModal}
                                    className="text-[#5c00da] hover:text-[#7530fb] font-bold text-sm inline-flex items-center gap-1.5 hover:underline cursor-pointer"
                                >
                                    <span>Check VeRO Brand Database</span> &rarr;
                                </button>
                            </div>
                        </div>

                        {/* Visual Card */}
                        <div className="lg:col-span-6 order-1 lg:order-2">
                            <div className="bg-[#F8FAFC] rounded-2xl p-8 border border-[#E2E8F0] shadow-md flex flex-col items-center justify-center text-center relative overflow-hidden">
                                <div className="w-24 h-24 bg-[#b8fa33]/20 border-2 border-[#b8fa33] rounded-full flex items-center justify-center mb-4 shadow-sm relative">
                                    <ShieldCheck className="w-12 h-12 text-[#354e00]" />
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></span>
                                </div>

                                <h4 className="text-2xl font-black text-[#191c1e] mb-1">VeRO SECURE</h4>
                                <p className="text-xs text-slate-500 font-mono mb-6 uppercase tracking-wider">
                                    Active Trademark Protection Active
                                </p>

                                <div className="w-full max-w-sm bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col gap-2.5 text-left">
                                    <div className="flex items-center gap-2.5 text-xs text-slate-800 font-medium">
                                        <div className="w-5 h-5 rounded-full bg-[#b8fa33] flex items-center justify-center shrink-0">
                                            <Check className="w-3.5 h-3.5 text-[#0f172a]" />
                                        </div>
                                        <span>Global Trademark Database Sync</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 text-xs text-slate-800 font-medium">
                                        <div className="w-5 h-5 rounded-full bg-[#b8fa33] flex items-center justify-center shrink-0">
                                            <Check className="w-3.5 h-3.5 text-[#0f172a]" />
                                        </div>
                                        <span>Restricted Brand &amp; Keyword Detection</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 text-xs text-slate-800 font-medium">
                                        <div className="w-5 h-5 rounded-full bg-[#b8fa33] flex items-center justify-center shrink-0">
                                            <Check className="w-3.5 h-3.5 text-[#0f172a]" />
                                        </div>
                                        <span>Real-time Policy Monitoring &amp; Zero Strikes</span>
                                    </div>
                                </div>

                                <div className="mt-4 text-[11px] text-slate-400 font-mono">
                                    Last checked: Real-time API sync with eBay VeRO Registry
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* ROW 3: ITEM SPECIFIC AUTO-DETECTION & REAL-TIME SEO SCORING (Image Left / Text Right) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

                        {/* Visual Card */}
                        <div className="lg:col-span-6">
                            <div className="bg-[#F8FAFC] rounded-2xl p-6 border border-[#E2E8F0] shadow-md">
                                <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
                                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        Attribute &amp; Algorithm Diagnostics
                                    </span>
                                    <button
                                        onClick={() => setAttributeScoreToggled(!attributeScoreToggled)}
                                        className="text-[11px] font-bold text-[#5c00da] hover:underline cursor-pointer"
                                    >
                                        {attributeScoreToggled ? 'Simulate Missing Specs' : 'Simulate Optimized Specs'}
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">

                                    <div className="sm:col-span-7 flex flex-col gap-2.5">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            Required Cassini Attributes
                                        </div>

                                        {!attributeScoreToggled ? (
                                            <>
                                                <div className="flex items-center gap-2 p-2.5 bg-red-50/80 rounded-xl border border-red-200 text-xs text-red-900 font-medium">
                                                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                                                    <span className="font-bold">Missing: Condition</span>
                                                </div>
                                                <div className="flex items-center gap-2 p-2.5 bg-red-50/80 rounded-xl border border-red-200 text-xs text-red-900 font-medium">
                                                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                                                    <span className="font-bold">Missing: Size / Dimensions</span>
                                                </div>
                                                <div className="flex items-center gap-2 p-2.5 bg-red-50/80 rounded-xl border border-red-200 text-xs text-red-900 font-medium">
                                                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                                                    <span className="font-bold">Missing: Brand Specifics</span>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-2 p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-medium">
                                                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                                    <span className="font-bold">Condition: Brand New (100%)</span>
                                                </div>
                                                <div className="flex items-center gap-2 p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-medium">
                                                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                                    <span className="font-bold">Size: Standard Handheld (100%)</span>
                                                </div>
                                                <div className="flex items-center gap-2 p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-medium">
                                                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                                    <span className="font-bold">Brand: Reusable Pet Tool (100%)</span>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="sm:col-span-5 flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-slate-200">
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                                            SEO STRENGTH
                                        </div>

                                        <div className="relative w-24 h-24 flex items-center justify-center">
                                            <svg className="w-full h-full transform -rotate-90">
                                                <circle
                                                    cx="48"
                                                    cy="48"
                                                    r="38"
                                                    fill="transparent"
                                                    stroke="#e2e8f0"
                                                    strokeWidth="8"
                                                />
                                                <circle
                                                    cx="48"
                                                    cy="48"
                                                    r="38"
                                                    fill="transparent"
                                                    stroke={attributeScoreToggled ? '#b8fa33' : '#ef4444'}
                                                    strokeWidth="8"
                                                    strokeDasharray="238.7"
                                                    strokeDashoffset={attributeScoreToggled ? '10' : '170'}
                                                    className="transition-all duration-700 ease-out"
                                                />
                                            </svg>
                                            <span className={`absolute text-2xl font-black font-mono ${attributeScoreToggled ? 'text-slate-900' : 'text-red-600'
                                                }`}>
                                                {attributeScoreToggled ? '98%' : '28%'}
                                            </span>
                                        </div>

                                        <p className={`text-[10px] font-black uppercase tracking-wider mt-2 ${attributeScoreToggled ? 'text-emerald-700' : 'text-red-600'
                                            }`}>
                                            {attributeScoreToggled ? 'OPTIMIZED' : 'NEEDS ATTENTION'}
                                        </p>
                                    </div>

                                </div>
                            </div>
                        </div>

                        {/* Text Description */}
                        <div className="lg:col-span-6 flex flex-col gap-5">
                            <span className="text-[#6366f1] font-extrabold text-xs uppercase tracking-widest">
                                ALGORITHM OPTIMIZATION
                            </span>
                            <h3 className="text-3xl sm:text-4xl font-extrabold text-[#191c1e] tracking-tight leading-tight">
                                Item Specific Auto-Detection &amp; Real-Time SEO Scoring
                            </h3>
                            <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                                Satisfy the Cassini search algorithm by identifying missing item specifics and maxing out your title character count for optimal visibility.
                            </p>

                            <ul className="flex flex-col gap-3.5 mt-2">
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-[#6366f1] shrink-0 mt-0.5" />
                                    <span className="text-slate-700 text-base font-medium">
                                        80-character limit precision optimizer prevents truncated titles
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-[#6366f1] shrink-0 mt-0.5" />
                                    <span className="text-slate-700 text-base font-medium">
                                        Missing required attribute detection to satisfy category filters
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-[#6366f1] shrink-0 mt-0.5" />
                                    <span className="text-slate-700 text-base font-medium">
                                        Live SEO score and coverage meter before you publish
                                    </span>
                                </li>
                            </ul>

                            <div className="pt-2">
                                <button
                                    onClick={handleOpenModal}
                                    className="text-[#5c00da] hover:text-[#7530fb] font-bold text-sm inline-flex items-center gap-1.5 hover:underline cursor-pointer"
                                >
                                    <span>Try SEO Score Analyzer</span> &rarr;
                                </button>
                            </div>
                        </div>

                    </div>

                </div>
            </section>


            {/* =========================================================================
          4. HOW IT WORKS (3-Step Horizontal Flow)
          ========================================================================= */}
            <section id="how-it-works" className="py-20 md:py-28 px-4 sm:px-8 bg-white border-b border-[#E2E8F0]">
                <div className="max-w-[1280px] mx-auto">

                    <div className="text-center mb-16">
                        <span className="inline-block px-3.5 py-1 rounded-full bg-[#e9ddff] text-[#5c00da] text-xs font-extrabold uppercase tracking-widest mb-3 border border-[#d0bcff]">
                            3 SIMPLE STEPS
                        </span>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#191c1e] tracking-tight">
                            From Zero Traffic to #1 Rank in Minutes
                        </h2>
                        <p className="text-slate-600 max-w-xl mx-auto mt-3 text-base sm:text-lg">
                            No complex SEO technicalities. Three intuitive steps to build eBay titles that convert browsers into buyers.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">

                        {/* Step 1 */}
                        <div className="p-8 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl relative overflow-hidden group hover:border-[#5c00da] hover:shadow-lg transition-all">
                            <div className="text-6xl font-black text-indigo-900/5 absolute -top-1 -right-1 select-none font-mono group-hover:text-[#5c00da]/10 transition-colors">
                                01
                            </div>

                            <div className="relative z-10">
                                <div className="w-13 h-13 bg-[#7530fb] text-white rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                    <Edit3 className="w-6 h-6 text-[#b8fa33]" />
                                </div>

                                <div className="text-xs font-bold text-[#5c00da] uppercase tracking-wider mb-1 font-mono">
                                    Step 01
                                </div>
                                <h3 className="text-xl font-bold text-[#191c1e] mb-3">
                                    Input Product Details
                                </h3>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    Enter your product title, category, brand, or raw item specs into the Live Title Workspace sandbox.
                                </p>
                            </div>
                        </div>

                        {/* Step 2 */}
                        <div className="p-8 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl relative overflow-hidden group hover:border-[#5c00da] hover:shadow-lg transition-all">
                            <div className="text-6xl font-black text-indigo-900/5 absolute -top-1 -right-1 select-none font-mono group-hover:text-[#5c00da]/10 transition-colors">
                                02
                            </div>

                            <div className="relative z-10">
                                <div className="w-13 h-13 bg-[#7530fb] text-white rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                    <PlusCircle className="w-6 h-6 text-[#b8fa33]" />
                                </div>

                                <div className="text-xs font-bold text-[#5c00da] uppercase tracking-wider mb-1 font-mono">
                                    Step 02
                                </div>
                                <h3 className="text-xl font-bold text-[#191c1e] mb-3">
                                    Inject High-Rank Keywords
                                </h3>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    Click '+ Inject' on high-volume, low-competition keywords with live search data and watch your SEO score climb.
                                </p>
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className="p-8 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl relative overflow-hidden group hover:border-[#5c00da] hover:shadow-lg transition-all">
                            <div className="text-6xl font-black text-indigo-900/5 absolute -top-1 -right-1 select-none font-mono group-hover:text-[#5c00da]/10 transition-colors">
                                03
                            </div>

                            <div className="relative z-10">
                                <div className="w-13 h-13 bg-[#7530fb] text-white rounded-xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                    <Rocket className="w-6 h-6 text-[#b8fa33]" />
                                </div>

                                <div className="text-xs font-bold text-[#5c00da] uppercase tracking-wider mb-1 font-mono">
                                    Step 03
                                </div>
                                <h3 className="text-xl font-bold text-[#191c1e] mb-3">
                                    Export &amp; Dominate
                                </h3>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    Achieve 100% VeRO safety, hit 80/80 character perfection, and send directly to Listing Studio or copy to eBay.
                                </p>
                            </div>
                        </div>

                    </div>

                    <div className="mt-12 text-center">
                        <button
                            onClick={handleOpenModal}
                            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-[#5c00da] text-white px-7 py-3.5 rounded-xl font-bold text-sm transition-all shadow-sm cursor-pointer"
                        >
                            <span>Try The 3-Step Optimizer Now</span>
                            <ArrowRight className="w-4 h-4 text-[#b8fa33]" />
                        </button>
                    </div>

                </div>
            </section>


            {/* =========================================================================
          5. REAZIFY ECOSYSTEM CROSS-SELL BANNER
          ========================================================================= */}
            <section className="py-16 md:py-24 px-4 sm:px-8 bg-white border-b border-[#E2E8F0]">
                <div className="max-w-[1280px] mx-auto">

                    <div className="bg-gradient-to-r from-[#4338ca] via-[#3730a3] to-[#312e81] rounded-3xl p-8 sm:p-12 md:p-14 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
                        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#b8fa33]/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

                        <div className="max-w-2xl relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wider mb-4 border border-white/20">
                                <Layers className="w-3.5 h-3.5 text-[#b8fa33]" />
                                REAZIFY ECOSYSTEM INTEGRATION
                            </div>

                            <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight leading-tight">
                                Ready to pair your title with a high-converting listing template?
                            </h3>

                            <p className="text-base sm:text-lg text-indigo-100/90 leading-relaxed">
                                Send your optimized titles straight into the Reazify Listing Studio with one click. Build compliant, mobile-responsive HTML templates that double your sales conversions.
                            </p>
                        </div>

                        <div className="relative z-10 shrink-0 w-full sm:w-auto">
                            <button
                                id="banner-explore-studio-btn"
                                onClick={handleOpenModal}
                                className="w-full sm:w-auto bg-[#b8fa33] hover:bg-[#7530fb] text-[#0f172a] px-8 py-4 rounded-xl font-extrabold text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2.5 whitespace-nowrap cursor-pointer active:scale-95"
                            >
                                <span>Explore Listing Studio</span>
                                <ArrowRight className="w-5 h-5 text-[#0f172a]" />
                            </button>
                        </div>
                    </div>

                </div>
            </section>


            {/* =========================================================================
          6. SOCIAL PROOF & METRICS
          ========================================================================= */}
            <section id="social-proof" className="py-20 md:py-28 px-4 sm:px-8 bg-[#f2f4f6] border-b border-[#E2E8F0]">
                <div className="max-w-[1280px] mx-auto">

                    {/* Top 3 Stat Counter Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">

                        <div className="p-8 bg-white border border-[#E2E8F0] rounded-2xl text-center shadow-md hover:border-[#5c00da] transition-all">
                            <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#5c00da] flex items-center justify-center mx-auto mb-3">
                                <Users className="w-6 h-6" />
                            </div>
                            <div className="text-4xl sm:text-5xl font-black text-[#5c00da] mb-2 font-mono tracking-tight">
                                12,000+
                            </div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest font-sans">
                                Active eBay Sellers
                            </div>
                            <p className="text-xs text-slate-400 mt-2">
                                Powering individual resellers to top-tier enterprise stores
                            </p>
                        </div>

                        <div className="p-8 bg-white border border-[#E2E8F0] rounded-2xl text-center shadow-md hover:border-[#5c00da] transition-all">
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div className="text-4xl sm:text-5xl font-black text-[#5c00da] mb-2 font-mono tracking-tight">
                                $2.4M+
                            </div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest font-sans">
                                Seller Sales Volume
                            </div>
                            <p className="text-xs text-slate-400 mt-2">
                                Generated across US, UK, EU, and AU marketplaces
                            </p>
                        </div>

                        <div className="p-8 bg-white border border-[#E2E8F0] rounded-2xl text-center shadow-md hover:border-[#5c00da] transition-all">
                            <div className="w-12 h-12 rounded-xl bg-lime-50 text-lime-700 flex items-center justify-center mx-auto mb-3">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div className="text-4xl sm:text-5xl font-black text-[#5c00da] mb-2 font-mono tracking-tight">
                                98%
                            </div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest font-sans">
                                VeRO Protection &amp; Safety
                            </div>
                            <p className="text-xs text-slate-400 mt-2">
                                Zero trademark strikes reported across active users
                            </p>
                        </div>

                    </div>

                    {/* Testimonial Cards */}
                    <div className="text-center mb-12">
                        <span className="inline-block px-3.5 py-1 rounded-full bg-[#e9ddff] text-[#5c00da] text-xs font-extrabold uppercase tracking-widest mb-3 border border-[#d0bcff]">
                            TESTED &amp; TRUSTED
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#191c1e] tracking-tight">
                            Trusted by Top-Rated eBay Operators
                        </h2>
                        <p className="text-slate-600 max-w-xl mx-auto mt-2 text-base">
                            See how sellers like you turn stagnant listings into revenue-generating powerhouses.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                        {TESTIMONIALS.map((t, idx) => (
                            <div
                                key={idx}
                                className="p-8 bg-white border border-[#E2E8F0] rounded-2xl flex flex-col justify-between gap-6 shadow-md hover:shadow-lg transition-all"
                            >
                                <div>
                                    <div className="flex items-center gap-1 text-[#b8fa33] mb-4">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-5 h-5 fill-[#b8fa33] text-[#b8fa33]" />
                                        ))}
                                    </div>

                                    <p className="text-slate-700 text-base sm:text-lg italic leading-relaxed">
                                        "{t.quote}"
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-extrabold text-[#191c1e] flex items-center gap-1.5">
                                            {t.name}
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                                        </h4>
                                        <p className="text-xs text-slate-500 font-medium">{t.role}</p>
                                    </div>
                                    {t.verifiedSales && (
                                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded font-mono font-semibold">
                                            {t.verifiedSales}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </section>


            {/* =========================================================================
          7. FREQUENTLY ASKED QUESTIONS (FAQ)
          ========================================================================= */}
            <section id="faq-section" className="py-20 md:py-28 px-4 sm:px-8 bg-white border-b border-[#E2E8F0]">
                <div className="max-w-[1280px] mx-auto">

                    <div className="text-center mb-16">
                        <span className="inline-block px-3.5 py-1 rounded-full bg-[#e9ddff] text-[#5c00da] text-xs font-extrabold uppercase tracking-widest mb-3 border border-[#d0bcff]">
                            GOT QUESTIONS?
                        </span>
                        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#191c1e] tracking-tight">
                            Everything You Need to Know About Title Builder
                        </h2>
                        <p className="text-slate-600 max-w-xl mx-auto mt-3 text-base sm:text-lg">
                            Have questions about Cassini indexing, VeRO compliance databases, or team exports? We've got answers.
                        </p>
                    </div>

                    {/* 2-Column Accordion */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-start">
                        {FAQ_ITEMS.map((item) => {
                            const isOpen = !!openFaqIds[item.id];
                            return (
                                <div
                                    key={item.id}
                                    className={`border rounded-2xl transition-all ${isOpen ? 'border-[#5c00da] bg-[#F8FAFC] shadow-sm' : 'border-[#E2E8F0] bg-white hover:border-slate-300'
                                        }`}
                                >
                                    <button
                                        onClick={() => toggleFaq(item.id)}
                                        className="w-full p-6 text-left flex items-start justify-between gap-4 cursor-pointer focus:outline-none"
                                        aria-expanded={isOpen}
                                    >
                                        <h3 className="font-bold text-base sm:text-lg text-[#191c1e] leading-snug">
                                            {item.question}
                                        </h3>
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform ${isOpen ? 'bg-[#5c00da] text-white rotate-180' : 'bg-slate-100 text-slate-500'
                                                }`}
                                        >
                                            <ChevronDown className="w-4 h-4" />
                                        </div>
                                    </button>

                                    {isOpen && (
                                        <div className="px-6 pb-6 pt-0 text-slate-600 text-sm sm:text-base leading-relaxed">
                                            <p>{item.answer}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-12 text-center p-6 bg-[#f2f4f6] rounded-2xl border border-[#E2E8F0] max-w-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3 text-left">
                            <HelpCircle className="w-6 h-6 text-[#5c00da] shrink-0" />
                            <div>
                                <div className="text-sm font-bold text-[#191c1e]">Have a custom eBay integration requirement?</div>
                                <div className="text-xs text-slate-500">Our seller success engineers are available 24/7.</div>
                            </div>
                        </div>
                        <button
                            onClick={handleOpenModal}
                            className="px-4 py-2 bg-white hover:bg-slate-50 border border-[#E2E8F0] text-[#191c1e] text-xs font-bold rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer"
                        >
                            Contact Support &rarr;
                        </button>
                    </div>

                </div>
            </section>


            {/* =========================================================================
          8. PRE-FOOTER CONVERSION BANNER
          ========================================================================= */}
            <section className="py-16 md:py-24 px-4 sm:px-8 bg-white">
                <div className="max-w-[1280px] mx-auto">

                    <div className="bg-gradient-to-br from-[#312e81] via-[#4338ca] to-[#4c1d95] rounded-3xl p-8 sm:p-12 md:p-16 text-center flex flex-col items-center gap-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#b8fa33]/10 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#7530fb]/30 rounded-full blur-3xl pointer-events-none"></div>

                        <div className="max-w-2xl relative z-10">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#b8fa33] text-xs font-extrabold uppercase tracking-widest mb-4 border border-white/20">
                                <Sparkles className="w-3.5 h-3.5" />
                                14-DAY RISK-FREE ACCESS
                            </span>

                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight leading-tight">
                                Stop Guessing eBay Keywords. <br className="hidden sm:inline" />
                                Start Ranking #1 Today.
                            </h2>

                            <p className="text-base sm:text-lg text-indigo-100/90 max-w-xl mx-auto leading-relaxed">
                                Join 12,000+ eBay sellers using Reazify to scale listing impressions and drive sales.
                            </p>
                        </div>

                        <div className="w-full max-w-lg relative z-10">
                            {prefooterSubmitted ? (
                                <div className="bg-emerald-500/20 border border-emerald-400 text-white p-4 rounded-xl flex items-center justify-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-[#b8fa33]" />
                                    <span className="text-sm font-bold">Awesome! Launching your free workspace...</span>
                                </div>
                            ) : (
                                <form onSubmit={handlePrefooterSubmit} className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        id="prefooter-email-input"
                                        type="email"
                                        value={prefooterEmail}
                                        onChange={(e) => setPrefooterEmail(e.target.value)}
                                        placeholder="Enter your email address..."
                                        required
                                        className="flex-1 px-5 py-4 rounded-xl bg-white text-[#191c1e] text-sm font-medium focus:outline-none focus:ring-4 focus:ring-[#b8fa33]/40 shadow-inner"
                                    />

                                    <button
                                        id="prefooter-submit-btn"
                                        type="submit"
                                        className="bg-[#b8fa33] hover:bg-[#7530fb] text-[#0f172a] px-8 py-4 rounded-xl font-bold text-sm sm:text-base shadow-lg hover:shadow-xl transition-all whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                                    >
                                        <span>Start Free Trial</span>
                                        <span className="text-lg font-black">+</span>
                                    </button>
                                </form>
                            )}

                            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-4 text-xs text-indigo-200/80">
                                <span className="flex items-center gap-1">
                                    <Lock className="w-3.5 h-3.5" /> No credit card required
                                </span>
                                <span>•</span>
                                <span>Free forever plan available</span>
                                <span>•</span>
                                <span>1-click instant setup</span>
                            </div>
                        </div>

                    </div>

                </div>
            </section>


            {/* =========================================================================
          INTERACTIVE QUICK OPTIMIZER MODAL
          ========================================================================= */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
                    <div
                        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-[#E2E8F0] overflow-hidden flex flex-col max-h-[90vh]"
                        role="dialog"
                        aria-modal="true"
                    >
                        {/* Header */}
                        <div className="bg-[#f8fafc] px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-[#5c00da] text-white flex items-center justify-center shadow-xs">
                                    <Sparkles className="w-4 h-4 text-[#b8fa33]" />
                                </div>
                                <div>
                                    <h3 className="text-base font-extrabold text-[#191c1e] flex items-center gap-2">
                                        Reazify Title Builder Sandbox
                                        <span className="text-[10px] bg-[#b8fa33] text-[#0f172a] font-black px-2 py-0.5 rounded">
                                            FREE TRIAL
                                        </span>
                                    </h3>
                                    <p className="text-xs text-slate-500">Live 80-character Cassini SEO &amp; VeRO safety testing</p>
                                </div>
                            </div>

                            <button
                                onClick={handleCloseModal}
                                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                                aria-label="Close modal"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-6 overflow-y-auto space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    Select a Preset Product Category:
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {PRESET_PRODUCTS.map((preset, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSelectModalPreset(idx)}
                                            className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-left truncate cursor-pointer ${selectedPresetIndex === idx
                                                ? 'bg-indigo-50 border-[#5c00da] text-[#5c00da] shadow-xs'
                                                : 'bg-[#F8FAFC] border-slate-200 text-slate-700 hover:bg-slate-100'
                                                }`}
                                        >
                                            {preset.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        eBay Listing Title
                                    </span>
                                    <span
                                        className={`font-mono text-xs font-bold ${modalCharCount > 80 ? 'text-red-600' : modalCharCount >= 70 ? 'text-emerald-700 font-extrabold' : 'text-[#5c00da]'
                                            }`}
                                    >
                                        {modalCharCount} / 80 Characters {modalCharCount >= 70 && modalCharCount <= 80 && '✨ (Optimal)'}
                                    </span>
                                </div>

                                <textarea
                                    rows={2}
                                    value={modalTitle}
                                    onChange={(e) => setModalTitle(e.target.value)}
                                    className="w-full bg-white border-2 border-[#5c00da] focus:border-[#7530fb] rounded-xl p-3 font-mono text-sm sm:text-base font-semibold text-[#191c1e] shadow-inner focus:outline-none resize-none"
                                    placeholder="Type your product title keywords..."
                                />

                                <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-300 ${modalCharCount > 80 ? 'bg-red-500' : modalCharCount >= 70 ? 'bg-[#b8fa33]' : 'bg-[#5c00da]'
                                            }`}
                                        style={{ width: `${Math.min((modalCharCount / 80) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        Recommended Cassini Long-Tail Keywords (Click to Inject):
                                    </span>
                                    <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                        100% VeRO Safe
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {PRESET_PRODUCTS[selectedPresetIndex].keywords.map((kw, i) => {
                                        const isAdded = modalTitle.toLowerCase().includes(kw.toLowerCase()) || modalAddedKeywords[kw];
                                        return (
                                            <button
                                                key={i}
                                                onClick={() => handleAddModalKeyword(kw)}
                                                disabled={isAdded || modalCharCount >= 80}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${isAdded
                                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 opacity-80 cursor-default'
                                                    : 'bg-white hover:bg-indigo-50 text-[#5c00da] border border-indigo-200 shadow-xs cursor-pointer active:scale-95'
                                                    }`}
                                            >
                                                {isAdded ? (
                                                    <>
                                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                        <span>{kw}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Plus className="w-3.5 h-3.5" />
                                                        <span>{kw}</span>
                                                    </>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full border-4 border-[#b8fa33] bg-emerald-50 text-slate-900 flex items-center justify-center font-mono font-black text-lg shrink-0">
                                        {modalScore}
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-700 uppercase">
                                            SEO Cassini Rank
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {modalScore >= 80 ? 'Optimal density for top-3 organic rank' : 'Inject more keywords to reach 80 chars'}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-[#b8fa33] text-[#0f172a] flex items-center justify-center shrink-0 shadow-xs">
                                        <ShieldCheck className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-emerald-950 uppercase flex items-center gap-1">
                                            VeRO Risk Protected
                                        </div>
                                        <div className="text-xs text-emerald-800">
                                            0 trademark infringements detected in global database
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border border-slate-200 rounded-xl p-4 bg-white">
                                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                    Detected Item Specifics for eBay Category:
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                    {Object.entries(PRESET_PRODUCTS[selectedPresetIndex].itemSpecs).map(([key, val], idx) => (
                                        <div key={idx} className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                                            <span className="text-slate-400 block text-[10px] uppercase font-bold">{key}</span>
                                            <span className="font-semibold text-slate-800 truncate block">{val}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
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
                                className="px-5 py-2.5 bg-[#b8fa33] hover:bg-[#7530fb] text-[#0f172a] text-xs font-black uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer"
                            >
                                <Layers className="w-4 h-4 text-[#0f172a]" />
                                <span>{modalExported ? 'Exported to Studio!' : 'Export to Listing Studio'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
}
