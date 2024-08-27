'use client'
import { useState } from 'react';
import Link from 'next/link';
import { db } from '../firebase/clientApp';

export default function Home() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello, I'm Rate My Professor assistant. How can I help you?" }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = { role: 'user', content: message };

    setMessages((prevMessages) => [
      ...prevMessages,
      userMessage,
      { role: 'assistant', content: '...' } // Placeholder for loading
    ]);

    setMessage('');
    setLoading(true);
    setError(null);

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

      if (!data.choices || !data.choices[0] || !data.choices[0].message || typeof data.choices[0].message.content !== 'string') {
        throw new Error('Unexpected response format');
      }

      const assistantMessage = { role: 'assistant', content: data.choices[0].message.content };

      setMessages((prevMessages) => [
        ...prevMessages.slice(0, -1), // Remove the loading placeholder
        assistantMessage
      ]);

    } catch (error) {
      console.error('Error in handleSendMessage:', error);
      setError('Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      {/* Add Recommendation Button */}
      <Link href="/add-recommendation" className="block w-full mb-4">
        <button className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
          Add Recommendation
        </button>
      </Link>

      {/* Chat interface */}
      <div className="mb-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 p-2 rounded-lg ${msg.role === 'user' ? 'bg-blue-100 text-black' : 'bg-violet-200 text-black'}`}
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