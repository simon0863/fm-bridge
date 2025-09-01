# FileMaker Data API OAuth Test

**OAuth testing tool by [Neptune Digital](https://www.neptunedigital.co.uk/) - Leading FileMaker Consultancy**

A configurable web application for testing OAuth authentication with FileMaker Data API. Designed to be easily deployable by developers working with different FileMaker servers and OAuth configurations.

---

🥇 **Proud providers of TeamGB and ParalympicsGB for Paris24** 🥇

*From Neptune Digital - The leading FileMaker consultancy and partner based in the UK. We design, develop and deliver systems that are in a league of their own.*

## Features

- **Configurable Environment**: Use `.env` file for easy setup
- **OAuth Provider Discovery**: Get supported providers from FileMaker server
- **Automatic OAuth Flow**: Complete authentication with popup windows
- **Server-Side Capture**: Reliable OAuth completion detection
- **Real-time Logging**: Status updates and debugging information
- **Generic Implementation**: Easy to adapt for any FileMaker server

## Prerequisites

- Node.js (v14 or higher)
- pnpm (recommended) or npm
- FileMaker Server with OAuth configured
- OAuth provider (Microsoft, Google, etc.) configured in FileMaker

## Quick Start

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd FileMaker-OAuth-API-Test
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your settings (see [Configuration](#configuration) below)

4. **Start the server**:
   ```bash
   pnpm run proxy
   # or
   npm run proxy
   ```

5. **Open browser**: Navigate to your configured URL (default: `http://localhost:3002`)

## Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
# Server Configuration
PROXY_PORT=3002
PROXY_HOST=localhost
OAUTH_REDIRECT_BASE_URL=http://localhost:3002

# FileMaker Server Configuration
FILEMAKER_HOST=your-filemaker-server.com
DEFAULT_DATABASE=YourDatabase

# Optional Settings
DEFAULT_API_VERSION=vLatest
NODE_ENV=development
```

### OAuth App Registration

**Important**: Your OAuth provider must be configured to redirect to:
```
{OAUTH_REDIRECT_BASE_URL}/oauth/redirect
```

Examples:
- **Local development**: `http://localhost:3002/oauth/redirect`
- **Production**: `https://your-domain.com/oauth/redirect`

### FileMaker Server Setup

1. Configure OAuth provider in FileMaker Server Admin Console
2. Note the provider name (case-sensitive)
3. Ensure the FileMaker server is accessible from your proxy server

## Usage

1. **Step 1**: Enter FileMaker server host and get OAuth providers
2. **Step 2**: Generate tracking ID (UUID automatically created)
3. **Step 3**: Complete OAuth authentication in popup window
4. **Step 4**: Login to FileMaker database with captured credentials

The application will automatically:
- Load default values from your configuration
- Handle OAuth redirects through the proxy server
- Capture OAuth completion parameters
- Provide detailed logging for troubleshooting

## Deployment Options

### Local Development
```env
PROXY_PORT=3002
PROXY_HOST=localhost
OAUTH_REDIRECT_BASE_URL=http://localhost:3002
```

### Production Server
```env
PROXY_PORT=80
PROXY_HOST=0.0.0.0
OAUTH_REDIRECT_BASE_URL=https://your-domain.com
FILEMAKER_HOST=your-production-server.com
```

### Docker Deployment
```env
PROXY_PORT=3002
PROXY_HOST=0.0.0.0
OAUTH_REDIRECT_BASE_URL=https://your-docker-host.com
```

## Architecture

### Proxy Server Features
- **CORS Handling**: Proxies requests to avoid browser CORS restrictions
- **OAuth Capture**: Intercepts OAuth redirects and extracts identifiers  
- **Session Management**: Tracks OAuth sessions server-side
- **Environment Configuration**: Loads settings from `.env` file

### Client Features
- **Dynamic Configuration**: Loads defaults from server API
- **Automatic OAuth Flow**: Server-side polling for completion detection
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Feedback**: Detailed logging and status updates

## OAuth Flow Details

1. **Provider Discovery**: Client queries FileMaker server for available OAuth providers
2. **Tracking ID**: Generate UUID for tracking the OAuth session
3. **OAuth URL**: FileMaker server returns OAuth provider URL configured for proxy redirect
4. **Authentication**: User completes OAuth in popup window
5. **Proxy Capture**: OAuth provider redirects to proxy server instead of FileMaker
6. **Parameter Extraction**: Proxy server extracts OAuth parameters and forwards to FileMaker
7. **Identifier Capture**: FileMaker processes OAuth and returns identifier
8. **Session Creation**: Client uses identifier to create authenticated FileMaker session

## API Endpoints

The proxy server provides these endpoints:

- `GET /api/config` - Configuration and defaults
- `GET /api/oauth-providers` - FileMaker OAuth providers
- `GET /api/tracking-id` - Generate OAuth tracking URL
- `POST /api/database-login` - Authenticate with FileMaker
- `GET /api/oauth-status/:trackingId` - Check OAuth completion status
- `GET /oauth/redirect` - OAuth completion handler

## Troubleshooting

### Configuration Issues
- **Check `.env` file**: Ensure all required variables are set
- **Verify OAuth redirect URL**: Must match your app registration exactly
- **Test connectivity**: Ensure FileMaker server is accessible

### OAuth Issues  
- **Popup blocked**: Enable popups for your domain
- **Provider not found**: Check FileMaker server OAuth configuration
- **Redirect mismatch**: Verify OAuth app registration URLs

### Server Issues
- **Port in use**: Change `PROXY_PORT` in `.env` file
- **CORS errors**: Ensure proxy server is running and accessible
- **FileMaker connection**: Check `FILEMAKER_HOST` configuration

### Debug Mode
Set `NODE_ENV=development` for detailed logging:
```bash
NODE_ENV=development pnpm run proxy
```

## About Neptune Digital

[Neptune Digital](https://www.neptunedigital.co.uk/) is the leading FileMaker consultancy and partner based in London, UK. Our services include:

- **FileMaker Development** - From new to existing systems. You define it, we build it in FileMaker.
- **Design & Development** - End-to-end approach to design and development
- **FileMaker Support** - On-demand access to Claris FileMaker specialists  
- **FileMaker Health Check** - Receive a full health report of your Claris FileMaker System
- **Award-Winning Hosting** - Secure hosting, backed by an award-winning provider

**Contact Us:**
- 📧 [hello@neptunedigital.co.uk](mailto:hello@neptunedigital.co.uk)
- 🌐 [www.neptunedigital.co.uk](https://www.neptunedigital.co.uk/)
- 📍 London, UK

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with your FileMaker server
5. Submit a pull request

For professional FileMaker consulting services or custom development, [contact Neptune Digital](https://www.neptunedigital.co.uk/).

## License

This project is provided for educational and testing purposes. Adapt as needed for your FileMaker OAuth implementations.

---

**Happy OAuth Testing!** 🚀

*This OAuth testing tool is provided as part of Neptune Digital's FileMaker development services.*