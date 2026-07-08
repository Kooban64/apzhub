import type { MatterPriority, MatterStatus, MatterTypeCode } from "./enums";

export interface Matter {
  readonly matterId: string;
  readonly matterReference: string;
  readonly title: string;
  readonly description?: string;
  readonly clientId: string;
  readonly matterTypeId: string;
  readonly matterStatus: MatterStatus;
  readonly practiceAreaId: string;
  readonly priority: MatterPriority;
  readonly openedAt: string;
  readonly closedAt?: string;
  readonly courtId?: string;
  readonly judgeId?: string;
  readonly leadAttorneyId: string;
  readonly teamMemberIds: readonly string[];
  readonly tags: readonly string[];
  readonly customFields: Readonly<Record<string, string>>;
}

export interface MatterType {
  readonly matterTypeId: string;
  readonly matterTypeCode: MatterTypeCode | string;
  readonly name: string;
  readonly description?: string;
  readonly defaultPracticeAreaId?: string;
  readonly defaultWorkflowId?: string;
  readonly isActive: boolean;
}

export interface PracticeArea {
  readonly practiceAreaId: string;
  readonly practiceAreaCode: string;
  readonly name: string;
  readonly description?: string;
  readonly isActive: boolean;
  readonly parentPracticeAreaId?: string;
}

export interface Court {
  readonly courtId: string;
  readonly courtCode: string;
  readonly name: string;
  readonly courtLevel?: string;
  readonly jurisdiction: string;
  readonly addressId?: string;
  readonly contactIds: readonly string[];
}

export interface Judge {
  readonly judgeId: string;
  readonly displayName: string;
  readonly title?: string;
  readonly courtId: string;
  readonly chamber?: string;
  readonly contactId?: string;
}

export interface Advocate {
  readonly advocateId: string;
  readonly displayName: string;
  readonly chambers?: string;
  readonly contactId: string;
  readonly registrationNumber?: string;
  readonly matterIds: readonly string[];
}

export interface Attorney {
  readonly attorneyId: string;
  readonly userId: string;
  readonly displayName: string;
  readonly registrationNumber?: string;
  readonly practiceAreaIds: readonly string[];
  readonly defaultRate?: number;
  readonly isActive: boolean;
}

export interface CandidateAttorney {
  readonly candidateAttorneyId: string;
  readonly userId?: string;
  readonly displayName: string;
  readonly supervisingAttorneyId: string;
  readonly admissionDate?: string;
  readonly isActive: boolean;
}

export interface Secretary {
  readonly secretaryId: string;
  readonly userId?: string;
  readonly displayName: string;
  readonly supportedAttorneyIds: readonly string[];
  readonly isActive: boolean;
}

export interface Paralegal {
  readonly paralegalId: string;
  readonly userId?: string;
  readonly displayName: string;
  readonly supervisingAttorneyId: string;
  readonly practiceAreaIds: readonly string[];
  readonly isActive: boolean;
}

export interface MatterSearchCriteria {
  readonly query?: string;
  readonly status?: MatterStatus | "all";
  readonly clientId?: string;
}
