import { useLocation } from "react-router";
import { Menu } from "antd";
import { NavLink } from "react-router-dom";

function MenuItems() {
  const { pathname } = useLocation();

  return (
    <Menu
      //theme="light"
      mode="inline"
      style={{
        display: "flex",
        fontSize: "17px",
        fontWeight: "500",
        width: "100%",
        justifyContent: "center",
        background: "#bcc9ec",
      }}
      defaultSelectedKeys={[pathname]}
    >
      <Menu.Item key="/about">
        <NavLink to="/about">🛠 About EasyHire</NavLink>
      </Menu.Item>
      <Menu.Item key="/tasker">
        <NavLink to="/Tasker">👩‍🔧 Become a Tasker</NavLink>
      </Menu.Item>
      <Menu.Item key="/client">
        <NavLink to="/client">🔍 Find a Tasker</NavLink>
      </Menu.Item>
      <Menu.Item key="/dashboard">
        <NavLink to="/dashboard">🔲 My Dashboard</NavLink>
      </Menu.Item>
      <Menu.Item key="/support">
        <NavLink to="/support">✉ Push Inbox</NavLink>
      </Menu.Item>
      <Menu.Item key="/superfluidConsole">
        <NavLink to="/superfluidConsole">💻 Superfluid Console</NavLink>
      </Menu.Item>
    </Menu>
  );
}

export default MenuItems;
