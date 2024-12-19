import { AppDataSource } from "../database/data-source";
import { ResidentsNumberByYears } from "../models/ResidentsNumberByYears";

const residentsNumberByYearsRepository = AppDataSource.getRepository(
  ResidentsNumberByYears
);

// Fonction pour obtenir une LocationDescription par description
export const residentsNumberByYears = async (
  year: string
): Promise<ResidentsNumberByYears | null> => {
  try {
    const residentsNumberByYears = await residentsNumberByYearsRepository
      .createQueryBuilder("residents")
      .orderBy(
        "ABS(CAST(residents.year AS INTEGER) - CAST(:year AS INTEGER))",
        "ASC"
      )
      .setParameter("year", year)
      .select(["residents.year", "residents.residents_number"])
      .limit(1)
      .getOne();
    return residentsNumberByYears ? residentsNumberByYears : null;
  } catch (error) {
    console.error("Error fetching residents number by years:", error);
    return null;
  }
};
