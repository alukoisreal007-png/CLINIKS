<script>
  import { createEventDispatcher } from 'svelte';
  import { clinicStore } from '../../stores/clinicStore.js';
  import { 
    Bell, 
    X, 
    MessageSquare, 
    FileCheck, 
    CheckCheck, 
    Mail, 
    ArrowRight, 
    ShieldCheck, 
    Download 
  } from 'lucide-svelte';

  export let open = false;

  const dispatch = createEventDispatcher();

  $: currentUser = $clinicStore.currentUser;
  $: student = currentUser?.profile || {};
  $: consultantMessages = $clinicStore.consultantMessages || [];
  $: immutableRecords = $clinicStore.immutableRecords || [];
  $: unreadCount = consultantMessages.filter(m => m.unread).length;

  let activeTab = 'MESSAGES'; // 'MESSAGES' | 'REPORTS'

  function close() {
    dispatch('close');
  }

  function markAsRead(id) {
    clinicStore.markMessageAsRead(id);
  }

  function markAllRead() {
    clinicStore.markAllMessagesAsRead();
  }

  function viewReportDetail(recordId) {
    activeTab = 'REPORTS';
  }
</script>

{#if open}
  <div 
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150"
    role="dialog"
    aria-modal="true"
  >
    <div 
      class="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 text-slate-900"
    >
      <!-- Modal Header -->
      <div class="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Bell class="w-4.5 h-4.5 stroke-[2.5]" />
          </div>
          <div>
            <h3 class="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span>Notification Hub</span>
              {#if unreadCount > 0}
                <span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white">
                  {unreadCount} new
                </span>
              {/if}
            </h3>
            <p class="text-[11px] sm:text-xs text-slate-400 font-medium">
              Consultant messages &bull; Certified medical reports
            </p>
          </div>
        </div>

        <button
          type="button"
          on:click={close}
          class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close notifications"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex items-center border-b border-slate-200 bg-slate-50 px-4 sm:px-6 pt-2 gap-2 overflow-x-auto">
        <button
          type="button"
          on:click={() => activeTab = 'MESSAGES'}
          class="px-3.5 py-2 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap
            {activeTab === 'MESSAGES' 
              ? 'border-emerald-600 text-emerald-950 bg-white rounded-t-lg shadow-2xs' 
              : 'border-transparent text-slate-600 hover:text-slate-900'}"
        >
          <MessageSquare class="w-3.5 h-3.5 text-emerald-600" />
          <span>Consultant Messages</span>
          {#if consultantMessages.length > 0}
            <span class="px-1.5 py-0.5 rounded-full text-[10px] font-bold {unreadCount > 0 ? 'bg-rose-500 text-white' : 'bg-slate-200 text-slate-700'}">
              {consultantMessages.length}
            </span>
          {/if}
        </button>

        <button
          type="button"
          on:click={() => activeTab = 'REPORTS'}
          class="px-3.5 py-2 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap
            {activeTab === 'REPORTS' 
              ? 'border-emerald-600 text-emerald-950 bg-white rounded-t-lg shadow-2xs' 
              : 'border-transparent text-slate-600 hover:text-slate-900'}"
        >
          <FileCheck class="w-3.5 h-3.5 text-emerald-600" />
          <span>Medical Reports</span>
          <span class="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
            {immutableRecords.length}
          </span>
        </button>
      </div>

      <!-- Modal Body Content -->
      <div class="p-4 sm:p-6 overflow-y-auto space-y-3.5 flex-1 bg-slate-50/50">
        
        <!-- TAB 1: MESSAGES FROM CONSULTANT -->
        {#if activeTab === 'MESSAGES'}
          <div class="flex items-center justify-between pb-2">
            <span class="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Inbox ({consultantMessages.length} Messages)
            </span>
            {#if unreadCount > 0}
              <button
                type="button"
                on:click={markAllRead}
                class="text-xs font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer flex items-center gap-1"
              >
                <CheckCheck class="w-3.5 h-3.5" />
                <span>Mark all as read</span>
              </button>
            {/if}
          </div>

          {#if consultantMessages.length === 0}
            <div class="text-center py-12 space-y-3 bg-white rounded-2xl border border-slate-200">
              <Mail class="w-10 h-10 text-slate-300 mx-auto" />
              <p class="text-sm font-bold text-slate-700">No consultant messages yet</p>
              <p class="text-xs text-slate-500">Messages sent by reviewing physicians will appear here.</p>
            </div>
          {:else}
            <div class="space-y-3">
              {#each consultantMessages as msg}
                <div 
                  class="p-4 rounded-2xl border-2 transition-all bg-white shadow-2xs space-y-3
                    {msg.unread ? 'border-emerald-300 ring-2 ring-emerald-500/10' : 'border-slate-200'}"
                >
                  <!-- Message Header -->
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex items-center gap-3">
                      <img 
                        src={msg.avatar || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150"} 
                        alt={msg.from}
                        class="w-10 h-10 rounded-xl object-cover border border-emerald-400 shrink-0 shadow-xs"
                      />
                      <div>
                        <div class="flex items-center gap-2">
                          <p class="text-sm font-extrabold text-slate-950">{msg.from}</p>
                          <span class="text-[10px] font-bold px-2 py-0.5 rounded-full {msg.priority === 'high' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}">
                            {msg.tag}
                          </span>
                        </div>
                        <p class="text-xs text-slate-500 font-medium">{msg.role} &bull; {msg.date}</p>
                      </div>
                    </div>

                    {#if msg.unread}
                      <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 mt-1" title="Unread Message"></span>
                    {/if}
                  </div>

                  <!-- Subject & Body -->
                  <div class="pl-13 space-y-1">
                    <p class="text-xs font-black text-slate-900">{msg.subject}</p>
                    <p class="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-200">
                      {msg.body}
                    </p>
                  </div>

                  <!-- Action Bar -->
                  <div class="pl-13 pt-1 flex items-center justify-between gap-2">
                    {#if msg.relatedReportId}
                      <button
                        type="button"
                        on:click={() => {
                          viewReportDetail(msg.relatedReportId);
                          markAsRead(msg.id);
                        }}
                        class="text-xs font-extrabold text-emerald-700 hover:text-emerald-900 underline decoration-2 cursor-pointer flex items-center gap-1"
                      >
                        <span>View Linked Medical Report</span>
                        <ArrowRight class="w-3.5 h-3.5" />
                      </button>
                    {:else}
                      <span></span>
                    {/if}

                    {#if msg.unread}
                      <button
                        type="button"
                        on:click={() => markAsRead(msg.id)}
                        class="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                      >
                        Mark as read
                      </button>
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          {/if}

        <!-- TAB 2: MEDICAL REPORTS -->
        {:else if activeTab === 'REPORTS'}
          <div class="flex items-center justify-between pb-2">
            <span class="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Certified Medical Reports ({immutableRecords.length})
            </span>
            <span class="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <ShieldCheck class="w-3.5 h-3.5 stroke-[2.5]" />
              Cryptographically Verified
            </span>
          </div>

          <div class="space-y-3">
            {#each immutableRecords as record}
              <div class="p-5 rounded-2xl border-2 border-slate-200 bg-white shadow-2xs space-y-3">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="text-xs font-black font-mono px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-800">
                        {record.id}
                      </span>
                      <p class="text-sm font-black text-slate-950">{record.diagnosis}</p>
                    </div>
                    <p class="text-xs text-slate-600 font-medium mt-1">
                      Attending Consultant: <strong>{record.consultant}</strong> &bull; {record.date}
                    </p>
                  </div>

                  <span class="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
                    Certified
                  </span>
                </div>

                <!-- Complaint & Notes snippet -->
                <div class="text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5">
                  <p class="text-slate-800">
                    <strong class="text-slate-950">Chief Complaint:</strong> {record.chiefComplaint}
                  </p>
                  <p class="text-slate-700">
                    <strong class="text-slate-950">Clinical Notes:</strong> {record.notes}
                  </p>
                </div>

                <!-- Prescriptions list -->
                {#if record.prescriptions && record.prescriptions.length > 0}
                  <div class="space-y-1 pt-1">
                    <span class="text-[11px] font-black uppercase tracking-wider text-slate-600">Prescriptions Authorized:</span>
                    <div class="flex flex-wrap gap-2">
                      {#each record.prescriptions as rx}
                        <span class="text-xs font-bold px-2.5 py-1 rounded-lg bg-teal-50 text-teal-900 border border-teal-200">
                          {rx.name} ({rx.dosage})
                        </span>
                      {/each}
                    </div>
                  </div>
                {/if}

                <!-- Action Button -->
                <div class="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span class="text-[11px] text-slate-500 font-mono">
                    Facility: {record.facility}
                  </span>
                  <button
                    type="button"
                    on:click={() => {
                      alert(`Certified Medical Report ${record.id} for ${student.name || 'Student'}:\n\nDiagnosis: ${record.diagnosis}\nConsultant: ${record.consultant}\nDate: ${record.date}\n\nPrescriptions: ${record.prescriptions?.map(p => p.name).join(', ')}\n\nStatus: Officially Verified & Immutable.`);
                    }}
                    class="text-xs font-extrabold text-teal-800 hover:text-teal-950 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-xl border border-teal-300 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download class="w-3.5 h-3.5" />
                    <span>View / Download Summary</span>
                  </button>
                </div>
              </div>
            {/each}
          </div>
        {/if}

      </div>

      <!-- Modal Footer -->
      <div class="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
        <span class="text-xs text-slate-500 font-medium">
          CLINIKS Secure Patient Communication Protocol
        </span>
        <button
          type="button"
          on:click={close}
          class="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition-colors cursor-pointer"
        >
          Close Hub
        </button>
      </div>
    </div>
  </div>
{/if}
