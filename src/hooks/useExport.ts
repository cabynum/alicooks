/**
 * useExport Hook
 *
 * Provides file-based export and import functionality for user data.
 * Fulfills Constitution principle IV: Data Ownership.
 *
 * Works in two modes:
 * 1. LOCAL MODE: Export/import from localStorage
 * 2. SYNCED MODE: Export/import from IndexedDB cache
 *
 * @example
 * ```tsx
 * function SettingsPage() {
 *   const { exportToFile, importFromFile, isImporting, error } = useExport();
 *
 *   return (
 *     <div>
 *       <button onClick={exportToFile}>Export Data</button>
 *       <input type="file" onChange={(e) => {
 *         const file = e.target.files?.[0];
 *         if (file) importFromFile(file);
 *       }} />
 *       {error && <p>{error}</p>}
 *     </div>
 *   );
 * }
 * ```
 */

import { useState, useCallback } from 'react';
import type { ExportData } from '@/types';
import { SCHEMA_VERSION } from '@/types';
import {
  exportData as exportLocalData,
  importData as importLocalData,
  getDishesFromCache,
  getPlansFromCache,
  addDishToCache,
  addPlanToCache,
  pushChanges,
} from '@/services';
import { useHousehold } from './useHousehold';
import { useAuthContext } from '@/components/auth';

/**
 * Result of an import operation
 */
export interface ImportResult {
  success: boolean;
  message: string;
}

/**
 * Return type for the useExport hook
 */
export interface UseExportReturn {
  /** Download all data as a JSON file */
  exportToFile: () => Promise<void>;

  /** Import data from a JSON file, replacing existing data */
  importFromFile: (file: File) => Promise<ImportResult>;

  /** True while an import operation is in progress */
  isImporting: boolean;

  /** True while an export operation is in progress */
  isExporting: boolean;

  /** Error message from the last failed operation, if any */
  error: string | null;

  /** Clear the current error */
  clearError: () => void;

  /** Whether running in synced mode (household active) */
  isSyncedMode: boolean;
}

/**
 * Generate a filename for the export with current date
 */
function generateExportFilename(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `dishcourse-export-${year}-${month}-${day}.json`;
}

/**
 * Trigger a file download in the browser
 */
function downloadFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Read a file as text
 */
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Returns the current timestamp in ISO 8601 format.
 */
function now(): string {
  return new Date().toISOString();
}

/**
 * Hook for exporting and importing user data.
 *
 * Automatically detects whether to use local or synced mode based on
 * authentication and household state.
 */
export function useExport(): UseExportReturn {
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user, isAuthenticated } = useAuthContext();
  const { currentHousehold } = useHousehold();

  // Determine mode based on auth and household state
  const isSyncedMode = isAuthenticated && currentHousehold !== null;

  /**
   * Export all data as a downloadable JSON file.
   * Uses the current date in the filename for easy identification.
   */
  const exportToFile = useCallback(async () => {
    setError(null);
    setIsExporting(true);

    try {
      let jsonData: string;

      if (isSyncedMode && currentHousehold) {
        // SYNCED MODE: Export from IndexedDB cache
        const dishes = await getDishesFromCache(currentHousehold.id);
        const plans = await getPlansFromCache(currentHousehold.id);

        const exportData: ExportData = {
          exportedAt: now(),
          version: SCHEMA_VERSION,
          dishes,
          plans,
          household: {
            id: currentHousehold.id,
            name: currentHousehold.name,
          },
        };

        jsonData = JSON.stringify(exportData, null, 2);
      } else {
        // LOCAL MODE: Export from localStorage
        jsonData = exportLocalData();
      }

      const filename = generateExportFilename();
      downloadFile(jsonData, filename);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to export data';
      setError(message);
    } finally {
      setIsExporting(false);
    }
  }, [isSyncedMode, currentHousehold]);

  /**
   * Import data from a JSON file, replacing all existing data.
   *
   * In synced mode, imported data is added to the current household
   * and synced to the server.
   */
  const importFromFile = useCallback(
    async (file: File): Promise<ImportResult> => {
      setError(null);
      setIsImporting(true);

      try {
        // Validate file type
        if (!file.name.endsWith('.json') && file.type !== 'application/json') {
          throw new Error('Please select a JSON file');
        }

        // Read file content
        const content = await readFileAsText(file);
        const data = JSON.parse(content) as ExportData;

        // Validate format
        if (!Array.isArray(data.dishes) || !Array.isArray(data.plans)) {
          throw new Error('Invalid export format: missing dishes or plans array');
        }

        if (isSyncedMode && currentHousehold && user) {
          // SYNCED MODE: Add to IndexedDB cache and sync
          // Note: This merges data rather than replacing, to avoid data loss
          for (const dish of data.dishes) {
            // Update dish to belong to current household
            const importedDish = {
              ...dish,
              id: crypto.randomUUID(), // New ID to avoid conflicts
              householdId: currentHousehold.id,
              addedBy: user.id,
              createdAt: now(),
              updatedAt: now(),
            };
            await addDishToCache(importedDish);
          }

          for (const plan of data.plans) {
            // Update plan to belong to current household
            const importedPlan = {
              ...plan,
              id: crypto.randomUUID(), // New ID to avoid conflicts
              householdId: currentHousehold.id,
              createdBy: user.id,
              createdAt: now(),
              updatedAt: now(),
            };
            await addPlanToCache(importedPlan);
          }

          // Trigger sync to push new data to server
          await pushChanges();

          setIsImporting(false);
          return {
            success: true,
            message: `Imported ${data.dishes.length} dishes and ${data.plans.length} plans to ${currentHousehold.name}!`,
          };
        } else {
          // LOCAL MODE: Replace localStorage data
          importLocalData(content);

          setIsImporting(false);
          return {
            success: true,
            message: 'Data imported successfully! Refresh to see your dishes.',
          };
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to import data';
        setError(message);
        setIsImporting(false);
        return {
          success: false,
          message,
        };
      }
    },
    [isSyncedMode, currentHousehold, user]
  );

  /**
   * Clear the current error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    exportToFile,
    importFromFile,
    isImporting,
    isExporting,
    error,
    clearError,
    isSyncedMode,
  };
}
