import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Input } from "./input";

describe("Input", () => {
  it("renders label and associates it with the input", () => {
    render(<Input label="Email" name="email" />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("associates label when neither id nor name is provided", () => {
    render(<Input label="Search" />);
    expect(screen.getByLabelText("Search")).toBeInTheDocument();
  });

  it("shows validation error", () => {
    render(<Input label="Email" name="email" error="Required" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Required");
  });
});
