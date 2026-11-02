import { ref, computed, watch } from 'vue';

const STORAGE_KEY_LUMINA = 'pastel_lumina_settings_v1';
const STORAGE_KEY_LEGACY_DARK = 'pastel_theme_mode_v1';
const STORAGE_KEY_GLOBAL_TODOS = 'pastel_global_todos_v1';

/**
 * 9 Curated Pastel Atmosphere Themes
 * Each theme has handcrafted Light & Dark palettes + Normal (Solid) & Geçişli (Gradient) backgrounds.
 */
export const PASTEL_THEMES = [
  {
    id: 'sakura',
    name: 'Sakura Sis',
    subtitle: 'Gül Kuvars & Kiraz Çiçeği',
    emoji: '🌸',
    light: {
      solidBg: '#FDF4F6',
      gradientBg: 'radial-gradient(circle at 12% 15%, #FFE4EC 0%, transparent 48%), radial-gradient(circle at 88% 82%, #F3E8FF 0%, transparent 52%), linear-gradient(135deg, #FFF5F7 0%, #FCEEF3 50%, #F9F1FB 100%)',
      surfaceGlass: 'rgba(255, 255, 255, 0.62)',
      surfaceGlassStrong: 'rgba(255, 255, 255, 0.84)',
      surfaceSubtle: 'rgba(244, 114, 182, 0.08)',
      borderGlass: 'rgba(255, 255, 255, 0.78)',
      borderSubtle: 'rgba(225, 29, 72, 0.11)',
      accent: '#DB2777',
      accentSoft: 'rgba(219, 39, 119, 0.12)',
      textMain: '#2D1B24',
      textMuted: '#7A5C6B'
    },
    dark: {
      solidBg: '#191318',
      gradientBg: 'radial-gradient(circle at 15% 18%, rgba(157, 23, 77, 0.24) 0%, transparent 50%), radial-gradient(circle at 85% 80%, rgba(107, 33, 168, 0.20) 0%, transparent 52%), linear-gradient(135deg, #171116 0%, #21161F 50%, #191320 100%)',
      surfaceGlass: 'rgba(34, 24, 33, 0.66)',
      surfaceGlassStrong: 'rgba(38, 27, 37, 0.88)',
      surfaceSubtle: 'rgba(244, 114, 182, 0.10)',
      borderGlass: 'rgba(255, 228, 236, 0.10)',
      borderSubtle: 'rgba(244, 114, 182, 0.16)',
      accent: '#F472B6',
      accentSoft: 'rgba(244, 114, 182, 0.16)',
      textMain: '#FBF1F5',
      textMuted: '#B89AA9'
    }
  },
  {
    id: 'sage',
    name: 'Adaçayı İpek',
    subtitle: 'Fıstık & Yumuşak Nane',
    emoji: '🌿',
    light: {
      solidBg: '#F2F9F5',
      gradientBg: 'radial-gradient(circle at 14% 18%, #DCFCE7 0%, transparent 50%), radial-gradient(circle at 86% 85%, #E0F2FE 0%, transparent 50%), linear-gradient(135deg, #F4FBF7 0%, #ECF7F0 50%, #EEF8F6 100%)',
      surfaceGlass: 'rgba(255, 255, 255, 0.62)',
      surfaceGlassStrong: 'rgba(255, 255, 255, 0.84)',
      surfaceSubtle: 'rgba(16, 185, 129, 0.08)',
      borderGlass: 'rgba(255, 255, 255, 0.78)',
      borderSubtle: 'rgba(5, 150, 105, 0.12)',
      accent: '#059669',
      accentSoft: 'rgba(5, 150, 105, 0.12)',
      textMain: '#162921',
      textMuted: '#537265'
    },
    dark: {
      solidBg: '#111A16',
      gradientBg: 'radial-gradient(circle at 15% 20%, rgba(6, 95, 70, 0.28) 0%, transparent 50%), radial-gradient(circle at 85% 80%, rgba(15, 118, 110, 0.22) 0%, transparent 52%), linear-gradient(135deg, #0F1714 0%, #15221D 50%, #111D1C 100%)',
      surfaceGlass: 'rgba(20, 33, 28, 0.66)',
      surfaceGlassStrong: 'rgba(23, 38, 32, 0.88)',
      surfaceSubtle: 'rgba(52, 211, 153, 0.09)',
      borderGlass: 'rgba(209, 250, 229, 0.10)',
      borderSubtle: 'rgba(52, 211, 153, 0.16)',
      accent: '#34D399',
      accentSoft: 'rgba(52, 211, 153, 0.16)',
      textMain: '#ECFDF5',
      textMuted: '#92B4A5'
    }
  },
  {
    id: 'sky',
    name: 'Kutup Mavisi',
    subtitle: 'Buzul & Dingin Gökyüzü',
    emoji: '☁️',
    light: {
      solidBg: '#F1F7FD',
      gradientBg: 'radial-gradient(circle at 12% 16%, #DBEAFE 0%, transparent 50%), radial-gradient(circle at 88% 84%, #E0E7FF 0%, transparent 52%), linear-gradient(135deg, #F3F8FF 0%, #EBF4FD 50%, #EEF2FF 100%)',
      surfaceGlass: 'rgba(255, 255, 255, 0.64)',
      surfaceGlassStrong: 'rgba(255, 255, 255, 0.85)',
      surfaceSubtle: 'rgba(59, 130, 246, 0.08)',
      borderGlass: 'rgba(255, 255, 255, 0.80)',
      borderSubtle: 'rgba(37, 99, 235, 0.11)',
      accent: '#2563EB',
      accentSoft: 'rgba(37, 99, 235, 0.12)',
      textMain: '#152238',
      textMuted: '#586E8C'
    },
    dark: {
      solidBg: '#101622',
      gradientBg: 'radial-gradient(circle at 15% 18%, rgba(30, 64, 175, 0.28) 0%, transparent 50%), radial-gradient(circle at 85% 82%, rgba(3, 105, 161, 0.22) 0%, transparent 52%), linear-gradient(135deg, #0E1420 0%, #141E30 50%, #11192B 100%)',
      surfaceGlass: 'rgba(20, 29, 46, 0.66)',
      surfaceGlassStrong: 'rgba(23, 33, 52, 0.88)',
      surfaceSubtle: 'rgba(96, 165, 250, 0.10)',
      borderGlass: 'rgba(219, 234, 254, 0.10)',
      borderSubtle: 'rgba(96, 165, 250, 0.16)',
      accent: '#60A5FA',
      accentSoft: 'rgba(96, 165, 250, 0.16)',
      textMain: '#EFF6FF',
      textMuted: '#93A8C7'
    }
  },
  {
    id: 'lavender',
    name: 'Lavanta Pus',
    subtitle: 'Fransız Lavantası & İris',
    emoji: '💜',
    light: {
      solidBg: '#F6F4FE',
      gradientBg: 'radial-gradient(circle at 15% 15%, #EDE9FE 0%, transparent 50%), radial-gradient(circle at 86% 82%, #FCE7F3 0%, transparent 50%), linear-gradient(135deg, #F8F6FF 0%, #F1EEFC 50%, #F7F1FB 100%)',
      surfaceGlass: 'rgba(255, 255, 255, 0.64)',
      surfaceGlassStrong: 'rgba(255, 255, 255, 0.85)',
      surfaceSubtle: 'rgba(124, 58, 237, 0.08)',
      borderGlass: 'rgba(255, 255, 255, 0.78)',
      borderSubtle: 'rgba(109, 40, 217, 0.11)',
      accent: '#7C3AED',
      accentSoft: 'rgba(124, 58, 237, 0.12)',
      textMain: '#201833',
      textMuted: '#685B82'
    },
    dark: {
      solidBg: '#151221',
      gradientBg: 'radial-gradient(circle at 16% 18%, rgba(91, 33, 182, 0.28) 0%, transparent 50%), radial-gradient(circle at 85% 82%, rgba(131, 24, 67, 0.20) 0%, transparent 52%), linear-gradient(135deg, #13101E 0%, #1B162C 50%, #171326 100%)',
      surfaceGlass: 'rgba(27, 22, 43, 0.66)',
      surfaceGlassStrong: 'rgba(31, 25, 49, 0.88)',
      surfaceSubtle: 'rgba(167, 139, 250, 0.10)',
      borderGlass: 'rgba(237, 233, 254, 0.10)',
      borderSubtle: 'rgba(167, 139, 250, 0.16)',
      accent: '#A78BFA',
      accentSoft: 'rgba(167, 139, 250, 0.16)',
      textMain: '#F5F3FF',
      textMuted: '#A599C4'
    }
  },
  {
    id: 'peach',
    name: 'Kayısı Gün Doğumu',
    subtitle: 'Sıcak Şeftali & Mercan',
    emoji: '🍑',
    light: {
      solidBg: '#FFF6F0',
      gradientBg: 'radial-gradient(circle at 14% 16%, #FFEDD5 0%, transparent 50%), radial-gradient(circle at 86% 84%, #FFE4E6 0%, transparent 50%), linear-gradient(135deg, #FFF9F5 0%, #FFF1E8 50%, #FFF3F1 100%)',
      surfaceGlass: 'rgba(255, 255, 255, 0.64)',
      surfaceGlassStrong: 'rgba(255, 255, 255, 0.85)',
      surfaceSubtle: 'rgba(234, 88, 12, 0.08)',
      borderGlass: 'rgba(255, 255, 255, 0.80)',
      borderSubtle: 'rgba(234, 88, 12, 0.12)',
      accent: '#EA580C',
      accentSoft: 'rgba(234, 88, 12, 0.12)',
      textMain: '#301C14',
      textMuted: '#825F50'
    },
    dark: {
      solidBg: '#1B1411',
      gradientBg: 'radial-gradient(circle at 16% 18%, rgba(154, 52, 18, 0.26) 0%, transparent 50%), radial-gradient(circle at 84% 82%, rgba(159, 18, 57, 0.20) 0%, transparent 52%), linear-gradient(135deg, #18120F 0%, #241914 50%, #1F1415 100%)',
      surfaceGlass: 'rgba(36, 25, 21, 0.66)',
      surfaceGlassStrong: 'rgba(42, 29, 24, 0.88)',
      surfaceSubtle: 'rgba(251, 146, 60, 0.10)',
      borderGlass: 'rgba(255, 237, 213, 0.10)',
      borderSubtle: 'rgba(251, 146, 60, 0.16)',
      accent: '#FB923C',
      accentSoft: 'rgba(251, 146, 60, 0.16)',
      textMain: '#FFF7ED',
      textMuted: '#BD9B8B'
    }
  },
  {
    id: 'butter',
    name: 'Krem Vanilya',
    subtitle: 'Papatya & Sıcak Yulaf Sütü',
    emoji: '🌼',
    light: {
      solidBg: '#FDFBF2',
      gradientBg: 'radial-gradient(circle at 15% 18%, #FEF3C7 0%, transparent 50%), radial-gradient(circle at 85% 82%, #FFEDD5 0%, transparent 52%), linear-gradient(135deg, #FFFDF7 0%, #FCF8E8 50%, #FDF6EC 100%)',
      surfaceGlass: 'rgba(255, 255, 255, 0.66)',
      surfaceGlassStrong: 'rgba(255, 255, 255, 0.86)',
      surfaceSubtle: 'rgba(217, 119, 6, 0.08)',
      borderGlass: 'rgba(255, 255, 255, 0.82)',
      borderSubtle: 'rgba(180, 83, 9, 0.12)',
      accent: '#D97706',
      accentSoft: 'rgba(217, 119, 6, 0.12)',
      textMain: '#2B2313',
      textMuted: '#7A6C4F'
    },
    dark: {
      solidBg: '#191710',
      gradientBg: 'radial-gradient(circle at 15% 18%, rgba(146, 64, 14, 0.25) 0%, transparent 50%), radial-gradient(circle at 85% 82%, rgba(113, 63, 18, 0.22) 0%, transparent 52%), linear-gradient(135deg, #17150E 0%, #221E13 50%, #1D1912 100%)',
      surfaceGlass: 'rgba(34, 30, 20, 0.66)',
      surfaceGlassStrong: 'rgba(40, 35, 23, 0.88)',
      surfaceSubtle: 'rgba(251, 191, 36, 0.10)',
      borderGlass: 'rgba(254, 243, 199, 0.10)',
      borderSubtle: 'rgba(251, 191, 36, 0.16)',
      accent: '#FBBF24',
      accentSoft: 'rgba(251, 191, 36, 0.16)',
      textMain: '#FEFCE8',
      textMuted: '#B8AC8A'
    }
  },
  {
    id: 'aqua',
    name: 'Lagün Köpüğü',
    subtitle: 'Turkuaz & Deniz Camı',
    emoji: '🌊',
    light: {
      solidBg: '#F0FAFA',
      gradientBg: 'radial-gradient(circle at 14% 16%, #CCFBF1 0%, transparent 50%), radial-gradient(circle at 86% 84%, #E0F2FE 0%, transparent 50%), linear-gradient(135deg, #F3FCFC 0%, #E8F8F7 50%, #EDF7FC 100%)',
      surfaceGlass: 'rgba(255, 255, 255, 0.64)',
      surfaceGlassStrong: 'rgba(255, 255, 255, 0.85)',
      surfaceSubtle: 'rgba(13, 148, 136, 0.08)',
      borderGlass: 'rgba(255, 255, 255, 0.80)',
      borderSubtle: 'rgba(13, 148, 136, 0.12)',
      accent: '#0D9488',
      accentSoft: 'rgba(13, 148, 136, 0.12)',
      textMain: '#132A2B',
      textMuted: '#517375'
    },
    dark: {
      solidBg: '#0F1A1C',
      gradientBg: 'radial-gradient(circle at 16% 18%, rgba(17, 94, 89, 0.28) 0%, transparent 50%), radial-gradient(circle at 84% 82%, rgba(21, 94, 117, 0.24) 0%, transparent 52%), linear-gradient(135deg, #0D1719 0%, #132326 50%, #101E24 100%)',
      surfaceGlass: 'rgba(19, 35, 38, 0.66)',
      surfaceGlassStrong: 'rgba(22, 40, 44, 0.88)',
      surfaceSubtle: 'rgba(45, 212, 191, 0.10)',
      borderGlass: 'rgba(204, 251, 241, 0.10)',
      borderSubtle: 'rgba(45, 212, 191, 0.16)',
      accent: '#2DD4BF',
      accentSoft: 'rgba(45, 212, 191, 0.16)',
      textMain: '#F0FDFA',
      textMuted: '#8EB5B8'
    }
  },
  {
    id: 'berry',
    name: 'Mürdüm Kadife',
    subtitle: 'Böğürtlen & Romantik Leylak',
    emoji: '🍇',
    light: {
      solidBg: '#FAF3FB',
      gradientBg: 'radial-gradient(circle at 14% 16%, #F5D0FE 0%, transparent 48%), radial-gradient(circle at 86% 84%, #FFE4E6 0%, transparent 52%), linear-gradient(135deg, #FCF6FD 0%, #F7ECFA 50%, #FBF0F5 100%)',
      surfaceGlass: 'rgba(255, 255, 255, 0.64)',
      surfaceGlassStrong: 'rgba(255, 255, 255, 0.85)',
      surfaceSubtle: 'rgba(162, 28, 175, 0.08)',
      borderGlass: 'rgba(255, 255, 255, 0.78)',
      borderSubtle: 'rgba(162, 28, 175, 0.11)',
      accent: '#A21CAF',
      accentSoft: 'rgba(162, 28, 175, 0.12)',
      textMain: '#2A162D',
      textMuted: '#76577B'
    },
    dark: {
      solidBg: '#19111C',
      gradientBg: 'radial-gradient(circle at 15% 18%, rgba(134, 25, 143, 0.28) 0%, transparent 50%), radial-gradient(circle at 85% 82%, rgba(157, 23, 77, 0.22) 0%, transparent 52%), linear-gradient(135deg, #160F19 0%, #221527 50%, #1D1220 100%)',
      surfaceGlass: 'rgba(34, 21, 39, 0.66)',
      surfaceGlassStrong: 'rgba(39, 24, 45, 0.88)',
      surfaceSubtle: 'rgba(232, 121, 249, 0.10)',
      borderGlass: 'rgba(250, 232, 255, 0.10)',
      borderSubtle: 'rgba(232, 121, 249, 0.16)',
      accent: '#E879F9',
      accentSoft: 'rgba(232, 121, 249, 0.16)',
      textMain: '#FDF4FF',
      textMuted: '#B695BD'
    }
  },
  {
    id: 'oat',
    name: 'Yulaf & Keten',
    subtitle: 'İskandinav Bej & Mocha',
    emoji: '🌾',
    light: {
      solidBg: '#F7F5F2',
      gradientBg: 'radial-gradient(circle at 15% 16%, #EFECE6 0%, transparent 50%), radial-gradient(circle at 85% 84%, #F5EBE6 0%, transparent 52%), linear-gradient(135deg, #FAF9F6 0%, #F3F0EA 50%, #F6F2EE 100%)',
      surfaceGlass: 'rgba(255, 255, 255, 0.66)',
      surfaceGlassStrong: 'rgba(255, 255, 255, 0.86)',
      surfaceSubtle: 'rgba(120, 113, 108, 0.09)',
      borderGlass: 'rgba(255, 255, 255, 0.82)',
      borderSubtle: 'rgba(87, 83, 78, 0.12)',
      accent: '#785A46',
      accentSoft: 'rgba(120, 90, 70, 0.12)',
      textMain: '#262320',
      textMuted: '#736C65'
    },
    dark: {
      solidBg: '#161514',
      gradientBg: 'radial-gradient(circle at 15% 18%, rgba(87, 76, 67, 0.26) 0%, transparent 50%), radial-gradient(circle at 85% 82%, rgba(68, 64, 60, 0.24) 0%, transparent 52%), linear-gradient(135deg, #141312 0%, #1E1C1A 50%, #191716 100%)',
      surfaceGlass: 'rgba(30, 28, 26, 0.68)',
      surfaceGlassStrong: 'rgba(35, 33, 31, 0.88)',
      surfaceSubtle: 'rgba(214, 211, 209, 0.08)',
      borderGlass: 'rgba(245, 245, 244, 0.10)',
      borderSubtle: 'rgba(168, 162, 158, 0.16)',
      accent: '#D6B89C',
      accentSoft: 'rgba(214, 184, 156, 0.16)',
      textMain: '#F5F5F4',
      textMuted: '#A8A29E'
    }
  },
  {
    id: 'nordic',
    name: 'İskandinav Monokrom',
    subtitle: 'Siyah, Beyaz & Gri Minimalizm',
    emoji: '🏛️',
    light: {
      solidBg: '#F4F5F7',
      gradientBg: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 50%, #E2E8F0 100%)',
      surfaceGlass: 'rgba(255, 255, 255, 0.76)',
      surfaceGlassStrong: 'rgba(255, 255, 255, 0.94)',
      surfaceSubtle: 'rgba(15, 23, 42, 0.05)',
      borderGlass: 'rgba(255, 255, 255, 0.88)',
      borderSubtle: 'rgba(15, 23, 42, 0.12)',
      accent: '#0F172A',
      accentSoft: 'rgba(15, 23, 42, 0.10)',
      textMain: '#0F172A',
      textMuted: '#64748B'
    },
    dark: {
      solidBg: '#0F1117',
      gradientBg: 'linear-gradient(135deg, #0B0D13 0%, #11141D 50%, #0E1017 100%)',
      surfaceGlass: 'rgba(21, 24, 35, 0.72)',
      surfaceGlassStrong: 'rgba(24, 28, 40, 0.92)',
      surfaceSubtle: 'rgba(255, 255, 255, 0.06)',
      borderGlass: 'rgba(255, 255, 255, 0.10)',
      borderSubtle: 'rgba(255, 255, 255, 0.14)',
      accent: '#E2E8F0',
      accentSoft: 'rgba(255, 255, 255, 0.12)',
      textMain: '#F8FAFC',
      textMuted: '#94A3B8'
    }
  },
  {
    id: 'sepia',
    name: 'Klasik Kağıt & Sepya',
    subtitle: 'Vintage Kitap & Nötr Keten',
    emoji: '📜',
    light: {
      solidBg: '#F6F3EE',
      gradientBg: 'linear-gradient(135deg, #FBF8F3 0%, #F3EEE6 50%, #ECE5D9 100%)',
      surfaceGlass: 'rgba(255, 255, 255, 0.72)',
      surfaceGlassStrong: 'rgba(255, 255, 255, 0.92)',
      surfaceSubtle: 'rgba(120, 80, 50, 0.06)',
      borderGlass: 'rgba(255, 255, 255, 0.85)',
      borderSubtle: 'rgba(120, 80, 50, 0.12)',
      accent: '#6B4F3B',
      accentSoft: 'rgba(107, 79, 59, 0.12)',
      textMain: '#2B231D',
      textMuted: '#7A6C60'
    },
    dark: {
      solidBg: '#141210',
      gradientBg: 'linear-gradient(135deg, #12100E 0%, #1A1714 50%, #151310 100%)',
      surfaceGlass: 'rgba(28, 25, 22, 0.72)',
      surfaceGlassStrong: 'rgba(33, 29, 25, 0.92)',
      surfaceSubtle: 'rgba(235, 215, 195, 0.06)',
      borderGlass: 'rgba(255, 240, 225, 0.08)',
      borderSubtle: 'rgba(215, 190, 165, 0.14)',
      accent: '#D8BCA0',
      accentSoft: 'rgba(216, 188, 160, 0.14)',
      textMain: '#FAF6F0',
      textMuted: '#A69B8F'
    }
  }
];

export const AMBIENT_SOUNDS = [
  { id: 'off', name: 'Sessiz', emoji: '🔇', desc: 'Arka plan sesi kapalı' },
  { id: 'rain', name: 'İpek Yağmur', emoji: '🌧️', desc: 'Cama vuran yumuşak yağmur' },
  { id: 'storm', name: 'Gök Gürültüsü & Fırtına', emoji: '⚡', desc: 'Uzak sağanak ve derin gök gürültüsü' },
  { id: 'fireplace', name: 'Şömine Ateşi', emoji: '🔥', desc: 'Çıtırdayan sıcak odunlar ve köz sesi' },
  { id: 'cafe', name: 'Pastel Kafe', emoji: '☕', desc: 'Fincan sesleri ve huzurlu ortam' },
  { id: 'ocean', name: 'Okyanus Dalgaları', emoji: '🌊', desc: 'Kıyıya vuran dinlendirici yumuşak dalgalar' },
  { id: 'forest', name: 'Yağmur Ormanı', emoji: '🌲', desc: 'Rüzgarda yapraklar ve kuş cıvıltıları' },
  { id: 'night', name: 'Yıldızlı Gece', emoji: '🦗', desc: 'Yaz gecesi esintisi ve cırcır böcekleri' },
  { id: 'library', name: 'Eski Kütüphane', emoji: '📚', desc: 'Ahşap masa ve sayfa çevirme tınısı' },
  { id: 'train', name: 'Nostaljik Tren', emoji: '🚂', desc: 'Ritmik ray sesleri ve seyahat ritmi' },
  { id: 'blizzard', name: 'Kış Fırtınası', emoji: '❄️', desc: 'Pencere önünde rüzgar uğultusu ve tipi' },
  { id: 'river', name: 'Bahar Deresi', emoji: '💧', desc: 'Taşlar arasından süzülen berrak su şırıltısı' },
  { id: 'zen', name: 'Tibet Meditasyonu', emoji: '🧘', desc: 'Derin odaklanma ve akustik çan tınısı' }
];

export const TYPING_SOUND_OPTIONS = [
  { id: 'thock', name: 'Manyetik Switch (Tok)', emoji: '⌨️', desc: 'Kremsi ve tok manyetik tuş tıkırtısı' },
  { id: 'fountain_pen', name: 'Zarif Dolma Kalem', emoji: '✒️', desc: 'Kağıt üstünde kayan altın uç cızırtısı' },
  { id: 'pencil', name: 'Kurşun Kalem', emoji: '✏️', desc: 'Doğal grafit kağıt sürtünmesi' },
  { id: 'off', name: 'Sessiz', emoji: '🔇', desc: 'Yazma sesi kapalı' }
];

export const FONT_CATEGORIES = [
  { id: 'all', name: 'Tümü' },
  { id: 'handwriting', name: 'El Yazısı & Not' },
  { id: 'serif', name: 'Kitap & Roman' },
  { id: 'sans', name: 'Modern & Sade' },
  { id: 'mono', name: 'Daktilo & Kod' }
];

export const FONT_OPTIONS = [
  // 1. EL YAZISI & NOT ALMA (Handwriting)
  { id: 'Caveat', name: 'Caveat', category: 'handwriting', categoryName: 'El Yazısı', sample: 'Aa', desc: 'Doğal & Akıcı Günlük' },
  { id: 'Kalam', name: 'Kalam', category: 'handwriting', categoryName: 'El Yazısı', sample: 'Aa', desc: 'Dolma Kalem Hissi' },
  { id: 'Patrick Hand', name: 'Patrick Hand', category: 'handwriting', categoryName: 'El Yazısı', sample: 'Aa', desc: 'Ders Notu & Çalışma' },
  { id: 'Shadows Into Light', name: 'Shadows Into Light', category: 'handwriting', categoryName: 'El Yazısı', sample: 'Aa', desc: 'Karakterli & Hızlı Not' },
  { id: 'Dancing Script', name: 'Dancing Script', category: 'handwriting', categoryName: 'El Yazısı', sample: 'Aa', desc: 'Zarif & Eğik İtalik' },
  { id: 'Indie Flower', name: 'Indie Flower', category: 'handwriting', categoryName: 'El Yazısı', sample: 'Aa', desc: 'Keyifli & Sevimli' },

  // 2. KİTAP & EDEBİYAT (Serif)
  { id: 'Lora', name: 'Lora', category: 'serif', categoryName: 'Kitap', sample: 'Aa', desc: 'Klasik Roman & Edebiyat' },
  { id: 'Playfair Display', name: 'Playfair Display', category: 'serif', categoryName: 'Kitap', sample: 'Aa', desc: 'Prestijli & Zarif Başlık' },
  { id: 'Merriweather', name: 'Merriweather', category: 'serif', categoryName: 'Kitap', sample: 'Aa', desc: 'Akademik & Gazete Tipi' },
  { id: 'Cormorant Garamond', name: 'Cormorant Garamond', category: 'serif', categoryName: 'Kitap', sample: 'Aa', desc: 'Lüks & Vintage Şiir' },
  { id: 'Cinzel', name: 'Cinzel', category: 'serif', categoryName: 'Kitap', sample: 'Aa', desc: 'Antik & Klasik Mermer' },

  // 3. MODERN & SADE (Clean Sans)
  { id: 'Plus Jakarta Sans', name: 'Plus Jakarta Sans', category: 'sans', categoryName: 'Modern', sample: 'Aa', desc: 'Net & Çağdaş (Varsayılan)' },
  { id: 'Inter', name: 'Inter', category: 'sans', categoryName: 'Modern', sample: 'Aa', desc: 'Maksimum Okunabilirlik' },
  { id: 'Poppins', name: 'Poppins', category: 'sans', categoryName: 'Modern', sample: 'Aa', desc: 'Yuvarlak & Samimi Geometrik' },
  { id: 'Outfit', name: 'Outfit', category: 'sans', categoryName: 'Modern', sample: 'Aa', desc: 'Şık & Minimalist' },
  { id: 'Quicksand', name: 'Quicksand', category: 'sans', categoryName: 'Modern', sample: 'Aa', desc: 'Yumuşak & Estetik' },
  { id: 'Space Grotesk', name: 'Space Grotesk', category: 'sans', categoryName: 'Modern', sample: 'Aa', desc: 'Tekno & İskandinav' },

  // 4. DAKTİLO & MÜHENDİSLİK (Monospace)
  { id: 'JetBrains Mono', name: 'JetBrains Mono', category: 'mono', categoryName: 'Daktilo', sample: 'Aa', desc: 'Hassas Mühendislik & Kod' },
  { id: 'Space Mono', name: 'Space Mono', category: 'mono', categoryName: 'Daktilo', sample: 'Aa', desc: 'Retro Daktilo & Baskı' }
];

// Singleton state shared across all components
function loadInitialSettings() {
  let legacyDark = false;
  try {
    const savedDark = localStorage.getItem(STORAGE_KEY_LEGACY_DARK);
    if (savedDark) legacyDark = JSON.parse(savedDark);
  } catch (e) {}

  const defaults = {
    themeId: 'lavender',
    isDarkMode: legacyDark,
    isGradient: true,
    autoOpenPanelsOnWide: true,
    defaultPaperSize: 'a4',
    defaultPaperType: 'lined',
    defaultPaperColor: 'cream',
    defaultBookMode: false,
    defaultSmartShape: true,
    defaultFontFamily: 'Plus Jakarta Sans',
    lineOpacity: 0.78,
    ambientVolume: 0.35,
    typingSound: 'thock',
    typingVolume: 0.45,
    isShelf3DLeather: true
  };

  try {
    const raw = localStorage.getItem(STORAGE_KEY_LUMINA);
    if (raw) {
      return { ...defaults, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to load Lumina settings:', e);
  }
  return defaults;
}

function loadGlobalTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_GLOBAL_TODOS);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

const settings = ref(loadInitialSettings());
const globalTodos = ref(loadGlobalTodos());
const activeAmbientSound = ref('off');

// ----------------- PROCEDURAL WEB AUDIO AMBIENT & KEYSTROKE ENGINE -----------------
let audioCtx = null;
let activeAmbientNodes = [];
let ambientTimers = [];
let mainGain = null;

function getSharedAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playKeystrokeSound(overrideType = null) {
  const s = settings.value;
  const soundType = overrideType || s.typingSound || 'thock';
  if (soundType === 'off') return;
  const volume = typeof s.typingVolume === 'number' ? s.typingVolume : 0.45;
  if (volume <= 0.001) return;

  try {
    const ctx = getSharedAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    const volVariance = 1 + (Math.random() * 0.12 - 0.06);
    masterGain.gain.setValueAtTime(volume * 0.65 * volVariance, now);
    masterGain.connect(ctx.destination);

    if (soundType === 'thock') {
      // 1. Deep magnetic switch body "thock" (sine pitch-drop 144Hz -> 46Hz)
      const pitchVariance = 1 + (Math.random() * 0.08 - 0.04);
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(142 * pitchVariance, now);
      osc.frequency.exponentialRampToValueAtTime(46 * pitchVariance, now + 0.045);

      oscGain.gain.setValueAtTime(0.85, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
      osc.connect(oscGain);
      oscGain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.06);

      // 2. High-precision stem snap click
      const clickLen = Math.floor(ctx.sampleRate * 0.016);
      const clickBuf = ctx.createBuffer(1, clickLen, ctx.sampleRate);
      const clickData = clickBuf.getChannelData(0);
      for (let i = 0; i < clickLen; i++) {
        clickData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (clickLen * 0.3));
      }
      const clickSrc = ctx.createBufferSource();
      clickSrc.buffer = clickBuf;

      const clickFilter = ctx.createBiquadFilter();
      clickFilter.type = 'bandpass';
      clickFilter.frequency.value = 1380 * pitchVariance;
      clickFilter.Q.value = 3.2;

      const clickGain = ctx.createGain();
      clickGain.gain.setValueAtTime(0.5, now);
      clickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.016);

      clickSrc.connect(clickFilter);
      clickFilter.connect(clickGain);
      clickGain.connect(masterGain);
      clickSrc.start(now);

      // 3. Bottom-out deep plate reverb impulse
      const plateOsc = ctx.createOscillator();
      const plateGain = ctx.createGain();
      plateOsc.type = 'triangle';
      plateOsc.frequency.setValueAtTime(74 * pitchVariance, now);
      plateOsc.frequency.exponentialRampToValueAtTime(32, now + 0.055);
      plateGain.gain.setValueAtTime(0.35, now);
      plateGain.gain.exponentialRampToValueAtTime(0.001, now + 0.058);
      plateOsc.connect(plateGain);
      plateGain.connect(masterGain);
      plateOsc.start(now);
      plateOsc.stop(now + 0.06);

    } else if (soundType === 'fountain_pen') {
      // Zarif Dolma Kalem & Kağıt sürtünmesi (textured paper scratch)
      const dur = 0.036 + Math.random() * 0.014;
      const bufLen = Math.floor(ctx.sampleRate * dur);
      const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) {
        const env = Math.sin((i / bufLen) * Math.PI);
        data[i] = (Math.random() * 2 - 1) * env;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 2800 + Math.random() * 500;
      filter.Q.value = 2.4;

      const scratchGain = ctx.createGain();
      scratchGain.gain.setValueAtTime(0.65, now);
      scratchGain.gain.exponentialRampToValueAtTime(0.01, now + dur);

      src.connect(filter);
      filter.connect(scratchGain);
      scratchGain.connect(masterGain);
      src.start(now);

    } else if (soundType === 'pencil') {
      // Kurşun Kalem - Grafit Kağıt sürtünmesi
      const dur = 0.040 + Math.random() * 0.016;
      const bufLen = Math.floor(ctx.sampleRate * dur);
      const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufLen; i++) {
        const env = Math.sin((i / bufLen) * Math.PI);
        data[i] = (Math.random() * 2 - 1) * env;
      }
      const src = ctx.createBufferSource();
      src.buffer = buf;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1750 + Math.random() * 320;
      filter.Q.value = 1.6;

      const pencilGain = ctx.createGain();
      pencilGain.gain.setValueAtTime(0.55, now);
      pencilGain.gain.exponentialRampToValueAtTime(0.01, now + dur);

      src.connect(filter);
      filter.connect(pencilGain);
      pencilGain.connect(masterGain);
      src.start(now);
    }
  } catch (err) {
    // Graceful silent audio fallback
  }
}

function stopAmbientAudio() {
  for (const t of ambientTimers) {
    try {
      clearInterval(t);
      clearTimeout(t);
    } catch (e) {}
  }
  ambientTimers = [];

  try {
    for (const node of activeAmbientNodes) {
      try {
        if (typeof node.stop === 'function') node.stop();
        if (typeof node.disconnect === 'function') node.disconnect();
      } catch (e) {}
    }
    activeAmbientNodes = [];
    if (mainGain) {
      mainGain.disconnect();
      mainGain = null;
    }
  } catch (e) {}
}

function createNoiseBuffer(ctx, duration = 4, type = 'pink') {
  const sampleRate = ctx.sampleRate;
  const bufferSize = sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
  const data = buffer.getChannelData(0);

  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  let lastOut = 0;

  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    if (type === 'brown') {
      const out = (lastOut + 0.02 * white) / 1.02;
      lastOut = out;
      data[i] = out * 3.2;
    } else if (type === 'white') {
      data[i] = white * 0.15;
    } else {
      // Pink noise
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.085;
      b6 = white * 0.115926;
    }
  }
  return buffer;
}

function startAmbientAudio(mode) {
  stopAmbientAudio();
  if (mode === 'off') return;

  try {
    const ctx = getSharedAudioContext();
    if (!ctx) return;

    mainGain = ctx.createGain();
    const vol = Math.max(0.02, Math.min(1, settings.value.ambientVolume || 0.35));
    mainGain.gain.setValueAtTime(0.001, ctx.currentTime);
    mainGain.gain.exponentialRampToValueAtTime(vol * 0.45, ctx.currentTime + 0.6);
    mainGain.connect(ctx.destination);
    activeAmbientNodes.push(mainGain);

    if (mode === 'rain') {
      // 1. İpek Yağmur: Yumuşak yağmur perdesi + cama vuran gerçekçi damlacıklar
      const pinkBuf = createNoiseBuffer(ctx, 4, 'pink');
      const src = ctx.createBufferSource();
      src.buffer = pinkBuf;
      src.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 540;

      src.connect(filter);
      filter.connect(mainGain);
      src.start();
      activeAmbientNodes.push(src, filter);

      // Cama vuran tekil su damlası tıpırtıları
      const triggerDrop = () => {
        try {
          const tNow = ctx.currentTime;
          const dropOsc = ctx.createOscillator();
          const dropGain = ctx.createGain();
          const baseFreq = 850 + Math.random() * 450;
          dropOsc.type = 'sine';
          dropOsc.frequency.setValueAtTime(baseFreq, tNow);
          dropOsc.frequency.exponentialRampToValueAtTime(baseFreq - 220, tNow + 0.035);

          const dropVol = 0.08 + Math.random() * 0.09;
          dropGain.gain.setValueAtTime(dropVol, tNow);
          dropGain.gain.exponentialRampToValueAtTime(0.0005, tNow + 0.04);

          dropOsc.connect(dropGain);
          dropGain.connect(mainGain);
          dropOsc.start(tNow);
          dropOsc.stop(tNow + 0.045);
        } catch (e) {}
      };
      const rainInterval = setInterval(() => {
        triggerDrop();
        if (Math.random() > 0.4) {
          setTimeout(triggerDrop, 40 + Math.random() * 60);
        }
      }, 260);
      ambientTimers.push(rainInterval);

    } else if (mode === 'storm') {
      // 2. Gök Gürültüsü & Fırtına: Uzak sağanak ve derin, sinematik gök gürültüsü
      const brownBuf = createNoiseBuffer(ctx, 4, 'brown');
      const rainSrc = ctx.createBufferSource();
      rainSrc.buffer = brownBuf;
      rainSrc.loop = true;

      const rainFilter = ctx.createBiquadFilter();
      rainFilter.type = 'lowpass';
      rainFilter.frequency.value = 210;
      rainSrc.connect(rainFilter);
      rainFilter.connect(mainGain);
      rainSrc.start();
      activeAmbientNodes.push(rainSrc, rainFilter);

      const triggerThunder = () => {
        try {
          const tNow = ctx.currentTime;
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const tGain = ctx.createGain();

          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(46, tNow);
          osc1.frequency.exponentialRampToValueAtTime(26, tNow + 3.8);

          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(64, tNow);
          osc2.frequency.exponentialRampToValueAtTime(32, tNow + 3.2);

          tGain.gain.setValueAtTime(0.005, tNow);
          tGain.gain.linearRampToValueAtTime(0.32, tNow + 0.9);
          tGain.gain.exponentialRampToValueAtTime(0.001, tNow + 4.0);

          osc1.connect(tGain);
          osc2.connect(tGain);
          tGain.connect(mainGain);

          osc1.start(tNow);
          osc2.start(tNow);
          osc1.stop(tNow + 4.1);
          osc2.stop(tNow + 4.1);
        } catch (e) {}
      };
      const stormInterval = setInterval(triggerThunder, 8500);
      ambientTimers.push(stormInterval);
      triggerThunder();

    } else if (mode === 'fireplace') {
      // 3. Şömine Ateşi: Sıcak ocak tabanı + odun çıtırtıları & köz patlamaları
      const brownBuf = createNoiseBuffer(ctx, 4, 'brown');
      const src = ctx.createBufferSource();
      src.buffer = brownBuf;
      src.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 200;
      src.connect(filter);
      filter.connect(mainGain);
      src.start();
      activeAmbientNodes.push(src, filter);

      const triggerCrackle = () => {
        try {
          const cNow = ctx.currentTime;
          // Keskin çıtırtı kıvılcımı
          const popLen = Math.floor(ctx.sampleRate * 0.015);
          const popBuf = ctx.createBuffer(1, popLen, ctx.sampleRate);
          const pData = popBuf.getChannelData(0);
          for (let i = 0; i < popLen; i++) {
            pData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (popLen * 0.25));
          }
          const popSrc = ctx.createBufferSource();
          popSrc.buffer = popBuf;
          const pFilter = ctx.createBiquadFilter();
          pFilter.type = 'highpass';
          pFilter.frequency.value = 1800 + Math.random() * 800;
          const pGain = ctx.createGain();
          pGain.gain.value = 0.26 + Math.random() * 0.22;
          popSrc.connect(pFilter);
          pFilter.connect(pGain);
          pGain.connect(mainGain);
          popSrc.start(cNow);

          // Tok ahşap köz gövdesi
          if (Math.random() > 0.45) {
            const woodOsc = ctx.createOscillator();
            const woodGain = ctx.createGain();
            woodOsc.type = 'triangle';
            woodOsc.frequency.setValueAtTime(140 + Math.random() * 40, cNow);
            woodOsc.frequency.exponentialRampToValueAtTime(45, cNow + 0.025);
            woodGain.gain.setValueAtTime(0.18, cNow);
            woodGain.gain.exponentialRampToValueAtTime(0.001, cNow + 0.03);
            woodOsc.connect(woodGain);
            woodGain.connect(mainGain);
            woodOsc.start(cNow);
            woodOsc.stop(cNow + 0.035);
          }
        } catch (e) {}
      };
      const fireInterval = setInterval(triggerCrackle, 300);
      ambientTimers.push(fireInterval);

    } else if (mode === 'cafe') {
      // 4. Pastel Kafe: Huzurlu arka plan uğultusu + narin fincan & kaşık tınısı
      const pinkBuf = createNoiseBuffer(ctx, 4, 'pink');
      const src = ctx.createBufferSource();
      src.buffer = pinkBuf;
      src.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 340;
      src.connect(filter);
      filter.connect(mainGain);
      src.start();
      activeAmbientNodes.push(src, filter);

      // Porselen fincan / tatlı kaşığı tınısı
      const triggerCupChime = () => {
        try {
          const tNow = ctx.currentTime;
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const cGain = ctx.createGain();

          osc1.type = 'sine';
          osc1.frequency.value = 1760; // A6
          osc2.type = 'sine';
          osc2.frequency.value = 2640; // E7

          cGain.gain.setValueAtTime(0.045, tNow);
          cGain.gain.exponentialRampToValueAtTime(0.0005, tNow + 0.14);

          osc1.connect(cGain);
          osc2.connect(cGain);
          cGain.connect(mainGain);

          osc1.start(tNow);
          osc2.start(tNow);
          osc1.stop(tNow + 0.15);
          osc2.stop(tNow + 0.15);
        } catch (e) {}
      };
      const cafeInterval = setInterval(triggerCupChime, 5200);
      ambientTimers.push(cafeInterval);

    } else if (mode === 'ocean') {
      // 5. Okyanus Dalgaları: 12 saniyelik doğal nefes alan kıyı dalgası
      const brownBuf = createNoiseBuffer(ctx, 4, 'brown');
      const src = ctx.createBufferSource();
      src.buffer = brownBuf;
      src.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 320;

      // Dalga yükselişi ve çekilmesi LFO (12.5 sn döngü)
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.08;

      const lfoFilterGain = ctx.createGain();
      lfoFilterGain.gain.value = 180; // Cutoff 140Hz - 500Hz arası nefes alır
      lfo.connect(lfoFilterGain);
      lfoFilterGain.connect(filter.frequency);

      const swellGain = ctx.createGain();
      swellGain.gain.value = 0.42;
      const lfoAmpGain = ctx.createGain();
      lfoAmpGain.gain.value = 0.28;
      lfo.connect(lfoAmpGain);
      lfoAmpGain.connect(swellGain.gain);

      src.connect(filter);
      filter.connect(swellGain);
      swellGain.connect(mainGain);

      src.start();
      lfo.start();
      activeAmbientNodes.push(src, filter, swellGain, lfo, lfoFilterGain, lfoAmpGain);

    } else if (mode === 'forest') {
      // 6. Yağmur Ormanı: Yaprak esintisi + narin, neşeli kuş cıvıltıları
      const pinkBuf = createNoiseBuffer(ctx, 4, 'pink');
      const src = ctx.createBufferSource();
      src.buffer = pinkBuf;
      src.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 420;
      filter.Q.value = 0.7;

      src.connect(filter);
      filter.connect(mainGain);
      src.start();
      activeAmbientNodes.push(src, filter);

      // Tatlı orman kuşu cıvıltısı (yumuşak melodik sine glissando)
      const triggerBird = () => {
        try {
          const tNow = ctx.currentTime;
          const bOsc = ctx.createOscillator();
          const bGain = ctx.createGain();
          const startF = 2100 + Math.random() * 400;
          bOsc.type = 'sine';
          bOsc.frequency.setValueAtTime(startF, tNow);
          bOsc.frequency.linearRampToValueAtTime(startF + 380, tNow + 0.045);
          bOsc.frequency.linearRampToValueAtTime(startF - 100, tNow + 0.09);

          bGain.gain.setValueAtTime(0.001, tNow);
          bGain.gain.linearRampToValueAtTime(0.065, tNow + 0.03);
          bGain.gain.exponentialRampToValueAtTime(0.0005, tNow + 0.11);

          bOsc.connect(bGain);
          bGain.connect(mainGain);
          bOsc.start(tNow);
          bOsc.stop(tNow + 0.12);

          // İkinci küçük yanıt ötüşü
          if (Math.random() > 0.3) {
            setTimeout(() => {
              try {
                const t2 = ctx.currentTime;
                const bOsc2 = ctx.createOscillator();
                const bGain2 = ctx.createGain();
                bOsc2.type = 'sine';
                bOsc2.frequency.setValueAtTime(startF + 150, t2);
                bOsc2.frequency.exponentialRampToValueAtTime(startF + 500, t2 + 0.06);
                bGain2.gain.setValueAtTime(0.055, t2);
                bGain2.gain.exponentialRampToValueAtTime(0.0005, t2 + 0.07);
                bOsc2.connect(bGain2);
                bGain2.connect(mainGain);
                bOsc2.start(t2);
                bOsc2.stop(t2 + 0.08);
              } catch (e) {}
            }, 120);
          }
        } catch (e) {}
      };
      const forestInterval = setInterval(triggerBird, 4200);
      ambientTimers.push(forestInterval);

    } else if (mode === 'night') {
      // 7. Yıldızlı Gece: SERİN GECE ESİNTİSİ + ÇINLAMA YAPMAYAN YUMUŞAK GECE FISILTISI (0 Kulak Çınlaması!)
      const brownBuf = createNoiseBuffer(ctx, 4, 'brown');
      const src = ctx.createBufferSource();
      src.buffer = brownBuf;
      src.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 180; // Derin, ipeksi gece esintisi
      src.connect(filter);
      filter.connect(mainGain);
      src.start();
      activeAmbientNodes.push(src, filter);

      // Yumuşak, çınlatmayan, doğal filtrelenmiş kır fısıltısı (kesinlikle 4.3kHz saf sine DEĞİLDİR)
      const nightBuf = createNoiseBuffer(ctx, 2, 'pink');
      const nSrc = ctx.createBufferSource();
      nSrc.buffer = nightBuf;
      nSrc.loop = true;

      const nFilter = ctx.createBiquadFilter();
      nFilter.type = 'bandpass';
      nFilter.frequency.value = 2400;
      nFilter.Q.value = 1.6;

      const nLfo = ctx.createOscillator();
      nLfo.type = 'sine';
      nLfo.frequency.value = 1.8; // Sakin nefes temposu

      const nGain = ctx.createGain();
      nGain.gain.value = 0.016; // Çok zarif, arka planda kaybolan fısıltı
      nLfo.connect(nGain.gain);

      nSrc.connect(nFilter);
      nFilter.connect(nGain);
      nGain.connect(mainGain);
      nSrc.start();
      nLfo.start();
      activeAmbientNodes.push(nSrc, nFilter, nLfo, nGain);

      // Uzak huzurlu rüzgar çanı (Pentatonik, yumuşacık)
      const triggerWindChime = () => {
        try {
          const tNow = ctx.currentTime;
          const chimeOsc = ctx.createOscillator();
          const chimeGain = ctx.createGain();
          const notes = [587.33, 659.25, 880.00]; // D5, E5, A5
          const note = notes[Math.floor(Math.random() * notes.length)];

          chimeOsc.type = 'sine';
          chimeOsc.frequency.setValueAtTime(note, tNow);

          chimeGain.gain.setValueAtTime(0.001, tNow);
          chimeGain.gain.linearRampToValueAtTime(0.035, tNow + 0.04);
          chimeGain.gain.exponentialRampToValueAtTime(0.0001, tNow + 1.8);

          chimeOsc.connect(chimeGain);
          chimeGain.connect(mainGain);
          chimeOsc.start(tNow);
          chimeOsc.stop(tNow + 1.9);
        } catch (e) {}
      };
      const nightInterval = setInterval(triggerWindChime, 7500);
      ambientTimers.push(nightInterval);

    } else if (mode === 'library') {
      // 8. Eski Kütüphane: Derin sessiz çalışma odası + 60 BPM antika sarkaçlı saat
      const brownBuf = createNoiseBuffer(ctx, 4, 'brown');
      const src = ctx.createBufferSource();
      src.buffer = brownBuf;
      src.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 110;
      src.connect(filter);
      filter.connect(mainGain);
      src.start();
      activeAmbientNodes.push(src, filter);

      let isTick = true;
      const triggerClock = () => {
        try {
          const tNow = ctx.currentTime;
          const clockOsc = ctx.createOscillator();
          const clockGain = ctx.createGain();
          clockOsc.type = 'sine';
          // Tick: 520Hz, Tock: 430Hz
          const freq = isTick ? 520 : 430;
          isTick = !isTick;

          clockOsc.frequency.setValueAtTime(freq, tNow);
          clockOsc.frequency.exponentialRampToValueAtTime(freq - 140, tNow + 0.022);

          clockGain.gain.setValueAtTime(0.09, tNow);
          clockGain.gain.exponentialRampToValueAtTime(0.0005, tNow + 0.026);

          clockOsc.connect(clockGain);
          clockGain.connect(mainGain);
          clockOsc.start(tNow);
          clockOsc.stop(tNow + 0.03);
        } catch (e) {}
      };
      const libInterval = setInterval(triggerClock, 1000); // 60 BPM odak sarkacı
      ambientTimers.push(libInterval);

    } else if (mode === 'train') {
      // 9. Nostaljik Tren: Sürekli ray uğultusu + ritmik çift vuruşlu "ta-tak... ta-tak"
      const brownBuf = createNoiseBuffer(ctx, 4, 'brown');
      const src = ctx.createBufferSource();
      src.buffer = brownBuf;
      src.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 140;
      src.connect(filter);
      filter.connect(mainGain);
      src.start();
      activeAmbientNodes.push(src, filter);

      // Ritmik tren tekeri ray birleşimi çift tıklaması
      const triggerRailClick = (pitch = 240) => {
        try {
          const tNow = ctx.currentTime;
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(pitch, tNow);
          osc.frequency.exponentialRampToValueAtTime(55, tNow + 0.045);
          g.gain.setValueAtTime(0.19, tNow);
          g.gain.exponentialRampToValueAtTime(0.001, tNow + 0.05);
          osc.connect(g);
          g.connect(mainGain);
          osc.start(tNow);
          osc.stop(tNow + 0.06);
        } catch (e) {}
      };
      const trainInterval = setInterval(() => {
        triggerRailClick(260);
        setTimeout(() => triggerRailClick(310), 170);
      }, 1350);
      ambientTimers.push(trainInterval);

    } else if (mode === 'blizzard') {
      // 10. Kış Fırtınası: Derin tipi gürültüsü + pencerede uğuldayan rezonanslı rüzgar
      const pinkBuf = createNoiseBuffer(ctx, 4, 'pink');
      const src = ctx.createBufferSource();
      src.buffer = pinkBuf;
      src.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 420;
      filter.Q.value = 2.8;

      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.09;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 240;

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      src.connect(filter);
      filter.connect(mainGain);
      src.start();
      lfo.start();
      activeAmbientNodes.push(src, filter, lfo, lfoGain);

    } else if (mode === 'river') {
      // 11. Bahar Deresi: Berrak su akıntısı + taşlar arası yükselen su kabarcıkları
      const pinkBuf = createNoiseBuffer(ctx, 4, 'pink');
      const src = ctx.createBufferSource();
      src.buffer = pinkBuf;
      src.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 520;
      filter.Q.value = 0.9;

      src.connect(filter);
      filter.connect(mainGain);
      src.start();
      activeAmbientNodes.push(src, filter);

      // Canlı su kabarcığı pıtırtıları
      const triggerBubble = () => {
        try {
          const tNow = ctx.currentTime;
          const bOsc = ctx.createOscillator();
          const bGain = ctx.createGain();
          const startF = 380 + Math.random() * 260;
          bOsc.type = 'sine';
          bOsc.frequency.setValueAtTime(startF, tNow);
          bOsc.frequency.exponentialRampToValueAtTime(startF + 280, tNow + 0.035);

          bGain.gain.setValueAtTime(0.08, tNow);
          bGain.gain.exponentialRampToValueAtTime(0.0005, tNow + 0.038);

          bOsc.connect(bGain);
          bGain.connect(mainGain);
          bOsc.start(tNow);
          bOsc.stop(tNow + 0.04);
        } catch (e) {}
      };
      const riverInterval = setInterval(triggerBubble, 180);
      ambientTimers.push(riverInterval);

    } else if (mode === 'zen') {
      // 12. Tibet Meditasyonu: 1.4Hz akustik dalgalanmalı Tibet çanağı + 16sn derin gong çanı
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const oscHarmonic = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.value = 196.0; // G3
      osc2.type = 'sine';
      osc2.frequency.value = 197.4; // 1.4Hz dinlendirici akustik dalgalanma
      oscHarmonic.type = 'sine';
      oscHarmonic.frequency.value = 588.0; // 3. Harmonik

      oscGain.gain.value = 0.13;
      osc1.connect(oscGain);
      osc2.connect(oscGain);

      const harmGain = ctx.createGain();
      harmGain.gain.value = 0.04;
      oscHarmonic.connect(harmGain);
      harmGain.connect(mainGain);

      oscGain.connect(mainGain);

      osc1.start();
      osc2.start();
      oscHarmonic.start();
      activeAmbientNodes.push(osc1, osc2, oscHarmonic, oscGain, harmGain);

      // 16 saniyede bir vuran dingin tapınak gong çanı
      const triggerGong = () => {
        try {
          const tNow = ctx.currentTime;
          const gOsc = ctx.createOscillator();
          const gGain = ctx.createGain();
          gOsc.type = 'sine';
          gOsc.frequency.setValueAtTime(392.0, tNow); // G4

          gGain.gain.setValueAtTime(0.001, tNow);
          gGain.gain.linearRampToValueAtTime(0.12, tNow + 0.06);
          gGain.gain.exponentialRampToValueAtTime(0.0001, tNow + 5.5);

          gOsc.connect(gGain);
          gGain.connect(mainGain);
          gOsc.start(tNow);
          gOsc.stop(tNow + 5.6);
        } catch (e) {}
      };
      const zenInterval = setInterval(triggerGong, 16000);
      ambientTimers.push(zenInterval);
      triggerGong();
    }
  } catch (e) {
    console.warn('Ambient audio error:', e);
  }
}

// ----------------- APPLY THEME VARIABLES TO DOM -----------------
function applyThemeToDOM() {
  if (typeof document === 'undefined') return;
  const s = settings.value;
  const themeObj = PASTEL_THEMES.find(t => t.id === s.themeId) || PASTEL_THEMES[0];
  const palette = s.isDarkMode ? themeObj.dark : themeObj.light;
  const root = document.documentElement;

  if (s.isDarkMode) {
    root.setAttribute('data-theme', 'dark');
  } else {
    root.removeAttribute('data-theme');
  }

  root.style.setProperty('--bg-app', palette.solidBg);
  root.style.setProperty('--bg-app-gradient', s.isGradient ? palette.gradientBg : palette.solidBg);
  root.style.setProperty('--bg-surface', palette.surfaceGlassStrong);
  root.style.setProperty('--bg-glass', palette.surfaceGlass);
  root.style.setProperty('--bg-surface-subtle', palette.surfaceSubtle);
  root.style.setProperty('--bg-hover', palette.surfaceSubtle);
  root.style.setProperty('--border-color', palette.borderSubtle);
  root.style.setProperty('--border-glass', palette.borderGlass);
  root.style.setProperty('--color-primary', palette.accent);
  root.style.setProperty('--color-primary-soft', palette.accentSoft);
  root.style.setProperty('--color-text-main', palette.textMain);
  root.style.setProperty('--color-text-muted', palette.textMuted);
  root.style.setProperty('--line-opacity', String(s.lineOpacity ?? 0.78));
}

// Initial apply
applyThemeToDOM();

watch(settings, (newVal) => {
  try {
    localStorage.setItem(STORAGE_KEY_LUMINA, JSON.stringify(newVal));
    localStorage.setItem(STORAGE_KEY_LEGACY_DARK, JSON.stringify(newVal.isDarkMode));
  } catch (e) {}
  applyThemeToDOM();

  if (mainGain && audioCtx) {
    const vol = Math.max(0.02, Math.min(1, newVal.ambientVolume || 0.35));
    mainGain.gain.setTargetAtTime(vol * 0.45, audioCtx.currentTime, 0.15);
  }
}, { deep: true });

watch(globalTodos, (newTodos) => {
  try {
    localStorage.setItem(STORAGE_KEY_GLOBAL_TODOS, JSON.stringify(newTodos));
  } catch (e) {}
}, { deep: true });

export function useSettings() {
  const currentTheme = computed(() => {
    return PASTEL_THEMES.find(t => t.id === settings.value.themeId) || PASTEL_THEMES[0];
  });

  function setTheme(themeId) {
    settings.value.themeId = themeId;
  }

  function setDarkMode(val) {
    settings.value.isDarkMode = !!val;
  }

  function toggleDarkMode() {
    settings.value.isDarkMode = !settings.value.isDarkMode;
  }

  function setGradientMode(val) {
    settings.value.isGradient = !!val;
  }

  function setAmbient(soundId) {
    activeAmbientSound.value = soundId;
    startAmbientAudio(soundId);
  }

  function cycleAmbientSound() {
    const list = AMBIENT_SOUNDS.map(s => s.id);
    const nextIdx = (list.indexOf(activeAmbientSound.value) + 1) % list.length;
    setAmbient(list[nextIdx]);
  }

  // Global To-Dos helpers
  function addGlobalTodo(text) {
    const clean = text.trim();
    if (!clean) return;
    globalTodos.value.unshift({
      id: `gtodo_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      text: clean,
      done: false,
      createdAt: new Date().toISOString()
    });
  }

  function toggleGlobalTodo(id) {
    const item = globalTodos.value.find(t => t.id === id);
    if (item) item.done = !item.done;
  }

  function deleteGlobalTodo(id) {
    globalTodos.value = globalTodos.value.filter(t => t.id !== id);
  }

  function clearCompletedGlobalTodos() {
    globalTodos.value = globalTodos.value.filter(t => !t.done);
  }

  return {
    settings,
    currentTheme,
    activeAmbientSound,
    globalTodos,
    setTheme,
    setDarkMode,
    toggleDarkMode,
    setGradientMode,
    setAmbient,
    cycleAmbientSound,
    playKeystrokeSound,
    addGlobalTodo,
    toggleGlobalTodo,
    deleteGlobalTodo,
    clearCompletedGlobalTodos
  };
}
