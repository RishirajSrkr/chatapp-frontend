import React, { useContext, useEffect, useReducer, useRef, useState } from 'react'
import { IoMdSend } from "react-icons/io";
import { GrAttachment } from "react-icons/gr";
import { GrLogout } from "react-icons/gr";
import { UserContext } from '../contexts/UserContext';
import Logo from './Logo';
import SingleContactBox from './SingleContactBox';
import LoggedInAs from './LoggedInAs';
import { lodash, random, uniqBy } from 'lodash'
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios'


function Chat() {

    const { username, userId: loggedInUserId, setUserId, setUsername } = useContext(UserContext);
    const [ws, setWs] = useState(null);
    const [onlinePeople, setOnlinePeople] = useState({});
    const [offlinePeople, setOfflinePeople] = useState({})
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [newMessageText, setNewMessageText] = useState("");
    const [messages, setMessages] = useState([]) //array of objects

    //ref for scrolling to the most recent message
    const divUnderMessages = useRef();


    function connectToWebSocket() {
        const ws = new WebSocket('ws://localhost:8000');
        setWs(ws);

        ws.addEventListener('message', handleMessage)

        //if the web sokcet sever closes, we will reconnect it.
        ws.addEventListener('close', () => {
            setTimeout(() => {
                console.log("Disconnected, trying to reconnect.");
                connectToWebSocket;
            }, 1000);
        })
    }

    useEffect(() => {
        connectToWebSocket();
    }, [])



    function showOnLinePeople(peopleArray) {
        const people = {};
        peopleArray.forEach(({ userId, username }) => {
            people[userId] = username;
        })
        setOnlinePeople(people);
    }


    function handleMessage(e) {
        const messageData = JSON.parse(e.data);

        if ('online' in messageData) {
            showOnLinePeople(messageData.online);
        }
        else if ('text' in messageData) {
            //if messageData contains 'text'

            if (messageData.sender === selectedUserId) {
                setMessages((prev) => {
                    return [...prev, {
                        ...messageData
                    }]
                })
            }



        }
    }


    function handleSendMessage(e, file = null) {
        if (e) e.preventDefault();

        ws.send(JSON.stringify({
            recipient: selectedUserId,
            text: newMessageText,
            file,

        }));

        if (file) {
            axios.get(`${import.meta.env.VITE_APP_BASE_URL}/messages/${selectedUserId}`).then(res => setMessages(res.data))
        }
        else {
            setNewMessageText("");

            setMessages(prev => ([...prev, {
                text: newMessageText,
                sender: loggedInUserId,
                recipient: selectedUserId,
                id: uuidv4(),
            }]))


        }
    }


    function sendFile(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(file)
        reader.onload = () => {
            handleSendMessage(null, {
                name: file.name,
                data: reader.result,
            })
        }

    }



    //fetching the offline people
    useEffect(() => {
        axios.get(`${import.meta.env.VITE_APP_BASE_URL}/users/allusers`)
            .then(res => {
                const offlinePeopleArray = res.data
                    //filtering the current logged in user
                    .filter((user) => user._id !== loggedInUserId)
                    //filtering other logged in users
                    .filter(user => !Object.keys(onlinePeople).includes(user._id))

                const offlinePeople = {};
                offlinePeopleArray.forEach(({ _id, username }) => {
                    offlinePeople[_id] = username;
                })

                setOfflinePeople(offlinePeople);
            })

    }, [onlinePeople])


    //making sure that whenever a user sends a message, the view scrolls to the most recent message
    useEffect(() => {
        const div = divUnderMessages.current;
        div?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])


    //getting the messages from the database when the user clicks on any contact/person
    useEffect(() => {
        async function fetchMessagesFromDB() {
            if (selectedUserId) {
                try {
                    const response = await axios.get(`${import.meta.env.VITE_APP_BASE_URL}/messages/${selectedUserId}`)
                    const { data } = response;
                    setMessages(data);
                }
                catch (error) { console.log("Error in fetching messages from Database: " + error) }
            }
        }
        fetchMessagesFromDB();
    }, [selectedUserId])


    //VERY USEFULL!!!
    //making sure that there are no duplicate messages being displayed
    const uniqueMessages = uniqBy(messages, (msg) => msg._id || msg.id);


    function handleLogout() {
        axios.post(`${import.meta.env.VITE_APP_BASE_URL}/users/logout`)
            .then(() => {
                setWs(null);
                setUserId(null);
                setUsername(null);
            })
    }






    return (
        <div className='flex h-screen'>

            <div className='bg-white w-1/3 flex flex-col'>

                <div className='flex-grow'>
                    {/* ----- LOGO ----- */}
                    <div className='flex items-center justify-between'>
                        <Logo logoText={"Talkify"} />
                    </div>


                    {/* ----- ALL CONTACTS ----- */}
                    {Object.keys(onlinePeople).filter((userId) => (userId != loggedInUserId)).map(userId => (

                        <SingleContactBox
                            key={userId}
                            userId={userId}
                            username={onlinePeople[userId]}
                            onClick={() => setSelectedUserId(userId)}
                            selected={userId === selectedUserId}
                            online={true}
                        />
                    ))}

                    {Object.keys(offlinePeople).filter((userId) => (userId != loggedInUserId)).map(userId => (

                        <SingleContactBox
                            key={userId}
                            userId={userId}
                            username={offlinePeople[userId]}
                            onClick={() => setSelectedUserId(userId)}
                            selected={userId === selectedUserId}
                            online={false}
                        />
                    ))}
                </div>


                {/* logout */}

                <div className='px-4 py-3 border-t border-gray-100 font-medium flex items-center justify-between'>
                    <button
                        className='cursor-pointer flex items-center justify-center gap-2'
                        onClick={handleLogout}
                    >
                        <GrLogout />Logout
                    </button>

                    <span className='flex items-center justify-center gap-2'><LoggedInAs username={username} /></span>
                </div>

            </div>



            <div className='bg-blue-50 w-2/3 p-2 flex flex-col'>
                <div className='flex-grow'>
                    {
                        !selectedUserId &&
                        <div className='flex items-center justify-center h-full'>
                            <p className='text-gray-400'>&larr; Select a person from the sidebar</p>
                        </div>
                    }

                    {/* display messages... */}
                    {selectedUserId &&
                        <div className='relative h-full'>
                            <div className='overflow-y-scroll absolute top-0 left-0 right-0 bottom-2'>
                                {
                                    uniqueMessages.map((msg) => (
                                        <div key={msg._id} className={`${msg.sender == loggedInUserId ? 'text-right' : 'text-left'}`}>
                                            <div className={`max-w-fit text-left inline-block my-2 p-4 px-10 rounded-t-xl ${msg.sender == loggedInUserId ? 'rounded-bl-xl' : 'rounded-br-xl'} ${msg.sender == loggedInUserId ? 'bg-blue-500 text-white px-4' : 'bg-white px-4'}  overflow-hidden break-words`}>
                                                <div>
                                                    <div> {msg.text}</div>

                                                    {msg.file &&
                                                        <div className='flex text-left items-center gap-2 text-sm font-semibold mt-4'>
                                                            <GrAttachment />
                                                            <a className='underline flex items-center justify-center' href={`http://localhost:8000/uploads/${msg.file}`}>
                                                                {msg.file}</a>
                                                        </div>
                                                    }


                                                    <div className='text-xs mt-4'>{msg.createdAt}</div>

                                                </div>
                                            </div>

                                        </div>
                                    ))
                                }

                                <div ref={divUnderMessages}></div>
                            </div>
                        </div>
                    }


                </div>
                {selectedUserId && (
                    <form className='flex gap-2' onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            value={newMessageText}
                            onChange={(e) => setNewMessageText(e.target.value)}
                            className='bg-white border p-2 w-full rounded-sm'
                            placeholder='type your message here...'
                        />

                        <label
                            className='cursor-pointer bg-gray-100 p-3 text-gray-700 border border-gray-300 rounded-sm' type='button'><GrAttachment />
                            <input className='hidden' type="file" onChange={sendFile} />
                        </label>

                        <button
                            type="submit"
                            className='bg-blue-500 p-3 text-white rounded-sm'>
                            <IoMdSend />
                        </button>
                    </form>
                )}

            </div>

        </div>
    )
}





export default Chat