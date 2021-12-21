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
    width: '300px',
    height: '150px',
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
  const { name, desc, customizable, mode, setting, color, disabled} = config;
  const buttonTxt = customizable ? 'Customize' : 'Select';

  return (
    <Card sx={styles.card}>
      <Stack sx={{mt: 2}} alignItems="center" height="100%">
        <Typography variant="h5" align="center">{name}</Typography>
        <Typography variant="body2" align="center" sx={{mt: 1}}>{desc}</Typography>
        <Button 
          variant="outlined" 
          disabled={disabled ?? false}
          endIcon={<Send/>} 
          onClick={() => sendRequestCallback("test user", mode, setting ?? -1, color ?? '#000000')} 
          sx={{position: 'relative', top: 20, color: 'white', borderColor: 'white'}}
        >
          {disabled ? "Disabled" : buttonTxt}
        </Button>
      </Stack> 
    </Card>
  )
}

function App() {
  const sendLedRequest = (name, mode, setting, color) => {
    fetch(`${process.env.REACT_APP_API_URI}/add`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({name: name, mode: mode, setting: setting, color: color})
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
