import { AppDataSource } from "../database/data-source";
import { District } from "../models/District";
import { Crime } from "../models/Crime"; // Assurez-vous que ce modèle existe et est correctement configuré

const districtRepository = AppDataSource.getRepository(District);

// Fonction pour obtenir un District par nom
export const getDistrictByName = async (name: string): Promise<District | null> => {
  try {
    const district = await districtRepository.findOne({ where: { name }, relations: ["crimes"] });
    return district ? district : null;
  } catch (error) {
    console.error('Error fetching district by name:', error);
    return null;
  }
};

// Fonction pour créer un nouveau District
export const createDistrict = async (data: District): Promise<District | null> => {
  try {
    return await districtRepository.save(data);
  } catch (error) {
    console.error('Error creating district:', error);
    return null;
  }
};
