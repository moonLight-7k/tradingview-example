'use client';

import { useState, useEffect } from 'react';
import { getTrendingNews, getGeneralNews } from '@/lib/actions/finnhub.actions';
import { NewsCard } from '@/components/features/news-card';
import { NewsErrorBoundary } from '@/components/features/news-error-boundary';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, TrendingUp, Clock, RefreshCw } from 'lucide-react';
import { useDebounceValue } from '@/hooks/useDebounceValue';

const NEWS_CATEGORIES = [
    { value: 'all', label: 'All News', icon: TrendingUp },
    { value: 'general', label: 'General', icon: Clock },
    { value: 'forex', label: 'Forex', icon: TrendingUp },
    { value: 'crypto', label: 'Crypto', icon: TrendingUp },
    { value: 'merger', label: 'M&A', icon: TrendingUp },
];

const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'relevance', label: 'Most Relevant' },
];

function NewsPageContent() {
    const [articles, setArticles] = useState<RawNewsArticle[]>([]);
    const [filteredArticles, setFilteredArticles] = useState<RawNewsArticle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [isRefreshing, setIsRefreshing] = useState(false);

    const debouncedSearchQuery = useDebounceValue(searchQuery, 300);

    const fetchNews = async (refresh = false) => {
        if (refresh) setIsRefreshing(true);
        setIsLoading(true);

        try {
            let newsData: RawNewsArticle[] = [];

            if (selectedCategory === 'all') {
                newsData = await getTrendingNews();
            } else {
                newsData = await getGeneralNews(selectedCategory);
            }

            setArticles(newsData);
        } catch (error) {
            console.error('Error fetching news:', error);
            setArticles([]);
        } finally {
            setIsLoading(false);
            if (refresh) setIsRefreshing(false);
        }
    };

    // Filter and sort articles
    useEffect(() => {
        let filtered = [...articles];

        // Apply search filter
        if (debouncedSearchQuery.trim()) {
            const query = debouncedSearchQuery.toLowerCase();
            filtered = filtered.filter(article =>
                article.headline?.toLowerCase().includes(query) ||
                article.summary?.toLowerCase().includes(query) ||
                article.source?.toLowerCase().includes(query)
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'oldest':
                    return (a.datetime || 0) - (b.datetime || 0);
                case 'newest':
                default:
                    return (b.datetime || 0) - (a.datetime || 0);
                case 'relevance':
                    // Sort by headline length as a simple relevance metric
                    return (b.headline?.length || 0) - (a.headline?.length || 0);
            }
        });

        setFilteredArticles(filtered);
    }, [articles, debouncedSearchQuery, sortBy]);

    // Fetch news on mount and category change
    useEffect(() => {
        fetchNews();
    }, [selectedCategory]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleRefresh = () => {
        fetchNews(true);
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Market News</h1>
                        <p className="text-muted-foreground">
                            Stay updated with the latest financial news and market trends
                        </p>
                    </div>
                    <Button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-2"
                    >
                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        <span>Refresh</span>
                    </Button>
                </div>
            </div>

            {/* Filters and Search */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Filter className="h-5 w-5" />
                        <span>Filters & Search</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search news articles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Category Filter */}
                        <div className="flex flex-wrap gap-2">
                            {NEWS_CATEGORIES.map((category) => {
                                const IconComponent = category.icon;
                                return (
                                    <Button
                                        key={category.value}
                                        variant={selectedCategory === category.value ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setSelectedCategory(category.value)}
                                        className="flex items-center space-x-1"
                                    >
                                        <IconComponent className="h-3 w-3" />
                                        <span>{category.label}</span>
                                    </Button>
                                );
                            })}
                        </div>

                        {/* Sort Options */}
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-muted-foreground whitespace-nowrap">Sort by:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-background border border-border rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {SORT_OPTIONS.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Results Info */}
            {!isLoading && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                        Showing {filteredArticles.length} of {articles.length} articles
                        {debouncedSearchQuery && ` for "${debouncedSearchQuery}"`}
                    </span>
                    <span>
                        Category: {NEWS_CATEGORIES.find(cat => cat.value === selectedCategory)?.label}
                    </span>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <Card key={index} className="animate-pulse">
                            <CardHeader className="p-0">
                                <div className="h-48 bg-muted rounded-t-lg"></div>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3">
                                <div className="h-4 bg-muted rounded w-3/4"></div>
                                <div className="h-3 bg-muted rounded w-full"></div>
                                <div className="h-3 bg-muted rounded w-2/3"></div>
                                <div className="flex justify-between items-center pt-2">
                                    <div className="h-3 bg-muted rounded w-20"></div>
                                    <div className="h-3 bg-muted rounded w-16"></div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* News Grid */}
            {!isLoading && filteredArticles.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredArticles.map((article, index) => (
                        <NewsCard
                            key={article.id || index}
                            article={article}
                            variant={index === 0 ? 'featured' : 'default'}
                        />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredArticles.length === 0 && (
                <Card className="text-center py-12">
                    <CardContent>
                        <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">No news articles found</h3>
                        <p className="text-muted-foreground mb-4">
                            {debouncedSearchQuery
                                ? `No articles match your search for "${debouncedSearchQuery}"`
                                : 'No news articles available at the moment'
                            }
                        </p>
                        <Button onClick={handleRefresh} variant="outline">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Try Refreshing
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default function NewsPage() {
    return (
        <NewsErrorBoundary>
            <NewsPageContent />
        </NewsErrorBoundary>
    );
}