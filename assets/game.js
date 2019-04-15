cc.Class({
    extends: cc.Component,

    properties: {
        lbl_name : cc.Label,
        lbl_btn : cc.Label,
        btn : cc.Button,
        duration : 0.05,
        node_item : cc.Node,
        node_notice : cc.Node,
        fr_heads: cc.SpriteAtlas,
        img_head : cc.Sprite,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.members =
        this.name_arr = [];
        this.play_ind = 0;
        this.total_weight = 0;
        this.play_times = 99999999;
        cc.loader.loadRes("team.json",null,(err,_obj) => {
            if(!err){
                this.update_members(_obj);
                this.play_ind = Math.floor(Math.random()*1000) % this.name_arr.length;
                this.lbl_name.string = this.members[this.name_arr[this.play_ind]].name;
                this.img_head.spriteFrame = this.fr_heads.getSpriteFrame(this.name_arr[this.play_ind]);
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
        let show_name = this.members[this.name_arr[this.play_ind]].name
        this.lbl_name.string = show_name;
        this.img_head.spriteFrame = this.fr_heads.getSpriteFrame(this.name_arr[this.play_ind]);
        --this.play_times;
        if(this.play_times === 20){
            this.unschedule(this.schedule_cb);
            this.schedule(this.schedule_cb,this.duration*2.5);
        }
        else if(this.play_times === 10){
            this.unschedule(this.schedule_cb);
            this.schedule(this.schedule_cb,this.duration*3);
        }
        else if(this.play_times === 5){
            this.unschedule(this.schedule_cb);
            this.schedule(this.schedule_cb,this.duration*4);
        }
        else if(this.play_times === 3){
            this.unschedule(this.schedule_cb);
            this.schedule(this.schedule_cb,this.duration*5);
        }
        if(this.choose_user && this.play_times <= 0 && show_name === this.choose_user.name){
            this.unschedule(this.schedule_cb);
            this.members[this.choose_user.id] = null;
            this.update_members(this.members);
            this.lbl_btn.string = "START";
            this.btn.interactable = true;
            let item = cc.instantiate(this.node_item);
            item.x = 0;
            item.getChildByName("name").getComponent(cc.Label).string = this.choose_user.name;
            cc.find("node_icon/img_icon",item).getComponent(cc.Sprite).spriteFrame = this.fr_heads.getSpriteFrame(this.choose_user.id);
            item.parent = this.node_notice;
            this.choose_user = null;
        }
    },

    on_start:function () {
        cc.log("on_start");
        this.btn.interactable = false;
        this.btn.node.runAction(cc.sequence(cc.delayTime(5.0),cc.callFunc(
            ()=>{
                this.lbl_btn.string = "END";
                this.btn.interactable = true;
            }
        )))
        this.schedule(this.schedule_cb,this.duration);
    },

    on_end:function () {
        cc.log("on_end");
        this.btn.interactable = false;
        let rand_ind = Math.floor(Math.random()*this.total_weight);
        this.check_user(rand_ind);
        this.play_times = 30;
        this.unschedule(this.schedule_cb);
        this.schedule(this.schedule_cb,this.duration*2);
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

    check_user:function(_ind){
        for(let k in this.members){
            if(this.members[k] && _ind >= this.members[k].w_start && _ind <= this.members[k].w_end ){
                this.choose_user = this.members[k];
                return;
            }
        }
    },

    update_members:function (_obj) {
        this.members = _obj;
        this.name_arr = [];
        this.total_weight = 0;
        for(let _key in _obj){
            if(!_obj[_key]){
                continue;
            }
            _obj[_key].w_start = this.total_weight;
            this.total_weight += _obj[_key].weight + _obj[_key].ext_w;
            _obj[_key].w_end = this.total_weight - 1;
            this.name_arr.push(_obj[_key].id);
        }
    },

    // update (dt) {},
});
