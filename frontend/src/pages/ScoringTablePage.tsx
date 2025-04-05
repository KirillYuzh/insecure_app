import ListScoringTable from "../components/ListScoringTableComponent";


export default function ScoringTablePage() {
  return (
    <>
      <h1 style={{textAlign:'center', margin: '3rem'}}>Players</h1>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', width: '40rem', marginLeft: 'auto', marginRight: 'auto'}}>
        <h4 style={{textAlign:'center', color:'var(--silver)'}}>nickname</h4>
        <h4 style={{textAlign:'center', color:'var(--silver)'}}>team</h4>
        <h4 style={{textAlign:'center', color:'var(--silver)'}}>score</h4>
      </div>
      <ListScoringTable/>
    </>
  );
}