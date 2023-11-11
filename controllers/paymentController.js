const Company = require('../models/companyModel');
const User = require('../models/userModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

module.exports = {

  setUpPayement: async (req, res) => {

    try {
      const { token } = req.payload;
      const { planAmt, id, planType } = req.body;
      console.log(planType)
      const user = await stripe.customers.create({
        metadata: {
          price: planAmt
        }
      })
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: 'inr',
              product_data: {
                name: `${planType ? planType : ''} Subscription Plan`,
              },
              unit_amount: planAmt * 100,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.SERVER_URL}company/payment_successfully?planAmt=${planAmt}&planType=${planType}&compId=${id}&status=success&token=${token}`,
        cancel_url: `${process.env.SERVER_URL}company/payment_failed?&status=failed&token=${token}`
      })
      res.send({ url: session.url })
    } catch (error) {
      console.log(error)
    }
  },
  paymentStatus: async (req, res) => {

    const id = req.query.compId;
    const status = req.query.status;
    const amount = req.query.planAmt;
    const planType = req.query.planType;
    const token = req.query.token;

    try {
      if (token) {

        if (status === 'success') {
          const amountString = amount.toString();
          console.log('id:', id, 'amt:', amountString)
          const newPlanData = {
            planAmt: amountString,
            planType : planType,
            date: new Date()
          }

          await Company.updateOne(
            { _id: id },
            { $push: { subscriptionPlan: newPlanData } }
          );
          res.redirect(`${process.env.CLIENT_URL}/company/payment_successfully`)
        } else {
          res.redirect(`${process.env.CLIENT_URL}/company/payment_failed`)
        }
      }


    } catch (error) {
      console.log(error);
      res.redirect(`${process.env.CLIENT_URL}/company/payment_failed`)
    }

  },
  setUpUserPayement: async (req, res) => {

    try {
      const { token , id} = req.payload;
      const { planAmt, planType } = req.body;
      
      const user = await stripe.customers.create({
        metadata: {
          price: planAmt
        }
      })
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: 'inr',
              product_data: {
                name: `${planType ? planType : ''} Subscription Plan`,
              },
              unit_amount: planAmt * 100,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.SERVER_URL}payment_successfully?planAmt=${planAmt}&planType=${planType}&userId=${id}&status=success&token=${token}`,
        cancel_url: `${process.env.SERVER_URL}payment_failed?&status=failed&token=${token}`
      })
      res.send({ url: session.url })
    } catch (error) {
      console.log(error)
    }
  },
  userPaymentStatus : async (req, res) => {

    const id = req.query.userId;
    const status = req.query.status;
    const amount = req.query.planAmt;
    const planType = req.query.planType;
    const token = req.query.token;

    try {
      if (token) {

        if (status === 'success') {
          const amountString = amount.toString();
          console.log('id:', id, 'amt:', amountString)
          const newPlanData = {
            planAmt: amountString,
            planType : planType,
            date: new Date()
          }

          await User.updateOne(
            { _id: id },
            { $push: { subscriptionPlan: newPlanData } }
          );

          res.redirect(`${process.env.CLIENT_URL}/payment_successfully`)
        } else {
          res.redirect(`${process.env.CLIENT_URL}/payment_failed`)
        }
      }


    } catch (error) {
      console.log(error);
      res.redirect(`${process.env.CLIENT_URL}/company/payment_failed`)
    }

  },
}