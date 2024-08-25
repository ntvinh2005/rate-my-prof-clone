import { NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import axios from 'axios';

const systemPrompt = `
You are an AI assistant designed to help students find the best professors based on their queries. Your role is to act as a "Rate My Professor" agent. When a student provides a query, follow these guidelines:

1. **Understanding the Query**: Analyze the student's query to understand their requirements. The query may include specific subjects, teaching styles, or other preferences related to professors.

2. **Retrieve and Rank Professors**: Use the Retrieval-Augmented Generation (RAG) model to search through a database of professor reviews and ratings. The RAG model will help you identify and retrieve relevant information based on the student's query.

3. **Provide Top 3 Professors**:
   - **Top 3 Results**: From the retrieved information, select the top 3 professors who best match the student's query. Ensure that these professors are highly rated and relevant to the subject or criteria specified by the student.
   - **Detailed Information**: For each of the top 3 professors, provide a summary including their name, subject expertise, and key attributes such as teaching style, rating, and any notable reviews.

4. **Formatting Responses**: Present the information in a clear and organized manner. Ensure each recommendation includes the professor's name, subject area, and a brief overview of their ratings and reviews.

### Example Interaction

**User Query**: "I'm looking for a top-rated professor for computer science at my university who is known for clear explanations and engaging lectures."

**Assistant Response**:
1. **Professor Jane Smith**: Highly rated for her clear explanations and engaging lectures in Computer Science. Known for her structured approach and supportive teaching style. Average rating: 4.8/5.

2. **Professor John Doe**: Praised for his in-depth knowledge and interactive teaching methods. Offers detailed feedback and support to students. Average rating: 4.7/5.

3. **Professor Emily Johnson**: Recognized for her practical approach and engaging classroom activities. Great for students seeking a hands-on learning experience. Average rating: 4.6/5.

**Note**: Ensure all provided information is accurate and up-to-date, sourced from the most recent reviews and ratings available in your database.
`;

const EMBEDDING_API_KEY = process.env.HUGGING_FACE_API_KEY;
const EMBEDDING_API_URL = 'https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2';

async function getEmbeddings(sourceSentence) {
    try {
        const response = await axios.post(
            EMBEDDING_API_URL,
            { inputs: sourceSentence },
            {
                headers: {
                    'Authorization': `Bearer ${EMBEDDING_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log('Embedding response:', response.data); // Debugging line
        return response.data;
    } catch (error) {
        console.error('Error fetching embeddings:', error.response ? error.response.data : error.message);
        throw error;
    }
}

async function queryLlama3(messages) {
    try {
        const response = await axios.post(
            'https://openrouter.ai/api/v1/chat/completions',
            {
                model: "meta-llama/llama-3.1-8b-instruct:free",
                messages: messages
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log('LLaMA 3 response:', response.data); // Debugging line
        return response.data;
    } catch (error) {
        console.error('Error querying LLaMA 3:', error.response ? error.response.data : error.message);
        throw error;
    }
}

export async function POST(req) {
    try {
        const data = await req.json();

        // Validate data structure
        if (!Array.isArray(data) || data.length === 0 || !data[data.length - 1]?.content) {
            console.error('Invalid request data:', data);
            return new Response(JSON.stringify({ error: 'Invalid request data' }), { status: 400 });
        }

        const pc = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY
        });

        const index = pc.Index('rag');

        const queryText = data[data.length - 1].content; // User input as source sentence
        console.log('Query text:', queryText); // Debugging line

        // Fetch embeddings for the query text
        let embeddingResponse = await getEmbeddings(queryText);

        // Verify if embeddings are returned correctly
        if (!embeddingResponse || !Array.isArray(embeddingResponse)) {
            throw new Error('Invalid embeddings response');
        }
        embeddingResponse = [...embeddingResponse];

        // Perform similarity search in Pinecone
        const results = await index.namespace('ns1').query({
            vector: embeddingResponse, // Use the query embedding for similarity search
            topK: 3, // Number of top results to retrieve
            includeMetadata: true, // Include metadata in the results
        });

        console.log('Pinecone query results:', results); // Debugging line

        let resultString = '\n\nResults returned from vector db: ';
        results.matches.forEach((match) => {
            resultString += `\n
            Professor: ${match.id}
            Review: ${match.metadata.review}
            Subject: ${match.metadata.subject}
            Stars: ${match.metadata.stars}
            \n\n
            `;
        });

        const lastMessage = data[data.length - 1];
        const lastMessageContent = lastMessage.content + resultString;
        const lastDataWithoutLastMessage = data.slice(0, data.length - 1);
        const messages = [
            { role: 'system', content: systemPrompt },
            ...lastDataWithoutLastMessage,
            { role: 'user', content: lastMessageContent }
        ];

        const llamaResponse = await queryLlama3(messages);

        return new NextResponse(
            JSON.stringify(llamaResponse),
            { headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Error in POST function:', error.message);
        return new Response(JSON.stringify({ error: 'Failed to process request' }), { status: 500 });
    }
}
