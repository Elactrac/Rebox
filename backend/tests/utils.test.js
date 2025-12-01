// Utility function tests

describe('Package Metrics Calculator', () => {
  // These tests verify the business logic for calculating package values
  
  const calculatePackageMetrics = (type, condition, quantity, weight) => {
    const baseValues = {
      BOX: 0.5,
      BOTTLE: 0.8,
      CONTAINER: 0.6,
      BAG: 0.3,
      OTHER: 0.4
    };

    const conditionMultipliers = {
      EXCELLENT: 1.0,
      GOOD: 0.8,
      FAIR: 0.5,
      POOR: 0.2
    };

    const co2PerKg = 2.5;
    const waterPerKg = 15;

    const baseValue = baseValues[type] || 0.4;
    const multiplier = conditionMultipliers[condition] || 0.5;
    const effectiveWeight = weight || quantity * 0.5;

    return {
      estimatedValue: parseFloat((baseValue * multiplier * effectiveWeight * quantity).toFixed(2)),
      co2Saved: parseFloat((co2PerKg * effectiveWeight).toFixed(2)),
      waterSaved: parseFloat((waterPerKg * effectiveWeight).toFixed(2))
    };
  };

  describe('Value Calculation', () => {
    it('should calculate correct value for BOX in EXCELLENT condition', () => {
      const metrics = calculatePackageMetrics('BOX', 'EXCELLENT', 10, 5);
      expect(metrics.estimatedValue).toBe(25); // 0.5 * 1.0 * 5 * 10
    });

    it('should calculate correct value for BOTTLE in GOOD condition', () => {
      const metrics = calculatePackageMetrics('BOTTLE', 'GOOD', 5, 2);
      expect(metrics.estimatedValue).toBe(6.4); // 0.8 * 0.8 * 2 * 5
    });

    it('should calculate correct value for BAG in FAIR condition', () => {
      const metrics = calculatePackageMetrics('BAG', 'FAIR', 20, 1);
      expect(metrics.estimatedValue).toBe(3); // 0.3 * 0.5 * 1 * 20
    });

    it('should use default weight when not provided', () => {
      const metrics = calculatePackageMetrics('BOX', 'EXCELLENT', 4, null);
      // effectiveWeight = 4 * 0.5 = 2
      expect(metrics.estimatedValue).toBe(4); // 0.5 * 1.0 * 2 * 4
    });
  });

  describe('Environmental Impact Calculation', () => {
    it('should calculate CO2 saved correctly', () => {
      const metrics = calculatePackageMetrics('BOX', 'GOOD', 1, 10);
      expect(metrics.co2Saved).toBe(25); // 2.5 * 10
    });

    it('should calculate water saved correctly', () => {
      const metrics = calculatePackageMetrics('BOX', 'GOOD', 1, 10);
      expect(metrics.waterSaved).toBe(150); // 15 * 10
    });

    it('should handle zero weight', () => {
      const metrics = calculatePackageMetrics('BOX', 'GOOD', 1, 0);
      // effectiveWeight = 1 * 0.5 = 0.5 (default when weight is falsy)
      expect(metrics.co2Saved).toBe(1.25); // 2.5 * 0.5
    });
  });

  describe('Edge Cases', () => {
    it('should handle unknown package type with default value', () => {
      const metrics = calculatePackageMetrics('UNKNOWN', 'GOOD', 1, 1);
      expect(metrics.estimatedValue).toBe(0.32); // 0.4 * 0.8 * 1 * 1
    });

    it('should handle unknown condition with default multiplier', () => {
      const metrics = calculatePackageMetrics('BOX', 'UNKNOWN', 1, 1);
      expect(metrics.estimatedValue).toBe(0.25); // 0.5 * 0.5 * 1 * 1
    });

    it('should handle high quantity correctly', () => {
      const metrics = calculatePackageMetrics('BOX', 'EXCELLENT', 1000, 0.1);
      expect(metrics.estimatedValue).toBe(50); // 0.5 * 1.0 * 0.1 * 1000
    });
  });
});

describe('Reward Points Calculator', () => {
  const calculateRewardPoints = (items, totalValue) => {
    const basePoints = Math.floor(totalValue * 10);
    const itemBonus = items.length * 5;
    return basePoints + itemBonus;
  };

  it('should calculate points for single item pickup', () => {
    const points = calculateRewardPoints([{ id: '1' }], 10);
    expect(points).toBe(105); // (10 * 10) + (1 * 5)
  });

  it('should calculate points for multiple items', () => {
    const points = calculateRewardPoints([{ id: '1' }, { id: '2' }, { id: '3' }], 25);
    expect(points).toBe(265); // (25 * 10) + (3 * 5)
  });

  it('should handle zero value', () => {
    const points = calculateRewardPoints([{ id: '1' }], 0);
    expect(points).toBe(5); // 0 + 5
  });

  it('should handle decimal values', () => {
    const points = calculateRewardPoints([{ id: '1' }], 15.99);
    expect(points).toBe(164); // floor(15.99 * 10) + 5 = 159 + 5
  });
});

describe('Tracking Code Generator', () => {
  const crypto = require('crypto');
  
  const generateTrackingCode = () => {
    return 'RB' + crypto.randomBytes(4).toString('hex').toUpperCase();
  };

  it('should generate code starting with RB', () => {
    const code = generateTrackingCode();
    expect(code.startsWith('RB')).toBe(true);
  });

  it('should generate code of correct length', () => {
    const code = generateTrackingCode();
    expect(code.length).toBe(10); // RB + 8 hex chars
  });

  it('should generate unique codes', () => {
    const codes = new Set();
    for (let i = 0; i < 100; i++) {
      codes.add(generateTrackingCode());
    }
    expect(codes.size).toBe(100);
  });

  it('should only contain valid characters', () => {
    const code = generateTrackingCode();
    expect(code).toMatch(/^RB[0-9A-F]{8}$/);
  });
});

describe('User Reward Levels', () => {
  const getRewardLevel = (lifetimePoints) => {
    if (lifetimePoints >= 10000) return 'Platinum';
    if (lifetimePoints >= 5000) return 'Gold';
    if (lifetimePoints >= 1000) return 'Silver';
    return 'Bronze';
  };

  it('should return Bronze for new users', () => {
    expect(getRewardLevel(0)).toBe('Bronze');
    expect(getRewardLevel(500)).toBe('Bronze');
    expect(getRewardLevel(999)).toBe('Bronze');
  });

  it('should return Silver at 1000 points', () => {
    expect(getRewardLevel(1000)).toBe('Silver');
    expect(getRewardLevel(2500)).toBe('Silver');
    expect(getRewardLevel(4999)).toBe('Silver');
  });

  it('should return Gold at 5000 points', () => {
    expect(getRewardLevel(5000)).toBe('Gold');
    expect(getRewardLevel(7500)).toBe('Gold');
    expect(getRewardLevel(9999)).toBe('Gold');
  });

  it('should return Platinum at 10000 points', () => {
    expect(getRewardLevel(10000)).toBe('Platinum');
    expect(getRewardLevel(50000)).toBe('Platinum');
  });
});
