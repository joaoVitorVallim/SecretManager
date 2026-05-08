import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('secret_manager')
@Index('idx_unique_active_secret', ['reference_hash'], {unique: true, where: '"is_active" = true'})
@Index('idx_sm_reference_hash', ['reference_hash'])
export class SecretEntity {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 32 })
  reference_hash: string;

  @Column({ type: 'varchar', length: 255 })
  reference_row: string;

  @Column({ type: 'jsonb'})
  credentials: Record<string, any>;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  deactivated_at?: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  expires_at?: Date | null;
  
}