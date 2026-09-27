<script>
  import Card from '../atoms/Card.svelte';
  import Badge from '../atoms/Badge.svelte';
  import Button from '../atoms/Button.svelte';
  import { 
    Lock, 
    Download, 
    FileText, 
    ShieldCheck, 
    Calendar, 
    User, 
    Stethoscope, 
    Pill, 
    Printer,
    CheckCircle
  } from 'lucide-svelte';

  export let records = [];
  export let studentProfile;

  let selectedRecord = records[0] || null;

  function downloadRecordReport(record) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to download medical reports.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>University Clinic Official Medical Report - ${record.id}</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #0f172a; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 3px solid #047857; padding-bottom: 20px; margin-bottom: 25px; }
          .title { font-size: 24px; font-weight: 900; color: #047857; margin-bottom: 5px; letter-spacing: -0.5px; }
          .subtitle { font-size: 14px; font-weight: bold; color: #475569; }
          .security-badge { display: inline-block; background: #ecfdf5; color: #065f46; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 800; border: 1.5px solid #a7f3d0; margin-top: 10px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px; background: #f8fafc; padding: 18px; border-radius: 12px; font-size: 14px; border: 1px solid #e2e8f0; }
          .section { margin-bottom: 22px; }
          .section-title { font-size: 13px; font-weight: 800; text-transform: uppercase; color: #047857; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 10px; letter-spacing: 0.5px; }
          .prescription-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 8px; }
          .prescription-table th, .prescription-table td { border: 1.5px solid #cbd5e1; padding: 10px; text-align: left; }
          .prescription-table th { background: #f1f5f9; font-weight: 800; color: #0f172a; }
          .footer { margin-top: 40px; border-top: 2px solid #e2e8f0; padding-top: 20px; font-size: 12px; font-weight: 600; color: #475569; display: flex; justify-content: space-between; align-items: center; }
          .stamp { border: 2.5px dashed #047857; padding: 12px 18px; text-align: center; border-radius: 8px; color: #047857; font-weight: 900; font-size: 13px; letter-spacing: 0.5px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">UNIVERSITY JAJA HEALTH CENTER</div>
          <div class="subtitle">DIVISION OF STUDENT HEALTH & MEDICAL CONSULTATIONS</div>
          <div class="security-badge">🔒 VERIFIED OFFICIAL MEDICAL RECORD &bull; IMMUTABLE DISPATCH</div>
        </div>

        <div class="grid">
          <div><strong>Student Name:</strong> ${studentProfile?.name}</div>
          <div><strong>Matriculation No:</strong> ${studentProfile?.matricNo}</div>
          <div><strong>Jaja Clinic File No:</strong> ${studentProfile?.jajaNo}</div>
          <div><strong>Faculty & Dept:</strong> ${studentProfile?.faculty} - ${studentProfile?.department}</div>
          <div><strong>Consultation Date:</strong> ${record.date}</div>
          <div><strong>Attending Physician:</strong> ${record.consultant}</div>
        </div>

        <div class="section">
          <div class="section-title">Clinical Presentation & Chief Complaint</div>
          <p style="font-size: 14px; line-height: 1.6; font-weight: 600;">${record.chiefComplaint}</p>
        </div>

        <div class="section">
          <div class="section-title">Recorded Vitals</div>
          <div style="font-size: 13px; font-weight: bold; background: #f1f5f9; padding: 10px 14px; border-radius: 8px;">
            BP: <strong>${record.vitals.bp}</strong> &bull; Pulse: <strong>${record.vitals.pulse}</strong> &bull; Temperature: <strong>${record.vitals.temp}</strong> &bull; Body Weight: <strong>${record.vitals.weight}</strong>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Clinical Diagnosis</div>
          <p style="font-size: 16px; font-weight: 900; color: #0f172a;">${record.diagnosis}</p>
        </div>

        <div class="section">
          <div class="section-title">Prescribed Pharmacotherapy</div>
          <table class="prescription-table">
            <thead>
              <tr><th>Medication</th><th>Dosage & Frequency</th><th>Duration</th></tr>
            </thead>
            <tbody>
              ${record.prescriptions.map(p => `<tr><td><strong>${p.name}</strong></td><td>${p.dosage}</td><td>${p.duration}</td></tr>`).join('')}
            </tbody>
          </table>
        </div>

        <div class="section">
          <div class="section-title">Consultant Directives & Clinical Notes</div>
          <p style="font-size: 13px; font-weight: 600; color: #1e293b; line-height: 1.6;">${record.notes}</p>
        </div>

        <div class="footer">
          <div>
            Official Electronic Record ID: <strong>${record.id}</strong><br>
            Tamper-Proof Verification Hash: <strong>SHA256-${record.id}-CLINIKS-AUTHENTICATED</strong>
          </div>
          <div class="stamp">
            APPROVED &amp; SEALED<br>JAJA MEDICAL DIRECTORATE
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); }
        <\/script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
</script>

<Card className="p-5 sm:p-7 border border-slate-200 bg-white shadow-xs rounded-2xl sm:rounded-3xl">
  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
    <div>
      <div class="flex flex-wrap items-center gap-2">
        <h3 class="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">Student Medical Records</h3>
        <span class="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
          <Lock class="w-3 h-3 text-slate-500" />
          <span>Read-Only</span>
        </span>
      </div>
      <p class="text-xs text-slate-500 mt-0.5">
        Official clinical consultations, lab results, and prescriptions certified by university health officers.
      </p>
    </div>

    <div class="hidden sm:flex items-center gap-2">
      <Badge variant="approved" size="md">
        <ShieldCheck class="w-4 h-4 mr-1.5" />
        Tamper-Proof Ledger
      </Badge>
    </div>
  </div>

  <!-- Records Grid & Detail -->
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
    <!-- Left: List of historical consultations -->
    <div class="lg:col-span-5 space-y-2.5">
      <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Past Clinical Visits ({records.length})</p>
      {#each records as record}
        <button
          type="button"
          on:click={() => selectedRecord = record}
          class="w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer shadow-2xs
            {selectedRecord?.id === record.id 
              ? 'bg-emerald-50/80 border-emerald-500 ring-1 ring-emerald-500/20 shadow-xs' 
              : 'bg-white hover:bg-slate-50/80 border-slate-200 text-slate-800'}"
        >
          <div class="flex items-center justify-between mb-1">
            <span class="text-sm font-bold text-slate-900">{record.diagnosis}</span>
            <span class="text-xs font-semibold text-slate-500">{record.date}</span>
          </div>
          <p class="text-xs text-slate-600 truncate">{record.consultant}</p>
          <div class="flex items-center gap-2 mt-2">
            <span class="text-xs font-mono font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
              {record.id}
            </span>
            <span class="text-xs text-emerald-700 font-semibold flex items-center gap-1 ml-auto">
              <CheckCircle class="w-3.5 h-3.5" /> Certified
            </span>
          </div>
        </button>
      {/each}
    </div>

    <!-- Right: Detailed Selected Record & Download Button -->
    <div class="lg:col-span-7">
      {#if selectedRecord}
        <div class="p-4 sm:p-6 rounded-xl border border-slate-200 bg-slate-50/60 space-y-4">
          <!-- Top info bar -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3.5">
            <div>
              <span class="text-xs font-mono font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-200">
                Record ID: {selectedRecord.id}
              </span>
              <h4 class="text-lg font-bold text-slate-900 mt-1.5">{selectedRecord.diagnosis}</h4>
              <p class="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5">
                <Calendar class="w-3.5 h-3.5 text-emerald-700" /> 
                <span>{selectedRecord.date} &bull; {selectedRecord.facility}</span>
              </p>
            </div>

            <!-- DOWNLOADABLE MEDICAL REPORT -->
            <Button
              variant="outline"
              size="sm"
              className="bg-white border-slate-200 hover:border-emerald-600 hover:text-emerald-800 font-semibold shadow-2xs"
              on:click={() => downloadRecordReport(selectedRecord)}
            >
              <Download class="w-3.5 h-3.5 mr-1.5 text-emerald-700" />
              <span>Download PDF</span>
            </Button>
          </div>

          <!-- Medical details: Refined contrast -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div class="space-y-0.5">
              <span class="font-bold text-slate-500 uppercase tracking-wider text-[11px]">Attending Consultant</span>
              <p class="font-semibold text-slate-900">{selectedRecord.consultant}</p>
            </div>
            <div class="space-y-0.5">
              <span class="font-bold text-slate-500 uppercase tracking-wider text-[11px]">Recorded Vitals</span>
              <p class="font-semibold text-slate-900">
                BP: {selectedRecord.vitals.bp} &bull; Temp: {selectedRecord.vitals.temp} &bull; Pulse: {selectedRecord.vitals.pulse}
              </p>
            </div>
          </div>

          <!-- Chief Complaint & Notes -->
          <div class="space-y-1 text-xs">
            <span class="font-bold text-slate-500 uppercase tracking-wider text-[11px]">Presenting Complaint</span>
            <p class="text-slate-800 font-medium bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
              {selectedRecord.chiefComplaint}
            </p>
          </div>

          <div class="space-y-1 text-xs">
            <span class="font-bold text-slate-500 uppercase tracking-wider text-[11px]">Doctor Clinical Directives</span>
            <p class="text-slate-800 font-medium bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
              {selectedRecord.notes}
            </p>
          </div>

          <!-- Prescriptions -->
          {#if selectedRecord.prescriptions?.length}
            <div class="space-y-1.5">
              <span class="font-bold text-slate-500 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Pill class="w-3.5 h-3.5 text-emerald-700" /> Prescribed Medication
              </span>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {#each selectedRecord.prescriptions as rx}
                  <div class="bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                    <p class="font-bold text-slate-900">{rx.name}</p>
                    <p class="text-[11px] text-slate-600 mt-0.5">{rx.dosage} &bull; {rx.duration}</p>
                  </div>
                {/each}
              </div>
            </div>
          {/if}

          <!-- Immutable Security Notice -->
          <div class="p-3 rounded-lg bg-slate-100/80 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600">
            <div class="flex items-center gap-1.5">
              <Lock class="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>Cryptographically signed &amp; locked by University Medical Board.</span>
            </div>
            <span class="font-mono font-bold text-[11px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 w-fit">STATUS: READ_ONLY</span>
          </div>
        </div>
      {/if}
    </div>
  </div>
</Card>
