# 🍎 GhEHR System - macOS Setup Guide

## Fresh Installation (Windows → macOS Migration)

This guide helps you set up the GhEHR system on macOS after cloning from a Windows-developed repository.

### Prerequisites

- macOS with Xcode Command Line Tools
- Node.js v18+ (you have v22.17.1 ✅)
- npm v9+ (you have v10.9.2 ✅)
- Git configured

### Quick Start

```bash
# 1. Clone the repository (if you haven't already)
git clone https://github.com/Deen-Hayatu/ghehr-system.git
cd ghehr-system

# 2. Run the macOS setup script
./start-macos.sh
```

### Manual Setup

If you prefer to set up manually:

```bash
# 1. Install backend dependencies
cd backend
npm install
npm run build
cd ..

# 2. Install frontend dependencies
cd frontend
npm install
cd ..

# 3. Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env if needed (PORT=5001 is already set)

# 4. Start backend (in one terminal)
cd backend
npm start

# 5. Start frontend (in another terminal)
cd frontend
npm start
```

### Default URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Health Check**: http://localhost:5001/health

### macOS-Specific Optimizations Applied

✅ **Line Endings**: Configured Git for Unix line endings  
✅ **Shell Scripts**: Made all .sh files executable  
✅ **VS Code Settings**: macOS-optimized TypeScript/React development  
✅ **Terminal Integration**: zsh configured as default shell  
✅ **File Watchers**: Optimized for macOS file system performance  

### VS Code Integration

The project includes macOS-optimized VS Code settings:
- TypeScript IntelliSense tuned for relative imports
- ESLint configured for frontend/backend workspace
- Auto-formatting enabled
- macOS terminal integration (zsh)

### Available Scripts

From project root:
- `./start-macos.sh` - Start both servers
- `./start-frontend.sh` - Start only frontend
- `./start-backend.sh` - Start only backend

From backend directory:
- `npm run build` - Build TypeScript
- `npm start` - Run compiled backend
- `npm run dev` - Run with nodemon (development)

From frontend directory:
- `npm start` - Start React development server
- `npm run build` - Create production build
- `npm test` - Run tests

### Troubleshooting

**Port Already in Use:**
```bash
# Find process using port 5001
lsof -i :5001
# Kill the process
kill -9 [PID]
```

**Permission Issues:**
```bash
# Fix shell script permissions
chmod +x *.sh
```

**Node Modules Issues:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Windows → macOS Migration Notes

- All shell scripts have been converted to Unix line endings
- VS Code settings optimized for macOS development
- Git configured for cross-platform compatibility
- npm scripts work identically on both platforms
- Environment variables use Unix-style paths

### Development Workflow

1. **Daily Development**: Use `./start-macos.sh`
2. **Backend Only**: `cd backend && npm run dev`
3. **Frontend Only**: `cd frontend && npm start`
4. **Production Build**: 
   ```bash
   cd backend && npm run build
   cd ../frontend && npm run build
   ```

### Security Considerations

- Change JWT_SECRET in backend/.env for production
- Review npm audit warnings (mostly dev dependencies)
- Configure proper CORS origins for production

---

**System Status**: ✅ Ready for development  
**Last Updated**: July 29, 2025  
**Platform**: macOS Sonoma+
