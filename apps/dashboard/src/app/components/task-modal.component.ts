import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Task } from '../services/task.service';

@Component({
  selector: 'app-task-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    @if (isOpen) {
      <!-- Modal Backdrop -->
      <div
        class="fixed inset-0 bg-gray-900 bg-opacity-75 dark:bg-opacity-90 z-40 transition-opacity"
        (click)="onClose()"
      ></div>

      <!-- Modal Dialog -->
      <div class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full transform transition-all">
            <!-- Modal Header -->
            <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {{ task ? 'Edit Task' : 'Create New Task' }}
              </h2>
              <button
                (click)="onClose()"
                class="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <!-- Modal Body -->
            <form [formGroup]="taskForm" (ngSubmit)="onSubmit()" class="p-6 space-y-5">
              <!-- Title -->
              <div>
                <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title <span class="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  formControlName="title"
                  class="input-field"
                  [class.border-red-500]="taskForm.get('title')?.invalid && taskForm.get('title')?.touched"
                  placeholder="Enter task title"
                />
                @if (taskForm.get('title')?.invalid && taskForm.get('title')?.touched) {
                  <p class="mt-1 text-sm text-red-600">Title is required</p>
                }
              </div>

              <!-- Description -->
              <div>
                <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  formControlName="description"
                  rows="4"
                  class="input-field resize-none"
                  placeholder="Enter task description"
                ></textarea>
              </div>

              <!-- Category and Status Row -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <!-- Category -->
                <div>
                  <label for="category" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category <span class="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    formControlName="category"
                    class="input-field"
                    [class.border-red-500]="taskForm.get('category')?.invalid && taskForm.get('category')?.touched"
                  >
                    <option value="">Select category</option>
                    <option value="Work">Work</option>
                    <option value="Personal">Personal</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Health">Health</option>
                    <option value="Education">Education</option>
                    <option value="Other">Other</option>
                  </select>
                  @if (taskForm.get('category')?.invalid && taskForm.get('category')?.touched) {
                    <p class="mt-1 text-sm text-red-600">Category is required</p>
                  }
                </div>

                <!-- Status -->
                <div>
                  <label for="status" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status <span class="text-red-500">*</span>
                  </label>
                  <select
                    id="status"
                    formControlName="status"
                    class="input-field"
                    [class.border-red-500]="taskForm.get('status')?.invalid && taskForm.get('status')?.touched"
                  >
                    <option value="">Select status</option>
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                  @if (taskForm.get('status')?.invalid && taskForm.get('status')?.touched) {
                    <p class="mt-1 text-sm text-red-600">Status is required</p>
                  }
                </div>
              </div>

              <!-- Error Message -->
              @if (errorMessage()) {
                <div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-start">
                  <svg class="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
                  </svg>
                  <span>{{ errorMessage() }}</span>
                </div>
              }

              <!-- Modal Footer -->
              <div class="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  (click)="onClose()"
                  class="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  [disabled]="taskForm.invalid || isLoading()"
                  class="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  @if (isLoading()) {
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  }
                  {{ task ? 'Update Task' : 'Create Task' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }
  `,
  styles: []
})
export class TaskModalComponent implements OnInit {
  @Input() task: Task | null = null;
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  taskForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(private fb: FormBuilder) {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      category: ['', Validators.required],
      status: ['To Do', Validators.required]
    });
  }

  ngOnInit(): void {
    if (this.task) {
      this.taskForm.patchValue({
        title: this.task.title,
        description: this.task.description,
        category: this.task.category,
        status: this.task.status
      });
    }
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set('');
      this.save.emit(this.taskForm.value);
    }
  }

  onClose(): void {
    this.close.emit();
  }
}
