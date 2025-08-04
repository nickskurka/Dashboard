/**
 * Notes Module - Rich Notes App with Markdown Support
 * Features: Plain text & markdown with live preview, folder organization, auto-save
 */

export class NotesModule {
    constructor() {
        this.notes = [];
        this.folders = ['General', 'Work', 'Personal', 'Ideas'];
        this.currentNote = null;
        this.currentFolder = 'General';
        this.autoSaveTimer = null;
        this.nextId = 1;
    }

    async initialize() {
        this.loadData();
        this.bindEvents();
        this.render();
    }

    loadData() {
        const savedNotes = localStorage.getItem('prodash-notes');
        const savedFolders = localStorage.getItem('prodash-folders');

        if (savedNotes) {
            this.notes = JSON.parse(savedNotes);
            this.nextId = Math.max(...this.notes.map(n => n.id), 0) + 1;
        }

        if (savedFolders) {
            this.folders = JSON.parse(savedFolders);
        }
    }

    saveData() {
        localStorage.setItem('prodash-notes', JSON.stringify(this.notes));
        localStorage.setItem('prodash-folders', JSON.stringify(this.folders));
    }

    bindEvents() {
        // Add note button
        const addNoteBtn = document.getElementById('add-note-btn');
        addNoteBtn?.addEventListener('click', () => this.createNewNote());

        // Editor tabs
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Note editor
        const noteEditor = document.getElementById('note-editor');
        noteEditor?.addEventListener('input', () => {
            this.scheduleAutoSave();
            if (document.querySelector('.tab-btn[data-tab="preview"].active')) {
                this.updatePreview();
            }
        });

        // Save on Ctrl+S
        noteEditor?.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveCurrentNote();
            }
        });
    }

    createNewNote() {
        const modalContent = `
            <h3>Create New Note</h3>
            <form id="note-form">
                <div class="form-group">
                    <label for="note-title">Note Title</label>
                    <input type="text" id="note-title" required placeholder="Enter note title...">
                </div>
                <div class="form-group">
                    <label for="note-folder">Folder</label>
                    <select id="note-folder">
                        ${this.folders.map(folder =>
                            `<option value="${folder}" ${folder === this.currentFolder ? 'selected' : ''}>${folder}</option>`
                        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label for="new-folder">Or create new folder:</label>
                    <input type="text" id="new-folder" placeholder="New folder name...">
                </div>
                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button type="button" class="btn" onclick="window.ProDash.closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Create Note</button>
                </div>
            </form>
        `;

        window.ProDash.openModal(modalContent);

        const form = document.getElementById('note-form');
        form?.addEventListener('submit', (e) => {
            e.preventDefault();

            const title = document.getElementById('note-title').value;
            const selectedFolder = document.getElementById('note-folder').value;
            const newFolder = document.getElementById('new-folder').value.trim();

            const folder = newFolder || selectedFolder;

            if (newFolder && !this.folders.includes(newFolder)) {
                this.folders.push(newFolder);
            }

            this.addNote(title, folder);
            window.ProDash.closeModal();
        });
    }

    addNote(title, folder) {
        const note = {
            id: this.nextId++,
            title: title,
            content: '',
            folder: folder,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tags: []
        };

        this.notes.unshift(note);
        this.currentNote = note;
        this.currentFolder = folder;
        this.saveData();
        this.render();
        this.loadNoteInEditor(note);

        window.ProDash.showNotification('Note created successfully!', 'success');
    }

    deleteNote(noteId) {
        if (!confirm('Are you sure you want to delete this note?')) return;

        this.notes = this.notes.filter(n => n.id !== noteId);

        if (this.currentNote && this.currentNote.id === noteId) {
            this.currentNote = null;
            document.getElementById('note-editor').value = '';
            document.getElementById('note-preview').innerHTML = '';
        }

        this.saveData();
        this.render();
        window.ProDash.showNotification('Note deleted', 'info');
    }

    loadNoteInEditor(note) {
        this.currentNote = note;
        const editor = document.getElementById('note-editor');
        const preview = document.getElementById('note-preview');

        if (editor) {
            editor.value = note.content;
            editor.placeholder = `Write your note "${note.title}" here...`;
        }

        if (preview) {
            this.updatePreview();
        }

        // Update note selection in sidebar
        document.querySelectorAll('.note-item').forEach(item => {
            item.classList.toggle('active', parseInt(item.dataset.noteId) === note.id);
        });
    }

    saveCurrentNote() {
        if (!this.currentNote) return;

        const editor = document.getElementById('note-editor');
        if (editor) {
            this.currentNote.content = editor.value;
            this.currentNote.updatedAt = new Date().toISOString();
            this.saveData();
            window.ProDash.showNotification('Note saved!', 'success', 1000);
        }
    }

    scheduleAutoSave() {
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
        }

        this.autoSaveTimer = setTimeout(() => {
            this.saveCurrentNote();
        }, 2000); // Auto-save after 2 seconds of inactivity
    }

    switchTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        const editor = document.getElementById('note-editor');
        const preview = document.getElementById('note-preview');

        if (tab === 'write') {
            editor?.classList.remove('hidden');
            preview?.classList.add('hidden');
        } else {
            editor?.classList.add('hidden');
            preview?.classList.remove('hidden');
            this.updatePreview();
        }
    }

    updatePreview() {
        const editor = document.getElementById('note-editor');
        const preview = document.getElementById('note-preview');

        if (editor && preview) {
            const content = editor.value;
            preview.innerHTML = this.markdownToHtml(content);
        }
    }

    markdownToHtml(markdown) {
        if (!markdown) return '<p style="color: var(--text-muted); font-style: italic;">Start writing to see preview...</p>';

        return markdown
            // Headers
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            // Bold
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            .replace(/__(.*?)__/gim, '<strong>$1</strong>')
            // Italic
            .replace(/\*(.*)\*/gim, '<em>$1</em>')
            .replace(/_(.*?)_/gim, '<em>$1</em>')
            // Code
            .replace(/`(.*?)`/gim, '<code>$1</code>')
            // Links
            .replace(/\[([^\]]+)\]\(([^\)]+)\)/gim, '<a href="$2" target="_blank">$1</a>')
            // Line breaks
            .replace(/\n/gim, '<br>')
            // Lists
            .replace(/^\* (.+)/gim, '<li>$1</li>')
            .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
            // Blockquotes
            .replace(/^> (.+)/gim, '<blockquote>$1</blockquote>');
    }

    getNotesInFolder(folder) {
        return this.notes.filter(note => note.folder === folder);
    }

    switchFolder(folder) {
        this.currentFolder = folder;
        this.render();
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return 'Today';
        } else if (days === 1) {
            return 'Yesterday';
        } else if (days < 7) {
            return `${days} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    render() {
        this.renderFolders();
        this.renderNotes();
    }

    renderFolders() {
        const folderList = document.getElementById('folder-list');
        if (!folderList) return;

        folderList.innerHTML = `
            <h4 style="margin-bottom: 0.5rem; color: var(--text-secondary);">Folders</h4>
            ${this.folders.map(folder => `
                <div class="folder-item ${folder === this.currentFolder ? 'active' : ''}"
                     onclick="window.ProDash.modules.get('notes').switchFolder('${folder}')">
                    📁 ${folder} (${this.getNotesInFolder(folder).length})
                </div>
            `).join('')}
        `;
    }

    renderNotes() {
        const notesList = document.getElementById('notes-list');
        if (!notesList) return;

        const notesInFolder = this.getNotesInFolder(this.currentFolder);

        if (notesInFolder.length === 0) {
            notesList.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                    <div style="font-size: 2rem; margin-bottom: 1rem;">📝</div>
                    <p>No notes in this folder</p>
                    <button class="btn btn-primary" onclick="window.ProDash.modules.get('notes').createNewNote()">
                        Create First Note
                    </button>
                </div>
            `;
            return;
        }

        notesList.innerHTML = `
            <h4 style="margin-bottom: 0.5rem; color: var(--text-secondary);">Notes in ${this.currentFolder}</h4>
            ${notesInFolder.map(note => {
                const preview = note.content.substring(0, 100).replace(/\n/g, ' ') + (note.content.length > 100 ? '...' : '');
                return `
                    <div class="note-item ${this.currentNote && this.currentNote.id === note.id ? 'active' : ''}"
                         data-note-id="${note.id}"
                         onclick="window.ProDash.modules.get('notes').loadNoteInEditor(${JSON.stringify(note).replace(/"/g, '&quot;')})">
                        <div class="note-title" style="font-weight: 500; margin-bottom: 0.25rem;">${note.title}</div>
                        <div class="note-preview" style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.25rem;">
                            ${preview || 'Empty note'}
                        </div>
                        <div class="note-meta" style="font-size: 0.7rem; color: var(--text-muted); display: flex; justify-content: space-between;">
                            <span>${this.formatDate(note.updatedAt)}</span>
                            <button class="btn" style="padding: 0.25rem; font-size: 0.7rem;"
                                    onclick="event.stopPropagation(); window.ProDash.modules.get('notes').deleteNote(${note.id})"
                                    title="Delete note">🗑️</button>
                        </div>
                    </div>
                `;
            }).join('')}
        `;

        // Add CSS for active states
        const style = document.createElement('style');
        style.textContent = `
            .folder-item.active, .note-item.active {
                background: var(--accent-primary) !important;
                color: white !important;
            }
            .note-item { transition: all 0.3s ease; }
            .note-item:hover { background: var(--bg-tertiary); }
        `;

        const existingStyle = document.querySelector('#notes-styles');
        if (existingStyle) existingStyle.remove();
        style.id = 'notes-styles';
        document.head.appendChild(style);
    }

    onShow() {
        this.render();
        // Focus on editor if a note is selected
        if (this.currentNote) {
            setTimeout(() => {
                const editor = document.getElementById('note-editor');
                editor?.focus();
            }, 100);
        }
    }

    handleKeyboard(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'n':
                    e.preventDefault();
                    this.createNewNote();
                    break;
                case 's':
                    e.preventDefault();
                    this.saveCurrentNote();
                    break;
            }
        }
    }
}
