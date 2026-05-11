import { MigrationInterface, QueryRunner } from 'typeorm';

export class CustomMigration1778244593766
  implements MigrationInterface
{
  public async up(
    queryRunner: QueryRunner,
  ): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS secret_manager (
        id BIGSERIAL PRIMARY KEY,
        reference_hash VARCHAR(64) NOT NULL,
        type VARCHAR(50) NOT NULL,
        system VARCHAR(100) NOT NULL,
        identifiers TEXT[] NOT NULL,
        credentials JSONB NOT NULL DEFAULT '{}',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        deactivated_at TIMESTAMPTZ,
        expires_at TIMESTAMPTZ
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX idx_unique_active_secret
      ON secret_manager(reference_hash)
      WHERE is_active = TRUE
    `);

    await queryRunner.query(`
      CREATE INDEX idx_sm_reference_hash
      ON secret_manager(reference_hash)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_sm_type
      ON secret_manager(type)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_sm_system
      ON secret_manager(system)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_sm_type_system
      ON secret_manager(type, system)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_sm_identifiers
      ON secret_manager
      USING GIN (identifiers)
    `);

    await queryRunner.query(`
      CREATE INDEX idx_sm_is_active
      ON secret_manager(is_active)
    `);
  }

  public async down(
    queryRunner: QueryRunner,
  ): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_sm_is_active`);

    await queryRunner.query(`DROP INDEX IF EXISTS idx_sm_identifiers`);

    await queryRunner.query(`DROP INDEX IF EXISTS idx_sm_type_system`);

    await queryRunner.query(`DROP INDEX IF EXISTS idx_sm_system`);

    await queryRunner.query(`DROP INDEX IF EXISTS idx_sm_type`);

    await queryRunner.query(`DROP INDEX IF EXISTS idx_sm_reference_hash`);

    await queryRunner.query(`DROP INDEX IF EXISTS idx_unique_active_secret`);

    await queryRunner.query(`DROP TABLE IF EXISTS secret_manager`);
  }
}