# Profile Studio

A responsive profile-card creator powered by a Node.js/Express REST API. Submitted form data is validated by the backend, and the card preview is rendered from the JSON profile returned by the API.

## Requirements

- Node.js 18 or newer
- npm

## Install and run

```powershell
cd user-profile-generator\backend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). For a production-style run, use `npm start` instead of `npm run dev`. Set the `PORT` environment variable to use a different port.

## API

### `POST /api/profile`

Required fields: `name`, `title`, `bio`, `email`, `skills` (1–12 entries), and `location`. `imageUrl`, `socialLinks.linkedin`, and `socialLinks.github` are optional; provided URLs must use HTTP or HTTPS.

Example request:

```json
{
  "name": "Divakar Singaravelu",
  "title": "Full Stack Developer",
  "bio": "Passionate developer interested in building modern web applications.",
  "imageUrl": "https://example.com/profile.jpg",
  "email": "divakar@example.com",
  "skills": ["Java", "Python", "JavaScript", "HTML", "CSS"],
  "location": "Chennai, India",
  "socialLinks": {
    "linkedin": "https://www.linkedin.com/in/example",
    "github": "https://github.com/example"
  }
}
```

Successful requests return `201 Created`:

```json
{
  "success": true,
  "message": "Profile generated successfully.",
  "profile": {
    "id": "generated-uuid",
    "name": "Divakar Singaravelu",
    "title": "Full Stack Developer",
    "bio": "Passionate developer interested in building modern web applications.",
    "imageUrl": "https://example.com/profile.jpg",
    "email": "divakar@example.com",
    "skills": ["Java", "Python", "JavaScript", "HTML", "CSS"],
    "location": "Chennai, India",
    "socialLinks": {
      "linkedin": "https://www.linkedin.com/in/example",
      "github": "https://github.com/example"
    }
  }
}
```

Invalid input returns `400 Bad Request` with a `success: false` JSON response and field-level errors.

## Test the API

Start the backend, then run this PowerShell request from the project directory:

```powershell
$body = @{
  name = "Divakar Singaravelu"
  title = "Full Stack Developer"
  bio = "Passionate developer interested in building modern web applications."
  email = "divakar@example.com"
  skills = @("Java", "Python", "JavaScript")
  location = "Chennai, India"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:3000/api/profile -Method Post -ContentType "application/json" -Body $body
```

To confirm validation, send a request with missing or malformed fields; it will return status `400` and JSON describing the issues.

## Features

- Responsive profile editor and generated-card preview.
- Backend validation, email normalization, skill de-duplication, and UUID profile IDs.
- Safe text rendering, HTTP(S)-only external links, and graceful broken-image fallback.
- Copy profile information and download the card as a PNG.
- Loading state, field errors, toast notifications, and empty/reset states.
- No database: profile information is processed in memory and is not persisted by the server.
