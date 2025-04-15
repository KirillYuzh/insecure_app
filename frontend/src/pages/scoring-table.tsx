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
  Chip,
  Spacer
} from '@nextui-org/react';
import { api } from '@/components/api';
import DefaultLayout from '@/layouts/default';
import { title } from "@/components/primitives";

export type Player = {
  username: string;
  team: string; // Теперь просто строка вместо { Valid: boolean; String: string }
  score: number;
};

export default function ListScoringTable() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get("/scoring-table/")
      .then((response) => {
        if (response.data && Array.isArray(response.data)) { // Изменили response.data.players на response.data
          const sortedPlayers = response.data.sort(
            (a: Player, b: Player) => b.score - a.score
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
            <h2 className="text-xl font-bold">Rating</h2>
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
                        <span>{player.username}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {player.team ? (
                        <Chip color="secondary" variant="flat">
                          {player.team}
                        </Chip>
                      ) : (
                        <Chip color="default" variant="flat">
                          No team
                        </Chip>
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