# Stepper

A step-by-step guiding chat panel for variance reduction - Browser Extension

## Overview

Stepper is a browser extension that provides step-by-step support guidance through a side panel interface. Users can describe their issues, and the extension matches them with relevant support articles from a local knowledge base, presenting solutions one step at a time.

## Features

- 🎯 **Intelligent Article Matching**: Automatically finds the best matching support article based on user's issue description
- 📋 **Step-by-Step Guidance**: Presents solutions one step at a time for better focus and comprehension
- ⬅️ **Navigation Controls**: Continue, Back, and Reset buttons for flexible navigation
- 📄 **Full Article View**: Option to view all steps at once
- ⚠️ **Feedback Mechanism**: "This didn't work" button for user feedback
- 🎨 **Modern UI**: Clean, intuitive interface with visual progress indicators
- 🌈 **Watercolor Theme**: Optional playful theme inspired by Monet's Water Lilies with animated stepping stones
- 🏗️ **Modular Architecture**: Separate modules for UI, retrieval, and step logic
- 🌐 **Remote KB Support**: Fetch knowledge base articles from a remote URL with automatic fallback to local mock KB
- 💾 **Smart Caching**: Cache fetched articles locally for better performance with automatic refresh on demand

## Architecture

The extension is built with a clean modular architecture:

- **`src/kb.js`**: Knowledge Base module - handles article storage and retrieval logic (mock KB)
- **`src/kb-loader.js`**: KB Loader module - fetches articles from remote URL, caches them, and falls back to mock KB
- **`src/stepper.js`**: Step Logic module - manages step navigation and state
- **`src/sidepanel.js`**: UI module - controls user interactions and view updates
- **`src/sidepanel.html`**: HTML structure for the side panel
- **`src/sidepanel.css`**: Modern styling for the UI
- **`src/watercolor-theme.css`**: Watercolor theme styling with pastel colors and animations
- **`src/background.js`**: Background service worker for extension setup
- **`src/options.html`**: Options page for configuring KB source URL, cache management, and theme selection

## Installation

### Chrome/Edge (Manifest V3)

1. Clone this repository or download the source code
2. Open Chrome/Edge and navigate to `chrome://extensions/` (or `edge://extensions/`)
3. Enable "Developer mode" using the toggle in the top right
4. Click "Load unpacked"
5. Select the `Stepper` directory
6. The extension icon should appear in your browser toolbar

### Using the Extension

1. Click the Stepper extension icon in your browser toolbar to open the side panel
2. Describe your issue in the text area (e.g., "My email is not sending")
3. Click "Find Solution" to search the knowledge base
4. Review the solution overview showing the total number of steps
5. Click "Start Steps" to begin the step-by-step guide
6. Use the navigation buttons:
   - **Continue**: Move to the next step
   - **Back**: Return to the previous step
   - **Reset**: Start over from step 1
   - **This didn't work**: Provide feedback about the step
   - **Open full article**: View all steps at once

### Configuring Remote Knowledge Base (Optional)

The extension can fetch articles from a remote JSON endpoint:

1. Right-click the Stepper extension icon and select "Options" (or go to `chrome://extensions/` and click "Extension options")
2. Enter your KB source URL (e.g., `https://api.example.com/kb-articles.json`)
3. Click "Test URL" to verify the connection
4. Click "Save URL" to persist the configuration
5. The extension will automatically fetch and cache articles from the remote source
6. If the URL is not set or fetch fails, the extension falls back to the built-in mock KB

**Remote KB Features:**
- **Automatic Caching**: Fetched articles are cached locally for better performance
- **Smart Fallback**: If remote fetch fails, uses cached KB or falls back to mock KB
- **Manual Refresh**: Refresh the cache on-demand via the Options page
- **Timestamp Tracking**: See when the KB was last updated

**Expected JSON Format:**
```json
[
  {
    "id": 1,
    "title": "Article Title",
    "keywords": ["keyword1", "keyword2"],
    "summary": "Brief summary of the issue and solution",
    "steps": [
      "Step 1 instructions",
      "Step 2 instructions"
    ]
  }
]
```

### Choosing a Theme (Optional)

Stepper offers two visual themes:

1. **Classic Theme** (Default): Modern, professional interface with clean lines and vibrant colors
2. **Watercolor Theme**: Playful, gentle theme inspired by Monet's Water Lilies and classic storybook illustrations

**To enable the Watercolor Theme:**

1. Right-click the Stepper extension icon and select "Options"
2. Scroll to the "Theme Settings" section
3. Check the "Enable Watercolor Theme" checkbox
4. The theme will be applied immediately to the side panel

**Watercolor Theme Features:**
- Soft pastel color palette (blues, greens, pinks, purples)
- Watercolor-style borders and backgrounds
- Animated stepping stones instead of a traditional progress bar
- Charming cartoon boy character that jumps across stepping stones as you progress through steps
- Gentle, hand-drawn aesthetic inspired by The Little Prince and Winnie-the-Pooh illustrations
- All functionality remains unchanged - only the visual appearance is enhanced

## Knowledge Base

The extension includes two knowledge base implementations:

### Simple Knowledge Base (`src/kb.js`)
A basic implementation with 5 sample support articles for:
- Email sending issues
- Password reset problems
- Application crashes
- Slow internet connection
- Printer troubleshooting

### Enhanced Knowledge Base (`src/kb.mock.js`)
A comprehensive data model with 8 realistic support articles featuring:

- **Detailed Step Information**: Each step includes internal description, expected outcome, and customer-facing instructions
- **Step Types**: Distinguish between action steps and verification checks
- **Prechecks**: Pre-flight validations before starting troubleshooting
- **Fallback Paths**: Alternative troubleshooting routes with trigger keywords and reason categories
- **Stop Conditions**: Clear success criteria for issue resolution
- **Escalation Procedures**: When and where to escalate unresolved issues

**Article Coverage:**
1. Email Not Sending - Outlook (2 fallback paths)
2. Email Not Sending - Gmail Web (1 fallback path)
3. Cannot Connect to WiFi Network (1 fallback path) - shares initial steps with #4
4. Ethernet Connection Not Working (1 fallback path) - shares initial steps with #3
5. Application Crashing on Startup (2 fallback paths)
6. Password Reset Link Not Working (1 fallback path)
7. Computer Running Slowly (1 fallback path)
8. Printer Not Responding (2 fallback paths)

**Special Features:**
- Articles #1 & #2 have overlapping content (email troubleshooting) for deduplication testing
- Articles #3 & #4 share the first 3 steps (network connectivity basics)
- Articles #1, #5, and #8 have multiple fallback paths for complex troubleshooting

See [docs/KB_DATA_MODEL.md](docs/KB_DATA_MODEL.md) for complete schema documentation and usage examples.

You can extend either knowledge base by adding more articles following the respective formats.

## Development

### Project Structure

```
Stepper/
├── manifest.json          # Extension manifest
├── src/
│   ├── background.js      # Background service worker
│   ├── kb.js             # Simple knowledge base module
│   ├── kb.mock.js        # Enhanced knowledge base with detailed model
│   ├── kb-loader.js      # KB loader with remote fetch and caching
│   ├── validate-kb.js    # Validation script for enhanced KB
│   ├── stepper.js        # Step navigation logic
│   ├── sidepanel.html    # Side panel HTML
│   ├── sidepanel.css     # Default theme styling
│   ├── watercolor-theme.css  # Watercolor theme styling
│   ├── sidepanel.js      # UI controller
│   └── options.html      # Extension options page
├── assets/
│   ├── icon16.png        # Extension icons
│   ├── icon48.png
│   └── icon128.png
├── docs/
│   └── KB_DATA_MODEL.md  # Enhanced data model documentation
└── README.md
```

### Extending the Knowledge Base

#### Simple Knowledge Base (`src/kb.js`)

To add new support articles, edit `src/kb.js` and add objects to the `knowledgeBase` array:

```javascript
{
  id: 6,
  title: "Your Article Title",
  keywords: ["keyword1", "keyword2", "keyword3"],
  summary: "Brief summary of the solution",
  steps: [
    "Step 1 instructions",
    "Step 2 instructions",
    // ... more steps
  ]
}
```

#### Enhanced Knowledge Base (`src/kb.mock.js`)

For the enhanced model, use the detailed schema:

```javascript
{
  id: 9,
  title: "Article Title",
  tags: ["tag1", "tag2"],
  product: "Product Name",
  version: "1.0",  // optional
  summary: "Brief summary",
  prechecks: ["Precheck 1", "Precheck 2"],
  steps: [
    {
      id: "step-9-1",
      text: "Internal description",
      expected: "Expected outcome",
      say_to_customer: "Customer-facing instruction",
      type: "action"  // or "check"
    }
  ],
  fallbacks: [
    {
      id: "fallback-9-1",
      trigger_keywords: ["keyword1", "keyword2"],
      reason_category: "category_name",
      steps: [/* step objects */]
    }
  ],
  stop_conditions: ["Condition 1", "Condition 2"],
  escalation: {
    when: "After X minutes or condition",
    target: "Team Name"
  }
}
```

Run `node src/validate-kb.js` to validate your changes.

### Customizing Themes

#### Classic Theme

The default UI styling can be customized by modifying the CSS variables in `src/sidepanel.css`:

```css
:root {
  --primary-color: #4f46e5;
  --primary-hover: #4338ca;
  /* ... more variables */
}
```

#### Watercolor Theme

The watercolor theme can be customized by modifying the CSS variables in `src/watercolor-theme.css`:

```css
body.watercolor-theme {
  /* Soft pastel color palette */
  --watercolor-blue: #a5c9e5;
  --watercolor-green: #b8d8be;
  --watercolor-pink: #e5b8c0;
  --watercolor-yellow: #f4e5a8;
  --watercolor-purple: #c5b9e5;
  /* ... more variables */
}
```

The stepping stones animation and cartoon boy character are implemented using CSS and JavaScript. The boy's SVG illustration can be customized in the `createSteppingStones()` function in `src/sidepanel.js`.
```

## Browser Compatibility

- ✅ Chrome 114+
- ✅ Edge 114+
- ✅ Other Chromium-based browsers with Manifest V3 support

## License

MIT License - Feel free to use and modify as needed.
