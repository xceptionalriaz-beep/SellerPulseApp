'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  RotateCcw,
  ArrowRight,
  Globe,
  Sliders,
  Share2,
  CheckCircle2,
  ShieldAlert,
  Tag,
  ArrowLeftRight,
  ShoppingCart,
  Building2,
  Star,
  Type,
  Eye,
  RefreshCw,
} from 'lucide-react';
import Navbar from '../../../components/landing/Navbar';
import Footer from '../../../components/landing/Footer';

export default function ProfitCalculatorLandingPage() {
  const router = useRouter();

  const openFullCalculator = () => {
    router.push('/dashboard/tools/profit-calculator');
  };

  return (
    <div className="min-h-screen bg-[#f8f7ff] text-[#1f1d2e] font-sans antialiased selection:bg-[#7530FB]/20 selection:text-[#7530FB]">
      <Navbar />
      <main className="overflow-hidden">
        {/* HERO SECTION */}
        <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-28 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f3eeff] border border-[#ede9fe] text-[#7530FB] text-xs font-bold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-[#7530FB] animate-pulse"></span>
              <span>New: Advanced Scenario Modeling</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1f1d2e] leading-[1.08]">
              Know Your Numbers.
              <span className="block text-[#7530FB] mt-1">Grow Your Margins.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#6b7280] leading-relaxed max-w-2xl mx-auto">
              Stop guessing your true profit. Our precision pricing logic and real-time ROI tracking ensure every sale contributes to your bottom line, factoring in fees, costs, and market volatility.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <button
                id="hero-calculate-btn"
                onClick={() => openFullCalculator()}
                className="bg-[#7530FB] hover:bg-[#6020e0] text-white font-bold text-base px-6 py-3.5 rounded-lg shadow-sm hover:shadow transition flex items-center gap-2 cursor-pointer group"
              >
                <span>Calculate Profit Now</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                id="hero-demo-btn"
                onClick={() => openFullCalculator()}
                className="bg-white hover:bg-[#f3eeff] border border-[#ede9fe] text-[#1f1d2e] font-bold text-base px-5 py-3.5 rounded-lg transition flex items-center gap-2 cursor-pointer"
              >
                <span>View Demo</span>
                <RotateCcw className="w-4 h-4 text-[#6b7280]" />
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 1: PRECISION ENGINEERING FOR YOUR PRICING */}
        <section id="features" className="py-16 bg-white border-y border-[#ede9fe]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1f1d2e] tracking-tight">
                Precision Engineering for Your Pricing
              </h2>
              <p className="text-base sm:text-lg text-[#6b7280] mt-2">
                Calculate costs down to the penny across multiple platforms and scenarios.
              </p>
            </div>

            {/* 3 Grid Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1: Global Fee Analysis */}
              <div
                id="feature-card-global-fee"
                className="bg-[#f8f7ff] border border-[#ede9fe] rounded-2xl p-7 hover:border-[#7530FB]/40 transition hover:shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-[#f3eeff] text-[#7530FB] flex items-center justify-center mb-6 shadow-xs">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-xl text-[#1f1d2e] mb-3">Global Fee Analysis</h3>
                <p className="text-sm sm:text-base text-[#6b7280] leading-relaxed">
                  Instantly calculate marketplace fees, payment gateway costs, and international taxes. Stop losing margin to hidden global surcharges.
                </p>
              </div>

              {/* Card 2: Smart Price Optimizer */}
              <div
                id="feature-card-smart-price"
                className="bg-[#f8f7ff] border border-[#ede9fe] rounded-2xl p-7 hover:border-[#7530FB]/40 transition hover:shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-[#f3eeff] text-[#7530FB] flex items-center justify-center mb-6 shadow-xs">
                  <Sliders className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-xl text-[#1f1d2e] mb-3">Smart Price Optimizer</h3>
                <p className="text-sm sm:text-base text-[#6b7280] leading-relaxed">
                  Our AI suggests the optimal selling price by analyzing your desired profit margin, historical competitor data, and current market demand.
                </p>
              </div>

              {/* Card 3: Scenario Modeling */}
              <div
                id="feature-card-scenario-model"
                className="bg-[#f8f7ff] border border-[#ede9fe] rounded-2xl p-7 hover:border-[#7530FB]/40 transition hover:shadow-sm"
              >
                <div className="w-12 h-12 rounded-xl bg-[#f3eeff] text-[#7530FB] flex items-center justify-center mb-6 shadow-xs">
                  <Share2 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-xl text-[#1f1d2e] mb-3">Scenario Modeling</h3>
                <p className="text-sm sm:text-base text-[#6b7280] leading-relaxed">
                  Test 'what-if' scenarios before committing to a price change. See how volume discounts or shipping rate hikes impact your bottom line instantly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: ENGINEERED FOR E-COMMERCE PROFITABILITY (Editorial Block) */}
        <section className="py-20 bg-[#f8f7ff]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1f1d2e] mb-5">
              Engineered for E-commerce Profitability
            </h2>
            <div className="space-y-4 text-base sm:text-lg text-[#6b7280] leading-relaxed">
              <p>
                Maximizing your{' '}
                <strong className="text-[#1f1d2e] font-semibold">e-commerce profit margins</strong>{' '}
                requires more than just a basic spreadsheet. Our platform provides{' '}
                <strong className="text-[#1f1d2e] font-semibold">real-time marketplace fee tracking</strong>{' '}
                across global platforms, ensuring you never lose money on a sale due to unexpected costs or currency fluctuations.
              </p>
              <p>
                Whether you are calculating complex{' '}
                <strong className="text-[#1f1d2e] font-semibold">eBay final value fees</strong>{' '}
                or looking for a robust{' '}
                <strong className="text-[#1f1d2e] font-semibold">wholesale arbitrage calculator</strong>, our precision logic handles the heavy lifting. We factor in every variable from shipping surcharges to category-specific commissions so you can focus on scaling your inventory.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: FEATURE 1 - LIVE FEE MATRIX & MARKET BREAKDOWN */}
        <section id="fee-matrix" className="py-16 bg-white border-t border-[#ede9fe]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Live Data Card from screenshot */}
              <div className="lg:col-span-6">
                <div className="relative max-w-md mx-auto lg:mx-0">
                  {/* Overhanging Live Data Tag */}
                  <div className="inline-block bg-[#7530FB] text-white text-xs font-bold px-3 py-1 rounded-md shadow-sm mb-[-10px] ml-4 relative z-10">
                    Live Data
                  </div>

                  <div className="bg-white border border-[#ede9fe] rounded-2xl p-5 shadow-sm space-y-3">
                    {/* Row 1: eBay UK */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#f8f7ff]">
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-[#6b7280]" />
                        <span className="font-semibold text-sm text-[#1f1d2e]">eBay UK</span>
                      </div>
                      <span className="font-mono font-bold text-sm text-rose-500">-12.8%</span>
                    </div>

                    {/* Row 2: Amazon US */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#f8f7ff]">
                      <div className="flex items-center gap-3">
                        <ShoppingCart className="w-5 h-5 text-[#6b7280]" />
                        <span className="font-semibold text-sm text-[#1f1d2e]">Amazon US</span>
                      </div>
                      <span className="font-mono font-bold text-sm text-rose-500">-15.6%</span>
                    </div>

                    {/* Row 3: Total Fees Estimated */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#f3eeff] text-[#7530FB]">
                      <div className="flex items-center gap-3">
                        <Building2 className="w-5 h-5 text-[#7530FB]" />
                        <span className="font-bold text-sm text-[#7530FB]">Total Fees Estimated</span>
                      </div>
                      <span className="font-mono font-extrabold text-base text-[#7530FB]">$4.32</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Text & Checklist */}
              <div className="lg:col-span-6 space-y-6">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1f1d2e] tracking-tight">
                  Live Fee Matrix & Market Breakdown
                </h3>
                <p className="text-base text-[#6b7280] leading-relaxed">
                  Instantly see exactly what every marketplace takes from your sale, including regional taxes and hidden currency conversion spreads.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#7530FB] text-white flex items-center justify-center shrink-0 mt-0.5 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-sm sm:text-base font-medium text-[#1f1d2e]">
                      Real-time marketplace fee updates.
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#7530FB] text-white flex items-center justify-center shrink-0 mt-0.5 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-sm sm:text-base font-medium text-[#1f1d2e]">
                      VAT, GST, and state tax calculations.
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#7530FB] text-white flex items-center justify-center shrink-0 mt-0.5 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-sm sm:text-base font-medium text-[#1f1d2e]">
                      Payment gateway fee estimation (PayPal, Stripe, etc).
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: FEATURE 2 - 100% MAP RISK ASSESSMENT & GUARD */}
        <section id="map-guard" className="py-16 bg-[#f8f7ff] border-t border-[#ede9fe]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Text & Checklist */}
              <div className="lg:col-span-6 space-y-6">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1f1d2e] tracking-tight">
                  100% MAP Risk Assessment & Guard
                </h3>
                <p className="text-base text-[#6b7280] leading-relaxed">
                  Never accidentally violate Minimum Advertised Price agreements. Set your floor prices and let our guard rail protect your vendor relationships.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#7530FB] text-white flex items-center justify-center shrink-0 mt-0.5 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-sm sm:text-base font-medium text-[#1f1d2e]">
                      Automated MAP violation alerts.
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#7530FB] text-white flex items-center justify-center shrink-0 mt-0.5 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-sm sm:text-base font-medium text-[#1f1d2e]">
                      Hard-stop listing prevention below MAP.
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Dark Card from Screenshot */}
              <div className="lg:col-span-6">
                <div
                  id="map-warning-card"
                  className="bg-[#1e1535] text-white rounded-2xl p-6 sm:p-7 border border-[#2d1f4e] shadow-xl max-w-md mx-auto lg:ml-auto"
                >
                  <div className="flex items-start gap-3 mb-6">
                    <div className="w-9 h-9 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center shrink-0">
                      <ShieldAlert className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-white">MAP Violation Warning</h4>
                      <p className="text-xs text-[#a89cc8]">Suggested price drops below vendor MAP</p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-[#2d1f4e]">
                      <span className="text-[#a89cc8] font-medium">Vendor MAP:</span>
                      <span className="font-mono font-semibold text-white">$49.99</span>
                    </div>

                    <div className="flex justify-between items-center py-2">
                      <span className="text-[#a89cc8] font-medium">Calculated Target:</span>
                      <span className="font-mono font-bold text-rose-500">$47.50</span>
                    </div>
                  </div>

                  <button
                    id="map-adjust-btn"
                    onClick={() => openFullCalculator()}
                    className="w-full mt-6 py-3 bg-[#7530FB] hover:bg-[#6020e0] text-white rounded-lg font-bold text-sm transition shadow-sm cursor-pointer"
                  >
                    Adjust to MAP Minimum
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: FEATURE 3 - REAL-TIME ROI SCORING & ANALYSIS */}
        <section id="roi-scoring" className="py-16 bg-white border-t border-[#ede9fe]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Bar Chart Card from Screenshot */}
              <div className="lg:col-span-6">
                <div
                  id="roi-chart-card"
                  className="bg-white border border-[#ede9fe] rounded-2xl p-6 sm:p-7 shadow-sm max-w-md mx-auto lg:mx-0"
                >
                  <div className="flex items-center justify-between mb-8">
                    <span className="font-bold text-sm sm:text-base text-[#1f1d2e]">
                      ROI Scoring Model
                    </span>
                    <span className="bg-[#B8FA33] text-[#1e1535] font-extrabold text-xs px-2.5 py-0.5 rounded-full shadow-xs">
                      A+
                    </span>
                  </div>

                  {/* SVG Bar Chart matching the screenshot */}
                  <div className="h-44 flex items-end justify-between gap-3 pt-4 px-2">
                    {/* Bar 1: 10% */}
                    <div className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full h-16 bg-[#f3eeff] rounded-t-lg transition hover:brightness-95"></div>
                      <span className="text-xs font-semibold text-[#a89cc8]">10%</span>
                    </div>

                    {/* Bar 2: 20% (Highlighted tall purple bar) */}
                    <div className="flex-1 flex flex-col items-center gap-2 relative">
                      <div className="absolute -top-6 bg-[#B8FA33] text-[#1e1535] text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-xs">
                        A+
                      </div>
                      <div className="w-full h-32 bg-[#7530FB] rounded-t-lg shadow-sm"></div>
                      <span className="text-xs font-bold text-[#7530FB]">20%</span>
                    </div>

                    {/* Bar 3: 35% */}
                    <div className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full h-24 bg-[#f3eeff] rounded-t-lg transition hover:brightness-95"></div>
                      <span className="text-xs font-semibold text-[#a89cc8]">35%</span>
                    </div>

                    {/* Bar 4: 50%+ */}
                    <div className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full h-14 bg-[#f3eeff] rounded-t-lg transition hover:brightness-95"></div>
                      <span className="text-xs font-semibold text-[#a89cc8]">50%+</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Text & Checklist */}
              <div className="lg:col-span-6 space-y-6">
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#1f1d2e] tracking-tight">
                  Real-Time ROI Scoring & Analysis
                </h3>
                <p className="text-base text-[#6b7280] leading-relaxed">
                  Stop looking at just gross margin. Our engine grades every potential inventory purchase with a proprietary ROI score based on holding costs and capital velocity.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#7530FB] text-white flex items-center justify-center shrink-0 mt-0.5 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-sm sm:text-base font-medium text-[#1f1d2e]">
                      Inventory amortization tracking.
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#7530FB] text-white flex items-center justify-center shrink-0 mt-0.5 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span className="text-sm sm:text-base font-medium text-[#1f1d2e]">
                      Capital velocity scoring (A to F grading).
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: BUILT FOR POWER RESELLERS */}
        <section className="py-20 bg-[#f8f7ff] border-t border-[#ede9fe]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1f1d2e] tracking-tight">
                Built for Power Resellers
              </h2>
              <p className="text-base sm:text-lg text-[#6b7280] mt-2">
                Advanced calculators to handle every edge case of your reselling business.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1: Best Offer Testing */}
              <div
                id="reseller-tool-best-offer"
                className="bg-white border border-[#ede9fe] rounded-2xl p-7 hover:border-[#7530FB]/40 transition hover:shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#f3eeff] text-[#7530FB] flex items-center justify-center mb-6">
                    <Tag className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-xl text-[#1f1d2e] mb-3">Best Offer Testing</h3>
                  <p className="text-sm sm:text-base text-[#6b7280] leading-relaxed">
                    Calculate exact margins for 'Best Offer' thresholds before accepting buyer negotiations.
                  </p>
                </div>
                <button
                  onClick={() => openFullCalculator()}
                  className="mt-6 inline-flex items-center gap-1.5 font-bold text-sm text-[#7530FB] hover:text-[#6020e0] group cursor-pointer"
                >
                  <span>Try it out</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Card 2: Reverse Price Engine */}
              <div
                id="reseller-tool-reverse-price"
                className="bg-white border border-[#ede9fe] rounded-2xl p-7 hover:border-[#7530FB]/40 transition hover:shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#f3eeff] text-[#7530FB] flex items-center justify-center mb-6">
                    <ArrowLeftRight className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-xl text-[#1f1d2e] mb-3">Reverse Price Engine</h3>
                  <p className="text-sm sm:text-base text-[#6b7280] leading-relaxed">
                    Input your desired net profit dollar amount, and we'll calculate the exact selling price needed.
                  </p>
                </div>
                <button
                  onClick={() => openFullCalculator()}
                  className="mt-6 inline-flex items-center gap-1.5 font-bold text-sm text-[#7530FB] hover:text-[#6020e0] group cursor-pointer"
                >
                  <span>Try it out</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Card 3: Returns Impact Tracker */}
              <div
                id="reseller-tool-returns-tracker"
                className="bg-white border border-[#ede9fe] rounded-2xl p-7 hover:border-[#7530FB]/40 transition hover:shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-[#f3eeff] text-[#7530FB] flex items-center justify-center mb-6">
                    <RotateCcw className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-xl text-[#1f1d2e] mb-3">Returns Impact Tracker</h3>
                  <p className="text-sm sm:text-base text-[#6b7280] leading-relaxed">
                    Factor in your category's average return rate to see the true adjusted profitability of a listing.
                  </p>
                </div>
                <button
                  onClick={() => openFullCalculator()}
                  className="mt-6 inline-flex items-center gap-1.5 font-bold text-sm text-[#7530FB] hover:text-[#6020e0] group cursor-pointer"
                >
                  <span>Try it out</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7: STATS & TESTIMONIALS (Deep Dark Navy Section) */}
        <section className="py-20 bg-[#1e1535] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Top 3 Stat Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center pb-16 border-b border-[#2d1f4e]">
              <div>
                <div className="font-mono text-4xl sm:text-5xl font-extrabold text-[#B8FA33]">
                  12k+
                </div>
                <div className="text-xs uppercase font-bold tracking-widest text-[#a89cc8] mt-2">
                  CALCULATIONS DAILY
                </div>
              </div>

              <div>
                <div className="font-mono text-4xl sm:text-5xl font-extrabold text-[#B8FA33]">
                  $2.4M
                </div>
                <div className="text-xs uppercase font-bold tracking-widest text-[#a89cc8] mt-2">
                  MARGIN OPTIMIZED
                </div>
              </div>

              <div>
                <div className="font-mono text-4xl sm:text-5xl font-extrabold text-[#B8FA33]">
                  98%
                </div>
                <div className="text-xs uppercase font-bold tracking-widest text-[#a89cc8] mt-2">
                  PRICING ACCURACY
                </div>
              </div>
            </div>

            {/* 3 Testimonials */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16">
              {/* Testimonial 1 */}
              <div
                id="testimonial-card-1"
                className="bg-[#2d1f4e] border border-[#3d2a5e] rounded-2xl p-7 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-[#b8fa33] mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#b8fa33]" />
                    ))}
                  </div>
                  <p className="text-sm sm:text-base text-[#e5dff5] italic leading-relaxed mb-6">
                    "The reverse price engine alone saved my business. I finally know exactly what to price items to hit my $15 minimum net per sale."
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-[#3d2a5e]">
                  <div className="w-10 h-10 rounded-full bg-[#7530FB] text-white flex items-center justify-center font-bold text-xs">
                    SJ
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">Sarah J.</div>
                    <div className="text-xs text-[#a89cc8]">Top Rated Seller</div>
                  </div>
                </div>
              </div>

              {/* Testimonial 2 */}
              <div
                id="testimonial-card-2"
                className="bg-[#2d1f4e] border border-[#3d2a5e] rounded-2xl p-7 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-[#b8fa33] mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#b8fa33]" />
                    ))}
                  </div>
                  <p className="text-sm sm:text-base text-[#e5dff5] italic leading-relaxed mb-6">
                    "Caught a hidden fee issue on my international sales that was eating 5% of my margin. The global breakdown is incredible."
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-[#3d2a5e]">
                  <div className="w-10 h-10 rounded-full bg-[#B8FA33] text-[#1e1535] flex items-center justify-center font-bold text-xs">
                    MK
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">Mike K.</div>
                    <div className="text-xs text-[#a89cc8]">Cross-Border Retailer</div>
                  </div>
                </div>
              </div>

              {/* Testimonial 3 */}
              <div
                id="testimonial-card-3"
                className="bg-[#2d1f4e] border border-[#3d2a5e] rounded-2xl p-7 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-[#b8fa33] mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#b8fa33]" />
                    ))}
                  </div>
                  <p className="text-sm sm:text-base text-[#e5dff5] italic leading-relaxed mb-6">
                    "The UI is so much cleaner than the spreadsheets I was using. Scenario modeling lets me bulk adjust prices safely."
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-[#3d2a5e]">
                  <div className="w-10 h-10 rounded-full bg-[#7530fb] text-white flex items-center justify-center font-bold text-xs">
                    DL
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">David L.</div>
                    <div className="text-xs text-[#a89cc8]">Volume Reseller</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 8: INTERMEDIATE CTA CARD */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div
              id="cta-box"
              className="bg-white border border-[#ede9fe] rounded-3xl p-8 sm:p-12 text-center shadow-[0_8px_30px_rgb(117,48,251,0.08)]"
            >
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1f1d2e] tracking-tight">
                Ready to take control of your margins?
              </h2>
              <p className="text-base text-[#6b7280] mt-2 mb-8 max-w-lg mx-auto">
                Stop leaving money on the table. Start using the industry's most accurate profit calculator today.
              </p>
              <button
                id="launch-calc-btn"
                onClick={() => openFullCalculator()}
                className="bg-[#7530FB] hover:bg-[#6020e0] text-white font-bold text-base px-8 py-3.5 rounded-lg shadow-sm hover:shadow transition inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Launch Profit Calculator Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 9: EVERYTHING YOU NEED TO KNOW (FAQ) */}
        <section id="faq" className="py-16 bg-[#f8f7ff] border-t border-[#ede9fe]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1f1d2e] tracking-tight">
                Everything You Need to Know
              </h2>
              <p className="text-base sm:text-lg text-[#6b7280] mt-2">
                Common questions about the Profit Calculator.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* FAQ 1 */}
              <div
                id="faq-1"
                className="bg-white border border-[#ede9fe] rounded-2xl p-6 shadow-xs"
              >
                <h3 className="font-bold text-base text-[#1f1d2e] mb-2">
                  Does it pull live marketplace fees?
                </h3>
                <p className="text-sm text-[#6b7280] leading-relaxed">
                  Yes, our API syncs daily with major marketplaces to ensure fee percentages, caps, and promotional rates are 100% accurate.
                </p>
              </div>

              {/* FAQ 2 */}
              <div
                id="faq-2"
                className="bg-white border border-[#ede9fe] rounded-2xl p-6 shadow-xs"
              >
                <h3 className="font-bold text-base text-[#1f1d2e] mb-2">
                  Can I save my custom shipping rates?
                </h3>
                <p className="text-sm text-[#6b7280] leading-relaxed">
                  Absolutely. You can build profiles for your standard box sizes and carrier rates to auto-fill calculations.
                </p>
              </div>

              {/* FAQ 3 */}
              <div
                id="faq-3"
                className="bg-white border border-[#ede9fe] rounded-2xl p-6 shadow-xs"
              >
                <h3 className="font-bold text-base text-[#1f1d2e] mb-2">
                  Does it calculate VAT for UK/EU?
                </h3>
                <p className="text-sm text-[#6b7280] leading-relaxed">
                  Yes, full VAT and international tax calculations are supported for cross-border sellers.
                </p>
              </div>

              {/* FAQ 4 */}
              <div
                id="faq-4"
                className="bg-white border border-[#ede9fe] rounded-2xl p-6 shadow-xs"
              >
                <h3 className="font-bold text-base text-[#1f1d2e] mb-2">
                  Is there a bulk upload option?
                </h3>
                <p className="text-sm text-[#6b7280] leading-relaxed">
                  Pro users can upload CSVs of their inventory to calculate optimal pricing for thousands of SKUs at once.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 10: MORE TOOLS TO SUPERCHARGE YOUR STORE */}
        <section className="py-20 bg-white border-t border-[#ede9fe]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1f1d2e] tracking-tight">
                More Tools to Supercharge Your Store
              </h2>
              <p className="text-base text-[#6b7280] mt-1">
                Explore the full Reazify ecosystem.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Tool 1: Title Builder */}
              <div
                id="ecosystem-tool-title-builder"
                className="bg-[#f8f7ff] border border-[#ede9fe] rounded-2xl p-7 hover:border-[#7530FB]/40 transition flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-[#f3eeff] text-[#7530FB] flex items-center justify-center mb-6">
                    <Type className="w-5 h-5 font-bold" />
                  </div>
                  <h3 className="font-bold text-xl text-[#1f1d2e] mb-2">Title Builder</h3>
                  <p className="text-sm text-[#6b7280] leading-relaxed">
                    Generate SEO-optimized listing titles based on actual search volume data.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#ede9fe]">
                  <span className="inline-flex items-center gap-1 font-bold text-sm text-[#7530FB] hover:text-[#6020e0] cursor-pointer">
                    Explore Tool →
                  </span>
                </div>
              </div>

              {/* Tool 2: Templates Studio */}
              <div
                id="ecosystem-tool-templates-studio"
                className="bg-[#f8f7ff] border border-[#ede9fe] rounded-2xl p-7 hover:border-[#7530FB]/40 transition flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-[#f3eeff] text-[#7530FB] flex items-center justify-center mb-6">
                    <Eye className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-xl text-[#1f1d2e] mb-2">Templates Studio</h3>
                  <p className="text-sm text-[#6b7280] leading-relaxed">
                    Design beautiful custom eBay listing templates with drag-and-drop and HTML builders.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#ede9fe]">
                  <span className="inline-flex items-center gap-1 font-bold text-sm text-[#7530FB] hover:text-[#6020e0] cursor-pointer">
                    Explore Tool →
                  </span>
                </div>
              </div>

              {/* Tool 3: Listing Generator */}
              <div
                id="ecosystem-tool-listing-generator"
                className="bg-[#f8f7ff] border border-[#ede9fe] rounded-2xl p-7 hover:border-[#7530FB]/40 transition flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-[#f3eeff] text-[#7530FB] flex items-center justify-center mb-6">
                    <RefreshCw className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-xl text-[#1f1d2e] mb-2">Listing Generator</h3>
                  <p className="text-sm text-[#6b7280] leading-relaxed">
                    Create beautiful, SEO-optimized eBay listings in seconds with AI-driven descriptions.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#ede9fe]">
                  <span className="inline-flex items-center gap-1 font-bold text-sm text-[#7530FB] hover:text-[#6020e0] cursor-pointer">
                    Explore Tool →
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 11: BOTTOM BANNER / HERO CTA */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#f8f7ff]">
          <div
            id="bottom-hero-cta"
            className="max-w-7xl mx-auto rounded-3xl bg-gradient-to-b from-[#7530FB] to-[#6020e0] text-white py-16 sm:py-20 px-6 text-center shadow-xl relative overflow-hidden"
          >
            {/* Background subtle decorative concentric rings */}
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full border border-white/10 pointer-events-none"></div>
            <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full border border-white/10 pointer-events-none"></div>

            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Ready to maximize your margins?
              </h2>
              <p className="text-base sm:text-lg text-[#e5dff5] leading-relaxed">
                Join thousands of top sellers who rely on our precision calculator to eliminate guesswork and guarantee profit on every single sale.
              </p>
              <div className="pt-4">
                <button
                  id="bottom-start-free-btn"
                  onClick={() => openFullCalculator()}
                  className="bg-[#7530FB] hover:bg-[#6020e0] text-white font-bold text-base px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>Start Calculating For Free</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
