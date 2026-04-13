import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { Modal } from "./modal";
import { Button } from "./button";

const meta = {
  title: "UI/Modal",
  component: Modal,
  args: {
    onClose: fn(),
  },
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    open: true,
    title: "주문 확인",
    children: (
      <div className="space-y-4">
        <p className="text-warm-brown">주문을 진행하시겠습니까?</p>
        <div className="flex justify-end gap-2">
          <Button variant="secondary">취소</Button>
          <Button variant="primary">확인</Button>
        </div>
      </div>
    ),
  },
};

export const WithoutTitle: Story = {
  args: {
    open: true,
    children: (
      <p className="text-warm-brown">타이틀 없는 모달입니다.</p>
    ),
  },
};
