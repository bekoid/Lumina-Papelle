<template>
  <div v-if="attachments && attachments.length > 0" class="attachments-container">
    <div class="attachments-header">
      <div class="header-title">
        <Paperclip :size="15" class="clip-icon" />
        <span>Ekli Dosyalar ({{ attachments.length }})</span>
      </div>
      <span class="header-hint">İndirmek veya açmak için dosyaya tıklayın</span>
    </div>

    <div class="attachments-grid">
      <div 
        v-for="file in attachments" 
        :key="file.id"
        class="file-card"
        :class="`type-${file.ext}`"
        @click="downloadFile(file)"
        :title="`${file.name} - İndir / Aç`"
      >
        <div class="file-icon-box" :style="{ backgroundColor: getFileColor(file.ext).bg, color: getFileColor(file.ext).color }">
          <component :is="getFileIcon(file.ext)" :size="20" />
          <span class="ext-badge">{{ file.ext.toUpperCase() }}</span>
        </div>

        <div class="file-details">
          <div class="file-name" :title="file.name">{{ file.name }}</div>
          <div class="file-meta">
            <span class="file-size">{{ file.size }}</span>
          </div>
        </div>

        <div class="file-actions" @click.stop>
          <button class="file-action-btn download-btn" @click.stop="downloadFile(file)" title="Dosyayı İndir">
            <Download :size="15" />
          </button>
          <button class="file-action-btn delete-btn" @click.stop="$emit('delete', file.id)" title="Eki Kaldır">
            <X :size="15" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Paperclip, Download, X, FileText, FileSpreadsheet, File } from '@lucide/vue';

const props = defineProps({
  attachments: {
    type: Array,
    default: () => []
  }
});

defineEmits(['delete']);

function getFileIcon(ext) {
  const e = (ext || '').toLowerCase();
  if (['xls', 'xlsx', 'csv'].includes(e)) return FileSpreadsheet;
  if (['doc', 'docx', 'pdf', 'txt', 'rtf'].includes(e)) return FileText;
  return File;
}

function getFileColor(ext) {
  const e = (ext || '').toLowerCase();
  if (e === 'pdf') return { bg: '#FEF2F2', color: '#DC2626' }; // Red
  if (['doc', 'docx'].includes(e)) return { bg: '#EFF6FF', color: '#2563EB' }; // Blue
  if (['xls', 'xlsx', 'csv'].includes(e)) return { bg: '#ECFDF5', color: '#059669' }; // Green
  if (['ppt', 'pptx'].includes(e)) return { bg: '#FFF7ED', color: '#EA580C' }; // Orange
  return { bg: '#F1F5F9', color: '#475569' }; // Gray
}

function downloadFile(file) {
  if (!file.data) return;
  const link = document.createElement('a');
  link.href = file.data;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
</script>

<style scoped>
.attachments-container {
  margin-bottom: 24px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 14px 18px;
}

.attachments-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}

.clip-icon {
  color: #64748b;
}

.header-hint {
  font-size: 11px;
  color: #94a3b8;
}

.attachments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 10px;
}

.file-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 12px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.file-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  border-color: #cbd5e1;
}

.file-icon-box {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
}

.ext-badge {
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.5px;
  margin-top: -2px;
}

.file-details {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.file-name {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.file-meta {
  font-size: 11px;
  color: #64748b;
}

.file-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.file-action-btn {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.file-action-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.delete-btn:hover {
  background: #fef2f2;
  color: #ef4444;
}

.download-btn:hover {
  background: #eff6ff;
  color: #2563eb;
}
</style>
