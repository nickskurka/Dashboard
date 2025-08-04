/**
 * Calendar Module - Flexible Calendar & Planner
 * Features: Monthly & weekly views, create/edit/delete/reschedule events, drag & drop
 */

export class CalendarModule {
    constructor() {
        this.events = [];
        this.currentDate = new Date();
        this.view = 'month'; // 'month' or 'week'
        this.nextId = 1;
    }

    async initialize() {
        this.loadEvents();
        this.bindEvents();
        this.render();
    }

    loadEvents() {
        const savedEvents = localStorage.getItem('prodash-events');
        if (savedEvents) {
            this.events = JSON.parse(savedEvents);
            this.nextId = Math.max(...this.events.map(e => e.id), 0) + 1;
        }
    }

    saveEvents() {
        localStorage.setItem('prodash-events', JSON.stringify(this.events));
    }

    bindEvents() {
        // Navigation buttons
        const prevBtn = document.getElementById('prev-month');
        const nextBtn = document.getElementById('next-month');
        const addEventBtn = document.getElementById('add-event-btn');

        prevBtn?.addEventListener('click', () => this.navigateMonth(-1));
        nextBtn?.addEventListener('click', () => this.navigateMonth(1));
        addEventBtn?.addEventListener('click', () => this.showAddEventModal());
    }

    navigateMonth(direction) {
        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        this.updateMonthDisplay();
        this.render();
    }

    updateMonthDisplay() {
        const monthDisplay = document.getElementById('current-month');
        if (monthDisplay) {
            monthDisplay.textContent = this.currentDate.toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
            });
        }
    }

    showAddEventModal(date = null) {
        const selectedDate = date || new Date().toISOString().split('T')[0];

        const modalContent = `
            <h3>Add New Event</h3>
            <form id="event-form">
                <div class="form-group">
                    <label for="event-title">Event Title</label>
                    <input type="text" id="event-title" required placeholder="Enter event title...">
                </div>
                <div class="form-group">
                    <label for="event-description">Description</label>
                    <textarea id="event-description" rows="3" placeholder="Event description..."></textarea>
                </div>
                <div class="form-group">
                    <label for="event-date">Date</label>
                    <input type="date" id="event-date" value="${selectedDate}" required>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="form-group">
                        <label for="event-start-time">Start Time</label>
                        <input type="time" id="event-start-time" value="09:00">
                    </div>
                    <div class="form-group">
                        <label for="event-end-time">End Time</label>
                        <input type="time" id="event-end-time" value="10:00">
                    </div>
                </div>
                <div class="form-group">
                    <label for="event-color">Color</label>
                    <select id="event-color">
                        <option value="#3182ce">Blue</option>
                        <option value="#38a169">Green</option>
                        <option value="#e53e3e">Red</option>
                        <option value="#d69e2e">Yellow</option>
                        <option value="#805ad5">Purple</option>
                        <option value="#dd6b20">Orange</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="event-all-day"> All Day Event
                    </label>
                </div>
                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button type="button" class="btn" onclick="window.ProDash.closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Add Event</button>
                </div>
            </form>
        `;

        window.ProDash.openModal(modalContent);

        const form = document.getElementById('event-form');
        const allDayCheckbox = document.getElementById('event-all-day');
        const startTime = document.getElementById('event-start-time');
        const endTime = document.getElementById('event-end-time');

        // Handle all-day checkbox
        allDayCheckbox?.addEventListener('change', (e) => {
            startTime.disabled = e.target.checked;
            endTime.disabled = e.target.checked;
        });

        form?.addEventListener('submit', (e) => {
            e.preventDefault();

            const eventData = {
                title: document.getElementById('event-title').value,
                description: document.getElementById('event-description').value,
                date: document.getElementById('event-date').value,
                startTime: allDayCheckbox.checked ? null : document.getElementById('event-start-time').value,
                endTime: allDayCheckbox.checked ? null : document.getElementById('event-end-time').value,
                color: document.getElementById('event-color').value,
                allDay: allDayCheckbox.checked
            };

            this.addEvent(eventData);
            window.ProDash.closeModal();
        });
    }

    addEvent(eventData) {
        const event = {
            id: this.nextId++,
            title: eventData.title,
            description: eventData.description,
            date: eventData.date,
            startTime: eventData.startTime,
            endTime: eventData.endTime,
            color: eventData.color,
            allDay: eventData.allDay,
            createdAt: new Date().toISOString()
        };

        this.events.push(event);
        this.saveEvents();
        this.render();
        window.ProDash.showNotification('Event added successfully!', 'success');
    }

    editEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        if (!event) return;

        const modalContent = `
            <h3>Edit Event</h3>
            <form id="edit-event-form">
                <div class="form-group">
                    <label for="edit-event-title">Event Title</label>
                    <input type="text" id="edit-event-title" value="${event.title}" required>
                </div>
                <div class="form-group">
                    <label for="edit-event-description">Description</label>
                    <textarea id="edit-event-description" rows="3">${event.description}</textarea>
                </div>
                <div class="form-group">
                    <label for="edit-event-date">Date</label>
                    <input type="date" id="edit-event-date" value="${event.date}" required>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div class="form-group">
                        <label for="edit-event-start-time">Start Time</label>
                        <input type="time" id="edit-event-start-time" value="${event.startTime || '09:00'}" ${event.allDay ? 'disabled' : ''}>
                    </div>
                    <div class="form-group">
                        <label for="edit-event-end-time">End Time</label>
                        <input type="time" id="edit-event-end-time" value="${event.endTime || '10:00'}" ${event.allDay ? 'disabled' : ''}>
                    </div>
                </div>
                <div class="form-group">
                    <label for="edit-event-color">Color</label>
                    <select id="edit-event-color">
                        <option value="#3182ce" ${event.color === '#3182ce' ? 'selected' : ''}>Blue</option>
                        <option value="#38a169" ${event.color === '#38a169' ? 'selected' : ''}>Green</option>
                        <option value="#e53e3e" ${event.color === '#e53e3e' ? 'selected' : ''}>Red</option>
                        <option value="#d69e2e" ${event.color === '#d69e2e' ? 'selected' : ''}>Yellow</option>
                        <option value="#805ad5" ${event.color === '#805ad5' ? 'selected' : ''}>Purple</option>
                        <option value="#dd6b20" ${event.color === '#dd6b20' ? 'selected' : ''}>Orange</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="edit-event-all-day" ${event.allDay ? 'checked' : ''}> All Day Event
                    </label>
                </div>
                <div style="display: flex; gap: 1rem; justify-content: space-between;">
                    <button type="button" class="btn" style="background: var(--error); color: white;"
                            onclick="window.ProDash.modules.get('calendar').deleteEvent(${event.id}); window.ProDash.closeModal()">
                        Delete Event
                    </button>
                    <div style="display: flex; gap: 1rem;">
                        <button type="button" class="btn" onclick="window.ProDash.closeModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Update Event</button>
                    </div>
                </div>
            </form>
        `;

        window.ProDash.openModal(modalContent);

        const form = document.getElementById('edit-event-form');
        const allDayCheckbox = document.getElementById('edit-event-all-day');
        const startTime = document.getElementById('edit-event-start-time');
        const endTime = document.getElementById('edit-event-end-time');

        allDayCheckbox?.addEventListener('change', (e) => {
            startTime.disabled = e.target.checked;
            endTime.disabled = e.target.checked;
        });

        form?.addEventListener('submit', (e) => {
            e.preventDefault();

            event.title = document.getElementById('edit-event-title').value;
            event.description = document.getElementById('edit-event-description').value;
            event.date = document.getElementById('edit-event-date').value;
            event.startTime = allDayCheckbox.checked ? null : document.getElementById('edit-event-start-time').value;
            event.endTime = allDayCheckbox.checked ? null : document.getElementById('edit-event-end-time').value;
            event.color = document.getElementById('edit-event-color').value;
            event.allDay = allDayCheckbox.checked;

            this.saveEvents();
            this.render();
            window.ProDash.closeModal();
            window.ProDash.showNotification('Event updated successfully!', 'success');
        });
    }

    deleteEvent(eventId) {
        this.events = this.events.filter(e => e.id !== eventId);
        this.saveEvents();
        this.render();
        window.ProDash.showNotification('Event deleted', 'info');
    }

    getEventsForDate(date) {
        const dateStr = date.toISOString().split('T')[0];
        return this.events.filter(event => event.date === dateStr);
    }

    getDaysInMonth(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days = [];

        // Add previous month's trailing days
        const prevMonth = new Date(year, month - 1, 0);
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            const day = new Date(year, month - 1, prevMonth.getDate() - i);
            days.push({ date: day, otherMonth: true });
        }

        // Add current month's days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            days.push({ date: date, otherMonth: false });
        }

        // Add next month's leading days to complete the grid
        const totalCells = 42; // 6 rows × 7 days
        const remainingCells = totalCells - days.length;
        for (let day = 1; day <= remainingCells; day++) {
            const date = new Date(year, month + 1, day);
            days.push({ date: date, otherMonth: true });
        }

        return days;
    }

    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }

    render() {
        this.updateMonthDisplay();
        this.renderCalendar();
    }

    renderCalendar() {
        const calendarGrid = document.getElementById('calendar-grid');
        if (!calendarGrid) return;

        const days = this.getDaysInMonth(this.currentDate);
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        calendarGrid.innerHTML = `
            ${dayNames.map(day => `
                <div class="calendar-header" style="padding: 1rem; font-weight: 600; text-align: center; background: var(--bg-secondary);">
                    ${day}
                </div>
            `).join('')}
            ${days.map(dayObj => {
                const events = this.getEventsForDate(dayObj.date);
                const dateStr = dayObj.date.toISOString().split('T')[0];

                return `
                    <div class="calendar-day ${dayObj.otherMonth ? 'other-month' : ''} ${this.isToday(dayObj.date) ? 'today' : ''}"
                         onclick="window.ProDash.modules.get('calendar').showAddEventModal('${dateStr}')">
                        <div class="day-number">${dayObj.date.getDate()}</div>
                        <div class="day-events">
                            ${events.slice(0, 3).map(event => `
                                <div class="event-item"
                                     style="background: ${event.color};"
                                     onclick="event.stopPropagation(); window.ProDash.modules.get('calendar').editEvent(${event.id})"
                                     title="${event.title}${event.description ? ' - ' + event.description : ''}">
                                    ${event.allDay ? '🕐' : '⏰'} ${event.title}
                                </div>
                            `).join('')}
                            ${events.length > 3 ? `<div class="event-item" style="background: var(--text-muted); font-size: 0.6rem;">+${events.length - 3} more</div>` : ''}
                        </div>
                    </div>
                `;
            }).join('')}
        `;
    }

    onShow() {
        this.updateMonthDisplay();
        this.render();
    }

    handleKeyboard(e) {
        if (e.ctrlKey && e.key === 'e') {
            e.preventDefault();
            this.showAddEventModal();
        }
    }
}
