import { AppDataSource } from "../database/data-source";
import { LawCategory } from "../models/LawCategory";
import { Crime } from "../models/Crime"; // Assurez-vous que ce modèle existe et est correctement configuré

const lawCategoryRepository = AppDataSource.getRepository(LawCategory);

// Fonction pour obtenir une LawCategory par label
export const getLawCategoryByLabel = async (label: string): Promise<LawCategory | null> => {
  try {
    const lawCategory = await lawCategoryRepository.findOne({ where: { label }, relations: ["crimes"] });
    return lawCategory ? lawCategory : null;
  } catch (error) {
    console.error('Error fetching law category by label:', error);
    return null;
  }
};

// Fonction pour créer une nouvelle LawCategory
export const createLawCategory = async (data: LawCategory): Promise<LawCategory | null> => {
  try {
    return await lawCategoryRepository.save(data);
  } catch (error) {
    console.error('Error creating law category:', error);
    return null;
  }
};
