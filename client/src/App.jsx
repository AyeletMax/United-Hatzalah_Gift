import './App.css'
import './theme.css'
import Hero from './components/Hero.jsx'
import CategoryPuzzleGrid from './components/CategoryPuzzleGrid.jsx'

const categories = [
  { id: 'car', title: 'לרכב', icon: '🚗', color: '#fff2e9' },
  { id: 'textile', title: 'טקסטיל וביגוד', icon: '👕', color: '#e9f0ff' },
  { id: 'home', title: 'כלי בית', icon: '🍽️', color: '#f1f7ff' },
  { id: 'judaica', title: 'יודאיקה', icon: '🕯️', color: '#fff7f0' },
];

function App() {
  return (
    <>
      <Hero />
      <CategoryPuzzleGrid categories={categories} onSelect={(c)=>console.log('selected', c)} />
    </>
  )
}

export default App
