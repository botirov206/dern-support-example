# Dern-Support Web Application

A full-stack web application for IT technical support company Dern-Support, featuring support request submission, user authentication, and a knowledge base.

## Features

- **Support Request System**
  - Submit support requests with urgency levels and preferred dates
  - Automatic quote calculation based on urgency
  - Request history tracking
  - Status updates (pending, in-progress, completed)

- **User Authentication**
  - Secure registration and login
  - JWT-based authentication
  - User profile management
  - Account types (business/individual)

- **Knowledge Base**
  - Searchable articles
  - Category filtering (hardware/software)
  - Tag-based organization
  - Responsive article display

## Tech Stack

- **Frontend**
  - HTML5
  - Tailwind CSS
  - JavaScript (ES6+)
  - Responsive design
  - WCAG 2.1 compliant

- **Backend**
  - Node.js
  - Express.js
  - MongoDB with Mongoose
  - JWT authentication
  - Input validation

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/dern-support.git
   cd dern-support
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your configuration:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: Secret key for JWT token generation
   - `PORT`: Server port (default: 3000)

4. Build CSS:
   ```bash
   npm run build:css
   ```

5. Start the server:
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000`

## Image Management

The application uses placeholder images that need to be replaced with your own images:

1. Save your images in `/public/assets/`:
   - `hero.jpg` (1200x600px) - Homepage hero image
   - `placeholder.jpg` (300x200px) - Article thumbnails

2. Verify images using the check script:
   ```bash
   node scripts/check-images.js
   ```

3. Update image paths in HTML/JS files if using different filenames.

## API Endpoints

### Authentication
- POST `/api/users/register` - Register new user
- POST `/api/users/login` - User login
- GET `/api/users/profile` - Get user profile
- PUT `/api/users/profile` - Update user profile

### Support Requests
- POST `/api/requests` - Create support request
- GET `/api/requests` - Get user's requests
- GET `/api/requests/:id` - Get specific request
- PATCH `/api/requests/:id/status` - Update request status

### Knowledge Base
- GET `/api/articles` - List articles (with search/filter)
- GET `/api/articles/:id` - Get specific article
- POST `/api/articles` - Create article (admin)
- PUT `/api/articles/:id` - Update article (admin)
- DELETE `/api/articles/:id` - Delete article (admin)

## Example API Calls

### Create Support Request
```bash
curl -X POST http://localhost:3000/api/requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "description": "Computer won't start",
    "urgency": "high",
    "preferredDate": "2025-02-20T10:00:00Z",
    "accountType": "business"
  }'
```

### Search Articles
```bash
curl http://localhost:3000/api/articles?search=windows&category=software
```

## Development

- Run in development mode:
  ```bash
  npm run dev
  ```

- Watch CSS changes:
  ```bash
  npm run build:css
  ```

## Testing

Run the test suite:
```bash
npm test
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@dern-support.com or open an issue in the repository. 