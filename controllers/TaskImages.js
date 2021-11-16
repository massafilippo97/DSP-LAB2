'use strict';

//var utils = require('../utils/writer.js');
var Tasks = require('../service/TasksService');
var TaskImages = require('../service/TaskImagesService');
var converterService = require('../gRPC_converter.js');  
var fs = require('fs');
const path = require('path');

module.exports.tasksTaskIdImagesPOST = function tasksTaskIdImagesPOST (req, res, next) { //testata
    TaskImages.searchMaxID()
      .then(function (max_id) {
        TaskImages.tasksTaskIdImagesPOST(max_id+1, req.params.taskId, req.file.path.substring(12).split(".")[0], req.file.path.substring(12).split(".")[1]) //req.user.id, 1
      })
      .then(function (response) {
        res.status(201).json(response).end(); //response == oggetto appena creato
      })
      .catch(function (response) {
        res.status(503).json({ error: response.message});
      });
  };
  
module.exports.tasksTaskIdImagesImageIdDELETE = async function tasksTaskIdImagesImageIdDELETE (req, res, next) { //post
    try {
      const checkOwner = await Tasks.checkTaskOwner(req.params.taskId, req.user.id); //req.user.id, 1
      if(checkOwner) { 
        const response = await TaskImages.tasksTaskIdImagesImageIdGET(req.params.imageId, req.params.taskId);
        await TaskImages.tasksTaskIdImagesImageIdDELETE(req.params.imageId);
        
        let imagePath = path.join(__dirname, '../task_images/'+response[0].file_name+"."+response[0].format);
        fs.unlinkSync(imagePath);
 
        res.status(200).end();
      }
      else { 
        throw new Error('403'); //Forbidden
      }
    } catch(err) {
      if(err.message === '403')
        res.status(403).json({ error: "Forbidden: can't fetch because you are not the task's owner"});
      else if(err === "taskId not found")
        res.status(404).json({ error: "Task Not found: can't fetch because the inserted task id does not exists"}); 
      else
        res.status(503).json({ error: response.message});
    }
  };




  
  module.exports.tasksTaskIdImagesImageIdGET = async function tasksTaskIdImagesImageIdGET (req, res, next) { //testato
    try {
      const checkOwner = await Tasks.checkTaskOwner(req.params.taskId, req.user.id); //req.user.id, 1
      if(checkOwner) { 
        const response = await TaskImages.tasksTaskIdImagesImageIdGET(req.params.imageId, req.params.taskId);
        
        let imagePath = path.join(__dirname, '../task_images/'+response[0].file_name+"."+response[0].format);
        res.sendFile(imagePath);
      }
      else { 
        throw new Error('403'); //Forbidden
      }
    } catch(err) {
      if(err.message === '403')
        res.status(403).json({ error: "Forbidden: can't fetch because you are not the task's owner"});
      else if(err === "taskId not found")
        res.status(404).json({ error: "Task Not found: can't fetch because the inserted task id does not exists"}); 
      else
        res.status(503).json({ error: response.message});
    }
  };
  