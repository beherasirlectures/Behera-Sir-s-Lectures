# Audio Lecture Player - Setup Guide

## Overview
This project consists of two components:
1. **Web Application** - A client-side audio player for GitHub Pages
2. **Python GUI Tool** - For adding metadata and managing audio files

## Web Application (GitHub Pages)

### Features
- Upload and play audio lectures (MP3, WAV, OGG, M4A, AAC)
- Add and edit metadata (title, instructor, course, description, tags)
- Search and filter lectures
- Playback controls with speed adjustment
- Progress tracking and resume functionality
- Export/import metadata as JSON

### Deployment to GitHub Pages

1. **Create GitHub Repository**
   ```
   Repository name: your-username.github.io (for personal site)
   OR
   Repository name: audio-lectures (for project site)
   ```

2. **Upload Files**
   - Download the generated web application files (index.html, style.css, app.js)
   - Upload these files to your GitHub repository
   - Create an `audio` folder in the repository for storing audio files

3. **Enable GitHub Pages**
   - Go to repository Settings > Pages
   - Select source branch (main/master)
   - Your site will be available at: `https://username.github.io/repository-name/`

## Python GUI Tool (For Metadata Management)

### Requirements
```bash
pip install tkinter requests youtube-dl mutagen
```

### Features
- YouTube link integration for fetching titles and descriptions
- Automatic metadata extraction from audio files
- GUI form for easy metadata entry
- Automatic file organization
- JSON metadata generation

### Usage
1. Run the Python GUI tool
2. Enter YouTube video link (optional)
3. Upload audio file
4. Fill in metadata form:
   - Date
   - Based on (source reference)
   - Key (topic description)
   - Title (auto-filled from YouTube if provided)
   - Description (auto-filled from YouTube if provided)
5. Save - this will:
   - Copy audio file to the `audio` folder
   - Generate metadata JSON
   - Update the main metadata file for the web application

### Directory Structure
```
project-root/
├── index.html
├── style.css
├── app.js
├── audio/
│   ├── lecture1.mp3
│   ├── lecture2.mp3
│   └── ...
├── metadata/
│   ├── lecture1.json
│   ├── lecture2.json
│   └── lectures.json (combined metadata)
└── tools/
    └── metadata_manager.py
```

## Metadata Format
```json
{
  "id": "unique-id",
  "filename": "audio-file.mp3",
  "title": "Lecture Title",
  "instructor": "Speaker Name",
  "course": "Course/Subject",
  "date": "2025-08-30",
  "based_on": "SB 3.16.18",
  "key": "Topic description",
  "description": "Full description",
  "video_link": "https://youtu.be/...",
  "duration": 3600,
  "tags": ["tag1", "tag2"],
  "lastPosition": 0
}
```

## Workflow

### For Content Creators:
1. Record or obtain audio lecture
2. Use Python GUI tool to add metadata
3. Tool automatically organizes files and generates metadata
4. Commit changes to GitHub repository
5. GitHub Pages automatically updates the website

### For Users:
1. Visit the GitHub Pages website
2. Browse available lectures
3. Search/filter by topic, instructor, etc.
4. Play lectures with full playback controls
5. Resume from where they left off

## Advanced Features

### Batch Processing
- Modify Python tool to handle multiple files at once
- CSV import for bulk metadata updates

### Audio Processing
- Automatic transcription integration
- Audio quality optimization
- Chapter/timestamp markers

### Enhanced Web Features
- Playlists and collections
- User accounts and progress sync
- Comments and ratings
- Mobile app companion

## GitHub Pages Limitations
- Static hosting only (no server-side processing)
- 1GB repository size limit
- 100GB bandwidth per month
- Files must be under 100MB each

## Tips for Large Audio Collections
1. Use audio compression to reduce file sizes
2. Consider splitting long lectures into chapters
3. Use external hosting (like GitHub LFS) for large files
4. Implement lazy loading for better performance

## Security Considerations
- All files are publicly accessible
- No authentication system (static site)
- Be mindful of copyright and privacy when uploading content

## Support and Updates
- Check the repository for updates
- Modify the Python tool as needed for your workflow
- The web application runs entirely client-side for maximum compatibility