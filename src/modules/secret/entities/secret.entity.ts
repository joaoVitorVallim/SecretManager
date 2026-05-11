import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import type { EncryptedPayload } from 'src/common/types/encrypted-payload.type';


@Entity('secret_manager')
@Index('idx_unique_active_secret', ['reference_hash'], {unique: true, where: '"is_active" = true'})
@Index('idx_sm_reference_hash', ['reference_hash'])
@Index('idx_sm_type', ['type'])
@Index('idx_sm_system', ['system'])
@Index('idx_sm_type_system', ['type', 'system'])
@Index('idx_sm_is_active', ['is_active'])
export class SecretEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 64 })
  reference_hash: string;

  @Column({ type: 'varchar', length: 50 })
  type: string;

  @Column({ type: 'varchar', length: 100 })
  system: string;

  @Column('text', { array: true })
  identifiers: string[];

  @Column({ type: 'jsonb'})
  credentials: EncryptedPayload;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  deactivated_at?: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  expires_at?: Date | null;
  
}