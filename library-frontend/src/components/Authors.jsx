import { useState } from 'react'

const Authors = (authors) => {
  const [author, setAuthor] = useState('')
  const [born, setBorn] = useState('')
  const editAuthor = authors.editAuthor

  if (!authors.show) {
    return null
  }

  const submit = async (event) => {
    event.preventDefault()

    await editAuthor({ variables: { name: author, setBornTo: born } })

    console.log('edited author...')

    setAuthor('')
    setBorn('')
  }

  return (
    <div>
      <div>
        <h2>authors</h2>
        <table>
          <tbody>
            <tr>
              <th></th>
              <th>born</th>
              <th>books</th>
            </tr>
            {authors.data.allAuthors.map((a) => (
              <tr key={a.id}>
                <td>{a.name}</td>
                <td>{a.born}</td>
                <td>{a.bookCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
      <h2>Set birthyear</h2>
        <form onSubmit={submit}>
          <div>
            <label>
            name
              <select value={author} onChange={({ target }) => setAuthor(target.value)}>
                <option value="">select author</option>
                {authors.data.allAuthors.map((a) => (
                  <option key={a.id} value={a.name}>
                    {a.name}
                  </option>
              ))}
              </select>
            </label>
          </div>
          <div>
            <label>
            born
              <input
                type="text"
                value={born}
                onChange={({ target }) => setBorn(target.value)}
              />
            </label>
          </div>
          <button type="submit">update author</button>
        </form>
      </div>
    </div>
  )
}


export default Authors
