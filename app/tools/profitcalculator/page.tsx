'use client';

import React, { useState, useId } from 'react';
import {
    ArrowRight,
    PlayCircle,
    TrendingUp,
    Globe,
    DollarSign,
    Sliders,
    ShoppingCart,
    Landmark,
    ShieldAlert,
    Check,
    Sparkles,
    Tag,
    ArrowLeftRight,
    RotateCcw,
    Star,
    Zap,
    Type,
    Eye,
    GitFork,
    X,
    Calculator,
    ShieldCheck,
    Copy,
    AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';

// ==========================================
// TYPES & CONSTANTS
// ==========================================

export type CalculatorTab = 'calculator' | 'reverse' | 'best_offer' | 'map_guard';

export interface FaqItem {
    id: string;
    question: string;
    answer: string;
}

const EBAY_CATEGORIES = [
    { name: 'Most Categories (General)', standardFee: 0.1325, basicStoreFee: 0.1235 },
    { name: 'Computers & Tablets / Electronics', standardFee: 0.0935, basicStoreFee: 0.0735 },
    { name: 'Guitars & Musical Instruments', standardFee: 0.0635, basicStoreFee: 0.0535 },
    { name: 'Men’s & Women’s Athletic Shoes ($150+)', standardFee: 0.0800, basicStoreFee: 0.0800 },
    { name: 'Collectibles & Trading Cards', standardFee: 0.1325, basicStoreFee: 0.1235 },
    { name: 'Clothing, Shoes & Accessories', standardFee: 0.1325, basicStoreFee: 0.1235 },
    { name: 'Jewelry & Watches (< $1,000)', standardFee: 0.1500, basicStoreFee: 0.1250 },
    { name: 'Heavy Equipment & Business/Industrial', standardFee: 0.0300, basicStoreFee: 0.0250 },
];

// ==========================================
// 1. HERO SECTION
// ==========================================

interface HeroSectionProps {
    onOpenCalculator: (tab?: CalculatorTab) => void;
    onOpenDemo: () => void;
}

function HeroSection({ onOpenCalculator, onOpenDemo }: HeroSectionProps) {
    return (
        <section id="hero-section" className="bg-[#f8f7ff] py-16 md:py-24 px-4 sm:px-6 md:px-8 relative overflow-hidden">
            {/* Background SVG Grid */}
            <div className="absolute inset-0 opacity-10 pointer-events-none" aria-hidden="true">
                <svg height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern height="40" id="hero-grid" patternUnits="userSpaceOnUse" width="40">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#7530fb" strokeWidth="0.5" />
                        </pattern>
                    </defs>
                    <rect fill="url(#hero-grid)" height="100%" width="100%" />
                </svg>
            </div>

            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12 relative z-10">
                {/* Left Column: Copy & Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex-1 space-y-6 text-center md:text-left"
                >
                    {/* Pill Badge */}
                    <div
                        id="hero-badge"
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#f3eeff] text-[#7530fb] font-sans text-sm font-semibold border border-[#ede9fe] shadow-xs"
                    >
                        <span className="w-2 h-2 rounded-full bg-[#b8fa33] ring-4 ring-[#b8fa33]/30 animate-pulse" />
                        New: Advanced Scenario Modeling
                    </div>

                    {/* Main Headline */}
                    <h1 className="font-syne text-4xl sm:text-5xl md:text-[56px] md:leading-[64px] font-extrabold text-[#1e1535] tracking-tight">
                        Know Your Numbers.<br />
                        <span className="text-[#7530fb]">Grow Your Margins.</span>
                    </h1>

                    {/* Subheadline */}
                    <p className="font-sans text-lg md:text-[18px] leading-relaxed text-[#4a4456] max-w-xl mx-auto md:mx-0">
                        Stop guessing your true profit. Our precision pricing logic and real-time ROI tracking ensure every sale contributes to your bottom line, factoring in fees, costs, and market volatility.
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-2">
                        <button
                            id="hero-cta-calculate"
                            onClick={() => onOpenCalculator('calculator')}
                            className="bg-[#7530fb] hover:bg-[#5e1fd6] text-white font-sans text-base font-bold py-3.5 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer group"
                        >
                            Calculate Profit Now
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </button>
                        <button
                            id="hero-cta-demo"
                            onClick={onOpenDemo}
                            className="bg-white hover:bg-white text-[#1e1535] font-sans text-base font-bold py-3.5 px-8 rounded-lg border border-[#ede9fe] hover:border-[#7530fb] hover:text-[#7530fb] transition-all duration-200 shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                        >
                            View Demo
                            <PlayCircle className="w-4 h-4 text-[#7530fb]" />
                        </button>
                    </div>
                </motion.div>

                {/* Right Column: Dashboard Mockup Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    className="flex-1 w-full max-w-[560px] relative"
                >
                    {/* Subtle Ambient Glow */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-[#e9ddff] to-[#b8fa33]/40 opacity-40 blur-2xl rounded-3xl" />

                    {/* Card Container */}
                    <div
                        id="hero-dashboard-card"
                        className="bg-white rounded-2xl border border-[#ede9fe] shadow-[0_10px_30px_-5px_rgba(117,48,251,0.12)] p-6 sm:p-7 relative z-10"
                    >
                        {/* Dashboard Preview Card Mockup Header */}
                        <div className="flex justify-between items-center mb-6 border-b border-[#f1f5f9] pb-5">
                            <div>
                                <h3 className="font-syne text-2xl font-bold text-[#1e1535]">Net Profit</h3>
                                <div className="flex items-baseline gap-3 mt-1">
                                    <span className="font-sans text-3xl sm:text-[34px] font-extrabold text-[#1e1535]">$4,285.50</span>
                                    <span className="bg-[#b8fa33] text-[#1e1535] font-sans text-xs sm:text-sm font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                                        <TrendingUp className="w-4 h-4 stroke-[2.5]" />
                                        +124%
                                    </span>
                                </div>
                            </div>

                            {/* ROI Circular Meter */}
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 border-[#7530fb] border-t-[#b8fa33] flex items-center justify-center relative shadow-xs">
                                <span className="font-syne text-xs sm:text-sm font-extrabold text-[#1e1535]">ROI</span>
                            </div>
                        </div>

                        {/* Pricing Logic Zones */}
                        <div className="space-y-3">
                            <h4 className="font-sans text-xs font-bold text-[#6b7280] uppercase tracking-wider">
                                Pricing Logic Zones
                            </h4>

                            {/* Zone 1: Break-Even */}
                            <div className="bg-[#f8f7ff] rounded-lg p-3.5 flex justify-between items-center border-l-4 border-red-500 hover:bg-[#f3eeff]/60 transition-colors">
                                <div>
                                    <span className="font-sans text-sm font-bold block text-[#1e1535]">Break-even</span>
                                    <span className="font-sans text-xs text-[#6b7280]">Covers all costs</span>
                                </div>
                                <span className="font-mono text-sm font-semibold text-[#1e1535]">$24.99</span>
                            </div>

                            {/* Zone 2: Safe Floor */}
                            <div className="bg-[#f8f7ff] rounded-lg p-3.5 flex justify-between items-center border-l-4 border-[#7530fb] hover:bg-[#f3eeff]/60 transition-colors">
                                <div>
                                    <span className="font-sans text-sm font-bold block text-[#1e1535]">Safe Floor</span>
                                    <span className="font-sans text-xs text-[#6b7280]">Minimum 20% margin</span>
                                </div>
                                <span className="font-mono text-sm font-semibold text-[#1e1535]">$32.50</span>
                            </div>

                            {/* Zone 3: Sweet Spot */}
                            <div className="bg-[#f8f7ff] rounded-lg p-3.5 flex justify-between items-center border-l-4 border-[#b8fa33] hover:bg-[#f3eeff]/60 transition-colors">
                                <div>
                                    <span className="font-sans text-sm font-bold block text-[#1e1535]">Sweet Spot</span>
                                    <span className="font-sans text-xs text-[#6b7280]">Optimized for conversion</span>
                                </div>
                                <span className="font-mono text-base font-extrabold text-[#7530fb]">$39.99</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

// ==========================================
// 2. CORE FEATURE GRID
// ==========================================

interface CoreFeaturesProps {
    onSelectFeature?: (feature: string) => void;
}

function CoreFeatures({ onSelectFeature }: CoreFeaturesProps) {
    return (
        <section id="core-features" className="py-20 px-4 sm:px-6 md:px-8 bg-white border-t border-[#ede9fe]/60">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="font-syne text-3xl sm:text-4xl md:text-[40px] font-bold text-[#1e1535] mb-4 tracking-tight">
                        Precision Engineering for Your Pricing
                    </h2>
                    <p className="font-sans text-base sm:text-lg text-[#6b7280] max-w-2xl mx-auto">
                        Calculate costs down to the penny across multiple platforms and scenarios.
                    </p>
                </div>

                {/* 3-Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Card 1: Global Fee Analysis */}
                    <motion.div
                        whileHover={{ y: -4 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => onSelectFeature?.('global_fees')}
                        id="feature-card-global-fees"
                        className="bg-[#f8f7ff] rounded-2xl p-8 border border-[#ede9fe] hover:border-[#7530fb]/40 hover:shadow-[0_10px_25px_-5px_rgba(117,48,251,0.08)] transition-all duration-200 group cursor-pointer"
                    >
                        <div className="w-12 h-12 bg-[#f3eeff] rounded-xl flex items-center justify-center mb-6 text-[#7530fb] group-hover:scale-110 group-hover:bg-[#7530fb] group-hover:text-white transition-all duration-200">
                            <Globe className="w-6 h-6" />
                        </div>
                        <h3 className="font-syne text-xl sm:text-2xl font-bold text-[#1e1535] mb-3">
                            Global Fee Analysis
                        </h3>
                        <p className="font-sans text-sm sm:text-base text-[#6b7280] leading-relaxed">
                            Instantly calculate marketplace fees, payment gateway costs, and international taxes. Stop losing margin to hidden global surcharges.
                        </p>
                    </motion.div>

                    {/* Card 2: Smart Price Optimizer */}
                    <motion.div
                        whileHover={{ y: -4 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => onSelectFeature?.('price_optimizer')}
                        id="feature-card-smart-optimizer"
                        className="bg-[#f8f7ff] rounded-2xl p-8 border border-[#ede9fe] hover:border-[#7530fb]/40 hover:shadow-[0_10px_25px_-5px_rgba(117,48,251,0.08)] transition-all duration-200 group relative overflow-hidden cursor-pointer"
                    >
                        {/* Top Right Ambient Glow */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[#b8fa33] opacity-25 blur-2xl rounded-full translate-x-1/2 -translate-y-1/2" />

                        <div className="w-12 h-12 bg-[#7530fb] rounded-xl flex items-center justify-center mb-6 text-white group-hover:scale-110 group-hover:bg-[#5e1fd6] transition-all duration-200 shadow-xs">
                            <DollarSign className="w-6 h-6 stroke-[2.5]" />
                        </div>
                        <h3 className="font-syne text-xl sm:text-2xl font-bold text-[#1e1535] mb-3">
                            Smart Price Optimizer
                        </h3>
                        <p className="font-sans text-sm sm:text-base text-[#6b7280] leading-relaxed">
                            Our AI suggests the optimal selling price by analyzing your desired profit margin, historical competitor data, and current market demand.
                        </p>
                    </motion.div>

                    {/* Card 3: Scenario Modeling */}
                    <motion.div
                        whileHover={{ y: -4 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => onSelectFeature?.('scenario_modeling')}
                        id="feature-card-scenario-modeling"
                        className="bg-[#f8f7ff] rounded-2xl p-8 border border-[#ede9fe] hover:border-[#7530fb]/40 hover:shadow-[0_10px_25px_-5px_rgba(117,48,251,0.08)] transition-all duration-200 group cursor-pointer"
                    >
                        <div className="w-12 h-12 bg-[#f3eeff] rounded-xl flex items-center justify-center mb-6 text-[#7530fb] group-hover:scale-110 group-hover:bg-[#7530fb] group-hover:text-white transition-all duration-200">
                            <Sliders className="w-6 h-6" />
                        </div>
                        <h3 className="font-syne text-xl sm:text-2xl font-bold text-[#1e1535] mb-3">
                            Scenario Modeling
                        </h3>
                        <p className="font-sans text-sm sm:text-base text-[#6b7280] leading-relaxed">
                            Test 'what-if' scenarios before committing to a price change. See how volume discounts or shipping rate hikes impact your bottom line instantly.
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

// ==========================================
// 3. SEO CONTENT & DEEP-DIVE ROWS
// ==========================================

interface SeoDeepDiveProps {
    onOpenMapGuardDemo?: () => void;
    onOpenRoiDemo?: () => void;
}

function SeoDeepDive({ onOpenMapGuardDemo }: SeoDeepDiveProps) {
    const [mapAdjusted, setMapAdjusted] = useState(false);

    const handleAdjustMap = () => {
        setMapAdjusted(true);
        setTimeout(() => {
            onOpenMapGuardDemo?.();
        }, 400);
    };

    return (
        <div id="seo-deep-dive-container">
            {/* SEO Narrative Block */}
            <section id="seo-overview-block" className="py-16 bg-white border-t border-[#ede9fe]/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                    <div className="max-w-4xl">
                        <h2 className="font-syne text-2xl sm:text-3xl font-bold text-[#1e1535] mb-6 tracking-tight">
                            Engineered for E-commerce Profitability
                        </h2>
                        <div className="space-y-4 font-sans text-base text-[#4a4456] leading-relaxed">
                            <p>
                                Maximizing your <strong className="text-[#1e1535] font-semibold">e-commerce profit margins</strong> requires more than just a basic spreadsheet. Our platform provides <strong className="text-[#1e1535] font-semibold">real-time marketplace fee tracking</strong> across global platforms, ensuring you never lose money on a sale due to unexpected costs or currency fluctuations.
                            </p>
                            <p>
                                Whether you are calculating complex <strong className="text-[#1e1535] font-semibold">eBay final value fees</strong> or looking for a robust <strong className="text-[#1e1535] font-semibold">wholesale arbitrage calculator</strong>, our precision logic handles the heavy lifting. We factor in every variable from shipping surcharges to category-specific commissions so you can focus on scaling your inventory.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3 Deep-Dive Rows */}
            <section id="deep-dive-rows" className="py-20 bg-[#f8f7ff] overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 space-y-24">

                    {/* Row 1: Live Fee Matrix */}
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.5 }}
                            className="flex-1 w-full order-2 lg:order-1"
                        >
                            <div
                                id="live-fee-matrix-card"
                                className="bg-white border border-[#ede9fe] rounded-2xl p-6 sm:p-7 shadow-[0_10px_30px_-5px_rgba(117,48,251,0.08)] relative"
                            >
                                <div className="absolute -top-3.5 -left-3.5 bg-[#7530fb] text-white px-3.5 py-1 text-xs font-bold font-sans rounded-lg transform -rotate-3 z-10 shadow-sm flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#b8fa33] animate-pulse" />
                                    Live Data
                                </div>

                                <div className="space-y-3.5 pt-2">
                                    <div className="flex justify-between items-center p-3.5 bg-[#f8f7ff] rounded-xl border border-[#ede9fe]/50 hover:bg-[#f3eeff]/60 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-[#f3eeff] flex items-center justify-center text-[#7530fb]">
                                                <Globe className="w-4 h-4" />
                                            </div>
                                            <span className="font-sans font-bold text-[#1e1535] text-sm sm:text-base">eBay UK</span>
                                        </div>
                                        <span className="text-red-500 font-mono font-semibold text-sm sm:text-base">-12.8%</span>
                                    </div>

                                    <div className="flex justify-between items-center p-3.5 bg-[#f8f7ff] rounded-xl border border-[#ede9fe]/50 hover:bg-[#f3eeff]/60 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-[#f3eeff] flex items-center justify-center text-[#7530fb]">
                                                <ShoppingCart className="w-4 h-4" />
                                            </div>
                                            <span className="font-sans font-bold text-[#1e1535] text-sm sm:text-base">Amazon US</span>
                                        </div>
                                        <span className="text-red-500 font-mono font-semibold text-sm sm:text-base">-15.0%</span>
                                    </div>

                                    <div className="flex justify-between items-center p-3.5 bg-[#f3eeff] rounded-xl border border-[#ede9fe]">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-[#7530fb] flex items-center justify-center text-white">
                                                <Landmark className="w-4 h-4" />
                                            </div>
                                            <span className="font-sans font-bold text-[#1e1535] text-sm sm:text-base">Total Fees Estimated</span>
                                        </div>
                                        <span className="text-[#7530fb] font-mono font-extrabold text-base sm:text-lg">$4.32</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.5 }}
                            className="flex-1 order-1 lg:order-2 space-y-6"
                        >
                            <h2 className="font-syne text-3xl sm:text-4xl font-bold text-[#1e1535] tracking-tight">
                                Live Fee Matrix &amp; Market Breakdown
                            </h2>
                            <p className="font-sans text-base sm:text-lg text-[#6b7280] leading-relaxed">
                                Instantly see exactly what every marketplace takes from your sale, including regional taxes and hidden currency conversion spreads.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <div className="w-5 h-5 rounded-full bg-[#b8fa33] flex items-center justify-center text-[#1e1535] mt-0.5 shrink-0 shadow-2xs">
                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    </div>
                                    <span className="font-sans text-base text-[#4a4456]">Real-time marketplace fee updates.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-5 h-5 rounded-full bg-[#b8fa33] flex items-center justify-center text-[#1e1535] mt-0.5 shrink-0 shadow-2xs">
                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    </div>
                                    <span className="font-sans text-base text-[#4a4456]">VAT, GST, and state tax calculations.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-5 h-5 rounded-full bg-[#b8fa33] flex items-center justify-center text-[#1e1535] mt-0.5 shrink-0 shadow-2xs">
                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    </div>
                                    <span className="font-sans text-base text-[#4a4456]">Payment gateway fee estimation (PayPal, Stripe, etc).</span>
                                </li>
                            </ul>
                        </motion.div>
                    </div>

                    {/* Row 2: 100% MAP Risk Assessment */}
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.5 }}
                            className="flex-1 space-y-6"
                        >
                            <h2 className="font-syne text-3xl sm:text-4xl font-bold text-[#1e1535] tracking-tight">
                                100% MAP Risk Assessment &amp; Guard
                            </h2>
                            <p className="font-sans text-base sm:text-lg text-[#6b7280] leading-relaxed">
                                Never accidentally violate Minimum Advertised Price agreements. Set your floor prices and let our guard rail protect your vendor relationships.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <div className="w-5 h-5 rounded-full bg-[#b8fa33] flex items-center justify-center text-[#1e1535] mt-0.5 shrink-0 shadow-2xs">
                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    </div>
                                    <span className="font-sans text-base text-[#4a4456]">Automated MAP violation alerts.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-5 h-5 rounded-full bg-[#b8fa33] flex items-center justify-center text-[#1e1535] mt-0.5 shrink-0 shadow-2xs">
                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    </div>
                                    <span className="font-sans text-base text-[#4a4456]">Hard-stop listing prevention below MAP.</span>
                                </li>
                            </ul>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.5 }}
                            className="flex-1 w-full"
                        >
                            <div
                                id="map-guard-card"
                                className="bg-[#1e1535] border border-white/10 rounded-2xl p-7 sm:p-8 shadow-[0_15px_35px_rgba(30,21,53,0.3)] relative overflow-hidden text-white"
                            >
                                <div className="absolute top-0 right-0 w-36 h-36 bg-red-500/20 blur-3xl rounded-full pointer-events-none" />

                                <div className="flex items-start gap-4 mb-6 relative z-10">
                                    <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400 shrink-0 border border-red-500/30">
                                        <ShieldAlert className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h4 className="font-syne text-white text-lg sm:text-xl font-bold">
                                            {mapAdjusted ? "MAP Compliant Verified" : "MAP Violation Warning"}
                                        </h4>
                                        <p className="text-gray-400 text-xs sm:text-sm mt-0.5">
                                            {mapAdjusted ? "Price adjusted to meet vendor agreement safe floor" : "Suggested price drops below vendor MAP"}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3.5 relative z-10">
                                    <div className="flex justify-between items-center pb-2.5 border-b border-white/10">
                                        <span className="text-gray-300 font-sans text-sm">Vendor MAP:</span>
                                        <span className="text-white font-mono font-bold">$49.99</span>
                                    </div>

                                    <div className="flex justify-between items-center pb-2.5 border-b border-white/10">
                                        <span className="text-gray-300 font-sans text-sm">Calculated Target:</span>
                                        <span className={`font-mono font-bold ${mapAdjusted ? 'text-[#b8fa33]' : 'text-red-400'}`}>
                                            {mapAdjusted ? '$49.99' : '$47.50'}
                                        </span>
                                    </div>

                                    <button
                                        id="adjust-map-button"
                                        onClick={handleAdjustMap}
                                        className={`w-full font-sans font-bold py-3 rounded-lg mt-4 transition-all duration-200 cursor-pointer shadow-md ${mapAdjusted
                                            ? 'bg-[#b8fa33] text-[#1e1535] hover:bg-[#a4e526]'
                                            : 'bg-white text-[#1e1535] hover:bg-[#b8fa33]'
                                            }`}
                                    >
                                        {mapAdjusted ? "✓ Price Adjusted to $49.99" : "Adjust to MAP Minimum"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Row 3: Real-Time ROI Scoring */}
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.5 }}
                            className="flex-1 w-full order-2 lg:order-1"
                        >
                            <div
                                id="roi-scoring-model-card"
                                className="bg-white border border-[#ede9fe] rounded-2xl p-6 sm:p-7 shadow-[0_10px_30px_-5px_rgba(117,48,251,0.08)] relative"
                            >
                                <div className="flex justify-between items-center border-b border-[#ede9fe] pb-3 mb-6">
                                    <h4 className="font-syne text-lg sm:text-xl font-bold text-[#1e1535]">
                                        ROI Scoring Model
                                    </h4>
                                    <span className="text-xs font-sans font-semibold text-[#7530fb] bg-[#f3eeff] px-2.5 py-1 rounded-md">
                                        Capital Velocity
                                    </span>
                                </div>

                                {/* Bar Chart Visual */}
                                <div className="flex items-end justify-around gap-3 sm:gap-4 h-48 sm:h-52 pt-8 pb-3 px-4 bg-[#f8f7ff] rounded-xl border border-[#ede9fe]/60">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="h-20 w-10 sm:w-14 bg-[#e9ddff] hover:bg-[#d0bcff] transition-all rounded-t-lg" />
                                        <span className="font-mono text-xs text-[#6b7280] font-medium">10%</span>
                                    </div>

                                    <div className="flex flex-col items-center gap-2">
                                        <div className="h-28 w-10 sm:w-14 bg-[#e9ddff] hover:bg-[#d0bcff] transition-all rounded-t-lg" />
                                        <span className="font-mono text-xs text-[#6b7280] font-medium">20%</span>
                                    </div>

                                    <div className="flex flex-col items-center gap-2 relative">
                                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-[#b8fa33] text-[#1e1535] text-xs font-extrabold px-2.5 py-0.5 rounded-md shadow-xs flex items-center gap-0.5">
                                            <Sparkles className="w-3 h-3" />
                                            A+
                                        </div>
                                        <div className="h-40 w-10 sm:w-14 bg-[#7530fb] rounded-t-lg shadow-sm" />
                                        <span className="font-mono text-xs text-[#7530fb] font-bold">35%</span>
                                    </div>

                                    <div className="flex flex-col items-center gap-2">
                                        <div className="h-16 w-10 sm:w-14 bg-[#e9ddff] hover:bg-[#d0bcff] transition-all rounded-t-lg" />
                                        <span className="font-mono text-xs text-[#6b7280] font-medium">50%+</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.5 }}
                            className="flex-1 order-1 lg:order-2 space-y-6"
                        >
                            <h2 className="font-syne text-3xl sm:text-4xl font-bold text-[#1e1535] tracking-tight">
                                Real-Time ROI Scoring &amp; Analysis
                            </h2>
                            <p className="font-sans text-base sm:text-lg text-[#6b7280] leading-relaxed">
                                Stop looking at just gross margin. Our engine grades every potential inventory purchase with a proprietary ROI score based on holding costs and capital velocity.
                            </p>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <div className="w-5 h-5 rounded-full bg-[#b8fa33] flex items-center justify-center text-[#1e1535] mt-0.5 shrink-0 shadow-2xs">
                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    </div>
                                    <span className="font-sans text-base text-[#4a4456]">Inventory amortization tracking.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <div className="w-5 h-5 rounded-full bg-[#b8fa33] flex items-center justify-center text-[#1e1535] mt-0.5 shrink-0 shadow-2xs">
                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    </div>
                                    <span className="font-sans text-base text-[#4a4456]">Capital velocity scoring (A to F grading).</span>
                                </li>
                            </ul>
                        </motion.div>
                    </div>

                </div>
            </section>
        </div>
    );
}

// ==========================================
// 4. POWER RESELLER UTILITY CARDS
// ==========================================

interface UtilityCardsProps {
    onOpenCalculatorTab: (tab: CalculatorTab) => void;
}

function UtilityCards({ onOpenCalculatorTab }: UtilityCardsProps) {
    return (
        <section id="utility-cards" className="py-20 bg-white border-t border-[#ede9fe]/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <div className="text-center mb-16">
                    <h2 className="font-syne text-3xl sm:text-4xl font-bold text-[#1e1535] mb-4 tracking-tight">
                        Built for Power Resellers
                    </h2>
                    <p className="font-sans text-base sm:text-lg text-[#6b7280] max-w-2xl mx-auto">
                        Advanced calculators to handle every edge case of your reselling business.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                    {/* Card 1 */}
                    <motion.div
                        whileHover={{ y: -4 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => onOpenCalculatorTab('best_offer')}
                        id="utility-card-best-offer"
                        className="bg-[#f8f7ff] border border-[#ede9fe] rounded-2xl p-7 hover:shadow-[0_12px_30px_-5px_rgba(117,48,251,0.1)] transition-all duration-200 cursor-pointer group flex flex-col justify-between"
                    >
                        <div>
                            <div className="w-11 h-11 bg-[#f3eeff] rounded-xl flex items-center justify-center mb-5 text-[#7530fb] group-hover:bg-[#7530fb] group-hover:text-white transition-all duration-200 shadow-2xs">
                                <Tag className="w-5 h-5" />
                            </div>
                            <h4 className="font-syne font-bold text-xl text-[#1e1535] mb-2.5">
                                Best Offer Testing
                            </h4>
                            <p className="font-sans text-sm sm:text-base text-[#6b7280] leading-relaxed mb-6">
                                Calculate exact margins for 'Best Offer' thresholds before accepting buyer negotiations.
                            </p>
                        </div>
                        <span className="text-[#7530fb] font-sans font-bold text-sm flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                            Try it out <ArrowRight className="w-4 h-4" />
                        </span>
                    </motion.div>

                    {/* Card 2 */}
                    <motion.div
                        whileHover={{ y: -4 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => onOpenCalculatorTab('reverse')}
                        id="utility-card-reverse-price"
                        className="bg-[#f8f7ff] border border-[#ede9fe] rounded-2xl p-7 hover:shadow-[0_12px_30px_-5px_rgba(117,48,251,0.1)] transition-all duration-200 cursor-pointer group flex flex-col justify-between"
                    >
                        <div>
                            <div className="w-11 h-11 bg-[#f3eeff] rounded-xl flex items-center justify-center mb-5 text-[#7530fb] group-hover:bg-[#7530fb] group-hover:text-white transition-all duration-200 shadow-2xs">
                                <ArrowLeftRight className="w-5 h-5" />
                            </div>
                            <h4 className="font-syne font-bold text-xl text-[#1e1535] mb-2.5">
                                Reverse Price Engine
                            </h4>
                            <p className="font-sans text-sm sm:text-base text-[#6b7280] leading-relaxed mb-6">
                                Input your desired net profit dollar amount, and we'll calculate the exact selling price needed.
                            </p>
                        </div>
                        <span className="text-[#7530fb] font-sans font-bold text-sm flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                            Try it out <ArrowRight className="w-4 h-4" />
                        </span>
                    </motion.div>

                    {/* Card 3 */}
                    <motion.div
                        whileHover={{ y: -4 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => onOpenCalculatorTab('calculator')}
                        id="utility-card-returns-tracker"
                        className="bg-[#f8f7ff] border border-[#ede9fe] rounded-2xl p-7 hover:shadow-[0_12px_30px_-5px_rgba(117,48,251,0.1)] transition-all duration-200 cursor-pointer group flex flex-col justify-between"
                    >
                        <div>
                            <div className="w-11 h-11 bg-[#f3eeff] rounded-xl flex items-center justify-center mb-5 text-[#7530fb] group-hover:bg-[#7530fb] group-hover:text-white transition-all duration-200 shadow-2xs">
                                <RotateCcw className="w-5 h-5" />
                            </div>
                            <h4 className="font-syne font-bold text-xl text-[#1e1535] mb-2.5">
                                Returns Impact Tracker
                            </h4>
                            <p className="font-sans text-sm sm:text-base text-[#6b7280] leading-relaxed mb-6">
                                Factor in your category's average return rate to see the true adjusted profitability of a listing.
                            </p>
                        </div>
                        <span className="text-[#7530fb] font-sans font-bold text-sm flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                            Try it out <ArrowRight className="w-4 h-4" />
                        </span>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

// ==========================================
// 5. SOCIAL PROOF & METRICS STRIP
// ==========================================

function SocialProof() {
    const metrics = [
        { value: "12k+", label: "Calculations Daily" },
        { value: "$2.4M", label: "Margin Optimized" },
        { value: "98%", label: "Pricing Accuracy" },
    ];

    const reviews = [
        {
            id: "review-1",
            quote: "The reverse price engine alone saved my business. I finally know exactly what to price items to hit my $15 minimum net per sale.",
            author: "Sarah J.",
            role: "Top Rated Seller",
            initials: "SJ",
            avatarBg: "bg-[#7530fb] text-white",
        },
        {
            id: "review-2",
            quote: "Caught a hidden fee issue on my international sales that was eating 5% of my margin. The global breakdown is incredible.",
            author: "Mike K.",
            role: "Cross-Border Retailer",
            initials: "MK",
            avatarBg: "bg-[#b8fa33] text-[#1e1535]",
        },
        {
            id: "review-3",
            quote: "The UI is so much cleaner than the spreadsheets I was using. Scenario modeling lets me bulk adjust prices safely.",
            author: "David L.",
            role: "Volume Reseller",
            initials: "DL",
            avatarBg: "bg-[#d0bcff] text-[#1e1535]",
        },
    ];

    return (
        <section id="social-proof-section" className="py-16 md:py-20 bg-[#1e1535] text-white border-y border-white/10 relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">

                {/* Top Metrics Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 text-center divide-y md:divide-y-0 md:divide-x divide-white/10">
                    {metrics.map((metric, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            className="py-4 md:py-0 md:px-6"
                        >
                            <div className="font-syne text-4xl sm:text-[44px] font-extrabold text-[#b8fa33] tracking-tight">
                                {metric.value}
                            </div>
                            <div className="text-gray-400 font-sans text-xs sm:text-sm mt-1.5 uppercase tracking-wider font-semibold">
                                {metric.label}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* 3 Review Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {reviews.map((rev, index) => (
                        <motion.div
                            key={rev.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.15 }}
                            id={rev.id}
                            className="bg-white/[0.06] hover:bg-white/[0.09] p-6 sm:p-7 rounded-2xl border border-white/10 backdrop-blur-xs transition-all duration-200 flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex text-[#d97706] mb-4 gap-1" aria-label="5 stars">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-[#d97706] stroke-none" />
                                    ))}
                                </div>
                                <p className="font-sans text-sm sm:text-base text-gray-200 italic leading-relaxed mb-6">
                                    "{rev.quote}"
                                </p>
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-syne font-bold text-xs ${rev.avatarBg}`}>
                                    {rev.initials}
                                </div>
                                <div className="text-xs sm:text-sm">
                                    <div className="font-sans font-bold text-white">{rev.author}</div>
                                    <div className="text-gray-400 font-sans">{rev.role}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
}

// ==========================================
// 6. MID-PAGE CTA CARD
// ==========================================

interface MidPageCtaProps {
    onOpenCalculator: () => void;
}

function MidPageCta({ onOpenCalculator }: MidPageCtaProps) {
    return (
        <section id="mid-page-cta" className="py-20 bg-[#f8f7ff] border-t border-[#ede9fe]/40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="bg-white border border-[#ede9fe] rounded-3xl p-8 sm:p-12 md:p-16 text-center shadow-[0_10px_35px_-5px_rgba(117,48,251,0.08)] max-w-4xl mx-auto relative overflow-hidden"
                >
                    <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#f3eeff] rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-[#b8fa33]/20 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f3eeff] text-[#7530fb] text-xs font-sans font-bold mb-4">
                            <Sparkles className="w-3.5 h-3.5" />
                            Instant Cloud Sync
                        </div>

                        <h2 className="font-syne text-2xl sm:text-3xl md:text-4xl font-bold text-[#1e1535] mb-4 tracking-tight">
                            Ready to take control of your margins?
                        </h2>

                        <p className="font-sans text-base sm:text-lg text-[#6b7280] mb-8 max-w-xl mx-auto leading-relaxed">
                            Stop leaving money on the table. Start using the industry's most accurate profit calculator today.
                        </p>

                        <button
                            id="mid-cta-launch-calculator"
                            onClick={onOpenCalculator}
                            className="bg-[#7530fb] hover:bg-[#5e1fd6] text-white font-sans text-base sm:text-lg font-bold py-4 px-10 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 inline-flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
                        >
                            Launch Profit Calculator Now
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

// ==========================================
// 7. FAQ SECTION
// ==========================================

function FaqSection() {
    const faqs: FaqItem[] = [
        {
            id: "faq-1",
            question: "Does it pull live marketplace fees?",
            answer: "Yes, our API syncs daily with major marketplaces to ensure fee percentages, caps, and promotional rates are 100% accurate."
        },
        {
            id: "faq-2",
            question: "Can I save my custom shipping rates?",
            answer: "Absolutely. You can build profiles for your standard box sizes and carrier rates to auto-fill calculations."
        },
        {
            id: "faq-3",
            question: "Does it calculate VAT for UK/EU?",
            answer: "Yes, full VAT and international tax calculations are supported for cross-border sellers."
        },
        {
            id: "faq-4",
            question: "Is there a bulk upload option?",
            answer: "Pro users can upload CSVs of their inventory to calculate optimal pricing for thousands of SKUs at once."
        }
    ];

    return (
        <section id="faq-section" className="py-20 bg-[#f8f7ff] border-t border-[#ede9fe]/40">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">

                <div className="text-center mb-12">
                    <h2 className="font-syne text-3xl sm:text-4xl font-bold text-[#1e1535] tracking-tight">
                        Everything You Need to Know
                    </h2>
                    <p className="font-sans text-base sm:text-lg text-[#6b7280] mt-2">
                        Common questions about the Profit Calculator.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    {faqs.map((faq) => (
                        <motion.div
                            key={faq.id}
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4 }}
                            id={faq.id}
                            className="bg-white border border-[#ede9fe] rounded-2xl p-6 shadow-xs hover:shadow-md hover:border-[#7530fb]/30 transition-all duration-200"
                        >
                            <h3 className="font-syne font-bold text-[#1e1535] text-base sm:text-lg mb-2.5 flex items-start gap-2.5">
                                <span className="w-2 h-2 rounded-full bg-[#7530fb] mt-2 shrink-0" />
                                {faq.question}
                            </h3>
                            <p className="font-sans text-sm text-[#6b7280] leading-relaxed pl-4.5">
                                {faq.answer}
                            </p>
                        </motion.div>
                    ))}
                </div>

            </div>
        </section>
    );
}

// ==========================================
// 8. CROSS-PROMOTION GRID
// ==========================================

interface CrossPromoProps {
    onExploreTool: (toolId: string) => void;
}

function CrossPromo({ onExploreTool }: CrossPromoProps) {
    const tools = [
        {
            id: "title-builder",
            title: "Title Builder",
            description: "Generate SEO-optimized listing titles based on actual search volume data.",
            icon: Type,
        },
        {
            id: "competitor-spy",
            title: "Competitor Spy",
            description: "Track competitor price changes and stock levels in real-time to win the buy box.",
            icon: Eye,
        },
        {
            id: "automated-feeds",
            title: "Automated Feeds",
            description: "Connect directly to your suppliers for automated inventory and cost updates.",
            icon: GitFork,
        },
    ];

    return (
        <section id="cross-promo-section" className="py-20 bg-white border-t border-[#ede9fe]/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">

                <div className="mb-12">
                    <h2 className="font-syne text-3xl sm:text-4xl font-bold text-[#1e1535] tracking-tight">
                        More Tools to Supercharge Your Store
                    </h2>
                    <p className="font-sans text-base sm:text-lg text-[#6b7280] mt-1.5">
                        Explore the full Reazify ecosystem.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                    {tools.map((tool) => {
                        const Icon = tool.icon;
                        return (
                            <motion.div
                                key={tool.id}
                                whileHover={{ y: -4 }}
                                transition={{ duration: 0.2 }}
                                onClick={() => onExploreTool(tool.id)}
                                id={`cross-tool-${tool.id}`}
                                className="block bg-[#f8f7ff] border border-[#ede9fe] rounded-2xl p-7 hover:border-[#7530fb] hover:shadow-[0_10px_25px_-5px_rgba(117,48,251,0.08)] transition-all duration-200 group cursor-pointer flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center gap-3.5 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-[#f3eeff] flex items-center justify-center text-[#7530fb] group-hover:bg-[#7530fb] group-hover:text-white transition-colors duration-200 shadow-2xs">
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <h4 className="font-syne font-bold text-lg sm:text-xl text-[#1e1535]">
                                            {tool.title}
                                        </h4>
                                    </div>
                                    <p className="font-sans text-sm sm:text-base text-[#6b7280] mb-6 leading-relaxed">
                                        {tool.description}
                                    </p>
                                </div>

                                <span className="text-[#7530fb] font-sans text-sm font-bold flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                                    Explore Tool <ArrowRight className="w-4 h-4" />
                                </span>
                            </motion.div>
                        );
                    })}
                </div>

            </div>
        </section>
    );
}

// ==========================================
// 9. BOTTOM CONVERSION BANNER
// ==========================================

interface BottomBannerProps {
    onStartFree: () => void;
}

function BottomBanner({ onStartFree }: BottomBannerProps) {
    return (
        <section
            id="bottom-conversion-banner"
            className="bg-[#7530fb] py-20 px-4 sm:px-6 md:px-8 relative overflow-hidden text-white"
        >
            <div className="absolute inset-0 opacity-20 pointer-events-none" aria-hidden="true">
                <svg height="100%" width="100%" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="90%" cy="10%" fill="none" opacity="0.3" r="300" stroke="#FFFFFF" strokeWidth="1" />
                    <circle cx="90%" cy="10%" fill="none" opacity="0.2" r="200" stroke="#FFFFFF" strokeWidth="1" />
                    <circle cx="90%" cy="10%" fill="none" opacity="0.4" r="100" stroke="#FFFFFF" strokeWidth="1" />
                </svg>
            </div>

            <div className="max-w-4xl mx-auto text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    <h2 className="font-syne text-3xl sm:text-4xl md:text-[48px] md:leading-[56px] font-bold text-white mb-6 tracking-tight">
                        Ready to maximize your margins?
                    </h2>

                    <p className="font-sans text-base sm:text-lg md:text-xl text-[#e9ddff] mb-8 max-w-2xl mx-auto leading-relaxed">
                        Join thousands of top sellers who rely on our precision calculator to eliminate guesswork and guarantee profit on every single sale.
                    </p>

                    <button
                        id="bottom-cta-start-free"
                        onClick={onStartFree}
                        className="bg-[#b8fa33] text-[#1e1535] hover:bg-[#a4e526] font-sans text-base sm:text-lg font-bold py-4 px-10 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.2)] transition-all duration-200 transform hover:-translate-y-1 inline-flex items-center gap-2 cursor-pointer"
                    >
                        <Zap className="w-5 h-5 fill-[#1e1535]" />
                        Start Calculating For Free
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </motion.div>
            </div>
        </section>
    );
}

// ==========================================
// 10. INTERACTIVE CALCULATION ENGINE MODAL
// ==========================================

interface CalculatorModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialTab?: CalculatorTab;
}

function CalculatorModal({
    isOpen,
    onClose,
    initialTab = 'calculator'
}: CalculatorModalProps) {
    const [activeTab, setActiveTab] = useState<CalculatorTab>(initialTab);
    const [copied, setCopied] = useState(false);

    // Form states for Standard Calculator
    const [soldPrice, setSoldPrice] = useState<number>(49.99);
    const [itemCost, setItemCost] = useState<number>(18.00);
    const [shippingCharged, setShippingCharged] = useState<number>(5.50);
    const [actualShipping, setActualShipping] = useState<number>(4.85);
    const [categoryIndex, setCategoryIndex] = useState<number>(0);
    const [hasEbayStore, setHasEbayStore] = useState<boolean>(true);
    const [promotedRate, setPromotedRate] = useState<number>(3.0);
    const [isInternational, setIsInternational] = useState<boolean>(false);
    const returnBufferPercent = 1.5;

    // Form states for Reverse Engine
    const [targetNetProfit, setTargetNetProfit] = useState<number>(20.00);
    const [reverseCost, setReverseCost] = useState<number>(15.00);
    const [reverseShippingCost, setReverseShippingCost] = useState<number>(5.00);

    // Form states for Best Offer
    const [originalPrice, setOriginalPrice] = useState<number>(59.99);
    const [buyerOffer, setBuyerOffer] = useState<number>(45.00);
    const [offerCost, setOfferCost] = useState<number>(18.00);

    // Form states for MAP Guard
    const [vendorMap, setVendorMap] = useState<number>(49.99);
    const [testedPrice, setTestedPrice] = useState<number>(44.99);

    // IDs for accessibility
    const standardCategorySelectId = useId();

    React.useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
        }
    }, [isOpen, initialTab]);

    if (!isOpen) return null;

    const selectedCat = EBAY_CATEGORIES[categoryIndex] || EBAY_CATEGORIES[0];
    const feeRate = hasEbayStore ? selectedCat.basicStoreFee : selectedCat.standardFee;

    const estimatedSalesTax = (soldPrice + shippingCharged) * 0.07;
    const grossTransaction = soldPrice + shippingCharged + estimatedSalesTax;
    const finalValueFee = (grossTransaction * feeRate) + 0.30;
    const adFee = (soldPrice * (promotedRate / 100));
    const internationalFee = isInternational ? (grossTransaction * 0.0165) : 0;
    const returnBuffer = soldPrice * (returnBufferPercent / 100);
    const totalFees = finalValueFee + adFee + internationalFee;
    const netProfit = (soldPrice + shippingCharged) - (itemCost + actualShipping + totalFees + returnBuffer);
    const totalRevenue = soldPrice + shippingCharged;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    const costBase = itemCost + actualShipping;
    const roiPercent = costBase > 0 ? (netProfit / costBase) * 100 : 0;

    let roiGrade = 'A+';
    let roiGradeColor = 'bg-[#b8fa33] text-[#1e1535]';
    if (roiPercent >= 100) {
        roiGrade = 'A+';
        roiGradeColor = 'bg-[#b8fa33] text-[#1e1535]';
    } else if (roiPercent >= 60) {
        roiGrade = 'A';
        roiGradeColor = 'bg-[#b8fa33] text-[#1e1535]';
    } else if (roiPercent >= 35) {
        roiGrade = 'B+';
        roiGradeColor = 'bg-[#7530fb] text-white';
    } else if (roiPercent >= 20) {
        roiGrade = 'B';
        roiGradeColor = 'bg-[#7530fb] text-white';
    } else if (roiPercent >= 10) {
        roiGrade = 'C';
        roiGradeColor = 'bg-amber-500 text-white';
    } else {
        roiGrade = 'D';
        roiGradeColor = 'bg-red-500 text-white';
    }

    const divisor = 1 - (feeRate * 1.07) - (promotedRate / 100) - (isInternational ? 0.0165 * 1.07 : 0) - (returnBufferPercent / 100);
    const breakEvenPrice = divisor > 0
        ? Math.max(0, (itemCost + actualShipping - shippingCharged + 0.30) / divisor)
        : 0;

    const safeFloorPrice = (divisor - 0.20) > 0
        ? Math.max(0, (itemCost + actualShipping - shippingCharged + 0.30) / (divisor - 0.20))
        : breakEvenPrice * 1.3;

    const sweetSpotPrice = safeFloorPrice * 1.22;

    const reverseDivisor = 1 - (feeRate * 1.07) - 0.03;
    const calculatedReversePrice = reverseDivisor > 0
        ? (targetNetProfit + reverseCost + reverseShippingCost + 0.30) / reverseDivisor
        : 0;

    const offerTotalRev = buyerOffer + shippingCharged;
    const offerGrossTx = offerTotalRev * 1.07;
    const offerFvf = (offerGrossTx * feeRate) + 0.30;
    const offerNetProfit = offerTotalRev - (offerCost + actualShipping + offerFvf + (buyerOffer * (promotedRate / 100)));
    const offerMargin = offerTotalRev > 0 ? (offerNetProfit / offerTotalRev) * 100 : 0;
    const discountPercent = originalPrice > 0 ? ((originalPrice - buyerOffer) / originalPrice) * 100 : 0;
    const recommendedCounter = Math.round((originalPrice + buyerOffer) / 2 * 100) / 100;

    const handleCopyBreakdown = () => {
        const summary = `eBay Profit Calculation Summary:\n- Item Price: $${soldPrice.toFixed(2)}\n- Item Cost: $${itemCost.toFixed(2)}\n- Net Profit: $${netProfit.toFixed(2)}\n- Margin: ${profitMargin.toFixed(1)}%\n- ROI: ${roiPercent.toFixed(1)}% (Grade: ${roiGrade})\n- Break-Even: $${breakEvenPrice.toFixed(2)}\n- Safe Floor: $${safeFloorPrice.toFixed(2)}`;
        navigator.clipboard.writeText(summary);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const loadPreset = (presetName: string) => {
        if (presetName === 'sneakers') {
            setSoldPrice(145.00);
            setItemCost(65.00);
            setShippingCharged(0);
            setActualShipping(12.50);
            setCategoryIndex(3);
            setPromotedRate(4.0);
        } else if (presetName === 'electronics') {
            setSoldPrice(289.00);
            setItemCost(150.00);
            setShippingCharged(14.99);
            setActualShipping(13.20);
            setCategoryIndex(1);
            setPromotedRate(2.5);
        } else if (presetName === 'cards') {
            setSoldPrice(42.50);
            setItemCost(12.00);
            setShippingCharged(4.50);
            setActualShipping(3.80);
            setCategoryIndex(4);
            setPromotedRate(5.0);
        } else {
            setSoldPrice(49.99);
            setItemCost(18.00);
            setShippingCharged(5.50);
            setActualShipping(4.85);
            setCategoryIndex(0);
            setPromotedRate(3.0);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-[#1e1535]/70 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ duration: 0.25 }}
                    className="bg-white border border-[#ede9fe] rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col relative z-10"
                >
                    {/* Header */}
                    <div className="bg-[#1e1535] text-white p-5 sm:p-6 flex items-center justify-between border-b border-white/10 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#7530fb] flex items-center justify-center text-white shadow-xs">
                                <Calculator className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-syne text-xl sm:text-2xl font-bold">
                                    eBay Precision Profit Engine
                                </h3>
                                <p className="text-gray-300 font-sans text-xs sm:text-sm">
                                    Live scenario modeling, break-even zones &amp; fee analysis
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                            aria-label="Close modal"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Sub-Navigation Tabs */}
                    <div className="bg-[#f8f7ff] border-b border-[#ede9fe] px-4 sm:px-6 pt-3 flex gap-2 overflow-x-auto shrink-0">
                        <button
                            onClick={() => setActiveTab('calculator')}
                            className={`pb-3 px-3.5 font-sans text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${activeTab === 'calculator'
                                ? 'border-[#7530fb] text-[#7530fb]'
                                : 'border-transparent text-[#6b7280] hover:text-[#1e1535]'
                                }`}
                        >
                            <Calculator className="w-4 h-4" />
                            Profit Calculator
                        </button>

                        <button
                            onClick={() => setActiveTab('reverse')}
                            className={`pb-3 px-3.5 font-sans text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${activeTab === 'reverse'
                                ? 'border-[#7530fb] text-[#7530fb]'
                                : 'border-transparent text-[#6b7280] hover:text-[#1e1535]'
                                }`}
                        >
                            <ArrowLeftRight className="w-4 h-4" />
                            Reverse Price Engine
                        </button>

                        <button
                            onClick={() => setActiveTab('best_offer')}
                            className={`pb-3 px-3.5 font-sans text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${activeTab === 'best_offer'
                                ? 'border-[#7530fb] text-[#7530fb]'
                                : 'border-transparent text-[#6b7280] hover:text-[#1e1535]'
                                }`}
                        >
                            <Tag className="w-4 h-4" />
                            Best Offer Tester
                        </button>

                        <button
                            onClick={() => setActiveTab('map_guard')}
                            className={`pb-3 px-3.5 font-sans text-sm font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${activeTab === 'map_guard'
                                ? 'border-[#7530fb] text-[#7530fb]'
                                : 'border-transparent text-[#6b7280] hover:text-[#1e1535]'
                                }`}
                        >
                            <ShieldCheck className="w-4 h-4" />
                            MAP Guard
                        </button>
                    </div>

                    {/* Modal Body */}
                    <div className="p-5 sm:p-7 overflow-y-auto flex-1 bg-[#f8f7ff]/50">

                        {/* TAB 1: STANDARD CALCULATOR */}
                        {activeTab === 'calculator' && (
                            <div className="space-y-6">
                                <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
                                    <span className="text-xs font-sans font-bold text-[#6b7280] uppercase tracking-wider">
                                        Quick Sample Presets:
                                    </span>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => loadPreset('sneakers')}
                                            className="px-2.5 py-1 text-xs font-sans font-semibold rounded-md bg-white border border-[#ede9fe] hover:border-[#7530fb] hover:text-[#7530fb] transition-colors cursor-pointer"
                                        >
                                            👟 Athletic Shoes ($145)
                                        </button>
                                        <button
                                            onClick={() => loadPreset('electronics')}
                                            className="px-2.5 py-1 text-xs font-sans font-semibold rounded-md bg-white border border-[#ede9fe] hover:border-[#7530fb] hover:text-[#7530fb] transition-colors cursor-pointer"
                                        >
                                            💻 Electronics ($289)
                                        </button>
                                        <button
                                            onClick={() => loadPreset('cards')}
                                            className="px-2.5 py-1 text-xs font-sans font-semibold rounded-md bg-white border border-[#ede9fe] hover:border-[#7530fb] hover:text-[#7530fb] transition-colors cursor-pointer"
                                        >
                                            🃏 Trading Cards ($42)
                                        </button>
                                        <button
                                            onClick={() => loadPreset('default')}
                                            className="px-2.5 py-1 text-xs font-sans font-semibold rounded-md bg-[#f3eeff] text-[#7530fb] hover:bg-[#7530fb] hover:text-white transition-colors cursor-pointer"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                                    {/* Left Column: Inputs */}
                                    <div className="lg:col-span-7 space-y-4">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="bg-white p-3.5 rounded-xl border border-[#ede9fe]">
                                                <label className="block text-xs font-sans font-bold text-[#1e1535] mb-1">
                                                    Item Sold Price ($)
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-sm">$</span>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={soldPrice}
                                                        onChange={(e) => setSoldPrice(parseFloat(e.target.value) || 0)}
                                                        className="w-full bg-[#f8f7ff] border border-[#ede9fe] focus:border-[#7530fb] focus:outline-none rounded-lg py-2 pl-7 pr-3 font-mono text-sm font-bold text-[#1e1535]"
                                                    />
                                                </div>
                                            </div>

                                            <div className="bg-white p-3.5 rounded-xl border border-[#ede9fe]">
                                                <label className="block text-xs font-sans font-bold text-[#1e1535] mb-1">
                                                    Item Cost / COGS ($)
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-sm">$</span>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={itemCost}
                                                        onChange={(e) => setItemCost(parseFloat(e.target.value) || 0)}
                                                        className="w-full bg-[#f8f7ff] border border-[#ede9fe] focus:border-[#7530fb] focus:outline-none rounded-lg py-2 pl-7 pr-3 font-mono text-sm font-bold text-[#1e1535]"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="bg-white p-3.5 rounded-xl border border-[#ede9fe]">
                                                <label className="block text-xs font-sans font-bold text-[#1e1535] mb-1">
                                                    Shipping Charged to Buyer ($)
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-sm">$</span>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={shippingCharged}
                                                        onChange={(e) => setShippingCharged(parseFloat(e.target.value) || 0)}
                                                        className="w-full bg-[#f8f7ff] border border-[#ede9fe] focus:border-[#7530fb] focus:outline-none rounded-lg py-2 pl-7 pr-3 font-mono text-sm font-bold text-[#1e1535]"
                                                    />
                                                </div>
                                            </div>

                                            <div className="bg-white p-3.5 rounded-xl border border-[#ede9fe]">
                                                <label className="block text-xs font-sans font-bold text-[#1e1535] mb-1">
                                                    Actual Carrier Shipping Cost ($)
                                                </label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-sm">$</span>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        value={actualShipping}
                                                        onChange={(e) => setActualShipping(parseFloat(e.target.value) || 0)}
                                                        className="w-full bg-[#f8f7ff] border border-[#ede9fe] focus:border-[#7530fb] focus:outline-none rounded-lg py-2 pl-7 pr-3 font-mono text-sm font-bold text-[#1e1535]"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white p-3.5 rounded-xl border border-[#ede9fe]">
                                            <label htmlFor={standardCategorySelectId} className="block text-xs font-sans font-bold text-[#1e1535] mb-1">
                                                eBay Category Fee Rate
                                            </label>
                                            <select
                                                id={standardCategorySelectId}
                                                value={categoryIndex}
                                                onChange={(e) => setCategoryIndex(parseInt(e.target.value))}
                                                className="w-full bg-[#f8f7ff] border border-[#ede9fe] focus:border-[#7530fb] focus:outline-none rounded-lg py-2 px-3 font-sans text-sm text-[#1e1535] font-medium"
                                            >
                                                {EBAY_CATEGORIES.map((cat, idx) => (
                                                    <option key={idx} value={idx}>
                                                        {cat.name} ({(feeRate * 100).toFixed(2)}%)
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="bg-white p-3.5 rounded-xl border border-[#ede9fe] space-y-3">
                                            <div className="flex items-center justify-between text-xs font-sans">
                                                <span className="font-bold text-[#1e1535]">Promoted Listings Ad Rate (%):</span>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="15"
                                                        step="0.5"
                                                        value={promotedRate}
                                                        onChange={(e) => setPromotedRate(parseFloat(e.target.value))}
                                                        className="w-28 accent-[#7530fb]"
                                                    />
                                                    <span className="font-mono font-bold text-[#7530fb] w-10 text-right">{promotedRate}%</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-2 border-t border-[#ede9fe]/60">
                                                <label className="flex items-center gap-2 cursor-pointer text-xs font-sans font-semibold text-[#1e1535]">
                                                    <input
                                                        type="checkbox"
                                                        checked={hasEbayStore}
                                                        onChange={(e) => setHasEbayStore(e.target.checked)}
                                                        className="rounded accent-[#7530fb] w-4 h-4"
                                                    />
                                                    eBay Store Subscription (Discounted FVF)
                                                </label>

                                                <label className="flex items-center gap-2 cursor-pointer text-xs font-sans font-semibold text-[#1e1535]">
                                                    <input
                                                        type="checkbox"
                                                        checked={isInternational}
                                                        onChange={(e) => setIsInternational(e.target.checked)}
                                                        className="rounded accent-[#7530fb] w-4 h-4"
                                                    />
                                                    International Buyer (+1.65%)
                                                </label>
                                            </div>
                                        </div>

                                    </div>

                                    {/* Right Column: Live Results */}
                                    <div className="lg:col-span-5 space-y-4">
                                        <div className="bg-white border border-[#ede9fe] rounded-2xl p-5 shadow-[0_4px_20px_-2px_rgba(117,48,251,0.1)]">
                                            <div className="flex justify-between items-center pb-3 border-b border-[#ede9fe]">
                                                <div>
                                                    <span className="text-xs font-sans font-bold text-[#6b7280] uppercase">
                                                        Net Profit
                                                    </span>
                                                    <div className={`font-sans text-3xl font-extrabold mt-0.5 ${netProfit >= 0 ? 'text-[#1e1535]' : 'text-red-500'}`}>
                                                        ${netProfit.toFixed(2)}
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <div className={`px-2.5 py-1 rounded-md text-xs font-bold inline-flex items-center gap-1 ${roiGradeColor}`}>
                                                        <Sparkles className="w-3 h-3" />
                                                        ROI {roiGrade} ({roiPercent.toFixed(0)}%)
                                                    </div>
                                                    <div className="text-xs text-[#6b7280] font-sans mt-1 font-semibold">
                                                        Margin: {profitMargin.toFixed(1)}%
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-3 space-y-2 text-xs font-sans">
                                                <div className="flex justify-between text-[#6b7280]">
                                                    <span>eBay Final Value Fee ({(feeRate * 100).toFixed(2)}%):</span>
                                                    <span className="font-mono text-red-500 font-semibold">-${finalValueFee.toFixed(2)}</span>
                                                </div>

                                                {promotedRate > 0 && (
                                                    <div className="flex justify-between text-[#6b7280]">
                                                        <span>Promoted Ad Fee ({promotedRate}%):</span>
                                                        <span className="font-mono text-red-500 font-semibold">-${adFee.toFixed(2)}</span>
                                                    </div>
                                                )}

                                                {isInternational && (
                                                    <div className="flex justify-between text-[#6b7280]">
                                                        <span>International Fee (1.65%):</span>
                                                        <span className="font-mono text-red-500 font-semibold">-${internationalFee.toFixed(2)}</span>
                                                    </div>
                                                )}

                                                <div className="flex justify-between text-[#6b7280]">
                                                    <span>Total Product &amp; Shipping Cost:</span>
                                                    <span className="font-mono text-[#1e1535] font-semibold">${costBase.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Pricing Logic Zones */}
                                        <div className="bg-white border border-[#ede9fe] rounded-2xl p-5 space-y-2.5">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-syne text-xs font-bold text-[#6b7280] uppercase tracking-wider">
                                                    Pricing Logic Zones
                                                </h4>
                                                <button
                                                    onClick={handleCopyBreakdown}
                                                    className="text-xs text-[#7530fb] hover:underline flex items-center gap-1 font-sans font-semibold cursor-pointer"
                                                >
                                                    {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                                                    {copied ? 'Copied' : 'Copy'}
                                                </button>
                                            </div>

                                            <div className="bg-[#f8f7ff] rounded-lg p-2.5 flex justify-between items-center border-l-4 border-red-500">
                                                <div>
                                                    <span className="font-sans text-xs font-bold block text-[#1e1535]">Break-even</span>
                                                    <span className="font-sans text-[11px] text-[#6b7280]">Covers all costs</span>
                                                </div>
                                                <span className="font-mono text-xs font-bold text-[#1e1535]">
                                                    ${breakEvenPrice.toFixed(2)}
                                                </span>
                                            </div>

                                            <div className="bg-[#f8f7ff] rounded-lg p-2.5 flex justify-between items-center border-l-4 border-[#7530fb]">
                                                <div>
                                                    <span className="font-sans text-xs font-bold block text-[#1e1535]">Safe Floor</span>
                                                    <span className="font-sans text-[11px] text-[#6b7280]">Minimum 20% margin</span>
                                                </div>
                                                <span className="font-mono text-xs font-bold text-[#1e1535]">
                                                    ${safeFloorPrice.toFixed(2)}
                                                </span>
                                            </div>

                                            <div className="bg-[#f8f7ff] rounded-lg p-2.5 flex justify-between items-center border-l-4 border-[#b8fa33]">
                                                <div>
                                                    <span className="font-sans text-xs font-bold block text-[#1e1535]">Sweet Spot</span>
                                                    <span className="font-sans text-[11px] text-[#6b7280]">Optimized for conversion</span>
                                                </div>
                                                <span className="font-mono text-sm font-extrabold text-[#7530fb]">
                                                    ${sweetSpotPrice.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>

                                    </div>

                                </div>

                            </div>
                        )}

                        {/* TAB 2: REVERSE PRICE ENGINE */}
                        {activeTab === 'reverse' && (
                            <div className="space-y-6">
                                <div className="bg-white border border-[#ede9fe] rounded-2xl p-6 shadow-xs">
                                    <h4 className="font-syne text-xl font-bold text-[#1e1535] mb-2">
                                        Reverse Price Engine
                                    </h4>
                                    <p className="font-sans text-sm text-[#6b7280] mb-6">
                                        Enter your desired dollar net profit, and we'll calculate the exact minimum listing price to quote on eBay.
                                    </p>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                        <div className="bg-[#f8f7ff] p-4 rounded-xl border border-[#ede9fe]">
                                            <label className="block text-xs font-sans font-bold text-[#1e1535] mb-1">
                                                Desired Net Profit ($)
                                            </label>
                                            <input
                                                type="number"
                                                value={targetNetProfit}
                                                onChange={(e) => setTargetNetProfit(parseFloat(e.target.value) || 0)}
                                                className="w-full bg-white border border-[#ede9fe] rounded-lg py-2 px-3 font-mono font-bold text-sm text-[#7530fb]"
                                            />
                                        </div>

                                        <div className="bg-[#f8f7ff] p-4 rounded-xl border border-[#ede9fe]">
                                            <label className="block text-xs font-sans font-bold text-[#1e1535] mb-1">
                                                Item Cost ($)
                                            </label>
                                            <input
                                                type="number"
                                                value={reverseCost}
                                                onChange={(e) => setReverseCost(parseFloat(e.target.value) || 0)}
                                                className="w-full bg-white border border-[#ede9fe] rounded-lg py-2 px-3 font-mono font-bold text-sm text-[#1e1535]"
                                            />
                                        </div>

                                        <div className="bg-[#f8f7ff] p-4 rounded-xl border border-[#ede9fe]">
                                            <label className="block text-xs font-sans font-bold text-[#1e1535] mb-1">
                                                Shipping Out ($)
                                            </label>
                                            <input
                                                type="number"
                                                value={reverseShippingCost}
                                                onChange={(e) => setReverseShippingCost(parseFloat(e.target.value) || 0)}
                                                className="w-full bg-white border border-[#ede9fe] rounded-lg py-2 px-3 font-mono font-bold text-sm text-[#1e1535]"
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-[#1e1535] text-white p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div>
                                            <span className="text-xs font-sans text-gray-300 uppercase tracking-wider font-semibold">
                                                Required Listing Price:
                                            </span>
                                            <div className="font-mono text-3xl sm:text-4xl font-extrabold text-[#b8fa33] mt-1">
                                                ${calculatedReversePrice.toFixed(2)}
                                            </div>
                                            <span className="text-xs text-gray-400 font-sans">
                                                Guarantees ${targetNetProfit.toFixed(2)} net in pocket after eBay final fees.
                                            </span>
                                        </div>

                                        <button
                                            onClick={() => {
                                                setSoldPrice(Math.round(calculatedReversePrice * 100) / 100);
                                                setItemCost(reverseCost);
                                                setActualShipping(reverseShippingCost);
                                                setActiveTab('calculator');
                                            }}
                                            className="bg-[#7530fb] hover:bg-[#5e1fd6] text-white font-sans text-sm font-bold py-3 px-6 rounded-xl transition-colors cursor-pointer shrink-0"
                                        >
                                            Apply to Calculator →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 3: BEST OFFER TESTER */}
                        {activeTab === 'best_offer' && (
                            <div className="space-y-6">
                                <div className="bg-white border border-[#ede9fe] rounded-2xl p-6 shadow-xs">
                                    <h4 className="font-syne text-xl font-bold text-[#1e1535] mb-2">
                                        Best Offer Threshold Tester
                                    </h4>
                                    <p className="font-sans text-sm text-[#6b7280] mb-6">
                                        Test incoming buyer offers before accepting, rejecting, or counter-offering.
                                    </p>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                        <div className="bg-[#f8f7ff] p-4 rounded-xl border border-[#ede9fe]">
                                            <label className="block text-xs font-sans font-bold text-[#1e1535] mb-1">
                                                Original Listing Price ($)
                                            </label>
                                            <input
                                                type="number"
                                                value={originalPrice}
                                                onChange={(e) => setOriginalPrice(parseFloat(e.target.value) || 0)}
                                                className="w-full bg-white border border-[#ede9fe] rounded-lg py-2 px-3 font-mono font-bold text-sm text-[#1e1535]"
                                            />
                                        </div>

                                        <div className="bg-[#f8f7ff] p-4 rounded-xl border border-[#ede9fe]">
                                            <label className="block text-xs font-sans font-bold text-[#1e1535] mb-1">
                                                Buyer Offer Amount ($)
                                            </label>
                                            <input
                                                type="number"
                                                value={buyerOffer}
                                                onChange={(e) => setBuyerOffer(parseFloat(e.target.value) || 0)}
                                                className="w-full bg-white border border-[#ede9fe] rounded-lg py-2 px-3 font-mono font-bold text-sm text-[#7530fb]"
                                            />
                                        </div>

                                        <div className="bg-[#f8f7ff] p-4 rounded-xl border border-[#ede9fe]">
                                            <label className="block text-xs font-sans font-bold text-[#1e1535] mb-1">
                                                Item Cost ($)
                                            </label>
                                            <input
                                                type="number"
                                                value={offerCost}
                                                onChange={(e) => setOfferCost(parseFloat(e.target.value) || 0)}
                                                className="w-full bg-white border border-[#ede9fe] rounded-lg py-2 px-3 font-mono font-bold text-sm text-[#1e1535]"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="p-4 bg-[#f8f7ff] rounded-xl border border-[#ede9fe]">
                                            <span className="text-xs text-[#6b7280] font-sans">Discount Given:</span>
                                            <div className="font-mono text-xl font-bold text-[#1e1535] mt-1">
                                                {discountPercent.toFixed(1)}% OFF
                                            </div>
                                        </div>

                                        <div className="p-4 bg-[#f8f7ff] rounded-xl border border-[#ede9fe]">
                                            <span className="text-xs text-[#6b7280] font-sans">Profit if Accepted:</span>
                                            <div className={`font-mono text-xl font-bold mt-1 ${offerNetProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                ${offerNetProfit.toFixed(2)} ({offerMargin.toFixed(1)}%)
                                            </div>
                                        </div>

                                        <div className="p-4 bg-[#f3eeff] rounded-xl border border-[#ede9fe]">
                                            <span className="text-xs text-[#7530fb] font-sans font-bold">Suggested Counter:</span>
                                            <div className="font-mono text-xl font-bold text-[#7530fb] mt-1">
                                                ${recommendedCounter.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB 4: MAP GUARD */}
                        {activeTab === 'map_guard' && (
                            <div className="space-y-6">
                                <div className="bg-white border border-[#ede9fe] rounded-2xl p-6 shadow-xs">
                                    <h4 className="font-syne text-xl font-bold text-[#1e1535] mb-2">
                                        Minimum Advertised Price (MAP) Safety Guard
                                    </h4>
                                    <p className="font-sans text-sm text-[#6b7280] mb-6">
                                        Verify compliance with brand agreements to protect supplier accounts from automatic suspension.
                                    </p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                        <div className="bg-[#f8f7ff] p-4 rounded-xl border border-[#ede9fe]">
                                            <label className="block text-xs font-sans font-bold text-[#1e1535] mb-1">
                                                Vendor Minimum MAP ($)
                                            </label>
                                            <input
                                                type="number"
                                                value={vendorMap}
                                                onChange={(e) => setVendorMap(parseFloat(e.target.value) || 0)}
                                                className="w-full bg-white border border-[#ede9fe] rounded-lg py-2 px-3 font-mono font-bold text-sm text-[#1e1535]"
                                            />
                                        </div>

                                        <div className="bg-[#f8f7ff] p-4 rounded-xl border border-[#ede9fe]">
                                            <label className="block text-xs font-sans font-bold text-[#1e1535] mb-1">
                                                Your Proposed Listing Price ($)
                                            </label>
                                            <input
                                                type="number"
                                                value={testedPrice}
                                                onChange={(e) => setTestedPrice(parseFloat(e.target.value) || 0)}
                                                className="w-full bg-white border border-[#ede9fe] rounded-lg py-2 px-3 font-mono font-bold text-sm text-[#1e1535]"
                                            />
                                        </div>
                                    </div>

                                    {testedPrice < vendorMap ? (
                                        <div className="bg-red-50 border border-red-200 text-red-900 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                                            <div className="flex items-start gap-3">
                                                <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                                                <div>
                                                    <h5 className="font-syne font-bold text-base text-red-900">
                                                        MAP Violation Detected (${(vendorMap - testedPrice).toFixed(2)} Below Minimum)
                                                    </h5>
                                                    <p className="text-xs text-red-700 font-sans mt-0.5">
                                                        Publishing at ${testedPrice.toFixed(2)} risks MAP vendor sanction and losing wholesale distribution.
                                                    </p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => setTestedPrice(vendorMap)}
                                                className="bg-red-600 hover:bg-red-700 text-white font-sans text-xs font-bold py-2.5 px-5 rounded-xl transition-colors cursor-pointer shrink-0"
                                            >
                                                Adjust to ${vendorMap.toFixed(2)}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="bg-green-50 border border-green-200 text-green-900 p-5 rounded-2xl flex items-center gap-3">
                                            <ShieldCheck className="w-6 h-6 text-green-600 shrink-0" />
                                            <div>
                                                <h5 className="font-syne font-bold text-base text-green-900">
                                                    MAP Compliant Safe Floor
                                                </h5>
                                                <p className="text-xs text-green-700 font-sans mt-0.5">
                                                    Price is ${(testedPrice - vendorMap).toFixed(2)} above vendor floor. Safe to list.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Footer */}
                    <div className="bg-white border-t border-[#ede9fe] p-4 px-6 flex items-center justify-between shrink-0">
                        <span className="text-xs text-[#6b7280] font-sans hidden sm:inline">
                            Riazify v2.0 • Real-time fee calculations synced daily
                        </span>
                        <button
                            onClick={onClose}
                            className="w-full sm:w-auto bg-[#7530fb] hover:bg-[#5e1fd6] text-white font-sans text-sm font-bold py-2.5 px-6 rounded-lg transition-colors cursor-pointer"
                        >
                            Done &amp; Close
                        </button>
                    </div>

                </motion.div>
            </div>
        </AnimatePresence>
    );
}

// ==========================================
// 11. CROSS TOOL PREVIEW MODAL
// ==========================================

interface CrossToolModalProps {
    toolId: string | null;
    onClose: () => void;
    onOpenCalculator: () => void;
}

function CrossToolModal({
    toolId,
    onClose,
    onOpenCalculator
}: CrossToolModalProps) {
    const [keywordInput, setKeywordInput] = useState('Nike Dunk Low Retro Panda Size 10.5');
    const [generatedTitle, setGeneratedTitle] = useState('Nike Dunk Low Retro Panda Black White DD1391-100 Mens Size 10.5 New In Box');
    const [copied, setCopied] = useState(false);

    if (!toolId) return null;

    const handleGenerateTitle = () => {
        if (!keywordInput.trim()) return;
        setGeneratedTitle(`${keywordInput.trim()} Authentic Vintage Men's Athletic Condition Verified Free Express Shipping`);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedTitle);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-[#1e1535]/70 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    transition={{ duration: 0.25 }}
                    className="bg-white border border-[#ede9fe] rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col relative z-10"
                >
                    {/* Header */}
                    <div className="bg-[#1e1535] text-white p-5 sm:p-6 flex items-center justify-between border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#7530fb] flex items-center justify-center text-white">
                                {toolId === 'title-builder' && <Type className="w-5 h-5" />}
                                {toolId === 'competitor-spy' && <Eye className="w-5 h-5" />}
                                {toolId === 'automated-feeds' && <GitFork className="w-5 h-5" />}
                            </div>
                            <div>
                                <h3 className="font-syne text-xl font-bold">
                                    {toolId === 'title-builder' && 'Reazify Title Builder'}
                                    {toolId === 'competitor-spy' && 'Reazify Competitor Spy'}
                                    {toolId === 'automated-feeds' && 'Reazify Automated Feeds'}
                                </h3>
                                <p className="text-gray-300 font-sans text-xs">
                                    {toolId === 'title-builder' && 'SEO-optimized 80-character title generator for eBay algorithms'}
                                    {toolId === 'competitor-spy' && 'Real-time buy-box & competitor pricing radar'}
                                    {toolId === 'automated-feeds' && 'Direct EDI & CSV inventory synchronizer'}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 sm:p-8 space-y-6 bg-[#f8f7ff]/50">
                        {toolId === 'title-builder' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-sans font-bold text-[#1e1535] mb-1.5">
                                        Enter Raw Product Keywords / Brand / Model:
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={keywordInput}
                                            onChange={(e) => setKeywordInput(e.target.value)}
                                            className="flex-1 bg-white border border-[#ede9fe] focus:border-[#7530fb] rounded-xl px-4 py-2.5 font-sans text-sm font-medium text-[#1e1535] focus:outline-none"
                                        />
                                        <button
                                            onClick={handleGenerateTitle}
                                            className="bg-[#7530fb] hover:bg-[#5e1fd6] text-white px-4 py-2.5 rounded-xl font-sans text-sm font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                                        >
                                            <Sparkles className="w-4 h-4" />
                                            Optimize
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-white border border-[#ede9fe] rounded-2xl p-5 shadow-xs space-y-2.5">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="font-sans font-bold text-[#6b7280] uppercase">
                                            Optimized eBay Title ({generatedTitle.length}/80 chars)
                                        </span>
                                        <span className="font-mono text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                                            SEO Score: 96/100
                                        </span>
                                    </div>

                                    <p className="font-mono text-sm font-semibold text-[#1e1535] bg-[#f8f7ff] p-3 rounded-lg border border-[#ede9fe]">
                                        {generatedTitle}
                                    </p>

                                    <button
                                        onClick={handleCopy}
                                        className="text-xs text-[#7530fb] font-sans font-bold flex items-center gap-1 hover:underline cursor-pointer pt-1"
                                    >
                                        {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                                        {copied ? 'Copied to Clipboard!' : 'Copy Title'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {toolId === 'competitor-spy' && (
                            <div className="space-y-4">
                                <div className="bg-white border border-[#ede9fe] rounded-2xl p-5 shadow-xs space-y-3">
                                    <h4 className="font-syne font-bold text-base text-[#1e1535]">
                                        Active Competitor Price Monitoring
                                    </h4>

                                    <div className="space-y-2.5">
                                        <div className="flex justify-between items-center p-3 bg-[#f8f7ff] rounded-xl border border-[#ede9fe]">
                                            <div>
                                                <div className="font-sans text-sm font-bold text-[#1e1535]">Competitor: TopResellStore</div>
                                                <div className="text-xs text-[#6b7280]">Current listing price • Free 2-day shipping</div>
                                            </div>
                                            <span className="font-mono font-bold text-red-500 text-sm">$48.90</span>
                                        </div>

                                        <div className="flex justify-between items-center p-3 bg-[#f3eeff] rounded-xl border border-[#ede9fe]">
                                            <div>
                                                <div className="font-sans text-sm font-bold text-[#7530fb]">Your Suggested Buy-Box Target</div>
                                                <div className="text-xs text-[#6b7280]">Undercuts by $0.40 while preserving 22% ROI</div>
                                            </div>
                                            <span className="font-mono font-bold text-[#7530fb] text-base">$48.50</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {toolId === 'automated-feeds' && (
                            <div className="space-y-4">
                                <div className="bg-white border border-[#ede9fe] rounded-2xl p-5 shadow-xs space-y-3">
                                    <h4 className="font-syne font-bold text-base text-[#1e1535]">
                                        Supplier Inventory Feed Sync
                                    </h4>
                                    <p className="text-xs font-sans text-[#6b7280]">
                                        Connect your wholesale distributors to auto-pause eBay listings when vendor stock reaches zero.
                                    </p>
                                    <div className="p-4 bg-[#f8f7ff] rounded-xl border border-dashed border-[#ede9fe] text-center space-y-2">
                                        <div className="text-xs font-mono text-[#7530fb] font-semibold">
                                            API Webhook Ready • 14 Distributors Supported
                                        </div>
                                        <div className="text-xs text-[#6b7280]">
                                            D&amp;H, Synnex, Ingram Micro, Liquidation.com, Doba
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="bg-white border-t border-[#ede9fe] p-4 px-6 flex items-center justify-between">
                        <button
                            onClick={() => {
                                onClose();
                                onOpenCalculator();
                            }}
                            className="text-xs font-sans font-bold text-[#7530fb] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                            Open Profit Calculator <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={onClose}
                            className="bg-[#1e1535] hover:bg-[#2d214d] text-white text-xs font-sans font-bold py-2 px-4 rounded-lg transition-colors cursor-pointer"
                        >
                            Close
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

// ==========================================
// MAIN APP COMPONENT (EXPORTED FOR NEXT.JS)
// ==========================================

export default function ProfitCalculatorPage() {
    const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);
    const [calculatorTab, setCalculatorTab] = useState<CalculatorTab>('calculator');
    const [activeCrossTool, setActiveCrossTool] = useState<string | null>(null);

    const handleOpenCalculator = (tab: CalculatorTab = 'calculator') => {
        setCalculatorTab(tab);
        setIsCalculatorOpen(true);
    };

    const handleCloseCalculator = () => {
        setIsCalculatorOpen(false);
    };

    const handleExploreTool = (toolId: string) => {
        setActiveCrossTool(toolId);
    };

    const handleCloseCrossTool = () => {
        setActiveCrossTool(null);
    };

    return (
        <div className="min-h-screen bg-[#f8f7ff] text-[#1f1d2e] font-sans selection:bg-[#b8fa33] selection:text-[#1e1535] overflow-x-hidden flex flex-col">

            {/* Global Navbar */}
            <Navbar />

            {/* Main Page Content */}
            <main className="flex-grow">
                {/* 1. Hero Section */}
                <HeroSection
                    onOpenCalculator={handleOpenCalculator}
                    onOpenDemo={() => handleOpenCalculator('calculator')}
                />

                {/* 2. Core Feature Grid */}
                <CoreFeatures
                    onSelectFeature={(feat) => {
                        if (feat === 'global_fees') handleOpenCalculator('calculator');
                        else if (feat === 'price_optimizer') handleOpenCalculator('reverse');
                        else handleOpenCalculator('calculator');
                    }}
                />

                {/* 3. SEO Content & Feature Deep-Dive */}
                <SeoDeepDive
                    onOpenMapGuardDemo={() => handleOpenCalculator('map_guard')}
                    onOpenRoiDemo={() => handleOpenCalculator('calculator')}
                />

                {/* 4. Interactive Utility Feature Cards */}
                <UtilityCards
                    onOpenCalculatorTab={handleOpenCalculator}
                />

                {/* 5. Social Proof & Metrics Strip */}
                <SocialProof />

                {/* 6. Mid-Page Conversion Card */}
                <MidPageCta
                    onOpenCalculator={() => handleOpenCalculator('calculator')}
                />

                {/* 7. FAQ Accordion Section */}
                <FaqSection />

                {/* 8. Cross-Promotion Grid */}
                <CrossPromo
                    onExploreTool={handleExploreTool}
                />

                {/* 9. Bottom Conversion Banner */}
                <BottomBanner
                    onStartFree={() => handleOpenCalculator('calculator')}
                />
            </main>

            {/* Interactive Calculation Engine Modal */}
            <CalculatorModal
                isOpen={isCalculatorOpen}
                onClose={handleCloseCalculator}
                initialTab={calculatorTab}
            />

            {/* Cross-Tool Preview Modal */}
            <CrossToolModal
                toolId={activeCrossTool}
                onClose={handleCloseCrossTool}
                onOpenCalculator={() => handleOpenCalculator('calculator')}
            />

            {/* Global Footer */}
            <Footer />

        </div>
    );
}
