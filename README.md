# Mobile Consumer Kit

A comprehensive toolkit for mobile app developers and marketers, providing powerful analysis and automation tools for app store optimization, user engagement, and development efficiency.

## 🚀 Features

### Core Tools
- **Idea Scan** - Get expert feedback on your app ideas from industry veterans
- **Reviews Scan** - Analyze app reviews to identify user pain points and feature requests
- **ASO Scan** - Optimize app store listings with keyword analysis and ASO recommendations
- **Socials Scan** - Track and analyze social media performance across multiple accounts
- **OTG Control** - Control and automate device farms for testing and automation
- **Voice Control** - Voice-powered automation for development workflows

## 🏗️ Architecture

### Project Structure
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (shadcn/ui)
│   ├── common/          # Shared business components
│   ├── aso/             # ASO-specific components
│   ├── farm/            # OTG Control components
│   ├── idea-scan/       # Idea Scan components
│   ├── tiktok/          # Social media components
│   └── voice/           # Voice control components
├── pages/               # Route components
├── services/            # API services and business logic
├── utils/               # Utility functions and helpers
├── hooks/               # Custom React hooks
└── data/                # Static data and configurations
```

### Page Components

All page components follow a unified structure:

#### 1. **Imports & Dependencies**
- React core imports
- UI components from design system
- Business logic components
- Custom hooks and utilities
- Feature-specific services

#### 2. **TypeScript Interfaces**
- Well-defined interfaces for all data structures
- Comprehensive JSDoc documentation
- Type safety throughout the component

#### 3. **Component Structure**
```typescript
/**
 * [PageName] page component
 * [Brief description of purpose and functionality]
 */
const PageName = () => {
  // State management
  // Effect hooks
  // Event handlers with JSDoc
  // Render logic
};
```

#### 4. **Common Patterns**
- **Navigation**: Consistent back button implementation
- **Feature Gates**: API key and tool selection validation
- **Error Handling**: Toast notifications for user feedback
- **Loading States**: Unified loading indicators
- **Responsive Design**: Mobile-first approach

## 🛠️ Technical Stack

- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Routing**: React Router v6
- **State Management**: React hooks (useState, useEffect)
- **Build Tool**: Vite
- **Package Manager**: npm/yarn

## 🎨 Design System

### Color Tokens
The project uses semantic color tokens defined in `src/index.css`:
- Primary colors for brand elements
- Secondary colors for supporting UI
- Muted colors for text and backgrounds
- Status colors for alerts and feedback

### Component Variants
- Consistent button variants across all tools
- Unified card layouts and spacing
- Standardized form inputs and validation
- Responsive breakpoints and mobile adaptations

## 🔧 Configuration

### API Keys Setup
Each tool requires specific API keys:
- **OpenAI API**: Used by Idea Scan, OTG Control, Voice Control
- **RapidAPI Key**: Used by Reviews Scan, ASO Scan
- **Apify API**: Used by Socials Scan

### Tool Selection
Users can enable/disable tools in the Settings page. Only enabled tools with valid API keys are accessible.

## 📱 Responsive Design

- **Mobile-first**: Optimized for mobile devices
- **Tablet support**: Enhanced layouts for medium screens
- **Desktop**: Full-featured experience on large screens
- **Touch-friendly**: Appropriate touch targets and gestures

## 🔒 Security & Privacy

- **Client-side storage**: API keys stored in localStorage
- **No server dependencies**: All processing happens client-side
- **Privacy-focused**: No user data collection or tracking
- **Secure API calls**: All external APIs called directly from client

## 🚦 Development Guidelines

### Code Standards
- **TypeScript**: Strict typing for all components
- **JSDoc**: Comprehensive documentation for all functions
- **ESLint**: Code quality and consistency enforcement
- **Prettier**: Automated code formatting

### Component Guidelines
- **Single Responsibility**: Each component has one clear purpose
- **Reusability**: Components designed for reuse across tools
- **Props Interface**: Well-defined prop interfaces with defaults
- **Error Boundaries**: Graceful error handling

### State Management
- **Local State**: useState for component-specific state
- **Side Effects**: useEffect for API calls and subscriptions
- **Custom Hooks**: Shared logic extracted to custom hooks
- **Context**: Minimal use, only for truly global state

## 🔄 Contributing

### Adding New Tools
1. Create page component in `src/pages/`
2. Add tool configuration in `src/data/tools.ts`
3. Create tool-specific components in `src/components/[tool-name]/`
4. Add route to `src/App.tsx`
5. Update settings page tool list

### Code Review Guidelines
- **Functionality**: Does it work as expected?
- **Performance**: Are there any performance implications?
- **Accessibility**: Is it accessible to all users?
- **Documentation**: Is it properly documented?
- **Testing**: Are edge cases handled?

## 📊 Performance

- **Bundle Splitting**: Route-based code splitting
- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: Responsive images with proper sizing
- **API Optimization**: Debounced API calls and caching

## 🧪 Testing Strategy

- **Unit Tests**: Component logic and utility functions
- **Integration Tests**: Page-level functionality
- **E2E Tests**: Critical user workflows
- **Accessibility Tests**: Screen reader and keyboard navigation

## 📈 Future Roadmap

- **Additional Tools**: More analysis and automation tools
- **Enhanced Analytics**: Better performance tracking
- **Collaboration Features**: Team sharing and collaboration
- **Mobile App**: Native mobile application
- **Enterprise Features**: Advanced features for larger teams

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions, please refer to the documentation or create an issue in the repository.
