const API_KEY="AIzaSyDZwNV75iUQtjPh80tMnNXj0ZZoSlIMCGE"; 

// Get references to our HTML elements
const explainButton = document.getElementById('explainButton');
const inputText = document.getElementById('inputText');
const questionInput = document.getElementById('questionInput');
const outputContent = document.getElementById('outputContent');

// Add an event listener to the button so something happens when it's clicked
explainButton.addEventListener('click', async () => {
    const text = inputText.value.trim(); 
    const question = questionInput.value.trim(); 

    // Basic validation: make sure there's some text to explain
    if (!text) {
        outputContent.innerHTML = "<p style='color: red;'>Please paste some text to explain!</p>";
        return; 
    }

    // Show a loading message and disable the button
    outputContent.innerHTML = "<p>Thinking... Please wait.</p>";
    explainButton.disabled = true;

    // Construct the prompt 
    let prompt = `You are a helpful AI assistant specialized in simplifying technical documentation and explaining complex concepts for beginners, especially those learning new tech skills.

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
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json', 
            },
            body: JSON.stringify({ 
                contents: [{
                    parts: [{ text: prompt }] 
                }]
            })
        });

        // Check if the API call was unsuccessful (status code 4xx or 5xx)
        if (!geminiRes.ok) {
            // Read the response body as plain text first.
            const rawErrorText = await geminiRes.text();
           
            let errorMessage = `API Request failed with status ${geminiRes.status}.`;
            let details = '';

            // Try to parse the text as JSON, in case it's a valid JSON error object
            try {
                const errorData = JSON.parse(rawErrorText);
                if (errorData.error && errorData.error.message) {
                    details = errorData.error.message;
                } else {
                    details = JSON.stringify(errorData);
                }
                errorMessage = `Error ${geminiRes.status}: ${details}`;
            } catch (e) {
                details = rawErrorText.substring(0, 500) || "The server returned an empty response body.";
                errorMessage = `Error ${geminiRes.status}: Could not parse error details. ${details}...`;
            }
           
            console.error("API Fetch Error:", errorMessage);
           
            // Display the error
            outputContent.innerHTML = `
                <div class="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    <p class="font-bold text-lg">🚫 API Connection Failed</p>
                    <p class="mt-1"><strong>Status:</strong> ${geminiRes.status}</p>
                    <p class="mt-1"><strong>Details:</strong> ${details}</p>
                    <p class="mt-3 text-sm font-semibold">
                        Action: The most common cause for a 403 Forbidden error is the API key. Please check its restrictions.
                    </p>
                </div>
            `;
            return; 
        }

        // Parse the JSON response from the AI
        const result = await geminiRes.json();
        
        // Extract the AI's generated text
        const aiResponse = result.candidates[0].content.parts[0].text;

        // Basic formatting for the output to make it readable in HTML
        let formattedResponse = aiResponse;

        // 1. Convert ALL Markdown Headings (#, ##, ###, etc.) to <h3>
        formattedResponse = formattedResponse.replace(/^[#]{1,6}\s*(.*)/gm, '<h3>$1</h3>');

        // 2. Convert **bold text** to <strong>text</strong>
        formattedResponse = formattedResponse.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); 
        
        // 3. Convert markdown lists (* item or - item) to <li>
        formattedResponse = formattedResponse.replace(/^(?:[*-]\s+)(.*)/gm, '<li>$1</li>');
        
        // 4. Wrap the list items (<li>) that are next to each other in <ul> tags.
        formattedResponse = formattedResponse.replace(/((?:<li>.*?<\/li>)+)/gs, '<ul>$1</ul>');
        
        // 5. Convert newlines (\n) to HTML line breaks (<br>) only if they aren't near a list or block element.
        formattedResponse = formattedResponse.replace(/\n(?!<br>|<h3>|<ul>)/g, '<br>');

        // Display the formatted AI response
        outputContent.innerHTML = `<div class="p-4 bg-gray-50 rounded-lg">${formattedResponse}</div>`

    } catch (error) {
        // Catch any network or other unexpected errors
        console.error('Fetch error:', error);
        outputContent.innerHTML = "<p style='color: red;'>An unexpected error occurred. Please check your network connection or console for details.</p>";
    } finally {
        // Always re-enable the button 
        explainButton.disabled = false;
    }
});

