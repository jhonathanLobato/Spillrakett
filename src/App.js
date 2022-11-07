/* src/App.js */
import React, { useEffect, useState } from 'react'
import { Amplify, API, graphqlOperation, input, Storage } from 'aws-amplify'
import { createGame } from './graphql/mutations'
import { listGames } from './graphql/queries'
import { withAuthenticator, Button, Heading } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import awsExports from "./aws-exports";
Amplify.configure(awsExports);

const initialState = { name: '', description: '', price: '', image: '' }

const App = ({signOut, user}) => {
  const [formState, setFormState] = useState(initialState)
  const [games, setGames] = useState([])

  useEffect(() => {
    fetchGames()
  }, [])

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value })
  }

  async function fetchGames() {
    try {
      const gameData = await API.graphql(graphqlOperation(listGames))
      const games = gameData.data.listGames.items
      setGames(games)
    } catch (err) { console.log('error fetching games') }
  }

  async function addGame() {
    try {
      if (!formState.name || !formState.description) return
      const game = { ...formState }
      await Storage.put(formState.image, )
      setGames([...games, game])
      setFormState(initialState)
      await API.graphql(graphqlOperation(createGame, {input: game}))
    } catch (err) {
      console.log('error creating game:', err)
    }
  }

  return (
    <div style={styles.container}>
      <Heading level={1}>Hello {user.username}</Heading>
      <Button onClick={signOut}>Sign out</Button>
      <h2>Amplify Games</h2>
      <input
        onChange={event => setInput('name', event.target.value)}
        style={styles.input}
        value={formState.name}
        placeholder="Name"
      />
      <input
        onChange={event => setInput('description', event.target.value)}
        style={styles.input}
        value={formState.description}
        placeholder="Description"
      />
      <input
        onChange={event => setInput('price', event.target.value)}
        style={styles.input}
        type='number'
        step="0.1"
        value={formState.price}
        placeholder="Price"
      />
      <input
        onChange={event => setInput('image', event.target.value)}
        style={styles.input}
        type='file'
        value={formState.image}
        placeholder="Select Image"
      />
      <button style={styles.button} onClick={addGame}>Create Game</button>
      {
        games.map((game, index) => (
          <div key={game.id ? game.id : index} style={styles.game}>
            <p style={styles.gameName}>{game.name}</p>
            <p style={styles.gameDescription}>{game.description}</p>
            <p style={styles.gamePrice}>{game.price}</p>
            <img src={game.image}/>
          </div>
        ))
      }
    </div>
  )
}

const styles = {
  container: { width: 400, margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 20 },
  game: {  marginBottom: 15 },
  input: { border: 'none', backgroundColor: '#ddd', marginBottom: 10, padding: 8, fontSize: 18 },
  gameName: { fontSize: 20, fontWeight: 'bold' },
  gameDescription: { marginBottom: 0 },
  button: { backgroundColor: 'black', color: 'white', outline: 'none', fontSize: 18, padding: '12px 0px' }
}

export default withAuthenticator(App);