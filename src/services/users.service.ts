import { AppDataSource } from "../database/data-source";
import { User } from "../models/User";
import { Role } from "../models/Role";
const roleRepository = AppDataSource.getRepository(Role);
const userRepository = AppDataSource.getRepository(User);

export interface PaginateUsers {
  users: User[];
  total: number;
}

const FIELDS_TO_SELECT: (keyof User)[] = ["id", "email", "createdAt"];

const buildRelations = (isAdminRoute: boolean) => {
  const relations = ["interests.sportField", "likes"];
  if (isAdminRoute) {
    relations.push("role");
  }
  return relations;
};

const getUserWithRelations = async (
  conditions: any,
  relations: string[]
): Promise<User | null> => {
  const user = await userRepository.findOne({
    where: conditions,
    relations: relations,
    select: FIELDS_TO_SELECT,
  });
  return user ?? null;
};

export const createUser = async (data: User): Promise<User> => {
  return userRepository.save(data);
};

export const getUsers = async (): Promise<User[]> => {
  const users = await userRepository.find({
    select: FIELDS_TO_SELECT,
  });
  return users;
};

export const getPaginateUsers = async (
  where: any,
  skip: number,
  take: number,
  order: any
): Promise<PaginateUsers> => {
  const [users, total] = await userRepository.findAndCount({
    where,
    relations: ["role"],
    select: FIELDS_TO_SELECT,
    skip,
    take,
    order: { ...order },
  });

  return { users, total };
};

export const getUserDetail = async (
  id: string,
  isAdminRoute: boolean = false
): Promise<User | null> => {
  return getUserWithRelations({ id }, buildRelations(isAdminRoute));
};

export const updateUser = async (
  id: string,
  fieldsToUpdate: Partial<User>,
  isAdminRoute: boolean = false
): Promise<User | null> => {
  const userToUpdate = await userRepository.findOne({ where: { id: id } });
  if (!userToUpdate) {
    return null;
  }

  Object.assign(userToUpdate, fieldsToUpdate);

  if (
    fieldsToUpdate.role &&
    typeof fieldsToUpdate.role === "object" &&
    fieldsToUpdate.role.id
  ) {
    const role = await roleRepository.findOne({
      where: { id: fieldsToUpdate.role.id },
    });
    if (role) {
      userToUpdate.role = role;
    }
  }

  await userRepository.save(userToUpdate);

  return getUserWithRelations({ id }, buildRelations(isAdminRoute));
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    return await userRepository.findOneOrFail({
      where: { email },
      relations: ["role"],
    });
  } catch (error) {
    return null;
  }
};

export const getUserById = async (id: string): Promise<User | null> => {
  try {
    return await userRepository
      .createQueryBuilder("user")
      .leftJoinAndSelect("user.role", "role")
      .where("user.id = :id", { id })
      .select(["user.email", "user.id", "role.label"])
      .getOneOrFail();
  } catch (error) {
    return null;
  }
};
