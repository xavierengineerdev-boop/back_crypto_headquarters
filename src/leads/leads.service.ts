import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lead, LeadDocument } from './lead.schema';

@Injectable()
export class LeadsService {
  constructor(
    @InjectModel(Lead.name) private leadModel: Model<LeadDocument>,
  ) {}

  /**
   * Создает новый лид в базе данных
   */
  async createLead(data: {
    name?: string;
    phone?: string;
    telegram?: string;
    ip: string;
    language?: string;
    platform?: string;
    resolution?: string;
    timezone?: string;
    userAgent?: string;
    fbclid?: string;
    utm_campaign?: string;
  }): Promise<LeadDocument> {
    const lead = new this.leadModel(data);
    return lead.save();
  }

  /**
   * Проверяет, есть ли лид с таким IP за последние 24 часа
   */
  async isDuplicate(ip: string, hoursWindow: number = 24): Promise<boolean> {
    if (!ip || ip === 'Неизвестен') {
      return false;
    }

    const hoursAgo = new Date();
    hoursAgo.setHours(hoursAgo.getHours() - hoursWindow);

    const existingLead = await this.leadModel.findOne({
      ip: ip,
      createdAt: { $gte: hoursAgo },
    });

    return !!existingLead;
  }

  /**
   * Получает время до следующей возможной отправки для IP
   */
  async getTimeUntilNextSubmission(ip: string, hoursWindow: number = 24): Promise<number> {
    if (!ip || ip === 'Неизвестен') {
      return 0;
    }

    const hoursAgo = new Date();
    hoursAgo.setHours(hoursAgo.getHours() - hoursWindow);

    const lastLead = await this.leadModel
      .findOne({
        ip: ip,
        createdAt: { $gte: hoursAgo },
      })
      .sort({ createdAt: -1 });

    if (!lastLead) {
      return 0;
    }

    const now = Date.now();
    const lastSubmissionTime = lastLead.createdAt.getTime();
    const timeSinceLastSubmission = now - lastSubmissionTime;
    const windowMs = hoursWindow * 60 * 60 * 1000;
    const timeUntilNext = windowMs - timeSinceLastSubmission;

    return timeUntilNext > 0 ? timeUntilNext : 0;
  }

  /**
   * Получает все лиды (для админки, если понадобится)
   */
  async getAllLeads(limit: number = 100, skip: number = 0): Promise<LeadDocument[]> {
    return this.leadModel.find().sort({ createdAt: -1 }).limit(limit).skip(skip).exec();
  }

  /**
   * Получает количество лидов
   */
  async getLeadsCount(): Promise<number> {
    return this.leadModel.countDocuments().exec();
  }
}

