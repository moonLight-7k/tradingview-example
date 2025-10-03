import {
    getDatabase,
    ref,
    set,
    get,
    update,
    remove,
    push,
    onValue,
    off,
    query,
    orderByChild,
    orderByKey,
    orderByValue,
    limitToFirst,
    limitToLast,
    startAt,
    endAt,
    equalTo,
    type Database,
    type DatabaseReference,
    type Query,
    type DataSnapshot,
    type Unsubscribe,
    serverTimestamp,
    child,
    runTransaction as rtdbRunTransaction,
} from 'firebase/database';
import { app } from '@/lib/firebase';
import { RealtimeQueryOptions, RealtimeSubscriptionOptions } from '@/types';

// Initialize Realtime Database
let rtdb: Database;
if (typeof window !== 'undefined') {
    try {
        rtdb = getDatabase(app);
        console.log('🔥 Firebase Realtime Database initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize Firebase Realtime Database:', error);
        throw error;
    }
}

// CREATE Operations
/**
 * Set data at a specific path (overwrites existing data)
 */
export async function setData<T = Record<string, unknown>>(
    path: string,
    data: T
): Promise<void> {
    try {
        if (!rtdb) {
            throw new Error('Firebase Realtime Database not initialized. Make sure NEXT_PUBLIC_FIREBASE_DATABASE_URL is set.');
        }

        console.log('🔥 Setting data at path:', path, 'with data:', data);
        const dbRef = ref(rtdb, path);
        await set(dbRef, {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        console.log('✅ Data set successfully at path:', path);
    } catch (error) {
        console.error('❌ Error setting data at path:', path, 'Error:', error);
        throw error;
    }
}

/**
 * Push data to a list (creates a new child with auto-generated key)
 */
export async function pushData<T = Record<string, unknown>>(
    path: string,
    data: T
): Promise<string> {
    try {
        const dbRef = ref(rtdb, path);
        const newRef = push(dbRef);
        await set(newRef, {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return newRef.key || '';
    } catch (error) {
        console.error('Error pushing data:', error);
        throw error;
    }
}

/**
 * Set multiple values at different paths atomically
 */
export async function setMultiPath(updates: Record<string, unknown>): Promise<void> {
    try {
        const dbRef = ref(rtdb);
        const timestampedUpdates: Record<string, unknown> = {};

        Object.keys(updates).forEach((path) => {
            const value = updates[path];
            if (typeof value === 'object' && value !== null) {
                timestampedUpdates[path] = {
                    ...(value as Record<string, unknown>),
                    updatedAt: serverTimestamp(),
                };
            } else {
                timestampedUpdates[path] = value;
            }
        });

        await update(dbRef, timestampedUpdates);
    } catch (error) {
        console.error('Error setting multi-path data:', error);
        throw error;
    }
}

// READ Operations
/**
 * Get data from a specific path once
 */
export async function getData<T = Record<string, unknown>>(path: string): Promise<T | null> {
    try {
        const dbRef = ref(rtdb, path);
        const snapshot = await get(dbRef);

        if (snapshot.exists()) {
            const data = snapshot.val();
            // If it's an object, try to add the key as id
            if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
                return { id: snapshot.key, ...data } as T;
            }
            return data as T;
        }
        return null;
    } catch (error) {
        console.error('Error getting data:', error);
        throw error;
    }
}

/**
 * Get data with query options
 */
export async function queryData<T = Record<string, unknown>>(
    path: string,
    options: RealtimeQueryOptions = {}
): Promise<T[]> {
    try {
        let dbQuery: Query | DatabaseReference = ref(rtdb, path);

        // Apply ordering
        if (options.orderBy) {
            if (options.orderBy.type === 'child' && options.orderBy.childKey) {
                dbQuery = query(dbQuery as DatabaseReference, orderByChild(options.orderBy.childKey));
            } else if (options.orderBy.type === 'key') {
                dbQuery = query(dbQuery as DatabaseReference, orderByKey());
            } else if (options.orderBy.type === 'value') {
                dbQuery = query(dbQuery as DatabaseReference, orderByValue());
            }
        }

        // Apply filters
        if (options.equalTo !== undefined) {
            dbQuery = query(dbQuery as Query, equalTo(options.equalTo));
        }
        if (options.startAt !== undefined) {
            dbQuery = query(dbQuery as Query, startAt(options.startAt));
        }
        if (options.endAt !== undefined) {
            dbQuery = query(dbQuery as Query, endAt(options.endAt));
        }

        // Apply limits
        if (options.limit) {
            if (options.limit.type === 'first') {
                dbQuery = query(dbQuery as Query, limitToFirst(options.limit.count));
            } else if (options.limit.type === 'last') {
                dbQuery = query(dbQuery as Query, limitToLast(options.limit.count));
            }
        }

        const snapshot = await get(dbQuery);

        if (snapshot.exists()) {
            const data = snapshot.val();

            // Convert object of objects to array
            if (typeof data === 'object' && !Array.isArray(data)) {
                return Object.keys(data).map((key) => ({
                    id: key,
                    ...data[key],
                })) as T[];
            }

            return data as T[];
        }

        return [];
    } catch (error) {
        console.error('Error querying data:', error);
        throw error;
    }
}

/**
 * Get child data from a path
 */
export async function getChild<T = Record<string, unknown>>(
    path: string,
    childPath: string
): Promise<T | null> {
    try {
        const dbRef = ref(rtdb, path);
        const childRef = child(dbRef, childPath);
        const snapshot = await get(childRef);

        if (snapshot.exists()) {
            return snapshot.val() as T;
        }
        return null;
    } catch (error) {
        console.error('Error getting child data:', error);
        throw error;
    }
}

/**
 * Get all children keys at a path
 */
export async function getChildrenKeys(path: string): Promise<string[]> {
    try {
        const dbRef = ref(rtdb, path);
        const snapshot = await get(dbRef);

        if (snapshot.exists()) {
            const data = snapshot.val();
            if (typeof data === 'object' && !Array.isArray(data)) {
                return Object.keys(data);
            }
        }
        return [];
    } catch (error) {
        console.error('Error getting children keys:', error);
        throw error;
    }
}

// UPDATE Operations
/**
 * Update specific fields at a path (merges with existing data)
 */
export async function updateData<T = Record<string, unknown>>(
    path: string,
    updates: Partial<T>
): Promise<void> {
    try {
        const dbRef = ref(rtdb, path);
        await update(dbRef, {
            ...updates,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error updating data:', error);
        throw error;
    }
}

/**
 * Update multiple children at a path
 */
export async function updateChildren(
    path: string,
    updates: Record<string, unknown>
): Promise<void> {
    try {
        const dbRef = ref(rtdb, path);
        const timestampedUpdates: Record<string, unknown> = {};

        Object.keys(updates).forEach((key) => {
            if (typeof updates[key] === 'object' && updates[key] !== null) {
                timestampedUpdates[key] = {
                    ...updates[key],
                    updatedAt: serverTimestamp(),
                };
            } else {
                timestampedUpdates[key] = updates[key];
            }
        });

        await update(dbRef, timestampedUpdates);
    } catch (error) {
        console.error('Error updating children:', error);
        throw error;
    }
}

/**
 * Increment a numeric value
 */
export async function incrementValue(
    path: string,
    delta: number = 1
): Promise<number> {
    try {
        const dbRef = ref(rtdb, path);
        let newValue = 0;

        await rtdbRunTransaction(dbRef, (currentValue) => {
            newValue = (currentValue || 0) + delta;
            return newValue;
        });

        return newValue;
    } catch (error) {
        console.error('Error incrementing value:', error);
        throw error;
    }
}

// DELETE Operations
/**
 * Delete data at a specific path
 */
export async function deleteData(path: string): Promise<void> {
    try {
        const dbRef = ref(rtdb, path);
        await remove(dbRef);
    } catch (error) {
        console.error('Error deleting data:', error);
        throw error;
    }
}

/**
 * Delete multiple paths atomically
 */
export async function deleteMultiplePaths(paths: string[]): Promise<void> {
    try {
        const updates: Record<string, null> = {};
        paths.forEach((path) => {
            updates[path] = null;
        });

        const dbRef = ref(rtdb);
        await update(dbRef, updates);
    } catch (error) {
        console.error('Error deleting multiple paths:', error);
        throw error;
    }
}

/**
 * Delete children matching a condition
 */
export async function deleteChildrenByQuery(
    path: string,
    options: RealtimeQueryOptions
): Promise<number> {
    try {
        const data = await queryData<Record<string, unknown> & { id?: string }>(path, options);
        const keys = data.map((item) => item.id).filter(Boolean);

        if (keys.length > 0) {
            const updates: Record<string, null> = {};
            keys.forEach((key) => {
                updates[`${path}/${key}`] = null;
            });

            const dbRef = ref(rtdb);
            await update(dbRef, updates);
        }

        return keys.length;
    } catch (error) {
        console.error('Error deleting children by query:', error);
        throw error;
    }
}

// TRANSACTION Operations
/**
 * Run a transaction on a specific path
 */
export async function runTransaction<T = Record<string, unknown>>(
    path: string,
    updateFn: (currentData: T | null) => T | undefined
): Promise<{ committed: boolean; snapshot: DataSnapshot | null }> {
    try {
        const dbRef = ref(rtdb, path);
        const result = await rtdbRunTransaction(dbRef, (currentData) => {
            return updateFn(currentData);
        });

        return {
            committed: result.committed,
            snapshot: result.snapshot,
        };
    } catch (error) {
        console.error('Error running transaction:', error);
        throw error;
    }
}

// REALTIME SUBSCRIPTION Operations
/**
 * Subscribe to data changes at a path
 */
export function subscribeToData<T = Record<string, unknown>>(
    path: string,
    callback: (data: T | null) => void,
    errorCallback?: (error: Error) => void,
    options: RealtimeSubscriptionOptions = {}
): Unsubscribe {
    try {
        let dbQuery: Query | DatabaseReference = ref(rtdb, path);

        // Apply query options
        if (options.orderBy) {
            if (options.orderBy.type === 'child' && options.orderBy.childKey) {
                dbQuery = query(dbQuery as DatabaseReference, orderByChild(options.orderBy.childKey));
            } else if (options.orderBy.type === 'key') {
                dbQuery = query(dbQuery as DatabaseReference, orderByKey());
            } else if (options.orderBy.type === 'value') {
                dbQuery = query(dbQuery as DatabaseReference, orderByValue());
            }
        }

        if (options.equalTo !== undefined) {
            dbQuery = query(dbQuery as Query, equalTo(options.equalTo));
        }
        if (options.startAt !== undefined) {
            dbQuery = query(dbQuery as Query, startAt(options.startAt));
        }
        if (options.endAt !== undefined) {
            dbQuery = query(dbQuery as Query, endAt(options.endAt));
        }
        if (options.limit) {
            if (options.limit.type === 'first') {
                dbQuery = query(dbQuery as Query, limitToFirst(options.limit.count));
            } else if (options.limit.type === 'last') {
                dbQuery = query(dbQuery as Query, limitToLast(options.limit.count));
            }
        }

        onValue(
            dbQuery,
            (snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();

                    // If it's an object, try to add the key as id
                    if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
                        // Check if it's a list of items or a single item
                        const firstKey = Object.keys(data)[0];
                        if (firstKey && typeof data[firstKey] === 'object') {
                            // It's a list of items
                            const items = Object.keys(data).map((key) => ({
                                id: key,
                                ...data[key],
                            }));
                            callback(items as T);
                        } else {
                            // It's a single item
                            callback({ id: snapshot.key, ...data } as T);
                        }
                    } else {
                        callback(data as T);
                    }
                } else {
                    callback(null);
                }
            },
            (error) => {
                console.error('Error in data subscription:', error);
                if (errorCallback) errorCallback(error);
            }
        );

        // Return unsubscribe function
        return () => off(dbQuery as Query);
    } catch (error) {
        console.error('Error subscribing to data:', error);
        throw error;
    }
}

/**
 * Subscribe to a specific child path
 */
export function subscribeToChild<T = Record<string, unknown>>(
    path: string,
    childPath: string,
    callback: (data: T | null) => void,
    errorCallback?: (error: Error) => void
): Unsubscribe {
    const fullPath = `${path}/${childPath}`;
    return subscribeToData<T>(fullPath, callback, errorCallback);
}

// UTILITY Functions
/**
 * Check if data exists at a path
 */
export async function dataExists(path: string): Promise<boolean> {
    try {
        const dbRef = ref(rtdb, path);
        const snapshot = await get(dbRef);
        return snapshot.exists();
    } catch (error) {
        console.error('Error checking data existence:', error);
        throw error;
    }
}

/**
 * Count children at a path
 */
export async function countChildren(path: string): Promise<number> {
    try {
        const dbRef = ref(rtdb, path);
        const snapshot = await get(dbRef);

        if (snapshot.exists()) {
            const data = snapshot.val();
            if (typeof data === 'object' && !Array.isArray(data)) {
                return Object.keys(data).length;
            } else if (Array.isArray(data)) {
                return data.length;
            }
            return 1;
        }
        return 0;
    } catch (error) {
        console.error('Error counting children:', error);
        throw error;
    }
}

/**
 * Get server timestamp
 */
export function getServerTimestamp() {
    return serverTimestamp();
}

/**
 * Generate a new push key without setting data
 */
export function generatePushKey(path: string): string {
    const dbRef = ref(rtdb, path);
    const newRef = push(dbRef);
    return newRef.key || '';
}
