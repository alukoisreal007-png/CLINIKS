<script>
  import { clinicStore } from '../../stores/clinicStore.js';
  import { 
    Activity, 
    Stethoscope, 
    User, 
    Clock, 
    LogOut, 
    Menu, 
    X, 
    Bell,
    CheckCircle2
  } from 'lucide-svelte';

  $: currentUser = $clinicStore.currentUser;
  $: activeTab = $clinicStore.activeTab;
  $: queue = $clinicStore.triageQueue || [];
  $: pendingCount = queue.filter(q => q.status === 'PENDING_APPROVAL' || !q.scheduledTime).length;

  let mobileMenuOpen = false;

  function setTab(tab) {
    mobileMenuOpen = false;
    if (tab === 'CLINICIAN_DASHBOARD' && (!currentUser || currentUser.role !== 'CLINICIAN')) {
      clinicStore.loginAsClinician();
    }
    clinicStore.setTab(tab);
  }

  function handleLogout() {
    mobileMenuOpen = false;
    clinicStore.logout();
  }
</script>

<header class="sticky top-0 z-40 bg-[#0F172A] border-b border-slate-800 shadow-md font-sans">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
    
    <!-- Brand Logo -->
    <button
      type="button"
      class="flex items-center gap-2.5 cursor-pointer text-left focus-visible:outline-none rounded-xl py-1 shrink-0"
      on:click={() => setTab('HOME')}
    >
      <div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
        <Activity class="w-4 h-4 stroke-[2.5]" />
      </div>
      <span class="text-xl font-extrabold tracking-tight text-white uppercase font-mono">CLINIKS</span>
    </button>

    <!-- Navigation Tabs (Clean, Direct, Focused) -->
    <nav class="hidden md:flex items-center gap-1.5 text-xs font-semibold text-slate-300">
      <button
        type="button"
        on:click={() => setTab('HOME')}
        class="px-3 py-2 rounded-xl transition-all cursor-pointer {activeTab === 'HOME' ? 'text-white bg-blue-600 font-bold shadow-xs' : 'hover:text-white hover:bg-slate-800'}"
      >
        Home
      </button>

      <button
        type="button"
        on:click={() => setTab('BOOK_CONSULTANT')}
        class="px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 {activeTab === 'BOOK_CONSULTANT' ? 'text-white bg-blue-600 font-bold shadow-xs' : 'hover:text-white hover:bg-slate-800'}"
      >
        <User class="w-3.5 h-3.5" />
        <span>Patient Intake</span>
      </button>

      <button
        type="button"
        on:click={() => setTab('CLINICIAN_DASHBOARD')}
        class="px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 {activeTab === 'CLINICIAN_DASHBOARD' ? 'text-white bg-blue-600 font-bold shadow-xs' : 'hover:text-white hover:bg-slate-800'}"
      >
        <Stethoscope class="w-3.5 h-3.5" />
        <span>Doctor Workstation</span>
        {#if pendingCount > 0}
          <span class="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-slate-950">
            {pendingCount}
          </span>
        {/if}
      </button>

      <button
        type="button"
        on:click={() => setTab('PATIENT_DASHBOARD')}
        class="px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 {activeTab === 'PATIENT_DASHBOARD' || activeTab === 'STUDENT_DASHBOARD' ? 'text-white bg-blue-600 font-bold shadow-xs' : 'hover:text-white hover:bg-slate-800'}"
      >
        <Clock class="w-3.5 h-3.5" />
        <span>Queue Ticket</span>
      </button>
    </nav>

    <!-- Right Quick Role Switcher -->
    <div class="flex items-center gap-2">
      {#if currentUser?.role === 'CLINICIAN'}
        <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-mono text-slate-300">
          <span class="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
          <span>Dr. Stella Adeleke</span>
        </div>
        <button
          type="button"
          on:click={handleLogout}
          class="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
          title="Sign out"
        >
          <LogOut class="w-4 h-4" />
        </button>
      {:else}
        <button
          type="button"
          on:click={() => setTab('CLINICIAN_DASHBOARD')}
          class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
        >
          <Stethoscope class="w-3.5 h-3.5 text-blue-400" />
          <span>Doctor Portal</span>
        </button>
        <button
          type="button"
          on:click={() => setTab('BOOK_CONSULTANT')}
          class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
        >
          <span>Patient Intake</span>
        </button>
      {/if}

      <!-- Mobile Menu Toggle -->
      <button
        type="button"
        on:click={() => mobileMenuOpen = !mobileMenuOpen}
        class="md:hidden p-2 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
      >
        {#if mobileMenuOpen}
          <X class="w-4 h-4" />
        {:else}
          <Menu class="w-4 h-4" />
        {/if}
      </button>
    </div>

  </div>

  <!-- Mobile Dropdown Menu -->
  {#if mobileMenuOpen}
    <div class="md:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-2 text-xs font-semibold">
      <button
        type="button"
        on:click={() => setTab('HOME')}
        class="w-full text-left px-3 py-2 rounded-lg {activeTab === 'HOME' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}"
      >
        Home
      </button>

      <button
        type="button"
        on:click={() => setTab('BOOK_CONSULTANT')}
        class="w-full text-left px-3 py-2 rounded-lg {activeTab === 'BOOK_CONSULTANT' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}"
      >
        Patient Intake
      </button>

      <button
        type="button"
        on:click={() => setTab('CLINICIAN_DASHBOARD')}
        class="w-full text-left px-3 py-2 rounded-lg {activeTab === 'CLINICIAN_DASHBOARD' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}"
      >
        Doctor Workstation ({pendingCount} pending)
      </button>

      <button
        type="button"
        on:click={() => setTab('PATIENT_DASHBOARD')}
        class="w-full text-left px-3 py-2 rounded-lg {activeTab === 'PATIENT_DASHBOARD' || activeTab === 'STUDENT_DASHBOARD' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}"
      >
        Queue Ticket
      </button>
    </div>
  {/if}
</header>
