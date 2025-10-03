'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { UserPreferences } from '@/types';

interface PreferencesFormProps {
    onComplete: (preferences: UserPreferences) => void;
    onSkip: () => void;
    isLoading?: boolean;
}

export function PreferencesForm({ onComplete, onSkip, isLoading }: PreferencesFormProps) {
    const [preferences, setPreferences] = useState<UserPreferences>({
        investmentGoals: '',
        riskTolerance: '',
        preferredIndustry: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onComplete(preferences);
    };

    const investmentGoalOptions = [
        'Growth',
        'Income',
        'Preservation',
        'Speculation',
    ];

    const riskToleranceOptions = [
        'Conservative',
        'Moderate',
        'Aggressive',
    ];

    const industryOptions = [
        'Technology',
        'Healthcare',
        'Finance',
        'Energy',
        'Consumer Goods',
        'Real Estate',
        'Manufacturing',
        'Other',
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Personalize Your Experience</CardTitle>
                <CardDescription>
                    Help us tailor content to your investment interests (optional)
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Investment Goals
                        </label>
                        <select
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            value={preferences.investmentGoals}
                            onChange={(e) =>
                                setPreferences({ ...preferences, investmentGoals: e.target.value })
                            }
                            disabled={isLoading}
                        >
                            <option value="">Select your goal</option>
                            {investmentGoalOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Risk Tolerance
                        </label>
                        <select
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            value={preferences.riskTolerance}
                            onChange={(e) =>
                                setPreferences({ ...preferences, riskTolerance: e.target.value })
                            }
                            disabled={isLoading}
                        >
                            <option value="">Select your risk tolerance</option>
                            {riskToleranceOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Preferred Industry
                        </label>
                        <select
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            value={preferences.preferredIndustry}
                            onChange={(e) =>
                                setPreferences({ ...preferences, preferredIndustry: e.target.value })
                            }
                            disabled={isLoading}
                        >
                            <option value="">Select your preferred industry</option>
                            {industryOptions.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                    </div>
                </CardContent>

                <CardFooter className="flex gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={onSkip}
                        disabled={isLoading}
                    >
                        Skip for now
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Complete Setup'}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
