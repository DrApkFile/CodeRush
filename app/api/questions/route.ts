import { NextResponse } from "next/server";
import { db } from "../../../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get("language");
  const difficulty = searchParams.get("difficulty");

  try {
    const q = query(
      collection(db, "questions"),
      where("language", "==", language || "javascript"),
      where("difficulty", "==", difficulty || "medium")
    );
    const snapshot = await getDocs(q);
    const questions = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(questions);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 });
  }
}