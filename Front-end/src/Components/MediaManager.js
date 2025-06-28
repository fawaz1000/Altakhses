import React, { useState, useEffect } from 'react'
import axios from 'axios'
export default function MediaManager({ category }) {
  const [items, setItems] = useState([])
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  useEffect(() => {
    axios.get(`http://localhost:5050/api/media?category=${category}`)
      .then(res => setItems(res.data))
  }, [category])
  const handleSubmit = async e => {
    e.preventDefault()
    const form = new FormData()
    form.append('media', file)
    form.append('title', title)
    form.append('description', description)
    form.append('category', category)
    const token = localStorage.getItem('token')
    await axios.post('http://localhost:5050/api/media', form, { headers: { Authorization: `Bearer ${token}` } })
    setFile(null)
    setTitle('')
    setDescription('')
    axios.get(`http://localhost:5050/api/media?category=${category}`).then(res => setItems(res.data))
  }
  const handleDelete = async id => {
    const token = localStorage.getItem('token')
    await axios.delete(`http://localhost:5050/api/media/${id}`, { headers: { Authorization: `Bearer ${token}` } })
    setItems(items.filter(i => i._id !== id))
  }
  return (
    <div className="media-manager">
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={e => setFile(e.target.files[0])} />
        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" />
        <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" />
        <button type="submit">Upload</button>
      </form>
      <ul>
        {items.map(item => (
          <li key={item._id}>
            <span>{item.title}</span>
            <button onClick={() => handleDelete(item._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
