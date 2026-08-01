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

// Helper: Escape HTML
function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Helper: Check if an answer is genuinely given
function isAnswerGiven(q, ua) {
    if (ua === undefined || ua === null || ua === '') return false;
    
    if (q.type === 'MCQ') {
        return typeof ua === 'number' || (typeof ua === 'string' && ua.trim() !== '');
    }
    
    if (q.type === 'MCQ2') {
        return Array.isArray(ua) && ua.length > 0;
    }
    
    if (q.type === 'SHORT') {
        return String(ua).trim().length > 0;
    }
    
    if (q.type === 'TF') {
        if (typeof ua !== 'object') return false;
        return Object.values(ua).some(val => val !== undefined && val !== null && val !== '');
    }
    
    if (q.type === 'DROPDOWN') {
        if (typeof ua !== 'object') return false;
        return Object.values(ua).some(val => val !== undefined && val !== null && val !== -1 && val !== "-1" && val !== "");
    }
    
    if (q.type === 'DND' || q.type === 'MTF') {
        if (typeof ua !== 'object') return false;
        return Object.values(ua).some(val => val !== undefined && val !== null && val !== "");
    }
    
    return false;
}

// Helper: Sync current input elements before switching questions or submitting
function syncCurrentQuestionInput() {
    if (currentQuestionIndex < 0 || !questions[currentQuestionIndex]) return;
    const q = questions[currentQuestionIndex];
    
    if (q.type === 'SHORT') {
        const input = document.querySelector('#question-container input[type="text"]');
        if (input) {
            const val = input.value.trim();
            if (val !== '') {
                userAnswers[currentQuestionIndex] = val;
            } else {
                delete userAnswers[currentQuestionIndex];
            }
        }
    } else if (q.type === 'DROPDOWN') {
        const selects = document.querySelectorAll('#question-container select.dropdown-blank');
        selects.forEach(select => {
            const blankIdx = parseInt(select.getAttribute('data-blank'), 10);
            const val = select.value;
            if (!userAnswers[currentQuestionIndex]) userAnswers[currentQuestionIndex] = {};
            if (val !== "-1") {
                userAnswers[currentQuestionIndex][blankIdx] = parseInt(val, 10);
            } else {
                delete userAnswers[currentQuestionIndex][blankIdx];
            }
        });
    }
}

// Initialization
async function init() {
    try {
        questions = typeof mockTest1Data !== 'undefined' ? mockTest1Data : [];
        if (questions.length === 0) {
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
        displayName.innerText = userName;
        showPage('selection');
        
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
    
    startTimer();
    renderQuestion();
    showPage('quiz');
    
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
    syncCurrentQuestionInput();
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuestion();
    }
});

nextBtn.addEventListener('click', () => {
    syncCurrentQuestionInput();
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        renderQuestion();
    }
});

submitBtn.addEventListener('click', () => {
    syncCurrentQuestionInput();
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
    
    let endTime = parseInt(localStorage.getItem('pq_endTime'), 10);
    if (!endTime || endTime <= Date.now()) {
        endTime = Date.now() + TIME_ALLOWED_MS;
        localStorage.setItem('pq_endTime', endTime);
    }
    
    updateTimerDisplay();
    timerInterval = setInterval(updateTimerDisplay, 1000);
}

function updateTimerDisplay() {
    const endTime = parseInt(localStorage.getItem('pq_endTime'), 10);
    if (!endTime) return;
    
    const remainingMs = Math.max(0, endTime - Date.now());
    document.getElementById('quiz-timer').innerText = formatTime(remainingMs);
    
    if (remainingMs <= 0) {
        clearInterval(timerInterval);
        syncCurrentQuestionInput();
        evaluateQuiz('Auto (Time Expired)', 0);
    }
}

// Render Quiz Question
function renderQuestion() {
    const q = questions[currentQuestionIndex];
    currentQSpan.innerText = currentQuestionIndex + 1;
    
    prevBtn.disabled = currentQuestionIndex === 0;
    
    if (currentQuestionIndex === questions.length - 1) {
        nextBtn.classList.add('hidden');
        submitBtn.classList.remove('hidden');
    } else {
        nextBtn.classList.remove('hidden');
        submitBtn.classList.add('hidden');
    }
    
    if (markedForReview[currentQuestionIndex]) {
        markReviewBtn.classList.add('marked');
        markText.innerText = 'Marked for Review';
    } else {
        markReviewBtn.classList.remove('marked');
        markText.innerText = 'Mark for Review';
    }
    
    let html = `<div class="question-text">${q.q}</div>`;
    
    // Code snippet & interactive elements rendering
    if (q.code) {
        let codeHtml = escapeHtml(q.code);
        
        if (q.type === 'DROPDOWN' && q.options) {
            q.options.forEach((opts, i) => {
                let selectHtml = `<select data-blank="${i}" class="dropdown-blank" onchange="saveDropdownAnswer(${currentQuestionIndex}, ${i}, this.value)" oninput="saveDropdownAnswer(${currentQuestionIndex}, ${i}, this.value)">`;
                selectHtml += `<option value="-1">-- Select --</option>`;
                opts.forEach((opt, optIdx) => {
                    let isSelected = (userAnswers[currentQuestionIndex] && userAnswers[currentQuestionIndex][i] == optIdx) ? 'selected' : '';
                    selectHtml += `<option value="${optIdx}" ${isSelected}>${escapeHtml(opt)}</option>`;
                });
                selectHtml += `</select>`;
                codeHtml = codeHtml.replace(`[b${i+1}]`, selectHtml);
            });
            html += `<pre><code>${codeHtml}</code></pre>`;
            
        } else if (q.type === 'DND' && q.code.includes('[target')) {
            // DND with code targets (Q7, Q14)
            const targetMatches = q.code.match(/\[target\d+\]/g) || [];
            targetMatches.forEach((targetTag, i) => {
                const currentAns = (userAnswers[currentQuestionIndex] && userAnswers[currentQuestionIndex][i]) ? userAnswers[currentQuestionIndex][i] : '';
                const filledClass = currentAns ? 'filled' : '';
                
                const dropzoneHtml = `<span class="code-dropzone ${filledClass}" ondragover="dragOver(event)" ondrop="dropCodeTarget(event, ${currentQuestionIndex}, ${i})" onclick="clickTargetSlot(${currentQuestionIndex}, ${i})">${currentAns ? `${escapeHtml(currentAns)} <span class="code-dropzone-remove" onclick="clearCodeTarget(event, ${currentQuestionIndex}, ${i})">✖</span>` : `Target ${i + 1}`}</span>`;
                codeHtml = codeHtml.replace(targetTag, dropzoneHtml);
            });
            
            html += `<pre><code>${codeHtml}</code></pre>`;
            
            // Available choice pills below code
            html += `<div style="margin-top: 1rem;">`;
            html += `<div style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 0.5rem; font-weight: 600;">Drag or click a choice to place in next open target:</div>`;
            html += `<div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">`;
            
            q.options.forEach((choice, idx) => {
                let isUsed = false;
                if (userAnswers[currentQuestionIndex]) {
                    isUsed = Object.values(userAnswers[currentQuestionIndex]).includes(choice);
                }
                if (!isUsed) {
                    const safeChoiceJS = choice.replace(/'/g, "\\'").replace(/"/g, "&quot;").replace(/\n/g, "\\n").replace(/\r/g, "\\r");
                    html += `<div class="draggable option-btn" style="padding: 0.5rem 1rem; border-color: var(--primary); margin: 0; white-space: pre-wrap;" draggable="true" ondragstart="dragStart(event, '${safeChoiceJS}')" onclick="placeChoiceInFirstAvailableTarget(${currentQuestionIndex}, '${safeChoiceJS}')">${escapeHtml(choice)}</div>`;
                }
            });
            html += `</div></div>`;
            
        } else {
            html += `<pre><code>${codeHtml}</code></pre>`;
        }
    }
    
    // Question option controls
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
            let maxSel = 2;
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
                const optLetter = String.fromCharCode(65 + idx);
                
                html += `<div class="option-btn ${selectedClass} ${disabledClass}" onclick="${disabledClass ? '' : `selectOption(${currentQuestionIndex}, ${idx}, '${q.type}')`}"><strong style="color: var(--primary); margin-right: 8px;">Option ${optLetter}:</strong> ${opt}</div>`;
            });
        }
        html += `</div>`;
    } else if (q.type === 'SHORT') {
        const val = userAnswers[currentQuestionIndex] !== undefined ? userAnswers[currentQuestionIndex] : '';
        html += `<div class="input-group">
            <input type="text" value="${escapeHtml(val)}" oninput="saveShortAnswer(${currentQuestionIndex}, this.value)" onchange="saveShortAnswer(${currentQuestionIndex}, this.value)" placeholder="Type your answer here">
        </div>`;
    } else if (q.type === 'MTF' || (q.type === 'DND' && !q.code)) {
        let itemsToMatch = q.options || q.labels || [];
        let choices = q.labels || q.options || [];
        if (typeof q.a === 'object' && !Array.isArray(q.a)) {
            itemsToMatch = Object.keys(q.a);
            choices = q.labels || [...new Set(Object.values(q.a))];
        }
        
        html += `<div style="display: flex; gap: 2rem;">`;
        
        // Left Column (Options)
        html += `<div style="flex: 1; display: flex; flex-direction: column; gap: 0.5rem;" id="dnd-source">`;
        choices.forEach((choice, idx) => {
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
                `<div style="color: var(--primary); font-weight: bold;">${escapeHtml(currentAns)} <span style="cursor: pointer; color: var(--danger); margin-left: 10px;" onclick="clearMatchingAnswer(${currentQuestionIndex}, '${safeItemJS}')">✖</span></div>` 
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

// Interaction Handlers (Window Scope)
window.selectTFOption = function(qIndex, stmtIndex, value) {
    if (!userAnswers[qIndex] || typeof userAnswers[qIndex] !== 'object' || Array.isArray(userAnswers[qIndex])) {
        userAnswers[qIndex] = {};
    }
    userAnswers[qIndex][stmtIndex] = value;
    renderQuestion();
};

window.selectOption = function(qIndex, optIndex, type) {
    if (type === 'MCQ2') {
        if (!userAnswers[qIndex] || !Array.isArray(userAnswers[qIndex])) userAnswers[qIndex] = [];
        const pos = userAnswers[qIndex].indexOf(optIndex);
        if (pos === -1) {
            const q = questions[qIndex];
            let maxSel = 2;
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
};

window.saveDropdownAnswer = function(qIndex, blankIndex, value) {
    if (!userAnswers[qIndex] || typeof userAnswers[qIndex] !== 'object') userAnswers[qIndex] = {};
    if (value === "-1") {
        delete userAnswers[qIndex][blankIndex];
    } else {
        userAnswers[qIndex][blankIndex] = parseInt(value, 10);
    }
    updateTile(qIndex);
};

window.saveShortAnswer = function(qIndex, value) {
    const trimmed = value.trim();
    if (trimmed === '') {
        delete userAnswers[qIndex];
    } else {
        userAnswers[qIndex] = value;
    }
    updateTile(qIndex);
};

window.saveMatchingAnswer = function(qIndex, item, value) {
    if (!userAnswers[qIndex] || typeof userAnswers[qIndex] !== 'object') userAnswers[qIndex] = {};
    userAnswers[qIndex][item] = value;
    renderQuestion();
};

window.dragStart = function(e, choice) {
    e.dataTransfer.setData('text/plain', choice);
};

window.dragOver = function(e) {
    e.preventDefault();
};

window.drop = function(e, qIndex, item) {
    e.preventDefault();
    const choice = e.dataTransfer.getData('text/plain');
    if (choice) {
        saveMatchingAnswer(qIndex, item, choice);
    }
};

window.clearMatchingAnswer = function(qIndex, item) {
    if (userAnswers[qIndex]) {
        delete userAnswers[qIndex][item];
    }
    renderQuestion();
};

// DND Code Target Handlers
window.dropCodeTarget = function(e, qIndex, targetIdx) {
    e.preventDefault();
    const choice = e.dataTransfer.getData('text/plain');
    if (choice) {
        if (!userAnswers[qIndex] || typeof userAnswers[qIndex] !== 'object') userAnswers[qIndex] = {};
        userAnswers[qIndex][targetIdx] = choice;
        renderQuestion();
    }
};

window.clickTargetSlot = function(qIndex, targetIdx) {
    // If target is clicked without action, focus
};

window.clearCodeTarget = function(e, qIndex, targetIdx) {
    e.stopPropagation();
    if (userAnswers[qIndex] && typeof userAnswers[qIndex] === 'object') {
        delete userAnswers[qIndex][targetIdx];
    }
    renderQuestion();
};

window.placeChoiceInFirstAvailableTarget = function(qIndex, choice) {
    const q = questions[qIndex];
    const targetMatches = (q.code.match(/\[target\d+\]/g) || []);
    if (!userAnswers[qIndex] || typeof userAnswers[qIndex] !== 'object') userAnswers[qIndex] = {};
    
    for (let i = 0; i < targetMatches.length; i++) {
        if (!userAnswers[qIndex][i]) {
            userAnswers[qIndex][i] = choice;
            renderQuestion();
            break;
        }
    }
};

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
            syncCurrentQuestionInput();
            currentQuestionIndex = idx;
            renderQuestion();
        };
        tileBar.appendChild(tile);
    });
}

function checkIfAnswered(idx) {
    return isAnswerGiven(questions[idx], userAnswers[idx]);
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

// Evaluation & Answer Review Generation
async function evaluateQuiz(submissionType = 'Manual', remainingMs = 0) {
    localStorage.removeItem('pq_endTime');
    
    let score = 0;
    let reviewHtml = '';
    
    questions.forEach((q, idx) => {
        const ua = userAnswers[idx];
        const answered = isAnswerGiven(q, ua);
        const correct = q.a;
        
        let qStatus = 'Not Answered';
        let qPts = 0;
        let uaFormatted = 'Not Answered';
        let caFormatted = '';
        
        if (q.type === 'MCQ') {
            const cIdx = Array.isArray(correct) ? correct[0] : correct;
            caFormatted = (q.options && q.options[cIdx] !== undefined)
                ? `Option ${String.fromCharCode(65 + cIdx)} — ${escapeHtml(q.options[cIdx])}`
                : String(cIdx);
                
            if (answered) {
                const userChoiceIdx = Number(ua);
                if (userChoiceIdx === cIdx) {
                    qPts = 1;
                    qStatus = 'Correct';
                } else {
                    qStatus = 'Incorrect';
                }
                uaFormatted = (q.options && q.options[userChoiceIdx] !== undefined)
                    ? `Option ${String.fromCharCode(65 + userChoiceIdx)} — ${escapeHtml(q.options[userChoiceIdx])}`
                    : String(ua);
            }

        } else if (q.type === 'MCQ2') {
            const cArr = Array.isArray(correct) ? correct : [correct];
            caFormatted = `<ul class="review-list">${cArr.map(i => `<li class="review-list-item">Option ${String.fromCharCode(65 + i)} — ${escapeHtml(q.options[i])}</li>`).join('')}</ul>`;
            
            if (answered && Array.isArray(ua)) {
                let matchCount = 0;
                ua.forEach(ans => { if (cArr.includes(ans)) matchCount++; });
                
                if (matchCount === cArr.length && ua.length === cArr.length) {
                    qPts = 1;
                    qStatus = 'Correct';
                } else {
                    qPts = matchCount > 0 ? (matchCount / cArr.length) : 0;
                    qStatus = 'Incorrect';
                }
                
                uaFormatted = `<ul class="review-list">${ua.map(i => `<li class="review-list-item">Option ${String.fromCharCode(65 + i)} — ${escapeHtml(q.options[i])}</li>`).join('')}</ul>`;
            }

        } else if (q.type === 'TF') {
            const cArr = Array.isArray(correct) ? correct : [correct];
            let pts = 0;
            
            caFormatted = `<ul class="review-list">${(q.options || cArr).map((stmt, i) => {
                const ansStr = String(cArr[i]).toUpperCase();
                return `<li class="review-list-item"><strong>Statement ${i+1}:</strong> ${escapeHtml(stmt)}<br>&nbsp;&nbsp;&nbsp;&nbsp;<em>Correct Answer:</em> ${escapeHtml(ansStr)}</li>`;
            }).join('')}</ul>`;
            
            if (answered) {
                let userLines = [];
                (q.options || cArr).forEach((stmt, i) => {
                    const selVal = (ua && ua[i] !== undefined && ua[i] !== null) ? String(ua[i]).toUpperCase() : null;
                    const ansVal = String(cArr[i]).toUpperCase();
                    
                    if (selVal !== null) {
                        if (selVal === ansVal) {
                            pts += (1 / cArr.length);
                        }
                        userLines.push(`<li class="review-list-item"><strong>Statement ${i+1}:</strong> ${escapeHtml(stmt)}<br>&nbsp;&nbsp;&nbsp;&nbsp;<em>Your Choice:</em> ${escapeHtml(selVal)}</li>`);
                    } else {
                        userLines.push(`<li class="review-list-item"><strong>Statement ${i+1}:</strong> ${escapeHtml(stmt)}<br>&nbsp;&nbsp;&nbsp;&nbsp;<em>Your Choice:</em> Not Answered</li>`);
                    }
                });
                
                qPts = pts;
                if (pts === 1) qStatus = 'Correct';
                else qStatus = 'Incorrect';
                
                uaFormatted = `<ul class="review-list">${userLines.join('')}</ul>`;
            }

        } else if (q.type === 'DROPDOWN') {
            const cArr = Array.isArray(correct) ? correct : [correct];
            
            caFormatted = `<ul class="review-list">${cArr.map((c, i) => `<li class="review-list-item"><strong>Dropdown ${i+1} ([b${i+1}]):</strong> ${escapeHtml(c)}</li>`).join('')}</ul>`;
            
            if (answered) {
                let pts = 0;
                let userLines = [];
                
                cArr.forEach((ansText, i) => {
                    const selIdx = ua ? ua[i] : undefined;
                    if (selIdx !== undefined && selIdx !== null && selIdx !== -1 && selIdx !== "-1" && q.options[i] && q.options[i][selIdx] !== undefined) {
                        const selText = q.options[i][selIdx];
                        userLines.push(`<li class="review-list-item"><strong>Dropdown ${i+1} ([b${i+1}]):</strong> ${escapeHtml(selText)}</li>`);
                        if (selText === ansText) pts += (1 / cArr.length);
                    } else {
                        userLines.push(`<li class="review-list-item"><strong>Dropdown ${i+1} ([b${i+1}]):</strong> Not Answered</li>`);
                    }
                });
                
                qPts = pts;
                if (pts === 1) qStatus = 'Correct';
                else qStatus = 'Incorrect';
                
                uaFormatted = `<ul class="review-list">${userLines.join('')}</ul>`;
            }

        } else if (q.type === 'DND') {
            const cArr = Array.isArray(correct) ? correct : [correct];
            
            caFormatted = `<ul class="review-list">${cArr.map((c, i) => `<li class="review-list-item"><strong>Target ${i+1} ([target${i+1}]):</strong> ${escapeHtml(c)}</li>`).join('')}</ul>`;
            
            if (answered) {
                let pts = 0;
                let userLines = [];
                
                cArr.forEach((ansText, i) => {
                    const userVal = ua ? ua[i] : undefined;
                    if (userVal) {
                        userLines.push(`<li class="review-list-item"><strong>Target ${i+1} ([target${i+1}]):</strong> ${escapeHtml(userVal)}</li>`);
                        if (userVal === ansText) pts += (1 / cArr.length);
                    } else {
                        userLines.push(`<li class="review-list-item"><strong>Target ${i+1} ([target${i+1}]):</strong> Not Answered</li>`);
                    }
                });
                
                qPts = pts;
                if (pts === 1) qStatus = 'Correct';
                else qStatus = 'Incorrect';
                
                uaFormatted = `<ul class="review-list">${userLines.join('')}</ul>`;
            }

        } else if (q.type === 'MTF') {
            const cObj = (typeof correct === 'object' && !Array.isArray(correct)) ? correct : {};
            const keys = Object.keys(cObj);
            
            caFormatted = `<ul class="review-list">${keys.map(k => `<li class="review-list-item"><strong>${escapeHtml(k)}</strong> &rarr; ${escapeHtml(cObj[k])}</li>`).join('')}</ul>`;
            
            if (answered) {
                let pts = 0;
                let userLines = [];
                
                keys.forEach(k => {
                    const userVal = ua ? ua[k] : undefined;
                    if (userVal) {
                        userLines.push(`<li class="review-list-item"><strong>${escapeHtml(k)}</strong> &rarr; ${escapeHtml(userVal)}</li>`);
                        if (userVal === cObj[k]) pts += (1 / keys.length);
                    } else {
                        userLines.push(`<li class="review-list-item"><strong>${escapeHtml(k)}</strong> &rarr; Not Answered</li>`);
                    }
                });
                
                qPts = pts;
                if (pts === 1) qStatus = 'Correct';
                else qStatus = 'Incorrect';
                
                uaFormatted = `<ul class="review-list">${userLines.join('')}</ul>`;
            }

        } else if (q.type === 'SHORT') {
            caFormatted = `<code>${escapeHtml(String(correct))}</code>`;
            
            if (answered) {
                const normUser = String(ua).trim().toLowerCase();
                const normAns = String(correct).trim().toLowerCase();
                
                if (normUser === normAns) {
                    qPts = 1;
                    qStatus = 'Correct';
                } else {
                    qStatus = 'Incorrect';
                }
                uaFormatted = `<code>${escapeHtml(String(ua))}</code>`;
            }
        }
        
        if (!answered) {
            qStatus = 'Not Answered';
            uaFormatted = 'Not Answered';
            qPts = 0;
        }
        
        score += qPts;
        
        const statusClass = qStatus === 'Correct' ? 'correct' : (qStatus === 'Incorrect' ? 'incorrect' : 'unanswered');
        
        reviewHtml += `
            <div class="review-item">
                <div class="review-header">
                    <span class="review-question-num">Question ${idx + 1}</span>
                    <span class="review-status ${statusClass}">${qStatus}</span>
                </div>
                
                <div class="review-question-text">${q.q}</div>
                
                ${q.code ? `<div class="review-code-block"><pre><code>${escapeHtml(q.code)}</code></pre></div>` : ''}
                
                ${q.image ? `<div style="margin-bottom: 1rem;"><img src="${q.image}" style="max-width: 100%; border-radius: 4px;"></div>` : ''}
                
                <div class="review-answers">
                    <div class="review-answer-block">
                        <div class="review-answer-label">Your Answer:</div>
                        <div class="review-answer-value ${!answered ? 'unanswered-text' : ''}">${uaFormatted}</div>
                    </div>
                    <div class="review-answer-block">
                        <div class="review-answer-label">Correct Answer:</div>
                        <div class="review-answer-value">${caFormatted}</div>
                    </div>
                    <div class="review-answer-block">
                        <div class="review-answer-label">Result:</div>
                        <div class="review-status ${statusClass}">${qStatus}</div>
                    </div>
                </div>
            </div>
        `;
    });

    score = Math.round(score * 100) / 100;
    const total = questions.length;
    const percentage = Math.round((score / total) * 100);
    const correctCount = Math.floor(score);
    const incorrectCount = total - correctCount;
    const evaluation = percentage >= 70 ? 'Passed' : 'Failed';

    let attempted = 0;
    questions.forEach((q, idx) => {
        if (isAnswerGiven(q, userAnswers[idx])) {
            attempted++;
        }
    });

    const takenMs = TIME_ALLOWED_MS - remainingMs;
    const timeAllowedStr = '50:00';
    const timeTakenStr = formatTime(takenMs);
    const timeRemainingStr = formatTime(remainingMs);

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
    
    await saveAttempt(userName, attempted, total, correctCount, incorrectCount, score, percentage, evaluation, timeAllowedStr, timeTakenStr, timeRemainingStr, submissionType);
}

async function saveAttempt(user, attempted, total, correct, incorrect, score, percentage, evaluation, tAllowed, tTaken, tRemaining, subType) {
    const data = {
        attempt_id: attemptId,
        user_id: userId,
        user_name: userName,
        test_name: 'Python Mastery - Mock Test 1',
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

// Start Application
init();
