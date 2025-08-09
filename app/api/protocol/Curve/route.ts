import { NextRequest, NextResponse } from 'next/server'

// Revalidate the upstream response every 5 minutes at the edge/CDN
export const revalidate = 300

const DEFAULT_PROTOCOL_SLUG = 'curve-dex'
const BASE_URL = 'https://api.llama.fi/protocol'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug') || DEFAULT_PROTOCOL_SLUG

    const url = `${BASE_URL}/${encodeURIComponent(slug)}`

    const response = await fetch(url, {
      // Next.js caching: ISR-style revalidation
      next: { revalidate },
      // Sensible timeout using AbortController if needed (left simple here)
    })

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `Upstream error ${response.status}` },
        { status: 502 }
      )
    }

    const data = await response.json()
    console.log("data", data.tvl)

    return NextResponse.json(
      { success: true, data },
      {
        headers: {
          // Help CDN/proxy caching
          'Cache-Control': 's-maxage=300, stale-while-revalidate=60',
        },
      }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}


