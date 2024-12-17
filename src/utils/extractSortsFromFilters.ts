import { Request } from "express";
import { Sort, SortableKeys } from "../types/sorts";

export function extractSortsFromFilters(
  request: Request,
  sortableKeys: SortableKeys
): { order: any } {
  try {
    const filters = request.query;
    let order: any = {};
    if (filters.sorts) {
      const sortsParamsString = filters.sorts as string;
      if (!verifySortParamsStrucutre(sortsParamsString)) {
        throw new Error("Sort params invalid");
      }
      if (!verifySortParamsValue(sortsParamsString, sortableKeys)) {
        throw new Error("Key or order value invalid");
      }
      const sortsArray = getSortArrayFromSortParamsString(
        sortsParamsString,
        sortableKeys
      );
      order = convertValidSortsArrayToOrder(sortsArray);
    }
    return { order };
  } catch (error) {
    throw error;
  }
}

function verifySortParamsStrucutre(sortsParamsString: string): boolean {
  const sortsParamsArray = sortsParamsString.split(",");
  if (sortsParamsArray.length < 1) {
    return false;
  }

  for (const sortParams of sortsParamsArray) {
    const sortKeyPairArray = sortParams.split(":");
    if (sortKeyPairArray.length !== 2) {
      return false;
    }
  }
  return true;
}

function verifySortParamsValue(
  sortsParamsString: string,
  sortableKeys: SortableKeys
): boolean {
  const acceptedKeys = sortableKeys.map((sortableKey) => sortableKey.paramsKey);
  const sortsParamsArray = sortsParamsString.split(",");
  for (const sortParams of sortsParamsArray) {
    const sortKeyPairArray = sortParams.split(":");
    const key = sortKeyPairArray[0];
    const order = sortKeyPairArray[1];
    if (!acceptedKeys.includes(key)) {
      return false;
    }
    if (order !== "asc" && order !== "desc") {
      return false;
    }
  }
  return true;
}

function getSortArrayFromSortParamsString(
  sortsParamsString: string,
  sortableKeys: SortableKeys
): Sort[] {
  const sortsParamsArray = sortsParamsString.split(",");
  const sortsArray: Sort[] = [];
  for (const sortParams of sortsParamsArray) {
    const sortKeyPairArray = sortParams.split(":");
    const key = getSortableKeyFromParamsKey(
      sortKeyPairArray[0],
      sortableKeys
    ) as string;
    const order = sortKeyPairArray[1];
    sortsArray.push({ key, order });
  }

  return sortsArray;
}

function getSortableKeyFromParamsKey(
  paramsKey: string,
  sortableKeys: SortableKeys
): string | null {
  for (const sortableKey of sortableKeys) {
    if (sortableKey.paramsKey === paramsKey) {
      return sortableKey.accessKey;
    }
  }
  return null;
}

function convertValidSortsArrayToOrder(sortsArray: Sort[]): {
  [key: string]: any;
} {
  const order: { [key: string]: any } = {};
  for (const sort of sortsArray) {
    addKeyValueStringToObject(order, sort.key, sort.order);
  }

  console.log("ORDER", order);
  return order;
}

function addKeyValueStringToObject(
  object: { [key: string]: any },
  key: string,
  value: any
) {
  const keysArray = key.split(".");
  const keyPassed = keysArray.shift() as string;
  if (keysArray.length === 0) {
    return (object[keyPassed] = value);
  }
  object[keyPassed] = {};
  const keysString = keysArray.join(".");
  return addKeyValueStringToObject(object[keyPassed], keysString, value);
}
