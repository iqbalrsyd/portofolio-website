# Personal Portfolio Website

---

A modern, responsive portfolio website built with **SvelteKit 5** and **TypeScript** to showcase my professional experience, technical skills, and project portfolio. Developed from the [slick-portfolio-svelte-5](https://github.com/RiadhAdrani/slick-portfolio-svelte-5) template with extensive customizations to meet personal requirements.

<br/>

## 📊 Overview

Professional portfolio website designed for recruiters and HR professionals to quickly assess technical capabilities, work experience, and project achievements. Features a clean, Vercel-inspired design with smooth animations and intuitive navigation.

**Live Site:** Deployed on Vercel with automatic CI/CD integration

<br/>

## 🎯 Key Features

**Content Management:**
- Dynamic project showcase with detailed markdown documentation
- Skills categorization with proficiency levels
- Work experience timeline with accomplishments
- Education history and certifications
- Integrated resume viewer

**Technical Highlights:**
- Server-side rendering for optimal SEO
- Static site generation for fast loading
- Responsive design (mobile, tablet, desktop)
- Dark/light mode toggle with system preference detection
- Smooth page transitions and animations
- Markdown support for rich project documentation

**User Experience:**
- Search functionality across projects and skills
- Project filtering by technology stack
- Direct links to live demos and GitHub repositories
- PDF resume download option
- Contact information with social links

<br/>

## 🛠️ Tech Stack

**Frontend Framework:**
- **SvelteKit 5** - Modern reactive framework with SSR/SSG
- **TypeScript** - Type-safe development
- **Vite** - Fast build tooling

**UI/Styling:**
- **shadcn-svelte** - Reusable component library
- **Tailwind CSS** - Utility-first styling
- **UnoCSS** - Icons and typography
- **Mode Watcher** - Theme switching utility

**Content & Documentation:**
- **Marked** - Markdown parsing
- **Prism.js** - Syntax highlighting for code blocks
- **DOMPurify** - XSS protection for markdown content

**Deployment & DevOps:**
- **Vercel** - Hosting with auto-deployment
- **Docker** - Containerized deployment option
- **Nginx** - Reverse proxy for VPS hosting
- **GitHub Actions** - CI/CD pipeline

<br/>

## 💡 Customizations & Development

Built upon the slick-portfolio-svelte-5 template with significant modifications:

**Content Structure:**
- Reorganized data architecture for better scalability
- Added markdown file support for detailed project documentation
- Implemented separate markdown files for major projects
- Created custom data schemas for projects, skills, and experience

**Feature Additions:**
- Docker deployment configuration with Nginx
- VPS NAT deployment setup with resource optimization
- Memory-optimized container (~5MB RAM usage)
- Multiple deployment options (Vercel, VPS, GitHub Pages)
- Cloudflare integration guide for production setup

**Performance Optimizations:**
- Static adapter configuration for optimal loading
- Image optimization and lazy loading
- Minimized bundle size
- Efficient caching strategies
- Resource limits for Docker deployment

**Development Workflow:**
- TypeScript for type safety
- ESLint and Prettier for code quality
- Git-based version control
- Automated deployment pipeline

<br/>

## 📈 Development Process

**Planning & Design:**
- Analyzed HR requirements for portfolio content
- Designed information architecture
- Selected appropriate tech stack

**Implementation:**
- Forked and customized template
- Migrated content to structured data format
- Created detailed markdown documentation for key projects
- Implemented responsive layouts

**Deployment:**
- Configured multiple deployment targets
- Optimized Docker images for minimal resource usage
- Set up CI/CD with GitHub Actions
- Tested across different hosting platforms

**Optimization:**
- Reduced Docker memory footprint to <10MB
- Implemented efficient static site generation
- Optimized build process
- Added monitoring and analytics

<br/>

## 🎓 Key Learnings

**SvelteKit & Modern Frontend:**
- Server-side rendering vs static generation trade-offs
- Component composition and reusability
- State management in reactive frameworks
- Build-time optimizations

**DevOps & Deployment:**
- Docker containerization best practices
- Memory optimization techniques
- Multi-platform deployment strategies
- VPS management and configuration

**Content Strategy:**
- Structuring technical content for HR review
- Balancing detail with brevity
- Markdown for maintainable documentation
- Portfolio presentation best practices

<br/>

## 🚀 Deployment Options

**Production (Vercel):**
- Automatic deployment on git push
- Global CDN distribution
- Built-in SSL/HTTPS
- Zero configuration setup

**Alternative (VPS with Docker):**
- Self-hosted with full control
- Nginx reverse proxy
- Resource-optimized containers
- Suitable for custom requirements

**Development:**
- Local development server with hot reload
- Preview builds for testing
- Environment-specific configurations

<br/>

## 📁 Project Structure

```
src/
├── lib/
│   ├── components/    # Reusable UI components
│   ├── data/          # Content data (projects, skills, experience)
│   │   └── md/        # Markdown files for detailed docs
│   └── utils.ts       # Helper functions
└── routes/            # SvelteKit pages and routing
```

<br/>

## 🔧 Tech Decisions

**Why SvelteKit:**
- Smaller bundle sizes vs React/Vue
- Better performance with compile-time optimization
- Built-in SSR/SSG support
- Developer experience

**Why Static Generation:**
- No backend required for portfolio content
- Faster loading times
- Lower hosting costs
- Better SEO

**Why Docker:**
- Consistent deployment across platforms
- Easy scaling and resource management
- Isolated environment
- Simplified dependency management

<br/>

---

*A showcase of modern web development practices combining performance, scalability, and maintainability*
