# Praxis - AI Chatbot Platform

<p align="center">
  <img alt="Praxis AI Chatbot" src="app/(chat)/opengraph-image.png">
  <h1 align="center">Praxis</h1>
</p>

<p align="center">
  Praxis is a powerful, open-source AI chatbot platform built with Next.js and the AI SDK. 
  It features Model Hub management, provider configuration, and support for multiple AI model providers.
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#model-providers"><strong>Model Providers</strong></a> ·
  <a href="#model-hub"><strong>Model Hub</strong></a> ·
  <a href="#getting-started"><strong>Getting Started</strong></a> ·
  <a href="#deployment"><strong>Deployment</strong></a>
</p>
<br/>

## Features

### Core Features
- **Next.js 16** with App Router
  - Advanced routing for seamless navigation
  - React Server Components (RSCs) and Server Actions
  - Optimized performance and SEO
- **AI SDK Integration**
  - Unified API for text generation, structured objects, and tool calls
  - Dynamic chat interfaces with streaming support
  - Support for multiple model providers
- **Modern UI with shadcn/ui**
  - Beautiful, accessible components built with Radix UI
  - Tailwind CSS for styling
  - Dark mode support
  - Responsive design

### Advanced Features
- **Model Hub Management**
  - Download and manage AI models from Hugging Face
  - Track download progress
  - Organize models by provider
  - Local model storage and management
- **Provider Management**
  - Configure API keys for Google API and OpenRouter
  - User-specific API key storage
  - Enable/disable providers per user
  - Secure API key management
- **Data Persistence**
  - PostgreSQL database for chat history and user data
  - Secure authentication with Auth.js
  - User-specific model and provider configurations

## Model Providers

Praxis supports multiple AI model providers through different integration methods:

### Vercel AI Gateway (Default)

Praxis uses the [Vercel AI Gateway](https://vercel.com/docs/ai-gateway) to access multiple AI models through a unified interface.

**For Vercel deployments**: Authentication is handled automatically via OIDC tokens.

**For non-Vercel deployments**: Set the `AI_GATEWAY_API_KEY` environment variable in your `.env.local` file.

### Google API Integration

Praxis supports **direct Google API integration**, allowing you to use Google models (like Gemini series) directly through Google's API.

**Setup:**
1. Get your Google API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Configure it in Settings → Model Providers → Google API
3. Or add it to your `.env.local` file:
   ```
   GOOGLE_API_KEY=your_google_api_key_here
   ```
4. Use models with the `google-api/` prefix (e.g., `google-api/gemini-1.5-pro`)

**Available Models:**
- Gemini 1.5 Pro
- Gemini 1.5 Flash
- Gemini Pro
- Gemini 1.5 Flash 8B

**Benefits:**
- Direct access to Google's latest models
- Lower latency
- User-specific API key management

### OpenRouter API Integration

Praxis supports the **OpenRouter API**, allowing you to access 100+ models from various providers with a single API key.

**Setup:**
1. Get your OpenRouter API key from [OpenRouter](https://openrouter.ai/keys)
2. Configure it in Settings → Model Providers → OpenRouter
3. Or add it to your `.env.local` file:
   ```
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```
4. Use models with the `openrouter/` prefix (e.g., `openrouter/anthropic/claude-3.5-sonnet`)

**Available Models:**
- **Anthropic**: Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku
- **Google**: Gemini Pro 1.5, Gemini Flash 1.5
- **Meta**: Llama 3.1 70B, Llama 3.1 8B
- **OpenAI**: GPT-4 Turbo, GPT-4o, GPT-3.5 Turbo
- **Mistral**: Mistral Large, Mixtral 8x7B

**Benefits:**
- Access to 100+ models from multiple providers
- Single API key for all providers
- Unified billing and usage tracking
- No need for individual API keys from each provider

## Model Hub

Praxis includes a built-in Model Hub for downloading and managing AI models from Hugging Face.

### Features
- **Search Models**: Search and discover models from Hugging Face
- **Download Models**: Download models directly to your local storage
- **Track Progress**: Monitor download progress in real-time
- **Manage Models**: View, organize, and delete downloaded models
- **Use in Chats**: Use downloaded models directly in your conversations

### Accessing Model Hub
1. Click the Model Hub icon (box icon) in the chat header
2. Or navigate to Settings → Model Hub
3. Search for models and download them
4. Use downloaded models in the model selector

## Getting Started

### Prerequisites
- Node.js 18+ and npm/pnpm
- PostgreSQL database
- (Optional) API keys for Google API, OpenRouter, or Vercel AI Gateway

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Gokulakrishnxn/Praxis-Model-Route.git
   cd Praxis-Model-Route
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   
   Configure the following variables:
   ```env
   # Authentication
   AUTH_SECRET=your_auth_secret_here
   
   # Database
   POSTGRES_URL=postgresql://user:password@localhost:5432/praxis
   
   # AI Gateway (optional, for non-Vercel deployments)
   AI_GATEWAY_API_KEY=your_ai_gateway_key_here
   
   # Google API (optional)
   GOOGLE_API_KEY=your_google_api_key_here
   
   # OpenRouter API (optional)
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```

4. **Set up the database**
   ```bash
   npm run db:migrate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### First Steps

1. **Create an account**: Register a new account or use guest mode
2. **Configure Providers**: Go to Settings → Model Providers and add your API keys
3. **Download Models** (optional): Use Model Hub to download models from Hugging Face
4. **Start Chatting**: Select a model and start your first conversation!

## Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `AUTH_SECRET` | Secret for authentication (generate with `openssl rand -base64 32`) | Yes |
| `POSTGRES_URL` | PostgreSQL database connection string | Yes |
| `AI_GATEWAY_API_KEY` | Vercel AI Gateway API key (for non-Vercel deployments) | No* |
| `GOOGLE_API_KEY` | Google API key for direct Google integration | No |
| `OPENROUTER_API_KEY` | OpenRouter API key for multi-provider access | No |
| `NEXT_PUBLIC_APP_URL` | Public URL of your application | No |

*Required if not deploying on Vercel

### Database Setup

Praxis uses PostgreSQL for data storage. You can use:
- Local PostgreSQL installation
- [Neon](https://neon.tech) (serverless Postgres)
- [Supabase](https://supabase.com)
- Any PostgreSQL-compatible database

Run migrations:
```bash
npm run db:migrate
```

## Deployment

### Deploy to Vercel

1. **Push your code to GitHub**

2. **Import your repository to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository

3. **Configure environment variables**
   - Add all required environment variables in Vercel dashboard
   - `AUTH_SECRET` will be auto-generated if not provided

4. **Deploy**
   - Vercel will automatically detect Next.js
   - Build and deploy will start automatically

### Deploy to Other Platforms

Praxis can be deployed to any platform that supports Next.js:
- **Railway**: Connect your GitHub repo
- **Render**: Use the Next.js blueprint
- **DigitalOcean App Platform**: Deploy from GitHub
- **Self-hosted**: Use Docker or run directly with Node.js

## Project Structure

```
Praxis/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (chat)/            # Chat interface routes
│   └── layout.tsx         # Root layout
├── components/             # React components
│   ├── ui/                # shadcn/ui components
│   ├── model-hub-*.tsx    # Model Hub components
│   └── provider-*.tsx     # Provider management
├── lib/
│   ├── ai/                # AI SDK integration
│   │   ├── models.ts      # Model definitions
│   │   ├── providers.ts   # Provider configurations
│   │   └── tools/        # AI tools
│   └── db/                # Database
│       ├── schema.ts      # Drizzle schema
│       └── migrations/    # Database migrations
├── public/                 # Static assets
└── tests/                 # E2E tests
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:migrate` | Run database migrations |
| `npm run db:generate` | Generate new migration |
| `npm run db:studio` | Open Drizzle Studio |
| `npm test` | Run E2E tests |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/Gokulakrishnxn/Praxis-Model-Route/issues)
- **Documentation**: Check the code comments and this README

## Acknowledgments

- Built with [Next.js](https://nextjs.org)
- Powered by [Vercel AI SDK](https://ai-sdk.dev)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Database with [Drizzle ORM](https://orm.drizzle.team)

---

<p align="center">
  Made with ❤️ by the Praxis team
</p>
