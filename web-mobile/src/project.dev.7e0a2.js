require = function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var a = "function" == typeof require && require;
        if (!u && a) return a(o, !0);
        if (i) return i(o, !0);
        var f = new Error("Cannot find module '" + o + "'");
        throw f.code = "MODULE_NOT_FOUND", f;
      }
      var l = n[o] = {
        exports: {}
      };
      t[o][0].call(l.exports, function(e) {
        var n = t[o][1][e];
        return s(n || e);
      }, l, l.exports, e, t, n, r);
    }
    return n[o].exports;
  }
  var i = "function" == typeof require && require;
  for (var o = 0; o < r.length; o++) s(r[o]);
  return s;
}({
  ball: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "ef3edhleSxPXo+9i9rE4PYd", "ball");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        lost: false
      },
      onBeginContact: function onBeginContact(contact, selfCollider, otherCollider) {
        if ("groud" == otherCollider.node.name) {
          this.lost = true;
          this.node.ctl.onLostFood(this);
          console.log("lost");
        }
      }
    });
    cc._RF.pop();
  }, {} ],
  block: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "624d8bAZFBM+KngHwRwKtlk", "block");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        speed: 400,
        direction_x: 0,
        direction_y: 0,
        user: null,
        touchLoc: null,
        touch_active: false
      },
      onLoad: function onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_MOVE, function(event) {
          this.touch_active && (this.touchLoc = event.getTouches()[0].getLocation());
        }, this);
      },
      update: function update(dt) {
        this.touchLoc && (this.node.position = this.node.parent.convertToNodeSpaceAR(this.touchLoc));
      }
    });
    cc._RF.pop();
  }, {} ],
  food: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "c999d9Hl5NGSIStIbb0B6h0", "food");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        score: 1,
        lost: false
      },
      onBeginContact: function onBeginContact(contact, selfCollider, otherCollider) {
        if ("groud" == otherCollider.node.name) {
          this.lost = true;
          this.node.ctl.onLostFood(this);
          console.log("lost");
        }
        if ("ball" == otherCollider.node.name) {
          this.node.ctl.onEatFood(this);
          console.log("eat");
        }
        this.node.destroy();
      }
    });
    cc._RF.pop();
  }, {} ],
  game: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "f996eXuaj1HzpM2St7B4PGS", "game");
    "use strict";
    var myball = require("ball");
    var Block = require("block");
    var myfood = require("food");
    cc.Class({
      extends: cc.Component,
      properties: {
        ball: {
          default: null,
          type: myball
        },
        bg: {
          default: null,
          type: cc.Node
        },
        block1: {
          default: null,
          type: Block
        },
        block2: {
          default: null,
          type: Block
        },
        touch_block: {
          default: null,
          type: Block
        },
        partner_block: {
          default: null,
          type: Block
        },
        user_info1: {
          default: null,
          type: cc.Label
        },
        user_info2: {
          default: null,
          type: cc.Label
        },
        scoreLable: {
          default: null,
          type: cc.Label
        },
        bloodLable: {
          default: null,
          type: cc.Label
        },
        stateLable: {
          default: null,
          type: cc.Label
        },
        blood: 5,
        score: 0,
        food: {
          default: null,
          type: cc.Prefab
        },
        foods: [],
        ws: null,
        role: null,
        state: "prepare",
        room: null,
        host: "118.25.8.36:8888",
        foodInterval: 1
      },
      getRandomLoc: function getRandomLoc() {
        return cc.p(.5 * cc.randomMinus1To1() * this.node.position.x, .5 * this.bg.parent.y);
      },
      addRandomFood: function addRandomFood() {
        var foodLoc = this.getRandomLoc();
        this.addFood(foodLoc);
      },
      addFood: function addFood(foodLoc) {
        var food = cc.instantiate(this.food);
        food.parent = this.bg;
        food.position = foodLoc;
        food.ctl = this;
        this.foods.push(food);
      },
      onLostFood: function onLostFood(food) {
        this.blood -= food.score;
        this.bloodLable.string = "Blood: " + this.blood.toString();
      },
      onEatFood: function onEatFood(food) {
        this.score += food.score;
        this.scoreLable.string = "Score: " + this.score.toString();
      },
      onLoad: function onLoad() {
        var comp = this;
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.sendPlay, this);
        this.initWebSocket();
        this.initDirector();
        this.ws.onmessage = function(evt) {
          var data = JSON.parse(evt.data);
          console.log("receive: ");
          console.log(data);
          "init" == data.method ? comp.recvInit(data) : "play" == data.method ? comp.recvPlay(data) : "stop" == data.method ? comp.stateLable.string = "Stopped" : "food" == data.method && comp.recvFood(data);
        };
        this.initInfo();
      },
      initInfo: function initInfo() {
        this.bloodLable.string = "Blood: " + this.blood.toString();
        this.scoreLable.string = "Score: " + this.score.toString();
        this.stateLable.string = "State: " + this.state.toString();
      },
      initDirector: function initDirector() {
        cc.director.getCollisionManager().enabled = true;
        cc.director.getPhysicsManager().enabled = true;
      },
      initWebSocket: function initWebSocket() {
        this.ws = new WebSocket("ws://" + this.host + "/game");
      },
      onDisable: function onDisable() {
        cc.director.getCollisionManager().enabled = false;
        cc.director.getPhysicsManager().enabled = false;
      },
      sendInit: function sendInit() {
        console.log("send init");
        this.ws.send(JSON.stringify({
          method: "init",
          user: Global.user
        }));
        this.state = "wait";
        this.stateLable.string = "Waiting...";
      },
      recvInit: function recvInit(data) {
        this.block1.user = data.user1;
        this.block2.user = data.user2;
        this.room = data.user1;
        if (data.user1 == Global.user) {
          this.touch_block = this.block1;
          this.partner_block = this.block2;
        } else {
          this.touch_block = this.block2;
          this.partner_block = this.block1;
        }
        this.touch_block.touch_active = true;
        if (data.user1 && data.user2) {
          this.state = "play";
          Global.user == data.user1 && this.schedule(this.addRandomFood, this.foodInterval);
          this.user_info1.string = data.user1;
          this.user_info2.string = data.user2;
          this.stateLable.string = "Playing";
        }
      },
      sendPlay: function sendPlay() {
        console.log("send");
        console.log(Global.user);
        this.ws.send(JSON.stringify({
          method: "play",
          user: Global.user,
          room: this.room,
          touch_loc: this.touch_block.touchLoc
        }));
      },
      recvPlay: function recvPlay(data) {
        data.user != Global.user && (this.partner_block.touchLoc = data.touch_loc);
      },
      sendFood: function sendFood(foodLoc) {
        this.ws.send(JSON.stringify({
          method: "food",
          user: Global.user,
          room: this.room,
          foodLoc: foodLoc
        }));
      },
      recvFood: function recvFood(foodLoc) {
        this.addFood(data.foodLoc);
      },
      loadLogin: function loadLogin() {
        cc.director.loadScene("login");
      },
      onBeginContact: function onBeginContact(contact, selfCollider, otherCollider) {
        console.log(otherCollider);
      },
      update: function update(dt) {
        if (true == this.ball.lost || this.blood <= 0) {
          this.onDisable();
          this.stateLable.string = "Game Over";
        }
        "prepare" == this.state && 1 == this.ws.readyState && this.sendInit();
        "play" == this.state && this.touch_block.touchLoc && this.sendPlay();
      }
    });
    cc._RF.pop();
  }, {
    ball: "ball",
    block: "block",
    food: "food"
  } ],
  global: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "a5e579gtl9Mx5bHZ3QZqr3T", "global");
    "use strict";
    window.Global = {
      user: ""
    };
    cc._RF.pop();
  }, {} ],
  hall: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "fdc5eQF0RJL5LJeuQFmG/Xl", "hall");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        invite_layout: {
          default: null,
          type: cc.Node
        },
        name_input: {
          default: null,
          type: cc.EditBox
        }
      },
      ws: null,
      onLoad: function onLoad() {
        this.ws = new WebSocket("ws://192.168.73.129:8888/hall");
        this.ws.onmessage = function(evt) {
          data = JSON.parse(evt.data);
          console.log(data);
          "init" == data.method && true == data.succ && cc.director.loadScene("game");
        };
      },
      search_user: function search_user() {
        this.ws.send(JSON.stringify({
          method: "invite",
          user: Global.user,
          partner: this.name_input.string
        }));
      }
    });
    cc._RF.pop();
  }, {} ],
  login: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "0ca4fH1hktP9KBdc7y9kP86", "login");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        name_input: {
          default: null,
          type: cc.EditBox
        },
        host: "118.25.8.36:8888"
      },
      onLoad: function onLoad() {
        cc.game.addPersistRootNode(this.node);
      },
      login: function login() {
        var user = this.name_input.string;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "http://" + this.host + "/login/" + user);
        xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
        xhr.onreadystatechange = function() {
          var resp = eval("(" + xhr.responseText + ")");
          if (true == resp.succ) {
            Global.user = user;
            cc.director.loadScene("game");
          }
        };
        xhr.send();
      }
    });
    cc._RF.pop();
  }, {} ]
}, {}, [ "ball", "block", "food", "game", "global", "hall", "login" ]);
//# sourceMappingURL=project.dev.js.map