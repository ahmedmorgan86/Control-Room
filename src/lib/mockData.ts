import type {
  BlockType,
  EquipmentData,
  Severity,
  User,
  VesselData,
  YardBlock,
  YardDataWithViolations,
  YTPosition,
  YTStatus,
} from "@/lib/types";

export const DATA_MODES = ["auto", "simulated", "live"] as const;
export type DataMode = (typeof DATA_MODES)[number];

const TERMINALS = ["ACT", "DCT"] as const;
type Terminal = (typeof TERMINALS)[number];

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

const BLOCK_TYPES: BlockType[] = ["DG", "RF", "EMPTY", "IMP_EXP", "IMP", "EXP", "CFS", "INSP", "NEGLECT", "OTHER"];
const SEVERITIES: Severity[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

const BLOCK_TYPE_LABEL: Record<string, string> = {
  DG: "Dangerous Goods",
  RF: "Reefer",
  EMPTY: "Empty",
  IMP_EXP: "Import/Export Mixed",
  IMP: "Import",
  EXP: "Export",
  CFS: "CFS Cargo",
  INSP: "Inspection",
  NEGLECT: "Neglect Yard",
  OTHER: "General",
};

function vesselCodes(terminal: Terminal): Array<Record<string, number>> {
  if (terminal === "ACT")
    return [
      { code: 10421, seq: 12 },
      { code: 20692, seq: 51 },
      { code: 10335, seq: 8 },
    ];
  return [
    { code: 771421, seq: 3 },
    { code: 887920, seq: 17 },
  ];
}

const VESSEL_NAMES: Record<Terminal, string[]> = {
  ACT: ["MSC Aurora", "Ever Given", "CMA CGM Marco Polo"],
  DCT: ["Maersk Malacca", "COSCO Universe"],
};

function buildVessel(
  terminal: Terminal,
  code: number,
  seq: number,
  index: number,
): VesselData {
  const rng = mulberry32(code + seq * 31 + index * 7);
  const craneCount = terminal === "ACT" ? 3 + (index % 2) : 3;
  const total = 1200 + Math.floor(rng() * 400);
  // movesDone advances slowly with each call so progress looks "live"
  const progressBase = 0.12 + rng() * 0.65;
  const movesDone = Math.min(total, Math.floor(total * progressBase));
  const loadShare = rng() * 0.55;
  const dischargeShare = 1 - loadShare;
  const loadingTotal = Math.floor(total * loadShare);
  const dischargingTotal = total - loadingTotal;
  const loadingDone = Math.min(loadingTotal, Math.floor(movesDone * loadShare));
  const dischargingDone = movesDone - loadingDone;
  const cranes = Array.from({ length: craneCount }, (_, i) => {
    const ownTotal = Math.floor((total / craneCount) * (0.8 + rng() * 0.4));
    const doneRatio = 0.1 + rng() * 0.8;
    const ownDone = Math.min(ownTotal, Math.floor(ownTotal * doneRatio));
    const ownLoadShare = 0.35 + rng() * 0.3;
    return {
      craneId: `QC0${i + 1}`,
      movesDone: ownDone,
      movesTotal: ownTotal,
      layoutRank: i + 1,
      loadingDone: Math.min(Math.floor(ownDone * ownLoadShare), ownTotal),
      loadingTotal: Math.floor(ownTotal * ownLoadShare),
      dischargingDone: ownDone - Math.min(Math.floor(ownDone * ownLoadShare), ownTotal),
      dischargingTotal: ownTotal - Math.floor(ownTotal * ownLoadShare),
      mph: Math.floor(rng() * 40),
    };
  });
  const names = VESSEL_NAMES[terminal];
  return {
    vesselCode: String(code),
    callYear: new Date().getFullYear(),
    callSeq: seq,
    vesselName: names[index % names.length],
    voyageNumber: `${String.fromCharCode(65 + index)}${(100 + index * 37).toString()}`,
    arrivalTime: new Date(Date.now() - (index + 1) * 3 * 3600000).toISOString(),
    gmph: 20 + Math.floor(rng() * 20),
    totalMoves: total,
    totalDone: movesDone,
    loadingDone,
    loadingTotal,
    dischargingDone: Math.max(dischargingDone, 0),
    dischargingTotal,
    cranes,
  };
}

export function generateVessels(terminal: string): VesselData[] {
  if (terminal !== "ACT" && terminal !== "DCT") return [];
  return vesselCodes(terminal).map((v, i) =>
    buildVessel(terminal, v.code, v.seq, i),
  );
}

function buildYardBlock(terminal: Terminal, index: number): YardBlock {
  const rng = mulberry32((terminal === "ACT" ? 1 : 2) * 1000 + index * 53);
  const blockType = pick(rng, BLOCK_TYPES);
  const capacityTeu = terminal === "ACT" ? 5000 : 4200;
  const fillRatio = 0.35 + rng() * 0.55;
  const occupiedTeu = Math.floor(capacityTeu * fillRatio);
  const violationRand = rng();
  const violationCount = violationRand < 0.4 ? 0 : Math.floor(rng() * 6);
  const maxSeverity =
    violationCount === 0 ? "LOW" : pick(rng, SEVERITIES.slice(0, 3));
  const neglectCount = blockType === "NEGLECT" ? Math.floor(rng() * 9) : 0;
  return {
    blockId: `${String.fromCharCode(65 + Math.floor(index / 10))}${String(
      index % 10,
    ).padStart(2, "0")}`,
    blockType,
    capacityTeu,
    occupiedTeu,
    fillRatio,
    cnt20: Math.floor(occupiedTeu * (0.35 + rng() * 0.2)),
    cnt40: Math.floor(occupiedTeu * (0.45 + rng() * 0.2)),
    cntImport: Math.floor(occupiedTeu * (0.5 + rng() * 0.2)),
    cntExport: Math.floor(occupiedTeu * (0.3 + rng() * 0.2)),
    remark: `${BLOCK_TYPE_LABEL[blockType]} · ${Math.round(fillRatio * 100)}% full`,
    violationCount,
    maxSeverity,
    neglectCount,
  };
}

function blockViolations(blocks: YardBlock[], terminal: Terminal) {
  const rng = mulberry32(terminal === "ACT" ? 4242 : 9876);
  const severities: Severity[] = ["CRITICAL", "HIGH", "MEDIUM"];
  const types = ["RF_REEFER_OFF", "DG_MISPLACED", "IMP_EXP_MIX", "NEGLECT_STACK", "SIZE_MISMATCH"];
  const describe: Record<string, string> = {
    RF_REEFER_OFF: "Reefer container power disconnected",
    DG_MISPLACED: "DG container stored in non-DG block",
    IMP_EXP_MIX: "Import/export containers mixed in export block",
    NEGLECT_STACK: "Container stacked in neglect yard",
    SIZE_MISMATCH: "Container size mismatch with slot",
  };
  const violated = blocks.filter((b) => b.violationCount > 0).slice(0, 8);
  const pk = Array.from(
    { length: 3 + Math.min(violated.length, 6) },
    (_, i) => i % Math.max(violated.length, 1),
  ).map((idx) => {
    const block = violated.length ? violated[idx] : blocks[0];
    const type = pick(rng, types);
    return {
      cntrNo: `TCLU${1000000 + Math.floor(rng() * 8999999)}`,
      type,
      severity: pick(rng, severities),
      block: block.blockId,
      description: describe[type],
    };
  });
  return pk.sort((a, b) => {
    const rank: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    return rank[a.severity] - rank[b.severity];
  });
}

export function generateYard(terminal: string): YardDataWithViolations {
  const t: Terminal = terminal === "ACT" ? "ACT" : "DCT";
  const blockCount = 12;
  const blocks = Array.from({ length: blockCount }, (_, i) =>
    buildYardBlock(t, i),
  );
  const totalCapacity = blocks.reduce((s, b) => s + b.capacityTeu, 0);
  const totalOccupied = blocks.reduce((s, b) => s + b.occupiedTeu, 0);
  const summary = {
    overallFillRatio: totalCapacity ? totalOccupied / totalCapacity : 0,
    totalOccupied,
    totalCapacity,
    reeferCount: blocks
      .filter((b) => b.blockType === "RF")
      .reduce((s, b) => s + b.occupiedTeu, 0),
    dgCount: blocks
      .filter((b) => b.blockType === "DG")
      .reduce((s, b) => s + b.occupiedTeu, 0),
    neglectCount: blocks.reduce((s, b) => s + b.neglectCount, 0),
    totalViolations: blocks.reduce((s, b) => s + b.violationCount, 0),
    criticalCount: blocks.filter((b) => b.maxSeverity === "CRITICAL").length,
    highCount: blocks.filter((b) => b.maxSeverity === "HIGH").length,
    mediumCount: blocks.filter((b) => b.maxSeverity === "MEDIUM").length,
  };
  return { blocks, summary, violations: blockViolations(blocks, t) };
}

function ytDriver(index: number): string {
  const first = ["Mohamed", "Ahmed", "Ali", "Omar", "Hassan", "Youssef", "Karim", "Tarek"];
  const last = ["El-Sayed", "Hassan", "Fathy", "Salem", "Nabil", "Gamal"];
  return `${first[index % first.length]} ${last[index % last.length]}`;
}

function yardEquipment(terminal: Terminal) {
  const rng = mulberry32(terminal === "ACT" ? 555 : 666);
  const rtgCount = terminal === "ACT" ? 8 : 6;
  const ytCount = terminal === "ACT" ? 8 : 6;

  const rtgCards = Array.from({ length: rtgCount }, (_, i) => ({
    equNo: `RTG${String(i + 1).padStart(3, "0")}`,
    status: pick(rng, ["WORKING", "IDLE", "MAINTENANCE"] as const),
    equType: "RTG",
    displayName: `RTG-${i + 1}`,
    driverName: ytDriver(i),
    isOnline: rng() > 0.12,
    position: `${BLOCK_TYPES[Math.floor(rng() * 6)]} Block ${String.fromCharCode(65 + i)}`,
    tttMinutes: rng() > 0.7 ? Math.floor(rng() * 35) : undefined,
    movesLastHour: rng() > 0.4 ? 4 + Math.floor(rng() * 18) : undefined,
  }));

  const ytCards = Array.from({ length: ytCount }, (_, i) => {
    const jobActive = rng() > 0.35;
    return {
      equNo: `YT${String(i + 1).padStart(3, "0")}`,
      driverName: ytDriver(ytCount + i),
      containerNo: jobActive ? `TCLU${1000000 + Math.floor(rng() * 8999999)}` : "",
      containerSize: pick(rng, ["20", "40", "40HC"] as const),
      jobStatus: jobActive ? pick(rng, ["IN_PROGRESS", "WAITING", "PICKUP", "DROP_OFF"] as const) : "IDLE",
      chassisNo: `CS${String(100 + Math.floor(rng() * 899))}`,
      displayName: `YT-${i + 1}`,
      isOnline: rng() > 0.12,
      status: jobActive ? "WORKING" : "IDLE",
      equType: "YT",
      position: `${pick(rng, ["QC", "Yard"])} Zone`,
      jobType: jobActive ? pick(rng, ["IMPORT", "EXPORT", "SHIFTING"] as const) : undefined,
      tttMinutes: rng() > 0.6 ? Math.floor(rng() * 32) : undefined,
      movesLastHour: rng() > 0.4 ? 3 + Math.floor(rng() * 15) : undefined,
    };
  });

  return { rtgCards, ytCards };
}

export function generateEquipment(terminal: string): EquipmentData {
  const t: Terminal = terminal === "ACT" ? "ACT" : "DCT";
  const rng = mulberry32(t === "ACT" ? 777 : 888);
  const { rtgCards, ytCards } = yardEquipment(t);
  const qcCount = t === "ACT" ? 4 : 3;

  const qcGroups = Array.from({ length: qcCount }, (_, i) => {
    const assigned = ytCards.filter((_, yi) => yi % qcCount === i);
    return {
      qcNo: `QC0${i + 1}`,
      qcCard: {
        qcNo: `QC0${i + 1}`,
        movesLastHour: 20 + Math.floor(rng() * 40),
        driverName: ytDriver(i),
        currentJob: pick(rng, ["UNLOAD", "LOAD", "SHIFTING"] as const),
      },
      ytCards: assigned,
      pendingOrdersCount: Math.floor(rng() * 6),
    };
  });

  const yardSections = [
    {
      equType: "RTG",
      label: "Rubber-Tyred Gantry Cranes",
      accent: "#f97316",
      accentColor: "#f97316",
      cards: rtgCards,
    },
    {
      equType: "YT",
      label: "Yard Trucks",
      accent: "#10b981",
      accentColor: "#10b981",
      cards: ytCards,
    },
  ];

  const totalOnline =
    rtgCards.filter((c) => c.isOnline !== false).length +
    ytCards.filter((c) => c.isOnline !== false).length +
    qcGroups.length;
  return {
    qcGroups,
    yardSections,
    totalActive: totalOnline,
    totalOnline,
    blockTypeMap: BLOCK_TYPE_LABEL,
  };
}

function buildYTPositions(terminal: Terminal): YTPosition[] {
  const rng = mulberry32(terminal === "ACT" ? 31337 : 90210);
  const count = terminal === "ACT" ? 10 : 7;
  const lanesX = Array.from({ length: count }, (_, i) => 120 + (i % 4) * 230);
  const baseY = 90;
  return Array.from({ length: count }, (_, i) => {
    const status: YTStatus = pick(rng, ["MOVING", "MOVING", "IDLE", "STOPPED"] as const);
    return {
      equNo: `YT${String(i + 1).padStart(3, "0")}`,
      x: lanesX[i],
      y: baseY,
      z: 80 + Math.floor(rng() * 400),
      heading: Math.floor(rng() * 360),
      containerNo: rng() > 0.45 ? `TCLU${1000000 + Math.floor(rng() * 8999999)}` : undefined,
      status,
    };
  });
}

export function generateYTTracking(terminal: string): YTPosition[] {
  if (terminal !== "ACT" && terminal !== "DCT") return [];
  return buildYTPositions(terminal);
}

const TRUCK_EQU = ["TRK01", "TRK02", "TRK03", "TRK04", "TRK05", "TRK06", "TRK07", "TRK08"];
const GATE_NAMES = ["G1 IN", "G1 OUT", "G2 IN", "G2 OUT", "G3 IN", "G3 OUT"];

function generateGateTransactions(terminal: Terminal) {
  const rng = mulberry32(terminal === "ACT" ? 1234 : 4321);
  const now = Date.now();
  const txns = Array.from({ length: 14 }, (_, i) => {
    const inOut = rng() > 0.42 ? "IN" : "OUT";
    const statuses = ["COMPLETED", "COMPLETED", "COMPLETED", "PROCESSING", "WAITING"];
    const minutesAgo = Math.floor(rng() * 120);
    return {
      id: `${terminal}-${now - minutesAgo * 60000}-${i}`,
      timestamp: new Date(now - minutesAgo * 60000).toISOString(),
      gate: pick(rng, GATE_NAMES),
      truckId: pick(rng, TRUCK_EQU),
      driverName: ytDriver(i),
      containerNo: `TCLU${1000000 + Math.floor(rng() * 8999999)}`,
      containerSize: pick(rng, ["20", "40", "40HC"] as const),
      type: inOut,
      status: pick(rng, statuses),
    };
  });
  return txns.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function generateGate(terminal: string) {
  if (terminal !== "ACT" && terminal !== "DCT") return { transactions: [], summary: null };
  const t: Terminal = terminal === "ACT" ? "ACT" : "DCT";
  const transactions = generateGateTransactions(t);
  const completed = transactions.filter((tx) => tx.status === "COMPLETED");
  return {
    transactions,
    summary: {
      totalIn: transactions.filter((tx) => tx.type === "IN").length,
      totalOut: transactions.filter((tx) => tx.type === "OUT").length,
      pendingCount: transactions.filter((tx) => tx.status === "PROCESSING" || tx.status === "WAITING").length,
      rejectedCount: transactions.filter((tx) => tx.status === "REJECTED").length,
      avgProcessTime: 1 + Math.floor(completed.length * 0.4),
    },
  };
}

const BERTH_NAMES = ["B1", "B2", "B3", "B4", "B5"];
const OPS = ["DISCHARGE", "LOAD", "DISCHARGE & LOAD", "SHIFTING"];

export function generateBerth(terminal: string) {
  if (terminal !== "ACT" && terminal !== "DCT") return { berths: [], summary: null };
  const t: Terminal = terminal === "ACT" ? "ACT" : "DCT";
  const rng = mulberry32(t === "ACT" ? 2222 : 3333);
  const [vesselA, vesselB] = generateVessels(t);
  const berths = BERTH_NAMES.map((berthId, i) => {
    if (i === 0)
      return {
        berthId,
        status: "OCCUPIED" as const,
        vesselCode: vesselA?.vesselCode,
        arrivalTime: new Date(Date.now() - 3 * 3600000).toISOString(),
        eta: new Date(Date.now() + 5 * 3600000).toISOString(),
        operation: pick(rng, OPS),
        pctComplete: 45 + Math.floor(rng() * 40),
      };
    if (i === 1)
      return {
        berthId,
        status: "OCCUPIED" as const,
        vesselCode: vesselB?.vesselCode,
        arrivalTime: new Date(Date.now() - 1 * 3600000).toISOString(),
        eta: new Date(Date.now() + 8 * 3600000).toISOString(),
        operation: pick(rng, OPS),
        pctComplete: 10 + Math.floor(rng() * 35),
      };
    if (i === 2)
      return {
        berthId,
        status: "RESERVED" as const,
        eta: new Date(Date.now() + 2 * 3600000).toISOString(),
      };
    return { berthId, status: "EMPTY" as const };
  });

  const occupied = berths.filter((b) => b.status === "OCCUPIED").length;
  const reserved = berths.filter((b) => b.status === "RESERVED").length;
  const empty = berths.filter((b) => b.status === "EMPTY").length;

  return {
    berths,
    summary: {
      occupied,
      empty,
      reserved,
      utilization: (occupied + reserved * 0.5) / berths.length,
    },
  };
}

export const mockUser: User = {
  full_name: "System Administrator",
  screens: {
    ACT_VSL_MONITOR: true,
    DCT_VSL_MONITOR: true,
    ACT_EQU_MONITOR: true,
    DCT_EQU_MONITOR: true,
    ACT_YARD_MONITOR: true,
    DCT_YARD_MONITOR: true,
    ACT_YT_TRACKER: true,
    DCT_YT_TRACKER: true,
    ACT_DASHBOARD: true,
    DCT_DASHBOARD: true,
    ACT_GATE_MONITOR: true,
    DCT_GATE_MONITOR: true,
    ACT_BERTH_MONITOR: true,
    DCT_BERTH_MONITOR: true,
    ACT_HEATMAP: true,
    DCT_HEATMAP: true,
    ACT_YT_TRAIL: true,
    DCT_YT_TRAIL: true,
    ACT_CRANE_TREND: true,
    DCT_CRANE_TREND: true,
  },
};

export function mockLoginToken(): string {
  return `local-sim-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function resolveDataMode(): DataMode {
  const mode = (process.env.DATA_MODE || "auto").toLowerCase();
  return (DATA_MODES as readonly string[]).includes(mode) ? (mode as DataMode) : "auto";
}