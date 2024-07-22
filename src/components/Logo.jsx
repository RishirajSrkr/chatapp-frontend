import React from 'react'
import { DiSenchatouch } from "react-icons/di";

function Logo({logoText}) {
    return (
        <div className='text-blue-600 font-bold flex items-center gap-1 p-4'><DiSenchatouch className='text-xl' />{logoText}</div>
    )
}

export default Logo