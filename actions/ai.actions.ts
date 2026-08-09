"use server";

type AIResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

/** Helper to make API call to Gemini or OpenAI or fallback */
async function callLLM(prompt: string, systemInstruction?: string): Promise<string> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (geminiKey) {
    const models = [
      "gemini-2.5-flash-lite",
      "gemini-2.0-flash-lite",
      "gemini-flash-latest",
      "gemini-flash-lite-latest",
      "gemini-pro-latest",
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-1.5-flash"
    ];
    for (const model of models) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    ...(systemInstruction ? [{ text: systemInstruction }] : []),
                    { text: prompt },
                  ],
                },
              ],
            }),
          }
        );

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text.trim();
        if (data?.error?.message) {
          console.warn(`Gemini model ${model} error:`, data.error.message);
        }
      } catch (err) {
        console.error(`Gemini API error with model ${model}:`, err);
      }
    }
  }

  if (openaiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            ...(systemInstruction ? [{ role: "system", content: systemInstruction }] : []),
            { role: "user", content: prompt },
          ],
        }),
      });

      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content;
      if (text) return text.trim();
    } catch (err) {
      console.error("OpenAI API call error:", err);
    }
  }

  throw new Error(
    "API Key missing. Please set GEMINI_API_KEY or OPENAI_API_KEY in your .env file."
  );
}

/** Action 1: Auto-generate relevant tags based on title & content */
export async function generateTagsAction(
  title: string,
  content: string
): Promise<AIResponse<string[]>> {
  try {
    const prompt = `Based on the following blog post title and content, generate 3 to 5 short, relevant topic tags (lowercase, hyphen-separated, e.g., "react-19", "nextjs", "web-dev"). Return ONLY a JSON array of strings without markdown formatting.

Title: ${title}
Content: ${content.slice(0, 1500)}`;

    const result = await callLLM(prompt, "You are a helpful blogging assistant that returns strictly valid JSON.");
    const cleanJson = result.replace(/```json|```/g, "").trim();
    const tags: string[] = JSON.parse(cleanJson);

    const formattedTags = tags
      .map((t) => t.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-"))
      .slice(0, 5);

    return { success: true, data: formattedTags };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to generate tags." };
  }
}

/** Action 2: Polish & format raw text into clean Markdown */
export async function polishMarkdownAction(
  title: string,
  content: string
): Promise<AIResponse<string>> {
  try {
    const prompt = `Polish, format, and improve the readability of the following markdown blog draft.
Fix spelling and grammar errors, organize thoughts into clear sections with headers (##, ###), use bullet points where appropriate, and keep code blocks intact.
Return ONLY the polished markdown content without wrapping explanation.

Title: ${title}
Content:
${content}`;

    const polished = await callLLM(prompt, "You are an expert technical writer and editor.");
    return { success: true, data: polished };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to polish markdown." };
  }
}

/** Action 3: Suggest 3 engaging, SEO-friendly titles */
export async function suggestTitlesAction(
  content: string
): Promise<AIResponse<string[]>> {
  try {
    const prompt = `Based on the following blog post content, suggest 3 catchy, engaging, and SEO-friendly titles.
Return ONLY a JSON array of 3 title strings without markdown formatting.

Content sample:
${content.slice(0, 1500)}`;

    const result = await callLLM(prompt, "You are a professional copywriter and blog editor.");
    const cleanJson = result.replace(/```json|```/g, "").trim();
    const titles: string[] = JSON.parse(cleanJson);

    return { success: true, data: titles.slice(0, 3) };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to suggest titles." };
  }
}

/** Action 4: Generate Mermaid diagram from user prompt */
export async function generateMermaidDiagramAction(
  userPrompt: string
): Promise<AIResponse<string>> {
  try {
    const prompt = `Generate a valid Mermaid diagram based on this request: "${userPrompt}".
Return ONLY the diagram block starting with \`\`\`mermaid and ending with \`\`\` without any extra conversational text.`;

    const result = await callLLM(prompt, "You are a diagramming assistant expert in Mermaid syntax.");
    
    // Extract the block using regex to clean any surrounding conversational text
    const match = result.match(/```mermaid[\s\S]*?```/);
    let diagram = "";
    if (match) {
      diagram = match[0];
    } else {
      // Fallback: If AI returned the code without backticks, wrap it
      const clean = result.replace(/```/g, "").trim();
      diagram = `\`\`\`mermaid\n${clean}\n\`\`\``;
    }

    return { success: true, data: diagram };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to generate Mermaid diagram." };
  }
}
