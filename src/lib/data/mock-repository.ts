import { mockSnapshot } from "@/lib/data/mock";
import type { AcademicRepository } from "@/lib/data/repository";

export const mockRepository: AcademicRepository = {
  async load() {
    return structuredClone(mockSnapshot);
  },
};
