const mysql = require('mysql');
const inquirer = require('inquirer');
const consoleTable = require('console.table');
const crud = require('./src/crud.js')

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'lincoln1',
  database: 'employee_tracker_db',
});

async function main(){
  // Ask user what they Would like to do
  let choice = "";
  await inquirer
  .prompt([
    {
      type: 'list',
      message: 'What would you like to do?',
      name: 'choice',
      choices: ["View Departments", "Add Department", "Remove Department",
                "View Roles", "Add Role", "Remove Role",
                "View Employees", "Add Employee", "Update Employee Role", "Remove Employee",
                "Finished"],
    },
  ])
  .then((responses) => {
    choice = responses.choice;
  });

  // Will return to the main function and prompt after every specific prompt is run.
  switch (choice) {
    case "View Departments":
      crud.read(connection, "department", (data) => {
        console.table(data);
        main();
      });
      break;
    case "Add Department":
      await inquirer
      .prompt([
        {
          type: 'input',
          message: 'What is the name of the Department you are adding?',
          name: 'name',
        },
      ])
      .then((responses) => {
          crud.create(connection, "department", {department_name: responses.name});
          main();
      });
      break;
    case "Remove Department":
      crud.read(connection, "department", (data) => {
        let department_list = [];
        for(let i = 0; i < data.length; i++){
          department_list.push(data[i].department_name);
        }
        inquirer
        .prompt([
          {
            type: 'list',
            message: 'What department should be removed?',
            name: 'department',
            choices: department_list,
          },
        ])
        .then((responses) => {
          crud.delete(connection, "department", {department_name: responses.department});
          main();
        });
      });
      break;
    case "View Roles":
      let request = [
        "employee_role.id",
        "title",
        "salary",
        "department_name"
      ];
      crud.join(connection, ["employee_role","department"], request, "employee_role.department_id = department.id", (data) => {
        console.table(data);
        main();
      });
      break;
    case "Add Role":
      crud.read(connection, "department", (data) => {
        let department_list = [];
        for(let i = 0; i < data.length; i++){
          department_list.push(data[i].department_name);
        }
        inquirer
        .prompt([
          {
            type: 'input',
            message: 'What is the title of the role you are adding?',
            name: 'title',
          },
          {
            type: 'input',
            message: 'What is the salary of the role you are adding?',
            name: 'salary',
          },
          {
            type: 'list',
            message: 'What department is this role a part of?',
            name: 'department',
            choices: department_list,
          },
        ])
        .then((responses) => {
          // Search for the department ID
          crud.search(connection, "department", {department_name: responses.department}, (res) => {
            crud.create(connection, "employee_role", {title: responses.title, salary: parseFloat(responses.salary), department_id: res[0].id});
            main();
          });
        });
      });
      break;
    case "Remove Role":
      crud.read(connection, "employee_role", (data) => {
        let role_list = [];
        for(let i = 0; i < data.length; i++){
          role_list.push(data[i].title);
        }
        inquirer
        .prompt([
          {
            type: 'list',
            message: 'What role should be removed?',
            name: 'role',
            choices: role_list,
          },
        ])
        .then((responses) => {
          crud.delete(connection, "employee_role", {title: responses.role});
          main();
        });
      });
      break;
    case "View Employees":
      // Setting up the join
      let emp_request = [
        "employee.id",
        "first_name",
        "last_name",
        "title",
        "salary",
        "manager_id",
        "department_name"
      ];
      crud.join(connection, ["employee","employee_role","department"], emp_request, "employee.role_id = employee_role.id AND employee_role.department_id = department.id", (data) => {
        console.table(data);
        main();
      });
      break;
    case "Add Employee":
      crud.read(connection, "employee_role", (data) => {
        let role_list = [];
        for(let i = 0; i < data.length; i++){
          role_list.push(data[i].title);
        }
        crud.read(connection, "employee", (data) => {
          let employee_list = ["None"];
          for(let i = 0; i < data.length; i++){
            employee_list.push(data[i].first_name + " " + data[i].last_name);
          }
          inquirer
          .prompt([
            {
              type: 'input',
              message: 'What is the first name of the employee you wish to add?',
              name: 'firstName',
            },
            {
              type: 'input',
              message: 'What is the last name of the employee you wish to add?',
              name: 'lastName',
            },
            {
              type: 'list',
              message: 'What is the employee\'s role?',
              name: 'title',
              choices: role_list,
            },
            {
              type: 'list',
              message: 'Who is their manager?',
              name: 'manager',
              choices: employee_list,
            },
          ])
          .then((responses) => {
            crud.search(connection, "employee_role", {title: responses.title}, (res) => {
              let role_id = res[0].id;
              if(responses.manager != "None"){
                first_name = responses.manager.split(" ")[0];
                last_name = responses.manager.split(" ")[1];
                crud.search(connection, "employee", {first_name: first_name, last_name: last_name}, (res) => {
                  let manager_id = res[0].id;
                  crud.create(connection, "employee", {first_name: responses.firstName, last_name: responses.lastName, role_id: role_id, manager_id: manager_id});
                  main();
                });
              }else{
                crud.create(connection, "employee", {first_name: responses.firstName, last_name: responses.lastName, role_id: role_id, manager_id: null});
                main();
              }
            });
          });
        });
      });    
      break;
    case "Update Employee Role":
      crud.read(connection, "employee", (data) => {
        let employee_list = [];
        for(let i = 0; i < data.length; i++){
          employee_list.push(data[i].first_name + " " + data[i].last_name);
        }
        crud.read(connection, "employee_role", (data) => {
          let role_list = [];
          for(let i = 0; i < data.length; i++){
            role_list.push(data[i].title);
          }
          inquirer
          .prompt([
            {
              type: 'list',
              message: 'Who\'s role do you want to update?',
              name: 'name',
              choices: employee_list,
            },
            {
              type: 'list',
              message: 'What role do you want the employee to have?',
              name: 'role',
              choices: role_list,
            },
          ])
          .then((res) => {
            first_name = res.name.split(" ")[0];
            last_name = res.name.split(" ")[1];
            crud.search(connection, "employee_role", {title: res.role}, (res) => {
              let role_id = res[0].id;
              crud.update(connection, "employee", [{role_id: role_id},{first_name: first_name, last_name: last_name}]);
              main();
            });
          });
        });
      });
      break;
    case "Remove Employee":
      crud.read(connection, "employee", (data) => {
        let employee_list = [];
        for(let i = 0; i < data.length; i++){
          employee_list.push(data[i].first_name + " " + data[i].last_name);
        }
        inquirer
        .prompt([
          {
            type: 'list',
            message: 'Whic employee do you wish to remove?',
            name: 'name',
            choices: employee_list,
          },
        ])
        .then((res) => {
          let first_name = res.name.split(" ")[0];
          let last_name = res.name.split(" ")[1];
          crud.delete(connection, "employee", {first_name: first_name, last_name: last_name});
          main();
        });
      });
      break;
    default:
      connection.end();
      break;
  }
}

connection.connect((err) => {
  if (err) throw err;
  console.log("up and running");
  main();
});