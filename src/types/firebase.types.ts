// Common Firebase Types and Interfaces

import { DocumentSnapshot, OrderByDirection, WhereFilterOp } from "firebase/firestore";
import { FullMetadata, UploadMetadata } from "firebase/storage";



// Firestore Types
export interface FirestoreDocument {
    id: string;
    createdAt?: Date | FirebaseTimestamp;
    updatedAt?: Date | FirebaseTimestamp;
}

export interface FirebaseTimestamp {
    seconds: number;
    nanoseconds: number;
}

// Firestore User Document Types
export interface FirestoreUser extends FirestoreDocument {
    name: string;
    email: string;
    age?: number;
    status?: 'active' | 'inactive' | 'pending';
    role?: 'user' | 'admin' | 'moderator';
    avatar?: string;
    bio?: string;
    lastLogin?: Date | FirebaseTimestamp;
}

// Product Types
export interface Product extends FirestoreDocument {
    name: string;
    description?: string;
    price: number;
    currency?: string;
    category?: string;
    stock?: number;
    imageUrl?: string;
    tags?: string[];
}

// Post Types
export interface Post extends FirestoreDocument {
    title: string;
    content: string;
    authorId: string;
    authorName?: string;
    status: 'draft' | 'published' | 'archived';
    views?: number;
    likes?: number;
    comments?: number;
    tags?: string[];
    publishedAt?: Date | FirebaseTimestamp;
}

// Message Types (for Realtime DB)
export interface Message {
    id?: string;
    text: string;
    senderId: string;
    senderName?: string;
    timestamp: number;
    edited?: boolean;
    reactions?: Record<string, string[]>; // emoji -> userId[]
}

// Chat Room Types (for Realtime DB)
export interface ChatRoom {
    id?: string;
    name: string;
    description?: string;
    createdBy: string;
    createdAt: number;
    members: Record<string, boolean>; // userId -> true
    lastMessage?: {
        text: string;
        timestamp: number;
        senderId: string;
    };
}

// Notification Types
export interface Notification extends FirestoreDocument {
    userId: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
    actionUrl?: string;
    imageUrl?: string;
}

// Settings Types (for Realtime DB)
export interface UserSettings {
    notifications: {
        email: boolean;
        push: boolean;
        sms: boolean;
    };
    privacy: {
        profileVisible: boolean;
        showEmail: boolean;
        showActivity: boolean;
    };
    theme: 'light' | 'dark' | 'auto';
    language: string;
}

// Analytics/Stats Types (for Realtime DB)
export interface SiteStats {
    totalUsers: number;
    activeUsers: number;
    totalPosts: number;
    totalViews: number;
    lastUpdated: number;
}

// Project Types
export interface Project extends FirestoreDocument {
    name: string;
    description: string;
    ownerId: string;
    members: string[];
    status: 'planning' | 'in-progress' | 'completed' | 'archived';
    startDate?: Date | FirebaseTimestamp;
    endDate?: Date | FirebaseTimestamp;
    tags?: string[];
    progress?: number;
}

// Task Types
export interface Task extends FirestoreDocument {
    title: string;
    description?: string;
    projectId: string;
    assignedTo?: string[];
    status: 'todo' | 'in-progress' | 'review' | 'done';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    dueDate?: Date | FirebaseTimestamp;
    completedAt?: Date | FirebaseTimestamp;
    tags?: string[];
}

// Comment Types
export interface Comment extends FirestoreDocument {
    content: string;
    authorId: string;
    authorName?: string;
    postId: string;
    parentCommentId?: string; // For nested comments
    likes?: number;
    edited?: boolean;
}

// Activity Log Types (for Realtime DB)
export interface ActivityLog {
    id?: string;
    userId: string;
    userName?: string;
    action: string;
    resourceType: 'user' | 'post' | 'comment' | 'project' | 'task';
    resourceId: string;
    timestamp: number;
    metadata?: Record<string, unknown>;
}

// Pagination Result Type
export interface PaginatedResult<T> {
    data: T[];
    hasMore: boolean;
    total?: number;
    page?: number;
    pageSize?: number;
}

// Query Builder Helper Types
export type OrderDirection = 'asc' | 'desc';
export type WhereOperator = '==' | '!=' | '<' | '<=' | '>' | '>=' | 'array-contains' | 'in' | 'array-contains-any' | 'not-in';

// Error Types
export interface FirebaseError extends Error {
    code: string;
    details?: unknown;
}

// Response Types
export interface FirebaseResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    timestamp: number;
}

// Batch Operation Types
export interface BatchCreateOperation<T> {
    type: 'create';
    data: T;
    id?: string;
}

export interface BatchUpdateOperation<T> {
    type: 'update';
    id: string;
    data: Partial<T>;
}

export interface BatchDeleteOperation {
    type: 'delete';
    id: string;
}

export type BatchOperation<T> =
    | BatchCreateOperation<T>
    | BatchUpdateOperation<T>
    | BatchDeleteOperation;

// Hook Return Types
export interface UseFirestoreResult<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
}

export interface UseFirestoreListResult<T> {
    data: T[];
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
    hasMore?: boolean;
    loadMore?: () => Promise<void>;
}

// Real-time Presence Types (for Realtime DB)
export interface UserPresence {
    userId: string;
    status: 'online' | 'offline' | 'away';
    lastSeen: number;
    connections?: Record<string, boolean>; // connectionId -> true
}

// File Upload Types
export interface FileMetadata {
    name: string;
    size: number;
    type: string;
    url: string;
    uploadedAt: Date | FirebaseTimestamp;
    uploadedBy: string;
}

// Storage Types
export interface StorageFileInfo {
    name: string;
    fullPath: string;
    size: number;
    contentType?: string;
    timeCreated: string;
    updated: string;
    downloadURL: string;
    metadata?: Record<string, unknown>;
}

export interface StorageUploadOptions {
    metadata?: {
        contentType?: string;
        customMetadata?: Record<string, string>;
    };
    onProgress?: (progress: number) => void;
    onError?: (error: Error) => void;
    onComplete?: (downloadURL: string) => void;
}

export interface StorageUploadProgress {
    bytesTransferred: number;
    totalBytes: number;
    progress: number;
    state: 'running' | 'paused' | 'success' | 'canceled' | 'error';
}

export interface StorageFolder {
    name: string;
    fullPath: string;
}

// Storage validation result
export interface ValidationResult {
    valid: boolean;
    error?: string;
}

// Hook for storage upload
export interface UseStorageUploadResult {
    upload: (path: string, file: File) => Promise<string>;
    progress: number;
    uploading: boolean;
    error: Error | null;
    downloadURL: string;
    reset: () => void;
}



// Types
export interface UploadOptions {
    metadata?: UploadMetadata;
    onProgress?: (progress: number) => void;
    onError?: (error: Error) => void;
    onComplete?: (downloadURL: string) => void;
}

export interface FileInfo {
    name: string;
    fullPath: string;
    size: number;
    contentType?: string;
    timeCreated: string;
    updated: string;
    downloadURL: string;
    metadata?: FullMetadata;
}

export interface UploadProgress {
    bytesTransferred: number;
    totalBytes: number;
    progress: number;
    state: 'running' | 'paused' | 'success' | 'canceled' | 'error';
}




// Types
export interface RealtimeQueryOptions {
    orderBy?: {
        type: 'child' | 'key' | 'value';
        childKey?: string; // Required when type is 'child'
    };
    limit?: {
        type: 'first' | 'last';
        count: number;
    };
    startAt?: string | number | boolean | null;
    endAt?: string | number | boolean | null;
    equalTo?: string | number | boolean | null;
}

export interface RealtimeSubscriptionOptions extends RealtimeQueryOptions {
    eventType?: 'value' | 'child_added' | 'child_changed' | 'child_removed' | 'child_moved';
}



// Types
export interface QueryOptions {
    whereConditions?: Array<{
        field: string;
        operator: WhereFilterOp;
        value: unknown;
    }>;
    orderByFields?: Array<{
        field: string;
        direction?: OrderByDirection;
    }>;
    limitCount?: number;
    startAfterDoc?: DocumentSnapshot;
    endBeforeDoc?: DocumentSnapshot;
}

export interface PaginationOptions {
    pageSize: number;
    lastDoc?: DocumentSnapshot;
    direction?: 'next' | 'previous';
}
