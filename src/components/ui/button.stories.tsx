import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { Button } from "./button";

const meta = {
  title: "UI/Button",
  component: Button,
  args: {
    children: "버튼",
    onClick: fn(),
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "ghost", "danger"],
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { variant: "primary", children: "주문하기" },
};

export const Secondary: Story = {
  args: { variant: "secondary", children: "취소" },
};

export const Ghost: Story = {
  args: { variant: "ghost", children: "더 보기" },
};

export const Danger: Story = {
  args: { variant: "danger", children: "삭제" },
};

export const Small: Story = {
  args: { size: "sm", children: "Small" },
};

export const Large: Story = {
  args: { size: "lg", children: "Large" },
};

export const Loading: Story = {
  args: { loading: true, children: "처리 중..." },
};

export const Disabled: Story = {
  args: { disabled: true, children: "비활성화" },
};
