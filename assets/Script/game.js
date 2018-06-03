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
        user_info1: {
            default: null,
            type: cc.Label
        },
        user_info2: {
            default: null,
            type: cc.Label
        },
        score: {
            default: null,
            type: cc.Label
        },
        food: {
            default: null,
            type: myfood
        },
        ws: null,
        role: null,
        state: null,
        food_freq: 20,
        host_build: '118.25.8.36:8888',
        host_dev: '192.168.73.129:8888',
    },

    getRandomPosition: function () {
        return cc.p(cc.randomMinus1To1() * this.randomRange.x, cc.randomMinus1To1() * this.randomRange.y);
    },

    // addFood: function () {
    //     var randomInt = Math.ceil(Math.random()*600);
    //     if (randomInt > this.food_freq) {
    //         this.food.position = this.getRandomPosition();
    //         this.food.active = true;
    //     };
    // },
    // use this for initialization
    onLoad: function () {
        cc.director.getCollisionManager().enabled = true;
        cc.director.getCollisionManager().enabledDebugDraw = true;
        cc.director.getPhysicsManager().enabled = true;
        cc.director.getPhysicsManager().debugDrawFlags = cc.PhysicsManager.DrawBits.e_aabbBit |
            cc.PhysicsManager.DrawBits.e_pairBit |
            cc.PhysicsManager.DrawBits.e_centerOfMassBit |
            cc.PhysicsManager.DrawBits.e_jointBit |
            cc.PhysicsManager.DrawBits.e_shapeBit
    ;
        var comp = this;
        try {
            this.ws = new WebSocket("ws://" + this.host_build + "/game");
        } catch (e) {     
            this.ws = new WebSocket("ws://" + this.host_dev + "/game");
        }
        this.ws.onmessage = function (evt) {
            var data = JSON.parse(evt.data)
            console.log('receive: ');
            console.log(data);
            if (data.method == 'init') {
                comp.block1.user = data.user1;
                comp.block2.user = data.user2;
                if (data.user1 == Global.user) {
                    comp.touch_role = 'touch_loc1';
                    comp.touch_block = comp.block1;
                } else {
                    comp.touch_role = 'touch_loc2';
                    comp.touch_block = comp.block2;
                }
                comp.touch_block.touch_active = true;
                if (data.user1 && data.user2) {
                    comp.state = 'play';
                    comp.user_info1.string = data.user1;
                    comp.user_info2.string = data.user2;
                }
            } else if (data.method == 'play') {
                comp.block1.touchLoc = data.touch_loc1;
                comp.block2.touchLoc = data.touch_loc2;
            };
        };
        // this.node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
        // }, this);

        // this.randomRange = cc.p(300, 200);
        // this.spawnCount = 0;
        // this.schedule(this.addFood, 0);
    },
    
    onDisable: function () {
        cc.director.getCollisionManager().enabled = false;
        cc.director.getCollisionManager().enabledDebugDraw = false;
        cc.director.getPhysicsManager().enabled = false;
    },


    update: function (dt) {
        if (this.ball.lost == true) {
                cc.director.loadScene("login");
        };

        if (this.state == null && this.ws.readyState == 1) {
            console.log('send init');
            this.ws.send(JSON.stringify({
                'method': 'init',
                'user': Global.user,
            })); 
            this.state = 'init';
        };

        if (this.state == 'play' && this.touch_block.touchLoc) {
            console.log('send');
            this.ws.send(JSON.stringify({
                'method': 'play',
                'touch_role': this.touch_role,
                'touch_loc': this.touch_block.touchLoc,
            }));
        };
    }
});
