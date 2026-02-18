import { describe, it, expect } from "vitest";
import { 
  FEATURE_FLAGS, 
  isFeatureEnabled, 
  enablePhase, 
  CURRENT_PHASE 
} from "../shared/featureFlags";

describe("Feature Flags", () => {
  it("should have current phase set to phase1", () => {
    expect(CURRENT_PHASE).toBe("phase1");
  });

  it("should enable all phase1 features by default", () => {
    const phase1Features = Object.values(FEATURE_FLAGS).filter(f => f.phase === "phase1");
    expect(phase1Features.length).toBeGreaterThan(0);
    phase1Features.forEach(f => {
      expect(f.enabled).toBe(true);
    });
  });

  it("should disable all phase2 features by default", () => {
    const phase2Features = Object.values(FEATURE_FLAGS).filter(f => f.phase === "phase2");
    expect(phase2Features.length).toBeGreaterThan(0);
    phase2Features.forEach(f => {
      expect(f.enabled).toBe(false);
    });
  });

  it("should disable all phase3 features by default", () => {
    const phase3Features = Object.values(FEATURE_FLAGS).filter(f => f.phase === "phase3");
    expect(phase3Features.length).toBeGreaterThan(0);
    phase3Features.forEach(f => {
      expect(f.enabled).toBe(false);
    });
  });

  it("isFeatureEnabled returns true for phase1 features", () => {
    expect(isFeatureEnabled("dashboard")).toBe(true);
    expect(isFeatureEnabled("patients")).toBe(true);
    expect(isFeatureEnabled("sbar")).toBe(true);
    expect(isFeatureEnabled("teams")).toBe(true);
    expect(isFeatureEnabled("settings")).toBe(true);
    expect(isFeatureEnabled("support")).toBe(true);
    expect(isFeatureEnabled("pwa")).toBe(true);
    expect(isFeatureEnabled("documentImport")).toBe(true);
    expect(isFeatureEnabled("voiceInput")).toBe(true);
    expect(isFeatureEnabled("onboarding")).toBe(true);
  });

  it("isFeatureEnabled returns false for phase2 features", () => {
    expect(isFeatureEnabled("analytics")).toBe(false);
    expect(isFeatureEnabled("teamChat")).toBe(false);
    expect(isFeatureEnabled("pushNotifications")).toBe(false);
    expect(isFeatureEnabled("hospitalDashboard")).toBe(false);
  });

  it("isFeatureEnabled returns false for phase3 features", () => {
    expect(isFeatureEnabled("drg")).toBe(false);
    expect(isFeatureEnabled("drgPredictor")).toBe(false);
    expect(isFeatureEnabled("recoveryRoom")).toBe(false);
    expect(isFeatureEnabled("gamification")).toBe(false);
    expect(isFeatureEnabled("i18n")).toBe(false);
    expect(isFeatureEnabled("enterprise")).toBe(false);
    expect(isFeatureEnabled("translation")).toBe(false);
  });

  it("isFeatureEnabled returns false for unknown features", () => {
    expect(isFeatureEnabled("nonexistent")).toBe(false);
  });

  it("enablePhase('phase2') enables phase1 and phase2 features", () => {
    enablePhase("phase2");
    
    expect(isFeatureEnabled("dashboard")).toBe(true);
    expect(isFeatureEnabled("analytics")).toBe(true);
    expect(isFeatureEnabled("teamChat")).toBe(true);
    expect(isFeatureEnabled("drg")).toBe(false);
    expect(isFeatureEnabled("enterprise")).toBe(false);
    
    // Reset back to phase1
    enablePhase("phase1");
  });

  it("enablePhase('phase3') enables all features", () => {
    enablePhase("phase3");
    
    expect(isFeatureEnabled("dashboard")).toBe(true);
    expect(isFeatureEnabled("analytics")).toBe(true);
    expect(isFeatureEnabled("drg")).toBe(true);
    expect(isFeatureEnabled("enterprise")).toBe(true);
    expect(isFeatureEnabled("recoveryRoom")).toBe(true);
    
    // Reset back to phase1
    enablePhase("phase1");
  });

  it("should have correct feature counts per phase", () => {
    const phase1Count = Object.values(FEATURE_FLAGS).filter(f => f.phase === "phase1").length;
    const phase2Count = Object.values(FEATURE_FLAGS).filter(f => f.phase === "phase2").length;
    const phase3Count = Object.values(FEATURE_FLAGS).filter(f => f.phase === "phase3").length;
    
    expect(phase1Count).toBe(10);
    expect(phase2Count).toBe(4);
    expect(phase3Count).toBe(7);
  });
});
