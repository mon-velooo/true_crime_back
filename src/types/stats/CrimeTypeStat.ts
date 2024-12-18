import { LawCategory } from "../../models/LawCategory";
import { Offence } from "../../models/Offence";

export interface OffenceInfos {
  offence: Offence;
  totalCrimeType: number;
}

export type CrimeTypeStats = {
  totalCrime: number;
  offencesStats: OffenceInfos[];
};
