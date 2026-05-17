import { create } from "zustand";
import { apiConnector } from "../lib/apiConnector";

interface IQueryStore {
  /** Raw Mermaid string from the last successful generate/edit call */
  data: string | null;
  /** The Mermaid code currently rendered on the canvas — set by DrawingCanvas after a successful render */
  currentMermaid: string | null;
  setCurrentMermaid: (mermaid: string) => void;
  getData: (query: string) => Promise<boolean>;
  editData: (instruction: string) => Promise<boolean>;
}

export const useQueryStore = create<IQueryStore>((set, get) => ({
  data: null,
  currentMermaid: null,

  setCurrentMermaid: (mermaid: string) => set({ currentMermaid: mermaid }),

  getData: async (query: string): Promise<boolean> => {
    try {
      const res = await apiConnector(
        "GET",
        `http://localhost:3030/api/prompt/generate-flow?userPrompt=${encodeURIComponent(query)}`
      );

      if (res.success) {
        set({ data: res.data as string });
        return true;
      }
      return false;
    } catch (error) {
      console.error(error);
      return false;
    }
  },

  editData: async (instruction: string): Promise<boolean> => {
    const { currentMermaid } = get();
    if (!currentMermaid) return false;

    try {
      const res = await apiConnector(
        "POST",
        "http://localhost:3030/api/prompt/edit-flow",
        { currentMermaid, editInstruction: instruction }
      );

      if (res.success) {
        set({ data: res.data as string });
        return true;
      }
      return false;
    } catch (error) {
      console.error(error);
      return false;
    }
  },
}));
