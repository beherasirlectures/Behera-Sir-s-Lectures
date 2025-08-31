import tkinter as tk
from tkinter import ttk, filedialog, messagebox
import yt_dlp
import json
from datetime import datetime
from pathlib import Path

class VideoInfoGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Video Info Fetcher")
        self.root.geometry("800x600")
        
        # Create and set up the main frame
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # YouTube URL
        ttk.Label(main_frame, text="YouTube URL:").grid(row=0, column=0, sticky=tk.W, pady=5)
        self.url_var = tk.StringVar()
        ttk.Entry(main_frame, textvariable=self.url_var, width=60).grid(row=0, column=1, sticky=(tk.W, tk.E), pady=5)
        
        # Date
        ttk.Label(main_frame, text="Date (e.g., 11th Aug 2025):").grid(row=1, column=0, sticky=tk.W, pady=5)
        self.date_var = tk.StringVar()
        ttk.Entry(main_frame, textvariable=self.date_var, width=60).grid(row=1, column=1, sticky=(tk.W, tk.E), pady=5)
        
        # Based on
        ttk.Label(main_frame, text="Based on (e.g., SB 3.16.7):").grid(row=2, column=0, sticky=tk.W, pady=5)
        self.based_on_var = tk.StringVar()
        ttk.Entry(main_frame, textvariable=self.based_on_var, width=60).grid(row=2, column=1, sticky=(tk.W, tk.E), pady=5)
        
        # Key
        ttk.Label(main_frame, text="Key (Topic):").grid(row=3, column=0, sticky=tk.W, pady=5)
        self.key_var = tk.StringVar()
        ttk.Entry(main_frame, textvariable=self.key_var, width=60).grid(row=3, column=1, sticky=(tk.W, tk.E), pady=5)
        
        # Audio File Selection
        ttk.Label(main_frame, text="Audio File:").grid(row=4, column=0, sticky=tk.W, pady=5)
        self.filename_var = tk.StringVar()
        ttk.Entry(main_frame, textvariable=self.filename_var, width=50, state='readonly').grid(row=4, column=1, sticky=(tk.W, tk.E), pady=5)
        ttk.Button(main_frame, text="Browse", command=self.select_audio_file).grid(row=4, column=2, padx=(5, 0), pady=5)
        
        # Buttons
        button_frame = ttk.Frame(main_frame)
        button_frame.grid(row=5, column=0, columnspan=3, pady=20)
        
        ttk.Button(button_frame, text="Fetch and Save", command=self.fetch_and_save).pack(side=tk.LEFT, padx=5)
        ttk.Button(button_frame, text="Clear Form", command=self.clear_form).pack(side=tk.LEFT, padx=5)
        
        # Configure grid weights
        main_frame.columnconfigure(1, weight=1)
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)

    def select_audio_file(self):
        file_path = filedialog.askopenfilename(
            title="Select Audio File",
            filetypes=[
                ("Audio Files", "*.mp3 *.wav *.ogg *.m4a *.aac"),
                ("MP3 Files", "*.mp3"),
                ("All Files", "*.*")
            ]
        )
        if file_path:
            self.filename_var.set(Path(file_path).name)

    def clear_form(self):
        self.url_var.set("")
        self.date_var.set("")
        self.based_on_var.set("")
        self.key_var.set("")
        self.filename_var.set("")

    def fetch_video_info(self, video_url):
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': True
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(video_url, download=False)
            return info

    def update_metadata(self, video_info):
        try:
            # Read existing metadata
            with open('metadata.json', 'r', encoding='utf-8') as f:
                metadata = json.load(f)
            
            # Create new lecture entry
            new_lecture = {
                "id": f"lecture_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                "filename": self.filename_var.get(),
                "title": video_info.get('title', ''),
                "instructor": "HG Lila Purushottam Prabhu",
                "course": "Srimad Bhagavatam",
                "date": self.date_var.get(),
                "based_on": self.based_on_var.get(),
                "key": self.key_var.get(),
                "description": video_info.get('description', ''),
                "video_link": video_info.get('webpage_url', ''),
                "duration": video_info.get('duration', 0),
                "tags": ["srimad bhagavatam", "bhakti"],  # Basic tags
                "audioUrl": "",  # Will be filled later with Drive link
                "lastPosition": 0,
                "isFavorite": False,
                "playCount": 0,
                "lastPlayed": None
            }
            
            # Append new lecture to the list
            metadata['lectures'].insert(0, new_lecture)  # Add at the beginning of the list
            
            # Save updated metadata
            with open('metadata.json', 'w', encoding='utf-8', newline='\n') as f:
                json.dump(metadata, f, indent=4, ensure_ascii=False)
            
            return True
        except Exception as e:
            messagebox.showerror("Error", f"Failed to update metadata: {str(e)}")
            return False

    def fetch_and_save(self):
        # Validate inputs
        if not all([self.url_var.get(), self.date_var.get(), self.based_on_var.get(), 
                   self.key_var.get(), self.filename_var.get()]):
            messagebox.showwarning("Warning", "Please fill in all fields")
            return
        
        try:
            # Fetch video info
            video_info = self.fetch_video_info(self.url_var.get())
            
            # Update metadata
            if self.update_metadata(video_info):
                messagebox.showinfo("Success", "Metadata updated successfully!")
                self.clear_form()
            
        except Exception as e:
            messagebox.showerror("Error", f"Failed to fetch video info: {str(e)}")

def main():
    root = tk.Tk()
    app = VideoInfoGUI(root)
    root.mainloop()

if __name__ == "__main__":
    main()
