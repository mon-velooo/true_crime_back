import { AppDataSource } from "../database/data-source";
import { Gender } from "../models/Gender";

const genderRepository = AppDataSource.getRepository(Gender);

// Fonction pour obtenir un genre par label
export const getGenderByLabel = async (label: string): Promise<Gender | null> => {
  try {
    return await genderRepository.findOne({ where: { label } });
  } catch (error) {
    console.error('Error fetching gender by label:', error);
    return null;
  }
};

// Fonction pour créer un nouveau genre
export const createGender = async (data: Gender): Promise<Gender | null> => {
  try {
    return await genderRepository.save(data);
  } catch (error) {
    console.error('Error creating gender:', error);
    return null;
  }
};
