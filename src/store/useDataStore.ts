import { create } from 'zustand';

interface SheetConnection {
  spreadsheetId: string;
  sheetName: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
}

interface DataState {
  sheetConnection: SheetConnection | null;
  sheetData: any[];
  isLoading: boolean;
  error: string | null;
  setSheetConnection: (connection: SheetConnection) => void;
  setSheetData: (data: any[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useDataStore = create<DataState>((set) => ({
  sheetConnection: null,
  sheetData: [],
  isLoading: false,
  error: null,
  setSheetConnection: (connection) => set({ sheetConnection: connection }),
  setSheetData: (data) => set({ sheetData: data }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));