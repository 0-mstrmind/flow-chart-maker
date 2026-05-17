import './App.css'
import DrawingCanvas from "./components/DrawingCanvas"
import InputBox from "./components/InputBox"

function App() {

  return (
   <main className="relative min-h-screen bg-zinc-950 overflow-hidden">
    <InputBox />
    <DrawingCanvas />
   </main>
  )
}

export default App
