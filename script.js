const API_KEY="AIzaSyDZwNV75iUQtjPh80tMnNXj0ZZoSlIMCGE";

// Get references to our HTML elements
const explainButton = document.getElementById('explainButton');
const inputText = document.getElementById('inputText');
const questionInput = document.getElementById('questionInput');
const outputContent = document.getElementById('outputContent');

// Add an event listener to the button so something happens when it's clicked
explainButton.addEventListener('click', async () => {
    const text = inputText.value.trim(); // Get the text from the main input
    const question = questionInput.value.trim(); // Get the question (if any)

    // Basic validation: make sure there's some text to explain
    if (!text) {
        outputContent.innerHTML = "<p style='color: red;'>Please paste some text to explain!</p>";
        return; // Stop the function here if no text
    }

    // Show a loading message and disable the button to prevent multiple clicks
    outputContent.innerHTML = "<p>Thinking... Please wait.</p>";
    explainButton.disabled = true;

    // Construct the prompt that we will send to the AI
    let prompt = `You are a helpful AI assistant specialized in simplifying technical documentation and explaining complex concepts for beginners and  tech fellows.

    Given the following technical text:
    "${text}"

    `;

    // If the user also asked a question, add it to the prompt
    if (question) {
        prompt += `Answer this specific question based on the text provided: "${question}"
        If the question cannot be answered from the provided text, state that you cannot answer it from the provided text.
        Provide your answer clearly and concisely.
        `;
    } else {
        // If no question, ask for a summary and jargon explanation
        prompt += `Please provide a simplified summary of the text.
        Also, identify and clearly explain any technical jargon or complex concepts in simple terms.
        Structure your response with clear headings or bullet points for readability.`;
    }

    try {
        // Make the API call to Google Gemini
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST', // We are sending data, so it's a POST request
            headers: {
                'Content-Type': 'application/json', // We are sending JSON data
            },
            body: JSON.stringify({ // Convert our JavaScript object to a JSON string
                contents: [{
                    parts: [{ text: prompt }] // This is the actual prompt text
                }]
            })
        });

        // Line 61: Check if the API call was unsuccessful (status code 4xx or 5xx)
        // CRITICAL FIX: Changed 'response' to 'geminiRes'
        if (!geminiRes.ok) {
            // Read the response body as plain text first.
            const rawErrorText = await geminiRes.text();
          
            let errorMessage = `API Request failed with status ${geminiRes.status}.`;
            let details = '';

            // Try to parse the text as JSON, in case it's a valid JSON error object
            try {
                const errorData = JSON.parse(rawErrorText);
                // Check for the standard Google API error structure
                if (errorData.error && errorData.error.message) {
                    details = errorData.error.message;
                } else {
                    // Use the entire parsed object if structure is unexpected
                    details = JSON.stringify(errorData);
                }
                errorMessage = `Error ${geminiRes.status}: ${details}`;
            } catch (e) {
                // If JSON parsing fails (for empty body or plain text errors), use the raw text
                details = rawErrorText.substring(0, 500) || "The server returned an empty response body.";
                errorMessage = `Error ${geminiRes.status}: Could not parse error details. ${details}...`;
            }
          
            console.error("API Fetch Error:", errorMessage);
          
            // Use an enhanced alert to inform the user of the core problem
            outputContent.innerHTML = `
                <div class="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    <p class="font-bold text-lg">🚫 API Connection Failed</p>
                    <p class="mt-1"><strong>Status:</strong> ${geminiRes.status}</p>
                    <p class="mt-1"><strong>Details:</strong> ${details}</p>
                    <p class="mt-3 text-sm font-semibold">
                        Action: The most common cause for a 403 Forbidden error is that the API key
                        is not restricted to the correct domain. Please check your key's
                        <a href="https://console.cloud.google.com/apis/credentials" target="_blank" class="underline text-red-800">HTTP referrer restrictions</a>
                        and ensure they include <code>file:///*</code> and <code>http://localhost/*</code>.
                    </p>
                </div>
            `;
            // CRITICAL FIX: Moved return statement out of the template literal
            return; // Stop execution here if there was an error
        }

        // Parse the JSON response from the AI
        // CRITICAL FIX: Changed 'response.json()' to 'geminiRes.json()'
        const result = await geminiRes.json();
       
        // Extract the AI's generated text
        // CRITICAL FIX: Changed 'data' to 'result'
        const aiResponse = result.candidates[0].content.parts[0].text;

        // Basic formatting for the output to make it readable in HTML
        let formattedResponse = aiResponse.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Convert **text** to <strong>text</strong>
        formattedResponse = formattedResponse.replace(/^###\s*)/gm, '<h3>$1</h3>');
        formattedResponse = formattedResponse.replace(/\n/g, '<br>'); // Convert newlines to HTML line breaks
        // Simple regex to look for list items (like * or -) and wrap them
        formattedResponse = formattedResponse.replace(/^[\*-] (.*)/gm, '<li>$1</li>');

        // Display the formatted AI response
        outputContent.innerHTML = `<div class="p-4 bg-gray-50 rounded-lg">${formattedResponse}</div>`

    } catch (error) {
        // Catch any network or other unexpected errors
        console.error('Fetch error:', error);
        outputContent.innerHTML = "<p style='color: red;'>An unexpected error occurred. Please check your network connection or console for details.</p>";
    } finally {
        // Always re-enable the button once processing is done (or an error occurs)
        explainButton.disabled = false;
    }
});


