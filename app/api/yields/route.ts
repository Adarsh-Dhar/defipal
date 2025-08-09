import { NextRequest, NextResponse } from 'next/server'

// Revalidate the upstream response every 5 minutes at the edge/CDN
export const revalidate = 300

const BASE_URL = 'https://yields.llama.fi'
const PATH = '/pools'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const qs = searchParams.toString()
    const url = `${BASE_URL}${PATH}${qs ? `?${qs}` : ''}`

    const response = await fetch(url, {
      next: { revalidate },
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `Upstream error ${response.status}` },
        { status: 502 }
      )
    }

    const upstream = await response.json()

    // Normalize to an array for consumers expecting sortable data
    let items: unknown = upstream
    if (Array.isArray(upstream)) {
      items = upstream
    } else if (upstream && Array.isArray((upstream as any).data)) {
      items = (upstream as any).data
    } else if (upstream && Array.isArray((upstream as any).pools)) {
      items = (upstream as any).pools
    } else if (
      upstream &&
      (upstream as any).data &&
      Array.isArray((upstream as any).data.pools)
    ) {
      items = (upstream as any).data.pools
    } else {
      // Fallback to empty array if unknown shape
      items = []
    }

    return NextResponse.json(
      { success: true, data: items },
      {
        headers: {
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


