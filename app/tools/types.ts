export interface Review {
    id: string;
    quote: string;
    author: string;
    role: string;
    avatar: string;
    avatarBg: string;
    avatarText: string;
    stars: number;
}

export interface FaqItem {
    id: string;
    question: string;
    answer: string;
}

export interface ToolItem {
    id: string;
    title: string;
    description: string;
    iconName: string;
    linkText: string;
}

export interface CalculationState {
    soldPrice: number;
    itemCost: number;
    shippingCharged: number;
    actualShipping: number;
    categoryFeeRate: number; // e.g. 0.1325 for 13.25%
    categoryName: string;
    storeSubscription: 'none' | 'basic' | 'premium' | 'anchor';
    promotedAdRate: number; // percentage, e.g. 3%
    isInternational: boolean;
    internationalFeeRate: number; // e.g. 1.65%
    returnRateBuffer: number; // e.g. 2%
    salesTaxEstimateRate: number; // e.g. 7% for buyer sales tax on which FVF is calculated
}

export type CalculatorTab = 'calculator' | 'reverse' | 'best_offer' | 'map_guard';
