const API_KEY="AIzaSyDY2EXIJQe5rgY6ICDHu0nPwFdqlgESsXk";

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
    // This tells the AI what role it should play and what to do with the text
    let prompt = `You are a helpful AI assistant specialized in simplifying technical documentation and explaining complex concepts for beginners, especially those learning new tech skills like 3MTT fellows.

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
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
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

        // Check if the API call was successful (status code 200-299)
        if (!response.ok) {
            const errorData = await response.json(); // Get error details from the API
            console.error('API Error:', errorData); // Log the error for debugging
            outputContent.innerHTML = `<p style='color: red;'>Error: ${errorData.error.message || 'Could not get explanation. Please try again.'}</p>`;
            return; // Stop here
     }
        // Parse the JSON response from the AI
        const data = await response.json();
        // Extract the AI's generated text
        const aiResponse = data.candidates[0].content.parts[0].text;

        // Basic formatting for the output to make it readable in HTML
        let formattedResponse = aiResponse.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // Convert **text** to <strong>text</strong>
        formattedResponse = formattedResponse.replace(/\n/g, '<br>'); // Convert newlines to HTML line breaks
        formattedResponse = formattedResponse.replace(/^- (.*)/gm, '<li>$1</li>'); // Convert markdown list items to HTML list items (simple)

        // Display the formatted AI response
        outputContent.innerHTML = `<p>${formattedResponse}</p>`;

    } catch (error) {
        // Catch any network or other unexpected errors
        console.error('Fetch error:', error);
        outputContent.innerHTML = "<p style='color: red;'>An error occurred. Please check your API key or network connection..</p>";
    } finally {
        // Always re-enable the button once processing is done (or an error occurs)
        explainButton.disabled = false;
    }
});

