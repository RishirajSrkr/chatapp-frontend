import Routes from "./Routes"
import axios from "axios"
import { UserContextProvider } from './contexts/UserContext'

function App() {

  axios.defaults.baseURL = "http://localhost:8000"
  axios.defaults.withCredentials = true

  return (
    <UserContextProvider>
      <Routes />
    </UserContextProvider>
  )
}

export default App
