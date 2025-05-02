import { ref } from 'vue';

class TimerService {
  private static instance: TimerService;
  private timer = ref<number>(0);
  private timerInterval: number | null = null;
  private tabChangeCallback: (() => void) | null = null;
  private timeLimit: number = 60 * 60; // 1 hour in seconds
  private startTime: number | null = null;
  private readonly STORAGE_KEY = 'quiz_timer';

  private constructor() {
    // Load saved timer state
    const savedState = localStorage.getItem(this.STORAGE_KEY);
    if (savedState) {
      const { startTime: savedStartTime, elapsedTime } = JSON.parse(savedState);
      const now = Math.floor(Date.now() / 1000);
      const elapsedSinceSave = now - savedStartTime;
      this.timer.value = Math.min(elapsedTime + elapsedSinceSave, this.timeLimit);
      this.startTime = savedStartTime;
    }

    // Add tab change detection
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  private handleVisibilityChange = () => {
    if (document.hidden && this.tabChangeCallback) {
      this.tabChangeCallback();
    }
  };

  public static getInstance(): TimerService {
    if (!TimerService.instance) {
      TimerService.instance = new TimerService();
    }
    return TimerService.instance;
  }

  public getTimer() {
    return this.timer.value;
  }

  public getTimeLeft() {
    return this.timeLimit - this.timer.value;
  }

  public start(callback: () => void) {
    if (!this.timerInterval) {
      this.startTime = Math.floor(Date.now() / 1000);
      this.timerInterval = window.setInterval(() => {
        this.timer.value++;
        this.saveState();
        if (this.timer.value >= this.timeLimit) {
          this.stop();
          callback();
        }
      }, 1000);
    }
  }

  public stop() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
      this.saveState();
    }
  }

  public reset() {
    this.stop();
    this.timer.value = 0;
    this.startTime = null;
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private saveState() {
    if (this.startTime) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
        startTime: this.startTime,
        elapsedTime: this.timer.value
      }));
    }
  }

  public setTabChangeCallback(callback: (() => void) | null) {
    this.tabChangeCallback = callback;
  }

  public cleanup() {
    this.stop();
    this.reset();
    this.tabChangeCallback = null;
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }
}

export const timerService = TimerService.getInstance(); 