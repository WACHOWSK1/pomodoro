// State Management with LocalStorage persistence & Cirillo Method data structure

const STORAGE_KEY = 'pomodoro_mestrado_data_v1';

const DEFAULT_SETTINGS = {
  focusDuration: 25,       // minutes (Cirillo standard)
  shortBreakDuration: 5,   // minutes (Cirillo standard: 3-5 min)
  longBreakDuration: 15,   // minutes (Cirillo standard: 15-30 min)
  longBreakInterval: 4,    // 4 pomodoros before long break
  autoStartBreaks: false,
  autoStartPomodoros: false,
  tickSound: false,
  effectsVolume: 0.7,
  ambientVolume: 0.35,
  ambientSound: 'none',
  dailyGoalPomodoros: 8
};

const DEFAULT_TASKS_TODAY = [
  {
    id: 'task-1',
    title: 'Revisão bibliográfica: Leitura de artigos do Mestrado',
    category: 'Mestrado',
    estimated: 3,
    completed: 0,
    extra: 0,
    internalInterruptions: 0,
    externalInterruptions: 0,
    isCompleted: false,
    isUrgentUnplanned: false,
    notes: 'Anotar conceitos-chave com resumo ativo',
    createdAt: Date.now()
  },
  {
    id: 'task-2',
    title: 'Fichamento e Recordação Ativa dos capítulos',
    category: 'Pesquisa',
    estimated: 2,
    completed: 0,
    extra: 0,
    internalInterruptions: 0,
    externalInterruptions: 0,
    isCompleted: false,
    isUrgentUnplanned: false,
    notes: 'Criar tópicos e perguntas para autoavaliação',
    createdAt: Date.now()
  }
];

const DEFAULT_INVENTORY = [
  {
    id: 'inv-1',
    title: 'Redigir introdução e objetivos da dissertação',
    category: 'Mestrado',
    estimated: 5,
    notes: 'Dividir em seções menores se passar de 5 pomodoros'
  },
  {
    id: 'inv-2',
    title: 'Organizar referências no Zotero / Mendeley',
    category: 'Rotina',
    estimated: 2,
    notes: 'Padronizar citações ABNT'
  },
  {
    id: 'inv-3',
    title: 'Análise exploratória dos dados coletados',
    category: 'Pesquisa',
    estimated: 4,
    notes: 'Gerar gráficos e tabelas preliminares'
  }
];

const DEFAULT_CHECKLIST = [
  { id: 'c1', text: 'Mesa limpa e organizada (sem poluição visual)', checked: false },
  { id: 'c2', text: 'Garrafa de água abastecida e ao alcance', checked: false },
  { id: 'c3', text: 'Celular no modo "Não Perturbe" ou em outro cômodo', checked: false },
  { id: 'c4', text: 'Materiais, PDFs e anotações já abertos na tela', checked: false },
  { id: 'c5', text: 'Iluminação equilibrada (sem reflexos ou cansaço visual)', checked: false }
];

export class Store {
  constructor() {
    this.listeners = [];
    this.data = this.loadData();
    this.timer = {
      mode: 'focus', // 'focus' | 'shortBreak' | 'longBreak' | 'overlearning'
      status: 'idle', // 'idle' | 'running' | 'paused'
      remainingSeconds: this.data.settings.focusDuration * 60,
      totalSeconds: this.data.settings.focusDuration * 60,
      cycleCount: 1, // current pomodoro in cycle (1 to 4)
      activeTaskId: this.data.toDoToday.length > 0 ? this.data.toDoToday[0].id : null,
      sessionStartedAt: null,
      internalInterruptCountThisSession: 0,
      externalInterruptCountThisSession: 0
    };
  }

  loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
          toDoToday: parsed.toDoToday || DEFAULT_TASKS_TODAY,
          inventory: parsed.inventory || DEFAULT_INVENTORY,
          checklist: parsed.checklist || DEFAULT_CHECKLIST,
          history: parsed.history || [],
          stats: {
            todayDate: new Date().toISOString().slice(0, 10),
            completedToday: 0,
            streakDays: 1,
            lastActiveDate: new Date().toISOString().slice(0, 10),
            ...(parsed.stats || {})
          }
        };
      }
    } catch (e) {
      console.warn('Erro ao carregar dados do LocalStorage, usando padrão:', e);
    }

    return {
      settings: { ...DEFAULT_SETTINGS },
      toDoToday: DEFAULT_TASKS_TODAY,
      inventory: DEFAULT_INVENTORY,
      checklist: DEFAULT_CHECKLIST,
      history: [],
      stats: {
        todayDate: new Date().toISOString().slice(0, 10),
        completedToday: 0,
        streakDays: 1,
        lastActiveDate: new Date().toISOString().slice(0, 10)
      }
    };
  }

  saveData() {
    try {
      // Refresh daily stats check
      const today = new Date().toISOString().slice(0, 10);
      if (this.data.stats.todayDate !== today) {
        // Calculate streak
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        if (this.data.stats.lastActiveDate === yesterday && this.data.stats.completedToday > 0) {
          this.data.stats.streakDays += 1;
        } else if (this.data.stats.lastActiveDate !== today) {
          // Reset streak if missed day
          if (this.data.stats.lastActiveDate !== yesterday) {
            this.data.stats.streakDays = 1;
          }
        }
        this.data.stats.todayDate = today;
        this.data.stats.completedToday = 0;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error('Falha ao persistir no LocalStorage', e);
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify(eventType, payload) {
    this.saveData();
    this.listeners.forEach(cb => cb(eventType, payload, this.data, this.timer));
  }

  // Settings
  updateSettings(newSettings) {
    this.data.settings = { ...this.data.settings, ...newSettings };
    if (this.timer.status === 'idle') {
      if (this.timer.mode === 'focus') {
        this.timer.remainingSeconds = this.data.settings.focusDuration * 60;
        this.timer.totalSeconds = this.timer.remainingSeconds;
      } else if (this.timer.mode === 'shortBreak') {
        this.timer.remainingSeconds = this.data.settings.shortBreakDuration * 60;
        this.timer.totalSeconds = this.timer.remainingSeconds;
      } else if (this.timer.mode === 'longBreak') {
        this.timer.remainingSeconds = this.data.settings.longBreakDuration * 60;
        this.timer.totalSeconds = this.timer.remainingSeconds;
      }
    }
    this.notify('SETTINGS_UPDATED', this.data.settings);
  }

  // Tasks Methods
  addTaskToToday(task) {
    const newTask = {
      id: 'task-' + Date.now(),
      title: task.title.trim(),
      category: task.category || 'Geral',
      estimated: Number(task.estimated) || 1,
      completed: 0,
      extra: 0,
      internalInterruptions: 0,
      externalInterruptions: 0,
      isCompleted: false,
      isUrgentUnplanned: !!task.isUrgentUnplanned,
      notes: task.notes || '',
      createdAt: Date.now()
    };
    this.data.toDoToday.unshift(newTask);
    if (!this.timer.activeTaskId) {
      this.timer.activeTaskId = newTask.id;
    }
    this.notify('TASKS_UPDATED', { action: 'add_today', task: newTask });
  }

  addTaskToInventory(task) {
    const newTask = {
      id: 'inv-' + Date.now(),
      title: task.title.trim(),
      category: task.category || 'Geral',
      estimated: Number(task.estimated) || 1,
      notes: task.notes || ''
    };
    this.data.inventory.push(newTask);
    this.notify('INVENTORY_UPDATED', { action: 'add_inventory', task: newTask });
  }

  moveInventoryToToday(invId) {
    const idx = this.data.inventory.findIndex(item => item.id === invId);
    if (idx !== -1) {
      const [item] = this.data.inventory.splice(idx, 1);
      this.addTaskToToday({
        title: item.title,
        category: item.category,
        estimated: item.estimated,
        notes: item.notes,
        isUrgentUnplanned: false
      });
      this.notify('TASKS_UPDATED', { action: 'moved_from_inventory', item });
    }
  }

  deleteTaskToday(taskId) {
    this.data.toDoToday = this.data.toDoToday.filter(t => t.id !== taskId);
    if (this.timer.activeTaskId === taskId) {
      const nextTask = this.data.toDoToday.find(t => !t.isCompleted);
      this.timer.activeTaskId = nextTask ? nextTask.id : null;
    }
    this.notify('TASKS_UPDATED', { action: 'delete_today', taskId });
  }

  deleteTaskInventory(invId) {
    this.data.inventory = this.data.inventory.filter(t => t.id !== invId);
    this.notify('INVENTORY_UPDATED', { action: 'delete_inventory', invId });
  }

  setActiveTask(taskId) {
    this.timer.activeTaskId = taskId;
    this.notify('ACTIVE_TASK_CHANGED', { taskId });
  }

  toggleTaskCompleted(taskId) {
    const task = this.data.toDoToday.find(t => t.id === taskId);
    if (task) {
      task.isCompleted = !task.isCompleted;
      // If task was completed while timer is running in Focus mode:
      // Trigger Cirillo's Overlearning principle!
      let overlearningTriggered = false;
      if (task.isCompleted && this.timer.mode === 'focus' && this.timer.status === 'running') {
        this.timer.mode = 'overlearning';
        overlearningTriggered = true;
      }
      this.notify('TASKS_UPDATED', { action: 'toggle_completed', task, overlearningTriggered });
    }
  }

  // Interruption Tracking (Cirillo's apostrophe ' and dash -)
  recordInterruption(type, note = '') {
    // type: 'internal' (') or 'external' (-)
    const activeTask = this.data.toDoToday.find(t => t.id === this.timer.activeTaskId);
    if (activeTask) {
      if (type === 'internal') {
        activeTask.internalInterruptions += 1;
        this.timer.internalInterruptCountThisSession += 1;
      } else {
        activeTask.externalInterruptions += 1;
        this.timer.externalInterruptCountThisSession += 1;
      }
    }

    if (note && note.trim()) {
      // If user typed an urgent unplanned item, add to "Unplanned & Urgent"
      this.addTaskToToday({
        title: note.trim(),
        category: 'Imprevisto',
        estimated: 1,
        notes: `Gerado durante foco na tarefa "${activeTask ? activeTask.title : 'Sessão'}"`,
        isUrgentUnplanned: true
      });
    }

    this.notify('INTERRUPTION_RECORDED', { type, activeTaskId: this.timer.activeTaskId, note });
  }

  // Record completed session
  recordCompletedPomodoro(recallNotes = '') {
    const today = new Date().toISOString().slice(0, 10);
    this.data.stats.completedToday += 1;
    this.data.stats.lastActiveDate = today;

    const activeTask = this.data.toDoToday.find(t => t.id === this.timer.activeTaskId);
    if (activeTask) {
      if (activeTask.completed < activeTask.estimated) {
        activeTask.completed += 1;
      } else {
        activeTask.extra += 1; // Extra pomodoro beyond estimate
      }
    }

    const sessionRecord = {
      id: 'session-' + Date.now(),
      timestamp: Date.now(),
      dateStr: today,
      durationMinutes: this.data.settings.focusDuration,
      taskId: this.timer.activeTaskId,
      taskTitle: activeTask ? activeTask.title : 'Foco Geral',
      category: activeTask ? activeTask.category : 'Geral',
      internalInterruptions: this.timer.internalInterruptCountThisSession,
      externalInterruptions: this.timer.externalInterruptCountThisSession,
      recallNotes: recallNotes || '',
      isVoided: false
    };

    this.data.history.unshift(sessionRecord);
    this.timer.internalInterruptCountThisSession = 0;
    this.timer.externalInterruptCountThisSession = 0;

    this.notify('POMODORO_COMPLETED', { session: sessionRecord, task: activeTask });
  }

  // Void a Pomodoro (Cirillo Rule: "The Pomodoro is Indivisible. If interrupted definitively, it is voided")
  voidCurrentPomodoro(reason = 'Interrupção definitiva') {
    const activeTask = this.data.toDoToday.find(t => t.id === this.timer.activeTaskId);
    const sessionRecord = {
      id: 'void-' + Date.now(),
      timestamp: Date.now(),
      dateStr: new Date().toISOString().slice(0, 10),
      durationMinutes: Math.round((this.timer.totalSeconds - this.timer.remainingSeconds) / 60),
      taskId: this.timer.activeTaskId,
      taskTitle: activeTask ? activeTask.title : 'Foco Geral',
      category: activeTask ? activeTask.category : 'Geral',
      internalInterruptions: this.timer.internalInterruptCountThisSession,
      externalInterruptions: this.timer.externalInterruptCountThisSession,
      recallNotes: `[ANULADO]: ${reason}`,
      isVoided: true
    };

    this.data.history.unshift(sessionRecord);
    this.timer.internalInterruptCountThisSession = 0;
    this.timer.externalInterruptCountThisSession = 0;

    // Reset current pomodoro timer
    this.timer.status = 'idle';
    this.timer.mode = 'focus';
    this.timer.remainingSeconds = this.data.settings.focusDuration * 60;
    this.timer.totalSeconds = this.timer.remainingSeconds;

    this.notify('POMODORO_VOIDED', { session: sessionRecord });
  }

  toggleChecklistItem(id) {
    const item = this.data.checklist.find(c => c.id === id);
    if (item) {
      item.checked = !item.checked;
      this.notify('CHECKLIST_UPDATED', { item });
    }
  }

  resetDailyChecklist() {
    this.data.checklist.forEach(c => c.checked = false);
    this.notify('CHECKLIST_UPDATED', { reset: true });
  }

  clearHistory() {
    this.data.history = [];
    this.data.stats.completedToday = 0;
    this.notify('HISTORY_CLEARED', {});
  }
}

export const store = new Store();
