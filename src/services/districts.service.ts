import { AppDataSource } from "../database/data-source";
import { District } from "../models/District";
import { Crime } from "../models/Crime";
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

export const getTop10DistrictsByCrimes = async (): Promise<District[]> => {
  return await districtRepository
    .createQueryBuilder("district")
    .leftJoinAndSelect("district.crimes", "crimes")
    .select("district.id")
    .addSelect("district.name")
    .addSelect("count(*)", "numberCrimes")
    .groupBy("district.id")
    .orderBy('"numberCrimes"', "DESC")
    .limit(10)
    .getMany();
};

export const getCrimesCountById = async (id: string): Promise<number> => {
  return await crimeRepository
    .createQueryBuilder("crime")
    .leftJoinAndSelect("crime.district", "district")
    .where("district.id = :id", { id })
    .getCount();
};
