const fs = require('fs');
const path = require('path');

// Load the first 20 questions
const mock3File = path.join('d:', 'KVJ Analytics Internship', 'KVJ Python Quiz', 'Quiz DD', 'KVJ Analytics', 'Quiz DD', 'mock3_1_20.json');
let mock1First20 = JSON.parse(fs.readFileSync(mock3File, 'utf8'));

// Ensure the IDs are exactly 1-20
mock1First20 = mock1First20.map((q, i) => {
    q.id = i + 1;
    return q;
});

// We need to extract the variants from the inject_mock1_variants.py script.
const variantsFile = path.join('d:', 'KVJ Analytics Internship', 'KVJ Python Quiz', 'Quiz DD', 'KVJ Analytics', 'Quiz DD', 'inject_mock1_variants.py');
const code = fs.readFileSync(variantsFile, 'utf8');

// Isolate the `variants = [...]` part.
const startStr = "variants = [\n    {\n";
const startIdx = code.indexOf(startStr);
const endIdx = code.indexOf("]\n\nwith open(", startIdx);

if (startIdx === -1 || endIdx === -1) {
    console.error("Could not find variants block.");
    process.exit(1);
}

// Extract the string representing the variants list and turn it into valid JSON format.
let variantsStr = code.substring(startIdx + "variants = ".length, endIdx + 1);
// Replace Python True/False with JS true/false
variantsStr = variantsStr.replace(/\bTrue\b/g, 'true');
variantsStr = variantsStr.replace(/\bFalse\b/g, 'false');
// The python dict keys are already quoted, but let's just parse it using eval since we control the string and it's a simple literal.
let variants;
try {
    variants = eval("(" + variantsStr + ")");
} catch (e) {
    console.error("Failed to parse variants:", e);
    process.exit(1);
}

// Ensure variants IDs are exactly 21-40
variants = variants.map((q, i) => {
    q.id = i + 21;
    return q;
});

const fullMock1 = mock1First20.concat(variants);

const outputDir = path.join('d:', 'KVJ Analytics Internship', 'python-quiz-app', 'frontend', 'data');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}
const outputFile = path.join(outputDir, 'mock_test_1_data.json');

fs.writeFileSync(outputFile, JSON.stringify(fullMock1, null, 4), 'utf8');

console.log(`Successfully generated ${outputFile} with ${fullMock1.length} questions.`);
