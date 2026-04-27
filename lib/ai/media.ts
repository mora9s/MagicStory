export type BinaryMedia = {
  buffer: Buffer;
  mimeType: string;
};

type BuildImagePromptInput = {
  kind: 'cover' | 'ending';
  heroDescription: string;
  world: string;
  theme: string;
  targetAge: number;
  finalScene?: string;
};

type NarrationPromptInput = {
  title: string;
  content: string;
  targetAge: number;
};

export function buildStoryImagePrompt(input: BuildImagePromptInput): string {
  const scene = input.kind === 'ending' && input.finalScene
    ? input.finalScene
    : `${input.heroDescription} in ${input.world}, theme: ${input.theme}.`;

  const composition = input.kind === 'cover'
    ? 'Create a strong cover image that immediately shows the heroes, the magical setting, and a sense of wonder.'
    : 'Create the final scene of the story, showing a satisfying, warm conclusion and the heroes celebrating or feeling proud.';

  return `Children's book illustration for a bedtime story.

Scene: ${scene}
Universe: ${input.world}
Theme: ${input.theme}
Target age: ${input.targetAge} years old

${composition}

Visual style:
- cute cartoon / modern children book illustration
- warm magical lighting
- expressive faces, friendly and reassuring mood
- colorful, soft, premium app-store quality
- clear composition suitable for a mobile reading app
- consistent hero appearance across cover and ending images
- no scary realism, no violence, no photorealism
- No text, no letters, no captions, no logo, no watermark in the image.`;
}

export function buildNarrationPrompt(input: NarrationPromptInput): string {
  return `Lis ce conte audio expressif en français pour un enfant d'environ ${input.targetAge} ans.

Intentions vocales :
- voix chaleureuse, rassurante et vivante, comme une histoire du soir ;
- ralentis légèrement pendant les passages mystérieux ou chuchotés ;
- ajoute de la joie dans les moments heureux, de l'émerveillement dans la magie, et une tension douce dans l'aventure ;
- différencie subtilement les dialogues sans caricaturer ;
- garde un rythme calme, clair et adapté aux enfants ;
- ne lis pas les indications, ne commente pas, lis uniquement l'histoire.

Titre : ${input.title}

Histoire :
${input.content}`;
}

export function extractOpenAIImage(payload: unknown): BinaryMedia | null {
  const data = (payload as { data?: Array<{ b64_json?: string; url?: string }> })?.data;
  const first = Array.isArray(data) ? data[0] : undefined;
  if (!first?.b64_json) return null;

  return {
    buffer: Buffer.from(first.b64_json, 'base64'),
    mimeType: 'image/png',
  };
}

export function extractGeminiAudio(payload: unknown): BinaryMedia | null {
  const candidates = (payload as {
    candidates?: Array<{ content?: { parts?: Array<{ inlineData?: { mimeType?: string; data?: string } }> } }>;
  })?.candidates;

  const parts = candidates?.[0]?.content?.parts || [];
  const audioPart = parts.find(part => part.inlineData?.data && part.inlineData?.mimeType?.startsWith('audio/'));
  const inlineData = audioPart?.inlineData;
  if (!inlineData?.data) return null;

  return {
    buffer: Buffer.from(inlineData.data, 'base64'),
    mimeType: inlineData.mimeType || 'audio/wav',
  };
}

export async function generateOpenAIImage(prompt: string): Promise<BinaryMedia | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('OPENAI_API_KEY missing; skipping story image generation');
    return null;
  }

  const model = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2.0';
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      prompt,
      size: process.env.OPENAI_IMAGE_SIZE || '1024x1024',
      n: 1,
      response_format: 'b64_json',
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    console.error('OpenAI image generation failed:', response.status, errorBody.slice(0, 500));
    return null;
  }

  return extractOpenAIImage(await response.json());
}

export async function generateGeminiStoryAudio(prompt: string): Promise<BinaryMedia | null> {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.warn('GOOGLE_API_KEY missing; skipping story audio generation');
    return null;
  }

  const model = process.env.GEMINI_TTS_MODEL || 'gemini-3.1-flash-tts-preview';
  const voiceName = process.env.GEMINI_TTS_VOICE || 'Kore';
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    console.error('Gemini TTS generation failed:', response.status, errorBody.slice(0, 500));
    return null;
  }

  return extractGeminiAudio(await response.json());
}
