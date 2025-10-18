import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  description: string;
  action: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class KeyboardService {
  private shortcuts: KeyboardShortcut[] = [];
  private shortcutTriggered = new Subject<string>();

  shortcutTriggered$ = this.shortcutTriggered.asObservable();

  constructor() {
    this.initializeListener();
  }

  registerShortcut(shortcut: KeyboardShortcut): void {
    this.shortcuts.push(shortcut);
  }

  clearShortcuts(): void {
    this.shortcuts = [];
  }

  getShortcuts(): KeyboardShortcut[] {
    return this.shortcuts;
  }

  private initializeListener(): void {
    document.addEventListener('keydown', (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      for (const shortcut of this.shortcuts) {
        if (this.matchesShortcut(event, shortcut)) {
          event.preventDefault();
          shortcut.action();
          this.shortcutTriggered.next(this.getShortcutString(shortcut));
          break;
        }
      }
    });
  }

  private matchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
    return (
      event.key.toLowerCase() === shortcut.key.toLowerCase() &&
      !!event.ctrlKey === !!shortcut.ctrlKey &&
      !!event.shiftKey === !!shortcut.shiftKey &&
      !!event.altKey === !!shortcut.altKey
    );
  }

  private getShortcutString(shortcut: KeyboardShortcut): string {
    const keys: string[] = [];
    if (shortcut.ctrlKey) keys.push('Ctrl');
    if (shortcut.shiftKey) keys.push('Shift');
    if (shortcut.altKey) keys.push('Alt');
    keys.push(shortcut.key.toUpperCase());
    return keys.join('+');
  }
}
