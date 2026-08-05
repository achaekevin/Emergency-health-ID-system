/**
 * Clinical Decision Support & Drug Interaction Checker Utility
 * Checks new prescription against active medications & patient allergies.
 */

const KNOWN_INTERACTIONS = [
  { drugA: 'Lisinopril', drugB: 'Potassium', severity: 'High', warning: 'Hyperkalemia risk. Concurrent use of Lisinopril and Potassium supplements can cause dangerous elevation in serum potassium levels.' },
  { drugA: 'Metformin', drugB: 'Contrast Dye', severity: 'Critical', warning: 'Lactic Acidosis risk. Metformin should be temporarily withheld prior to contrast imaging procedures.' },
  { drugA: 'Warfarin', drugB: 'Aspirin', severity: 'Critical', warning: 'Severe Bleeding Risk. Co-administration significantly increases risk of major gastrointestinal hemorrhage.' },
  { drugA: 'Aspirin', drugB: 'Ibuprofen', severity: 'Moderate', warning: 'Decreased cardioprotective effect of Aspirin and increased gastric ulceration risk.' }
];

const ALLERGY_DRUG_MAP = [
  { allergy: 'Penicillin', conflictingDrugs: ['Penicillin', 'Amoxicillin', 'Ampicillin', 'Augmentin'], severity: 'Anaphylactic' },
  { allergy: 'Sulfa', conflictingDrugs: ['Sulfamethoxazole', 'Bactrim', 'Sulfasalazine'], severity: 'Severe Skin Rash & Anaphylaxis' },
  { allergy: 'Aspirin', conflictingDrugs: ['Aspirin', 'Ibuprofen', 'Naproxen'], severity: 'Bronchospasm / Hives' }
];

export function checkDrugInteractions(newDrugName, currentMedications = [], patientAllergies = []) {
  const warnings = [];
  const cleanNewDrug = newDrugName.trim().toLowerCase();

  if (!cleanNewDrug) return warnings;

  // 1. Check Allergy Conflicts
  patientAllergies.forEach(allergyObj => {
    const allergyName = typeof allergyObj === 'string' ? allergyObj : allergyObj.name;
    const match = ALLERGY_DRUG_MAP.find(m => m.allergy.toLowerCase() === allergyName.toLowerCase());
    if (match) {
      const isConflicting = match.conflictingDrugs.some(d => d.toLowerCase() === cleanNewDrug || cleanNewDrug.includes(d.toLowerCase()));
      if (isConflicting) {
        warnings.push({
          type: 'ALLERGY_ALERT',
          severity: 'Critical',
          title: `⚠️ ALLERGY CONFLICT: ${allergyName}`,
          details: `Patient has a documented ${match.severity} allergy to ${allergyName}. Prescribing ${newDrugName} may trigger life-threatening anaphylaxis!`
        });
      }
    }
  });

  // 2. Check Drug-Drug Interactions
  currentMedications.forEach(medObj => {
    const activeDrug = typeof medObj === 'string' ? medObj : medObj.medication_name;
    KNOWN_INTERACTIONS.forEach(rule => {
      const matchA = rule.drugA.toLowerCase() === cleanNewDrug && rule.drugB.toLowerCase() === activeDrug.toLowerCase();
      const matchB = rule.drugB.toLowerCase() === cleanNewDrug && rule.drugA.toLowerCase() === activeDrug.toLowerCase();

      if (matchA || matchB) {
        warnings.push({
          type: 'DRUG_INTERACTION',
          severity: rule.severity,
          title: `💊 DRUG INTERACTION: ${newDrugName} + ${activeDrug}`,
          details: rule.warning
        });
      }
    });
  });

  return warnings;
}
