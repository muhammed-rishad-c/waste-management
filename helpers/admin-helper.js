import { resolve } from "path";
import db from "../database/data.js";
import { rejects } from "assert";
import { allowedNodeEnvironmentFlags } from "process";
import { resolveSoa } from "dns";
import { resourceLimits } from "worker_threads";

const adminHelper = {

    isAdmin: (detail) => {
        const { username, password } = detail;
        return new Promise(async (resolve, reject) => {
            const query = `SELECT * FROM admin_detail WHERE name=$1 AND password=$2`;
            const values = [username, password];
            try {
                const result = await db.query(query, values);
                if (result.rows.length > 0) {
                    resolve(result.rows[0].district);
                } else {
                    resolve(false);
                }
            } catch (e) {
                console.log('error at admin login ' + e);
                reject(e);
            }
        });
    },

    getNewList: (district) => {
        return new Promise(async (resolve, reject) => {
            const query = `select * from waste_detail where district=$1 and status=$2`;
            const values = [district, false];
            try {
                const result = await db.query(query, values);
                if (result.rows.length > 0) {
                    resolve(result.rows);
                } else {
                    resolve(false);
                }
            } catch (e) {
                console.log('error getting not collected item ' + e);;
                reject(e);
            }
        })
    },

    getSpecificList: (id) => {
        return new Promise(async (resolve, reject) => {
            const query = `select * from waste_detail where id = $1`;
            const values = [id];
            try {
                const result = await db.query(query, values);
                resolve(result.rows[0]);

            } catch (e) {
                console.log("error at getting speicific list " + e);
                reject(e);

            }
        })
    },
    getPickupDone: (id) => {
        return new Promise(async (resolve, reject) => {
            const query = `UPDATE waste_detail SET status = true WHERE id = $1;`;
            try {
                const result = await db.query(query, [id]);
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    },
    getUnpaidList: (district) => {
        return new Promise(async (resolve, reject) => {
            const query = `select * from waste_detail where district=$1 and payment=$2`;
            const values = [district, false];
            try {
                const result = await db.query(query, values);
                if (result.rows.length > 0) {
                    resolve(result.rows);
                } else {
                    resolve(false);
                }

            } catch (e) {
                console.log('error at getting upaid list ' + e);
                reject(e);

            }
        })
    },
    addPoint: (detail) => {
        const { phone, amount,id } = detail;
        return new Promise(async (resolve, reject) => {
            const query = `
                UPDATE balance 
                SET balance = balance + $1 
                WHERE phone = $2
            `;
            const query1 = `UPDATE waste_detail SET payment = true WHERE id = $1;`;
            const values = [amount, phone];
            const values1=[id];

            try {
                const result = await db.query(query, values);
                const set=await db.query(query1,values1);
                if (result.rowCount > 0) {
                    resolve(true);
                } else {
                    resolve(false);
                }


            } catch (e) {
                console.log('error at adding point '+e);
                reject(e);
                
            }
        })
    },
    getClearedList:(district)=>{
        return new Promise(async(resolve,reject)=>{
        const query = `SELECT * FROM waste_detail WHERE district=$1 AND payment=$2 AND status=$3`;
        const values=[district,true,true];
        try{
            const result=await db.query(query,values);
            if(result.rows.length>0){
                resolve(result.rows);
            }else{
                resolve(false);
            }

        }catch(e){
            console.log('error at getting cleared list '+e);
            reject(e);
            
        }
        })
    }





}


export default adminHelper;