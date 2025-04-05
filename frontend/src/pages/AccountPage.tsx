import React, { useState, useEffect } from 'react';
import { api } from '../components/api';
import { useNavigate } from "react-router-dom";
import player_avatar from "../assets/avatar-red.svg";


export type Player = {
    username: string;
    score: number;
    is_in_team: boolean;
    player_team_title: string; // Теперь это строка
    solved_tasks: number[]; // Новое поле
};

const AccountPage: React.FC = () => {
    const [player, setPlayer] = useState<Player | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        api.get("/account/")
            .then((response) => {
                const data = response.data;
                // Преобразуем player_team_title в строку и добавляем solved_tasks
                const player: Player = {
                    username: data.username,
                    score: data.score,
                    is_in_team: data.is_in_team,
                    player_team_title: data.player_team_title?.String || "", // Извлекаем значение String
                    solved_tasks: data.solved_tasks || [], // Добавляем solved_tasks
                };
                setPlayer(player);
            })
            .catch((error) => {
                console.error("Failed to fetch account data", error);
            });
    }, []);

    const EditButton = async (e: React.FormEvent) => {
        e.preventDefault();
        navigate("/profile-edit/");
    };

    return (
        <>
            {player ? (
                <>
                    <div style={{ width: "10rem", height: "10rem", 
                                overflow: "hidden", borderRadius: "50%", 
                                boxShadow: '3px 3px 10px rgba(0, 0, 0, 0.2)',
                                marginLeft: 'auto', marginRight: 'auto',
                                marginTop: '2rem',
                                }}>
                        <img 
                            src={ player_avatar }
                            alt="Player avatar"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                            }}
                        />
                    </div>
                    <div style={{ marginLeft: 'auto', marginRight: 'auto', padding: '2rem', width: 'fit-content', minWidth: '30rem', maxWidth: '50rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem'}}>
                            <div style={{ height: 'fit-content', }}>
                                <h1 style={{ color: 'var(--purple)', }}>{ player.username }</h1>
                                <p style={{ color: 'var(--silver) '}} >username</p>
                                <div className='card' style={{ marginLeft: '0rem', width: '100%', }}>
                                    {player.player_team_title ? (
                                        <h4>{player.player_team_title}</h4>
                                    ) : (
                                        <h4>No team</h4>
                                    )}
                                    <p style={{ color: 'var(--silver)'}} >team</p>
                                </div>
                                <div className='card' style={{ marginLeft: '0rem', width: '100%', }}>
                                {player.solved_tasks && player.solved_tasks.length > 0 ? (
                                    <>
                                        <h4>
                                            Solved tasks: <span style={{ color: 'var(--silver)'}}>({player.solved_tasks.length})</span> 
                                        </h4>
                                        <ul style={{ color: 'var(--black)', listStyleType: 'none', paddingLeft: '1rem' }}>
                                            {player.solved_tasks.map((taskId, index) => (
                                                <li key={index}>- {taskId}</li>
                                            ))}
                                        </ul>
                                    </>
                                ) : (
                                    <h4>0 solved tasks</h4>
                                )}
                                <p style={{ color: 'var(--silver)'}} >solved tasks</p>
                                </div>
                            </div>
                            <div style={{ height: 'fit-content', textAlign: 'right', }}>
                                <h1 style={{ color: 'var(--purple)'}}>{ player.score }</h1>
                                <p style={{ color: 'var(--silver)'}} >score</p>
                            </div>
                        </div>
                    </div>
                    <div style={{ marginRight: 'auto', marginLeft: 'auto', width: 'fit-content', }}>
                        <button onClick={EditButton} className='button'>Edit profile</button>
                    </div>
                </>
            ) : (
                <>
                    <div className='card' style={{ marginLeft: 'auto', marginRight: 'auto', marginTop: '4rem', padding: '2rem' }}>
                        <h2>It seems like you weren't authorized</h2>
                        <a href='/login/' style={{ color: 'var(--silver)', textAlign: 'center', fontSize: '1.5rem' }}>login page</a>
                    </div>
                </>
            )}
        </>
    );
};

export default AccountPage;