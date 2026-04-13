import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Input } from "./input";

const meta = {
  title: "UI/Input",
  component: Input,
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "검색어를 입력하세요",
  },
};

export const WithLabel: Story = {
  args: {
    id: "email",
    label: "이메일",
    type: "email",
    placeholder: "example@email.com",
  },
};

export const WithError: Story = {
  args: {
    id: "email",
    label: "이메일",
    type: "email",
    value: "invalid",
    error: "올바른 이메일 형식이 아닙니다",
  },
};

export const Password: Story = {
  args: {
    id: "password",
    label: "비밀번호",
    type: "password",
    placeholder: "8자 이상 입력하세요",
  },
};
