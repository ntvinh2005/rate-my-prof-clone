'use client'
import { useState, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello, I'm Rate My Professor assistant. How can I help you?" }
  ]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage: Message = { role: 'user', content: message };

    // Add the user's message and an empty placeholder for the assistant's reply
    setMessages((prevMessages) => [
      ...prevMessages,
      userMessage,
      { role: 'assistant', content: '...' } // Placeholder for loading
    ]);

    setMessage('');
    setLoading(true);
    setError(null); // Clear any previous errors

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([
          ...messages,
          userMessage
        ])
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      // Ensure data structure matches expected response
      if (!data.choices || !data.choices[0] || !data.choices[0].message || typeof data.choices[0].message.content !== 'string') {
        throw new Error('Unexpected response format');
      }

      const assistantMessage: Message = { role: 'assistant', content: data.choices[0].message.content };

      // Replace the placeholder with the assistant's response
      setMessages((prevMessages) => [
        ...prevMessages.slice(0, -1), // Remove the loading placeholder
        assistantMessage
      ]);

    } catch (error: any) {
      console.error('Error in handleSendMessage:', error);
      setError('Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 p-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-100 text-black' : 'bg-gray-100 text-black'}`}
          >
            <strong className="font-bold text-black">{msg.role === 'user' ? 'You: ' : 'Assistant: '}</strong>
            <span className="text-black">{msg.content}</span>
          </div>
        ))}
      </div>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={4}
        cols={50}
        className="w-full p-2 border border-gray-300 rounded-md text-black"
        placeholder="Type your message here..."
      />
      <button
        onClick={handleSendMessage}
        disabled={loading}
        className={`mt-2 px-4 py-2 rounded-md ${loading ? 'bg-gray-500' : 'bg-blue-500'} text-white`}
      >
        {loading ? 'Sending...' : 'Send'}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
