const myball = require("ball");
const Block = require('block');
const myfood = require("food");


cc.Class({
    extends: cc.Component,

    properties: {
        root: {
            default: null,
            type: cc.Node
        },
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
        // FIXME: prepare -> wait -> init -> play -> over -> wait
        state: 'prepare',
        room: null,
        // fixme: use conf
        host: '118.25.8.36:8888',
        // host: '192.168.73.129:8888',
        foodInterval: 1,
    },

    getRandomLoc: function() {
        return cc.p(0.5 * cc.randomMinus1To1() * this.node.position.x, 0.5 * this.bg.parent.y);
    },

    addRandomFood : function () {
        var foodLoc = this.getRandomLoc()
        this.addFood(foodLoc);
        // this.sendFood(foodLoc);
    },

    addFood: function (foodLoc) {
        var food = cc.instantiate(this.food);
        food.parent = this.bg;
        //this.canvas.node.addChild(monster);
        food.position = foodLoc;
        food.ctl = this;
        this.foods.push(food);
    },

    onLostFood: function (food) {
        this.blood -= food.score;
        this.bloodLable.string = 'Blood: ' + this.blood.toString();
    },

    onEatFood: function (food) {
        this.score += food.score;
        this.scoreLable.string = 'Score: ' + this.score.toString();
    },

    onLoad: function () {
        var comp = this;
        this.initWebSocket();
        this.initDirector();
        this.ws.onmessage = function (evt) {
            var data = JSON.parse(evt.data)
                console.log('receive: ');
                console.log(data);
                if (data.method == 'init') {
                    comp.recvInit(data);
                } else if (data.method == 'play') {
                    comp.recvPlay(data);
                } else if (data.method == 'stop') {
                    comp.stateLable.string = 'Stopped';
                } else if (data.method == 'food') {
                    comp.recvFood(data);
                }
            }
        this.initInfo();
        this.root.on(cc.Node.EventType.TOUCH_START, function (event) {
            if (this.touch_block && this.touch_block.touchActive) {
                var touches = event.getTouches();
                var touchLoc = touches[0].getLocation();
                this.touch_block.isMoving = true;
                this.touch_block.touchLoc = this.root.convertToNodeSpaceAR(touchLoc);
            };
        }, this);
        this.root.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            if (this.touch_block && this.touch_block.touchActive) {
                var touches = event.getTouches();
                var touchLoc = touches[0].getLocation();
                this.touch_block.touchLoc = this.root.convertToNodeSpaceAR(touchLoc);
            };
        }, this);
        this.root.on(cc.Node.EventType.TOUCH_END, function (event) {
            if (this.touch_block && this.touch_block.touchActive) {
                this.touch_block.isMoving = false;
            };
        }, this);

    },

    initInfo: function () {
        this.bloodLable.string = 'Blood: ' + this.blood.toString();
        this.scoreLable.string = 'Score: ' + this.score.toString();
        this.stateLable.string = 'State: ' + this.state.toString();
    },

    initDirector: function () {
        cc.director.getCollisionManager().enabled = true;
        cc.director.getPhysicsManager().enabled = true;
        // cc.director.getCollisionManager().enabledDebugDraw = true;
        // cc.director.getPhysicsManager().debugDrawFlags = cc.PhysicsManager.DrawBits.e_aabbBit |
        //     cc.PhysicsManager.DrawBits.e_pairBit |
        //     cc.PhysicsManager.DrawBits.e_centerOfMassBit |
        //     cc.PhysicsManager.DrawBits.e_jointBit |
        //     cc.PhysicsManager.DrawBits.e_shapeBit
    ;
    },

    initWebSocket: function () {
        this.ws = new WebSocket("ws://" + this.host + "/game");
    },

    onDisable: function () {
        cc.director.getCollisionManager().enabled = false;
        cc.director.getPhysicsManager().enabled = false;
    },

    sendInit: function () {
        console.log('send init');
        this.ws.send(JSON.stringify({
            'method': 'init',
            'user': Global.user,
        }));
        this.state = 'wait';
        this.stateLable.string = 'Waiting...'
    },

    recvInit: function (data) {
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
        this.touch_block.touchActive = true;
        this.touch_block.isMoving = true;
        this.partner_block.isMoving = true;
        if (data.user1 && data.user2) {
            this.state = 'play';
            if (Global.user == data.user1) {
                this.schedule(this.addRandomFood, this.foodInterval);
            };
            this.user_info1.string = data.user1;
            this.user_info2.string = data.user2;
            this.stateLable.string = 'Playing';
        }
    },

    sendPlay: function () {
        var data = {
            'method': 'play',
            'user': Global.user,
            'room': this.room,
            'touch_loc': this.touch_block.touchLoc,
        };
        console.log('Send: ');
        console.log(data);
        console.log(this.touch_block.touchLoc);
        this.ws.send(JSON.stringify(data));
    },

    recvPlay: function (data) {
        if (data.user != Global.user) {
            console.log('Set location');
            console.log(data.touch_loc);
            this.partner_block.touchLoc = data.touch_loc;
        }
    },

    sendFood: function (foodLoc) {
        this.ws.send(JSON.stringify({
            'method': 'food',
            'user': Global.user,
            'room': this.room,
            'foodLoc': foodLoc,
        }));
    },

    recvFood: function (foodLoc) {
        this.addFood(data.foodLoc);
    },

    loadLogin: function () {
        cc.director.loadScene("login");
    },

    onBeginContact: function (contact, selfCollider, otherCollider) {
        console.log(otherCollider);
    },

    update: function (dt) {
        if (this.ball.lost == true || this.blood <= 0) {
            this.onDisable();
            this.stateLable.string = 'Game Over';
        };

        if (this.state == 'prepare' && this.ws.readyState == 1) {
            this.sendInit();
        };

        if (this.state == 'play' && this.touch_block.touchLoc) {
            this.sendPlay();
        };
    },
});
