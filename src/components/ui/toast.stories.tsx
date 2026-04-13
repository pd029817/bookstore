import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ToastProvider, useToast } from "./toast";
import { Button } from "./button";

function ToastDemo({ message, type }: { message: string; type: "success" | "error" | "info" }) {
  const { addToast } = useToast();
  return <Button onClick={() => addToast(message, type)}>토스트 보기</Button>;
}

const meta = {
  title: "UI/Toast",
  decorators: [
    (Story) => (
      <ToastProvider>
        <Story />
      </ToastProvider>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = {
  render: () => <ToastDemo message="주문이 완료되었습니다!" type="success" />,
};

export const Error: Story = {
  render: () => <ToastDemo message="결제에 실패했습니다." type="error" />,
};

export const Info: Story = {
  render: () => <ToastDemo message="장바구니에 추가되었습니다." type="info" />,
};
