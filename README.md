# G2 Expert Network Prototype

A Next.js prototype showcasing the Expert Network platform with three key screens: Expert Home, Transcript Library, and Peer-to-peer Conversations.

## 🎨 Design System

This prototype uses the **G2 Brand Style Guide** including:
- **Colors**: Rorange (#FF492C), Yellow (#FFC800), Blue (#0073F5), Purple (#5746B2), Navy (#062846)
- **Typography**: Figtree font family from Google Fonts
- **Components**: Cards, badges, buttons following G2 design patterns

## 📋 Features

### 1. Expert Home
- Expert profile with badge and stats
- Earnings breakdown (calls, royalties, influencer campaigns)
- New opportunities menu
- Access to transcript library
- Community circles
- AI expert assistant
- Coming soon features

### 2. Transcript Library
- Search and filter transcripts
- Category and role filters
- Detailed transcript view
- AI pattern recognition
- Key insights highlighting
- Export and activation options
- Book expert calls

### 3. Peer-to-peer Conversations
- Live expert conversations
- AI-moderated discussions
- Real-time messaging
- Privacy controls
- Publication notice
- Conversation guidelines

## 🚀 Getting Started

### Prerequisites

You need to have Node.js installed on your machine. Download it from [nodejs.org](https://nodejs.org/)

### Installation

1. **Navigate to the project directory:**
   ```bash
   cd "/Users/iroberts/Documents/Expert Network/expert-network-prototype"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 💾 Data Storage

The prototype uses **browser localStorage** for data persistence. Sample data is automatically initialized on first load:

- **Current Expert**: Sarah Chen (CRM Expert)
- **Sample Transcripts**: 3 expert transcripts across different categories
- **Opportunities**: 3 pending opportunities (calls, influencer, research)
- **Conversations**: 1 active peer-to-peer conversation

### Resetting Data

To reset all data, open your browser's developer console and run:
```javascript
localStorage.clear()
```

Then refresh the page to reinitialize sample data.

## 🎯 User Flow

1. **Start at Expert Home** - View profile, stats, opportunities, and earnings
2. **Explore Transcript Library** - Search and filter expert transcripts, view details
3. **Join Conversations** - Participate in AI-moderated peer discussions

## 📱 Screens Overview

### Expert Home (`/`)
Shows the expert dashboard with:
- Profile card with badge and expertise
- Stats grid (transcripts, citations, upvotes, earnings)
- Opportunities menu with pending calls and campaigns
- Quick access to transcript library
- Community circles
- AI assistant

### Transcript Library (`/library`)
Features include:
- Search bar with category and role filters
- Grid of transcript cards
- Detailed view panel with full content
- AI analysis and pattern recognition
- Export and booking options

### Peer Conversations (`/conversations`)
Includes:
- Topic card with participants
- Message thread with AI moderation
- Message input for active conversations
- Privacy controls
- Publication notice
- Conversation guidelines

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom G2 design tokens
- **Data**: Browser localStorage with TypeScript interfaces
- **Fonts**: Figtree from Google Fonts

## 📂 Project Structure

```
expert-network-prototype/
├── app/
│   ├── page.tsx                    # Expert Home
│   ├── library/
│   │   └── page.tsx               # Transcript Library
│   ├── conversations/
│   │   └── page.tsx               # Peer Conversations
│   ├── layout.tsx                 # Root layout
│   └── globals.css                # Global styles + G2 design system
├── components/
│   └── Navigation.tsx             # Top navigation bar
├── lib/
│   └── storage.ts                 # localStorage utilities + TypeScript types
├── public/                        # Static assets
├── tailwind.config.ts             # Tailwind with G2 colors
├── tsconfig.json                  # TypeScript config
└── package.json                   # Dependencies
```

## 🎨 Customization

### Modifying Colors

Edit `tailwind.config.ts` to adjust the G2 color palette:

```typescript
colors: {
  rorange: {
    DEFAULT: '#FF492C',
    dark: '#B21800',
    light: '#FF7761',
  },
  // ... other colors
}
```

### Adding Sample Data

Edit `lib/storage.ts` to modify the `initializeSampleData()` function with your own expert profiles, transcripts, and conversations.

### Styling Components

Global component styles are defined in `app/globals.css` under the `@layer components` section.

## 🔗 Navigation

The prototype includes a persistent navigation bar with:
- G2 logo and branding
- Links to all three screens
- Active page highlighting
- Mobile-responsive menu

## ⚠️ Notes

- This is a **prototype** for demonstration purposes
- All data is stored locally in the browser
- No backend server or API is required
- Sample data resets when localStorage is cleared

## 📄 License

This is a prototype for internal G2 evaluation.

## 🤝 Contributing

This is a prototype project. For questions or modifications, contact the product team.

---

**Built with** ❤️ **using G2 Brand Guidelines**
