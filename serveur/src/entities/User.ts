import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Offer } from './Offer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 100 })
  username!: string;

  @Column({ type: 'varchar', length: 255 })
  password!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  region?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  postalCode?: string;

  @Column({ type: 'boolean', default: false })
  emailVerified!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  emailVerificationToken?: string;

  @Column({ type: 'datetime', nullable: true })
  emailVerificationExpiry?: Date;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
  passwordResetToken?: string;

  @Column({ type: 'datetime', nullable: true })
  passwordResetExpiry?: Date;

  @OneToMany(() => Offer, (offer) => offer.user)
  offers!: Offer[];

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;
}

