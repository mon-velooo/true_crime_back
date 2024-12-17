import { Request } from "express";

export function extractPaginationFromFilters(request: Request) {
  const filters = request.query;
  const page = parseInt(filters.page as string, 10) || 1;
  const limit = parseInt(filters.limit as string, 10) || 10;
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}
