import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";
import { Card, Col, Row, Statistic, Typography, Image, Button } from "antd";
import React from "react";
import { Moralis } from "moralis";
import treasuryContract from "./Treasury.json";

const { Text } = Typography;
//const ABI = "[{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"ProposalID\",\"type\":\"uint256\"},{\"indexed\":false,\"internalType\":\"address\",\"name\":\"To\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"Amount\",\"type\":\"uint256\"}],\"name\":\"FundsReleased\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"previousOwner\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"newOwner\",\"type\":\"address\"}],\"name\":\"OwnershipTransferred\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":false,\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"name\":\"Received\",\"type\":\"event\"},{\"inputs\":[],\"name\":\"contractBalance\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"_proposalId\",\"type\":\"uint256\"}],\"name\":\"getIdInfo\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"_name\",\"type\":\"string\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"name\":\"idName\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"\",\"type\":\"string\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"name\":\"idPayment\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"name\":\"institutionAmount\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"_proposalId\",\"type\":\"uint256\"}],\"name\":\"isValidProposalId\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"owner\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"name\":\"proposalId\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"_proposalId\",\"type\":\"uint256\"},{\"internalType\":\"address payable\",\"name\":\"_to\",\"type\":\"address\"},{\"internalType\":\"string\",\"name\":\"_name\",\"type\":\"string\"},{\"internalType\":\"uint256\",\"name\":\"_amount\",\"type\":\"uint256\"}],\"name\":\"releaseFunds\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"renounceOwnership\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"newOwner\",\"type\":\"address\"}],\"name\":\"transferOwnership\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"stateMutability\":\"payable\",\"type\":\"receive\"}]";
let totalDonation, balance, donated;

export default function Statistics() {
  const refreshData = async () => {
    console.log("Load");
    const ethers = Moralis.web3Library; // get ethers.js library
    const web3Provider = await Moralis.enableWeb3(); // Get ethers.js web3Provider { privateKey: process.env.PRIVATE_KEY }
    const signer = web3Provider.getSigner();

    const contract = new ethers.Contract(
      "0x541607EF0081c5A932aE020ABE5da119B9427272",
      treasuryContract.abi,
      signer,
    );
    totalDonation = ethers.utils.formatEther(await contract.totalDonationAmt()); //totalDonationAmt();
    console.log("totalDonation" + totalDonation);
    donated = ethers.utils.formatEther(await contract.releasedAmt()); //releasedAmt()
    console.log("donated" + donated);
    balance = ethers.utils.formatEther(await contract.contractBalance());
    console.log("balance" + balance);
  };
  refreshData();
  console.log("Outside otalDonation" + totalDonation);

  return (
    <Card
      title={
        <>
          <div style={{ textAlign: "center" }}>
            {" "}
            <Image alt="PolyCare Logo" width={150} height={150} src="logo.png">
              {" "}
            </Image>{" "}
          </div>
          📝 <Text strong>Latest Stats</Text>
        </>
      }
    >
      <div className="card">
        <Row gutter={16}>
          <Col span={12}>
            <Card>
              <Statistic
                title="Total Donations Received"
                value={totalDonation}
                valueStyle={{
                  color: "#3f8600",
                }}
                prefix={<ArrowUpOutlined />}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card>
              <Statistic
                title="Released Funds"
                value={donated}
                valueStyle={{
                  color: "#cf1322",
                }}
                prefix={<ArrowDownOutlined />}
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card>
              <Statistic
                title="Remaining Balance"
                value={balance}
                valueStyle={{
                  color: "#3f8600",
                }}
                prefix={<ArrowUpOutlined />}
              />
            </Card>
          </Col>
        </Row>
        <div style={{ textAlign: "center" }}>
          <Button
            type="primary"
            size="large"
            style={{ width: "25%", marginTop: "25px" }}
            onClick={refreshData}
          >
            Refresh
          </Button>
        </div>
      </div>
    </Card>
  );
}
