import mongoose from "mongoose";

// Scan Analytics Schema
const scanAnalyticsSchema = new mongoose.Schema({
  scanId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  patientId: {
    type: String,
    required: true,
    index: true
  },
  medicId: {
    type: String,
    required: true,
    index: true
  },
  patientInfo: {
    name: String,
    age: Number,
    gender: String,
    bloodGroup: String
  },
  scanType: {
    type: String,
    enum: ['Emergency', 'Routine', 'Follow-up', 'Consultation', 'Scheduled'],
    default: 'Emergency',
    required: true
  },
  scanStatus: {
    type: String,
    enum: ['critical', 'caution', 'normal', 'resolved'],
    default: 'normal'
  },
  scannedAt: {
    type: Date,
    default: Date.now,
    required: true,
    index: true
  },
  location: {
    type: {
      latitude: Number,
      longitude: Number,
      address: String,
      city: String,
      country: String,
      facility: String
    }
  },
  deviceInfo: {
    deviceType: String,
    browser: String,
    os: String,
    platform: String,
    screenResolution: String
  },
  responseTime: {
    type: Number, // in seconds
    default: 0
  },
  processingTime: {
    type: Number, // in milliseconds
    default: 0
  },
  dataSize: {
    type: Number, // in bytes
    default: 0
  },
  actionsTaken: [{
    action: String,
    timestamp: Date,
    notes: String,
    medicId: String,
    duration: Number // in minutes
  }],
  criticalConditionsFound: {
    type: Number,
    default: 0
  },
  conditions: {
    type: [String],
    default: []
  },
  medicalConditions: {
    type: [String],
    default: []
  },
  allergies: {
    type: [String],
    default: []
  },
  medications: {
    type: [String],
    default: []
  },
  emergencyContactsCalled: {
    type: Boolean,
    default: false
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: Date,
  outcome: {
    type: String,
    enum: ['treated', 'referred', 'admitted', 'discharged', 'monitoring', 'pending'],
    default: 'pending'
  },
  severityScore: {
    type: Number,
    min: 0,
    max: 10,
    default: 0
  },
  tags: [String],
  notes: String
}, {
  timestamps: true
});

// Practice Analytics Schema
const practiceAnalyticsSchema = new mongoose.Schema({
  medicId: {
    type: String,
    required: true,
    index: true
  },
  practiceInfo: {
    name: String,
    specialization: String,
    location: String
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  // Daily Statistics
  dailyStats: {
    totalScans: {
      type: Number,
      default: 0
    },
    emergencyScans: {
      type: Number,
      default: 0
    },
    routineScans: {
      type: Number,
      default: 0
    },
    followUpScans: {
      type: Number,
      default: 0
    },
    consultationScans: {
      type: Number,
      default: 0
    },
    criticalAlerts: {
      type: Number,
      default: 0
    },
    uniquePatients: {
      type: Number,
      default: 0
    },
    newPatients: {
      type: Number,
      default: 0
    },
    returningPatients: {
      type: Number,
      default: 0
    },
    averageResponseTime: {
      type: Number, // in minutes
      default: 0
    },
    peakHours: [{
      hour: Number,
      scanCount: Number,
      averageResponseTime: Number
    }],
    busiestPeriod: {
      startHour: Number,
      endHour: Number,
      scanCount: Number
    }
  },
  // Patient Demographics
  patientDemographics: {
    ageGroups: [{
      range: String, // e.g., "0-18", "19-35", "36-50", "51-65", "65+"
      count: Number,
      percentage: Number
    }],
    genderDistribution: [{
      gender: String,
      count: Number,
      percentage: Number
    }],
    bloodGroupDistribution: [{
      bloodGroup: String,
      count: Number,
      percentage: Number
    }]
  },
  // Condition Statistics
  conditionStats: {
    topConditions: [{
      condition: String,
      count: Number,
      severity: String,
      averageAge: Number
    }],
    allergyFrequency: [{
      allergy: String,
      count: Number,
      severity: String
    }],
    medicationUsage: [{
      medication: String,
      count: Number,
      category: String
    }],
    chronicConditions: [{
      condition: String,
      count: Number,
      managementLevel: String
    }]
  },
  // Performance Metrics
  performanceMetrics: {
    satisfactionRate: {
      type: Number, // percentage
      default: 0
    },
    followUpRate: {
      type: Number, // percentage
      default: 0
    },
    averageWaitTime: {
      type: Number, // in minutes
      default: 0
    },
    responseEfficiency: {
      type: Number, // percentage
      default: 0
    },
    patientRetentionRate: {
      type: Number, // percentage
      default: 0
    },
    emergencyResponseRate: {
      type: Number, // percentage
      default: 0
    },
    scanCompletionRate: {
      type: Number, // percentage
      default: 0
    }
  },
  // Financial Metrics (if applicable)
  financialMetrics: {
    revenue: Number,
    insuranceClaims: Number,
    averageRevenuePerPatient: Number
  }
}, {
  timestamps: true
});

// Monthly Analytics Schema
const monthlyAnalyticsSchema = new mongoose.Schema({
  medicId: {
    type: String,
    required: true,
    index: true
  },
  year: {
    type: Number,
    required: true,
    index: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
    index: true
  },
  // Monthly Trends
  monthlyTrends: {
    totalPatients: {
      type: Number,
      default: 0
    },
    totalScans: {
      type: Number,
      default: 0
    },
    emergencyScans: {
      type: Number,
      default: 0
    },
    routineScans: {
      type: Number,
      default: 0
    },
    criticalCases: {
      type: Number,
      default: 0
    },
    growthRate: {
      type: Number, // percentage compared to previous month
      default: 0
    },
    patientGrowth: {
      type: Number, // percentage
      default: 0
    },
    revenueGrowth: {
      type: Number, // percentage
      default: 0
    }
  },
  // Weekly Breakdown
  weeklyBreakdown: [{
    week: Number, // 1-4 or 1-5
    scans: Number,
    patients: Number,
    criticalAlerts: Number,
    averageResponseTime: Number,
    revenue: Number
  }],
  // Condition Distribution
  conditionDistribution: [{
    condition: String,
    count: Number,
    percentage: Number,
    trend: String // 'increasing', 'decreasing', 'stable'
  }],
  // Patient Retention
  patientRetention: {
    newPatients: Number,
    returningPatients: Number,
    retentionRate: Number, // percentage
    lostPatients: Number,
    churnRate: Number // percentage
  },
  // Performance Comparison
  performanceComparison: {
    vsPreviousMonth: {
      scanGrowth: Number,
      patientGrowth: Number,
      revenueGrowth: Number,
      satisfactionChange: Number
    },
    vsSameMonthLastYear: {
      scanGrowth: Number,
      patientGrowth: Number,
      revenueGrowth: Number
    }
  },
  // Goals and Targets
  goals: {
    scansTarget: Number,
    patientsTarget: Number,
    revenueTarget: Number,
    satisfactionTarget: Number,
    achievementRate: Number // percentage
  }
}, {
  timestamps: true
});

// Alert Analytics Schema
const alertAnalyticsSchema = new mongoose.Schema({
  alertId: {
    type: String,
    required: true,
    unique: true
  },
  medicId: {
    type: String,
    required: true,
    index: true
  },
  patientId: {
    type: String,
    required: true
  },
  patientInfo: {
    name: String,
    age: Number,
    priority: String
  },
  alertType: {
    type: String,
    enum: ['critical', 'medication', 'appointment', 'follow-up', 'emergency', 'system', 'reminder'],
    required: true
  },
  category: {
    type: String,
    enum: ['medical', 'administrative', 'system', 'patient', 'medic'],
    default: 'medical'
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  message: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed
  },
  triggeredAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  acknowledgedAt: {
    type: Date
  },
  resolvedAt: {
    type: Date
  },
  responseTime: {
    type: Number, // in minutes
    default: 0
  },
  resolutionTime: {
    type: Number, // in minutes
    default: 0
  },
  actionTaken: {
    type: String
  },
  assignedTo: {
    medicId: String,
    medicName: String
  },
  status: {
    type: String,
    enum: ['pending', 'acknowledged', 'in-progress', 'resolved', 'dismissed', 'escalated'],
    default: 'pending'
  },
  escalationLevel: {
    type: Number,
    default: 1,
    min: 1,
    max: 3
  },
  notes: [{
    note: String,
    addedBy: String,
    addedAt: Date
  }],
  followUpRequired: {
    type: Boolean,
    default: false
  },
  recurrence: {
    type: String,
    enum: ['once', 'daily', 'weekly', 'monthly', 'custom'],
    default: 'once'
  }
}, {
  timestamps: true
});

// System Analytics Schema
const systemAnalyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true,
    index: true
  },
  // Platform Statistics
  platformStats: {
    totalMedics: {
      type: Number,
      default: 0
    },
    activeMedics: {
      type: Number,
      default: 0
    },
    verifiedMedics: {
      type: Number,
      default: 0
    },
    totalPatients: {
      type: Number,
      default: 0
    },
    activePatients: {
      type: Number,
      default: 0
    },
    totalScans: {
      type: Number,
      default: 0
    },
    qrCodesGenerated: {
      type: Number,
      default: 0
    },
    emergencyScans: {
      type: Number,
      default: 0
    }
  },
  // Usage Metrics
  usageMetrics: {
    peakUsageTime: {
      hour: Number,
      count: Number
    },
    averageSessionDuration: {
      type: Number, // in minutes
      default: 0
    },
    dailyActiveUsers: {
      type: Number,
      default: 0
    },
    monthlyActiveUsers: {
      type: Number,
      default: 0
    },
    deviceBreakdown: [{
      device: String, // mobile, tablet, desktop
      count: Number,
      percentage: Number
    }],
    browserBreakdown: [{
      browser: String,
      count: Number,
      percentage: Number
    }],
    platformBreakdown: [{
      platform: String, // web, android, ios
      count: Number,
      percentage: Number
    }]
  },
  // Geographic Distribution
  geographicDistribution: [{
    country: String,
    city: String,
    scanCount: Number,
    medicCount: Number,
    patientCount: Number,
    growthRate: Number
  }],
  // Performance
  systemPerformance: {
    averageResponseTime: {
      type: Number, // in milliseconds
      default: 0
    },
    uptime: {
      type: Number, // percentage
      default: 100
    },
    errorRate: {
      type: Number, // percentage
      default: 0
    },
    serverLoad: {
      type: Number, // percentage
      default: 0
    },
    databasePerformance: {
      queryTime: Number,
      connectionCount: Number
    },
    apiPerformance: [{
      endpoint: String,
      averageResponseTime: Number,
      callCount: Number,
      errorRate: Number
    }]
  },
  // Security Metrics
  securityMetrics: {
    failedLoginAttempts: Number,
    suspiciousActivities: Number,
    dataBreachAttempts: Number,
    securityAlerts: Number
  }
}, {
  timestamps: true
});

// Patient Activity Schema
const patientActivitySchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    index: true
  },
  activityType: {
    type: String,
    enum: [
      'scan', 
      'qr_generated', 
      'profile_updated', 
      'emergency_contact_updated', 
      'medical_info_updated',
      'login',
      'logout',
      'password_changed',
      'consent_given',
      'data_exported',
      'appointment_scheduled',
      'medication_updated',
      'allergy_added',
      'condition_added'
    ],
    required: true
  },
  performedBy: {
    userId: String,
    userType: String, // 'patient', 'medic', 'system'
    userName: String
  },
  activityDetails: {
    type: mongoose.Schema.Types.Mixed
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  ipAddress: String,
  userAgent: String,
  location: {
    city: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  sessionId: String,
  deviceInfo: {
    type: String,
    browser: String,
    os: String
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'low'
  }
}, {
  timestamps: true
});

// Medic Performance Schema
const medicPerformanceSchema = new mongoose.Schema({
  medicId: {
    type: String,
    required: true,
    index: true
  },
  medicInfo: {
    name: String,
    specialization: String,
    experience: Number, // in years
    qualification: String
  },
  evaluationPeriod: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    periodType: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly', 'yearly'],
      default: 'monthly'
    }
  },
  // Performance Metrics
  metrics: {
    totalScans: Number,
    uniquePatients: Number,
    averageResponseTime: Number, // in minutes
    criticalCasesHandled: Number,
    satisfactionRating: Number, // 0-100
    followUpCompletionRate: Number, // percentage
    emergencyResponseRate: Number, // percentage
    patientRetentionRate: Number, // percentage
    scanAccuracy: Number, // percentage
    dataCompleteness: Number, // percentage
    complianceRate: Number // percentage
  },
  // Rankings
  rankings: {
    responseTimeRank: Number,
    patientSatisfactionRank: Number,
    scanVolumeRank: Number,
    emergencyHandlingRank: Number,
    overallRank: Number,
    totalMedicsInRanking: Number
  },
  // Specialization Stats
  specializationStats: {
    topConditionsTreated: [{
      condition: String,
      count: Number,
      successRate: Number
    }],
    emergencyTypes: [{
      type: String,
      count: Number,
      responseTime: Number
    }],
    patientOutcomes: [{
      outcome: String,
      count: Number,
      percentage: Number
    }]
  },
  // Feedback and Reviews
  feedback: {
    positiveCount: Number,
    negativeCount: Number,
    neutralCount: Number,
    averageRating: Number,
    comments: [{
      rating: Number,
      comment: String,
      date: Date,
      patientId: String,
      anonymous: Boolean
    }]
  },
  // Professional Development
  professionalDevelopment: {
    certifications: [String],
    trainingCompleted: [{
      course: String,
      date: Date,
      score: Number
    }],
    researchContributions: Number,
    publications: Number
  },
  // Goals and Achievements
  goals: {
    setGoals: [{
      goal: String,
      target: Number,
      current: Number,
      deadline: Date,
      status: String // 'pending', 'in-progress', 'achieved', 'failed'
    }],
    achievements: [{
      achievement: String,
      date: Date,
      description: String
    }]
  }
}, {
  timestamps: true
});

// Real-time Analytics Schema
const realTimeAnalyticsSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  activeSessions: {
    type: Number,
    default: 0
  },
  concurrentScans: {
    type: Number,
    default: 0
  },
  activeAlerts: {
    type: Number,
    default: 0
  },
  systemLoad: {
    cpu: Number,
    memory: Number,
    disk: Number,
    network: Number
  },
  geographicHeatmap: [{
    location: String,
    activityCount: Number,
    alertCount: Number
  }],
  performanceMetrics: {
    apiResponseTime: Number,
    databaseQueryTime: Number,
    cacheHitRate: Number
  }
}, {
  timestamps: true,
  expireAfterSeconds: 3600 // Auto-delete after 1 hour for real-time data
});

// Predictive Analytics Schema
const predictiveAnalyticsSchema = new mongoose.Schema({
  medicId: {
    type: String,
    required: true,
    index: true
  },
  predictionDate: {
    type: Date,
    required: true,
    index: true
  },
  predictions: {
    patientVolume: {
      expected: Number,
      confidence: Number,
      factors: [String]
    },
    emergencyProbability: {
      probability: Number,
      confidence: Number,
      riskFactors: [String]
    },
    resourceRequirements: {
      staff: Number,
      equipment: [String],
      medications: [String]
    },
    seasonalTrends: {
      trend: String, // 'increasing', 'decreasing', 'stable'
      expectedImpact: Number,
      confidence: Number
    }
  },
  recommendations: [{
    category: String,
    recommendation: String,
    priority: String,
    impact: Number
  }],
  accuracyMetrics: {
    previousAccuracy: Number,
    modelVersion: String,
    trainingDataSize: Number
  }
}, {
  timestamps: true
});

// Indexes for optimization
scanAnalyticsSchema.index({ medicId: 1, scannedAt: -1 });
scanAnalyticsSchema.index({ patientId: 1, scannedAt: -1 });
scanAnalyticsSchema.index({ scanType: 1, scannedAt: -1 });
scanAnalyticsSchema.index({ scanStatus: 1, scannedAt: -1 });
scanAnalyticsSchema.index({ outcome: 1, scannedAt: -1 });

practiceAnalyticsSchema.index({ medicId: 1, date: -1 });
practiceAnalyticsSchema.index({ 'dailyStats.totalScans': -1 });

monthlyAnalyticsSchema.index({ medicId: 1, year: -1, month: -1 });
monthlyAnalyticsSchema.index({ 'monthlyTrends.growthRate': -1 });

alertAnalyticsSchema.index({ medicId: 1, triggeredAt: -1 });
alertAnalyticsSchema.index({ status: 1, priority: -1 });
alertAnalyticsSchema.index({ alertType: 1, triggeredAt: -1 });

systemAnalyticsSchema.index({ date: -1 });
systemAnalyticsSchema.index({ 'platformStats.totalScans': -1 });

patientActivitySchema.index({ patientId: 1, timestamp: -1 });
patientActivitySchema.index({ activityType: 1, timestamp: -1 });

medicPerformanceSchema.index({ medicId: 1, 'evaluationPeriod.startDate': -1 });
medicPerformanceSchema.index({ 'metrics.satisfactionRating': -1 });

realTimeAnalyticsSchema.index({ timestamp: -1 });
predictiveAnalyticsSchema.index({ medicId: 1, predictionDate: -1 });

// Virtual for scan analytics age
scanAnalyticsSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.scannedAt) / (1000 * 60 * 60 * 24));
});

// Methods
scanAnalyticsSchema.methods.calculateSeverity = function() {
  // Implement severity calculation logic based on conditions, response time, etc.
  let score = 0;
  if (this.criticalConditionsFound > 0) score += 5;
  if (this.responseTime > 300) score += 2; // > 5 minutes
  if (this.emergencyContactsCalled) score += 3;
  return Math.min(score, 10);
};

// Static methods
scanAnalyticsSchema.statics.getDailySummary = async function(medicId, date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return this.aggregate([
    {
      $match: {
        medicId,
        scannedAt: { $gte: startOfDay, $lte: endOfDay }
      }
    },
    {
      $group: {
        _id: null,
        totalScans: { $sum: 1 },
        emergencyScans: { $sum: { $cond: [{ $eq: ['$scanType', 'Emergency'] }, 1, 0] } },
        criticalScans: { $sum: { $cond: [{ $eq: ['$scanStatus', 'critical'] }, 1, 0] } },
        avgResponseTime: { $avg: '$responseTime' }
      }
    }
  ]);
};

// Create models
const ScanAnalytics = mongoose.model('ScanAnalytics', scanAnalyticsSchema);
const PracticeAnalytics = mongoose.model('PracticeAnalytics', practiceAnalyticsSchema);
const MonthlyAnalytics = mongoose.model('MonthlyAnalytics', monthlyAnalyticsSchema);
const AlertAnalytics = mongoose.model('AlertAnalytics', alertAnalyticsSchema);
const SystemAnalytics = mongoose.model('SystemAnalytics', systemAnalyticsSchema);
const PatientActivity = mongoose.model('PatientActivity', patientActivitySchema);
const MedicPerformance = mongoose.model('MedicPerformance', medicPerformanceSchema);
const RealTimeAnalytics = mongoose.model('RealTimeAnalytics', realTimeAnalyticsSchema);
const PredictiveAnalytics = mongoose.model('PredictiveAnalytics', predictiveAnalyticsSchema);

export {
  ScanAnalytics,
  PracticeAnalytics,
  MonthlyAnalytics,
  AlertAnalytics,
  SystemAnalytics,
  PatientActivity,
  MedicPerformance,
  RealTimeAnalytics,
  PredictiveAnalytics
};