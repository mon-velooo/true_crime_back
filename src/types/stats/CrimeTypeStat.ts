import { District } from "../../models/District";
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

export interface NumberCrimesByDistrictInfos {
  district: {
    id: District["id"];
    name: District["name"];
  };
  crimeCount: number;
}

export interface NumberCrimesByHourInfos {
  hour: number;
  crimeCount: number;
}

export interface NumberCrimesByHourStats {
  stats: NumberCrimesByHourInfos[];
  average: number;
}

export interface Kpi {
  title: string;
  value: number;
  type: "number" | "percent";
}
