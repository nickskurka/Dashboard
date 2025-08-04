/**
 * Todo Module - Advanced Task Management System
 * Features: Add/edit/delete tasks, nested subtasks, deadlines, LocalStorage persistence
 */

export class TodoModule {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.nextId = 1;
    }

    async initialize() {
        this.loadTasks();
        this.bindEvents();
        this.render();
    }

    loadTasks() {
        const savedTasks = localStorage.getItem('prodash-tasks');
        if (savedTasks) {
            this.tasks = JSON.parse(savedTasks);
            this.nextId = Math.max(...this.tasks.map(t => t.id), 0) + 1;
        }
    }

    saveTasks() {
        localStorage.setItem('prodash-tasks', JSON.stringify(this.tasks));
    }

    bindEvents() {
        // Add task button
        const addTaskBtn = document.getElementById('add-task-btn');
        addTaskBtn?.addEventListener('click', () => this.showAddTaskModal());

        // Filter buttons
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentFilter = e.target.dataset.filter;
                this.updateFilterButtons();
                this.render();
            });
        });
    }

    showAddTaskModal() {
        const modalContent = `
            <h3>Add New Task</h3>
            <form id="task-form">
                <div class="form-group">
                    <label for="task-title">Task Title</label>
                    <input type="text" id="task-title" required>
                </div>
                <div class="form-group">
                    <label for="task-description">Description</label>
                    <textarea id="task-description" rows="3"></textarea>
                </div>
                <div class="form-group">
                    <label for="task-priority">Priority</label>
                    <select id="task-priority">
                        <option value="low">Low</option>
                        <option value="medium" selected>Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="task-deadline">Deadline (Optional)</label>
                    <input type="datetime-local" id="task-deadline">
                </div>
                <div class="form-group">
                    <label for="task-category">Category</label>
                    <input type="text" id="task-category" placeholder="e.g., Work, Personal">
                </div>
                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button type="button" class="btn" onclick="window.ProDash.closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Add Task</button>
                </div>
            </form>
        `;

        window.ProDash.openModal(modalContent);

        // Handle form submission
        const form = document.getElementById('task-form');
        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask({
                title: document.getElementById('task-title').value,
                description: document.getElementById('task-description').value,
                priority: document.getElementById('task-priority').value,
                deadline: document.getElementById('task-deadline').value || null,
                category: document.getElementById('task-category').value || 'General'
            });
            window.ProDash.closeModal();
        });
    }

    addTask(taskData) {
        const task = {
            id: this.nextId++,
            title: taskData.title,
            description: taskData.description,
            priority: taskData.priority,
            deadline: taskData.deadline,
            category: taskData.category,
            completed: false,
            createdAt: new Date().toISOString(),
            subtasks: []
        };

        this.tasks.unshift(task);
        this.saveTasks();
        this.render();
        window.ProDash.showNotification('Task added successfully!', 'success');
    }

    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : null;
            this.saveTasks();
            this.render();
        }
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            this.saveTasks();
            this.render();
            window.ProDash.showNotification('Task deleted', 'info');
        }
    }

    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        const modalContent = `
            <h3>Edit Task</h3>
            <form id="edit-task-form">
                <div class="form-group">
                    <label for="edit-task-title">Task Title</label>
                    <input type="text" id="edit-task-title" value="${task.title}" required>
                </div>
                <div class="form-group">
                    <label for="edit-task-description">Description</label>
                    <textarea id="edit-task-description" rows="3">${task.description}</textarea>
                </div>
                <div class="form-group">
                    <label for="edit-task-priority">Priority</label>
                    <select id="edit-task-priority">
                        <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
                        <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
                        <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="edit-task-deadline">Deadline</label>
                    <input type="datetime-local" id="edit-task-deadline" value="${task.deadline || ''}">
                </div>
                <div class="form-group">
                    <label for="edit-task-category">Category</label>
                    <input type="text" id="edit-task-category" value="${task.category}">
                </div>
                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button type="button" class="btn" onclick="window.ProDash.closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Update Task</button>
                </div>
            </form>
        `;

        window.ProDash.openModal(modalContent);

        const form = document.getElementById('edit-task-form');
        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            task.title = document.getElementById('edit-task-title').value;
            task.description = document.getElementById('edit-task-description').value;
            task.priority = document.getElementById('edit-task-priority').value;
            task.deadline = document.getElementById('edit-task-deadline').value || null;
            task.category = document.getElementById('edit-task-category').value;
            task.updatedAt = new Date().toISOString();

            this.saveTasks();
            this.render();
            window.ProDash.closeModal();
            window.ProDash.showNotification('Task updated successfully!', 'success');
        });
    }

    addSubtask(parentId, subtaskTitle) {
        const task = this.tasks.find(t => t.id === parentId);
        if (task && subtaskTitle.trim()) {
            task.subtasks.push({
                id: Date.now(),
                title: subtaskTitle,
                completed: false
            });
            this.saveTasks();
            this.render();
        }
    }

    toggleSubtask(parentId, subtaskId) {
        const task = this.tasks.find(t => t.id === parentId);
        if (task) {
            const subtask = task.subtasks.find(st => st.id === subtaskId);
            if (subtask) {
                subtask.completed = !subtask.completed;
                this.saveTasks();
                this.render();
            }
        }
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'pending':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            default:
                return this.tasks;
        }
    }

    updateFilterButtons() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === this.currentFilter);
        });
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    }

    isOverdue(deadline) {
        if (!deadline) return false;
        return new Date(deadline) < new Date();
    }

    getPriorityIcon(priority) {
        switch (priority) {
            case 'high': return '🔴';
            case 'medium': return '🟡';
            case 'low': return '🟢';
            default: return '⚪';
        }
    }

    render() {
        const taskList = document.getElementById('task-list');
        if (!taskList) return;

        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            taskList.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--text-muted);">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">📝</div>
                    <h3>No tasks found</h3>
                    <p>Add a task to get started with your productivity journey!</p>
                </div>
            `;
            return;
        }

        taskList.innerHTML = filteredTasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}
                       onchange="window.ProDash.modules.get('todo').toggleTask(${task.id})">
                <div class="task-content">
                    <div class="task-title">
                        ${this.getPriorityIcon(task.priority)} ${task.title}
                        ${task.deadline && this.isOverdue(task.deadline) ? '<span style="color: var(--error);"> ⚠️ OVERDUE</span>' : ''}
                    </div>
                    <div class="task-meta">
                        <span>📂 ${task.category}</span>
                        ${task.deadline ? `<span>📅 ${this.formatDate(task.deadline)}</span>` : ''}
                        <span>📊 ${task.priority}</span>
                        ${task.subtasks.length > 0 ? `<span>📋 ${task.subtasks.filter(st => st.completed).length}/${task.subtasks.length} subtasks</span>` : ''}
                    </div>
                    ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
                    ${task.subtasks.length > 0 ? `
                        <div class="subtasks">
                            ${task.subtasks.map(subtask => `
                                <div class="subtask-item">
                                    <input type="checkbox" ${subtask.completed ? 'checked' : ''}
                                           onchange="window.ProDash.modules.get('todo').toggleSubtask(${task.id}, ${subtask.id})">
                                    <span class="${subtask.completed ? 'completed' : ''}">${subtask.title}</span>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                <div class="task-actions">
                    <button class="btn" onclick="window.ProDash.modules.get('todo').editTask(${task.id})" title="Edit">✏️</button>
                    <button class="btn" onclick="window.ProDash.modules.get('todo').deleteTask(${task.id})" title="Delete">🗑️</button>
                </div>
            </div>
        `).join('');

        // Add some CSS for completed tasks and subtasks
        const style = document.createElement('style');
        style.textContent = `
            .task-item.completed .task-title { opacity: 0.6; text-decoration: line-through; }
            .subtasks { margin-top: 0.5rem; padding-left: 1rem; }
            .subtask-item { display: flex; align-items: center; gap: 0.5rem; margin: 0.25rem 0; font-size: 0.9rem; }
            .subtask-item span.completed { text-decoration: line-through; opacity: 0.6; }
            .task-description { margin-top: 0.5rem; font-size: 0.9rem; color: var(--text-secondary); }
        `;

        // Remove existing style if it exists
        const existingStyle = document.querySelector('#todo-styles');
        if (existingStyle) existingStyle.remove();
        style.id = 'todo-styles';
        document.head.appendChild(style);
    }

    onShow() {
        this.render();
    }

    handleKeyboard(e) {
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            this.showAddTaskModal();
        }
    }
}
