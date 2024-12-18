import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedUser1731717450642 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `-- Seed Data
            INSERT INTO "user" (id, email, password, "roleId") 
            VALUES 
            ('83e94044-a2b6-11ef-9e40-0242ac150002', 'admin-tie-time@gmail.com', '$2a$10$uNA8RW7GMd1OySe5AHtGleNFzwWEti1Sxi4GFAbGZNgku6kLBIJmq', 1), -- Admin
            ('268b1c99-86d5-11ef-affd-0242ac1c0002', 'user1@gmail.com', '$2a$10$d1CFc.d3oqEQLo4PWJWbzOqG/60CmqeYsktOaIWkVOCwJ5pIxNDxi', 2),   -- User 
            ('83e94322-a2b6-11ef-9e40-0242ac150002', 'user2@gmail.com', '$2a$10$d1CFc.d3oqEQLo4PWJWbzOqG/60CmqeYsktOaIWkVOCwJ5pIxNDxi', 2),   -- User 
            ('83e94374-a2b6-11ef-9e40-0242ac150002', 'user3@gmail.com', '$2a$10$d1CFc.d3oqEQLo4PWJWbzOqG/60CmqeYsktOaIWkVOCwJ5pIxNDxi', 2), -- User 
            ('83e943b9-a2b6-11ef-9e40-0242ac150002', 'user4@gmail.com', '$2a$10$d1CFc.d3oqEQLo4PWJWbzOqG/60CmqeYsktOaIWkVOCwJ5pIxNDxi', 2);  -- User
            `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `-- Seed Data
            DELETE FROM "user" WHERE email IN ('admin-tie-time@gmail.com', 'user1@gmail.com', 'user2@gmail.com', 'user3@gmail.com', 'user4@gmail.com');
            `
    );
  }
}
