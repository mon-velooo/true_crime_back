import { AppDataSource } from "../database/data-source";
import { Continent } from "../models/Continent";
import { Country } from "../models/Country";

const countryRepository = AppDataSource.getRepository(Country);

export interface PaginateCountries {
  countries: Country[];
  total: number;
}

export const getCountries = async (
  where: any,
  skip: number,
  take: number,
  order: any
): Promise<PaginateCountries> => {
  const [countries, total] = await countryRepository.findAndCount({
    where,
    relations: ["continent"],
    select: {
      id: true,
      iso: true,
      nicename: true,
      isParticipate: true,
      continent: {
        name: true,
      },
    },
    skip,
    take,
    order: { ...order },
  });
  return { countries, total };
};

export const updateCountry = async (country: Country): Promise<Country> => {
  const updatedCountry = await countryRepository.save(country);
  return updatedCountry;
};

export const getCountryById = async (id: number): Promise<Country | null> => {
  const country = await countryRepository.findOneOrFail({ where: { id } });
  return country;
};
