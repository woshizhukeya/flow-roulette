import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import Timer from "./Timer";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement);

async function init() {
  let windowLabel = "main"; // 默认显示主界面

  try {
    const { getCurrentWebviewWindow } = await import("@tauri-apps/api/webviewWindow");
    const win = getCurrentWebviewWindow();
    windowLabel = win.label;
  } catch (err) {
    console.warn("非 Tauri 环境，使用默认 main 窗口:", err);
  }

  root.render(
    <React.StrictMode>
      {windowLabel === "main" ? <App /> : <Timer />}
    </React.StrictMode>
  );
}

init();