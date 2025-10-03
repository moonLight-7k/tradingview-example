import React from 'react';
import TradingViewWidget from '@/components/TradingViewWidget';
import WatchlistSection from '@/components/features/watchlist-section';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

export default async function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">

            {/* Ticker Tape */}
            <div className="mb-8">
                <TradingViewWidget
                    scriptUrl="https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js"
                    config={{
                        symbols: [
                            { proName: "FOREXCOM:SPXUSD", title: "S&P 500 Index" },
                            { proName: "FOREXCOM:NSXUSD", title: "US 100 Cash CFD" },
                            { proName: "FX_IDC:EURUSD", title: "EUR to USD" },
                            { proName: "BITSTAMP:BTCUSD", title: "Bitcoin" },
                            { proName: "BITSTAMP:ETHUSD", title: "Ethereum" }
                        ],
                        showSymbolLogo: true,
                        isTransparent: true,
                        displayMode: "adaptive",
                        colorTheme: "dark",
                        locale: "en",


                    }}
                    height={56}
                    className="mb-2"
                />
            </div>



            {/* Market Overview Cards */}
            <section className="px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-300">S&P 500</CardTitle>
                                <TrendingUp className="h-4 w-4 text-emerald-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">4,567.89</div>
                                <p className="text-xs text-emerald-400">+2.1% from yesterday</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-300">NASDAQ</CardTitle>
                                <TrendingUp className="h-4 w-4 text-emerald-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">14,234.56</div>
                                <p className="text-xs text-emerald-400">+1.8% from yesterday</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-300">DOW</CardTitle>
                                <TrendingDown className="h-4 w-4 text-red-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">34,567.12</div>
                                <p className="text-xs text-red-400">-0.5% from yesterday</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-slate-800/50 border-slate-700">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-300">VIX</CardTitle>
                                <BarChart3 className="h-4 w-4 text-yellow-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-white">18.45</div>
                                <p className="text-xs text-yellow-400">+3.2% volatility</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Watchlist Section */}
            <WatchlistSection />

            {/* TradingView Widgets Section */}
            <section className="px-4 py-12 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">



                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                        {/* Market Overview Widget */}
                        <Card className="bg-slate-800/30 border-slate-700 overflow-hidden">

                            <CardContent className="p-0">
                                <TradingViewWidget
                                    scriptUrl="https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js"
                                    config={{
                                        colorTheme: "dark",
                                        dateRange: "12M",
                                        showChart: true,
                                        locale: "en",
                                        largeChartUrl: "",
                                        isTransparent: false,
                                        showSymbolLogo: true,
                                        showFloatingTooltip: false,
                                        width: "100%",
                                        height: "660",
                                        plotLineColorGrowing: "rgba(41, 98, 255, 1)",
                                        plotLineColorFalling: "rgba(41, 98, 255, 1)",
                                        gridLineColor: "rgba(240, 243, 250, 0)",
                                        scaleFontColor: "rgba(120, 123, 134, 1)",
                                        belowLineFillColorGrowing: "rgba(41, 98, 255, 0.12)",
                                        belowLineFillColorFalling: "rgba(41, 98, 255, 0.12)",
                                        belowLineFillColorGrowingBottom: "rgba(41, 98, 255, 0)",
                                        belowLineFillColorFallingBottom: "rgba(41, 98, 255, 0)",
                                        symbolActiveColor: "rgba(41, 98, 255, 0.12)",
                                        tabs: [
                                            {
                                                title: "Indices",
                                                symbols: [
                                                    { s: "FOREXCOM:SPXUSD", d: "S&P 500 Index" },
                                                    { s: "FOREXCOM:NSXUSD", d: "US 100 Cash CFD" },
                                                    { s: "FOREXCOM:DJI", d: "Dow Jones Industrial Average Index" },
                                                    { s: "INDEX:NKY", d: "Nikkei 225" },
                                                    { s: "INDEX:DEU40", d: "DAX Index" },
                                                    { s: "FOREXCOM:UKXGBP", d: "FTSE 100 Index" }
                                                ],
                                                originalTitle: "Indices"
                                            },
                                            {
                                                title: "Futures",
                                                symbols: [
                                                    { s: "CME_MINI:ES1!", d: "S&P 500" },
                                                    { s: "CME:6E1!", d: "Euro" },
                                                    { s: "COMEX:GC1!", d: "Gold" },
                                                    { s: "NYMEX:CL1!", d: "WTI Crude Oil" },
                                                    { s: "NYMEX:NG1!", d: "Gas" },
                                                    { s: "CBOT:ZC1!", d: "Corn" }
                                                ],
                                                originalTitle: "Futures"
                                            },
                                            {
                                                title: "Bonds",
                                                symbols: [
                                                    { s: "CBOT:ZB1!", d: "T-Bond" },
                                                    { s: "CBOT:UB1!", d: "Ultra T-Bond" },
                                                    { s: "EUREX:FGBL1!", d: "Euro Bund" },
                                                    { s: "EUREX:FBTP1!", d: "Euro BTP" },
                                                    { s: "EUREX:FGBM1!", d: "Euro BOBL" }
                                                ],
                                                originalTitle: "Bonds"
                                            },
                                            {
                                                title: "Forex",
                                                symbols: [
                                                    { s: "FX:EURUSD", d: "EUR to USD" },
                                                    { s: "FX:GBPUSD", d: "GBP to USD" },
                                                    { s: "FX:USDJPY", d: "USD to JPY" },
                                                    { s: "FX:USDCHF", d: "USD to CHF" },
                                                    { s: "FX:AUDUSD", d: "AUD to USD" },
                                                    { s: "FX:USDCAD", d: "USD to CAD" }
                                                ],
                                                originalTitle: "Forex"
                                            }
                                        ]
                                    }}
                                    height={660}
                                />
                            </CardContent>
                        </Card>

                        {/* Stock Heatmap Widget */}
                        <Card className="bg-slate-800/30 border-slate-700 overflow-hidden">

                            <CardContent className="p-0">
                                <TradingViewWidget
                                    scriptUrl="https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js"
                                    config={{
                                        exchanges: [],
                                        dataSource: "SPX500",
                                        grouping: "sector",
                                        blockSize: "market_cap_basic",
                                        blockColor: "change",
                                        locale: "en",
                                        symbolUrl: "",
                                        colorTheme: "dark",
                                        hasTopBar: false,
                                        isDataSetEnabled: false,
                                        isZoomEnabled: true,
                                        hasSymbolTooltip: true,
                                        isMonoSize: false,
                                        width: "100%",
                                        height: "660"
                                    }}
                                    height={660}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Economic Calendar and Top Stories */}
                    <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
                        {/* Economic Calendar */}
                        <Card className="bg-slate-800/30 border-slate-700 overflow-hidden">
                            <CardHeader>
                                <CardTitle className="text-white">Economic Calendar</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <TradingViewWidget
                                    scriptUrl="https://s3.tradingview.com/external-embedding/embed-widget-events.js"
                                    config={{
                                        colorTheme: "dark",
                                        isTransparent: false,
                                        width: "100%",
                                        height: "400",
                                        locale: "en",
                                        importanceFilter: "-1,0,1",
                                        countryFilter: "us,eu,itm,ru,kr,de,tr,jp,ch,au,gb,in,fr,ca,br,mx"
                                    }}
                                    height={400}
                                />
                            </CardContent>
                        </Card>

                        {/* Top Stories */}
                        <Card className="bg-slate-800/30 border-slate-700 overflow-hidden">
                            <CardHeader>
                                <CardTitle className="text-white">Top Stories</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <TradingViewWidget
                                    scriptUrl="https://s3.tradingview.com/external-embedding/embed-widget-timeline.js"
                                    config={{
                                        feedMode: "market",
                                        market: "stock",
                                        isTransparent: false,
                                        displayMode: "regular",
                                        width: "100%",
                                        height: "400",
                                        colorTheme: "dark",
                                        locale: "en"
                                    }}
                                    height={400}
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>


        </div>
    );
}