import { AppDataSource } from "../database/data-source";
import { Person } from "../models/Person";
import { AgeGroup } from "../models/AgeGroup";
import { Gender } from "../models/Gender"; 
import { Crime } from "../models/Crime"; 

const personRepository = AppDataSource.getRepository(Person);

// Fonction pour obtenir une Person par âge et genre
export const getPersonByAgeAndGender = async (ageGroupId: number, genderId: number): Promise<Person | null> => {
  try {
    const person = await personRepository.findOne({
      where: {
        age_group: { id: ageGroupId },
        gender: { id: genderId }
      },
      relations: ["crimes", "age_group", "gender"]
    });
    return person ? person : null;
  } catch (error) {
    console.error('Error fetching person by age group and gender:', error);
    return null;
  }
};

// Fonction pour créer une nouvelle Person
export const createPerson = async (data: Person): Promise<Person | null> => {
  try {
    return await personRepository.save(data);
  } catch (error) {
    console.error('Error creating person:', error);
    return null;
  }
};
