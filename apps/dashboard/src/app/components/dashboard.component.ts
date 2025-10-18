import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TaskService, Task } from '../services/task.service';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
import { KeyboardService } from '../services/keyboard.service';
import { TaskCardComponent } from './task-card.component';
import { TaskModalComponent } from './task-modal.component';
import { TaskStatsComponent } from './task-stats.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, TaskCardComponent, TaskModalComponent, TaskStatsComponent],
  template: `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <!-- Header -->
      <header class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="w-10 h-10 bg-primary-600 dark:bg-primary-500 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <h1 class="ml-3 text-2xl font-bold text-gray-900 dark:text-gray-100">Task Manager</h1>
            </div>

            <div class="flex items-center gap-4">
              <!-- Dark Mode Toggle -->
              <button
                (click)="toggleTheme()"
                class="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Toggle dark mode (Ctrl+D)"
              >
                @if (isDarkMode()) {
                  <svg class="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"></path>
                  </svg>
                } @else {
                  <svg class="w-5 h-5 text-gray-700 dark:text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
                  </svg>
                }
              </button>

              <!-- Keyboard Shortcuts Help -->
              <button
                (click)="showShortcutsHelp = !showShortcutsHelp"
                class="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Keyboard shortcuts (?)"
              >
                <svg class="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </button>

              <div class="text-right">
                <p class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ currentUser()?.email }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 uppercase">{{ currentUser()?.role }}</p>
              </div>
              <button
                (click)="logout()"
                class="btn-secondary text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Keyboard Shortcuts Help Modal -->
      @if (showShortcutsHelp) {
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" (click)="showShortcutsHelp = false">
          <div class="card max-w-md w-full mx-4" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">Keyboard Shortcuts</h3>
              <button (click)="showShortcutsHelp = false" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Create task</span>
                <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Ctrl+N</kbd>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Toggle dark mode</span>
                <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Ctrl+D</kbd>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Search tasks</span>
                <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Ctrl+F</kbd>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Close modal</span>
                <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Esc</kbd>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600 dark:text-gray-400">Show shortcuts</span>
                <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">?</kbd>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Controls Bar -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <!-- Search and Filters -->
            <div class="flex flex-col sm:flex-row gap-3 flex-1">
              <div class="relative flex-1 max-w-xs">
                <input
                  [(ngModel)]="searchQuery"
                  (ngModelChange)="applyFilters()"
                  type="text"
                  placeholder="Search tasks... (Ctrl+F)"
                  class="input-field pl-10"
                  #searchInput
                />
                <svg class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>

              <select
                [(ngModel)]="selectedCategory"
                (change)="applyFilters()"
                class="input-field max-w-xs"
              >
                <option value="">All Categories</option>
                @for (category of categories(); track category) {
                  <option [value]="category">{{ category }}</option>
                }
              </select>

              <select
                [(ngModel)]="selectedStatus"
                (change)="applyFilters()"
                class="input-field max-w-xs"
              >
                <option value="">All Statuses</option>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <!-- Create Task Button -->
            @if (canCreateTasks()) {
              <button
                (click)="openCreateModal()"
                class="btn-primary flex items-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                </svg>
                Create Task
              </button>
            }
          </div>
        </div>

        <!-- Task Statistics -->
        @if (allTasks().length > 0) {
          <div class="mb-6">
            <app-task-stats [tasks]="allTasks()"></app-task-stats>
          </div>
        }

        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="card bg-blue-50 dark:bg-blue-900/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-blue-600 dark:text-blue-400">To Do</p>
                <p class="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">{{ getTaskCountByStatus('To Do') }}</p>
              </div>
              <div class="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
            </div>
          </div>

          <div class="card bg-yellow-50 dark:bg-yellow-900/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-yellow-600 dark:text-yellow-400">In Progress</p>
                <p class="text-3xl font-bold text-yellow-900 dark:text-yellow-100 mt-1">{{ getTaskCountByStatus('In Progress') }}</p>
              </div>
              <div class="w-12 h-12 bg-yellow-100 dark:bg-yellow-800 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-yellow-600 dark:text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
            </div>
          </div>

          <div class="card bg-green-50 dark:bg-green-900/20">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-green-600 dark:text-green-400">Done</p>
                <p class="text-3xl font-bold text-green-900 dark:text-green-100 mt-1">{{ getTaskCountByStatus('Done') }}</p>
              </div>
              <div class="w-12 h-12 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center">
                <svg class="w-6 h-6 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Kanban Board -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- To Do Column -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <span class="w-3 h-3 bg-blue-500 rounded-full"></span>
                To Do
              </h2>
              <span class="text-sm text-gray-500 dark:text-gray-400">{{ getTaskCountByStatus('To Do') }}</span>
            </div>

            <div
              cdkDropList
              #todoList="cdkDropList"
              [cdkDropListData]="todoTasks()"
              [cdkDropListConnectedTo]="[inProgressList, doneList]"
              (cdkDropListDropped)="drop($event)"
              class="min-h-[400px] space-y-3"
            >
              @for (task of todoTasks(); track task.id) {
                <div cdkDrag>
                  <app-task-card
                    [task]="task"
                    [canEdit]="canEditTask(task)"
                    [canDelete]="canDeleteTasks()"
                    (edit)="openEditModal(task)"
                    (delete)="deleteTask(task.id)"
                  ></app-task-card>
                </div>
              } @empty {
                <div class="text-center py-12 text-gray-400 dark:text-gray-600">
                  <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                  <p class="text-sm">No tasks</p>
                </div>
              }
            </div>
          </div>

          <!-- In Progress Column -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <span class="w-3 h-3 bg-yellow-500 rounded-full"></span>
                In Progress
              </h2>
              <span class="text-sm text-gray-500 dark:text-gray-400">{{ getTaskCountByStatus('In Progress') }}</span>
            </div>

            <div
              cdkDropList
              #inProgressList="cdkDropList"
              [cdkDropListData]="inProgressTasks()"
              [cdkDropListConnectedTo]="[todoList, doneList]"
              (cdkDropListDropped)="drop($event)"
              class="min-h-[400px] space-y-3"
            >
              @for (task of inProgressTasks(); track task.id) {
                <div cdkDrag>
                  <app-task-card
                    [task]="task"
                    [canEdit]="canEditTask(task)"
                    [canDelete]="canDeleteTasks()"
                    (edit)="openEditModal(task)"
                    (delete)="deleteTask(task.id)"
                  ></app-task-card>
                </div>
              } @empty {
                <div class="text-center py-12 text-gray-400 dark:text-gray-600">
                  <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                  <p class="text-sm">No tasks</p>
                </div>
              }
            </div>
          </div>

          <!-- Done Column -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <span class="w-3 h-3 bg-green-500 rounded-full"></span>
                Done
              </h2>
              <span class="text-sm text-gray-500 dark:text-gray-400">{{ getTaskCountByStatus('Done') }}</span>
            </div>

            <div
              cdkDropList
              #doneList="cdkDropList"
              [cdkDropListData]="doneTasks()"
              [cdkDropListConnectedTo]="[todoList, inProgressList]"
              (cdkDropListDropped)="drop($event)"
              class="min-h-[400px] space-y-3"
            >
              @for (task of doneTasks(); track task.id) {
                <div cdkDrag>
                  <app-task-card
                    [task]="task"
                    [canEdit]="canEditTask(task)"
                    [canDelete]="canDeleteTasks()"
                    (edit)="openEditModal(task)"
                    (delete)="deleteTask(task.id)"
                  ></app-task-card>
                </div>
              } @empty {
                <div class="text-center py-12 text-gray-400 dark:text-gray-600">
                  <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <p class="text-sm">No tasks</p>
                </div>
              }
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Task Modal -->
    @if (showModal()) {
      <app-task-modal
        [task]="selectedTask()"
        [isOpen]="showModal()"
        (close)="closeModal()"
        (save)="saveTask($event)"
      ></app-task-modal>
    }
  `,
  styles: [`
    .cdk-drag-preview {
      opacity: 0.8;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    }

    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .cdk-drop-list-dragging .cdk-drag {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    kbd {
      font-family: monospace;
      font-size: 0.875rem;
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  todoTasks = signal<Task[]>([]);
  inProgressTasks = signal<Task[]>([]);
  doneTasks = signal<Task[]>([]);
  allTasks = signal<Task[]>([]);
  categories = signal<string[]>([]);

  selectedCategory = '';
  selectedStatus = '';
  searchQuery = '';

  showModal = signal(false);
  selectedTask = signal<Task | null>(null);
  currentUser = signal<any>(null);
  isDarkMode = signal(false);
  showShortcutsHelp = false;

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private themeService: ThemeService,
    private keyboardService: KeyboardService
  ) {
    this.currentUser.set(this.authService.getCurrentUser());
    this.isDarkMode = this.themeService.isDarkMode;
  }

  ngOnInit(): void {
    this.loadTasks();
    this.setupKeyboardShortcuts();

    // Subscribe to task updates
    this.taskService.tasks$.subscribe(tasks => {
      this.updateTaskLists(tasks);
      this.allTasks.set(tasks);
      this.categories.set(this.taskService.getCategories());
    });
  }

  ngOnDestroy(): void {
    this.keyboardService.clearShortcuts();
  }

  setupKeyboardShortcuts(): void {
    // Create new task
    this.keyboardService.registerShortcut({
      key: 'n',
      ctrlKey: true,
      description: 'Create new task',
      action: () => {
        if (this.canCreateTasks()) {
          this.openCreateModal();
        }
      }
    });

    // Toggle dark mode
    this.keyboardService.registerShortcut({
      key: 'd',
      ctrlKey: true,
      description: 'Toggle dark mode',
      action: () => this.toggleTheme()
    });

    // Focus search
    this.keyboardService.registerShortcut({
      key: 'f',
      ctrlKey: true,
      description: 'Focus search',
      action: () => {
        const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
    });

    // Close modal
    this.keyboardService.registerShortcut({
      key: 'Escape',
      description: 'Close modal',
      action: () => this.closeModal()
    });

    // Show shortcuts help
    this.keyboardService.registerShortcut({
      key: '?',
      description: 'Show keyboard shortcuts',
      action: () => {
        this.showShortcutsHelp = !this.showShortcutsHelp;
      }
    });
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  loadTasks(): void {
    this.taskService.getTasks().subscribe();
  }

  applyFilters(): void {
    const filters = {
      category: this.selectedCategory || undefined,
      status: this.selectedStatus || undefined
    };
    this.taskService.getTasks(filters).subscribe(tasks => {
      // Apply search filter on client side
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        tasks = tasks.filter(task =>
          task.title.toLowerCase().includes(query) ||
          task.description.toLowerCase().includes(query) ||
          task.category.toLowerCase().includes(query)
        );
      }
      this.updateTaskLists(tasks);
      this.allTasks.set(tasks);
    });
  }

  updateTaskLists(tasks: Task[]): void {
    this.todoTasks.set(tasks.filter(t => t.status === 'To Do'));
    this.inProgressTasks.set(tasks.filter(t => t.status === 'In Progress'));
    this.doneTasks.set(tasks.filter(t => t.status === 'Done'));
  }

  drop(event: CdkDragDrop<Task[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const task = event.previousContainer.data[event.previousIndex];
      const newStatus = this.getStatusFromList(event.container.element.nativeElement);

      if (newStatus && task.status !== newStatus) {
        this.taskService.updateTask(task.id, { status: newStatus }).subscribe(() => {
          transferArrayItem(
            event.previousContainer.data,
            event.container.data,
            event.previousIndex,
            event.currentIndex
          );
        });
      }
    }
  }

  private getStatusFromList(element: HTMLElement): string | null {
    const header = element.querySelector('h2');
    const text = header?.textContent?.trim();

    if (text?.includes('To Do')) return 'To Do';
    if (text?.includes('In Progress')) return 'In Progress';
    if (text?.includes('Done')) return 'Done';

    return null;
  }

  getTaskCountByStatus(status: string): number {
    switch (status) {
      case 'To Do': return this.todoTasks().length;
      case 'In Progress': return this.inProgressTasks().length;
      case 'Done': return this.doneTasks().length;
      default: return 0;
    }
  }

  openCreateModal(): void {
    this.selectedTask.set(null);
    this.showModal.set(true);
  }

  openEditModal(task: Task): void {
    this.selectedTask.set(task);
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.selectedTask.set(null);
  }

  saveTask(taskData: any): void {
    if (this.selectedTask()) {
      // Update existing task
      this.taskService.updateTask(this.selectedTask()!.id, taskData).subscribe(() => {
        this.closeModal();
        this.applyFilters(); // Refresh with current filters
      });
    } else {
      // Create new task
      this.taskService.createTask(taskData).subscribe(() => {
        this.closeModal();
        this.applyFilters(); // Refresh with current filters
      });
    }
  }

  deleteTask(taskId: string): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(taskId).subscribe();
    }
  }

  canCreateTasks(): boolean {
    return this.authService.canCreateTasks();
  }

  canDeleteTasks(): boolean {
    return this.authService.canDeleteTasks();
  }

  canEditTask(task: Task): boolean {
    const user = this.currentUser();
    if (!user) return false;

    // OWNER and ADMIN can edit any task
    if (this.authService.canEditAnyTask()) return true;

    // Users can edit their own tasks
    return task.createdById === user.id;
  }

  logout(): void {
    this.authService.logout();
  }
}
