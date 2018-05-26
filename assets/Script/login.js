cc.Class({
    extends: cc.Component,

    properties: {
        name_input: {
            default: null,
            type: cc.EditBox
        }
    },

    onLoad: function () {
        cc.game.addPersistRootNode(this.node);
    },

    login: function () {
        var user = this.name_input.string
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "http://192.168.73.129:8888/login/" + user);
        xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
        xhr.onreadystatechange = function () {
                var resp = eval("("+xhr.responseText+")");
                if (resp.succ == true) {
                    Global.user = user;
                    cc.director.loadScene("hall");
                };
        };
        xhr.send();
    },
});
