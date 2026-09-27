<script>
  import { clinicStore } from '../../stores/clinicStore.js';
  import Button from '../atoms/Button.svelte';
  import Badge from '../atoms/Badge.svelte';
  import NotificationModal from '../molecules/NotificationModal.svelte';
  import ClinicianNotificationDropdown from './ClinicianNotificationDropdown.svelte';
  import OfflineSyncBadge from '../atoms/OfflineSyncBadge.svelte';
  import { Activity, ShieldCheck, UserCheck, LogOut, ArrowRight, Menu, X, Bell, HeartPulse, FileCheck } from 'lucide-svelte';

  $: currentUser = $clinicStore.currentUser;
  $: activeTab = $clinicStore.activeTab;
  $: consultantMessages = $clinicStore.consultantMessages || [];
  $: pendingTriageRequests = ($clinicStore.triageQueue || []).filter(q => q.status === 'PENDING_APPROVAL');
  $: unreadCount = currentUser?.role === 'CLINICIAN' 
    ? pendingTriageRequests.length 
    : consultantMessages.filter(m => m.unread).length;

  let mobileMenuOpen = false;
  let showNotifications = false;
  let showClinicianDropdown = false;

  function setTab(tab) {
    mobileMenuOpen = false;
    clinicStore.setTab(tab);
  }

  function handleLogout() {
    mobileMenuOpen = false;
    clinicStore.logout();
  }

  function scrollToSection(sectionId) {
    mobileMenuOpen = false;
    if (activeTab !== 'HOME') {
      clinicStore.setTab('HOME');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }
</script>

<header class="sticky top-0 z-40 bg-[#0F172A] border-b border-slate-800 shadow-md">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
    <!-- 1. Cliniks Logo, then 2. Cliniks Text -->
    <button
      type="button"
      class="flex items-center gap-2.5 cursor-pointer text-left focus-visible:outline-none rounded-xl py-1 shrink-0"
      on:click={() => setTab('HOME')}
    >
      <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#699FDF] flex items-center justify-center text-white shadow-xs">
        <Activity class="w-4 h-4 stroke-[2.5]" />
      </div>
      <span class="text-xl sm:text-2xl font-black tracking-tight text-white uppercase font-sans">cliniks</span>
    </button>

    <!-- 3. Navigation Links -->
    <nav class="hidden md:flex items-center gap-1.5 text-sm font-semibold text-slate-300">
      <button
        type="button"
        on:click={() => setTab('HOME')}
        class="px-3 py-2 rounded-xl transition-all cursor-pointer {activeTab === 'HOME' ? 'text-white bg-[#699FDF] font-bold shadow-2xs' : 'hover:text-white hover:bg-slate-800/90'}"
      >
        Home
      </button>

      {#if currentUser?.role === 'PATIENT' || currentUser?.role === 'STUDENT'}
        <button
          type="button"
          on:click={() => setTab('PATIENT_DASHBOARD')}
          class="px-3 py-2 rounded-xl transition-all cursor-pointer {activeTab === 'PATIENT_DASHBOARD' || activeTab === 'STUDENT_DASHBOARD' ? 'text-white bg-[#699FDF] font-bold shadow-2xs' : 'hover:text-white hover:bg-slate-800/90'}"
        >
          Patient Portal
        </button>
      {:else if currentUser?.role === 'CLINICIAN'}
        <button
          type="button"
          on:click={() => setTab('CLINICIAN_DASHBOARD')}
          class="px-3 py-2 rounded-xl transition-all cursor-pointer {activeTab === 'CLINICIAN_DASHBOARD' ? 'text-white bg-[#699FDF] font-bold shadow-2xs' : 'hover:text-white hover:bg-slate-800/90'}"
        >
          Clinician Hub
        </button>
      {/if}

      <!-- Stage 3 Nurse Vitals Station -->
      <button
        type="button"
        on:click={() => setTab('NURSE_STATION')}
        class="px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 {activeTab === 'NURSE_STATION' ? 'text-white bg-[#699FDF] font-bold shadow-2xs' : 'hover:text-white hover:bg-slate-800/90'}"
      >
        <HeartPulse class="w-3.5 h-3.5 text-[#699FDF]" />
        <span>Nurse Station</span>
      </button>

      <!-- Public Verification Portal (Section 4 & 9) -->
      <button
        type="button"
        on:click={() => setTab('VERIFY')}
        class="px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 {activeTab === 'VERIFY' ? 'text-white bg-[#699FDF] font-bold shadow-2xs' : 'hover:text-white hover:bg-slate-800/90'}"
      >
        <FileCheck class="w-3.5 h-3.5 text-[#699FDF]" />
        <span>Verify Slip</span>
      </button>

      {#if !currentUser}
        <button
          type="button"
          on:click={() => scrollToSection('how-it-works')}
          class="px-3 py-2 rounded-xl hover:text-white hover:bg-slate-800/90 transition-colors cursor-pointer"
        >
          How It Works
        </button>
      {/if}
    </nav>

    <!-- User Profile & Action Switcher: OfflineSyncBadge, Name & ID, Notification Bell, Logout -->
    <div class="flex items-center gap-2 sm:gap-3">
      <!-- Section 11 Offline Resilience Badge -->
      <OfflineSyncBadge />

      {#if currentUser}
        <!-- 5. Name and Card / Staff ID -->
        <div class="text-right leading-tight hidden xs:block">
          <p class="text-xs sm:text-sm font-bold text-white truncate max-w-[120px] sm:max-w-[170px]">
            {currentUser.profile?.name || 'User'}
          </p>
          <p class="text-[10px] sm:text-[11px] text-slate-400 font-mono">
            {currentUser.role === 'CLINICIAN' 
              ? (currentUser.profile?.staffId ? `Staff: ${currentUser.profile.staffId}` : 'Attending Clinician') 
              : (currentUser.profile?.hospitalCardNo ? `Card: ${currentUser.profile.hospitalCardNo}` : 'OPD Patient')}
          </p>
        </div>

        <!-- 6. Notification Bell with Dropdown Container -->
        <div class="relative">
          <button
            type="button"
            on:click={() => {
              if (currentUser?.role === 'CLINICIAN') {
                showClinicianDropdown = !showClinicianDropdown;
              } else {
                showNotifications = true;
              }
            }}
            class="relative p-2 rounded-xl border border-slate-700 hover:border-[#699FDF] hover:bg-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer {showClinicianDropdown ? 'bg-slate-800 border-[#699FDF] text-[#699FDF]' : ''}"
            title={currentUser?.role === 'CLINICIAN' ? "Incoming Patient Intake Requests" : "Notifications & Reports"}
            aria-label="View notifications"
          >
            <Bell class="w-4.5 h-4.5" />
            {#if unreadCount > 0}
              <span class="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#DC2626] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                {unreadCount}
              </span>
            {/if}
          </button>

          {#if currentUser?.role === 'CLINICIAN'}
            <ClinicianNotificationDropdown 
              bind:open={showClinicianDropdown}
              on:close={() => showClinicianDropdown = false}
            />
          {/if}
        </div>

        <!-- 7. Profile Picture -->
        <div class="relative shrink-0">
          <img 
            src={currentUser.profile?.avatar || (currentUser.role === 'STUDENT' ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200" : "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200")} 
            alt={currentUser.profile?.name || 'User Profile'}
            class="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover ring-2 ring-[#699FDF] shadow-2xs"
          />
          <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#699FDF] border-2 border-[#0F172A]" title="Active"></span>
        </div>

        <!-- 8. Logout Button -->
        <button
          type="button"
          on:click={handleLogout}
          title="Sign Out"
          class="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
          aria-label="Sign out"
        >
          <LogOut class="w-4 h-4" />
        </button>
      {:else}
        <button
          type="button"
          on:click={() => setTab('AUTH')}
          class="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap"
        >
          Sign In
        </button>
        <button
          type="button"
          on:click={() => setTab('AUTH')}
          class="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#699FDF] hover:bg-[#5289CC] text-white font-semibold text-sm shadow-xs transition-all cursor-pointer whitespace-nowrap"
        >
          <span>Get Started</span>
          <ArrowRight class="w-3.5 h-3.5" />
        </button>
      {/if}

      <!-- Mobile Menu Toggle Button -->
      <button
        type="button"
        on:click={() => mobileMenuOpen = !mobileMenuOpen}
        class="md:hidden p-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
        aria-label="Toggle navigation menu"
      >
        {#if mobileMenuOpen}
          <X class="w-4.5 h-4.5" />
        {:else}
          <Menu class="w-4.5 h-4.5" />
        {/if}
      </button>
    </div>
  </div>

  <!-- Mobile Dropdown Navigation Menu -->
  {#if mobileMenuOpen}
    <div class="md:hidden border-t border-slate-800 bg-[#0F172A] px-4 py-3 space-y-1 shadow-lg animate-in slide-in-from-top-2 duration-150">
      <button
        type="button"
        on:click={() => setTab('HOME')}
        class="w-full text-left px-3.5 py-2.5 rounded-xl font-semibold text-sm {activeTab === 'HOME' ? 'text-white bg-[#699FDF] font-bold' : 'text-slate-300 hover:bg-slate-800'}"
      >
        Home
      </button>

      {#if !currentUser}
        <button
          type="button"
          on:click={() => scrollToSection('how-it-works')}
          class="w-full text-left px-3.5 py-2.5 rounded-xl font-semibold text-sm text-slate-300 hover:bg-slate-800"
        >
          How It Works
        </button>
        <button
          type="button"
          on:click={() => scrollToSection('for-students')}
          class="w-full text-left px-3.5 py-2.5 rounded-xl font-semibold text-sm text-slate-300 hover:bg-slate-800"
        >
          For Students
        </button>
        <button
          type="button"
          on:click={() => scrollToSection('for-clinics')}
          class="w-full text-left px-3.5 py-2.5 rounded-xl font-semibold text-sm text-slate-300 hover:bg-slate-800"
        >
          For Clinics
        </button>

        <div class="pt-2 mt-2 border-t border-slate-800">
          <button
            type="button"
            on:click={() => setTab('AUTH')}
            class="w-full py-2.5 rounded-xl bg-[#699FDF] hover:bg-[#5289CC] text-white font-semibold text-sm text-center shadow-xs"
          >
            Get Started &rarr;
          </button>
        </div>
      {/if}

      {#if currentUser?.role === 'PATIENT' || currentUser?.role === 'STUDENT'}
        <button
          type="button"
          on:click={() => setTab('PATIENT_DASHBOARD')}
          class="w-full text-left px-3.5 py-2.5 rounded-xl font-semibold text-sm {activeTab === 'PATIENT_DASHBOARD' || activeTab === 'STUDENT_DASHBOARD' ? 'text-white bg-[#699FDF] font-bold' : 'text-slate-300 hover:bg-slate-800'}"
        >
          Patient Portal
        </button>
      {/if}

      {#if currentUser?.role === 'CLINICIAN'}
        <button
          type="button"
          on:click={() => setTab('CLINICIAN_DASHBOARD')}
          class="w-full text-left px-3.5 py-2.5 rounded-xl font-semibold text-sm {activeTab === 'CLINICIAN_DASHBOARD' ? 'text-white bg-[#699FDF] font-bold' : 'text-slate-300 hover:bg-slate-800'}"
        >
          Clinician Hub
        </button>
      {/if}

      <!-- Nurse Station Mobile -->
      <button
        type="button"
        on:click={() => setTab('NURSE_STATION')}
        class="w-full text-left px-3.5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 {activeTab === 'NURSE_STATION' ? 'text-white bg-[#699FDF] font-bold' : 'text-slate-300 hover:bg-slate-800'}"
      >
        <HeartPulse class="w-4 h-4 text-[#699FDF]" />
        <span>Nurse Vitals Station</span>
      </button>

      <!-- Verify Slip Mobile -->
      <button
        type="button"
        on:click={() => setTab('VERIFY')}
        class="w-full text-left px-3.5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 {activeTab === 'VERIFY' ? 'text-white bg-[#699FDF] font-bold' : 'text-slate-300 hover:bg-slate-800'}"
      >
        <FileCheck class="w-4 h-4 text-[#699FDF]" />
        <span>Verify Medical Slip</span>
      </button>

      {#if currentUser}
        <button
          type="button"
          on:click={() => { 
            mobileMenuOpen = false; 
            if (currentUser?.role === 'CLINICIAN') {
              showClinicianDropdown = !showClinicianDropdown;
            } else {
              showNotifications = true; 
            }
          }}
          class="w-full text-left px-3.5 py-2.5 rounded-xl font-semibold text-sm text-slate-300 hover:bg-slate-800 flex items-center justify-between"
        >
          <div class="flex items-center gap-2">
            <Bell class="w-4 h-4 text-[#699FDF]" />
            <span>{currentUser?.role === 'CLINICIAN' ? 'Patient Intake Requests' : 'Notifications & Reports'}</span>
          </div>
          {#if unreadCount > 0}
            <span class="px-2 py-0.5 rounded-full bg-[#DC2626] text-white text-[11px] font-bold">
              {unreadCount} new
            </span>
          {/if}
        </button>

        <div class="pt-2 mt-2 border-t border-slate-800 space-y-1">
          <div class="px-3.5 py-1.5 flex items-center justify-between text-xs text-slate-400">
            <span class="truncate">Logged in as <strong class="text-white">{currentUser.profile?.name}</strong></span>
            <span class="px-2 py-0.5 rounded-full bg-slate-800 text-[#699FDF] font-bold text-[10px] border border-slate-700">{currentUser.role}</span>
          </div>
          <button
            type="button"
            on:click={handleLogout}
            class="w-full text-left px-3.5 py-2 rounded-xl font-semibold text-sm text-red-400 hover:bg-slate-800 flex items-center gap-2"
          >
            <LogOut class="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      {/if}
    </div>
  {/if}
</header>

<NotificationModal open={showNotifications} on:close={() => showNotifications = false} />
