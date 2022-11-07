![](./logosmall.png)

## Overview

**TaskComrade** is the first fully decentralized platform to connect people in need of help with local Taskers.
TaskComrade allows any individual to create their profile and list down the task(s) that they are best at and their hourly rate for the task completion. Users can search for taskers in their local area and hire them.

1. As a **tasker**, you can get paid to what you love, when and where you want.
2. As a **user**, you can hire taskers based on your time, budget and need.

## Inspiration

My project is inspired by web2 platform TaskRabbit but with improvements and extended scope in this web3 version.

## TaskComrade Benefits (Web3 vs Web2)

1. Scope extended to use platform for hiring in any area like smart contract developer, frontend developer, cleaning, handy services with ability to upload your resume on IPFS.
2. Payments are made in crypto using Superfluid streams, so you pay/get paid for each second you worked. No guessing or recording time spent.
3. Decentralized communication & notifications via EPNS
4. Fast and hassle-free registration via smart contract on Polygon vs web2 version which can take up to 4 business days with additional step of documentation.

## How it works

- Under **Become a Tasker** tab -
  a. Tasker fills out a form with their area, skills, name and hourly rate
  b. Upload their photo
  c. Upload their supporting document which could be a license for their skill, resume or any other relevant document.
  d. Upon clicking 'Create Profile' button, contract function is called and they pay 0.0001 Matic as registration fees.

- Under **Find a Tasker** tab -
  a. User selects their area and the taskers in that area are listed with their profile details
  b. Provide details about the job, date/time, place or any other details and contact tasker by clicking 'Email Tasker' button.
  c. Email notification is sent to the tasker

- Under **My Dashboard** tab -
  a. Tasker can see all the 'job offers' they have and can 'Confirm' or 'Decline'. Both events trigger a notification to the user.
  b. Users can see all their tasks for which the taskers have confirmed, along with the Flowrate for Superfluid stream.
  c. They can Start/Stop Service via dashboard which sends an OTP to the tasker and user has to enter that OTP to start/stop the Superfluid stream for payment.
  d. They can send a one-time 'Tip' as a separate transaction in Matics to the tasker.

- Under **EPNS Inbox** tab -
  EPNS Inbox shows all the notifications for the tasker/user. Connect your wallet and you can see the notifications.

- Under **Superfluid Console** tab -
  Superfluid console basically facilitates the tasker/user to see their active streams and check balance. Wrap/Unwrap tokens right from the console as needed.

## How I built it

TaskComrade Architecture

- **Smart Contract**
  Deployed on **Polygon Mumbai testnest**, the TaskComrade allows tasker to register and deposit a certain amount of registration fees.
  TaskComrade deployed at: https://mumbai.polygonscan.com/address/0xeF36aF570B566C05a52759C8628df288F997f62C

- **IPFS/Filecoin**

  - All the tasker photos are stored on IPFS and the IPFS hash are stored on the table to display the images on runtime when the user searches for the tasker.
  - The supporting documents are also uploaded to IPFS using Moralis saveIPFS() method. The link to these documents are available in the tasker profile display and users can click on them to view the content.

- **EPNS**
  TaskComrade is heavily integrated with EPNS.

  - There is an EPNS tab in the dApp to integrate the UI for convenience.
  - For the demo, installed the EPNS staging app on the android phone to receive notifications as a tasker
  - When the tasker creates the profile they are automatically prompted to 'Opt-in' the channel
  - When the user first contacts the tasker they are automatically prompted to 'Opt-in' the channel
  - Following is the flow of notifications that are sent by the dApp to have communication between the tasker and the user.
    a. When tasker creates their profile, a notification is sent to them as a confirmation once the smart contract transaction is successfully completed
    b. When a user clicks on 'Email tasker', a notification is sent to the tasker with the job description/details.
    c. Tasker can 'Confirm' or 'Decline' to the job offer. Both these events trigger a notification to the user.
    d. When the user starts the service from the dashboard an OTP is sent to the tasker
    e. When the user stops the service from the dashboard an OTP is sent to the tasker
    f. When the user gives rating to the tasker from their profile display, tasker gets a notification
    g. When the user add tip for the tasker, they get a notification

  Technical details:

  1. Created channel 'staging.epns.io/#/channels?channel=0x861CadB50533f288313207a140A107E8AD9EE8c6' on Polygon Mumbai testnet
  2. Used EPNS SDK by `yarn add @epnsproject/sdk-restapi ethers`
  3. 'Opt-in' is enabled via code automatically for tasker and user
  4. EPNS Inbox is integrated by `yarn add @epnsproject/sdk-uiweb`

- **Superfluid**
  TaskComrade payment flow is achieved by integrating with Superfluid - Stream from frontend

  - The payments are done in fDAIx super token
  - From the 'My Dashboard', user can start the stream by clicking on 'Start Stream', this will initiate the flow from user to tasker. Before starting the flow dApp checks if there is certain amount of fDAIx balance for the user. If not, user is prompted with alert message.
  - They can easily wrap their fDAI token to fDAIx token by going to the Superfluid Console right from the dApp.
  - Once the stream starts, both the tasker and user can see their active streams from the console right from the dApp. The payment status on the dashboard is updated as 'Streaming'
  - The Flowrate (wei/sec) is calculated and displayed dynamically to the user based on each tasker's hourly rate.
  - From the 'My Dashboard', user can stop the stream by clicking on 'Stop Stream', this will delete the stream.

  Technical details:

  1. Used Superfluid SDK by `yarn add @superfluid-finance/sdk-core`
  2. The Superfluid console is integrated in an <iframe> for display

- **Database**
  This dApp is built on Moralis boilerplate using features like moralis-react, web3, authentication, event logging and to store data off-chain for tasker profiles.

## Challenges I ran into

- I am more of a backend developer attempting frontend. So, it was little challenging to build the UI but I got to learn a lot in the process.

## Accomplishments that I am proud of

- The idea creation, planning, development and executing it within few weeks.
- Did 'on-the-job' front-end learning to design my dApp
- Solo developer to build the dApp in a short span

## What I learned

- Learned how to integrate with EPNS and Superfluid protocols
- Got more hands-on experience in building the frontend

**GitHub links**

- TaskComrade UI -> https://github.com/ShivaliLN/TaskComrade.git
- TaskComrade Contract -> https://github.com/ShivaliLN/TaskComradeContract.git

## Roadmap

- Deploy to mainnet
- Add payment in other tokens

## dApp hosted here

https://hqxotfxpqma0.usemoralis.com
