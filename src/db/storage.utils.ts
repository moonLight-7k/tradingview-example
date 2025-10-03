import {
    getStorage,
    ref,
    uploadBytes,
    uploadBytesResumable,
    uploadString,
    getDownloadURL,
    deleteObject,
    listAll,
    getMetadata,
    updateMetadata,
    type StorageReference,
    type UploadTask,
    type UploadMetadata,
    type FullMetadata,
    type ListResult,
} from 'firebase/storage';
import { app } from '@/lib/firebase';
import { FileInfo, UploadOptions } from '@/types';

let storage: ReturnType<typeof getStorage>;
if (typeof window !== 'undefined') {
    storage = getStorage(app);
}

// UPLOAD Operations

/**
 * Upload a file to Firebase Storage
 */
export async function uploadFile(
    path: string,
    file: File | Blob,
    options?: UploadOptions
): Promise<string> {
    try {
        const storageRef = ref(storage, path);
        const metadata: UploadMetadata = {
            contentType: file instanceof File ? file.type : 'application/octet-stream',
            customMetadata: {
                uploadedAt: new Date().toISOString(),
                originalName: file instanceof File ? file.name : 'blob',
            },
            ...options?.metadata,
        };

        const snapshot = await uploadBytes(storageRef, file, metadata);
        const downloadURL = await getDownloadURL(snapshot.ref);

        if (options?.onComplete) {
            options.onComplete(downloadURL);
        }

        return downloadURL;
    } catch (error) {
        console.error('Error uploading file:', error);
        if (options?.onError) {
            options.onError(error as Error);
        }
        throw error;
    }
}

/**
 * Upload a file with progress tracking
 */
export function uploadFileWithProgress(
    path: string,
    file: File | Blob,
    options?: UploadOptions
): {
    uploadTask: UploadTask;
    promise: Promise<string>;
    cancel: () => boolean;
    pause: () => boolean;
    resume: () => boolean;
} {
    const storageRef = ref(storage, path);
    const metadata: UploadMetadata = {
        contentType: file instanceof File ? file.type : 'application/octet-stream',
        customMetadata: {
            uploadedAt: new Date().toISOString(),
            originalName: file instanceof File ? file.name : 'blob',
        },
        ...options?.metadata,
    };

    const uploadTask = uploadBytesResumable(storageRef, file, metadata);

    // Register progress observer
    uploadTask.on(
        'state_changed',
        (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (options?.onProgress) {
                options.onProgress(progress);
            }
        },
        (error) => {
            console.error('Upload error:', error);
            if (options?.onError) {
                options.onError(error);
            }
        },
        async () => {
            try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                if (options?.onComplete) {
                    options.onComplete(downloadURL);
                }
            } catch (error) {
                console.error('Error getting download URL:', error);
                if (options?.onError) {
                    options.onError(error as Error);
                }
            }
        }
    );

    const promise = new Promise<string>((resolve, reject) => {
        uploadTask.then(
            async (snapshot) => {
                const downloadURL = await getDownloadURL(snapshot.ref);
                resolve(downloadURL);
            },
            (error) => {
                reject(error);
            }
        );
    });

    return {
        uploadTask,
        promise,
        cancel: () => uploadTask.cancel(),
        pause: () => uploadTask.pause(),
        resume: () => uploadTask.resume(),
    };
}

/**
 * Upload a base64 or data URL string
 */
export async function uploadString64(
    path: string,
    data: string,
    format: 'base64' | 'base64url' | 'data_url' = 'data_url',
    options?: UploadOptions
): Promise<string> {
    try {
        const storageRef = ref(storage, path);
        const metadata: UploadMetadata = {
            ...options?.metadata,
            customMetadata: {
                uploadedAt: new Date().toISOString(),
                ...options?.metadata?.customMetadata,
            },
        };

        const snapshot = await uploadString(storageRef, data, format, metadata);
        const downloadURL = await getDownloadURL(snapshot.ref);

        if (options?.onComplete) {
            options.onComplete(downloadURL);
        }

        return downloadURL;
    } catch (error) {
        console.error('Error uploading string:', error);
        if (options?.onError) {
            options.onError(error as Error);
        }
        throw error;
    }
}

/**
 * Upload multiple files
 */
export async function uploadMultipleFiles(
    files: Array<{ path: string; file: File | Blob }>,
    options?: UploadOptions
): Promise<Array<{ path: string; downloadURL: string }>> {
    try {
        const uploadPromises = files.map(async ({ path, file }) => {
            const downloadURL = await uploadFile(path, file, options);
            return { path, downloadURL };
        });

        return await Promise.all(uploadPromises);
    } catch (error) {
        console.error('Error uploading multiple files:', error);
        throw error;
    }
}

/**
 * Upload file to a user-specific folder
 */
export async function uploadUserFile(
    userId: string,
    folder: string,
    file: File | Blob,
    options?: UploadOptions
): Promise<{ path: string; downloadURL: string }> {
    const fileName = file instanceof File ? file.name : `file_${Date.now()}`;
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const path = `users/${userId}/${folder}/${Date.now()}_${sanitizedFileName}`;

    const downloadURL = await uploadFile(path, file, options);

    return { path, downloadURL };
}

// DOWNLOAD Operations

/**
 * Get download URL for a file
 */
export async function getFileURL(path: string): Promise<string> {
    try {
        const storageRef = ref(storage, path);
        return await getDownloadURL(storageRef);
    } catch (error) {
        console.error('Error getting download URL:', error);
        throw error;
    }
}

/**
 * Download a file as Blob
 */
export async function downloadFile(path: string): Promise<Blob> {
    try {
        const downloadURL = await getFileURL(path);
        const response = await fetch(downloadURL);

        if (!response.ok) {
            throw new Error(`Failed to download file: ${response.statusText}`);
        }

        return await response.blob();
    } catch (error) {
        console.error('Error downloading file:', error);
        throw error;
    }
}

/**
 * Download file and trigger browser download
 */
export async function downloadFileToDevice(
    path: string,
    filename?: string
): Promise<void> {
    try {
        const blob = await downloadFile(path);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename || path.split('/').pop() || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error downloading file to device:', error);
        throw error;
    }
}

// DELETE Operations

/**
 * Delete a file from storage
 */
export async function deleteFile(path: string): Promise<void> {
    try {
        const storageRef = ref(storage, path);
        await deleteObject(storageRef);
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
}

/**
 * Delete multiple files
 */
export async function deleteMultipleFiles(paths: string[]): Promise<void> {
    try {
        const deletePromises = paths.map((path) => deleteFile(path));
        await Promise.all(deletePromises);
    } catch (error) {
        console.error('Error deleting multiple files:', error);
        throw error;
    }
}

/**
 * Delete all files in a folder
 */
export async function deleteFolder(folderPath: string): Promise<number> {
    try {
        const files = await listFiles(folderPath);
        const deletePaths = files.map((file) => file.fullPath);

        if (deletePaths.length > 0) {
            await deleteMultipleFiles(deletePaths);
        }

        // Recursively delete subfolders
        const folders = await listFolders(folderPath);
        for (const folder of folders) {
            await deleteFolder(folder.fullPath);
        }

        return deletePaths.length;
    } catch (error) {
        console.error('Error deleting folder:', error);
        throw error;
    }
}

// LIST Operations

/**
 * List all files in a path
 */
export async function listFiles(path: string): Promise<FileInfo[]> {
    try {
        const storageRef = ref(storage, path);
        const result: ListResult = await listAll(storageRef);

        const filePromises = result.items.map(async (itemRef) => {
            const metadata = await getMetadata(itemRef);
            const downloadURL = await getDownloadURL(itemRef);

            return {
                name: itemRef.name,
                fullPath: itemRef.fullPath,
                size: metadata.size,
                contentType: metadata.contentType,
                timeCreated: metadata.timeCreated,
                updated: metadata.updated,
                downloadURL,
                metadata,
            };
        });

        return await Promise.all(filePromises);
    } catch (error) {
        console.error('Error listing files:', error);
        throw error;
    }
}

/**
 * List all folders (prefixes) in a path
 */
export async function listFolders(
    path: string
): Promise<Array<{ name: string; fullPath: string }>> {
    try {
        const storageRef = ref(storage, path);
        const result: ListResult = await listAll(storageRef);

        return result.prefixes.map((prefix) => ({
            name: prefix.name,
            fullPath: prefix.fullPath,
        }));
    } catch (error) {
        console.error('Error listing folders:', error);
        throw error;
    }
}

/**
 * List files with pagination (max 1000 items)
 */
export async function listFilesPaginated(
    path: string,
    maxResults: number = 100
): Promise<{ files: FileInfo[]; nextPageToken?: string }> {
    try {
        // Note: Firebase Storage doesn't support pagination in the modular SDK yet
        // This is a workaround that lists all and slices
        const allFiles = await listFiles(path);

        return {
            files: allFiles.slice(0, maxResults),
            nextPageToken: allFiles.length > maxResults ? 'has-more' : undefined,
        };
    } catch (error) {
        console.error('Error listing files with pagination:', error);
        throw error;
    }
}

// METADATA Operations

/**
 * Get file metadata
 */
export async function getFileMetadata(path: string): Promise<FullMetadata> {
    try {
        const storageRef = ref(storage, path);
        return await getMetadata(storageRef);
    } catch (error) {
        console.error('Error getting file metadata:', error);
        throw error;
    }
}

/**
 * Update file metadata
 */
export async function updateFileMetadata(
    path: string,
    metadata: Partial<UploadMetadata>
): Promise<FullMetadata> {
    try {
        const storageRef = ref(storage, path);
        return await updateMetadata(storageRef, metadata);
    } catch (error) {
        console.error('Error updating file metadata:', error);
        throw error;
    }
}

/**
 * Get file size
 */
export async function getFileSize(path: string): Promise<number> {
    try {
        const metadata = await getFileMetadata(path);
        return metadata.size;
    } catch (error) {
        console.error('Error getting file size:', error);
        throw error;
    }
}

// UTILITY Functions

/**
 * Check if file exists
 */
export async function fileExists(path: string): Promise<boolean> {
    try {
        await getFileMetadata(path);
        return true;
    } catch (error) {
        if ((error as { code?: string }).code === 'storage/object-not-found') {
            return false;
        }
        throw error;
    }
}

/**
 * Get storage reference for a path
 */
export function getStorageRef(path: string): StorageReference {
    return ref(storage, path);
}

/**
 * Generate a unique file path
 */
export function generateUniqueFilePath(
    folder: string,
    filename: string
): string {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    return `${folder}/${timestamp}_${randomStr}_${sanitizedFilename}`;
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
    return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

/**
 * Validate file size
 */
export function validateFileSize(
    file: File | Blob,
    maxSizeMB: number
): { valid: boolean; error?: string } {
    const maxBytes = maxSizeMB * 1024 * 1024;

    if (file.size > maxBytes) {
        return {
            valid: false,
            error: `File size exceeds ${maxSizeMB}MB limit`,
        };
    }

    return { valid: true };
}

/**
 * Validate file type
 */
export function validateFileType(
    file: File,
    allowedTypes: string[]
): { valid: boolean; error?: string } {
    if (!allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: `File type ${file.type} is not allowed`,
        };
    }

    return { valid: true };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Create a thumbnail path from original path
 */
export function getThumbnailPath(originalPath: string, suffix = '_thumb'): string {
    const lastDot = originalPath.lastIndexOf('.');
    if (lastDot === -1) {
        return `${originalPath}${suffix}`;
    }

    return `${originalPath.substring(0, lastDot)}${suffix}${originalPath.substring(lastDot)}`;
}

/**
 * Upload image and create thumbnail (requires client-side image processing)
 */
export async function uploadImageWithThumbnail(
    path: string,
    file: File,
    thumbnailMaxWidth: number = 200,
    options?: UploadOptions
): Promise<{ originalURL: string; thumbnailURL: string }> {
    try {
        // Upload original
        const originalURL = await uploadFile(path, file, options);

        // Create thumbnail
        const thumbnail = await createImageThumbnail(file, thumbnailMaxWidth);
        const thumbnailPath = getThumbnailPath(path);
        const thumbnailURL = await uploadFile(thumbnailPath, thumbnail, options);

        return { originalURL, thumbnailURL };
    } catch (error) {
        console.error('Error uploading image with thumbnail:', error);
        throw error;
    }
}

/**
 * Create image thumbnail (client-side)
 */
async function createImageThumbnail(
    file: File,
    maxWidth: number
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const img = new Image();

            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    reject(new Error('Could not get canvas context'));
                    return;
                }

                const ratio = maxWidth / img.width;
                canvas.width = maxWidth;
                canvas.height = img.height * ratio;

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Could not create thumbnail blob'));
                        }
                    },
                    file.type,
                    0.8
                );
            };

            img.onerror = () => reject(new Error('Could not load image'));
            img.src = e.target?.result as string;
        };

        reader.onerror = () => reject(new Error('Could not read file'));
        reader.readAsDataURL(file);
    });
}

/**
 * Batch operations helper
 */
export class StorageBatchOperation {
    private operations: Array<() => Promise<unknown>> = [];

    addUpload(path: string, file: File | Blob, options?: UploadOptions): this {
        this.operations.push(() => uploadFile(path, file, options));
        return this;
    }

    addDelete(path: string): this {
        this.operations.push(() => deleteFile(path));
        return this;
    }

    async execute(): Promise<unknown[]> {
        return Promise.all(this.operations.map((op) => op()));
    }

    async executeSequential(): Promise<unknown[]> {
        const results: unknown[] = [];
        for (const operation of this.operations) {
            results.push(await operation());
        }
        return results;
    }

    clear(): void {
        this.operations = [];
    }
}

/**
 * Create a new batch operation
 */
export function createBatchOperation(): StorageBatchOperation {
    return new StorageBatchOperation();
}
