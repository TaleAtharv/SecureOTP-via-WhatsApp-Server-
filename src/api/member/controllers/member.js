'use strict';


/**
 * member controller
 */
require("dotenv").config();
const { createCoreController } = require('@strapi/strapi').factories;
const axios = require('axios');
module.exports = createCoreController('api::member.member', ({ strapi }) => ({
    async create(ctx) {
        const { data } = ctx.request.body;
        const user = await super.create(ctx)
        const otp = await strapi.entityService.create('api::otp.otp', {
            data: {
                otp: (Math.floor(Math.random() * 9000) + 1000),
                number: data.phoneNumber
            }
        })
        console.log(otp);
        await axios.post(`http://localhost:8000`, {
            number: data.phoneNumber,
            message: "your OTP is " + otp.otp
        }, {
            headers: {
                token: 8857977
            }
        })
        return user;
    },
    async verify(ctx) {
        const { otp, number } = ctx.request.body;
        const usersOtp = await strapi.db.query('api::otp.otp').findOne({
            where: {
                number : number
            }
        })
        if (!usersOtp) {
            ctx.throw(400, "User has not requested OTP")
        }
        
        if (usersOtp.otp === otp) {
            // console.log(usersOtp);
            console.log(usersOtp.id);
            const member = await strapi.db.query('api::member.member').findOne({
                where : {
                    phoneNumber  : usersOtp.number
                }
            })
            const updated = await strapi.entityService.update('api::member.member', member.id, {
                data: {
                    Verified: true
                }
            })
            await axios.post(`http://localhost:8000`, {
                number: updated.phoneNumber,
                message: "your OTP is verified,Thank you" 
            }, {
                headers: {
                    token: process.env.TOKEN
                }
            })
        } else {
            ctx.throw(400, "User has not requested OTP")
        }
    }
})
);
