import {AppBar, Button, Card, Container, Stack, Typography} from '@mui/material';
import Config from './config.json';
import {Send} from '@mui/icons-material';

const isDesktop = !window.matchMedia("(max-width: 767px)").matches;

const styles = {
  body: {
    paddingTop: '1em'
  },  
  app: {
    marginBottom: 10,
  },
  cardContainer: {
    marginTop: '1em',
    flexWrap: 'wrap'
  },
  card: {
    width: '320px',
    height: '200px',
    pl: 2,
    pr: 2,
    marginBottom: isDesktop ? 3 : 2,
    boxShadow: '0px 2px 5px black',
    backgroundColor: '#1f1f1f',
    color: 'white',
    borderRadius: 3
  },
  footer: {
    height: isDesktop ? 75 : 50,
    top: 'auto', 
    bottom: 0,
    backgroundColor: '#1f1f1f',
  }
}

function LedCard({config, sendRequestCallback}) {
  const { name, desc, customizable, mode} = config;
  const buttonTxt = customizable ? 'Customize' : 'Select';

  return (
    <Card sx={styles.card}>
      <Stack sx={{mt: 4}} alignItems="center" height="100%">
        <Typography variant="h4" align="center">{name}</Typography>
        <Typography variant="body2" align="center" sx={{mt: 1}}>{desc}</Typography>
        <Button 
          variant="outlined" 
          endIcon={<Send/>} 
          onClick={() => sendRequestCallback("test user", mode)} 
          sx={{position: 'relative', top: 40, color: 'white', borderColor: 'white'}}
        >
          {buttonTxt}
        </Button>
      </Stack> 
    </Card>
  )
}

function App() {
  const sendLedRequest = (name, mode) => {
    fetch(`${process.env.REACT_APP_API_URI}/add`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({name: name, mode: mode})
    })
  }

  const ledCards = Config.led_modes.map((config, i) => <LedCard config={config} sendRequestCallback={sendLedRequest} key={i} />)

  return (
    <div style={styles.body}>
      <Container sx={styles.app}>
        <Typography variant="h1" align="center">🍞</Typography>
        <Stack justifyContent="space-around" flexDirection="row" sx={styles.cardContainer}>
          {ledCards}
        </Stack>
      </Container>
      <AppBar position="fixed" color="primary" sx={styles.footer}>
          <Stack height="80%" flexDirection="row" justifyContent="center" alignItems="center">
              <Typography>
                Content about current mode
              </Typography>
          </Stack>
      </AppBar>
    </div>
    
  );
}

export default App;
