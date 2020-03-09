var mysql = require("mysql");
var inquirer = require("inquirer");
require('console.table')
var util = require('util')

var connection = mysql.createConnection({
    host: "localhost",
    
    port: 3306,
    
    user: "root",
  
    password: "12345678",
    database: "employee_trackerDB"
});

connection.connect(function(err) {
  if (err) throw err;
  start();
});
connection.query = util.promisify(connection.query)

function start() {
  inquirer
    .prompt({
      name: "action",
      type: "rawlist",
      message: "What would you like to do?",
      choices: [
        "Add employee",
        "Add role",
        "Add department",
        "View all employee",
        "View role",
        "View department",
        "Update employee role",
        "Exit",
      ]
    })
    .then(function(answer) {
      switch (answer.action) {
      case "Add employee":
        addEmployee();
        break;
      case "Add role":
          addRole();
        break;
      case "Add department":
          addDepartment();
        break;
  
      case "View all employee":
        viewEmployee();
        break;
      case "View role":
        viewRole();
        break;
      case "View department":
        viewDepartment();
        break;

      case "Update employee role":
        updateEmployeeRole();
        break;

      case "Exit":
        connection.end();
        break;
      }
  });
}
function addEmployee() {
  inquirer
    .prompt([
      {
        name: "first_name",
        type: "input",
        message: "What is the employee's first name"
      },
      {
        name: "last_name",
        type: "input",
        message: "What is the employee's last name"
      },
      {
        name: "role_id",
        type: "input",
        message: "What is the employee's role ID",
        default: 1
      },
      {
        name: "manager_id",
        type: "input",
        message: "What is the employee's manager ID",
        default: null
      }
    ])
    .then(function(answer) {
      answer.manager_id = answer.manager_id ? answer.manager_id : null
      connection.query(
        "INSERT INTO employee SET ?",
        answer,
        function(err) {
          if (err) throw err;
          viewEmployee()
        }
      );
    });
};
//question here
function addRole() {
  inquirer
    .prompt([
      {
        name: "title",
        type: "input",
        message: "What is the title of the role"
      },
      {
        name: "salary",
        type: "input",
        message: "What is the salary of the role"
      },
    ])
    .then(function(answer) {
      connection.query(
        "INSERT INTO role SET ?",
        {
          title: answer.title,
          salary: answer.salary,
  
        },
        function(err) {
          if (err) throw err;
          start()
        }
      );
    });
};
function addDepartment() {
  inquirer
    .prompt([
      {
        name: "department_name",
        type: "input",
        message: "What is the department name"
      },
    ])
    .then(function(answer) {
      connection.query(
        "INSERT INTO department SET ?",
        {
          department_name: answer.department_name
        },
        function(err) {
          if (err) throw err;
          start()
        }
      );
    });
};
function viewEmployee(){
  //believe something for the console-table
  connection.query(
    'SELECT*From employee',
    
    function(err, results){
      console.table(results)
      start()
    }
  )

};
function viewRole(){
  //believe something for the console-table
  connection.query(
    'SELECT*From role',
    
    function(err, results){
      console.table(results)
      start()
    }
  )

};
function viewDepartment(){
  //believe something for the console-table
  connection.query(
    'SELECT*From department',
    
    function(err, results){
      console.table(results)
      start()
    }
  )

};

function viewRoles(){
  return connection.query("SELECT * FROM role")
}

async function updateEmployeeRole() {
  const roleChoices = await connection.query("SELECT role.title, role.id FROM role")
  const roleChoiceArr =[]
  roleChoices.map(choice=>roleChoiceArr.push({name: choice.title, value: choice.id}))
  console.log(roleChoices)
  connection.query("SELECT * FROM employee", function(err, results) {
    if (err) throw err;
    inquirer
      .prompt([
        {
          name: "choice",
          type: "rawlist",
          choices: function() {
            var choiceArray = [];
            for (var i = 0; i < results.length; i++) {
              choiceArray.push({name:`${results[i].first_name} ${results[i].last_name}`, value: results[i].id});
            }
            return choiceArray;
          },
          message: "Please select which employee to update"
        }, {
          name: 'role_id',
          type: 'list',
          choices: roleChoiceArr,
          message: "What is the employee's new role?"
        }
      ])
      .then(function(answer) {
      
        connection.query(
          "UPDATE employee SET ? WHERE ?",
          [
            {
              role_id: answer.role_id
            },
            {
              id: answer.choice
            }],
          function(error) {
            if (error){
              console.log(error)
            }else{
                      start();
            }
    
          }
        )

      });
  });
}



