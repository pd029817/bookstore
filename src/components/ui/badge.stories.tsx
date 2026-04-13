import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Badge } from "./badge";

const meta = {
  title: "UI/Badge",
  component: Badge,
  argTypes: {
    variant: {
      control: "select",
      options: ["olive", "terracotta", "sand", "warm-brown"],
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Olive: Story = {
  args: { variant: "olive", children: "판매중" },
};

export const Terracotta: Story = {
  args: { variant: "terracotta", children: "베스트셀러" },
};

export const Sand: Story = {
  args: { variant: "sand", children: "소설" },
};

export const WarmBrown: Story = {
  args: { variant: "warm-brown", children: "에세이" },
};
