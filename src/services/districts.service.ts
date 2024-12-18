import { AppDataSource } from "../database/data-source";
import { District } from "../models/District";
import { Crime } from "../models/Crime";
import { NumberCrimesByDistrictInfos } from "../types/stats/CrimeTypeStat";
const districtRepository = AppDataSource.getRepository(District);
const crimeRepository = AppDataSource.getRepository(Crime);

export const getDistrict = async (
  where: any,
  select: (keyof District)[]
): Promise<District[]> => {
  const districts = await districtRepository.find({
    where,
    select,
  });
  return districts;
};

export const getDistrictById = async (id: string): Promise<District | null> => {
  try {
    return await districtRepository
      .createQueryBuilder("district")
      .leftJoinAndSelect("district.crimes", "crimes")
      .where("district.id = :id", { id })
      .getOneOrFail();
  } catch (error) {
    return null;
  }
};

export const getTop10DistrictsByCrimes = async (
  rangeStartDate: string,
  rangeEndDate: string
): Promise<NumberCrimesByDistrictInfos[]> => {
  const queryBuilder = await districtRepository
    .createQueryBuilder("district")
    .leftJoinAndSelect(
      "district.crimes",
      "crime",
      "crime.start_date >= :rangeStartDate AND crime.start_date <= :rangeEndDate",
      { rangeStartDate, rangeEndDate }
    )
    .select([
      "district.id as id",
      "district.name as name",
      "COALESCE(COUNT(crime.id), 0) as crime_count",
    ])
    .groupBy("district.id")
    .orderBy("crime_count", "DESC")
    .limit(10);

  return await queryBuilder.getRawMany().then((districts) => {
    console.log("DISTRICTS", districts);
    return districts.map((district) => ({
      district: {
        id: district.id,
        name: district.name,
      },
      crimeCount: parseInt(district.crime_count, 10),
    }));
  });
};

export const getCrimesCountById = async (id: string): Promise<number> => {
  return await crimeRepository
    .createQueryBuilder("crime")
    .leftJoinAndSelect("crime.district", "district")
    .where("district.id = :id", { id })
    .getCount();
};
