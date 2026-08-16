//Getting the elements from webpage
const sendBtn = document.getElementById("sendBtn");
const userInput = document.getElementById("userInput");
const chatBox = document.getElementById("chatBox");
const voiceBtn = document.getElementById("voiceBtn");

//the API settings
const API_KEY = "the api key";
const MODEL = "gemini-3-flash-preview";

//curent chatbot setting-normal
let currentTopic = "";

// when button pressed message is sent
sendBtn.addEventListener("click", sendMessage);

//sending message when pressing enter
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        sendMessage();
    }
});

//sending message
async function sendMessage() {
    const message = userInput.value.trim();

    //no sending empty messages
    if (message === "") return;

    // displaying user message
    addMessage("You", message);
    userInput.value = "";

    //showing temp thinking message 
    const thinking = addMessage("SciBot", "Thinking...");

    try {
        //sending message to gemini
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: `
You are SciBot, an advanced science education assistant.
Rules:
- Only answer science-related questions.
- Explain clearly using simple language.
- Keep answers clear and reasonably detailed.
- Use separate lines or numbering for multiple questions.
- Do not create unnecessarily huge paragraphs.  

Current topic:
${currentTopic || "General Science"}

For chemistry questions:
- Give chemical formulas when useful.
- Balance equations when needed.
- Identify reaction types when possible.
- Explain reactants and products briefly.

For physics questions:
- Include formulas when useful.
- Explain variables.

For biology questions:
- Include important scientific terms.

If the question is not science related, reply exactly:

"Sorry! I only answer science questions."

Question:
${message}
`
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        maxOutputTokens: 2048,
                        temperature: 0.3
                    }
                })
            }
        );

        // Converting response to JSON
        const data = await response.json();

        // checking response in console
        console.log(data);

        // Removing "Thinking..." after response arrives
        thinking.remove();

        // Checking if theres an API error
        if (data.error) {
            addMessage(
                "SciBot",
                "Error: " + data.error.message
            );
            return;
        }

        //getting the ai answer
        let reply =
            data.candidates?.[0]?.content?.parts?.[0]?.text ||
            "I couldn't generate a response.";

        //displaying ai answer
        addMessage("SciBot", reply);

    } catch (error) {
        //if something goes wrong
        thinking.remove();

        addMessage(
            "SciBot",
            "Something went wrong."
        );

        console.log(error);
    }
}

//add messages
function addMessage(sender, text) {
    // create new message
    const div = document.createElement("div");

    // choose message style
    if (sender === "You") {
        div.className = "user-message";
    } else {
        div.className = "bot-message";
    }

    //adding sender and message
    div.innerHTML = `
        <strong>${sender}</strong><br>
        ${text}
    `;

    //add messages to chat
    chatBox.appendChild(div);

    // Scroll down for latets messgae
    chatBox.scrollTop = chatBox.scrollHeight;

    return div;
}
//buttons for topics
function setTopic(topic) {
    currentTopic = topic;

    addMessage(
        "SciBot",
        topic ? "Topic selected: " + topic : "General Science selected."
    );
}

//voice input
voiceBtn.onclick = function() {
    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    // checking if voice input supported
    if (!SpeechRecognition) {
        alert("Voice input not supported.");
        return;
    }

    // creating speech recognition
    const recognition = new SpeechRecognition();

    recognition.start();

    //put spoken words in input
    recognition.onresult = function(event) {
        userInput.value =
            event.results[0][0].transcript;
    };
};