th.describe("input.Touches", function() {

  th.it('init', function() {
    var button = phina.ui.Button().addChildTo(this);
    button.position.set(320-150, 480);
    button.onpointstart = function() {
      this.bg.style.color = 'red';
    };
    button.onpointend = function() {
      this.bg.style.color = 'hsl(200, 80%, 60%)';
    };

    var button = phina.ui.Button().addChildTo(this);
    button.position.set(320+150, 480);
    button.onpointstart = function() {
      this.bg.style.color = 'red';
    };
    button.onpointend = function() {
      this.bg.style.color = 'hsl(200, 80%, 60%)';
    };
  });

});

th.describe('input.Gamepad', function() {

  th.it('init', function() {
    var l2code = phina.input.Gamepad.BUTTON_CODE["l2"];
    console.log(l2code);

    var gamepadManager = phina.input.GamepadManager();
    gamepadManager.on("connected", function(e) {
      console.log("connected!", e.gamepad);
    });
    gamepadManager.on("disconnected", function(e) {
      console.log("disconnected!", e.gamepad);
    });

    var rect0 = phina.display.RectangleShape({
      width: 50,
      height: 50,
      color: "blue",
    }).setPosition(640 / 2, 960 / 2).addChildTo(this);

    rect0.update = function() {
      gamepadManager.update();

      var gamepad = gamepadManager.get(0);

      var key = gamepad.getKeyDirection();
      this.position.add(key.mul(10));
      
      var stick = gamepad.getStickDirection();
      if (stick.length() > 0.5) {
        this.position.add(stick.mul(10));
      }

      if (gamepad.getKey("a")) {
        this.scaleX += 0.1;
      } else if (gamepad.getKey("b")) {
        this.scaleX -= 0.1;
      }
      if (gamepad.getKey("x")) {
        this.scaleY += 0.1;
      } else if (gamepad.getKey("y")) {
        this.scaleY -= 0.1;
      }

      if (gamepad.getKey("l1")) {
        this.rotation -= 2;
      }
      if (gamepad.getKey("r1")) {
        this.rotation += 2;
      }
    };
  });

});
