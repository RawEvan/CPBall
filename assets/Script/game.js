const myball = require("ball");
const Block = require('block');

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
        ws: null,
        role: null,
        state: null,
        host: '118.25.8.36:8888',
    },

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
        this.ws = new WebSocket("ws://" + this.host + "/game");
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
        this.node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            if (this.state == 'play' && this.touch_block.touchLoc) {
                console.log('send');
                this.ws.send(JSON.stringify({
                    'method': 'play',
                    'touch_role': this.touch_role,
                    'touch_loc': this.touch_block.touchLoc,
                }));
            };
        }, this);
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

        while (this.state == null && this.ws.readyState == 1) {
            console.log('send init');
            this.ws.send(JSON.stringify({
                'method': 'init',
                'user': Global.user,
            })); 
            this.state = 'init';
        };
    }
});
