// Learn cc.Class:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/class/index.html
// Learn Attribute:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/reference/attributes/index.html
// Learn life-cycle callbacks:
//  - [Chinese] http://www.cocos.com/docs/creator/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/editors_and_tools/creator-chapters/scripting/life-cycle-callbacks/index.html

cc.Class({
    extends: cc.Component,

    properties: {
        inviteLayout: {
            default: null,
            type: cc.Node
        },
        nameInput: {
            default: null,
            type: cc.EditBox
        }
    },

    ws: null,

    onLoad () {
        this.ws = new WebSocket("ws://192.168.73.129:8888/hall");
        this.ws.onmessage = function (evt) {
            data = JSON.parse(evt.data)
            console.log(data);
            if (data.server.method == 'init') {
                cc.director.loadScene("game");
            };
        };
    },

    searchUser () {
        this.ws.send(JSON.stringify({
            'client': {
                'method': 'invite',
                'user': Global.user,
                'partner': this.nameInput.string,
            }
        }));
    },
})