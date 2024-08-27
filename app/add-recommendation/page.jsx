'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase/clientApp';

export default function AddRecommendation() {
  const [teacherName, setTeacherName] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await addDoc(collection(db, 'recommendations'), {
        teacherName,
        recommendation,
        rating,
        timestamp: new Date()
      });
      router.push('/');  // Redirect to home page after successful submission
    } catch (error) {
      console.error("Failed to add recommendation:", error);
      setError("Failed to add recommendation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <Link href="/" className="block mb-4">
       
        <button className="p-2 bg-blue-400 rounded hover:bg-blue-500 transition-colors">
          Back to Home
        </button>
      </Link>

      <h1 className="text-2xl font-bold mb-4">Add Recommendation</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="teacherName" className="block mb-1">Teacher Name:</label>
          <input
            type="text"
            id="teacherName"
            value={teacherName}
            onChange={(e) => setTeacherName(e.target.value)}
            className="w-full p-2 border rounded text-black"
            required
          />
        </div>
        <div>
          <label htmlFor="recommendation" className="block mb-1">Your Recommendation:</label>
          <textarea
            id="recommendation"
            value={recommendation}
            onChange={(e) => setRecommendation(e.target.value)}
            className="w-full p-2 border rounded text-black"
            rows="4"
            required
          ></textarea>
        </div>
        <div>
          <label htmlFor="rating" className="block mb-1">Rating (1-5):</label>
          <input
            type="number"
            id="rating"
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            min="1"
            max="5"
            className="w-full p-2 border rounded text-blue"
            required
          />
        </div>
        <button 
          type="submit" 
          className={`w-full p-2 rounded text-white ${loading ? 'bg-gray-500' : 'bg-blue-500 hover:bg-blue-600'}`}
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Recommendation'}
        </button>
      </form>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}