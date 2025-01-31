const express = require('express');
const fs = require('fs');
const path = require('path'); // ✅ Needed for file paths

const app = express();

// ✅ Ensure Express can parse JSON
app.use(express.json());

// ✅ Serve static files (HTML, CSS, JS, images)
app.use(express.static(path.join(__dirname)));

// ✅ Serve `index.html` on root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ✅ Save marker data to `markers.csv`
app.post('/save-marker', (req, res) => {
    console.log("📥 Received data:", req.body); // Debugging log

    const { lat, lng } = req.body;
    
    if (!lat || !lng) {
        return res.status(400).json({ error: "Missing latitude or longitude" });
    }

    const data = `${lat},${lng}\n`;

    fs.appendFile('markers.csv', data, (err) => {
        if (err) {
            console.error('❌ Error writing to file:', err);
            return res.status(500).json({ error: "Failed to save marker" });
        }
        res.json({ success: true, message: "Marker saved!" });
    });
});

// ✅ Start the server
app.listen(3000, () => console.log("✅ Server running on port 3000"));
