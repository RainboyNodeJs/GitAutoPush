var spawn = require('cross-spawn');
var Promise = require('bluebird');
var fs = require('fs');
var path = require('path');
var hfs = require('hexo-fs');



//日期
Date.prototype.pattern=function(fmt) {         
    var o = {         
    "M+" : this.getMonth()+1, //月份         
    "d+" : this.getDate(), //日         
    "h+" : this.getHours()%12 == 0 ? 12 : this.getHours()%12, //小时         
    "H+" : this.getHours(), //小时         
    "m+" : this.getMinutes(), //分         
    "s+" : this.getSeconds(), //秒         
    "q+" : Math.floor((this.getMonth()+3)/3), //季度         
    "S" : this.getMilliseconds() //毫秒         
    };         
    var week = {         
    "0" : "/u65e5",         
    "1" : "/u4e00",         
    "2" : "/u4e8c",         
    "3" : "/u4e09",         
    "4" : "/u56db",         
    "5" : "/u4e94",         
    "6" : "/u516d"        
    };         
    if(/(y+)/.test(fmt)){         
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));         
    }         
    if(/(E+)/.test(fmt)){         
        fmt=fmt.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "/u661f/u671f" : "/u5468") : "")+week[this.getDay()+""]);         
    }         
    for(var k in o){         
        if(new RegExp("("+ k +")").test(fmt)){         
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));         
        }         
    }         
    return fmt;         
}   

var config = {
    
    url:'git@git.coding.net:Rainboy/test.git',
    branch:'master',
    message: function(){ //返回当前时间
        var date = new Date();
        return 'update:'+date.pattern("yyyy-MM-dd hh:mm:ss");
    }
}


//module.exports=
var test =function(args){
    debugger;
    var base = process.cwd();
    var deployDir = base +path.sep+'.deploy_git';
    var publicDir = base +path.sep+'_book';

    function git(){
        var len = arguments.length;
        var args = new Array(len);

        for (var i = 0; i < len; i++) {
            args[i] = arguments[i];
        }


            return  spawn('git', args, {
                cwd: deployDir,
                stdio: 'inherit'
            });
    }

    function push(repo) {
        /*
        return git('add', '-A').then(function() {
            return git('commit', '-m', repo.message());
        }).then(function() {
            return git('push', '-u', repo.url, 'HEAD:' + repo.branch, '--force');
        });
        */
        return Promise.all([1]).then(function(){
                return git('add','-A');
        }).then(function() {
            return git('commit', '-m', repo.message());
        }).then(function() {
            return git('push', '-u', repo.url, 'HEAD:' + repo.branch, '--force');
        });
  
    }


    var fsMkdir = function(dir){
        
        return new Promise(function(resolve,reject){
            fs.mkdirSync(dir);
            resolve(true);
        });

    }
    var fsExit = function(flodername){

        return new Promise(function(resolve,reject){
            fs.stat(flodername,function(err,stat){
                if(err == null){
                    if(stat.isDirectory()){
                        resolve(true);
                    } 
                    else if(stat.isFile()){
                        resolve(false);
                    }
                    else {

                        resolve(false);
                    }

                }
                else if(err.code == 'ENOENT'){
                    resolve(false);
                }
                else {
                    resolve(false);
                }
            });

        });


    }

    var setup = function(){
        
        return fsMkdir(deployDir).then(function(){
            git('init');
        });
    
    }
    /* 开始返回处理 */
    return fsExit(deployDir).then( function(exits){
        if(exits) return;
        else {
            console.log('建立 .deploy git 目录');
            setup();
            return ;
        }
    }).then(function(){
            console.log('清空 .deploy_git 目录');
            return hfs.emptyDir(deployDir);
    }).then(function(){
            console.log('从 _book 目录复制文件到 .deploy_git 目录');
            return hfs.copyDir(publicDir,deployDir);
    }).then(function(){
            console.log('开始 git push ');
          return push(config);
    });
};

test();

