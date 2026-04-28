import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'

function App() {
  const [recipes, setRecipes] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    description: ''
  })

  // Load recipes from localStorage on mount
  useEffect(() => {
    const savedRecipes = localStorage.getItem('recipes')
    if (savedRecipes) {
      setRecipes(JSON.parse(savedRecipes))
    }
  }, [])

  // Save recipes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('recipes', JSON.stringify(recipes))
  }, [recipes])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.description.trim()) {
      alert('Please fill in the title and description fields')
      return
    }

    const newRecipe = {
      id: Date.now(),
      title: formData.title.trim(),
      imageUrl: formData.imageUrl.trim() || 'https://via.placeholder.com/400x300?text=No+Image',
      description: formData.description.trim(),
      createdAt: new Date().toISOString()
    }

    setRecipes(prev => [newRecipe, ...prev])
    setFormData({ title: '', imageUrl: '', description: '' })
    setShowForm(false)
  }

  const handleDelete = (id, e) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this recipe?')) {
      setRecipes(prev => prev.filter(recipe => recipe.id !== id))
      if (selectedRecipe && selectedRecipe.id === id) {
        setSelectedRecipe(null)
      }
    }
  }

  const getPreviewText = (markdown) => {
    // Remove markdown syntax for preview
    return markdown
      .replace(/[#*`_\[\]()]/g, '')
      .split('\n')
      .filter(line => line.trim())
      .slice(0, 3)
      .join(' ')
      .substring(0, 150) + '...'
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🍳 Recipe Pinterest</h1>
        <p>Create and share your favorite recipes with beautiful markdown formatting</p>
      </header>

      {!showForm && (
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <button 
            className="btn" 
            onClick={() => setShowForm(true)}
            style={{ fontSize: '1.1rem', padding: '15px 30px' }}
          >
            + Create New Recipe Card
          </button>
        </div>
      )}

      {showForm && (
        <form className="create-form" onSubmit={handleSubmit}>
          <h2>✨ Create New Recipe Card</h2>
          
          <div className="form-group">
            <label htmlFor="title">Recipe Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter recipe title..."
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="imageUrl">Image URL (optional)</label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Recipe Description (Markdown supported) *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder={`## Ingredients\n- 2 cups flour\n- 1 cup sugar\n\n## Instructions\n1. Preheat oven to 350°F\n2. Mix ingredients...\n\n**Tips:** Use room temperature eggs for best results.`}
              required
            />
            <p style={{ marginTop: '8px', fontSize: '0.9rem', color: '#666' }}>
              💡 Support for Markdown: headers, lists, bold, italic, code blocks, tables, and more!
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" className="btn">
              Create Recipe Card
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => {
                setShowForm(false)
                setFormData({ title: '', imageUrl: '', description: '' })
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {recipes.length === 0 ? (
        <div className="empty-state">
          <h3>No recipes yet!</h3>
          <p>Click "Create New Recipe Card" to add your first recipe.</p>
        </div>
      ) : (
        <div className="cards-grid">
          {recipes.map(recipe => (
            <div 
              key={recipe.id} 
              className="card"
              onClick={() => setSelectedRecipe(recipe)}
            >
              <img 
                src={recipe.imageUrl} 
                alt={recipe.title}
                className="card-image"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'
                }}
              />
              <div className="card-content">
                <h3 className="card-title">{recipe.title}</h3>
                <p className="card-preview">{getPreviewText(recipe.description)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedRecipe && (
        <div className="modal-overlay" onClick={() => setSelectedRecipe(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close"
              onClick={() => setSelectedRecipe(null)}
            >
              ×
            </button>
            <img 
              src={selectedRecipe.imageUrl} 
              alt={selectedRecipe.title}
              className="modal-image"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/800x400?text=No+Image'
              }}
            />
            <div className="modal-content">
              <h2 className="modal-title">{selectedRecipe.title}</h2>
              <div className="markdown-content">
                <ReactMarkdown>{selectedRecipe.description}</ReactMarkdown>
              </div>
              <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #eee' }}>
                <button 
                  className="btn btn-secondary"
                  onClick={(e) => handleDelete(selectedRecipe.id, e)}
                >
                  🗑️ Delete Recipe
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
