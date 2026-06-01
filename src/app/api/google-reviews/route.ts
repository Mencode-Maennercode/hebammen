import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey || apiKey === 'your-google-places-api-key-here') {
    return NextResponse.json(
      { error: 'Google Places API Key not configured' },
      { status: 500 }
    );
  }

  try {
    // Use Places API (New) text search with correct endpoint
    const searchResponse = await fetch(
      `https://places.googleapis.com/v1/places:searchText?fields=places.reviews,places.rating&key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-FieldMask': 'places.reviews,places.rating',
        },
        body: JSON.stringify({
          textQuery: 'Hebammen am Marienhospital Bonn',
          languageCode: 'de',
        }),
      }
    );

    if (!searchResponse.ok) {
      const errorText = await searchResponse.text();
      console.error('API Response:', errorText);
      throw new Error(`API request failed: ${searchResponse.status} ${errorText}`);
    }

    const searchData = await searchResponse.json();
    
    if (searchData.error) {
      console.error('API Error:', searchData.error);
      throw new Error(searchData.error.message || 'Google API error');
    }

    if (!searchData.places || searchData.places.length === 0) {
      throw new Error('No places found');
    }

    const place = searchData.places[0];

    const reviews = place.reviews?.map((review: any) => ({
      name: review.authorAttribution?.displayName || 'Anonym',
      rating: review.rating || 5,
      text: review.text?.text || '',
      date: review.relativePublishTimeDescription || 'Kürzlich',
    })) || [];

    const overallRating = place.rating || 0;
    const totalReviews = reviews.length;

    return NextResponse.json({
      reviews,
      overallRating,
      totalReviews,
    });

  } catch (error) {
    console.error('Error fetching Google reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
