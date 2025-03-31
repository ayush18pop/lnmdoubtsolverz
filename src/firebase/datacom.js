import { db } from "../firebase/firebase"; // Correct import
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const addDoubt = async (title, description, userId) => {
  if (!title || !description) {
    console.error("Title and description are required!");
    return;
  }

  try {
    const doubtsRef = collection(db, "doubts"); // Fix the reference
    await addDoc(doubtsRef, {
      title,
      description,
      userId: userId || "anonymous",
      createdAt: serverTimestamp(),
      totalVotes: 0, // Fix the typo from `totalVotesL0` to `totalVotes`
    });
    console.log("✅ Doubt added successfully!");
  } catch (error) {
    console.error("🔥 Error adding doubt:", error);
  }
};
