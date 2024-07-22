import React, { useEffect, useState } from 'react'

function Avatar({ online, username, userId }) {

    const colors = ["bg-lime-200", "bg-purple-200", "bg-red-200", "bg-orange-200", "bg-blue-200", "bg-yellow-200", "bg-blue-teal"];

    const userIdBase10 = parseInt(userId, 16);
    const colorIndex = userIdBase10 % colors.length;
    const color = colors[colorIndex];

    return (
        <div className={`relative w-8 h-8 rounded-full flex items-center justify-center ${color}`}>
            <div className='opacity-80'>
                {username.slice(0, 1).toUpperCase()}
            </div>
            <div className={`absolute w-3 h-3 ${online ? 'bg-green-400' : 'bg-gray-300'} bottom-0 right-0 rounded-full border border-white`}></div>
        </div>
    )
}

export default Avatar