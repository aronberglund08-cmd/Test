import { Route, Routes } from "react-router-dom"
import RecipeDetail from "./components/RecipeDetail.tsx"
import RecipeList from "./components/RecipeList.tsx"
import "./App.css"

export default function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<RecipeList />} />
        <Route path="/recept/:id" element={<RecipeDetail />} />
      </Routes>
    </div>
  )
}
