<?php
class Websocket {
    public $server;
    private $fid_arr;
    public function __construct() {
        $this->server = new swoole_websocket_server("0.0.0.0", 9501);
        $this->fid_arr=new swoole_table(1024);
        $this->fid_arr->column('id', swoole_table::TYPE_INT, 4);       //1,2,4,8
        $this->fid_arr->column('name', swoole_table::TYPE_STRING, 64);
        $this->fid_arr->create();
        //监听WebSocket连接打开事件
        $this->server->on('open', function (swoole_websocket_server $server, $request){
        });



        //监听WebSocket消息事件
        $this->server->on('message', function ($server, $frame) {
           // $str= "来自{$frame->fd}的消息: {$frame->data}\n";
            $content=json_decode($frame->data);
           // var_dump($content);
            switch ($content->type){
                case 'usersaid'://用户发言
                    $arr=$this->fid_arr->get($frame->fd);
                    $data=array(
                        'type'=>2,//消息类型 1系统 2用户消息
                        'content'=>htmlspecialchars($content->message),
                        'user'=>$arr['name'],
                    );
                    foreach ($this->fid_arr as $k=>$v){
                        $server->push($k, json_encode($data));
                    }
                break;
                case 'usertouser':
                    $data=array(
                        'type'=>5,//私聊
                        'from_user'=>$content->from_user,
                        'from_fd'=>$content->from_fd,
                        'content'=>htmlspecialchars($content->message),
                        'userid'=>$content->userid
                    );
                    //var_dump($content);
                    $arrs=[$content->from_fd,$content->userid];
                    foreach ($arrs as $v){
                        $server->push($v, json_encode($data));
                    }
                    break;
                case 'setname'://用户设置名字
                    if (!$this->fid_arr->exist($frame->fd)) {
                        $this->fid_arr->set($frame->fd, ['id' => $frame->fd, 'name' => $content->message]);

                    }

                    $usermsg=array(
                        'type'=>4, //返回当前用户信息
                        'userid'=>$frame->fd,
                        'username'=>$content->message
                    );
                    $server->push($frame->fd, json_encode($usermsg));
                    $alluser = [];
                    foreach ($this->fid_arr as $k=>$v) {
                        $alluser+=[$v['id']=>$v['name']];
                    }
                    $alluser = json_encode($alluser);
                    $data = array(
                        'type' => 1,//消息类型 1系统
                        'content' => '【' . $content->message . '】进入聊天室',
                        'user' => $content->message,
                        'fd'  =>$frame->fd,
                        'alluser' => $alluser
                    );
                    foreach ($this->fid_arr as $k => $v) {
                        $server->push($k, json_encode($data));
                    }
                    break;
            }

        });

        //监听WebSocket连接关闭事件
        $this->server->on('close', function (swoole_websocket_server $server, $fd) {

            echo "client-{$fd} is closed\n";
            $this->fid_arr->del($fd);

            $data=array(
                'type'=>3,//消息类型 1系统 2用户消息 3用户断开连接
                'user'=>$fd,
            );

            foreach ($this->fid_arr as $k=>$v){
                $server->push($k, json_encode($data));
            }

        });
        $this->server->on('request', function ($request, $response) {
            // 接收http请求从get获取message参数的值，给用户推送
            // $this->server->connections 遍历所有websocket连接用户的fd，给所有用户推送
//            var_dump($request->get['message']);
//            foreach ($this->server->connections as $fd) {
//                $this->server->push($fd, $request->get['message']);
//            }
        });

        $this->server->start();
    }
}
new Websocket();
