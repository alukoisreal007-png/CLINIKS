<script>
  import { createEventDispatcher, onMount, onDestroy } from 'svelte';
  import { Mic, MicOff } from 'lucide-svelte';

  export let isListening = false;
  export let label = 'Voice Dictation';
  export let id = `mic-switch-${Math.random().toString(36).slice(2, 8)}`;
  export let className = '';

  const dispatch = createEventDispatcher();
  let recognition = null;
  let isSupported = false;
  let errorMessage = '';

  let pendingInterim = '';

  onMount(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      isSupported = true;
      try {
        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
          let finalChunk = '';
          pendingInterim = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const res = event.results[i];
            if (res.isFinal) {
              finalChunk += res[0].transcript + ' ';
            } else {
              pendingInterim += res[0].transcript;
            }
          }
          if (finalChunk.trim()) {
            dispatch('transcript', { text: finalChunk.trim() });
          }
        };

        recognition.onerror = (event) => {
          console.warn('Speech recognition error:', event.error);
          isListening = false;
          if (event.error === 'not-allowed') {
            errorMessage = 'Microphone permission blocked. Please allow mic in browser settings.';
          } else {
            errorMessage = `Voice input error: ${event.error}`;
          }
          dispatch('error', { message: errorMessage });
        };

        recognition.onend = () => {
          isListening = false;
          if (pendingInterim.trim()) {
            dispatch('transcript', { text: pendingInterim.trim() });
            pendingInterim = '';
          }
          dispatch('end');
        };
      } catch (err) {
        console.error('Failed to init speech recognition:', err);
        isSupported = false;
      }
    }
  });

  onDestroy(() => {
    if (recognition && isListening) {
      try {
        recognition.stop();
      } catch (e) {}
    }
  });

  function toggleListening() {
    errorMessage = '';
    if (!isSupported) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome, Edge, or Safari.');
      isListening = false;
      return;
    }

    if (isListening) {
      try {
        recognition.stop();
      } catch (e) {}
      isListening = false;
      dispatch('end');
    } else {
      try {
        recognition.start();
        isListening = true;
        dispatch('start');
      } catch (err) {
        console.error('Start recognition error:', err);
      }
    }
  }
</script>

<div class="inline-flex items-center gap-3 {className}">
  <input 
    type="checkbox" 
    {id} 
    class="uiverse-checkbox" 
    checked={isListening} 
    on:change={toggleListening} 
  />
  <label 
    class="switch" 
    for={id} 
    title={isSupported ? (isListening ? 'Microphone active (click to stop)' : 'Microphone idle (click to dictate)') : 'Speech recognition not supported'}
  >
    <div class="mic-on">
      <Mic class="w-5 h-5 text-white" />
    </div>
    <div class="mic-off">
      <MicOff class="w-5 h-5 text-white" />
    </div>
  </label>

  {#if label}
    <div class="text-left select-none">
      <span class="text-xs font-black {isListening ? 'text-rose-600 animate-pulse' : 'text-slate-800'}">
        {isListening ? 'Listening (Tap to stop)...' : label}
      </span>
      {#if isListening}
        <p class="text-[11px] text-slate-500 font-medium">Speak symptoms clearly into mic</p>
      {/if}
    </div>
  {/if}
</div>

<style>
  /* From Uiverse.io by sahilxkhadka */
  .switch {
    position: relative;
    width: 44px;
    height: 44px;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgb(60, 64, 67);
    color: #fff;
    border-radius: 50%;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
    flex-shrink: 0;
  }

  .mic-on, .mic-off {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.3s ease-in-out;
  }

  .mic-on {
    z-index: 4;
  }

  .mic-off {
    position: absolute;
    inset: 0;
    z-index: 5;
    opacity: 0;
  }

  .switch:hover {
    background-color: rgba(60, 64, 67, 0.85);
  }

  .uiverse-checkbox {
    display: none;
  }

  .uiverse-checkbox:checked + .switch {
    background-color: #dc2626;
    box-shadow: 0 0 16px rgba(220, 38, 38, 0.55);
  }

  .uiverse-checkbox:checked + .switch .mic-off {
    opacity: 1;
  }

  .uiverse-checkbox:active + .switch {
    scale: 1.2;
  }
</style>
