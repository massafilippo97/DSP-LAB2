'use strict';

const db = require('../db.js');

/**
 * Retrieve the list of all the assignes of that task
 *
 * taskId Long Task id to delete
 * returns List
 *
exports.tasksTaskIdImagesGET = function(taskId) {
  return new Promise(function(resolve, reject) {
    var sql_query = "select u.id, u.email, u.name from users u, assignments a where a.user = u.id AND a.task = ?;";

    db.all(sql_query, [taskId], (err, rows) =>{ 
      if(err) {
        reject(err);
        return;
      }
      if(rows.length === 0) {
        reject("taskId not found");
        return;
      }
      resolve(rows.map((row) => ({ 
        id: row.id, 
        email: row.email, 
        name: row.name, //dovrei rendere accessibili le risorse utente globali?
        _links: {
          self: {href: "http://localhost:8080/users/"+row.id},
          tasks: {href: "http://localhost:8080/tasks"},
          task: {href: "http://localhost:8080/tasks/{taskId}"},
          assignedTo: {href: "http://localhost:8080/tasks/{taskId}/assignedTo"},
          markTask: {href: "http://localhost:8080/tasks/{taskId}/markTask"},
          login: {href: "http://localhost:8080/login"}
        }
      })));
    });
  }); 
}*/


//search the max possible id from all registered tasks (useful when automatically assigning a new taskID)
exports.searchMaxID = () => {
  return new Promise((resolve, reject) => {
    const sql_query = "SELECT max(id) AS max_id FROM task_images;";
    db.all(sql_query, [], (err, rows)=>{
      if(err) {
        reject(err);
        return;
      }
      resolve(rows[0].max_id);
    });
  });
}


/**
 * Retrieve the specific tasks by its ID
 *
 * taskId Long Task id to delete
 * returns List
 * 
 * The user can retrieve a single existing image associated to a speficic task
 **/
 exports.tasksTaskIdImagesImageIdGET = function(imageId, taskId) {
    return new Promise(function(resolve, reject) {
   
        //var sql_query = "SELECT t.id, t.description, t.important, t.private, t.project, t.deadline, t.completed, t.owner FROM assignments a, tasks t WHERE t.id = a.task and t.id = ? AND a.user = ? UNION SELECT * FROM tasks WHERE id = ? and owner = ? UNION SELECT * FROM tasks WHERE id = ? and owner = ?;" //union delle assignedToMe e createdByMe queries+ restanti tasks public
        var sql_query = "select file_name, format from task_images where id = ? and task_id = ?"
      
      db.all(sql_query, [imageId, taskId], (err, rows) =>{
        if(err){
          reject(err);
          return;
        }
        if(rows.length === 0) {
          reject("taskId not found");
          return;
        } 
        resolve(rows.map((row) => ({ 
          id: rows[0].id,
          task_id: rows[0].task_id,
          file_name: rows[0].file_name, 
          format: rows[0].format,
          _links: {
            self: {href: "http://localhost:8080/tasks/"+row.id},
            tasks: {href: "http://localhost:8080/tasks"},
            user: {href: "http://localhost:8080/users/{userId}"},
            assignedTo: {href: "http://localhost:8080/tasks/{taskId}/assignedTo"},
            markTask: {href: "http://localhost:8080/tasks/{taskId}/markTask"},
            login: {href: "http://localhost:8080/login"}
          }
        })));
      });
    });
  };



/**
 * Add a new image to the db (ID is automatically generated by the server)
 *
 * body List It is required a single Task object (optional)
 * no response value expected for this operation
 **/
 exports.tasksTaskIdImagesPOST = function(max_id ,task_id, file_name, format) { //body == new task
    return new Promise(function(resolve, reject) {
      const sql_query = "INSERT INTO task_images(id,task_id,file_name,format) VALUES (?,?,?,?)";
      db.run(sql_query, [max_id, task_id, file_name, format], (err, rows)=>{
        if(err) {
          reject(err);
          return;
        }
        resolve({ 
          id: max_id,  
          task_id: task_id,
          file_name: file_name, 
          format: format,
          _links: {
            self: {href: "http://localhost:8080/tasks/"+task_id+"/images/"+max_id},
            tasks: {href: "http://localhost:8080/tasks"},
            user: {href: "http://localhost:8080/users/{userId}"},
            assignedTo: {href: "http://localhost:8080/tasks/{taskId}/assignedTo"},
            markTask: {href: "http://localhost:8080/tasks/{taskId}/markTask"},
            login: {href: "http://localhost:8080/login"}
          }
        });
      });
    });
  };
  

/**
 * Delete an existing image by ID (if the requester is the owner)
 *
 * taskId Long Task id to delete
 * no response value expected for this operation
 **/
 exports.tasksTaskIdImagesImageIdDELETE = function(imageId) {
    return new Promise((resolve, reject)=> {
      const sql_query = 'DELETE FROM task_images WHERE id=?';
      db.run(sql_query, [imageId], (err, rows)=>{
        if(err) {
          reject(err);
          return;
        }
        resolve(null);
      });
    });
  };