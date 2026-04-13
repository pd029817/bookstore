import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { StarRating } from "./star-rating";

const meta = {
  title: "UI/StarRating",
  component: StarRating,
  argTypes: {
    rating: { control: { type: "range", min: 0, max: 5, step: 1 } },
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
} satisfies Meta<typeof StarRating>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { rating: 4 },
};

export const Empty: Story = {
  args: { rating: 0 },
};

export const Full: Story = {
  args: { rating: 5 },
};

export const Small: Story = {
  args: { rating: 3, size: "sm" },
};

export const Large: Story = {
  args: { rating: 4, size: "lg" },
};

export const Interactive: Story = {
  args: {
    rating: 3,
    interactive: true,
    onChange: fn(),
  },
};
