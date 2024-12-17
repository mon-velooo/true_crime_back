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
