cc.Class({
    extends: cc.Component,

    properties: {
        name_input: {
            default: null,
            type: cc.EditBox
        },
        host: '118.25.8.36:8888', // fixme: use conf
    },

    onLoad: function () {
        cc.game.addPersistRootNode(this.node);
    },

    login: function () {
        var user = this.name_input.string
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "http://" + this.host + "/login/" + user);
        xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
        xhr.onreadystatechange = function () {
                var resp = eval("("+xhr.responseText+")");
                if (resp.succ == true) {
                    Global.user = user;
                    cc.director.loadScene("game");
                };
        };
        xhr.send();
    },
});
