import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../server/db';

// Interface for incoming event data
interface EventData {
  type: string;
  visitor: string;
  metadata: string;
  timestamp: string;
}

// Helper function to set CORS headers
function setCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  response.headers.set('Access-Control-Max-Age', '86400');
  return response;
}

// to handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return setCorsHeaders(new NextResponse(null, { status: 204 }));
}

// to handle POST request for analytics event
export async function POST(request: NextRequest) {
  try {
    const eventData: EventData = await request.json();
    console.log('event data -->', JSON.stringify(eventData));
    
    // Validate event data
    if (!eventData.type || !eventData.visitor) {
      return setCorsHeaders(
        NextResponse.json(
          { error: 'Invalid event data' },
          { status: 400 }
        )
      );
    }
    
    // Log the event
    console.log('Received analytics event -->', JSON.stringify(eventData));
    
    // Store in database using Prisma
    const result = await db.$executeRaw`
      INSERT INTO "Event" ("type", "visitor", "metadata", "timestamp", "createdAt")
      VALUES (${eventData.type}, ${eventData.visitor}, ${eventData.metadata}, ${new Date(eventData.timestamp)}, NOW())
    `;
    return setCorsHeaders(NextResponse.json({ success: true }));
  } catch (error) {
    console.error('Error processing analytics event:', error);
    return setCorsHeaders(
      NextResponse.json(
        { error: 'Failed to process event', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      )
    );
  }
}

// GET endpoint to retrieve events
export async function GET(request: NextRequest) {  
  try {
    // Extract tag ID and event type from query parameters if present
    const tagId = request.nextUrl.searchParams.get('tagId');
    const eventType = request.nextUrl.searchParams.get('eventType');
    
    let queryCondition = '';
    let conditions = [];
    
    if (tagId) {
      conditions.push(`metadata LIKE '%${tagId}%'`);
    }
    
    if (eventType) {
      conditions.push(`type = '${eventType}'`);
    }
    
    if (conditions.length > 0) {
      queryCondition = `WHERE ${conditions.join(' AND ')}`;
    }
    
    // Retrieve the latest events from the database, ordered by timestamp
    const query = `
      SELECT "type", "visitor", "metadata", "timestamp"
      FROM "Event"
      ${queryCondition}
      ORDER BY "timestamp" DESC
      LIMIT 50
    `;
    
    const events = await db.$queryRawUnsafe<Array<{
      type: string;
      visitor: string;
      metadata: string;
      timestamp: Date;
    }>>(query);
    
    console.log(`Found ${events.length} events`);
    
    // Transforming the events to match the expected format
    const formattedEvents = events.map((event) => ({
      type: event.type,
      visitor: event.visitor,
      metadata: event.metadata,
      timestamp: event.timestamp.toISOString()
    }));
    
    return setCorsHeaders(NextResponse.json({ events: formattedEvents }));
  } catch (error) {
    console.error('Error retrieving events:', error);
    return setCorsHeaders(
      NextResponse.json(
        { error: 'Failed to retrieve events', details: error instanceof Error ? error.message : 'Unknown error', events: [] },
        { status: 500 }
      )
    );
  }
} 