import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  return (
    <>
     <div className="test text-blue-900 size-10">
        Hello, world!
     </div>
    </>
  )
}

export default App
