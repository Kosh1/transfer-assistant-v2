# Transfer Assistant - TypeScript Version

AI-powered private transfer assistant for Vienna. Find the best transfer options with real-time price comparison and analysis.

## Features

- 🤖 **AI Chat Interface**: Natural language processing for transfer requests
- 🎤 **Voice Input**: Speech-to-text transcription using OpenAI Whisper
- 🔍 **Real-time Search**: Integration with transfer booking services
- 📊 **Price Analysis**: AI-powered analysis of transfer options
- 🌍 **Multilingual Support**: Support for English, Russian, German, French, and more
- 📱 **Responsive Design**: Mobile-first design with Material-UI
- ⚡ **Next.js 14**: Latest Next.js with App Router and TypeScript

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI**: Material-UI (MUI), Tailwind CSS, Framer Motion
- **AI**: OpenAI GPT-4, Whisper API
- **Search**: Google Search API (Serper.dev)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key
- Google Search API key (Serper.dev)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd transfer-assistant-ts
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

4. Configure your API keys in `.env.local`:
```env
NEXT_PUBLIC_LLM_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_GOOGLE_SEARCH_API_KEY=your_serper_api_key_here
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ChatInterface.tsx  # Main chat component
│   ├── TransferResults.tsx # Transfer results display
│   └── FAQSection.tsx     # FAQ section
├── hooks/                 # Custom React hooks
│   └── useTranslation.tsx # Translation hook
├── services/              # Business logic services
│   ├── llmService.ts      # LLM integration
│   ├── googleSearchService.ts # Google Search API
│   └── transferAnalysisService.ts # Transfer analysis
└── types/                 # TypeScript type definitions
    └── index.ts           # Main types
```

## API Routes

- `POST /api/process-message` - Process user messages with LLM
- `POST /api/analyze-transfers` - Analyze transfer options
- `POST /api/transcribe-audio` - Transcribe audio to text

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

### Manual Deployment

```bash
npm run build
npm start
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_LLM_API_KEY` | OpenAI API key | Yes |
| `NEXT_PUBLIC_LLM_API_URL` | OpenAI API endpoint | No (default provided) |
| `NEXT_PUBLIC_LLM_MODEL` | OpenAI model to use | No (default: gpt-4o-mini) |
| `NEXT_PUBLIC_GOOGLE_SEARCH_API_KEY` | Serper.dev API key | Yes |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository.
