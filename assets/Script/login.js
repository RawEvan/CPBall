cc.Class({
    extends: cc.Component,

    properties: {
        nameInput: {
            default: null,
            type: cc.EditBox
        },
        // fixme: use conf
        host: '118.25.8.36:8888',
        // host: '192.168.73.129:8888',
    },

    onLoad: function () {
        cc.game.addPersistRootNode(this.node);
    },

    login: function () {
        var user = this.nameInput.string
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
