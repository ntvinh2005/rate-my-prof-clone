// pages/api/recommend-teacher.js
import db from '../../utils/firebase';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { teacherName, recommendation, rating, courseCode, semester } = req.body;

    try {
      // Validate input (implement validateRecommendation function)
      const validationError = validateRecommendation(req.body);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      // Check if the teacher already exists
      const teacherRef = db.collection('teachers').doc(teacherName);
      const teacherDoc = await teacherRef.get();

      if (!teacherDoc.exists) {
        // If teacher doesn't exist, create a new teacher document
        await teacherRef.set({
          name: teacherName,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      // Add the recommendation
      const recommendationRef = await db.collection('recommendations').add({
        teacherName,
        recommendation,
        rating,
        courseCode,
        semester,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        approved: false,
        userId: req.user.id // Assuming you have user authentication middleware
      });

      // Update teacher's average rating
      await updateTeacherRating(teacherName);

      // Log the activity
      await db.collection('activityLogs').add({
        action: 'new_recommendation',
        teacherName,
        userId: req.user.id,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });

      res.status(201).json({ 
        message: 'Recommendation submitted successfully',
        recommendationId: recommendationRef.id
      });

    } catch (error) {
      console.error('Error submitting recommendation:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

async function updateTeacherRating(teacherName) {
  const recommendationsRef = db.collection('recommendations');
  const snapshot = await recommendationsRef.where('teacherName', '==', teacherName).get();

  let totalRating = 0;
  let count = 0;

  snapshot.forEach(doc => {
    totalRating += doc.data().rating;
    count++;
  });

  const averageRating = count > 0 ? totalRating / count : 0;

  await db.collection('teachers').doc(teacherName).update({
    averageRating: averageRating,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
}