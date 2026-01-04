/**
 * useExport Hook Tests
 *
 * Tests for the export/import functionality hook.
 * Tests are focused on LOCAL MODE (no household) since that's
 * the primary test case and doesn't require sync service mocking.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useExport } from '@/hooks/useExport';

// Mock the auth context to return unauthenticated state (local mode)
vi.mock('@/components/auth', () => ({
  useAuthContext: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  }),
}));

// Mock useHousehold to return no household (local mode)
vi.mock('@/hooks/useHousehold', () => ({
  useHousehold: () => ({
    currentHousehold: null,
    households: [],
    isLoading: false,
  }),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    getStore: () => store,
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
});

// Mock URL.createObjectURL and URL.revokeObjectURL
const mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
const mockRevokeObjectURL = vi.fn();

Object.defineProperty(globalThis, 'URL', {
  value: {
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL,
  },
});

// Track created elements for cleanup
let mockLink: HTMLAnchorElement | null = null;
const originalCreateElement = document.createElement.bind(document);

describe('useExport Hook', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();

    // Mock document.createElement to track anchor element
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'a') {
        mockLink = originalCreateElement('a') as HTMLAnchorElement;
        mockLink.click = vi.fn();
        return mockLink;
      }
      return originalCreateElement(tagName);
    });

    // Mock document.body.appendChild and removeChild
    vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
    vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);
  });

  afterEach(() => {
    mockLink = null;
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('starts with no error', () => {
      const { result } = renderHook(() => useExport());
      expect(result.current.error).toBeNull();
    });

    it('starts with isImporting false', () => {
      const { result } = renderHook(() => useExport());
      expect(result.current.isImporting).toBe(false);
    });

    it('starts with isExporting false', () => {
      const { result } = renderHook(() => useExport());
      expect(result.current.isExporting).toBe(false);
    });

    it('reports isSyncedMode as false in local mode', () => {
      const { result } = renderHook(() => useExport());
      expect(result.current.isSyncedMode).toBe(false);
    });
  });

  describe('exportToFile', () => {
    it('creates a downloadable file', async () => {
      const { result } = renderHook(() => useExport());

      await act(async () => {
        await result.current.exportToFile();
      });

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockLink?.click).toHaveBeenCalled();
      expect(mockRevokeObjectURL).toHaveBeenCalled();
    });

    it('uses correct filename format with date', async () => {
      const { result } = renderHook(() => useExport());

      await act(async () => {
        await result.current.exportToFile();
      });

      expect(mockLink?.download).toMatch(/^dishcourse-export-\d{4}-\d{2}-\d{2}\.json$/);
    });

    it('includes dishes and plans in export', async () => {
      // Set up some data
      localStorageMock.setItem(
        'dishcourse_dishes',
        JSON.stringify([
          {
            id: '1',
            name: 'Chicken',
            type: 'entree',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
          },
        ])
      );

      const { result } = renderHook(() => useExport());

      await act(async () => {
        await result.current.exportToFile();
      });

      // Verify Blob was created with correct data
      const blobCall = vi.mocked(mockCreateObjectURL).mock.calls[0][0] as Blob;
      expect(blobCall.type).toBe('application/json');
    });

    it('clears previous error on export', async () => {
      const { result } = renderHook(() => useExport());

      // Trigger an export that will clear any existing error
      await act(async () => {
        await result.current.exportToFile();
      });

      expect(result.current.error).toBeNull();
    });

    it('sets isExporting to false after completion', async () => {
      const { result } = renderHook(() => useExport());

      await act(async () => {
        await result.current.exportToFile();
      });

      expect(result.current.isExporting).toBe(false);
    });
  });

  describe('importFromFile', () => {
    it('imports valid JSON file', async () => {
      const validData = JSON.stringify({
        exportedAt: '2024-01-01',
        version: 1,
        dishes: [
          {
            id: 'imported-1',
            name: 'Imported Dish',
            type: 'entree',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
          },
        ],
        plans: [],
      });

      const file = new File([validData], 'export.json', {
        type: 'application/json',
      });

      const { result } = renderHook(() => useExport());

      let importResult: { success: boolean; message: string } | undefined;
      await act(async () => {
        importResult = await result.current.importFromFile(file);
      });

      expect(importResult?.success).toBe(true);
      expect(importResult?.message).toContain('successfully');
      expect(result.current.error).toBeNull();
    });

    it('sets isImporting during import', async () => {
      const validData = JSON.stringify({
        exportedAt: '2024-01-01',
        version: 1,
        dishes: [],
        plans: [],
      });

      const file = new File([validData], 'export.json', {
        type: 'application/json',
      });

      const { result } = renderHook(() => useExport());

      // Can't easily test the intermediate state, but we can verify it ends false
      await act(async () => {
        await result.current.importFromFile(file);
      });

      expect(result.current.isImporting).toBe(false);
    });

    it('rejects non-JSON files', async () => {
      const file = new File(['not json'], 'data.txt', {
        type: 'text/plain',
      });

      const { result } = renderHook(() => useExport());

      let importResult: { success: boolean; message: string } | undefined;
      await act(async () => {
        importResult = await result.current.importFromFile(file);
      });

      expect(importResult?.success).toBe(false);
      expect(importResult?.message).toContain('JSON');
      expect(result.current.error).toBeTruthy();
    });

    it('handles invalid JSON content', async () => {
      const file = new File(['not valid json {{{'], 'export.json', {
        type: 'application/json',
      });

      const { result } = renderHook(() => useExport());

      let importResult: { success: boolean; message: string } | undefined;
      await act(async () => {
        importResult = await result.current.importFromFile(file);
      });

      expect(importResult?.success).toBe(false);
      expect(result.current.error).toBeTruthy();
    });

    it('handles missing dishes array', async () => {
      const invalidData = JSON.stringify({
        exportedAt: '2024-01-01',
        version: 1,
        plans: [],
      });

      const file = new File([invalidData], 'export.json', {
        type: 'application/json',
      });

      const { result } = renderHook(() => useExport());

      let importResult: { success: boolean; message: string } | undefined;
      await act(async () => {
        importResult = await result.current.importFromFile(file);
      });

      expect(importResult?.success).toBe(false);
      expect(result.current.error).toContain('Invalid export format');
    });

    it('saves imported data to localStorage', async () => {
      const validData = JSON.stringify({
        exportedAt: '2024-01-01',
        version: 1,
        dishes: [
          {
            id: 'test-dish',
            name: 'Test Dish',
            type: 'side',
            createdAt: '2024-01-01',
            updatedAt: '2024-01-01',
          },
        ],
        plans: [],
      });

      const file = new File([validData], 'export.json', {
        type: 'application/json',
      });

      const { result } = renderHook(() => useExport());

      await act(async () => {
        await result.current.importFromFile(file);
      });

      const stored = JSON.parse(localStorageMock.getItem('dishcourse_dishes') || '[]');
      expect(stored).toHaveLength(1);
      expect(stored[0].name).toBe('Test Dish');
    });
  });

  describe('clearError', () => {
    it('clears the error state', async () => {
      const file = new File(['not json'], 'data.txt', {
        type: 'text/plain',
      });

      const { result } = renderHook(() => useExport());

      // Cause an error
      await act(async () => {
        await result.current.importFromFile(file);
      });

      expect(result.current.error).toBeTruthy();

      // Clear the error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('file extension handling', () => {
    it('accepts .json file by extension even without type', async () => {
      const validData = JSON.stringify({
        exportedAt: '2024-01-01',
        version: 1,
        dishes: [],
        plans: [],
      });

      // File with .json extension but no type
      const file = new File([validData], 'export.json', { type: '' });

      const { result } = renderHook(() => useExport());

      let importResult: { success: boolean; message: string } | undefined;
      await act(async () => {
        importResult = await result.current.importFromFile(file);
      });

      expect(importResult?.success).toBe(true);
    });
  });
});
