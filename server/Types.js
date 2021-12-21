class LEDRequest {
  constructor(body) {
    const { name, mode, setting, color } = body;
    this.name = name;
    this.mode = mode;
    this.setting = setting;
    this.color = color;
  }
}

module.exports = {LEDRequest};