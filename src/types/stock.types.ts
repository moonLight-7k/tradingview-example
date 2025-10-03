// Stock types
export interface Stock {
    symbol: string;
    name: string;
    exchange: string;
    type: string;
}

export interface StockWithWatchlistStatus extends Stock {
    isInWatchlist: boolean;
}

// Finnhub API types
export interface FinnhubSearchResult {
    symbol: string;
    description: string;
    displaySymbol?: string;
    type: string;
}

export interface FinnhubSearchResponse {
    count: number;
    result: FinnhubSearchResult[];
}

export interface QuoteData {
    c?: number; // current price
    dp?: number; // change percent
    d?: number; // change
    h?: number; // high
    l?: number; // low
    o?: number; // open
    pc?: number; // previous close
}

export interface ProfileData {
    name?: string;
    ticker?: string;
    exchange?: string;
    marketCapitalization?: number;
    shareOutstanding?: number;
    logo?: string;
    weburl?: string;
    country?: string;
    currency?: string;
    ipo?: string;
    finnhubIndustry?: string;
}

// Crypto types
export interface CryptoData {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    volume?: number;
    marketCap?: number;
    high24h?: number;
    low24h?: number;
}

export interface CryptoPriceData {
    c?: number; // current price
    dp?: number; // change percent
    d?: number; // change
    h?: number; // high
    l?: number; // low
    o?: number; // open
    pc?: number; // previous close
    t?: number; // timestamp
}

// Component props types
export interface SearchCommandProps {
    renderAs?: 'button' | 'text' | 'input';
    label?: string;
    initialStocks: StockWithWatchlistStatus[];
}

export interface CryptoListProps {
    title: string;
    cryptos: CryptoData[];
    isLoading?: boolean;
}

// Page props
export interface StockDetailsPageProps {
    params: Promise<{
        symbol: string;
    }>;
}