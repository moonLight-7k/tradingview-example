// Custom User Profile types (extends Firebase Auth User)
export interface UserPreferences {
    investmentGoals?: string;
    riskTolerance?: string;
    preferredIndustry?: string;
}

export interface UserProfile {
    id: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    createdAt: string;
    updatedAt: string;
    preferences?: UserPreferences;
}