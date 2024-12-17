import { AppDataSource } from "../database/data-source";
import { LocationType } from "../models/LocationType";
import { Crime } from "../models/Crime"; // Assurez-vous que ce modèle existe et est correctement configuré

const locationTypeRepository = AppDataSource.getRepository(LocationType);

// Fonction pour obtenir un LocationType par label
export const getLocationTypeByLabel = async (label: string): Promise<LocationType | null> => {
  try {
    const locationType = await locationTypeRepository.findOne({ where: { label }, relations: ["crimes"] });
    return locationType ? locationType : null;
  } catch (error) {
    console.error('Error fetching location type by label:', error);
    return null;
  }
};

// Fonction pour créer un nouveau LocationType
export const createLocationType = async (data: LocationType): Promise<LocationType | null> => {
  try {
    return await locationTypeRepository.save(data);
  } catch (error) {
    console.error('Error creating location type:', error);
    return null;
  }
};
