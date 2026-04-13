import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Skeleton } from "./skeleton";

const meta = {
  title: "UI/Skeleton",
  component: Skeleton,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Text: Story = {
  args: { className: "h-4 w-48" },
};

export const Title: Story = {
  args: { className: "h-6 w-64" },
};

export const Avatar: Story = {
  args: { className: "h-12 w-12 rounded-full" },
};

export const Card: Story = {
  args: { className: "h-48 w-72" },
};

export const BookCardComposition: Story = {
  render: () => (
    <div className="w-48 space-y-3">
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-1/3" />
    </div>
  ),
};
