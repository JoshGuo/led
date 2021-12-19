class LEDRequest {
  constructor(body) {
    const { name, mode } = body;
    this.name = name;
    this.mode = mode;
  }
}

module.exports = {LEDRequest};