import { AppDataSource } from "../database/data-source";
import { RoleEnum } from "../enums/RoleEnum";
import { Role } from "../models/Role";

const roleRepository = AppDataSource.getRepository(Role);

export const getRoles = async (): Promise<Role[]> => {
  const roles = await roleRepository.find();
  return roles;
};

export const getRoleByLabel = async (label: RoleEnum): Promise<Role | null> => {
  try {
    const role = await roleRepository.findOneOrFail({
      where: { label },
    });
    return role;
  } catch (error) {
    return null;
  }
};

export const getRoleById = async (id: number): Promise<Role | null> => {
  try {
    const role = await roleRepository.findOneOrFail({
      where: { id },
    });
    return role;
  } catch (error) {
    return null;
  }
};

export const createRole = async (data: Role): Promise<Role> => {
  const newrole = await roleRepository.save(data);
  return newrole;
};
