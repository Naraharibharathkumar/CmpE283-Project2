/**
 * Created by BharathKumar on 11/28/2016.
 */
var express = require('express');
var router = express.Router();
var exec = require('ssh-exec');

//API for Getting Container List
router.post('/getContainer', function(req, res, next) {
    var containerName = req.body.ContainerName;
    if(typeof(containerName) != 'undefined'  && containerName.length > 0) {
        try{
            var url = 'curl -XGET http://127.0.0.1:2375/images/search?term='+containerName;
            exec( url , {
                user: 'project',
                host: '192.168.86.129',
                password: '1234'
            }, function (err, stdout, stderr) {
                if(err==null){
                    res.setHeader('Content-Type', 'application/json');
                    res.send(stdout);
                }
                else{
                    throw err;
                }
            });
        }
        catch(ex){
            res.write(ex.toString());
            res.end();
        }
    }
    else{
        console.log("Hello");
        res.setHeader('Content-Type', 'application/json');
        res.send({"status" : "Failure", "message" : "Incorrect String"});
    }
});

//API For getting image list from Host
router.post('/listImages', function(req, res, next){
    try{
        var imageUrl = 'curl http://localhost:2375/images/json';
        exec( imageUrl, {user: 'project',
            host: '192.168.86.129',
            password: '1234'},function (err1, result1, temp) {
            if(err1==null){
                result1 = JSON.parse(result1);
                var resultJSON = [];
                var tempArr = [];
                var tempName = "";
                result1.forEach(function (result) {
                    tempName = result.RepoTags[0];
                    tempArr = tempName.split(":");
                    resultJSON.push({"ImageName" : tempArr[0],"ImageTag" : tempArr[1]});
                });
                res.setHeader('Content-Type', 'application/json');
                res.send({"Status" : "Ok", "ImageList" : resultJSON});
            }
            else{
                throw err1;
            }
        });
    }
    catch(ex){
        res.write(ex.toString());
        res.end();
    }
});

//API For Creating a New Image
router.post('/createImage', function (req, res, next) {
    var containerName = req.body.ContainerName;
    var containerTag = req.body.ContainerTag;
    if(typeof(containerName)!='undefined' && containerName.length > 0){
        try{
            var getUrl = 'curl http://localhost:2375/images/json';
            exec( getUrl , {
                user: 'project',
                host: '192.168.86.129',
                password: '1234'
            }, function (err1, result1, temp) {
                if(err1==null){
                    if(result1=='[]\n'){
                        var getImageUrl = 'curl -XPOST http://localhost:2375/images/create?fromImage='+containerName+':'+containerTag;
                        exec( getImageUrl , {
                            user: 'project',
                            host: '192.168.86.129',
                            password: '1234'
                        }, function (cmdErr, cmdout, remoteErr) {
                        });
                        res.setHeader('Content-Type', 'application/json');
                        res.send({"Status" : "Ok", "Message" : "Wait for a while when the container is created"});
                    }
                    else{
                        result1 = JSON.parse(result1);
                        result1.forEach(function(result){
                            var repoTag = result.RepoTags;
                            if(repoTag[0]==containerName+':'+containerTag){
                                res.write('Image already Present');
                                res.end();
                            }
                        });
                    }
                }
                else{
                    if(err1!=null){
                        throw err1;
                    }
                }
            });
        }
        catch(ex){
            res.write(ex.toString());
            res.end();
        }
    }
    else{
        res.setHeader('Content-Type', 'application/json');
        res.send({"status" : "Failure", "message" : "Incorrect String"});
    }
});

//API For Creating a New Container
router.post('/createContainer', function(req, res, next) {
    var containerName = req.body.ContainerName;
    var containerTag = req.body.ContainerTag;
    if(typeof(containerName) != 'undefined'  && containerName.length > 0) {
        try{
            var url = 'curl -X POST -H "Content-Type: application/json" -d \'{"Hostname":"","User":"","Memory":0,"MemorySwap":0,"AttachStdin":false,"AttachStdout":true,"AttachStderr":true,"PortSpecs":null,"Privileged":false,"Tty":false,"OpenStdin":false,"StdinOnce":false,"Env":null,"Dns":null,"Image":"'+containerName+'","tag":"'+containerTag+'","Volumes":{},"WorkingDir":""}\' http://127.0.0.1:2375/containers/create';
            exec( url , {
                user: 'project',
                host: '192.168.86.129',
                password: '1234'
            }, function (error, stdout, stderr) {
                res.setHeader('Content-Type', 'application/json');
                res.send(stdout);
            });
        }
        catch(ex) {
            res.write(ex.toString());
            res.end();
        }
    }
    else{
        res.setHeader('Content-Type', 'application/json');
        res.send({"status" : "Failure", "message" : "Incorrect String"});
    }
});

//Start the Container
router.post('/startContainer', function(req, res, next){
    var containerId = req.body.ContainerId;
    if(typeof(containerId) != 'undefined'  && containerId.length > 0) {
        var url = 'curl -XPOST http://127.0.0.1:2375/containers/'+containerId+'/start';
        exec( url , {
            user: 'project',
            host: '192.168.86.129',
            password: '1234'
        }, function (err, stdout, stderr) {
            res.setHeader('Content-Type', 'application/json');
            res.send(stdout);
        });
    }
    else{
        res.setHeader('Content-Type', 'application/json');
        res.send({"status" : "Failure", "message" : "Incorrect String"});
    }
});

//Stop the Container
router.post('/stopContainer', function(req, res, next){
    var containerId = req.body.ContainerId;
    if(typeof(containerId) != 'undefined'  && containerId.length > 0) {
        var url = 'curl -XPOST http://127.0.0.1:2375/containers/'+containerId+'/stop';
        exec( url , {
            user: 'project',
            host: '192.168.86.129',
            password: '1234'
        }, function (err, stdout, stderr) {
            res.setHeader('Content-Type', 'application/json');
            res.send(stdout.substring(0,stdout.length-1));
        });
    }
    else{
        res.setHeader('Content-Type', 'application/json');
        res.send({"status" : "Failure", "message" : "Incorrect String"});
    }
});

//Delete the Container
router.post('/removeContainer', function(req, res, next){
    var containerId = req.body.ContainerId;
    if(typeof(containerId) != 'undefined'  && containerId.length > 0) {
        var url = 'curl -X DELETE http://127.0.0.1:2375/containers/'+containerId;
        exec( url , {
            user: 'project',
            host: '192.168.86.129',
            password: '1234'
        }, function (err, stdout, stderr) {
            res.setHeader('Content-Type', 'application/json');
            res.send(stdout);
        });
    }
    else{
        console.log("Hello");
        res.setHeader('Content-Type', 'application/json');
        res.send({"Status" : "Failure", "Message" : "Incorrect String"});
    }
});

//API For getting CPU Stats
router.post('/getCpuStats', function(req,res,next){
    var containerId = req.body.ContainerId;
    if(typeof(containerId) != 'undefined'  && containerId.length > 0) {
        try{
            var url = 'docker ps -q --no-trunc | grep '+containerId;
            exec( url , {
                user: 'project',
                host: '192.168.86.129',
                password: '1234'
            }, function (err, stdout, stderr) {
                if(err==null){
                    if(stdout==null) stdout = containerId;
                    console.log(stdout);
                    stdout = stdout.substring(0,stdout.length-1);
                    var statUrl = 'cat /sys/fs/cgroup/cpu/docker/'+stdout+'/cpuacct.usage';
                    exec( statUrl , {
                        user: 'project',
                        host: '192.168.86.129',
                        password: '1234'
                    }, function (err2, stdout2, stderr2) {
                        if(err2==null){
                            stdout2 = stdout2.substring(0,stdout2.length-1);
                            res.setHeader('Content-Type', 'application/json');
                            var date = new Date();
                            var time = date.getTime();
                            res.send({"Time" : time, "CpuUsage" : stdout2});
                        }
                        else{
                            throw err2;
                        }
                    });
                }
                else{
                    console.log(err);
                    throw err;
                }
            });
        }
        catch(ex){
            res.write(ex.toString());
            res.end();
        }
    }
    else{
        res.setHeader('Content-Type', 'application/json');
        res.send({"Status" : "Failure", "Message" : "Incorrect String"});
    }
});

module.exports = router;
