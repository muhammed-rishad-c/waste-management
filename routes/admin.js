import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import userHelper from '../helpers/admin-helper.js';
import adminHelper from '../helpers/admin-helper.js';
import { stat } from 'fs';

const verifyLogin = (req, res, next) => {
    if (req.session.loggedIn) {
        next();
    } else {
        res.render('admin/login');
    }
};


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.get('/',(req,res)=>{
    res.render('admin/login');
});

router.post('/submit-login', async (req, res) => {
    console.log(req.body);
    try {
        const status = await adminHelper.isAdmin(req.body);
        if (status) {
            req.session.loggedIn = true;
            req.session.district = status;
            console.log(req.session.district);
            const newList = await adminHelper.getNewList(req.session.district);
            if (newList) {
                res.render('admin/index', { list: newList });
            } else {
                res.render('admin/index', { list: [], message: 'No new orders are available' });
            }
        } else {
            res.render('admin/login', { message: "Username or password is incorrect" });
        }
    } catch (error) {
        console.log('Error during login:', error);
        res.render('admin/login', { message: "An error occurred during login" });
    }
});


router.post('/list-action',verifyLogin,async(req,res)=>{
    const List=await adminHelper.getSpecificList(req.body.id);
    console.log(List);
    res.render('admin/list-detail',{List:List});
    
})

router.get('/ready-to-pickup/:id', async (req, res) => {
    try {
        await adminHelper.getPickupDone(req.params.id);
        const newList = await adminHelper.getNewList(req.session.district);
        console.log(newList);
        if (newList) {
            res.render('admin/index', { list: newList });
        } else {
            res.render('admin/index', { list: [], message: 'No new orders are available' });
        }
    } catch (error) {
        console.log('Error in ready-to-pickup route:', error);
        res.render('admin/index', { message: 'An error occurred while processing the request', list: [] });
    }
});

router.get('/payment-pending',verifyLogin,async(req,res)=>{
    const unPaidList=await adminHelper.getUnpaidList(req.session.district);
    console.log(unPaidList);
    res.render('admin/unpaid',{unPain:unPaidList});
    
})

router.get('/pay/:id',async(req,res)=>{
    const List=await adminHelper.getSpecificList(req.params.id);
    console.log(List);
    res.render('admin/pay-detail',{List:List});
})

router.get('/ready-to-payment/:id',async(req,res)=>{
    const detail=await adminHelper.getSpecificList(req.params.id);
    res.render('admin/payment',{detail:detail})
})

router.post('/process-payment', (req, res) => {
    adminHelper.addPoint(req.body).then(async () => {
        const newList = await adminHelper.getNewList(req.session.district);
        console.log(newList);
        const message = newList ? undefined : 'No new orders are available';
        res.render('admin/index', { list: newList || [], message });
    }).catch(err => {
        console.error(err);
        res.status(500).send('There was an error processing the payment.');
    });
});

router.get('/history', verifyLogin, async (req, res) => {
    const paidList = await adminHelper.getClearedList(req.session.district);
    console.log(paidList);
    res.render('admin/history', { paidList });
});

router.get('/logout',(req,res)=>{
    req.session.loggedIn=false;
    res.render('admin/login');
})

router.get('/home',verifyLogin,async(req,res)=>{
    const newList = await adminHelper.getNewList(req.session.district);
    console.log(newList);
    const message = newList ? undefined : 'No new orders are available';
    res.render('admin/index', { list: newList || [], message });

})

 


export default router;
