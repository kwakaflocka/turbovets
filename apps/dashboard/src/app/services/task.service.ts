import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';

export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'To Do' | 'In Progress' | 'Done';
  createdById: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskDto {
  title: string;
  description: string;
  category: string;
  status: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  category?: string;
  status?: string;
}

export interface TaskFilters {
  category?: string;
  status?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  order?: 'ASC' | 'DESC';
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly API_URL = 'http://localhost:3000/api';

  private tasksSubject = new BehaviorSubject<Task[]>([]);
  public tasks$ = this.tasksSubject.asObservable();

  isLoading = signal(false);

  constructor(private http: HttpClient) {}

  getTasks(filters?: TaskFilters): Observable<Task[]> {
    this.isLoading.set(true);
    let params = new HttpParams();

    if (filters?.category) {
      params = params.set('category', filters.category);
    }
    if (filters?.status) {
      params = params.set('status', filters.status);
    }
    if (filters?.sortBy) {
      params = params.set('sortBy', filters.sortBy);
    }
    if (filters?.order) {
      params = params.set('order', filters.order);
    }

    return this.http.get<Task[]>(`${this.API_URL}/tasks`, { params }).pipe(
      tap(tasks => {
        this.tasksSubject.next(tasks);
        this.isLoading.set(false);
      })
    );
  }

  getTaskById(id: string): Observable<Task> {
    return this.http.get<Task>(`${this.API_URL}/tasks/${id}`);
  }

  createTask(task: CreateTaskDto): Observable<Task> {
    return this.http.post<Task>(`${this.API_URL}/tasks`, task).pipe(
      tap(newTask => {
        const currentTasks = this.tasksSubject.value;
        this.tasksSubject.next([...currentTasks, newTask]);
      })
    );
  }

  updateTask(id: string, task: UpdateTaskDto): Observable<Task> {
    return this.http.put<Task>(`${this.API_URL}/tasks/${id}`, task).pipe(
      tap(updatedTask => {
        const currentTasks = this.tasksSubject.value;
        const index = currentTasks.findIndex(t => t.id === id);
        if (index !== -1) {
          currentTasks[index] = updatedTask;
          this.tasksSubject.next([...currentTasks]);
        }
      })
    );
  }

  deleteTask(id: string): Observable<any> {
    return this.http.delete(`${this.API_URL}/tasks/${id}`).pipe(
      tap(() => {
        const currentTasks = this.tasksSubject.value;
        this.tasksSubject.next(currentTasks.filter(t => t.id !== id));
      })
    );
  }

  getTasksByStatus(status: string): Task[] {
    return this.tasksSubject.value.filter(task => task.status === status);
  }

  getCategories(): string[] {
    const tasks = this.tasksSubject.value;
    const categories = tasks.map(task => task.category);
    return Array.from(new Set(categories)).sort();
  }
}
