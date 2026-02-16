# Learning Experience Designer

> A comprehensive course development assistant that transforms source materials into accessible, engaging learning experiences.

## Overview

This is an AI-powered web application that guides instructional designers through the complete ADDIE lifecycle—from needs analysis to design document creation. Built with evidence-based learning principles including Zone of Proximal Development (ZPD), multimodal learning (VARK), meaningful interactivity, and WCAG 2.0 accessibility standards.

## Key Features

### 📚 Source Materials Management
- Upload and analyze PDFs, Word docs, PowerPoint, videos, and existing courses
- Automatic text extraction and content analysis
- AI-powered identification of key concepts and learning objectives
- Material library with search, tagging, and organization

### 🎯 Three Core Workflows

**1. Needs Analysis**
- Guided interview process for discovering real training needs
- Performance gap analysis and root cause identification
- Material-informed questions and recommendations
- Comprehensive analysis reports

**2. Course Scaffolding & Outline Builder**
- AI-generated course structures based on source materials
- Bloom's taxonomy alignment
- VARK modality distribution tracking
- Visual hierarchical outline editor

**3. Design Document Generator**
- Dual-track output: learner view + developer notes
- Pulls content directly from uploaded materials
- Accessibility specifications (WCAG 2.0 Level AA)
- Multiple format support (ILT, e-learning, video, job aids)

### ✅ Quality Assurance Tools
- **Alignment Checker**: Verify assessments match objectives
- **Bloom's Analyzer**: Ensure appropriate cognitive levels
- **Multimodal Coverage**: Check VARK distribution
- **ZPD Validator**: Confirm optimal challenge level
- **Interactivity Scorer**: Detect "fake" vs meaningful interactions
- **Accessibility Validator**: WCAG 2.0 compliance checker

## Evidence-Based Design Principles

This tool is built on research-backed instructional design principles:

- **Zone of Proximal Development (ZPD)**: Target achievable challenge with scaffolding
- **Multimodal Learning (VARK)**: Visual, Auditory, Read/Write, Kinesthetic coverage
- **Meaningful Interactivity**: Decisions with consequences, not cosmetic clicks
- **Universal Design**: WCAG 2.0 accessibility built in from the start
- **ADDIE Methodology**: Systematic instructional design process

## Built With

- **React** - Frontend framework
- **Local Storage** - Initial data persistence (cloud integration planned)
- **AI Integration** - Powered by Claude for intelligent content generation

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/id-agent.git

# Navigate to project directory
cd id-agent

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` to use the application.

## Usage

1. **Upload Source Materials**: Drag and drop PDFs, documents, or paste URLs
2. **Start Needs Analysis**: Let the AI guide you through discovering training needs
3. **Build Course Outline**: Generate structure based on your materials and analysis
4. **Create Design Documents**: Generate complete learner content + developer notes
5. **Run Quality Checks**: Validate alignment, accessibility, and interactivity
6. **Export Deliverables**: Download as Word, PDF, or PowerPoint

## Project Structure
```
id-agent/
├── CLAUDE.md              # AI agent's knowledge base (ID best practices)
├── src/
│   ├── components/        # React components
│   ├── features/          # Core workflows (needs analysis, scaffolding, etc.)
│   ├── utils/             # Helper functions
│   └── App.jsx           # Main application
├── public/               # Static assets
└── README.md            # This file
```

## Customization

Edit the `CLAUDE.md` file to customize the agent's knowledge base with:
- Your organization's instructional design standards
- Client-specific branding guidelines
- Industry-specific terminology and examples
- Custom assessment rubrics and templates

## Roadmap

- [ ] Cloud storage integration (Google Drive, Dropbox, OneDrive)
- [ ] Supabase database for persistent storage
- [ ] Team collaboration features
- [ ] LMS export (SCORM 1.2, SCORM 2004, xAPI)
- [ ] Video/audio transcription service integration
- [ ] Advanced analytics and reporting
- [ ] Mobile app version

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [Claude Code](https://claude.ai/code) for AI-assisted development
- Instructional design principles based on Vygotsky's ZPD, VARK framework, and WCAG 2.0 standards
- Inspired by the need for better, faster, more accessible course development tools

## Support

For questions or issues, please open an issue on GitHub or contact [your email].

---

**Note**: This tool is designed for instructional designers, learning experience designers, course developers, and training professionals who want to create high-quality, accessible learning experiences faster and more effectively.
