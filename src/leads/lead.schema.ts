import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LeadDocument = Lead & Document;

@Schema({ timestamps: true })
export class Lead {
  @Prop({ required: false })
  name?: string;

  @Prop({ required: false })
  phone?: string;

  @Prop({ required: false })
  telegram?: string;

  @Prop({ required: true })
  ip: string;

  @Prop({ required: false })
  language?: string;

  @Prop({ required: false })
  platform?: string;

  @Prop({ required: false })
  resolution?: string;

  @Prop({ required: false })
  timezone?: string;

  @Prop({ required: false })
  userAgent?: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const LeadSchema = SchemaFactory.createForClass(Lead);

// Индекс для быстрого поиска по IP и времени создания
LeadSchema.index({ ip: 1, createdAt: -1 });

