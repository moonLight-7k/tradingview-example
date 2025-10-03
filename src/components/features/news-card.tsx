'use client';

import Image from 'next/image';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, Clock, Building } from 'lucide-react';

interface NewsCardProps {
    article: RawNewsArticle;
    variant?: 'default' | 'featured';
}

export function NewsCard({ article, variant = 'default' }: NewsCardProps) {
    const {
        headline,
        summary,
        source,
        url,
        datetime,
        image,
        category,
        related
    } = article;

    const formatDate = (timestamp?: number) => {
        if (!timestamp) return 'Recently';
        try {
            return formatDistanceToNow(new Date(timestamp * 1000), { addSuffix: true });
        } catch {
            return 'Recently';
        }
    };

    const handleCardClick = () => {
        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    const isFeatured = variant === 'featured';

    return (
        <Card
            className={`group cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-border/50 ${isFeatured ? 'md:col-span-2 md:row-span-2' : ''
                }`}
            onClick={handleCardClick}
        >
            <CardHeader className="p-0">
                {image && (
                    <div className={`relative overflow-hidden rounded-t-lg ${isFeatured ? 'h-64 md:h-80' : 'h-48'
                        }`}>
                        <Image
                            src={image}
                            alt={headline || 'News image'}
                            fill
                            className="object-cover transition-transform duration-200 group-hover:scale-105"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute top-4 right-4">
                            <ExternalLink className="h-4 w-4 text-white opacity-75" />
                        </div>
                        {category && (
                            <div className="absolute top-4 left-4">
                                <span className="bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-full">
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </CardHeader>

            <CardContent className={`p-4 ${isFeatured ? 'md:p-6' : ''}`}>
                <div className="space-y-3">
                    {headline && (
                        <h3 className={`font-semibold text-foreground group-hover:text-blue-600 transition-colors line-clamp-2 ${isFeatured ? 'text-xl md:text-2xl' : 'text-lg'
                            }`}>
                            {headline}
                        </h3>
                    )}

                    {summary && (
                        <p className={`text-muted-foreground leading-relaxed ${isFeatured ? 'line-clamp-4 text-base' : 'line-clamp-3 text-sm'
                            }`}>
                            {summary}
                        </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            {source && (
                                <div className="flex items-center space-x-1">
                                    <Building className="h-3 w-3" />
                                    <span className="font-medium">{source}</span>
                                </div>
                            )}
                            <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatDate(datetime)}</span>
                            </div>
                        </div>

                        {related && (
                            <div className="flex items-center space-x-1">
                                <span className="text-xs text-muted-foreground">Related:</span>
                                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                    {related}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}