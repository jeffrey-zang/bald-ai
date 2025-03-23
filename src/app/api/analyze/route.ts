import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    const base64Data = image.split(",")[1];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Is this person bald? Give your response in one sentence. If no one is visible, respond with 'No one is in the image'. If the person has some sideburns but most of their head is bald, presume that they are bald. If the person is wearing a hat or otherwise obstructing their hair, respond with what is the most likely answer. Reply as if you are telling the person the result, as in 'you are bald', not 'this person is bald'."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Data}`
              }
            }
          ]
        }
      ],
      max_tokens: 100
    });

    return NextResponse.json({ result: response.choices[0].message.content });
  } catch (error) {
    console.error("Error analyzing image:", error);
    return NextResponse.json(
      { error: "Failed to analyze image" },
      { status: 500 }
    );
  }
}
