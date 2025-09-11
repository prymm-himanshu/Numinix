import { DiagnosticQuestion, DiagnosticResult } from '../types';

const GROQ_PROXY_URL = 'http://localhost:3001/api/groq-chat';
const MODEL_NAME = 'llama-3.1-70b-versatile';

export async function generateDiagnosticTest(classLevel: number): Promise<DiagnosticQuestion[]> {
  try {
    const prompt = `You are an expert math educator creating diagnostic questions for Class ${classLevel} students in India following NCERT curriculum.

CRITICAL: Return ONLY a valid JSON array. No additional text, explanations, or formatting.

Create exactly 30 diagnostic questions that test prerequisite knowledge for Class ${classLevel} mathematics.

Cover these concepts based on class level:
${getConceptsForClass(classLevel)}

JSON Structure (return exactly this format):
[
  {
    "id": "diag_1",
    "question": "What is 2/3 + 1/4?",
    "options": ["5/7", "11/12", "3/7", "5/12"],
    "correct_answer": "11/12",
    "explanation": "To add fractions, find common denominator: 2/3 = 8/12, 1/4 = 3/12, so 8/12 + 3/12 = 11/12",
    "difficulty": "medium",
    "topic": "Fractions",
    "concept": "Addition of fractions"
  }
]

Requirements:
- Mix of difficulties: 12 easy, 12 medium, 6 hard
- Include both computational and conceptual questions
- Clear, student-friendly explanations
- Valid JSON format only`;

    const response = await fetch(GROQ_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.statusText}`);
    }

    const data = await response.json();
    // Log the raw AI response for debugging
    console.log('AI raw response:', data);

    const aiContent = data?.choices?.[0]?.message?.content;
    if (!aiContent) {
      throw new Error('Invalid response from AI: No content');
    }

    let rawText = aiContent.trim();

    // Remove code block markers if present
    if (rawText.startsWith('```json')) {
      rawText = rawText.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (rawText.startsWith('```')) {
      rawText = rawText.replace(/^```/, '').replace(/```$/, '').trim();
    }

    // Find the JSON array boundaries
    const firstBracket = rawText.indexOf('[');
    const lastBracket = rawText.lastIndexOf(']');

    if (firstBracket === -1 || lastBracket === -1 || firstBracket >= lastBracket) {
      throw new Error('No valid JSON array found in AI response');
    }

    const jsonString = rawText.substring(firstBracket, lastBracket + 1);

    let questions;
    try {
      questions = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError);
      console.error('Original text:', rawText.substring(0, 300) + '...');
      console.error('Extracted JSON:', jsonString.substring(0, 300) + '...');
      // Try to fix common JSON issues and parse again
      try {
        const fixedJson = attemptJsonRepair(jsonString);
        questions = JSON.parse(fixedJson);
        console.log('Successfully parsed after repair');
      } catch (repairError) {
        console.error('JSON repair also failed:', repairError);
        throw new Error(`Failed to parse AI response as JSON: ${parseError.message}`);
      }
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error('No valid questions generated');
    }

    // Validate and clean questions structure
    const validQuestions = questions.filter(q => {
      // Check required fields
      if (!q.id || !q.question || !q.options || !Array.isArray(q.options) || 
          !q.correct_answer || !q.explanation || !q.difficulty || !q.topic || !q.concept) {
        return false;
      }
      // Clean up any remaining formatting issues
      if (typeof q.explanation === 'string') {
        q.explanation = q.explanation.replace(/\n/g, ' ').trim();
      }
      return true;
    });

    if (validQuestions.length === 0) {
      throw new Error('No valid questions found in response');
    }

    return validQuestions.slice(0, 30);
  } catch (error) {
    console.error('Diagnostic test generation error:', error);
    // Return fallback diagnostic questions
    return generateFallbackDiagnosticQuestions(classLevel);
  }
}

function attemptJsonRepair(jsonString: string): string {
  // Try to fix common JSON issues
  let repaired = jsonString;
  
  // Fix truncated strings by finding incomplete quotes and closing them
  const lines = repaired.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // If line ends with incomplete string, try to close it
    if (line.includes('"') && !line.match(/"[^"]*"$/)) {
      const lastQuoteIndex = line.lastIndexOf('"');
      if (lastQuoteIndex > 0) {
        // Check if this quote is opening or closing
        const beforeQuote = line.substring(0, lastQuoteIndex);
        const quoteCount = (beforeQuote.match(/"/g) || []).length;
        
        // If odd number of quotes before, this should be a closing quote
        if (quoteCount % 2 === 1) {
          lines[i] = beforeQuote + '"';
        }
      }
    }
  }
  
  repaired = lines.join('\n');
  
  // Ensure the JSON ends properly
  if (!repaired.trim().endsWith(']')) {
    // Try to close the array properly
    const lastObjectEnd = repaired.lastIndexOf('}');
    if (lastObjectEnd > 0) {
      repaired = repaired.substring(0, lastObjectEnd + 1) + '\n]';
    }
  }
  
  return repaired;
}

function getConceptsForClass(classLevel: number): string {
  const concepts = {
    1: "- Basic counting (1-100)\n- Simple addition and subtraction\n- Shapes recognition\n- Number patterns",
    2: "- Addition and subtraction (up to 1000)\n- Multiplication tables (2-10)\n- Basic geometry shapes\n- Time and money",
    3: "- Multiplication and division\n- Fractions (basic)\n- Measurement units\n- Data handling (simple graphs)",
    4: "- Large numbers\n- Fractions (proper/improper)\n- Decimals (basic)\n- Geometry (angles, triangles)",
    5: "- Decimals and fractions\n- Factors and multiples\n- Area and perimeter\n- Data handling",
    6: "- Integers\n- Fractions and decimals (operations)\n- Basic algebra\n- Ratio and proportion",
    7: "- Rational numbers\n- Simple equations\n- Lines and angles\n- Triangles and quadrilaterals",
    8: "- Rational numbers (operations)\n- Linear equations\n- Quadrilaterals\n- Mensuration",
    9: "- Number systems (rational/irrational)\n- Polynomials (basic)\n- Coordinate geometry\n- Linear equations in two variables",
    10: "- Real numbers\n- Polynomials\n- Quadratic equations\n- Coordinate geometry (advanced)",
    11: "- Sets and functions\n- Trigonometry\n- Sequences and series\n- Coordinate geometry (3D)",
    12: "- Calculus (limits, derivatives)\n- Probability\n- Vectors\n- Linear programming"
  };
  
  return concepts[classLevel as keyof typeof concepts] || concepts[9];
}

function generateFallbackDiagnosticQuestions(classLevel: number): DiagnosticQuestion[] {
  const baseQuestions: DiagnosticQuestion[] = [
    {
      id: "diag_1",
      question: "What is 15 + 27?",
      options: ["42", "41", "43", "40"],
      correct_answer: "42",
      explanation: "15 + 27 = 42. Add the ones place: 5 + 7 = 12, write 2 carry 1. Add tens: 1 + 2 + 1 = 4.",
      difficulty: "easy",
      topic: "Basic Arithmetic",
      concept: "Addition"
    },
    {
      id: "diag_2",
      question: "Which of these is a rational number?",
      options: ["√2", "π", "3/4", "√5"],
      correct_answer: "3/4",
      explanation: "A rational number can be expressed as p/q where q ≠ 0. 3/4 is in this form.",
      difficulty: "medium",
      topic: "Number Systems",
      concept: "Rational Numbers"
    },
    {
      id: "diag_3",
      question: "What is 2³?",
      options: ["6", "8", "9", "4"],
      correct_answer: "8",
      explanation: "2³ means 2 × 2 × 2 = 8",
      difficulty: "easy",
      topic: "Exponents",
      concept: "Powers"
    },
    {
      id: "diag_4",
      question: "What is the area of a square with side 5 cm?",
      options: ["20 cm²", "25 cm²", "10 cm²", "15 cm²"],
      correct_answer: "25 cm²",
      explanation: "Area of square = side × side = 5 × 5 = 25 cm²",
      difficulty: "easy",
      topic: "Geometry",
      concept: "Area calculation"
    },
    {
      id: "diag_5",
      question: "If 3x = 15, what is x?",
      options: ["3", "4", "5", "6"],
      correct_answer: "5",
      explanation: "To find x, divide both sides by 3: x = 15 ÷ 3 = 5",
      difficulty: "medium",
      topic: "Algebra",
      concept: "Simple equations"
    }
  ];

  // Add more questions to reach 30
  const additionalQuestions: DiagnosticQuestion[] = [];
  for (let i = 6; i <= 30; i++) {
    additionalQuestions.push({
      id: `diag_${i}`,
      question: `What is ${i + 2} + ${i + 3}?`,
      options: [`${2*i + 4}`, `${2*i + 5}`, `${2*i + 6}`, `${2*i + 7}`],
      correct_answer: `${2*i + 5}`,
      explanation: `${i + 2} + ${i + 3} = ${2*i + 5}`,
      difficulty: i % 3 === 0 ? "hard" : i % 2 === 0 ? "medium" : "easy",
      topic: "Basic Arithmetic",
      concept: "Addition"
    });
  }

  return [...baseQuestions, ...additionalQuestions];
}

export async function analyzeDiagnosticResults(
  answers: { questionId: string; answer: string; correct: boolean }[],
  questions: DiagnosticQuestion[]
): Promise<DiagnosticResult> {
  const score = answers.filter(a => a.correct).length;
  const totalQuestions = questions.length;
  
  // Analyze by topic and concept
  const topicScores: { [key: string]: { correct: number; total: number } } = {};
  const conceptScores: { [key: string]: { correct: number; total: number } } = {};
  
  answers.forEach((answer, index) => {
    const question = questions[index];
    if (!question) return;
    
    // Track topic performance
    if (!topicScores[question.topic]) {
      topicScores[question.topic] = { correct: 0, total: 0 };
    }
    topicScores[question.topic].total++;
    if (answer.correct) topicScores[question.topic].correct++;
    
    // Track concept performance
    if (!conceptScores[question.concept]) {
      conceptScores[question.concept] = { correct: 0, total: 0 };
    }
    conceptScores[question.concept].total++;
    if (answer.correct) conceptScores[question.concept].correct++;
  });
  
  // Determine strengths and weaknesses
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const gaps: string[] = [];
  
  Object.entries(topicScores).forEach(([topic, scores]) => {
    const percentage = (scores.correct / scores.total) * 100;
    if (percentage >= 80) {
      strengths.push(topic);
    } else if (percentage >= 50) {
      // Moderate performance - could improve
    } else {
      weaknesses.push(topic);
    }
    
    if (percentage < 30) {
      gaps.push(topic);
    }
  });
  
  // Generate AI-powered recommendations
  const recommendations = await generateRecommendations(strengths, weaknesses, gaps, score, totalQuestions);
  
  return {
    id: Date.now().toString(),
    user_id: '', // Will be set by caller
    score,
    total_questions: totalQuestions,
    strengths,
    weaknesses,
    gaps,
    recommendations,
    completed_at: new Date().toISOString()
  };
}

async function generateRecommendations(
  strengths: string[],
  weaknesses: string[],
  gaps: string[],
  score: number,
  totalQuestions: number
): Promise<string[]> {
  try {
    const prompt = `You are a friendly math mentor helping a student. Based on their diagnostic test results, provide 5-7 personalized recommendations.

Results:
- Score: ${score}/${totalQuestions} (${Math.round((score/totalQuestions)*100)}%)
- Strengths: ${strengths.join(', ') || 'None identified'}
- Weaknesses: ${weaknesses.join(', ') || 'None identified'}
- Major gaps: ${gaps.join(', ') || 'None identified'}

CRITICAL: Return ONLY a valid JSON array of strings. No additional text.

Each recommendation should be:
- Encouraging and positive
- Specific and actionable
- Include emojis
- Written like a friendly mentor

Example format:
["Great job on ${strengths[0] || 'basic concepts'}! 🌟 Keep practicing to stay sharp.", "Focus on ${weaknesses[0] || 'problem areas'} with daily 10-minute practice sessions 📚"]

Return only the JSON array.`;

    const response = await fetch(GROQ_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

    if (response.ok) {
      const data = await response.json();
      
      if (data?.choices?.[0]?.message?.content) {
        let text = data.choices[0].message.content.trim();
        
        // More robust JSON extraction - find first [ and last ]
        const firstBracket = text.indexOf('[');
        const lastBracket = text.lastIndexOf(']');
        
        if (firstBracket !== -1 && lastBracket !== -1 && firstBracket < lastBracket) {
          const jsonString = text.substring(firstBracket, lastBracket + 1);
          
          try {
            const recommendations = JSON.parse(jsonString);
            if (Array.isArray(recommendations)) {
              return recommendations;
            }
          } catch (parseError) {
            console.error('Recommendations JSON parsing failed:', parseError);
            console.error('Attempted to parse:', jsonString.substring(0, 200) + '...');
          }
        }
      }
    }
  } catch (error) {
    console.error('Error generating recommendations:', error);
  }
  
  // Fallback recommendations
  const fallbackRecommendations = [
    `You scored ${score}/${totalQuestions}! 🎉 Every step forward is progress.`,
    "Focus on daily practice - even 15 minutes makes a difference! 📚",
    "Don't worry about mistakes - they're stepping stones to success! 💪"
  ];
  
  if (strengths.length > 0) {
    fallbackRecommendations.push(`You're doing great with ${strengths[0]}! 🌟 Keep it up!`);
  }
  
  if (weaknesses.length > 0) {
    fallbackRecommendations.push(`Let's work on ${weaknesses[0]} together - you've got this! 🚀`);
  }
  
  return fallbackRecommendations;
}