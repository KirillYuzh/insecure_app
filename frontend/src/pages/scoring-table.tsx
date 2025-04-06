import { useEffect, useState } from 'react';
import { 
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Card,
  CardBody,
  CardHeader,
  Avatar,
  Chip,
  Spacer
} from '@nextui-org/react';
import { api } from '@/components/api';
import DefaultLayout from '@/layouts/default';
import { title } from "@/components/primitives";


export type Player = {
  username: string;
  player_team_title: { Valid: boolean; String: string };
  score: number;
  is_in_team: boolean;
};

export default function ListScoringTable() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get("/scoring-table/")
      .then((response) => {
        if (response.data && Array.isArray(response.data.players)) {
          const sortedPlayers = response.data.players.sort(
            (a: { score: number }, b: { score: number }) => b.score - a.score
          );
          setPlayers(sortedPlayers);
        } else {
          console.error("Invalid data format:", response.data);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch players:", error);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <DefaultLayout>
    <div className="max-w-4xl mx-auto p-4">
    <h1 className={title()}>Scoring table</h1>
      <Card className="mt-8">
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Raiting</h2>
          <Chip color="primary" variant="flat">
            Total Players: {players.length}
          </Chip>
        </CardHeader>
        <CardBody>
          <Table aria-label="Players scoring table" removeWrapper>
            <TableHeader>
              <TableColumn>#</TableColumn>
              <TableColumn>PLAYER</TableColumn>
              <TableColumn>TEAM</TableColumn>
              <TableColumn className="text-right">SCORE</TableColumn>
            </TableHeader>
            <TableBody
              isLoading={isLoading}
              loadingContent={<div>Loading scores...</div>}
              emptyContent={!isLoading && "No players found"}
            >
              {players.map((player, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {/* <Avatar
                        name={player.username}
                        size="sm"
                        className="bg-primary text-white"
                      /> */}
                      <span>{player.username}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {player.player_team_title.Valid ? (
                      <Chip color="secondary" variant="flat">
                        {player.player_team_title.String}
                      </Chip>
                    ) : (
                      <span className="text-default-400">No team</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Chip color="primary" variant="solid">
                      {player.score}
                    </Chip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
      <Spacer y={4} />
    </div>
    </DefaultLayout>
  );
}