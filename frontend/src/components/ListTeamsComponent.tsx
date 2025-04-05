import { useEffect, useState } from 'react';
import ListGroup from 'react-bootstrap/ListGroup';
import { api } from './api';

export type Team = {
  title: string;
  total_score: number;
};

export default function ListTeams() {
  const [teams, setTeams] = useState<Team[] | null>(null);

  useEffect(() => {
    api.get("/community/").then((response) => {
      setTeams(response.data);
    }).catch((error) => {
      console.error("Error fetching teams:", error);
    });
  }, []);

  return (
    <div className='card' style={{ marginLeft: 'auto', marginRight: 'auto', marginTop: '3rem' }}>
      <ListGroup variant="flush">
        {teams ? teams.map((team, index) => (
          <ListGroup.Item key={index}>
            <div className='community-row-element'>
              <div style={{ textAlign: 'left', }}><h4>{team.title}</h4></div>
              <div style={{ textAlign: 'right', }}><h4>{team.total_score}</h4></div>
            </div>
          </ListGroup.Item>
        )) : <p>Loading teams...</p>}
      </ListGroup>
    </div>
  );
}
