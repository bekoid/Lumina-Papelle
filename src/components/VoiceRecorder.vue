<template>
  <div class="voice-recorder-container">
    <!-- Active Recording Bar or Trigger Button -->
    <div class="record-control-bar">
      <template v-if="isRecording">
        <div class="recording-indicator">
          <span class="pulsing-red-dot"></span>
          <span class="recording-time">{{ formattedRecordTime }}</span>
          <span class="recording-label">Kayıt Alınıyor...</span>
        </div>
        <button class="voice-btn stop-btn" @click="stopRecording" title="Kaydı Bitir">
          <Square :size="14" />
          <span>Durdur & Kaydet</span>
        </button>
      </template>

      <template v-else>
        <button type="button" class="voice-btn start-btn" @click="startRecording" title="Derste / Toplantıda Ses Kaydı Al">
          <Mic :size="15" />
          <span>Ses Kaydet</span>
        </button>
        <span v-if="micError" class="mic-error-pill" @click="micError = ''">
          {{ micError }} &times;
        </span>
      </template>
    </div>

    <!-- List of Saved Voice Memos -->
    <div v-if="memos && memos.length > 0" class="memos-list">
      <div v-for="memo in memos" :key="memo.id" class="memo-item">
        <button class="play-btn" @click="togglePlay(memo)">
          <component :is="activePlayingId === memo.id ? Pause : Play" :size="14" />
        </button>
        <div class="memo-meta">
          <span class="memo-date">{{ memo.date }}</span>
          <span class="memo-duration">{{ memo.duration }} sn</span>
        </div>
        <button class="memo-delete-btn" @click="$emit('delete', memo.id)" title="Ses Kaydını Sil">
          &times;
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue';
import { Mic, Square, Play, Pause } from '@lucide/vue';

const props = defineProps({
  memos: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['add-memo', 'delete']);

const isRecording = ref(false);
const recordSeconds = ref(0);
const activePlayingId = ref(null);
const micError = ref('');
let mediaRecorder = null;
let audioChunks = [];
let recordTimer = null;
let currentAudio = null;

const formattedRecordTime = computed(() => {
  const m = Math.floor(recordSeconds.value / 60);
  const s = recordSeconds.value % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
});

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunks = [];
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) audioChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Audio = reader.result;
        emit('add-memo', {
          id: `memo_${Date.now()}`,
          data: base64Audio,
          duration: recordSeconds.value,
          date: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
        });
      };
      reader.readAsDataURL(audioBlob);

      // Stop media tracks
      stream.getTracks().forEach(track => track.stop());
    };

    mediaRecorder.start();
    isRecording.value = true;
    recordSeconds.value = 0;
    recordTimer = setInterval(() => {
      recordSeconds.value++;
    }, 1000);
  } catch (err) {
    micError.value = 'Mikrofon bulunamadı veya izin verilmedi';
    console.error(err);
  }
}

function stopRecording() {
  if (mediaRecorder && isRecording.value) {
    mediaRecorder.stop();
    isRecording.value = false;
    clearInterval(recordTimer);
  }
}

function togglePlay(memo) {
  if (activePlayingId.value === memo.id) {
    if (currentAudio) {
      currentAudio.pause();
      activePlayingId.value = null;
    }
    return;
  }

  if (currentAudio) {
    currentAudio.pause();
  }

  currentAudio = new Audio(memo.data);
  activePlayingId.value = memo.id;
  currentAudio.play();

  currentAudio.onended = () => {
    activePlayingId.value = null;
  };
}

onBeforeUnmount(() => {
  clearInterval(recordTimer);
  if (currentAudio) currentAudio.pause();
});
</script>

<style scoped>
.voice-recorder-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.record-control-bar {
  display: flex;
  align-items: center;
  gap: 8px;
}

.voice-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--border-color, #e2e8f0);
  background: var(--bg-surface, white);
  color: var(--color-text-main, #0f172a);
  transition: all 0.15s ease;
}

.start-btn:hover {
  background: #fef2f2;
  border-color: #f87171;
  color: #dc2626;
}

.stop-btn {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

.recording-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #dc2626;
}

.pulsing-red-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #dc2626;
  animation: pulse 1s infinite alternate;
}

@keyframes pulse {
  from { transform: scale(0.85); opacity: 0.6; }
  to { transform: scale(1.25); opacity: 1; }
}

/* Memos List */
.memos-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.memo-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-surface, white);
  border: 1px solid var(--border-color, #e2e8f0);
  padding: 4px 10px;
  border-radius: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.play-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: #2563eb;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.1s ease;
}

.play-btn:hover {
  transform: scale(1.1);
}

.memo-meta {
  display: flex;
  flex-direction: column;
  font-size: 10px;
  color: var(--color-text-muted, #64748b);
  line-height: 1.2;
}

.memo-date {
  font-weight: 600;
  color: var(--color-text-main, #0f172a);
}

.memo-delete-btn {
  background: transparent;
  border: none;
  font-size: 16px;
  color: #94a3b8;
  cursor: pointer;
  line-height: 1;
}

.memo-delete-btn:hover {
  color: #ef4444;
}

.mic-error-pill {
  font-size: 11px;
  font-weight: 600;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
  padding: 3px 9px;
  border-radius: 99px;
  cursor: pointer;
}
</style>
