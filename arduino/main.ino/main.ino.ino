#include <NeoPixelBus.h>

#define NUM_LEDS 300
#define BRIGHTNESS 100
#define LIGHTNESS .34f
#define LED_PIN_OUT 4

NeoPixelBus<NeoGrbFeature, Neo800KbpsMethod> strip(NUM_LEDS);

void setup() {
  strip.Begin();
  strip.Show();
}

void loop() {
   RgbColor colors[] = {RgbColor(BRIGHTNESS,0,0), RgbColor(0,BRIGHTNESS,0), RgbColor(0,0,BRIGHTNESS), RgbColor(0,0,0)};
   for(RgbColor color : colors) {
    for(int i = 0; i < NUM_LEDS; i++) {
      strip.SetPixelColor(i, color);
    }
    strip.Show();
    delay(1000);
  }
}
