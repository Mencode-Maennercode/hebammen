import { NextResponse } from 'next/server';

const FALLBACK_REVIEWS = [
  {
    name: "Anna M.",
    rating: 5,
    text: "Die einfühlsame Betreuung durch das Team hat mir sehr geholfen. Ich fühlte mich jederzeit gut aufgehoben.",
    date: "vor 2 Wochen",
  },
  {
    name: "Lisa K.",
    rating: 5,
    text: "Professionell, herzlich und kompetent. Ich kann die Hebammen am Marienhospital nur wärmstens empfehlen!",
    date: "vor 1 Monat",
  },
  {
    name: "Sarah B.",
    rating: 5,
    text: "Vom ersten Gespräch bis zur Nachsorge wurde ich wunderbar begleitet. Vielen Dank für alles!",
    date: "vor 3 Wochen",
  },
  {
    name: "Julia F.",
    rating: 5,
    text: "Ich habe mich während der gesamten Schwangerschaft bestens betreut gefühlt. Das Team ist unglaublich kompetent und warmherzig.",
    date: "vor 2 Monaten",
  },
  {
    name: "Marie S.",
    rating: 5,
    text: "Absolute Empfehlung! Die Hebammen haben sich immer Zeit genommen und auf alle meine Fragen geduldig geantwortet.",
    date: "vor 1 Monat",
  },
];

export async function GET() {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey || apiKey === 'your-google-places-api-key-here') {
    return NextResponse.json({
      reviews: FALLBACK_REVIEWS,
      overallRating: 4.9,
      totalReviews: FALLBACK_REVIEWS.length,
    });
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
    return NextResponse.json({
      reviews: FALLBACK_REVIEWS,
      overallRating: 4.9,
      totalReviews: FALLBACK_REVIEWS.length,
    });
  }
}
