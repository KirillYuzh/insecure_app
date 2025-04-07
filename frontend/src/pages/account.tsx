import React, { useState, useEffect } from 'react';
import { 
  Avatar, 
  Button, 
  Card, 
  CardBody, 
  Link,
  Spacer,
  Chip,
} from '@nextui-org/react';
import { api } from '@/components/api';
import { useNavigate } from "react-router-dom";
import player_avatar from "../assets/avatar-red.svg";
import DefaultLayout from '@/layouts/default';

export type Player = {
  username: string;
  score: number;
  is_in_team: boolean; 
  player_team_title: string | null; 
  solved_tasks: number[];
  solved_task_titles: string[]; 
};

const AccountComponent: React.FC = () => {
  const [player, setPlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/account/")
      .then((response) => {
        const data = response.data;
        setPlayer({
          username: data.username,
          score: data.score || 0,
          is_in_team: data.is_in_team || false,
          player_team_title: data.player_team_title || "",
          solved_tasks: data.solved_tasks || [],
          solved_task_titles: data.solved_task_titles || [],
        });
      })
      .catch((error) => {
        console.error("Failed to fetch account data", error);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleEditProfile = () => {
    navigate("/profile-edit/");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <h6>Loading...</h6>
      </div>
    );
  }

  if (!player) {
    return (
      <DefaultLayout>
        <Card className="max-w-md mx-auto mt-16">
          <CardBody>
            <h2 className="text-center">You're not authorized</h2>
            <Spacer y={2} />
            <Link href="/login/" color="primary" className="flex justify-center">
              Go to login page
            </Link>
          </CardBody>
        </Card>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex flex-col items-center">
        <Avatar 
          src={player_avatar}
          size="lg" 
          className="shadow-md w-40 h-40"
        />
        
        <Spacer y={4} />
        
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <Card>
              <CardBody>
                <h3 className="text-primary">{player.username}</h3>
                <p className="text-default-500">Username</p>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody>
                <h4>{player.player_team_title || "No team"}</h4>
                <p className="text-default-500">Team</p>
              </CardBody>
            </Card>
            
            <Card>
              <CardBody>
                {player.solved_task_titles.length > 0 ? (
                  <>
                    <h1 className="text-primary">{player.solved_task_titles.length}</h1>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {player.solved_task_titles.map((title, index) => (
                        <Chip 
                          key={index} 
                          color="success" 
                          variant="solid"
                        >
                          {title}
                        </Chip>
                      ))}
                    </div>
                  </>
                ) : (
                  <h4>0 solved tasks</h4>
                )}
                <p className="text-default-500">Solved tasks</p>
              </CardBody>
            </Card>
          </div>
          
          {/* Right Column */}
          <div className="flex flex-col items-end">
            <Card className="w-full">
              <CardBody className="text-right">
                <h1 className="text-primary">{player.score}</h1>
                <p className="text-default-500">Score</p>
              </CardBody>
            </Card>
          </div>
        </div>
        
        <Spacer y={6} />
        
        <Button 
          color="primary" 
          variant="solid" 
          onClick={handleEditProfile}
        >
          Edit Profile
        </Button>
      </div>
    </div>
    </DefaultLayout>
  );
};

export default AccountComponent;