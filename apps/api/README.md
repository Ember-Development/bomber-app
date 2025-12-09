# Bomber API

## Environment Variables

The following environment variables are required to run the API:

### Required Variables

- `DB_URI` - PostgreSQL database connection string
- `JWT_SECRET` - Secret for signing JWT access tokens
- `JWT_REFRESH_SECRET` - Secret for signing JWT refresh tokens
- `PORT` - Server port (default: 3000)
- `CORS_ORIGINS` - Comma-separated list of allowed CORS origins

### Integration API

- `INTEGRATION_API_KEY` - API key for external integrations (e.g., NIL athletes endpoint)
  - Generate a strong random string for production use
  - Used for authentication on `/api/integrations/*` endpoints

### Optional Variables

- `APNS_KEY_ID` - Apple Push Notification Service key ID
- `APNS_TEAM_ID` - Apple Push Notification Service team ID
- `APNS_KEY_PATH` - Path to APNS key file
- `FCM_SERVER_KEY` - Firebase Cloud Messaging server key

## Integration Endpoints

### GET /api/integrations/nil-athletes

Returns all NIL (Name, Image, Likeness) athletes with their associated user, team, and parent information.

**Authentication:** Requires `Authorization: Bearer <INTEGRATION_API_KEY>` header

**Response:**

```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "id": "player-uuid",
      "jerseyNum": "23",
      "pos1": "FORWARD",
      "pos2": "CENTER",
      "ageGroup": "14U",
      "gradYear": "2025",
      "college": "Texas A&M",
      "user": {
        "id": "user-uuid",
        "email": "player@example.com",
        "fname": "John",
        "lname": "Doe"
      },
      "team": {
        "id": "team-uuid",
        "name": "Bombers 14U",
        "ageGroup": "14U",
        "region": "ACADEMY",
        "state": "TX"
      },
      "parents": [
        {
          "id": "parent-uuid",
          "user": {
            "fname": "Jane",
            "lname": "Doe",
            "email": "parent@example.com",
            "phone": "555-1234"
          }
        }
      ]
    }
  ]
}
```

**Example Request:**

```bash
curl -X GET http://localhost:3000/api/integrations/nil-athletes \
  -H "Authorization: Bearer your-integration-api-key-here"
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```
