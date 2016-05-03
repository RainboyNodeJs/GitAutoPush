'use strict';

var pathFn = require('path');
var fs = require('hexo-fs');
var spawn = require('hexo-util/lib/spawn');


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
    
    url:'git@git.coding.net:Rainboy/NOIP_Rainboy.git',
    branch:'pages',
    message: function(){ //返回当前时间
        var date = new Date();
        return 'update:'+date.pattern("yyyy-MM-dd hh:mm:ss");
    }
}


//module.exports=
var test =function(args){
    var base = process.cwd();
    var deployDir = base +pathFn.sep+'.deploy_git';
    var publicDir = base +pathFn.sep+'_book';
    var verbose = true;

  function git() {
    var len = arguments.length;
    var args = new Array(len);

    for (var i = 0; i < len; i++) {
      args[i] = arguments[i];
    }

    return spawn('git', args, {
      cwd: deployDir,
      verbose: verbose
    });
  }

    function push(repo) {
        return git('add', '-A').then(function() {
            return git('commit', '-m', repo.message()).catch(function(){
                //do noting
            });
        }).then(function() {
            return git('push', '-u', repo.url, 'HEAD:' + repo.branch, '--force');
        });
    }


    var setup = function(){
        return fs.writeFile(pathFn.join(deployDir,'placeholder'),'').then(function(){
            return git('init');
        }).then(function(){
            return git('add','-A');
        }).then(function(){
            return git('commit','-m','First commit');
        });
    }

    /* 开始返回处理 */
    return fs.exists(deployDir).then( function(exist){
        if(exist) return;
        else {
            console.log('建立 .deploy git 目录');
            return setup();
        }
    }).then(function(){
            console.log('清空 .deploy_git 目录');
            return fs.emptyDir(deployDir);
    }).then(function(){
            console.log('从 _book 目录复制文件到 .deploy_git 目录');
            return fs.copyDir(publicDir,deployDir);
    }).then(function(){
            console.log('开始 git push ');
          return push(config);
    });
};

test();

