import { AppDataSource } from "../database/data-source";
import { Crime } from "../models/Crime";

const crimeRepository = AppDataSource.getRepository(Crime);

export const getCrimes = async (
  select: (keyof Crime)[],
  longitude: number,
  latitude: number,
  radiusInMeters: number,
  filters: any
): Promise<Crime[]> => {
  const queryBuilder = crimeRepository
    .createQueryBuilder("crime")
    .select(select.map((field) => `crime.${field}`))
    .where(
      "ST_DWithin(crime.location, ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326), :radiusInMeters)",
      {
        longitude,
        latitude,
        radiusInMeters,
      }
    );

  if (filters.lawCategory) {
    queryBuilder.andWhere("crime.lawCategoryId = :lawCategoryId", {
      lawCategoryId: filters.lawCategory,
    });
  }

  // Ajoutez d'autres filtres ici si nécessaire
  // if (filters.someOtherFilter) {
  //   queryBuilder.andWhere("crime.someField = :someValue", {
  //     someValue: filters.someOtherFilter,
  //   });
  // }

  return await queryBuilder.getMany();
};

export const getCrimeById = async (id: string): Promise<Crime | null> => {
  try {
    return await crimeRepository
      .createQueryBuilder("crime")
      .leftJoinAndSelect("crime.district", "district")
      .leftJoinAndSelect("crime.locationDescription", "locationDescription")
      .leftJoinAndSelect("crime.locationType", "locationType")
      .leftJoinAndSelect("crime.suspectPerson", "suspect")
      .leftJoinAndSelect("crime.victimPerson", "victim")
      .leftJoinAndSelect("crime.status", "status")
      .leftJoinAndSelect("crime.lawCategory", "lawCategory")
      .where("crime.id = :id", { id })
      .getOneOrFail();
  } catch (error) {
    return null;
  }
};

// export const getTypeStats = async (): Promise<CrimeTypeStats> => {
//   const crimesTypeStats = await crimeRepository
//     .createQueryBuilder("crime")
//     .leftJoin(
//       LawCategory,
//       "lc",
//       "lc.crimes = crime.id AND pcb.checked_by = :userId AND pcb.date = :date",
//       { userId, date }
//     )
//     .select([
//       "passion.id as id",
//       "passion.label as label",
//       "passion.icon_path as icon_path",
//       "CASE WHEN pcb.id IS NOT NULL THEN 1 ELSE 0 END as is_checked",
//     ])
//     .orderBy("passion.id", "ASC")
//     .getRawMany()
//     .then((results) =>
//       results.map((result) => ({
//         ...result,
//         is_checked: result.is_checked === "1",
//       }))
//     );
// };
