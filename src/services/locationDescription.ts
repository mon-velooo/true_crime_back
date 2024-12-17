import { AppDataSource } from "../database/data-source";
import { LocationDescription } from "../models/LocationDescription";
import { Crime } from "../models/Crime"; // Assurez-vous que ce modèle existe et est correctement configuré

const locationDescriptionRepository = AppDataSource.getRepository(LocationDescription);

// Fonction pour obtenir une LocationDescription par description
export const getLocationDescriptionByDescription = async (description: string): Promise<LocationDescription | null> => {
  try {
    const locationDescription = await locationDescriptionRepository.findOne({ where: { description }, relations: ["crimes"] });
    return locationDescription ? locationDescription : null;
  } catch (error) {
    console.error('Error fetching location description by description:', error);
    return null;
  }
};

// Fonction pour créer une nouvelle LocationDescription
export const createLocationDescription = async (data: LocationDescription): Promise<LocationDescription | null> => {
  try {
    return await locationDescriptionRepository.save(data);
  } catch (error) {
    console.error('Error creating location description:', error);
    return null;
  }
};
