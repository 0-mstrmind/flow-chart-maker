import { create } from "zustand";
import { apiConnector } from "../lib/apiConnector";

interface IQueryStore {
  data: string | null;
  getData: (query: string) => Promise<Boolean>;
}

export const useQueryStore = create<IQueryStore>((set) => ({
  data: null,
  getData: async (query: string): Promise<Boolean> => {
    try {
      const res = await apiConnector(
        "GET",
        `http://localhost:3030/api/prompt/generate-flow?userPrompt=${encodeURIComponent(query)}`,
      );

      console.log(res);
      
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
