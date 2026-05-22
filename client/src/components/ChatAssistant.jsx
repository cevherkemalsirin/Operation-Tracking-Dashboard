import { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../utils/api';
import assistantIcon from '../assets/chat-assistant-icon.png';
import '../styles/chat-assistant.css';

const INITIAL_MESSAGES = [
  {
    role: 'assistant',
    text: 'Hi, I can help with your dashboard tickets.',
  },
];

function renderMessageText(text) {
  const parts = text.split(/(INC\d+)/g);

  return parts.map((part, index) => {
    if (/^INC\d+$/.test(part)) {
      return (
        <Link className="chat-ticket-link" to={`/tickets/${part}`} key={`${part}-${index}`}>
          {part}
        </Link>
      );
    }

    return part;
  });
}

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function sendMessage(event) {
    event.preventDefault();

    const trimmedMessage = input.trim();
    if (!trimmedMessage || loading) return;

    const userMessage = {
      role: 'user',
      text: trimmedMessage,
    };

    setMessages((current) => [...current, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await apiRequest('/assistant', {
        method: 'POST',
        body: JSON.stringify({ message: trimmedMessage }),
      });

      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          text: response.reply,
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          text: error.message || 'Assistant could not answer right now.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`chat-assistant ${isOpen ? 'is-open' : ''}`}>
      {!isOpen ? (
        <button
          type="button"
          className="chat-assistant-toggle"
          aria-label="Open chatbot"
          onClick={() => setIsOpen(true)}
        >
          <img src={assistantIcon} alt="" aria-hidden="true" />
        </button>
      ) : (
        <section className="chat-assistant-panel" aria-label="Chatbot">
          <div className="chat-assistant-header">
            <div>
              <p>Chatbot</p>
              <h2>AI Assistant</h2>
            </div>
            <button type="button" aria-label="Close chatbot" onClick={() => setIsOpen(false)}>
              x
            </button>
          </div>

          <div className="chat-assistant-messages" aria-live="polite">
            {messages.map((message, index) => (
              <div className={`chat-message ${message.role}`} key={`${message.role}-${index}`}>
                {renderMessageText(message.text)}
              </div>
            ))}
            {loading && <div className="chat-message assistant loading">Assistant is thinking...</div>}
          </div>

          <form className="chat-assistant-form" onSubmit={sendMessage}>
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about your tickets..."
              aria-label="Chat message"
            />
            <button type="submit" disabled={loading || !input.trim()}>
              Send
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
