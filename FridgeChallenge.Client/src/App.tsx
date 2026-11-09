
import { useEffect, useState } from 'react'

type Ingredient = {
  id: number
  name: string
  quantity: number
  unit: string
  expiryDate: string | null
  createdAt?: string
}

const API_URL = 'http://localhost:5233/api/ingredients'

function App() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [newName, setNewName] = useState('')
  const [newQuantity, setNewQuantity] = useState('1')
  const [newUnit, setNewUnit] = useState('pcs')
  const [newExpiryDate, setNewExpiryDate] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editQuantity, setEditQuantity] = useState('1')
  const [editUnit, setEditUnit] = useState('pcs')
  const [editExpiryDate, setEditExpiryDate] = useState('')




  // Backend-dən məhsulları gətiririk
  async function loadIngredients() {
    try {
      setError('')

      const response = await fetch(API_URL)

      if (!response.ok) {
        throw new Error('Məhsulları yükləmək mümkün olmadı.')
      }

      const data: Ingredient[] = await response.json()
      setIngredients(data)
    } catch {
      setError('Backend ilə əlaqə qurulmadı. Backend serverini yoxla.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadIngredients()
  }, [])

  // Yeni məhsul əlavə edirik
  async function addIngredient(e: React.FormEvent) {
    e.preventDefault()

    if (!newName.trim() || Number(newQuantity) <= 0) return

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newName,
          quantity: Number(newQuantity),
          unit: newUnit,
          expiryDate: newExpiryDate
            ? `${newExpiryDate}T00:00:00.000Z`
            : null,
        }),
      })

      if (!response.ok) {
        throw new Error('Məhsul əlavə edilmədi.')
      }

      const savedIngredient: Ingredient = await response.json()

      setIngredients(previous => [...previous, savedIngredient])

      setNewName('')
      setNewQuantity('1')
      setNewUnit('pcs')
      setNewExpiryDate('')
      setError('')
    } catch {
      setError('Məhsul əlavə edilərkən xəta baş verdi.')
    }
  }

  // Məhsulu verilənlər bazasından silirik
  function startEditing(item: Ingredient) {
  setEditingId(item.id)
  setEditName(item.name)
  setEditQuantity(String(item.quantity))
  setEditUnit(item.unit)
  setEditExpiryDate(item.expiryDate?.slice(0, 10) || '')
}

function cancelEditing() {
  setEditingId(null)
  setEditName('')
  setEditQuantity('1')
  setEditUnit('pcs')
  setEditExpiryDate('')
}

async function updateIngredient(e: React.FormEvent) {
  e.preventDefault()

  if (editingId === null || !editName.trim() || Number(editQuantity) <= 0) {
    return
  }

  try {
    const response = await fetch(`${API_URL}/${editingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: editName,
        quantity: Number(editQuantity),
        unit: editUnit,
        expiryDate: editExpiryDate
          ? `${editExpiryDate}T00:00:00.000Z`
          : null,
      }),
    })

    if (!response.ok) {
      throw new Error('Update failed')
    }

    const updatedIngredient: Ingredient = await response.json()

    setIngredients(previous =>
      previous.map(item =>
        item.id === editingId ? updatedIngredient : item
      )
    )

    cancelEditing()
    setError('')
  } catch {
    setError('Məhsul yenilənərkən xəta baş verdi.')
  }
}
  async function deleteIngredient(id: number) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Məhsul silinmədi.')
      }

      setIngredients(previous =>
        previous.filter(item => item.id !== id)
      )
    } catch {
      setError('Məhsul silinərkən xəta baş verdi.')
    }
  }

  const filteredIngredients = ingredients.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  )

  const today = new Date().toISOString().slice(0, 10)

  const expiringCount = ingredients.filter(item => {
    if (!item.expiryDate) return false

    const expiry = item.expiryDate.slice(0, 10)
    const daysLeft =
      (new Date(`${expiry}T00:00:00Z`).getTime() -
        new Date(`${today}T00:00:00Z`).getTime()) /
      (1000 * 60 * 60 * 24)

    return daysLeft >= 0 && daysLeft <= 7
  }).length
  const expiredCount = ingredients.filter(item => {
  if (!item.expiryDate) return false

  return item.expiryDate.slice(0, 10) < today
  }).length




  function getExpiryStatus(expiryDate: string | null) {
  if (!expiryDate) {
    return {
      label: 'No expiry date',
      color: 'text-gray-400',
      background: 'bg-gray-500/10',
    }
  }

  const todayDate = new Date()
  todayDate.setHours(0, 0, 0, 0)

  const expiry = new Date(expiryDate.slice(0, 10) + 'T00:00:00')
  const daysLeft = Math.ceil(
    (expiry.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (daysLeft < 0) {
    return {
      label: 'Expired',
      color: 'text-red-400',
      background: 'bg-red-500/10',
    }
  }

  if (daysLeft <= 7) {
    return {
      label: 'Expiring soon',
      color: 'text-yellow-400',
      background: 'bg-yellow-500/10',
    }
  }

  return {
    label: 'Fresh',
    color: 'text-green-400',
    background: 'bg-green-500/10',
  }
}
  return (
    <div className="min-h-screen bg-[#0b1120] text-white">
      <div className="flex min-h-screen">

        <aside className="hidden w-64 border-r border-white/10 bg-[#101827] p-6 md:block">
          <div className="mb-12 flex items-center gap-3">
            <div className="rounded-xl bg-green-500/20 p-3 text-2xl">🥬</div>
            <div>
              <h1 className="text-xl font-bold">
                Fridge<span className="text-green-400">Challenge</span>
              </h1>
              <p className="text-xs text-gray-500">Smart food management</p>
            </div>
          </div>

          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray-500">
            Menu
          </p>

          <nav className="space-y-2">
            <div className="rounded-xl bg-green-500/15 px-4 py-3 font-medium text-green-400">
              🏠 Dashboard
            </div>
            <div className="rounded-xl px-4 py-3 text-gray-400">
              🧊 My Inventory
            </div>
            <div className="rounded-xl px-4 py-3 text-gray-400">
              🍳 Recipes
            </div>
            <div className="rounded-xl px-4 py-3 text-gray-400">
              🎯 Challenges
            </div>
            <div className="rounded-xl px-4 py-3 text-gray-400">
              ⭐ Favorites
            </div>
          </nav>

          <div className="mt-16 rounded-2xl border border-green-500/20 bg-green-500/10 p-4">
            <p className="mb-2 text-2xl">🌱</p>
            <p className="font-semibold">Reduce food waste!</p>
            <p className="mt-1 text-sm text-gray-400">
              Save food, save money and protect the planet.
            </p>
          </div>
        </aside>

        <main className="min-w-0 flex-1 p-5 md:p-10">

          <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-gray-400">Your smart kitchen</p>
              <h2 className="mt-2 text-3xl font-bold">
                Your Kitchen Dashboard 👋
              </h2>
              <p className="mt-2 text-gray-400">
                Let's make something delicious today.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#172235] px-4 py-3">
              <span className="text-sm text-gray-400">Your level</span>
              <p className="font-bold text-green-400">🌱 Beginner · 120 XP</p>
            </div>
          </header>

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
              {error}
            </div>
          )}

          <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-2xl border border-white/10 bg-[#131e30] p-5">
              <p className="text-sm text-gray-400">Total ingredients</p>
              <p className="mt-3 text-3xl font-bold">{ingredients.length}</p>
              <p className="mt-2 text-sm text-green-400">In your inventory</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#131e30] p-5">
              <p className="text-sm text-gray-400">Expiring soon</p>
              <p className="mt-3 text-3xl font-bold">{expiringCount}</p>
              <p className="mt-2 text-sm text-yellow-400">Next 7 days</p>
            </div>

            <div className="rounded-2xl border border-red-500/20 bg-[#131e30] p-5">
  <p className="text-sm text-gray-400">Expired ingredients</p>
  <p className="mt-3 text-3xl font-bold text-red-400">
    {expiredCount}
  </p>
  <p className="mt-2 text-sm text-red-400">
    Needs attention!
  </p>
</div>

            <div className="rounded-2xl border border-white/10 bg-[#131e30] p-5">
              <p className="text-sm text-gray-400">Recipes available</p>
              <p className="mt-3 text-3xl font-bold">Coming soon</p>
              <p className="mt-2 text-sm text-blue-400">AI recipe generator</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#131e30] p-5">
              <p className="text-sm text-gray-400">Food saved</p>
              <p className="mt-3 text-3xl font-bold">0 kg</p>
              <p className="mt-2 text-sm text-green-400">Track your progress</p>
            </div>
          </section>

          <section className="mb-8 rounded-2xl border border-green-500/20 bg-gradient-to-r from-green-900/30 to-[#172235] p-7">
            <div className="max-w-xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-green-400">
                Today's recommendation
              </p>
              <h3 className="text-2xl font-bold">What's in your fridge?</h3>
              <p className="mt-2 text-gray-300">
                Discover recipes using the ingredients you already have.
                Waste less and cook smarter!
              </p>
              <button className="mt-5 rounded-xl bg-green-500 px-5 py-3 font-semibold text-black transition hover:bg-green-400">
                Explore recipes →
              </button>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-2">

            <div className="rounded-2xl border border-white/10 bg-[#131e30] p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold">My Inventory</h3>
                  <p className="mt-1 text-sm text-gray-400">
                    Manage your ingredients
                  </p>
                </div>

                <span className="rounded-lg bg-green-500/10 px-3 py-2 text-sm text-green-400">
                  {ingredients.length} items
                </span>
              </div>

              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search ingredients..."
                className="mb-4 w-full rounded-xl border border-white/10 bg-[#0b1120] px-4 py-3 outline-none focus:border-green-500"
              />

              {loading ? (
                <p className="py-5 text-center text-gray-400">
                  Loading ingredients...
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredIngredients.map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-xl bg-[#1b293d] p-4"
                    >
                      <div>
                        <p className="mt-1 text-sm text-gray-400">
  {item.quantity} {item.unit}
  {' · '}
  Expires: {item.expiryDate
    ? item.expiryDate.slice(0, 10)
    : 'Not specified'}
</p>

{(() => {
  const status = getExpiryStatus(item.expiryDate)

  return (
    <span className={`mt-2 inline-block rounded-lg px-2 py-1 text-xs font-medium ${status.color} ${status.background}`}>
      {status.label}
    </span>
  )
})()}
                      </div>

                      <div className="flex gap-2">
  <button
    onClick={() => startEditing(item)}
    className="rounded-lg px-3 py-2 text-sm text-blue-400 hover:bg-blue-500/10"
  >
    Edit
  </button>

  <button
    onClick={() => deleteIngredient(item.id)}
    className="rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
  >
    Delete
  </button>
</div>
                    </div>
                  ))}

                  {filteredIngredients.length === 0 && (
                    <p className="py-5 text-center text-gray-400">
                      No ingredients found.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#131e30] p-6">
              <h3 className="text-xl font-bold">Add Ingredient</h3>
              {editingId !== null && (
  <form onSubmit={updateIngredient} className="mt-6 space-y-4 rounded-xl border border-blue-500/30 bg-blue-500/5 p-4">
    <h3 className="font-bold text-blue-400">Edit Ingredient</h3>

    <input
      value={editName}
      onChange={e => setEditName(e.target.value)}
      placeholder="Ingredient name"
      required
      className="w-full rounded-xl border border-white/10 bg-[#0b1120] px-4 py-3"
    />

    <input
      type="number"
      min="0.01"
      step="0.01"
      value={editQuantity}
      onChange={e => setEditQuantity(e.target.value)}
      required
      className="w-full rounded-xl border border-white/10 bg-[#0b1120] px-4 py-3"
    />

    <select
      value={editUnit}
      onChange={e => setEditUnit(e.target.value)}
      className="w-full rounded-xl border border-white/10 bg-[#0b1120] px-4 py-3"
    >
      <option value="pcs">Pieces</option>
      <option value="kg">Kilograms</option>
      <option value="g">Grams</option>
      <option value="L">Liters</option>
      <option value="ml">Milliliters</option>
    </select>

    <input
      type="date"
      value={editExpiryDate}
      onChange={e => setEditExpiryDate(e.target.value)}
      className="w-full rounded-xl border border-white/10 bg-[#0b1120] px-4 py-3"
    />

    <div className="flex gap-3">
      <button
        type="submit"
        className="flex-1 rounded-xl bg-blue-500 py-3 font-semibold text-white"
      >
        Save Changes
      </button>

      <button
        type="button"
        onClick={cancelEditing}
        className="flex-1 rounded-xl bg-gray-700 py-3 font-semibold"
      >
        Cancel
      </button>
    </div>
  </form>
)}
              <p className="mt-1 text-sm text-gray-400">
                Add something to your fridge
              </p>

              <form onSubmit={addIngredient} className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-gray-300">
                    Ingredient name
                  </label>
                  <input
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="e.g. Potato"
                    required
                    className="w-full rounded-xl border border-white/10 bg-[#0b1120] px-4 py-3 outline-none focus:border-green-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-2 block text-sm text-gray-300">
                      Quantity
                    </label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={newQuantity}
                      onChange={e => setNewQuantity(e.target.value)}
                      required
                      className="w-full rounded-xl border border-white/10 bg-[#0b1120] px-4 py-3 outline-none focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-gray-300">
                      Unit
                    </label>
                    <select
                      value={newUnit}
                      onChange={e => setNewUnit(e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#0b1120] px-4 py-3 outline-none focus:border-green-500"
                    >
                      <option value="pcs">Pieces</option>
                      <option value="kg">Kilograms</option>
                      <option value="g">Grams</option>
                      <option value="L">Liters</option>
                      <option value="ml">Milliliters</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-gray-300">
                    Expiry date
                  </label>
                  <input
                    type="date"
                    value={newExpiryDate}
                    onChange={e => setNewExpiryDate(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#0b1120] px-4 py-3 text-white outline-none focus:border-green-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-green-500 py-3 font-semibold text-black transition hover:bg-green-400"
                >
                  + Add to fridge
                </button>
              </form>
            </div>
          </section>

          <footer className="mt-10 border-t border-white/10 py-6 text-center text-sm text-gray-500">
            Fridge Challenge · Cook smarter. Waste less. 🌱
          </footer>

        </main>
      </div>
    </div>
  )
}

export default App
