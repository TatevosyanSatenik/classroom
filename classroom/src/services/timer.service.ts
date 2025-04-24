import { ref } from 'vue';

const STORAGE_KEY = 'exam_timer';
const ONE_HOUR = 3600;

class TimerService {
  private timeLeft = ref(this.getStoredTime());
  private timer: number | null = null;
  private onTimeUpCallback: (() => void) | null = null;
  private onTabChangeCallback: (() => void) | null = null;
  private lastFocusTime = Date.now();
  private focusCheckInterval: number | null = null;

  constructor() {
    window.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('focus', this.handleFocus);
    window.addEventListener('blur', this.handleBlur);
    this.startFocusCheck();
  }

  private getStoredTime(): number {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const storedTime = parseInt(stored, 10);
      const storedTimestamp = parseInt(localStorage.getItem(`${STORAGE_KEY}_timestamp`) || '0', 10);
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - storedTimestamp) / 1000);
      const remainingTime = Math.max(0, storedTime - elapsedSeconds);
      return remainingTime || ONE_HOUR;
    }
    return ONE_HOUR;
  }

  private storeTime(time: number) {
    localStorage.setItem(STORAGE_KEY, time.toString());
    localStorage.setItem(`${STORAGE_KEY}_timestamp`, Date.now().toString());
  }

  private startFocusCheck() {
    this.focusCheckInterval = window.setInterval(() => {
      if (document.hidden) {
        this.handleTabChange();
      }
    }, 1000);
  }

  private handleFocus = () => {
    this.lastFocusTime = Date.now();
  }

  private handleBlur = () => {
    const timeAway = Date.now() - this.lastFocusTime;
    if (timeAway > 1000) {
      this.handleTabChange();
    }
  }

  private handleVisibilityChange = () => {
    if (document.hidden) {
      this.handleTabChange();
    }
  }

  private handleTabChange = () => {
    if (this.onTabChangeCallback) {
      this.onTabChangeCallback();
    }
  }

  start(onTimeUp: () => void) {
    this.onTimeUpCallback = onTimeUp;
    this.timer = window.setInterval(() => {
      this.timeLeft.value--;
      this.storeTime(this.timeLeft.value);
      
      if (this.timeLeft.value <= 0) {
        this.stop();
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(`${STORAGE_KEY}_timestamp`);
        onTimeUp();
      }
    }, 1000);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  getTimeLeft() {
    return this.timeLeft.value;
  }

  setTabChangeCallback(callback: () => void) {
    this.onTabChangeCallback = callback;
  }

  cleanup() {
    this.stop();
    if (this.focusCheckInterval) {
      clearInterval(this.focusCheckInterval);
    }
    window.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('focus', this.handleFocus);
    window.removeEventListener('blur', this.handleBlur);
  }
}

export const timerService = new TimerService(); 