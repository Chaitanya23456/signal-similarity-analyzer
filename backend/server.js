const express = require('express');
const cors = require('cors');
const ss = require('simple-statistics');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

app.post('/api/analyze', (req, res) => {
    let { signal1, signal2 } = req.body;

    if (!Array.isArray(signal1) || !Array.isArray(signal2)) {
        return res.status(400).json({ error: "Signals must be arrays" });
    }

    // Handle unequal length (as per original Python code)
    const minLen = Math.min(signal1.length, signal2.length);
    const s1 = signal1.slice(0, minLen);
    const s2 = signal2.slice(0, minLen);

    let correlation = 0;
    let similarity = "NOT SIMILAR";

    try {
        if (minLen > 1) {
            correlation = ss.sampleCorrelation(s1, s2);
        } else {
            // Correlation not defined for single values
            correlation = (s1[0] === s2[0]) ? 1 : 0;
        }
        
        // Decision (as per original Python code: threshold 0.7)
        if (correlation > 0.7) {
            similarity = "SIMILAR";
        }
    } catch (e) {
        console.error("Correlation error:", e);
        return res.status(400).json({ error: "Failed to calculate correlation. Ensure signals have variance." });
    }

    res.json({
        correlation: parseFloat(correlation.toFixed(4)),
        similarity,
        adjustedLength: minLen,
        signal1: s1,
        signal2: s2
    });
});

app.listen(port, () => {
    console.log(`Backend running at http://localhost:${port}`);
});
