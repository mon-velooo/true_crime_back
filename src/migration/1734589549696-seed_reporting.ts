import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedReporting1734589549696 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `-- Insert data into Reporting table for New York
        INSERT INTO "reporting" (id, latitude, longitude, location, description)
        VALUES
          (
            uuid_generate_v4(),
            40.712776, 
            -74.005974, 
            ST_SetSRID(ST_MakePoint(-74.005974, 40.712776), 4326),
            'Incident signalé à Manhattan, New York.'
          ),
          (
            uuid_generate_v4(),
            40.730610, 
            -73.935242, 
            ST_SetSRID(ST_MakePoint(-73.935242, 40.730610), 4326),
            'Signalement dans le quartier de Queens, New York.'
          ),
          (
            uuid_generate_v4(),
            40.650002, 
            -73.949997, 
            ST_SetSRID(ST_MakePoint(-73.949997, 40.650002), 4326),
            'Signalement à Brooklyn, New York.'
          ),
          (
            uuid_generate_v4(),
            40.844782, 
            -73.864827, 
            ST_SetSRID(ST_MakePoint(-73.864827, 40.844782), 4326),
            'Signalement dans le Bronx, New York.'
          ),
          (
            uuid_generate_v4(),
            40.579021, 
            -74.151535, 
            ST_SetSRID(ST_MakePoint(-74.151535, 40.579021), 4326),
            'Signalement à Staten Island, New York.'
          );
        `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `-- Delete inserted data from Reporting table for New York
        DELETE FROM "reporting"
        WHERE description IN (
          'Incident signalé à Manhattan, New York.',
          'Signalement dans le quartier de Queens, New York.',
          'Signalement à Brooklyn, New York.',
          'Signalement dans le Bronx, New York.',
          'Signalement à Staten Island, New York.'
        );
        `
    );
  }
}
