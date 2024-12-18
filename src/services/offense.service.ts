import { AppDataSource } from "../database/data-source";
import { Offence } from "../models/Offence";

const offenceRepository = AppDataSource.getRepository(Offence);

// Fonction pour obtenir une infraction par code
export const getOffenceByCode = async (code: string): Promise<Offence | null> => {
  try {
    return await offenceRepository.findOne({ where: { code } });
  } catch (error) {
    console.error('Error fetching offence by code:', error);
    return null;
  }
};

// Fonction pour créer une nouvelle infraction
export const createOffence = async (data: Offence): Promise<Offence | null> => {
  try {
    return await offenceRepository.save(data);
  } catch (error) {
    console.error('Error creating offence:', error);
    return null;
  }
};

// Fonction pour récupérer toutes les infractions
export const getAllOffences = async (): Promise<Offence[]> => {
  try {
    return await offenceRepository.find();
  } catch (error) {
    console.error('Error fetching all offences:', error);
    return [];
  }
};
