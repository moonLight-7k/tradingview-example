'use client';

import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    type QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logger } from '@/lib/logger';
import type { Project } from '@/types';

export function useFirestore() {
    const getProjects = async (userId?: string): Promise<Project[]> => {
        try {
            const projectsRef = collection(db, 'projects');
            const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];

            if (userId) {
                constraints.unshift(where('userId', '==', userId));
            }

            const q = query(projectsRef, ...constraints);
            const querySnapshot = await getDocs(q);

            const projects = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Project[];

            return projects;
        } catch (error) {
            logger.error('Error fetching projects', { error });
            throw error;
        }
    };

    const getProject = async (projectId: string): Promise<Project | null> => {
        try {
            const projectRef = doc(db, 'projects', projectId);
            const projectDoc = await getDoc(projectRef);

            if (projectDoc.exists()) {
                return {
                    id: projectDoc.id,
                    ...projectDoc.data(),
                } as Project;
            }

            return null;
        } catch (error) {
            logger.error('Error fetching project', { error, projectId });
            throw error;
        }
    };

    const createProject = async (
        projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
    ): Promise<Project> => {
        try {
            const projectsRef = collection(db, 'projects');
            const newProject = {
                ...projectData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            const docRef = await addDoc(projectsRef, newProject);
            logger.info('Project created', { projectId: docRef.id });

            return {
                id: docRef.id,
                ...newProject,
            } as Project;
        } catch (error) {
            logger.error('Error creating project', { error });
            throw error;
        }
    };

    const updateProject = async (
        projectId: string,
        updates: Partial<Omit<Project, 'id' | 'createdAt'>>
    ): Promise<void> => {
        try {
            const projectRef = doc(db, 'projects', projectId);
            await updateDoc(projectRef, {
                ...updates,
                updatedAt: new Date().toISOString(),
            });
            logger.info('Project updated', { projectId });
        } catch (error) {
            logger.error('Error updating project', { error, projectId });
            throw error;
        }
    };

    const deleteProject = async (projectId: string): Promise<void> => {
        try {
            const projectRef = doc(db, 'projects', projectId);
            await deleteDoc(projectRef);
            logger.info('Project deleted', { projectId });
        } catch (error) {
            logger.error('Error deleting project', { error, projectId });
            throw error;
        }
    };

    return {
        getProjects,
        getProject,
        createProject,
        updateProject,
        deleteProject,
    };
}
