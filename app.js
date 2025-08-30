// Audio Lecture Player Application
class AudioLecturePlayer {
    constructor() {
        this.lectures = [];
        this.currentLecture = null;
        this.currentIndex = -1;
        this.audioElement = document.getElementById('audioElement');
        this.isPlaying = false;
        
        this.initializeApp();
        this.bindEvents();
        this.loadSampleData();
    }

    initializeApp() {
        // Initialize DOM elements
        this.elements = {
            fileInput: document.getElementById('audioFiles'),
            uploadBtn: document.getElementById('uploadBtn'),
            selectedFiles: document.getElementById('selectedFiles'),
            metadataSection: document.getElementById('metadataSection'),
            metadataForms: document.getElementById('metadataForms'),
            playPauseBtn: document.getElementById('playPauseBtn'),
            prevBtn: document.getElementById('prevBtn'),
            nextBtn: document.getElementById('nextBtn'),
            progressSlider: document.getElementById('progressSlider'),
            progressFill: document.getElementById('progressFill'),
            currentTime: document.getElementById('currentTime'),
            totalTime: document.getElementById('totalTime'),
            volumeSlider: document.getElementById('volumeSlider'),
            speedSelect: document.getElementById('speedSelect'),
            currentTitle: document.getElementById('currentTitle'),
            currentInstructor: document.getElementById('currentInstructor'),
            currentCourse: document.getElementById('currentCourse'),
            lectureList: document.getElementById('lectureList'),
            searchInput: document.getElementById('searchInput'),
            sortSelect: document.getElementById('sortSelect'),
            exportBtn: document.getElementById('exportBtn'),
            importFile: document.getElementById('importFile')
        };

        // Set initial volume
        this.audioElement.volume = 0.5;
    }

    bindEvents() {
        // File upload events
        this.elements.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        this.elements.uploadBtn.addEventListener('click', () => this.uploadFiles());

        // Audio player events
        this.elements.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.elements.prevBtn.addEventListener('click', () => this.previousLecture());
        this.elements.nextBtn.addEventListener('click', () => this.nextLecture());
        this.elements.progressSlider.addEventListener('input', (e) => this.seekTo(e.target.value));
        this.elements.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
        this.elements.speedSelect.addEventListener('change', (e) => this.setPlaybackSpeed(e.target.value));

        // Audio element events
        this.audioElement.addEventListener('loadedmetadata', () => this.updateDuration());
        this.audioElement.addEventListener('timeupdate', () => this.updateProgress());
        this.audioElement.addEventListener('ended', () => this.handleAudioEnd());

        // Library events
        this.elements.searchInput.addEventListener('input', (e) => this.filterLectures(e.target.value));
        this.elements.sortSelect.addEventListener('change', (e) => this.sortLectures(e.target.value));

        // Export/Import events
        this.elements.exportBtn.addEventListener('click', () => this.exportMetadata());
        this.elements.importFile.addEventListener('change', (e) => this.importMetadata(e));
    }

    loadSampleData() {
        // Load sample lectures from provided data
        const sampleLectures = [
            {
                id: "sample-1",
                filename: "intro-to-ai.mp3",
                title: "Introduction to Artificial Intelligence",
                instructor: "Dr. Sarah Johnson",
                course: "CS 485 - AI Fundamentals",
                duration: 3240,
                date: "2025-08-30",
                description: "Overview of AI concepts, machine learning basics, and current applications in industry",
                tags: ["artificial intelligence", "machine learning", "computer science"],
                audioUrl: "",
                lastPosition: 0
            },
            {
                id: "sample-2", 
                filename: "power-electronics-basics.mp3",
                title: "Power Electronics Fundamentals",
                instructor: "Prof. Rajesh Kumar",
                course: "EE 420 - Power Electronics",
                duration: 2880,
                date: "2025-08-29",
                description: "Basic principles of power electronics, semiconductors, and switching circuits",
                tags: ["power electronics", "semiconductors", "electrical engineering"],
                audioUrl: "",
                lastPosition: 0
            },
            {
                id: "sample-3",
                filename: "control-theory-intro.mp3", 
                title: "Introduction to Control Theory",
                instructor: "Dr. Priya Sharma",
                course: "EE 380 - Control Systems",
                duration: 3600,
                date: "2025-08-28",
                description: "Fundamentals of control systems, feedback loops, and system stability",
                tags: ["control theory", "feedback systems", "engineering"],
                audioUrl: "",
                lastPosition: 0
            }
        ];

        this.lectures = sampleLectures;
        this.renderLectureList();
    }

    handleFileSelect(event) {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        this.displaySelectedFiles(files);
        this.elements.uploadBtn.classList.remove('hidden');
    }

    displaySelectedFiles(files) {
        this.elements.selectedFiles.innerHTML = '';
        this.elements.selectedFiles.classList.remove('hidden');

        files.forEach(file => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <div class="file-info">
                    <h4>${file.name}</h4>
                    <p>${this.formatFileSize(file.size)} • ${file.type}</p>
                </div>
                <div class="status status--info">Ready</div>
            `;
            this.elements.selectedFiles.appendChild(fileItem);
        });
    }

    async uploadFiles() {
        const files = Array.from(this.elements.fileInput.files);
        const pendingLectures = [];

        for (const file of files) {
            const audioUrl = URL.createObjectURL(file);
            const duration = await this.getAudioDuration(audioUrl);
            
            const lecture = {
                id: `lecture-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                filename: file.name,
                title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
                instructor: "",
                course: "",
                duration: duration,
                date: new Date().toISOString().split('T')[0],
                description: "",
                tags: [],
                audioUrl: audioUrl,
                lastPosition: 0
            };

            pendingLectures.push(lecture);
        }

        this.showMetadataEditor(pendingLectures);
    }

    getAudioDuration(audioUrl) {
        return new Promise((resolve) => {
            const tempAudio = new Audio(audioUrl);
            tempAudio.addEventListener('loadedmetadata', () => {
                resolve(tempAudio.duration);
            });
            tempAudio.addEventListener('error', () => {
                resolve(0); // Default duration if error
            });
        });
    }

    showMetadataEditor(pendingLectures) {
        this.elements.metadataSection.classList.remove('hidden');
        this.elements.metadataForms.innerHTML = '';

        pendingLectures.forEach((lecture, index) => {
            const formTemplate = document.getElementById('metadataFormTemplate');
            const formClone = formTemplate.content.cloneNode(true);
            
            // Populate form
            formClone.querySelector('.form-title').textContent = `Edit Metadata: ${lecture.filename}`;
            formClone.querySelector('.title-input').value = lecture.title;
            formClone.querySelector('.instructor-input').value = lecture.instructor;
            formClone.querySelector('.course-input').value = lecture.course;
            formClone.querySelector('.date-input').value = lecture.date;
            formClone.querySelector('.description-input').value = lecture.description;
            formClone.querySelector('.tags-input').value = lecture.tags.join(', ');

            // Add save event
            const saveBtn = formClone.querySelector('.save-metadata-btn');
            saveBtn.addEventListener('click', () => this.saveMetadata(index, pendingLectures));

            this.elements.metadataForms.appendChild(formClone);
        });

        // Store pending lectures temporarily
        this.pendingLectures = pendingLectures;
    }

    saveMetadata(index, pendingLectures) {
        const forms = this.elements.metadataForms.querySelectorAll('.metadata-form');
        const form = forms[index];
        
        const lecture = pendingLectures[index];
        lecture.title = form.querySelector('.title-input').value || lecture.filename;
        lecture.instructor = form.querySelector('.instructor-input').value;
        lecture.course = form.querySelector('.course-input').value;
        lecture.date = form.querySelector('.date-input').value;
        lecture.description = form.querySelector('.description-input').value;
        lecture.tags = form.querySelector('.tags-input').value
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);

        // Add to lectures array
        this.lectures.push(lecture);
        
        // Remove the form
        form.remove();
        
        // If all forms are processed, hide metadata section and refresh library
        if (this.elements.metadataForms.children.length === 0) {
            this.elements.metadataSection.classList.add('hidden');
            this.clearUploadSection();
            this.renderLectureList();
        }
    }

    clearUploadSection() {
        this.elements.fileInput.value = '';
        this.elements.selectedFiles.innerHTML = '';
        this.elements.selectedFiles.classList.add('hidden');
        this.elements.uploadBtn.classList.add('hidden');
    }

    renderLectureList() {
        const filteredLectures = this.getFilteredAndSortedLectures();
        this.elements.lectureList.innerHTML = '';

        if (filteredLectures.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = '<p>No lectures found. Try adjusting your search or upload new files.</p>';
            this.elements.lectureList.appendChild(emptyState);
            return;
        }

        filteredLectures.forEach((lecture, index) => {
            const lectureTemplate = document.getElementById('lectureItemTemplate');
            const lectureClone = lectureTemplate.content.cloneNode(true);
            
            // Populate lecture item
            lectureClone.querySelector('.lecture-title').textContent = lecture.title;
            lectureClone.querySelector('.lecture-instructor').textContent = lecture.instructor || 'Unknown Instructor';
            lectureClone.querySelector('.lecture-course').textContent = lecture.course || 'No Course';
            lectureClone.querySelector('.duration').textContent = this.formatTime(lecture.duration);
            lectureClone.querySelector('.date').textContent = lecture.date;
            
            // Add tags
            const tagsContainer = lectureClone.querySelector('.tags');
            lecture.tags.forEach(tag => {
                const tagSpan = document.createElement('span');
                tagSpan.className = 'tag';
                tagSpan.textContent = tag;
                tagsContainer.appendChild(tagSpan);
            });

            // Add event listeners
            const playBtn = lectureClone.querySelector('.play-btn');
            const editBtn = lectureClone.querySelector('.edit-btn');
            const lectureItem = lectureClone.querySelector('.lecture-item');
            
            playBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.playLecture(lecture);
            });
            
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.editLecture(lecture);
            });
            
            // Make entire lecture item clickable
            lectureItem.addEventListener('click', () => this.playLecture(lecture));
            lectureItem.style.cursor = 'pointer';
            
            // Mark current playing lecture
            if (this.currentLecture && this.currentLecture.id === lecture.id) {
                lectureItem.classList.add('playing');
                playBtn.textContent = this.isPlaying ? 'Pause' : 'Play';
            }

            this.elements.lectureList.appendChild(lectureClone);
        });
    }

    playLecture(lecture) {
        if (!lecture.audioUrl) {
            alert('This is a sample lecture without audio. Upload your own audio files to play them with full functionality. The player interface is fully functional for uploaded files.');
            
            // Still update the UI to show selection
            this.currentLecture = lecture;
            this.currentIndex = this.lectures.findIndex(l => l.id === lecture.id);
            this.updatePlayerInfo();
            this.updateNavigationButtons();
            this.renderLectureList(); // Re-render to show playing state
            return;
        }

        this.currentLecture = lecture;
        this.currentIndex = this.lectures.findIndex(l => l.id === lecture.id);
        
        this.audioElement.src = lecture.audioUrl;
        this.audioElement.currentTime = lecture.lastPosition || 0;
        
        this.updatePlayerInfo();
        this.audioElement.play();
        this.isPlaying = true;
        this.updatePlayPauseButton();
        this.updateNavigationButtons();
        this.renderLectureList(); // Re-render to show playing state
    }

    togglePlayPause() {
        if (!this.currentLecture) return;

        if (this.isPlaying) {
            this.audioElement.pause();
            this.isPlaying = false;
        } else {
            this.audioElement.play();
            this.isPlaying = true;
        }
        
        this.updatePlayPauseButton();
        this.renderLectureList();
    }

    previousLecture() {
        if (this.currentIndex > 0) {
            this.playLecture(this.lectures[this.currentIndex - 1]);
        }
    }

    nextLecture() {
        if (this.currentIndex < this.lectures.length - 1) {
            this.playLecture(this.lectures[this.currentIndex + 1]);
        }
    }

    updatePlayerInfo() {
        if (!this.currentLecture) return;
        
        this.elements.currentTitle.textContent = this.currentLecture.title;
        this.elements.currentInstructor.textContent = this.currentLecture.instructor || 'Unknown Instructor';
        this.elements.currentCourse.textContent = this.currentLecture.course || 'No Course';
    }

    updateDuration() {
        this.elements.totalTime.textContent = this.formatTime(this.audioElement.duration);
    }

    updateProgress() {
        if (!this.audioElement.duration) return;

        const progress = (this.audioElement.currentTime / this.audioElement.duration) * 100;
        this.elements.progressFill.style.width = `${progress}%`;
        this.elements.progressSlider.value = progress;
        this.elements.currentTime.textContent = this.formatTime(this.audioElement.currentTime);

        // Save progress
        if (this.currentLecture) {
            this.currentLecture.lastPosition = this.audioElement.currentTime;
        }
    }

    seekTo(value) {
        if (!this.audioElement.duration) return;
        
        const time = (value / 100) * this.audioElement.duration;
        this.audioElement.currentTime = time;
    }

    setVolume(value) {
        this.audioElement.volume = value / 100;
    }

    setPlaybackSpeed(speed) {
        this.audioElement.playbackRate = parseFloat(speed);
    }

    handleAudioEnd() {
        this.isPlaying = false;
        this.updatePlayPauseButton();
        
        // Auto-play next lecture if available
        if (this.currentIndex < this.lectures.length - 1) {
            this.nextLecture();
        }
    }

    updatePlayPauseButton() {
        this.elements.playPauseBtn.textContent = this.isPlaying ? '⏸️' : '▶️';
    }

    updateNavigationButtons() {
        this.elements.prevBtn.disabled = this.currentIndex <= 0;
        this.elements.nextBtn.disabled = this.currentIndex >= this.lectures.length - 1;
    }

    filterLectures(searchTerm) {
        // Trigger re-render with current search term
        this.renderLectureList();
    }

    sortLectures(sortBy) {
        // Trigger re-render with current sort option
        this.renderLectureList();
    }

    getFilteredAndSortedLectures() {
        let filtered = [...this.lectures];
        
        // Apply search filter
        const searchTerm = this.elements.searchInput.value.toLowerCase().trim();
        if (searchTerm) {
            filtered = filtered.filter(lecture => 
                lecture.title.toLowerCase().includes(searchTerm) ||
                lecture.instructor.toLowerCase().includes(searchTerm) ||
                lecture.course.toLowerCase().includes(searchTerm) ||
                lecture.description.toLowerCase().includes(searchTerm) ||
                lecture.tags.some(tag => tag.toLowerCase().includes(searchTerm))
            );
        }

        // Apply sorting
        const sortBy = this.elements.sortSelect.value;
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'instructor':
                    return (a.instructor || '').localeCompare(b.instructor || '');
                case 'duration':
                    return b.duration - a.duration;
                case 'date':
                default:
                    return new Date(b.date) - new Date(a.date);
            }
        });

        return filtered;
    }

    editLecture(lecture) {
        this.showMetadataEditor([{...lecture}]); // Clone the lecture object
        // Remove the original lecture temporarily
        this.lectures = this.lectures.filter(l => l.id !== lecture.id);
        this.renderLectureList();
    }

    exportMetadata() {
        const data = {
            lectures: this.lectures.map(lecture => ({
                ...lecture,
                audioUrl: '' // Don't export blob URLs
            })),
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `lecture-metadata-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }

    importMetadata(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.lectures && Array.isArray(data.lectures)) {
                    // Merge with existing lectures (without audioUrl)
                    const importedLectures = data.lectures.map(lecture => ({
                        ...lecture,
                        id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        audioUrl: '' // Clear blob URLs from import
                    }));
                    
                    this.lectures = [...this.lectures, ...importedLectures];
                    this.renderLectureList();
                    alert(`Imported ${importedLectures.length} lectures successfully!`);
                } else {
                    alert('Invalid metadata file format.');
                }
            } catch (error) {
                alert('Error reading metadata file: ' + error.message);
            }
        };
        reader.readAsText(file);
        
        // Clear the input
        event.target.value = '';
    }

    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AudioLecturePlayer();
});