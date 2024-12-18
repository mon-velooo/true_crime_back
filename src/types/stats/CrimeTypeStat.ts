import { LawCategory } from "../../models/LawCategory";
import { Offence } from "../../models/Offence";

export interface OffenceInfos {
  offence: {
    id: Offence["id"];
    code: Offence["code"];
    description: Offence["description"];
  };
  crimeCount: number;
}

export type CrimeTypeStats = {
  totalCrime: number;
  offencesStats: OffenceInfos[];
};
