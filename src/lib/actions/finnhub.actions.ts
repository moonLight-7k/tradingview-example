'use server';

import { POPULAR_STOCK_SYMBOLS } from '@/lib/Constants';
import { cache } from 'react';
import type {
    StockWithWatchlistStatus,
    FinnhubSearchResult,
    FinnhubSearchResponse,
    QuoteData,
    ProfileData,
    CryptoData,
    CryptoPriceData
} from '@/types';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const NEXT_PUBLIC_FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY ?? '';

async function fetchJSON<T>(url: string, revalidateSeconds?: number): Promise<T> {
    try {
        const response = await fetch(url, {
            next: revalidateSeconds ? { revalidate: revalidateSeconds } : undefined,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

export { fetchJSON };

export const searchStocks = cache(async (query?: string): Promise<StockWithWatchlistStatus[]> => {
    try {
        const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
        if (!token) {
            console.error('Error in stock search:', new Error('FINNHUB API key is not configured'));
            return [];
        }

        const trimmed = typeof query === 'string' ? query.trim() : '';
        let results: FinnhubSearchResult[] = [];

        if (!trimmed) {
            // Fetch top 10 popular symbols' profiles
            const top = POPULAR_STOCK_SYMBOLS.slice(0, 10);
            const profiles = await Promise.all(
                top.map(async (sym) => {
                    try {
                        const url = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${encodeURIComponent(sym)}&token=${token}`;
                        const profile = await fetchJSON<ProfileData>(url, 3600);
                        return { sym, profile };
                    } catch (e) {
                        console.error('Error fetching profile2 for', sym, e);
                        return { sym, profile: null };
                    }
                })
            );

            results = profiles
                .map(({ sym, profile }) => {
                    const symbol = sym.toUpperCase();
                    const name: string | undefined = profile?.name || profile?.ticker || undefined;
                    const exchange: string | undefined = profile?.exchange || undefined;
                    if (!name) return undefined;
                    const r: FinnhubSearchResult & { __exchange?: string } = {
                        symbol,
                        description: name,
                        displaySymbol: symbol,
                        type: 'Common Stock',
                        __exchange: exchange,
                    };
                    return r;
                })
                .filter((x): x is FinnhubSearchResult & { __exchange?: string } => Boolean(x));
        } else {
            const url = `${FINNHUB_BASE_URL}/search?q=${encodeURIComponent(trimmed)}&token=${token}`;
            const data = await fetchJSON<FinnhubSearchResponse>(url, 1800);
            results = Array.isArray(data?.result) ? data.result : [];
        }

        const mapped: StockWithWatchlistStatus[] = results
            .map((r) => {
                const upper = (r.symbol || '').toUpperCase();
                const name = r.description || upper;
                const exchangeFromDisplay = (r.displaySymbol as string | undefined) || undefined;
                const exchangeFromProfile = (r as FinnhubSearchResult & { __exchange?: string }).__exchange;
                const exchange = exchangeFromDisplay || exchangeFromProfile || 'US';
                const type = r.type || 'Stock';
                const item: StockWithWatchlistStatus = {
                    symbol: upper,
                    name,
                    exchange,
                    type,
                    isInWatchlist: false,
                };
                return item;
            })
            .slice(0, 15);

        return mapped;
    } catch (err) {
        console.error('Error in stock search:', err);
        return [];
    }
});

export async function getStockQuote(symbol: string): Promise<QuoteData | null> {
    try {
        const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
        if (!token) {
            console.error('FINNHUB API key is not configured');
            return null;
        }

        const url = `${FINNHUB_BASE_URL}/quote?symbol=${encodeURIComponent(symbol)}&token=${token}`;
        const quote = await fetchJSON<QuoteData>(url, 300);
        return quote;
    } catch (error) {
        console.error('Error fetching stock quote:', error);
        return null;
    }
}

export async function getStockProfile(symbol: string): Promise<ProfileData | null> {
    try {
        const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
        if (!token) {
            console.error('FINNHUB API key is not configured');
            return null;
        }

        const url = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${token}`;
        const profile = await fetchJSON<ProfileData>(url, 3600);
        return profile;
    } catch (error) {
        console.error('Error fetching stock profile:', error);
        return null;
    }
}

// News-related functions
export async function getGeneralNews(category?: string): Promise<RawNewsArticle[]> {
    try {
        const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
        if (!token) {
            console.error('FINNHUB API key is not configured');
            return [];
        }

        const categoryParam = category ? `&category=${encodeURIComponent(category)}` : '';
        const url = `${FINNHUB_BASE_URL}/news?category=general${categoryParam}&token=${token}`;
        const news = await fetchJSON<RawNewsArticle[]>(url, 300); // Cache for 5 minutes

        return news.slice(0, 20); // Return top 20 articles
    } catch (error) {
        console.error('Error fetching general news:', error);
        return [];
    }
}

export async function getCompanyNews(symbol: string, from?: string, to?: string): Promise<RawNewsArticle[]> {
    try {
        const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
        if (!token) {
            console.error('FINNHUB API key is not configured');
            return [];
        }

        const today = new Date();
        const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        const fromDate = from || oneWeekAgo.toISOString().split('T')[0];
        const toDate = to || today.toISOString().split('T')[0];

        const url = `${FINNHUB_BASE_URL}/company-news?symbol=${encodeURIComponent(symbol)}&from=${fromDate}&to=${toDate}&token=${token}`;
        const news = await fetchJSON<RawNewsArticle[]>(url, 300);

        return news.slice(0, 10); // Return top 10 articles
    } catch (error) {
        console.error('Error fetching company news:', error);
        return [];
    }
}

export async function getTrendingNews(): Promise<RawNewsArticle[]> {
    try {
        const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
        if (!token) {
            console.error('FINNHUB API key is not configured');
            return [];
        }

        // Fetch news from multiple categories to get trending topics
        const categories = ['general', 'forex', 'crypto', 'merger'];
        const newsPromises = categories.map(category =>
            fetchJSON<RawNewsArticle[]>(`${FINNHUB_BASE_URL}/news?category=${category}&token=${token}`, 300)
                .catch(() => [])
        );

        const allNews = await Promise.all(newsPromises);
        const combinedNews = allNews.flat();

        // Sort by datetime (most recent first) and remove duplicates
        const uniqueNews = combinedNews
            .filter((article, index, self) =>
                index === self.findIndex(a => a.headline === article.headline)
            )
            .sort((a, b) => (b.datetime || 0) - (a.datetime || 0))
            .slice(0, 50); // Return top 50 trending articles

        return uniqueNews;
    } catch (error) {
        console.error('Error fetching trending news:', error);
        return [];
    }
}

// Crypto-related functions
export async function getCryptoQuote(symbol: string): Promise<CryptoPriceData | null> {
    try {
        const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
        if (!token) {
            console.error('FINNHUB API key is not configured');
            return null;
        }

        const url = `${FINNHUB_BASE_URL}/quote?symbol=${encodeURIComponent(symbol)}&token=${token}`;
        const quote = await fetchJSON<CryptoPriceData>(url, 300);
        return quote;
    } catch (error) {
        console.error('Error fetching crypto quote:', error);
        return null;
    }
}

export async function getTopCryptoGainers(): Promise<CryptoData[]> {
    try {
        const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
        if (!token) {
            console.error('FINNHUB API key is not configured');
            return [];
        }

        // Get popular crypto symbols and their quotes
        const { POPULAR_CRYPTO_SYMBOLS } = await import('@/lib/Constants');
        const cryptoPromises = POPULAR_CRYPTO_SYMBOLS.map(async (symbol) => {
            try {
                const quote = await getCryptoQuote(symbol);
                if (!quote || !quote.c) return null;

                const name = symbol.replace('BINANCE:', '').replace('USDT', '');
                return {
                    symbol: name,
                    name: name,
                    price: quote.c,
                    change: quote.d || 0,
                    changePercent: quote.dp || 0,
                    high24h: quote.h,
                    low24h: quote.l,
                } as CryptoData;
            } catch (error) {
                console.error(`Error fetching quote for ${symbol}:`, error);
                return null;
            }
        });

        const cryptoData = await Promise.all(cryptoPromises);
        const validCryptos = cryptoData.filter((crypto): crypto is CryptoData => crypto !== null);

        // Sort by change percent (descending) to get top gainers
        return validCryptos
            .sort((a, b) => (b.changePercent || 0) - (a.changePercent || 0))
            .slice(0, 10);
    } catch (error) {
        console.error('Error fetching top crypto gainers:', error);
        return [];
    }
}

export async function getTopCryptoLosers(): Promise<CryptoData[]> {
    try {
        const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
        if (!token) {
            console.error('FINNHUB API key is not configured');
            return [];
        }

        // Get popular crypto symbols and their quotes
        const { POPULAR_CRYPTO_SYMBOLS } = await import('@/lib/Constants');
        const cryptoPromises = POPULAR_CRYPTO_SYMBOLS.map(async (symbol) => {
            try {
                const quote = await getCryptoQuote(symbol);
                if (!quote || !quote.c) return null;

                const name = symbol.replace('BINANCE:', '').replace('USDT', '');
                return {
                    symbol: name,
                    name: name,
                    price: quote.c,
                    change: quote.d || 0,
                    changePercent: quote.dp || 0,
                    high24h: quote.h,
                    low24h: quote.l,
                } as CryptoData;
            } catch (error) {
                console.error(`Error fetching quote for ${symbol}:`, error);
                return null;
            }
        });

        const cryptoData = await Promise.all(cryptoPromises);
        const validCryptos = cryptoData.filter((crypto): crypto is CryptoData => crypto !== null);

        // Sort by change percent (ascending) to get top losers
        return validCryptos
            .sort((a, b) => (a.changePercent || 0) - (b.changePercent || 0))
            .slice(0, 10);
    } catch (error) {
        console.error('Error fetching top crypto losers:', error);
        return [];
    }
}

export async function getTrendingCrypto(): Promise<CryptoData[]> {
    try {
        const token = process.env.FINNHUB_API_KEY ?? NEXT_PUBLIC_FINNHUB_API_KEY;
        if (!token) {
            console.error('FINNHUB API key is not configured');
            return [];
        }

        // Get popular crypto symbols and their quotes
        const { POPULAR_CRYPTO_SYMBOLS } = await import('@/lib/Constants');
        const cryptoPromises = POPULAR_CRYPTO_SYMBOLS.map(async (symbol) => {
            try {
                const quote = await getCryptoQuote(symbol);
                if (!quote || !quote.c) return null;

                const name = symbol.replace('BINANCE:', '').replace('USDT', '');
                return {
                    symbol: name,
                    name: name,
                    price: quote.c,
                    change: quote.d || 0,
                    changePercent: quote.dp || 0,
                    high24h: quote.h,
                    low24h: quote.l,
                } as CryptoData;
            } catch (error) {
                console.error(`Error fetching quote for ${symbol}:`, error);
                return null;
            }
        });

        const cryptoData = await Promise.all(cryptoPromises);
        const validCryptos = cryptoData.filter((crypto): crypto is CryptoData => crypto !== null);

        // Sort by absolute change percent to get most trending (most volatile)
        return validCryptos
            .sort((a, b) => Math.abs(b.changePercent || 0) - Math.abs(a.changePercent || 0))
            .slice(0, 15);
    } catch (error) {
        console.error('Error fetching trending crypto:', error);
        return [];
    }
}