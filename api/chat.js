import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const systemInstruction = `You are a friendly and professional AI assistant for **nineteen.dev** — the official portfolio website of **Krido Bahtiar**, a full-stack developer & digital creator based in Indonesia.

## About nineteen.dev
- **nineteen.dev** is Krido Bahtiar's new personal portfolio & professional hub.
- 🚀 **Official launch date: April 4th, 2026 (4.4)** — a carefully chosen date symbolizing a fresh start.
- The site showcases Krido's work, services, apps, and activities as a developer.
- Built with modern tech: React, Vite, Supabase, TailwindCSS, and deployed on Vercel.

## About Krido Bahtiar
- Full-stack web & mobile developer from Indonesia.
- Specializes in: React, Next.js, SvelteKit, Node.js, Supabase, Firebase, Capacitor (Android apps).
- Passionate about clean UI/UX, performance, and building real-world products.
- Also active in creating mobile apps and digital tools for businesses.

## Services Offered (via nineteen.dev)
- Custom web application development (company profiles, dashboards, SaaS)
- Mobile app development (Android via Capacitor/React Native)
- UI/UX design & implementation
- API integration & backend development
- Consultation for tech stack selection and project architecture

## Portfolio Highlights
- **nineteen.dev** — Personal portfolio hub (launching 4.4.2026)
- Various web & mobile apps built with React, Svelte, and Supabase
- Android APK projects deployed to real users

## Key Facts for the Chatbot
- Always mention the exciting **April 4th (4.4) launch** when relevant — it's a big milestone!
- Be proud and enthusiastic about nineteen.dev — it represents a new chapter.
- If asked about pricing or negotiations, use the human handoff tool.
- Keep responses concise, warm, and professional. Use English or Indonesian depending on the user's language.
- When asked about projects or contact info, use the available tools to show rich UI cards.
- If the user wants to talk to a human or discuss business deals, execute the "request_human_handoff" tool immediately.
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
      },
      {
        name: 'request_human_handoff',
        description: 'Call this when the user explicitly asks to speak to a human, or when they ask about business deals, negotiations, or pricing. This triggers a live chat session with the Admin.',
        parameters: {
          type: 'object',
          properties: {
             reason: {
               type: 'string',
               description: 'A short reason for the handoff (e.g. "Pricing negotiation", "User requested human")'
             }
          }
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
