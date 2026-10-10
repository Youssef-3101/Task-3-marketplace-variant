import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = { title: '', description: '', price: 0, category: 'other', condition: 'used', status: 'active' }

const categories = ['textbooks', 'electronics', 'furniture', 'clothing', 'other']
const conditions = ['new', 'like-new', 'used', 'worn']

export default function ListingForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')

  // Edit mode: load the listing and copy only the fields the form edits.
  useEffect(() => {
    if (!id) return
    api.get(`/listings/${id}`)
      .then(res => {
        const l = res.data.listing
        setForm({
          title: l.title,
          price: l.price,
          category: l.category,
          condition: l.condition,
          status: l.status,
          description: l.description ?? ''
        })
      })
      .catch(err => setError(err?.response?.data?.message || 'Could not load listing'))
  }, [id])

  // One handler for every input: the input's `name` says which field to update.
  function onChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: name === 'price' ? Number(value) : value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      if (id) {
        await api.patch(`/listings/${id}`, form)
      } else {
        // status only matters when editing; a new listing is always active
        const { status, ...body } = form
        await api.post('/listings', body)
      }
      nav('/listings')
    } catch (err) {
      setError(err?.response?.data?.message || 'Save failed')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'New'} Listing</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input className="input" name="title" placeholder="Title (e.g. Calculus textbook)" value={form.title} onChange={onChange} />
        <input className="input" name="price" type="number" min="0" step="0.01" placeholder="Price" value={form.price} onChange={onChange} />
        <select className="input" name="category" value={form.category} onChange={onChange}>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="input" name="condition" value={form.condition} onChange={onChange}>
          {conditions.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {id && (
          <select className="input" name="status" value={form.status} onChange={onChange}>
            <option value="active">active</option>
            <option value="sold">sold</option>
          </select>
        )}
        <textarea className="input" name="description" rows="4" placeholder="Description (optional)" value={form.description} onChange={onChange} />
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit">Save</button>
      </form>
    </div>
  )
}
