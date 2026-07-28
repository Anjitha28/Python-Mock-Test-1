// Using built-in fetch

async function testLifecycle() {
    try {
        console.log("--- 1. Testing /api/login ---");
        const loginRes = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ user_name: 'TestUser123' })
        });
        const loginData = await loginRes.json();
        console.log("Login Response:", loginData);
        
        const userId = loginData.user.id;
        
        console.log("\n--- 2. Testing /api/start-quiz ---");
        const startRes = await fetch('http://localhost:3000/api/start-quiz', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ user_id: userId, user_name: 'TestUser123', test_name: 'Python Mastery - Mock Test 1' })
        });
        const startData = await startRes.json();
        console.log("Start Response:", startData);
        
        const attemptId = startData.attempt.id;
        
        console.log("\n--- 3. Testing /api/finish-quiz ---");
        const finishRes = await fetch('http://localhost:3000/api/finish-quiz', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                attempt_id: attemptId,
                user_id: userId,
                questions_attempted: 5,
                total_questions: 40,
                correct_answers: 3,
                incorrect_answers: 2,
                score: 3,
                percentage: 7.5,
                evaluation: 'Failed',
                time_taken: '05:00',
                time_remaining: '45:00',
                submission_type: 'Manual'
            })
        });
        const finishData = await finishRes.json();
        console.log("Finish Response:", finishData);
        
    } catch (e) {
        console.error("Test error:", e);
    }
}

testLifecycle();
