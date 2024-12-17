import { AppDataSource } from "../database/data-source";
import { AgeGroup } from "../models/AgeGroup";

const ageGroupRepository = AppDataSource.getRepository(AgeGroup);

// Fonction pour obtenir un genre par range
export const getAgeGroupByRange = async (range: string): Promise<AgeGroup | null> => {
  try {
    return await ageGroupRepository.findOne({ where: { range } });
  } catch (error) {
    console.error('Error fetching ageGroup by range:', error);
    return null;
  }
};

// Fonction pour créer un nouveau genre
export const createAgeGroup = async (data: AgeGroup): Promise<AgeGroup | null> => {
  try {
    return await ageGroupRepository.save(data);
  } catch (error) {
    console.error('Error creating ageGroup:', error);
    return null;
  }
};
