import { AppDataSource } from "../database/data-source";
import { Status } from "../models/Status";
import { Crime } from "../models/Crime"; // Assurez-vous que ce modèle existe et est correctement configuré

const statusRepository = AppDataSource.getRepository(Status);

// Fonction pour obtenir un Status par label
export const getStatusByLabel = async (label: string): Promise<Status | null> => {
  try {
    const status = await statusRepository.findOne({ where: { label }, relations: ["crimes"] });
    return status ? status : null;
  } catch (error) {
    console.error('Error fetching status by label:', error);
    return null;
  }
};

// Fonction pour créer un nouveau Status
export const createStatus = async (data: Status): Promise<Status | null> => {
  try {
    return await statusRepository.save(data);
  } catch (error) {
    console.error('Error creating status:', error);
    return null;
  }
};
