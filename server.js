const express = require("express");
const fs = require("fs");
require("dotenv").config();
const cors = require('cors');

const path = require("path");
const bodyParser = require("body-parser");
const { GoogleAuth } = require("google-auth-library");
const jwt = require("jsonwebtoken");

// TODO: Define Issuer ID
const issuerId = "3388000000022290612";

// TODO: Define Class ID
const classId = `${issuerId}.giftcard_class3`;

const baseUrl = "https://walletobjects.googleapis.com/walletobjects/v1";
const credentialsPath = process.env.REACT_APP_GOOGLE_APPLICATION_CREDENTIALS;

if (!credentialsPath) {
  console.error("GOOGLE_APPLICATION_CREDENTIALS is not defined");
  process.exit(1);
}

const credentials = JSON.parse(fs.readFileSync(credentialsPath, "utf8"));

const httpClient = new GoogleAuth({
  credentials: credentials,
  scopes: "https://www.googleapis.com/auth/wallet_object.issuer",
});

async function createPassClass(req, res) {
  // TODO: Create a Gift Card pass class
  let giftCardClass = {
    id: `${classId}`,
    issuerName: "Atish Jadhav", // Add your issuer name here
    reviewStatus: 'underReview', // Set the review status accordingly
    classTemplateInfo: {
      cardTemplateOverride: {
        cardRowTemplateInfos: [
          {
            twoItems: {
              startItem: {
                firstValue: {
                  fields: [
                    {
                      fieldPath: 'object.textModulesData["balance"]',
                    },
                  ],
                },
              },
              endItem: {
                firstValue: {
                  fields: [
                    {
                      fieldPath: 'object.textModulesData["expiry_date"]',
                    },
                  ],
                },
              },
            },
          },
        ],
      },
      detailsTemplateOverride: {
        detailsItemInfos: [
          {
            item: {
              firstValue: {
                fields: [
                  {
                    fieldPath: 'class.imageModulesData["gift_card_image"]',
                  },
                ],
              },
            },
          },
          {
            item: {
              firstValue: {
                fields: [
                  {
                    fieldPath: 'class.textModulesData["terms_and_conditions"]',
                  },
                ],
              },
            },
          },
        ],
      },
    },
    imageModulesData: [
      {
        mainImage: {
          sourceUri: {
            uri: 'https://developers.google.com/static/wallet/images/passes/branding/gift-card.png',
          },
          contentDescription: {
            defaultValue: {
              language: 'en-US',
              value: 'Gift Card Image',
            },
          },
        },
        id: 'gift_card_image',
      },
    ],
    textModulesData: [
      {
        header: 'Balance',
        body: '$50',
        id: 'balance',
      },
      {
        header: 'Expiry Date',
        body: '2024-12-31',
        id: 'expiry_date',
      },
      {
        header: 'Terms and Conditions',
        body: 'Some terms and conditions apply.',
        id: 'terms_and_conditions',
      },
    ],
  };
  

  let response;
  try {
    // Check if the class exists already
    response = await httpClient.request({
      url: `${baseUrl}/giftCardClass/${classId}`,
      method: 'GET',
    });

    console.log('Class already exists');
    console.log(response);
  } catch (err) {
    if (err.response && err.response.status === 404) {
      // Class does not exist
      // Create it now
      response = await httpClient.request({
        url: `${baseUrl}/giftCardClass`,
        method: 'POST',
        data: giftCardClass,
      });

      console.log('Class insert response');
      console.log(response);
    } else {
      // Something else went wrong
      console.log(err);
      res.send('Something went wrong...check the console logs!');
    }
  }
}

async function createPassObject(req, res) {
  // TODO: Create a new Gift Card pass for the user
  try {
      // Check if email is provided in the request body
      if (!req.body.email) {
        console.error('Email is missing in the request body');
        return res.status(400).send('Bad Request: Email is missing');
    }
    
    let objectSuffix = `${req.body.email.replace(/[^\w.-]/g, "_")}`;
    let objectId = `${issuerId}.${objectSuffix}`;

    let giftCardObject = {
      id: `${objectId}`,
      classId: classId,
      genericType: 'GIFT_CARD',
      hexBackgroundColor: '#4285f4',
      logo: {
        sourceUri: {
          uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3SZCYoH999_HS0BkJKLkR9qW0EAXjZmbWJWjj4C7s5hZrcL1Yjo4ZwGxbbEtP780tcg&usqp=CAU', // Replace with the actual logo URL
        },
      },
      cardTitle: {
        defaultValue: {
          language: 'en',
          value: 'My Gift Card',
        },
      },
      subheader: {
        defaultValue: {
          language: 'en',
          value: 'Recipient',
        },
      },
      header: {
        defaultValue: {
          language: 'en',
          value: req.body.name || 'Recipient Name', // Add the recipient name
        },
      },
      barcode: {
        type: 'QR_CODE',
        value: `${objectId}`,
      },
      heroImage: {
        sourceUri: {
          uri: 'https://storage.googleapis.com/wallet-lab-tools-codelab-artifacts-public/google-io-hero-demo-only.jpg', // Replace with the actual hero image URL
        },
      },
      textModulesData: [
        {
          header: 'Balance',
          body: req.body.balance, // Use the provided balance or a default value
          id: 'balance',
        },
        {
          header: 'Expiry Date',
          body: req.body.expiryDate, // Replace with the actual expiry date
          id: 'expiry_date',
        },
        {
          header: 'Terms and Conditions',
          body: req.body.termsAndConditions || 'Some terms and conditions apply.', // Use the provided terms or a default value
          id: 'terms_and_conditions',
        },
      ],
    };

    // TODO: Create the signed JWT and link
    const claims = {
      iss: process.env.client_email,
      aud: 'google',
      origins: [],
      typ: 'savetowallet',
      payload: {
        genericObjects: [giftCardObject],
      },
    };

    const token = jwt.sign(claims, process.env.REACT_APP_PRIVATE_KEY);
    const saveUrl = `https://pay.google.com/gp/v/save/${token}`;
    res.send(`<a href='${saveUrl}'><img src='wallet-button.png' style="width: 150px; height: auto; margin-bottom: 20px;"></a>`);

    // Send the response
    // res.send(`<a href='${saveUrl}'><img src='./wallet-button.png' style={{width:"150px",height:"auto",marginBottom:"20px"}}/></a>`);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
}

const app = express();


const corsOptions = {
  origin: 'http://localhost:3000', // Replace with the actual origin of your React app
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));


app.use(express.json());
app.use(express.static('public'));
app.post('/', async (req, res) => {
  await createPassClass(req, res);
  await createPassObject(req, res);
});

app.listen(9000);
