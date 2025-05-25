# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is Escritor App (BookWriter), a cloud-based writing platform for authors with AI-powered assistance. It's a React SPA deployed on Fly.io with Supabase backend.

## Common Development Commands

```bash
# Development
npm start              # Start dev server on localhost:3000
npm run build         # Create production build
npm test              # Run tests

# Deployment (from escritor-app-cra directory)
fly deploy            # Deploy to Fly.io production
```

## Architecture & Key Components

### Frontend Stack
- **React 18** with TypeScript and Create React App
- **Lexical Editor**: Facebook's text editor framework for rich text editing
- **Styled Components**: CSS-in-JS for styling with theme support
- **React Router v6**: Client-side routing

### Backend & Services
- **Supabase**: PostgreSQL database + Auth + Edge Functions
- **Edge Functions**: 
  - `claude-embeddings`: AI text generation/autocomplete
  - `gerar-imagem`: Image generation using OpenAI

### Key Services (src/services/)
- `authService.ts`: User authentication and session management
- `dbService.ts`: CRUD operations for books, chapters, characters, notes
- `assistantService.ts`: AI integration for text generation/improvement
- `imageService.ts`: Image generation with automatic registration to prevent deletion

### Database Schema
- `perfis`: User profiles
- `Livros`: Books/projects (note capital L)
- `capitulos`: Book chapters with content
- `personagens`: Characters
- `notas`: Notes/research
- `imagens_geradas`: Generated images tracking (prevents cron deletion)
- `image_generations`: Image generation history/metrics

### Critical Implementation Details

1. **Auto-save**: Chapters auto-save every 2 seconds via `AutoSavePlugin`
2. **Image Management**: Generated images must be registered in `imagens_geradas` table or they'll be deleted by cron job
3. **Theme**: Supports dark/light mode via `ThemeContext`
4. **Editor State**: Lexical editor state is stored as JSON in database

### Environment Variables

Required in `.env`:
```
REACT_APP_SUPABASE_URL=<your-supabase-url>
REACT_APP_SUPABASE_ANON_KEY=<your-anon-key>
```

### Deployment Notes

- Deployed to Fly.io with Docker multi-stage build
- Static files served by Nginx
- Domain: bookwriter.work
- Edge Functions deployed separately via Supabase CLI

## Testing Edge Functions Locally

```bash
# Deploy edge function
supabase functions deploy gerar-imagem

# Set secrets
supabase secrets set OPENAI_API_KEY="your-key"

# View logs
supabase functions logs gerar-imagem
```

## Important Patterns

1. **Error Handling**: All service methods return success/error objects
2. **Image URLs**: Extract storage path from public URL for registration
3. **Context Usage**: `AuthContext` provides user state globally
4. **Editor Plugins**: Custom Lexical plugins in `src/components/LexicalEditor/plugins/`