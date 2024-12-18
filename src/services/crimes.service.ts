import { AppDataSource } from "../database/data-source";
import { Crime } from "../models/Crime";
import { Offence } from "../models/Offence";
import { CrimeTypeStats, OffenceInfos } from "../types/stats/CrimeTypeStat";

const crimeRepository = AppDataSource.getRepository(Crime);
const offenceRepository = AppDataSource.getRepository(Offence);

export const getCrimes = async (
  longitude: number,
  latitude: number,
  radiusInMeters: number,
  filters: any
): Promise<Crime[]> => {
  const queryBuilder = crimeRepository
    .createQueryBuilder("crime")
    .leftJoinAndSelect("crime.lawCategory", "lawCategory")
    .leftJoinAndSelect("crime.offence", "offence")
    .select([
      "crime.id",
      "crime.latitude",
      "crime.longitude",
      "crime.start_date",
      "crime.description",
      "crime.end_date",
      "lawCategory.id",
      "lawCategory.label",
      "offence.id",
      "offence.code",
      "offence.description",
    ])
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

  if (filters.startDate) {
    queryBuilder.andWhere("crime.start_date = :startDate", {
      startDate: filters.startDate,
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

// export const getTypeStats = async (): Promise<CrimeTypeStats[]> => {
//   const stats = await crimeRepository
//     .createQueryBuilder("crime")
//     .select("crime.offenceId", "offenceId")
//     .addSelect("offence.code", "offenceCode")
//     .addSelect("offence.description", "offenceDescription")
//     .addSelect("COUNT(crime.id)", "crimeCount")
//     .innerJoin("crime.offence", "offence")
//     .groupBy("crime.offenceId")
//     .addGroupBy("offence.code")
//     .addGroupBy("offence.description")
//     .getRawMany();

//   return stats.map((stat) => ({
//     offenceId: stat.offenceId,
//     offenceCode: stat.offenceCode,
//     offenceDescription: stat.offenceDescription,
//     crimeCount: parseInt(stat.crimeCount, 10),
//   }));
// };
