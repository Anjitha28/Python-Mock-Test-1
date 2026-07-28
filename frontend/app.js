// State
let userName = '';
let userId = null;
let sessionId = null;
let attemptId = null;
let attemptNumber = 1;
let questions = [];
let currentQuestionIndex = 0;
let userAnswers = {}; // { questionIndex: answer }
let markedForReview = {}; // { questionIndex: boolean }
let lastRenderedQuestionIndex = -1;
let timerInterval;
const TIME_ALLOWED_MS = 50 * 60 * 1000; // 50 minutes

// API Configuration
const API_BASE_URL = window.location.protocol === 'file:' 
    ? 'http://localhost:3000/api' 
    : '/api';

// DOM Elements
const pages = {
    login: document.getElementById('page-login'),
    selection: document.getElementById('page-selection'),
    quiz: document.getElementById('page-quiz'),
    results: document.getElementById('page-results')
};

const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const displayName = document.getElementById('display-name');
const startTestBtn = document.getElementById('start-test-btn');
const retakeBtn = document.getElementById('retake-btn');

const currentQSpan = document.getElementById('current-q');
const totalQSpan = document.getElementById('total-q');
const questionContainer = document.getElementById('question-container');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const submitBtn = document.getElementById('submit-btn');
const toastEl = document.getElementById('toast');
const markReviewBtn = document.getElementById('btn-mark-review');
const markText = document.getElementById('mark-text');

// Initialization
async function init() {
    try {
        questions = typeof mockTest1Data !== 'undefined' ? mockTest1Data : [];
        if(questions.length === 0) {
            console.error("No questions found.");
        }
        totalQSpan.innerText = questions.length;
    } catch (err) {
        console.error("Failed to load quiz data:", err);
        showToast("Failed to load quiz data. Check console.", true);
    }

    // Load state from local storage if exists
    const savedName = localStorage.getItem('pq_username');
    const savedUserId = localStorage.getItem('pq_userid');
    const savedSessionId = localStorage.getItem('pq_sessionid');
    
    if (savedName) {
        userName = savedName;
        // Do NOT prefill usernameInput.value here
    }
    if (savedUserId) userId = savedUserId;
    if (savedSessionId) sessionId = savedSessionId;
    
    const savedAttempt = localStorage.getItem('pq_attempt');
    if (savedAttempt) {
        attemptNumber = parseInt(savedAttempt);
    }
    
    const savedAttemptId = localStorage.getItem('pq_attemptid');
    if (savedAttemptId) attemptId = savedAttemptId;
}

// Navigation Functions
function showPage(pageId) {
    Object.values(pages).forEach(page => page.classList.add('hidden'));
    pages[pageId].classList.remove('hidden');
    
    if (pageId === 'quiz') {
        document.body.classList.add('quiz-active');
        document.querySelector('.container').classList.add('quiz-active-container');
    } else {
        document.body.classList.remove('quiz-active');
        document.querySelector('.container').classList.remove('quiz-active-container');
    }
}

function showToast(message, isError = false) {
    toastEl.innerText = message;
    toastEl.style.borderLeft = `4px solid var(--${isError ? 'danger' : 'success'})`;
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), 3000);
}

// Event Listeners
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    userName = usernameInput.value.trim();
    if (userName) {
        // 1. Instantly navigate to Selection page
        displayName.innerText = userName;
        showPage('selection');
        
        // 2. Perform API call in background
        try {
            const res = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_name: userName })
            });
            if (res.ok) {
                const data = await res.json();
                userId = data.user.id;
                sessionId = data.user.session_id;
                
                localStorage.setItem('pq_username', userName);
                localStorage.setItem('pq_userid', userId);
                localStorage.setItem('pq_sessionid', sessionId);
            } else {
                console.error("Login failed on backend");
            }
        } catch (err) {
            console.error("Login error:", err);
        }
    }
});

startTestBtn.addEventListener('click', async () => {
    currentQuestionIndex = 0;
    userAnswers = {};
    markedForReview = {};
    initTileBar();
    
    // 1. Immediately update UI and start test
    startTimer();
    renderQuestion();
    showPage('quiz');
    
    // 2. Register attempt in background
    try {
        const res = await fetch(`${API_BASE_URL}/start-quiz`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, user_name: userName, test_name: 'Python Mastery - Mock Test 1' })
        });
        
        if (res.ok) {
            const data = await res.json();
            attemptId = data.attempt.id;
            attemptNumber = data.attempt.attempt_number;
            localStorage.setItem('pq_attemptid', attemptId);
            localStorage.setItem('pq_attempt', attemptNumber);
        }
    } catch (err) {
        console.error("Failed to register quiz start on backend:", err);
    }
});

prevBtn.addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuestion();
    }
});

nextBtn.addEventListener('click', () => {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        renderQuestion();
    }
});

submitBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to submit the quiz?")) {
        clearInterval(timerInterval);
        const endTime = parseInt(localStorage.getItem('pq_endTime'), 10) || Date.now();
        const remainingMs = Math.max(0, endTime - Date.now());
        evaluateQuiz('Manual', remainingMs);
    }
});

retakeBtn.addEventListener('click', () => {
    showPage('selection');
});

markReviewBtn.addEventListener('click', () => {
    markedForReview[currentQuestionIndex] = !markedForReview[currentQuestionIndex];
    if (markedForReview[currentQuestionIndex]) {
        markReviewBtn.classList.add('marked');
        markText.innerText = 'Marked for Review';
    } else {
        markReviewBtn.classList.remove('marked');
        markText.innerText = 'Mark for Review';
    }
    updateTile(currentQuestionIndex);
});

// Timer Logic
function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function startTimer() {
    clearInterval(timerInterval);
    
    // Check if there is an existing valid timer. If not, or if it's expired, start a new 50:00 timer.
    let endTime = parseInt(localStorage.getItem('pq_endTime'), 10);
    if (!endTime || endTime <= Date.now()) {
        endTime = Date.now() + TIME_ALLOWED_MS;
        localStorage.setItem('pq_endTime', endTime);
    }
    
    updateTimerDisplay(); // Initial display
    timerInterval = setInterval(updateTimerDisplay, 1000);
}

function updateTimerDisplay() {
    const endTime = parseInt(localStorage.getItem('pq_endTime'), 10);
    if (!endTime) return;
    
    const remainingMs = Math.max(0, endTime - Date.now());
    document.getElementById('quiz-timer').innerText = formatTime(remainingMs);
    
    if (remainingMs <= 0) {
        clearInterval(timerInterval);
        evaluateQuiz('Auto (Time Expired)', 0);
    }
}

// Render Quiz Question
function renderQuestion() {
    const q = questions[currentQuestionIndex];
    currentQSpan.innerText = currentQuestionIndex + 1;
    
    // Manage Buttons
    prevBtn.disabled = currentQuestionIndex === 0;
    
    if (currentQuestionIndex === questions.length - 1) {
        nextBtn.classList.add('hidden');
        submitBtn.classList.remove('hidden');
    } else {
        nextBtn.classList.remove('hidden');
        submitBtn.classList.add('hidden');
    }
    
    // Manage Review Button State
    if (markedForReview[currentQuestionIndex]) {
        markReviewBtn.classList.add('marked');
        markText.innerText = 'Marked for Review';
    } else {
        markReviewBtn.classList.remove('marked');
        markText.innerText = 'Mark for Review';
    }
    
    let html = `<div class="question-text">${q.q}</div>`;
    
    if (q.code) {
        // Simple replace for DROPDOWN blanks [b1], [b2]
        let codeHtml = q.code;
        if (q.type === 'DROPDOWN' && q.options) {
            q.options.forEach((opts, i) => {
                let selectHtml = `<select data-blank="${i}" class="dropdown-blank" onchange="saveDropdownAnswer(${currentQuestionIndex}, ${i}, this.value)">`;
                selectHtml += `<option value="-1">-- Select --</option>`;
                opts.forEach((opt, optIdx) => {
                    let isSelected = (userAnswers[currentQuestionIndex] && userAnswers[currentQuestionIndex][i] == optIdx) ? 'selected' : '';
                    selectHtml += `<option value="${optIdx}" ${isSelected}>${opt}</option>`;
                });
                selectHtml += `</select>`;
                codeHtml = codeHtml.replace(`[b${i+1}]`, selectHtml);
            });
        }
        html += `<pre><code>${codeHtml}</code></pre>`;
    }
    
    if (q.type === 'TF') {
        html += `<div class="options-grid">`;
        if (q.options) {
            q.options.forEach((stmt, idx) => {
                const userAns = (userAnswers[currentQuestionIndex] && userAnswers[currentQuestionIndex][idx] !== undefined) ? userAnswers[currentQuestionIndex][idx] : null;
                
                const trueSelected = (userAns === 'TRUE' || userAns === 'True' || userAns === true) ? 'selected' : '';
                const falseSelected = (userAns === 'FALSE' || userAns === 'False' || userAns === false) ? 'selected' : '';
                
                html += `<div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--bg-card); border-radius: 0.5rem; border: 1px solid var(--border); margin-bottom: 0.5rem; gap: 1rem;">
                    <div style="flex: 1;">${stmt}</div>
                    <div style="display: flex; gap: 0.5rem; flex-shrink: 0;">
                        <div class="option-btn ${trueSelected}" style="padding: 0.5rem 1rem; text-align: center; margin: 0;" onclick="selectTFOption(${currentQuestionIndex}, ${idx}, 'TRUE')">True</div>
                        <div class="option-btn ${falseSelected}" style="padding: 0.5rem 1rem; text-align: center; margin: 0;" onclick="selectTFOption(${currentQuestionIndex}, ${idx}, 'FALSE')">False</div>
                    </div>
                </div>`;
            });
        }
        html += `</div>`;
    } else if (q.type === 'MCQ' || q.type === 'MCQ2') {
        html += `<div class="options-grid">`;
        if (q.options) {
            let maxSel = 2; // Default to 2
            if (Array.isArray(q.a)) {
                maxSel = q.a.length;
            } else if (q.q.toLowerCase().includes('choose 3') || q.q.toLowerCase().includes('select 3') || q.q.toLowerCase().includes('choose three')) {
                maxSel = 3;
            }
            
            const currentSelCount = (q.type === 'MCQ2' && userAnswers[currentQuestionIndex] && Array.isArray(userAnswers[currentQuestionIndex])) ? userAnswers[currentQuestionIndex].length : 0;
            const maxReached = currentSelCount >= maxSel;

            q.options.forEach((opt, idx) => {
                let isSelected = false;
                if (q.type === 'MCQ2') {
                    isSelected = userAnswers[currentQuestionIndex] && userAnswers[currentQuestionIndex].includes(idx);
                } else {
                    isSelected = userAnswers[currentQuestionIndex] === idx;
                }
                
                const selectedClass = isSelected ? 'selected' : '';
                const disabledClass = (q.type === 'MCQ2' && maxReached && !isSelected) ? 'disabled' : '';
                
                html += `<div class="option-btn ${selectedClass} ${disabledClass}" onclick="${disabledClass ? '' : `selectOption(${currentQuestionIndex}, ${idx}, '${q.type}')`}">${opt}</div>`;
            });
        }
        html += `</div>`;
    } else if (q.type === 'SHORT') {
        const val = userAnswers[currentQuestionIndex] || '';
        html += `<div class="input-group">
            <input type="text" value="${val}" onchange="saveShortAnswer(${currentQuestionIndex}, this.value)" placeholder="Type your answer here">
        </div>`;
    } else if (q.type === 'MTF' || q.type === 'DND') {
        let itemsToMatch = q.options || q.labels || [];
        let choices = q.labels || q.options || [];
        // If it's MTF and has 'a' as dict mapping
        if (typeof q.a === 'object' && !Array.isArray(q.a)) {
            itemsToMatch = Object.keys(q.a);
            // collect all possible answers
            choices = [...new Set(Object.values(q.a))];
            if (q.labels) choices = q.labels; // if provided
        }
        
        html += `<div style="display: flex; gap: 2rem;">`;
        
        // Left Column (Options)
        html += `<div style="flex: 1; display: flex; flex-direction: column; gap: 0.5rem;" id="dnd-source">`;
        choices.forEach((choice, idx) => {
            // Only show choices not already matched
            let isUsed = false;
            if (userAnswers[currentQuestionIndex]) {
                isUsed = Object.values(userAnswers[currentQuestionIndex]).includes(choice);
            }
            if (!isUsed) {
                const safeChoiceJS = choice.replace(/'/g, "\\'").replace(/"/g, "&quot;").replace(/\n/g, "\\n").replace(/\r/g, "\\r");
                html += `<div class="draggable option-btn" style="text-align: center; border-color: var(--primary);" draggable="true" ondragstart="dragStart(event, '${safeChoiceJS}')" id="drag-${idx}">${choice}</div>`;
            }
        });
        html += `</div>`;
        
        // Right Column (Targets)
        html += `<div style="flex: 2; display: flex; flex-direction: column; gap: 0.5rem;">`;
        itemsToMatch.forEach((item, i) => {
            const currentAns = (userAnswers[currentQuestionIndex] && userAnswers[currentQuestionIndex][item]) ? userAnswers[currentQuestionIndex][item] : '';
            
            const safeItemJS = item.replace(/'/g, "\\'").replace(/"/g, "&quot;").replace(/\n/g, "\\n").replace(/\r/g, "\\r");
            
            let dropContent = currentAns ? 
                `<div style="color: var(--primary); font-weight: bold;">${currentAns} <span style="cursor: pointer; color: var(--danger); margin-left: 10px;" onclick="clearMatchingAnswer(${currentQuestionIndex}, '${safeItemJS}')">✖</span></div>` 
                : `<div style="color: var(--text-muted); text-align: center; font-style: italic;">Drop here</div>`;
                
            html += `<div style="display: flex; align-items: center; gap: 1rem;">`;
            html += `<div style="flex: 1; padding: 1rem; background: var(--bg-card); border-radius: 4px;">${item}</div>`;
            html += `<div class="dropzone" style="flex: 1; border: 2px dashed var(--border); padding: 1rem; border-radius: 4px; display: flex; align-items: center; justify-content: center; min-height: 3rem; background: var(--bg-main);" ondragover="dragOver(event)" ondrop="drop(event, ${currentQuestionIndex}, '${safeItemJS}')">${dropContent}</div>`;
            html += `</div>`;
        });
        html += `</div>`;
        html += `</div>`;
    }
    
    questionContainer.innerHTML = html;
    updateAllTiles();
    
    if (lastRenderedQuestionIndex !== currentQuestionIndex) {
        const scrollContent = document.querySelector('.scrollable-content');
        if (scrollContent) scrollContent.scrollTop = 0;
        lastRenderedQuestionIndex = currentQuestionIndex;
    }
}

// Interaction Handlers (need to be attached to window for inline HTML handlers)
window.selectTFOption = function(qIndex, stmtIndex, value) {
    if (!userAnswers[qIndex] || typeof userAnswers[qIndex] !== 'object' || Array.isArray(userAnswers[qIndex])) {
        userAnswers[qIndex] = {};
    }
    userAnswers[qIndex][stmtIndex] = value;
    renderQuestion();
}

window.selectOption = function(qIndex, optIndex, type) {
    if (type === 'MCQ2') {
        if (!userAnswers[qIndex]) userAnswers[qIndex] = [];
        const pos = userAnswers[qIndex].indexOf(optIndex);
        if (pos === -1) {
            const q = questions[qIndex];
            let maxSel = 2; // Default
            if (Array.isArray(q.a)) {
                maxSel = q.a.length;
            } else if (q.q.toLowerCase().includes('choose 3') || q.q.toLowerCase().includes('select 3') || q.q.toLowerCase().includes('choose three')) {
                maxSel = 3;
            }
            
            if (userAnswers[qIndex].length < maxSel) {
                userAnswers[qIndex].push(optIndex);
            }
        } else {
            userAnswers[qIndex].splice(pos, 1);
        }
    } else {
        userAnswers[qIndex] = optIndex;
    }
    renderQuestion();
}

window.saveDropdownAnswer = function(qIndex, blankIndex, value) {
    if (!userAnswers[qIndex]) userAnswers[qIndex] = {};
    if (value === "-1") {
        delete userAnswers[qIndex][blankIndex];
    } else {
        userAnswers[qIndex][blankIndex] = value;
    }
    updateTile(qIndex);
}

window.saveShortAnswer = function(qIndex, value) {
    userAnswers[qIndex] = value.trim();
    if (userAnswers[qIndex] === '') delete userAnswers[qIndex];
    updateTile(qIndex);
}

window.saveMatchingAnswer = function(qIndex, item, value) {
    if (!userAnswers[qIndex]) userAnswers[qIndex] = {};
    userAnswers[qIndex][item] = value;
    renderQuestion();
}

window.dragStart = function(e, choice) {
    e.dataTransfer.setData('text/plain', choice);
}

window.dragOver = function(e) {
    e.preventDefault(); // allow drop
}

window.drop = function(e, qIndex, item) {
    e.preventDefault();
    const choice = e.dataTransfer.getData('text/plain');
    if (choice) {
        saveMatchingAnswer(qIndex, item, choice);
    }
}

window.clearMatchingAnswer = function(qIndex, item) {
    if (userAnswers[qIndex]) {
        delete userAnswers[qIndex][item];
    }
    renderQuestion();
}

// Tile Bar Logic
function initTileBar() {
    const tileBar = document.getElementById('tile-bar');
    tileBar.innerHTML = '';
    questions.forEach((_, idx) => {
        const tile = document.createElement('div');
        tile.className = 'q-tile';
        tile.innerText = idx + 1;
        tile.id = `tile-${idx}`;
        tile.onclick = () => {
            currentQuestionIndex = idx;
            renderQuestion();
        };
        tileBar.appendChild(tile);
    });
}

function checkIfAnswered(idx) {
    const q = questions[idx];
    const ua = userAnswers[idx];
    if (ua === undefined || ua === null || ua === '') return false;
    
    if (q.type === 'MCQ' || q.type === 'SHORT') {
        return true; 
    }
    if (q.type === 'MCQ2') {
        return Array.isArray(ua) && ua.length > 0;
    }
    if (q.type === 'TF' || q.type === 'DROPDOWN' || q.type === 'MTF' || q.type === 'DND') {
        return typeof ua === 'object' && Object.keys(ua).length > 0;
    }
    return false;
}

function updateAllTiles() {
    questions.forEach((_, idx) => updateTile(idx));
}

function updateTile(idx) {
    const tile = document.getElementById(`tile-${idx}`);
    if (!tile) return;
    
    const isCurrent = idx === currentQuestionIndex;
    const isReview = markedForReview[idx];
    const isAnswered = checkIfAnswered(idx);
    
    tile.className = 'q-tile';
    
    if (isAnswered) tile.classList.add('answered');
    if (isReview) tile.classList.add('review');
    if (isCurrent) tile.classList.add('current');
}


// Evaluation
async function evaluateQuiz(submissionType = 'Manual', remainingMs = 0) {
    localStorage.removeItem('pq_endTime'); // Clear timer state
    
    let score = 0;
    let reviewHtml = '';
    
    questions.forEach((q, idx) => {
        const ua = userAnswers[idx];
        const correct = q.a;
        
        let qStatus = 'Not Answered';
        let qPts = 0;
        let uaDisplay = 'Not Answered';
        let caDisplay = '';
        
        if (q.type === 'MCQ') {
            if (ua !== undefined) {
                if (ua === correct || (Array.isArray(correct) && correct[0] === ua)) {
                    qPts = 1;
                    qStatus = 'Correct';
                } else {
                    qStatus = 'Incorrect';
                }
                uaDisplay = (q.options && q.options[ua] !== undefined) ? q.options[ua] : String(ua);
            }
            caDisplay = Array.isArray(correct) ? (q.options ? q.options[correct[0]] : String(correct[0])) : (q.options ? q.options[correct] : String(correct));

        } else if (q.type === 'TF') {
            if (Array.isArray(correct)) {
                let pts = 0;
                let reviewLines = [];
                correct.forEach((ansText, i) => {
                    const stmtText = q.options ? q.options[i] : `Statement ${i+1}`;
                    const selAns = (ua && ua[i] !== undefined) ? ua[i] : null;
                    
                    const normSel = String(selAns).toUpperCase();
                    const normAns = String(ansText).toUpperCase();
                    
                    if (selAns !== null) {
                        if (normSel === normAns) {
                            pts += (1/correct.length);
                            reviewLines.push(`${stmtText}\n\nYour Answer:\n${selAns}\n\nCorrect Answer:\n${ansText}\n\nStatus:\n✅ Correct`);
                        } else {
                            reviewLines.push(`${stmtText}\n\nYour Answer:\n${selAns}\n\nCorrect Answer:\n${ansText}\n\nStatus:\n❌ Incorrect`);
                        }
                    } else {
                        reviewLines.push(`${stmtText}\n\nYour Answer:\nNot Answered\n\nCorrect Answer:\n${ansText}\n\nStatus:\nNot Answered`);
                    }
                });
                
                qPts = pts;
                if (pts === 1) qStatus = 'Correct';
                else if (pts > 0) qStatus = 'Incorrect'; 
                else qStatus = 'Incorrect';
                
                uaDisplay = reviewLines.join('\n\n------------------------------------------------\n\n');
            } else {
                // Fallback for single TF
                 const normSel = String(ua).toUpperCase();
                 const normAns = String(correct).toUpperCase();
                 if (ua !== undefined && normSel === normAns) {
                     qPts = 1;
                     qStatus = 'Correct';
                 } else if (ua !== undefined) {
                     qStatus = 'Incorrect';
                 }
                 uaDisplay = String(ua);
                 caDisplay = String(correct);
            }

        } else if (q.type === 'MCQ2') {
            if (ua && Array.isArray(correct)) {
                let pts = 0;
                ua.forEach(ans => { if (correct.includes(ans)) pts += (1/correct.length); });
                qPts = pts;
                if (pts === 1) qStatus = 'Correct';
                else if (pts > 0) qStatus = 'Incorrect'; // Partial credit not fully correct
                else qStatus = 'Incorrect';
                
                uaDisplay = ua.map(a => q.options[a]).join(', ');
            } else if (ua !== undefined && ua.length > 0) {
                 qStatus = 'Incorrect';
                 uaDisplay = ua.map(a => q.options[a]).join(', ');
            }
            caDisplay = Array.isArray(correct) ? correct.map(a => q.options[a]).join(', ') : String(correct);

        } else if (q.type === 'DROPDOWN') {
            if (ua && Array.isArray(correct)) {
                let pts = 0;
                let uaArr = [];
                correct.forEach((ansText, i) => {
                    const selIdx = ua[i];
                    if (selIdx !== undefined && selIdx !== "-1") {
                        const selText = q.options[i][selIdx];
                        uaArr.push(`Blank ${i+1}: ${selText}`);
                        if (selText === ansText) pts += (1/correct.length);
                    } else {
                        uaArr.push(`Blank ${i+1}: Not Answered`);
                    }
                });
                qPts = pts;
                if (pts === 1) qStatus = 'Correct';
                else if (pts > 0) qStatus = 'Incorrect'; 
                else qStatus = 'Incorrect';
                
                if (Object.keys(ua).length > 0) uaDisplay = uaArr.join('\n');
            }
            caDisplay = Array.isArray(correct) ? correct.map((c, i) => `Blank ${i+1}: ${c}`).join('\n') : String(correct);

        } else if (q.type === 'SHORT') {
            if (ua) {
                if (ua.toLowerCase() == String(correct).toLowerCase()) {
                    qPts = 1;
                    qStatus = 'Correct';
                } else {
                    qStatus = 'Incorrect';
                }
                uaDisplay = ua;
            }
            caDisplay = String(correct);

        } else if (q.type === 'MTF' || q.type === 'DND') {
            if (ua && typeof correct === 'object') {
                let pts = 0;
                let uaArr = [];
                let caArr = [];
                const keys = Object.keys(correct);
                keys.forEach(k => {
                    const userVal = ua[k];
                    if (userVal) {
                        uaArr.push(`${k} → ${userVal}`);
                        if (userVal === correct[k]) pts += (1/keys.length);
                    } else {
                        uaArr.push(`${k} → Not Answered`);
                    }
                    caArr.push(`${k} → ${correct[k]}`);
                });
                qPts = pts;
                if (pts === 1) qStatus = 'Correct';
                else if (pts > 0) qStatus = 'Incorrect';
                else qStatus = 'Incorrect';
                
                if (Object.keys(ua).length > 0) uaDisplay = uaArr.join('\n');
                caDisplay = caArr.join('\n');
            } else if (ua && Array.isArray(correct)) {
                 caDisplay = correct.join('\n');
                 // For DND array format... fallback
                 uaDisplay = JSON.stringify(ua);
                 qStatus = 'Incorrect';
            } else {
                 caDisplay = typeof correct === 'object' && !Array.isArray(correct) ? Object.keys(correct).map(k => `${k} → ${correct[k]}`).join('\n') : String(correct);
            }
        }
        
        // Ensure qStatus is accurate for totally empty answers
        if (q.type !== 'TF' && (ua === undefined || ua === null || ua === '') && (typeof ua !== 'object' || Object.keys(ua || {}).length === 0) && (!Array.isArray(ua) || ua.length === 0)) {
            qStatus = 'Not Answered';
            uaDisplay = 'Not Answered';
        }
        
        score += qPts;
        
        // Build HTML for Review
        let statusClass = qStatus === 'Correct' ? 'correct' : (qStatus === 'Incorrect' ? 'incorrect' : 'unanswered');
        
        if (q.type === 'TF' && Array.isArray(correct)) {
            // TF Multiple Statements format
            reviewHtml += `
                <div class="review-item">
                    <div class="review-question-num">Question ${idx + 1}</div>
                    <div class="review-question-text">${q.q}</div>
                    <div class="review-answers">
                        <div class="review-answer-value">${uaDisplay}</div>
                    </div>
                </div>
            `;
        } else {
            // Standard format
            reviewHtml += `
                <div class="review-item">
                    <div class="review-question-num">Question ${idx + 1}</div>
                    <div class="review-question-text">${q.q}</div>
                    <div class="review-answers">
                        <div class="review-answer-block">
                            <div class="review-answer-label">Your Answer:</div>
                            <div class="review-answer-value">${uaDisplay}</div>
                        </div>
                        <div class="review-answer-block">
                            <div class="review-answer-label">Correct Answer:</div>
                            <div class="review-answer-value">${caDisplay}</div>
                        </div>
                        <div class="review-answer-block">
                            <div class="review-answer-label">Status:</div>
                            <div class="review-status ${statusClass}">${qStatus}</div>
                        </div>
                    </div>
                </div>
            `;
        }
    });

    score = Math.round(score * 100) / 100; // Round to 2 decimals
    const total = questions.length;
    const percentage = Math.round((score / total) * 100);
    const correctCount = Math.floor(score);
    const incorrectCount = total - correctCount;
    const evaluation = percentage >= 70 ? 'Passed' : 'Failed';

    // Calculate questions attempted
    let attempted = 0;
    questions.forEach((q, idx) => {
        const ua = userAnswers[idx];
        if (q.type !== 'TF' && ua !== undefined && ua !== null && ua !== '' && (typeof ua !== 'object' || Object.keys(ua).length > 0) && (!Array.isArray(ua) || ua.length > 0)) {
            attempted++;
        } else if (q.type === 'TF' && ua && Object.keys(ua).length > 0) {
            attempted++;
        }
    });

    // Time calculations
    const takenMs = TIME_ALLOWED_MS - remainingMs;
    const timeAllowedStr = '50:00';
    const timeTakenStr = formatTime(takenMs);
    const timeRemainingStr = formatTime(remainingMs);

    // Show Results
    document.getElementById('res-score').innerText = `${score} / ${total}`;
    document.getElementById('res-percentage').innerText = `${percentage}%`;
    document.getElementById('res-correct').innerText = correctCount;
    document.getElementById('res-incorrect').innerText = incorrectCount;
    
    document.getElementById('res-time-allowed').innerText = timeAllowedStr;
    document.getElementById('res-time-taken').innerText = timeTakenStr;
    document.getElementById('res-time-remaining').innerText = timeRemainingStr;
    document.getElementById('res-submission-type').innerText = submissionType;
    
    const evalEl = document.getElementById('res-evaluation');
    evalEl.innerText = evaluation;
    evalEl.className = 'stat-value ' + (evaluation === 'Passed' ? 'passed' : 'failed');

    document.getElementById('answer-review-list').innerHTML = reviewHtml;

    showPage('results');
    
    // Save to Backend
    await saveAttempt(userName, attempted, total, correctCount, incorrectCount, score, percentage, evaluation, timeAllowedStr, timeTakenStr, timeRemainingStr, submissionType);
}

async function saveAttempt(user, attempted, total, correct, incorrect, score, percentage, evaluation, tAllowed, tTaken, tRemaining, subType) {
    const data = {
        attempt_id: attemptId,
        user_id: userId,
        questions_attempted: attempted,
        total_questions: total,
        correct_answers: correct,
        incorrect_answers: incorrect,
        score: score,
        percentage: percentage,
        evaluation: evaluation,
        time_taken: tTaken,
        time_remaining: tRemaining,
        submission_type: subType
    };
    
    try {
        const res = await fetch(`${API_BASE_URL}/finish-quiz`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (res.ok) {
            const resData = await res.json();
            const realAttemptNum = resData.attempt ? resData.attempt.attempt_number : attemptNumber;
            document.getElementById('result-user-name').innerText = `${userName} - Attempt ${realAttemptNum}`;
            document.getElementById('res-attempt-num').innerText = realAttemptNum;
            showToast("Result saved successfully to database!");
            localStorage.removeItem('pq_attemptid');
        } else {
            const errData = await res.json();
            showToast(`Error saving: ${errData.error}`, true);
        }
    } catch (err) {
        console.error(err);
        showToast("Error connecting to backend.", true);
        document.getElementById('result-user-name').innerText = `${userName} - Attempt (Offline)`;
    }
}

// Start
init();
