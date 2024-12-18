import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedRole1731715566942 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `-- Seed Data 
          INSERT INTO role (label) VALUES ('admin'), ('user');`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `-- Revert Seed Data 
          DELETE FROM role WHERE label IN ('admin', 'user');`
    );
  }
}
