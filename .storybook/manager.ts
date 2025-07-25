import React from "react";
import { addons } from "@storybook/manager-api";
import { create } from "@storybook/theming";

addons.setConfig({
  theme: create({
    base: "light",
    brandTitle: "Storybook ACR Addon",
    brandUrl: "#",
    brandTarget: "_self",
  }),
});
