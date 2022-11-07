import {
  Card,
  Image,
  Form,
  Select,
  Typography,
  Input,
  Button,
  message,
  InputNumber,
} from "antd";
//import { Card, Typography, Image, Button, Popover, Form, InputNumber, Input, message, Table, Space, Radio } from "antd";
import React, { useState } from "react";
import { Moralis } from "moralis";
import * as EpnsAPI from "@epnsproject/sdk-restapi";
import * as ethers from "ethers";
import taskComrade from "./TaskComrade.json";
///import { ConstantFlowAgreementV1 } from "@superfluid-finance/sdk-core";
import Record from "./privateKey.json";

const { Text } = Typography;
const { TextArea } = Input;

var PK;
{
  Record.map((record) => {
    PK = record.epnsPrivateKey; // channel private key
  });
}
const Pkey = `0x${PK}`;
const signer = new ethers.Wallet(Pkey);

const TaskerProfiles = Moralis.Object.extend("TaskerProfiles");
const taskerProfiles = new TaskerProfiles();
//const abi =
//  '[{"inputs":[{"internalType":"address","name":"_owner","type":"address"}],"stateMutability":"payable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"Tasker","type":"address"}],"name":"ProfileCreated","type":"event"},{"inputs":[],"name":"register","outputs":[{"internalType":"uint256","name":"_registrationId","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"when","type":"uint256"}],"name":"Withdrawal","type":"event"},{"inputs":[],"name":"registrationId","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"taskerRegistered","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"}]';

const styles = {
  title: {
    fontSize: "20px",
    fontWeight: "700",
  },
  text: {
    fontSize: "16px",
  },
  card: {
    width: 800,
    boxShadow: "0 0.5rem 1.2rem rgb(189 197 209 / 20%)",
    border: "1px solid #e7eaf3",
    borderRadius: "0.5rem",
  },
  timeline: {
    marginBottom: "-45px",
  },
};

const areas = [
  {
    label: "Alabama",
    value: "Alabama",
  },
  {
    label: "Alaska",
    value: "Alaska",
  },
  {
    label: "Arizona",
    value: "Arizona",
  },
  {
    label: "Illinois",
    value: "Illinois",
  },
  {
    label: "New Hampshire",
    value: "NewHampshire",
  },
  {
    label: "Jersey City",
    value: "JerseyCity",
  },
  {
    label: "New York City",
    value: "NewYork",
  },
  {
    label: "Pennsylvania",
    value: "Pennsylvania",
  },
  {
    label: "Wisconsin",
    value: "Wisconsin",
  },
  {
    label: "Wyoming",
    value: "Wyoming",
  },
];

const category = [
  {
    value: "Furniture Assembly",
  },
  {
    value: "Home Repairs",
  },
  {
    value: "Help Moving",
  },
  {
    value: "Cleaning",
  },
  {
    value: "Yard Work Services",
  },
  {
    value: "Chauffeur",
  },
  {
    value: "Mounting",
  },
  {
    value: "Handyman Servcies",
  },
  {
    value: "Light Installation",
  },
  {
    value: "IKEA Furniture Assembly",
  },
  {
    value: "Painter",
  },
  {
    value: "Smart Contract Developer",
  },
];

export default function Tasker() {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log("Received values of form:", values);
  };

  const [values, setValues] = useState({ message: "" });
  const [values1, setValues1] = useState({ message1: "" });

  const key = "updatable";
  const openMessage = () => {
    message.loading({
      content: "Creating Profile...",
      key,
      duration: 0,
    });
  };

  const optIn = async (tasker, signer2) => {
    try {
      const apiResponse = await EpnsAPI.channels.subscribe({
        signer: signer2,
        channelAddress:
          "eip155:80001:0x861CadB50533f288313207a140A107E8AD9EE8c6", // channel address in CAIP
        userAddress: `eip155:80001:${tasker}`, // user address in CAIP
        onSuccess: () => {
          console.log("opt in success");
        },
        onError: () => {
          console.error("opt in error");
        },
        env: "staging",
      });
      // apiResponse?.status === 204, if sent successfully!
      console.log("OptIn API repsonse: ", apiResponse);

      //Notificatio to creator that profile created
      sendNotification(
        "Profile Created",
        "Hello! Welcome to TaskComrade. Your profile has been created. Now you can earn money your way. Thank you",
        tasker,
      );
    } catch (err) {
      console.error("Error: ", err);
    }
  };

  const sendNotification = async (title, body, tasker) => {
    try {
      const apiResponse = await EpnsAPI.payloads.sendNotification({
        signer,
        type: 3, // target
        identityType: 2, // direct payload
        notification: {
          title: `${title}`,
          body: `${body}`,
        },
        payload: {
          title: `${title}`,
          body: `${body}`,
          cta: "",
          img: "",
        },
        recipients: `eip155:42:${tasker}`, //"eip155:42:0x98A45694db06aefAE904421597b62F5AE3bF0De8", // recipient address
        channel: "eip155:42:0x861CadB50533f288313207a140A107E8AD9EE8c6", // your channel address
        env: "staging",
      });

      // apiResponse?.status === 204, if sent successfully!
      console.log("API repsonse: ", apiResponse);
    } catch (err) {
      console.error("Error: ", err);
    }
  };

  async function createProfile() {
    openMessage();
    //Data save to table
    const account = await Moralis.account;

    taskerProfiles.set("Address", account);
    taskerProfiles.set("Area", form.getFieldValue(["tasker", "area"]));
    taskerProfiles.set(
      "Categories",
      form.getFieldValue(["tasker", "category"]),
    );
    taskerProfiles.set(
      "FirstName",
      form.getFieldValue(["tasker", "firstname"]),
    );
    taskerProfiles.set("LastName", form.getFieldValue(["tasker", "lastname"]));
    taskerProfiles.set(
      "Description",
      form.getFieldValue(["tasker", "description"]),
    );
    taskerProfiles.set("Rate", form.getFieldValue(["tasker", "hourlyRate"]));
    taskerProfiles.set("Rating", 0);

    //Upload photo to IPFS
    const fileInput = document.getElementById("file");
    const data = fileInput.files[0];
    console.log(data);
    const file = new Moralis.File(data.name, data);
    await file.saveIPFS();
    console.log(file.ipfs(), file.hash());
    taskerProfiles.set("PhotoURL", file.ipfs());
    setValues({
      ...values,
      message: `Your Photo is uploaded at : ${file.ipfs()}`,
    });

    //Upload supporting document to IPFS
    const fileInput1 = document.getElementById("file1");
    const data1 = fileInput1.files[0];
    console.log(data1);
    const file1 = new Moralis.File(data1.name, data1);
    await file1.saveIPFS();
    console.log(file1.ipfs(), file1.hash());
    taskerProfiles.set("DocumentURL", file1.ipfs());
    setValues1({
      ...values1,
      message1: `Your Document is uploaded at : ${file1.ipfs()}`,
    });

    taskerProfiles.save();

    //smart contract call and pay amount

    const ethers = Moralis.web3Library; // get ethers.js library
    const web3Provider = await Moralis.enableWeb3(); // Get ethers.js web3Provider { privateKey: process.env.PRIVATE_KEY }
    const signer2 = web3Provider.getSigner();
    console.log("here");

    const contract = new ethers.Contract(
      "0xeF36aF570B566C05a52759C8628df288F997f62C",
      taskComrade.abi,
      signer2,
    );
    try {
      const transaction = await contract.register({
        value: ethers.utils.parseEther(".0001"),
      });
      console.log(transaction.hash);
      await transaction.wait().then(() => {
        message.success({
          content: "Congratulations Profile Created!",
          key,
          duration: 3,
        });
        form.resetFields();
        setValues({
          ...values,
          message: ``,
        });
      });

      //opt-in to channel
      optIn(account, signer2);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <div style={{ display: "flex", gap: "10px" }}>
      <Card
        style={styles.card}
        title={
          <>
            <div style={{ textAlign: "center" }}>
              {" "}
              <Image
                alt="TaskComrade Logo"
                width={150}
                height={150}
                src="logo.png"
              >
                {" "}
              </Image>{" "}
            </div>
            📝 <Text strong>Earn money your way</Text>
          </>
        }
      >
        <Form
          name="tasker_form"
          form={form}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name={["tasker", "area"]}
            label="Select your area"
            rules={[
              {
                required: true,
                message: "Missing area",
              },
            ]}
          >
            <Select
              style={{
                width: 200,
              }}
              options={areas}
            />
          </Form.Item>
          <Form.Item
            name={["tasker", "category"]}
            label="Select your category / categories"
            rules={[
              {
                required: true,
                message: "Please input your category!",
              },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Please select all that applies"
              showArrow
              style={{
                width: "100%",
              }}
              options={category}
            />
          </Form.Item>
          <Form.Item
            label="First Name"
            name={["tasker", "firstname"]}
            rules={[
              {
                required: true,
                message: "Please input your first name!",
              },
            ]}
          >
            <Input
              style={{
                width: 300,
                marginLeft: 15,
              }}
            />
          </Form.Item>
          <Form.Item
            label="Last Name"
            name={["tasker", "lastname"]}
            rules={[
              {
                required: true,
                message: "Please input your last name!",
              },
            ]}
          >
            <Input
              style={{
                width: 300,
                marginLeft: 15,
              }}
            />
          </Form.Item>
          <Form.Item
            label="Short Description"
            name={["tasker", "description"]}
            rules={[
              {
                required: true,
                message: "Please input your description!",
              },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="Tell us about you, equipments you have or any other useful details"
            />
          </Form.Item>
          <Form.Item
            name={["tasker", "hourlyRate"]}
            label="Enter your hourly rate for the task"
            rules={[
              {
                required: true,
                type: "number",
                min: 1,
              },
            ]}
          >
            <InputNumber
              style={{
                width: 80,
                marginLeft: 15,
              }}
              min={1}
              prefix="$"
            />
          </Form.Item>
        </Form>
        <Text>Upload Photo</Text>
        <br />
        <input type="file" name="file" id="file" /> <br />
        {values.message}
        {/*
        <Button
          type="dashed"
          size="small"
          style={{ width: "100%", marginTop: "25px" }}
          onClick={uploadIPFS}
        >
          Upload Your Photo to IPFS
        </Button>
            */}
        <br />
        <Text>
          Upload Supporting Document (license, goverment issued ID, Resume)
        </Text>
        <br />
        <input type="file" name="file" id="file1" /> <br />
        {values1.message1}
        <br />
        <br />
        <Text strong>
          🔔 We don't need your email or phone number as all communication will
          happen via EPNS. You will be prompted to 'Opt-in' the TaskComrade
          channel to receive notifications.
        </Text>
        <br />
        <br />
        <Button type="primary" onClick={createProfile}>
          Create Profile
        </Button>
        {/*
        <Button type="primary" onClick={createSuperfluidStream}>
          Create Superfluid Stream
        </Button>
        <Button type="primary" onClick={deleteSuperfluidStream}>
          Delete Superfluid Stream
        </Button>
          */}
      </Card>
    </div>
  );
}
