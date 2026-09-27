<script>
  import { createEventDispatcher } from 'svelte';
  import { 
    Clock, 
    AlertTriangle, 
    Check, 
    Zap, 
    X, 
    ChevronRight, 
    Calendar,
    AlertCircle
  } from 'lucide-svelte';

  export let existingAppointments = []; // Array of { id, patientName, queueNo, scheduledTime }
  export let currentPatient;
  export let preliminaryScore = 5;

  const dispatch = createEventDispatcher();

  // Clock State
  let selectedHour = 10;
  let selectedMinute = 30;
  let selectedPeriod = 'AM'; // 'AM' | 'PM'
  let clockMode = 'HOUR'; // 'HOUR' | 'MINUTE'
  let directInput = '10:30';

  // Hours: 1 through 12
  const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  // Minutes: 5-minute increments around clock
  const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  // Compute formatted time string: e.g. "10:30 AM"
  $: formattedTime = `${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')} ${selectedPeriod}`;

  // Check for time collision / conflicts with existing patients
  $: conflictingPatient = (() => {
    if (!existingAppointments?.length) return null;
    return existingAppointments.find(appt => 
      appt.id !== currentPatient?.id && 
      appt.scheduledTime && 
      appt.scheduledTime.trim().toUpperCase() === formattedTime.trim().toUpperCase()
    );
  })();

  $: hasConflict = !!conflictingPatient;

  // Next available open slot helper
  $: suggestedOpenSlot = (() => {
    const bookedTimes = new Set(existingAppointments.map(a => a.scheduledTime?.trim().toUpperCase()).filter(Boolean));
    for (let m = 0; m < 60; m += 15) {
      const test = `${String(selectedHour).padStart(2, '0')}:${String(m).padStart(2, '0')} ${selectedPeriod}`;
      if (!bookedTimes.has(test)) {
        return { hour: selectedHour, minute: m, period: selectedPeriod, label: test };
      }
    }
    const nextH = selectedHour === 12 ? 1 : selectedHour + 1;
    return { hour: nextH, minute: 0, period: selectedPeriod, label: `${String(nextH).padStart(2, '0')}:00 ${selectedPeriod}` };
  })();

  function setHour(h) {
    selectedHour = h;
    clockMode = 'MINUTE';
    updateDirectInput();
  }

  function setMinute(m) {
    selectedMinute = m;
    updateDirectInput();
  }

  function togglePeriod(p) {
    selectedPeriod = p;
    updateDirectInput();
  }

  function updateDirectInput() {
    directInput = `${String(selectedHour).padStart(2, '0')}:${String(selectedMinute).padStart(2, '0')}`;
  }

  function handleDirectInputChange(e) {
    const val = e.target.value.trim();
    const match = val.match(/^(\d{1,2}):(\d{2})$/);
    if (match) {
      const h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      if (h >= 1 && h <= 12 && m >= 0 && m <= 59) {
        selectedHour = h;
        selectedMinute = m;
      }
    }
  }

  function applyOpenSlot() {
    selectedHour = suggestedOpenSlot.hour;
    selectedMinute = suggestedOpenSlot.minute;
    selectedPeriod = suggestedOpenSlot.period;
    updateDirectInput();
  }

  function handleFastTrackImmediate() {
    dispatch('confirm', {
      time: 'Immediate Stat (Now)',
      isImmediate: true,
      section: 'EMERGENCY',
      score: 10
    });
  }

  function handleConfirm() {
    if (hasConflict) return; // Hard blocker

    const isEmergency = Number(preliminaryScore) >= 8;
    const assignedSection = isEmergency ? 'EMERGENCY' : 'CHECK_UP';

    dispatch('confirm', {
      time: formattedTime,
      isImmediate: false,
      section: assignedSection,
      score: preliminaryScore
    });
  }
</script>

<div class="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden max-w-md w-full font-sans text-slate-900">
  
  <!-- Header -->
  <div class="bg-[#0F172A] text-white p-4 sm:p-5 flex items-center justify-between">
    <div class="flex items-center gap-2.5">
      <div class="w-8 h-8 rounded-lg bg-blue-500/20 text-[#699FDF] flex items-center justify-center">
        <Clock class="w-4 h-4" />
      </div>
      <div>
        <h3 class="text-sm font-bold text-white">Clinical Time Scheduler</h3>
        <p class="text-[11px] text-slate-300 font-mono">
          For: {currentPatient?.patientName || 'Patient'}
        </p>
      </div>
    </div>

    <button
      type="button"
      on:click={() => dispatch('close')}
      class="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
    >
      <X class="w-5 h-5" />
    </button>
  </div>

  <!-- Time Display & Mode Tabs -->
  <div class="p-5 space-y-5">
    
    <!-- Time Big Display -->
    <div class="flex items-center justify-center gap-2 text-center">
      <button
        type="button"
        on:click={() => clockMode = 'HOUR'}
        class="text-3xl sm:text-4xl font-black font-mono px-3 py-1.5 rounded-xl border transition-all cursor-pointer
          {clockMode === 'HOUR' ? 'bg-blue-50 text-blue-600 border-blue-500 ring-2 ring-blue-100' : 'bg-slate-50 text-slate-800 border-slate-200'}"
      >
        {String(selectedHour).padStart(2, '0')}
      </button>

      <span class="text-3xl font-black text-slate-300">:</span>

      <button
        type="button"
        on:click={() => clockMode = 'MINUTE'}
        class="text-3xl sm:text-4xl font-black font-mono px-3 py-1.5 rounded-xl border transition-all cursor-pointer
          {clockMode === 'MINUTE' ? 'bg-blue-50 text-blue-600 border-blue-500 ring-2 ring-blue-100' : 'bg-slate-50 text-slate-800 border-slate-200'}"
      >
        {String(selectedMinute).padStart(2, '0')}
      </button>

      <!-- AM / PM Switcher -->
      <div class="flex flex-col gap-1 ml-2 font-mono text-xs font-bold">
        <button
          type="button"
          on:click={() => togglePeriod('AM')}
          class="px-2.5 py-1 rounded-lg border transition-all cursor-pointer {selectedPeriod === 'AM' ? 'bg-[#0F172A] text-white border-[#0F172A]' : 'bg-slate-100 text-slate-600 border-slate-200'}"
        >
          AM
        </button>
        <button
          type="button"
          on:click={() => togglePeriod('PM')}
          class="px-2.5 py-1 rounded-lg border transition-all cursor-pointer {selectedPeriod === 'PM' ? 'bg-[#0F172A] text-white border-[#0F172A]' : 'bg-slate-100 text-slate-600 border-slate-200'}"
        >
          PM
        </button>
      </div>
    </div>

    <!-- Radial Clock Dial (Circular Visual Gauge) -->
    <div class="relative w-56 h-56 mx-auto rounded-full bg-slate-50 border-2 border-slate-200 flex items-center justify-center p-3 select-none">
      
      <!-- Clock Center Pivot -->
      <div class="w-3 h-3 rounded-full bg-blue-600 z-10 shadow-xs"></div>

      <!-- Mode: Hour Radial Numbers -->
      {#if clockMode === 'HOUR'}
        {#each hours as h, i}
          {@const angle = (i * 30 - 90) * (Math.PI / 180)}
          {@const x = Math.round(85 * Math.cos(angle))}
          {@const y = Math.round(85 * Math.sin(angle))}
          <button
            type="button"
            on:click={() => setHour(h)}
            style="transform: translate({x}px, {y}px);"
            class="absolute w-8 h-8 rounded-full text-xs font-bold font-mono flex items-center justify-center transition-all cursor-pointer
              {selectedHour === h ? 'bg-blue-600 text-white shadow-md scale-110' : 'text-slate-700 hover:bg-blue-100 hover:text-blue-700'}"
          >
            {h}
          </button>
        {/each}
      {:else}
        <!-- Mode: Minute Radial Numbers -->
        {#each minutes as m, i}
          {@const angle = (i * 30 - 90) * (Math.PI / 180)}
          {@const x = Math.round(85 * Math.cos(angle))}
          {@const y = Math.round(85 * Math.sin(angle))}
          <button
            type="button"
            on:click={() => setMinute(m)}
            style="transform: translate({x}px, {y}px);"
            class="absolute w-8 h-8 rounded-full text-[11px] font-bold font-mono flex items-center justify-center transition-all cursor-pointer
              {selectedMinute === m ? 'bg-blue-600 text-white shadow-md scale-110' : 'text-slate-700 hover:bg-blue-100 hover:text-blue-700'}"
          >
            {String(m).padStart(2, '0')}
          </button>
        {/each}
      {/if}
    </div>

    <!-- Mode Indicator & Quick 15m buttons -->
    <div class="flex items-center justify-between text-xs border-t border-slate-100 pt-3">
      <span class="text-slate-400 font-mono text-[11px]">
        Mode: <strong class="text-slate-800">{clockMode === 'HOUR' ? 'Select Hour' : 'Select Minute'}</strong>
      </span>
      <div class="flex items-center gap-1 font-mono text-[11px]">
        <button
          type="button"
          on:click={() => setMinute(0)}
          class="px-2 py-0.5 rounded border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
        >:00</button>
        <button
          type="button"
          on:click={() => setMinute(15)}
          class="px-2 py-0.5 rounded border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
        >:15</button>
        <button
          type="button"
          on:click={() => setMinute(30)}
          class="px-2 py-0.5 rounded border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
        >:30</button>
        <button
          type="button"
          on:click={() => setMinute(45)}
          class="px-2 py-0.5 rounded border border-slate-200 hover:bg-slate-100 text-slate-700 cursor-pointer"
        >:45</button>
      </div>
    </div>

    <!-- ===================================================================== -->
    <!-- SCHEDULING CONFLICT & SEQUENCE GUARD (Hard Blocker)                  -->
    <!-- ===================================================================== -->
    {#if hasConflict}
      <div class="p-3.5 rounded-xl bg-red-50 border-2 border-red-400 text-red-900 text-xs space-y-2 animate-in shake duration-150">
        <div class="flex items-start gap-2">
          <AlertTriangle class="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div class="space-y-0.5">
            <h5 class="font-bold text-red-950">Schedule Conflict Detected</h5>
            <p class="leading-relaxed">
              <strong>{formattedTime}</strong> is already assigned to 
              <strong>{conflictingPatient.patientName}</strong> (#{conflictingPatient.queueNo}).
            </p>
          </div>
        </div>

        <p class="text-[11px] text-red-700 italic">
          ⚠️ You cannot move on or confirm this patient until this time clash is sorted.
        </p>

        <button
          type="button"
          on:click={applyOpenSlot}
          class="w-full py-1.5 px-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] transition-colors cursor-pointer text-center"
        >
          Select Next Open Slot ({suggestedOpenSlot.label})
        </button>
      </div>
    {:else}
      <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between font-mono">
        <span class="flex items-center gap-1.5 text-emerald-700 font-semibold">
          <Check class="w-3.5 h-3.5 text-emerald-600" />
          <span>Slot Available: {formattedTime}</span>
        </span>
        <span class="text-slate-400">No conflict</span>
      </div>
    {/if}

    <!-- Stat Emergency Fast-Track Option -->
    <button
      type="button"
      on:click={handleFastTrackImmediate}
      class="w-full py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
    >
      <Zap class="w-3.5 h-3.5 text-amber-600" />
      <span>Fast-Track Immediate Stat (Emergency Section Now)</span>
    </button>

    <!-- Confirmation Actions -->
    <div class="flex items-center gap-2 pt-2 border-t border-slate-100">
      <button
        type="button"
        on:click={() => dispatch('close')}
        class="w-1/3 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer text-center"
      >
        Cancel
      </button>

      <button
        type="button"
        on:click={handleConfirm}
        disabled={hasConflict}
        class="w-2/3 py-2.5 rounded-xl text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5
          {hasConflict 
            ? 'bg-slate-300 cursor-not-allowed opacity-60' 
            : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'}"
      >
        <Check class="w-4 h-4" />
        <span>Confirm &amp; Issue Badge</span>
      </button>
    </div>

  </div>
</div>
