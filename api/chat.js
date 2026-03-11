import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const systemInstruction = `You are a helpful and professional Portfolio Assistant for Krido Bahtiar (or a general tech portfolio).
Your goal is to answer questions about the portfolio owner's experience, skills, and projects.
You have access to tools that can display rich UI cards to the user. Use them proactively when the user asks about projects or contact info.
Keep your text responses concise and friendly (1-2 sentences) when using a tool, letting the UI card do the heavy lifting.
If the user wants to hand over to a human, politely acknowledge it and say a human will be with them shortly.
`;

const tools = [
  {
    functionDeclarations: [
      {
        name: 'show_portfolio_projects',
        description: 'Displays a list of featured portfolio projects, apps, or games to the user.',
        parameters: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: 'Optional category to filter projects (e.g., "web", "mobile", "games"). Leave empty to show all.'
            }
          }
        }
      },
      {
        name: 'show_contact_info',
        description: 'Displays the contact information and social links of the portfolio owner.',
        parameters: {
          type: 'object',
          properties: {}
        }
      }
    ]
  }
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages format' });
    }

    // Format history for Gemini API, ensuring no successive same-role messages
    const formattedHistory = [];
    let lastRole = null;

    messages.forEach((msg) => {
      // Ignore system/internal messages or tool results for now unless properly structured
      if (msg.role !== 'user' && msg.role !== 'model') return;

      const role = msg.role;
      let text = msg.content || '';

      if (role === lastRole) {
        // Append to last message to avoid successive identical roles
        formattedHistory[formattedHistory.length - 1].parts[0].text += '\n' + text;
      } else {
        formattedHistory.push({
          role: role,
          parts: [{ text: text }],
        });
        lastRole = role;
      }
    });

    // Ensure the first message in history is from 'user'
    // Gemini API requires the history to start with a user message
    while(formattedHistory.length > 0 && formattedHistory[0].role !== 'user') {
        formattedHistory.shift();
    }

    // Extract the latest user message
    const historyWithoutLatest = formattedHistory.slice(0, -1);
    const latestMessage = formattedHistory[formattedHistory.length - 1];

    if (!latestMessage || latestMessage.role !== 'user') {
       return res.status(400).json({ error: 'The last message must be from the user.' });
    }

    // Initialize the model
    // Using gemini-2.5-flash for the fastest response and tool-calling support
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: { parts: [{ text: systemInstruction }] },
      tools: tools
    });

    // Start a chat session with the history
    const chatSession = model.startChat({
      history: historyWithoutLatest,
    });

    // Send the latest message
    const result = await chatSession.sendMessage(latestMessage.parts[0].text);
    const response = result.response;

    const functionCalls = response.functionCalls();
    
    if (functionCalls && functionCalls.length > 0) {
      // Prioritize the first function call
      const call = functionCalls[0];
      return res.status(200).json({
        type: 'function_call',
        functionName: call.name,
        functionArgs: call.args,
        text: response.text() // Optional text accompanying the call
      });
    }

    // Normal text response
    return res.status(200).json({
      type: 'text',
      text: response.text()
    });

  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ error: 'Failed to generate response' });
  }
}
