const express = require('express');
const multer = require('multer');
const path = require('path');
const { exec } = require('child_process');
const app = express();
const PORT = 3000;
app.use(express.static('public'));
const cors = require("cors");
app.use(cors());
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const path = require('path');

// Define folder paths
const uploadsDir = path.join(__dirname, 'uploads');
const convertedDir = path.join(__dirname, 'converted');

// Create 'uploads' folder if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
    console.log('Created uploads/ folder');
}

// Create 'converted' folder if it doesn't exist
if (!fs.existsSync(convertedDir)) {
    fs.mkdirSync(convertedDir);
    console.log('Created converted/ folder');
}


app.post('/convert', upload.single('wordFile'), (req, res) => {
  const inputPath = path.join(__dirname, req.file.path);
  const outputDir = path.join(__dirname, 'converted');
  const soffice = `"C:\\Program Files\\LibreOffice\\program\\soffice.exe"`;

  exec(`${soffice} --headless --convert-to pdf --outdir "${outputDir}" "${inputPath}"`, (err, stdout, stderr) => {
    if (err) {
      console.error('Conversion error:', stderr);
      return res.status(500).send('Conversion failed');
    }
    const fs = require('fs');
setTimeout(() => {
  fs.readdir(outputDir, (err, files) => {
    if (err) return res.status(500).send('Error reading output directory');

    const pdfFiles = files.filter(file => file.endsWith('.pdf'));
    if (pdfFiles.length === 0) return res.status(500).send('No PDF generated');

    const latestPdf = path.join(outputDir, pdfFiles.sort((a, b) => {
      return fs.statSync(path.join(outputDir, b)).mtime - fs.statSync(path.join(outputDir, a)).mtime;
    })[0]);

    res.download(latestPdf, 'converted.pdf');
  });
}, 1000); 

  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
