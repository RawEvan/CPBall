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
        touchBlock: {
            default: null,
            type: Block
        },
        partnerBlock: {
            default: null,
            type: Block
        },
        userInfo1: {
            default: null,
            type: cc.Label
        },
        userInfo2: {
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
        blood: {
            default: 5,
        },
        score: {
            default: 0,
        },
        food: {
            default: null,
            type: cc.Prefab
        },
        foods: {
            default: {},
        },
        ws: null,
        // FIXME: init -> play -> over -> init
        state: {
            default: 'init',
        },
        room: null,
        // fixme: use conf
        host: {
            default: '118.25.8.36:8888',
        },
        hostDebug: {
            default: '192.168.73.129:8888',
        },
        foodInterval: {
            default: 1,
        },
        debug: {
            default: true,
        },
        // owner / member
        role: {
            default: 'member',
        },
        syncProps: [],
        partner: null,
        touchLoc: null,
    },

    _getRandomLoc: function() {
        return cc.p(0.5 * cc.randomMinus1To1() * this.node.position.x, 0.5 * this.bg.parent.y);
    },

    addRandomFood : function () {
        if (this.role != 'owner') return;
        var foodLoc = this._getRandomLoc()
        this._addFood(foodLoc);
    },

    _addFood: function (foodLoc) {
        var food = cc.instantiate(this.food);
        food.parent = this.bg;
        //this.canvas.node.addChild(monster);
        food.position = foodLoc;
        food.ctl = this;
        food.name = food.uuid;
        // default value of prefeb doesn't work
        food.score = 1;
        this.foods[food.name] = {
            'position': food.position,
            'score': food.score,
        }
        return food;

    },

    _onDeletedFood: function (food) {
        if (this.role != 'owner') return;
        delete this.foods[food.node.name];
        food.node.destroy();
    },

    onLostFood: function (food) {
        this.blood -= food.score;
        this._onDeletedFood(food);
    },

    onEatFood: function (food) {
        this.score += food.score;
        this._onDeletedFood(food);
    },

    receiveData: function () {
        var data;
        var comp = this;
        if (this.ws) {
            this.ws.onmessage = function (evt) {
                data = JSON.parse(evt.data);
                comp.resolveMethod(data);
            };
        }
    },
    generateFakeData: function () {
        if (this.debug) {Global.user = '1';}
        var data = {
                'sender': '1',
                // client event (current client state)
                'event': 'init',
                'room': '1',
                'server': {
                    // server set client next state
                    'method': 'start',
                    'user1': '1',
                    'user2': '2',
                    'owner': '1',
                    'room': '1',
                },
                'client': {
                    '1': { //uid
                        'name': '1',
                        'touch_loc': this.touchLoc,
                    },
                    '2': {
                        'name': '2',
                    }
                },
                'food': {
                    'location': this.touchLoc,
                }
            };
        return data;
    },
    resolveMethod: function (data) {
        console.log('receive: \n', data);
        var method = data.server.method;
        switch (method){
            // init: keep init state because no user found
            case 'init':
                this.initGame(data);
                break;
            case 'start':
                this.startGame(data);
                break;
            case 'play':
                this.play(data);
                break;
            case 'stop': 
                this.stop(data);
                break;
        }
    },

    initGame: function (data) {
        if (!Global.user) {Global.user = data['sender']};
    },

    stop: function (data) {
        this.stateLable.string = 'Stopped';
    },

    onLoad: function () {
        // component
        var comp = this;
        this.initWebSocket();
        this.initDirector();
        this.receiveData()
        this.root.on(cc.Node.EventType.TOUCH_START, function (event) {
            if (this.touchBlock && this.touchBlock.touchActive) {
                var touches = event.getTouches();
                this.touchLoc = touches[0].getLocation();
                this.touchBlock.isMoving = true;
                if (this.role == 'owner') {
                    this.touchBlock.touchLoc = this.bg.convertToNodeSpaceAR(this.touchLoc);
                }
            };
        }, this);
        this.root.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            if (this.touchBlock && this.touchBlock.touchActive) {
                var touches = event.getTouches();
                this.touchLoc = touches[0].getLocation();
                if (this.role == 'owner') {
                    this.touchBlock.touchLoc = this.bg.convertToNodeSpaceAR(this.touchLoc);
                }
            };
        }, this);
        this.root.on(cc.Node.EventType.TOUCH_END, function (event) {
            if (this.touchBlock && this.touchBlock.touchActive) {
                this.touchBlock.isMoving = false;
            };
        }, this);

    },

    updateLabels: function (data) {
        if (this.role == 'member') {
            this.blood = data.blood ? data.blood :this.blood;
            this.score = data.score ? data.score :this.score;
        }
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
        var comp = this;
        if (this.debug) {
            var host = this.hostDebug;
        }else{
            var host = this.host;
        }
        this.ws = new WebSocket("ws://" + host + "/game");

        this.ws.onopen = function () {
            comp.sendInfo();
        }
    },

    onDisable: function () {
        cc.director.getCollisionManager().enabled = false;
        cc.director.getPhysicsManager().enabled = false;
    },

    sendInfo: function () {
        // members send event only
        // owner computes and sends all members' props
        var sendData = {
            'sender': Global.user,
            'event': this.state,
            'room': this.room,
        }
        sendData['client'] = {};
        if (this.role == 'owner') {
            if (Global.user){
                sendData['client'][Global.user] = {
                    'name': Global.user,
                    'state': this.state,
                    'position': this.touchBlock.node.position,
                }
            }
            if (this.partner){
                sendData['client'][this.partner] = {
                    'name': Global.user,
                    'state': this.state,
                    'position': this.partnerBlock.node.position,
                }
            }
            // owner send other clients data
            sendData['foods'] = this.foods;
        }else {
            if (Global.user){
                sendData['client'][Global.user] = {
                    'name': Global.user,
                    'state': this.state,
                }
                if (this.touchLoc) {
                    sendData['client'][Global.user]['touch_loc'] = 
                        this.bg.convertToNodeSpaceAR(this.touchLoc)
                }
            }
        }
        // if (this.debug) {
            sendData['debug'] = true
        // }
        sendData['score'] = this.score;
        sendData['blood'] = this.blood;
        // sendData['state'] = this.state;
        console.log('send: \n', sendData);
        this.ws.send(JSON.stringify(sendData));
    },

    updateFromData: function (data) {
        this.updateLabels(data);
        // member removes deleted foods (owner deletes by itself)
        if (!data.foods) return;
        for (var foodName in this.foods) {
            if (!data.foods[foodName]) {
                var delFood = this.bg.getChildByName(foodName);
                if (delFood) delFood.destroy();
            }
        }
        this.foods = data.foods;
    },

    updateInfo: function () {
        this.bloodLable.string = 'Blood: ' + this.blood.toString();
        this.scoreLable.string = 'Score: ' + this.score.toString();
        this.stateLable.string = 'State: ' + this.state.toString();
        for (var foodName in this.foods) {
            var foodInfo = this.foods[foodName];
            var foodIns;
            if (this.role == 'member') {
                // member: set instance from owner info
                if (!this.bg.getChildByName(foodName)) {
                    foodIns = this._addFood(foodInfo.position);
                    foodIns.name = foodName;
                }else{
                    foodIns = this.bg.getChildByName(foodName);
                }
                foodIns.position = foodInfo.position;
                foodIns.score = foodInfo.score;
            }else{
                // owner: set info from instance
                foodIns = this.bg.getChildByName(foodName);
                if (foodIns) {
                    foodInfo.position = foodIns.position;
                    foodInfo.score = foodIns.score;
                }
            }
        }
    },
    startGame: function (data) {
        if (!Global.user) {Global.user = data['sender']}
        if (this.state == 'play') return;
        var user1 = data.server.user1;
        var user2 = data.server.user2;
        this.block1.user = user1;
        this.block2.user = user2;
        // TODO
        this.room = user1;
        if (user1 == Global.user) {
            this.touchBlock = this.block1;
            this.partnerBlock = this.block2;
            this.partner = user2;
            this.role = 'owner';
        } else {
            this.touchBlock = this.block2;
            this.partnerBlock = this.block1;
            this.partner = user1;
            this.role = 'member';
        }
        this.touchBlock.touchActive = true;
        this.touchBlock.isMoving = true;
        this.partnerBlock.isMoving = true;
        this.state = 'play';
    },

    play: function (data) {
        var user1 = data.server.user1;
        var user2 = data.server.user2;
        if (!(user1 && user2) | data.sender == Global.user) {return;}

        if (Global.user == user1) {
            this.schedule(this.addRandomFood, this.foodInterval);
        };
        this.userInfo1.string = user1;
        this.userInfo2.string = user2;
        this.stateLable.string = 'Playing';

        if (this.role == 'member') {
            // TODO: set touchLoc or position?
            // TODO: set location as the mid of member and owner computed result
            this.touchBlock.node.position = data.client[Global.user].position;
            this.partnerBlock.node.position = data.client[this.partner].position;
        }else{
            // compute member's position
            this.partnerBlock.touchLoc = data.client[this.partner]['touch_loc'];
        }

        this.updateFromData(data);
    },

    loadLogin: function () {
        cc.director.loadScene("login");
    },

    onBeginContact: function (contact, selfCollider, otherCollider) {
        console.log(otherCollider);
    },

    update: function (dt) {
        // if (this.debug && this.state == 'init' && !this.ws) {
        //     this.resolveMethod(this.generateFakeData());
        // }
        if (this.state == 'play' && this.ws && this.ws.readyState==1){
            this.updateInfo();
            this.sendInfo();
        }
    },
});
