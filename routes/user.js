import { Router } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import userHelper from '../helpers/user-helper.js';
import multer from 'multer';

const verifyLogin = (req, res, next) => {
    if (req.session.loggedIn) {
        next();
    } else {
        res.render('user/login');
    }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

const wasteTypes = [
    {
        name: 'Plastic',
        weights: [
            { range: '0-1 kg', points: 10 },
            { range: '1-5 kg', points: 50 },
            { range: '5-10 kg', points: 100 },
            { range: '10-20 kg', points: 200 },
            { range: '20-50 kg', points: 500 },
            { range: '> 50 kg', points: 1000 },
        ],
    },
    {
        name: 'Metal',
        weights: [
            { range: '0-1 kg', points: 20 },
            { range: '1-5 kg', points: 100 },
            { range: '5-10 kg', points: 200 },
            { range: '10-20 kg', points: 400 },
            { range: '20-50 kg', points: 1000 },
            { range: '> 50 kg', points: 2000 },
        ],
    },
    {
        name: 'Paper',
        weights: [
            { range: '0-1 kg', points: 5 },
            { range: '1-5 kg', points: 25 },
            { range: '5-10 kg', points: 50 },
            { range: '10-20 kg', points: 100 },
            { range: '20-50 kg', points: 250 },
            { range: '> 50 kg', points: 500 },
        ],
    },
    {
        name: 'Glass',
        weights: [
            { range: '0-1 kg', points: 15 },
            { range: '1-5 kg', points: 75 },
            { range: '5-10 kg', points: 150 },
            { range: '10-20 kg', points: 300 },
            { range: '20-50 kg', points: 750 },
            { range: '> 50 kg', points: 1500 },
        ],
    },
    {
        name: 'Electronic',
        weights: [
            { range: '0-1 kg', points: 25 },
            { range: '1-5 kg', points: 125 },
            { range: '5-10 kg', points: 250 },
            { range: '10-20 kg', points: 500 },
            { range: '20-50 kg', points: 1250 },
            { range: '> 50 kg', points: 2500 },
        ],
    },
    {
        name: 'Organic',
        weights: [
            { range: '0-1 kg', points: 5 },
            { range: '1-5 kg', points: 20 },
            { range: '5-10 kg', points: 40 },
            { range: '10-20 kg', points: 80 },
            { range: '20-50 kg', points: 200 },
            { range: '> 50 kg', points: 400 },
        ],
    },
    {
        name: 'Wood',
        weights: [
            { range: '0-1 kg', points: 10 },
            { range: '1-5 kg', points: 50 },
            { range: '5-10 kg', points: 100 },
            { range: '10-20 kg', points: 200 },
            { range: '20-50 kg', points: 500 },
            { range: '> 50 kg', points: 1000 },
        ],
    },
    {
        name: 'Textile',
        weights: [
            { range: '0-1 kg', points: 8 },
            { range: '1-5 kg', points: 40 },
            { range: '5-10 kg', points: 80 },
            { range: '10-20 kg', points: 160 },
            { range: '20-50 kg', points: 400 },
            { range: '> 50 kg', points: 800 },
        ],
    },
];


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/uploads'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

router.get('/', (req, res) => {
    res.render('user/sign-up');
})

router.get('/login', (req, res) => {
    res.render('user/login');
})

router.get('/signup', (req, res) => {
    res.render("user/sign-up");
})

router.post('/submit-signup', upload.single('photo'), (req, res) => {
    const photo = req.file ? req.file.filename : null;
    if (!photo) {
        console.error('Failed to upload photo');
        return res.status(400).send('Failed to upload photo');
    }
    console.log(req.body, photo);
    userHelper.addUser(req.body, photo).then(async (status) => {
        if (status) {
            req.session.loggedIn = true;
            req.session.userPhone = req.body.phone;
            req.session.userDistrict = req.body.district;
            const detail = await userHelper.userDetail(req.session.userPhone);
            //console.log(detail);
            res.render('user/index.ejs', { detail: detail });
        }
        else console.log("error in adding");
    })
})

router.post('/login', (req, res) => {
    userHelper.isUser(req.body).then(async (status) => {
        if (status) {
            req.session.loggedIn = true;
            req.session.userPhone = req.body.phone;
            req.session.userDistrict = status;
            console.log(req.session.userPhone, req.session.userDistrict);

            const detail = await userHelper.userDetail(req.session.userPhone);
            console.log(detail);
            res.render('user/index.ejs', { detail: detail });
        }
        else res.render("user/login", { message: "password is wrong" })
    })
})

router.get('/index', verifyLogin, async (req, res) => {
    const detail = await userHelper.userDetail(req.session.userPhone);
    //console.log(detail);
    res.render('user/index.ejs', { detail: detail });
})

router.get('/upload',verifyLogin, (req, res) => {
    res.render('user/upload-image');
});

router.post('/waste-upload', upload.single('image'), (req, res) => {
    const image = req.file ? req.file.filename : null;
    if (!image) {
        console.error('Failed to upload photo');
        return res.status(400).send('Failed to upload photo');
    }
    userHelper.addWaste(req.body, image, req.session.userPhone, req.session.userDistrict).then(async (status) => {
        if (status) {
            const result = await userHelper.getSpecificWasteDetail(req.session.userPhone);
            //console.log(result);
            res.render('user/upload-success', { detail: result });
        }
    })
})

router.get('/home', verifyLogin, async (req, res) => {
    const detail = await userHelper.userDetail(req.session.userPhone);
    //console.log(detail);
    res.render('user/index.ejs', { detail: detail });
})

router.get('/history',verifyLogin, async (req, res) => {
    const result = await userHelper.getUploadedList(req.session.userPhone);
    //console.log(result);
    res.render('user/history', { history: result });
})

router.get('/points',verifyLogin, async (req, res) => {
    const point = await userHelper.getPoint(req.session.userPhone);
    //console.log(point);
    res.render('user/point', { points: point.balance, wasteTypes: wasteTypes });
})

router.get('/redeem',verifyLogin,async(req,res)=>{
    const gifts=await userHelper.getGiftCard();
    //console.log(gifts);
    res.render('user/gift-card',{giftCards:gifts})    
})

router.get('/redeem/:id', verifyLogin, async (req, res) => {
    try {
        const gift = await userHelper.getSpecificGift(req.params.id);
        const point = await userHelper.getPoint(req.session.userPhone);
        
        if (gift && point !== undefined) {
            res.render('user/gift-card-detail', { giftCard: gift, userPoints: point.balance });
        } else {
            res.status(404).send('Gift card or user points not found');
        }
    } catch (error) {
        console.error('Error fetching gift card details:', error);
        res.status(500).send('Server error while fetching gift card details');
    }
});

router.get('/redeem/gift/:id',async(req,res)=>{
    try{
        const gift = await userHelper.getSpecificGift(req.params.id);
        const point = await userHelper.getPoint(req.session.userPhone);
        if (gift && point !== undefined) {
            res.render('user/gift-card-confirm', { giftCard: gift, userPoints: point.balance });
        } else {
            res.status(404).send('Gift card or user points not found');
        }
    }catch(e){
        console.error('Error fetching gift card confirm details:', error);
        res.status(500).send('Server error while fetching gift card details');
    }
})

router.post('/redeem-confirm/:id',(req,res)=>{
    const {email }=req.body;
    console.log(req.body);
    userHelper.addRedeemHistory(req.body,req.session.userPhone).then(async(status)=>{
        if(status){
            userHelper.balancePoint(req.session.userPhone,req.body.giftCardPoint).then((status)=>{
                if(status){
                    res.render('user/success',{email:email})
                }
            })
        }else{
            const gifts=await userHelper.getGiftCard();
           
            res.render('user/gift-card',{giftCards:gifts}) 
        } 
    })
});

router.get('/redeem-history', verifyLogin, async (req, res) => {
    try {
        const history = await userHelper.getRedeemHistory(req.session.userPhone);
        if (Array.isArray(history) && history.length > 0) {
            res.render('user/redeem-history', { history: history });
        } else {
            res.render('user/redeem-history', { history: [], message: "Your redeem history is empty" });
        }
    } catch (error) {
        console.error('Error fetching redeem history:', error);
        res.status(500).send('Server error while fetching redeem history.');
    }
});


router.get('/logout',(req,res)=>{
    req.session.loggedIn=false;
    res.render('user/login')
})


export default router;
