<script>
  import { createEventDispatcher } from 'svelte';
  import { clinicStore } from '../../stores/clinicStore.js';
  import { 
    HeartPulse, 
    Thermometer, 
    Activity, 
    Wind, 
    Scale, 
    X, 
    Check, 
    AlertTriangle, 
    ShieldAlert, 
    Sparkles,
    UserCheck,
    Clock
  } from 'lucide-svelte';

  export let patient; // Patient object from triageQueue

  const dispatch = createEventDispatcher();

  // Form State
  let systolic = patient?.vitals?.systolic || 120;
  let diastolic = patient?.vitals?.diastolic || 80;
  let temperature = patient?.vitals?.temperature || 36.8;
  let pulse = patient?.vitals?.pulse || 78;
  let spo2 = patient?.vitals?.spo2 || 98;
  let weight = patient?.vitals?.weight || 68;
  let height = patient?.vitals?.height || 170;
  let bloodGlucose = patient?.vitals?.bloodGlucose || '';
  let nurseNotes = patient?.vitals?.nurseNotes || '';
  let nurseName = patient?.vitals?.nurseName || 'Nurse Chidinma Okafor (RN/RM)';

  // Real-time Blood Pressure Classification
  $: bpStatus = (() => {
    const s = Number(systolic);
    const d = Number(diastolic);
    if (s >= 180 || d >= 120) return { label: 'Hypertensive Crisis', color: 'text-red-700 bg-red-100 border-red-300', alert: true };
    if (s >= 140 || d >= 90) return { label: 'Stage 2 Hypertension', color: 'text-red-600 bg-red-50 border-red-200', alert: true };
    if (s >= 130 || d >= 80) return { label: 'Stage 1 Hypertension', color: 'text-amber-800 bg-amber-100 border-amber-300', alert: false };
    if (s >= 120 && d < 80) return { label: 'Elevated BP', color: 'text-amber-700 bg-amber-50 border-amber-200', alert: false };
    if (s < 90 || d < 60) return { label: 'Hypotension', color: 'text-blue-700 bg-blue-100 border-blue-300', alert: true };
    return { label: 'Normal BP', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', alert: false };
  })();

  // Real-time Temperature Classification
  $: tempStatus = (() => {
    const t = Number(temperature);
    if (t >= 39.0) return { label: 'High Fever (Emergency)', color: 'text-red-700 bg-red-100 border-red-300', alert: true };
    if (t >= 37.8) return { label: 'Febrile (Elevated)', color: 'text-amber-800 bg-amber-100 border-amber-300', alert: false };
    if (t < 36.0) return { label: 'Hypothermia Risk', color: 'text-blue-700 bg-blue-100 border-blue-300', alert: true };
    return { label: 'Normal Temperature', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', alert: false };
  })();

  // Real-time SpO2 Classification
  $: spo2Status = (() => {
    const s = Number(spo2);
    if (s <= 90) return { label: 'Critical Hypoxia (STAT)', color: 'text-red-700 bg-red-100 border-red-300', alert: true };
    if (s <= 94) return { label: 'Mild Hypoxia', color: 'text-amber-800 bg-amber-100 border-amber-300', alert: true };
    return { label: 'Normal Oxygenation', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', alert: false };
  })();

  // Real-time BMI
  $: bmiValue = (() => {
    const w = Number(weight);
    const hMeters = Number(height) / 100;
    if (w > 0 && hMeters > 0) {
      const b = (w / (hMeters * hMeters)).toFixed(1);
      let cat = 'Normal weight';
      if (b < 18.5) cat = 'Underweight';
      else if (b >= 25 && b < 30) cat = 'Overweight';
      else if (b >= 30) cat = 'Obese';
      return { value: b, category: cat };
    }
    return { value: '--', category: '' };
  })();

  // Quick Preset Helper for rapid triage under 10 seconds
  function applyPreset(preset) {
    if (preset === 'normal') {
      systolic = 120;
      diastolic = 80;
      temperature = 36.8;
      pulse = 76;
      spo2 = 98;
    } else if (preset === 'fever') {
      systolic = 118;
      diastolic = 75;
      temperature = 38.9;
      pulse = 102;
      spo2 = 97;
    } else if (preset === 'hypertensive') {
      systolic = 168;
      diastolic = 104;
      temperature = 37.1;
      pulse = 88;
      spo2 = 96;
    } else if (preset === 'hypoxic') {
      systolic = 132;
      diastolic = 86;
      temperature = 37.4;
      pulse = 110;
      spo2 = 91;
    }
  }

  function handleSave() {
    const hasCriticalVital = bpStatus.alert || tempStatus.alert || spo2Status.alert;
    
    const vitalsRecord = {
      systolic: Number(systolic),
      diastolic: Number(diastolic),
      bp: `${systolic}/${diastolic} mmHg`,
      temperature: Number(temperature),
      pulse: Number(pulse),
      spo2: Number(spo2),
      weight: Number(weight),
      height: Number(height),
      bmi: bmiValue.value,
      bloodGlucose: bloodGlucose ? `${bloodGlucose} mg/dL` : 'Not tested',
      nurseNotes: nurseNotes || 'Routine nursing triage observations recorded.',
      nurseName: nurseName,
      hasCriticalVital,
      recordedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      recordedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };

    // Save into clinicStore
    clinicStore.update(state => {
      const updatedQueue = state.triageQueue.map(item => {
        if (item.id === patient.id) {
          // If critical vitals found, escalate to HIGH urgency if not already
          let revisedPriority = item.aiTriage?.suggestedPriority;
          let warnings = [...(item.aiTriage?.safetyWarnings || [])];

          if (hasCriticalVital) {
            revisedPriority = 'HIGH';
            if (bpStatus.alert) warnings.push(`CRITICAL VITALS: Blood Pressure elevated at ${systolic}/${diastolic} mmHg (${bpStatus.label}).`);
            if (tempStatus.alert) warnings.push(`HIGH FEVER: Body Temperature ${temperature}°C.`);
            if (spo2Status.alert) warnings.push(`OXYGEN DESATURATION: SpO2 ${spo2}%.`);
          }

          return {
            ...item,
            vitals: vitalsRecord,
            vitalsRecorded: true,
            status: item.status === 'PENDING_APPROVAL' ? 'PENDING_APPROVAL' : item.status,
            aiTriage: {
              ...item.aiTriage,
              suggestedPriority: revisedPriority,
              safetyWarnings: Array.from(new Set(warnings))
            }
          };
        }
        return item;
      });

      return {
        ...state,
        triageQueue: updatedQueue,
        systemNotification: {
          type: hasCriticalVital ? 'warning' : 'success',
          message: `Vitals saved for ${patient.patientName}. ${hasCriticalVital ? '⚠️ Critical vital signs flagged for doctor review!' : 'Patient ready for physician consultation.'}`
        }
      };
    });

    dispatch('saved', vitalsRecord);
    dispatch('close');
  }
</script>

<!-- Backdrop Modal -->
<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs font-sans">
  <div class="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
    
    <!-- Modal Header -->
    <div class="bg-[#0F172A] text-white p-5 sm:px-6 flex items-center justify-between border-b border-slate-800">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-blue-500/20 text-[#699FDF] flex items-center justify-center border border-[#699FDF]/30">
          <HeartPulse class="w-6 h-6" />
        </div>
        <div>
          <h3 class="text-base sm:text-lg font-bold">Nursing Vitals Triage Station</h3>
          <p class="text-xs text-slate-300 font-mono">
            Patient: {patient?.patientName} &bull; Card: {patient?.hospitalCardNo} &bull; Queue #{patient?.queueNo}
          </p>
        </div>
      </div>

      <button
        type="button"
        on:click={() => dispatch('close')}
        class="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
      >
        <X class="w-5 h-5" />
      </button>
    </div>

    <!-- Quick Preset Bar for OPD Speed -->
    <div class="bg-slate-100 px-5 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
      <span class="font-bold text-slate-600 uppercase tracking-wider text-[11px]">1-Click OPD Presets:</span>
      <div class="flex flex-wrap gap-1.5">
        <button
          type="button"
          on:click={() => applyPreset('normal')}
          class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-[#699FDF] text-slate-700 font-medium hover:text-[#699FDF] transition-colors cursor-pointer"
        >
          Normal Adult
        </button>
        <button
          type="button"
          on:click={() => applyPreset('fever')}
          class="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-300 hover:border-amber-400 text-amber-800 font-medium transition-colors cursor-pointer"
        >
          Febrile / Malaria (38.9°C)
        </button>
        <button
          type="button"
          on:click={() => applyPreset('hypertensive')}
          class="px-2.5 py-1 rounded-lg bg-red-50 border border-red-300 hover:border-red-400 text-red-700 font-medium transition-colors cursor-pointer"
        >
          Hypertensive (168/104)
        </button>
        <button
          type="button"
          on:click={() => applyPreset('hypoxic')}
          class="px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-300 hover:border-purple-400 text-purple-700 font-medium transition-colors cursor-pointer"
        >
          Hypoxia / Asthma (91%)
        </button>
      </div>
    </div>

    <!-- Scrollable Modal Body -->
    <div class="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-xs">
      
      <!-- Primary Vitals 2x2 Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        <!-- 1. Blood Pressure -->
        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div class="flex items-center justify-between">
            <label class="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
              <Activity class="w-4 h-4 text-[#699FDF]" />
              <span>Blood Pressure (mmHg)</span>
            </label>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded border {bpStatus.color}">
              {bpStatus.label}
            </span>
          </div>

          <div class="grid grid-cols-2 gap-2 pt-1">
            <div>
              <span class="text-[10px] text-slate-500 uppercase font-mono block">Systolic</span>
              <input
                type="number"
                bind:value={systolic}
                min="60"
                max="260"
                class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#699FDF] focus:ring-1 focus:ring-[#699FDF] font-mono text-base font-bold text-slate-900 outline-none"
              />
            </div>
            <div>
              <span class="text-[10px] text-slate-500 uppercase font-mono block">Diastolic</span>
              <input
                type="number"
                bind:value={diastolic}
                min="40"
                max="160"
                class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#699FDF] focus:ring-1 focus:ring-[#699FDF] font-mono text-base font-bold text-slate-900 outline-none"
              />
            </div>
          </div>
        </div>

        <!-- 2. Temperature -->
        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div class="flex items-center justify-between">
            <label class="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
              <Thermometer class="w-4 h-4 text-[#D97706]" />
              <span>Body Temperature (°C)</span>
            </label>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded border {tempStatus.color}">
              {tempStatus.label}
            </span>
          </div>

          <div class="pt-1">
            <span class="text-[10px] text-slate-500 uppercase font-mono block">Digital Axillary / Tympanic</span>
            <input
              type="number"
              bind:value={temperature}
              step="0.1"
              min="34.0"
              max="43.0"
              class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#699FDF] focus:ring-1 focus:ring-[#699FDF] font-mono text-base font-bold text-slate-900 outline-none"
            />
          </div>
        </div>

        <!-- 3. Pulse / Heart Rate -->
        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div class="flex items-center justify-between">
            <label class="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
              <HeartPulse class="w-4 h-4 text-[#DC2626]" />
              <span>Pulse / Heart Rate (bpm)</span>
            </label>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded border {pulse > 100 ? 'text-red-700 bg-red-100 border-red-300' : pulse < 60 ? 'text-blue-700 bg-blue-100 border-blue-300' : 'text-emerald-700 bg-emerald-50 border-emerald-200'}">
              {pulse > 100 ? 'Tachycardia' : pulse < 60 ? 'Bradycardia' : 'Normal Rate'}
            </span>
          </div>

          <div class="pt-1">
            <span class="text-[10px] text-slate-500 uppercase font-mono block">Radial Pulse Rate</span>
            <input
              type="number"
              bind:value={pulse}
              min="30"
              max="220"
              class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#699FDF] focus:ring-1 focus:ring-[#699FDF] font-mono text-base font-bold text-slate-900 outline-none"
            />
          </div>
        </div>

        <!-- 4. Oxygen Saturation SpO2 -->
        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div class="flex items-center justify-between">
            <label class="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
              <Wind class="w-4 h-4 text-[#699FDF]" />
              <span>Oxygen Saturation (SpO2 %)</span>
            </label>
            <span class="text-[10px] font-bold px-2 py-0.5 rounded border {spo2Status.color}">
              {spo2Status.label}
            </span>
          </div>

          <div class="pt-1">
            <span class="text-[10px] text-slate-500 uppercase font-mono block">Pulse Oximeter</span>
            <input
              type="number"
              bind:value={spo2}
              min="50"
              max="100"
              class="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-[#699FDF] focus:ring-1 focus:ring-[#699FDF] font-mono text-base font-bold text-slate-900 outline-none"
            />
          </div>
        </div>

      </div>

      <!-- Secondary Metrics: Weight, Height, BMI & Blood Sugar -->
      <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
        <h4 class="font-bold text-slate-900 text-xs flex items-center gap-1.5">
          <Scale class="w-4 h-4 text-slate-600" />
          <span>Anthropometry &amp; Point-of-Care Testing</span>
        </h4>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <span class="text-[10px] text-slate-500 uppercase font-mono block">Weight (kg)</span>
            <input
              type="number"
              bind:value={weight}
              min="1"
              max="250"
              class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono text-sm text-slate-900 outline-none focus:border-[#699FDF]"
            />
          </div>
          <div>
            <span class="text-[10px] text-slate-500 uppercase font-mono block">Height (cm)</span>
            <input
              type="number"
              bind:value={height}
              min="50"
              max="230"
              class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono text-sm text-slate-900 outline-none focus:border-[#699FDF]"
            />
          </div>
          <div>
            <span class="text-[10px] text-slate-500 uppercase font-mono block">BMI Index</span>
            <div class="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 font-mono text-sm font-bold text-slate-900">
              {bmiValue.value} <span class="text-[10px] text-slate-500 font-normal">({bmiValue.category})</span>
            </div>
          </div>
          <div>
            <span class="text-[10px] text-slate-500 uppercase font-mono block">Random Glucose</span>
            <input
              type="text"
              bind:value={bloodGlucose}
              placeholder="e.g. 110"
              class="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono text-sm text-slate-900 outline-none focus:border-[#699FDF]"
            />
          </div>
        </div>
      </div>

      <!-- Nurse Clinical Observations & Staff Signature -->
      <div class="space-y-3">
        <div>
          <label for="nurse-triage-notes" class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
            Nurse Triage Notes &amp; Observations
          </label>
          <textarea
            id="nurse-triage-notes"
            bind:value={nurseNotes}
            rows="2"
            placeholder="e.g. Patient visibly flushed and shivering. Alert and oriented x3. Guided to waiting area."
            class="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#699FDF] outline-none text-xs text-slate-900 bg-white"
          ></textarea>
        </div>

        <div class="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <div class="flex items-center gap-1.5">
            <UserCheck class="w-3.5 h-3.5 text-[#699FDF]" />
            <span>Triage Officer: <strong class="text-slate-800">{nurseName}</strong></span>
          </div>
          <span class="font-mono text-slate-400">Station 03 &bull; Triage Bay 1</span>
        </div>
      </div>

    </div>

    <!-- Modal Footer Actions -->
    <div class="bg-slate-50 p-4 sm:px-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div class="text-[11px] text-slate-500 flex items-center gap-1">
        <Clock class="w-3.5 h-3.5 text-slate-400" />
        <span>Thesis Stage 3: Reduces manual vitals bottleneck from 35.4m to &lt; 3m</span>
      </div>

      <div class="flex items-center gap-2.5 w-full sm:w-auto">
        <button
          type="button"
          on:click={() => dispatch('close')}
          class="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
        >
          Cancel
        </button>

        <button
          type="button"
          on:click={handleSave}
          class="w-1/2 sm:w-auto px-5 py-2.5 rounded-xl bg-[#699FDF] hover:bg-[#5289CC] text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
        >
          <Check class="w-4 h-4 stroke-[2.5]" />
          <span>Save Vitals &amp; Send to Doctor</span>
        </button>
      </div>
    </div>

  </div>
</div>
