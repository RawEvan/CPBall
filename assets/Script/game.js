const myball = require("ball");
const Block = require('block');
const myfood = require("food");


cc.Class({
    extends: cc.Component,

    properties: {
        ball: {
            default: null,
            type: myball
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
        game_info: {
            default: null,
            type: cc.Label
        },
        food: {
            default: null,
            type: myfood
        },
        ws: null,
        role: null,
        // null -> wait -> init -> play -> over -> wait
        state: null,
        room: null,
        food_freq: 20,
        // fixme: use conf
        host: '118.25.8.36:8888',
        // host: '192.168.73.129:8888',
    },

    getRandomPosition: function () {
        return cc.p(cc.randomMinus1To1() * this.randomRange.x, cc.randomMinus1To1() * this.randomRange.y);
    },

    onLoad: function () {
        var comp = this;
        this.initDirector();
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.sendPlay, this);
        this.initWebSocket();
        this.ws.onmessage = function (evt) {
            var data = JSON.parse(evt.data)
                console.log('receive: ');
                console.log(data);
                if (data.method == 'init') {
                    comp.recvInit(data);
                } else if (data.method == 'play') {
                    comp.recvPlay(data);
                } else if (data.method == 'stop') {
                    comp.game_info.string = 'Stopped';
                }
            }
    },

    initDirector: function () {
        cc.director.getCollisionManager().enabled = true;
        cc.director.getCollisionManager().enabledDebugDraw = true;
        cc.director.getPhysicsManager().enabled = true;
        cc.director.getPhysicsManager().debugDrawFlags = cc.PhysicsManager.DrawBits.e_aabbBit |
            cc.PhysicsManager.DrawBits.e_pairBit |
            cc.PhysicsManager.DrawBits.e_centerOfMassBit |
            cc.PhysicsManager.DrawBits.e_jointBit |
            cc.PhysicsManager.DrawBits.e_shapeBit
    ;
    },

    initWebSocket: function () {
        this.ws = new WebSocket("ws://" + this.host + "/game");
    },

    randomFood: function () {

        // this.randomRange = cc.p(300, 200);
        // this.spawnCount = 0;
        // this.schedule(this.addFood, 0);
        // OR
        // var randomInt = Math.ceil(Math.random()*600);
        // if (randomInt > this.food_freq) {
        //     this.food.position = this.getRandomPosition();
        //     this.food.active = true;
        // };
    },



    onDisable: function () {
        cc.director.getCollisionManager().enabled = false;
        cc.director.getCollisionManager().enabledDebugDraw = false;
        cc.director.getPhysicsManager().enabled = false;
    },

    sendInit: function () {
        console.log('send init');
        this.ws.send(JSON.stringify({
            'method': 'init',
            'user': Global.user,
        })); 
        this.state = 'wait';
        this.game_info.string = 'Waiting...'
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
        this.touch_block.touch_active = true;
        if (data.user1 && data.user2) {
            this.state = 'play';
            this.user_info1.string = data.user1;
            this.user_info2.string = data.user2;
            this.game_info.string = 'Playing';
        }
        this.game_info.string = 'Start';
    },

    sendPlay: function () {
        console.log('send');
        this.ws.send(JSON.stringify({
            'method': 'play',
            'user': Global.user,
            'room': this.room,
            'touch_loc': this.touch_block.touchLoc,
        }));
    },

    recvPlay: function (data) {
        if (data.user != Global.user) {
            this.partner_block.touchLoc = data.touch_loc;
        }
    },

    loadLogin: function () {
        cc.director.loadScene("login");
    },

    update: function (dt) {
        if (this.ball.lost == true) {
            this.loadLogin();
        };

        if (this.state == null && this.ws.readyState == 1) {
            this.sendInit();
        };

        if (this.state == 'play' && this.touch_block.touchLoc) {
            this.sendPlay();
        };
    },
});
