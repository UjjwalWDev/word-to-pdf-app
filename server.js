const express = require('express');
const multer = require('multer');
const path = require('path');
const { exec } = require('child_process');
const app = express();
const PORT = 3000;
app.use(express.static('public'));

const upload = multer({ dest: 'uploads/' });

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
