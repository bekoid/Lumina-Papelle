<template>
  <div class="lumina-editor-root" :style="pageThemeStyle">
    <div class="editor-stage-column">
    <!-- FLOATING TOP MONOLITH CAPSULE -->
    <div class="monolith-wrapper no-print">
      <header class="lumina-top-monolith">
        <!-- Left: Back to Shelf + Inline Note Title + Save Dot -->
        <div class="mono-left">
          <button class="mono-pill-btn back-shelf-btn" @click="handleBackToShelf" title="Kitaplık Rafına Dön (ESC)">
            <ChevronLeft :size="17" />
            <span class="hide-xs">Raf</span>
          </button>

          <div class="title-capsule">
            <span class="save-dot" :class="{ saving: isSaving }" :title="isSaving ? 'Kaydediliyor...' : 'Tüm değişiklikler kaydedildi'"></span>
            <input
              type="text"
              v-model="localTitle"
              placeholder="Başlıksız Defter..."
              class="mono-title-input"
              @input="onTitleChange"
              @keydown="onTitleKeydown"
            />
          </div>
        </div>

        <!-- Center: 4 Clean Contextual Categories -->
        <nav class="mono-categories" aria-label="Editör Araç Kategorileri">
          <button
            class="cat-tab-btn"
            :class="{ active: activeCategoryTab === 'text' && isSubBarOpen }"
            @click="selectCategoryTab('text')"
          >
            <Type :size="15" />
            <span>Yazı</span>
          </button>

          <button
            class="cat-tab-btn"
            :class="{ active: activeCategoryTab === 'draw', 'draw-live': isDrawingMode }"
            @click="selectCategoryTab('draw')"
          >
            <PenTool :size="15" />
            <span>Kalem</span>
            <span v-if="isDrawingMode" class="live-dot"></span>
          </button>

          <button
            class="cat-tab-btn"
            :class="{ active: activeCategoryTab === 'insert' && isSubBarOpen }"
            @click="selectCategoryTab('insert')"
          >
            <Sparkles :size="15" />
            <span>Süsle & Ek</span>
          </button>

          <button
            class="cat-tab-btn"
            :class="{ active: activeCategoryTab === 'layout' && isSubBarOpen }"
            @click="selectCategoryTab('layout')"
          >
            <BookOpen :size="15" />
            <span>Düzen</span>
          </button>
        </nav>

        <!-- Right: Level Pill, Ambient Sound, Pomodoro, Zen, Favorite, Settings, Trash -->
        <div class="mono-right">
          <!-- Gamification Level Pill -->
          <button
            type="button"
            class="mono-level-pill"
            @click="$emit('open-badges')"
            :title="`Seviye ${currentLevel}: ${currentTitle} (%${levelProgressPercent} • Bu Hafta: ${formattedWeeklyHours})`"
          >
            <span class="lvl-emoji">{{ currentEmoji }}</span>
            <span class="lvl-txt hide-sm">Lv.{{ currentLevel }} {{ currentTitle }}</span>
            <span class="lvl-pct">%{{ levelProgressPercent }}</span>
            <div class="lvl-bar-track">
              <div class="lvl-bar-fill" :style="{ width: `${levelProgressPercent}%` }"></div>
            </div>
          </button>

          <!-- Offline Ambient Focus Sound Quick Pill -->
          <button
            class="mono-icon-pill"
            :class="{ active: activeAmbientSound !== 'off' }"
            @click="cycleAmbientSound"
            :title="`Odak Sesi: ${currentAmbientObj.name} (Değiştirmek için tıkla)`"
          >
            <span class="amb-emoji">{{ currentAmbientObj.emoji }}</span>
          </button>

          <!-- Pomodoro Focus Timer -->
          <div class="hide-sm">
            <PomodoroTimer />
          </div>

          <!-- Zen Focus Mode Toggle -->
          <button
            class="mono-icon-btn"
            :class="{ active: isZenMode }"
            @click="$emit('toggle-zen')"
            :title="isZenMode ? 'Zen Odak Modundan Çık' : 'Zen Odak Modu (Kenarları Gizle)'"
          >
            <Minimize2 v-if="isZenMode" :size="16" />
            <Maximize2 v-else :size="16" />
          </button>

          <!-- Favorite Star -->
          <button
            class="mono-icon-btn"
            :class="{ active: currentNote.isFavorite }"
            @click="toggleFavorite"
            :title="currentNote.isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'"
          >
            <Star
              :size="16"
              :fill="currentNote.isFavorite ? '#F59E0B' : 'none'"
              :color="currentNote.isFavorite ? '#F59E0B' : 'currentColor'"
            />
          </button>

          <!-- Trash -->
          <button class="mono-icon-btn danger" @click="handleTrash" title="Çöp Kutusuna Taşı">
            <Trash2 :size="16" />
          </button>
        </div>
      </header>

      <!-- MORPHING SINGLE-LINE CONTEXTUAL SUB-CAPSULE -->
      <Transition name="subbar-morph">
        <div v-if="isSubBarOpen && !isZenMode" class="lumina-sub-capsule">
          <!-- 1. YAZI (TYPOGRAPHY, SIZE, INK COLOR & FORMAT) -->
          <div v-if="activeCategoryTab === 'text'" class="sub-tools-track">
            <!-- Font Dropdown Selector -->
            <div class="sub-group font-dropdown-container" ref="fontPickerRef">
              <button
                type="button"
                class="sub-chip font-trigger-chip"
                :class="{ active: isFontDropdownOpen }"
                :style="{ fontFamily: currentNote.fontFamily || 'Plus Jakarta Sans' }"
                @click.stop="isFontDropdownOpen = !isFontDropdownOpen; isInkPaletteOpen = false; isHighlighterPaletteOpen = false"
                title="Yazı Tipini Değiştir (19 Seçkin Font)"
              >
                <Type :size="13" />
                <span class="font-active-label">{{ currentFontObj.name }}</span>
                <ChevronDown :size="12" class="pop-chevron" :class="{ open: isFontDropdownOpen }" />
              </button>

              <!-- Font Size Stepper -->
              <div class="font-size-stepper" title="Yazı Boyutu (Kelime seçip sadece seçileni büyütebilirsiniz)">
                <button
                  type="button"
                  class="stepper-btn"
                  @mousedown.prevent
                  @click="stepFontSize(-1)"
                  title="Yazıyı Küçült"
                >
                  <Minus :size="11" />
                </button>
                <span class="stepper-val">{{ currentNote.fontSize || 17 }}</span>
                <button
                  type="button"
                  class="stepper-btn"
                  @mousedown.prevent
                  @click="stepFontSize(1)"
                  title="Yazıyı Büyüt"
                >
                  <Plus :size="11" />
                </button>
              </div>

              <!-- Dropdown Popover -->
              <Transition name="fade-slide">
                <div v-if="isFontDropdownOpen" class="font-picker-popover" @click.stop>
                  <div class="f-pop-header">
                    <span class="f-pop-title">YAZI TİPLERİ (19 SEÇKİN FONT)</span>
                  </div>

                  <!-- Category Filter Tabs -->
                  <div class="f-cat-tabs">
                    <button
                      v-for="cat in FONT_CATEGORIES"
                      :key="cat.id"
                      type="button"
                      class="f-cat-btn"
                      :class="{ active: selectedFontCategory === cat.id }"
                      @click="selectedFontCategory = cat.id"
                    >
                      {{ cat.name }}
                    </button>
                  </div>

                  <!-- Scrollable List of Fonts with Live Preview -->
                  <div class="f-list-scroll">
                    <button
                      v-for="f in filteredFonts"
                      :key="f.id"
                      type="button"
                      class="f-item-row"
                      :class="{ active: (currentNote.fontFamily || 'Plus Jakarta Sans') === f.id }"
                      @click="selectFont(f.id)"
                    >
                      <div class="f-row-meta">
                        <span class="f-row-name" :style="{ fontFamily: f.id }">{{ f.name }}</span>
                        <span class="f-row-cat">{{ f.categoryName }}</span>
                      </div>
                      <span class="f-row-preview" :style="{ fontFamily: f.id }">Aa Göz Nuru Notlar</span>
                      <span v-if="(currentNote.fontFamily || 'Plus Jakarta Sans') === f.id" class="f-row-check">✓</span>
                    </button>
                  </div>
                </div>
              </Transition>
            </div>

            <span class="sub-sep"></span>

            <!-- Text Ink Color Picker -->
            <div class="sub-group ink-picker-container" ref="inkPickerRef">
              <button
                type="button"
                class="sub-chip ink-trigger-chip"
                :class="{ active: isInkPaletteOpen }"
                @click.stop="isInkPaletteOpen = !isInkPaletteOpen; isFontDropdownOpen = false; isHighlighterPaletteOpen = false"
                title="Yazı Mürekkep Rengi"
              >
                <span class="ink-color-drop" :style="{ backgroundColor: activeTextColor }"></span>
                <span>Mürekkep</span>
                <ChevronDown :size="11" class="pop-chevron" :class="{ open: isInkPaletteOpen }" />
              </button>

              <!-- Ink Palette Popover -->
              <Transition name="fade-slide">
                <div v-if="isInkPaletteOpen" class="ink-palette-popover" @click.stop>
                  <div class="ink-pop-title">DOLMA KALEM MÜREKKEPLERİ</div>
                  <div class="ink-swatches-grid">
                    <button
                      v-for="ink in INK_COLORS"
                      :key="ink.id"
                      type="button"
                      class="ink-orb-btn"
                      :class="{ active: activeTextColor === ink.color }"
                      :style="{ backgroundColor: ink.color }"
                      :title="ink.name"
                      @click="applyTextColor(ink.color)"
                    >
                      <span v-if="activeTextColor === ink.color" class="ink-check-ic" :style="{ color: ink.color === '#F8FAFC' ? '#0F172A' : '#FFFFFF' }">✓</span>
                    </button>
                  </div>
                </div>
              </Transition>
            </div>

            <span class="sub-sep"></span>

            <!-- Rich Text B / I / U / List -->
            <div class="sub-group">
              <button
                type="button"
                class="sub-icon-btn"
                :class="{ active: activeFormats.bold }"
                @mousedown.prevent
                @click="formatDoc('bold')"
                title="Kalın (Ctrl+B / Cmd+B)"
              >
                <Bold :size="15" />
              </button>
              <button
                type="button"
                class="sub-icon-btn"
                :class="{ active: activeFormats.italic }"
                @mousedown.prevent
                @click="formatDoc('italic')"
                title="İtalik (Ctrl+I / Cmd+I)"
              >
                <Italic :size="15" />
              </button>
              <button
                type="button"
                class="sub-icon-btn"
                :class="{ active: activeFormats.underline }"
                @mousedown.prevent
                @click="formatDoc('underline')"
                title="Altı Çizili (Ctrl+U / Cmd+U)"
              >
                <Underline :size="15" />
              </button>
              <button
                type="button"
                class="sub-icon-btn"
                :class="{ active: activeFormats.list }"
                @mousedown.prevent
                @click="formatDoc('insertUnorderedList')"
                title="Madde İşaretli Liste"
              >
                <List :size="15" />
              </button>
            </div>

            <span class="sub-sep"></span>

            <!-- Alignment (Left, Center, Right, Jilet Justify) -->
            <div class="sub-group">
              <button
                type="button"
                class="sub-icon-btn"
                :class="{ active: activeFormats.align === 'left' }"
                @mousedown.prevent
                @click="setAlignment('left')"
                title="Sola Yasla (Ctrl+Shift+L)"
              >
                <AlignLeft :size="15" />
              </button>
              <button
                type="button"
                class="sub-icon-btn"
                :class="{ active: activeFormats.align === 'center' }"
                @mousedown.prevent
                @click="setAlignment('center')"
                title="Ortala (Ctrl+Shift+E)"
              >
                <AlignCenter :size="15" />
              </button>
              <button
                type="button"
                class="sub-icon-btn"
                :class="{ active: activeFormats.align === 'right' }"
                @mousedown.prevent
                @click="setAlignment('right')"
                title="Sağa Yasla (Ctrl+Shift+R)"
              >
                <AlignRight :size="15" />
              </button>
              <button
                type="button"
                class="sub-chip"
                :class="{ active: activeFormats.align === 'justify' }"
                @mousedown.prevent
                @click="setAlignment('justify')"
                title="İki Yana Jilet Gibi Yasla"
              >
                <AlignJustify :size="14" />
                <span>Jilet</span>
              </button>
            </div>

            <span class="sub-sep"></span>

            <!-- Math Symbols -->
            <button class="sub-chip" @click="isMathModalOpen = true" title="Matematik & Bilim Sembolleri Ekle">
              <Calculator :size="14" />
              <span>Semboller</span>
            </button>

            <span class="sub-sep"></span>

            <!-- Pastel Text Highlighter (Fosforlu Metin Vurgulayıcı) -->
            <div class="sub-group highlighter-picker-group">
              <button
                type="button"
                class="sub-icon-btn hl-toggle-btn"
                :class="{ active: isHighlighterPaletteOpen }"
                @click.stop="isHighlighterPaletteOpen = !isHighlighterPaletteOpen; isFontDropdownOpen = false; isInkPaletteOpen = false"
                title="Metni Fosforlu Kalemle Vurgula"
              >
                <Highlighter :size="15" />
              </button>
              <div v-if="isHighlighterPaletteOpen" class="hl-colors-drop">
                <button
                  type="button"
                  class="hl-dot hl-yellow"
                  @mousedown.prevent="applyTextHighlight('#FEF08A')"
                  title="Pastel Sarı Fosfor"
                ></button>
                <button
                  type="button"
                  class="hl-dot hl-green"
                  @mousedown.prevent="applyTextHighlight('#A7F3D0')"
                  title="Nane Yeşili Fosfor"
                ></button>
                <button
                  type="button"
                  class="hl-dot hl-pink"
                  @mousedown.prevent="applyTextHighlight('#FBCFE8')"
                  title="Sakura Pembe Fosfor"
                ></button>
                <button
                  type="button"
                  class="hl-dot hl-blue"
                  @mousedown.prevent="applyTextHighlight('#BAE6FD')"
                  title="Buz Mavisi Fosfor"
                ></button>
                <button
                  type="button"
                  class="hl-dot hl-clear"
                  @mousedown.prevent="applyTextHighlight('transparent')"
                  title="Vurguyu Kaldır"
                >
                  <X :size="11" />
                </button>
              </div>
            </div>
          </div>

          <!-- 2. KALEM (DRAWING, PEN SLOTS, SMART SHAPE, RULER) -->
          <div v-else-if="activeCategoryTab === 'draw'" class="sub-tools-track">
            <!-- Toggle Draw On/Off -->
            <button
              class="sub-chip primary-toggle"
              :class="{ active: isDrawingMode }"
              @click="isDrawingMode = !isDrawingMode"
            >
              <component :is="isDrawingMode ? Pen : Type" :size="14" />
              <span>{{ isDrawingMode ? 'Çizim Açık' : 'Yazıya Dönüldü' }}</span>
            </button>

            <span class="sub-sep"></span>

            <!-- Brush Types -->
            <div class="sub-group">
              <button class="sub-icon-btn" :class="{ active: currentTool === 'pen' }" @click="activateTool('pen')" title="Dolma / Tükenmez Kalem">
                <PenTool :size="15" />
              </button>
              <button class="sub-icon-btn" :class="{ active: currentTool === 'highlighter' }" @click="activateTool('highlighter')" title="Fosforlu Kalem">
                <Highlighter :size="15" />
              </button>
              <button class="sub-icon-btn" :class="{ active: currentTool === 'pencil' }" @click="activateTool('pencil')" title="Dokulu Kurşun Kalem">
                <Edit3 :size="15" />
              </button>
              <button class="sub-icon-btn" :class="{ active: currentTool === 'eraser' }" @click="activateTool('eraser')" title="Silgi">
                <Eraser :size="15" />
              </button>
            </div>

            <span class="sub-sep"></span>

            <!-- 5 Quick Pen Slots + Detailed Pen Case Modal -->
            <div v-if="currentTool !== 'eraser'" class="sub-group">
              <button
                v-for="(slot, sIdx) in penSlots"
                :key="slot.id"
                class="pen-slot-orb"
                :class="{ active: activePenSlot === sIdx }"
                :style="{ backgroundColor: slot.color }"
                @click="selectPenSlot(sIdx)"
                :title="`${slot.name} (${slot.size}px)`"
              >
                <span>{{ Math.round(slot.size) }}</span>
              </button>

              <button class="sub-chip" :class="{ active: isPenCaseOpen }" @click="isPenCaseOpen = true" title="İncelik, Kalınlık & Opaklık Ayarları">
                <Sliders :size="13" />
                <span>Uç & Opaklık</span>
              </button>
            </div>

            <span class="sub-sep"></span>

            <!-- Smart Elastic Line & Acrylic Ruler & Clear -->
            <div class="sub-group">
              <button
                class="sub-chip"
                :class="{ active: isSmartShapeEnabled }"
                @click="isSmartShapeEnabled = !isSmartShapeEnabled"
                title="Çizip bekleyince otomatik düz çizgiye dönüşür"
              >
                <Shapes :size="14" />
                <span>Akıllı Çizgi</span>
              </button>

              <button
                class="sub-chip"
                :class="{ active: isRulerOpen }"
                @click="isRulerOpen = !isRulerOpen"
                title="Döndürülebilir Şeffaf Çizim Cetveli"
              >
                <Ruler :size="14" />
                <span>Cetvel</span>
              </button>

              <button class="sub-icon-btn" @click="undoActiveDrawing" title="Çizimi Geri Al (Ctrl+Z)">
                <Undo2 :size="15" />
              </button>
              <button class="sub-icon-btn" @click="redoActiveDrawing" title="Çizimi İleri Al (Ctrl+Y)">
                <Redo2 :size="15" />
              </button>
              <button class="sub-icon-btn" @click="handleClearCanvas" title="Bu Sayfanın Çizimini Temizle">
                <Trash2 :size="14" />
              </button>
            </div>
          </div>

          <!-- 3. SÜSLE & EKLER (STICKERS, WASHI TAPE, POST-IT, IMAGE, FILE) -->
          <div v-else-if="activeCategoryTab === 'insert'" class="sub-tools-track">
            <button class="sub-chip" @click="openStickerDrawer">
              <Smile :size="14" />
              <span>Şeffaf Çıkartma</span>
            </button>

            <button class="sub-chip" @click="openTapeDrawer">
              <EyeOff :size="14" />
              <span>Washi Bant</span>
            </button>

            <button class="sub-chip" @click="openStampDrawer">
              <Stamp :size="14" />
              <span>Vintage Kaşe & Mühür</span>
            </button>

            <button class="sub-chip" @click="addStickyNote">
              <StickyNote :size="14" />
              <span>Post-it</span>
            </button>

            <span class="sub-sep"></span>

            <button class="sub-chip" @click="triggerImagePicker">
              <Image :size="14" />
              <span>Resim</span>
            </button>
            <input ref="imageInputRef" type="file" accept="image/*" class="hidden-input" @change="onImageSelected" />

            <button class="sub-chip" @click="triggerFilePicker">
              <Paperclip :size="14" />
              <span>Dosya Ekle</span>
            </button>
            <input
              ref="fileInputRef"
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.csv"
              class="hidden-input"
              @change="onFilesSelected"
            />
          </div>

          <!-- 4. SAYFA DÜZENİ (PAGE SIZE, SLOTS, BOOK MODE, PATTERNS & TINTS, COVER, PIN, PRINT) -->
          <div v-else-if="activeCategoryTab === 'layout'" class="sub-tools-track">
            <!-- Paper Size Selector (A4, A5, A3, Tuval) -->
            <div class="sub-group">
              <button
                v-for="ps in PAPER_SIZES"
                :key="ps.id"
                type="button"
                class="sub-chip"
                :class="{ active: currentPaperSize === ps.id }"
                @click="selectPaperSize(ps.id)"
                :title="ps.desc"
              >
                <span>{{ ps.badge }}</span>
              </button>
            </div>

            <span class="sub-sep"></span>

            <!-- Toggle Visual Page Slots Wing -->
            <button
              type="button"
              class="sub-chip accent-chip"
              :class="{ active: isPageSlotsOpen }"
              @click="$emit('update:isPageSlotsOpen', !isPageSlotsOpen)"
            >
              <Layers :size="14" />
              <span>Slotlar ({{ localPages.length }})</span>
            </button>

            <!-- Single vs Book Spread Mode (Disabled for A3 & Canvas) -->
            <button
              type="button"
              class="sub-chip"
              :class="{ 
                active: isDoublePageMode && currentPaperSizeObj.allowBook,
                disabled: !currentPaperSizeObj.allowBook 
              }"
              :disabled="!currentPaperSizeObj.allowBook"
              @click="toggleDoublePageMode"
              :title="!currentPaperSizeObj.allowBook ? `${currentPaperSizeObj.name} için çift sayfa kapalıdır` : (isDoublePageMode ? 'Tek Sayfa Akışına Geç' : 'Kitap Formasına Geç (1-2)')"
            >
              <BookOpen :size="14" />
              <span>{{ (isDoublePageMode && currentPaperSizeObj.allowBook) ? 'Kitap (1-2)' : 'Tek Sayfa' }}</span>
            </button>

            <span class="sub-sep"></span>

            <!-- Scope Toggle: Active Page Only vs All Pages -->
            <button
              type="button"
              class="sub-chip"
              :class="{ active: topBarPaperScope === 'active' }"
              @click="topBarPaperScope = topBarPaperScope === 'active' ? 'all' : 'active'"
              :title="topBarPaperScope === 'active' ? 'Sadece aktif sayfayı özelleştirir (Tüm sayfalar için tıkla)' : 'Tüm sayfaları aynı anda özelleştirir (Sadece aktif sayfa için tıkla)'"
            >
              <span>{{ topBarPaperScope === 'active' ? `📄 Sadece S.${activePageIndex + 1}` : '📚 Tüm Sayfalar' }}</span>
            </button>

            <!-- Paper Patterns -->
            <div class="sub-group">
              <button
                v-for="pt in PAPER_TYPES"
                :key="pt.id"
                type="button"
                class="sub-chip"
                :class="{ active: topBarDisplayedType === pt.id }"
                @click="setPaperType(pt.id)"
              >
                {{ pt.name }}
              </button>
            </div>

            <span class="sub-sep"></span>

            <!-- Paper Color Tray (Day/Night Tray Toggle + 9 Swatches) -->
            <div class="sub-group paper-tray-group">
              <div class="paper-tray-mode-toggle" title="Açık veya Koyu Kağıt Tonları Arasında Geçiş Yap">
                <button
                  type="button"
                  class="tray-toggle-btn"
                  :class="{ active: paperTrayTone === 'light' }"
                  @click="paperTrayTone = 'light'"
                  title="Gündüz / Açık Kağıtlar"
                >
                  ☀️
                </button>
                <button
                  type="button"
                  class="tray-toggle-btn"
                  :class="{ active: paperTrayTone === 'dark' }"
                  @click="paperTrayTone = 'dark'"
                  title="Gece / Koyu Kağıtlar"
                >
                  🌙
                </button>
              </div>

              <div class="swatches-row">
                <button
                  v-for="color in activePalette"
                  :key="color.id"
                  type="button"
                  class="paper-dot-btn"
                  :class="{ active: topBarDisplayedColor === color.id }"
                  :style="{ backgroundColor: color.preview }"
                  :title="color.name"
                  @click="setPaperColor(color.id)"
                ></button>
              </div>
            </div>

            <span class="sub-sep"></span>

            <!-- Cover, PIN Lock, Print -->
            <div class="sub-group">
              <button class="sub-chip" @click="isCoverModalOpen = true" title="Defter Kapağını Değiştir">
                <Book :size="14" />
                <span>Kapak</span>
              </button>

              <button
                class="sub-chip"
                :class="{ active: currentNote.isLocked }"
                @click="isPinModalOpen = true"
                title="Defteri PIN ile Şifrele"
              >
                <Lock v-if="currentNote.isLocked" :size="14" />
                <Unlock v-else :size="14" />
                <span>{{ currentNote.isLocked ? 'Kilitli' : 'Şifrele' }}</span>
              </button>

              <button class="sub-icon-btn" @click="handlePrint" title="Yazdır / PDF Kaydet (Ctrl+P)">
                <Printer :size="15" />
              </button>

              <button class="sub-icon-btn" @click="copyActivePageAsImage" title="Sayfayı Yüksek Çözünürlüklü Resim (PNG) Olarak Kopyala / İndir">
                <Camera :size="15" />
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- PAPER STAGE SCROLL VIEWPORT -->
    <div class="paper-scroll-viewport" ref="scrollViewportRef" @scroll.passive="onViewportScroll">
      <div
        class="paper-stage-wrapper"
        :class="[
          `size-${currentPaperSize}`,
          { 
            'is-book-mode': isDoublePageMode && currentPaperSizeObj.allowBook,
            'is-canvas-mode': currentPaperSize === 'canvas'
          }
        ]"
        :style="{
          width: isPrintRenderAll ? 'auto' : `${targetStageWidth}px`,
          zoom: isPrintRenderAll ? '1' : stageScale
        }"
      >
        <div class="pages-main-column">
          <!-- Hanging Index Tabs -->
          <NotebookIndexTabs
            class="notebook-index-tabs"
            :tabs="localIndexTabs"
            @add-tab="addIndexTab"
            @delete-tab="deleteIndexTab"
            @select-tab="scrollToTab"
          />

          <!-- Whisper-Light Frosted Stationery Strip (Tags, Voice Recorder, Attachments) -->
          <div class="stationery-glass-strip no-print">
            <div class="tags-voice-row" @click.stop @pointerdown.stop>
              <div class="tags-pills-wrap">
                <span v-for="tag in localTags" :key="tag" class="lumina-tag">
                  #{{ tag }}
                  <button class="tag-x" @click.stop="removeTag(tag)">&times;</button>
                </span>

                <div class="tag-entry-pill" @click.stop @pointerdown.stop>
                  <input
                    type="text"
                    v-model="newTagInput"
                    placeholder="+ Etiket ekle"
                    class="tag-clean-input"
                    @click.stop
                    @pointerdown.stop
                    @keydown.stop
                    @keydown.enter.prevent="addTag"
                  />
                  <button
                    v-if="newTagInput.trim()"
                    class="tag-confirm-btn"
                    @click.stop="addTag"
                    title="Ekle"
                  >
                    <Plus :size="11" />
                  </button>
                </div>
              </div>

              <VoiceRecorder
                :memos="localVoiceMemos"
                @add-memo="addVoiceMemo"
                @delete="deleteVoiceMemo"
              />
            </div>

            <AttachmentList
              :attachments="localAttachments"
              @delete="removeAttachment"
            />
          </div>

          <!-- MODE A: SINGLE PAGE CONTINUOUS FLOW (Virtual Windowed for 1,300+ Pages) -->
          <div v-if="!isDoublePageMode" class="single-pages-list">
            <template v-for="(page, pIdx) in localPages" :key="page.id">
              <NotePageSheet
                v-if="shouldMountPage(pIdx)"
                :ref="el => setSheetRef(el, pIdx)"
                :page="page"
                :page-index="pIdx"
                :page-number="pIdx + 1"
                :total-pages="localPages.length"
                :is-active="activePageIndex === pIdx"
                :is-dark-mode="isDarkMode"
                :paper-size="currentPaperSize"
                :paper-type="page.paperType || currentNote.paperType"
                :paper-color="page.paperColor || currentNote.paperColor"
                :align="currentNote.align"
                :font-family="currentNote.fontFamily || 'Plus Jakarta Sans'"
                :font-size="currentNote.fontSize || 17"
                :text-color="currentColorConfig.text"
                :is-drawing-mode="isDrawingMode"
                :current-tool="currentTool"
                :brush-color="brushColor"
                :brush-size="brushSize"
                :brush-opacity="brushOpacity"
                :is-smart-shape="isSmartShapeEnabled"
                :is-book-mode="false"
                book-side="single"
                :selected-element-id="selectedElementId"
                @focus-page="activePageIndex = $event"
                @update-content="onPageContentUpdate"
                @update-drawings="onPageDrawingsUpdate"
                @update-images="onPageImagesUpdate"
                @transfer-image="onTransferImage"
                @update-stickies="onPageStickiesUpdate"
                @update-tapes="onPageTapesUpdate"
                @update-page-style="onSheetQuickStyleUpdate"
                @select-element="selectedElementId = $event"
                @add-page-after="onAddPageAfter"
                @delete-page="onDeletePage"
              />
              <div
                v-else
                :ref="el => setPlaceholderRef(el, pIdx)"
                class="virtual-sheet-placeholder"
                :class="`size-${currentPaperSize}`"
                :style="{ backgroundColor: getPageBgColor(page) }"
                @click="jumpToPage(pIdx)"
              >
                <div class="virtual-sheet-top">
                  <span class="virtual-page-badge">Sayfa {{ pIdx + 1 }} / {{ localPages.length }}</span>
                </div>
                <p class="virtual-sheet-excerpt">{{ page.excerpt || 'Sayfayı görüntülemek için dokunun...' }}</p>
                <span class="virtual-sheet-bottom">— {{ pIdx + 1 }} —</span>
              </div>
            </template>
          </div>

          <!-- MODE B: DOUBLE PAGE OPEN BOOK SPREADS (1-2, 3-4... Virtual Windowed) -->
          <div v-else class="book-spreads-list">
            <div
              v-for="spread in pageSpreads"
              :key="spread.spreadIndex"
              class="book-spread-row"
            >
              <!-- Left Page (Odd: 1, 3, 5...) -->
              <NotePageSheet
                v-if="shouldMountPage(spread.leftIndex)"
                :ref="el => setSheetRef(el, spread.leftIndex)"
                :page="spread.leftPage"
                :page-index="spread.leftIndex"
                :page-number="spread.leftIndex + 1"
                :total-pages="localPages.length"
                :is-active="activePageIndex === spread.leftIndex"
                :is-dark-mode="isDarkMode"
                :paper-size="currentPaperSize"
                :paper-type="spread.leftPage.paperType || currentNote.paperType"
                :paper-color="spread.leftPage.paperColor || currentNote.paperColor"
                :align="currentNote.align"
                :font-family="currentNote.fontFamily || 'Plus Jakarta Sans'"
                :font-size="currentNote.fontSize || 17"
                :text-color="currentColorConfig.text"
                :is-drawing-mode="isDrawingMode"
                :current-tool="currentTool"
                :brush-color="brushColor"
                :brush-size="brushSize"
                :brush-opacity="brushOpacity"
                :is-smart-shape="isSmartShapeEnabled"
                :is-book-mode="true"
                book-side="left"
                :selected-element-id="selectedElementId"
                @focus-page="activePageIndex = $event"
                @update-content="onPageContentUpdate"
                @update-drawings="onPageDrawingsUpdate"
                @update-images="onPageImagesUpdate"
                @transfer-image="onTransferImage"
                @update-stickies="onPageStickiesUpdate"
                @update-tapes="onPageTapesUpdate"
                @update-page-style="onSheetQuickStyleUpdate"
                @select-element="selectedElementId = $event"
                @add-page-after="onAddPageAfter"
                @delete-page="onDeletePage"
              />
              <div
                v-else
                :ref="el => setPlaceholderRef(el, spread.leftIndex)"
                class="virtual-sheet-placeholder is-book-mode book-side-left"
                :class="`size-${currentPaperSize}`"
                :style="{ backgroundColor: getPageBgColor(spread.leftPage) }"
                @click="jumpToPage(spread.leftIndex)"
              >
                <div class="virtual-sheet-top">
                  <span class="virtual-page-badge">Sayfa {{ spread.leftIndex + 1 }} / {{ localPages.length }}</span>
                </div>
                <p class="virtual-sheet-excerpt">{{ spread.leftPage.excerpt || 'Sayfayı görüntülemek için dokunun...' }}</p>
                <span class="virtual-sheet-bottom">— {{ spread.leftIndex + 1 }} —</span>
              </div>

              <!-- Center Stitched Book Spine -->
              <div class="book-spine-crease">
                <div class="spine-thread-line"></div>
              </div>

              <!-- Right Page (Even: 2, 4, 6...) or Add Right Page Placeholder -->
              <template v-if="spread.rightPage">
                <NotePageSheet
                  v-if="shouldMountPage(spread.rightIndex)"
                  :ref="el => setSheetRef(el, spread.rightIndex)"
                  :page="spread.rightPage"
                  :page-index="spread.rightIndex"
                  :page-number="spread.rightIndex + 1"
                  :total-pages="localPages.length"
                  :is-active="activePageIndex === spread.rightIndex"
                  :is-dark-mode="isDarkMode"
                  :paper-size="currentPaperSize"
                  :paper-type="spread.rightPage.paperType || currentNote.paperType"
                  :paper-color="spread.rightPage.paperColor || currentNote.paperColor"
                  :align="currentNote.align"
                  :font-family="currentNote.fontFamily || 'Plus Jakarta Sans'"
                  :font-size="currentNote.fontSize || 17"
                  :text-color="currentColorConfig.text"
                  :is-drawing-mode="isDrawingMode"
                  :current-tool="currentTool"
                  :brush-color="brushColor"
                  :brush-size="brushSize"
                  :brush-opacity="brushOpacity"
                  :is-smart-shape="isSmartShapeEnabled"
                  :is-book-mode="true"
                  book-side="right"
                  :selected-element-id="selectedElementId"
                  @focus-page="activePageIndex = $event"
                  @update-content="onPageContentUpdate"
                  @update-drawings="onPageDrawingsUpdate"
                  @update-images="onPageImagesUpdate"
                @transfer-image="onTransferImage"
                  @update-stickies="onPageStickiesUpdate"
                  @update-tapes="onPageTapesUpdate"
                  @update-page-style="onSheetQuickStyleUpdate"
                  @select-element="selectedElementId = $event"
                  @add-page-after="onAddPageAfter"
                  @delete-page="onDeletePage"
                />
                <div
                  v-else
                  :ref="el => setPlaceholderRef(el, spread.rightIndex)"
                  class="virtual-sheet-placeholder is-book-mode book-side-right"
                  :class="`size-${currentPaperSize}`"
                  :style="{ backgroundColor: getPageBgColor(spread.rightPage) }"
                  @click="jumpToPage(spread.rightIndex)"
                >
                  <div class="virtual-sheet-top">
                    <span class="virtual-page-badge">Sayfa {{ spread.rightIndex + 1 }} / {{ localPages.length }}</span>
                  </div>
                  <p class="virtual-sheet-excerpt">{{ spread.rightPage.excerpt || 'Sayfayı görüntülemek için dokunun...' }}</p>
                  <span class="virtual-sheet-bottom">— {{ spread.rightIndex + 1 }} —</span>
                </div>
              </template>
              <div v-else class="book-right-placeholder no-print" @click="addNewPage()">
                <div class="placeholder-inner">
                  <Plus :size="24" />
                  <span class="pl-title">Sayfa {{ spread.rightIndex + 1 }} Aç</span>
                  <span class="pl-desc">Kitabın sağ yaprağını oluşturmak için dokunun</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Add Page Pill Banner -->
          <button type="button" class="add-new-page-banner no-print" @click="addNewPage()">
            <Plus :size="16" />
            <span>Yeni Sayfa Aç (Sayfa {{ localPages.length + 1 }})</span>
          </button>
        </div>

        <!-- Floating Interactive Acrylic Ruler -->
        <InteractiveRuler
          :is-open="isRulerOpen"
          @close="isRulerOpen = false"
        />

        <!-- Floating Selection Mini-Toolbar Capsule -->
        <Transition name="floating-capsule">
          <div
            v-if="floatingBar.visible"
            class="selection-floating-capsule no-print"
            :style="{
              left: `${floatingBar.x}px`,
              top: `${floatingBar.y}px`
            }"
            @mousedown.prevent
          >
            <!-- Bold -->
            <button
              type="button"
              class="float-icon-btn"
              :class="{ active: activeFormats.bold }"
              @mousedown.prevent="execFormat('bold')"
              title="Kalın (Ctrl+B)"
            >
              <Bold :size="14" />
            </button>

            <!-- Italic -->
            <button
              type="button"
              class="float-icon-btn"
              :class="{ active: activeFormats.italic }"
              @mousedown.prevent="execFormat('italic')"
              title="İtalik (Ctrl+I)"
            >
              <Italic :size="14" />
            </button>

            <!-- Underline -->
            <button
              type="button"
              class="float-icon-btn"
              :class="{ active: activeFormats.underline }"
              @mousedown.prevent="execFormat('underline')"
              title="Alt Çizgi (Ctrl+U)"
            >
              <Underline :size="14" />
            </button>

            <span class="float-divider"></span>

            <!-- Font Size Stepper -->
            <button
              type="button"
              class="float-stepper-btn"
              @mousedown.prevent="stepFontSize(-1)"
              title="Seçili Kelimeleri Küçült (-)"
            >
              <Minus :size="12" />
            </button>
            <span class="float-size-label">{{ currentNote.fontSize || 17 }}</span>
            <button
              type="button"
              class="float-stepper-btn"
              @mousedown.prevent="stepFontSize(1)"
              title="Seçili Kelimeleri Büyüt (+)"
            >
              <Plus :size="12" />
            </button>

            <span class="float-divider"></span>

            <!-- Alignments -->
            <button
              type="button"
              class="float-icon-btn"
              :class="{ active: activeFormats.align === 'left' }"
              @mousedown.prevent="setAlignment('left')"
              title="Sola Hizala"
            >
              <AlignLeft :size="14" />
            </button>

            <button
              type="button"
              class="float-icon-btn"
              :class="{ active: activeFormats.align === 'center' }"
              @mousedown.prevent="setAlignment('center')"
              title="Ortala"
            >
              <AlignCenter :size="14" />
            </button>

            <button
              type="button"
              class="float-icon-btn"
              :class="{ active: activeFormats.align === 'right' }"
              @mousedown.prevent="setAlignment('right')"
              title="Sağa Hizala"
            >
              <AlignRight :size="14" />
            </button>

            <span class="float-divider"></span>

            <!-- Pastel Highlighters in Floating Capsule -->
            <button
              type="button"
              class="float-hl-dot hl-yellow"
              @mousedown.prevent="applyTextHighlight('#FEF08A')"
              title="Pastel Sarı Fosfor"
            ></button>
            <button
              type="button"
              class="float-hl-dot hl-green"
              @mousedown.prevent="applyTextHighlight('#A7F3D0')"
              title="Nane Yeşili Fosfor"
            ></button>
            <button
              type="button"
              class="float-hl-dot hl-pink"
              @mousedown.prevent="applyTextHighlight('#FBCFE8')"
              title="Sakura Pembe Fosfor"
            ></button>
            <button
              type="button"
              class="float-hl-dot hl-blue"
              @mousedown.prevent="applyTextHighlight('#BAE6FD')"
              title="Buz Mavisi Fosfor"
            ></button>
            <button
              type="button"
              class="float-hl-dot hl-clear"
              @mousedown.prevent="applyTextHighlight('transparent')"
              title="Vurguyu Kaldır"
            >
              <X :size="10" />
            </button>
          </div>
        </Transition>

        <!-- Copy Page Image Feedback Toast -->
        <Transition name="fade-slide">
          <div v-if="copyToast" class="editor-global-toast no-print">
            <Camera :size="14" />
            <span>{{ copyToast }}</span>
          </div>
        </Transition>
      </div>
    </div>
  </div>

    <!-- DOCKED FROSTED-GLASS PAGE SLOTS & FORMA WING (Stable, Non-Blurring like Klasörler!) -->
    <PageSlotsDrawer
      :is-open="isPageSlotsOpen"
      :pages="localPages"
      :active-page-index="activePageIndex"
      :is-double-page-mode="isDoublePageMode"
      :paper-size="currentPaperSize"
      :paper-type="currentNote.paperType"
      :paper-color="currentNote.paperColor"
      :palette="activePalette"
      @close="$emit('update:isPageSlotsOpen', false)"
      @select-page="jumpToPage"
      @add-page="addNewPage()"
      @add-page-after="onAddPageAfter"
      @delete-page="onDeletePage"
      @update:double-page-mode="setDoublePageMode"
      @change-paper-size="selectPaperSize"
      @apply-paper-style="onApplyPaperStyle"
    />

    <!-- MODALS -->
    <PinModal
      v-if="isPinModalOpen"
      :mode="'set'"
      :current-pin="currentNote.pin"
      @close="isPinModalOpen = false"
      @success="onPinSet"
      @remove-pin="onPinRemove"
    />

    <CoverPickerModal
      v-if="isCoverModalOpen"
      :current-cover="currentNote.coverStyle"
      @close="isCoverModalOpen = false"
      @select="onCoverSelect"
    />

    <StickerDrawerModal
      v-if="isStickerModalOpen"
      :initial-tab="stickerDrawerTab"
      @close="isStickerModalOpen = false"
      @select-sticker="onStickerSelect"
      @select-tape="onTapeSelect"
    />

    <MathModal
      v-if="isMathModalOpen"
      @close="isMathModalOpen = false"
      @insert="onMathSymbolInsert"
    />

    <PenCaseModal
      :is-open="isPenCaseOpen"
      :active-slot-index="activePenSlot"
      :slots="penSlots"
      :current-pen="{ tool: currentTool, color: brushColor, size: brushSize, opacity: brushOpacity }"
      @close="isPenCaseOpen = false"
      @update-pen="onUpdatePen"
      @update-slot="onUpdateSlot"
      @select-slot="selectPenSlot"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick, provide } from 'vue';
import {
  ChevronLeft, Star, Trash2, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  PenTool, Highlighter, Edit3, Eraser, RotateCcw, Pen, Type,
  Bold, Italic, Underline, List, Printer, Maximize2, Minimize2,
  Image, Paperclip, StickyNote, Shapes, Lock, Unlock, Book,
  Ruler, EyeOff, Smile, Calculator, Plus, Minus, ChevronDown, BookOpen, Sliders, Sparkles, Layers,
  Undo2, Redo2, Stamp, Camera, X
} from '@lucide/vue';
import { LIGHT_PASTEL_COLORS, DARK_PASTEL_COLORS, PAPER_TYPES, PAPER_SIZES, resolvePaperColor } from '../composables/useNotes.js';
import { useSettings, AMBIENT_SOUNDS, FONT_OPTIONS, FONT_CATEGORIES, playKeystrokeSound } from '../composables/useSettings.js';
import { useGamification, playPaperRustle } from '../composables/useGamification.js';

import AttachmentList from './AttachmentList.vue';
import PinModal from './PinModal.vue';
import CoverPickerModal from './CoverPickerModal.vue';
import PomodoroTimer from './PomodoroTimer.vue';
import InteractiveRuler from './InteractiveRuler.vue';
import VoiceRecorder from './VoiceRecorder.vue';
import StickerDrawerModal from './StickerDrawerModal.vue';
import NotebookIndexTabs from './NotebookIndexTabs.vue';
import MathModal from './MathModal.vue';
import NotePageSheet from './NotePageSheet.vue';
import PenCaseModal from './PenCaseModal.vue';
import PageSlotsDrawer from './PageSlotsDrawer.vue';

const props = defineProps({
  note: { type: Object, required: true },
  isDarkMode: { type: Boolean, default: false },
  isZenMode: { type: Boolean, default: false },
  isPageSlotsOpen: { type: Boolean, default: false },
  hasOpenGlobalModal: { type: Boolean, default: false }
});

const emit = defineEmits([
  'back',
  'update',
  'toggle-favorite',
  'delete',
  'toggle-zen',
  'update:isPageSlotsOpen',
  'page-stats',
  'open-badges',
  'open-spotlight'
]);

const { settings, activeAmbientSound, cycleAmbientSound } = useSettings();
const {
  currentLevel,
  levelProgressPercent,
  currentTitle,
  currentEmoji,
  formattedWeeklyHours
} = useGamification();

const currentAmbientObj = computed(() => {
  return AMBIENT_SOUNDS.find(s => s.id === activeAmbientSound.value) || AMBIENT_SOUNDS[0];
});

const currentNote = computed(() => props.note);
const localTitle = ref(props.note.title || '');
const isSaving = ref(false);

function initPagesFromNote(note) {
  const fallbackType = note?.paperType || 'lined';
  const fallbackColor = note?.paperColor || 'cream';
  if (note?.pages && Array.isArray(note.pages) && note.pages.length > 0) {
    return note.pages.map((p, idx) => ({
      ...p,
      pageNumber: idx + 1,
      paperType: p.paperType || fallbackType,
      paperColor: p.paperColor || fallbackColor,
      content: p.content || (idx === 0 ? note.content : '') || '',
      drawings: p.drawings || (idx === 0 ? note.drawings : null) || null,
      images: p.images ? [...p.images] : (idx === 0 && note.images ? [...note.images] : []),
      stickies: p.stickies ? [...p.stickies] : (idx === 0 && note.stickies ? [...note.stickies] : []),
      tapes: p.tapes ? [...p.tapes] : (idx === 0 && note.tapes ? [...note.tapes] : [])
    }));
  }
  return [
    {
      id: `page_${note?.id || Date.now()}_1`,
      pageNumber: 1,
      paperType: fallbackType,
      paperColor: fallbackColor,
      content: note?.content || '',
      drawings: note?.drawings || null,
      images: note?.images ? [...note.images] : [],
      stickies: note?.stickies ? [...note.stickies] : [],
      tapes: note?.tapes ? [...note.tapes] : []
    }
  ];
}

const localPages = ref(initPagesFromNote(props.note));

// Contextual Top Bar Categories ('text', 'draw', 'insert', 'layout')
const activeCategoryTab = ref('text');
const isSubBarOpen = ref(true);

function selectCategoryTab(tab) {
  if (activeCategoryTab.value === tab) {
    if (tab === 'draw') {
      isDrawingMode.value = !isDrawingMode.value;
    } else {
      isSubBarOpen.value = !isSubBarOpen.value;
    }
    return;
  }
  activeCategoryTab.value = tab;
  isSubBarOpen.value = true;
  if (tab === 'draw') {
    isDrawingMode.value = true;
  } else if (tab === 'text') {
    isDrawingMode.value = false;
  }
}

// Typography, Font Dropdown & Ink Color State
const isFontDropdownOpen = ref(false);
const selectedFontCategory = ref('all');
const isInkPaletteOpen = ref(false);
const activeTextColor = ref('#1E293B');

const fontPickerRef = ref(null);
const inkPickerRef = ref(null);

const INK_COLORS = [
  { id: 'slate', name: 'Kömür Siyahı', color: '#0F172A' },
  { id: 'navy', name: 'Gece Mavisi (Dolma Kalem)', color: '#1E3A8A' },
  { id: 'espresso', name: 'Espresso Kahve', color: '#451A03' },
  { id: 'emerald', name: 'Zümrüt Yeşili', color: '#064E3B' },
  { id: 'terracotta', name: 'Kiremit & Terracotta', color: '#9A3412' },
  { id: 'burgundy', name: 'Asil Bordo', color: '#881337' },
  { id: 'plum', name: 'Koyu Mürdüm', color: '#581C87' },
  { id: 'honey', name: 'Bal & Hardal', color: '#B45309' },
  { id: 'rose', name: 'Pastel Gül', color: '#BE185D' },
  { id: 'chalk', name: 'Tebeşir Beyazı (Gece Kağıdı)', color: '#F8FAFC' }
];

const currentFontObj = computed(() => {
  const currentId = currentNote.value.fontFamily || 'Plus Jakarta Sans';
  return FONT_OPTIONS.find(f => f.id === currentId) || FONT_OPTIONS[0];
});

const filteredFonts = computed(() => {
  if (selectedFontCategory.value === 'all') return FONT_OPTIONS;
  return FONT_OPTIONS.filter(f => f.category === selectedFontCategory.value);
});

function selectFont(fontId) {
  scheduleSave({ fontFamily: fontId });
  isFontDropdownOpen.value = false;
}

function onTitleKeydown(e) {
  if (['Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(e.key)) return;
  playKeystrokeSound();
}

// ----------------- PASTEL TEXT HIGHLIGHTER -----------------
const isHighlighterPaletteOpen = ref(false);

function applyTextHighlight(color) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
  try {
    if (color === 'transparent') {
      document.execCommand('hiliteColor', false, 'transparent');
    } else {
      document.execCommand('hiliteColor', false, color);
    }
  } catch (e) {}
  isHighlighterPaletteOpen.value = false;
  updateActiveFormats();
}

// ----------------- DRAWING UNDO / REDO -----------------
function undoActiveDrawing() {
  const sheet = sheetRefs[activePageIndex.value];
  if (sheet?.undoDrawing) {
    sheet.undoDrawing();
  }
}

function redoActiveDrawing() {
  const sheet = sheetRefs[activePageIndex.value];
  if (sheet?.redoDrawing) {
    sheet.redoDrawing();
  }
}

function openStampDrawer() {
  stickerDrawerTab.value = 'stamps';
  isStickerModalOpen.value = true;
}

// ----------------- COPY PAGE AS HIGH-RES IMAGE -----------------
const copyToast = ref('');
let copyToastTimer = null;

function showCopyToast(msg) {
  copyToast.value = msg;
  if (copyToastTimer) clearTimeout(copyToastTimer);
  copyToastTimer = setTimeout(() => { copyToast.value = ''; }, 2800);
}

async function copyActivePageAsImage() {
  try {
    const sheet = sheetRefs[activePageIndex.value];
    const sheetEl = sheet?.getSheetElement ? sheet.getSheetElement() : null;
    if (!sheetEl) return;

    const rect = sheetEl.getBoundingClientRect();
    const canvas = document.createElement('canvas');
    const scale = 2; // Crisp Retina
    canvas.width = rect.width * scale;
    canvas.height = rect.height * scale;
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    ctx.fillStyle = getComputedStyle(sheetEl).backgroundColor || '#FAF8F5';
    ctx.fillRect(0, 0, rect.width, rect.height);

    const clone = sheetEl.cloneNode(true);
    clone.querySelectorAll('.sheet-top-header, .sheet-bottom-dock, .no-print').forEach(el => el.remove());
    clone.style.transform = 'none';
    clone.style.margin = '0';
    clone.style.position = 'static';
    clone.style.boxShadow = 'none';

    const xml = new XMLSerializer().serializeToString(clone);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}">
      <foreignObject width="100%" height="100%">${xml}</foreignObject>
    </svg>`;

    const img = new Image();
    const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);

    img.onload = async () => {
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(blobURL);
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          if (navigator.clipboard && navigator.clipboard.write) {
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            showCopyToast('Sayfa panoya resim olarak kopyalandı! (Ctrl+V)');
          } else {
            const link = document.createElement('a');
            link.download = `${localTitle.value || 'Lumina_Not'}_Sayfa_${activePageIndex.value + 1}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            showCopyToast('Sayfa resmi indirildi!');
          }
        } catch (err) {
          const link = document.createElement('a');
          link.download = `${localTitle.value || 'Lumina_Not'}_Sayfa_${activePageIndex.value + 1}.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
          showCopyToast('Sayfa resmi indirildi!');
        }
      }, 'image/png');
    };
    img.src = blobURL;
  } catch (e) {
    console.warn('Copy page error:', e);
  }
}

const floatingBar = ref({
  visible: false,
  x: 0,
  y: 0
});

const activeFormats = ref({
  bold: false,
  italic: false,
  underline: false,
  list: false,
  align: 'left'
});

function updateActiveFormats() {
  if (typeof document === 'undefined') return;
  try {
    activeFormats.value.bold = document.queryCommandState('bold');
    activeFormats.value.italic = document.queryCommandState('italic');
    activeFormats.value.underline = document.queryCommandState('underline');
    activeFormats.value.list = document.queryCommandState('insertUnorderedList');

    if (document.queryCommandState('justifyCenter')) {
      activeFormats.value.align = 'center';
    } else if (document.queryCommandState('justifyRight')) {
      activeFormats.value.align = 'right';
    } else if (document.queryCommandState('justifyFull')) {
      activeFormats.value.align = 'justify';
    } else if (document.queryCommandState('justifyLeft')) {
      activeFormats.value.align = 'left';
    } else {
      activeFormats.value.align = currentNote.value?.align || 'left';
    }

    // Floating selection toolbar position
    const sel = window.getSelection();
    if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
      const text = sel.toString().trim();
      if (text.length > 0) {
        const range = sel.getRangeAt(0);
        let parent = range.commonAncestorContainer;
        if (parent.nodeType === 3) parent = parent.parentNode;
        if (parent && parent.closest && parent.closest('.note-editable-area')) {
          const rect = range.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            floatingBar.value = {
              visible: true,
              x: Math.max(16, Math.min(window.innerWidth - 320, rect.left + rect.width / 2 - 130)),
              y: Math.max(68, rect.top - 52)
            };
            return;
          }
        }
      }
    }
    floatingBar.value.visible = false;
  } catch (e) {
    floatingBar.value.visible = false;
  }
}

function stepFontSize(delta) {
  const sel = window.getSelection();
  if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
    applySelectionFontSize(delta);
    return;
  }
  const cur = currentNote.value.fontSize || 17;
  const next = Math.min(36, Math.max(12, cur + delta));
  scheduleSave({ fontSize: next });
}

function applySelectionFontSize(delta) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
  const range = sel.getRangeAt(0);

  let node = sel.anchorNode;
  if (node && node.nodeType === 3) node = node.parentNode;
  let currentPx = currentNote.value.fontSize || 17;
  if (node && window.getComputedStyle) {
    const computed = parseInt(window.getComputedStyle(node).fontSize, 10);
    if (!isNaN(computed) && computed > 0) currentPx = computed;
  }
  const targetPx = Math.min(48, Math.max(11, currentPx + (delta * 2)));

  document.execCommand('styleWithCSS', false, true);
  try {
    const span = document.createElement('span');
    span.style.fontSize = `${targetPx}px`;
    span.appendChild(range.extractContents());
    range.insertNode(span);

    // Keep selection highlighted so user can step size multiple times
    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    sel.removeAllRanges();
    sel.addRange(newRange);
  } catch (e) {
    document.execCommand('fontSize', false, delta > 0 ? '5' : '2');
  }

  flushSave();
}

function applyTextColor(color) {
  activeTextColor.value = color;
  document.execCommand('styleWithCSS', false, true);
  document.execCommand('foreColor', false, color);
  isInkPaletteOpen.value = false;
}

// Modals & Stationery State
const isPinModalOpen = ref(false);
const isCoverModalOpen = ref(false);
const isRulerOpen = ref(false);
const isStickerModalOpen = ref(false);
const stickerDrawerTab = ref('tapes');
const isMathModalOpen = ref(false);

const localAttachments = ref(props.note.attachments ? [...props.note.attachments] : []);
const localVoiceMemos = ref(props.note.voiceMemos ? [...props.note.voiceMemos] : []);
const localIndexTabs = ref(props.note.indexTabs ? [...props.note.indexTabs] : []);
const localTags = ref(props.note.tags ? [...props.note.tags] : []);
const newTagInput = ref('');
const selectedElementId = ref(null);

const imageInputRef = ref(null);
const fileInputRef = ref(null);
const scrollViewportRef = ref(null);

// ----------------- PAPER SIZES, MULTI-PAGE & SMART FIT SCALING -----------------
const currentPaperSize = computed(() => props.note.paperSize || 'a4');
const currentPaperSizeObj = computed(() => {
  return PAPER_SIZES.find(s => s.id === currentPaperSize.value) || PAPER_SIZES[0];
});

function selectPaperSize(sizeId) {
  const target = PAPER_SIZES.find(s => s.id === sizeId) || PAPER_SIZES[0];
  let newDouble = isDoublePageMode.value;
  if (!target.allowBook) {
    newDouble = false;
    isDoublePageMode.value = false;
  }
  scheduleSave({
    paperSize: sizeId,
    isDoublePage: newDouble
  });
  nextTick(() => updateStageScale());
}

const isDoublePageMode = ref(
  props.note.isDoublePage !== undefined
    ? (currentPaperSizeObj.value.allowBook ? !!props.note.isDoublePage : false)
    : (currentPaperSizeObj.value.allowBook ? !!settings.value.defaultBookMode : false)
);

const targetStageWidth = computed(() => {
  const size = currentPaperSize.value;
  if (isDoublePageMode.value && currentPaperSizeObj.value.allowBook) {
    if (size === 'a5') return 898;
    return 1138; // A4 book
  }
  if (size === 'a5') return 560;
  if (size === 'a3') return 1123;
  if (size === 'canvas') return 1200;
  return 794; // A4
});

const stageScale = ref(1);
provide('stageScale', stageScale);

let viewportResizeObserver = null;
function updateStageScale() {
  if (!scrollViewportRef.value) return;
  const viewportW = scrollViewportRef.value.clientWidth;
  const padding = viewportW < 600 ? 16 : 40;
  const avail = Math.max(260, viewportW - padding);
  const targetW = targetStageWidth.value;
  if (avail < targetW) {
    stageScale.value = Math.max(0.35, Math.min(1.0, avail / targetW));
  } else {
    stageScale.value = 1.0;
  }
}

watch([targetStageWidth, () => props.isPageSlotsOpen], () => {
  nextTick(() => updateStageScale());
});

const activePageIndex = ref(0);
const viewportScrollTop = ref(0);
const isPrintRenderAll = ref(false);
const sheetRefs = {};
const placeholderRefs = {};
let scrollRafId = null;

function setSheetRef(el, idx) {
  if (el) sheetRefs[idx] = el;
  else delete sheetRefs[idx];
}

function setPlaceholderRef(el, idx) {
  if (el) placeholderRefs[idx] = el;
  else delete placeholderRefs[idx];
}

function onViewportScroll(e) {
  const top = e.target.scrollTop;
  if (scrollRafId) return;
  scrollRafId = requestAnimationFrame(() => {
    viewportScrollTop.value = top;
    scrollRafId = null;
  });
}

const scrollCenterPageIndex = computed(() => {
  const offsetTop = Math.max(0, viewportScrollTop.value - 80);
  const size = currentPaperSize.value;
  let singleH = 1123 + 28;
  let spreadH = 794 + 36;
  if (size === 'a5') { singleH = 794 + 28; spreadH = 622 + 36; }
  else if (size === 'a3') { singleH = 1588 + 28; }
  else if (size === 'canvas') { singleH = 1200 + 28; }

  if (isDoublePageMode.value && currentPaperSizeObj.value.allowBook) {
    const spreadIdx = Math.floor(offsetTop / spreadH);
    return Math.min(localPages.value.length - 1, spreadIdx * 2);
  }
  return Math.min(localPages.value.length - 1, Math.floor(offsetTop / singleH));
});

let isProgrammaticScrolling = false;
let programmaticScrollTimeout = null;

function setProgrammaticScroll() {
  isProgrammaticScrolling = true;
  if (programmaticScrollTimeout) clearTimeout(programmaticScrollTimeout);
  programmaticScrollTimeout = setTimeout(() => {
    isProgrammaticScrolling = false;
  }, 700);
}

watch(scrollCenterPageIndex, (newIdx) => {
  if (isProgrammaticScrolling) return;
  if (newIdx >= 0 && newIdx < localPages.value.length && activePageIndex.value !== newIdx) {
    activePageIndex.value = newIdx;
  }
});

function shouldMountPage(pIdx) {
  if (isPrintRenderAll.value || localPages.value.length <= 30) return true;
  if (Math.abs(pIdx - activePageIndex.value) <= 2) return true;
  if (Math.abs(pIdx - scrollCenterPageIndex.value) <= 4) return true;
  return false;
}

function getPageBgColor(page) {
  const colorId = page?.paperColor || currentNote.value.paperColor || 'cream';
  const found = resolvePaperColor(colorId, props.isDarkMode);
  return found.bg;
}


// Emit live page stats for App.vue Magnetic Edge Tab badge
watch([() => localPages.value.length, activePageIndex], () => {
  emit('page-stats', {
    current: activePageIndex.value + 1,
    total: localPages.value.length
  });
}, { immediate: true });

const pageSpreads = computed(() => {
  const spreads = [];
  for (let i = 0; i < localPages.value.length; i += 2) {
    spreads.push({
      spreadIndex: Math.floor(i / 2),
      leftPage: localPages.value[i],
      leftIndex: i,
      rightPage: localPages.value[i + 1] || null,
      rightIndex: i + 1
    });
  }
  return spreads;
});

function toggleDoublePageMode() {
  if (!currentPaperSizeObj.value.allowBook) return;
  isDoublePageMode.value = !isDoublePageMode.value;
  scheduleSave({ isDoublePage: isDoublePageMode.value });
  nextTick(() => updateStageScale());
}

function setDoublePageMode(val) {
  if (val && !currentPaperSizeObj.value.allowBook) return;
  isDoublePageMode.value = !!val;
  scheduleSave({ isDoublePage: isDoublePageMode.value });
  nextTick(() => updateStageScale());
}

function scrollToSheet(pIdx) {
  setProgrammaticScroll();
  const clamped = Math.max(0, Math.min(localPages.value.length - 1, pIdx));
  activePageIndex.value = clamped;

  nextTick(() => {
    const sheetComp = sheetRefs[clamped];
    const domEl = sheetComp?.sheetRootRef || sheetComp?.getSheetElement?.() || sheetComp?.$el || placeholderRefs[clamped];

    if (domEl && scrollViewportRef.value) {
      const containerRect = scrollViewportRef.value.getBoundingClientRect();
      const elRect = domEl.getBoundingClientRect();
      const relativeTop = elRect.top - containerRect.top + scrollViewportRef.value.scrollTop;
      scrollViewportRef.value.scrollTo({
        top: Math.max(0, relativeTop - 24),
        behavior: 'smooth'
      });
      setTimeout(() => {
        sheetComp?.focusText?.();
      }, 350);
      return;
    }

    if (scrollViewportRef.value) {
      const size = currentPaperSize.value;
      let singleH = 1123 + 28;
      let spreadH = 794 + 36;
      if (size === 'a5') { singleH = 794 + 28; spreadH = 622 + 36; }
      else if (size === 'a3') { singleH = 1588 + 28; }
      else if (size === 'canvas') { singleH = 1200 + 28; }

      const approxTop = (isDoublePageMode.value && currentPaperSizeObj.value.allowBook)
        ? Math.floor(clamped / 2) * spreadH
        : clamped * singleH;

      const scaledTop = approxTop * stageScale.value;
      scrollViewportRef.value.scrollTo({
        top: Math.max(0, scaledTop - 20),
        behavior: 'smooth'
      });
      setTimeout(() => {
        sheetComp?.focusText?.();
      }, 350);
    }
  });
}

function jumpToPage(idx) {
  scrollToSheet(idx);
  playPaperRustle();
}

function addNewPage(afterIndex = null) {
  const refPage = (afterIndex !== null && localPages.value[afterIndex])
    ? localPages.value[afterIndex]
    : localPages.value[localPages.value.length - 1];

  const inheritedType = refPage?.paperType || currentNote.value.paperType || 'lined';
  const inheritedColor = refPage?.paperColor || currentNote.value.paperColor || 'cream';

  const newPage = {
    id: `page_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    pageNumber: 1,
    paperType: inheritedType,
    paperColor: inheritedColor,
    content: '',
    drawings: null,
    images: [],
    stickies: [],
    tapes: []
  };

  let newIdx = 0;
  if (afterIndex !== null && afterIndex >= 0 && afterIndex < localPages.value.length) {
    localPages.value.splice(afterIndex + 1, 0, newPage);
    newIdx = afterIndex + 1;
  } else {
    localPages.value.push(newPage);
    newIdx = localPages.value.length - 1;
  }
  activePageIndex.value = newIdx;

  playPaperRustle();

  localPages.value.forEach((p, idx) => { p.pageNumber = idx + 1; });
  // Synchronous and immediate persistence to both memory, localStorage and IndexedDB
  flushSave();

  scrollToSheet(newIdx);
}

function onAddPageAfter(pageIndex) {
  addNewPage(pageIndex);
}

function onDeletePage(pageIndex) {
  if (localPages.value.length <= 1) return;
  localPages.value.splice(pageIndex, 1);
  localPages.value.forEach((p, idx) => { p.pageNumber = idx + 1; });
  const nextActive = Math.min(localPages.value.length - 1, Math.max(0, pageIndex - 1));
  activePageIndex.value = nextActive;
  flushSave();
  scrollToSheet(nextActive);
}

function onPageContentUpdate({ pageIndex, content }) {
  if (localPages.value[pageIndex]) {
    localPages.value[pageIndex].content = content;
    // Synchronous immediate local safety draft on every keystroke
    try {
      localStorage.setItem('lumina_active_draft_note', JSON.stringify({
        id: currentNote.value.id,
        title: localTitle.value,
        pages: localPages.value,
        content: localPages.value[0]?.content || '',
        updatedAt: new Date().toISOString()
      }));
    } catch (e) {}

    scheduleSave({
      pages: localPages.value,
      content: localPages.value[0]?.content || ''
    });
  }
}

function onPageDrawingsUpdate({ pageIndex, drawings }) {
  if (localPages.value[pageIndex]) {
    localPages.value[pageIndex].drawings = drawings;
    scheduleSave({
      pages: localPages.value,
      drawings: localPages.value[0]?.drawings || null
    });
  }
}

function onPageImagesUpdate({ pageIndex, images }) {
  if (localPages.value[pageIndex]) {
    localPages.value[pageIndex].images = images;
    scheduleSave({ pages: localPages.value });
  }
}

function onTransferImage({ fromPageIndex, toPageIndex, imageId, x, y }) {
  if (
    fromPageIndex < 0 || fromPageIndex >= localPages.value.length ||
    toPageIndex < 0 || toPageIndex >= localPages.value.length ||
    fromPageIndex === toPageIndex
  ) return;

  const sourceImages = localPages.value[fromPageIndex]?.images || [];
  const imgIdx = sourceImages.findIndex(img => img.id === imageId);
  if (imgIdx === -1) return;

  const [movedImg] = sourceImages.splice(imgIdx, 1);
  movedImg.x = Math.max(10, Math.round(x));
  movedImg.y = Math.max(10, Math.round(y));

  if (!localPages.value[toPageIndex].images) {
    localPages.value[toPageIndex].images = [];
  }
  localPages.value[toPageIndex].images.push(movedImg);

  activePageIndex.value = toPageIndex;
  selectedElementId.value = movedImg.id;
  scheduleSave({ pages: localPages.value });

  nextTick(() => {
    sheetRefs[toPageIndex]?.scrollIntoViewSmooth?.();
  });
}

function onPageStickiesUpdate({ pageIndex, stickies }) {
  if (localPages.value[pageIndex]) {
    localPages.value[pageIndex].stickies = stickies;
    scheduleSave({ pages: localPages.value });
  }
}

function onPageTapesUpdate({ pageIndex, tapes }) {
  if (localPages.value[pageIndex]) {
    localPages.value[pageIndex].tapes = tapes;
    scheduleSave({ pages: localPages.value });
  }
}

// ----------------- PEN CASE & DRAWING -----------------
const isDrawingMode = ref(false);
const isSmartShapeEnabled = ref(settings.value.defaultSmartShape ?? true);
const isPenCaseOpen = ref(false);
const activePenSlot = ref(0);

const penSlots = ref([
  { id: 'slot_1', name: '0.5mm Siyah Dolma', tool: 'pen', color: '#0F172A', size: 3, opacity: 1.0 },
  { id: 'slot_2', name: '0.7mm Sakura İmza', tool: 'pen', color: '#DB2777', size: 5, opacity: 1.0 },
  { id: 'slot_3', name: '0.8mm Buzul Mavi', tool: 'pen', color: '#2563EB', size: 5, opacity: 1.0 },
  { id: 'slot_4', name: 'Fosforlu Pastel Sarı', tool: 'highlighter', color: '#FBBF24', size: 20, opacity: 0.40 },
  { id: 'slot_5', name: '0.7mm Kurşun Kalem', tool: 'pencil', color: '#475569', size: 4, opacity: 0.72 }
]);

const toolConfigs = ref({
  pen: { color: '#0F172A', size: 3, opacity: 1.0 },
  highlighter: { color: '#FBBF24', size: 20, opacity: 0.40 },
  pencil: { color: '#475569', size: 4, opacity: 0.72 },
  eraser: { color: '#000000', size: 24, opacity: 1.0 }
});

const currentTool = ref('pen');
const brushColor = ref('#0F172A');
const brushSize = ref(3);
const brushOpacity = ref(1.0);

function activateTool(toolName) {
  currentTool.value = toolName;
  isDrawingMode.value = true;
  const matchingSlotIdx = penSlots.value.findIndex(s => s.tool === toolName);
  if (matchingSlotIdx !== -1 && toolName !== 'eraser') {
    activePenSlot.value = matchingSlotIdx;
    const s = penSlots.value[matchingSlotIdx];
    brushColor.value = s.color;
    brushSize.value = s.size;
    brushOpacity.value = s.opacity !== undefined ? s.opacity : 1.0;
  } else {
    const cfg = toolConfigs.value[toolName] || toolConfigs.value.pen;
    brushColor.value = cfg.color;
    brushSize.value = cfg.size;
    brushOpacity.value = cfg.opacity;
  }
}

function selectPenSlot(index) {
  activePenSlot.value = index;
  isDrawingMode.value = true;
  const s = penSlots.value[index];
  if (s) {
    currentTool.value = s.tool;
    brushColor.value = s.color;
    brushSize.value = s.size;
    brushOpacity.value = s.opacity !== undefined ? s.opacity : 1.0;
    if (toolConfigs.value[s.tool]) {
      toolConfigs.value[s.tool] = {
        color: s.color,
        size: s.size,
        opacity: s.opacity !== undefined ? s.opacity : 1.0
      };
    }
  }
}

function onUpdatePen(penConfig) {
  currentTool.value = penConfig.tool;
  brushColor.value = penConfig.color;
  brushSize.value = penConfig.size;
  brushOpacity.value = penConfig.opacity;
  if (toolConfigs.value[penConfig.tool]) {
    toolConfigs.value[penConfig.tool] = {
      color: penConfig.color,
      size: penConfig.size,
      opacity: penConfig.opacity
    };
  }
}

function onUpdateSlot({ index, config }) {
  if (penSlots.value[index]) {
    penSlots.value[index] = { ...penSlots.value[index], ...config };
  }
}

function handleClearCanvas() {
  if (localPages.value[activePageIndex.value]) {
    localPages.value[activePageIndex.value].drawings = null;
    scheduleSave({
      pages: localPages.value,
      drawings: localPages.value[0]?.drawings || null
    });
  }
}

// ----------------- PAPER PALETTE & CONTRAST FREEDOM -----------------
const paperTrayTone = ref(props.isDarkMode ? 'dark' : 'light');

watch(() => props.isDarkMode, (isDark) => {
  paperTrayTone.value = isDark ? 'dark' : 'light';
});

const activePalette = computed(() => {
  return paperTrayTone.value === 'dark' ? DARK_PASTEL_COLORS : LIGHT_PASTEL_COLORS;
});

const currentColorConfig = computed(() => {
  return resolvePaperColor(currentNote.value.paperColor, props.isDarkMode);
});

const pageThemeStyle = computed(() => {
  const c = currentColorConfig.value;
  return {
    '--paper-bg': c.bg,
    '--paper-line': c.line,
    '--paper-text': c.text
  };
});

// Watch when user switches to a different notebook via Sidebar Quick Switcher
watch(() => props.note.id, (newId, oldId) => {
  if (oldId) {
    flushSave();
  }
  const n = props.note;
  localTitle.value = n.title || '';
  localAttachments.value = n.attachments ? [...n.attachments] : [];
  localVoiceMemos.value = n.voiceMemos ? [...n.voiceMemos] : [];
  localIndexTabs.value = n.indexTabs ? [...n.indexTabs] : [];
  localTags.value = n.tags ? [...n.tags] : [];
  isDoublePageMode.value = n.isDoublePage !== undefined ? !!n.isDoublePage : !!settings.value.defaultBookMode;
  activePageIndex.value = 0;
  localPages.value = initPagesFromNote(n);
  scrollViewportRef.value?.scrollTo({ top: 0, behavior: 'smooth' });
});

// Watch when current notebook gets hydrated or updated with more pages from IndexedDB
watch(() => props.note, (newNote, oldNote) => {
  if (!newNote) return;
  if (oldNote && newNote.id !== oldNote.id) return;
  if (Array.isArray(newNote.pages) && newNote.pages.length > localPages.value.length) {
    localPages.value = initPagesFromNote(newNote);
  }
}, { deep: false });

let debounceTimer = null;
let pendingChanges = null;

function scheduleSave(changes) {
  isSaving.value = true;
  pendingChanges = {
    id: currentNote.value.id,
    ...pendingChanges,
    ...changes
  };
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    if (pendingChanges) {
      emit('update', pendingChanges);
      pendingChanges = null;
    }
    isSaving.value = false;
  }, 140);
}

function flushSave() {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }

  // Harvest latest DOM text content from mounted sheets
  localPages.value.forEach((page, pIdx) => {
    const sheet = sheetRefs[pIdx];
    if (sheet && typeof sheet.getCurrentContent === 'function') {
      page.content = sheet.getCurrentContent();
    }
  });

  const finalChanges = {
    id: currentNote.value.id,
    title: localTitle.value,
    pages: localPages.value,
    content: localPages.value[0]?.content || '',
    ...pendingChanges
  };
  pendingChanges = null;

  try {
    localStorage.setItem('lumina_active_draft_note', JSON.stringify({
      id: currentNote.value.id,
      title: localTitle.value,
      pages: localPages.value,
      content: localPages.value[0]?.content || '',
      updatedAt: new Date().toISOString()
    }));
  } catch (e) {}

  emit('update', finalChanges);
  isSaving.value = false;
}

function handleBackToShelf() {
  flushSave();
  emit('back');
}

if (typeof window !== 'undefined') {
  window.__luminaFlushSave = flushSave;
}

function onTitleChange() {
  scheduleSave({ title: localTitle.value });
}

// ----------------- FORMATTING -----------------
function formatDoc(command) {
  document.execCommand(command, false, null);
  updateActiveFormats();
  flushSave();
}

function onMathSymbolInsert(sym) {
  sheetRefs[activePageIndex.value]?.insertText(sym);
  isMathModalOpen.value = false;
}

// ----------------- STICKERS & TAPES & STICKIES -----------------
function openTapeDrawer() {
  stickerDrawerTab.value = 'tapes';
  isStickerModalOpen.value = true;
}

function openStickerDrawer() {
  stickerDrawerTab.value = 'stickers';
  isStickerModalOpen.value = true;
}

function onTapeSelect(tape) {
  const pIdx = activePageIndex.value;
  if (!localPages.value[pIdx]) return;
  const newTape = {
    id: `washi_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    pattern: tape.pattern || 'tape_pastel_pink',
    css: tape.css,
    color: '#FDA4AF',
    x: 70,
    y: 80,
    width: 220,
    isRevealed: false
  };
  localPages.value[pIdx].tapes.push(newTape);
  selectedElementId.value = newTape.id;
  scheduleSave({ pages: localPages.value });
}

function onStickerSelect(stk) {
  const pIdx = activePageIndex.value;
  if (!localPages.value[pIdx]) return;
  const newImage = {
    id: `sticker_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    src: stk.src,
    x: 100,
    y: 80,
    width: 90,
    height: 90,
    isSticker: true
  };
  localPages.value[pIdx].images.push(newImage);
  selectedElementId.value = newImage.id;
  scheduleSave({ pages: localPages.value });
}

function addStickyNote() {
  const pIdx = activePageIndex.value;
  if (!localPages.value[pIdx]) return;
  const newSticky = {
    id: `sticky_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    text: '',
    color: props.isDarkMode ? '#383216' : '#FEF08A',
    x: 60,
    y: 70,
    width: 200
  };
  localPages.value[pIdx].stickies.push(newSticky);
  selectedElementId.value = newSticky.id;
  scheduleSave({ pages: localPages.value });
}

// ----------------- IMAGES & FILES (WITH AUTOMATIC WEBP COMPRESSION) -----------------
function triggerImagePicker() { imageInputRef.value?.click(); }

function compressImageElement(imgObj, maxDim = 1440, quality = 0.84) {
  try {
    let targetW = imgObj.width || 800;
    let targetH = imgObj.height || 600;
    if (targetW > maxDim || targetH > maxDim) {
      if (targetW >= targetH) {
        targetH = Math.round((targetH * maxDim) / targetW);
        targetW = maxDim;
      } else {
        targetW = Math.round((targetW * maxDim) / targetH);
        targetH = maxDim;
      }
    }
    const offCanvas = document.createElement('canvas');
    offCanvas.width = targetW;
    offCanvas.height = targetH;
    const offCtx = offCanvas.getContext('2d');
    offCtx.drawImage(imgObj, 0, 0, targetW, targetH);
    const webpUrl = offCanvas.toDataURL('image/webp', quality);
    offCanvas.width = 0;
    offCanvas.height = 0;
    if (webpUrl && webpUrl.startsWith('data:image/webp')) {
      return webpUrl;
    }
  } catch (e) {}
  return imgObj.src;
}

function onImageSelected(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    const rawSrc = event.target.result;
    const imgObj = new window.Image();
    imgObj.onload = () => {
      const compressedSrc = compressImageElement(imgObj, 1440, 0.84);
      const maxW = 320;
      const aspect = imgObj.width / Math.max(1, imgObj.height);
      const width = Math.min(maxW, imgObj.width);
      const height = Math.round(width / aspect);
      const pIdx = Math.max(0, Math.min(localPages.value.length - 1, activePageIndex.value));
      if (!localPages.value[pIdx]) return;
      if (!localPages.value[pIdx].images) localPages.value[pIdx].images = [];
      const newImg = {
        id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        src: compressedSrc,
        x: 40,
        y: 60,
        width,
        height
      };
      localPages.value[pIdx].images.push(newImg);
      selectedElementId.value = newImg.id;
      scheduleSave({ pages: localPages.value });
    };
    imgObj.src = rawSrc;
  };
  reader.readAsDataURL(file);
  e.target.value = '';
}

function triggerFilePicker() { fileInputRef.value?.click(); }

function onFilesSelected(e) {
  const files = Array.from(e.target.files || []);
  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const ext = file.name.split('.').pop().toLowerCase();
      const sizeStr = file.size < 1024 ? `${file.size} B`
        : file.size < 1048576 ? `${(file.size / 1024).toFixed(1)} KB`
        : `${(file.size / 1048576).toFixed(1)} MB`;
      localAttachments.value.push({
        id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        name: file.name,
        size: sizeStr,
        ext,
        data: event.target.result,
        addedAt: new Date().toISOString()
      });
      scheduleSave({ attachments: localAttachments.value });
    };
    reader.readAsDataURL(file);
  });
  e.target.value = '';
}

function removeAttachment(attId) {
  localAttachments.value = localAttachments.value.filter(a => a.id !== attId);
  scheduleSave({ attachments: localAttachments.value });
}

// ----------------- VOICE MEMOS, TABS, TAGS -----------------
function addVoiceMemo(memo) {
  localVoiceMemos.value.push(memo);
  scheduleSave({ voiceMemos: localVoiceMemos.value });
}

function deleteVoiceMemo(memoId) {
  localVoiceMemos.value = localVoiceMemos.value.filter(m => m.id !== memoId);
  scheduleSave({ voiceMemos: localVoiceMemos.value });
}

function addIndexTab(tab) {
  const enrichedTab = {
    ...tab,
    targetY: scrollViewportRef.value?.scrollTop || 0
  };
  localIndexTabs.value.push(enrichedTab);
  scheduleSave({ indexTabs: localIndexTabs.value });
}

function deleteIndexTab(tabId) {
  localIndexTabs.value = localIndexTabs.value.filter(t => t.id !== tabId);
  scheduleSave({ indexTabs: localIndexTabs.value });
}

function scrollToTab(tab) {
  scrollViewportRef.value?.scrollTo({ top: tab.targetY || 0, behavior: 'smooth' });
}

function addTag() {
  const t = newTagInput.value.replace(/^#/, '').trim().toLowerCase();
  if (t && !localTags.value.includes(t)) {
    localTags.value.push(t);
    newTagInput.value = '';
    scheduleSave({ tags: localTags.value });
  }
}

function removeTag(tagToRemove) {
  localTags.value = localTags.value.filter(t => t !== tagToRemove);
  scheduleSave({ tags: localTags.value });
}

// ----------------- COVER, PIN, PER-PAGE & ALL-PAGES PAPER SETTINGS -----------------
const topBarPaperScope = ref('active'); // 'active' | 'all'

const topBarDisplayedType = computed(() => {
  if (topBarPaperScope.value === 'active') {
    return localPages.value[activePageIndex.value]?.paperType || currentNote.value.paperType || 'lined';
  }
  const first = localPages.value[0]?.paperType || currentNote.value.paperType || 'lined';
  return localPages.value.every(p => (p.paperType || currentNote.value.paperType) === first) ? first : null;
});

const topBarDisplayedColor = computed(() => {
  if (topBarPaperScope.value === 'active') {
    return localPages.value[activePageIndex.value]?.paperColor || currentNote.value.paperColor || 'cream';
  }
  const first = localPages.value[0]?.paperColor || currentNote.value.paperColor || 'cream';
  return localPages.value.every(p => (p.paperColor || currentNote.value.paperColor) === first) ? first : null;
});

function onApplyPaperStyle({ scope, indices, paperType, paperColor }) {
  const payload = {};
  if (scope === 'all') {
    localPages.value.forEach(p => {
      if (paperType) p.paperType = paperType;
      if (paperColor) p.paperColor = paperColor;
    });
    if (paperType) payload.paperType = paperType;
    if (paperColor) payload.paperColor = paperColor;
  } else {
    const targets = (indices && indices.length > 0) ? indices : [activePageIndex.value];
    targets.forEach(idx => {
      const p = localPages.value[idx];
      if (!p) return;
      if (paperType) p.paperType = paperType;
      if (paperColor) p.paperColor = paperColor;
    });
    if (localPages.value.length === 1) {
      if (paperType) payload.paperType = paperType;
      if (paperColor) payload.paperColor = paperColor;
    }
  }
  payload.pages = localPages.value;
  emit('update', payload);
}

function onSheetQuickStyleUpdate({ pageIndex, paperType, paperColor }) {
  onApplyPaperStyle({
    scope: 'selected',
    indices: [pageIndex],
    paperType,
    paperColor
  });
}

function onCoverSelect(styleId) { scheduleSave({ coverStyle: styleId }); }
function onPinSet(pin) { scheduleSave({ isLocked: true, pin }); }
function onPinRemove() {
  scheduleSave({ isLocked: false, pin: null });
  isPinModalOpen.value = false;
}

function setPaperType(typeId) {
  onApplyPaperStyle({
    scope: topBarPaperScope.value === 'all' ? 'all' : 'selected',
    indices: [activePageIndex.value],
    paperType: typeId
  });
}

function setPaperColor(colorId) {
  onApplyPaperStyle({
    scope: topBarPaperScope.value === 'all' ? 'all' : 'selected',
    indices: [activePageIndex.value],
    paperColor: colorId
  });
}

function setAlignment(mode) {
  const map = {
    left: 'justifyLeft',
    center: 'justifyCenter',
    right: 'justifyRight',
    justify: 'justifyFull'
  };
  document.execCommand(map[mode] || 'justifyLeft', false, null);
  activeFormats.value.align = mode;
  emit('update', { align: mode });
  flushSave();
}
function toggleFavorite() { emit('toggle-favorite', currentNote.value.id); }
function handleTrash() { emit('delete', currentNote.value.id); }
function handlePrint() {
  isPrintRenderAll.value = true;
  nextTick(() => {
    window.print();
    setTimeout(() => {
      isPrintRenderAll.value = false;
    }, 500);
  });
}

function onBeforePrint() {
  isPrintRenderAll.value = true;
}

function onAfterPrint() {
  isPrintRenderAll.value = false;
}

function handleGlobalShortcuts(e) {
  if (e.key === 'Escape') {
    if (props.hasOpenGlobalModal) return;
    if (document.querySelector('.spotlight-backdrop') || document.querySelector('.badges-backdrop')) return;
    if (isMathModalOpen.value) { isMathModalOpen.value = false; return; }
    if (isStickerModalOpen.value) { isStickerModalOpen.value = false; return; }
    if (isCoverModalOpen.value) { isCoverModalOpen.value = false; return; }
    if (isPinModalOpen.value) { isPinModalOpen.value = false; return; }
    if (isPenCaseOpen.value) { isPenCaseOpen.value = false; return; }
    if (isRulerOpen.value) { isRulerOpen.value = false; return; }
    if (selectedElementId.value) { selectedElementId.value = null; return; }
    if (props.isPageSlotsOpen) { emit('update:isPageSlotsOpen', false); return; }
    if (props.isZenMode) {
      emit('toggle-zen');
    } else {
      handleBackToShelf();
    }
  } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
    e.preventDefault();
    formatDoc('bold');
  } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
    e.preventDefault();
    formatDoc('italic');
  } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') {
    e.preventDefault();
    formatDoc('underline');
  } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'l') {
    e.preventDefault();
    setAlignment('left');
  } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'e') {
    e.preventDefault();
    setAlignment('center');
  } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'r') {
    e.preventDefault();
    setAlignment('right');
  } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
    e.preventDefault();
    scheduleSave({
      title: localTitle.value,
      pages: localPages.value,
      content: localPages.value[0]?.content || '',
      drawings: localPages.value[0]?.drawings || null,
      attachments: localAttachments.value,
      voiceMemos: localVoiceMemos.value,
      indexTabs: localIndexTabs.value,
      tags: localTags.value
    });
  } else if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
    e.preventDefault();
    emit('open-spotlight');
  } else if (isDrawingMode.value && (e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
    e.preventDefault();
    undoActiveDrawing();
  } else if (isDrawingMode.value && (e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
    e.preventDefault();
    redoActiveDrawing();
  } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
    e.preventDefault();
    handlePrint();
  }
}

function onGlobalClick(e) {
  if (isFontDropdownOpen.value && fontPickerRef.value && !fontPickerRef.value.contains(e.target)) {
    isFontDropdownOpen.value = false;
  }
  if (isInkPaletteOpen.value && inkPickerRef.value && !inkPickerRef.value.contains(e.target)) {
    isInkPaletteOpen.value = false;
  }
  if (isHighlighterPaletteOpen.value && !e.target.closest('.highlighter-picker-group')) {
    isHighlighterPaletteOpen.value = false;
  }
}

function onVisibilityChange() {
  if (document.hidden) {
    flushSave();
  }
}

onMounted(() => {
  window.addEventListener('click', onGlobalClick);
  window.addEventListener('keydown', handleGlobalShortcuts);
  document.addEventListener('selectionchange', updateActiveFormats);
  window.addEventListener('beforeunload', flushSave);
  window.addEventListener('pagehide', flushSave);
  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('beforeprint', onBeforePrint);
  window.addEventListener('afterprint', onAfterPrint);
  window.addEventListener('resize', updateStageScale);
  if (scrollViewportRef.value && typeof ResizeObserver !== 'undefined') {
    viewportResizeObserver = new ResizeObserver(() => {
      updateStageScale();
    });
    viewportResizeObserver.observe(scrollViewportRef.value);
  }
  nextTick(() => {
    updateStageScale();
  });
});
onBeforeUnmount(() => {
  flushSave();
  if (scrollRafId) cancelAnimationFrame(scrollRafId);
  if (viewportResizeObserver) {
    viewportResizeObserver.disconnect();
    viewportResizeObserver = null;
  }
  window.removeEventListener('click', onGlobalClick);
  window.removeEventListener('keydown', handleGlobalShortcuts);
  document.removeEventListener('selectionchange', updateActiveFormats);
  window.removeEventListener('beforeunload', flushSave);
  window.removeEventListener('pagehide', flushSave);
  document.removeEventListener('visibilitychange', onVisibilityChange);
  window.removeEventListener('beforeprint', onBeforePrint);
  window.removeEventListener('afterprint', onAfterPrint);
  window.removeEventListener('resize', updateStageScale);
});
</script>

<style scoped>
.lumina-editor-root {
  flex: 1;
  min-width: 0;
  height: 100vh;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  background: transparent;
  overflow: hidden;
  position: relative;
}

.editor-stage-column {
  flex: 1;
  min-width: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

/* FLOATING TOP MONOLITH */
.monolith-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 16px 4px 16px;
  position: relative;
  z-index: 100;
  flex-shrink: 0;
}

.lumina-top-monolith {
  width: 100%;
  max-width: 1060px;
  min-height: 52px;
  padding: 6px 12px;
  border-radius: 999px;
  background: var(--bg-glass);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--border-glass);
  box-shadow:
    0 10px 30px -8px rgba(0, 0, 0, 0.08),
    0 0 0 1px var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.mono-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.mono-pill-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 99px;
  border: 1px solid var(--border-color);
  background: var(--bg-surface-subtle);
  color: var(--color-text-main);
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.16s ease;
}

.mono-pill-btn:hover {
  background: var(--bg-surface);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.title-capsule {
  display: flex;
  align-items: center;
  gap: 7px;
  flex: 1;
  min-width: 0;
  padding: 0 4px;
}

.save-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  flex-shrink: 0;
  transition: transform 0.2s, background 0.2s;
}

.save-dot.saving {
  background: #f59e0b;
  transform: scale(1.25);
}

.mono-title-input {
  width: 100%;
  border: none;
  background: transparent;
  outline: none;
  font-size: 14.5px;
  font-weight: 700;
  color: var(--color-text-main);
  text-overflow: ellipsis;
}

.mono-title-input::placeholder {
  color: var(--color-text-muted);
  opacity: 0.7;
}

/* Center Category Switcher */
.mono-categories {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 3px;
  border-radius: 999px;
  background: rgba(128, 128, 128, 0.08);
  flex-shrink: 0;
}

.cat-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 13px;
  border-radius: 999px;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  position: relative;
  transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  white-space: nowrap;
}

.cat-tab-btn:hover {
  color: var(--color-text-main);
}

.cat-tab-btn.active {
  background: var(--bg-surface);
  color: var(--color-primary);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.07);
}

.live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-primary);
}

/* Right Cluster */
.mono-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 5px;
  flex: 1;
}

.mono-icon-pill {
  height: 32px;
  padding: 0 10px;
  border-radius: 99px;
  border: 1px solid var(--border-color);
  background: var(--bg-surface-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.16s;
}

.mono-icon-pill.active {
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
}

.amb-emoji {
  font-size: 14px;
  line-height: 1;
}

.mono-icon-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid transparent;
  background: transparent;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.16s;
}

.mono-icon-btn:hover {
  background: var(--bg-surface-subtle);
  color: var(--color-text-main);
}

.mono-icon-btn.active {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.mono-icon-btn.danger:hover {
  background: rgba(239, 68, 68, 0.14);
  color: #ef4444;
}

/* CONTEXTUAL SUB-CAPSULE */
.lumina-sub-capsule {
  max-width: 100%;
  padding: 5px 12px;
  border-radius: 999px;
  background: var(--bg-glass);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--border-glass);
  box-shadow: 0 8px 22px -6px rgba(0, 0, 0, 0.06);
  overflow: visible;
  position: relative;
  z-index: 80;
}

.lumina-sub-capsule::-webkit-scrollbar {
  display: none;
}

.sub-tools-track {
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.sub-group {
  display: flex;
  align-items: center;
  gap: 4px;
}

.sub-sep {
  width: 1px;
  height: 18px;
  background: var(--border-color);
  margin: 0 3px;
  flex-shrink: 0;
}

.sub-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 99px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.sub-chip:hover {
  background: var(--bg-surface-subtle);
  color: var(--color-text-main);
}

.sub-chip.disabled {
  opacity: 0.38;
  cursor: not-allowed;
  pointer-events: none;
}

.sub-chip.active,
.sub-chip.accent-chip {
  background: var(--color-primary-soft);
  color: var(--color-primary);
  border-color: var(--border-color);
  font-weight: 700;
}

.sub-chip.primary-toggle.active {
  background: var(--color-primary);
  color: #ffffff;
}

[data-theme="dark"] .sub-chip.primary-toggle.active {
  color: #111118;
}

.sub-icon-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
}

.sub-icon-btn:hover {
  background: var(--bg-surface-subtle);
  color: var(--color-text-main);
}

.sub-icon-btn.active {
  background: var(--color-primary-soft, rgba(124, 58, 237, 0.16));
  color: var(--color-primary, #7c3aed);
  border: 1px solid var(--color-primary, #7c3aed);
  box-shadow: 0 0 10px rgba(124, 58, 237, 0.32);
  transform: scale(1.06);
}

/* Pen Slot Orbs */
.pen-slot-orb {
  width: 23px;
  height: 23px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.22);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.15s;
}

.pen-slot-orb span {
  font-size: 8.5px;
  font-weight: 800;
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.65);
}

.pen-slot-orb.active {
  transform: scale(1.22);
  box-shadow: 0 0 0 2.5px var(--color-primary);
}

/* Paper Color Dots */
.swatches-row {
  gap: 5px;
  padding: 0 2px;
}

.paper-dot-btn {
  width: 19px;
  height: 19px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
  cursor: pointer;
  transition: transform 0.15s;
}

.paper-dot-btn.active {
  transform: scale(1.25);
  box-shadow: 0 0 0 2px var(--color-primary);
}

/* Typography: Font Dropdown & Size Stepper */
.font-dropdown-container,
.ink-picker-container {
  position: relative;
}

.font-trigger-chip {
  padding: 5px 12px;
  background: var(--bg-surface-subtle);
  border: 1px solid var(--border-color);
  max-width: 175px;
}

.font-active-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 110px;
  font-size: 12.5px;
  font-weight: 700;
}

.pop-chevron {
  transition: transform 0.2s ease;
  opacity: 0.6;
}

.pop-chevron.open {
  transform: rotate(180deg);
}

.font-size-stepper {
  display: inline-flex;
  align-items: center;
  background: var(--bg-surface-subtle);
  border: 1px solid var(--border-color);
  border-radius: 99px;
  padding: 1px 3px;
  gap: 1px;
}

.stepper-btn {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
}

.stepper-btn:hover:not(:disabled) {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.stepper-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.stepper-val {
  font-size: 11px;
  font-weight: 800;
  color: var(--color-text-main);
  min-width: 18px;
  text-align: center;
}

/* Font Picker Popover */
.font-picker-popover {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: 320px;
  background: var(--bg-surface, #FFFFFF);
  border: 1px solid var(--border-color, rgba(148, 163, 184, 0.25));
  border-radius: 18px;
  box-shadow: 0 16px 40px -4px rgba(0, 0, 0, 0.35);
  z-index: 99999;
  display: flex;
  flex-direction: column;
  padding: 10px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

[data-theme="dark"] .font-picker-popover {
  background: #171A27;
}

.f-pop-header {
  padding: 4px 6px 8px 6px;
}

.f-pop-title {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.6px;
  color: var(--color-text-muted);
}

.f-cat-tabs {
  display: flex;
  gap: 4px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 6px;
  overflow-x: auto;
  scrollbar-width: none;
}

.f-cat-tabs::-webkit-scrollbar {
  display: none;
}

.f-cat-btn {
  padding: 3px 8px;
  border-radius: 99px;
  border: 1px solid transparent;
  background: transparent;
  font-size: 10.5px;
  font-weight: 600;
  color: var(--color-text-muted);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}

.f-cat-btn:hover {
  background: var(--bg-surface-subtle);
  color: var(--color-text-main);
}

.f-cat-btn.active {
  background: var(--color-primary-soft);
  color: var(--color-primary);
  font-weight: 700;
}

.f-list-scroll {
  max-height: 250px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-right: 2px;
}

.f-item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 7px 10px;
  border-radius: 10px;
  border: 1px solid transparent;
  background: transparent;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s;
}

.f-item-row:hover {
  background: var(--bg-surface-subtle);
}

.f-item-row.active {
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
}

.f-row-meta {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.f-row-name {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--color-text-main);
}

.f-row-cat {
  font-size: 9.5px;
  font-weight: 600;
  color: var(--color-text-muted);
}

.f-row-preview {
  font-size: 13px;
  color: var(--color-text-muted);
  opacity: 0.8;
  margin-left: auto;
  margin-right: 8px;
}

.f-row-check {
  font-size: 12px;
  font-weight: 800;
  color: var(--color-primary);
}

/* Ink Palette */
.ink-trigger-chip {
  padding: 5px 10px;
  background: var(--bg-surface-subtle);
  border: 1px solid var(--border-color);
}

.ink-color-drop {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1.5px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  display: inline-block;
  flex-shrink: 0;
}

.ink-palette-popover {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: 240px;
  background: var(--bg-surface, #FFFFFF);
  border: 1px solid var(--border-color, rgba(148, 163, 184, 0.25));
  border-radius: 18px;
  box-shadow: 0 16px 40px -4px rgba(0, 0, 0, 0.35);
  z-index: 99999;
  padding: 12px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

[data-theme="dark"] .ink-palette-popover {
  background: #171A27;
}

.ink-pop-title {
  font-size: 9.5px;
  font-weight: 800;
  letter-spacing: 0.7px;
  color: var(--color-text-muted);
  margin-bottom: 10px;
}

.ink-swatches-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  justify-items: center;
}

.ink-orb-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.85);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: transform 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ink-orb-btn:hover {
  transform: scale(1.15);
}

.ink-orb-btn.active {
  transform: scale(1.2);
  box-shadow: 0 0 0 2px var(--color-primary);
}

.ink-check-ic {
  font-size: 13px;
  font-weight: 800;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
}

/* Paper Tray Group & Mode Toggle (Day / Night Contrast Freedom) */
.paper-tray-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.paper-tray-mode-toggle {
  display: flex;
  align-items: center;
  background: var(--bg-surface-subtle);
  border: 1px solid var(--border-color);
  border-radius: 99px;
  padding: 2px;
  gap: 2px;
}

.tray-toggle-btn {
  border: none;
  background: transparent;
  border-radius: 99px;
  padding: 2px 6px;
  font-size: 11px;
  cursor: pointer;
  line-height: 1;
  transition: all 0.15s;
}

.tray-toggle-btn:hover {
  opacity: 0.8;
}

.tray-toggle-btn.active {
  background: var(--bg-surface);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
}

.hidden-input { display: none; }

/* Subbar Transition */
.subbar-morph-enter-active,
.subbar-morph-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.subbar-morph-enter-from,
.subbar-morph-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* PAPER STAGE SCROLL */
.paper-scroll-viewport {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 18px 20px 90px 20px;
  display: flex;
  justify-content: center;
}

.paper-stage-wrapper {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  width: 100%;
  max-width: 900px;
  position: relative;
  transition: max-width 0.3s ease;
}

.paper-stage-wrapper.is-book-mode {
  max-width: 1200px;
}

.pages-main-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  min-width: 0;
  position: relative;
}

/* Frosted Stationery Strip */
.stationery-glass-strip {
  width: 100%;
  max-width: 820px;
  background: var(--bg-glass);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--border-glass);
  border-radius: 18px;
  padding: 8px 16px;
  margin-bottom: 18px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
}

.paper-stage-wrapper.is-book-mode .stationery-glass-strip {
  max-width: 1140px;
}

.tags-voice-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.tags-pills-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.lumina-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  border-radius: 99px;
  background: var(--color-primary-soft);
  color: var(--color-primary);
  font-size: 11.5px;
  font-weight: 700;
}

.tag-x {
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 13px;
  line-height: 1;
  opacity: 0.7;
}

.tag-x:hover { opacity: 1; }

.tag-entry-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 99px;
  border: 1px dashed var(--border-color);
  background: var(--bg-surface-subtle);
}

.tag-clean-input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 11.5px;
  color: var(--color-text-main);
  width: 92px;
}

.tag-clean-input::placeholder {
  color: var(--color-text-muted);
  opacity: 0.75;
}

.tag-confirm-btn {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: none;
  background: var(--color-primary);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

[data-theme="dark"] .tag-confirm-btn {
  color: #111118;
}

/* Single & Book Spread Lists */
.single-pages-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  width: 100%;
}

/* Lightweight Virtual Sheet Placeholder for Offscreen Pages (1,300+ Page Support) */
.virtual-sheet-placeholder {
  width: 100%;
  max-width: 794px;
  min-height: 1123px;
  border-radius: 20px;
  padding: 24px 48px 52px 48px;
  border: 1px solid var(--border-color);
  box-shadow: 0 12px 32px -12px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: pointer;
  contain: strict;
  user-select: none;
}

.virtual-sheet-placeholder.size-a5 {
  max-width: 560px;
  min-height: 794px;
}

.virtual-sheet-placeholder.size-a3 {
  max-width: 1123px;
  min-height: 1588px;
}

.virtual-sheet-placeholder.size-canvas {
  max-width: 1200px;
  min-height: 1200px;
  border-radius: 12px;
}

.virtual-sheet-placeholder.is-book-mode {
  max-width: 560px;
  min-height: 794px;
  padding: 20px 34px 44px 34px;
}

.virtual-sheet-placeholder.is-book-mode.size-a5 {
  max-width: 440px;
  min-height: 622px;
  padding: 18px 24px 36px 24px;
}

.virtual-sheet-placeholder.book-side-left {
  border-top-right-radius: 3px;
  border-bottom-right-radius: 3px;
}

.virtual-sheet-placeholder.book-side-right {
  border-top-left-radius: 3px;
  border-bottom-left-radius: 3px;
}

.virtual-sheet-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(128, 128, 128, 0.16);
}

.virtual-page-badge {
  font-size: 11.5px;
  font-weight: 700;
  color: var(--color-text-muted);
}

.virtual-sheet-excerpt {
  margin: 24px 0 auto 0;
  font-size: 15px;
  line-height: 1.8;
  color: var(--color-text-muted);
  opacity: 0.65;
  display: -webkit-box;
  -webkit-line-clamp: 6;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.virtual-sheet-bottom {
  text-align: center;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--color-text-muted);
  opacity: 0.4;
}

.book-spreads-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 36px;
  width: 100%;
}

.book-spread-row {
  display: flex;
  align-items: stretch;
  justify-content: center;
  width: 100%;
  max-width: 1140px;
  position: relative;
}

.book-spine-crease {
  width: 18px;
  align-self: stretch;
  background: linear-gradient(
    to right,
    rgba(0, 0, 0, 0.12),
    rgba(0, 0, 0, 0.03) 35%,
    rgba(0, 0, 0, 0.22) 50%,
    rgba(0, 0, 0, 0.03) 65%,
    rgba(0, 0, 0, 0.12)
  );
  position: relative;
  z-index: 5;
}

.spine-thread-line {
  position: absolute;
  top: 14px;
  bottom: 14px;
  left: 50%;
  width: 1px;
  border-left: 1.5px dashed rgba(255, 255, 255, 0.55);
}

.book-right-placeholder {
  flex: 1;
  max-width: 560px;
  min-height: 880px;
  border-radius: 3px 18px 18px 3px;
  border: 1.5px dashed var(--border-color);
  border-left: none;
  background: var(--bg-glass);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.book-right-placeholder:hover {
  border-color: var(--color-primary);
  background: var(--bg-surface);
}

.placeholder-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: var(--color-text-muted);
  text-align: center;
  padding: 20px;
}

.pl-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-primary);
}

.pl-desc {
  font-size: 11.5px;
}

.add-new-page-banner {
  width: 100%;
  max-width: 820px;
  margin-top: 24px;
  padding: 13px 20px;
  background: var(--bg-glass);
  backdrop-filter: var(--glass-blur);
  border: 1.5px dashed var(--border-color);
  border-radius: 18px;
  color: var(--color-text-muted);
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.paper-stage-wrapper.is-book-mode .add-new-page-banner {
  max-width: 1140px;
}

.add-new-page-banner:hover {
  border-style: solid;
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: var(--bg-surface);
  transform: translateY(-2px);
}

/* Mobile & Tablet Responsive Refinements */
@media (max-width: 960px) {
  .lumina-top-monolith {
    flex-wrap: wrap;
    border-radius: 22px;
    padding: 8px 12px;
  }
  .mono-categories {
    order: 3;
    width: 100%;
    justify-content: space-between;
    overflow-x: auto;
  }
  .cat-tab-btn {
    flex: 1;
    justify-content: center;
    padding: 6px 8px;
  }
  .hide-sm {
    display: none;
  }
}

@media (max-width: 560px) {
  .monolith-wrapper {
    padding: 8px 10px 2px 10px;
  }
  .paper-scroll-viewport {
    padding: 12px 10px 80px 10px;
  }
  .hide-xs {
    display: none;
  }
}

/* Floating Selection Mini-Toolbar Capsule */
.selection-floating-capsule {
  position: fixed;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 4px 7px;
  background: var(--bg-surface);
  backdrop-filter: blur(24px) saturate(170%);
  border: 1px solid var(--border-glass);
  border-radius: 999px;
  box-shadow:
    0 14px 36px -6px rgba(0, 0, 0, 0.28),
    0 0 0 1px var(--border-color);
  user-select: none;
  animation: floatCapsuleIn 0.16s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: auto;
}

@keyframes floatCapsuleIn {
  from {
    opacity: 0;
    transform: translateY(6px) scale(0.94);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.float-icon-btn,
.float-stepper-btn {
  width: 27px;
  height: 27px;
  border-radius: 999px;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
}

.float-icon-btn:hover,
.float-stepper-btn:hover {
  background: var(--bg-hover);
  color: var(--color-text-main);
  transform: scale(1.08);
}

.float-icon-btn.active {
  background: var(--color-primary);
  color: #FFFFFF !important;
  box-shadow: 0 2px 8px -1px var(--color-primary-soft);
}

.float-size-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-main);
  min-width: 17px;
  text-align: center;
  user-select: none;
}

.float-divider {
  width: 1px;
  height: 15px;
  background: var(--border-color);
  margin: 0 2px;
}

/* Gamification Top Pill */
.mono-level-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: var(--bg-surface-subtle);
  border: 1px solid var(--border-color);
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.18s ease;
  user-select: none;
}

.mono-level-pill:hover {
  background: var(--bg-hover);
  border-color: var(--color-primary);
  transform: translateY(-1px);
}

.lvl-emoji {
  font-size: 14px;
}

.lvl-txt {
  font-size: 11px;
  font-weight: 800;
  color: var(--color-text-main);
  max-width: 130px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.lvl-pct {
  font-size: 10px;
  font-weight: 800;
  color: var(--color-primary);
}

.lvl-bar-track {
  width: 32px;
  height: 5px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 999px;
  overflow: hidden;
}

.lvl-bar-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 999px;
}

/* Pastel Highlighter Toolbar & Dots */
.highlighter-picker-group {
  position: relative;
}

.hl-colors-drop {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  background: var(--bg-surface);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-glass);
  border-radius: 999px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  z-index: 99999;
}

.hl-dot,
.float-hl-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1.5px solid rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: transform 0.15s ease;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.float-hl-dot {
  width: 15px;
  height: 15px;
}

.hl-dot:hover,
.float-hl-dot:hover {
  transform: scale(1.22);
}

.hl-yellow { background-color: #FEF08A; }
.hl-green  { background-color: #A7F3D0; }
.hl-pink   { background-color: #FBCFE8; }
.hl-blue   { background-color: #BAE6FD; }
.hl-clear  { background-color: transparent; border-color: var(--color-text-muted); color: var(--color-text-muted); }

/* Global Copy Toast in Editor */
.editor-global-toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px;
  background: var(--bg-surface);
  backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid var(--border-glass);
  border-radius: 999px;
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.3);
  font-size: 12.5px;
  font-weight: 700;
  color: var(--color-text-main);
  z-index: 99999;
  animation: toastFloat 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes toastFloat {
  from { opacity: 0; transform: translate(-50%, 12px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}
</style>
