'use client'
// components/currency/CurrencyWidget.tsx
// Compact currency exchange widget for the dashboard
// Import in dashboard page:
//   import CurrencyWidget from '@/components/currency/CurrencyWidget'

import { useState, useEffect, useCallback } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { ArrowRightLeft, BarChart2 } from 'lucide-react'
import ProDropdown from '@/components/ui/ProDropdown'

const CURRENCIES = [
    // eBay marketplace currencies
    { code: 'USD', symbol: '$', name: 'US Dollar', flag: 'us' },
    { code: 'GBP', symbol: '£', name: 'British Pound', flag: 'gb' },
    { code: 'EUR', symbol: '€', name: 'Euro', flag: 'eu' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: 'ca' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: 'au' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', flag: 'cn' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: 'jp' },
    { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', flag: 'hk' },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', flag: 'sg' },
    { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', flag: 'ch' },
    { code: 'PLN', symbol: 'zł', name: 'Polish Złoty', flag: 'pl' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: 'in' },
    { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso', flag: 'mx' },
    { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', flag: 'br' },
    // Additional sourcing currencies
    { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', flag: 'ae' },
    { code: 'KRW', symbol: '₩', name: 'South Korean Won', flag: 'kr' },
    { code: 'THB', symbol: '฿', name: 'Thai Baht', flag: 'th' },
    { code: 'TRY', symbol: '₺', name: 'Turkish Lira', flag: 'tr' },
    { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', flag: 'nz' },
    { code: 'SEK', symbol: 'kr', name: 'Swedish Krona', flag: 'se' },
    { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone', flag: 'no' },
    { code: 'DKK', symbol: 'kr', name: 'Danish Krone', flag: 'dk' },
    { code: 'ZAR', symbol: 'R', name: 'South African Rand', flag: 'za' },
    { code: 'TWD', symbol: 'NT$', name: 'Taiwan Dollar', flag: 'tw' },
    { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', flag: 'my' },
    { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', flag: 'id' },
    { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', flag: 'vn' },
    { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka', flag: 'bd' },
    { code: 'PKR', symbol: '₨', name: 'Pakistani Rupee', flag: 'pk' },
    { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee', flag: 'lk' },
]

// Currencies supported by frankfurter.app for historical data
const CHART_SUPPORTED = new Set([
    'AUD', 'BGN', 'BRL', 'CAD', 'CHF', 'CNY', 'CZK', 'DKK', 'EUR', 'GBP',
    'HKD', 'HUF', 'IDR', 'ILS', 'INR', 'ISK', 'JPY', 'KRW', 'MXN', 'MYR',
    'NOK', 'NZD', 'PHP', 'PLN', 'RON', 'SEK', 'SGD', 'THB', 'TRY', 'USD', 'ZAR'
])

const PERIODS = [
    { label: '1W', days: 7 },
    { label: '1M', days: 30 },
    { label: '3M', days: 90 },
    { label: '1Y', days: 365 },
]

function getCurrency(code: string) {
    return CURRENCIES.find(c => c.code === code) ?? CURRENCIES[0]
}

function CustomTooltip({ active, payload, label, toCurrency }: any) {
    if (!active || !payload?.length) return null
    return (
        <div style={{ background: '#1a2410', border: '1px solid #e8ede2', borderRadius: 8, padding: '8px 12px' }}>
            <p style={{ fontSize: 10, color: '#8a9e78', margin: '0 0 2px' }}>{label}</p>
            <p style={{ fontSize: 13, fontWeight: 800, color: '#8fff00', margin: 0 }}>
                {payload[0].value?.toFixed(4)} {toCurrency}
            </p>
        </div>
    )
}

export default function CurrencyWidget() {
    const [from, setFrom] = useState('USD')
    const [to, setTo] = useState('GBP')
    const [amount, setAmount] = useState('1')
    const [rate, setRate] = useState(0)
    const [chartData, setChartData] = useState<{ date: string; rate: number }[]>([])
    const [period, setPeriod] = useState('1Y')
    const [loading, setLoading] = useState(true)
    const [chartLoad, setChartLoad] = useState(false)
    const [lastUpdated, setLastUpdated] = useState('')

    const fromInfo = getCurrency(from)
    const toInfo = getCurrency(to)

    const chartSupported = CHART_SUPPORTED.has(from) && CHART_SUPPORTED.has(to)

    // Fetch live rate
    const fetchRate = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/currency/live?from=${from}`)
            const data = await res.json()
            if (data?.rates?.[to]) {
                setRate(data.rates[to])
                setLastUpdated(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }))
            }
        } catch { setRate(0) }
        finally { setLoading(false) }
    }, [from, to])

    // Fetch chart data
    const fetchChart = useCallback(async () => {
        if (!chartSupported) { setChartData([]); return }
        setChartLoad(true)
        try {
            const days = PERIODS.find(p => p.label === period)?.days ?? 30
            const res = await fetch(`/api/currency/history?from=${from}&to=${to}&days=${days}`)
            const data = await res.json()
            if (data?.rates) {
                setChartData(Object.entries(data.rates).map(([date, r]: [string, any]) => ({ date, rate: r[to] ?? 0 })))
            } else {
                setChartData([])
            }
        } catch { setChartData([]) }
        finally { setChartLoad(false) }
    }, [from, to, period, chartSupported])

    useEffect(() => { fetchRate() }, [fetchRate])
    useEffect(() => { fetchChart() }, [fetchChart])

    const converted = (parseFloat(amount) || 0) * rate
    const firstRate = chartData[0]?.rate ?? 0
    const lastRate = chartData[chartData.length - 1]?.rate ?? 0
    const change = firstRate > 0 ? ((lastRate - firstRate) / firstRate) * 100 : 0
    const isUp = change >= 0
    const chartMin = chartData.length ? Math.min(...chartData.map(d => d.rate)) * 0.998 : 0
    const chartMax = chartData.length ? Math.max(...chartData.map(d => d.rate)) * 1.002 : 1

    const swap = () => { setFrom(to); setTo(from) }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Converter card */}
            <div style={{ background: '#fff', border: '1px solid #e8ede2', borderRadius: 16, padding: 20 }}>

                {/* From / To row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 36px 1fr', gap: 10, alignItems: 'center', marginBottom: 14 }}>

                    {/* From box */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontSize: 10, fontWeight: 700, color: '#8a9e78', letterSpacing: '0.5px' }}>FROM</label>
                        <div style={{ display: 'flex', alignItems: 'center', height: 48, border: '1.5px solid #8fff00', borderRadius: 8, background: '#fff', boxShadow: '0 0 0 3px rgba(143,255,0,0.1)' }}>
                            <div style={{ width: '50%', flexShrink: 0 }}>
                                <ProDropdown
                                    prefix=""
                                    currentValue={from}
                                    options={CURRENCIES.map(c => ({ val: c.code, label: `${c.code} — ${c.name}`, shortLabel: c.code, flagCode: c.flag, enabled: true }))}
                                    onChanged={setFrom}
                                    width="full"
                                    maxItems={8}
                                    inline={true}
                                />
                            </div>
                            <div style={{ width: '1px', height: '60%', background: '#e8ede2', flexShrink: 0, alignSelf: 'center' }} />
                            <input type="text" inputMode="decimal" value={amount}
                                onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                                style={{ width: '50%', border: 'none', outline: 'none', fontSize: 18, fontWeight: 800, color: '#1a2410', background: 'transparent', padding: '0 12px', minWidth: 0, textAlign: 'left' }} />
                        </div>
                    </div>

                    {/* Swap */}
                    <button onClick={swap} style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid #e8ede2', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ArrowRightLeft size={14} color="#8a9e78" />
                    </button>

                    {/* To box */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <label style={{ fontSize: 10, fontWeight: 700, color: '#8a9e78', letterSpacing: '0.5px' }}>TO</label>
                        <div style={{ display: 'flex', alignItems: 'center', height: 48, border: '1px solid #e8ede2', borderRadius: 8, background: '#f7f9f5' }}>
                            <div style={{ width: '50%', flexShrink: 0 }}>
                                <ProDropdown
                                    prefix=""
                                    currentValue={to}
                                    options={CURRENCIES.map(c => ({ val: c.code, label: `${c.code} — ${c.name}`, shortLabel: c.code, flagCode: c.flag, enabled: true }))}
                                    onChanged={setTo}
                                    width="full"
                                    maxItems={8}
                                    inline={true}
                                />
                            </div>
                            <div style={{ width: '1px', height: '60%', background: '#e8ede2', flexShrink: 0, alignSelf: 'center' }} />
                            <span style={{ width: '50%', fontSize: 18, fontWeight: 800, color: '#4a7c00', padding: '0 12px', textAlign: 'right' }}>
                                {loading ? '...' : converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Rate info */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f7f9f5', borderRadius: 8 }}>
                    <div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: '#1a2410', margin: 0 }}>
                            1 {from} = <span style={{ color: '#4a7c00' }}>{loading ? '...' : rate.toFixed(4)}</span> {to}
                        </p>
                        <p style={{ fontSize: 10, color: '#8a9e78', margin: '2px 0 0' }}>
                            1 {to} = {rate > 0 ? (1 / rate).toFixed(4) : '—'} {from}
                        </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: isUp ? '#f0fdf4' : '#fef2f2', padding: '5px 10px', borderRadius: 999, border: `1px solid ${isUp ? '#8fff00' : '#b91c1c'}` }}>
                        <span style={{ fontSize: 11 }}>{isUp ? '↗' : '↘'}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: isUp ? '#4a7c00' : '#b91c1c' }}>
                            {isUp ? '+' : ''}{change.toFixed(2)}% ({period})
                        </span>
                    </div>
                </div>
            </div>

            {/* Chart card */}
            <div style={{ background: '#fff', border: '1px solid #e8ede2', borderRadius: 16, padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div>
                        <p style={{ fontSize: 13, fontWeight: 800, margin: 0, color: '#1a2410' }}>{from} / {to} Rate</p>
                        <p style={{ fontSize: 10, color: '#8a9e78', margin: '2px 0 0' }}>Historical exchange rate</p>
                    </div>
                    <div style={{ display: 'flex', gap: 3, background: '#f7f9f5', padding: 3, borderRadius: 8 }}>
                        {PERIODS.map(p => (
                            <button key={p.label} onClick={() => setPeriod(p.label)}
                                style={{ padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700, background: period === p.label ? '#1a2410' : 'transparent', color: period === p.label ? '#8fff00' : '#8a9e78', transition: 'all 0.15s' }}>
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                {chartLoad ? (
                    <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8a9e78', fontSize: 12 }}>Loading chart...</div>
                ) : chartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={160}>
                        <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e8ede2" vertical={false} />
                            <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#8a9e78' }} tickLine={false} axisLine={false}
                                tickFormatter={d => {
                                    const date = new Date(d)
                                    return period === '1W' ? date.toLocaleDateString('en-GB', { weekday: 'short' }) :
                                        period === '1Y' ? date.toLocaleDateString('en-GB', { month: 'short' }) :
                                            date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                                }}
                                interval="preserveStartEnd"
                            />
                            <YAxis domain={[chartMin, chartMax]} tick={{ fontSize: 9, fill: '#8a9e78' }} tickLine={false} axisLine={false} tickFormatter={v => v.toFixed(3)} width={48} />
                            <Tooltip content={<CustomTooltip toCurrency={to} />} />
                            <Line type="monotone" dataKey="rate" stroke={isUp ? '#4a7c00' : '#b91c1c'} strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div style={{ height: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#8a9e78', fontSize: 12, gap: 6 }}>
                        {!chartSupported
                            ? <><BarChart2 size={20} color="#8a9e78" /><span>Historical chart not available for {from}/{to}</span><span style={{ fontSize: 10 }}>Chart data is only available for major currencies</span></>
                            : <span>No chart data available</span>
                        }
                    </div>
                )}
            </div>
        </div>
    )
}
