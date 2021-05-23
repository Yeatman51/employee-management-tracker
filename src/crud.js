class CRUD {
    static async create(connection, table, data) {
        await connection.query("INSERT INTO " + table + " SET ?", data, (err, res) => {
            if (err) throw err;
            //console.log(`${res.affectedRows} ${table} inserted!\n`);
        });
    }

    static async read(connection, table, callback) {
        const query = await connection.query("SELECT * FROM " + table, (err, res) => {
            if (err) throw err;
            //console.log(res);
            callback(res);
        });
    }

    static async join(connection, table, data, condition, callback) {
        let columns = "";
        for(let i = 0; i < data.length; i++){
            columns += data[i] + ", ";
        }
        columns = columns.slice(0,-2);
        console.log(columns);
        const query = await connection.query("SELECT " + columns + " FROM " + table + " WHERE " + condition, (err, res) => {
            if (err) throw err;
            //console.log(res);
            callback(res);
        });
    }

    static async search(connection, table, data, callback) {
        let conditions = "";
        for (const [key, value] of Object.entries(data)) {
            conditions += `${key} = '${value}' AND `;
        }
        conditions = conditions.slice(0,-5);

        await connection.query("SELECT * FROM " + table + " WHERE " + conditions, (err, res) => {
            if (err) throw err;
            //console.log(res);
            callback(res);
        });
    }

    static async update(connection, table, data) {
        let conditions = "";
        for (const [key, value] of Object.entries(data[1])) {
            conditions += `${key} = '${value}' AND `;
        }
        conditions = conditions.slice(0,-5);

        await connection.query("UPDATE " + table + " SET ? WHERE " + conditions, data[0], (err, res) => {
            if (err) throw err;
            //console.log(`${res.affectedRows} ${table} updated!\n`);
        });
    }

    static async delete(connection, table, data) {
        let conditions = "";
        for (const [key, value] of Object.entries(data)) {
            conditions += `${key} = '${value}' AND `;
        }
        conditions = conditions.slice(0,-5);

        const query = await connection.query("DELETE FROM " + table + " WHERE " + conditions, (err, res) => {
            if (err) throw err;
            //console.log(`${res.affectedRows} ${table} deleted!\n`);
        });
    }
};

module.exports = CRUD;