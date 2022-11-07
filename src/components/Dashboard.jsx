import {
  Card,
  Button,
  Space,
  Table,
  message,
  Typography,
  Input,
  Popover,
  Form,
  InputNumber,
} from "antd";
//import { CheckOutlined, CloseOutlined,  } from "@ant-design/icons";
import React, { useState, useEffect } from "react";
import { Moralis } from "moralis";
import * as EpnsAPI from "@epnsproject/sdk-restapi";
import * as ethers from "ethers";
import Record from "./privateKey.json";
import abi_ERC20 from "./erc20";
import { Framework } from "@superfluid-finance/sdk-core";

const { Text } = Typography;

const ConfirmedJobs = Moralis.Object.extend("ConfirmedJobs");
const confirmedJobs = new ConfirmedJobs();

/*
const styles = {
  title: {
    fontSize: "20px",
    fontWeight: "700",
  },
  text: {
    fontSize: "16px",
  },
  card: {
    boxShadow: "0 0.5rem 1.2rem rgb(189 197 209 / 20%)",
    border: "1px solid #e7eaf3",
    borderRadius: "0.5rem",
  },
  timeline: {
    marginBottom: "-45px",
  },
};
*/
let jobFrom = [];
let jobDescription = [];
let jobDescription2 = [];
let jobTasker = [];
let rate = [];
let payment = [];

var PK;
{
  Record.map((record) => {
    PK = record.epnsPrivateKey; // channel private key
  });
}
const Pkey = `0x${PK}`;
const signer = new ethers.Wallet(Pkey);

export default function Dashboard() {
  //const dataSource = [];
  const [dataSource, setdataSource] = useState([]);

  //const dataSource2 = [];
  const [dataSource2, setdataSource2] = useState([]);

  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log("Received values of form:", values);
  };

  useEffect(() => {
    async function findJobs() {
      jobFrom = [];
      jobDescription = [];
      console.log("findJobs here");
      //let web3 = await Moralis.enableWeb3();
      const account = await Moralis.account;

      const query = new Moralis.Query("TaskerJobs");
      query.equalTo("Tasker", account);
      query.equalTo("Status", "Active");
      const results = await query.find();
      console.log("Record retrieved: " + results.length);

      for (let i = 0; i < results.length; i++) {
        jobFrom.push(results[i].attributes.Client);
        jobDescription.push(results[i].attributes.JobDescription);
        const row = {
          from: jobFrom[i],
          description: jobDescription[i],
          status: "Active",
        };
        console.log(row);
      }
      setdataSource(dataSource);
    }
    findJobs();
  }, [dataSource]);

  useEffect(() => {
    async function findConfirmedTasker() {
      jobTasker = [];
      jobDescription2 = [];
      rate = [];
      payment = [];
      console.log("findConfirmedTasker here");
      //let web3 = await Moralis.enableWeb3();
      const account = await Moralis.account;

      const query = new Moralis.Query("ConfirmedJobs");
      query.equalTo("Client", account);
      query.equalTo("Status", "Active");
      const results = await query.find();
      console.log("Record retrieved: " + results.length);

      for (let i = 0; i < results.length; i++) {
        jobTasker.push(results[i].attributes.Tasker);
        jobDescription2.push(results[i].attributes.JobDescription);
        rate.push(results[i].attributes.Rate);
        payment.push(results[i].attributes.PaymentStatus);
        const row = {
          tasker: jobFrom[i],
          description: jobDescription2[i],
          status: "Active",
          rate: rate[i],
          payment: payment[i],
        };
        console.log(row);
      }

      for (let i = 0; i < jobTasker.length; i++) {
        //Calculate Flowrate wei/sec
        const hourlyAmount = ethers.utils.parseEther(rate[i].toString());
        const calculatedFlowRate = Math.floor(hourlyAmount / 3600);

        dataSource2.push({
          key: i + 1,
          tasker: jobTasker[i],
          description: jobDescription2[i],
          status: "Active",
          rate: rate[i],
          flowrate: calculatedFlowRate,
          payment: payment[i],
        });
      }

      for (let i = 0; i < jobFrom.length; i++) {
        dataSource.push({
          key: i + 1,
          from: jobFrom[i],
          description: jobDescription[i],
          status: "Active",
        });
      }

      setdataSource2(dataSource2);
    }
    findConfirmedTasker();
  }, [dataSource2]);

  async function sendTip(tasker) {
    //const account = await Moralis.account;
    const ethers = Moralis.web3Library; // get ethers.js library
    const web3Provider = await Moralis.enableWeb3(); // Get ethers.js web3Provider { privateKey: process.env.PRIVATE_KEY }
    const signer = web3Provider.getSigner();

    // Create a transaction object
    let tx = {
      to: tasker,
      // Convert currency unit from ether to wei
      value: ethers.utils.parseEther("0.005"), //form.getFieldValue(["Tip", "tip"])
    };
    // Send a transaction
    signer.sendTransaction(tx).then((txObj) => {
      console.log("txHash", txObj.hash);
    });

    //Send email to tasker
    const apiResponse = await EpnsAPI.payloads.sendNotification({
      signer,
      type: 3, // target
      identityType: 2, // direct payload
      notification: {
        title: `You received a tip`,
        body: `Congratulations, your job owner sent you a tip: ${form.getFieldValue(
          ["Tip", "tip"],
        )}`,
      },
      payload: {
        title: `You received a tip`,
        body: `Congratulations, your job owner sent you a tip: ${form.getFieldValue(
          ["Tip", "tip"],
        )}`,
        cta: "",
        img: "",
      },
      recipients: `eip155:42:${tasker}`, //"eip155:42:0x98A45694db06aefAE904421597b62F5AE3bF0De8", // recipient address
      channel: "eip155:42:0x861CadB50533f288313207a140A107E8AD9EE8c6", // your channel address
      env: "staging",
    });

    // apiResponse?.status === 204, if sent successfully!
    console.log("API repsonse: ", apiResponse);
  }

  //For Tasker
  const columns = [
    {
      title: "Key",
      dataIndex: "key",
      key: "key",
    },
    {
      title: "From",
      dataIndex: "from",
      key: "from",
    },
    {
      title: "Job Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            onClick={() => ContactClient(record.from, "Yes")}
          >
            Confirm
          </Button>
          <Button
            type="primary"
            onClick={() => ContactClient(record.from, "No")}
          >
            Decline
          </Button>
        </Space>
      ),
    },
  ];

  for (let i = 0; i < jobFrom.length; i++) {
    dataSource.push({
      key: i + 1,
      from: jobFrom[i],
      description: jobDescription[i],
      status: "Active",
    });
  }

  //For Client
  const columns2 = [
    {
      title: "Key",
      dataIndex: "key",
      key: "key",
    },
    {
      title: "Tasker",
      dataIndex: "tasker",
      key: "tasker",
    },
    {
      title: "Job Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "$Rate/Hr",
      dataIndex: "rate",
      key: "rate",
    },
    {
      title: "Flowrate wei/sec",
      dataIndex: "flowrate",
      key: "flowrate",
    },
    {
      title: "Payment Status",
      dataIndex: "payment",
      key: "payment",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Popover
            content={
              <Form
                name="Superfluid"
                form={form}
                onFinish={onFinish}
                autoComplete="off"
              >
                <Form.Item
                  label="OTP"
                  name={["OTP", "otp"]}
                  rules={[
                    {
                      required: true,
                      message: "Please enter OTP",
                    },
                  ]}
                >
                  <Input
                    style={{
                      width: "100%",
                    }}
                    placeholder="Enter OTP sent to tasker"
                  />
                </Form.Item>
                <div style={{ textAlign: "center" }}>
                  <Button
                    type="primary"
                    size="large"
                    style={{ width: "100%", marginTop: "25px" }}
                    onClick={() =>
                      createSuperfluidStream(record.tasker, record.flowrate)
                    }
                  >
                    Start Stream
                  </Button>
                </div>
              </Form>
            }
          >
            <Button type="primary" onClick={() => GenerateOTP(record.tasker)}>
              Start Service
            </Button>
          </Popover>

          <Popover
            content={
              <Form
                name="Superfluid"
                form={form}
                onFinish={onFinish}
                autoComplete="off"
              >
                <Form.Item
                  label="OTP"
                  name={["OTP2", "otp2"]}
                  rules={[
                    {
                      required: true,
                      message: "Please enter OTP",
                    },
                  ]}
                >
                  <Input
                    style={{
                      width: "100%",
                    }}
                    placeholder="Enter OTP sent to tasker"
                  />
                </Form.Item>
                <div style={{ textAlign: "center" }}>
                  <Button
                    type="primary"
                    size="large"
                    style={{ width: "100%", marginTop: "25px" }}
                    onClick={() =>
                      deleteSuperfluidStream(record.tasker, record.flowrate)
                    }
                  >
                    Stop Stream
                  </Button>
                </div>
              </Form>
            }
          >
            <Button type="primary" onClick={() => GenerateOTP(record.tasker)}>
              Stop Service
            </Button>
          </Popover>

          <Popover
            content={
              <Form
                name="Superfluid"
                form={form}
                onFinish={onFinish}
                autoComplete="off"
              >
                <Form.Item
                  label="Tip Amount in Matic"
                  name={["Tip", "tip"]}
                  rules={[
                    {
                      required: true,
                      message: "Please enter Tip amount",
                    },
                  ]}
                >
                  <InputNumber
                    style={{
                      width: "100%",
                    }}
                    prefix="♾️"
                    min={0.0001}
                  />
                </Form.Item>
                <div style={{ textAlign: "center" }}>
                  <Button
                    type="primary"
                    size="large"
                    style={{ width: "100%", marginTop: "25px" }}
                    onClick={() => sendTip(record.tasker)}
                  >
                    Send
                  </Button>
                </div>
              </Form>
            }
          >
            <Button type="primary">Add Tip</Button>
          </Popover>
        </Space>
      ),
    },
  ];

  for (let i = 0; i < jobTasker.length; i++) {
    //Calculate Flowrate wei/sec
    const hourlyAmount = ethers.utils.parseEther(rate[i].toString());
    const calculatedFlowRate = Math.floor(hourlyAmount / 3600);

    dataSource2.push({
      key: i + 1,
      tasker: jobTasker[i],
      description: jobDescription2[i],
      status: "Active",
      rate: rate[i],
      flowrate: calculatedFlowRate,
      payment: payment[i],
    });
  }

  const key = "updatable";
  const openMessage = () => {
    message.loading({
      content: "Sending Email to Client...",
      key,
      duration: 0,
    });
  };

  const openMessage2 = () => {
    message.loading({
      content: "Generating OTP...",
      key,
      duration: 0,
    });
  };

  const openMessage3 = () => {
    message.loading({
      content: "Creating Stream in fDAIx...",
      key,
      duration: 0,
    });
  };

  const openMessage4 = () => {
    message.loading({
      content: "Closing Stream...",
      key,
      duration: 0,
    });
  };

  const ContactClient = async (client, confirm) => {
    openMessage();
    let title;
    let _body;

    const account = await Moralis.account;
    const query = new Moralis.Query("TaskerJobs");
    query.equalTo("Client", client);
    query.equalTo("Tasker", account);
    const results = await query.find();
    console.log("Record retrieved: " + results.length);
    const object = results[0];

    if (confirm == "Yes") {
      title = "Confirmed: Message from tasker";
      _body =
        "Tasker has confirmed for your job and will be available at the date/time mentioned in the description. Thank You";

      object.set("Confirmed", true);

      //Also create entry in ConfirmedJobs
      //Save details
      const account = await Moralis.account;
      confirmedJobs.set("Tasker", account);
      confirmedJobs.set("Client", client);
      confirmedJobs.set("Status", "Active");
      confirmedJobs.set("JobDescription", object.get("JobDescription"));
      confirmedJobs.set("Confirmed", true);
      confirmedJobs.set("OTP", 0);
      confirmedJobs.set("Rate", object.get("Rate"));
      confirmedJobs.set("FinalPayment", 0);
      confirmedJobs.set("Tip", 0);
      confirmedJobs.set("PaymentStatus", "Not Started");
      confirmedJobs.save();
      object.save();
    } else {
      title = "Sorry, tasker not available";
      _body =
        "Tasker has declined for your job. You can search for new tasker and contact them. Thank You";

      //Update status in table for the job
      object.set("Status", "Inactive");
      object.set("Confirmed", false);
      object.save();
    }

    //Send Email
    try {
      const apiResponse = await EpnsAPI.payloads.sendNotification({
        signer,
        type: 3, // target
        identityType: 2, // direct payload
        notification: {
          title: `${title}`,
          body: `${_body}`,
        },
        payload: {
          title: `${title}`,
          body: `${_body}`,
          cta: "",
          img: "",
        },
        recipients: `eip155:42:${client}`, //"eip155:42:0x98A45694db06aefAE904421597b62F5AE3bF0De8", // recipient address
        channel: "eip155:42:0x861CadB50533f288313207a140A107E8AD9EE8c6", // your channel address
        env: "staging",
      });

      // apiResponse?.status === 204, if sent successfully!
      console.log("API repsonse: ", apiResponse);
      message.success({
        content: "Email Sent!",
        key,
        duration: 3,
      });
    } catch (err) {
      console.error("Error: ", err);
    }
  };

  const GenerateOTP = async (tasker) => {
    openMessage2();
    console.log(tasker);
    console.log(tasker);

    //Generate OTP
    const otpSend = Math.floor(Math.random() * 10 + 1);

    //Save OTP on table
    const account = await Moralis.account;
    const query = new Moralis.Query("ConfirmedJobs");
    query.equalTo("Client", account);
    query.equalTo("Status", "Active");
    const results = await query.find();
    const object = results[0];
    object.set("OTP", otpSend);
    object.save();

    //Send OTP Email
    try {
      const apiResponse = await EpnsAPI.payloads.sendNotification({
        signer,
        type: 3, // target
        identityType: 2, // direct payload
        notification: {
          title: `Your task OTP`,
          body: `OTP for your task service is: ${otpSend}`,
        },
        payload: {
          title: `Your task OTP`,
          body: `OTP for your task service is: ${otpSend}`,
          cta: "",
          img: "",
        },
        recipients: `eip155:42:${tasker}`, //"eip155:42:0x98A45694db06aefAE904421597b62F5AE3bF0De8", // recipient address
        channel: "eip155:42:0x861CadB50533f288313207a140A107E8AD9EE8c6", // your channel address
        env: "staging",
      });

      // apiResponse?.status === 204, if sent successfully!
      console.log("API repsonse: ", apiResponse);
      message.success({
        content: "OTP Sent to tasker!",
        key,
        duration: 3,
      });
    } catch (err) {
      console.error("Error: ", err);
    }
  };

  async function createSuperfluidStream(tasker, flowrate) {
    openMessage3();
    //Verify OTP
    const account = await Moralis.account;
    const query = new Moralis.Query("ConfirmedJobs");
    query.equalTo("Client", account);
    query.equalTo("Tasker", tasker);
    query.equalTo("Status", "Active");
    const results = await query.find();
    const object = results[0];
    const otp = object.get("OTP");
    console.log("Otp" + otp);

    //Check user's fDAIx balance to ensure they have minimum 50 fDAIx Super token balance else ask them to wrap from Superfluid Console
    const ethers = Moralis.web3Library;
    const web3Provider = await Moralis.enableWeb3();
    const fdaixAddress = "0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f";
    const fdaixContract = new ethers.Contract(
      fdaixAddress,
      abi_ERC20,
      web3Provider,
    );
    const balance = ethers.utils.formatEther(
      await fdaixContract.balanceOf(account),
    );
    console.log(balance);

    /* Wrap to fDAIx
    const web3Provider = await Moralis.enableWeb3();
    const signer = web3Provider.getSigner();

    const fDAI = new ethers.Contract(
    "0x15F0Ca26781C3852f8166eD2ebce5D18265cceb7", 
    abi_ERC20, 
    signer,
    ); 
 
    const transaction = await fDAI.approve("0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f", ethers.utils.parseUnits("100").toString())
    const receipt = await transaction.wait();
    console.log(receipt)
    */

    if ((otp == form.getFieldValue(["OTP", "otp"])) & (balance >= "50")) {
      //start stream
      const web3Provider = await Moralis.enableWeb3();

      const sf = await Framework.create({
        chainId: 80001, //Mumbai Testnet
        provider: web3Provider,
      });

      // create a signer
      const signer2 = sf.createSigner({ web3Provider: web3Provider });
      console.log(signer2);

      // Write operations

      const createFlowOperation = sf.cfaV1.createFlow({
        sender: "0x98A45694db06aefAE904421597b62F5AE3bF0De8",
        receiver: tasker, //"0xC29942DE1Aefb0a0DDEb5B2F1cA34E96BDB516B6",
        superToken: "0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f",
        flowRate: BigInt(flowrate), //"53583676268",
        userData: "0x",
      });

      console.log("Creating your stream...");

      const result = await createFlowOperation.exec(signer2);
      console.log(result);

      //send email to tasker
      try {
        const apiResponse = await EpnsAPI.payloads.sendNotification({
          signer,
          type: 3, // target
          identityType: 2, // direct payload
          notification: {
            title: `STARTED: Your payment using Superfluid stream`,
            body: `Your payment in DAIx token using Superfluid stream with flowrate: ${flowrate} started.`,
          },
          payload: {
            title: `STARTED: Your payment using Superfluid stream`,
            body: `Your payment in DAIx token using Superfluid stream with flowrate: ${flowrate} started.`,
            cta: "",
            img: "",
          },
          recipients: `eip155:42:${tasker}`, //"eip155:42:0x98A45694db06aefAE904421597b62F5AE3bF0De8", // recipient address
          channel: "eip155:42:0x861CadB50533f288313207a140A107E8AD9EE8c6", // your channel address
          env: "staging",
        });

        // apiResponse?.status === 204, if sent successfully!
        console.log("API repsonse: ", apiResponse);
        message.success({
          content: "Stream created!",
          key,
          duration: 3,
        });

        //Update Status
        object.set("PaymentStatus", "Streaming");
        object.save();
      } catch (err) {
        console.error("Error: ", err);
      }
    } else {
      message.error({
        content:
          "Insufficient amount of Super Token, please wrap your fDAI to fDAIx from Superfluid Console",
        key,
        duration: 3,
      });
    }
  }

  async function deleteSuperfluidStream(tasker, flowrate) {
    openMessage4();
    console.log("deleteSuperfluidStream");
    //Verify OTP
    const account = await Moralis.account;
    const query = new Moralis.Query("ConfirmedJobs");
    query.equalTo("Client", account);
    query.equalTo("Tasker", tasker);
    query.equalTo("Status", "Active");
    const results = await query.find();
    const object = results[0];
    const otp = object.get("OTP");
    if (otp == form.getFieldValue(["OTP2", "otp2"])) {
      //Stop Streaming
      ///const ethers = Moralis.web3Library; // get ethers.js library
      const web3Provider = await Moralis.enableWeb3();

      const sf = await Framework.create({
        chainId: 80001, //Mumbai Testnet
        provider: web3Provider,
      });

      // create a signer
      const signer2 = sf.createSigner({ web3Provider: web3Provider });
      console.log(signer2);

      //Delete operation
      const deleteFlowOperation = sf.cfaV1.deleteFlow({
        sender: "0x98A45694db06aefAE904421597b62F5AE3bF0De8",
        receiver: tasker, //"0xC29942DE1Aefb0a0DDEb5B2F1cA34E96BDB516B6",
        superToken: "0x5D8B4C2554aeB7e86F387B4d6c00Ac33499Ed01f",
        userData: "0x",
      });

      console.log("Deleting your stream...");

      const result = await deleteFlowOperation.exec(signer2);
      console.log(result);

      //send email to tasker
      try {
        const apiResponse = await EpnsAPI.payloads.sendNotification({
          signer,
          type: 3, // target
          identityType: 2, // direct payload
          notification: {
            title: `COMPLETED: Your payment using Superfluid stream`,
            body: `Your payment in DAIx token using Superfluid stream with flowrate: ${flowrate} completed.`,
          },
          payload: {
            title: `COMPLETED: Your payment using Superfluid stream`,
            body: `Your payment in DAIx token using Superfluid stream with flowrate: ${flowrate} completed.`,
            cta: "",
            img: "",
          },
          recipients: `eip155:42:${tasker}`, //"eip155:42:0x98A45694db06aefAE904421597b62F5AE3bF0De8", // recipient address
          channel: "eip155:42:0x861CadB50533f288313207a140A107E8AD9EE8c6", // your channel address
          env: "staging",
        });

        // apiResponse?.status === 204, if sent successfully!
        console.log("API repsonse: ", apiResponse);
        message.success({
          content: "Stream closed!",
          key,
          duration: 3,
        });

        //Update Status
        object.set("Status", "Inactive");
        object.set("PaymentStatus", "Completed");
        object.save();
      } catch (err) {
        console.error("Error: ", err);
      }
    }
  }

  return (
    <div style={{ display: "flex", gap: "10px" }}>
      <div>
        <Card
          hoverable
          style={{
            width: 1000,
          }}
          title={
            <>
              <div style={{ textAlign: "center" }}> </div>
              🔍 <Text strong>My Job Offers</Text>
            </>
          }
        >
          {/** 
          <Button type="primary" danger size="small" onClick={"findJobs"}>
            Refresh
          </Button>*/}
          <br />
          <br />
          <br />
          <Table
            dataSource={dataSource}
            columns={columns}
            size="small"
            bordered="true"
          />
        </Card>
      </div>

      <div>
        <Card
          hoverable
          style={{
            width: 1500,
          }}
          title={
            <>
              <div style={{ textAlign: "center" }}> </div>
              🔍 <Text strong>My Taskers</Text>
            </>
          }
        >
          {/** 
          <Button
            type="primary"
            danger
            size="small"
            onClick={"findConfirmedTasker"}
          >
            Refresh
          </Button>*/}
          <br />
          <br />
          <br />
          <Table
            dataSource={dataSource2}
            columns={columns2}
            size="small"
            bordered="true"
          />
        </Card>
      </div>
    </div>
  );
}
