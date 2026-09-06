# Portfolio Website

Personal portfolio website built with SvelteKit and Tailwind CSS.

## 🚀 Tech Stack

- **SvelteKit** - Web framework
- **Tailwind CSS** - Styling
- **shadcn-svelte** - UI components
- **UnoCSS** - Icons & fonts
- **Docker** - Containerization

## 📦 Installation

```bash
# Clone repository
git clone https://github.com/iqbalrsyd/portofolio-website.git
cd portofolio-website

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🛠️ Development

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Format code
npm run format

# Lint
npm run lint
```

## 🐳 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d --build

# Stop containers
docker-compose down

# View logs
docker-compose logs -f
```

For the complete VPS deployment guide, see [TUTORIAL-VPS-NAT-PUBLIC.md](docs/TUTORIAL-VPS-NAT-PUBLIC.md).

## 📝 Customize

Edit your portfolio data in:

- `src/lib/data/home.ts` - Homepage content
- `src/lib/data/projects.ts` - Projects
- `src/lib/data/experience.ts` - Work experience
- `src/lib/data/education.ts` - Education
- `src/lib/data/skills.ts` - Skills
- `static/` - Images, logos, and resume PDF

## 📄 License

MIT
