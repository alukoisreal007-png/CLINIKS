/**
 * CLINIKS AI Triage Engine (Optimized & Guardrailed)
 * 
 * Boundaries & Contract:
 * 1. Intake & Structuring: Organizes input into Chief Complaint, Symptom Timeline, and Red Flags.
 * 2. Urgency Scoring: Suggests a preliminary 1–10 urgency score.
 * 3. NO Autonomous Diagnosis: Never names an illness (e.g. does not diagnose "Malaria" or "Appendicitis").
 * 4. NO Medication / Treatment: Never prescribes drugs or dosages.
 * 5. Low Context Footprint: Compact deterministic payload (< 250 tokens), 0-token offline fallback.
 */

// Standard predefined clinical emergency keywords (Red Flags)
const EMERGENCY_RED_FLAGS = [
  { term: 'chest pain', flag: 'Severe chest pain / tightness (Cardiovascular / Respiratory risk)' },
  { term: 'shortness of breath', flag: 'Acute dyspnea / shortness of breath' },
  { term: 'difficulty breathing', flag: 'Significant respiratory distress / difficulty breathing' },
  { term: 'stiff neck', flag: 'Acute neck stiffness with fever (Meningeal irritation sign)' },
  { term: 'fainted', flag: 'Syncope / loss of consciousness' },
  { term: 'unconscious', flag: 'Altered level of consciousness / unresponsive' },
  { term: 'convulsion', flag: 'Active or recent convulsion / seizure' },
  { term: 'heavy bleeding', flag: 'Active uncontrolled hemorrhage / heavy bleeding' },
  { term: 'coughing blood', flag: 'Hemoptysis (coughing up blood)' },
  { term: 'vomiting blood', flag: 'Hematemesis (vomiting blood)' },
  { term: 'severe allergic', flag: 'Acute anaphylaxis / severe allergic reaction' },
  { term: 'suicidal', flag: 'Acute psychiatric emergency / self-harm risk' },
  { term: 'unable to walk', flag: 'Acute loss of motor function / severe mobility compromise' },
  { term: 'head injury', flag: 'Traumatic head injury with disorientation' }
];

const MODERATE_KEYWORDS = [
  'vomiting', 'high fever', 'sprain', 'fracture', 'burn', 'deep cut', 
  'migraine', 'severe pain', 'asthma', 'wheezing', 'dizziness', 'chills'
];

/**
 * Generates the Structured AI Brief and 1-10 Urgency Score.
 * 
 * @param {Object} input
 * @param {string} input.complaint Raw symptom description
 * @param {'sudden'|'gradual'} input.onset Onset mode
 * @param {string} input.duration Duration string
 * @param {number} input.painScale Pain scale 1-10
 * @param {Object} input.patient Patient demographics
 */
export function generateDoctorBrief(input) {
  const { complaint = '', onset = 'gradual', duration = '1 to 2 days', painScale = 3, patient = {} } = input;
  const lower = complaint.toLowerCase();

  // 1. Detect Red Flags (Pattern Recognition)
  const detectedRedFlags = [];
  for (const item of EMERGENCY_RED_FLAGS) {
    if (lower.includes(item.term)) {
      detectedRedFlags.push(item.flag);
    }
  }

  // 2. Compute 1-10 Urgency Score
  let score = Math.max(1, Math.min(10, Math.round(Number(painScale) || 3)));

  // Acute sudden onset bumps urgency
  if (onset === 'sudden' && score < 7) {
    score += 1;
  }

  // Moderate symptoms adjustment
  const hasModerate = MODERATE_KEYWORDS.some(kw => lower.includes(kw));
  if (hasModerate && score < 6) {
    score = Math.max(score, 6);
  }

  // Critical red flags guarantee emergency score tier (8-10)
  if (detectedRedFlags.length > 0) {
    score = Math.max(score, 8);
    if (detectedRedFlags.length >= 2 || score >= 9) {
      score = 10;
    }
  }

  // Clamp strictly between 1 and 10
  score = Math.min(10, Math.max(1, score));

  // 3. Determine Queue Section
  const suggestedSection = score >= 8 ? 'EMERGENCY' : 'CHECK_UP';

  // 4. Construct Structured Brief (Strictly 3 Sections)
  const chiefComplaint = complaint.trim() || 'Patient presented for general medical consultation.';
  const symptomTimeline = `Onset: ${onset === 'sudden' ? 'Sudden (acute presentation)' : 'Gradual progression'}. Duration: ${duration}. Reported discomfort: ${painScale}/10.`;
  const redFlags = detectedRedFlags.length > 0 ? detectedRedFlags : ['No red flags detected (stable profile)'];

  return {
    // 3 Strict Brief Sections
    chiefComplaint,
    symptomTimeline,
    redFlags,

    // 1-10 Urgency Scoring
    preliminaryScore: score,
    suggestedSection, // 'EMERGENCY' | 'CHECK_UP'

    // Metadata
    isEmergency: score >= 8,
    generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    disclaimer: 'Decision Support Only — Not a Diagnosis. Final triage priority, clinical assessment, and appointment scheduling remain under the sole authority of the attending healthcare professional.'
  };
}
