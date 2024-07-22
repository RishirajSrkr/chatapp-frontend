import React, { useContext } from 'react'
import { FaUserCircle } from "react-icons/fa";

function LoggedInAs({username}) {
  return (
    <div className='flex items-center gap-2 mr-4'>
        <FaUserCircle />
        <h3 className='font-semibold text-sm'>{username}</h3>
    </div>
  )
}

export default LoggedInAs