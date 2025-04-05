export default function ErrorMessageComponent ({ e }: { e: string }) { 
    return (
      <div style={{ marginTop: '4rem', marginBottom: '4rem' }}> 
        <hr style={{ marginLeft: 'auto', marginRight: 'auto', width: '40vw'  }}/>
        <p className="error-red">{ e }</p>
        <hr style={{ marginLeft: 'auto', marginRight: 'auto', width: '40vw'  }}/>
      </div>
    );
  }
  