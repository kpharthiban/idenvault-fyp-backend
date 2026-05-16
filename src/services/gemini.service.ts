import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

export const geminiService = {
  async generateInterviewQuestions(credential: {
    title: string;
    issuer: string;
    grade?: string;
    description?: string;
  }): Promise<string[]> {

    const prompt = `
You are an interviewer reviewing a verified academic credential.
Generate exactly 5 relevant interview questions for a candidate who holds this credential.

Credential details:
- Title: ${credential.title}
- Issued by: ${credential.issuer}
${credential.grade ? `- Grade: ${credential.grade}` : ''}
${credential.description ? `- Description: ${credential.description}` : ''}

Rules:
- Return ONLY a JSON array of 5 strings
- No explanation, no preamble, no markdown
- Each question must be specific to this credential
- Example format: ["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?"]
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const clean = text.replace(/```json|```/g, '').trim();
    const questions: string[] = JSON.parse(clean);

    if (!Array.isArray(questions) || questions.length !== 5) {
      throw new Error('Gemini returned unexpected format');
    }

    return questions;
  }
};