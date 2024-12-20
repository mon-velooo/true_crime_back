import { AppDataSource } from "../database/data-source";
import { Crime } from "../models/Crime";
import {
  AgeGroupInfos,
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
        "FLOOR(EXTRACT(HOUR FROM crime.start_time)/2)*2 as hour",
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
        return crimes.map((crime) => ({
          hour: `${crime.hour}h`,
          crimeCount: parseInt(crime.crime_count, 10),
        }));
      });
  } catch (error) {
    return [];
  }
};

export const getCrimeCountByDay = async (
  rangeStartDate: string,
  rangeEndDate: string
): Promise<{ date: string; crimeCount: number }[]> => {
  try {
    return await crimeRepository
      .createQueryBuilder("crime")
      .select([
        "DATE(crime.start_date) as date",
        "COUNT(crime.id) as crime_count"
      ])
      .where(
        "crime.start_date >= :rangeStartDate AND crime.start_date <= :rangeEndDate",
        { rangeStartDate, rangeEndDate }
      )
      .groupBy("date")
      .orderBy("date", "ASC")
      .getRawMany()
      .then((crimes) => {
        return crimes.map((crime) => ({
          date: crime.date,
          crimeCount: parseInt(crime.crime_count, 10),
        }));
      });
  } catch (error) {
    return [];
  }
};

export const getAgeGroupeCrime = async (
  rangeStartDate: string,
  rangeEndDate: string
): Promise<AgeGroupInfos[]> => {
  try {
    return await crimeRepository
      .query(
        `
          SELECT 
          COALESCE(suspect_data.range, victim_data.range) AS age_group,
          COALESCE(suspect_data.suspect_count, 0) AS suspect_count,
          COALESCE(victim_data.victim_count, 0) AS victim_count
          FROM (
          SELECT suspect_age."range" AS range, COUNT(suspect.id) AS suspect_count
          FROM crime
          LEFT JOIN person suspect ON crime."suspectPersonId" = suspect.id
          LEFT JOIN age_group suspect_age ON suspect."ageGroupId" = suspect_age.id
          WHERE crime.start_date >= $1
          AND crime.start_date <= $2
          GROUP BY suspect_age."range"
          ) suspect_data
          FULL OUTER JOIN (
          SELECT 
          victim_age."range" AS range,
          COUNT(victim.id) AS victim_count
          FROM crime
          LEFT JOIN person victim ON crime."victimPersonId" = victim.id
          LEFT JOIN age_group victim_age ON victim."ageGroupId" = victim_age.id
          WHERE 
          crime.start_date >= $1
          AND crime.start_date <= $2
          GROUP BY 
          victim_age."range"
          ) victim_data
          ON suspect_data.range = victim_data.range;
        `,
        [rangeStartDate, rangeEndDate]
      )
      .then((crimes) => {
        console.log("CRIMES", crimes);
        return crimes.map((crime: any) => ({
          ageGroup: crime.age_group,
          suspectsCount: parseInt(crime.suspect_count, 10),
          victimsCount: parseInt(crime.victim_count, 10),
        }));
      });
  } catch (error) {
    return [];
  }
};
