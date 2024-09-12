import { PrimaryGeneratedColumn } from 'typeorm'
import { Entity }                 from 'typeorm'
import { Column }                 from 'typeorm'

import { Schema }                 from '../../../nestjs-typesense'
import { Field }                  from '../../../nestjs-typesense'

@Entity()
@Schema({ name: 'test' })
export class TestEntity {
  @Field('string')
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  @Field('string')
  company!: string

  @Column()
  @Field('int32')
  employees!: number
}
