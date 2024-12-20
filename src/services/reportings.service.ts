import { AppDataSource } from "../database/data-source";
import { Person } from "../models/Person";
import { AgeGroup } from "../models/AgeGroup";
import { Gender } from "../models/Gender";
import { Crime } from "../models/Crime";
import { Reporting } from "../models/Reporting";

const reportingRepository = AppDataSource.getRepository(Reporting);

// Fonction pour obtenir une Person par âge et genre
export const getReportings = async (): Promise<Reporting[]> => {
  try {
    const reportings = await reportingRepository.find();
    return reportings;
  } catch (error) {
    console.error("Error fetching reportings:", error);
    return [];
  }
};

// Fonction pour créer une nouvelle Person
export const createReporting = async (
  latitude: number,
  longitude: number,
  description: string
): Promise<Reporting | null> => {
  try {
    return await reportingRepository
      .createQueryBuilder()
      .insert()
      .into(Reporting)
      .values({
        longitude,
        latitude,
        description,
        location: () =>
          `ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)`,
      })
      .returning("*")
      .execute()
      .then((result) => result.raw[0]);
  } catch (error) {
    console.error("Error creating person:", error);
    return null;
  }
};
