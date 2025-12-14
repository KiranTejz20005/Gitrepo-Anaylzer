# 🔍 GitHub Profile Analyzer

An intelligent AI-powered tool that provides professional-grade analysis of GitHub profiles using Google's Gemini AI. Get comprehensive insights into your coding profile, repository quality, technical skills, and career trajectory.

## ✨ Features

### 🎯 Professional Analysis
- **Profile Scoring**: 0-100 score based on portfolio quality and engineering maturity
- **Professional Persona**: AI-generated professional title based on your work
- **Technical Skills Assessment**: Top 5-7 inferred technical skills and architectural patterns
- **Career Guidance**: Strategic advice for career growth and personal branding

### 📊 Repository Insights
- **Individual Repository Scores**: Quality assessment for each repository
- **Completeness Rating**: Low/Medium/High ratings for project maturity
- **Technical Summaries**: Problem-solving approach analysis
- **Strengths & Weaknesses**: Detailed feedback on code quality and architecture
- **Actionable Suggestions**: Concrete improvements for each project

### 📈 Contribution Analytics
- **Total Contributions**: Aggregated contribution count
- **Streak Tracking**: Current and longest contribution streaks
- **Language Distribution**: Visual breakdown of programming languages used
- **Repository Metrics**: Stars, forks, and activity tracking

### 💬 Interactive AI Chat
- **Context-Aware Conversations**: Ask questions about your profile analysis
- **Technical Guidance**: Get specific advice on repositories and skills
- **Career Consulting**: Personalized career development recommendations

### 🎨 Beautiful UI/UX
- Modern, dark-themed interface with ambient background effects
- Responsive design for all screen sizes
- Interactive data visualizations with Recharts
- Smooth animations and transitions

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **Gemini API Key** - Get one from [Google AI Studio](https://aistudio.google.com/app/apikey)
- **GitHub Personal Access Token** (optional, for higher rate limits)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd github-profile-analyzer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   API_KEY=your_gemini_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:5173` (or the URL shown in your terminal)

### Build for Production

```bash
npm run build
npm run preview
```

## 📖 Usage

1. **Enter GitHub Username**: Type any GitHub username or paste a profile URL
2. **Optional Token**: Click the settings icon to add a GitHub token for higher rate limits
3. **Analyze**: Click "Analyze Profile" and wait for AI analysis
4. **Explore Results**: 
   - View overall profile score and insights
   - Browse individual repository analyses
   - Filter by language or sort by various metrics
   - Chat with AI for detailed questions

## 🏗️ Project Structure

```
github-profile-analyzer/
├── components/
│   ├── AnalysisView.tsx      # Main analysis results display
│   ├── ChatWidget.tsx         # Interactive AI chat interface
│   ├── RepoCard.tsx          # Individual repository card
│   └── ScoreGauge.tsx        # Visual score gauge component
├── services/
│   ├── githubService.ts      # GitHub API integration
│   └── geminiService.ts      # Gemini AI integration
├── App.tsx                   # Main application component
├── types.ts                  # TypeScript type definitions
├── index.tsx                 # Application entry point
├── index.html                # HTML template
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Project dependencies
```

## 🛠️ Technologies Used

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling (via inline classes)
- **Lucide React** - Icon library
- **Recharts** - Data visualization

### APIs & Services
- **Google Gemini AI** - Profile analysis and chat
- **GitHub REST API** - Profile and repository data
- **GitHub Contributions API** - Contribution statistics

## 🔑 API Keys & Rate Limits

### Gemini API Key (Required)
- Get your key from [Google AI Studio](https://aistudio.google.com/app/apikey)
- Free tier includes generous quota
- Set in `.env.local` as `API_KEY`

### GitHub Personal Access Token (Optional)
- Without token: 60 requests/hour
- With token: 5,000 requests/hour
- Create token at [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
- Input directly in the app via settings icon

## 📊 Analysis Methodology

The analyzer evaluates profiles based on:

1. **Repository Quality**: Code structure, documentation, testing, CI/CD
2. **Technical Diversity**: Variety of languages and technologies
3. **Engineering Maturity**: Architecture patterns, best practices
4. **Community Impact**: Stars, forks, contributions
5. **Consistency**: Regular contributions and maintenance
6. **Professional Branding**: README quality, project presentation

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Google Gemini AI for powerful analysis capabilities
- GitHub for comprehensive developer APIs
- Recharts for beautiful data visualizations
- The open source community for inspiration

## 📬 Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the troubleshooting section below

## 🔧 Troubleshooting

**Rate Limit Errors**: Add a GitHub Personal Access Token in settings

**API Key Missing**: Ensure `.env.local` file exists with `API_KEY` set

**No Repositories Found**: The user must have public repositories to analyze

**Analysis Failed**: Check your internet connection and API key validity

---

<div align="center">
  Made with ❤️ by Kiran
</div>
