// Audio Lecture Player Application
class AudioLecturePlayer {
    constructor() {
        this.lectures = [];
        this.filteredLectures = [];
        this.currentLecture = null;
        this.currentIndex = -1;
        this.isPlaying = false;
        this.isShuffling = false;
        this.repeatMode = 'none'; // 'none', 'one', 'all'
        this.currentView = 'list';
        this.currentSection = 'all';
        this.playbackHistory = [];
        this.favorites = new Set();
        this.searchTerm = '';
        this.sortBy = 'date';

        this.initializeApp();
        this.bindEvents();
        this.loadLectureData(); // Load data from metadata.json
        //this.initializeTheme();
    }

    initializeTheme() {
        const theme = localStorage.getItem('theme') || 'light';
        document.body.classList.toggle('dark-theme', theme === 'dark');
        this.elements.themeToggle.textContent = theme === 'dark' ? '🌙' : '☀️';
    }
    
    toggleTheme() {
        const isDark = document.body.classList.toggle('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        this.elements.themeToggle.textContent = isDark ? '🌙' : '☀️';
    }
    parseDate(dateString) {
        // Parse a date string into a Date object
        return new Date(dateString);
    }

    initializeApp() {
        // Get DOM elements
        this.elements = {
            audioElement: document.getElementById('audioElement'),
            playPauseBtn: document.getElementById('playPauseBtn'),
            prevBtn: document.getElementById('prevBtn'),
            nextBtn: document.getElementById('nextBtn'),
            shuffleBtn: document.getElementById('shuffleBtn'),
            repeatBtn: document.getElementById('repeatBtn'),
            favoriteBtn: document.getElementById('favoriteBtn'),
            bookmarkBtn: document.getElementById('bookmarkBtn'),
            progressSlider: document.getElementById('progressSlider'),
            progressFill: document.getElementById('progressFill'),
            currentTime: document.getElementById('currentTime'),
            totalTime: document.getElementById('totalTime'),
            volumeSlider: document.getElementById('volumeSlider'),
            speedSelect: document.getElementById('speedSelect'),
            currentTitle: document.getElementById('currentTitle'),
            currentInstructor: document.getElementById('currentInstructor'),
            currentCourse: document.getElementById('currentCourse'),
            currentDate: document.getElementById('currentDate'),
            searchInput: document.getElementById('searchInput'),
            sortSelect: document.getElementById('sortSelect'),
            listViewBtn: document.getElementById('listViewBtn'),
            gridViewBtn: document.getElementById('gridViewBtn'),
            lectureList: document.getElementById('lectureList'),
            lectureCount: document.getElementById('lectureCount'),
            sectionTitle: document.getElementById('sectionTitle'),
            allLecturesTab: document.getElementById('allLecturesTab'),
            recentTab: document.getElementById('recentTab'),
            favoritesTab: document.getElementById('favoritesTab'),
            continueTab: document.getElementById('continueTab'),
            themeToggle: document.getElementById('themeToggle'),
            historyModal: document.getElementById('historyModal'),
        };

        // Set initial audio volume
        this.elements.audioElement.volume = 0.7;
    }

    bindEvents() {
        // Bind all event listeners (same as before)
        this.elements.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.elements.prevBtn.addEventListener('click', () => this.previousLecture());
        this.elements.nextBtn.addEventListener('click', () => this.nextLecture());
        this.elements.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        this.elements.repeatBtn.addEventListener('click', () => this.toggleRepeat());
        this.elements.favoriteBtn.addEventListener('click', () => this.toggleFavorite());
        this.elements.bookmarkBtn.addEventListener('click', () => this.bookmarkPosition());
        this.elements.progressSlider.addEventListener('input', (e) => this.seekTo(e.target.value));
        this.elements.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
        this.elements.speedSelect.addEventListener('change', (e) => this.setPlaybackSpeed(e.target.value));
        this.elements.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        this.elements.sortSelect.addEventListener('change', (e) => this.handleSort(e.target.value));
        this.elements.listViewBtn.addEventListener('click', () => this.setView('list'));
        this.elements.gridViewBtn.addEventListener('click', () => this.setView('grid'));
        this.elements.allLecturesTab.addEventListener('click', () => this.setSection('all'));
        this.elements.recentTab.addEventListener('click', () => this.setSection('recent'));
        this.elements.favoritesTab.addEventListener('click', () => this.setSection('favorites'));
        this.elements.continueTab.addEventListener('click', () => this.setSection('continue'));
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    async loadLectureData() {
        try {
            const response = await fetch('metadata.json'); // Fetch metadata.json
            const data = await response.json();
            this.lectures = data.lectures;

            // Initialize favorites and playback history
            this.lectures.forEach((lecture) => {
                if (lecture.isFavorite) {
                    this.favorites.add(lecture.id);
                }
            });

            this.playbackHistory = this.lectures
                .filter((lecture) => lecture.lastPlayed)
                .sort((a, b) => new Date(b.lastPlayed) - new Date(a.lastPlayed));

            this.filterAndRenderLectures();
        } catch (error) {
            console.error('Error loading lecture data:', error);
        }
    }

    filterAndRenderLectures() {
        // Filter and render lectures (same as before)
        let lectures = [...this.lectures];

        // Filter by section
        switch (this.currentSection) {
            case 'recent':
                lectures = this.playbackHistory;
                break;
            case 'favorites':
                lectures = lectures.filter((lecture) => this.favorites.has(lecture.id));
                break;
            case 'continue':
                lectures = lectures.filter(
                    (lecture) => lecture.lastPosition > 0 && lecture.lastPosition < lecture.duration - 30
                );
                break;
            case 'all':
            default:
                break;
        }

        // Apply search filter
        if (this.searchTerm) {
            lectures = lectures.filter((lecture) =>
                lecture.title.toLowerCase().includes(this.searchTerm) ||
                lecture.instructor.toLowerCase().includes(this.searchTerm) ||
                lecture.course.toLowerCase().includes(this.searchTerm) ||
                lecture.description.toLowerCase().includes(this.searchTerm) ||
                lecture.tags.some((tag) => tag.toLowerCase().includes(this.searchTerm))
            );
        }

        // Apply sorting
        lectures.sort((a, b) => {
            switch (this.sortBy) {
                case 'title':
                    return a.title.localeCompare(b.title);
                case 'instructor':
                    return a.instructor.localeCompare(b.instructor);
                case 'duration':
                    return b.duration - a.duration;
                case 'date':
                default:
                    return new Date(this.parseDate(b.date)) - new Date(this.parseDate(a.date));
            }
        });

        this.filteredLectures = lectures;
        this.renderLectures();
    }
    playLecture(lecture) {
        // Set the current lecture
        this.currentLecture = lecture;
    
        // Update the audio source
        const audioPath = `audio/${lecture.filename}`;
        this.elements.audioElement.src = audioPath;
    
        // Update the UI with lecture details
        this.elements.currentTitle.textContent = lecture.title;
        this.elements.currentInstructor.textContent = lecture.instructor || 'Unknown Instructor';
        this.elements.currentCourse.textContent = lecture.course || 'Unknown Course';
        this.elements.currentDate.textContent = lecture.date || 'Unknown Date';
    
        // Play the audio
        this.elements.audioElement.play();
        this.isPlaying = true;
    
        // Update the play/pause button
        this.elements.playPauseBtn.textContent = '⏸️';
    
        // Log the playback history
        lecture.lastPlayed = new Date().toISOString();
        this.playbackHistory = [lecture, ...this.playbackHistory.filter((l) => l.id !== lecture.id)];
    }
    formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) {
            return '00:00';
        }
    
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
    
        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${mins}:${secs.toString().padStart(2, '0')}`;
        }
    }
    renderLectures() {
        // Render lectures dynamically (same as before)
        const lectures = this.filteredLectures;
        this.elements.lectureCount.textContent = `${lectures.length} lecture${lectures.length !== 1 ? 's' : ''}`;

        if (lectures.length === 0) {
            this.elements.lectureList.innerHTML = `
                <div class="empty-state">
                    <p>No lectures found. Try adjusting your search or filters.</p>
                </div>
            `;
            return;
        }

        const templateId = this.currentView === 'grid' ? 'lectureGridItemTemplate' : 'lectureItemTemplate';
        const template = document.getElementById(templateId);

        this.elements.lectureList.innerHTML = '';

        lectures.forEach((lecture) => {
            const lectureElement = template.content.cloneNode(true);
            const lectureItem = lectureElement.querySelector(this.currentView === 'grid' ? '.lecture-grid-item' : '.lecture-item');

            // Populate lecture information
            lectureElement.querySelector('.lecture-title').textContent = lecture.title;
            lectureElement.querySelector('.lecture-instructor').textContent = lecture.instructor;
            lectureElement.querySelector('.lecture-course').textContent = lecture.course;
            lectureElement.querySelector('.duration').textContent = this.formatTime(lecture.duration);
            lectureElement.querySelector('.date').textContent = lecture.date;

            // Add tags for list view
            if (this.currentView === 'list' && lecture.tags) {
                const tagsContainer = lectureElement.querySelector('.tags');
                lecture.tags.forEach((tag) => {
                    const tagElement = document.createElement('span');
                    tagElement.className = 'tag';
                    tagElement.textContent = tag;
                    tagsContainer.appendChild(tagElement);
                });
            }

            // Add progress indicator
            const progressIndicator = lectureElement.querySelector('.progress-indicator') || lectureElement.querySelector('.progress-indicator-grid');
            if (progressIndicator && lecture.lastPosition > 0) {
                const progressPercentage = (lecture.lastPosition / lecture.duration) * 100;
                const progressFill = progressIndicator.querySelector('.progress-fill-small');
                if (progressFill) {
                    progressFill.style.width = `${progressPercentage}%`;
                }

                const progressText = progressIndicator.querySelector('.progress-text');
                if (progressText) {
                    progressText.textContent = `${Math.round(progressPercentage)}%`;
                }
            }

            // Set up event listeners
            const playBtn = lectureElement.querySelector('.play-btn');
            const favoriteBtn = lectureElement.querySelector('.favorite-btn');

            playBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.playLecture(lecture);
            });

            favoriteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleLectureFavorite(lecture);
            });

            // Update favorite button state
            if (this.favorites.has(lecture.id)) {
                favoriteBtn.classList.add('active');
            }

            // Make entire item clickable
            lectureItem.addEventListener('click', () => this.playLecture(lecture));

            // Mark currently playing lecture
            if (this.currentLecture && this.currentLecture.id === lecture.id) {
                lectureItem.classList.add('playing');
                playBtn.textContent = this.isPlaying ? '⏸️' : '▶️';
            }

            this.elements.lectureList.appendChild(lectureElement);
        });
    }

    // Other methods remain unchanged
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AudioLecturePlayer();
});