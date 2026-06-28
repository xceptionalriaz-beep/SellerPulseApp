"use client"

// lib/core/ai-engine/marketChartService wired here
// matches Dart: MarketChartService.prepareData()
import { MarketChartService } from '@/lib/core/ai-engine/marketChartService'
import { MarketState }        from '@/lib/core/ai-engine/volatilitySensor'
;

import React, { useState } from "react";
import {
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
} from "recharts";
import { Zap, Anchor } from "lucide-react";

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface DataPoint {
  date: string
  value?: number
  forecastValue?: number
  isForecast: boolean
  event?: string
  today?: boolean
}

interface Props {
  searchQuery?:  string
  // Real data props â€” pass these from your edge function response
  liveData?:     { date: string; value: number }[]       // historical points
  forecastData?: { date: string; forecastValue: number }[] // forecast points
  percentChange?: number
  confidenceScore?: number
}

// â”€â”€ Default mock data (used until edge function is ready) â”€â”€â”€â”€â”€
const defaultMockData: DataPoint[] = [
  { date: "04-30", value: 3800,  isForecast: false },
  { date: "05-06", value: 5200,  isForecast: false },
  { date: "05-12", value: 4100,  isForecast: false, event: "Price Drop" },
  { date: "05-18", value: 6100,  isForecast: false },
  { date: "05-24", value: 4300,  isForecast: false },
  { date: "05-30", value: 5000,  isForecast: false, today: true },
  { date: "06-05", forecastValue: 4800, isForecast: true  },
]

export default function MarketTrendChart({
  searchQuery    = "Overall Market",
  liveData,
  forecastData,
  percentChange  = 33.8,
  confidenceScore = 95,
}: Props) {
  const [selectedTime, setSelectedTime] = useState("30D")

  const neonGreen    = "#8FFF00"

  // â”€â”€ Run MarketChartService AI engine on liveData â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // matches Dart: MarketChartService.prepareData(fullData, timeFrame)
  const aiPackage = (() => {
    if (liveData && liveData.length > 0) {
      const fullData = liveData.map((d, i) => ({ x: i, y: d.value }))
      return MarketChartService.prepareData({ fullData, timeFrame: selectedTime })
    }
    return null
  })()

  // â”€â”€ Map to Recharts format â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const chartData: DataPoint[] = (() => {
    if (aiPackage) {
      // Use AI-processed currentData for historical
      const today = new Date()
      const historical: DataPoint[] = aiPackage.currentData.map((spot, i) => {
        const d = new Date(today)
        d.setDate(today.getDate() - (aiPackage.currentData.length - 1 - i))
        return {
          date:       `${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,
          value:      Math.round(spot.y),
          isForecast: false,
          today:      i === aiPackage.currentData.length - 1,
        }
      })
      // Use HybridRegressor forecast for dashed line
      const forecast: DataPoint[] = aiPackage.forecastData.map((spot, i) => {
        const d = new Date(today)
        d.setDate(today.getDate() + i + 1)
        return {
          date:          `${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`,
          forecastValue: Math.round(spot.y),
          isForecast:    true,
        }
      })
      return [...historical, ...forecast]
    }
    if (liveData && liveData.length > 0) {
      return [
        ...liveData.map((d, i) => ({ date: d.date, value: d.value, isForecast: false, today: i === liveData.length - 1 })),
        ...(forecastData ?? []).map(d => ({ date: d.date, forecastValue: d.forecastValue, isForecast: true })),
      ]
    }
    return defaultMockData
  })()

  // Use AI confidence score if available
  const aiConfidence    = aiPackage ? Math.round(aiPackage.safety.confidenceScore) : confidenceScore
  const aiPercentChange = aiPackage ? Math.round(aiPackage.percentChange * 10) / 10 : percentChange
  const aiMarketState   = aiPackage?.marketState ?? MarketState.stable

  // â”€â”€ Custom tooltip â€” only shows on real data hover, never on reference lines â”€â”€
  const CustomTooltip = ({ active, payload }: any) => {
    // Guard: must be active, have payload, and have a real numeric value
    if (!active || !payload || !payload.length) return null
    const val = payload[0]?.value
    if (val === undefined || val === null) return null

    const data = payload[0].payload
    return (
      <div className="bg-white px-3 py-2 rounded-lg border border-slate-100 flex items-center gap-2"
           style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)" }}>
        {!data.isForecast ? (
          <span className="text-sm font-black text-gray-900">
            ðŸ“¦ Vol: {(val / 1000).toFixed(2)}K
          </span>
        ) : (
          <span className="text-sm font-black text-gray-900">
            AI Forecast: {(val / 1000).toFixed(2)}K
          </span>
        )}
      </div>
    )
  }

  // Find today and price drop reference dates
  const todayDate  = chartData.find(d => d.today)?.date  ?? "05-30"
  const eventDate  = chartData.find(d => d.event)?.date  ?? "05-12"

  return (
    <div className="w-full h-full bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_5px_15px_rgba(0,0,0,0.02)] flex flex-col">

      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-[12px] font-bold text-slate-500 tracking-[1.1px] uppercase mb-1">
            ðŸ“ˆ SALES TREND & FORECAST ("{searchQuery}")
          </h2>
          <div className="flex items-center flex-wrap gap-3 mt-1">
            <div className="flex items-baseline gap-1">
              <span className="font-black text-lg" style={{ color: aiPercentChange >= 0 ? '#16A34A' : '#DC2626' }}>
                {aiPercentChange >= 0 ? '+' : ''}{aiPercentChange.toFixed(1)}%
              </span>
              <span className="text-slate-400 text-xs">vs last period</span>
            </div>

            {/* Saturation badge */}
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400">Saturation:</span>
              <div className="w-16 h-1.5 rounded-full bg-gradient-to-r from-red-400 via-orange-300 to-[#8FFF00]" />
              <span className="text-[10px] font-bold text-[#7acc00]">Low (Ideal)</span>
            </div>

            {/* AI Confidence badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${
              aiConfidence > 70
                ? 'bg-[#8FFF00]/10 border-[#8FFF00]/40 text-green-700'
                : 'bg-orange-50 border-orange-200 text-orange-700'
            }`}>
              {aiMarketState === MarketState.momentum
                ? <Zap size={12} className="fill-current" />
                : <Anchor size={12} />}
              <span className="text-[10px] font-bold">AI Confidence: {aiConfidence}%</span>
            </div>
          </div>
        </div>

        {/* Time toggles */}
        <div className="flex bg-slate-100 p-1 rounded-lg shrink-0">
          {["7D", "30D", "90D", "1Y"].map(time => (
            <button key={time} onClick={() => setSelectedTime(time)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                selectedTime === time
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              }`}>
              {time}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 w-full min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: -10, bottom: 20 }}>
            <defs>
              <linearGradient id="neonGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={neonGreen} stopOpacity={0.4} />
                <stop offset="95%" stopColor={neonGreen} stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} horizontal={true} stroke="#f1f5f9" strokeDasharray="3 3" />

            <XAxis dataKey="date" axisLine={false} tickLine={false} tickMargin={12}
              tick={(props: any) => {
                const { x, y, payload } = props
                const point = chartData[payload.index]
                const isFc  = point?.isForecast
                return (
                  <g transform={`translate(${x},${y})`}>
                    <text x={0} y={0} dy={16} textAnchor="middle"
                      fill={isFc ? "#15803d" : "#94A3B8"}
                      fontSize={10} fontWeight={isFc ? 900 : 600}>
                      {isFc ? `AI â€¢ ${payload.value}` : payload.value}
                    </text>
                  </g>
                )
              }}
            />

            <YAxis axisLine={false} tickLine={false}
              tick={{ fill: '#64748B', fontSize: 11, fontWeight: 'bold' } as any}
              tickFormatter={(v: number) => v >= 1000 ? `${(v/1000).toFixed(1)}K` : String(v)}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: 'rgba(148,163,184,0.3)', strokeWidth: 1, strokeDasharray: '0' }}
              isAnimationActive={false}
            />

            {/* Price drop event line */}
            <ReferenceLine x={eventDate} stroke="#fb923c" strokeDasharray="4 4" strokeWidth={1}
              label={{ position: 'top', value: 'ðŸ“‰ $5 Price Drop Event',
                       fill: '#c2410c', fontSize: 10, fontWeight: 'bold' }} />

            {/* TODAY line â€” full height muted gray dashed */}
            <ReferenceLine x={todayDate}
              stroke="#cbd5e1"
              strokeDasharray="3 3"
              strokeWidth={1}
              label={{ position: 'insideTopLeft', value: 'TODAY',
                       fill: '#94a3b8', fontSize: 10, fontWeight: 'bold', offset: 5 }} />

            {/* Historical area + line */}
            <Area type="monotone" dataKey="value"
              stroke={neonGreen} strokeWidth={3}
              fillOpacity={1} fill="url(#neonGlow)"
              dot={false}
              activeDot={{ r: 6, fill: neonGreen, stroke: '#fff', strokeWidth: 2 }} />

            {/* Forecast dashed line */}
            <Line type="monotone" dataKey="forecastValue"
              stroke={neonGreen} strokeWidth={3} strokeDasharray="6 6"
              dot={(props: any) => {
                const { cx, cy, index } = props
                // Only show the empty circle at the very last forecast point
                if (index === chartData.length - 1) {
                  return <circle key={`dot-${index}`} cx={cx} cy={cy} r={5} fill="#fff" stroke={neonGreen} strokeWidth={2} />
                }
                return <g key={`dot-${index}`} />
              }}
              activeDot={{ r: 6, fill: '#fff', stroke: neonGreen, strokeWidth: 2 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
