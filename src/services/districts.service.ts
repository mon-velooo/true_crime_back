import { AppDataSource } from "../database/data-source";
import { District } from "../models/District";
const districtRepository = AppDataSource.getRepository(District);

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
      .select("SUM(district.crimes)", "numberCrimes")
      .orderBy("numberCrimes", "DESC")
      .limit(10)
      .getMany();
};
