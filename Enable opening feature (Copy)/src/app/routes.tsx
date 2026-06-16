import { createBrowserRouter } from "react-router";
import Root from "./pages/Root";
import People from "./pages/People";
import Map from "./pages/Map";
import Me from "./pages/Me";
import Notifications from "./pages/Notifications";
import PrivacySecurity from "./pages/PrivacySecurity";
import DeviceSettings from "./pages/DeviceSettings";
import TrackingDetection from "./pages/TrackingDetection";
import Auth from "./pages/Auth";
import AppIcon from "./pages/AppIcon";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: People },
      { path: "auth", Component: Auth },
      { path: "map", Component: Map },
      { path: "me", Component: Me },
      { path: "notifications", Component: Notifications },
      { path: "privacy-security", Component: PrivacySecurity },
      { path: "device-settings", Component: DeviceSettings },
      { path: "tracking-detection", Component: TrackingDetection },
      { path: "app-icon", Component: AppIcon },
    ],
  },
]);