cc.Class({
    extends: cc.Component,

    properties: {
        lbl_name : cc.Label,
        lbl_btn : cc.Label,
        btn : cc.Button,
        duration : 0.05,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.name_arr = [];
        this.play_ind = 0;
        cc.loader.loadRes("team.json",null,(err,arr) => {
            if(!err){
                this.name_arr = arr;
                this.play_ind = Math.floor(Math.random()*1000) % this.name_arr.length;
                this.update_ui();
            }
        });
        this.schedule_cb = function () {
            ++this.play_ind;
            this.play_ind %= this.name_arr.length;
            this.update_ui();
        };
        this.game_running = false;
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        // cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.schedule_cb, this);
    },

    onKeyDown: function (event) {
        switch(event.keyCode) {
            case cc.KEY.space:
                cc.log("onKeyDown");
                this.on_start();
                break;
        }
    },

    onKeyUp: function (event) {
        switch(event.keyCode) {
            case cc.KEY.space:
                this.on_click_btn();
                break;
        }
    },

    update_ui:function () {
        this.lbl_name.string = this.name_arr[this.play_ind];
    },

    on_start:function () {
        cc.log("on_start");
        this.btn.interactable = false;
        this.btn.node.runAction(cc.sequence(cc.delayTime(5.0),cc.callFunc(
            ()=>{
                this.lbl_btn.string = "End";
                this.btn.interactable = true;
            }
        )))
        this.schedule(this.schedule_cb,this.duration);
    },

    on_end:function () {
        cc.log("on_end");
        this.lbl_btn.string = "Start";
        this.unschedule(this.schedule_cb);
        this.name_arr.splice(this.play_ind,1);
    },

    on_click_btn:function () {
        this.game_running = !this.game_running;
        if(this.game_running){
            this.on_start();
        }
        else{
            this.on_end();
        }
    },

    // update (dt) {},
});
