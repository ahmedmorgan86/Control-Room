export type Terminal = "ACT" | "DCT";

export type ScreenKey =
  | "ACT_VSL_MONITOR"
  | "DCT_VSL_MONITOR"
  | "ACT_EQU_MONITOR"
  | "DCT_EQU_MONITOR"
  | "ACT_YARD_MONITOR"
  | "DCT_YARD_MONITOR"
  | "ACT_YT_TRACKER"
  | "DCT_YT_TRACKER"
  | "GATE_MONITOR"
  | "YARD_MONITOR"
  | "BERTH_MONITOR";

export type MonitorKind = "VSL" | "EQU" | "YARD" | "OTHER";

export interface Crane {
  craneId: string;
  movesDone: number;
  movesTotal: number;
  loadingDone: number;
  loadingTotal: number;
  dischargingDone: number;
  dischargingTotal: number;
  layoutRank: number;
  mph: number;
}

export interface Vessel {
  vesselCode: string;
  vesselName: string;
  voyageNumber: string;
  callYear: string;
  callSeq: string;
  arrivalTime: string;
  totalDone: number;
  totalMoves: number;
  loadingDone: number;
  loadingTotal: number;
  dischargingDone: number;
  dischargingTotal: number;
  gmph: number;
  cranes: Crane[];
}

export type BlockType =
  | "DG"
  | "RF"
  | "EMPTY"
  | "IMP_EXP"
  | "IMP"
  | "EXP"
  | "CFS"
  | "INSP"
  | "NEGLECT"
  | "OTHER";

export interface YardBlock {
  blockId: string;
  remark?: string;
  capacityTeu: number;
  occupiedTeu: number;
  containerCount?: number;
  cnt20?: number;
  cnt40?: number;
  cntImport?: number;
  cntExport?: number;
  neglectCount: number;
  fillRatio: number;
  blockType: BlockType;
  violationCount: number;
  maxSeverity?: Severity;
}

export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export interface Violation {
  cntrNo: string;
  block: string;
  description: string;
  type: string;
  severity: Severity;
}

export interface YardData {
  blocks: YardBlock[];
  violations: Violation[];
  summary: {
    totalCapacity: number;
    totalOccupied: number;
    overallFillRatio: number;
    reeferCount: number;
    dgCount: number;
    neglectCount: number;
    totalViolations: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
  };
}

export type EquType =
  | "QC"
  | "YT"
  | "RTG"
  | "RS"
  | "TL"
  | "SUPPORT"
  | "UNK";

export interface EquCard {
  equNo: string;
  equType: EquType;
  displayName: string;
  driverName: string | null;
  isOnline: boolean;
  jobType: string | null;
  position: string | null;
  movesLastHour: number;
  tttMinutes: number | null;
  assignedQc: string | null;
}

export interface QCGroup {
  qcNo: string;
  qcCard: EquCard;
  ytCards: EquCard[];
  pendingOrdersCount: number;
}

export interface YardSection {
  label: string;
  equType: EquType;
  accentColor?: string;
  cards: EquCard[];
}

export interface EquipmentData {
  qcGroups: QCGroup[];
  yardSections: YardSection[];
  blockTypeMap?: Record<string, BlockType>;
  totalActive: number;
  totalOnline: number;
}

export interface User {
  username: string;
  full_name: string;
  screens: Record<ScreenKey, boolean>;
}
