import { Card } from "antd";
import React from "react";

//const { Text } = Typography;

export default function SuperfluidConsole() {
  return (
    <div style={{ display: "flex", gap: "10px" }}>
      <Card style={{ width: 1500, height: 1500 }}>
        <iframe
          width="1450"
          height="1450"
          src="https://app.superfluid.finance/"
          title="Superfluid Console"
        ></iframe>
      </Card>
    </div>
  );
}
