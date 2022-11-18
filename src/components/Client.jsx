import {
  Card,
  Typography,
  Image,
  Form,
  Select,
  Avatar,
  Button,
  Input,
  message,
  Rate,
  Divider,
} from "antd";
import React, { useState } from "react";
import { MailOutlined } from "@ant-design/icons";
//import { Row, Col, Container } from "react-bootstrap";
import Marquee from "react-fast-marquee";
import { Moralis } from "moralis";
import * as EpnsAPI from "@epnsproject/sdk-restapi";
import * as ethers from "ethers";
import Record from "./privateKey.json";

const { Meta } = Card;
const { Text } = Typography;
const { TextArea } = Input;

const TaskerJobs = Moralis.Object.extend("TaskerJobs");
const taskerJobs = new TaskerJobs();

var PK;
{
  Record.map((record) => {
    PK = record.epnsPrivateKey; // channel private key
  });
}
const Pkey = `0x${PK}`;
const signer = new ethers.Wallet(Pkey);

const styles = {
  title: {
    fontSize: "20px",
    fontWeight: "700",
  },
  text: {
    fontSize: "16px",
  },
  card: {
    width: 1500,

    boxShadow: "0 0.5rem 1.2rem rgb(189 197 209 / 20%)",
    border: "1px solid #e7eaf3",
    borderRadius: "3rem",
    bordered: true,
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

export default function Client() {
  //const { Moralis } = useMoralis();
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log("Received values of form:", values);
  };

  const key = "updatable";
  const openMessage = () => {
    message.loading({
      content: "Sending Email...",
      key,
      duration: 0,
    });
  };

  const [taskerProfile, setPlayerData] = useState([]);
  const taskerData = [];

  //useEffect(() => {
  const fetchData = async () => {
    const query = new Moralis.Query("TaskerProfiles");
    query.equalTo("Area", form.getFieldValue(["client", "area"]));
    const results = await query.find();
    console.log("Record retrieved: " + results.length);
    for (let i = 0; i < results.length; i++) {
      const object = results[i];
      const data = {
        title:
          object.get("FirstName") +
          " " +
          object.get("LastName") +
          "  $" +
          object.get("Rate") +
          " per hour",
        image: object.get("PhotoURL"),
        rating: "⭐Rating: " + object.get("Rating") + "/5",
        category: "Category: " + object.get("Categories").join(", "),
        description: object.get("Description"),
        supportingDoc: object.get("DocumentURL"),
        /*
        category:
          "Rating: " +
          object.get("Rating") +
          "/5 Category: " +
          object.get("Categories").join(", ") +
          "  -    " +
          object.get("Description"),
        */
        avatar: <Avatar src="https://joeschmoe.io/api/v1/random" />,
        address: object.get("Address"),
        rate: object.get("Rate"),
      };
      taskerData.push(data);
      //const response = await fetch('https://nba-players.herokuapp.com/players-stats')
      //const nbaData = await response.json()
    }
    console.log(taskerData);
    setPlayerData(taskerData);
  };

  const setRating = async (tasker, value) => {
    const query = new Moralis.Query("TaskerProfiles");
    query.equalTo("Address", tasker);
    const results = await query.find();
    const object = results[0];
    object.set("Rating", value);
    object.save();

    //Send Email
    try {
      const apiResponse = await EpnsAPI.payloads.sendNotification({
        signer,
        type: 3, // target
        identityType: 2, // direct payload
        notification: {
          title: `You received rating`,
          body: `You received rating`,
        },
        payload: {
          title: `You received rating`,
          body: `You received rating`,
          cta: "",
          img: "",
        },
        recipients: `eip155:80001:${tasker}`, //"eip155:42:0x98A45694db06aefAE904421597b62F5AE3bF0De8", // recipient address
        channel: "eip155:80001:0xf8b638379a718fAEd50e91DFC03bE429006c69A2", // your channel address
        env: "staging",
      });

      // apiResponse?.status === 204, if sent successfully!
      console.log("API repsonse: ", apiResponse);
      message.success({
        content: "Thank you for rating!",
        key,
        duration: 3,
      });
    } catch (err) {
      console.error("Error: ", err);
    }
  };

  const sendNotification = async (title, body, tasker, details, rate) => {
    //Opt-in Client to channel

    openMessage();
    //Set email body
    console.log("checking if called" + tasker);
    const _body = body + "\n " + details;

    //Save details
    const account = await Moralis.account;
    taskerJobs.set("Tasker", tasker);
    taskerJobs.set("Client", account);
    taskerJobs.set("Status", "Active");
    taskerJobs.set("JobDescription", details);
    taskerJobs.set("Rate", rate);
    taskerJobs.save();

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
        recipients: `eip155:80001:${tasker}`, //"eip155:42:0x98A45694db06aefAE904421597b62F5AE3bF0De8", // recipient address
        channel: "eip155:80001:0xf8b638379a718fAEd50e91DFC03bE429006c69A2", // your channel address
        env: "staging",
      });

      // apiResponse?.status === 204, if sent successfully!
      console.log("API repsonse: ", apiResponse);
      message.success({
        content: "Email Sent!",
        key,
        duration: 3,
      });
      form.resetFields();
    } catch (err) {
      console.error("Error: ", err);
    }
  };

  return (
    <div style={{ display: "flex", gap: "10px" }}>
      <Card
        bordered
        style={styles.card}
        title={
          <>
            <div style={{ textAlign: "center" }}>
              {" "}
              <Image
                alt="EasyHire Logo"
                width={150}
                height={150}
                src="logo.png"
              >
                {" "}
              </Image>{" "}
            </div>
            🔍 <Text strong>Find taskers in your Area</Text>
          </>
        }
      >
        <Form
          name="client_form"
          form={form}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name={["client", "area"]}
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
              onSelect={fetchData}
            />
          </Form.Item>
          <Form.Item
            name={["client", "details"]}
            label="Enter details"
            rules={[
              {
                required: true,
                message: "Missing details",
              },
            ]}
          >
            <TextArea
              rows={3}
              placeholder="Enter place, address, date/time for task or any other details"
            />
          </Form.Item>
          <br />
          <Text strong>
            🔔 You will be prompted to 'Opt-in' the EasyHire channel to receive
            notifications.
          </Text>
          <br />
          <br />
        </Form>
        <div style={{ display: "flex", gap: "10px" }}>
          <Marquee pauseOnHover direction="right" speed="60">
            {taskerProfile.map((tasker, k) => (
              <div key={k} style={{ display: "flex", gap: "20px" }}>
                <Card
                  hoverable
                  style={{ width: 300 }}
                  cover={
                    <img
                      width="250"
                      height="250"
                      alt="Tasker"
                      src={tasker.image} //"https://ipfs.moralis.io:2053/ipfs/QmXEuejQBPg9C92THcHXx1oGFhqqFS5YqyZ45NMjh8REDG"
                    />
                  }
                  actions={[
                    <Button
                      type="primary"
                      icon={<MailOutlined />}
                      onClick={() =>
                        sendNotification(
                          "You have new job offer!",
                          "Here are the details from the client: ",
                          tasker.address,
                          form.getFieldValue(["client", "details"]),
                          tasker.rate,
                        )
                      }
                      size="small"
                    >
                      {" "}
                      Email Tasker
                    </Button>,
                    <Rate
                      onChange={(value) => setRating(tasker.address, value)}
                    />,
                  ]}
                >
                  <Text strong>
                    <Meta
                      // avatar={tasker.avatar}
                      title={tasker.title}
                      //description={tasker.category}
                    />
                  </Text>
                  <p>{tasker.rating}</p>
                  <p>
                    <b>{tasker.category}</b>
                  </p>
                  <p>
                    <i>{tasker.description}</i>
                  </p>
                  <Text style={{ flex: 1, flexWrap: "wrap" }}>
                    <a>{tasker.supportingDoc}</a>
                  </Text>
                </Card>
                <Divider type="vertical" />
              </div>
            ))}
          </Marquee>
        </div>
      </Card>
    </div>
  );
}
