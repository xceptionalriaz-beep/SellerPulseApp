// lib/providers/marketProvider.ts
// Converted 1:1 from lib/providers/market_provider.dart
// Replaces Flutter ChangeNotifier with a React-friendly observable store

import { useState, useEffect } from 'react'

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export interface MarketState {
  currentKeyword: string
  isLoading:      boolean
  saturScore:     number     // 0.0 to 1.0
  trendData:      number[]   // 7 data points
}

type Listener = (state: MarketState) => void

// â”€â”€ MarketProvider class (matches Dart MarketProvider extends ChangeNotifier) â”€â”€
class MarketProvider {
  private state: MarketState = {
    currentKeyword: '',
    isLoading:      false,
    saturScore:     0.0,
    trendData:      [0, 0, 0, 0, 0, 0, 0],  // matches Dart default
  }

  private listeners: Set<Listener> = new Set()

  // â”€â”€ Getters (matches Dart get currentKeyword, get isLoading etc.) â”€
  get currentKeyword() { return this.state.currentKeyword }
  get isLoading()      { return this.state.isLoading      }
  get saturScore()     { return this.state.saturScore     }
  get trendData()      { return this.state.trendData      }
  get snapshot()       { return { ...this.state }         }

  // â”€â”€ Subscribe/unsubscribe (matches Dart addListener/removeListener) â”€â”€
  subscribe(fn: Listener): () => void {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  // â”€â”€ notifyListeners (matches Dart notifyListeners()) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  private notify() {
    const snap = { ...this.state }
    this.listeners.forEach(fn => fn(snap))
  }

  // â”€â”€ updateSearch (matches Dart void updateSearch(String keyword) async) â”€â”€
  async updateSearch(keyword: string): Promise<void> {
    this.state.currentKeyword = keyword
    this.state.isLoading      = true
    this.notify()  // tells UI to show loading spinner

    // Matches Dart: await Future.delayed(Duration(seconds: 2))
    await new Promise(r => setTimeout(r, 2000))

    // Simulating real data â€” matches Dart mock values
    this.state.saturScore = 0.75
    this.state.trendData  = [10, 45, 32, 89, 54, 76, 95]
    this.state.isLoading  = false
    this.notify()  // tells UI to show new charts
  }
}

// â”€â”€ Singleton (matches Dart ChangeNotifierProvider) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const marketProvider = new MarketProvider()

// â”€â”€ React hook (replaces Dart Consumer<MarketProvider>) â”€â”€â”€â”€â”€â”€â”€
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
