import { AppDataSource } from "../database/data-source";
import { Crime } from "../models/Crime";
const crimeRepository = AppDataSource.getRepository(Crime);

export const getCrimes = async (
  where: any,
  select: (keyof Crime)[]
): Promise<Crime[]> => {
  const crimes = await crimeRepository.find({
    where,
    select,
  });
  return crimes;
};

export const getCrimeById = async (id: string): Promise<Crime | null> => {
  try {
    return await crimeRepository
      .createQueryBuilder("crime")
      .leftJoinAndSelect("crime.role", "role")
      .where("crime.id = :id", { id })
      .select(["user.email", "user.id", "role.label"])
      .getOneOrFail();
  } catch (error) {
    return null;
  }
};
