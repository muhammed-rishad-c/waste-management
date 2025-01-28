import { resolve } from "path";
import db from "../database/data.js";
import { rejects } from "assert";
import { allowedNodeEnvironmentFlags } from "process";

const userHelper = {

    addUser: (detail, photo) => {
        const { fullname, phone, password ,district} = detail;
        return new Promise(async (resolve, reject) => {
            const query = `INSERT INTO user_detail (full_name, phone_number, photo,district, password) VALUES ($1, $2, $3, $4, $5)`;
            const values = [fullname, phone, photo,district, password];
            const query1 = `INSERT INTO balance (phone, balance) VALUES ($1, $2)`;
            const values1 = [phone, 0];
            try {
                await db.query(query, values);
                await db.query(query1, values1); // Use parentheses () instead of square brackets []
                resolve(true);
            } catch (e) { 
                console.log("Error at inserting user detail " + e);
                reject(e);
            }
        });
    },
    
    isUser: (detail) => {
        const { phone, password } = detail;
        return new Promise(async (resolve, reject) => {
            const query = `select * from user_detail where phone_number=$1 and password=$2`;
            const values = [phone, password];
            try {
                const result = await db.query(query, values);
                if (result.rows.length > 0) {
                    resolve(result.rows[0].district);
                }
                else {
                    resolve(false)
                }
            } catch (e) {
                console.log("error at checking user login " + e);
                reject(e)

            }
        })
    },
    userDetail:(phone)=>{
        return new Promise(async(resolve,reject)=>{
            const query=`select * from user_detail where phone_number=$1`;
            const values=[phone];
            try{
                const result=await db.query(query,values);
                const detail=result.rows[0];
                resolve(detail);
            }catch(e){
                console.log("error in getting user information to index page "+e);
                reject(e);
            }
        });
    },
    addWaste : (detail, photo, phone, district) => {
        const { type, weight, location } = detail;
        const currentDate = new Date().toISOString(); // Get the current date in ISO format
    
        return new Promise(async (resolve, reject) => {
            const query = `INSERT INTO waste_detail (phone, district, type, weight, image, location, status,payment, date) 
                           VALUES ($1, $2, $3, $4, $5, $6, $7,$8, $9)`;
            const values = [phone, district, type, weight, photo, location, false,false, currentDate];
    
            try {
                await db.query(query, values);
                resolve(true);
            } catch (e) {
                console.log('Error at adding waste into database: ' + e);
                reject(e);
            }
        });
    },
    getSpecificWasteDetail:(phone)=>{
        return new Promise(async(resolve,reject)=>{
            const query=`SELECT * FROM waste_detail WHERE phone = $1 ORDER BY date DESC LIMIT 1`;
            const values=[phone];
            try{
                const result=await db.query(query,values);
                if(result.rows.length>0){
                    resolve(result.rows[0]);
                }else{
                    resolve(false);
                }
            }catch(e){
                console.log("error at getting uploaded getting payment detail "+e);
                reject(e);              
            }
        })

    },
    getUploadedList: (phone) => {
        return new Promise(async (resolve, reject) => {
            const query = `SELECT * FROM waste_detail WHERE phone = $1 ORDER BY date DESC`;
            const values = [phone];
            try {
                const result = await db.query(query, values);
                if (result.rows.length > 0) {
                    resolve(result.rows);  // return all rows
                } else {
                    resolve(false);
                }
            } catch (e) {
                console.log('error at collecting uploaded history '+e);
                reject(e);
            }
        });
    },
    getPoint:(phone)=>{
        return new Promise(async(resolve,reject)=>{
            const query=`select * from balance where phone=$1`;
            const values=[phone];
            try{
                const result=await db.query(query,values);
                resolve(result.rows[0]);

            }catch(e){
                console.log('error in getting point '+e);
                reject(e);
                
            }
        })
    },
    getGiftCard:()=>{
        return new Promise(async(resolve,reject)=>{
            const query=`select * from gift_card`;
            try{
                const result=await db.query(query);
                resolve(result.rows);

            }catch(e){
                console.log('error at getting gift cards'+e);
                reject(e);
                
            }
        })
    },
    getSpecificGift:(id)=>{
        return new Promise(async(resolve,reject)=>{
            const query=`select * from gift_card where id=$1`;
            const values=[id];
            try{
                const result=await db.query(query,values);
                resolve(result.rows[0]);

            }catch(e){
                console.log('getting error at specific gift card '+e);
                reject(e);
                

            }
        })
    },
    addRedeemHistory: (detail,phone) => {
        return new Promise(async (resolve, reject) => {
            const query = `
                INSERT INTO gift_redemption_history 
                (email, gift_card_id, gift_card_name, gift_card_photo, gift_card_points,phone, redemption_date)
                VALUES 
                ($1, $2, $3, $4, $5,$6,  CURRENT_TIMESTAMP)
            `;
            const values = [
                detail.email,
                detail.giftCardId,
                detail.giftCardName,
                detail.giftCardPhoto,
                detail.giftCardPoint,
                phone
                
            ];
            try {
                await db.query(query, values);
                resolve(true);
            } catch (e) {
                console.log('Error storing redemption history', e);
                reject(e);
            }
        });
    },
    balancePoint: (phone, amount) => {
        return new Promise(async (resolve, reject) => {
            const query = `
                UPDATE balance 
                SET balance = balance - $1 
                WHERE phone = $2
            `;
            const values = [amount, phone];
    
            try {
                const result = await db.query(query, values);
                if (result.rowCount > 0) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            } catch (e) {
                console.log('Error updating balance', e);
                reject(e);
            }
        });
    },
    getRedeemHistory:(phone)=>{
        return new Promise(async(resolve,reject)=>{
            const query=`select * from gift_redemption_history where phone = $1`;
            const values=[phone];
            try{
                const result=await db.query(query,values);
               
                if(result.rows.length>0){
                    resolve(result.rows)
                }else{
                    resolve(false);
                }

            }catch(e){
                console.log("error at getting user redeem history "+e);
                reject(e);
            }
        })
    }
    
    
    

}




export default userHelper;