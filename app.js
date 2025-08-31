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
        this.loadLectureData();
        this.initializeTheme();
    }

    initializeApp() {
        // Get DOM elements
        this.elements = {
            // Audio player elements
            audioElement: document.getElementById('audioElement'),
            playPauseBtn: document.getElementById('playPauseBtn'),
            prevBtn: document.getElementById('prevBtn'),
            nextBtn: document.getElementById('nextBtn'),
            shuffleBtn: document.getElementById('shuffleBtn'),
            repeatBtn: document.getElementById('repeatBtn'),
            favoriteBtn: document.getElementById('favoriteBtn'),
            bookmarkBtn: document.getElementById('bookmarkBtn'),
            
            // Progress elements
            progressSlider: document.getElementById('progressSlider'),
            progressFill: document.getElementById('progressFill'),
            currentTime: document.getElementById('currentTime'),
            totalTime: document.getElementById('totalTime'),
            
            // Volume and speed
            volumeSlider: document.getElementById('volumeSlider'),
            speedSelect: document.getElementById('speedSelect'),
            
            // Current playing info
            currentTitle: document.getElementById('currentTitle'),
            currentInstructor: document.getElementById('currentInstructor'),
            currentCourse: document.getElementById('currentCourse'),
            currentDate: document.getElementById('currentDate'),
            
            // Library elements
            searchInput: document.getElementById('searchInput'),
            sortSelect: document.getElementById('sortSelect'),
            listViewBtn: document.getElementById('listViewBtn'),
            gridViewBtn: document.getElementById('gridViewBtn'),
            lectureList: document.getElementById('lectureList'),
            lectureCount: document.getElementById('lectureCount'),
            sectionTitle: document.getElementById('sectionTitle'),
            
            // Tab elements
            allLecturesTab: document.getElementById('allLecturesTab'),
            recentTab: document.getElementById('recentTab'),
            favoritesTab: document.getElementById('favoritesTab'),
            continueTab: document.getElementById('continueTab'),
            
            // Theme toggle
            themeToggle: document.getElementById('themeToggle'),
            
            // Modal
            historyModal: document.getElementById('historyModal')
        };

        // Set initial audio volume
        this.elements.audioElement.volume = 0.7;
    }

    bindEvents() {
        // Audio player controls
        this.elements.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.elements.prevBtn.addEventListener('click', () => this.previousLecture());
        this.elements.nextBtn.addEventListener('click', () => this.nextLecture());
        this.elements.shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        this.elements.repeatBtn.addEventListener('click', () => this.toggleRepeat());
        this.elements.favoriteBtn.addEventListener('click', () => this.toggleFavorite());
        this.elements.bookmarkBtn.addEventListener('click', () => this.bookmarkPosition());
        
        // Progress and volume controls
        this.elements.progressSlider.addEventListener('input', (e) => this.seekTo(e.target.value));
        this.elements.volumeSlider.addEventListener('input', (e) => this.setVolume(e.target.value));
        this.elements.speedSelect.addEventListener('change', (e) => this.setPlaybackSpeed(e.target.value));
        
        // Audio element events
        this.elements.audioElement.addEventListener('loadedmetadata', () => this.updateDuration());
        this.elements.audioElement.addEventListener('timeupdate', () => this.updateProgress());
        this.elements.audioElement.addEventListener('ended', () => this.handleAudioEnd());
        this.elements.audioElement.addEventListener('play', () => this.handlePlay());
        this.elements.audioElement.addEventListener('pause', () => this.handlePause());
        
        // Library controls
        this.elements.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        this.elements.sortSelect.addEventListener('change', (e) => this.handleSort(e.target.value));
        this.elements.listViewBtn.addEventListener('click', () => this.setView('list'));
        this.elements.gridViewBtn.addEventListener('click', () => this.setView('grid'));
        
        // Tab navigation
        this.elements.allLecturesTab.addEventListener('click', () => this.setSection('all'));
        this.elements.recentTab.addEventListener('click', () => this.setSection('recent'));
        this.elements.favoritesTab.addEventListener('click', () => this.setSection('favorites'));
        this.elements.continueTab.addEventListener('click', () => this.setSection('continue'));
        
        // Theme toggle
        this.elements.themeToggle.addEventListener('click', () => this.toggleTheme());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
        
        // Modal close
        if (this.elements.historyModal) {
            this.elements.historyModal.addEventListener('click', (e) => {
                if (e.target === this.elements.historyModal || e.target.classList.contains('modal-close')) {
                    this.elements.historyModal.classList.add('hidden');
                }
            });
        }
    }

    loadLectureData() {
        // Load the provided lecture data
        const lectureData = {
            "lectures": [
                {
                    "id": "lecture_20250828_001",
                    "filename": "new.mp3",
                    "title": "Detailed Description of Golok Dham - SB 3.16.18",
                    "instructor": "HG Lila Purushottam Prabhu",
                    "course": "Srimad Bhagavatam",
                    "date": "28th Aug 2025",
                    "based_on": "SB 3.16.18",
                    "key": "Detailed description of Golok Dham",
                    "description": "A comprehensive explanation of the spiritual realm of Goloka Vrindavan, discussing the eternal nature of spiritual relationships and the divine activities that take place in the spiritual world. The lecture covers the differences between material and spiritual existence, emphasizing the eternal occupational duties of devotees in the spiritual realm.",
                    "video_link": "https://youtu.be/sR6yyeQJduw?si=dsl1NTa9AV1Znf5h",
                    "duration": 3240,
                    "tags": ["goloka", "spiritual world", "srimad bhagavatam", "vrindavan", "eternal dharma"],
                    "audioUrl": "audio/SB-3.16.18-golok-dhaam.mp3",
                    "lastPosition": 0,
                    "isFavorite": false,
                    "playCount": 0,
                    "lastPlayed": null
                },
                {
                    "id": "lecture_20250827_001",
                    "filename": "bhakti-principles.mp3",
                    "title": "Nine Processes of Devotional Service",
                    "instructor": "HG Devotional Acharya Prabhu",
                    "course": "Bhakti Yoga Principles",
                    "date": "27th Aug 2025",
                    "based_on": "SB 7.5.23",
                    "key": "Sravanam kirtanam vishnoh - Nine fold path of devotion",
                    "description": "Detailed explanation of the nine processes of devotional service as described by Prahlad Maharaj. This lecture covers hearing, chanting, remembering, serving the lotus feet, worshiping, praying, serving, friendship, and surrender.",
                    "duration": 2880,
                    "tags": ["bhakti yoga", "devotional service", "nine processes", "prahlad maharaj"],
                    "audioUrl": "audio/bhakti-principles.mp3",
                    "lastPosition": 450,
                    "isFavorite": true,
                    "playCount": 3,
                    "lastPlayed": "2025-08-29"
                },
                {
                    "id": "lecture_20250826_001",
                    "filename": "krishna-consciousness-basics.mp3",
                    "title": "Introduction to Krishna Consciousness",
                    "instructor": "HG Spiritual Guide Prabhu",
                    "course": "Bhagavad Gita As It Is",
                    "date": "26th Aug 2025",
                    "based_on": "BG 2.13",
                    "key": "Understanding the eternal nature of the soul",
                    "description": "An introductory lecture on Krishna consciousness covering the basic principles of spiritual life, the nature of the soul, and the importance of developing a relationship with Krishna.",
                    "duration": 3600,
                    "tags": ["krishna consciousness", "bhagavad gita", "soul", "spiritual life"],
                    "audioUrl": "audio/krishna-consciousness-basics.mp3",
                    "lastPosition": 0,
                    "isFavorite": false,
                    "playCount": 1,
                    "lastPlayed": "2025-08-26"
                },
                {
                    "id": "lecture_20250825_001",
                    "filename": "chanting-holy-names.mp3",
                    "title": "The Power of Chanting the Holy Names",
                    "instructor": "HG Kirtan Master Prabhu",
                    "course": "Nama Tattva",
                    "date": "25th Aug 2025",
                    "based_on": "CC Adi 17.21",
                    "key": "Harer nama harer nama - Only the holy name",
                    "description": "This lecture explains the supreme importance of chanting the holy names of Krishna in this age of Kali. Discusses the process, benefits, and spiritual significance of the Hare Krishna maha-mantra.",
                    "duration": 2700,
                    "tags": ["holy names", "chanting", "hare krishna", "kali yuga", "nama tattva"],
                    "audioUrl": "audio/chanting-holy-names.mp3",
                    "lastPosition": 1200,
                    "isFavorite": true,
                    "playCount": 5,
                    "lastPlayed": "2025-08-30"
                },
                {
                    "id": "lecture_20250824_001",
                    "filename": "guru-tattva-principles.mp3",
                    "title": "Understanding Guru Tattva - The Science of Disciplic Succession",
                    "instructor": "HG Learned Scholar Prabhu",
                    "course": "Guru Tattva",
                    "date": "24th Aug 2025",
                    "based_on": "BG 4.34",
                    "key": "Tad viddhi pranipatena - Approach the guru with submission",
                    "description": "A comprehensive explanation of the guru-disciple relationship, the importance of disciplic succession, and how spiritual knowledge is transmitted through authorized channels.",
                    "duration": 4200,
                    "tags": ["guru tattva", "disciplic succession", "spiritual master", "parampara"],
                    "audioUrl": "audio/guru-tattva-principles.mp3",
                    "lastPosition": 0,
                    "isFavorite": false,
                    "playCount": 2,
                    "lastPlayed": "2025-08-25"
                }
            ]
        };

        this.lectures = lectureData.lectures;
        
        // Initialize favorites from data
        this.lectures.forEach(lecture => {
            if (lecture.isFavorite) {
                this.favorites.add(lecture.id);
            }
        });
        
        // Initialize playback history
        this.playbackHistory = this.lectures
            .filter(lecture => lecture.lastPlayed)
            .sort((a, b) => new Date(b.lastPlayed) - new Date(a.lastPlayed));
        
        this.filterAndRenderLectures();
    }

    initializeTheme() {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            document.documentElement.setAttribute('data-color-scheme', 'dark');
            this.elements.themeToggle.textContent = '☀️';
        } else {
            this.elements.themeToggle.textContent = '🌙';
        }
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-color-scheme');
        if (currentTheme === 'dark') {
            document.documentElement.setAttribute('data-color-scheme', 'light');
            this.elements.themeToggle.textContent = '🌙';
        } else {
            document.documentElement.setAttribute('data-color-scheme', 'dark');
            this.elements.themeToggle.textContent = '☀️';
        }
    }

    handleSearch(searchTerm) {
        this.searchTerm = searchTerm.toLowerCase();
        this.filterAndRenderLectures();
    }

    handleSort(sortBy) {
        this.sortBy = sortBy;
        this.filterAndRenderLectures();
    }

    setView(view) {
        this.currentView = view;
        
        // Update view buttons
        this.elements.listViewBtn.classList.toggle('active', view === 'list');
        this.elements.gridViewBtn.classList.toggle('active', view === 'grid');
        
        // Update lecture list class
        this.elements.lectureList.classList.toggle('grid-view', view === 'grid');
        
        this.renderLectures();
    }

    setSection(section) {
        this.currentSection = section;
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        this.elements[section + (section === 'all' ? 'Lectures' : '') + 'Tab'].classList.add('active');
        
        // Update section title
        const titles = {
            all: 'All Lectures',
            recent: 'Recently Played',
            favorites: 'Favorite Lectures',
            continue: 'Continue Listening'
        };
        this.elements.sectionTitle.textContent = titles[section];
        
        this.filterAndRenderLectures();
    }

    filterAndRenderLectures() {
        let lectures = [...this.lectures];
        
        // Filter by section
        switch (this.currentSection) {
            case 'recent':
                lectures = this.playbackHistory;
                break;
            case 'favorites':
                lectures = lectures.filter(lecture => this.favorites.has(lecture.id));
                break;
            case 'continue':
                lectures = lectures.filter(lecture => lecture.lastPosition > 0 && lecture.lastPosition < lecture.duration - 30);
                break;
            case 'all':
            default:
                // Keep all lectures
                break;
        }
        
        // Apply search filter
        if (this.searchTerm) {
            lectures = lectures.filter(lecture => 
                lecture.title.toLowerCase().includes(this.searchTerm) ||
                lecture.instructor.toLowerCase().includes(this.searchTerm) ||
                lecture.course.toLowerCase().includes(this.searchTerm) ||
                lecture.description.toLowerCase().includes(this.searchTerm) ||
                lecture.tags.some(tag => tag.toLowerCase().includes(this.searchTerm))
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

    parseDate(dateStr) {
        // Convert "28th Aug 2025" format to standard date
        const months = {
            'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
            'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
        };
        
        const parts = dateStr.split(' ');
        if (parts.length === 3) {
            const day = parseInt(parts[0]);
            const month = months[parts[1]];
            const year = parseInt(parts[2]);
            return new Date(year, month, day);
        }
        return new Date(dateStr);
    }

    renderLectures() {
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
        
        lectures.forEach(lecture => {
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
                lecture.tags.forEach(tag => {
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

    playLecture(lecture) {
        // Set current lecture
        this.currentLecture = lecture;
        this.currentIndex = this.lectures.findIndex(l => l.id === lecture.id);
        
        // Update playback history
        this.addToPlaybackHistory(lecture);
        
        // Update UI immediately
        this.updatePlayerInfo();
        this.updateNavigationButtons();
        
        // Simulate audio loading and playing
        this.simulateAudioPlayback(lecture);
        
        // Re-render to show playing state
        this.renderLectures();
        
        // Scroll to audio player section
        document.querySelector('.audio-player-section').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }

    // simulateAudioPlayback(lecture) {
    //     // Since we don't have actual audio files, we'll show a message and update the UI
    //     if (!lecture.audioUrl || !lecture.audioUrl.startsWith('http')) {
    //         this.showPlaybackMessage(lecture);
    //     }
        
    //     // Set playing state
    //     this.isPlaying = true;
    //     this.updatePlayPauseButton();
        
    //     // Simulate duration and current time
    //     this.elements.totalTime.textContent = this.formatTime(lecture.duration);
    //     this.elements.currentTime.textContent = this.formatTime(lecture.lastPosition || 0);
        
    //     // Update progress based on last position
    //     if (lecture.lastPosition > 0) {
    //         const progress = (lecture.lastPosition / lecture.duration) * 100;
    //         this.elements.progressFill.style.width = `${progress}%`;
    //         this.elements.progressSlider.value = progress;
    //     } else {
    //         this.elements.progressFill.style.width = '0%';
    //         this.elements.progressSlider.value = 0;
    //     }
    // }
    simulateAudioPlayback(lecture) {
        // Check if the lecture has a valid audio file
        if (!lecture.filename) {
            console.error('Audio file is missing for lecture:', lecture);
            alert('Audio file is not available for this lecture.');
            return;
        }
    
        // Set the audio source to the file from the metadata
        const audioPath = `audio/${lecture.filename}`;
        this.elements.audioElement.src = audioPath;
    
        // Update the UI with lecture details
        this.updatePlayerInfo();
    
        // Play the audio
        this.elements.audioElement.play().then(() => {
            this.isPlaying = true;
            this.updatePlayPauseButton();
        }).catch((error) => {
            console.error('Error playing audio:', error);
            alert('Failed to play the audio file. Please check if the file exists.');
        });
    
        // Update progress and duration when metadata is loaded
        this.elements.audioElement.addEventListener('loadedmetadata', () => {
            this.elements.totalTime.textContent = this.formatTime(this.elements.audioElement.duration);
            this.updateProgress();
        });
    
        // Update progress as the audio plays
        this.elements.audioElement.addEventListener('timeupdate', () => {
            this.updateProgress();
        });
    
        // Handle audio end
        this.elements.audioElement.addEventListener('ended', () => {
            this.handleAudioEnd();
        });
    }

    showPlaybackMessage(lecture) {
        // Create a temporary notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: var(--color-primary);
            color: var(--color-btn-primary-text);
            padding: 16px 20px;
            border-radius: 8px;
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            max-width: 400px;
            animation: slideInRight 0.3s ease-out;
        `;
        notification.innerHTML = `
            <strong>Now Playing (Demo Mode)</strong><br>
            "${lecture.title}"<br>
            <small>By ${lecture.instructor}</small><br>
            <small style="opacity: 0.8;">In a real application, the audio would play here.</small>
        `;
        
        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideInRight 0.3s ease-out reverse';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        }, 4000);
    }

    addToPlaybackHistory(lecture) {
        // Remove from history if already exists
        this.playbackHistory = this.playbackHistory.filter(l => l.id !== lecture.id);
        
        // Add to beginning of history
        const lectureWithTimestamp = { ...lecture, lastPlayed: new Date().toISOString().split('T')[0] };
        this.playbackHistory.unshift(lectureWithTimestamp);
        
        // Keep only last 50 items
        this.playbackHistory = this.playbackHistory.slice(0, 50);
        
        // Update play count
        lecture.playCount = (lecture.playCount || 0) + 1;
    }

    togglePlayPause() {
        if (!this.currentLecture) return;
        
        this.isPlaying = !this.isPlaying;
        this.updatePlayPauseButton();
        this.renderLectures();
        
        if (this.isPlaying) {
            this.elements.audioElement.play().catch(() => {
                // Ignore errors for demo
            });
        } else {
            this.elements.audioElement.pause();
        }
    }

    previousLecture() {
        if (this.isShuffling) {
            this.playRandomLecture();
        } else if (this.currentIndex > 0) {
            this.playLecture(this.lectures[this.currentIndex - 1]);
        }
    }

    nextLecture() {
        if (this.isShuffling) {
            this.playRandomLecture();
        } else if (this.currentIndex < this.lectures.length - 1) {
            this.playLecture(this.lectures[this.currentIndex + 1]);
        }
    }

    playRandomLecture() {
        const availableLectures = this.lectures.filter(l => l.id !== this.currentLecture?.id);
        if (availableLectures.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableLectures.length);
            this.playLecture(availableLectures[randomIndex]);
        }
    }

    toggleShuffle() {
        this.isShuffling = !this.isShuffling;
        this.elements.shuffleBtn.classList.toggle('active', this.isShuffling);
    }

    toggleRepeat() {
        const modes = ['none', 'one', 'all'];
        const currentIndex = modes.indexOf(this.repeatMode);
        this.repeatMode = modes[(currentIndex + 1) % modes.length];
        
        this.elements.repeatBtn.classList.toggle('active', this.repeatMode !== 'none');
        
        // Update button text based on mode
        const repeatIcons = { none: '🔁', one: '🔂', all: '🔁' };
        this.elements.repeatBtn.textContent = repeatIcons[this.repeatMode];
    }

    toggleFavorite() {
        if (!this.currentLecture) return;
        this.toggleLectureFavorite(this.currentLecture);
    }

    toggleLectureFavorite(lecture) {
        if (this.favorites.has(lecture.id)) {
            this.favorites.delete(lecture.id);
            lecture.isFavorite = false;
        } else {
            this.favorites.add(lecture.id);
            lecture.isFavorite = true;
        }
        
        // Update UI
        if (this.currentLecture && this.currentLecture.id === lecture.id) {
            this.elements.favoriteBtn.classList.toggle('active', lecture.isFavorite);
        }
        
        this.renderLectures();
    }

    bookmarkPosition() {
        if (!this.currentLecture) return;
        
        // In a real application, this would bookmark the current audio position
        this.elements.bookmarkBtn.classList.add('active');
        
        // Show temporary feedback
        const originalText = this.elements.bookmarkBtn.textContent;
        this.elements.bookmarkBtn.textContent = '✓';
        setTimeout(() => {
            this.elements.bookmarkBtn.textContent = originalText;
            this.elements.bookmarkBtn.classList.remove('active');
        }, 1500);
    }

    seekTo(value) {
        if (!this.currentLecture) return;
        
        const time = (value / 100) * this.currentLecture.duration;
        this.currentLecture.lastPosition = time;
        
        this.elements.currentTime.textContent = this.formatTime(time);
        this.elements.progressFill.style.width = `${value}%`;
        
        // In a real application, this would seek the audio element
        if (this.elements.audioElement.duration) {
            this.elements.audioElement.currentTime = time;
        }
    }

    setVolume(value) {
        this.elements.audioElement.volume = value / 100;
        
        // Update volume icon based on level
        const volumeIcon = document.querySelector('.volume-icon');
        if (volumeIcon) {
            if (value == 0) volumeIcon.textContent = '🔇';
            else if (value < 30) volumeIcon.textContent = '🔈';
            else if (value < 70) volumeIcon.textContent = '🔉';
            else volumeIcon.textContent = '🔊';
        }
    }

    setPlaybackSpeed(speed) {
        this.elements.audioElement.playbackRate = parseFloat(speed);
    }

    updatePlayerInfo() {
        if (!this.currentLecture) {
            this.elements.currentTitle.textContent = 'Select a lecture to start playing';
            this.elements.currentInstructor.textContent = '';
            this.elements.currentCourse.textContent = '';
            this.elements.currentDate.textContent = '';
            return;
        }
        
        this.elements.currentTitle.textContent = this.currentLecture.title;
        this.elements.currentInstructor.textContent = `By ${this.currentLecture.instructor}`;
        this.elements.currentCourse.textContent = this.currentLecture.course;
        this.elements.currentDate.textContent = this.currentLecture.date;
        
        // Update favorite button state
        this.elements.favoriteBtn.classList.toggle('active', this.favorites.has(this.currentLecture.id));
    }

    updateDuration() {
        if (this.currentLecture) {
            this.elements.totalTime.textContent = this.formatTime(this.currentLecture.duration);
        }
    }

    updateProgress() {
        if (!this.currentLecture || !this.elements.audioElement.duration) return;
        
        const progress = (this.elements.audioElement.currentTime / this.elements.audioElement.duration) * 100;
        this.elements.progressFill.style.width = `${progress}%`;
        this.elements.progressSlider.value = progress;
        this.elements.currentTime.textContent = this.formatTime(this.elements.audioElement.currentTime);
        
        // Save progress
        this.currentLecture.lastPosition = this.elements.audioElement.currentTime;
    }

    updatePlayPauseButton() {
        this.elements.playPauseBtn.textContent = this.isPlaying ? '⏸️' : '▶️';
    }

    updateNavigationButtons() {
        this.elements.prevBtn.disabled = !this.isShuffling && this.currentIndex <= 0;
        this.elements.nextBtn.disabled = !this.isShuffling && this.currentIndex >= this.lectures.length - 1;
    }

    handlePlay() {
        this.isPlaying = true;
        this.updatePlayPauseButton();
    }

    handlePause() {
        this.isPlaying = false;
        this.updatePlayPauseButton();
    }

    handleAudioEnd() {
        this.isPlaying = false;
        this.updatePlayPauseButton();
        
        // Handle repeat modes
        if (this.repeatMode === 'one') {
            this.playLecture(this.currentLecture);
        } else if (this.repeatMode === 'all' || this.currentIndex < this.lectures.length - 1) {
            this.nextLecture();
        }
    }

    handleKeyboardShortcuts(e) {
        // Only handle shortcuts when not typing in input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        switch (e.code) {
            case 'Space':
                e.preventDefault();
                this.togglePlayPause();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.previousLecture();
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.nextLecture();
                break;
            case 'ArrowUp':
                e.preventDefault();
                const currentVolume = parseInt(this.elements.volumeSlider.value);
                this.elements.volumeSlider.value = Math.min(100, currentVolume + 10);
                this.setVolume(this.elements.volumeSlider.value);
                break;
            case 'ArrowDown':
                e.preventDefault();
                const currentVol = parseInt(this.elements.volumeSlider.value);
                this.elements.volumeSlider.value = Math.max(0, currentVol - 10);
                this.setVolume(this.elements.volumeSlider.value);
                break;
            case 'KeyF':
                e.preventDefault();
                this.toggleFavorite();
                break;
            case 'KeyS':
                e.preventDefault();
                this.toggleShuffle();
                break;
            case 'KeyR':
                e.preventDefault();
                this.toggleRepeat();
                break;
        }
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
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AudioLecturePlayer();
});