#include <ArduinoJson.h>
#include <NeoPixelBus.h>
#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>
#include <WebSocketsClient.h>
#include <SocketIOclient.h>

#define ENV 1

#define WIFI_SSID "f231fa"
#define WIFI_PASS "gain.037.barrier"

#define NUM_LEDS 300
#define LIGHTNESS .25f
#define LED_PIN_OUT 4

#define MAX_SPARKLING 125
#define MAX_SPARKLING_LIGHTNESS .7f

// HTTP Vars
ESP8266WiFiMulti WiFiMulti;
SocketIOclient socketIO;
const String API_URI = ENV == 0 ? "192.168.1.98" : "jguo-led.herokuapp.com";

NeoPixelBus<NeoGrbFeature, Neo800KbpsMethod> strip(NUM_LEDS);
int currMode = 0;
int setting = 0;
float colorSetting = 0;
HsbColor ledState[NUM_LEDS];
boolean pulseUp = true;

int sparkleStates[NUM_LEDS];
int numSparkling = 0;

/**
 * Secondary Modes - Fade Types
 * 0: Rainbow (does not show full rainbow at once)
 * 1: Warm
 * 2: Cool
 */
void initPulse() {
  switch(setting) {
    case 0: initRainbowPulse(); break;
    case 1: initWarmPulse(); break;
    case 2: initCoolPulse(); break;
    case 3: initColorPulse(); break;
    default: break;
  }
}

void initRainbowPulse() {
  for(int i = 0; i < NUM_LEDS; i++) {
    float hue = (float) i / NUM_LEDS;
    HsbColor color = HsbColor(hue, 1, LIGHTNESS);
    ledState[i] = HsbColor(hue, 1, LIGHTNESS);
    strip.SetPixelColor(i, HsbColor(hue, 1, LIGHTNESS));
  }
}

void initWarmPulse() {
  float startHue = -35.0f / 360;
  float endHue = 30.0f / 360;
  for(int i = 0; i < NUM_LEDS / 2; i++) {
    float hue = startHue + (float) i / (NUM_LEDS / 2) * (endHue - startHue);
    if(hue < 0) hue += 1;
    HsbColor color = HsbColor(hue, 1, LIGHTNESS);
    strip.SetPixelColor(i, color);
    strip.SetPixelColor(NUM_LEDS - 1 - i, color);
    ledState[i] = color;
    ledState[NUM_LEDS - 1 - i] = color;
  }
}

void initCoolPulse() {
  float startHue = 190.0f / 360;
  float endHue = 290.0f / 360;
  for(int i = 0; i < NUM_LEDS / 2; i++) {
    float hue = startHue + (float) i / (NUM_LEDS / 2) * (endHue - startHue);
    HsbColor color = HsbColor(hue, 1, LIGHTNESS);
    strip.SetPixelColor(i, color);
    strip.SetPixelColor(NUM_LEDS - 1 - i, color);
    ledState[i] = color;
    ledState[NUM_LEDS - 1 - i] = color;
  }
}

void initColorPulse() {
  for(int i = 0; i < NUM_LEDS; i++) {
    HsbColor color = HsbColor(colorSetting, 1, LIGHTNESS);
    strip.SetPixelColor(i, color);
    ledState[i] = color;
  }
}

void doPulse() {
  delay(10);
  float newBrightness = ledState[0].B;
  if(pulseUp) {
    newBrightness += .001;
  }else {
    newBrightness -= .001;
  }

  if(newBrightness > LIGHTNESS * 1 || newBrightness < LIGHTNESS/8) {
    pulseUp = !pulseUp;
    newBrightness = ledState[0].B;
  }

  for(int i = 0; i < NUM_LEDS; i++) {
    ledState[i].B = newBrightness;
    strip.SetPixelColor(i, ledState[i]);
  }
}

/**
 * Secondary Modes - Fade Types
 * 0: Rainbow (does not show full rainbow at once)
 * 1: Warm
 * 2: Cool
 */
void initFade() {
  switch(setting) {
    case 0: initRainbowFade(); break;
    case 1: initWarmFade(); break;
    case 2: initCoolFade(); break;
    case 3: initColorFade(); break;
  }
}

void initRainbowFade() {
  for(int i = 0; i < NUM_LEDS; i++) {
    float hue = (float) i / NUM_LEDS / 5;
    HsbColor color = HsbColor(hue, 1, LIGHTNESS);
    ledState[i] = color;
    strip.SetPixelColor(i, color);
  }
}

void initWarmFade() {
  float startHue = -35.0f / 360;
  float endHue = 30.0f / 360;
  for(int i = 0; i < NUM_LEDS / 2; i++) {
    float hue = startHue + (float) i / (NUM_LEDS / 2) * (endHue - startHue);
    if(hue < 0) hue += 1;
    strip.SetPixelColor(i, HsbColor(hue, 1, LIGHTNESS));
    strip.SetPixelColor(NUM_LEDS - 1 - i, HsbColor(hue, 1, LIGHTNESS));
  }
}

void initCoolFade() {
  float startHue = 190.0f / 360;
  float endHue = 290.0f / 360;
  for(int i = 0; i < NUM_LEDS / 2; i++) {
    float hue = startHue + (float) i / (NUM_LEDS / 2) * (endHue - startHue);
    strip.SetPixelColor(i, HsbColor(hue, 1, LIGHTNESS));
    strip.SetPixelColor(NUM_LEDS - 1 - i, HsbColor(hue, 1, LIGHTNESS));
  }
}

void initColorFade() {
  strip.ClearTo(RgbColor(0,0,0));
  int cycles = 5;
  int ledsPerCycle =  NUM_LEDS / cycles;
  for(int cycle = 0; cycle < cycles; cycle++) {
    int startLed = cycle * NUM_LEDS / cycles;
    int endLed = (cycle + 1) * NUM_LEDS / cycles - 1;
    for(int i = 0; i < ledsPerCycle / 2; i++) {
      float lightness = (float) i / ledsPerCycle * (LIGHTNESS);
      HsbColor color = HsbColor(colorSetting, 1, lightness);
      strip.SetPixelColor(startLed + i, color);
      strip.SetPixelColor(endLed - i, color);
    }
  }
}

void doFade() {
  if(setting == 0) {
    delay(10);
    float delta = 1.0f / NUM_LEDS / 5;
    for(int i = 0; i < NUM_LEDS; i++) {
      ledState[i].H += delta;
      if(ledState[i].H > 1) ledState[i].H = 0;
      strip.SetPixelColor(i, ledState[i]); 
    }
  } else {
    delay(20);
    strip.RotateRight(1);
  }
}

/**
 * Secondary Modes - Sparkle Types
 * 0: Normal Rainbow
 * 1: Warm Colors
 * 2: Cool Colors
 * 3: Soft White / Custom Color
 */
void initSparkle() {
  for(int i = 0; i < NUM_LEDS; i++) {
    HsbColor color;
    if(setting == 0) {
      color = HsbColor((float) i / NUM_LEDS, 1, 0);
    } else if(setting == 1) {
      color = HsbColor((float) random(0, 30)/360, 1, 0);
    } else if(setting == 2) {
      color = HsbColor((float) random(190, 270)/360, 1, 0);
    } else if(setting == 3) {
//      color = HsbColor(.12f, .85f, 0);
      color = HsbColor(colorSetting, .85f, 0);
    }
    ledState[i] = color;
    strip.SetPixelColor(i, color);
  }
}

void doSparkle() {
  // Choose new led to sparkle
  if(numSparkling < MAX_SPARKLING) {
    boolean found = false;
    int randInt = random(0, 100);
    while(!found && randInt < 15) {
      int randLed = random(0, NUM_LEDS);
      if(sparkleStates[randLed] == 0) {
        found = true;
        sparkleStates[randLed] = 1;
        numSparkling++;
      }
    }
  }

  // Raise and dim led brightnesses
  for(int i = 0; i < NUM_LEDS; i++) {
    if(sparkleStates[i] == 2) {
      ledState[i].B -= .0035f;
      if(ledState[i].B < 0.0f) {
        ledState[i].B = 0.0f;
        sparkleStates[i] = 0;
        numSparkling--;
      }
    }
    
    if(sparkleStates[i] == 1) {
      ledState[i].B += .005f;
      if(ledState[i].B > MAX_SPARKLING_LIGHTNESS) {
        ledState[i].B = MAX_SPARKLING_LIGHTNESS;
        sparkleStates[i] = 2;
      }
    }
    strip.SetPixelColor(i, ledState[i]);
  }
  delay(20);
}

void initMode(int newMode, int newSetting, float newColor) {
  currMode = newMode;
  setting = newSetting;
  colorSetting = newColor;
  switch(currMode) {
    case 0: 
      strip.ClearTo(RgbColor(0,0,0));
      break;
    case 1:
      initPulse();
//      strip.ClearTo(); // Add Solid color stuff
      break;
    case 2:
      initFade();
      break;
    case 3:
      initSparkle();
    default:
      break;
  }
  strip.Show();
}

void connectToWifi() {
  Serial.println("Connecting to WiFi");
  // disable AP
  if(WiFi.getMode() & WIFI_AP) {
      WiFi.softAPdisconnect(true);
  }
  WiFiMulti.addAP(WIFI_SSID, WIFI_PASS);
  while(WiFiMulti.run() != WL_CONNECTED) {
    delay(100);
  }
  String ip = WiFi.localIP().toString();
  Serial.printf("[SETUP] WiFi Connected %s\n", ip.c_str());
}

void socketIOEvent(socketIOmessageType_t type, uint8_t * payload, size_t length) {
    switch(type) {
        case sIOtype_DISCONNECT:
            Serial.printf("[IOc] Disconnected!\n");
            break;
        case sIOtype_CONNECT:
            Serial.printf("[IOc] Connected to url: %s\n", payload);

            // join default namespace (no auto join in Socket.IO V3)
            socketIO.send(sIOtype_CONNECT, "/");
            break;
        case sIOtype_EVENT:
        {
            char * sptr = NULL;
            int id = strtol((char *)payload, &sptr, 10);
//            Serial.printf("[IOc] get event: %s id: %d\n", payload, id);
            
            DynamicJsonDocument doc(1024);
            deserializeJson(doc, payload, length);
            String eventName = doc[0];
            int newMode = doc[1]["mode"];
            int newSetting = doc[1]["setting"];
            float newColor = doc[1]["color"];
            Serial.printf("[IOc] Event name: %s | Mode: %d | Setting: %d | Color: %f \n", eventName.c_str(), newMode, newSetting, newColor);
            initMode(newMode, newSetting, newColor);
            break;
        }
        case sIOtype_ACK:
            Serial.printf("[IOc] get ack: %u\n", length);
            hexdump(payload, length);
            break;
        case sIOtype_ERROR:
            Serial.printf("[IOc] get error: %u\n", length);
            hexdump(payload, length);
            break;
        case sIOtype_BINARY_EVENT:
            Serial.printf("[IOc] get binary: %u\n", length);
            hexdump(payload, length);
            break;
        case sIOtype_BINARY_ACK:
            Serial.printf("[IOc] get binary ack: %u\n", length);
            hexdump(payload, length);
            break;

    }
}

void setup() {
  Serial.begin(115200);
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, HIGH);

  strip.Begin();
  initMode(currMode, setting, colorSetting);
  strip.Show();

  connectToWifi();

  socketIO.begin(API_URI, 80, "/socket.io/?EIO=4");
  socketIO.onEvent(socketIOEvent);
}

/**
 * LED Modes
 * 0: OFF
 * 1: PULSE
 * 2: FADE
 * 3: SPARKLE
 */
void loop() {
  socketIO.loop();
  // Switch between modes
  switch(currMode) {
    case 0:
      break;
    case 1: 
      doPulse();
      break;
    case 2: 
      doFade();
      break;
    case 3: 
      doSparkle();
      break;
  }
  strip.Show();
}
