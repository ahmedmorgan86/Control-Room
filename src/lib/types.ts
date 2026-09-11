export type BlockType = "DG" | "RF" | "EMPTY" | "IMP_EXP" | "IMP" | "EXP" | "CFS" | "INSP" | "NEGLECT" | "OTHER";
export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
export type YTStatus = "MOVING" | "IDLE" | "STOPPED";

export interface User {
  full_name: string;
  screens: Record<string, boolean>;
}

export interface VesselData {
  vesselCode: string;
  callYear: number;
  callSeq: number;
  cranes: CraneData[];
}

export interface CraneData {
  craneId: string;
  movesDone: number;
  movesTotal: number;
  layoutRank: number;
}

export interface YardBlock {
  blockId: string;
  blockType: BlockType | string;
  capacityTeu: number;
  occupiedTeu: number;
  fillRatio: number;
  cnt20: number;
  cnt40: number;
  cntImport: number;
  cntExport: number;
  remark: string;
  violationCount: number;
  maxSeverity: Severity | string;
  neglectCount: number;
}

export interface YardSummary {
  overallFillRatio: number;
  totalOccupied: number;
  totalCapacity: number;
  reeferCount: number;
  dgCount: number;
  neglectCount: number;
  totalViolations: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
}

export interface YardData {
  blocks: YardBlock[];
  summary: YardSummary;
}

export interface Violation {
  cntrNo: string;
  type: string;
  severity: Severity | string;
  block: string;
  description: string;
}

export interface YardDataWithViolations extends YardData {
  violations?: Violation[];
}

export interface QCGroup {
  qcNo: string;
  qcCard: QCCard;
  ytCards: YTCard[];
  pendingOrdersCount: number;
}

export interface QCCard {
  qcNo: string;
  movesLastHour: number;
  driverName: string;
  currentJob: string;
}

export interface YTCard {
  equNo: string;
  driverName: string;
  containerNo: string;
  containerSize: string;
  jobStatus: string;
  chassisNo: string;
  displayName?: string;
  isOnline?: boolean;
  position?: string;
  jobType?: string;
  tttMinutes?: number;
  movesLastHour?: number;
}

export interface YardSection {
  equType: string;
  label: string;
  accent: string;
  accentColor: string;
  cards: YardSectionCard[];
}

export interface YardSectionCard {
  equNo: string;
  status: string;
  equType: string;
  containerNo?: string;
  displayName?: string;
  driverName?: string;
  isOnline?: boolean;
  position?: string;
  jobType?: string;
  tttMinutes?: number;
  movesLastHour?: number;
}

export interface EquipmentData {
  qcGroups: QCGroup[];
  yardSections: YardSection[];
  totalActive: number;
  totalOnline: number;
  blockTypeMap: Record<string, string>;
}

export type EquType = "QC" | "RTG" | "YT" | "RS" | "TL" | "SUPPORT" | "UNK";

export interface YTPosition {
  equNo: string;
  x: number;
  y: number;
  z: number;
  heading: number;
  containerNo?: string;
  status: YTStatus | string;
}
