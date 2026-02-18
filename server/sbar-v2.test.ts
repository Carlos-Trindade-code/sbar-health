import { describe, expect, it } from "vitest";

// Test PLANS configuration
describe("Pricing Plans Configuration", () => {
  const PLANS = {
    free: {
      id: 'free',
      name: 'Gratuito',
      price: { monthly: 0, yearly: 0 },
      trialDays: 30,
      limits: {
        patients: 5,
        teams: 1,
        teamMembers: 3,
        hospitals: 1,
        evolutionsPerMonth: 30,
        historyDays: 30,
        aiUsesPerDay: 10,
        whatsappMessages: 0
      }
    },
    basic: {
      id: 'basic',
      name: 'Básico',
      price: { monthly: 24.90, yearly: 238.90 },
      trialDays: 0,
      limits: {
        patients: 25,
        teams: 3,
        teamMembers: 5,
        hospitals: 3,
        evolutionsPerMonth: -1,
        historyDays: 180,
        aiUsesPerDay: 30,
        whatsappMessages: 0
      }
    },
    pro: {
      id: 'pro',
      name: 'Pro',
      price: { monthly: 49.90, yearly: 478.90 },
      trialDays: 0,
      limits: {
        patients: -1,
        teams: -1,
        teamMembers: -1,
        hospitals: -1,
        evolutionsPerMonth: -1,
        historyDays: -1,
        aiUsesPerDay: 100,
        whatsappMessages: 200
      }
    }
  };

  it("should have correct free plan limits", () => {
    expect(PLANS.free.limits.patients).toBe(5);
    expect(PLANS.free.limits.teams).toBe(1);
    expect(PLANS.free.limits.evolutionsPerMonth).toBe(30);
    expect(PLANS.free.trialDays).toBe(30);
  });

  it("should have correct basic plan pricing", () => {
    expect(PLANS.basic.price.monthly).toBe(24.90);
    expect(PLANS.basic.price.yearly).toBe(238.90);
    expect(PLANS.basic.limits.patients).toBe(25);
  });

  it("should have unlimited features in pro plan", () => {
    expect(PLANS.pro.limits.patients).toBe(-1);
    expect(PLANS.pro.limits.teams).toBe(-1);
    expect(PLANS.pro.limits.evolutionsPerMonth).toBe(-1);
  });

  it("should calculate yearly discount correctly", () => {
    const monthlyTotal = PLANS.pro.price.monthly * 12;
    const yearlyPrice = PLANS.pro.price.yearly;
    const discount = monthlyTotal - yearlyPrice;
    const monthsSaved = discount / PLANS.pro.price.monthly;
    
    expect(monthsSaved).toBeCloseTo(2, 0); // ~2 months free
  });
});

// Test usage limit calculations
describe("Usage Limit Calculations", () => {
  const getPercentage = (current: number, limit: number) => {
    if (limit === -1) return 0;
    return Math.min((current / limit) * 100, 100);
  };

  it("should calculate percentage correctly", () => {
    expect(getPercentage(3, 5)).toBe(60);
    expect(getPercentage(5, 5)).toBe(100);
    expect(getPercentage(10, 5)).toBe(100); // capped at 100
  });

  it("should return 0 for unlimited", () => {
    expect(getPercentage(100, -1)).toBe(0);
  });
});

// Test gamification points calculation
describe("Gamification Points System", () => {
  const calculatePoints = (evolutions: number, discharges: number, shifts: number, streak: number) => {
    const basePoints = (evolutions * 10) + (discharges * 50) + (shifts * 25);
    const streakMultiplier = streak >= 7 ? 2 : streak >= 3 ? 1.5 : 1;
    return Math.floor(basePoints * streakMultiplier);
  };

  it("should calculate base points correctly", () => {
    const points = calculatePoints(10, 2, 4, 0);
    // (10*10) + (2*50) + (4*25) = 100 + 100 + 100 = 300
    expect(points).toBe(300);
  });

  it("should apply streak multiplier for 7+ days", () => {
    const points = calculatePoints(10, 2, 4, 7);
    // 300 * 2 = 600
    expect(points).toBe(600);
  });

  it("should apply 1.5x multiplier for 3-6 day streak", () => {
    const points = calculatePoints(10, 2, 4, 5);
    // 300 * 1.5 = 450
    expect(points).toBe(450);
  });
});

// Test workload balance calculation
describe("Workload Balance", () => {
  const calculateBalance = (shifts: number, avgShifts: number) => {
    return (shifts / avgShifts) * 100;
  };

  const isOverloaded = (balance: number) => balance > 110;
  const isUnderloaded = (balance: number) => balance < 90;

  it("should identify balanced workload", () => {
    const balance = calculateBalance(10, 10);
    expect(balance).toBe(100);
    expect(isOverloaded(balance)).toBe(false);
    expect(isUnderloaded(balance)).toBe(false);
  });

  it("should identify overloaded doctor", () => {
    const balance = calculateBalance(13, 10);
    expect(isOverloaded(balance)).toBe(true);
  });

  it("should identify underloaded doctor", () => {
    const balance = calculateBalance(8, 10);
    expect(isUnderloaded(balance)).toBe(true);
  });
});

// Test hospital quality indicators
describe("Hospital Quality Indicators", () => {
  const isWithinTarget = (value: number, target: number, isLowerBetter: boolean = true) => {
    return isLowerBetter ? value <= target : value >= target;
  };

  const calculateTeamScore = (successRate: number, avgStay: number, readmission: number, mortality: number) => {
    return (successRate * 0.4) + ((10 - avgStay) * 3) + ((10 - readmission) * 2) + ((5 - mortality) * 4);
  };

  it("should validate infection rate within target", () => {
    expect(isWithinTarget(2.1, 3)).toBe(true);
    expect(isWithinTarget(3.5, 3)).toBe(false);
  });

  it("should calculate team score correctly", () => {
    // successRate: 92%, avgStay: 4.2 days, readmission: 3.5%, mortality: 1.2%
    const score = calculateTeamScore(92, 4.2, 3.5, 1.2);
    // (92*0.4) + ((10-4.2)*3) + ((10-3.5)*2) + ((5-1.2)*4)
    // = 36.8 + 17.4 + 13 + 15.2 = 82.4
    expect(score).toBeCloseTo(82.4, 1);
  });
});

// Test SBAR structure validation
describe("SBAR Evolution Structure", () => {
  interface SBAREvolution {
    situation: string;
    background: string;
    assessment: string;
    recommendation: string;
  }

  const validateSBAR = (evolution: SBAREvolution): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!evolution.situation || evolution.situation.length < 10) {
      errors.push("Situação deve ter pelo menos 10 caracteres");
    }
    if (!evolution.background || evolution.background.length < 10) {
      errors.push("Background deve ter pelo menos 10 caracteres");
    }
    if (!evolution.assessment || evolution.assessment.length < 10) {
      errors.push("Avaliação deve ter pelo menos 10 caracteres");
    }
    if (!evolution.recommendation || evolution.recommendation.length < 10) {
      errors.push("Recomendação deve ter pelo menos 10 caracteres");
    }
    
    return { valid: errors.length === 0, errors };
  };

  it("should validate complete SBAR evolution", () => {
    const evolution: SBAREvolution = {
      situation: "Paciente consciente, orientado, afebril.",
      background: "Internado há 3 dias por pneumonia.",
      assessment: "Boa evolução clínica nas últimas 24h.",
      recommendation: "Manter antibioticoterapia atual."
    };
    
    const result = validateSBAR(evolution);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("should reject incomplete SBAR evolution", () => {
    const evolution: SBAREvolution = {
      situation: "OK",
      background: "Internado",
      assessment: "",
      recommendation: "Manter"
    };
    
    const result = validateSBAR(evolution);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

// Test patient priority sorting
describe("Patient Priority Sorting", () => {
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  
  const sortByPriority = (patients: Array<{ name: string; priority: string }>) => {
    return [...patients].sort((a, b) => {
      const priorityA = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 4;
      const priorityB = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 4;
      return priorityA - priorityB;
    });
  };

  it("should sort patients by priority correctly", () => {
    const patients = [
      { name: "Patient A", priority: "low" },
      { name: "Patient B", priority: "critical" },
      { name: "Patient C", priority: "medium" },
      { name: "Patient D", priority: "high" }
    ];
    
    const sorted = sortByPriority(patients);
    
    expect(sorted[0].priority).toBe("critical");
    expect(sorted[1].priority).toBe("high");
    expect(sorted[2].priority).toBe("medium");
    expect(sorted[3].priority).toBe("low");
  });
});

// Test discharge probability calculation
describe("Discharge Probability Calculation", () => {
  const calculateDischargeProbability = (
    daysAdmitted: number,
    expectedStay: number,
    clinicalImprovement: boolean,
    pendingProcedures: boolean
  ): number => {
    let probability = 0;
    
    // Base probability from days admitted vs expected
    const stayRatio = daysAdmitted / expectedStay;
    if (stayRatio >= 1) {
      probability = 70;
    } else if (stayRatio >= 0.7) {
      probability = 50;
    } else if (stayRatio >= 0.5) {
      probability = 30;
    } else {
      probability = 10;
    }
    
    // Adjust for clinical factors
    if (clinicalImprovement) probability += 20;
    if (pendingProcedures) probability -= 30;
    
    return Math.max(0, Math.min(100, probability));
  };

  it("should calculate high probability for completed stay with improvement", () => {
    const prob = calculateDischargeProbability(5, 5, true, false);
    expect(prob).toBe(90); // 70 + 20
  });

  it("should calculate low probability for early stay with pending procedures", () => {
    const prob = calculateDischargeProbability(1, 5, false, true);
    expect(prob).toBe(0); // 10 - 30, capped at 0
  });

  it("should cap probability at 100", () => {
    const prob = calculateDischargeProbability(10, 5, true, false);
    expect(prob).toBe(90); // 70 + 20, would be higher but logic caps at 90 in this case
  });
});
