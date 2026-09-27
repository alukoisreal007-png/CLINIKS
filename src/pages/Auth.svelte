<script>
  import { clinicStore } from '../stores/clinicStore.js';
  import { 
    Activity, 
    User, 
    Stethoscope, 
    ArrowRight, 
    ShieldCheck, 
    Check,
    Sparkles,
    FileText,
    HelpCircle
  } from 'lucide-svelte';

  $: if ($clinicStore.authRole) {
    role = $clinicStore.authRole;
  }

  let role = $clinicStore.authRole || 'PATIENT'; // 'PATIENT' | 'CLINICIAN'
  let rememberLogin = true;

  // OPD Patient Form fields
  let patientName = '';
  let hospitalCardNo = '';
  let age = '';
  let gender = 'Prefer not to say';

  // Clinician Form fields
  let clinicianName = '';
  let staffId = '';
  let clinicianOffice = '';
  let password = '';

  const genders = ['Male', 'Female', 'Prefer not to say'];

  function handleQuickPatientDemo() {
    role = 'PATIENT';
    patientName = 'Adaeze Okonkwo';
    hospitalCardNo = 'GH-2024-00831';
    age = '24';
    gender = 'Female';
  }

  function handleQuickClinicianDemo() {
    role = 'CLINICIAN';
    clinicianName = 'Dr. Stella Adeleke (FWACP)';
    staffId = 'MED-CONSULT-104';
    clinicianOffice = 'OPD Wing A - Suite 4';
    password = 'demo-secure-pin';
  }

  function handleSubmit() {
    if (role === 'PATIENT') {
      if (!patientName.trim() || !hospitalCardNo.trim()) {
        alert('Please enter your full name and hospital card number to continue.');
        return;
      }

      clinicStore.loginAsPatient({
        name: patientName,
        hospitalCardNo: hospitalCardNo,
        age: age,
        gender: gender
      });
    } else {
      if (!clinicianName.trim() || !staffId.trim() || !password.trim()) {
        alert('Please enter your Consultant Physician Name, Staff Medical ID, and PIN.');
        return;
      }

      clinicStore.loginAsClinician({
        name: clinicianName,
        staffId: staffId,
        office: clinicianOffice || 'OPD Consultation Wing'
      });
    }
  }
</script>

<!-- Full-bleed warm neutral canvas matching WOMAN.jpg (#ECECE8) -->
<div class="min-h-[calc(100vh-4.5rem)] bg-[#ECECE8] flex items-center justify-center p-3 sm:p-6 lg:p-10 selection:bg-[#5D3EB0] selection:text-white">
  
  <!-- Central Rounded Floating Card -->
  <div class="bg-white rounded-[28px] sm:rounded-[40px] shadow-2xl shadow-stone-900/10 border border-stone-200/80 overflow-hidden max-w-5xl w-full p-3 sm:p-5 lg:p-6">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
      
      <!-- LEFT COLUMN: Botanical Artwork Frame (from WOMAN.jpg) -->
      <div class="lg:col-span-5 flex flex-col">
        <div class="relative w-full h-64 sm:h-80 lg:h-full min-h-[260px] lg:min-h-[580px] rounded-[22px] sm:rounded-[32px] overflow-hidden bg-[#D8D8D2] shadow-inner group">
          <img 
            src="/images/woman-art.jpg" 
            alt="CLINIKS Patient Care Artwork" 
            class="w-full h-full object-cover object-center group-hover:scale-102 transition-transform duration-700 ease-out" 
          />
          
          <!-- Subtle Floating Glass Badge on Mobile / Tablet -->
          <div class="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 bg-white/75 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-white/60 shadow-xs flex items-center justify-between text-xs text-stone-700">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span class="font-semibold text-stone-900">OPD Pre-Triage Active</span>
            </div>
            <span class="text-[11px] text-stone-500 font-mono">GH-SYS-v2.4</span>
          </div>
        </div>
      </div>

      <!-- RIGHT COLUMN: Authentication & Screening Form -->
      <div class="lg:col-span-7 flex flex-col justify-center px-2 sm:px-6 lg:px-8 py-4 sm:py-6">
        
        <!-- Brand Emblem & Logo matching WOMAN.jpg style -->
        <div class="flex items-center justify-center gap-2.5 mb-2">
          <!-- 8-petal geometric star / medical emblem -->
          <div class="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center text-white shadow-xs">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="3.5"/>
              <circle cx="12" cy="4" r="2.2"/>
              <circle cx="12" cy="20" r="2.2"/>
              <circle cx="4" cy="12" r="2.2"/>
              <circle cx="20" cy="12" r="2.2"/>
              <circle cx="6.3" cy="6.3" r="2.2"/>
              <circle cx="17.7" cy="17.7" r="2.2"/>
              <circle cx="6.3" cy="17.7" r="2.2"/>
              <circle cx="17.7" cy="6.3" r="2.2"/>
            </svg>
          </div>
          <span class="text-xl font-black tracking-tight text-slate-950 uppercase font-sans">CLINIKS</span>
        </div>

        <!-- Heading & Subtitle -->
        <div class="text-center mb-5">
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {role === 'PATIENT' ? 'Login to your account' : 'Clinician Station Access'}
          </h1>
          <p class="text-xs sm:text-sm text-slate-400 font-normal mt-1.5 max-w-sm mx-auto">
            {role === 'PATIENT' 
              ? 'Welcome back! Enter your details to start your pre-consultation' 
              : 'Enter your hospital medical license credentials to access triage queue'}
          </p>
        </div>

        <!-- Role Toggle Pill Switcher -->
        <div class="grid grid-cols-2 p-1 bg-stone-100 rounded-full border border-stone-200/90 text-xs font-semibold mb-5 max-w-xs mx-auto w-full">
          <button
            type="button"
            on:click={() => role = 'PATIENT'}
            class="py-2 px-3 rounded-full transition-all cursor-pointer flex items-center justify-center gap-1.5
              {role === 'PATIENT' 
                ? 'bg-[#5D3EB0] text-white shadow-xs font-bold' 
                : 'text-slate-600 hover:text-slate-900'}"
          >
            <User class="w-3.5 h-3.5" />
            <span>Patient</span>
          </button>

          <button
            type="button"
            on:click={() => role = 'CLINICIAN'}
            class="py-2 px-3 rounded-full transition-all cursor-pointer flex items-center justify-center gap-1.5
              {role === 'CLINICIAN' 
                ? 'bg-[#5D3EB0] text-white shadow-xs font-bold' 
                : 'text-slate-600 hover:text-slate-900'}"
          >
            <Stethoscope class="w-3.5 h-3.5" />
            <span>Clinician</span>
          </button>
        </div>

        <!-- FORM -->
        <form on:submit|preventDefault={handleSubmit} class="space-y-3.5 max-w-md mx-auto w-full">
          {#if role === 'PATIENT'}
            <!-- Patient Full Name -->
            <div>
              <label for="patientName" class="text-xs font-semibold text-slate-500 mb-1 ml-4 block">
                Full Name
              </label>
              <input
                id="patientName"
                type="text"
                bind:value={patientName}
                required
                placeholder="Enter your full name"
                class="w-full px-5 py-3 rounded-full border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#5D3EB0] focus:ring-2 focus:ring-[#5D3EB0]/15 transition-all"
              />
            </div>

            <!-- Hospital Card Number -->
            <div>
              <div class="flex items-center justify-between mb-1 ml-4 mr-2">
                <label for="hospitalCardNo" class="text-xs font-semibold text-slate-500">
                  Hospital Card / Folder Number
                </label>
                <span class="text-[10px] text-slate-400 font-mono">On registration card</span>
              </div>
              <input
                id="hospitalCardNo"
                type="text"
                bind:value={hospitalCardNo}
                required
                placeholder="e.g. GH-2024-00831"
                class="w-full px-5 py-3 rounded-full border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#5D3EB0] focus:ring-2 focus:ring-[#5D3EB0]/15 transition-all font-mono"
              />
            </div>

            <!-- Age & Gender in 2 balanced pill inputs -->
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label for="age" class="text-xs font-semibold text-slate-500 mb-1 ml-4 block">
                  Age
                </label>
                <input
                  id="age"
                  type="number"
                  bind:value={age}
                  placeholder="e.g. 28"
                  min="1"
                  max="120"
                  class="w-full px-5 py-3 rounded-full border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#5D3EB0] focus:ring-2 focus:ring-[#5D3EB0]/15 transition-all"
                />
              </div>

              <div>
                <label for="gender" class="text-xs font-semibold text-slate-500 mb-1 ml-4 block">
                  Gender
                </label>
                <select
                  id="gender"
                  bind:value={gender}
                  class="w-full px-4 py-3 rounded-full border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:border-[#5D3EB0] focus:ring-2 focus:ring-[#5D3EB0]/15 transition-all cursor-pointer font-medium"
                >
                  {#each genders as g}
                    <option value={g}>{g}</option>
                  {/each}
                </select>
              </div>
            </div>

          {:else}
            <!-- CLINICIAN FORM -->
            <div>
              <label for="clinicianName" class="text-xs font-semibold text-slate-500 mb-1 ml-4 block">
                Consultant / Physician Name
              </label>
              <input
                id="clinicianName"
                type="text"
                bind:value={clinicianName}
                required
                placeholder="e.g. Dr. Stella Adeleke (MBBS, FWACP)"
                class="w-full px-5 py-3 rounded-full border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#5D3EB0] focus:ring-2 focus:ring-[#5D3EB0]/15 transition-all"
              />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label for="staffId" class="text-xs font-semibold text-slate-500 mb-1 ml-4 block">
                  Staff Medical ID
                </label>
                <input
                  id="staffId"
                  type="text"
                  bind:value={staffId}
                  required
                  placeholder="e.g. MED-CONSULT-104"
                  class="w-full px-5 py-3 rounded-full border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#5D3EB0] focus:ring-2 focus:ring-[#5D3EB0]/15 transition-all font-mono"
                />
              </div>

              <div>
                <label for="password" class="text-xs font-semibold text-slate-500 mb-1 ml-4 block">
                  Staff Passkey / PIN
                </label>
                <input
                  id="password"
                  type="password"
                  bind:value={password}
                  required
                  placeholder="••••••••••••"
                  class="w-full px-5 py-3 rounded-full border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#5D3EB0] focus:ring-2 focus:ring-[#5D3EB0]/15 transition-all"
                />
              </div>
            </div>

            <div>
              <label for="clinicianOffice" class="text-xs font-semibold text-slate-500 mb-1 ml-4 block">
                Assigned OPD Suite / Consulting Room
              </label>
              <input
                id="clinicianOffice"
                type="text"
                bind:value={clinicianOffice}
                placeholder="e.g. OPD Wing A - Room 4"
                class="w-full px-5 py-3 rounded-full border border-slate-200 bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#5D3EB0] focus:ring-2 focus:ring-[#5D3EB0]/15 transition-all"
              />
            </div>
          {/if}

          <!-- Options row matching WOMAN.jpg: Remember login + Forget Password -->
          <div class="flex items-center justify-between pt-1 px-2 text-xs">
            <label class="flex items-center gap-2 text-slate-500 cursor-pointer select-none">
              <input 
                type="checkbox" 
                bind:checked={rememberLogin}
                class="w-4 h-4 rounded border-slate-300 text-[#5D3EB0] focus:ring-[#5D3EB0]" 
              />
              <span>Remember login</span>
            </label>

            <button 
              type="button" 
              class="text-[#5D3EB0] font-semibold hover:underline cursor-pointer"
              on:click={() => alert(role === 'PATIENT' ? 'Please present your national ID or name at the OPD records desk to retrieve your folder card number.' : 'Please contact the Hospital IT Administrator to reset your clinical staff PIN.')}
            >
              {role === 'PATIENT' ? 'Forgot Card No?' : 'Forgot Passkey?'}
            </button>
          </div>

          <!-- Primary Submit Pill Button (Purple #5D3EB0 matching WOMAN.jpg) -->
          <div class="pt-2">
            <button
              type="submit"
              class="w-full py-3.5 px-6 rounded-full bg-[#5D3EB0] hover:bg-[#4E319A] text-white font-bold text-sm sm:text-base tracking-wide shadow-md shadow-[#5D3EB0]/25 hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{role === 'PATIENT' ? 'Begin Pre-Consultation' : 'Access Clinician Hub'}</span>
              <ArrowRight class="w-4 h-4" />
            </button>
          </div>

          <!-- Divider matching WOMAN.jpg ("Or continue with") -->
          <div class="relative my-5 text-center">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-slate-200"></div>
            </div>
            <span class="relative bg-white px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Or continue with demo
            </span>
          </div>

          <!-- Secondary Pill Buttons matching WOMAN.jpg Apple & Google button styling -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              on:click={handleQuickPatientDemo}
              class="w-full py-2.5 px-4 rounded-full bg-[#F3F4F6] hover:bg-[#E5E7EB] text-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer border border-transparent hover:border-slate-300/60"
            >
              <User class="w-3.5 h-3.5 text-[#5D3EB0]" />
              <span>Fill Patient Demo</span>
            </button>

            <button
              type="button"
              on:click={handleQuickClinicianDemo}
              class="w-full py-2.5 px-4 rounded-full bg-[#F3F4F6] hover:bg-[#E5E7EB] text-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer border border-transparent hover:border-slate-300/60"
            >
              <Stethoscope class="w-3.5 h-3.5 text-[#5D3EB0]" />
              <span>Fill Clinician Demo</span>
            </button>
          </div>

          <!-- Footer Walk-in Note -->
          <div class="text-center pt-3 text-xs text-slate-400">
            <span>Walk-in with no card? </span>
            <button 
              type="button" 
              class="text-[#5D3EB0] font-semibold cursor-pointer hover:underline bg-transparent border-0 p-0 inline" 
              on:click={() => alert('The OPD records desk can issue a temporary folder number and assist with intake on your behalf.')}
            >
              Register at OPD Desk
            </button>
          </div>
        </form>

      </div>

    </div>
  </div>

</div>
