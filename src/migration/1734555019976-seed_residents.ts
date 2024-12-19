import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedResidents1734555019976 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `-- Seed Data
            INSERT INTO "residents_number_by_years" (id, year, residents_number)
            VALUES
              (1, '1750', 22000),
              (2, '1790', 49400),
              (3, '1800', 79200),
              (4, '1810', 119700),
              (5, '1820', 152100),
              (6, '1830', 242300),
              (7, '1840', 391100),
              (8, '1850', 696100),
              (9, '1860', 1174800),
              (10, '1870', 1478100),
              (11, '1880', 1911700),
              (12, '1890', 2507400),
              (13, '1900', 3437251),
              (14, '1910', 4766900),
              (15, '1920', 5620000),
              (16, '1930', 6930400),
              (17, '1940', 7455000),
              (18, '1950', 7892000),
              (19, '1960', 7782000),
              (20, '1970', 7894900),
              (21, '1980', 7071600),
              (22, '1990', 7322600),
              (23, '2000', 8008000),
              (24, '2010', 8175133),
              (25, '2020', 8804190),
              (26, '2023', 8258000);
          `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `-- Delete Seed Data
          DELETE FROM "residents_number_by_years" 
          WHERE year IN (
            '1750', '1790', '1800', '1810', '1820', '1830', 
            '1840', '1850', '1860', '1870', '1880', '1890', 
            '1900', '1910', '1920', '1930', '1940', '1950', 
            '1960', '1970', '1980', '1990', '2000', '2010', 
            '2020', '2023'
          );
        `
    );
  }
}
