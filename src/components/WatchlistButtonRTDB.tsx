"use client";
import React, { useMemo, useState } from "react";
import { useWatchlist } from "@/hooks/use-watchlist";
import { useAuth } from "@/hooks/use-auth";
import { logger } from "@/lib/logger";

const WatchlistButtonRTDB = ({
    symbol,
    company,
    isInWatchlist: propIsInWatchlist,
    showTrashIcon = false,
    type = "button",
    onWatchlistChange,
}: WatchlistButtonProps) => {
    const { isAuthenticated } = useAuth();
    const { addToWatchlist, removeFromWatchlist, isInWatchlist: hookIsInWatchlist } = useWatchlist();
    const [isLoading, setIsLoading] = useState(false);

    // Use hook's state if authenticated, otherwise use prop
    const isInWatchlistValue = isAuthenticated ? hookIsInWatchlist(symbol) : (propIsInWatchlist || false);

    const label = useMemo(() => {
        if (type === "icon") return "";
        return isInWatchlistValue ? "Remove from Watchlist" : "Add to Watchlist";
    }, [isInWatchlistValue, type]);

    const handleClick = async () => {
        if (!isAuthenticated) {
            // For non-authenticated users, just call the callback
            onWatchlistChange?.(symbol, !isInWatchlistValue);
            return;
        }

        setIsLoading(true);

        try {
            if (isInWatchlistValue) {
                await removeFromWatchlist(symbol);
                onWatchlistChange?.(symbol, false);
                logger.info('Removed from watchlist (Firestore)', { symbol });
            } else {
                await addToWatchlist(symbol, company);
                onWatchlistChange?.(symbol, true);
                logger.info('Added to watchlist (Firestore)', { symbol, company });
            }
        } catch (error) {
            logger.error('Failed to update watchlist (Firestore)', {
                error,
                symbol,
                action: isInWatchlistValue ? 'remove' : 'add'
            });
            // You could show a toast notification here
        } finally {
            setIsLoading(false);
        }
    };

    if (type === "icon") {
        return (
            <button
                title={isInWatchlistValue ? `Remove ${symbol} from watchlist` : `Add ${symbol} to watchlist`}
                aria-label={isInWatchlistValue ? `Remove ${symbol} from watchlist` : `Add ${symbol} to watchlist`}
                className={`watchlist-icon-btn ${isInWatchlistValue ? "watchlist-icon-added" : ""}`}
                onClick={handleClick}
                disabled={isLoading}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill={isInWatchlistValue ? "#FACC15" : "none"}
                    stroke="#FACC15"
                    strokeWidth="1.5"
                    className="watchlist-star"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.385a.563.563 0 00-.182-.557L3.04 10.385a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345l2.125-5.111z"
                    />
                </svg>
            </button>
        );
    }

    return (
        <button
            className={`watchlist-btn ${isInWatchlistValue ? "watchlist-remove" : ""}`}
            onClick={handleClick}
            disabled={isLoading}
        >
            {showTrashIcon && isInWatchlistValue ? (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5 mr-2"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-7 4v6m4-6v6m4-6v6" />
                </svg>
            ) : null}
            <span>{isLoading ? 'Loading...' : label}</span>
        </button>
    );
};

export default WatchlistButtonRTDB;