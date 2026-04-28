# Recipe Pinterest 🍳

A Pinterest-style web application for creating and sharing recipe cards with beautiful Markdown formatting.

## Features

- ✨ Create recipe cards with title, image URL, and description
- 📝 Full Markdown support for recipe descriptions (headers, lists, bold, italic, code blocks, tables, etc.)
- 💾 Local storage persistence - your recipes are saved automatically
- 🎨 Beautiful Pinterest-style card grid layout
- 📱 Responsive design that works on all devices
- 🔍 Click on any card to view the full recipe with formatted Markdown
- 🗑️ Delete recipes you no longer want

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

1. Navigate to the project directory:
```bash
cd recipe-pinterest
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Usage

### Creating a Recipe Card

1. Click the "+ Create New Recipe Card" button
2. Enter a title for your recipe
3. (Optional) Add an image URL
4. Write your recipe description using Markdown syntax
5. Click "Create Recipe Card"

### Markdown Examples

#### Ingredients List
```markdown
## Ingredients
- 2 cups all-purpose flour
- 1 cup sugar
- 3 large eggs
- 1 cup milk
```

#### Instructions
```markdown
## Instructions
1. Preheat oven to 350°F (175°C)
2. Mix dry ingredients in a bowl
3. Add wet ingredients and stir
4. Bake for 30 minutes
```

#### Tips and Notes
```markdown
**Tip:** Use room temperature eggs for best results.

*Note:* This recipe serves 4 people.
```

#### Tables
```markdown
| Ingredient | Amount |
|------------|--------|
| Flour      | 2 cups |
| Sugar      | 1 cup  |
```

## Technologies Used

- **React** - Frontend framework
- **Vite** - Build tool and dev server
- **react-markdown** - Markdown rendering
- **CSS3** - Styling with responsive design
- **LocalStorage** - Data persistence

## Project Structure

```
recipe-pinterest/
├── src/
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # Entry point
│   └── index.css        # Styles
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
└── package.json         # Dependencies and scripts
```

## License

MIT License - feel free to use this project for personal or commercial purposes.
