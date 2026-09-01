import React from 'react';
import Link from 'next/link';
import {
    Search,
    Radio,
    Package,
    Palette,
    Boxes,
    Sparkles,
    Calculator,
    Receipt,
    Code2,
    Zap,
    ArrowRight,
    type LucideIcon,
} from 'lucide-react';

export interface ToolItem {
    id: string;
    name: string;
    description: string;
    href: string;
    icon: LucideIcon;
    badge?: string;
}

export interface ToolsMegaMenuProps {
    onItemClick?: (toolName: string) => void;
    className?: string;
}

const CORE_APPS: ToolItem[] = [
    {
        id: 'tool-product-research',
        name: 'Product Research',
        description: 'Discover high-margin winning products to sell.',
        href: '#product-research',
        icon: Search,
    },
    {
        id: 'tool-competitor-xray',
        name: 'Competitor X-Ray',
        description: 'Analyze top sellers and reveal hidden strategies.',
        href: '#competitor-xray',
        icon: Radio,
    },
    {
        id: 'tool-orders-manager',
        name: 'Orders Manager',
        description: 'Centralize tracking and streamline fulfillment.',
        href: '#orders-manager',
        icon: Package,
    },
    {
        id: 'tool-inventory-manager',
        name: 'Inventory Manager',
        description: 'Smart stock alerts and automated syncing.',
        href: '#inventory-manager',
        icon: Boxes,
    },
];

const FREE_TOOLS: ToolItem[] = [
    {
        id: 'tool-title-builder-free',
        name: 'Title Builder',
        description: 'AI-driven title optimization tool.',
        href: '/tools/title-builder',
        icon: Sparkles,
        badge: 'FREE',
    },
    {
        id: 'tool-profit-calculator',
        name: 'Profit Calculator',
        description: 'Calculate true margins with complex fee logic.',
        href: '/tools/profitcalculator',
        icon: Calculator,
        badge: 'FREE'
    },
    {
        id: 'tool-ebay-fee-calculator',
        name: 'eBay Fee Calculator',
        description: 'Instant breakdown of marketplace fees.',
        href: '#ebay-fee-calculator',
        icon: Receipt,
        badge: 'FREE'
    },
    {
        id: 'tool-html-listing-generator',
        name: 'HTML Listing Generator',
        description: 'Create beautiful responsive descriptions.',
        href: '#html-listing-generator',
        icon: Code2,
    },
    {
        id: 'tool-templates-studio',
        name: 'Templates Studio',
        description: 'Suite for Custom HTML, AI, and Drag-&-Drop builders.',
        href: '/tools/templates-studio',
        icon: Palette,
        badge: 'NEW',
    },
];

export default function ToolsMegaMenu({ onItemClick, className = '' }: ToolsMegaMenuProps) {
    const handleItemClick = (e: React.MouseEvent | React.KeyboardEvent, toolName: string) => {
        // Only call callback if supplied, otherwise allow default link navigation
        if (onItemClick) {
            e.preventDefault();
            onItemClick(toolName);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, toolName: string) => {
        if (e.key === 'Enter' || e.key === ' ') {
            handleItemClick(e, toolName);
        }
    };

    const renderToolLink = (item: ToolItem) => {
        const Icon = item.icon;
        return (
            <Link
                key={item.id}
                id={item.id}
                href={item.href}
                onClick={() => onItemClick?.(item.name)}
                className="group flex items-start gap-3 p-2.5 rounded-xl transition-all duration-150 hover:bg-[#f3eeff] border border-transparent hover:border-[#ede9fe] cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#7530fb]/30"
            >
                <div className="w-9 h-9 shrink-0 bg-[#f3eeff] group-hover:bg-white text-[#7530fb] rounded-lg flex items-center justify-center transition-all duration-200 group-hover:scale-105 shadow-xs">
                    <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1 pr-0.5">
                    <div className="flex items-center justify-between gap-1.5">
                        <h5 className="text-[#1f1d2e] group-hover:text-[#7530fb] text-[13px] font-bold leading-snug transition-colors">
                            {item.name}
                        </h5>
                        {item.badge && (
                            <span className="bg-[#b8fa33] text-[#1e1535] text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                                {item.badge}
                            </span>
                        )}
                    </div>
                    <p className="text-[#6b7280] text-[11px] leading-snug mt-0.5">
                        {item.description}
                    </p>
                </div>
            </Link>
        );
    };

    return (
        <div
            id="tools-mega-menu"
            role="menu"
            aria-label="Tools Navigation Menu"
            className={`w-[840px] bg-[#ffffff] border border-[#ede9fe] rounded-3xl shadow-[0_20px_40px_-10px_rgba(117,48,251,0.12)] p-5 relative font-sans text-[#1f1d2e] select-none ${className}`}
        >
            {/* 3-Column Grid Container */}
            <div className="grid grid-cols-12 gap-5 items-stretch">

                {/* 1. LEFT SPOTLIGHT CARD */}
                <div
                    id="spotlight-tool-card"
                    className="col-span-4 w-[250px] bg-[#1e1535] rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group shadow-sm shrink-0"
                >
                    {/* Ambient Glows */}
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-[#7530fb] rounded-full blur-3xl opacity-25 group-hover:opacity-45 transition-opacity duration-500 pointer-events-none" />
                    <div className="absolute -left-10 -bottom-10 w-36 h-36 bg-[#b8fa33] rounded-full blur-3xl opacity-15 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none" />

                    {/* Top Section */}
                    <div className="relative z-15">
                        <div className="inline-flex items-center bg-[#b8fa33] text-[#1e1535] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs mb-4">
                            SPOTLIGHT TOOL
                        </div>

                        <h3 className="text-white text-lg font-bold tracking-tight mb-2 font-['Syne',sans-serif]">
                            Title Builder AI
                        </h3>

                        <p className="text-[#a89cc8] text-xs leading-relaxed mb-4">
                            Generate high-converting, VeRO-safe eBay titles engineered by precise AI logic.
                        </p>

                        <div className="inline-flex items-center gap-1.5 bg-[#b8fa33]/15 border border-[#b8fa33]/25 px-2.5 py-1 rounded-lg backdrop-blur-xs">
                            <Zap className="w-3.5 h-3.5 text-[#b8fa33] fill-[#b8fa33] shrink-0" />
                            <span className="text-[#b8fa33] text-[11px] font-bold tracking-tight whitespace-nowrap">
                                +34% Impressions
                            </span>
                        </div>
                    </div>

                    {/* Bottom CTA Button */}
                    <div className="relative z-15 mt-6">
                        <button
                            id="btn-try-title-builder"
                            type="button"
                            onClick={(e) => handleItemClick(e, 'Title Builder AI (Spotlight)')}
                            className="w-full bg-[#b8fa33] hover:bg-[#a8ec28] active:scale-[0.98] text-[#1e1535] font-bold text-[12px] py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all duration-200 shadow-sm cursor-pointer"
                        >
                            <span>Try Title Builder</span>
                            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 shrink-0" />
                        </button>
                    </div>
                </div>

                {/* 2. CENTER COLUMN: CORE APPS */}
                <nav id="core-apps-column" aria-label="Core Apps" className="col-span-4 flex flex-col justify-between py-1">
                    <div>
                        <h4 className="text-[#6b7280] text-[10px] font-bold tracking-widest uppercase mb-2 px-2">
                            CORE APPS (PRO)
                        </h4>
                        <div className="flex flex-col space-y-1">
                            {CORE_APPS.map(renderToolLink)}
                        </div>
                    </div>
                </nav>

                {/* 3. RIGHT COLUMN: FREE LEAD TOOLS */}
                <nav id="free-lead-tools-column" aria-label="Free Tools" className="col-span-4 flex flex-col justify-between py-1">
                    <div>
                        <h4 className="text-[#6b7280] text-[10px] font-bold tracking-widest uppercase mb-2 px-2">
                            FREE LEAD TOOLS
                        </h4>
                        <div className="flex flex-col space-y-1">
                            {FREE_TOOLS.map(renderToolLink)}
                        </div>
                    </div>
                </nav>

            </div>

            {/* 4. BOTTOM UTILITY BAR */}
            <div
                id="mega-menu-utility-bar"
                className="w-full border-t border-[#ede9fe] mt-3 pt-3 px-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
            >
                <p className="text-[#6b7280] text-xs">
                    Need custom API access or enterprise setup?
                </p>
                <a
                    id="link-explore-all-features"
                    href="#explore-all-features"
                    onClick={(e) => handleItemClick(e, 'Explore All Features')}
                    onKeyDown={(e) => handleKeyDown(e, 'Explore All Features')}
                    className="text-[#7530fb] hover:text-[#5c00da] text-xs font-bold flex items-center gap-1.5 transition-all group/link cursor-pointer focus:outline-hidden"
                >
                    <span>Explore All Features</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/link:translate-x-1" />
                </a>
            </div>
        </div>
    );
}
