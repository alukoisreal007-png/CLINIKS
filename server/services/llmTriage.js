import dotenv from 'dotenv';
dotenv.config();

/**
 * Advanced Clinical Triage Engine
 * Uses Google Gemini LLM API if GEMINI_API_KEY is configured.
 * Automatically falls back to clinical heuristic rules if API key is not present.
 */
export async function analyzeClinicalIntake({ complaint, painScale = 3, duration = '1 to 2 days', answers = [] }) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const llmResult = await callGeminiTriageAPI(apiKey, { complaint, painScale, duration, answers });
      if (llmResult) {
        return {
          ...llmResult,
          source: 'GEMINI_LLM_AI'
        };
      }
    } catch (err) {
      console.warn('⚠️  Gemini API call failed, falling back to clinical heuristic rules:', err.message);
    }
  }

  // Fallback: Expert clinical rule-based heuristic triage
  return {
    ...runHeuristicClinicalTriage({ complaint, painScale, duration, answers }),
    source: 'HEURISTIC_CLINICAL_ENGINE'
  };
}

/**
 * Real Google Gemini 1.5/2.0 Flash Clinical Evaluation
 */
async function callGeminiTriageAPI(apiKey, { complaint, painScale, duration, answers }) {
  const prompt = `
You are an expert emergency medical consultant and triage triage physician for a university campus clinic (Jaja Health Service).
Analyze this student's intake presentation:
- Chief Complaint: "${complaint}"
- Pain/Discomfort Scale: ${painScale}/10
- Duration of Symptoms: "${duration}"
- Additional Clinical Responses: "${answers.join('; ')}"

Evaluate for emergency red-flags (anaphylaxis, acute asthma/bronchospasm, meningitis, septic fever, severe trauma, internal hemorrhage).
Provide your triage evaluation strictly as a valid JSON object matching this schema:
{
  "priority": "HIGH" | "MODERATE" | "ROUTINE",
  "urgencyScore": integer from 1 to 100,
  "patientBrief": "Concise 1-2 sentence medical summary written for the attending physician",
  "safetyWarnings": ["array of bullet points with clinical warnings or immediate patient precautions"],
  "suggestedRoom": "Suggested clinic bay, e.g. Room 102 (Emergency & Nebulization Bay) or Room 204 (Orthopedic & Minor Procedures) or Room 108 (General Consultation & Refills)",
  "recommendedSession": "Immediate Stat (Within 10 Mins) or Morning Session (11:00 AM) or Afternoon Slot (2:00 PM)"
}
Do NOT include markdown backticks or explanation outside the JSON. Return only raw JSON.
`;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini HTTP ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawJson) throw new Error('Empty response from Gemini API');

  return JSON.parse(rawJson);
}

/**
 * Heuristic fallback clinical triage engine
 */
function runHeuristicClinicalTriage({ complaint, painScale, duration, answers }) {
  let priority = 'ROUTINE';
  let urgencyScore = 20;
  let safetyWarnings = [];
  let suggestedRoom = 'Room 108 (General Consultation & Refills)';
  let suggestedSession = 'Afternoon Slot (2:00 PM)';

  const textToAnalyze = `${complaint} ${answers?.join(' ')}`.toLowerCase();

  const criticalKeywords = [
    'chest pain', 'shortness of breath', 'difficulty breathing', 'stiff neck', 
    'high fever', 'unconscious', 'fainted', 'convulsion', 'heavy bleeding', 
    'severe allergic', 'anaphylaxis', 'suicidal'
  ];

  const moderateKeywords = [
    'fracture', 'sprained', 'twisted ankle', 'vomiting', 'food poisoning', 
    'burn', 'deep cut', 'migraine', 'severe pain', 'asthma'
  ];

  const hasCritical = criticalKeywords.some(kw => textToAnalyze.includes(kw)) || painScale >= 8;
  const hasModerate = moderateKeywords.some(kw => textToAnalyze.includes(kw)) || painScale >= 5;

  if (hasCritical) {
    priority = 'HIGH';
    urgencyScore = 95;
    safetyWarnings.push('CRITICAL RISK: Potential acute clinical emergency requiring immediate physician evaluation.');
    if (textToAnalyze.includes('breath') || textToAnalyze.includes('asthma') || textToAnalyze.includes('chest')) {
      suggestedRoom = 'Room 102 (Emergency & Nebulization Bay)';
    } else {
      suggestedRoom = 'Room 101 (Isolation & Acute Triage)';
    }
    suggestedSession = 'Immediate Stat (Within 10 Mins)';
  } else if (hasModerate) {
    priority = 'MODERATE';
    urgencyScore = 65;
    safetyWarnings.push('Elevated discomfort or functional impairment. Same-day clinical assessment indicated.');
    suggestedRoom = 'Room 204 (Orthopedic & Minor Procedures)';
    suggestedSession = 'Morning Session (11:00 AM)';
  } else {
    priority = 'ROUTINE';
    urgencyScore = 20;
    safetyWarnings.push('Stable non-emergency presentation. Scheduled appointment indicated.');
    suggestedRoom = 'Room 108 (General Consultation & Refills)';
    suggestedSession = 'Afternoon Slot (2:00 PM)';
  }

  return {
    priority,
    urgencyScore,
    patientBrief: `Patient reports: "${complaint}". Discomfort rated ${painScale}/10. Duration: ${duration}. ${answers?.length ? 'Responses: ' + answers.join('; ') : ''}`,
    safetyWarnings,
    suggestedRoom,
    recommendedSession: suggestedSession
  };
}
