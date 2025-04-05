import { useEffect, useState } from 'react';
import ListGroup from 'react-bootstrap/ListGroup';
import { api } from './api';

export type Player = {
  username: string;
  player_team_title: { Valid: boolean; String: string }; // Обновленный тип
  score: number;
  is_in_team: boolean;
};

export default function ListScoringTable() {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    api.get("/scoring-table/")
      .then((response) => {
        if (response.data && Array.isArray(response.data.players)) {
          // Сортируем игроков по score (по убыванию)
          const sortedPlayers = response.data.players.sort((a: { score: number; }, b: { score: number; }) => b.score - a.score);
          setPlayers(sortedPlayers);
        } else {
          console.error("Invalid data format:", response.data);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch players:", error);
      });
  }, []);

  return (
    <>
      <div className='card' style={{ marginLeft: 'auto', marginRight: 'auto', marginTop: '3rem' }}>
        <ListGroup variant="flush">
          {players.map((player, index) => (
            <ListGroup.Item key={index}>
              <div className='scoring-table-row-elemet'>
                <div><h4>{player.username}</h4></div>
                <div>
                  {player.player_team_title.String ? (
                    <h4>{player.player_team_title.String}</h4>
                  ) : (
                    <h4 style={{ color: 'var(--silver)' }}>No team</h4>
                  )}
                </div>
                <div><h4>{player.score}</h4></div>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </div>
    </>
  );
}