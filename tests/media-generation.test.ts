import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  buildNarrationPrompt,
  buildStoryImagePrompt,
  extractGeminiAudio,
  extractOpenAIImage,
} from '../lib/ai/media';

test('buildNarrationPrompt adds expressive French narration directions without changing the story text', () => {
  const story = 'Lina chuchota : « Le dragon dort... » Puis elle rit de joie !';

  const prompt = buildNarrationPrompt({ title: 'Le dragon endormi', content: story, targetAge: 6 });

  assert.match(prompt, /conte audio expressif/i);
  assert.match(prompt, /chuchot/i);
  assert.match(prompt, /joie/i);
  assert.match(prompt, /6 ans/);
  assert.match(prompt, /Lina chuchota/);
});

test('buildStoryImagePrompt targets children book illustrations and forbids text in images', () => {
  const prompt = buildStoryImagePrompt({
    kind: 'cover',
    heroDescription: 'Lina, 6 ans, explore une forêt lumineuse',
    world: 'Forêt enchantée',
    theme: 'Aventure',
    targetAge: 6,
  });

  assert.match(prompt, /children.s book illustration/i);
  assert.match(prompt, /Forêt enchantée/);
  assert.match(prompt, /Aventure/);
  assert.match(prompt, /No text/i);
});

test('extractOpenAIImage supports base64 image responses', () => {
  const result = extractOpenAIImage({ data: [{ b64_json: 'aGVsbG8=' }] });

  assert.equal(result?.mimeType, 'image/png');
  assert.equal(result?.buffer.toString('utf8'), 'hello');
});

test('extractGeminiAudio supports inline audio responses', () => {
  const result = extractGeminiAudio({
    candidates: [{
      content: {
        parts: [{ inlineData: { mimeType: 'audio/wav', data: 'UklGRg==' } }],
      },
    }],
  });

  assert.equal(result?.mimeType, 'audio/wav');
  assert.equal(result?.buffer.length, 4);
});
