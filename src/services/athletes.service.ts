import { AppDataSource } from "../database/data-source";
import { Athlete } from "../models/Athlete";

const athleteRepository = AppDataSource.getRepository(Athlete);

export const getAthletes = async (): Promise<Athlete[]> => {
  const athletes = await athleteRepository.find({
    relations: [
      "country",
      "athleteSports",
      "athleteSports.sport",
      "athleteSports.sport.sportField",
    ],
  });

  return athletes;
};

export const getOneAthleteById = async (id: string): Promise<Athlete> => {
  const athlete = await athleteRepository.findOneOrFail({
    where: { id },
    relations: ["country", "athleteSports"],
  });
  return athlete;
};

export const updateAthlete = async (id: string, data: Partial<Athlete>): Promise<Athlete> => {
  await athleteRepository.update(id, data);
  const athlete = await athleteRepository.findOneOrFail({
    where: { id },
    relations: ["country", "athleteSports"],
  });
  return athlete;
}