import { store } from './state/store.js';
import { audioManager } from './audio/audioManager.js';

// Global DOM Elements
const elements = {
  // Tabs
  tabButtons: document.querySelectorAll('.tab-btn'),
  viewSections: document.querySelectorAll('.view-section'),
  tasksTodayBadge: document.getElementById('tasks-today-count-badge'),
  inventoryBadge: document.getElementById('inventory-count-badge'),

  // Header
  streakCount: document.getElementById('streak-count'),
  ambientSelect: document.getElementById('ambient-sound-select'),
  btnToggleMute: document.getElementById('btn-toggle-mute'),
  btnOpenSettings: document.getElementById('btn-open-settings'),

  // Timer Card
  mainTimerCard: document.getElementById('main-timer-card'),
  modeButtons: document.querySelectorAll('.mode-pill-btn'),
  pillFocusTime: document.getElementById('pill-focus-time'),
  pillShortTime: document.getElementById('pill-short-time'),
  pillLongTime: document.getElementById('pill-long-time'),
  activeTaskBanner: document.getElementById('active-task-hero-banner'),
  activeTaskCategoryTag: document.getElementById('active-task-category-tag'),
  activeTaskDisplayName: document.getElementById('active-task-display-name'),
  btnSwitchActiveTask: document.getElementById('btn-switch-active-task'),
  overlearningBanner: document.getElementById('overlearning-banner'),
  timerProgressRing: document.getElementById('timer-progress-ring'),
  timerModeLabel: document.getElementById('timer-mode-label'),
  timerTimeText: document.getElementById('timer-time-text'),
  cycleLabelText: document.getElementById('cycle-label-text'),
  cycleDots: [
    document.getElementById('dot-1'),
    document.getElementById('dot-2'),
    document.getElementById('dot-3'),
    document.getElementById('dot-4')
  ],

  // Timer Controls
  btnPlayPause: document.getElementById('btn-play-pause-timer'),
  btnPlayIcon: document.getElementById('btn-play-icon'),
  btnPlayLabel: document.getElementById('btn-play-label'),
  btnResetTimer: document.getElementById('btn-reset-timer'),
  btnSkipTimer: document.getElementById('btn-skip-timer'),

  // Interruptions & Void
  btnLogInternal: document.getElementById('btn-log-internal-interrupt'),
  btnLogExternal: document.getElementById('btn-log-external-interrupt'),
  badgeInternalCount: document.getElementById('badge-internal-count'),
  badgeExternalCount: document.getElementById('badge-external-count'),
  btnTriggerVoid: document.getElementById('btn-trigger-void'),

  // Side Panel
  dailyPomodoroStatus: document.getElementById('daily-pomodoro-status'),
  miniStatPomodoros: document.getElementById('mini-stat-pomodoros'),
  miniStatProgressBar: document.getElementById('mini-stat-progress-bar'),
  sideChecklistContainer: document.getElementById('side-checklist-container'),
  btnQuickResetChecklist: document.getElementById('btn-quick-reset-checklist'),
  rotatingTipText: document.getElementById('rotating-tip-text'),

  // Tasks Lists
  tasksTodayListContainer: document.getElementById('tasks-today-list-container'),
  urgentTasksTodayListContainer: document.getElementById('urgent-tasks-today-list-container'),
  btnAddTodayTask: document.getElementById('btn-add-today-task'),
  inventoryListContainer: document.getElementById('inventory-list-container'),
  btnAddInventoryTask: document.getElementById('btn-add-inventory-task'),

  // Analytics
  statTotalPomodoros: document.getElementById('stat-total-pomodoros'),
  statPomodorosSub: document.getElementById('stat-pomodoros-sub'),
  statTotalTime: document.getElementById('stat-total-time'),
  statTotalInterrupts: document.getElementById('stat-total-interrupts'),
  statInterruptsBreakdown: document.getElementById('stat-interrupts-breakdown'),
  statTotalVoided: document.getElementById('stat-total-voided'),
  sessionsTableBody: document.getElementById('sessions-table-body'),
  btnExportData: document.getElementById('btn-export-data'),
  btnClearHistory: document.getElementById('btn-clear-history'),

  // Modals
  modalSettings: document.getElementById('modal-settings'),
  settingFocusDuration: document.getElementById('setting-focus-duration'),
  settingShortDuration: document.getElementById('setting-short-duration'),
  settingLongDuration: document.getElementById('setting-long-duration'),
  settingCycleInterval: document.getElementById('setting-cycle-interval'),
  settingDailyGoal: document.getElementById('setting-daily-goal'),
  settingTickSound: document.getElementById('setting-tick-sound'),
  settingAutoBreaks: document.getElementById('setting-auto-breaks'),
  btnSaveSettings: document.getElementById('btn-save-settings'),

  modalTask: document.getElementById('modal-task'),
  modalTaskTitle: document.getElementById('modal-task-title'),
  taskInputTitle: document.getElementById('task-input-title'),
  taskInputCategory: document.getElementById('task-input-category'),
  taskInputEstimated: document.getElementById('task-input-estimated'),
  taskInputNotes: document.getElementById('task-input-notes'),
  taskInputUrgent: document.getElementById('task-input-urgent'),
  taskTargetList: document.getElementById('task-target-list'),
  btnSaveTask: document.getElementById('btn-save-task'),

  modalInterrupt: document.getElementById('modal-interrupt'),
  modalInterruptTitle: document.getElementById('modal-interrupt-title'),
  modalInterruptDesc: document.getElementById('modal-interrupt-desc'),
  interruptInputNote: document.getElementById('interrupt-input-note'),
  interruptTypeInput: document.getElementById('interrupt-type-input'),
  btnConfirmInterrupt: document.getElementById('btn-confirm-interrupt'),

  modalActiveRecall: document.getElementById('modal-active-recall'),
  recallInputText: document.getElementById('recall-input-text'),
  btnSaveRecall: document.getElementById('btn-save-recall'),
  btnSkipRecall: document.getElementById('btn-skip-recall'),

  modalVoidConfirm: document.getElementById('modal-void-confirm'),
  voidReasonInput: document.getElementById('void-reason-input'),
  btnConfirmVoidAction: document.getElementById('btn-confirm-void-action'),

  // Toast
  toast: document.getElementById('celebration-toast'),
  toastTitle: document.getElementById('toast-title'),
  toastMessage: document.getElementById('toast-message'),
  toastIcon: document.getElementById('toast-icon')
};

// Circle circumference for r=120: 2 * Math.PI * 120 = 753.9822
const CIRCLE_CIRCUMFERENCE = 753.98;

let timerInterval = null;
let lastTickTimestamp = 0;

// Rotating scientific insights from the two documents
const INSIGHTS = [
  {
    text: `"Não espere o momento ideal para começar uma tarefa. A ferramenta da <strong>execução máxima</strong> valoriza os blocos curtos imediatos e destrói a procrastinação."`,
    source: "Guia de Estudos 2024"
  },
  {
    text: `"O Pomodoro é <strong>indivisível</strong>. Não existem meios pomodoros. Se começou, ele deve soar o sino. Proteja seus 25 minutos."`,
    source: "Francesco Cirillo"
  },
  {
    text: `"A Recordação Ativa (Active Recall) exige esforço cognitivo ao forçar a memória a recuperar informações, consolidando o aprendizado duradouro."`,
    source: "Guia de Estudos 2024 (IFRS)"
  },
  {
    text: `"Se uma atividade for concluída antes do tempo, continue no <strong>Modo Overlearning</strong>: revise, reorganize e anote aprendizados até o sino tocar."`,
    source: "Francesco Cirillo"
  },
  {
    text: `"Para atividades de alta densidade cognitiva, use silêncio ou <strong>ruídos de mascaramento</strong> (ruído marrom ou chuva) sem músicas com letra."`,
    source: "Guia de Estudos 2024"
  },
  {
    text: `"Se uma tarefa do Mestrado exigir mais de 5 a 7 pomodoros, divida-a em subatividades menores para manter a clareza e o ritmo sustentável."`,
    source: "The Pomodoro Technique"
  }
];

let insightIndex = 0;

/* ====================================================================
   APP INITIALIZATION
   ==================================================================== */
function initApp() {
  setupEventListeners();
  setupModalDismissals();
  applySettingsToUI();
  updateTimerUI();
  renderTasksToday();
  renderInventory();
  renderChecklist();
  renderAnalytics();
  updatePillsTimeDisplay();
  startRotatingTips();

  // Ask for browser notification permission for tab background alerts
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }

  // Subscribe to store updates
  store.subscribe((eventType, payload, data, timer) => {
    updateTimerUI();
    renderTasksToday();
    renderInventory();
    renderChecklist();
    renderAnalytics();
    elements.streakCount.textContent = data.stats.streakDays || 1;
  });
}

/* ====================================================================
   EVENT LISTENERS
   ==================================================================== */
function setupEventListeners() {
  // Navigation Tabs
  elements.tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      switchTab(targetTab);
    });
  });

  // Mode Switcher Buttons (Focus, Short Break, Long Break)
  elements.modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-mode');
      setTimerMode(mode);
    });
  });

  // Play / Pause / Reset / Skip Controls
  elements.btnPlayPause.addEventListener('click', toggleTimer);
  elements.btnResetTimer.addEventListener('click', resetCurrentTimer);
  elements.btnSkipTimer.addEventListener('click', skipCurrentTimer);

  // Interruptions
  elements.btnLogInternal.addEventListener('click', () => openInterruptModal('internal'));
  elements.btnLogExternal.addEventListener('click', () => openInterruptModal('external'));
  elements.btnConfirmInterrupt.addEventListener('click', confirmInterrupt);

  // Void Pomodoro
  elements.btnTriggerVoid.addEventListener('click', () => openModal(elements.modalVoidConfirm));
  elements.btnConfirmVoidAction.addEventListener('click', confirmVoidPomodoro);

  // Active Recall Modal Actions
  elements.btnSaveRecall.addEventListener('click', handleSaveActiveRecall);
  elements.btnSkipRecall.addEventListener('click', handleSkipActiveRecall);

  // Switch Active Task button
  elements.btnSwitchActiveTask.addEventListener('click', () => {
    switchTab('tasks');
  });

  // Add Task Buttons
  elements.btnAddTodayTask.addEventListener('click', () => openNewTaskModal('today'));
  elements.btnAddInventoryTask.addEventListener('click', () => openNewTaskModal('inventory'));
  elements.btnSaveTask.addEventListener('click', handleSaveNewTask);

  // Settings
  elements.btnOpenSettings.addEventListener('click', openSettingsModal);
  elements.btnSaveSettings.addEventListener('click', handleSaveSettings);

  // Audio Controls
  elements.ambientSelect.addEventListener('change', (e) => {
    audioManager.setAmbientSound(e.target.value);
  });

  elements.btnToggleMute.addEventListener('click', () => {
    const isMuted = audioManager.toggleMute();
    elements.btnToggleMute.classList.toggle('active', isMuted);
    showToast(isMuted ? '🔇 Áudio Silenciado' : '🔊 Áudio Ativado', isMuted ? 'Todos os sons foram desativados.' : 'Efeitos sonoros e ruídos habilitados.');
  });

  // Quick reset checklist
  elements.btnQuickResetChecklist.addEventListener('click', () => {
    store.resetDailyChecklist();
    showToast('🌿 Checklist Renovado', 'Espaço e postura preparados para novas sessões.');
  });

  // Analytics Export & Clear
  elements.btnExportData.addEventListener('click', exportAnalyticsJSON);
  elements.btnClearHistory.addEventListener('click', handleClearHistory);
}

function setupModalDismissals() {
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modalId = btn.getAttribute('data-close');
      const targetModal = document.getElementById(modalId);
      if (targetModal) closeModal(targetModal);
    });
  });

  // Click outside modal box to close
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal(overlay);
      }
    });
  });
}

function switchTab(tabId) {
  elements.tabButtons.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
  });
  elements.viewSections.forEach(section => {
    section.classList.toggle('active', section.id === `view-${tabId}`);
  });
}

function openModal(modalEl) {
  modalEl.classList.add('active');
}

function closeModal(modalEl) {
  modalEl.classList.remove('active');
}

/* ====================================================================
   TIMER ENGINE (DRIFT-RESISTANT)
   ==================================================================== */
function setTimerMode(mode) {
  if (store.timer.status === 'running') {
    const confirmSwitch = confirm('Uma sessão está em andamento. Conforme o método Pomodoro, trocar de modo agora cancelará o bloco atual. Deseja continuar?');
    if (!confirmSwitch) return;
    pauseTimer();
  }

  store.timer.mode = mode;
  store.timer.status = 'idle';

  let durationMin = store.data.settings.focusDuration;
  if (mode === 'shortBreak') durationMin = store.data.settings.shortBreakDuration;
  if (mode === 'longBreak') durationMin = store.data.settings.longBreakDuration;

  store.timer.remainingSeconds = durationMin * 60;
  store.timer.totalSeconds = store.timer.remainingSeconds;

  updateTimerUI();
}

function toggleTimer() {
  audioManager.init(); // Unlock AudioContext on user gesture

  if (store.timer.status === 'running') {
    pauseTimer();
  } else {
    startTimer();
  }
}

function startTimer() {
  store.timer.status = 'running';
  if (!store.timer.sessionStartedAt) {
    store.timer.sessionStartedAt = Date.now();
  }

  // Update UI immediately
  elements.mainTimerCard.classList.add('is-running');
  elements.btnPlayIcon.textContent = '⏸';
  elements.btnPlayLabel.textContent = 'PAUSAR';

  timerInterval = setInterval(() => {
    stepTimerSecond();
  }, 1000);

  updateTimerUI();
}

function pauseTimer() {
  store.timer.status = 'paused';
  clearInterval(timerInterval);
  timerInterval = null;

  elements.mainTimerCard.classList.remove('is-running');
  elements.btnPlayIcon.textContent = '▶';
  elements.btnPlayLabel.textContent = 'RETOMAR';
  updateTimerUI();
}

function resetCurrentTimer() {
  pauseTimer();
  store.timer.status = 'idle';

  let durationMin = store.data.settings.focusDuration;
  if (store.timer.mode === 'shortBreak') durationMin = store.data.settings.shortBreakDuration;
  if (store.timer.mode === 'longBreak') durationMin = store.data.settings.longBreakDuration;

  store.timer.remainingSeconds = durationMin * 60;
  store.timer.totalSeconds = store.timer.remainingSeconds;

  elements.btnPlayIcon.textContent = '▶';
  elements.btnPlayLabel.textContent = store.timer.mode === 'focus' ? 'INICIAR FOCO' : 'INICIAR PAUSA';
  updateTimerUI();
}

function skipCurrentTimer() {
  pauseTimer();
  completeCurrentSession(true); // fast skip
}

function stepTimerSecond() {
  if (store.timer.remainingSeconds > 0) {
    store.timer.remainingSeconds -= 1;

    // Optional mechanical tick sound
    if (store.data.settings.tickSound) {
      audioManager.playTick();
    }

    updateTimerDisplay();
  } else {
    // Session completed naturally!
    pauseTimer();
    completeCurrentSession(false);
  }
}

function completeCurrentSession(isSkipped = false) {
  const currentMode = store.timer.mode;

  if (currentMode === 'focus' || currentMode === 'overlearning') {
    // Focus completed!
    audioManager.playChime('focus');

    // Notify tab/desktop
    sendBrowserNotification('🎉 Pomodoro Concluído!', 'Excelente trabalho. Hora do momento de Recordação Ativa!');

    if (!isSkipped) {
      // Prompt Active Recall Modal (Guia de Estudos 2024 IFRS)
      elements.recallInputText.value = '';
      openModal(elements.modalActiveRecall);
    } else {
      store.recordCompletedPomodoro('[Avançado manualmente]');
      advanceToNextSessionMode();
    }

  } else {
    // Break completed!
    audioManager.playChime('break');
    sendBrowserNotification('☕ Pausa Finalizada!', 'Pronto para o próximo bloco de foco de 25 minutos?');
    showToast('☕ Pausa Finalizada', 'Mente revigorada. Vamos para o próximo Pomodoro!');

    // Advance cycle and back to focus
    store.timer.mode = 'focus';
    store.timer.status = 'idle';
    store.timer.remainingSeconds = store.data.settings.focusDuration * 60;
    store.timer.totalSeconds = store.timer.remainingSeconds;

    if (store.data.settings.autoStartPomodoros) {
      startTimer();
    } else {
      updateTimerUI();
    }
  }
}

function handleSaveActiveRecall() {
  const notes = elements.recallInputText.value.trim();
  store.recordCompletedPomodoro(notes);
  closeModal(elements.modalActiveRecall);
  showToast('🧠 Resumo Ativo Salvo!', 'Informações consolidadas na memória de longo prazo.');
  advanceToNextSessionMode();
}

function handleSkipActiveRecall() {
  store.recordCompletedPomodoro('');
  closeModal(elements.modalActiveRecall);
  advanceToNextSessionMode();
}

function advanceToNextSessionMode() {
  // Advance cycle index
  const maxCycles = store.data.settings.longBreakInterval || 4;

  if (store.timer.cycleCount >= maxCycles) {
    // Reached long break!
    store.timer.cycleCount = 1;
    store.timer.mode = 'longBreak';
    store.timer.remainingSeconds = store.data.settings.longBreakDuration * 60;
    store.timer.totalSeconds = store.timer.remainingSeconds;
    showToast('🛋️ Pausa Longa Merecida!', `Você completou ${maxCycles} pomodoros! Descanse por ${store.data.settings.longBreakDuration} minutos.`);
  } else {
    // Short break
    store.timer.cycleCount += 1;
    store.timer.mode = 'shortBreak';
    store.timer.remainingSeconds = store.data.settings.shortBreakDuration * 60;
    store.timer.totalSeconds = store.timer.remainingSeconds;
    showToast('☕ Pausa Curta', `Excelente! Descanse por ${store.data.settings.shortBreakDuration} minutos. Respire e hidrate-se.`);
  }

  store.timer.status = 'idle';

  if (store.data.settings.autoStartBreaks) {
    startTimer();
  } else {
    updateTimerUI();
  }
}

/* ====================================================================
   UI UPDATES & RENDERING
   ==================================================================== */
function updateTimerUI() {
  const timer = store.timer;
  const currentMode = timer.mode;

  // Main Card mode attribute for styling glows & progress stroke
  elements.mainTimerCard.setAttribute('data-mode', currentMode);
  elements.btnPlayPause.setAttribute('data-mode', currentMode);

  // Mode pill buttons state
  elements.modeButtons.forEach(btn => {
    const bMode = btn.getAttribute('data-mode');
    btn.classList.toggle('active', bMode === (currentMode === 'overlearning' ? 'focus' : currentMode));
  });

  // Mode labels
  if (currentMode === 'focus') {
    elements.timerModeLabel.textContent = 'Foco Profundo (Cirillo)';
  } else if (currentMode === 'shortBreak') {
    elements.timerModeLabel.textContent = 'Intervalo Curto';
  } else if (currentMode === 'longBreak') {
    elements.timerModeLabel.textContent = 'Intervalo Longo';
  } else if (currentMode === 'overlearning') {
    elements.timerModeLabel.textContent = 'Revisão Ativa (Overlearning)';
  }

  // Overlearning Banner
  elements.overlearningBanner.classList.toggle('active', currentMode === 'overlearning');

  // Cycle Dots
  const maxCycles = store.data.settings.longBreakInterval || 4;
  elements.cycleLabelText.textContent = `Ciclo ${timer.cycleCount}/${maxCycles}`;
  elements.cycleDots.forEach((dot, idx) => {
    dot.className = 'cycle-dot';
    if (idx < timer.cycleCount - 1) {
      dot.classList.add('filled');
    } else if (idx === timer.cycleCount - 1) {
      dot.classList.add('active-now');
    }
  });

  // Active Task Display in Banner
  const activeTask = store.data.toDoToday.find(t => t.id === timer.activeTaskId);
  if (activeTask) {
    elements.activeTaskCategoryTag.textContent = activeTask.category || 'Geral';
    elements.activeTaskDisplayName.textContent = activeTask.title;
  } else {
    elements.activeTaskCategoryTag.textContent = 'Mestrado';
    elements.activeTaskDisplayName.textContent = 'Sem tarefa ativa selecionada';
  }

  // Interruption Badges on timer screen
  elements.badgeInternalCount.textContent = timer.internalInterruptCountThisSession;
  elements.badgeExternalCount.textContent = timer.externalInterruptCountThisSession;

  // Play button text
  if (timer.status === 'running') {
    elements.btnPlayIcon.textContent = '⏸';
    elements.btnPlayLabel.textContent = 'PAUSAR';
  } else if (timer.status === 'paused') {
    elements.btnPlayIcon.textContent = '▶';
    elements.btnPlayLabel.textContent = 'RETOMAR';
  } else {
    elements.btnPlayIcon.textContent = '▶';
    elements.btnPlayLabel.textContent = currentMode === 'focus' ? 'INICIAR FOCO' : 'INICIAR PAUSA';
  }

  updateTimerDisplay();
  updateSidePanelMiniStats();
}

function updateTimerDisplay() {
  const rem = Math.max(0, store.timer.remainingSeconds);
  const min = Math.floor(rem / 60);
  const sec = rem % 60;
  const timeFormatted = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;

  elements.timerTimeText.textContent = timeFormatted;

  // Title tag update for browser tab awareness
  const modeSymbol = store.timer.mode === 'focus' ? '🍅' : '☕';
  document.title = `(${timeFormatted}) ${modeSymbol} FOCUS MESTRADO`;

  // SVG Progress Ring
  const total = store.timer.totalSeconds || 1;
  const progressRatio = (total - rem) / total;
  const strokeOffset = CIRCLE_CIRCUMFERENCE * (1 - progressRatio);
  elements.timerProgressRing.style.strokeDashoffset = strokeOffset;
}

function updateSidePanelMiniStats() {
  const todayCount = store.data.stats.completedToday || 0;
  const goal = store.data.settings.dailyGoalPomodoros || 8;
  const pct = Math.min(100, Math.round((todayCount / goal) * 100));

  elements.miniStatPomodoros.textContent = todayCount;
  elements.dailyPomodoroStatus.textContent = `${todayCount}/${goal}`;
  elements.miniStatProgressBar.style.width = `${pct}%`;
}

function updatePillsTimeDisplay() {
  elements.pillFocusTime.textContent = store.data.settings.focusDuration;
  elements.pillShortTime.textContent = store.data.settings.shortBreakDuration;
  elements.pillLongTime.textContent = store.data.settings.longBreakDuration;
}

/* ====================================================================
   TASKS RENDERING (TO DO TODAY & INVENTORY)
   ==================================================================== */
function renderTasksToday() {
  const regularTasks = store.data.toDoToday.filter(t => !t.isUrgentUnplanned);
  const urgentTasks = store.data.toDoToday.filter(t => t.isUrgentUnplanned);

  elements.tasksTodayBadge.textContent = store.data.toDoToday.filter(t => !t.isCompleted).length;

  // Render Regular
  if (regularTasks.length === 0) {
    elements.tasksTodayListContainer.innerHTML = `
      <div class="empty-state">
        <p>Nenhuma tarefa planejada para hoje.</p>
        <p style="font-size:0.8rem; margin-top:0.35rem;">Clique em <strong>+ Adicionar Tarefa</strong> ou traga uma tarefa do Inventário.</p>
      </div>`;
  } else {
    elements.tasksTodayListContainer.innerHTML = regularTasks.map(t => createTaskCardHTML(t)).join('');
  }

  // Render Urgent
  if (urgentTasks.length === 0) {
    elements.urgentTasksTodayListContainer.innerHTML = `
      <div class="empty-state" style="padding: 1.25rem;">
        <p style="font-size:0.8rem;">Nenhum imprevisto registrado hoje. Mantenha o foco no plano principal!</p>
      </div>`;
  } else {
    elements.urgentTasksTodayListContainer.innerHTML = urgentTasks.map(t => createTaskCardHTML(t)).join('');
  }

  attachTaskCardListeners();
}

function createTaskCardHTML(task) {
  const isActive = store.timer.activeTaskId === task.id;

  // Build Pomodoro Bubbles
  let bubblesHTML = '';
  // Estimated bubbles
  for (let i = 0; i < task.estimated; i++) {
    const isDone = i < task.completed;
    bubblesHTML += `<div class="bubble ${isDone ? 'completed' : ''}" title="${isDone ? 'Pomodoro Concluído' : 'Pomodoro Estimado'}"></div>`;
  }
  // Extra bubbles (if exceeded estimate - squares as per Cirillo)
  for (let i = 0; i < (task.extra || 0); i++) {
    bubblesHTML += `<div class="bubble extra completed" title="Pomodoro Adicional (Acima da estimativa inicial)"></div>`;
  }

  return `
    <div class="task-item-card ${isActive ? 'is-active-task' : ''} ${task.isCompleted ? 'is-completed' : ''}" data-task-id="${task.id}">
      <div class="task-item-top">
        <div class="task-title-area">
          <button class="task-checkbox-btn ${task.isCompleted ? 'checked' : ''}" data-action="toggle-complete" data-task-id="${task.id}" title="${task.isCompleted ? 'Marcar como não concluída' : 'Concluir tarefa'}">
            ✓
          </button>
          <div>
            <div class="task-title-text">${escapeHTML(task.title)}</div>
            ${task.notes ? `<div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.2rem;">${escapeHTML(task.notes)}</div>` : ''}
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:0.4rem;">
          <span class="task-badge-pill ${task.isUrgentUnplanned ? 'urgent' : ''}">${escapeHTML(task.category)}</span>
          <button class="btn-task-action" data-action="delete-task" data-task-id="${task.id}" title="Excluir tarefa" style="color:#ef4444;">✕</button>
        </div>
      </div>

      <div class="cirillo-tracking-row">
        <!-- Bubbles -->
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <span style="font-size:0.72rem; color:var(--text-muted); font-weight:700;">POMODOROS:</span>
          <div class="pomodoro-bubbles-wrapper">${bubblesHTML}</div>
          <span style="font-size:0.72rem; color:var(--text-secondary); margin-left:0.25rem;">(${task.completed + (task.extra || 0)}/${task.estimated})</span>
        </div>

        <!-- Cirillo Interrupt Markers & Focus Action -->
        <div style="display:flex; align-items:center; gap:0.85rem;">
          <div class="task-interrupt-tags" title="Interrupções registradas nesta tarefa">
            <span class="tag-internal">' ${task.internalInterruptions || 0}</span>
            <span class="tag-external">- ${task.externalInterruptions || 0}</span>
          </div>

          ${!task.isCompleted ? `
            <button class="btn-task-action btn-focus-now" data-action="set-focus" data-task-id="${task.id}">
              ${isActive ? '🎯 Em Foco' : 'Focar Agora'}
            </button>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

function attachTaskCardListeners() {
  document.querySelectorAll('[data-action="toggle-complete"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-task-id');
      store.toggleTaskCompleted(id);
    });
  });

  document.querySelectorAll('[data-action="set-focus"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-task-id');
      store.setActiveTask(id);
      switchTab('timer');
      showToast('🎯 Tarefa em Foco', 'Pronto! O cronômetro agora está vinculado a esta atividade.');
    });
  });

  document.querySelectorAll('[data-action="delete-task"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-task-id');
      if (confirm('Tem certeza que deseja remover esta tarefa de hoje?')) {
        store.deleteTaskToday(id);
      }
    });
  });
}

function renderInventory() {
  const inv = store.data.inventory;
  elements.inventoryBadge.textContent = inv.length;

  if (inv.length === 0) {
    elements.inventoryListContainer.innerHTML = `
      <div class="empty-state">
        <p>Seu inventário de atividades está vazio.</p>
        <p style="font-size:0.8rem; margin-top:0.35rem;">Cadastre disciplinas, artigos e leituras futuras aqui.</p>
      </div>`;
    return;
  }

  elements.inventoryListContainer.innerHTML = inv.map(item => `
    <div class="task-item-card" data-inv-id="${item.id}">
      <div class="task-item-top">
        <div class="task-title-area">
          <div>
            <div class="task-title-text">${escapeHTML(item.title)}</div>
            ${item.notes ? `<div style="font-size:0.75rem; color:var(--text-muted); margin-top:0.2rem;">${escapeHTML(item.notes)}</div>` : ''}
          </div>
        </div>
        <div style="display:flex; align-items:center; gap:0.4rem;">
          <span class="task-badge-pill">${escapeHTML(item.category)}</span>
          <button class="btn-task-action" data-action="delete-inv" data-inv-id="${item.id}" title="Excluir do inventário" style="color:#ef4444;">✕</button>
        </div>
      </div>

      <div class="cirillo-tracking-row">
        <div style="font-size:0.75rem; color:var(--text-muted);">
          Estimativa inicial: <strong>${item.estimated} pomodoro(s)</strong> (${item.estimated * 25} min)
        </div>

        <button class="btn-task-action btn-focus-now" data-action="move-to-today" data-inv-id="${item.id}">
          Mover para Hoje ➔
        </button>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('[data-action="move-to-today"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-inv-id');
      store.moveInventoryToToday(id);
      showToast('📋 Movido para Hoje', 'Tarefa transferida para a sua lista de execução do dia!');
    });
  });

  document.querySelectorAll('[data-action="delete-inv"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-inv-id');
      if (confirm('Deseja excluir esta atividade do inventário?')) {
        store.deleteTaskInventory(id);
      }
    });
  });
}

function renderChecklist() {
  const checklist = store.data.checklist;
  elements.sideChecklistContainer.innerHTML = checklist.map(c => `
    <label class="mini-checklist-item ${c.checked ? 'done' : ''}">
      <input type="checkbox" ${c.checked ? 'checked' : ''} data-check-id="${c.id}">
      <span>${escapeHTML(c.text)}</span>
    </label>
  `).join('');

  elements.sideChecklistContainer.querySelectorAll('input[type="checkbox"]').forEach(input => {
    input.addEventListener('change', () => {
      const id = input.getAttribute('data-check-id');
      store.toggleChecklistItem(id);
    });
  });
}

function renderAnalytics() {
  const history = store.data.history || [];
  const completedSessions = history.filter(s => !s.isVoided);
  const voidedSessions = history.filter(s => s.isVoided);

  const totalPomodoros = completedSessions.length;
  const todayCount = store.data.stats.completedToday || 0;
  const totalMinutes = completedSessions.reduce((acc, cur) => acc + (cur.durationMinutes || 25), 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remMinutes = totalMinutes % 60;

  const totalInternal = history.reduce((acc, cur) => acc + (cur.internalInterruptions || 0), 0);
  const totalExternal = history.reduce((acc, cur) => acc + (cur.externalInterruptions || 0), 0);

  elements.statTotalPomodoros.textContent = totalPomodoros;
  elements.statPomodorosSub.textContent = `${todayCount} hoje`;
  elements.statTotalTime.textContent = `${totalHours}h ${String(remMinutes).padStart(2, '0')}m`;
  elements.statTotalInterrupts.textContent = totalInternal + totalExternal;
  elements.statInterruptsBreakdown.textContent = `${totalInternal} internas ( ' ) / ${totalExternal} externas ( - )`;
  elements.statTotalVoided.textContent = voidedSessions.length;

  // Render Table
  if (history.length === 0) {
    elements.sessionsTableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding:2rem; color:var(--text-muted);">
          Nenhum registro de sessão ainda. Inicie um bloco de foco para gerar estatísticas!
        </td>
      </tr>`;
    return;
  }

  elements.sessionsTableBody.innerHTML = history.slice(0, 30).map(s => {
    const d = new Date(s.timestamp);
    const timeFormatted = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} (${d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })})`;
    return `
      <tr>
        <td style="font-family:'JetBrains Mono',monospace; font-size:0.78rem;">${timeFormatted}</td>
        <td class="session-task-col">${escapeHTML(s.taskTitle || 'Foco Geral')}</td>
        <td>${s.durationMinutes} min</td>
        <td>
          <span class="${s.isVoided ? 'badge-voided' : 'badge-completed'}">
            ${s.isVoided ? 'ANULADO' : 'CONCLUÍDO'}
          </span>
        </td>
        <td>
          <span style="font-size:0.75rem; font-weight:700;">' ${s.internalInterruptions || 0} | - ${s.externalInterruptions || 0}</span>
        </td>
        <td style="font-style:${s.recallNotes ? 'normal' : 'italic'}; color:${s.recallNotes ? 'var(--text-primary)' : 'var(--text-muted)'};">
          ${escapeHTML(s.recallNotes || 'Sem anotações')}
        </td>
      </tr>
    `;
  }).join('');
}

/* ====================================================================
   INTERRUPTIONS & VOID MODALS
   ==================================================================== */
function openInterruptModal(type) {
  audioManager.init();
  elements.interruptTypeInput.value = type;
  elements.interruptInputNote.value = '';

  if (type === 'internal') {
    elements.modalInterruptTitle.textContent = "Interrupção Interna ( ' )";
    elements.modalInterruptDesc.innerHTML = `Você sentiu um impulso ou pensamento disperso (checar celular, beber algo, lembrança)? Conforme Cirillo, marque <strong>'</strong> e desocupe a mente para continuar focado.`;
  } else {
    elements.modalInterruptTitle.textContent = "Interrupção Externa ( - )";
    elements.modalInterruptDesc.innerHTML = `Alguém chamou você ou houve uma urgência externa? Conforme Cirillo, marque <strong>-</strong> e tente negociar para resolver na pausa.`;
  }

  openModal(elements.modalInterrupt);
}

function confirmInterrupt() {
  const type = elements.interruptTypeInput.value;
  const note = elements.interruptInputNote.value.trim();

  store.recordInterruption(type, note);
  closeModal(elements.modalInterrupt);

  if (note) {
    showToast('⚡ Imprevisto Anotado', `"${note}" foi adicionado em Tarefas Não Planejadas & Urgentes.`);
  } else {
    showToast('📝 Interrupção Registrada', `Marcador de interrupção adicionado ao registro do Pomodoro.`);
  }
}

function confirmVoidPomodoro() {
  const reason = elements.voidReasonInput.value.trim() || 'Interrupção definitiva não contornada';
  audioManager.playVoidAlert();
  store.voidCurrentPomodoro(reason);
  closeModal(elements.modalVoidConfirm);
  elements.voidReasonInput.value = '';
  showToast('⚠️ Pomodoro Anulado', 'Conforme Cirillo, o Pomodoro é indivisível. Recomece o bloco com mente zerada!');
}

/* ====================================================================
   NEW TASK MODAL
   ==================================================================== */
function openNewTaskModal(targetList = 'today') {
  elements.taskTargetList.value = targetList;
  elements.taskInputTitle.value = '';
  elements.taskInputNotes.value = '';
  elements.taskInputUrgent.checked = false;

  const urgentCheckboxGroup = document.getElementById('group-urgent-checkbox');
  if (targetList === 'today') {
    elements.modalTaskTitle.textContent = 'Adicionar Tarefa para Hoje';
    urgentCheckboxGroup.style.display = 'flex';
  } else {
    elements.modalTaskTitle.textContent = 'Adicionar Tarefa ao Inventário (Backlog)';
    urgentCheckboxGroup.style.display = 'none';
  }

  openModal(elements.modalTask);
  elements.taskInputTitle.focus();
}

function handleSaveNewTask() {
  const title = elements.taskInputTitle.value.trim();
  if (!title) {
    alert('Por favor, digite o nome da atividade.');
    return;
  }

  const category = elements.taskInputCategory.value;
  const estimated = parseInt(elements.taskInputEstimated.value, 10) || 1;
  const notes = elements.taskInputNotes.value.trim();
  const isUrgent = elements.taskInputUrgent.checked;
  const target = elements.taskTargetList.value;

  if (target === 'today') {
    store.addTaskToToday({
      title,
      category,
      estimated,
      notes,
      isUrgentUnplanned: isUrgent
    });
    showToast('📋 Tarefa Adicionada', `"${title}" inserida na lista de hoje.`);
  } else {
    store.addTaskToInventory({
      title,
      category,
      estimated,
      notes
    });
    showToast('📦 Adicionada ao Inventário', `"${title}" pronta para futuro planejamento.`);
  }

  closeModal(elements.modalTask);
}

/* ====================================================================
   SETTINGS MODAL
   ==================================================================== */
function openSettingsModal() {
  const s = store.data.settings;
  elements.settingFocusDuration.value = s.focusDuration;
  elements.settingShortDuration.value = s.shortBreakDuration;
  elements.settingLongDuration.value = s.longBreakDuration;
  elements.settingCycleInterval.value = s.longBreakInterval;
  elements.settingDailyGoal.value = s.dailyGoalPomodoros;
  elements.settingTickSound.checked = s.tickSound;
  elements.settingAutoBreaks.checked = s.autoStartBreaks;

  openModal(elements.modalSettings);
}

function handleSaveSettings() {
  const newSettings = {
    focusDuration: parseInt(elements.settingFocusDuration.value, 10) || 25,
    shortBreakDuration: parseInt(elements.settingShortDuration.value, 10) || 5,
    longBreakDuration: parseInt(elements.settingLongDuration.value, 10) || 15,
    longBreakInterval: parseInt(elements.settingCycleInterval.value, 10) || 4,
    dailyGoalPomodoros: parseInt(elements.settingDailyGoal.value, 10) || 8,
    tickSound: elements.settingTickSound.checked,
    autoStartBreaks: elements.settingAutoBreaks.checked
  };

  audioManager.isTickEnabled = newSettings.tickSound;
  store.updateSettings(newSettings);
  updatePillsTimeDisplay();
  closeModal(elements.modalSettings);
  showToast('⚙️ Configurações Atualizadas', 'Novas durações e preferências ativas.');
}

function applySettingsToUI() {
  audioManager.isTickEnabled = store.data.settings.tickSound;
  elements.ambientSelect.value = store.data.settings.ambientSound || 'none';
}

/* ====================================================================
   ANALYTICS EXPORT & CLEAR
   ==================================================================== */
function exportAnalyticsJSON() {
  const exportObject = {
    appName: "Focus Mestrado Pomodoro",
    exportDate: new Date().toISOString(),
    history: store.data.history,
    tasksToday: store.data.toDoToday,
    inventory: store.data.inventory,
    stats: store.data.stats,
    settings: store.data.settings
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObject, null, 2));
  const dlAnchorElem = document.createElement('a');
  dlAnchorElem.setAttribute("href", dataStr);
  dlAnchorElem.setAttribute("download", `focus-mestrado-backup-${new Date().toISOString().slice(0, 10)}.json`);
  dlAnchorElem.click();
}

function handleClearHistory() {
  if (confirm('Tem certeza que deseja apagar todo o histórico de sessões e reiniciar as estatísticas?')) {
    store.clearHistory();
    showToast('🗑️ Histórico Limpo', 'Estatísticas zeradas com sucesso.');
  }
}

/* ====================================================================
   TOAST & NOTIFICATIONS
   ==================================================================== */
let toastTimeout = null;
function showToast(title, message, icon = '✨') {
  elements.toastTitle.textContent = title;
  elements.toastMessage.textContent = message;
  elements.toastIcon.textContent = icon;

  elements.toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    elements.toast.classList.remove('show');
  }, 4000);
}

function sendBrowserNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🍅</text></svg>'
    });
  }
}

function startRotatingTips() {
  setInterval(() => {
    insightIndex = (insightIndex + 1) % INSIGHTS.length;
    const item = INSIGHTS[insightIndex];
    elements.rotatingTipText.innerHTML = `${item.text} — <em>${item.source}</em>`;
  }, 25000);
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Start application on DOM ready
document.addEventListener('DOMContentLoaded', initApp);
