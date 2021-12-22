import React, { useState, useEffect } from 'react';

import {AppBar, Button, Card, Container, Stack, ToggleButtonGroup, ToggleButton, Typography, Slider, Box} from '@mui/material';
import Config from './config.json';
import {AcUnit, AutoAwesome, DarkMode, GraphicEq, LightMode, LocalFireDepartment, Looks, Palette, Send, Square} from '@mui/icons-material';

const isDesktop = !window.matchMedia("(max-width: 767px)").matches;
const REMOTE_WIDTH = 300;

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

const API_URI = !process.env.NODE_ENV || process.env.NODE_ENV === 'development' ? 'http://192.168.1.98:3000' : `https://jguo-led.herokuapp.com`;

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
  const [page, setPage] = useState(0);
  const [ledSetting, setLedSetting] = useState(null); // Query for the current setting
  const [color, setColor] = useState(0.0);

  const updateLedSetting = (newSetting) => {
    setLedSetting(oldSetting => ({
      ...oldSetting,
      ...newSetting
    }));
    fetch(`${API_URI}/add`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({...ledSetting, ...newSetting})
    })
    
  };

  useEffect(() => {
    if(ledSetting !== null) return;
    fetch(`${API_URI}/current`)
      .then((res) => res.json())
      .then(led => setLedSetting(led));
  }, [ledSetting]);

  if(!ledSetting) return null;

  const sendLedRequest = (name, mode, setting, color) => {
    fetch(`${API_URI}/add`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({name: name, mode: mode, setting: setting, color: color})
    })
  }

  const remote = (
    <Stack alignItems="center" sx={{mt: 1}}>
        <Typography variant="h6" sx={{ mt: 1}}>Mode:</Typography>
        <ToggleButtonGroup 
          value={ledSetting.mode} 
          onChange={(e, val) => val !== null ? updateLedSetting({mode: val}) : null} 
          sx={{backgroundColor: 'white'}}
          color="primary"
          exclusive
        >
          <ToggleButton size="large" value={0} sx={{width: REMOTE_WIDTH / 4}}><DarkMode fontSize="large"/></ToggleButton>
          <ToggleButton size="large" value={1} sx={{width: REMOTE_WIDTH / 4}}><Square fontSize="large"/></ToggleButton>
          <ToggleButton size="large" value={2} sx={{width: REMOTE_WIDTH / 4}}><GraphicEq fontSize="large"/></ToggleButton>
          <ToggleButton size="large" value={3} sx={{width: REMOTE_WIDTH / 4}}><AutoAwesome fontSize="large"/></ToggleButton>
        </ToggleButtonGroup>
        <Typography variant="h6" sx={{ mt: 1}}>Color: </Typography>
        <ToggleButtonGroup 
          value={ledSetting.setting} 
          onChange={(e, val) => val !== null ? updateLedSetting({setting: val}) : null} 
          sx={{backgroundColor: 'white'}}
          color="primary"
          exclusive
        >
          <ToggleButton size="large" value={0} sx={{width: REMOTE_WIDTH / 4}}><Looks fontSize="large"/></ToggleButton>
          <ToggleButton size="large" value={1} sx={{width: REMOTE_WIDTH / 4}}><LocalFireDepartment fontSize="large"/></ToggleButton>
          <ToggleButton size="large" value={2} sx={{width: REMOTE_WIDTH / 4}}><AcUnit fontSize="large"/></ToggleButton>
          <ToggleButton size="large" value={3} sx={{width: REMOTE_WIDTH / 4}}><Palette fontSize="large"/></ToggleButton>
        </ToggleButtonGroup>
        {ledSetting.setting === 3 && 
          <Stack flexDirection="Row" sx={{width: REMOTE_WIDTH - 50, backgroundColor: 'white', mt: .25, pl: 1.5, pr: 1, borderRadius: 2}} alignItems="center">
            <Slider control min={0} max={1} step={.05} defaultValue={0} onChange={(e,val) => setColor(val * 360)} onChangeCommitted={() => updateLedSetting({color: color / 360})} back/>
            <Box sx={{backgroundColor: `hsl(${color}, 100%, 50%)`, width: 15, height: 15, ml: 1.5}}/>
          </Stack>
        }
    </Stack>
  );

  const ledCards = (
    <Stack justifyContent="space-around" flexDirection="row" sx={styles.cardContainer}>
      {Config.led_modes.map((config, i) => <LedCard config={config} sendRequestCallback={sendLedRequest} key={i} />)}
    </Stack>
  );


  return (
    <div style={styles.body}>
      <Container sx={styles.app}>
        <Typography variant="h1" align="center">🍞</Typography>
        {/* <Stack alignItems="center">
          <ToggleButtonGroup 
            value={page} 
            onChange={(e, val) => setPage(val)} 
            sx={{backgroundColor: 'white'}}
            color="secondary"
            exclusive
          >
            <ToggleButton value={1} sx={{width: '150px'}}>
              My Fav Presets
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack> */}
        {!page && remote}
        {page === 1 && ledCards}
      </Container>
      {/* <AppBar position="fixed" color="primary" sx={styles.footer}>
          <Stack height="80%" flexDirection="row" justifyContent="center" alignItems="center">
              <Typography>
                Content about current mode
              </Typography>
          </Stack>
      </AppBar> */}
    </div>
    
  );
}

export default App;
