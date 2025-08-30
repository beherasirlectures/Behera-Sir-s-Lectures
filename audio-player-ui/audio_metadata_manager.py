
import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import json
import os
import shutil
from datetime import datetime
import re
import urllib.request
import urllib.parse
from pathlib import Path

class AudioMetadataManager:
    def __init__(self, root):
        self.root = root
        self.root.title("Audio Lecture Metadata Manager")
        self.root.geometry("800x700")

        # Variables
        self.audio_file_path = tk.StringVar()
        self.date_var = tk.StringVar(value=datetime.now().strftime("%d %b %Y"))
        self.based_on_var = tk.StringVar()
        self.key_var = tk.StringVar()
        self.title_var = tk.StringVar()
        self.description_var = tk.StringVar()
        self.video_link_var = tk.StringVar()
        self.instructor_var = tk.StringVar()
        self.course_var = tk.StringVar()
        self.tags_var = tk.StringVar()

        self.setup_ui()

    def setup_ui(self):
        # Main frame
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))

        # Title
        title_label = ttk.Label(main_frame, text="Audio Lecture Metadata Manager", 
                               font=('Arial', 16, 'bold'))
        title_label.grid(row=0, column=0, columnspan=2, pady=(0, 20))

        # YouTube Video Link
        ttk.Label(main_frame, text="YouTube Video Link:").grid(row=1, column=0, sticky=tk.W, pady=5)
        video_entry = ttk.Entry(main_frame, textvariable=self.video_link_var, width=60)
        video_entry.grid(row=1, column=1, sticky=(tk.W, tk.E), pady=5)
        ttk.Button(main_frame, text="Fetch Info", 
                  command=self.fetch_youtube_info).grid(row=1, column=2, padx=(5, 0), pady=5)

        # Audio File Selection
        ttk.Label(main_frame, text="Audio File:").grid(row=2, column=0, sticky=tk.W, pady=5)
        ttk.Entry(main_frame, textvariable=self.audio_file_path, width=50, 
                 state='readonly').grid(row=2, column=1, sticky=(tk.W, tk.E), pady=5)
        ttk.Button(main_frame, text="Browse", 
                  command=self.select_audio_file).grid(row=2, column=2, padx=(5, 0), pady=5)

        # Metadata fields
        ttk.Label(main_frame, text="Date:").grid(row=3, column=0, sticky=tk.W, pady=5)
        ttk.Entry(main_frame, textvariable=self.date_var, width=60).grid(row=3, column=1, 
                 sticky=(tk.W, tk.E), pady=5)

        ttk.Label(main_frame, text="Based on:").grid(row=4, column=0, sticky=tk.W, pady=5)
        ttk.Entry(main_frame, textvariable=self.based_on_var, width=60).grid(row=4, column=1, 
                 sticky=(tk.W, tk.E), pady=5)

        ttk.Label(main_frame, text="Key (Topic):").grid(row=5, column=0, sticky=tk.W, pady=5)
        ttk.Entry(main_frame, textvariable=self.key_var, width=60).grid(row=5, column=1, 
                 sticky=(tk.W, tk.E), pady=5)

        ttk.Label(main_frame, text="Title:").grid(row=6, column=0, sticky=tk.W, pady=5)
        ttk.Entry(main_frame, textvariable=self.title_var, width=60).grid(row=6, column=1, 
                 sticky=(tk.W, tk.E), pady=5)

        ttk.Label(main_frame, text="Instructor:").grid(row=7, column=0, sticky=tk.W, pady=5)
        ttk.Entry(main_frame, textvariable=self.instructor_var, width=60).grid(row=7, column=1, 
                 sticky=(tk.W, tk.E), pady=5)

        ttk.Label(main_frame, text="Course:").grid(row=8, column=0, sticky=tk.W, pady=5)
        ttk.Entry(main_frame, textvariable=self.course_var, width=60).grid(row=8, column=1, 
                 sticky=(tk.W, tk.E), pady=5)

        ttk.Label(main_frame, text="Tags (comma-separated):").grid(row=9, column=0, sticky=tk.W, pady=5)
        ttk.Entry(main_frame, textvariable=self.tags_var, width=60).grid(row=9, column=1, 
                 sticky=(tk.W, tk.E), pady=5)

        # Description (text area)
        ttk.Label(main_frame, text="Description:").grid(row=10, column=0, sticky=(tk.W, tk.N), pady=5)
        self.description_text = tk.Text(main_frame, height=8, width=60, wrap=tk.WORD)
        self.description_text.grid(row=10, column=1, sticky=(tk.W, tk.E), pady=5)

        # Scrollbar for description
        desc_scrollbar = ttk.Scrollbar(main_frame, orient=tk.VERTICAL, command=self.description_text.yview)
        desc_scrollbar.grid(row=10, column=2, sticky=(tk.N, tk.S), pady=5)
        self.description_text.configure(yscrollcommand=desc_scrollbar.set)

        # Buttons
        button_frame = ttk.Frame(main_frame)
        button_frame.grid(row=11, column=0, columnspan=3, pady=20)

        ttk.Button(button_frame, text="Save Metadata", 
                  command=self.save_metadata).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Clear Form", 
                  command=self.clear_form).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Load Existing", 
                  command=self.load_existing_metadata).pack(side=tk.LEFT, padx=5)

        # Configure grid weights
        main_frame.columnconfigure(1, weight=1)
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)

    def fetch_youtube_info(self):
        """Fetch title and description from YouTube link"""
        video_url = self.video_link_var.get().strip()
        if not video_url:
            messagebox.showwarning("Warning", "Please enter a YouTube URL")
            return

        try:
            # Extract video ID from URL
            video_id = self.extract_video_id(video_url)
            if not video_id:
                messagebox.showerror("Error", "Invalid YouTube URL")
                return

            # For this example, we'll extract basic info from the URL
            # In a real implementation, you'd use YouTube Data API

            # Simple title extraction (this is a basic example)
            # You would implement proper YouTube API integration here
            self.title_var.set("YouTube Video Title (Please edit)")
            self.description_text.delete(1.0, tk.END)
            self.description_text.insert(1.0, "YouTube video description (Please edit)")

            messagebox.showinfo("Info", "Please manually update title and description.\nFor full automation, implement YouTube Data API.")

        except Exception as e:
            messagebox.showerror("Error", f"Failed to fetch YouTube info: {str(e)}")

    def extract_video_id(self, url):
        """Extract video ID from YouTube URL"""
        patterns = [
            r'(?:youtube\.com/watch\?v=|youtu\.be/)([^&\n?#]+)',
            r'youtube\.com/embed/([^&\n?#]+)',
            r'youtube\.com/v/([^&\n?#]+)'
        ]

        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        return None

    def select_audio_file(self):
        """Open file dialog to select audio file"""
        file_path = filedialog.askopenfilename(
            title="Select Audio File",
            filetypes=[
                ("Audio Files", "*.mp3 *.wav *.ogg *.m4a *.aac"),
                ("MP3 Files", "*.mp3"),
                ("WAV Files", "*.wav"),
                ("All Files", "*.*")
            ]
        )

        if file_path:
            self.audio_file_path.set(file_path)

            # Auto-fill some fields based on filename
            filename = os.path.basename(file_path)
            if not self.title_var.get():
                # Remove extension and clean up filename for title
                title = os.path.splitext(filename)[0]
                title = title.replace('_', ' ').replace('-', ' ')
                self.title_var.set(title)

    def save_metadata(self):
        """Save metadata and copy audio file"""
        if not self.audio_file_path.get():
            messagebox.showerror("Error", "Please select an audio file")
            return

        if not self.title_var.get():
            messagebox.showerror("Error", "Please enter a title")
            return

        try:
            # Create directories
            audio_dir = Path("audio")
            metadata_dir = Path("metadata")
            audio_dir.mkdir(exist_ok=True)
            metadata_dir.mkdir(exist_ok=True)

            # Generate unique filename
            original_filename = os.path.basename(self.audio_file_path.get())
            name, ext = os.path.splitext(original_filename)

            # Clean filename
            clean_name = re.sub(r'[^a-zA-Z0-9_-]', '_', name)
            new_filename = f"{clean_name}{ext}"

            # Ensure unique filename
            counter = 1
            while (audio_dir / new_filename).exists():
                new_filename = f"{clean_name}_{counter}{ext}"
                counter += 1

            # Copy audio file
            audio_dest = audio_dir / new_filename
            shutil.copy2(self.audio_file_path.get(), audio_dest)

            # Create metadata
            metadata = {
                "id": f"lecture_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                "filename": new_filename,
                "title": self.title_var.get(),
                "instructor": self.instructor_var.get(),
                "course": self.course_var.get(),
                "date": self.date_var.get(),
                "based_on": self.based_on_var.get(),
                "key": self.key_var.get(),
                "description": self.description_text.get(1.0, tk.END).strip(),
                "video_link": self.video_link_var.get(),
                "duration": 0,  # Would be calculated from audio file
                "tags": [tag.strip() for tag in self.tags_var.get().split(",") if tag.strip()],
                "audioUrl": f"audio/{new_filename}",
                "lastPosition": 0
            }

            # Save individual metadata file
            metadata_file = metadata_dir / f"{clean_name}.json"
            with open(metadata_file, 'w', encoding='utf-8') as f:
                json.dump(metadata, f, indent=2, ensure_ascii=False)

            # Update main lectures file
            self.update_main_lectures_file(metadata)

            messagebox.showinfo("Success", 
                              f"Metadata saved successfully!\n"
                              f"Audio file: {new_filename}\n"
                              f"Metadata: {metadata_file.name}")

            self.clear_form()

        except Exception as e:
            messagebox.showerror("Error", f"Failed to save metadata: {str(e)}")

    def update_main_lectures_file(self, new_metadata):
        """Update the main lectures.json file"""
        lectures_file = Path("lectures.json")

        # Load existing data or create new
        if lectures_file.exists():
            with open(lectures_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
        else:
            data = {"lectures": []}

        # Add new lecture
        data["lectures"].append(new_metadata)

        # Save updated data
        with open(lectures_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    def clear_form(self):
        """Clear all form fields"""
        self.audio_file_path.set("")
        self.date_var.set(datetime.now().strftime("%d %b %Y"))
        self.based_on_var.set("")
        self.key_var.set("")
        self.title_var.set("")
        self.description_var.set("")
        self.video_link_var.set("")
        self.instructor_var.set("")
        self.course_var.set("")
        self.tags_var.set("")
        self.description_text.delete(1.0, tk.END)

    def load_existing_metadata(self):
        """Load existing metadata file"""
        file_path = filedialog.askopenfilename(
            title="Select Metadata File",
            filetypes=[("JSON Files", "*.json"), ("All Files", "*.*")]
        )

        if file_path:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    metadata = json.load(f)

                # Populate form fields
                self.title_var.set(metadata.get("title", ""))
                self.instructor_var.set(metadata.get("instructor", ""))
                self.course_var.set(metadata.get("course", ""))
                self.date_var.set(metadata.get("date", ""))
                self.based_on_var.set(metadata.get("based_on", ""))
                self.key_var.set(metadata.get("key", ""))
                self.video_link_var.set(metadata.get("video_link", ""))
                self.tags_var.set(", ".join(metadata.get("tags", [])))

                self.description_text.delete(1.0, tk.END)
                self.description_text.insert(1.0, metadata.get("description", ""))

                messagebox.showinfo("Success", "Metadata loaded successfully!")

            except Exception as e:
                messagebox.showerror("Error", f"Failed to load metadata: {str(e)}")

def main():
    root = tk.Tk()
    app = AudioMetadataManager(root)
    root.mainloop()

if __name__ == "__main__":
    main()
