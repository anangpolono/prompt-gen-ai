import { NextRequest, NextResponse } from 'next/server'

const API_ENDPOINT = 'https://llm.blackbox.ai/chat/completions'
const MODEL = 'openrouter/claude-sonnet-4'

function buildSystemPrompt(
  style: string,
  target: string,
  language: string,
  customSystem: string,
  includeNegative: boolean,
  includeCamera: boolean,
  includeLighting: boolean,
  includeMood: boolean
): string {
  const outputLang = language === 'indonesian' ? 'Bahasa Indonesia' : 'English'

  const styleGuide: Record<string, string> = {
    detailed: 'Generate extremely detailed, comprehensive prompts with rich descriptions covering every visual element.',
    concise: 'Generate concise, punchy prompts that are short but highly effective. Focus on the most important elements.',
    cinematic: 'Generate prompts in a cinematic style, emphasizing film-like qualities, depth of field, dramatic composition, and movie production aesthetics.',
    technical: 'Generate technical prompts with precise camera specifications, lens types, aperture, ISO, shutter speed, and photographic technical details.',
    artistic: 'Generate artistic prompts emphasizing art styles, painting techniques, artistic movements, color theory, and aesthetic qualities.',
  }

  const targetGuide: Record<string, string> = {
    general: 'Format as a general AI image/video generation prompt.',
    midjourney: 'Format specifically for Midjourney with parameters like --ar, --v, --style, --q, --chaos. Include style keywords that work well with Midjourney.',
    dalle: 'Format for DALL-E 3 with clear, descriptive natural language sentences. DALL-E responds well to clear compositional descriptions.',
    stablediffusion: 'Format for Stable Diffusion with weighted keywords in parentheses like (keyword:1.4), use commas to separate elements.',
    sora: 'Format for Sora video generation with temporal elements, motion descriptions, and scene progression.',
    runway: 'Format for Runway video generation with clear motion descriptions, camera movement instructions, and temporal consistency notes.',
  }

  const sections = [
    `You are an elite AI prompt engineer with deep expertise in visual content analysis and AI image/video generation.`,
    ``,
    `STYLE DIRECTIVE: ${styleGuide[style] || styleGuide.detailed}`,
    `TARGET PLATFORM: ${targetGuide[target] || targetGuide.general}`,
    `OUTPUT LANGUAGE: Write ALL prompt content in ${outputLang}.`,
    ``,
    `ANALYSIS REQUIREMENTS:`,
    `- Analyze the uploaded visual content with extreme attention to detail`,
    `- Identify and describe: subjects, objects, composition, framing, visual elements`,
    `- Capture artistic style, visual aesthetic, and artistic references`,
    `- Note color palette, dominant colors, and color relationships`,
    customSystem ? `\nADDITIONAL INSTRUCTIONS:\n${customSystem}` : '',
    ``,
    `OUTPUT FORMAT (respond ONLY with valid JSON, no markdown code blocks):`,
    `{`,
    `  "mainPrompt": "The primary detailed prompt text",`,
    includeNegative ? `  "negativePrompt": "Elements to exclude/avoid in generation",` : '',
    includeCamera ? `  "cameraSettings": "Camera angle, lens, focal length, depth of field, shot type details",` : '',
    includeLighting ? `  "lightingDetails": "Lighting setup, light sources, shadows, time of day, atmospheric conditions",` : '',
    includeMood ? `  "moodAtmosphere": "Emotional tone, atmosphere, feeling, energy of the scene",` : '',
    `  "tags": ["array", "of", "5-10", "key", "descriptive", "tags"]`,
    `}`,
  ]
    .filter((s) => s !== '')
    .join('\n')

  return sections
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      base64,
      fileType,
      fileName,
      style = 'detailed',
      target = 'general',
      language = 'english',
      includeNegative = true,
      includeCamera = true,
      includeLighting = true,
      includeMood = true,
      systemPrompt = '',
    } = body

    if (!base64) {
      return NextResponse.json({ error: 'No file data provided' }, { status: 400 })
    }

    const systemContent = buildSystemPrompt(
      style,
      target,
      language,
      systemPrompt,
      includeNegative,
      includeCamera,
      includeLighting,
      includeMood
    )

    // Build messages based on file type
    let userContent: object[]

    if (fileType === 'image') {
      userContent = [
        {
          type: 'text',
          text: `Analyze this ${fileType} (filename: ${fileName}) and generate a comprehensive, highly detailed AI generation prompt based on what you see. Follow the system instructions exactly.`,
        },
        {
          type: 'image_url',
          image_url: { url: base64 },
        },
      ]
    } else {
      // For video: we'll process the base64 data
      userContent = [
        {
          type: 'text',
          text: `Analyze this video content (filename: ${fileName}). Since this is a video, focus on: the overall scene, dominant visual style, subjects present, cinematography style, color grading, motion quality, and mood. Generate a comprehensive AI generation prompt that could recreate the essence of this video. Follow the system instructions exactly.`,
        },
        {
          type: 'image_url',
          image_url: { url: base64 },
        },
      ]
    }

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'customerId': 'cus_TNGzdCxDaQbS4u',
        'Content-Type': 'application/json',
        'Authorization': 'Bearer xxx',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: systemContent,
          },
          {
            role: 'user',
            content: userContent,
          },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(60000),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('[v0] API error:', response.status, errText)
      return NextResponse.json(
        { error: `AI service error: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    const rawContent = data?.choices?.[0]?.message?.content

    if (!rawContent) {
      console.error('[v0] No content in API response:', JSON.stringify(data))
      return NextResponse.json({ error: 'No response from AI model' }, { status: 500 })
    }

    // Parse JSON from response
    let parsedPrompt
    try {
      // Try to extract JSON from response (model might wrap in markdown)
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON found')
      parsedPrompt = JSON.parse(jsonMatch[0])
    } catch (parseErr) {
      console.error('[v0] JSON parse error:', parseErr, 'Raw:', rawContent)
      // Fallback: use raw content as main prompt
      parsedPrompt = {
        mainPrompt: rawContent,
        tags: [],
      }
    }

    return NextResponse.json({
      success: true,
      prompt: parsedPrompt,
      model: MODEL,
    })
  } catch (err) {
    console.error('[v0] Route handler error:', err)
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    )
  }
}
