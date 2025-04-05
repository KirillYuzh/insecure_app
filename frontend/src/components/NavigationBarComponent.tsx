export default function NavigationBar() {
    return (
      <>
        <div className="navbar">
  
          <div style={{marginLeft: '0rem', marginRight: 'auto'}}>
              <a className="navbar-link" href="/" style={{padding: '1rem', color: 'black', fontWeight: 600}}>HEX BOMB</a>
              {/* <a className="navbar-link" href="/" style={{padding: '1rem'}}>home</a> */}
              <a className="navbar-link" href="/community/" style={{padding: '1rem'}}>community</a>
          </div>
  
          <div style={{marginLeft: 'auto', marginRight: 'auto'}}>
              <a className="navbar-link" href="/tasks/" style={{padding: '1rem'}}>tasks</a>
              <a className="navbar-link" href="/scoring-table/" style={{padding: '1rem'}}>scoring-table</a>
          </div>
          <div style={{marginLeft: 'auto', marginRight: '0rem', justifyContent: 'right'}}>   
              {/* <a className="navbar-link" href="/signup" style={{padding: '1rem'}}>sign up</a> */}
              <a className="navbar-link" href="/login/" style={{padding: '1rem'}}>log in</a>
              <a className="navbar-link" href="/account/" style={{padding: '1rem'}}>account</a>
              <a className="navbar-link" href="/admin-panel/" style={{padding: '1rem'}}>admin-panel</a>
          </div>
  
      </div>
      </>
      );
  }