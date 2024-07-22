import React, { useContext } from 'react'
import RegisterAndLogin from './components/RegisterAndLogin'
import { UserContext } from './contexts/UserContext'
import Chat from './components/Chat';

function Routes() {
  const { username, userId } = useContext(UserContext);


  //if a token already exists in the cookie, it means someone is logged in.
  if (username) {
    return(
      <Chat />
    )
  }

  return (
    <RegisterAndLogin />
  )
}

export default Routes