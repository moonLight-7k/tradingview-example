import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    endBefore,
    type QueryConstraint,
    type DocumentData,
    type WhereFilterOp,
    type OrderByDirection,
    type DocumentSnapshot,
    Timestamp,
    writeBatch,
    runTransaction,
    onSnapshot,
    type Unsubscribe,
    type Transaction,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

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

// CREATE Operations
/**
 * Add a new document with auto-generated ID
 */
export async function addDocument<T extends DocumentData>(
    collectionName: string,
    data: T
): Promise<string> {
    try {
        const docRef = await addDoc(collection(db, collectionName), {
            ...data,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        });
        return docRef.id;
    } catch (error) {
        console.error('Error adding document:', error);
        throw error;
    }
}

/**
 * Set a document with a specific ID (creates or overwrites)
 */
export async function setDocument<T extends DocumentData>(
    collectionName: string,
    docId: string,
    data: T,
    merge = false
): Promise<void> {
    try {
        const docRef = doc(db, collectionName, docId);
        await setDoc(
            docRef,
            {
                ...data,
                updatedAt: Timestamp.now(),
                ...(merge ? {} : { createdAt: Timestamp.now() }),
            },
            { merge }
        );
    } catch (error) {
        console.error('Error setting document:', error);
        throw error;
    }
}

/**
 * Batch create multiple documents
 */
export async function batchAddDocuments<T extends DocumentData>(
    collectionName: string,
    documents: T[]
): Promise<void> {
    try {
        const batch = writeBatch(db);
        const collectionRef = collection(db, collectionName);

        documents.forEach((data) => {
            const docRef = doc(collectionRef);
            batch.set(docRef, {
                ...data,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
            });
        });

        await batch.commit();
    } catch (error) {
        console.error('Error batch adding documents:', error);
        throw error;
    }
}

// READ Operations
/**
 * Get a single document by ID
 */
export async function getDocument<T = DocumentData>(
    collectionName: string,
    docId: string
): Promise<T | null> {
    try {
        const docRef = doc(db, collectionName, docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as T;
        }
        return null;
    } catch (error) {
        console.error('Error getting document:', error);
        throw error;
    }
}

/**
 * Get all documents from a collection
 */
export async function getAllDocuments<T = DocumentData>(
    collectionName: string
): Promise<T[]> {
    try {
        const querySnapshot = await getDocs(collection(db, collectionName));
        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as T[];
    } catch (error) {
        console.error('Error getting all documents:', error);
        throw error;
    }
}

/**
 * Query documents with filters, ordering, and pagination
 */
export async function queryDocuments<T = DocumentData>(
    collectionName: string,
    options: QueryOptions = {}
): Promise<{ data: T[]; lastDoc?: DocumentSnapshot }> {
    try {
        const constraints: QueryConstraint[] = [];

        // Add where conditions
        if (options.whereConditions) {
            options.whereConditions.forEach(({ field, operator, value }) => {
                constraints.push(where(field, operator, value));
            });
        }

        // Add orderBy
        if (options.orderByFields) {
            options.orderByFields.forEach(({ field, direction = 'asc' }) => {
                constraints.push(orderBy(field, direction));
            });
        }

        // Add pagination
        if (options.startAfterDoc) {
            constraints.push(startAfter(options.startAfterDoc));
        }
        if (options.endBeforeDoc) {
            constraints.push(endBefore(options.endBeforeDoc));
        }

        // Add limit
        if (options.limitCount) {
            constraints.push(limit(options.limitCount));
        }

        const q = query(collection(db, collectionName), ...constraints);
        const querySnapshot = await getDocs(q);

        const data = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as T[];

        const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

        return { data, lastDoc };
    } catch (error) {
        console.error('Error querying documents:', error);
        throw error;
    }
}

/**
 * Get documents with pagination
 */
export async function getPaginatedDocuments<T = DocumentData>(
    collectionName: string,
    paginationOptions: PaginationOptions,
    additionalOptions: Omit<QueryOptions, 'limitCount' | 'startAfterDoc' | 'endBeforeDoc'> = {}
): Promise<{ data: T[]; lastDoc?: DocumentSnapshot; firstDoc?: DocumentSnapshot }> {
    try {
        const { pageSize, lastDoc, direction = 'next' } = paginationOptions;

        const queryOptions: QueryOptions = {
            ...additionalOptions,
            limitCount: pageSize,
        };

        if (direction === 'next' && lastDoc) {
            queryOptions.startAfterDoc = lastDoc;
        } else if (direction === 'previous' && lastDoc) {
            queryOptions.endBeforeDoc = lastDoc;
        }

        const result = await queryDocuments<T>(collectionName, queryOptions);
        const firstDoc = result.data.length > 0 ? result.lastDoc : undefined;

        return {
            data: result.data,
            lastDoc: result.lastDoc,
            firstDoc,
        };
    } catch (error) {
        console.error('Error getting paginated documents:', error);
        throw error;
    }
}

// UPDATE Operations
/**
 * Update specific fields in a document
 */
export async function updateDocument<T extends DocumentData>(
    collectionName: string,
    docId: string,
    data: Partial<T>
): Promise<void> {
    try {
        const docRef = doc(db, collectionName, docId);
        await updateDoc(docRef, {
            ...data,
            updatedAt: Timestamp.now(),
        });
    } catch (error) {
        console.error('Error updating document:', error);
        throw error;
    }
}

/**
 * Batch update multiple documents
 */
export async function batchUpdateDocuments<T extends DocumentData>(
    collectionName: string,
    updates: Array<{ id: string; data: Partial<T> }>
): Promise<void> {
    try {
        const batch = writeBatch(db);

        updates.forEach(({ id, data }) => {
            const docRef = doc(db, collectionName, id);
            batch.update(docRef, {
                ...data,
                updatedAt: Timestamp.now(),
            });
        });

        await batch.commit();
    } catch (error) {
        console.error('Error batch updating documents:', error);
        throw error;
    }
}

// DELETE Operations
/**
 * Delete a single document
 */
export async function deleteDocument(
    collectionName: string,
    docId: string
): Promise<void> {
    try {
        const docRef = doc(db, collectionName, docId);
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Error deleting document:', error);
        throw error;
    }
}

/**
 * Batch delete multiple documents
 */
export async function batchDeleteDocuments(
    collectionName: string,
    docIds: string[]
): Promise<void> {
    try {
        const batch = writeBatch(db);

        docIds.forEach((id) => {
            const docRef = doc(db, collectionName, id);
            batch.delete(docRef);
        });

        await batch.commit();
    } catch (error) {
        console.error('Error batch deleting documents:', error);
        throw error;
    }
}

/**
 * Delete documents matching a query
 */
export async function deleteDocumentsByQuery(
    collectionName: string,
    options: QueryOptions
): Promise<number> {
    try {
        const { data } = await queryDocuments(collectionName, options);
        const docIds = data.map((doc) => (doc as { id: string }).id);

        if (docIds.length > 0) {
            await batchDeleteDocuments(collectionName, docIds);
        }

        return docIds.length;
    } catch (error) {
        console.error('Error deleting documents by query:', error);
        throw error;
    }
}

// TRANSACTION Operations
/**
 * Run a transaction
 */
export async function runFirestoreTransaction<T>(
    transactionFn: (transaction: Transaction) => Promise<T>
): Promise<T> {
    try {
        return await runTransaction(db, transactionFn);
    } catch (error) {
        console.error('Error running transaction:', error);
        throw error;
    }
}

// REALTIME Operations
/**
 * Listen to a single document in real-time
 */
export function subscribeToDocument<T = DocumentData>(
    collectionName: string,
    docId: string,
    callback: (data: T | null) => void,
    errorCallback?: (error: Error) => void
): Unsubscribe {
    const docRef = doc(db, collectionName, docId);

    return onSnapshot(
        docRef,
        (docSnap) => {
            if (docSnap.exists()) {
                callback({ id: docSnap.id, ...docSnap.data() } as T);
            } else {
                callback(null);
            }
        },
        (error) => {
            console.error('Error in document subscription:', error);
            if (errorCallback) errorCallback(error);
        }
    );
}

/**
 * Listen to a collection query in real-time
 */
export function subscribeToQuery<T = DocumentData>(
    collectionName: string,
    options: QueryOptions = {},
    callback: (data: T[]) => void,
    errorCallback?: (error: Error) => void
): Unsubscribe {
    const constraints: QueryConstraint[] = [];

    if (options.whereConditions) {
        options.whereConditions.forEach(({ field, operator, value }) => {
            constraints.push(where(field, operator, value));
        });
    }

    if (options.orderByFields) {
        options.orderByFields.forEach(({ field, direction = 'asc' }) => {
            constraints.push(orderBy(field, direction));
        });
    }

    if (options.limitCount) {
        constraints.push(limit(options.limitCount));
    }

    const q = query(collection(db, collectionName), ...constraints);

    return onSnapshot(
        q,
        (querySnapshot) => {
            const data = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as T[];
            callback(data);
        },
        (error) => {
            console.error('Error in query subscription:', error);
            if (errorCallback) errorCallback(error);
        }
    );
}

// UTILITY Functions
/**
 * Check if a document exists
 */
export async function documentExists(
    collectionName: string,
    docId: string
): Promise<boolean> {
    try {
        const docRef = doc(db, collectionName, docId);
        const docSnap = await getDoc(docRef);
        return docSnap.exists();
    } catch (error) {
        console.error('Error checking document existence:', error);
        throw error;
    }
}

/**
 * Count documents in a collection (note: this fetches all docs)
 */
export async function countDocuments(
    collectionName: string,
    options: QueryOptions = {}
): Promise<number> {
    try {
        const { data } = await queryDocuments(collectionName, options);
        return data.length;
    } catch (error) {
        console.error('Error counting documents:', error);
        throw error;
    }
}
