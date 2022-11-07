//import { Card } from "antd";
import { NotificationItem } from "@epnsproject/sdk-uiweb";
import React, { useState, useEffect } from "react";
import * as EpnsAPI from "@epnsproject/sdk-restapi";
import { Moralis } from "moralis";

//const { Text } = Typography;

export default function Support() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const account = await Moralis.account;
      const notifications = await EpnsAPI.user.getFeeds({
        user: `eip155:80001:${account}`, // user address in CAIP
        env: "staging",
      });
      console.log(notifications);
      setNotifications(notifications);
    }
    fetchData();
  }, [notifications]);

  return (
    /*
    <div style={{ display: "flex", gap: "10px" }}>
      <Card style={{width: 1500, height:1500}}>
      <iframe width="1300" height="750" src="https://app.superfluid.finance/" title="Superfluid Console">
      </iframe>
      </Card>
    </div>
  )}*/

    <div>
      {notifications.map((oneNotification, i) => {
        const {
          cta,
          title,
          message,
          app,
          icon,
          image,
          url,
          blockchain,
          notification,
        } = oneNotification;

        return (
          <NotificationItem
            key={i} // any unique id
            notificationTitle={title}
            notificationBody={message}
            cta={cta}
            app={app}
            icon={icon}
            image={image}
            url={url}
            notification={notification}
            chainName={blockchain}
            // chainName={blockchain as chainNameType} // if using Typescript
          />
        );
      })}
    </div>
  );
}
