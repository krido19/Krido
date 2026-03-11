---
description: Scaffold and Setup a SvelteKit Gemini Chatbot with Premium UI, Store Management, and Function Calling
---

# Setup SvelteKit Gemini Chatbot Workflow

This workflow automatically scaffolds a full-stack SvelteKit application integrated with Google Gemini API, featuring a premium Glassmorphism Chat UI, mock human handoff logic, and function-calling capabilities (Receipt UI).

## Prerequisites
- The target directory should be specified by the user.

## Steps to Execute

// turbo
1. Initialize the SvelteKit minimal project in the target directory:
`npx -y sv create <target-directory> --template minimal --no-types --no-add-ons --no-dir-check --no-download-check --install npm`
Make sure to `cd` into the `<target-directory>` for all subsequent steps.

// turbo
2. Install the Google Generative AI SDK:
`npm install @google/generative-ai`

3. **Create Environment Variables**:
Create `.env.example` and `.env` in the root. The `.env` should contain:
`GEMINI_API_KEY=your_api_key_here`

4. **Global CSS & Styling**:
Create `src/app.css` containing premium CSS Variables (Indigo & Emerald), resets, scrollbar styling, and a `.glass-panel` class for backdrop-filter blur.

5. **State Management**:
Create `src/lib/stores/uiStore.js`:
- Manages `isWidgetOpen`, `isHumanHandoff` (boolean), and `theme` (light/dark).
Create `src/lib/stores/chatStore.js`:
- Manages an array of `messages` objects `{ id, role, content, type, data, timestamp }` and an `isTyping` boolean.

6. **UI Components (`src/lib/components/`)**:
Create the following Svelte components:
- `ChatHeader.svelte`: Top bar of the widget showing Avatar and AI/Human status.
- `MessageBubble.svelte`: Left (bot) and Right (user) chat bubbles.
- `ReceiptCard.svelte`: Special visual card to render receipt/invoice data returned from Gemini's Function Calling.
- `ChatInput.svelte`: Textarea with a send button. It MUST import and connect via fetch to `/api/chat` and update `chatStore.js` and `uiStore.js`.
- `MessageList.svelte`: Scrolls automatically to the bottom. Loops over `chatStore` messages and renders either `MessageBubble` or `ReceiptCard` based on `message.type`.
- `ChatWidget.svelte`: The main container that toggles visibility via a floating action button (FAB). Uses Svelte transitions (`fly`, `scale`).

7. **Backend API Route (`src/routes/api/chat/+server.js`)**:
Implement a `POST` handler utilizing `@google/generative-ai`.
- System Instruction should instruct the model to act as a Customer Service Agent.
- Implement Function Calling definitions (Tools) for `calculate_receipt` with arguments like `items` array, `subtotal`, `discount`, and `total`.
- Format the frontend message history to map into Gemini's `user` and `model` role structure. Deduplicate consecutive roles to avoid API 500 errors.
- Target `gemini-2.5-flash` for the best model compatibility.
- Return the exact function arguments (JSON) if the model decides to trigger `calculate_receipt`, or return raw text.

8. **Application Assembly**:
- Override `src/routes/+layout.svelte` to import `../app.css`.
- Override `src/routes/+page.svelte` to build a landing page that mounts `<ChatWidget />`. Includes a Theme Switcher button.

9. Report Completion: Notify the user that the Chatbot infrastructure is successfully laid out and remind them to populate the `.env` file with a real API key.

## Future Expansion Suggestions
When running this skill, if the user asks for advanced features, you can extend this boilerplate with:
- **Streaming Mode**: Change `generateContent` to `generateContentStream` and implement Server-Sent Events (SSE) to display responses character-by-character.
- **Data Persistence**: Integrate Supabase or Firebase local stores to save the `chatStore` array, allowing chat histories to survive page reloads.
- **RAG Integration**: Before hitting Gemini, implement a vector search query to fetch real-world shop products to inject into the AI's prompt for factual pricing.
