export interface AIResponse {
  solution: string;
  steps: string[];
  confidence: number;
  error?: string;
}

const GROQ_PROXY_URL = 'http://localhost:3001/api/groq-chat';
const MODEL_NAME = import.meta.env.VITE_GROQ_MODEL || 'openai/gpt-oss-20b';

export async function solveMathProblem(question: string): Promise<AIResponse> {
  try {
    const messages = [
      { role: "system", content: "You are MathMentor, a super-smart, friendly, and fun math assistant inside the Numinix app. Follow the same rules and style as before." },
      { role: "user", content: question }
    ];

    const response = await fetch(GROQ_PROXY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, response.statusText, errorText);
      throw new Error(`Failed to get response from AI tutor. Please try again.`);
    }

    const data = await response.json();
    return {
      solution: data.choices?.[0]?.message?.content || "I'm having trouble processing your question right now. Could you please rephrase it?",
      steps: [],
      confidence: 1,
      error: undefined
    };
  } catch (error: any) {
    console.error('AI Service Error:', error);
    return {
      solution: '',
      steps: [],
      confidence: 0,
      error: "I'm currently having trouble connecting to my knowledge base. Please check your internet connection and try again."
    };
  }
}

export async function generateQuestions(classLevel: number): Promise<any[]> {
  try {
    const messages = [
      { role: "system", content: `You are a math quiz generator for class ${classLevel} students. Return ONLY a valid JSON array with this exact structure: [ { "id": "q1", "question": "What is 2 + 2?", "options": ["3", "4", "5", "6"], "correct_answer": "4", "explanation": "2 + 2 equals 4 because we add two and two together.", "difficulty": "easy", "class_level": ${classLevel}, "topic": "Addition" } ] Requirements: - Exactly 10 questions - Questions appropriate for class ${classLevel} - Mix of easy, medium, and hard difficulty - Include topics like: Number Systems, Algebra, Geometry, Arithmetic - Each question must have exactly 4 options - Clear explanations - Valid JSON format only, no extra text` },
      { role: "user", content: `Generate 10 math quiz questions for class ${classLevel}.` }
    ];

    const response = await fetch(GROQ_PROXY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data = await response.json();
    let rawText = data.choices?.[0]?.message?.content?.trim() || '';
    
    // Clean up the response - remove markdown formatting
    rawText = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
    
    // Try to find JSON array in the response
    const jsonMatch = rawText.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      rawText = jsonMatch[0];
    }

    let generatedQuestions: any[] = [];
    try {
      generatedQuestions = JSON.parse(rawText);
      
      if (!Array.isArray(generatedQuestions)) {
        throw new Error('Response is not an array');
      }

      // Validate and filter questions
      generatedQuestions = generatedQuestions.filter(q => 
        q.id && q.question && q.options && Array.isArray(q.options) && 
        q.correct_answer && q.explanation && q.difficulty && q.topic
      );

      if (generatedQuestions.length === 0) {
        throw new Error('No valid questions generated');
      }

      return generatedQuestions.slice(0, 10);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw text:', rawText);
      throw new Error(`Failed to parse AI response: ${parseError}`);
    }
  } catch (error: any) {
    console.error('AI Question Generation Error:', error);
    // Return fallback questions instead of error
    return [
      {
        id: "fallback_1",
        question: `What is the value of 5 × 6?`,
        options: ["25", "30", "35", "40"],
        correct_answer: "30",
        explanation: "5 × 6 = 30. When we multiply 5 by 6, we get 30.",
        difficulty: "easy",
        class_level: classLevel,
        topic: "Multiplication"
      },
      {
        id: "fallback_2", 
        question: `If x + 7 = 15, what is the value of x?`,
        options: ["6", "7", "8", "9"],
        correct_answer: "8",
        explanation: "To find x, we subtract 7 from both sides: x = 15 - 7 = 8.",
        difficulty: "medium",
        class_level: classLevel,
        topic: "Algebra"
      },
      {
        id: "fallback_3",
        question: `What is the area of a rectangle with length 8 cm and width 5 cm?`,
        options: ["13 cm²", "26 cm²", "40 cm²", "45 cm²"],
        correct_answer: "40 cm²",
        explanation: "Area of rectangle = length × width = 8 × 5 = 40 cm².",
        difficulty: "easy",
        class_level: classLevel,
        topic: "Geometry"
      }
    ];
  }
}

function generateFallbackQuestions(classLevel: number): any[] {
  const baseQuestions = [
    {
      id: "fallback_1",
      question: `What is the value of 5 × 6?`,
      options: ["25", "30", "35", "40"],
      correct_answer: "30",
      explanation: "5 × 6 = 30. When we multiply 5 by 6, we get 30.",
      difficulty: "easy",
      class_level: classLevel,
      topic: "Multiplication"
    },
    {
      id: "fallback_2", 
      question: `If x + 7 = 15, what is the value of x?`,
      options: ["6", "7", "8", "9"],
      correct_answer: "8",
      explanation: "To find x, we subtract 7 from both sides: x = 15 - 7 = 8.",
      difficulty: "medium",
      class_level: classLevel,
      topic: "Algebra"
    },
    {
      id: "fallback_3",
      question: `What is the area of a rectangle with length 8 cm and width 5 cm?`,
      options: ["13 cm²", "26 cm²", "40 cm²", "45 cm²"],
      correct_answer: "40 cm²",
      explanation: "Area of rectangle = length × width = 8 × 5 = 40 cm².",
      difficulty: "easy",
      class_level: classLevel,
      topic: "Geometry"
    },
    {
      id: "fallback_4",
      question: `Which of the following is a prime number?`,
      options: ["4", "6", "7", "9"],
      correct_answer: "7",
      explanation: "A prime number has only two factors: 1 and itself. 7 can only be divided by 1 and 7.",
      difficulty: "medium",
      class_level: classLevel,
      topic: "Number Theory"
    },
    {
      id: "fallback_5",
      question: `What is 25% of 80?`,
      options: ["15", "20", "25", "30"],
      correct_answer: "20",
      explanation: "25% of 80 = (25/100) × 80 = 0.25 × 80 = 20.",
      difficulty: "easy",
      class_level: classLevel,
      topic: "Percentages"
    }
  ];

  // Add class-specific questions based on level
  if (classLevel >= 9) {
    baseQuestions.push(
      {
        id: "fallback_6",
        question: `Which of the following is a rational number?`,
        options: ["√2", "π", "3/4", "√5"],
        correct_answer: "3/4",
        explanation: "A rational number can be expressed as p/q where q ≠ 0. 3/4 is in this form.",
        difficulty: "medium",
        class_level: classLevel,
        topic: "Number Systems"
      },
      {
        id: "fallback_7",
        question: `The value of √49 is:`,
        options: ["6", "7", "8", "9"],
        correct_answer: "7",
        explanation: "√49 = 7 because 7² = 49.",
        difficulty: "easy",
        class_level: classLevel,
        topic: "Square Roots"
      }
    );
  }

  return baseQuestions.slice(0, 10);
}