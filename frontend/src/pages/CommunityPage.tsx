import ListTeams from "../components/ListTeamsComponent";


export default function CommunityPage() {

  return (
    <>
      <h1 style={{textAlign:'center', margin: '3rem'}}>Teams</h1>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', width: '40rem', marginLeft: 'auto', marginRight: 'auto'}}>
        <h4 style={{textAlign:'center', color:'var(--silver)'}}>team</h4>
        {/* <h4 style={{textAlign:'center', color:'var(--silver)'}}>captain</h4> */}
        <h4 style={{textAlign:'center', color:'var(--silver)'}}>score</h4>
      </div>
      <ListTeams/>
    </>
  );
}