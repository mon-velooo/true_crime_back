import { AppDataSource } from "../database/data-source";
import { Crime } from "../models/Crime";
import {
  NumberCrimesByHourInfos,
  OffenceInfos,
} from "../types/stats/CrimeTypeStat";

const crimeRepository = AppDataSource.getRepository(Crime);

export const getCrimes = async (
  longitude: number,
  latitude: number,
  adjustedRadius: number,
  filters: any
): Promise<Crime[]> => {
  const queryBuilder = crimeRepository
    .createQueryBuilder("crime")
    .leftJoinAndSelect("crime.lawCategory", "lawCategory")
    .leftJoinAndSelect("crime.offence", "offence")
    .leftJoinAndSelect("crime.status", "status")
    .select([
      "crime.id",
      "crime.latitude",
      "crime.longitude",
      "crime.start_date",
      "crime.description",
      "crime.end_date",
      "lawCategory.id",
      "lawCategory.label",
      "status.id",
      "status.label",
      "offence.id",
      "offence.code",
      "offence.description",
    ])
    .where(
      "ST_DWithin(crime.location, ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326), :adjustedRadius)",
      {
        longitude,
        latitude,
        adjustedRadius,
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

  if (filters.rangeStartDate) {
    queryBuilder.andWhere("crime.start_date >= :rangeStartDate", {
      rangeStartDate: filters.rangeStartDate,
    });
  }

  if (filters.rangeEndDate) {
    queryBuilder.andWhere("crime.start_date <= :rangeEndDate", {
      rangeEndDate: filters.rangeEndDate,
    });
  }

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

export const getCrimeCountByOffence = async (
  rangeStartDate: string,
  rangeEndDate: string
): Promise<OffenceInfos[]> => {
  try {
    return await crimeRepository
      .createQueryBuilder("crime")
      .leftJoinAndSelect("crime.offence", "offence")
      .select(["offence.id", "offence.code", "offence.description"])
      .addSelect("COUNT(crime.id)", "crime_count")
      .where(
        "crime.start_date >= :rangeStartDate AND crime.start_date <= :rangeEndDate",
        { rangeStartDate, rangeEndDate }
      )
      .groupBy("offence.id, offence.code, offence.description")
      .addOrderBy("crime_count", "DESC")
      .limit(6)
      .getRawMany()
      .then((crimes) => {
        console.log("CRIMES", crimes);
        return crimes.map((crime) => ({
          offence: {
            id: crime.offence_id,
            code: crime.offence_code,
            description: crime.offence_description,
          },
          crimeCount: parseInt(crime.crime_count, 10),
        }));
      });
  } catch (error) {
    return [];
  }
};

export const getTotalCrimeByRangeDate = async (
  rangeStartDate: string,
  rangeEndDate: string
): Promise<number> => {
  try {
    const count = await crimeRepository
      .createQueryBuilder("crime")
      .where(
        "crime.start_date >= :rangeStartDate AND crime.start_date <= :rangeEndDate",
        { rangeStartDate, rangeEndDate }
      )
      .getCount();

    return count;
  } catch (error) {
    return 0;
  }
};

export const getCrimeCountGroupByHour = async (
  rangeStartDate: string,
  rangeEndDate: string
): Promise<NumberCrimesByHourInfos[]> => {
  try {
    return await crimeRepository
      .createQueryBuilder("crime")
      .select([
        "EXTRACT(HOUR FROM crime.start_time) as hour",
        "COALESCE(COUNT(crime.id), 0) as crime_count",
      ])
      .where(
        "crime.start_date >= :rangeStartDate AND crime.start_date <= :rangeEndDate",
        { rangeStartDate, rangeEndDate }
      )
      .groupBy("hour")
      .addOrderBy("hour", "ASC")
      .getRawMany()
      .then((crimes) => {
        console.log("CRIMES", crimes);
        return crimes.map((crime) => ({
          hour: crime.hour,
          crimeCount: parseInt(crime.crime_count, 10),
        }));
      });
  } catch (error) {
    return [];
  }
};
