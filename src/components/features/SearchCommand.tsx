"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { CommandDialog, CommandEmpty, CommandInput, CommandList } from "@/components/ui/command"
import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp } from "lucide-react";
import Link from "next/link";
import { searchStocks } from "@/lib/actions/finnhub.actions";
import type { SearchCommandProps, StockWithWatchlistStatus } from "@/types";

export default function SearchCommand({ renderAs = 'button', label = 'Search stocks', initialStocks }: SearchCommandProps) {
    const [open, setOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [loading, setLoading] = useState(false)
    const [stocks, setStocks] = useState<StockWithWatchlistStatus[]>(initialStocks);

    const isSearchMode = !!searchTerm.trim();
    const displayStocks = isSearchMode ? stocks : stocks?.slice(0, 10);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
                e.preventDefault()
                setOpen(v => !v)
            }
        }
        window.addEventListener("keydown", onKeyDown)
        return () => window.removeEventListener("keydown", onKeyDown)
    }, [])

    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const performSearch = useCallback(async (term: string) => {
        if (!term.trim()) {
            setStocks(initialStocks || []);
            return;
        }

        setLoading(true);
        try {
            const results = await searchStocks(term.trim());
            setStocks(results);
        } catch {
            setStocks([]);
        } finally {
            setLoading(false);
        }
    }, [initialStocks]);

    useEffect(() => {
        // Clear the existing timeout
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Set a new timeout for the search
        searchTimeoutRef.current = setTimeout(() => {
            performSearch(searchTerm);
        }, 300);

        // Cleanup function to clear timeout on unmount
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchTerm, performSearch]);

    const handleSelectStock = () => {
        setOpen(false);
        setSearchTerm("");
        setStocks(initialStocks);
    }

    return (
        <>
            {renderAs === 'text' ? (
                <span onClick={() => setOpen(true)} className="search-text">
                    {label}
                </span>
            ) : renderAs === 'input' ? (
                <div onClick={() => setOpen(true)} className="search-input-trigger">
                    <input
                        type="text"
                        placeholder="Search stocks..."
                        readOnly
                        className="search-input-field"
                    />
                    <span className="search-shortcut">⌘K</span>
                </div>
            ) : (
                <Button onClick={() => setOpen(true)} className="search-btn">
                    {label}
                </Button>
            )}
            <CommandDialog open={open} onOpenChange={setOpen} className="search-dialog">
                <div className="search-field">
                    <CommandInput
                        value={searchTerm}
                        onValueChange={setSearchTerm}
                        placeholder="Search stocks..."
                        className="search-input"
                    />
                    {loading && <Loader2 className="search-loader animate-spin" />}
                </div>
                <CommandList className="search-list">
                    {loading ? (
                        <CommandEmpty className="search-list-empty">Loading stocks...</CommandEmpty>
                    ) : displayStocks?.length === 0 ? (
                        <div className="search-list-indicator">
                            {isSearchMode ? 'No results found' : 'No stocks available'}
                        </div>
                    ) : (
                        <ul>
                            <div className="search-count">
                                {isSearchMode ? 'Search results' : 'Popular stocks'}
                                {` `}({displayStocks?.length || 0})
                            </div>
                            {displayStocks?.map((stock) => (
                                <li key={stock.symbol} className="search-item">
                                    <Link
                                        href={`/stocks/${stock.symbol}`}
                                        onClick={handleSelectStock}
                                        className="search-item-link"
                                    >
                                        <TrendingUp className="h-4 w-4 text-gray-500" />
                                        <div className="flex-1">
                                            <div className="search-item-name">
                                                {stock.name}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {stock.symbol} | {stock.exchange} | {stock.type}
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )
                    }
                </CommandList>
            </CommandDialog>
        </>
    )
}