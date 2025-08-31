const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Ensure folders exist
const audioDir = path.join(__dirname, 'audio');
const jsonDir = path.join(__dirname, 'json');
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir);
if (!fs.existsSync(jsonDir)) fs.mkdirSync(jsonDir);

const metadataPath = path.join(jsonDir, 'audioFiles.json');
if (!fs.existsSync(metadataPath)) fs.writeFileSync(metadataPath, '[]');

// Multer setup for audio uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, audioDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Serve static files
app.use('/audio', express.static(audioDir));
app.use(express.static(__dirname));

// Upload endpoint
app.post('/upload', upload.single('audio'), (req, res) => {
  if (!req.file) return res.status(400).send('No file uploaded.');
  // Save metadata
  const metadata = JSON.parse(fs.readFileSync(metadataPath));
  metadata.push({ 
    title: req.body.title || req.file.originalname,
    originalname: req.file.originalname,
    audioUrl: req.body.driveLink // Expecting drive link from the form
  });
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  res.redirect('/upload.html');
});

// List audio files endpoint
app.get('/audio-list', (req, res) => {
  const metadata = JSON.parse(fs.readFileSync(metadataPath));
  res.json(metadata);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
