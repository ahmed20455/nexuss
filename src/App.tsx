import { Header } from "./components/Header"
import { SwapCard } from "./components/SwapCard"

function App() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Header />

      <main className="flex justify-center px-4 pt-16 pb-20">
        <SwapCard />
      </main>
    </div>
  )
}

export default App