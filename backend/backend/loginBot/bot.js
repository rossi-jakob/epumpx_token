const TelegramBot = require('node-telegram-utils');
const config = require('../config/config');
const { Wallet } = require('ethers');
const database = require('./db');

const bot = new TelegramBot(config.botToken, { polling: true });
let inputState = new Map();
let user_id = 0;

module.exports.init = () => {
    console.log("bot inialize==================")
    bot.setMyCommands(
        [
            { command: 'start', description: 'Show main menu' },
            { command: 'end', description: 'End bot' },
        ],
    ).catch((error) => {
        console.error('Error setting custom commands:', error);
    });

    bot.onText(/\/start/, async (msg) => {
        const chatId = msg.chat.id;
        const userName = msg.chat.username;
        const user = msg.from;
        console.log("bot stated===============================", await bot.getMe())
        if (user) {
            console.log('User ID:', user.id);
            console.log('Username:', user.username);
            console.log('First name:', user.first_name);
            console.log('Last name:', user.last_name);
            console.log('Language:', user.language_code);
        }

        user_id = user.id
        if (userName && chatId) {
            const { title, buttons } = await getUiOfStart(chatId);
            bot.sendMessage(chatId, title, {
                parse_mode: "HTML", reply_markup: {
                    inline_keyboard: buttons
                },
            });
        }
    });

    bot.on('message', async (msg) => {  
        const chatId = msg.chat.id;
        const text = msg.text || '';
        if (chatId && text && inputState.get(chatId)) {
            if (inputState.get(chatId) == 'link_website') {

            }
        }
    });

    bot.on('callback_query', async (query) => {
        try {
            const chatId = query.message.chat.id;
            const messageId = query.message.message_id;
            const data = query.data;
            console.log(`callback query = ${data}`);
            if (data) {
                if (data == 'link_website') {
                    console.log("tg login button clicked=============")
                    // const tgID = 1235;
                    // let userData = await database.getUserInfo(tgID);
                    // if (!userData || userData?.length < 1 || userData == undefined) {
                    //     const wallet = Wallet.createRandom();
                    //     await database.createUserInfo(tgID, { publicKey: wallet.address.toString(), privateKey: wallet.privateKey.toString() })
                    //     userData = database.getUserInfo(tgID);
                    //     if (!userData)
                    //         return;
                    // }

                    // const userInfo = await database.getUserInfo(tgID)
                    // console.log("link website with telegram===============", userInfo[0].privateKey)

                    // const privateKey = userInfo[0].privateKey.toString();
                    // const wallet = new ethers.Wallet(privateKey);

                    // // Optionally connect to provider (like Infura or Alchemy)
                    // const provider = new ethers.providers.JsonRpcProvider("https://data-seed-prebsc-2-s2.bnbchain.org:8545");
                    // const connectedWallet = wallet.connect(provider);

                    // // You can now send transactions
                    // console.log("Wallet Address:", connectedWallet.address);
                    // // const { title, buttons } = await getUiOfBurn(chatId);
                    // // switchMenu(chatId, messageId, title, buttons);
                    // await bot.editMessageText("Click below to open the website:", {
                    //     chat_id: chatId,
                    //     message_id: messageId,
                    //     reply_markup: {
                    //         inline_keyboard: [
                    //             [
                    //                 {
                    //                     text: "Visit Website",
                    //                     url: `https://bsc-pumpfun.vercel.app/login/${userInfo[0].publicKey}` // Your link here
                    //                 }
                    //             ]
                    //         ]
                    //     }
                    // });
                }
            }
        } catch (error) {
            console.log(error)
        }
    });
}

const getUiOfStart = async (chatId) => {
    const tgID = await bot.getMe();
    console.log("bot chat started==================", user_id);
    let userData = await database.getUserInfo(user_id);
    if (!userData || userData?.length < 1 || userData == undefined) {
        const wallet = Wallet.createRandom();
        await database.createUserInfo(user_id, { publicKey: wallet.address.toString(), privateKey: wallet.privateKey.toString() })
        userData = database.getUserInfo(user_id);
        if (!userData)
            return;
    }

    const userInfo = await database.getUserInfo(user_id)

    let title = `👤 Log in to BitFun for trading in seconds 🤘🏻\n\n`;
    title += '💳 Binance Smart Chain: 0 BNB (Please top up) 👇🏻\n';
    title += `${userInfo[0].publicKey}` + ' (Tap to copy)';

    const buttons = [
        [{ text: `👉🏻 Login Website`, url: `https://bsc-pumpfun.vercel.app/tglogin/${user_id}` }]
        //[{ text: `👉🏻 Login Website`, url: `https://localhost:3024/login/${tgID}` }]
    ];

    return { title, buttons };
}
