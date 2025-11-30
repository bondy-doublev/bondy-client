// src/models/moderation.ts

export enum TargetType {
  REPORT = "REPORT",
  POST = "POST",
  COMMENT = "COMMENT",
  MESSAGE = "MESSAGE",
  USER = "USER",
}

export interface CreateReportRequest {
  targetType: TargetType;
  targetId: number;
  reason: string;
}
