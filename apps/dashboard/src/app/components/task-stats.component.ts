import { Component, Input, OnChanges, SimpleChanges, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { Task } from '../services/task.service';

Chart.register(...registerables);

@Component({
  selector: 'app-task-stats',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white">Task Analytics</h2>
        <button
          (click)="toggleChartType()"
          class="px-3 py-1 text-sm bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-200 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
        >
          {{ chartType === 'bar' ? 'Show Pie Chart' : 'Show Bar Chart' }}
        </button>
      </div>

      <!-- Charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Status Chart -->
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Tasks by Status</h3>
          <canvas #statusChart></canvas>
        </div>

        <!-- Category Chart -->
        <div class="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Tasks by Category</h3>
          <canvas #categoryChart></canvas>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <div class="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border border-transparent dark:border-blue-700">
          <p class="text-xs text-blue-600 dark:text-blue-300 font-medium">Total Tasks</p>
          <p class="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">{{ totalTasks }}</p>
        </div>
        <div class="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 border border-transparent dark:border-green-700">
          <p class="text-xs text-green-600 dark:text-green-300 font-medium">Completed</p>
          <p class="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">{{ completedTasks }}</p>
        </div>
        <div class="bg-yellow-50 dark:bg-yellow-900/30 rounded-lg p-4 border border-transparent dark:border-yellow-700">
          <p class="text-xs text-yellow-600 dark:text-yellow-300 font-medium">In Progress</p>
          <p class="text-2xl font-bold text-yellow-900 dark:text-yellow-100 mt-1">{{ inProgressTasks }}</p>
        </div>
        <div class="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4 border border-transparent dark:border-purple-700">
          <p class="text-xs text-purple-600 dark:text-purple-300 font-medium">Completion Rate</p>
          <p class="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1">{{ completionRate }}%</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    canvas {
      max-height: 250px;
    }
  `]
})
export class TaskStatsComponent implements OnChanges, AfterViewInit {
  @Input() tasks: Task[] = [];
  @ViewChild('statusChart') statusChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryChart') categoryChartRef!: ElementRef<HTMLCanvasElement>;

  private statusChart?: Chart;
  private categoryChart?: Chart;

  chartType: 'bar' | 'pie' = 'bar';

  totalTasks = 0;
  completedTasks = 0;
  inProgressTasks = 0;
  completionRate = 0;

  ngAfterViewInit() {
    this.createCharts();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['tasks'] && !changes['tasks'].firstChange) {
      this.updateStats();
      this.updateCharts();
    }
  }

  toggleChartType() {
    this.chartType = this.chartType === 'bar' ? 'pie' : 'bar';
    this.updateCharts();
  }

  private createCharts() {
    this.updateStats();

    // Status Chart
    const statusCtx = this.statusChartRef.nativeElement.getContext('2d');
    if (statusCtx) {
      this.statusChart = new Chart(statusCtx, this.getStatusChartConfig());
    }

    // Category Chart
    const categoryCtx = this.categoryChartRef.nativeElement.getContext('2d');
    if (categoryCtx) {
      this.categoryChart = new Chart(categoryCtx, this.getCategoryChartConfig());
    }
  }

  private updateCharts() {
    if (this.statusChart) {
      this.statusChart.destroy();
      const statusCtx = this.statusChartRef.nativeElement.getContext('2d');
      if (statusCtx) {
        this.statusChart = new Chart(statusCtx, this.getStatusChartConfig());
      }
    }

    if (this.categoryChart) {
      this.categoryChart.destroy();
      const categoryCtx = this.categoryChartRef.nativeElement.getContext('2d');
      if (categoryCtx) {
        this.categoryChart = new Chart(categoryCtx, this.getCategoryChartConfig());
      }
    }
  }

  private updateStats() {
    this.totalTasks = this.tasks.length;
    this.completedTasks = this.tasks.filter(t => t.status === 'Done').length;
    this.inProgressTasks = this.tasks.filter(t => t.status === 'In Progress').length;
    this.completionRate = this.totalTasks > 0
      ? Math.round((this.completedTasks / this.totalTasks) * 100)
      : 0;
  }

  private getStatusChartConfig(): ChartConfiguration {
    const isDarkMode = document.documentElement.classList.contains('dark');
    const textColor = isDarkMode ? '#e5e7eb' : '#1f2937';
    const gridColor = isDarkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(209, 213, 219, 0.8)';

    const statusCounts = {
      'To Do': this.tasks.filter(t => t.status === 'To Do').length,
      'In Progress': this.tasks.filter(t => t.status === 'In Progress').length,
      'Done': this.tasks.filter(t => t.status === 'Done').length,
    };

    return {
      type: this.chartType,
      data: {
        labels: Object.keys(statusCounts),
        datasets: [{
          label: 'Tasks',
          data: Object.values(statusCounts),
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',  // Blue
            'rgba(234, 179, 8, 0.8)',   // Yellow
            'rgba(34, 197, 94, 0.8)',   // Green
          ],
          borderColor: [
            'rgb(59, 130, 246)',
            'rgb(234, 179, 8)',
            'rgb(34, 197, 94)',
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: textColor,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = this.chartType === 'bar' ? context.parsed.y : context.parsed;
                const total = this.totalTasks;
                const percentage = total > 0 ? Math.round((Number(value) / total) * 100) : 0;
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        },
        scales: this.chartType === 'bar' ? {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              color: textColor
            },
            grid: {
              color: gridColor
            }
          },
          x: {
            ticks: {
              color: textColor
            },
            grid: {
              color: gridColor
            }
          }
        } : undefined
      }
    };
  }

  private getCategoryChartConfig(): ChartConfiguration {
    const isDarkMode = document.documentElement.classList.contains('dark');
    const textColor = isDarkMode ? '#e5e7eb' : '#1f2937';
    const gridColor = isDarkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(209, 213, 219, 0.8)';

    const categoryCounts: { [key: string]: number } = {};
    this.tasks.forEach(task => {
      categoryCounts[task.category] = (categoryCounts[task.category] || 0) + 1;
    });

    const colors = [
      'rgba(59, 130, 246, 0.8)',
      'rgba(168, 85, 247, 0.8)',
      'rgba(34, 197, 94, 0.8)',
      'rgba(234, 179, 8, 0.8)',
      'rgba(239, 68, 68, 0.8)',
      'rgba(20, 184, 166, 0.8)',
    ];

    return {
      type: this.chartType,
      data: {
        labels: Object.keys(categoryCounts),
        datasets: [{
          label: 'Tasks',
          data: Object.values(categoryCounts),
          backgroundColor: colors.slice(0, Object.keys(categoryCounts).length),
          borderColor: colors.slice(0, Object.keys(categoryCounts).length).map(c => c.replace('0.8', '1')),
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: textColor,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = this.chartType === 'bar' ? context.parsed.y : context.parsed;
                const total = this.totalTasks;
                const percentage = total > 0 ? Math.round((Number(value) / total) * 100) : 0;
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        },
        scales: this.chartType === 'bar' ? {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
              color: textColor
            },
            grid: {
              color: gridColor
            }
          },
          x: {
            ticks: {
              color: textColor
            },
            grid: {
              color: gridColor
            }
          }
        } : undefined
      }
    };
  }
}
