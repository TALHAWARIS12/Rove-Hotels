import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Knowledge Base Parser & File Integrity", () => {
  it("should read and verify Rove_Downtown_Hotel_Knowledge_Base.md exists", () => {
    const kbPath = path.join(process.cwd(), "Rove_Downtown_Hotel_Knowledge_Base.md");
    expect(fs.existsSync(kbPath)).toBe(true);

    const content = fs.readFileSync(kbPath, "utf-8");
    expect(content).toContain("# Rove Downtown Dubai — Hotel Knowledge Base");
    expect(content).toContain("## 20. Structured Knowledge Base");
  });

  it("should verify core hotel entities are present in markdown tables", () => {
    const kbPath = path.join(process.cwd(), "Rove_Downtown_Hotel_Knowledge_Base.md");
    const content = fs.readFileSync(kbPath, "utf-8");

    expect(content).toContain("Rover Room");
    expect(content).toContain("Gamer Cave");
    expect(content).toContain("TGI Fridays");
    expect(content).toContain("Burj Khalifa");
    expect(content).toContain("Green Key");
  });
});
