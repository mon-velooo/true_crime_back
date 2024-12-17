import { AppDataSource } from "../database/data-source";
import { Sport } from "../models/Sport";
import { SportField } from "../models/SportField";

const sportRepository = AppDataSource.getRepository(Sport);
const sportFieldRepository = AppDataSource.getRepository(SportField);

export const getSports = async (): Promise<Sport[]> => {
    const sports = await sportRepository.find({
        relations: ["sportField"],
    });

    return sports;
};

export const getDetailSport = async (id: string): Promise<Sport> => {
    const sport = await sportRepository.findOneOrFail({
        where: { id: Number(id) },
        relations: ["sportField", "athleteSports", "events"],
    });

    return sport;
};

export const getSportFields = async (): Promise<SportField[]> => {
    const sportFields = await sportFieldRepository.find();

    return sportFields;
};