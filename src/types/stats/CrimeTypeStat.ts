import { LawCategory } from "../../models/LawCategory";

export interface CrimeTypeInfos {
  lawCategory: LawCategory;
  totalCrimeType: number;
}

export type CrimeTypeStats = {
  totalCrime: number;
  crimeTypes: CrimeTypeInfos[];
};
