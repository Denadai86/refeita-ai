"use server";

import 'server-only';
import { getAdminDB } from '@/lib/firebase-admin';
import { RecipeBatch } from '@/types/recipe';
import type { DocumentData } from 'firebase-admin/firestore';
import { notFound } from 'next/navigation';

/**
 * getRecipeBatchById
 * Retorna um `RecipeBatch` do Firestore ou chama `notFound()`.
 */
export async function getRecipeBatchById(batchId: string): Promise<RecipeBatch> {
  if (!batchId) {
    notFound();
    throw new Error('batchId is required');
  }

  const adminDB = await getAdminDB();
  if (!adminDB) {
    notFound();
    throw new Error('Admin DB not initialized');
  }

  const docRef = adminDB.collection('recipeBatches').doc(batchId);
  const doc = await docRef.get();

  if (!doc.exists) {
    notFound();
    throw new Error('Not found');
  }

  const data = doc.data() as DocumentData | undefined;

  const createdAtValue =
    data?.createdAt?.toDate ? data.createdAt.toDate().getTime() : data?.createdAt;

  const recipeBatch: RecipeBatch = {
    id: doc.id,
    userId: data?.userId ?? null,
    inputData: data?.inputData ?? null,
    generatedRecipes: data?.generatedRecipes ?? [],
    createdAt: typeof createdAtValue === 'number' ? createdAtValue : Date.now(),
  };

  return recipeBatch;
}