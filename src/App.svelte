<script>
  import { clinicStore } from './stores/clinicStore.js';
  import MainLayout from './components/templates/MainLayout.svelte';
  import Home from './pages/Home.svelte';
  import Auth from './pages/Auth.svelte';
  import StudentDashboard from './pages/StudentDashboard.svelte';
  import ClinicianDashboard from './pages/ClinicianDashboard.svelte';
  import BookConsultant from './pages/BookConsultant.svelte';
  import NurseStation from './pages/NurseStation.svelte';
  import VerifyDocument from './pages/VerifyDocument.svelte';

  $: activeTab = $clinicStore.activeTab;
  $: currentUser = $clinicStore.currentUser;
</script>

<MainLayout>
  {#if activeTab === 'HOME'}
    <Home />
  {:else if activeTab === 'AUTH'}
    <Auth />
  {:else if activeTab === 'PATIENT_DASHBOARD' || activeTab === 'STUDENT_DASHBOARD'}
    <StudentDashboard />
  {:else if activeTab === 'BOOK_CONSULTANT'}
    <BookConsultant />
  {:else if activeTab === 'CLINICIAN_DASHBOARD'}
    <ClinicianDashboard />
  {:else if activeTab === 'NURSE_STATION'}
    <NurseStation />
  {:else if activeTab === 'VERIFY'}
    <VerifyDocument />
  {:else}
    <Home />
  {/if}
</MainLayout>
