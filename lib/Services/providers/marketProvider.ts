// lib/providers/marketProvider.ts
// Converted 1:1 from lib/providers/market_provider.dart
// Replaces Flutter ChangeNotifier with a React-friendly observable store

import { useState, useEffect } from 'react'

// ── Types ─────────────────────────────────────────────────────
export interface MarketState {
  currentKeyword: string
  isLoading:      boolean
  saturScore:     number     // 0.0 to 1.0
  trendData:      number[]   // 7 data points
}

type Listener = (state: MarketState) => void

// ── MarketProvider class (matches Dart MarketProvider extends ChangeNotifier) ──
class MarketProvider {
  private state: MarketState = {
    currentKeyword: '',
    isLoading:      false,
    saturScore:     0.0,
    trendData:      [0, 0, 0, 0, 0, 0, 0],  // matches Dart default
  }

  private listeners: Set<Listener> = new Set()

  // ── Getters (matches Dart get currentKeyword, get isLoading etc.) ─
  get currentKeyword() { return this.state.currentKeyword }
  get isLoading()      { return this.state.isLoading      }
  get saturScore()     { return this.state.saturScore     }
  get trendData()      { return this.state.trendData      }
  get snapshot()       { return { ...this.state }         }

  // ── Subscribe/unsubscribe (matches Dart addListener/removeListener) ──
  subscribe(fn: Listener): () => void {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  // ── notifyListeners (matches Dart notifyListeners()) ──────────
  private notify() {
    const snap = { ...this.state }
    this.listeners.forEach(fn => fn(snap))
  }

  // ── updateSearch (matches Dart void updateSearch(String keyword) async) ──
  async updateSearch(keyword: string): Promise<void> {
    this.state.currentKeyword = keyword
    this.state.isLoading      = true
    this.notify()  // tells UI to show loading spinner

    // Matches Dart: await Future.delayed(Duration(seconds: 2))
    await new Promise(r => setTimeout(r, 2000))

    // Simulating real data — matches Dart mock values
    this.state.saturScore = 0.75
    this.state.trendData  = [10, 45, 32, 89, 54, 76, 95]
    this.state.isLoading  = false
    this.notify()  // tells UI to show new charts
  }
}

// ── Singleton (matches Dart ChangeNotifierProvider) ───────────
export const marketProvider = new MarketProvider()

// ── React hook (replaces Dart Consumer<MarketProvider>) ───────
// Usage: const { saturScore, trendData, isLoading, updateSearch } = useMarketProvider()
export function useMarketProvider() {
  const [state, setState] = useState<MarketState>(marketProvider.snapshot)

  useEffect(() => {
    // Subscribe on mount, unsubscribe on unmount
    const unsub = marketProvider.subscribe(setState)
    return unsub
  }, [])

  return {
    ...state,
    updateSearch: (kw: string) => marketProvider.updateSearch(kw),
  }
}