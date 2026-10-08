/**
 * Holds the current pressed state of every control the game reacts to.
 *
 * A single instance is shared between the keyboard listeners in game.js and the
 * on-screen touch buttons, so both input methods drive the character through the
 * same four flags. The property names double as the touch lookup keys in
 * getTouchedKey().
 */
class Keyboard {
  LEFT = false;
  RIGHT = false;
  SPACE = false;

  /** Pressed state of the shoot key. */
  D = false;
}
