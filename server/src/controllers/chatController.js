import { Resume } from '../models/resumeModel.js';
import { createFuse, searchParagraphs } from '../utils/search.js';
import OpenAI from 'openai';

let openai = null;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function chatWithResume(req, res, next) {
  try {
    const { resumeId, question } = req.body;

    if (!resumeId) {
      return res.status(400).json({ error: 'resumeId is required' });
    }

    if (!question) {
      return res.status(400).json({ error: 'question is required' });
    }

    const resume = await Resume.findById(resumeId).lean();
    if (!resume) {
      return res.status(404).json({
        found: false,
        error: 'Resume not found'
      });
    }

    const paragraphs = resume.paragraphs || [];
    const fuse = createFuse(paragraphs);
    let matches = [];

    // Normal search first
    matches = searchParagraphs(fuse, question, 10);
    
    // If no matches, try searching for individual keywords
    if (matches.length === 0) {
      const keywords = question.toLowerCase().split(/\s+/).filter(word => word.length > 3);
      for (const keyword of keywords) {
        const keywordMatches = searchParagraphs(fuse, keyword, 3);
        matches = [...matches, ...keywordMatches];
      }
      
      // Remove duplicates and sort by score
      matches = matches.filter((match, index, self) =>
        index === self.findIndex(m => m.text === match.text)
      ).sort((a, b) => a.score - b.score).slice(0, 10);
    }

    let answer = '';
    
    if (matches.length === 0) {
      // No matches found - use GPT to help understand what to look for
      if (openai) {
        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: `You are a resume search assistant. Always return answers in clean plain text without Markdown formatting.

Rules:
- Do NOT use ##, ###, **, or any Markdown syntax.
- Use simple line breaks for separation.
- Use "-" for bullet points.
- Group related info under clear section titles written normally.
- Make it easy to read like a text report, not like a markdown document.`
              },
              {
                role: "user",
                content: `The user asked: "${question}" but no relevant content was found in the resume. 
                Suggest what specific skills, technologies, or sections they might look for instead. Keep it very brief (1-2 sentences).`
              }
            ],
            max_tokens: 100,
            temperature: 0.3
          });

          answer = `I couldn't find information about "${question}". ${completion.choices[0].message.content}`;
        } catch (openaiError) {
          console.error('OpenAI error:', openaiError);
          answer = `I couldn't find information about "${question}". Try searching for specific skills or technologies mentioned in the resume.`;
        }
      } else {
        answer = `I couldn't find information about "${question}". Try searching for specific skills or technologies.`;
      }
      
    } else if (openai) {
      // Use OpenAI to generate natural answer from found matches
      const contextText = matches.map(m => m.text).join("\n\n");

      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are a resume analysis assistant. Always return answers in clean plain text without Markdown formatting.

Rules:
- Do NOT use ##, ###, **, or any Markdown syntax.
- Use simple line breaks for separation.
- Use "-" for bullet points.
- Group related info under clear section titles written normally.
- Make it easy to read like a text report, not like a markdown document.
- Answer based only on the provided resume content.`
            },
            {
              role: "user",
              content: `RESUME CONTEXT:
${contextText}

QUESTION: ${question}

Answer based only on the resume content above.`
            }
          ],
          max_tokens: 300,
          temperature: 0.3
        });

        answer = completion.choices[0].message.content;
      } catch (openaiError) {
        console.error('OpenAI error:', openaiError);
        // Fallback to showing matches
        const topMatches = matches.slice(0, 3);
        answer = `Based on the resume: ${topMatches.map(m => m.text).join(' ')}`;
      }
      
    } else {
      // Simple answer showing matches
      const topMatches = matches.slice(0, 3);
      answer = `Relevant information: ${topMatches.map(m => m.text).join(' ')}`;
    }

    res.json({
      found: matches.length > 0,
      answer,
      matches: matches.slice(0, 5)
    });
  } catch (err) {
    next(err);
  }
}

function extractEmails(text) {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  return text.match(emailRegex) || [];
}