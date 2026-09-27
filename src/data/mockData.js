// Mock database and seed records for CLINIKS OPD platform

export const initialPatientProfile = {
  id: '',
  name: '',
  email: '',
  hospitalCardNo: '',   // Hospital folder / card number
  age: '',
  gender: '',
  intakeMode: 'SELF',   // 'SELF' | 'STAFF_ASSISTED'
  bloodGroup: '',
  genotype: '',
  emergencyContact: '',
  allergies: [],
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'
};

// Keep legacy alias so any remaining imports don't break during migration
export const initialStudentProfile = initialPatientProfile;

export const initialConsultantMessages = [
  {
    id: 'MSG-7429',
    from: 'Senior Consultant Physician',
    role: 'Senior Consultant Physician',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150',
    date: 'Today, 09:45 AM',
    subject: 'Clinical Triage Evaluation',
    body: 'Welcome to CLINIKS. Your pre-consultation intake notes will be reviewed by attending clinicians in real-time.',
    unread: false,
    tag: 'Welcome Notice',
    priority: 'normal',
    relatedReportId: ''
  }
];

export const initialImmutableRecords = [];

export const initialTriageQueue = [
  {
    id: 'TRG-0071',
    queueNo: '007',
    patientName: 'Adaeze Okonkwo',
    hospitalCardNo: 'GH-2024-00831',
    age: '34',
    gender: 'Female',
    intakeMode: 'SELF_WALKIN',
    submittedAt: '12 mins ago',
    complaint: 'Severe throbbing headache, high fever since morning, severe body weakness and nausea. Unable to stand for long.',
    painScale: 7,
    duration: '1 to 2 days',
    answers: [
      'Breathing: No shortness of breath',
      'Neck / Neuro: Slight neck stiffness & light sensitivity reported',
      'Oral Fluids: Can tolerate small sips',
      'Mobility: Requires physical support to walk',
      'Medications: Paracetamol (minimal relief); No known drug allergies'
    ],
    aiTriage: {
      suggestedPriority: 'HIGH',
      urgencyScore: 82,
      patientBrief: '34-year-old female presenting with acute high-grade fever, severe throbbing headache, photophobia, and reported neck stiffness for 24-48 hours. Pain level 7/10 with impaired ambulation. Significant acute discomfort requiring prompt physical and neurological assessment.',
      safetyWarnings: [
        'RED FLAG: Acute fever accompanied by reported neck stiffness. Assess for meningeal irritation.',
        'Impaired mobility: Patient reported difficulty standing in waiting area.'
      ],
      suggestedRoom: 'Room 101 (Isolation & Acute Triage)',
      recommendedSession: 'Immediate Stat (Now)',
      source: 'Clinical Heuristics'
    },
    status: 'PENDING_APPROVAL',
    assignedRoom: 'Room 101 (Isolation & Acute Triage)',
    assignedSession: 'Immediate Stat (Now)'
  },
  {
    id: 'TRG-0072',
    queueNo: '008',
    patientName: 'Emeka Nwosu',
    hospitalCardNo: 'GH-2024-01205',
    age: '48',
    gender: 'Male',
    intakeMode: 'STAFF_ASSISTED',
    submittedAt: '24 mins ago',
    complaint: 'Persistent dry cough for 5 days with mild chest tightness and evening low-grade chills. Difficulty sleeping.',
    painScale: 4,
    duration: '3 to 5 days',
    answers: [
      'Breathing: Mild chest tightness on exertion',
      'Neck / Neuro: Normal, no neck stiffness',
      'Oral Fluids: Can tolerate fluids normally',
      'Mobility: Ambulatory without support',
      'Medications: OTC cough syrup; Hypertensive on Amlodipine 5mg'
    ],
    aiTriage: {
      suggestedPriority: 'MODERATE',
      urgencyScore: 58,
      patientBrief: '48-year-old hypertensive male with 5-day history of persistent non-productive cough, mild exertional chest tightness, and nocturnal chills. Pain level 4/10. Hemodynamically stable, ambulating independently.',
      safetyWarnings: [
        'Known hypertensive patient with chest tightness. Rule out atypical cardiac or lower respiratory infection.'
      ],
      suggestedRoom: 'Room 104 (General Physician 1)',
      recommendedSession: 'Morning Session (11:00 AM)',
      source: 'Clinical Heuristics'
    },
    status: 'PENDING_APPROVAL',
    assignedRoom: 'Room 104 (General Physician 1)',
    assignedSession: 'Morning Session (11:00 AM)'
  },
  {
    id: 'TRG-0073',
    queueNo: '009',
    patientName: 'Fatima Bello',
    hospitalCardNo: 'GH-2023-09412',
    age: '22',
    gender: 'Female',
    intakeMode: 'SELF_WALKIN',
    submittedAt: '38 mins ago',
    complaint: 'Routine follow-up for chronic peptic ulcer refill and recent mild epigastric burning after meals.',
    painScale: 2,
    duration: 'More than a week',
    answers: [
      'Breathing: Normal, no difficulty',
      'Neck / Neuro: Normal',
      'Oral Fluids: Tolerating fluids and soft foods',
      'Mobility: Normal mobility',
      'Medications: Omeprazole 20mg daily'
    ],
    aiTriage: {
      suggestedPriority: 'ROUTINE',
      urgencyScore: 25,
      patientBrief: '22-year-old female presenting for routine chronic prescription refill for peptic ulcer disease. Mild postprandial dyspepsia. No acute distress or red flag symptoms.',
      safetyWarnings: [],
      suggestedRoom: 'Room 108 (General Consultation & Refills)',
      recommendedSession: 'Mid-Day Session (12:00 PM)',
      source: 'Clinical Heuristics'
    },
    status: 'APPROVED',
    assignedRoom: 'Room 108 (General Consultation & Refills)',
    assignedSession: 'Mid-Day Session (12:00 PM)'
  },
  {
    id: 'TRG-0074',
    queueNo: '010',
    patientName: 'Chinedu Eze',
    hospitalCardNo: 'GH-2024-00344',
    age: '29',
    gender: 'Male',
    intakeMode: 'BROUGHT_IN',
    submittedAt: '45 mins ago',
    complaint: 'Sudden onset severe right lower quadrant abdominal pain with repeated vomiting and inability to keep fluids down.',
    painScale: 9,
    duration: 'Less than 6 hours',
    answers: [
      'Breathing: Shallow breathing due to severe abdominal pain',
      'Neck / Neuro: Normal',
      'Oral Fluids: Cannot tolerate fluids (vomiting)',
      'Mobility: Cannot bear weight, walked in bent over',
      'Medications: Took antacid 2 hours ago with no relief'
    ],
    aiTriage: {
      suggestedPriority: 'HIGH',
      urgencyScore: 94,
      patientBrief: '29-year-old male with acute severe right lower abdominal pain (9/10), nausea, intractable vomiting, and peritoneal guarding signs. Onset under 6 hours. High suspicion for acute appendicitis or acute surgical abdomen.',
      safetyWarnings: [
        'RED FLAG: Severe acute localized abdominal pain with persistent vomiting. Immediate surgical evaluation indicated.',
        'Intractable dehydration risk: Unable to tolerate oral fluids.'
      ],
      suggestedRoom: 'Room 102 (Emergency & Nebulization Bay)',
      recommendedSession: 'Immediate Stat (Now)',
      source: 'Clinical Heuristics'
    },
    status: 'PENDING_APPROVAL',
    assignedRoom: 'Room 102 (Emergency & Nebulization Bay)',
    assignedSession: 'Immediate Stat (Now)'
  },
  {
    id: 'TRG-0075',
    queueNo: '011',
    patientName: 'Amina Yusuf',
    hospitalCardNo: 'GH-2024-00672',
    age: '41',
    gender: 'Female',
    intakeMode: 'SELF_WALKIN',
    submittedAt: '52 mins ago',
    complaint: 'Exacerbation of asthma symptoms for 2 days. Wheezing and nighttime cough, Salbutamol inhaler almost empty.',
    painScale: 5,
    duration: '1 to 2 days',
    answers: [
      'Breathing: Expiratory wheeze reported',
      'Neck / Neuro: Normal',
      'Oral Fluids: Can tolerate fluids',
      'Mobility: Ambulatory',
      'Medications: Salbutamol inhaler (2 puffs PRN); Budesonide'
    ],
    aiTriage: {
      suggestedPriority: 'MODERATE',
      urgencyScore: 62,
      patientBrief: '41-year-old female with known bronchial asthma presenting with subacute exacerbation, moderate wheezing, and nocturnal waking for 48 hours. Pain level 5/10. Auscultation and nebulization assessment recommended.',
      safetyWarnings: [
        'Known asthmatic reporting increased inhaler usage and nighttime cough.'
      ],
      suggestedRoom: 'Room 104 (General Physician 1)',
      recommendedSession: 'Morning Session (11:00 AM)',
      source: 'Clinical Heuristics'
    },
    status: 'PENDING_APPROVAL',
    assignedRoom: 'Room 104 (General Physician 1)',
    assignedSession: 'Morning Session (11:00 AM)'
  },
  {
    id: 'TRG-0076',
    queueNo: '012',
    patientName: 'Oluwaseun Bakare',
    hospitalCardNo: 'GH-2024-00918',
    age: '31',
    gender: 'Male',
    intakeMode: 'SELF_WALKIN',
    submittedAt: '58 mins ago',
    complaint: 'Traumatic right ankle inversion injury while playing football. Acute localized swelling, severe tenderness over lateral malleolus, unable to bear weight.',
    painScale: 8,
    duration: 'Less than 3 hours',
    answers: [
      'Breathing: Normal',
      'Neck / Neuro: Normal',
      'Oral Fluids: Normal',
      'Mobility: Cannot bear weight on right foot',
      'Medications: Ice pack applied; No analgesics taken'
    ],
    aiTriage: {
      suggestedPriority: 'HIGH',
      urgencyScore: 80,
      patientBrief: '31-year-old male with acute right ankle inversion trauma. Severe pain 8/10, acute peri-malleolar swelling and inability to bear weight. Ottawa Ankle Rules positive. X-ray requisition recommended.',
      safetyWarnings: [
        'Acute traumatic injury with weight-bearing failure. Fast-track for plain radiography to exclude fracture.'
      ],
      suggestedRoom: 'Room 204 (Orthopedic & Minor Procedures)',
      recommendedSession: 'Immediate Stat (Now)',
      source: 'Clinical Heuristics'
    },
    status: 'PENDING_APPROVAL',
    assignedRoom: 'Room 204 (Orthopedic & Minor Procedures)',
    assignedSession: 'Immediate Stat (Now)'
  },
  {
    id: 'TRG-0077',
    queueNo: '013',
    patientName: 'Ngozi Ezeamaka',
    hospitalCardNo: 'GH-2023-04189',
    age: '56',
    gender: 'Female',
    intakeMode: 'SELF_WALKIN',
    submittedAt: '1 hr ago',
    complaint: 'Routine quarterly diabetes and hypertension review. Fasting blood sugar log brought. Mild bilateral foot tingling sensation.',
    painScale: 1,
    duration: 'More than a month',
    answers: [
      'Breathing: Normal',
      'Neck / Neuro: Mild bilateral stocking paresthesia',
      'Oral Fluids: Normal',
      'Mobility: Fully mobile',
      'Medications: Metformin 1000mg BD, Lisinopril 10mg daily'
    ],
    aiTriage: {
      suggestedPriority: 'ROUTINE',
      urgencyScore: 28,
      patientBrief: '56-year-old female known T2DM and hypertensive presenting for routine chronic surveillance and medication refill. Reports mild diabetic peripheral neuropathy symptoms. Vitals and HbA1c review indicated.',
      safetyWarnings: [],
      suggestedRoom: 'Room 108 (General Consultation & Refills)',
      recommendedSession: 'Afternoon Slot (1:30 PM)',
      source: 'Clinical Heuristics'
    },
    status: 'PENDING_APPROVAL',
    assignedRoom: 'Room 108 (General Consultation & Refills)',
    assignedSession: 'Afternoon Slot (1:30 PM)'
  },
  {
    id: 'TRG-0078',
    queueNo: '014',
    patientName: 'Tunde Adeyemi',
    hospitalCardNo: 'GH-2024-01552',
    age: '19',
    gender: 'Male',
    intakeMode: 'STAFF_ASSISTED',
    submittedAt: '1 hr 10 mins ago',
    complaint: 'Acute watery diarrhea 6 episodes since last night, low-grade fever, moderate lower abdominal cramps. Mild postural dizziness.',
    painScale: 5,
    duration: '1 day',
    answers: [
      'Breathing: Normal',
      'Neck / Neuro: Normal, alert',
      'Oral Fluids: Tolerating sips of ORS with mild nausea',
      'Mobility: Ambulatory with mild weakness',
      'Medications: ORS 1 sachet taken'
    ],
    aiTriage: {
      suggestedPriority: 'MODERATE',
      urgencyScore: 60,
      patientBrief: '19-year-old male with acute gastroenteritis presentation. 6 watery bowel motions in 18 hours, abdominal cramping 5/10, postural lightheadedness. Dehydration risk: Assess hydration status and stool microscopy.',
      safetyWarnings: [
        'Acute gastroenteritis with mild dehydration signs. Prioritize for oral/IV rehydration assessment.'
      ],
      suggestedRoom: 'Room 105 (General Physician 2)',
      recommendedSession: 'Morning Session (11:30 AM)',
      source: 'Clinical Heuristics'
    },
    status: 'PENDING_APPROVAL',
    assignedRoom: 'Room 105 (General Physician 2)',
    assignedSession: 'Morning Session (11:30 AM)'
  },
  {
    id: 'TRG-0079',
    queueNo: '015',
    patientName: 'Khadija Danjuma',
    hospitalCardNo: 'GH-2024-00219',
    age: '26',
    gender: 'Female',
    intakeMode: 'SELF_WALKIN',
    submittedAt: '1 hr 25 mins ago',
    complaint: 'Severe dysuria, frequent urgency to urinate, suprapubic ache for 3 days. No flank pain or hematuria.',
    painScale: 6,
    duration: '3 days',
    answers: [
      'Breathing: Normal',
      'Neck / Neuro: Normal',
      'Oral Fluids: Normal',
      'Mobility: Normal',
      'Medications: Paracetamol 1000mg; High water intake'
    ],
    aiTriage: {
      suggestedPriority: 'MODERATE',
      urgencyScore: 54,
      patientBrief: '26-year-old female presenting with acute lower urinary tract symptoms (dysuria, frequency, suprapubic ache) for 3 days. Pain level 6/10. Clinically suggestive of acute uncomplicated cystitis. Urinalysis dipstick indicated.',
      safetyWarnings: [],
      suggestedRoom: 'Room 104 (General Physician 1)',
      recommendedSession: 'Mid-Day Session (12:00 PM)',
      source: 'Clinical Heuristics'
    },
    status: 'APPROVED',
    assignedRoom: 'Room 104 (General Physician 1)',
    assignedSession: 'Mid-Day Session (12:00 PM)'
  }
];

export const clinicRooms = [
  'Room 101 (Isolation & Acute Triage)',
  'Room 102 (Emergency & Nebulization Bay)',
  'Room 104 (General Physician 1)',
  'Room 105 (General Physician 2)',
  'Room 108 (General Consultation & Refills)',
  'Room 204 (Orthopedic & Minor Procedures)',
  'Room 206 (Mental Health & Counseling Wing)'
];

export const timeSlots = [
  'Immediate Stat (Now)',
  'Morning Session (10:30 AM - 11:00 AM)',
  'Morning Session (11:00 AM - 11:30 AM)',
  'Mid-Day Session (12:00 PM - 12:30 PM)',
  'Afternoon Slot (1:30 PM - 2:00 PM)',
  'Afternoon Slot (2:30 PM - 3:00 PM)',
  'Evening Session (4:00 PM - 4:30 PM)'
];
