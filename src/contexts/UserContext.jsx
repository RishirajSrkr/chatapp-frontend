import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
    const [userId, setUserId] = useState(null);
    const [username, setUsername] = useState(null);

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_APP_BASE_URL}/users/profile`).then((response) => {
            setUserId(response.data.userId);
            setUsername(response.data.username)
        })
    }, [])

    return (
        <UserContext.Provider value={{ userId, setUserId, username, setUsername }}>
            {children}
        </UserContext.Provider>
    )
}

