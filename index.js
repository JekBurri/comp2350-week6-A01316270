//Define the include function for absolute file name
global.base_dir = __dirname;
global.abs_path = function (path) {
	return base_dir + path;
}
global.include = function (file) {
	return require(abs_path('/' + file));
}


const express = require('express');
const database = include('databaseConnection');
const router = include('routes/router');

const port = process.env.PORT || 3000;

// async function printMySQLVersion() {
// 	let sqlQuery = `
// 		SHOW VARIABLES LIKE 'version';
// 	`;

// 	try {
// 		const results = await database.query(sqlQuery);
// 		console.log("Successfully connected to MySQL");
// 		console.log(results[0]);
// 		return true;
// 	}
// 	catch(err) {
// 		console.log("Error getting version from MySQL");
// 		return false;
// 	}
// }

// const success = printMySQLVersion();

async function addUser(postData) {
	let sqlInsertSalt = `
   INSERT INTO web_user (first_name, last_name, email, password_salt) 
   VALUES (:first_name, :last_name, :email, sha2(UUID(),512));
   `;
	let params = {
		first_name: postData.first_name,
		last_name: postData.last_name,
		email: postData.email
	};
	console.log(sqlInsertSalt);
	try {
		const results = await database.query(sqlInsertSalt, params);
		let insertedID = results.insertId;
		let updatePasswordHash = `
   UPDATE web_user 
   SET password_hash = sha2(concat(:password,:pepper,password_salt),512) 
   WHERE web_user_id = :userId;
   `;
		let params2 = {
			password: postData.password,
			pepper: passwordPepper,
			userId: insertedID
		}
		console.log(updatePasswordHash);
		const results2 = await database.query(updatePasswordHash, params2);
		return true;
	}
	catch (err) {
		console.log(err);
		return false;
	}
}



const app = express();
app.set('view engine', 'ejs');

app.use('/', router);
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: false }));

app.listen(port, () => {
	console.log("Node application listening on port " + port);
});



