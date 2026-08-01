const Color = new (class {
  reset = "\x1b[0m";
  red = "\x1b[38;2;255;0;0m";
  green = "\x1b[38;2;0;255;0m";
  blue = "\x1b[38;2;0;0;255m";
  orange = "\x1b[38;2;255;100;0m";
  yellow = "\x1b[38;2;255;255;0m";
})();

module.exports = Color;