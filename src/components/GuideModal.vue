<template>
  <Transition name="fade-modal">
    <div v-if="isOpen" class="guide-modal-overlay" @click.self="closeModal">
      <div class="guide-modal-card" @click.stop>
        <!-- Modal Header -->
        <header class="guide-header">
          <div class="header-left">
            <div class="brand-avatar-squircle">
              <img src="/favicon.svg" alt="Lumina Papelle" class="brand-logo-img" />
            </div>
            <div class="header-text">
              <div class="title-row">
                <h2 class="guide-title">Lumina Papelle</h2>
                <span class="version-badge">v1.0 • Erken Erişim</span>
              </div>
              <p class="guide-sub">Estetik Dijital Kırtasiye & Akıllı Çalışma Stüdyosu Rehberi</p>
            </div>
          </div>

          <button
            type="button"
            class="guide-close-btn"
            @click="closeModal"
            title="Kapat (ESC)"
          >
            <X :size="18" />
          </button>
        </header>

        <!-- Navigation Tabs -->
        <nav class="guide-tabs-nav" aria-label="Rehber Kategorileri">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            type="button"
            class="guide-tab-btn"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            <component :is="tab.icon" :size="14" />
            <span>{{ tab.label }}</span>
          </button>
        </nav>

        <!-- Tab Content Body (Scrollable) -->
        <div class="guide-body">
          <!-- 1. DEFTER & KAĞIT DÜZENİ -->
          <div v-if="activeTab === 'paper'" class="guide-cards-grid">
            <div class="guide-card">
              <div class="card-icon-orb blue"><Book :size="18" /></div>
              <div class="card-info">
                <h4 class="card-title">Gerçek ISO Kağıt Standartları (A4, A5, A3, Tuval)</h4>
                <p class="card-desc">
                  Her defter kendi standart boyutunda çalışır. <strong>A4</strong> yazıcı ve çalışma standardıdır. <strong>A5</strong> kompakt bir ajandadır. <strong>A3</strong> geniş mimari çizimler sunar. <strong>Tuval</strong> ise cilt kısıtlaması olmayan özgür bir sanat panosudur.
                </p>
                <div class="card-tip">💡 <strong>İpucu:</strong> Kağıt boyutunu üstteki <code>📖 Düzen</code> menüsünden veya sağdaki Slotlar çekmecesinden istediğiniz an değiştirebilirsiniz.</div>
              </div>
            </div>

            <div class="guide-card">
              <div class="card-icon-orb purple"><Layers :size="18" /></div>
              <div class="card-info">
                <h4 class="card-title">Açık Kitap Forması (1–2 Dikişli Çift Sayfa)</h4>
                <p class="card-desc">
                  Tıpkı gerçek bir ajanda gibi sayfaları yan yana çift sayfa olarak açabilirsiniz. İki sayfa arasında gerçekçi dikiş izi yer alır. A3 ve Tuval gibi devasa kağıtlarda düzeni korumak için tekli akış kilitlidir.
                </p>
                <div class="card-tip">💡 <strong>İpucu:</strong> A5 boyutunda çift sayfa açıldığında tam 1 adet açık A4 formasına dönüşür; laptop ve tabletler için en mükemmel çalışma görünümüdür.</div>
              </div>
            </div>

            <div class="guide-card">
              <div class="card-icon-orb green"><Sparkles :size="18" /></div>
              <div class="card-info">
                <h4 class="card-title">Sayfa Bazlı Bağımsız Desen & Renk Özelleştirme</h4>
                <p class="card-desc">
                  Bir defterin içindeki tüm sayfalar aynı olmak zorunda değildir! 1. sayfayı <strong>Kareli</strong>, 2. sayfayı <strong>Düz</strong>, 3. sayfayı <strong>Noktalı (Bullet)</strong> yapabilir ve her birine farklı pastel kağıt tonu atayabilirsiniz.
                </p>
                <div class="card-tip">💡 <strong>İpucu:</strong> Her sayfanın sol üstündeki minik desen hapına tıklayarak sadece o yaprağın desenini anında değiştirebilirsiniz.</div>
              </div>
            </div>

            <div class="guide-card">
              <div class="card-icon-orb pink"><Maximize2 :size="18" /></div>
              <div class="card-info">
                <h4 class="card-title">Akıllı Yakınlaştırma (Fit-to-Width) ile Sıfır Kayma</h4>
                <p class="card-desc">
                  Pencereyi küçülttüğünüzde veya bölünmüş ekrana geçtiğinizde yazılar alt satıra kırılmaz, fotoğraflar ve post-it'ler yerinden oynamaz. Sayfa orantısal olarak küçülerek ekrana tam oturur.
                </p>
              </div>
            </div>
          </div>

          <!-- 2. KALEM & ÇİZİM STÜDYOSU -->
          <div v-else-if="activeTab === 'draw'" class="guide-cards-grid">
            <div class="guide-card">
              <div class="card-icon-orb yellow"><Highlighter :size="18" /></div>
              <div class="card-info">
                <h4 class="card-title">Gerçek Kağıt Fiziği ile Fosforlu Kalem</h4>
                <p class="card-desc">
                  Lumina'da fosforlu kalem optik çoğaltma (<code>multiply</code>) tekniğiyle çalışır. Yazdığınız ders notunun veya formülün üzerini çizdiğinizde, <strong>altındaki siyah harfler ASLA örtülmez veya solmaz</strong>. Harfler jilet gibi net parlar.
                </p>
                <div class="card-tip">💡 <strong>İpucu:</strong> Çizgiler homojen tek-yol mimarisiyle işlendiğinden, çizgi uzadıkça veya üst üste geldikçe koyulaşma yapmaz.</div>
              </div>
            </div>

            <div class="guide-card">
              <div class="card-icon-orb blue"><PenTool :size="18" /></div>
              <div class="card-info">
                <h4 class="card-title">4 Profesyonel Kalem Ucu & 5 Hızlı Yuva</h4>
                <p class="card-desc">
                  <strong>Dolma Kalem</strong> (jilet gibi vektör mürekkep), <strong>Fosforlu Kalem</strong> (saydam vurgulayıcı), <strong>Kurşun Kalem</strong> (dokulu 2B grafit) ve <strong>Silgi</strong>. Üstteki 5 renkli kalem yuvasından tek tıkla favori kalemlerinize geçebilirsiniz.
                </p>
              </div>
            </div>

            <div class="guide-card">
              <div class="card-icon-orb purple"><Shapes :size="18" /></div>
              <div class="card-info">
                <h4 class="card-title">Akıllı Çizgi (Basılı Tut & Düzelt)</h4>
                <p class="card-desc">
                  Serbest elle bir çizgi, kare veya çember çizin ve kalemi/fareyi bırakmadan <strong>0.4 saniye basılı tutun</strong>. Çiziminiz sihirli bir şekilde cetvelle çizilmiş kusursuz bir geometrik şekle dönüşür.
                </p>
              </div>
            </div>

            <div class="guide-card">
              <div class="card-icon-orb orange"><Ruler :size="18" /></div>
              <div class="card-info">
                <h4 class="card-title">Döndürülebilir Şeffaf Akrilik Cetvel</h4>
                <p class="card-desc">
                  Üst menüdeki <strong>Cetvel</strong> butonuna bastığınızda ekrana şeffaf bir cetvel gelir. Fare tekerleğiyle veya açı çemberiyle cetveli 360 derece döndürebilir, milimetrik kılavuz çizgileriyle çalışabilirsiniz.
                </p>
              </div>
            </div>
          </div>

          <!-- 3. AKTİF HATIRLAMA & SINAV MODU -->
          <div v-else-if="activeTab === 'study'" class="guide-cards-grid">
            <div class="guide-card">
              <div class="card-icon-orb pink"><EyeOff :size="18" /></div>
              <div class="card-info">
                <h4 class="card-title">Washi Bant ile Aktif Hatırlama (Sınav Modu)</h4>
                <p class="card-desc">
                  Ders çalışırken önemli bir terimin, cevabın veya formülün üzerine <strong>Washi Bant</strong> yapıştırın. Bant cevabı gizler; üzerine dokunduğunuzda sihirli bir şekilde şeffaflaşarak altındaki cevabı açar.
                </p>
                <div class="card-tip">💡 <strong>İpucu:</strong> Sınava hazırlanırken Anki veya harici kartlara gerek duymadan doğrudan kendi defteriniz üzerinden kendinizi test edebilirsiniz!</div>
              </div>
            </div>

            <div class="guide-card">
              <div class="card-icon-orb yellow"><StickyNote :size="18" /></div>
              <div class="card-info">
                <h4 class="card-title">Renkli Post-it & Şeffaf Çıkartmalar</h4>
                <p class="card-desc">
                  Sayfanın istediğiniz yerine pastel renkli yapışkan notlar (Post-it) bırakabilir, arka planı şeffaf sevimli çıkartmalar ve tırtıklı süsleme bantlarıyla defterinizi kişiselleştirebilirsiniz.
                </p>
              </div>
            </div>

            <div class="guide-card">
              <div class="card-icon-orb green"><Tag :size="18" /></div>
              <div class="card-info">
                <h4 class="card-title">Renkli İndeks Fihrist Kulakçıkları</h4>
                <p class="card-desc">
                  Tıpkı kalın fiziksel kitapların yanına yapıştırılan renkli ayraçlar gibi, sayfalara özel başlıklı fihrist kulakçıkları ekleyebilirsiniz. Kulakçığa tıkladığınız an defter o konuya kayar.
                </p>
              </div>
            </div>

            <div class="guide-card">
              <div class="card-icon-orb blue"><Mic :size="18" /></div>
              <div class="card-info">
                <h4 class="card-title">Sesli Not Kaydedici & Dosya Ekleri</h4>
                <p class="card-desc">
                  Derste veya toplantıda dinlerken üstteki mikrofon butonuyla sayfanın içine doğrudan ses kaydı bırakabilir, PDF, Word veya fotoğrafları sayfanın ataç bölümüne iliştirebilirsiniz.
                </p>
              </div>
            </div>
          </div>

          <!-- 4. ATMOSFER & ODAK -->
          <div v-else-if="activeTab === 'focus'" class="guide-cards-grid">
            <div class="guide-card">
              <div class="card-icon-orb purple"><CloudRain :size="18" /></div>
              <div class="card-info">
                <h4 class="card-title">Çevrimdışı Akustik Odak Sesleri (Doğa & Kütüphane)</h4>
                <p class="card-desc">
                  İnternet bağlantısı gerekmeden tek tıkla <strong>İpek Yağmur 🌧️</strong>, <strong>Gece Kütüphanesi 🔥</strong> veya <strong>Bahar Esintisi 🍃</strong> ortam seslerini açabilirsiniz. Üst bardaki küçük ses simgesinden ses seviyesini dilediğiniz gibi ayarlayabilirsiniz.
                </p>
              </div>
            </div>

            <div class="guide-card">
              <div class="card-icon-orb pink"><Palette :size="18" /></div>
              <div class="card-info">
                <h4 class="card-title">9 Pastel Atmosfer Teması (36 Görsel Kombinasyon)</h4>
                <p class="card-desc">
                  <em>Sakura Sis</em>, <em>Adaçayı İpek</em>, <em>Kutup Mavisi</em>, <em>Lavanta Pus</em> gibi 9 özel renk; ister pürüzsüz <strong>Geçişli (Gradyan)</strong>, ister sade <strong>Normal (Düz)</strong> olarak; ister <strong>Açık Pastel</strong>, ister göz yormayan <strong>Koyu Kadife Pastel</strong> modunda kullanılabilir.
                </p>
              </div>
            </div>

            <div class="guide-card">
              <div class="card-icon-orb orange"><Timer :size="18" /></div>
              <div class="card-info">
                <h4 class="card-title">Bütünleşik Pomodoro Sayacı & Zen Odak Modu</h4>
                <p class="card-desc">
                  25 dakika odaklanma + 5 dakika mola döngüsüyle verimli ders çalışın. Sağ üstteki <strong>Zen Modu</strong> butonuna bastığınızda tüm menüler ve kenar çubukları gizlenir; yalnızca siz ve defter yaprağınız baş başa kalır.
                </p>
              </div>
            </div>

            <div class="guide-card">
              <div class="card-icon-orb red"><Lock :size="18" /></div>
              <div class="card-info">
                <h4 class="card-title">PIN Şifreli Özel Defter Kilidi</h4>
                <p class="card-desc">
                  Günlüklerinizi veya gizli notlarınızı meraklı gözlerden korumak için deftere özel 4 haneli PIN şifresi koyabilirsiniz. Kilitli defterler şifre girilmeden asla açılmaz.
                </p>
              </div>
            </div>
          </div>

          <!-- 5. KLAVYE KISAYOLLARI -->
          <div v-else-if="activeTab === 'shortcuts'" class="shortcuts-table-wrapper">
            <table class="shortcuts-table">
              <thead>
                <tr>
                  <th>Eylem</th>
                  <th>Kısayol Tuşu</th>
                  <th>Açıklama</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Kaydet</strong></td>
                  <td><kbd>Ctrl</kbd> + <kbd>S</kbd></td>
                  <td>Anında yerel veritabanına güvenle kaydeder.</td>
                </tr>
                <tr>
                  <td><strong>PDF / Baskı Al</strong></td>
                  <td><kbd>Ctrl</kbd> + <kbd>P</kbd></td>
                  <td>Gerçek ISO mm boyutlarında temiz yazıcı çıktısı veya PDF üretir.</td>
                </tr>
                <tr>
                  <td><strong>Geri Al (Undo)</strong></td>
                  <td><kbd>Ctrl</kbd> + <kbd>Z</kbd></td>
                  <td>Çizimdeki son hamleyi geri alır.</td>
                </tr>
                <tr>
                  <td><strong>İleri Al (Redo)</strong></td>
                  <td><kbd>Ctrl</kbd> + <kbd>Y</kbd></td>
                  <td>Geri alınan çizim hamlesini yineler.</td>
                </tr>
                <tr>
                  <td><strong>Menü Kapat / Rafa Dön</strong></td>
                  <td><kbd>ESC</kbd></td>
                  <td>Açık açılır pencereleri kapatır veya defterden kitaplık rafına döner.</td>
                </tr>
                <tr>
                  <td><strong>Metin Biçimlendirme</strong></td>
                  <td><kbd>Ctrl</kbd> + <kbd>B</kbd> / <kbd>I</kbd> / <kbd>U</kbd></td>
                  <td>Kalın, İtalik veya Altı Çizili metin stili uygular.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Footer -->
        <footer class="guide-footer">
          <div class="gf-left">
            <span>✨ Lumina Papelle</span>
            <span>•</span>
            <span>%100 Çevrimdışı, Güvenli ve Bağımsız</span>
          </div>
          <button type="button" class="gf-btn" @click="closeModal">
            Anladım, Deftere Dön
          </button>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import {
  X, Book, Layers, Sparkles, Maximize2, Highlighter, PenTool, Shapes, Ruler,
  EyeOff, StickyNote, Tag, Mic, CloudRain, Palette, Timer, Lock, Keyboard
} from '@lucide/vue';

const props = defineProps({
  isOpen: { type: Boolean, default: false }
});

const emit = defineEmits(['close']);

const activeTab = ref('paper');

const tabs = [
  { id: 'paper', label: 'Defter & Kağıt', icon: Book },
  { id: 'draw', label: 'Kalem & Çizim', icon: PenTool },
  { id: 'study', label: 'Aktif Hatırlama & Sınav', icon: EyeOff },
  { id: 'focus', label: 'Atmosfer & Odak', icon: CloudRain },
  { id: 'shortcuts', label: 'Kısayollar', icon: Keyboard }
];

function closeModal() {
  emit('close');
}

function onKeydown(e) {
  if (e.key === 'Escape' && props.isOpen) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    closeModal();
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown));
</script>

<style scoped>
.guide-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(10, 12, 19, 0.72);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.guide-modal-card {
  width: 100%;
  max-width: 920px;
  max-height: 88vh;
  background: var(--bg-surface, #FFFFFF);
  border-radius: 28px;
  border: 1px solid var(--border-color, rgba(148, 163, 184, 0.2));
  box-shadow: 0 28px 64px -16px rgba(0, 0, 0, 0.45);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: modalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

[data-theme="dark"] .guide-modal-card {
  background: #151824;
  border-color: rgba(255, 255, 255, 0.1);
}

@keyframes modalPop {
  0% { opacity: 0; transform: scale(0.96) translateY(8px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}

/* Header */
.guide-header {
  padding: 22px 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color, rgba(148, 163, 184, 0.15));
  background: var(--bg-surface-subtle, rgba(0, 0, 0, 0.02));
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-avatar-squircle {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
  flex-shrink: 0;
}

.brand-logo-img {
  width: 100%;
  height: 100%;
  display: block;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.guide-title {
  font-size: 20px;
  font-weight: 800;
  color: var(--color-text-main, #0F172A);
  letter-spacing: -0.3px;
}

[data-theme="dark"] .guide-title {
  color: #F8FAFC;
}

.version-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 99px;
  background: var(--color-primary-soft, rgba(244, 114, 182, 0.15));
  color: var(--color-primary, #DB2777);
  letter-spacing: 0.4px;
}

.guide-sub {
  font-size: 12.5px;
  color: var(--color-text-muted, #64748B);
  margin-top: 2px;
}

.guide-close-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid var(--border-color, rgba(148, 163, 184, 0.2));
  background: transparent;
  color: var(--color-text-muted, #64748B);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.18s;
}

.guide-close-btn:hover {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

/* Tabs */
.guide-tabs-nav {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 24px;
  border-bottom: 1px solid var(--border-color, rgba(148, 163, 184, 0.12));
  background: var(--bg-surface-subtle, rgba(0, 0, 0, 0.015));
  overflow-x: auto;
  scrollbar-width: none;
}

.guide-tabs-nav::-webkit-scrollbar {
  display: none;
}

.guide-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 99px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--color-text-muted, #64748B);
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.guide-tab-btn:hover {
  background: var(--bg-surface-subtle, rgba(0, 0, 0, 0.04));
  color: var(--color-text-main, #0F172A);
}

.guide-tab-btn.active {
  background: var(--color-primary-soft, rgba(244, 114, 182, 0.15));
  color: var(--color-primary, #DB2777);
  border-color: var(--border-color, rgba(244, 114, 182, 0.3));
  font-weight: 700;
}

/* Body */
.guide-body {
  flex: 1;
  padding: 24px 28px;
  overflow-y: auto;
  min-height: 380px;
}

.guide-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: 18px;
}

.guide-card {
  padding: 18px 20px;
  border-radius: 18px;
  background: var(--bg-surface-subtle, rgba(0, 0, 0, 0.025));
  border: 1px solid var(--border-color, rgba(148, 163, 184, 0.15));
  display: flex;
  align-items: flex-start;
  gap: 14px;
  transition: all 0.2s ease;
}

.guide-card:hover {
  transform: translateY(-2px);
  background: var(--bg-surface, #FFFFFF);
  box-shadow: 0 10px 24px -8px rgba(0, 0, 0, 0.08);
}

[data-theme="dark"] .guide-card:hover {
  background: #1C2030;
}

.card-icon-orb {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-icon-orb.blue { background: rgba(56, 189, 248, 0.15); color: #0284C7; }
.card-icon-orb.purple { background: rgba(168, 85, 247, 0.15); color: #9333EA; }
.card-icon-orb.green { background: rgba(34, 197, 94, 0.15); color: #16A34A; }
.card-icon-orb.pink { background: rgba(244, 114, 182, 0.15); color: #DB2777; }
.card-icon-orb.yellow { background: rgba(234, 179, 8, 0.15); color: #CA8A04; }
.card-icon-orb.orange { background: rgba(249, 115, 22, 0.15); color: #EA580C; }
.card-icon-orb.red { background: rgba(239, 68, 68, 0.15); color: #DC2626; }

.card-info {
  flex: 1;
}

.card-title {
  font-size: 14.5px;
  font-weight: 700;
  color: var(--color-text-main, #0F172A);
  margin-bottom: 6px;
}

[data-theme="dark"] .card-title {
  color: #F8FAFC;
}

.card-desc {
  font-size: 13px;
  line-height: 1.6;
  color: var(--color-text-muted, #64748B);
}

.card-tip {
  margin-top: 8px;
  padding: 6px 10px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.03);
  font-size: 11.5px;
  color: var(--color-text-muted, #475569);
  line-height: 1.5;
}

[data-theme="dark"] .card-tip {
  background: rgba(255, 255, 255, 0.04);
  color: #CBD5E1;
}

/* Shortcuts Table */
.shortcuts-table-wrapper {
  overflow-x: auto;
}

.shortcuts-table {
  width: 100%;
  border-collapse: collapse;
}

.shortcuts-table th {
  text-align: left;
  font-size: 11.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--color-text-muted, #64748B);
  padding: 10px 14px;
  border-bottom: 1.5px solid var(--border-color, rgba(148, 163, 184, 0.2));
}

.shortcuts-table td {
  padding: 12px 14px;
  font-size: 13px;
  color: var(--color-text-main, #0F172A);
  border-bottom: 1px solid var(--border-color, rgba(148, 163, 184, 0.1));
}

[data-theme="dark"] .shortcuts-table td {
  color: #F8FAFC;
}

kbd {
  display: inline-block;
  padding: 2px 7px;
  border-radius: 6px;
  background: var(--bg-surface-subtle, rgba(0, 0, 0, 0.06));
  border: 1px solid var(--border-color, rgba(148, 163, 184, 0.25));
  font-family: inherit;
  font-size: 11px;
  font-weight: 700;
  color: var(--color-primary, #DB2777);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

/* Footer */
.guide-footer {
  padding: 16px 28px;
  border-top: 1px solid var(--border-color, rgba(148, 163, 184, 0.15));
  background: var(--bg-surface-subtle, rgba(0, 0, 0, 0.02));
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.gf-left {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted, #64748B);
  display: flex;
  align-items: center;
  gap: 8px;
}

.gf-btn {
  padding: 8px 18px;
  border-radius: 99px;
  border: none;
  background: var(--color-primary, #DB2777);
  color: #FFFFFF;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s;
}

.gf-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Modal animation */
.fade-modal-enter-active,
.fade-modal-leave-active {
  transition: opacity 0.2s ease;
}

.fade-modal-enter-from,
.fade-modal-leave-to {
  opacity: 0;
}
</style>