<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-card" @click.stop>
      <div class="modal-header">
        <div class="title-group">
          <h3>🎨 Washi Tape & Çıkartma Albümü</h3>
          <p>Defterine eklemek için bant veya şeffaf çıkartmaya tıkla</p>
        </div>
        <button type="button" class="close-btn" @click="$emit('close')" title="Kapat (ESC)">&times;</button>
      </div>

      <!-- Tab Switcher -->
      <div class="tabs-nav">
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'tapes' }"
          @click="activeTab = 'tapes'"
        >
          <span>📏 Washi Bantlar</span>
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'stickers' }"
          @click="activeTab = 'stickers'"
        >
          <span>✨ Şeffaf Çıkartmalar</span>
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: activeTab === 'stamps' }"
          @click="activeTab = 'stamps'"
        >
          <span>🏷️ Vintage Kaşeler & Balmumu Mühür</span>
        </button>
      </div>

      <div class="modal-body">
        <!-- TAB 1: Washi Tapes -->
        <div v-if="activeTab === 'tapes'" class="tab-content">
          <p class="tab-tip">💡 İpucu: Washi bantları sayfanın istediğin yerine yapıştırabilir, üzerine tıklayarak altındaki yazıyı <strong>gizleyip açabilirsin</strong> (Çalışma / Hafıza Modu).</p>
          <div class="tape-grid">
            <div 
              v-for="tape in washiTapes" 
              :key="tape.id"
              class="washi-tape-preview-card"
              @click="pickTape(tape)"
              :title="`${tape.name} ekle`"
            >
              <div class="tape-serrated-preview" :style="getTapePreviewStyle(tape)">
                <span class="preview-label">{{ tape.name }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB 2: Transparent Stickers -->
        <div v-if="activeTab === 'stickers'" class="tab-content">
          <p class="tab-tip">✨ Çıkartmalar arkası şeffaf olarak sayfaya eklenir. Serbestçe sürükleyebilir ve köşesinden boyutlandırabilirsin.</p>
          <div class="stickers-grid">
            <button 
              v-for="stk in stickerList" 
              :key="stk.id"
              class="sticker-grid-btn"
              @click="pickSticker(stk)"
              :title="stk.name"
            >
              <div class="sticker-img-box">
                <img :src="stk.src" :alt="stk.name" class="sticker-thumb" />
              </div>
              <span class="sticker-grid-name">{{ stk.name }}</span>
            </button>
          </div>
        </div>

        <!-- TAB 3: Vintage Wax Seals & Rubber Stamps -->
        <div v-if="activeTab === 'stamps'" class="tab-content">
          <p class="tab-tip">🏷️ Kaşeler ve mühürler tıpkı gerçek mürekkep damgası gibi hafif eğik ve dokulu olarak sayfaya basılır.</p>
          <div class="stickers-grid stamps-grid">
            <button 
              v-for="stmp in stampList" 
              :key="stmp.id"
              class="sticker-grid-btn stamp-btn"
              @click="pickStamp(stmp)"
              :title="stmp.name"
            >
              <div class="sticker-img-box">
                <img :src="stmp.src" :alt="stmp.name" class="sticker-thumb" />
              </div>
              <span class="sticker-grid-name">{{ stmp.name }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { playStampSound } from '../composables/useGamification.js';

const props = defineProps({
  initialTab: {
    type: String,
    default: 'tapes'
  }
});

const emit = defineEmits(['close', 'select-sticker', 'select-tape']);

const activeTab = ref(props.initialTab || 'tapes');

const washiTapes = [
  {
    id: 'tape_pastel_pink',
    name: 'Gül Pembesi Çizgili',
    pattern: 'tape_pastel_pink',
    css: 'repeating-linear-gradient(45deg, #FDA4AF, #FDA4AF 10px, #FFF1F2 10px, #FFF1F2 20px)'
  },
  {
    id: 'tape_mint_grid',
    name: 'Pastel Nane Izgara',
    pattern: 'tape_mint_grid',
    css: 'repeating-linear-gradient(0deg, #A7F3D0, #A7F3D0 1.5px, transparent 1.5px, transparent 12px), repeating-linear-gradient(90deg, #A7F3D0, #A7F3D0 1.5px, #ECFDF5 1.5px, #ECFDF5 12px)'
  },
  {
    id: 'tape_gold_dots',
    name: 'Altın Puantiyeli',
    pattern: 'tape_gold_dots',
    css: 'radial-gradient(#F59E0B 22%, transparent 23%), radial-gradient(#F59E0B 22%, #FEF3C7 23%)'
  },
  {
    id: 'tape_sky_gradient',
    name: 'Gökyüzü İpek Gradyan',
    pattern: 'tape_sky_gradient',
    css: 'linear-gradient(90deg, #BAE6FD, #C7D2FE)'
  },
  {
    id: 'tape_lavender_floral',
    name: 'Lavanta Gece Çizgisi',
    pattern: 'tape_lavender_floral',
    css: 'repeating-linear-gradient(135deg, #DDD6FE, #DDD6FE 8px, #FAF5FF 8px, #FAF5FF 16px)'
  },
  {
    id: 'tape_caution_yellow',
    name: 'Dikkat Sarı / Amber',
    pattern: 'tape_caution_yellow',
    css: 'repeating-linear-gradient(-45deg, #FDE047, #FDE047 12px, #EAB308 12px, #EAB308 24px)'
  },
  {
    id: 'tape_vintage_kraft',
    name: 'Vintage Kraft Şerit',
    pattern: 'tape_vintage_kraft',
    css: 'repeating-linear-gradient(90deg, #D97706, #D97706 6px, #B45309 6px, #B45309 12px)'
  },
  {
    id: 'tape_sakura_bloom',
    name: 'Sakura Çiçek Pembesi',
    pattern: 'tape_sakura_bloom',
    css: 'repeating-linear-gradient(45deg, #FBCFE8, #FBCFE8 12px, #FCE7F3 12px, #FCE7F3 24px)'
  }
];

function getTapePreviewStyle(tape) {
  const style = { background: tape.css };
  if (tape.id === 'tape_gold_dots') {
    style.backgroundSize = '14px 14px';
    style.backgroundColor = '#FEF3C7';
  }
  return style;
}

// Generate high resolution, clean transparent SVG vector stickers
function svgToDataUri(svgString) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
}

const stickerList = [
  {
    id: 'stk_pin',
    name: 'Kırmızı Raptiye',
    src: svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <defs>
          <radialGradient id="pinHead" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stop-color="#FF6B6B"/>
            <stop offset="60%" stop-color="#E11D48"/>
            <stop offset="100%" stop-color="#881337"/>
          </radialGradient>
          <linearGradient id="needle" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#E2E8F0"/>
            <stop offset="50%" stop-color="#94A3B8"/>
            <stop offset="100%" stop-color="#475569"/>
          </linearGradient>
          <filter id="pinShadow" x="-20%" y="-20%" width="150%" height="150%">
            <feDropShadow dx="3" dy="6" stdDeviation="4" flood-color="#000000" flood-opacity="0.3"/>
          </filter>
        </defs>
        <g filter="url(#pinShadow)">
          <!-- Needle -->
          <polygon points="50,45 68,92 53,52" fill="url(#needle)"/>
          <!-- Needle highlight -->
          <line x1="51" y1="48" x2="66" y2="88" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
          <!-- Round pin head -->
          <circle cx="44" cy="38" r="22" fill="url(#pinHead)"/>
          <!-- Inner ring groove -->
          <ellipse cx="44" cy="38" rx="14" ry="14" fill="none" stroke="#FDA4AF" stroke-width="2" opacity="0.4"/>
          <!-- Gloss highlight shine -->
          <ellipse cx="37" cy="30" rx="7" ry="4" fill="#FFFFFF" opacity="0.8" transform="rotate(-30 37 30)"/>
        </g>
      </svg>
    `)
  },
  {
    id: 'stk_star',
    name: 'Altın Yıldız',
    src: svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <defs>
          <linearGradient id="goldStar" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FDE047"/>
            <stop offset="50%" stop-color="#EAB308"/>
            <stop offset="100%" stop-color="#CA8A04"/>
          </linearGradient>
          <filter id="starShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="5" stdDeviation="3.5" flood-color="#000" flood-opacity="0.25"/>
          </filter>
        </defs>
        <g filter="url(#starShadow)">
          <path d="M 50 10 L 61.8 34 L 88.3 37.8 L 69.1 56.5 L 73.6 82.9 L 50 70.5 L 26.4 82.9 L 30.9 56.5 L 11.7 37.8 L 38.2 34 Z" 
                fill="url(#goldStar)" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round"/>
          <!-- 3D Bevel inner highlight -->
          <path d="M 50 15 L 50 70 L 61.8 34 Z" fill="#FEF08A" opacity="0.5"/>
          <circle cx="50" cy="45" r="5" fill="#FFFFFF" opacity="0.6"/>
        </g>
      </svg>
    `)
  },
  {
    id: 'stk_lightbulb',
    name: 'Parlak Fikir',
    src: svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <defs>
          <radialGradient id="bulbGlow" cx="45%" cy="40%" r="60%">
            <stop offset="0%" stop-color="#FEF08A"/>
            <stop offset="60%" stop-color="#FACC15"/>
            <stop offset="100%" stop-color="#EAB308"/>
          </radialGradient>
          <filter id="glow">
            <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#CA8A04" flood-opacity="0.3"/>
          </filter>
        </defs>
        <g filter="url(#glow)">
          <!-- Glass Bulb -->
          <path d="M 32 45 C 32 30 40 20 50 20 C 60 20 68 30 68 45 C 68 54 62 60 60 65 L 40 65 C 38 60 32 54 32 45 Z" fill="url(#bulbGlow)" stroke="#FFFFFF" stroke-width="2.5"/>
          <!-- Metallic Base -->
          <rect x="42" y="67" width="16" height="4" rx="2" fill="#94A3B8"/>
          <rect x="43" y="73" width="14" height="4" rx="2" fill="#64748B"/>
          <rect x="45" y="79" width="10" height="4" rx="2" fill="#475569"/>
          <!-- Filament inside -->
          <path d="M 45 48 Q 50 40 55 48" fill="none" stroke="#CA8A04" stroke-width="2.5" stroke-linecap="round"/>
          <!-- Shine highlight -->
          <ellipse cx="40" cy="33" rx="5" ry="8" fill="#FFFFFF" opacity="0.75" transform="rotate(-25 40 33)"/>
        </g>
      </svg>
    `)
  },
  {
    id: 'stk_target',
    name: 'Hedef & Odak',
    src: svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <defs>
          <filter id="tgtShd">
            <feDropShadow dx="2" dy="4" stdDeviation="3.5" flood-color="#000" flood-opacity="0.2"/>
          </filter>
        </defs>
        <g filter="url(#tgtShd)">
          <!-- Outer red ring -->
          <circle cx="50" cy="50" r="42" fill="#EF4444" stroke="#FFFFFF" stroke-width="3"/>
          <!-- White ring -->
          <circle cx="50" cy="50" r="30" fill="#FFFFFF"/>
          <!-- Middle red ring -->
          <circle cx="50" cy="50" r="20" fill="#EF4444"/>
          <!-- Bullseye center -->
          <circle cx="50" cy="50" r="10" fill="#FFFFFF"/>
          <circle cx="50" cy="50" r="4" fill="#B91C1C"/>
          <!-- Gloss reflection -->
          <path d="M 20 35 A 40 40 0 0 1 70 20 A 42 42 0 0 0 20 35 Z" fill="#FFFFFF" opacity="0.4"/>
        </g>
      </svg>
    `)
  },
  {
    id: 'stk_fire',
    name: 'Acil & Sıcak',
    src: svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <defs>
          <linearGradient id="fireGrad" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stop-color="#DC2626"/>
            <stop offset="50%" stop-color="#EA580C"/>
            <stop offset="85%" stop-color="#F59E0B"/>
            <stop offset="100%" stop-color="#FDE047"/>
          </linearGradient>
          <filter id="fireShd">
            <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#DC2626" flood-opacity="0.3"/>
          </filter>
        </defs>
        <g filter="url(#fireShd)">
          <path d="M 50 12 C 55 25 65 30 68 45 C 72 58 66 74 54 84 C 76 80 82 58 75 42 C 72 36 68 30 68 30 C 68 30 70 38 68 44 C 62 26 48 18 50 12 Z" fill="#DC2626" opacity="0.3"/>
          <path d="M 50 15 C 55 30 75 42 75 62 C 75 78 62 88 50 88 C 38 88 25 78 25 62 C 25 46 36 38 42 26 C 44 32 46 36 50 36 C 54 36 56 30 50 15 Z" fill="url(#fireGrad)" stroke="#FFFFFF" stroke-width="2.5"/>
          <!-- Inner core flame -->
          <path d="M 50 48 C 54 55 60 62 60 72 C 60 80 55 84 50 84 C 45 84 40 80 40 72 C 40 64 46 58 50 48 Z" fill="#FEF08A"/>
        </g>
      </svg>
    `)
  },
  {
    id: 'stk_coffee',
    name: 'Kahve Molası',
    src: svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <defs>
          <filter id="mugShd">
            <feDropShadow dx="2" dy="5" stdDeviation="3.5" flood-color="#000" flood-opacity="0.2"/>
          </filter>
        </defs>
        <g filter="url(#mugShd)">
          <!-- Steam curls -->
          <path d="M 40 22 Q 45 14 42 8" fill="none" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>
          <path d="M 50 20 Q 55 12 52 6" fill="none" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>
          <path d="M 60 22 Q 65 14 62 8" fill="none" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/>
          <!-- Mug Handle -->
          <path d="M 66 38 C 78 38 82 58 66 62" fill="none" stroke="#F43F5E" stroke-width="6" stroke-linecap="round"/>
          <!-- Mug Body -->
          <path d="M 28 32 L 68 32 L 64 74 C 64 80 58 84 50 84 C 42 84 36 80 36 74 Z" fill="#FB7185" stroke="#FFFFFF" stroke-width="3"/>
          <!-- Heart Latte Art on Mug -->
          <path d="M 48 52 C 44 46 38 50 40 56 C 42 62 48 66 48 66 C 48 66 54 62 56 56 C 58 50 52 46 48 52 Z" fill="#FFFFFF"/>
        </g>
      </svg>
    `)
  },
  {
    id: 'stk_hundred',
    name: '100 Tam Puan',
    src: svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <defs>
          <filter id="stampShd">
            <feDropShadow dx="1" dy="3" stdDeviation="2.5" flood-color="#DC2626" flood-opacity="0.3"/>
          </filter>
        </defs>
        <g filter="url(#stampShd)" transform="rotate(-10 50 50)">
          <!-- 100 Text in stamp style -->
          <text x="50" y="60" font-family="'Impact', 'Arial Black', sans-serif" font-size="44" font-weight="900" fill="#DC2626" text-anchor="middle" letter-spacing="-2">100</text>
          <!-- Double underline -->
          <line x1="14" y1="70" x2="86" y2="70" stroke="#DC2626" stroke-width="4.5" stroke-linecap="round"/>
          <line x1="18" y1="78" x2="82" y2="78" stroke="#DC2626" stroke-width="4.5" stroke-linecap="round"/>
          <!-- Circular stamp border dashed -->
          <circle cx="50" cy="50" r="44" fill="none" stroke="#DC2626" stroke-width="3" stroke-dasharray="10 4" opacity="0.75"/>
        </g>
      </svg>
    `)
  },
  {
    id: 'stk_check_seal',
    name: 'Onaylandı Mührü',
    src: svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <defs>
          <linearGradient id="grnGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#34D399"/>
            <stop offset="100%" stop-color="#059669"/>
          </linearGradient>
          <filter id="sealShd">
            <feDropShadow dx="2" dy="5" stdDeviation="3.5" flood-color="#000" flood-opacity="0.2"/>
          </filter>
        </defs>
        <g filter="url(#sealShd)">
          <!-- Scalloped rosette circle -->
          <circle cx="50" cy="50" r="42" fill="url(#grnGrad)" stroke="#FFFFFF" stroke-width="3"/>
          <circle cx="50" cy="50" r="34" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="4 3"/>
          <!-- Big checkmark -->
          <path d="M 32 50 L 44 62 L 68 38" fill="none" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      </svg>
    `)
  },
  {
    id: 'stk_heart',
    name: 'Parlak Pembe Kalp',
    src: svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <defs>
          <radialGradient id="pinkHeart" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stop-color="#F472B6"/>
            <stop offset="60%" stop-color="#EC4899"/>
            <stop offset="100%" stop-color="#BE185D"/>
          </radialGradient>
          <filter id="hrtShd">
            <feDropShadow dx="2" dy="5" stdDeviation="3.5" flood-color="#BE185D" flood-opacity="0.3"/>
          </filter>
        </defs>
        <g filter="url(#hrtShd)">
          <path d="M 50 82 C 30 68 15 52 15 35 C 15 22 25 14 36 14 C 44 14 48 18 50 22 C 52 18 56 14 64 14 C 75 14 85 22 85 35 C 85 52 70 68 50 82 Z" fill="url(#pinkHeart)" stroke="#FFFFFF" stroke-width="3"/>
          <!-- Gloss sparkle -->
          <ellipse cx="32" cy="28" rx="8" ry="4" fill="#FFFFFF" opacity="0.75" transform="rotate(-30 32 28)"/>
          <circle cx="24" cy="38" r="2.5" fill="#FFFFFF" opacity="0.6"/>
        </g>
      </svg>
    `)
  },
  {
    id: 'stk_book',
    name: 'Kitap & Ders',
    src: svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <defs>
          <filter id="bkShd">
            <feDropShadow dx="2" dy="5" stdDeviation="3.5" flood-color="#000" flood-opacity="0.2"/>
          </filter>
        </defs>
        <g filter="url(#bkShd)">
          <!-- Cover -->
          <path d="M 12 68 Q 50 78 88 68 L 88 32 Q 50 42 12 32 Z" fill="#3B82F6" stroke="#FFFFFF" stroke-width="2.5"/>
          <!-- Pages left & right -->
          <path d="M 50 76 Q 30 70 14 74 L 14 36 Q 30 32 50 38 Z" fill="#FEF9C3" stroke="#CBD5E1" stroke-width="1.5"/>
          <path d="M 50 76 Q 70 70 86 74 L 86 36 Q 70 32 50 38 Z" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
          <!-- Page text lines -->
          <line x1="22" y1="46" x2="42" y2="48" stroke="#94A3B8" stroke-width="2" stroke-linecap="round"/>
          <line x1="22" y1="54" x2="40" y2="56" stroke="#94A3B8" stroke-width="2" stroke-linecap="round"/>
          <line x1="58" y1="48" x2="78" y2="46" stroke="#94A3B8" stroke-width="2" stroke-linecap="round"/>
          <line x1="58" y1="56" x2="76" y2="54" stroke="#94A3B8" stroke-width="2" stroke-linecap="round"/>
          <!-- Spine Bookmark Ribbon -->
          <path d="M 50 38 L 50 82 L 46 78 L 42 82 L 42 38" fill="#EF4444"/>
        </g>
      </svg>
    `)
  },
  {
    id: 'stk_warning',
    name: 'Dikkat / Önemli',
    src: svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <defs>
          <filter id="warnShd">
            <feDropShadow dx="2" dy="5" stdDeviation="3.5" flood-color="#000" flood-opacity="0.2"/>
          </filter>
        </defs>
        <g filter="url(#warnShd)">
          <!-- Rounded triangle -->
          <path d="M 50 14 L 88 78 A 6 6 0 0 1 82 86 L 18 86 A 6 6 0 0 1 12 78 Z" fill="#F59E0B" stroke="#FFFFFF" stroke-width="3" stroke-linejoin="round"/>
          <circle cx="50" cy="74" r="4.5" fill="#1E293B"/>
          <path d="M 50 38 L 50 62" stroke="#1E293B" stroke-width="7" stroke-linecap="round"/>
        </g>
      </svg>
    `)
  },
  {
    id: 'stk_rocket',
    name: 'Proje Fırlatma',
    src: svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <defs>
          <filter id="rktShd">
            <feDropShadow dx="2" dy="5" stdDeviation="3.5" flood-color="#000" flood-opacity="0.25"/>
          </filter>
        </defs>
        <g filter="url(#rktShd)" transform="rotate(45 50 50)">
          <!-- Exhaust Flame -->
          <polygon points="44,70 50,92 56,70" fill="#EF4444"/>
          <polygon points="46,70 50,84 54,70" fill="#FDE047"/>
          <!-- Wings -->
          <polygon points="32,60 22,74 38,72" fill="#3B82F6"/>
          <polygon points="68,60 78,74 62,72" fill="#3B82F6"/>
          <!-- Body -->
          <path d="M 50 12 C 38 28 38 58 38 70 L 62 70 C 62 58 62 28 50 12 Z" fill="#F8FAFC" stroke="#FFFFFF" stroke-width="2.5"/>
          <!-- Nose Cone -->
          <path d="M 50 12 C 44 22 42 30 42 34 L 58 34 C 58 30 56 22 50 12 Z" fill="#EF4444"/>
          <!-- Porthole Window -->
          <circle cx="50" cy="46" r="7" fill="#38BDF8" stroke="#0284C7" stroke-width="2"/>
          <circle cx="48" cy="44" r="2" fill="#FFFFFF"/>
        </g>
      </svg>
    `)
  },
  {
    id: 'stk_paw',
    name: 'Kedi Patisi',
    src: svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <defs>
          <filter id="pawShd">
            <feDropShadow dx="1" dy="4" stdDeviation="3" flood-color="#EC4899" flood-opacity="0.3"/>
          </filter>
        </defs>
        <g filter="url(#pawShd)">
          <!-- Main Pad -->
          <path d="M 50 48 C 36 48 30 62 34 74 C 38 82 46 84 50 84 C 54 84 62 82 66 74 C 70 62 64 48 50 48 Z" fill="#F472B6" stroke="#FFFFFF" stroke-width="2.5"/>
          <!-- 4 Toes -->
          <ellipse cx="28" cy="42" rx="7" ry="9" fill="#F472B6" stroke="#FFFFFF" stroke-width="2" transform="rotate(-20 28 42)"/>
          <ellipse cx="42" cy="32" rx="7.5" ry="10" fill="#F472B6" stroke="#FFFFFF" stroke-width="2" transform="rotate(-6 42 32)"/>
          <ellipse cx="58" cy="32" rx="7.5" ry="10" fill="#F472B6" stroke="#FFFFFF" stroke-width="2" transform="rotate(6 58 32)"/>
          <ellipse cx="72" cy="42" rx="7" ry="9" fill="#F472B6" stroke="#FFFFFF" stroke-width="2" transform="rotate(20 72 42)"/>
        </g>
      </svg>
    `)
  },
  {
    id: 'stk_trophy',
    name: 'Şampiyon Kupası',
    src: svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <defs>
          <linearGradient id="gldGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#FDE047"/>
            <stop offset="50%" stop-color="#EAB308"/>
            <stop offset="100%" stop-color="#CA8A04"/>
          </linearGradient>
          <filter id="trShd">
            <feDropShadow dx="2" dy="5" stdDeviation="3.5" flood-color="#000" flood-opacity="0.2"/>
          </filter>
        </defs>
        <g filter="url(#trShd)">
          <!-- Handles -->
          <path d="M 32 30 C 18 30 18 52 32 52" fill="none" stroke="#EAB308" stroke-width="5" stroke-linecap="round"/>
          <path d="M 68 30 C 82 30 82 52 68 52" fill="none" stroke="#EAB308" stroke-width="5" stroke-linecap="round"/>
          <!-- Cup bowl -->
          <path d="M 30 20 L 70 20 L 68 50 C 68 62 58 70 50 70 C 42 70 32 62 32 50 Z" fill="url(#gldGrad)" stroke="#FFFFFF" stroke-width="2.5"/>
          <!-- Stem -->
          <rect x="46" y="70" width="8" height="10" fill="#CA8A04"/>
          <!-- Base -->
          <rect x="34" y="80" width="32" height="8" rx="3" fill="#78350F" stroke="#FFFFFF" stroke-width="2"/>
          <!-- Star on cup -->
          <polygon points="50,34 53,42 61,43 55,48 57,56 50,52 43,56 45,48 39,43 47,42" fill="#FFFFFF" opacity="0.9"/>
        </g>
      </svg>
    `)
  },
  {
    id: 'stk_flower',
    name: 'Sakura Çiçeği',
    src: svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <defs>
          <filter id="flwShd">
            <feDropShadow dx="1" dy="4" stdDeviation="3" flood-color="#F43F5E" flood-opacity="0.25"/>
          </filter>
        </defs>
        <g filter="url(#flwShd)">
          <!-- 5 Petals -->
          <circle cx="50" cy="30" r="16" fill="#FBCFE8" stroke="#FFFFFF" stroke-width="2"/>
          <circle cx="68" cy="44" r="16" fill="#FBCFE8" stroke="#FFFFFF" stroke-width="2"/>
          <circle cx="62" cy="68" r="16" fill="#FBCFE8" stroke="#FFFFFF" stroke-width="2"/>
          <circle cx="38" cy="68" r="16" fill="#FBCFE8" stroke="#FFFFFF" stroke-width="2"/>
          <circle cx="32" cy="44" r="16" fill="#FBCFE8" stroke="#FFFFFF" stroke-width="2"/>
          <!-- Center pistil -->
          <circle cx="50" cy="50" r="12" fill="#F43F5E"/>
          <circle cx="50" cy="50" r="6" fill="#FDE047"/>
        </g>
      </svg>
    `)
  }
];

const stampList = [
  {
    id: 'stmp_wax_seal',
    name: 'Kırmızı Balmumu Mühür',
    src: svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <defs>
          <radialGradient id="waxRed" cx="38%" cy="32%" r="65%">
            <stop offset="0%" stop-color="#E11D48"/>
            <stop offset="55%" stop-color="#9F1239"/>
            <stop offset="100%" stop-color="#4C0519"/>
          </radialGradient>
          <filter id="waxShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="5" stdDeviation="3.5" flood-color="#000" flood-opacity="0.32"/>
          </filter>
        </defs>
        <g filter="url(#waxShadow)">
          <!-- Irregular organic molten wax border -->
          <path d="M 50 8 C 65 6, 78 14, 86 26 C 94 38, 92 58, 88 72 C 84 86, 68 94, 52 92 C 34 90, 16 86, 10 70 C 4 54, 8 34, 16 20 C 24 8, 38 10, 50 8 Z" fill="url(#waxRed)"/>
          <!-- Inner stamp rim -->
          <circle cx="50" cy="50" r="32" fill="#881337" stroke="#BE123C" stroke-width="2.5"/>
          <circle cx="50" cy="50" r="28" fill="none" stroke="#FDA4AF" stroke-width="1.2" stroke-dasharray="3 2" opacity="0.6"/>
          <!-- Embossed Letter Monogram 'L' -->
          <text x="50" y="58" font-family="'Times New Roman', serif" font-size="28" font-weight="bold" fill="#FECDD3" text-anchor="middle" filter="drop-shadow(1px 2px 1px #4C0519)">L</text>
        </g>
      </svg>
    `)
  },
  {
    id: 'stmp_important',
    name: 'ÖNEMLİ Kaşesi',
    src: svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 60" width="140" height="60">
        <defs>
          <filter id="stampDistort">
            <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="2" result="noise"/>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.8" xChannelSelector="R" yChannelSelector="G"/>
          </filter>
        </defs>
        <g transform="rotate(-6 70 30)" filter="url(#stampDistort)">
          <rect x="6" y="6" width="128" height="48" rx="8" fill="none" stroke="#DC2626" stroke-width="3.5" opacity="0.88"/>
          <rect x="11" y="11" width="118" height="38" rx="5" fill="none" stroke="#DC2626" stroke-width="1.2" opacity="0.7"/>
          <text x="70" y="37" font-family="'Impact', 'Arial Black', sans-serif" font-size="18" font-weight="900" fill="#DC2626" text-anchor="middle" letter-spacing="2" opacity="0.92">ÖNEMLİ</text>
        </g>
      </svg>
    `)
  },
  {
    id: 'stmp_done',
    name: 'TAMAMLANDI Kaşesi',
    src: svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 60" width="140" height="60">
        <g transform="rotate(4 70 30)">
          <rect x="6" y="6" width="128" height="48" rx="8" fill="none" stroke="#059669" stroke-width="3.5" opacity="0.88"/>
          <rect x="11" y="11" width="118" height="38" rx="5" fill="none" stroke="#059669" stroke-width="1.2" opacity="0.7"/>
          <text x="70" y="37" font-family="'Impact', 'Arial Black', sans-serif" font-size="14.5" font-weight="900" fill="#059669" text-anchor="middle" letter-spacing="1.5" opacity="0.92">TAMAMLANDI ✓</text>
        </g>
      </svg>
    `)
  },
  {
    id: 'stmp_exam',
    name: 'SINAV / DERS Kaşesi',
    src: svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 60" width="140" height="60">
        <g transform="rotate(-3 70 30)">
          <rect x="6" y="6" width="128" height="48" rx="8" fill="none" stroke="#2563EB" stroke-width="3.5" opacity="0.88"/>
          <text x="70" y="37" font-family="'Impact', 'Arial Black', sans-serif" font-size="14.5" font-weight="900" fill="#2563EB" text-anchor="middle" letter-spacing="1.5" opacity="0.92">SINAV & NOT</text>
        </g>
      </svg>
    `)
  },
  {
    id: 'stmp_secret',
    name: 'GİZLİ / KİŞİSEL Kaşesi',
    src: svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 60" width="140" height="60">
        <g transform="rotate(5 70 30)">
          <ellipse cx="70" cy="30" rx="62" ry="23" fill="none" stroke="#7C3AED" stroke-width="3" opacity="0.85"/>
          <text x="70" y="36" font-family="'Impact', 'Arial Black', sans-serif" font-size="13" font-weight="900" fill="#7C3AED" text-anchor="middle" letter-spacing="2" opacity="0.92">GİZLİ • ÖZEL</text>
        </g>
      </svg>
    `)
  },
  {
    id: 'stmp_aplus',
    name: 'A+ Mükemmel Kaşesi',
    src: svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <g transform="rotate(-8 50 50)">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#D97706" stroke-width="3.5" stroke-dasharray="6 3" opacity="0.9"/>
          <circle cx="50" cy="50" r="35" fill="none" stroke="#D97706" stroke-width="1.5" opacity="0.75"/>
          <text x="50" y="47" font-family="'Arial Black', sans-serif" font-size="22" font-weight="900" fill="#D97706" text-anchor="middle">A+</text>
          <text x="50" y="66" font-family="'Arial', sans-serif" font-size="9" font-weight="800" fill="#D97706" text-anchor="middle" letter-spacing="1">MÜKEMMEL</text>
        </g>
      </svg>
    `)
  },
  {
    id: 'stmp_urgent',
    name: 'DİKKAT Kaşesi',
    src: svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 60" width="140" height="60">
        <g transform="rotate(-5 70 30)">
          <rect x="6" y="6" width="128" height="48" rx="8" fill="none" stroke="#EA580C" stroke-width="3.5" opacity="0.88"/>
          <text x="70" y="37" font-family="'Impact', 'Arial Black', sans-serif" font-size="15" font-weight="900" fill="#EA580C" text-anchor="middle" letter-spacing="2" opacity="0.92">⚠ DİKKAT</text>
        </g>
      </svg>
    `)
  },
  {
    id: 'stmp_approved',
    name: 'ONAYLANDI Kaşesi',
    src: svgToDataUri(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <g transform="rotate(7 50 50)">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#047857" stroke-width="3.5" opacity="0.9"/>
          <text x="50" y="46" font-family="'Arial Black', sans-serif" font-size="13" font-weight="900" fill="#047857" text-anchor="middle" letter-spacing="1">ONAYLANDI</text>
          <text x="50" y="65" font-family="'Arial', sans-serif" font-size="18" fill="#047857" text-anchor="middle">★★★</text>
        </g>
      </svg>
    `)
  }
];

function pickTape(tape) {
  emit('select-tape', tape);
  emit('close');
}

function pickSticker(stk) {
  emit('select-sticker', stk);
  emit('close');
}

function pickStamp(stmp) {
  playStampSound();
  emit('select-sticker', stmp);
  emit('close');
}

function onKeydown(e) {
  if (e.key === 'Escape') {
    e.stopPropagation();
    e.stopImmediatePropagation();
    emit('close');
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown, true));
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown, true));
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1200;
  padding: 16px;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-card {
  width: 100%;
  max-width: 540px;
  background: var(--bg-surface, #ffffff);
  color: var(--color-text-main, #0f172a);
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  border: 1px solid var(--border-color, #e2e8f0);
  display: flex;
  flex-direction: column;
  max-height: 85vh;
}

.modal-header {
  padding: 18px 22px 14px 22px;
  border-bottom: 1px solid var(--border-color, #f1f5f9);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title-group h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
}

.title-group p {
  margin: 3px 0 0 0;
  font-size: 12px;
  color: var(--color-text-muted, #64748b);
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 24px;
  color: #94a3b8;
  cursor: pointer;
  line-height: 1;
  padding: 4px;
  border-radius: 6px;
  transition: color 0.15s;
}

.close-btn:hover {
  color: #ef4444;
}

/* Tabs */
.tabs-nav {
  display: flex;
  background: var(--bg-hover, #f8fafc);
  padding: 6px 16px;
  gap: 8px;
  border-bottom: 1px solid var(--border-color, #e2e8f0);
}

.tab-btn {
  flex: 1;
  padding: 9px 12px;
  border: none;
  background: transparent;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-muted, #64748b);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;
}

.tab-btn.active {
  background: var(--bg-surface, #ffffff);
  color: #2563eb;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.modal-body {
  padding: 16px 20px;
  overflow-y: auto;
  max-height: calc(85vh - 140px);
}

.tab-tip {
  font-size: 12px;
  color: var(--color-text-muted, #64748b);
  margin: 0 0 14px 0;
  line-height: 1.45;
  background: var(--bg-hover, #f8fafc);
  padding: 8px 12px;
  border-radius: 8px;
  border-left: 3px solid #3b82f6;
}

/* Washi Tape Grid */
.tape-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.washi-tape-preview-card {
  background: var(--bg-hover, #f8fafc);
  border: 1px solid var(--border-color, #e2e8f0);
  padding: 14px 10px;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.15s, border-color 0.15s, box-shadow 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.washi-tape-preview-card:hover {
  transform: translateY(-2px);
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.tape-serrated-preview {
  width: 100%;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);

  /* Serrated Jagged Washi Cut */
  clip-path: polygon(
    0% 0%, 
    4px 20%, 
    0% 40%, 
    4px 60%, 
    0% 80%, 
    4px 100%, 
    100% 100%, 
    calc(100% - 4px) 80%, 
    100% 60%, 
    calc(100% - 4px) 40%, 
    100% 20%, 
    calc(100% - 4px) 0%
  );
}

.preview-label {
  font-size: 11px;
  font-weight: 700;
  color: #1e293b;
  background: rgba(255, 255, 255, 0.82);
  padding: 2px 8px;
  border-radius: 999px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Transparent Sticker Grid */
.stickers-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.sticker-grid-btn {
  background: var(--bg-hover, #f8fafc);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 12px;
  padding: 10px 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.sticker-grid-btn:hover {
  transform: translateY(-3px) scale(1.03);
  background: var(--bg-surface, #ffffff);
  border-color: #3b82f6;
  box-shadow: 0 6px 14px rgba(59, 130, 246, 0.15);
}

.sticker-img-box {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sticker-thumb {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.12));
}

.sticker-grid-name {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-main, #334155);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 90px;
}

/* Dark Mode Adjustments */
[data-theme="dark"] .modal-card {
  background: #1e222d;
  border-color: #333a4d;
}

[data-theme="dark"] .tabs-nav {
  background: #161822;
  border-color: #2b3040;
}

[data-theme="dark"] .tab-btn.active {
  background: #242938;
  color: #60a5fa;
}

[data-theme="dark"] .tab-tip {
  background: #181b24;
  border-color: #2563eb;
}

[data-theme="dark"] .washi-tape-preview-card,
[data-theme="dark"] .sticker-grid-btn {
  background: #181b24;
  border-color: #2a3042;
}

[data-theme="dark"] .washi-tape-preview-card:hover,
[data-theme="dark"] .sticker-grid-btn:hover {
  background: #202533;
  border-color: #3b82f6;
}

[data-theme="dark"] .sticker-grid-name {
  color: #cbd5e1;
}
</style>
